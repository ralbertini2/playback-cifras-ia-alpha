import { forceLoadGooglePicker } from './googlePickerService.js';
import { clearOfflineDriveFiles, createOfflineBlobUrl, getOfflineDriveFile, saveOfflineDriveFile } from './offlineDriveStore.js';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const SELECTED_FOLDER_STORAGE_KEY = 'playback-cifras:selected-google-drive-folder';
const DRIVE_SESSION_STORAGE_KEY = 'playback-cifras:google-drive-session-active';
const DRIVE_TOKEN_STORAGE_KEY = 'playback-cifras:google-drive-token';

let tokenClient = null;
let accessToken = '';
const tokenListeners = new Set();

function saveStoredAccessToken(token, expiresIn = 3600) {
  try {
    if (!token) {
      window.localStorage.removeItem(DRIVE_TOKEN_STORAGE_KEY);
      return;
    }

    const ttl = Math.max(60, Number(expiresIn) || 3600);
    const expiresAt = Date.now() + ttl * 1000 - 60000;
    window.localStorage.setItem(DRIVE_TOKEN_STORAGE_KEY, JSON.stringify({ token, expiresAt }));
  } catch (_) {}
}

function clearStoredAccessToken() {
  try {
    window.localStorage.removeItem(DRIVE_TOKEN_STORAGE_KEY);
  } catch (_) {}
}

function getStoredAccessToken() {
  try {
    const raw = window.localStorage.getItem(DRIVE_TOKEN_STORAGE_KEY);
    if (!raw) return '';

    const data = JSON.parse(raw);
    if (!data?.token || !data?.expiresAt || Number(data.expiresAt) <= Date.now()) {
      clearStoredAccessToken();
      return '';
    }

    return data.token;
  } catch {
    clearStoredAccessToken();
    return '';
  }
}

function notifyTokenListeners(token) {
  tokenListeners.forEach((listener) => {
    try {
      listener(token);
    } catch (error) {
      console.warn('[Playback Cifras IA] Erro em listener OAuth.', error);
    }
  });
}

function setStoredDriveSession(active) {
  try {
    if (active) window.localStorage.setItem(DRIVE_SESSION_STORAGE_KEY, '1');
    else window.localStorage.removeItem(DRIVE_SESSION_STORAGE_KEY);
  } catch (_) {}
}

export function hasStoredDriveSession() {
  try {
    return window.localStorage.getItem(DRIVE_SESSION_STORAGE_KEY) === '1' || Boolean(getStoredAccessToken());
  } catch {
    return false;
  }
}

function addTokenListener(listener) {
  if (typeof listener !== 'function') return () => {};
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

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
  if (accessToken) return accessToken;

  const storedToken = getStoredAccessToken();
  if (storedToken) {
    accessToken = storedToken;
    setStoredDriveSession(true);
    return accessToken;
  }

  return '';
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

  if (typeof onToken === 'function') {
    addTokenListener(onToken);
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: config.scope,
    callback: (response) => {
      accessToken = response?.access_token || '';
      if (accessToken) {
        saveStoredAccessToken(accessToken, response?.expires_in);
      } else {
        clearStoredAccessToken();
      }
      setStoredDriveSession(Boolean(accessToken));
      notifyTokenListeners(accessToken);
    },
  });

  return tokenClient;
}

export async function requestAccessToken({ prompt = '', onToken } = {}) {
  const storedToken = prompt !== 'consent' ? getStoredAccessToken() : '';

  if (storedToken) {
    accessToken = storedToken;
    setStoredDriveSession(true);
    if (typeof onToken === 'function') onToken(storedToken);
    notifyTokenListeners(storedToken);
    return true;
  }

  let removeOnceListener = null;

  if (typeof onToken === 'function') {
    removeOnceListener = addTokenListener((token) => {
      removeOnceListener?.();
      onToken(token);
    });
  }

  if (!tokenClient) {
    await initGoogleAuth();
  }

  if (!tokenClient) {
    removeOnceListener?.();
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
  clearStoredAccessToken();
  setStoredDriveSession(false);
  tokenClient = null;
  return true;
}

export function buildDriveDownloadUrl(fileId) {
  if (!fileId) return '';
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
}

export async function getAuthorizedMediaUrl(fileId, token = accessToken, mimeType = '') {
  if (!fileId || !token) return '';

  const offlineUrl = await createOfflineBlobUrl(fileId, mimeType);
  if (offlineUrl) return offlineUrl;

  const response = await fetch(buildDriveDownloadUrl(fileId), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar arquivo do Google Drive (${response.status})`);
  }

  const blob = await response.blob();
  try {
    await saveOfflineDriveFile({
      id: fileId,
      arrayBuffer: await blob.arrayBuffer(),
      mimeType: blob.type || mimeType,
    });
  } catch (_) {}

  return URL.createObjectURL(blob);
}

export async function fetchDriveBlobUrl(fileId, token = accessToken) {
  return getAuthorizedMediaUrl(fileId, token);
}

function arrayBufferStartsWithPdf(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < 5) return false;

  const bytes = new Uint8Array(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 1024)));
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

  for (let index = 0; index <= bytes.length - signature.length; index += 1) {
    if (signature.every((value, offset) => bytes[index + offset] === value)) {
      return true;
    }
  }

  return false;
}

export async function fetchDriveArrayBuffer(fileId, token = accessToken, mimeType = '', name = '') {
  if (!fileId || !token) return null;

  const offline = await getOfflineDriveFile(fileId);
  if (offline?.arrayBuffer) return offline.arrayBuffer.slice(0);

  const response = await fetch(buildDriveDownloadUrl(fileId), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar arquivo do Google Drive (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  try {
    await saveOfflineDriveFile({
      id: fileId,
      arrayBuffer,
      mimeType: mimeType || response.headers.get('content-type') || '',
      name,
    });
  } catch (_) {}

  return arrayBuffer.slice(0);
}

export async function fetchDrivePdfData(fileId, token = accessToken) {
  const arrayBuffer = await fetchDriveArrayBuffer(fileId, token, 'application/pdf');

  if (!arrayBufferStartsWithPdf(arrayBuffer)) {
    throw new Error('O arquivo retornado pelo Google Drive não parece ser um PDF válido.');
  }

  return new Uint8Array(arrayBuffer);
}


export function isSupportedDriveDocument(file) {
  const name = String(file?.name || '').toLowerCase();
  const mime = String(file?.mimeType || '').toLowerCase();

  return mime === 'application/vnd.google-apps.document'
    || mime === 'text/plain'
    || mime === 'text/html'
    || mime === 'application/rtf'
    || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || name.endsWith('.docx')
    || name.endsWith('.txt')
    || name.endsWith('.rtf')
    || name.endsWith('.html')
    || name.endsWith('.htm');
}

function decodeHtmlEntities(value = '') {
  let text = String(value || '');

  for (let pass = 0; pass < 3; pass += 1) {
    const previous = text;

    text = text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&aacute;/gi, 'á')
      .replace(/&agrave;/gi, 'à')
      .replace(/&acirc;/gi, 'â')
      .replace(/&atilde;/gi, 'ã')
      .replace(/&eacute;/gi, 'é')
      .replace(/&ecirc;/gi, 'ê')
      .replace(/&iacute;/gi, 'í')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&ocirc;/gi, 'ô')
      .replace(/&otilde;/gi, 'õ')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&ccedil;/gi, 'ç')
      .replace(/&#(\d+);/g, (_, code) => {
        const charCode = Number(code);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : _;
      })
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
        const charCode = Number.parseInt(code, 16);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : _;
      });

    if (text === previous) break;
  }

  try {
    return text.normalize('NFC');
  } catch (_) {
    return text;
  }
}

function removeHtmlNoise(html = '') {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function isNoiseTextLine(line = '') {
  const clean = String(line || '').trim();
  if (!clean) return false;

  return /^@import\b/i.test(clean)
    || /themes\.googleusercontent\.com/i.test(clean)
    || /fonts\/css/i.test(clean)
    || /^kit=/i.test(clean)
    || /font-family\s*:/i.test(clean)
    || /@font-face/i.test(clean)
    || /^\s*[\w.#-]+\s*\{/.test(clean)
    || /^\s*[};]+\s*$/.test(clean);
}

function cleanDocumentText(value = '') {
  const decoded = decodeHtmlEntities(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n');

  return decoded
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .filter((line) => !isNoiseTextLine(line))
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

function stripHtmlToText(html = '') {
  const safeHtml = removeHtmlNoise(html);

  const text = safeHtml
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|table|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  return cleanDocumentText(text);
}

function stripRtfToText(rtf = '') {
  return String(rtf || '')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


function isDocxDocument(mime = '', fileName = '') {
  const cleanMime = String(mime || '').toLowerCase();
  const cleanName = String(fileName || '').toLowerCase();
  return cleanMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || cleanName.endsWith('.docx');
}

let mammothLoadPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-playback-src="${src}"]`);
    if (existing) {
      if (window.mammoth) resolve(window.mammoth);
      existing.addEventListener('load', () => resolve(window.mammoth), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.playbackSrc = src;
    script.onload = () => resolve(window.mammoth);
    script.onerror = () => reject(new Error('Não foi possível carregar o conversor DOCX.'));
    document.head.appendChild(script);
  });
}

async function loadMammoth() {
  if (window.mammoth?.convertToHtml) return window.mammoth;
  if (!mammothLoadPromise) {
    mammothLoadPromise = loadScriptOnce('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
  }
  const mammoth = await mammothLoadPromise;
  if (!mammoth?.convertToHtml) {
    throw new Error('Conversor DOCX indisponível no navegador.');
  }
  return mammoth;
}

function htmlToPlainText(html = '') {
  const stripped = stripHtmlToText(html);
  return stripped || String(html || '').replace(/<[^>]+>/g, ' ').trim();
}

async function convertDocxToDocumentSource(arrayBuffer, mimeType = '') {
  const mammoth = await loadMammoth();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) }, {
    styleMap: [
      "p[style-name='Title'] => h1:fresh",
      "p[style-name='Heading 1'] => h2:fresh",
      "p[style-name='Heading 2'] => h3:fresh",
      "b => strong",
      "i => em",
    ],
  });

  let rawText = '';
  try {
    const rawResult = await mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) });
    rawText = cleanDocumentText(rawResult?.value || '');
  } catch (_) {}

  const rawHtml = String(htmlResult?.value || '').trim();
  const text = rawText || htmlToPlainText(rawHtml);

  return {
    type: 'text-document',
    format: 'docx',
    html: '',
    rawHtml,
    text,
    mimeType,
    warnings: Array.isArray(htmlResult?.messages) ? htmlResult.messages.map((item) => item?.message).filter(Boolean) : [],
  };
}

export async function fetchDriveTextDocument(fileId, mimeType = '', token = accessToken, fileName = '') {
  if (!fileId || !token) return null;

  const mime = String(mimeType || '').toLowerCase();
  const name = String(fileName || '').toLowerCase();

  if (mime === 'application/vnd.google-apps.document') {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent('text/html')}`;
    const offline = await getOfflineDriveFile(fileId);
    if (offline?.arrayBuffer) {
      const html = new TextDecoder('utf-8').decode(offline.arrayBuffer.slice(0));
      return { type: 'text-document', format: 'google-doc', html: removeHtmlNoise(html), text: stripHtmlToText(html), mimeType };
    }

    const response = await fetch(exportUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Falha ao exportar documento do Google Drive (${response.status})`);
    const html = await response.text();
    try {
      await saveOfflineDriveFile({
        id: fileId,
        arrayBuffer: new TextEncoder().encode(html).buffer,
        mimeType: 'text/html',
        name: fileName,
      });
    } catch (_) {}
    return { type: 'text-document', format: 'google-doc', html: removeHtmlNoise(html), text: stripHtmlToText(html), mimeType };
  }

  const arrayBuffer = await fetchDriveArrayBuffer(fileId, token, mimeType, fileName);

  if (isDocxDocument(mime, name)) {
    return convertDocxToDocumentSource(arrayBuffer, mimeType);
  }

  const text = arrayBuffer ? new TextDecoder('utf-8').decode(arrayBuffer.slice(0)) : '';

  if (mime === 'text/html' || mime.includes('html') || name.endsWith('.html') || name.endsWith('.htm')) {
    return { type: 'text-document', format: 'html', html: removeHtmlNoise(text), text: stripHtmlToText(text), mimeType };
  }

  if (mime === 'application/rtf' || name.endsWith('.rtf')) {
    return { type: 'text-document', format: 'rtf', text: stripRtfToText(text), mimeType };
  }

  if (mime === 'text/plain' || mime.startsWith('text/') || name.endsWith('.txt')) {
    return { type: 'text-document', format: 'text', text, mimeType };
  }

  return { type: 'text-document', format: 'unknown', text: '', mimeType };
}

function stripExtension(name = '') {
  return name.replace(/\.[^/.]+$/, '').trim();
}

function isPdf(file) {
  return file?.mimeType === 'application/pdf' || String(file?.name || '').toLowerCase().endsWith('.pdf');
}

function isDocument(file) {
  return isPdf(file) || isSupportedDriveDocument(file);
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


function isDriveFolder(file) {
  return file?.mimeType === 'application/vnd.google-apps.folder'
    || (file?.mimeType === 'application/vnd.google-apps.shortcut'
      && file?.shortcutDetails?.targetMimeType === 'application/vnd.google-apps.folder');
}

function getDriveFolderId(file) {
  return file?.shortcutDetails?.targetId || file?.id || '';
}

function normalizeStylePath(pathParts = []) {
  const cleanParts = pathParts.filter(Boolean);
  if (!cleanParts.length) return 'Google Drive';
  return cleanParts.join(' / ');
}

async function listDriveChildren(folderId, token = accessToken) {
  if (!folderId || !token) return [];

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,shortcutDetails(targetId,targetMimeType))');
  const orderBy = encodeURIComponent('folder,name');
  const files = [];
  let pageToken = '';

  do {
    const pageTokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=${orderBy}&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true${pageTokenParam}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Falha ao listar arquivos do Google Drive (${response.status})`);
    }

    const data = await response.json();
    files.push(...(Array.isArray(data.files) ? data.files : []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return files;
}

async function collectDriveFilesRecursively({ folderId, token = accessToken, pathParts = [], depth = 0, maxDepth = 6 } = {}) {
  const children = await listDriveChildren(folderId, token);
  const files = [];

  for (const child of children) {
    if (isDriveFolder(child)) {
      if (depth < maxDepth) {
        const nestedFiles = await collectDriveFilesRecursively({
          folderId: getDriveFolderId(child),
          token,
          pathParts: [...pathParts, child.name],
          depth: depth + 1,
          maxDepth,
        });
        files.push(...nestedFiles);
      }
      continue;
    }

    files.push({
      ...child,
      style: normalizeStylePath(pathParts),
      folderPath: normalizeStylePath(pathParts),
      folderParts: pathParts,
    });
  }

  return files;
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
    documentFileId: file.documentFileId || (isSupportedDriveDocument(file) ? file.id : ''),
    documentMimeType: file.documentMimeType || file.mimeType || '',
    documentName: file.documentName || file.name || file.title || '',
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
    if (!isDocument(file) && !isAudio(file)) return;

    const baseTitle = stripExtension(file.name || file.title || file.id || safeRandomId());
    const style = file.style || file.folderPath || 'Google Drive';
    const key = `${style}|${baseTitle}`.toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        id: key || safeRandomId(),
        title: baseTitle || 'Música sem título',
        artist: '',
        style,
        styleId: style,
        folderPath: file.folderPath || style,
        folderParts: file.folderParts || [],
        pdfFileId: '',
        documentFileId: '',
        documentMimeType: '',
        documentName: '',
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
      song.documentFileId = file.id;
      song.documentMimeType = file.mimeType;
      song.documentName = file.name;
      song.pdfName = file.name;
    } else if (isSupportedDriveDocument(file)) {
      song.documentFileId = file.id;
      song.documentMimeType = file.mimeType;
      song.documentName = file.name;
    }

    if (isAudio(file)) {
      song.audioFileId = file.id;
      song.audioName = file.name;
    }
  });

  return Array.from(groups.values()).sort((a, b) => {
    const styleCompare = String(a.style || '').localeCompare(String(b.style || ''), 'pt-BR');
    if (styleCompare !== 0) return styleCompare;
    return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
  });
}

export async function loadDriveLibrary({ folderId, token = accessToken } = {}) {
  const targetFolderId = folderId || getEffectiveFolderId();

  if (!targetFolderId || !token) return [];

  const files = await collectDriveFilesRecursively({
    folderId: targetFolderId,
    token,
    pathParts: [],
  });

  return groupDriveFilesAsSongs(files);
}


export async function preloadDriveLibraryOffline(songs = [], token = accessToken) {
  if (!token || !Array.isArray(songs) || !songs.length) return;

  for (const song of songs) {
    try {
      if (song.pdfFileId) await fetchDriveArrayBuffer(song.pdfFileId, token, 'application/pdf', song.pdfName || song.documentName || song.title);
      if (song.documentFileId && song.documentFileId !== song.pdfFileId) {
        await fetchDriveTextDocument(song.documentFileId, song.documentMimeType, token);
      }
      if (song.audioFileId) await fetchDriveArrayBuffer(song.audioFileId, token, 'audio/mpeg', song.audioName || song.title);
    } catch (error) {
      console.warn('[Playback Cifras IA] Offline parcial falhou para:', song?.title, error);
    }
  }
}

export async function clearDriveOfflineData() {
  return clearOfflineDriveFiles();
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

  if (typeof view.setParent === 'function') {
    view.setParent('root');
  }

  if (typeof view.setMode === 'function' && pickerApi.DocsViewMode?.LIST) {
    view.setMode(pickerApi.DocsViewMode.LIST);
  }

  const pickerBuilder = new pickerApi.PickerBuilder()
    .setDeveloperKey(config.apiKey)
    .setOAuthToken(accessToken);

  if (typeof pickerBuilder.setTitle === 'function') {
    pickerBuilder.setTitle('Selecione a pasta Playback Cifras');
  }

  const picker = pickerBuilder
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
