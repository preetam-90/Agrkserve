/**
 * useChatMedia — Custom hook for managing media file uploads in AI chat.
 *
 * Features:
 *   - File validation (type + size) before upload
 *   - Client-side text extraction for TXT and CSV files (for RAG context)
 *   - Uploads to /api/chat/media/upload (Cloudinary backend)
 *   - Upload progress tracking per file
 *   - Retry failed uploads
 *   - Clean deletion via /api/chat/media/delete
 *   - navigator.sendBeacon-compatible delete payload for page-unload cleanup
 *
 * Usage:
 *   const { uploads, isUploading, selectFiles, removeUpload, clearUploads,
 *           getPayloads, deleteAllFromCloudinary, getBeaconPayload } = useChatMedia();
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Represents a single media file in the upload pipeline.
 * Tracks everything from the moment the user selects a file
 * to successful upload or error.
 */
export interface ChatMediaItem {
  /** Stable local ID for React keys and state lookups */
  id: string;
  /** Cloudinary public_id — populated after successful upload */
  publicId: string;
  /** Cloudinary secure_url — populated after successful upload */
  url: string;
  /** High-level media category */
  type: 'image' | 'video' | 'document';
  /** MIME type of the file */
  mimeType: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** Upload lifecycle state */
  status: 'uploading' | 'uploaded' | 'error';
  /** Upload progress 0–100 (real progress from XMLHttpRequest upload) */
  progress: number;
  /** Human-readable error message if status === 'error' */
  errorMessage?: string;
  /**
   * Local blob URL for image preview before / during upload.
   * Must be revoked with URL.revokeObjectURL() when no longer needed.
   */
  previewUrl?: string;
  /**
   * Text content extracted client-side from TXT / CSV files.
   * Sent to the backend so the LLM can analyse document content (RAG).
   */
  extractedText?: string;
}

/**
 * Serialisable shape sent to /api/chat as part of mediaAttachments[].
 * Contains only data the LLM needs — never includes Cloudinary credentials.
 */
export interface MediaAttachmentPayload {
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'document';
  name: string;
  mimeType: string;
  /** Pre-extracted text for TXT/CSV documents */
  extractedText?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const SIZE_LIMITS: Record<'image' | 'video' | 'document', number> = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 50 * 1024 * 1024, // 50 MB
  document: 20 * 1024 * 1024, // 20 MB
};

const SIZE_LABELS: Record<'image' | 'video' | 'document', string> = {
  image: '10MB',
  video: '50MB',
  document: '20MB',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a MIME type to its ChatMediaItem type category. Returns null if unsupported. */
function getMimeCategory(mimeType: string): 'image' | 'video' | 'document' | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ALLOWED_DOC_TYPES.includes(mimeType)) return 'document';
  return null;
}

/** Returns a human-readable file size string e.g. "4.2 MB" */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Reads a File as text using the FileReader API.
 * Used for TXT and CSV files to extract content for LLM context.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatMedia() {
  const [uploads, setUploads] = useState<ChatMediaItem[]>([]);
  const xhrRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  /** Whether any file is currently being uploaded */
  const isUploading = uploads.some((u) => u.status === 'uploading');

  /**
   * Updates a single upload item by its local id.
   * Merges the provided partial update into the existing item.
   */
  const updateUpload = useCallback((id: string, patch: Partial<ChatMediaItem>) => {
    setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  /**
   * Validates a File against allowed types and size limits.
   * Returns { valid: true } or { valid: false, error: string }.
   */
  const validateFile = useCallback(
    (
      file: File
    ):
      | { valid: true; category: 'image' | 'video' | 'document' }
      | { valid: false; error: string } => {
      const category = getMimeCategory(file.type);
      if (!category) {
        return {
          valid: false,
          error: `"${file.name}": Unsupported type (${file.type}). Supported: JPEG, PNG, WebP, MP4, WebM, PDF, DOCX, TXT, CSV, XLSX.`,
        };
      }
      if (file.size > SIZE_LIMITS[category]) {
        return {
          valid: false,
          error: `"${file.name}": File too large (${formatFileSize(file.size)}). Max for ${category}s: ${SIZE_LABELS[category]}.`,
        };
      }
      return { valid: true, category };
    },
    []
  );

  /**
   * Uploads a single validated file to Cloudinary via the backend API.
   * Updates the corresponding ChatMediaItem with progress and final status.
   *
   * @param localId   - The local nanoid assigned to this upload
   * @param file      - The File object to upload
   * @param category  - Pre-validated media category
   * @param extractedText - Pre-extracted text content (for TXT/CSV)
   */
  const uploadFile = useCallback(
    (
      localId: string,
      file: File,
      category: 'image' | 'video' | 'document',
      extractedText?: string
    ) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current.set(localId, xhr);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateUpload(localId, { progress });
        }
      };

      xhr.onload = () => {
        xhrRef.current.delete(localId);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              updateUpload(localId, {
                publicId: data.publicId,
                url: data.url,
                status: 'uploaded',
                progress: 100,
                extractedText,
              });
            } else {
              updateUpload(localId, {
                status: 'error',
                progress: 0,
                errorMessage: data.error || 'Upload failed',
              });
            }
          } catch {
            updateUpload(localId, {
              status: 'error',
              progress: 0,
              errorMessage: 'Failed to parse server response',
            });
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            updateUpload(localId, {
              status: 'error',
              progress: 0,
              errorMessage: data.error || 'Upload failed',
            });
          } catch {
            updateUpload(localId, {
              status: 'error',
              progress: 0,
              errorMessage: 'Upload failed. Please retry.',
            });
          }
        }
      };

      xhr.onerror = () => {
        xhrRef.current.delete(localId);
        updateUpload(localId, {
          status: 'error',
          progress: 0,
          errorMessage: 'Network error. Please retry.',
        });
      };

      xhr.onabort = () => {
        xhrRef.current.delete(localId);
        setUploads((prev) => {
          const item = prev.find((u) => u.id === localId);
          if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
          return prev.filter((u) => u.id !== localId);
        });
      };

      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', '/api/chat/media/upload');
      xhr.send(formData);
    },
    [updateUpload]
  );

  /**
   * Processes a FileList: validates each file, creates a local preview,
   * extracts text for TXT/CSV, and starts the upload.
   *
   * @param files - FileList from an <input type="file"> change event
   * @returns Array of validation errors (if any files were rejected)
   */
  const selectFiles = useCallback(
    async (files: FileList | File[]): Promise<string[]> => {
      const fileArray = Array.from(files);
      const errors: string[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push(validation.error);
          continue;
        }

        const { category } = validation;
        const localId = nanoid();

        // Create a local blob URL for image previews
        const previewUrl = category === 'image' ? URL.createObjectURL(file) : undefined;

        // Add placeholder item in 'uploading' state
        setUploads((prev) => [
          ...prev,
          {
            id: localId,
            publicId: '',
            url: '',
            type: category,
            mimeType: file.type,
            name: file.name,
            size: file.size,
            status: 'uploading',
            progress: 0,
            previewUrl,
          },
        ]);

        // Extract text for TXT / CSV files (for RAG context)
        let extractedText: string | undefined;
        if (file.type === 'text/plain' || file.type === 'text/csv') {
          try {
            extractedText = await readFileAsText(file);
          } catch {
            console.warn(`[useChatMedia] Failed to read text from "${file.name}"`);
          }
        }

        // Start async upload (does not block selectFiles return)
        uploadFile(localId, file, category, extractedText);
      }

      return errors;
    },
    [validateFile, uploadFile]
  );

  /**
   * Retries a failed upload.
   * Re-selects the file would require the original File object, so instead
   * this resets the status to trigger a UI "select again" state.
   * In practice, we mark the item as removable.
   */
  const retryUpload = useCallback(
    (id: string) => {
      // Since we don't retain the File object, we can only remove the failed item
      // and ask the user to re-select. Clear the error to prompt removal.
      updateUpload(id, {
        status: 'error',
        errorMessage: 'Please remove and re-select this file to retry.',
      });
    },
    [updateUpload]
  );

  /**
   * Removes a single upload from local state.
   * - Cancels in-flight uploads
   * - Revokes local blob URLs
   * - Does NOT delete from Cloudinary (caller must handle that if needed)
   */
  const removeUpload = useCallback((id: string) => {
    xhrRef.current.get(id)?.abort();

    setUploads((prev) => {
      const item = prev.find((u) => u.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  /**
   * Removes a single upload AND deletes it from Cloudinary.
   * Use this for user-initiated removal of already-uploaded files.
   */
  const removeAndDeleteUpload = useCallback(
    async (id: string) => {
      const item = uploads.find((u) => u.id === id);
      removeUpload(id);

      if (item?.status === 'uploaded' && item.publicId) {
        try {
          await fetch('/api/chat/media/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaItems: [{ publicId: item.publicId, type: item.type }],
            }),
          });
        } catch (err) {
          console.error('[useChatMedia] Failed to delete from Cloudinary:', err);
        }
      }
    },
    [uploads, removeUpload]
  );

  /**
   * Clears all uploads from local state (revokes blob URLs).
   * Does NOT delete from Cloudinary.
   */
  const clearUploads = useCallback(() => {
    xhrRef.current.forEach((xhr) => xhr.abort());
    xhrRef.current.clear();

    setUploads((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }, []);

  /**
   * Deletes all successfully-uploaded files from Cloudinary.
   * Called when starting a new chat or navigating away (fetch version).
   */
  const deleteAllFromCloudinary = useCallback(async () => {
    const toDelete = uploads.filter((u) => u.status === 'uploaded' && u.publicId);
    if (toDelete.length === 0) return;

    try {
      await fetch('/api/chat/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaItems: toDelete.map((u) => ({ publicId: u.publicId, type: u.type })),
        }),
      });
    } catch (err) {
      console.error('[useChatMedia] Bulk delete failed:', err);
    }
  }, [uploads]);

  /**
   * Returns a Blob payload suitable for navigator.sendBeacon().
   * Used in the beforeunload event handler to delete uploads when the
   * user closes or refreshes the page.
   *
   * @example
   *   window.addEventListener('beforeunload', () => {
   *     const payload = getBeaconPayload();
   *     if (payload) navigator.sendBeacon('/api/chat/media/delete', payload);
   *   });
   */
  const getBeaconPayload = useCallback((): Blob | null => {
    const toDelete = uploads.filter((u) => u.status === 'uploaded' && u.publicId);
    if (toDelete.length === 0) return null;

    return new Blob(
      [
        JSON.stringify({
          mediaItems: toDelete.map((u) => ({ publicId: u.publicId, type: u.type })),
        }),
      ],
      { type: 'application/json' }
    );
  }, [uploads]);

  /**
   * Returns only the successfully-uploaded items as MediaAttachmentPayload[].
   * This is what gets sent to /api/chat as the mediaAttachments field.
   */
  const getPayloads = useCallback((): MediaAttachmentPayload[] => {
    return uploads
      .filter((u) => u.status === 'uploaded')
      .map((u) => ({
        url: u.url,
        publicId: u.publicId,
        type: u.type,
        name: u.name,
        mimeType: u.mimeType,
        extractedText: u.extractedText,
      }));
  }, [uploads]);

  return {
    /** Current list of uploads (all statuses) */
    uploads,
    /** True while any file is being uploaded */
    isUploading,
    /** Process and upload a FileList or File[] */
    selectFiles,
    /** Remove a single item from local state only */
    removeUpload,
    /** Remove a single item from local state AND delete from Cloudinary */
    removeAndDeleteUpload,
    /** Retry a failed upload (effectively prompts re-selection) */
    retryUpload,
    /** Clear all local state (no Cloudinary deletion) */
    clearUploads,
    /** Delete all uploaded files from Cloudinary (fetch-based) */
    deleteAllFromCloudinary,
    /** Get sendBeacon-compatible Blob for beforeunload cleanup */
    getBeaconPayload,
    /** Get payloads for the /api/chat mediaAttachments field */
    getPayloads,
  };
}
