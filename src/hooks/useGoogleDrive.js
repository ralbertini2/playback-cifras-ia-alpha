import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearSelectedDriveFolder,
  fetchDriveBlobUrl,
  getAccessToken,
  getDriveConfig,
  getEffectiveFolderId,
  getStoredDriveFolder,
  initGoogleAuth,
  isGoogleConfigured,
  isGooglePickerConfigured,
  loadDriveLibrary,
  logoutGoogle,
  openFolderPicker,
  requestAccessToken,
} from '../services/googleDriveService.js';

const STATUS = {
  NOT_CONFIGURED: 'not-configured',
  READY: 'ready',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  NEED_FOLDER: 'need-folder',
  LOADING: 'loading',
  CONNECTED: 'connected',
  ERROR: 'error',
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeIndex(index, list) {
  const songs = asArray(list);
  if (!songs.length) return -1;
  const parsed = Number(index);
  if (!Number.isFinite(parsed)) return -1;
  return Math.max(0, Math.min(songs.length - 1, parsed));
}

export function useGoogleDriveLibrary({ onSongPdfReady, onSongAudioReady, onNotify } = {}) {
  const [status, setStatus] = useState(STATUS.READY);
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [selectedFolder, setSelectedFolder] = useState(() => getStoredDriveFolder());
  const [library, setLibrary] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSong, setCurrentSong] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const config = useMemo(() => getDriveConfig(), []);
  const isConfigured = isGoogleConfigured();
  const pickerConfigured = isGooglePickerConfigured();
  const hasToken = Boolean(accessToken);
  const folderId = selectedFolder?.id || config.rootFolderId || '';
  const filteredSongs = useMemo(() => asArray(library), [library]);
  const isConnected = Boolean(hasToken && folderId && status === STATUS.CONNECTED);

  const notify = useCallback((text) => {
    setMessage(text || '');
    if (typeof onNotify === 'function') onNotify(text || '');
  }, [onNotify]);

  useEffect(() => {
    let cancelled = false;

    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      notify('Configure GOOGLE_CLIENT_ID em public/config.js.');
      return;
    }

    initGoogleAuth({
      onToken: (token) => {
        if (cancelled) return;
        setAccessToken(token || '');
        const effectiveFolderId = getEffectiveFolderId();
        if (token) {
          setStatus(effectiveFolderId ? STATUS.AUTHENTICATED : STATUS.NEED_FOLDER);
          notify(effectiveFolderId
            ? 'Google autenticado. Carregue a biblioteca.'
            : 'Google autenticado. Escolha uma pasta do Drive.');
        }
      },
    }).then((client) => {
      if (cancelled) return;
      if (!client) {
        setStatus(STATUS.NOT_CONFIGURED);
        notify('Google Identity Services ainda não está disponível.');
        return;
      }
      if (!getEffectiveFolderId()) {
        setStatus(STATUS.NEED_FOLDER);
        notify('Escolha uma pasta do Google Drive para carregar as músicas.');
      } else {
        setStatus(STATUS.READY);
        notify('Google configurado. Faça login para carregar a biblioteca.');
      }
    }).catch((err) => {
      if (cancelled) return;
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Erro ao inicializar Google Drive.');
    });

    return () => { cancelled = true; };
  }, [isConfigured, notify]);

  const refreshLibrary = useCallback(async ({ nextFolderId } = {}) => {
    const effectiveFolderId = nextFolderId || selectedFolder?.id || config.rootFolderId || '';
    const token = accessToken || getAccessToken();

    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      notify('Google Drive não configurado.');
      setLibrary([]);
      setCurrentSong(null);
      setCurrentIndex(-1);
      return [];
    }

    if (!token) {
      setStatus(STATUS.READY);
      notify('Faça login no Google Drive para carregar músicas.');
      setLibrary([]);
      setCurrentSong(null);
      setCurrentIndex(-1);
      return [];
    }

    if (!effectiveFolderId) {
      setStatus(STATUS.NEED_FOLDER);
      notify('Escolha uma pasta do Google Drive.');
      setLibrary([]);
      setCurrentSong(null);
      setCurrentIndex(-1);
      return [];
    }

    try {
      setStatus(STATUS.LOADING);
      setError('');
      notify('Carregando biblioteca do Google Drive...');
      const songs = asArray(await loadDriveLibrary({ folderId: effectiveFolderId, token }));
      setLibrary(songs);
      if (!songs.length) {
        setCurrentSong(null);
        setCurrentIndex(-1);
      } else if (currentIndex >= songs.length) {
        setCurrentIndex(0);
        setCurrentSong(songs[0]);
      }
      setStatus(STATUS.CONNECTED);
      notify(songs.length
        ? `${songs.length} música(s) carregada(s) do Google Drive.`
        : 'Pasta carregada, mas nenhum PDF ou áudio compatível foi encontrado.');
      return songs;
    } catch (err) {
      setLibrary([]);
      setCurrentSong(null);
      setCurrentIndex(-1);
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Erro ao carregar Google Drive.');
      return [];
    }
  }, [accessToken, config.rootFolderId, currentIndex, isConfigured, notify, selectedFolder?.id]);

  const connect = useCallback(async () => {
    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      notify('Configure GOOGLE_CLIENT_ID em public/config.js.');
      return false;
    }
    setStatus(STATUS.AUTHENTICATING);
    notify('Aguardando login do Google...');
    return requestAccessToken({ prompt: 'consent' });
  }, [isConfigured, notify]);

  const chooseFolder = useCallback(async () => {
    if (!accessToken && !getAccessToken()) {
      setStatus(STATUS.READY);
      notify('Faça login antes de escolher uma pasta.');
      return false;
    }

    if (!pickerConfigured) {
      setStatus(STATUS.NEED_FOLDER);
      notify('Google Picker indisponível. Configure GOOGLE_API_KEY.');
      return false;
    }

    try {
      notify('Abrindo seletor de pasta do Google Drive...');

      const opened = await openFolderPicker({
        onPicked: async (folder) => {
          setSelectedFolder(folder);
          notify(`Pasta selecionada: ${folder?.name || folder?.id}`);
          await refreshLibrary({ nextFolderId: folder?.id });
        },
      });

      if (!opened) {
        notify('Não foi possível abrir o seletor de pasta.');
      }

      return opened;
    } catch (err) {
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Erro ao abrir seletor de pasta.');
      notify(err?.message || 'Erro ao abrir seletor de pasta.');
      return false;
    }
  }, [accessToken, pickerConfigured, notify, refreshLibrary]);

  const disconnect = useCallback(async () => {
    await logoutGoogle();
    setAccessToken('');
    setLibrary([]);
    setCurrentSong(null);
    setCurrentIndex(-1);
    setStatus(isConfigured ? STATUS.READY : STATUS.NOT_CONFIGURED);
    notify(isConfigured ? 'Google desconectado.' : 'Google Drive não configurado.');
  }, [isConfigured, notify]);

  const clearFolder = useCallback(() => {
    clearSelectedDriveFolder();
    setSelectedFolder(null);
    setLibrary([]);
    setCurrentSong(null);
    setCurrentIndex(-1);
    setStatus(hasToken ? STATUS.NEED_FOLDER : STATUS.READY);
    notify('Pasta removida. Escolha uma nova pasta do Google Drive.');
  }, [hasToken, notify]);

  const getMediaUrl = useCallback(async (fileId) => {
    const token = accessToken || getAccessToken();
    if (!fileId || !token) return '';
    return fetchDriveBlobUrl(fileId, token);
  }, [accessToken]);

  const selectSong = useCallback(async (indexOrSong, autoplay = false) => {
    const songs = asArray(filteredSongs);
    const nextIndex = typeof indexOrSong === 'object'
      ? songs.findIndex((song) => song?.id === indexOrSong?.id)
      : safeIndex(indexOrSong, songs);

    if (nextIndex < 0 || !songs[nextIndex]) {
      setCurrentSong(null);
      setCurrentIndex(-1);
      return null;
    }

    const song = songs[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentSong(song);

    try {
      if (song.pdfUrl && typeof onSongPdfReady === 'function') {
        onSongPdfReady(song.pdfUrl, song);
      } else if (song.pdfFileId && typeof onSongPdfReady === 'function') {
        const pdfUrl = await getMediaUrl(song.pdfFileId);
        if (pdfUrl) onSongPdfReady(pdfUrl, song);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao carregar PDF da música.');
    }

    try {
      if (song.audioUrl && typeof onSongAudioReady === 'function') {
        onSongAudioReady(song.audioUrl, song, autoplay);
      } else if (song.audioFileId && typeof onSongAudioReady === 'function') {
        const audioUrl = await getMediaUrl(song.audioFileId);
        if (audioUrl) onSongAudioReady(audioUrl, song, autoplay);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao carregar áudio da música.');
    }

    return song;
  }, [filteredSongs, getMediaUrl, onSongAudioReady, onSongPdfReady]);

  const selectNext = useCallback((autoplay = false) => {
    const songs = asArray(filteredSongs);
    if (!songs.length) return null;
    const nextIndex = currentIndex < 0 || currentIndex >= songs.length - 1 ? 0 : currentIndex + 1;
    return selectSong(nextIndex, autoplay);
  }, [currentIndex, filteredSongs, selectSong]);

  const selectPrevious = useCallback((autoplay = false) => {
    const songs = asArray(filteredSongs);
    if (!songs.length) return null;
    const previousIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    return selectSong(previousIndex, autoplay);
  }, [currentIndex, filteredSongs, selectSong]);

  return {
    status,
    STATUS,
    isConfigured,
    pickerConfigured,
    isAuthenticated: hasToken,
    isConnected,
    connected: isConnected,
    accessToken,
    selectedFolder,
    folderId,
    library: filteredSongs,
    songs: filteredSongs,
    files: filteredSongs,
    musicLibrary: filteredSongs,
    filteredSongs,
    currentSong,
    currentIndex,
    selectedSong: currentSong,
    selectedIndex: currentIndex,
    hasSongs: filteredSongs.length > 0,
    isLoading: status === STATUS.LOADING || status === STATUS.AUTHENTICATING,
    loading: status === STATUS.LOADING || status === STATUS.AUTHENTICATING,
    error,
    message,
    connect,
    login: connect,
    logout: disconnect,
    disconnect,
    chooseFolder,
    pickFolder: chooseFolder,
    selectFolder: chooseFolder,
    openPicker: chooseFolder,
    openFolderPicker: chooseFolder,
    clearFolder,
    refreshLibrary,
    reload: refreshLibrary,
    getMediaUrl,
    getAuthorizedMediaUrl: getMediaUrl,
    selectSong,
    selectNext,
    nextSong: selectNext,
    selectPrevious,
    previousSong: selectPrevious,
  };
}

export function useGoogleDrive() {
  return useGoogleDriveLibrary();
}

export default useGoogleDriveLibrary;
