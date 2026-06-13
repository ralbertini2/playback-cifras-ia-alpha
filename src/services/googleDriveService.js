const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function getConfig() {
  return window.PLAYBACK_CIFRAS_CONFIG || window.APP_CONFIG || {};
}

export function getDriveConfig() {
  const config = getConfig();

  return {
    clientId: config.GOOGLE_CLIENT_ID || '',
    apiKey: config.GOOGLE_API_KEY || '',
    rootFolderId: config.ROOT_FOLDER_ID || '',
    scope: GOOGLE_SCOPE,
  };
}

export function isGoogleConfigured() {
  const config = getDriveConfig();
  return Boolean(config.clientId && config.apiKey);
}

export function buildDriveDownloadUrl(fileId) {
  if (!fileId) return '';
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

export async function fetchDriveBlobUrl(fileId, accessToken) {
  if (!fileId || !accessToken) return '';

  const response = await fetch(buildDriveDownloadUrl(fileId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar arquivo do Google Drive (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function normalizeDriveSong(file) {
  if (!file) return null;

  return {
    id: file.id || file.fileId || crypto.randomUUID(),
    title: file.title || file.name || 'Música sem título',
    artist: file.artist || '',
    style: file.style || file.category || 'Sem estilo',
    pdfFileId: file.pdfFileId || file.pdfId || (file.mimeType === 'application/pdf' ? file.id : ''),
    audioFileId: file.audioFileId || file.audioId || (String(file.mimeType || '').startsWith('audio/') ? file.id : ''),
    pdfUrl: file.pdfUrl || file.url || '',
    audioUrl: file.audioUrl || '',
    raw: file,
  };
}
