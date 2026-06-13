import { FolderOpen, LogIn, LogOut, RefreshCw, X } from 'lucide-react';
import Library from '../Library/Library.jsx';
import Setlists from '../Setlists/Setlists.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar({
  open,
  connected,
  status,
  folderId,
  setFolderId,
  styleList = [],
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
  const normalizedStatus = String(status || '').toLowerCase();

  const canPickFolder = !loading && [
    'need-folder',
    'authenticated',
    'connected',
  ].includes(normalizedStatus);

  const isLoggedIn = connected || [
    'need-folder',
    'authenticated',
    'connected',
    'loading',
  ].includes(normalizedStatus);

  const folderLabel = folderId
    ? 'Pasta selecionada'
    : isLoggedIn
      ? 'Escolha a pasta raiz do repertório'
      : 'Entre no Google para escolher a pasta';

  const headerStatus = connected
    ? 'Google Drive conectado'
    : isLoggedIn
      ? 'Google autenticado'
      : 'Biblioteca local';

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} />
      <nav className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Biblioteca musical">
        <div className={styles.header}>
          <div>
            <strong>Playback Cifras IA</strong>
            <span>{headerStatus}</span>
          </div>

          <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className={styles.status}>{status}</div>

        <section className={styles.section}>
          <label>Pasta Google Drive</label>

          <div className={styles.folderCard}>
            <div className={styles.folderInfo}>
              <strong>{folderLabel}</strong>
              <span>{folderId || 'Nenhuma pasta selecionada'}</span>
            </div>

            <button
              type="button"
              className={styles.folderButton}
              onClick={onPickFolder}
              disabled={loading || !canPickFolder}
              aria-label="Escolher pasta do Google Drive"
              title={!isLoggedIn ? 'Entre no Google antes de escolher a pasta' : 'Escolher pasta'}
            >
              <FolderOpen size={18} />
              <span>Escolher</span>
            </button>
          </div>

          <div className={styles.actionsGrid}>
            <button onClick={connected ? onLogout : onLogin} disabled={loading}>
              {connected ? <LogOut size={17} /> : <LogIn size={17} />}
              {connected ? 'Sair' : 'Entrar'}
            </button>

            <button onClick={onRefresh} disabled={loading}>
              <RefreshCw size={17} />
              Atualizar
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <label>Estilo</label>
          <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
            <option value="">Todos os estilos</option>
            {styleList.map((style) => <option key={style} value={style}>{style}</option>)}
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
