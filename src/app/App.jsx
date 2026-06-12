import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import Toolbar from '../components/Toolbar/Toolbar.jsx';
import PdfViewer from '../components/PdfViewer/PdfViewer.jsx';
import PlayerBar from '../components/PlayerBar/PlayerBar.jsx';
import VersionFooter from '../components/VersionFooter/VersionFooter.jsx';
import { useAudioPlayer } from '../hooks/useAudioPlayer.js';
import { STORAGE, readJson, writeJson } from '../services/storage.js';
import { getAuthorizedMediaUrl, initGoogleAuth, loadDriveLibrary, logoutGoogle, openFolderPicker, requestAccessToken } from '../services/googleDriveService.js';
import styles from './App.module.css';

function songKey(song) { return `${song?.styleId || song?.style}|${song?.title}`; }

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connected, setConnected] = useState(localStorage.getItem(STORAGE.connected) === '1');
  const [status, setStatus] = useState('Inicializando Google Drive...');
  const [folderId, setFolderId] = useState(localStorage.getItem(STORAGE.folder) || window.APP_CONFIG?.ROOT_FOLDER_ID || '');
  const [library, setLibrary] = useState(() => readJson(STORAGE.library, []));
  const [selectedStyle, setSelectedStyle] = useState(localStorage.getItem(STORAGE.style) || '');
  const [playlists, setPlaylists] = useState(() => readJson(STORAGE.playlists, {}));
  const [selectedPlaylist, setSelectedPlaylist] = useState(localStorage.getItem(STORAGE.activePlaylist) || '');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const samplePdfUrl = `${import.meta.env.BASE_URL}samples/sample-cifra.pdf`;
  const [pdfUrl, setPdfUrl] = useState(samplePdfUrl);
  const [toast, setToast] = useState('');
  const audio = useAudioPlayer();

  useEffect(() => {
    initGoogleAuth()
      .then(() => setStatus(connected ? 'Google conectado.' : 'Desconectado.'))
      .catch((error) => setStatus(error.message));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE.style, selectedStyle); }, [selectedStyle]);
  useEffect(() => { localStorage.setItem(STORAGE.activePlaylist, selectedPlaylist); }, [selectedPlaylist]);

  const styleList = useMemo(() => [...new Set(library.map((song) => song.style))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [library]);

  const filteredSongs = useMemo(() => {
    const playlistKeys = selectedPlaylist ? playlists[selectedPlaylist] || [] : null;
    return library.filter((song) => {
      const styleOk = !selectedStyle || song.style === selectedStyle;
      const playlistOk = !playlistKeys || playlistKeys.includes(songKey(song));
      return styleOk && playlistOk;
    });
  }, [library, selectedStyle, playlists, selectedPlaylist]);

  const currentSong = filteredSongs[currentIndex] || null;
  const meta = currentSong ? `${currentSong.style} • ${currentIndex + 1} de ${filteredSongs.length}` : '';

  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 3000);
  }

  async function login() {
    try {
      await requestAccessToken('consent');
      setConnected(true);
      setStatus('Google conectado.');
      notify('Login Google realizado.');
    } catch (error) {
      setStatus(error.message);
      notify('Não foi possível concluir o login Google.');
    }
  }

  function logout() {
    logoutGoogle();
    setConnected(false);
    setStatus('Desconectado.');
    notify('Sessão Google encerrada.');
  }

  async function refreshLibrary() {
    try {
      if (!connected) await login();
      setStatus('Atualizando biblioteca...');
      const nextLibrary = await loadDriveLibrary(folderId);
      setLibrary(nextLibrary);
      setCurrentIndex(nextLibrary.length ? 0 : -1);
      setStatus(`Biblioteca atualizada: ${nextLibrary.length} música(s).`);
      notify(`Biblioteca atualizada: ${nextLibrary.length} música(s).`);
    } catch (error) {
      setStatus(error.message);
      notify(error.message);
    }
  }

  async function pickFolder() {
    try {
      if (!connected) await login();
      openFolderPicker((folder) => {
        setFolderId(folder.id);
        localStorage.setItem(STORAGE.folder, folder.id);
        notify(`Pasta selecionada: ${folder.name}`);
      });
    } catch (error) {
      notify(error.message);
    }
  }

  async function selectSong(index, autoplay = false) {
    const song = filteredSongs[index];
    if (!song) return;
    setCurrentIndex(index);
    setPdfUrl('');
    try {
      const pdfBlobUrl = await getAuthorizedMediaUrl(song.pdfId);
      setPdfUrl(pdfBlobUrl);
    } catch (error) {
      setPdfUrl(samplePdfUrl);
      notify('Não consegui carregar o PDF do Drive. Exibindo PDF de exemplo.');
    }
    setSidebarOpen(false);
    try {
      const mediaUrl = await getAuthorizedMediaUrl(song.mp3Id);
      audio.setSource(mediaUrl, autoplay);
    } catch (error) {
      notify('PDF aberto. Não consegui carregar o áudio.');
    }
  }

  function previousSong() {
    if (!filteredSongs.length) return;
    selectSong((currentIndex - 1 + filteredSongs.length) % filteredSongs.length, false);
  }

  function nextSong() {
    if (!filteredSongs.length) return;
    selectSong((currentIndex + 1) % filteredSongs.length, false);
  }

  function createPlaylist() {
    const name = prompt('Nome da playlist/evento:');
    if (!name?.trim()) return;
    const next = { ...playlists, [name.trim()]: playlists[name.trim()] || [] };
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist(name.trim());
  }

  function addToPlaylist() {
    if (!currentSong) { notify('Selecione uma música primeiro.'); return; }
    let name = selectedPlaylist;
    if (!name) name = prompt('Adicionar a qual playlist?');
    if (!name?.trim()) return;
    const key = songKey(currentSong);
    const list = playlists[name] || [];
    const next = { ...playlists, [name]: list.includes(key) ? list : [...list, key] };
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist(name);
    notify('Música adicionada à playlist.');
  }

  function deletePlaylist() {
    if (!selectedPlaylist) { notify('Selecione uma playlist para excluir.'); return; }
    if (!confirm(`Excluir a playlist "${selectedPlaylist}" deste dispositivo?`)) return;
    const next = { ...playlists };
    delete next[selectedPlaylist];
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist('');
  }

  return (
    <AppLayout
      sidebar={(
        <Sidebar
          open={sidebarOpen}
          connected={connected}
          status={status}
          folderId={folderId}
          setFolderId={setFolderId}
          stylesList={styleList}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          songs={filteredSongs}
          currentSongId={currentSong?.id}
          onClose={() => setSidebarOpen(false)}
          onLogin={login}
          onLogout={logout}
          onPickFolder={pickFolder}
          onRefresh={refreshLibrary}
          onSelectSong={selectSong}
          onCreatePlaylist={createPlaylist}
          onAddToPlaylist={addToPlaylist}
          onDeletePlaylist={deletePlaylist}
        />
      )}
      toolbar={<Toolbar song={currentSong} meta={meta} onOpenMenu={() => setSidebarOpen(true)} />}
      viewer={<PdfViewer source={pdfUrl} title={currentSong?.title || 'Exemplo de cifra em PDF'} />}
      player={(
        <PlayerBar
          audioRef={audio.audioRef}
          isPlaying={audio.isPlaying}
          currentTimeLabel={audio.currentTimeLabel}
          durationLabel={audio.durationLabel}
          progress={audio.progress}
          onToggle={audio.toggle}
          onSeek={audio.seek}
          onPrevious={previousSong}
          onNext={nextSong}
        />
      )}
      footer={<VersionFooter />}
      toast={toast ? <div className={styles.toast}>{toast}</div> : null}
    />
  );
}
