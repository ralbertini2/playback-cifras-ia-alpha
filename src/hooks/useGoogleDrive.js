import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAuthorizedMediaUrl,
  initGoogleAuth,
  loadDriveLibrary,
  logoutGoogle,
  openFolderPicker,
  requestAccessToken,
} from '../services/googleDriveService.js';
import { STORAGE, readJson } from '../services/storage.js';

const SAMPLE_PDF_URL = `${import.meta.env.BASE_URL}samples/sample-cifra.pdf`;

function getInitialFolderId() {
  return localStorage.getItem(STORAGE.folder) || window.APP_CONFIG?.ROOT_FOLDER_ID || '';
}

function buildStyleList(library) {
  return [...new Set(library.map((song) => song.style).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function useGoogleDriveLibrary({ onSongAudioReady, onNotify } = {}) {
  const [connected, setConnected] = useState(localStorage.getItem(STORAGE.connected) === '1');
  const [status, setStatus] = useState('Inicializando Google Drive...');
  const [folderId, setFolderId] = useState(getInitialFolderId);
  const [library, setLibrary] = useState(() => readJson(STORAGE.library, []));
  const [selectedStyle, setSelectedStyle] = useState(localStorage.getItem(STORAGE.style) || '');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [pdfUrl, setPdfUrl] = useState(SAMPLE_PDF_URL);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false);

  const notify = useCallback((message) => {
    if (typeof onNotify === 'function') onNotify(message);
  }, [onNotify]);

  useEffect(() => {
    initGoogleAuth()
      .then(() => setStatus(connected ? 'Google Drive conectado.' : 'Google Drive desconectado.'))
      .catch((error) => setStatus(error.message));
  }, [connected]);

  useEffect(() => {
    localStorage.setItem(STORAGE.style, selectedStyle);
  }, [selectedStyle]);

  const styleList = useMemo(() => buildStyleList(library), [library]);

  const filteredSongs = useMemo(() => {
    return library.filter((song) => !selectedStyle || song.style === selectedStyle);
  }, [library, selectedStyle]);

  const currentSong = filteredSongs[currentIndex] || null;

  const login = useCallback(async () => {
    try {
      await requestAccessToken('consent');
      setConnected(true);
      setStatus('Google Drive conectado.');
      notify('Login Google realizado.');
      return true;
    } catch (error) {
      setStatus(error.message);
      notify('Não foi possível concluir o login Google.');
      return false;
    }
  }, [notify]);

  const logout = useCallback(() => {
    logoutGoogle();
    setConnected(false);
    setStatus('Google Drive desconectado.');
    notify('Sessão Google encerrada.');
  }, [notify]);

  const refreshLibrary = useCallback(async () => {
    try {
      setLoadingLibrary(true);
      if (!connected) {
        const logged = await login();
        if (!logged) return;
      }
      setStatus('Atualizando biblioteca do Google Drive...');
      const nextLibrary = await loadDriveLibrary(folderId);
      setLibrary(nextLibrary);
      setCurrentIndex(nextLibrary.length ? 0 : -1);
      setStatus(`Biblioteca atualizada: ${nextLibrary.length} música(s).`);
      notify(`Biblioteca atualizada: ${nextLibrary.length} música(s).`);
    } catch (error) {
      setStatus(error.message);
      notify(error.message);
    } finally {
      setLoadingLibrary(false);
    }
  }, [connected, folderId, login, notify]);

  const pickFolder = useCallback(async () => {
    try {
      if (!connected) {
        const logged = await login();
        if (!logged) return;
      }
      openFolderPicker((folder) => {
        setFolderId(folder.id);
        localStorage.setItem(STORAGE.folder, folder.id);
        notify(`Pasta selecionada: ${folder.name}`);
      });
    } catch (error) {
      notify(error.message);
    }
  }, [connected, login, notify]);

  const selectSong = useCallback(async (index, autoplay = false) => {
    const song = filteredSongs[index];
    if (!song) return;

    setCurrentIndex(index);
    setLoadingSong(true);
    setPdfUrl('');

    try {
      const pdfBlobUrl = await getAuthorizedMediaUrl(song.pdfId);
      setPdfUrl(pdfBlobUrl);
    } catch (error) {
      setPdfUrl(SAMPLE_PDF_URL);
      notify('Não consegui carregar o PDF do Drive. Exibindo PDF de exemplo.');
    }

    try {
      const audioUrl = await getAuthorizedMediaUrl(song.mp3Id);
      if (typeof onSongAudioReady === 'function') onSongAudioReady(audioUrl, autoplay);
    } catch (error) {
      notify('PDF aberto. Não consegui carregar o áudio.');
    } finally {
      setLoadingSong(false);
    }
  }, [filteredSongs, notify, onSongAudioReady]);

  const previousSong = useCallback(() => {
    if (!filteredSongs.length) return;
    selectSong((currentIndex - 1 + filteredSongs.length) % filteredSongs.length, false);
  }, [currentIndex, filteredSongs.length, selectSong]);

  const nextSong = useCallback(() => {
    if (!filteredSongs.length) return;
    selectSong((currentIndex + 1) % filteredSongs.length, false);
  }, [currentIndex, filteredSongs.length, selectSong]);

  return {
    connected,
    status,
    folderId,
    setFolderId,
    library,
    styleList,
    selectedStyle,
    setSelectedStyle,
    filteredSongs,
    currentSong,
    currentIndex,
    pdfUrl,
    loadingLibrary,
    loadingSong,
    login,
    logout,
    refreshLibrary,
    pickFolder,
    selectSong,
    previousSong,
    nextSong,
  };
}
