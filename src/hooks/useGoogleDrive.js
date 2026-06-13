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

export function useGoogleDriveLibrary() {
  const [status, setStatus] = useState(STATUS.READY);
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [selectedFolder, setSelectedFolder] = useState(() => getStoredDriveFolder());
  const [library, setLibrary] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const config = useMemo(() => getDriveConfig(), []);
  const isConfigured = isGoogleConfigured();
  const pickerConfigured = isGooglePickerConfigured();
  const hasToken = Boolean(accessToken);
  const folderId = selectedFolder?.id || config.rootFolderId || '';
  const isConnected = Boolean(hasToken && folderId && library.length >= 0 && status === STATUS.CONNECTED);

  useEffect(() => {
    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      setMessage('Configure GOOGLE_CLIENT_ID em public/config.js.');
      return;
    }

    initGoogleAuth({
      onToken: (token) => {
        setAccessToken(token || '');

        if (token) {
          setStatus(getEffectiveFolderId() ? STATUS.AUTHENTICATED : STATUS.NEED_FOLDER);
          setMessage(getEffectiveFolderId()
            ? 'Google autenticado. Carregue a biblioteca.'
            : 'Google autenticado. Escolha uma pasta do Drive.');
        }
      },
    }).then((client) => {
      if (!client) {
        setStatus(STATUS.NOT_CONFIGURED);
        setMessage('Google Identity Services ainda não está disponível.');
        return;
      }

      if (!getEffectiveFolderId()) {
        setStatus(STATUS.NEED_FOLDER);
        setMessage('Escolha uma pasta do Google Drive para carregar as músicas.');
      } else {
        setStatus(STATUS.READY);
        setMessage('Google configurado. Faça login para carregar a biblioteca.');
      }
    });
  }, [isConfigured]);

  const refreshLibrary = useCallback(async ({ nextFolderId } = {}) => {
    const effectiveFolderId = nextFolderId || selectedFolder?.id || config.rootFolderId || '';
    const token = accessToken || getAccessToken();

    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      setMessage('Google Drive não configurado.');
      return [];
    }

    if (!token) {
      setStatus(STATUS.READY);
      setMessage('Faça login no Google Drive para carregar músicas.');
      return [];
    }

    if (!effectiveFolderId) {
      setStatus(STATUS.NEED_FOLDER);
      setMessage('Escolha uma pasta do Google Drive.');
      return [];
    }

    try {
      setStatus(STATUS.LOADING);
      setError('');
      setMessage('Carregando biblioteca do Google Drive...');

      const songs = await loadDriveLibrary({
        folderId: effectiveFolderId,
        token,
      });

      setLibrary(songs);
      setStatus(STATUS.CONNECTED);
      setMessage(songs.length
        ? `${songs.length} música(s) carregada(s) do Google Drive.`
        : 'Pasta carregada, mas nenhum PDF ou áudio compatível foi encontrado.');

      return songs;
    } catch (err) {
      setLibrary([]);
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Erro ao carregar Google Drive.');
      return [];
    }
  }, [accessToken, config.rootFolderId, isConfigured, selectedFolder?.id]);

  const connect = useCallback(async () => {
    if (!isConfigured) {
      setStatus(STATUS.NOT_CONFIGURED);
      setMessage('Configure GOOGLE_CLIENT_ID em public/config.js.');
      return false;
    }

    setStatus(STATUS.AUTHENTICATING);
    setMessage('Aguardando login do Google...');

    return requestAccessToken({ prompt: 'consent' });
  }, [isConfigured]);

  const chooseFolder = useCallback(async () => {
    if (!accessToken && !getAccessToken()) {
      setStatus(STATUS.READY);
      setMessage('Faça login antes de escolher uma pasta.');
      return false;
    }

    if (!pickerConfigured) {
      setStatus(STATUS.NEED_FOLDER);
      setMessage('Google Picker indisponível. Configure GOOGLE_API_KEY.');
      return false;
    }

    return openFolderPicker({
      onPicked: async (folder) => {
        setSelectedFolder(folder);
        setMessage(`Pasta selecionada: ${folder?.name || folder?.id}`);
        await refreshLibrary({ nextFolderId: folder?.id });
      },
    });
  }, [accessToken, pickerConfigured, refreshLibrary]);

  const disconnect = useCallback(async () => {
    await logoutGoogle();
    setAccessToken('');
    setLibrary([]);
    setStatus(isConfigured ? STATUS.READY : STATUS.NOT_CONFIGURED);
    setMessage(isConfigured ? 'Google desconectado.' : 'Google Drive não configurado.');
  }, [isConfigured]);

  const clearFolder = useCallback(() => {
    clearSelectedDriveFolder();
    setSelectedFolder(null);
    setLibrary([]);
    setStatus(hasToken ? STATUS.NEED_FOLDER : STATUS.READY);
    setMessage('Pasta removida. Escolha uma nova pasta do Google Drive.');
  }, [hasToken]);

  const getMediaUrl = useCallback(async (fileId) => {
    const token = accessToken || getAccessToken();

    if (!fileId || !token) {
      return '';
    }

    return fetchDriveBlobUrl(fileId, token);
  }, [accessToken]);

  return {
    status,
    STATUS,
    isConfigured,
    pickerConfigured,
    isAuthenticated: hasToken,
    isConnected,
    accessToken,
    selectedFolder,
    folderId,
    library,
    songs: library,
    files: library,
    musicLibrary: library,
    isLoading: status === STATUS.LOADING || status === STATUS.AUTHENTICATING,
    loading: status === STATUS.LOADING || status === STATUS.AUTHENTICATING,
    error,
    message,
    connect,
    login: connect,
    logout: disconnect,
    disconnect,
    chooseFolder,
    selectFolder: chooseFolder,
    openPicker: chooseFolder,
    openFolderPicker: chooseFolder,
    clearFolder,
    refreshLibrary,
    reload: refreshLibrary,
    getMediaUrl,
    getAuthorizedMediaUrl: getMediaUrl,
  };
}

export function useGoogleDrive() {
  return useGoogleDriveLibrary();
}

export default useGoogleDriveLibrary;
