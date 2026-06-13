const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient = null;
let accessToken = '';

function getConfig() {
  return window.PLAYBACK_CIFRAS_CONFIG || window.APP_CONFIG || {};
}

function safeRandomId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `file-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

export function getAccessToken() {
  return accessToken;
}

/**
 * Inicializa o cliente Google OAuth.
 *
 * Importante:
 * Esta função sempre retorna uma Promise.
 * Isso evita tela preta quando algum hook chama `initGoogleAuth(...).then(...)`
 * e a configuração Google ainda não está disponível.
 */
export async function initGoogleAuth({ onToken } = {}) {
  const config = getDriveConfig();

  if (!config.clientId || !window.google?.accounts?.oauth2) {
    return null;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: config.scope,
    callback: (response) => {
      accessToken = response?.access_token || '';
      if (typeof onToken === 'function') {
        onToken(accessToken);
      }
    },
  });

  return tokenClient;
}

/**
 * Solicita token OAuth.
 *
 * Sempre retorna Promise<boolean> para manter compatibilidade com chamadas `.then`.
 */
export async function requestAccessToken({ prompt = '' } = {}) {
  if (!tokenClient) {
    await initGoogleAuth();
  }

  if (!tokenClient) {
    return false;
  }

  tokenClient.requestAccessToken({ prompt });
  return true;
}

/**
 * Logout Google.
 *
 * Sempre retorna Promise<boolean>.
 */
export async function logoutGoogle() {
  if (accessToken && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(accessToken);
  }

  accessToken = '';
  tokenClient = null;
  return true;
}

export function buildDriveDownloadUrl(fileId) {
  if (!fileId) return '';
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

export async function getAuthorizedMediaUrl(fileId, token = accessToken) {
  if (!fileId || !token) return '';

  const response = await fetch(buildDriveDownloadUrl(fileId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar arquivo do Google Drive (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function fetchDriveBlobUrl(fileId, token = accessToken) {
  return getAuthorizedMediaUrl(fileId, token);
}

export function normalizeDriveSong(file) {
  if (!file) return null;

  return {
    id: file.id || file.fileId || safeRandomId(),
    title: file.title || file.name || 'Música sem título',
    artist: file.artist || '',
    style: file.style || file.category || 'Sem estilo',
    mimeType: file.mimeType || '',
    pdfFileId: file.pdfFileId || file.pdfId || (file.mimeType === 'application/pdf' ? file.id : ''),
    audioFileId: file.audioFileId || file.audioId || (String(file.mimeType || '').startsWith('audio/') ? file.id : ''),
    pdfUrl: file.pdfUrl || file.url || '',
    audioUrl: file.audioUrl || '',
    raw: file,
  };
}

function mapDriveFile(file) {
  return normalizeDriveSong(file);
}

/**
 * Lista arquivos da pasta Google Drive.
 *
 * Sempre retorna Promise<Array>.
 * Se não houver folderId/token/config, retorna [] em vez de null.
 */
export async function loadDriveLibrary({ folderId, token = accessToken } = {}) {
  const config = getDriveConfig();
  const targetFolderId = folderId || config.rootFolderId;

  if (!targetFolderId || !token) {
    return [];
  }

  const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size,webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=1000`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao listar arquivos do Google Drive (${response.status})`);
  }

  const data = await response.json();
  const files = Array.isArray(data.files) ? data.files : [];

  return files
    .map(mapDriveFile)
    .filter(Boolean);
}

/**
 * Abre Google Picker.
 *
 * Sempre retorna Promise<boolean> para evitar erro de `.then` em runtime.
 */
export async function openFolderPicker({ onPicked } = {}) {
  const config = getDriveConfig();

  if (!window.google?.picker || !config.apiKey || !accessToken) {
    return false;
  }

  const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true);

  const picker = new window.google.picker.PickerBuilder()
    .setDeveloperKey(config.apiKey)
    .setOAuthToken(accessToken)
    .addView(view)
    .setCallback((data) => {
      if (data?.action === window.google.picker.Action.PICKED) {
        const folder = data.docs?.[0];
        if (folder && typeof onPicked === 'function') {
          onPicked(folder);
        }
      }
    })
    .build();

  picker.setVisible(true);
  return true;
}
