import { useCallback, useMemo, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import Toolbar from '../components/Toolbar/Toolbar.jsx';
import PdfViewer from '../components/PdfViewer/PdfViewer.jsx';
import PlayerBar from '../components/PlayerBar/PlayerBar.jsx';
import VersionFooter from '../components/VersionFooter/VersionFooter.jsx';
import { useAudioPlayer } from '../hooks/useAudioPlayer.js';
import { useGoogleDriveLibrary } from '../hooks/useGoogleDrive.js';
import { useLibrary } from '../hooks/useLibrary.js';
import { STORAGE, readJson, writeJson } from '../services/storage.js';
import styles from './App.module.css';

function songKey(song) {
  return `${song?.styleId || song?.style}|${song?.title}`;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [playlists, setPlaylists] = useState(() => readJson(STORAGE.playlists, {}));
  const [selectedPlaylist, setSelectedPlaylist] = useState(localStorage.getItem(STORAGE.activePlaylist) || '');
  const audio = useAudioPlayer();
  const libraryView = useLibrary();

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 3000);
  }, []);

  const drive = useGoogleDriveLibrary({
    onSongAudioReady: audio.setSource,
    onNotify: notify,
  });

  const filteredSongs = useMemo(() => {
    const baseSongs = libraryView.applyFilters(drive.filteredSongs);
    const playlistKeys = selectedPlaylist ? playlists[selectedPlaylist] || [] : null;
    if (!playlistKeys) return baseSongs;
    return baseSongs.filter((song) => playlistKeys.includes(songKey(song)));
  }, [drive.filteredSongs, libraryView, playlists, selectedPlaylist]);

  const currentSong = drive.currentSong;
  const meta = currentSong
    ? `${currentSong.style} • ${drive.currentIndex + 1} de ${filteredSongs.length || drive.filteredSongs.length}`
    : drive.connected
      ? 'Google Drive conectado • selecione uma música'
      : 'Conecte o Google Drive para carregar PDFs e playbacks';

  function selectSong(index, autoplay = false) {
    const song = filteredSongs[index];
    if (!song) return;
    const realIndex = drive.filteredSongs.findIndex((item) => item.id === song.id);
    drive.selectSong(realIndex >= 0 ? realIndex : index, autoplay);
    libraryView.rememberRecent(song);
    setSidebarOpen(false);
  }

  function previousSong() {
    if (!filteredSongs.length) return;
    const currentFilteredIndex = filteredSongs.findIndex((song) => song.id === currentSong?.id);
    const nextIndex = currentFilteredIndex <= 0 ? filteredSongs.length - 1 : currentFilteredIndex - 1;
    selectSong(nextIndex, false);
  }

  function nextSong() {
    if (!filteredSongs.length) return;
    const currentFilteredIndex = filteredSongs.findIndex((song) => song.id === currentSong?.id);
    const nextIndex = currentFilteredIndex < 0 || currentFilteredIndex >= filteredSongs.length - 1 ? 0 : currentFilteredIndex + 1;
    selectSong(nextIndex, false);
  }

  function createPlaylist() {
    const name = prompt('Nome da playlist/evento:');
    if (!name?.trim()) return;
    const next = { ...playlists, [name.trim()]: playlists[name.trim()] || [] };
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist(name.trim());
    localStorage.setItem(STORAGE.activePlaylist, name.trim());
  }

  function addToPlaylist() {
    if (!currentSong) {
      notify('Selecione uma música primeiro.');
      return;
    }
    let name = selectedPlaylist;
    if (!name) name = prompt('Adicionar a qual playlist?');
    if (!name?.trim()) return;
    const cleanName = name.trim();
    const key = songKey(currentSong);
    const list = playlists[cleanName] || [];
    const next = { ...playlists, [cleanName]: list.includes(key) ? list : [...list, key] };
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist(cleanName);
    localStorage.setItem(STORAGE.activePlaylist, cleanName);
    notify('Música adicionada ao repertório.');
  }

  function deletePlaylist() {
    if (!selectedPlaylist) {
      notify('Selecione um repertório para excluir.');
      return;
    }
    if (!confirm(`Excluir o repertório "${selectedPlaylist}" deste dispositivo?`)) return;
    const next = { ...playlists };
    delete next[selectedPlaylist];
    setPlaylists(next);
    writeJson(STORAGE.playlists, next);
    setSelectedPlaylist('');
    localStorage.removeItem(STORAGE.activePlaylist);
  }

  function changePlaylist(value) {
    setSelectedPlaylist(value);
    localStorage.setItem(STORAGE.activePlaylist, value);
  }

  function toggleCurrentFavorite() {
    if (!currentSong) {
      notify('Selecione uma música primeiro.');
      return;
    }
    const becameFavorite = libraryView.toggleFavorite(currentSong);
    notify(becameFavorite ? 'Música adicionada aos favoritos.' : 'Música removida dos favoritos.');
  }

  function toggleSongFavorite(song) {
    const becameFavorite = libraryView.toggleFavorite(song);
    notify(becameFavorite ? 'Música adicionada aos favoritos.' : 'Música removida dos favoritos.');
  }

  return (
    <AppLayout
      sidebar={(
        <Sidebar
          open={sidebarOpen}
          connected={drive.connected}
          status={drive.loadingLibrary ? 'Atualizando biblioteca...' : drive.status}
          folderId={drive.folderId}
          setFolderId={drive.setFolderId}
          stylesList={drive.styleList}
          selectedStyle={drive.selectedStyle}
          setSelectedStyle={drive.setSelectedStyle}
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={changePlaylist}
          songs={filteredSongs}
          currentSongId={currentSong?.id}
          searchQuery={libraryView.searchQuery}
          setSearchQuery={libraryView.setSearchQuery}
          collectionFilter={libraryView.collectionFilter}
          setCollectionFilter={libraryView.setCollectionFilter}
          favoriteCount={libraryView.favoriteCount}
          recentCount={libraryView.recentCount}
          isFavorite={libraryView.isFavorite}
          onToggleFavorite={toggleSongFavorite}
          loading={drive.loadingLibrary || drive.loadingSong}
          onClose={() => setSidebarOpen(false)}
          onLogin={drive.login}
          onLogout={drive.logout}
          onPickFolder={drive.pickFolder}
          onRefresh={drive.refreshLibrary}
          onSelectSong={selectSong}
          onCreatePlaylist={createPlaylist}
          onAddToPlaylist={addToPlaylist}
          onDeletePlaylist={deletePlaylist}
        />
      )}
      toolbar={<Toolbar song={currentSong} meta={meta} onOpenMenu={() => setSidebarOpen(true)} loading={drive.loadingLibrary || drive.loadingSong} favoriteActive={libraryView.isFavorite(currentSong)} onToggleFavorite={toggleCurrentFavorite} />}
      viewer={<PdfViewer source={drive.pdfUrl} title={currentSong?.title || 'Exemplo de cifra em PDF'} />}
      player={(
        <PlayerBar
          audioRef={audio.audioRef}
          title={currentSong?.title || ''}
          hasSource={audio.hasSource}
          isPlaying={audio.isPlaying}
          currentTimeLabel={audio.currentTimeLabel}
          durationLabel={audio.durationLabel}
          progress={audio.progress}
          volume={audio.volume}
          muted={audio.muted}
          onToggle={audio.toggle}
          onSeek={audio.seek}
          onSeekBack={() => audio.seekBy(-10)}
          onSeekForward={() => audio.seekBy(10)}
          onPrevious={previousSong}
          onNext={nextSong}
          onVolumeChange={audio.setVolume}
          onToggleMute={audio.toggleMute}
        />
      )}
      footer={<VersionFooter />}
      toast={toast ? <div className={styles.toast}>{toast}</div> : null}
    />
  );
}
