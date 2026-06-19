import {
  Bell,
  Cloud,
  FileMusic,
  FolderOpen,
  HelpCircle,
  LibraryBig,
  ListMusic,
  LogIn,
  LogOut,
  Music2,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import Library from '../Library/Library.jsx';
import Setlists from '../Setlists/Setlists.jsx';
import { Button } from '../ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
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

  const profileInitial = connected || isLoggedIn ? 'R' : <User size={17} />;

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} onTouchMove={(event) => event.preventDefault()} />
      <nav className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Biblioteca musical" onTouchStart={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.brandBlock}>
            <div className={styles.brandMark} aria-hidden="true">
              <Music2 size={20} />
            </div>
            <div className={styles.brandText}>
              <strong>Playback Cifras</strong>
              <span>Estudo e palco</span>
            </div>
            <span
              className={`${styles.connectionDot} ${connected ? styles.connectionOn : ''}`}
              aria-label={connectionLabel}
              title={connectionLabel}
            />
          </div>

          <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <section className={styles.navSection} aria-label="Produtos">
          <label>Produtos</label>
          <button className={`${styles.navItem} ${styles.navItemActive}`} type="button">
            <LibraryBig size={17} />
            Biblioteca
          </button>
          <button className={styles.navItem} type="button">
            <FileMusic size={17} />
            Modo Estudo
          </button>
          <button className={styles.navItem} type="button">
            <Sparkles size={17} />
            Modo Palco
          </button>
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

        <section className={styles.profileSection} aria-label="Perfil e conta">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className={styles.profileButton} variant="ghost">
                <span className={styles.avatar}>{profileInitial}</span>
                <span className={styles.profileText}>
                  <strong>{connected ? 'raphael.albertini' : isLoggedIn ? 'Conta Google' : 'Perfil'}</strong>
                  <small>{connectionLabel}</small>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className={styles.profileMenu}>
              <DropdownMenuLabel>Perfil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); connected ? onLogout?.() : onLogin?.(); }}>
                {connected ? <LogOut size={16} /> : <LogIn size={16} />}
                {connected ? 'Sair do Google' : 'Entrar com Google'}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canPickFolder} onSelect={(event) => { event.preventDefault(); onPickFolder?.(); }}>
                <FolderOpen size={16} />
                Selecionar pasta do Drive
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Cloud size={16} />
                Offline sincronizado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Settings size={16} />
                Configurações da conta
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell size={16} />
                Notificações
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <HelpCircle size={16} />
                Suporte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className={styles.profileLinks}>
            <span><ListMusic size={14} /> {totalSongs || songs.length} músicas</span>
            <span>{favoriteCount} favoritas</span>
          </div>
        </section>
      </nav>
    </>
  );
}
