import { auth } from './firebase';

const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

// ─── Core XHR upload helper ────────────────────────────────────────────────────

/**
 * POST /api/upload/image?type=<type>
 *
 * The backend uploads the file to ImageKit.io (or falls back to local disk
 * when ImageKit credentials are not configured) and returns the public URL.
 *
 * @param file       - The image File / Blob to upload.
 * @param onProgress - Optional callback receiving 0-100 upload progress.
 * @param type       - Upload destination folder: 'ctf' or 'blog'.
 * @returns           The public URL (ImageKit CDN URL or local server URL).
 */
export async function uploadArticleImage(
  file: File,
  onProgress?: (pct: number) => void,
  type: 'ctf' | 'blog' = 'ctf',
): Promise<string> {
  return _uploadImage(file, type, onProgress);
}

/**
 * Lightweight wrapper for inline image uploads (paste / drag-drop inside the
 * editor). No progress callback — paste uploads are usually fast enough that
 * a progress bar would flicker rather than help.
 *
 * Future ImageKit.io enhancements:
 *   The backend already handles everything; just update IMAGEKIT_* env vars
 *   in the backend to switch from local storage to ImageKit CDN automatically.
 *
 * @param file - The image File / Blob extracted from the clipboard or drop event.
 * @param type - 'blog' or 'ctf' determines the ImageKit folder / local sub-dir.
 * @returns     The public CDN URL to embed as the image src in the editor.
 */
export async function uploadInlineImage(
  file: File,
  type: 'ctf' | 'blog' = 'ctf',
): Promise<string> {
  return _uploadImage(file, type);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function _uploadImage(
  file: File,
  type: 'ctf' | 'blog',
  onProgress?: (pct: number) => void,
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to upload images');

  const idToken = await user.getIdToken();
  const formData = new FormData();
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } catch {
          reject(new Error('Invalid response from upload endpoint'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.message ?? `Upload failed (HTTP ${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', `${BASE}/api/upload/image?type=${type}`);
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.send(formData);
  });
}
