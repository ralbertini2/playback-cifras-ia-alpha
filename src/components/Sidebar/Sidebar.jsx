import { FolderOpen, LogIn, LogOut, X } from 'lucide-react';
import { useEffect } from 'react';
import Library from '../Library/Library.jsx';
import Setlists from '../Setlists/Setlists.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar({
  open,
  connected,
  isAuthenticated = false,
  status,
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
  totalSongs = 0,
  clearSearch,
  isFavorite,
  onToggleFavorite,
  onClose,
  onLogin,
  onLogout,
  onPickFolder,
  onSelectSong,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
  loading = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, [open]);

  const normalizedStatus = String(status || '').toLowerCase();

  const isLoggedIn = Boolean(isAuthenticated || connected || [
    'need-folder',
    'authenticated',
    'connected',
    'loading',
  ].includes(normalizedStatus));

  const canPickFolder = Boolean(!loading && isLoggedIn);

  const connectionLabel = connected
    ? 'Google Drive conectado'
    : isLoggedIn
      ? 'Google autenticado'
      : 'Biblioteca local';

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} onTouchMove={(event) => event.preventDefault()} />
      <nav className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Biblioteca musical" onTouchMove={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.brandBlock}>
            <div className={styles.logoWrap}>
              <img className={styles.logo} src={`${import.meta.env.BASE_URL}logo-playback-cifras.jpg`} alt="Playback Cifras" />
              <span
                className={`${styles.connectionDot} ${connected ? styles.connectionOn : ''}`}
                aria-label={connectionLabel}
                title={connectionLabel}
              />
            </div>
          </div>

          <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <section className={styles.section}>
          <label>Google Drive</label>

          <div className={styles.actionsGrid}>
            <button onClick={connected ? onLogout : onLogin} disabled={loading}>
              {connected ? <LogOut size={17} /> : <LogIn size={17} />}
              {connected ? 'Sair' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={onPickFolder}
              disabled={!canPickFolder}
              aria-label="Escolher pasta do Google Drive"
              title={!isLoggedIn ? 'Entre no Google antes de escolher a pasta' : 'Escolher pasta'}
            >
              <FolderOpen size={17} />
              Escolher
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
