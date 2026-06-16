import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearSelectedDriveFolder,
  fetchDriveBlobUrl,
  fetchDrivePdfData,
  fetchDriveTextDocument,
  getAccessToken,
  getDriveConfig,
  getEffectiveFolderId,
  getStoredDriveFolder,
  hasStoredDriveSession,
  initGoogleAuth,
  isGoogleConfigured,
  isGooglePickerConfigured,
  loadDriveLibrary,
  ensureGooglePickerReady,
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
  const [selectedStyle, setSelectedStyle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSong, setCurrentSong] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loadingSong, setLoadingSong] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const selectionRequestRef = useRef(0);
  const autoRefreshKeyRef = useRef('');
  const autoOpenPickerAfterLoginRef = useRef(false);

  const config = useMemo(() => getDriveConfig(), []);
  const isConfigured = isGoogleConfigured();
  const pickerConfigured = isGooglePickerConfigured();
  const hasToken = Boolean(accessToken);
  const folderId = selectedFolder?.id || config.rootFolderId || '';
  const styleList = useMemo(() => Array.from(new Set(asArray(library).map((song) => song?.style).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR')), [library]);
  const filteredSongs = useMemo(() => {
    const songs = asArray(library);
    if (!selectedStyle) return songs;
    return songs.filter((song) => song?.style === selectedStyle);
  }, [library, selectedStyle]);
  const isConnected = Boolean(hasToken && folderId && status === STATUS.CONNECTED);

  const notify = useCallback((text) => {
    setMessage(text || '');
    if (typeof onNotify === 'function') onNotify(text || '');
  }, [onNotify]);


  const clearCurrentMedia = useCallback(() => {
    setPdfUrl('');
    setAudioUrl('');

    if (typeof onSongPdfReady === 'function') {
      onSongPdfReady('', null);
    }

    if (typeof onSongAudioReady === 'function') {
      onSongAudioReady('', null, false);
    }
  }, [onSongAudioReady, onSongPdfReady]);

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

      const token = getAccessToken();
      const effectiveFolderId = getEffectiveFolderId();

      if (token) {
        setAccessToken(token);
        setStatus(effectiveFolderId ? STATUS.AUTHENTICATED : STATUS.NEED_FOLDER);
        notify(effectiveFolderId
          ? 'Google autenticado. Carregando biblioteca...'
          : 'Google autenticado. Escolha uma pasta do Drive.');
        return;
      }

      if (hasStoredDriveSession()) {
        setStatus(STATUS.AUTHENTICATING);
        notify('Restaurando conexão com o Google Drive...');
        requestAccessToken({
          prompt: '',
          onToken: (restoredToken) => {
            if (cancelled) return;
            setAccessToken(restoredToken || '');
            if (restoredToken) {
              setStatus(effectiveFolderId ? STATUS.AUTHENTICATED : STATUS.NEED_FOLDER);
              notify(effectiveFolderId
                ? 'Google Drive reconectado. Carregando biblioteca...'
                : 'Google Drive reconectado. Escolha uma pasta.');
            } else {
              setStatus(STATUS.READY);
              notify('Faça login no Google Drive para carregar músicas.');
            }
          },
        });
        return;
      }

      if (!effectiveFolderId) {
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
  }, [clearCurrentMedia, isConfigured, notify]);

  const refreshLibrary = useCallback(async ({ nextFolderId } = {}) => {
    const effectiveFolderId = nextFolderId || selectedFolder?.id || config.rootFolderId || '';
    const token = accessToken || getAccessToken();

    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      notify('Google Drive não configurado.');
      setLibrary([]);
      setSelectedStyle('');
      setCurrentSong(null);
      setCurrentIndex(-1);
      clearCurrentMedia();
      return [];
    }

    if (!token) {
      setStatus(STATUS.READY);
      notify('Faça login no Google Drive para carregar músicas.');
      setLibrary([]);
      setSelectedStyle('');
      setCurrentSong(null);
      setCurrentIndex(-1);
      clearCurrentMedia();
      return [];
    }

    if (!effectiveFolderId) {
      setStatus(STATUS.NEED_FOLDER);
      notify('Escolha uma pasta do Google Drive.');
      setLibrary([]);
      setSelectedStyle('');
      setCurrentSong(null);
      setCurrentIndex(-1);
      clearCurrentMedia();
      return [];
    }

    try {
      setStatus(STATUS.LOADING);
      setError('');
      notify('Carregando biblioteca do Google Drive...');
      const songs = asArray(await loadDriveLibrary({ folderId: effectiveFolderId, token }));
      setLibrary(songs);
      setSelectedStyle((currentStyle) => {
        if (!currentStyle) return '';
        return songs.some((song) => song?.style === currentStyle) ? currentStyle : '';
      });
      if (!songs.length) {
        setCurrentSong(null);
        setCurrentIndex(-1);
        clearCurrentMedia();
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
      setSelectedStyle('');
      setCurrentSong(null);
      setCurrentIndex(-1);
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Erro ao carregar Google Drive.');
      return [];
    }
  }, [accessToken, clearCurrentMedia, config.rootFolderId, currentIndex, isConfigured, notify, selectedFolder?.id]);


  useEffect(() => {
    const token = accessToken || getAccessToken();
    const effectiveFolderId = selectedFolder?.id || config.rootFolderId || '';

    if (!token || !effectiveFolderId || status === STATUS.LOADING || status === STATUS.CONNECTED) return;

    const refreshKey = `${token.slice(0, 12)}:${effectiveFolderId}`;
    if (autoRefreshKeyRef.current === refreshKey) return;

    autoRefreshKeyRef.current = refreshKey;
    refreshLibrary({ nextFolderId: effectiveFolderId });
  }, [accessToken, config.rootFolderId, refreshLibrary, selectedFolder?.id, status]);

  const handleTokenReady = useCallback((token) => {
    const nextToken = token || getAccessToken();
    const effectiveFolderId = selectedFolder?.id || config.rootFolderId || '';

    if (!nextToken) {
      setStatus(STATUS.READY);
      notify('Não foi possível autenticar no Google.');
      return;
    }

    setAccessToken(nextToken);
    setStatus(effectiveFolderId ? STATUS.AUTHENTICATED : STATUS.NEED_FOLDER);
    notify(effectiveFolderId
      ? 'Google autenticado. Carregando biblioteca...'
      : 'Google autenticado. Escolha uma pasta do Drive.');

    ensureGooglePickerReady().catch((err) => {
      console.warn('[Playback Cifras IA] Picker ainda não disponível.', err);
    });
  }, [config.rootFolderId, notify, selectedFolder?.id]);

  const connect = useCallback(async () => {
    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      notify('Configure GOOGLE_CLIENT_ID em public/config.js.');
      return false;
    }
    autoOpenPickerAfterLoginRef.current = true;
    setStatus(STATUS.AUTHENTICATING);
    notify('Aguardando login do Google...');
    return requestAccessToken({ prompt: 'consent', onToken: handleTokenReady });
  }, [handleTokenReady, isConfigured, notify]);

  const chooseFolder = useCallback(async () => {
    const token = accessToken || getAccessToken();

    if (!token) {
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
      setStatus((currentStatus) => (currentStatus === STATUS.AUTHENTICATING ? STATUS.NEED_FOLDER : currentStatus));
      notify('Abrindo seletor de pasta do Google Drive...');
      await ensureGooglePickerReady();

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



  useEffect(() => {
    const token = accessToken || getAccessToken();
    const effectiveFolderId = selectedFolder?.id || config.rootFolderId || '';

    if (!token || effectiveFolderId || !autoOpenPickerAfterLoginRef.current) return;
    if (status === STATUS.LOADING || status === STATUS.AUTHENTICATING) return;

    autoOpenPickerAfterLoginRef.current = false;
    window.setTimeout(() => {
      chooseFolder();
    }, 250);
  }, [accessToken, chooseFolder, config.rootFolderId, selectedFolder?.id, status]);

  const disconnect = useCallback(async () => {
    await logoutGoogle();
    setAccessToken('');
    setLibrary([]);
    setSelectedStyle('');
    setCurrentSong(null);
    setCurrentIndex(-1);
    setStatus(isConfigured ? STATUS.READY : STATUS.NOT_CONFIGURED);
    notify(isConfigured ? 'Google desconectado.' : 'Google Drive não configurado.');
  }, [isConfigured, notify]);

  const clearFolder = useCallback(() => {
    clearSelectedDriveFolder();
    setSelectedFolder(null);
    setLibrary([]);
    setSelectedStyle('');
    setCurrentSong(null);
    setCurrentIndex(-1);
    setStatus(hasToken ? STATUS.NEED_FOLDER : STATUS.READY);
    notify('Pasta removida. Escolha uma nova pasta do Google Drive.');
  }, [clearCurrentMedia, hasToken, notify]);

  const getMediaUrl = useCallback(async (fileId) => {
    const token = accessToken || getAccessToken();
    if (!fileId || !token) return '';
    return fetchDriveBlobUrl(fileId, token);
  }, [accessToken]);

  const getPdfSource = useCallback(async (fileId) => {
    const token = accessToken || getAccessToken();
    if (!fileId || !token) return '';
    return fetchDrivePdfData(fileId, token);
  }, [accessToken]);

  const getDocumentSource = useCallback(async (song) => {
    const token = accessToken || getAccessToken();
    if (!song?.documentFileId || !token) return '';

    if (song.pdfFileId && song.documentFileId === song.pdfFileId) {
      return fetchDrivePdfData(song.pdfFileId, token);
    }

    const documentData = await fetchDriveTextDocument(song.documentFileId, song.documentMimeType, token);
    return {
      ...(documentData || {}),
      title: song.title,
      fileName: song.documentName || song.fileName,
    };
  }, [accessToken]);

  const selectSong = useCallback(async (indexOrSong, autoplay = false) => {
    const requestId = selectionRequestRef.current + 1;
    selectionRequestRef.current = requestId;

    const songs = asArray(filteredSongs);
    const nextIndex = typeof indexOrSong === 'object'
      ? songs.findIndex((song) => song?.id === indexOrSong?.id)
      : safeIndex(indexOrSong, songs);

    if (nextIndex < 0 || !songs[nextIndex]) {
      setCurrentSong(null);
      setCurrentIndex(-1);
      clearCurrentMedia();
      return null;
    }

    const isCurrentRequest = () => selectionRequestRef.current === requestId;
    const song = songs[nextIndex];

    setCurrentIndex(nextIndex);
    setCurrentSong(song);
    setLoadingSong(true);
    setError('');
    clearCurrentMedia();

    try {
      let nextPdfSource = song.pdfUrl || '';

      if (!nextPdfSource && song.documentFileId) {
        nextPdfSource = await getDocumentSource(song);
      } else if (!nextPdfSource && song.pdfFileId) {
        nextPdfSource = await getPdfSource(song.pdfFileId);
      }

      if (!isCurrentRequest()) return null;

      if (nextPdfSource) {
        setPdfUrl(nextPdfSource);

        if (typeof onSongPdfReady === 'function') {
          onSongPdfReady(nextPdfSource, song);
        }
      }
    } catch (err) {
      if (isCurrentRequest()) {
        setError(err?.message || 'Erro ao carregar PDF da música.');
      }
    }

    try {
      let nextAudioUrl = song.audioUrl || '';

      if (!nextAudioUrl && song.audioFileId) {
        nextAudioUrl = await getMediaUrl(song.audioFileId);
      }

      if (!isCurrentRequest()) return null;

      if (nextAudioUrl) {
        setAudioUrl(nextAudioUrl);

        if (typeof onSongAudioReady === 'function') {
          onSongAudioReady(nextAudioUrl, song, autoplay);
        }
      }
    } catch (err) {
      if (isCurrentRequest()) {
        setError(err?.message || 'Erro ao carregar áudio da música.');
      }
    } finally {
      if (isCurrentRequest()) {
        setLoadingSong(false);
      }
    }

    return song;
  }, [clearCurrentMedia, filteredSongs, getDocumentSource, getMediaUrl, getPdfSource, onSongAudioReady, onSongPdfReady]);

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
    styleList,
    selectedStyle,
    setSelectedStyle,
    songs: filteredSongs,
    files: filteredSongs,
    musicLibrary: filteredSongs,
    filteredSongs,
    currentSong,
    currentIndex,
    pdfUrl,
    audioUrl,
    selectedSong: currentSong,
    selectedIndex: currentIndex,
    hasSongs: filteredSongs.length > 0,
    loadingSong,
    loadingLibrary: status === STATUS.LOADING,
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
