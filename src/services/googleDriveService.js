import { STORAGE } from './storage.js';

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files';
let tokenClient = null;
let accessToken = localStorage.getItem(STORAGE.token) || '';

export function getAccessToken() {
  return accessToken;
}

export function waitForGoogleLibraries(timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const gisReady = Boolean(window.google?.accounts?.oauth2);
      const gapiReady = Boolean(window.gapi);
      if (gisReady && gapiReady) {
        clearInterval(timer);
        window.gapi.load('picker', () => resolve(true));
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Google APIs não carregaram a tempo.'));
      }
    }, 200);
  });
}

export async function initGoogleAuth() {
  await waitForGoogleLibraries();
  const clientId = window.APP_CONFIG?.GOOGLE_CLIENT_ID || '';
  if (!clientId || clientId.includes('COLE_SEU')) {
    throw new Error('Configure o GOOGLE_CLIENT_ID em public/config.js.');
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {}
  });
  return true;
}

export function requestAccessToken(prompt = 'consent') {
  if (!tokenClient) throw new Error('Google Auth ainda não foi inicializado.');
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      accessToken = response.access_token;
      localStorage.setItem(STORAGE.token, accessToken);
      localStorage.setItem(STORAGE.connected, '1');
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt });
  });
}

export function logoutGoogle() {
  const token = accessToken || localStorage.getItem(STORAGE.token) || '';
  if (token && window.google?.accounts?.oauth2) {
    try { window.google.accounts.oauth2.revoke(token, () => {}); } catch {}
  }
  accessToken = '';
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.connected);
}

async function fetchWithAuth(url) {
  if (!accessToken) await requestAccessToken('');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 401) {
    await requestAccessToken('');
    return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  }
  return response;
}

async function driveGet(fileId, fields = 'id,name,mimeType') {
  const url = new URL(`${DRIVE_FILES}/${fileId}`);
  url.searchParams.set('fields', fields);
  const response = await fetchWithAuth(url.toString());
  if (!response.ok) throw new Error(`Erro Drive ${response.status}`);
  return response.json();
}

async function driveList(params) {
  const url = new URL(DRIVE_FILES);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });
  const response = await fetchWithAuth(url.toString());
  if (!response.ok) throw new Error(`Erro Drive ${response.status}`);
  return response.json();
}

async function listAll(params) {
  let files = [];
  let pageToken = '';
  do {
    const data = await driveList({ ...params, pageToken });
    files = files.concat(data.files || []);
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return files;
}

function getExt(name) {
  return String(name).split('.').pop() || '';
}

function normalizeBase(name) {
  return String(name).replace(/\.[^/.]+$/, '').trim();
}

function normalizeMatchKey(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function pairFiles(style, files) {
  const map = new Map();
  const audioExts = new Set(['mp3', 'wav', 'm4a', 'mp4']);
  files.forEach((file) => {
    const ext = getExt(file.name).toLowerCase();
    if (ext !== 'pdf' && !audioExts.has(ext)) return;
    const base = normalizeBase(file.name);
    const key = normalizeMatchKey(base);
    if (!map.has(key)) map.set(key, { title: base, style: style.name, styleId: style.id });
    const item = map.get(key);
    if (ext === 'pdf') item.pdf = file;
    if (audioExts.has(ext)) item.audio = file;
  });
  return [...map.values()].filter((item) => item.pdf && item.audio).map((item) => ({
    id: `${item.styleId}|${item.title}`,
    title: item.title,
    style: item.style,
    styleId: item.styleId,
    pdfId: item.pdf.id,
    mp3Id: item.audio.id
  }));
}

function dedupeSongs(songs) {
  const seen = new Set();
  return songs.filter((song) => {
    const key = `${song.styleId}|${song.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadDriveLibrary(folderId) {
  const rootId = extractFolderId(folderId);
  if (!rootId) throw new Error('Selecione uma pasta do Drive.');
  localStorage.setItem(STORAGE.folder, rootId);
  const root = await driveGet(rootId);
  if (root.mimeType !== 'application/vnd.google-apps.folder') throw new Error('O ID informado não é de uma pasta.');

  const result = [];
  const rootFiles = await listAll({
    q: `'${rootId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
    fields: 'nextPageToken, files(id,name,mimeType,createdTime,modifiedTime)',
    orderBy: 'name',
    pageSize: '1000'
  });
  result.push(...pairFiles({ id: root.id, name: root.name }, rootFiles));

  const folders = await listAll({
    q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'nextPageToken, files(id,name,mimeType)',
    orderBy: 'name',
    pageSize: '1000'
  });

  const folderResults = await Promise.all(folders.map(async (folder) => {
    const files = await listAll({
      q: `'${folder.id}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields: 'nextPageToken, files(id,name,mimeType,createdTime,modifiedTime)',
      orderBy: 'name',
      pageSize: '1000'
    });
    return pairFiles(folder, files);
  }));
  folderResults.forEach((songs) => result.push(...songs));

  const library = dedupeSongs(result).sort((a, b) => a.style.localeCompare(b.style, 'pt-BR') || a.title.localeCompare(b.title, 'pt-BR'));
  localStorage.setItem(STORAGE.library, JSON.stringify(library));
  return library;
}

export function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export async function getAuthorizedMediaUrl(fileId) {
  const response = await fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  if (!response.ok) throw new Error(`Erro ao baixar arquivo ${response.status}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function extractFolderId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const folderMatch = raw.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return raw;
}

export function openFolderPicker(onPick) {
  const apiKey = window.APP_CONFIG?.GOOGLE_API_KEY || '';
  if (!apiKey) throw new Error('Configure GOOGLE_API_KEY para usar o seletor de pastas.');
  if (!window.google?.picker) throw new Error('Google Picker ainda não carregou.');
  const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true)
    .setMimeTypes('application/vnd.google-apps.folder');
  const picker = new window.google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(apiKey)
    .setCallback((data) => {
      if (data.action === window.google.picker.Action.PICKED) onPick(data.docs[0]);
    })
    .build();
  picker.setVisible(true);
}
