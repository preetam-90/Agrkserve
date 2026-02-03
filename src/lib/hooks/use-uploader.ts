// Simple uploader utility with progress callback
export async function uploadToServer(
  file: File,
  onProgress?: (percent: number) => void,
  bucket: string = 'chat-media',
  path?: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      const url = '/api/storage/upload';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (path) formData.append('path', path);

      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          try {
            onProgress?.(percent);
          } catch (e) {
            // swallow
          }
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (err) {
              resolve({ success: true, raw: xhr.responseText });
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}

export default uploadToServer;
