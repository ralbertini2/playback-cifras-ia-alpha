import { FolderOpen, LogIn, LogOut, RefreshCcw, X } from 'lucide-react';
import Library from '../Library/Library.jsx';
import Setlists from '../Setlists/Setlists.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar({
  open,
  connected,
  status,
  folderId,
  setFolderId,
  stylesList = [],
  selectedStyle,
  setSelectedStyle,
  playlists = {},
  selectedPlaylist,
  setSelectedPlaylist,
  songs = [],
  currentSongId,
  searchQuery,
  setSearchQuery,
  collectionFilter,
  setCollectionFilter,
  favoriteCount = 0,
  recentCount = 0,
  totalSongs = 0,
  clearSearch,
  isFavorite,
  onToggleFavorite,
  onClose,
  onLogin,
  onLogout,
  onPickFolder,
  onRefresh,
  onSelectSong,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
  loading = false,
}) {
  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} />
      <nav className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Biblioteca musical">
        <div className={styles.header}>
          <div>
            <strong>Playback Cifras IA</strong>
            <span>{connected ? 'Google Drive conectado' : 'Biblioteca local'}</span>
          </div>
          <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className={styles.status}>{status}</div>

        <section className={styles.section}>
          <label>Pasta Google Drive</label>
          <div className={styles.inputRow}>
            <input value={folderId} onChange={(event) => setFolderId(event.target.value)} placeholder="ROOT_FOLDER_ID" />
            <button onClick={onPickFolder} title="Escolher pasta" disabled={loading}><FolderOpen size={18} /></button>
          </div>
          <div className={styles.actionsGrid}>
            <button onClick={connected ? onLogout : onLogin} disabled={loading}>{connected ? <LogOut size={17} /> : <LogIn size={17} />}{connected ? 'Sair' : 'Entrar'}</button>
            <button onClick={onRefresh} disabled={loading}><RefreshCcw size={17} />{loading ? 'Carregando' : 'Atualizar'}</button>
          </div>
        </section>

        <section className={styles.section}>
          <label>Estilo</label>
          <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
            <option value="">Todos os estilos</option>
            {stylesList.map((style) => <option key={style} value={style}>{style}</option>)}
          </select>
        </section>

        <Setlists
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          setSelectedPlaylist={setSelectedPlaylist}
          onCreatePlaylist={onCreatePlaylist}
          onAddToPlaylist={onAddToPlaylist}
          onDeletePlaylist={onDeletePlaylist}
        />

        <Library
          songs={songs}
          currentSongId={currentSongId}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          collectionFilter={collectionFilter}
          setCollectionFilter={setCollectionFilter}
          favoriteCount={favoriteCount}
          recentCount={recentCount}
          totalSongs={totalSongs}
          clearSearch={clearSearch}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onSelectSong={onSelectSong}
        />
      </nav>
    </>
  );
}
