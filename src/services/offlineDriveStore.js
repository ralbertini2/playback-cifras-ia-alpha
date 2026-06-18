const DB_NAME = 'playback-cifras-offline-drive';
const DB_VERSION = 1;
const STORE_NAME = 'files';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB indisponível.'));
  });
}

export async function getOfflineDriveFile(id) {
  if (!id || typeof window === 'undefined') return null;

  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

export async function saveOfflineDriveFile({ id, arrayBuffer, mimeType = '', name = '' } = {}) {
  if (!id || !arrayBuffer || typeof window === 'undefined') return false;

  const db = await openDb();
  if (!db) return false;

  const buffer = arrayBuffer instanceof ArrayBuffer
    ? arrayBuffer.slice(0)
    : arrayBuffer?.buffer?.slice(arrayBuffer.byteOffset || 0, (arrayBuffer.byteOffset || 0) + arrayBuffer.byteLength);

  if (!buffer) return false;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id,
      arrayBuffer: buffer,
      mimeType,
      name,
      savedAt: Date.now(),
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

export async function clearOfflineDriveFiles() {
  if (typeof window === 'undefined') return false;

  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

export async function createOfflineBlobUrl(id, fallbackMimeType = '') {
  const stored = await getOfflineDriveFile(id);
  if (!stored?.arrayBuffer) return '';
  const blob = new Blob([stored.arrayBuffer], { type: stored.mimeType || fallbackMimeType || 'application/octet-stream' });
  return URL.createObjectURL(blob);
}
