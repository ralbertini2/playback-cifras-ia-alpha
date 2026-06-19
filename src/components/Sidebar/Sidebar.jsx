import {
  Bell,
  Cloud,
  Database,
  FileMusic,
  FolderOpen,
  HelpCircle,
  LibraryBig,
  ListMusic,
  LogIn,
  LogOut,
  Music2,
  RefreshCw,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Library from '../Library/Library.jsx';
import Setlists from '../Setlists/Setlists.jsx';
import { Button } from '../ui/button.jsx';
import { Combobox } from '../ui/combobox.jsx';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet.jsx';
import styles from './Sidebar.module.css';

function readableStatus(status, connected, isLoggedIn, loading) {
  if (loading) return 'Sincronizando biblioteca';
  if (connected) return 'Biblioteca carregada';
  if (String(status || '').toLowerCase() === 'need-folder') return 'Escolha uma pasta';
  if (isLoggedIn) return 'Google autenticado';
  return 'Credenciamento pendente';
}

export default function Sidebar({
  open,
  connected,
  isAuthenticated = false,
  status,
  selectedFolder,
  folderId,
  pickerConfigured = true,
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
  onClearFolder,
  onRefresh,
  onSelectSong,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
  loading = false,
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const normalizedStatus = String(status || '').toLowerCase();
  const isLoggedIn = Boolean(isAuthenticated || connected || [
    'need-folder',
    'authenticated',
    'connected',
    'loading',
  ].includes(normalizedStatus));

  const hasFolder = Boolean(selectedFolder?.id || folderId);
  const canPickFolder = Boolean(!loading && isLoggedIn && pickerConfigured);
  const canRefresh = Boolean(!loading && isLoggedIn && hasFolder);
  const statusLabel = readableStatus(status, connected, isLoggedIn, loading);
  const connectionLabel = connected
    ? 'Google Drive conectado'
    : isLoggedIn
      ? 'Google autenticado'
      : 'Biblioteca local';
  const folderLabel = selectedFolder?.name || (folderId ? 'Pasta configurada' : 'Nenhuma pasta selecionada');
  const profileInitial = connected || isLoggedIn ? 'R' : <User size={17} />;
  const styleOptions = [
    { value: '', label: 'Todos os estilos' },
    ...styleList.map((style) => ({ value: style, label: style })),
  ];

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} onTouchMove={(event) => event.preventDefault()} />
      <nav className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Biblioteca musical" onTouchStart={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
        <div className={styles.scrollContent}>
          <div className={styles.header}>
            <div className={styles.brandBlock}>
              <div className={styles.brandMark} aria-hidden="true">
                <Music2 size={20} />
              </div>
              <div className={styles.brandText}>
                <strong>Playback Cifras</strong>
                <span>Biblioteca musical</span>
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

          <section className={styles.navSection} aria-label="Navegação">
            <label>Navegação</label>
            <button className={`${styles.navItem} ${styles.navItemActive}`} type="button">
              <LibraryBig size={17} />
              Biblioteca
            </button>
          </section>

          <section className={styles.section} aria-label="Estilos">
            <label>Estilos</label>
            <Combobox
              options={styleOptions}
              value={selectedStyle || ''}
              onValueChange={(value) => setSelectedStyle(value)}
              placeholder="Todos os estilos"
              emptyText="Nenhum estilo encontrado"
              className={styles.styleCombobox}
            />
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
        </div>

        <section className={styles.profileDock} aria-label="Perfil e conta">
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetTrigger asChild>
              <Button
                className={styles.profileButton}
                variant="ghost"
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
              >
                <span className={styles.avatar}>{profileInitial}</span>
                <span className={styles.profileText}>
                  <strong>Perfil</strong>
                  <small>{statusLabel}</small>
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className={styles.profileSheet}>
              <SheetHeader className={styles.profileSheetHeader}>
                <SheetTitle className={styles.profileSheetTitle}>Perfil</SheetTitle>
                <SheetDescription className={styles.profileSheetDescription}>
                  {connectionLabel}
                </SheetDescription>
              </SheetHeader>

              <div className={styles.profileSheetBody}>
                <button
                  type="button"
                  className={styles.profileAction}
                  onClick={() => {
                    setProfileOpen(false);
                    connected || isLoggedIn ? onLogout?.() : onLogin?.();
                  }}
                >
                  {connected || isLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                  <span>{connected || isLoggedIn ? 'Sair do Google' : 'Credenciamento do Google'}</span>
                </button>

                <button
                  type="button"
                  className={styles.profileAction}
                  disabled={!canPickFolder}
                  onClick={() => {
                    setProfileOpen(false);
                    onPickFolder?.();
                  }}
                >
                  <FolderOpen size={16} />
                  <span>{hasFolder ? 'Trocar pasta do Drive' : 'Selecionar pasta do Drive'}</span>
                </button>

                <button
                  type="button"
                  className={styles.profileAction}
                  disabled={!canRefresh}
                  onClick={() => {
                    setProfileOpen(false);
                    onRefresh?.();
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Atualizar biblioteca</span>
                </button>

                <button
                  type="button"
                  className={styles.profileAction}
                  disabled={!hasFolder}
                  onClick={() => {
                    setProfileOpen(false);
                    onClearFolder?.();
                  }}
                >
                  <Database size={16} />
                  <span>Remover pasta</span>
                </button>

                <div className={styles.profileDivider} />

                <button type="button" className={styles.profileAction} disabled>
                  <Cloud size={16} />
                  <span>Offline sincronizado</span>
                </button>
                <button type="button" className={styles.profileAction} disabled>
                  <Settings size={16} />
                  <span>Configurações da conta</span>
                </button>
                <button type="button" className={styles.profileAction} disabled>
                  <Bell size={16} />
                  <span>Notificações</span>
                </button>
                <button type="button" className={styles.profileAction} disabled>
                  <User size={16} />
                  <span>Perfil</span>
                </button>
                <button type="button" className={styles.profileAction} disabled>
                  <HelpCircle size={16} />
                  <span>Suporte</span>
                </button>

                <div className={styles.folderSummary}>{folderLabel}</div>
              </div>
            </SheetContent>
          </Sheet>

          <div className={styles.profileLinks}>
            <span><ListMusic size={14} /> {totalSongs || songs.length} músicas</span>
            <span>{favoriteCount} favoritas</span>
          </div>
        </section>
      </nav>
    </>
  );
}
