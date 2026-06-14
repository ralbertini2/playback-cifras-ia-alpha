import { forceLoadGooglePicker } from './googlePickerService.js';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const SELECTED_FOLDER_STORAGE_KEY = 'playback-cifras:selected-google-drive-folder';

let tokenClient = null;
let accessToken = '';

function getConfig() {
  return window.PLAYBACK_CIFRAS_CONFIG || window.APP_CONFIG || {};
}

function safeRandomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
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
  return Boolean(config.clientId);
}

export function isGooglePickerConfigured() {
  const config = getDriveConfig();
  return Boolean(config.apiKey);
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredDriveFolder() {
  try {
    const raw = window.localStorage.getItem(SELECTED_FOLDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSelectedDriveFolder(folder) {
  if (!folder?.id) return null;

  const normalized = {
    id: folder.id,
    name: folder.name || folder.title || 'Pasta selecionada',
  };

  window.localStorage.setItem(SELECTED_FOLDER_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearSelectedDriveFolder() {
  window.localStorage.removeItem(SELECTED_FOLDER_STORAGE_KEY);
}

export function getEffectiveFolderId() {
  const config = getDriveConfig();
  const stored = getStoredDriveFolder();

  return stored?.id || config.rootFolderId || '';
}

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
    headers: { Authorization: `Bearer ${token}` },
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

function stripExtension(name = '') {
  return name.replace(/\.[^/.]+$/, '').trim();
}

function isPdf(file) {
  return file?.mimeType === 'application/pdf' || String(file?.name || '').toLowerCase().endsWith('.pdf');
}

function isAudio(file) {
  const name = String(file?.name || '').toLowerCase();
  const mime = String(file?.mimeType || '').toLowerCase();

  return mime.startsWith('audio/')
    || name.endsWith('.mp3')
    || name.endsWith('.wav')
    || name.endsWith('.m4a')
    || name.endsWith('.aac')
    || name.endsWith('.ogg');
}

export function normalizeDriveSong(file) {
  if (!file) return null;

  return {
    id: file.id || file.fileId || safeRandomId(),
    title: stripExtension(file.title || file.name || 'Música sem título'),
    fileName: file.name || file.title || '',
    artist: file.artist || '',
    style: file.style || file.category || 'Google Drive',
    mimeType: file.mimeType || '',
    pdfFileId: file.pdfFileId || file.pdfId || (isPdf(file) ? file.id : ''),
    audioFileId: file.audioFileId || file.audioId || (isAudio(file) ? file.id : ''),
    pdfUrl: file.pdfUrl || '',
    audioUrl: file.audioUrl || '',
    webViewLink: file.webViewLink || '',
    raw: file,
  };
}

function groupDriveFilesAsSongs(files = []) {
  const groups = new Map();

  files.forEach((file) => {
    if (!isPdf(file) && !isAudio(file)) return;

    const key = stripExtension(file.name || file.title || file.id || safeRandomId()).toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        id: key || safeRandomId(),
        title: stripExtension(file.name || file.title || 'Música sem título'),
        artist: '',
        style: 'Google Drive',
        pdfFileId: '',
        audioFileId: '',
        pdfUrl: '',
        audioUrl: '',
        files: [],
      });
    }

    const song = groups.get(key);
    song.files.push(file);

    if (isPdf(file)) {
      song.pdfFileId = file.id;
      song.pdfName = file.name;
    }

    if (isAudio(file)) {
      song.audioFileId = file.id;
      song.audioName = file.name;
    }
  });

  return Array.from(groups.values());
}

export async function loadDriveLibrary({ folderId, token = accessToken } = {}) {
  const targetFolderId = folderId || getEffectiveFolderId();

  if (!targetFolderId || !token) return [];

  const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size,webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=1000`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao listar arquivos do Google Drive (${response.status})`);
  }

  const data = await response.json();
  const files = Array.isArray(data.files) ? data.files : [];

  return groupDriveFilesAsSongs(files);
}

export async function ensureGooglePickerReady() {
  await forceLoadGooglePicker();
  return Boolean(window.google?.picker);
}

export async function openFolderPicker({ onPicked } = {}) {
  const config = getDriveConfig();

  if (!config.apiKey) {
    throw new Error('GOOGLE_API_KEY não configurada.');
  }

  if (!accessToken) {
    throw new Error('Faça login no Google antes de escolher a pasta.');
  }

  const pickerApi = await forceLoadGooglePicker();

  if (!pickerApi) {
    throw new Error('Google Picker não ficou disponível.');
  }

  console.info('[Playback Cifras IA] Abrindo Google Picker...');

  const view = new pickerApi.DocsView(pickerApi.ViewId.FOLDERS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true);

  const picker = new pickerApi.PickerBuilder()
    .setDeveloperKey(config.apiKey)
    .setOAuthToken(accessToken)
    .addView(view)
    .setCallback((data) => {
      if (data?.action === pickerApi.Action.PICKED) {
        const folder = data.docs?.[0];

        if (folder) {
          const savedFolder = saveSelectedDriveFolder({
            id: folder.id,
            name: folder.name || folder.title,
          });

          if (typeof onPicked === 'function') {
            onPicked(savedFolder);
          }
        }
      }
    })
    .build();

  picker.setVisible(true);
  return true;
}
