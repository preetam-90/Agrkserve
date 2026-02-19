import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadOptions {
  folder?: string;
  fileName?: string;
  resourceType: 'image' | 'video' | 'raw';
  format?: string;
  transformation?: unknown[];
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
}

/**
 * Upload a buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.fileName?.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: options.resourceType,
        format: options.format,
        transformation: options.transformation,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
}

/**
 * Upload a file stream to Cloudinary
 */
export async function uploadStreamToCloudinary(
  stream: Readable,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.fileName?.replace(/\.[^/.]+$/, ''),
        resource_type: options.resourceType,
        format: options.format,
        transformation: options.transformation,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    stream.pipe(uploadStream);
  });
}

/**
 * Delete a resource from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else if (result.result === 'ok') {
        resolve();
      } else {
        reject(new Error('Delete failed'));
      }
    });
  });
}

/**
 * Get video metadata from Cloudinary
 */
export async function getVideoMetadataFromCloudinary(publicId: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(publicId, { resource_type: 'video' }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Generate a signed upload URL for direct upload from client
 */
function generateSignedUploadUrl(
  folder: string,
  fileName: string,
  resourceType: 'image' | 'video' = 'image'
): { url: string; params: unknown } {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const publicId = fileName.replace(/\.[^/.]+$/, '');

  const params = {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    timestamp,
    use_filename: true,
    unique_filename: false,
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
    params: {
      ...params,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
    },
  };
}
