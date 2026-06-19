import {
  Bell,
  Check,
  ChevronDown,
  Cloud,
  Database,
  FileMusic,
  FolderOpen,
  HelpCircle,
  LibraryBig,
  ListMusic,
  LogIn,
  LogOut,
  Music,
  Music2,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import Library from '../Library/Library.jsx';
import { Button } from '../ui/button.jsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from '../ui/sidebar.jsx';
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
  const playlistNames = Object.keys(playlists).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selectedPlaylistCount = selectedPlaylist ? playlists[selectedPlaylist]?.length || 0 : 0;
  const songCount = totalSongs || songs.length;

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={onClose} onTouchMove={(event) => event.preventDefault()} />
      <SidebarProvider defaultOpen>
        <ShadcnSidebar
          dir="ltr"
          className={`${styles.sidebar} ${open ? styles.open : ''}`}
          aria-label="Biblioteca musical"
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
          variant="sidebar"
          collapsible="icon"
        >
          <SidebarHeader className={styles.header}>
            <SidebarMenu>
              <SidebarMenuItem>
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
                  <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu">
                    <X size={20} />
                  </button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className={styles.scrollContent}>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton type="button" isActive className={styles.sidebarMenuButton}>
                      <LibraryBig size={17} />
                      <span>Biblioteca</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <Collapsible defaultOpen className={styles.collapsibleGroup}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton type="button" className={styles.sidebarMenuButton}>
                        <FileMusic size={17} />
                        <span>Estilos</span>
                        <ChevronDown className={styles.chevron} size={16} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className={styles.sidebarSubMenu}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            type="button"
                            isActive={!selectedStyle}
                            className={styles.sidebarSubButton}
                            onClick={() => setSelectedStyle('')}
                          >
                            <span>Todos os estilos</span>
                            {!selectedStyle ? <Check size={14} /> : null}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {styleList.map((style) => (
                          <SidebarMenuSubItem key={style}>
                            <SidebarMenuSubButton
                              type="button"
                              isActive={selectedStyle === style}
                              className={styles.sidebarSubButton}
                              onClick={() => setSelectedStyle(style)}
                            >
                              <span>{style}</span>
                              {selectedStyle === style ? <Check size={14} /> : null}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </SidebarMenu>
              </Collapsible>
            </SidebarGroup>

            <SidebarGroup>
              <Collapsible defaultOpen className={styles.collapsibleGroup}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton type="button" className={styles.sidebarMenuButton}>
                        <ListMusic size={17} />
                        <span>Repertórios</span>
                        <small className={styles.menuBadge}>{playlistNames.length}</small>
                        <ChevronDown className={styles.chevron} size={16} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className={styles.sidebarSubMenu}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            type="button"
                            isActive={!selectedPlaylist}
                            className={styles.sidebarSubButton}
                            onClick={() => setSelectedPlaylist('')}
                          >
                            <span>Todos os repertórios</span>
                            {!selectedPlaylist ? <Check size={14} /> : null}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {playlistNames.map((name) => (
                          <SidebarMenuSubItem key={name}>
                            <SidebarMenuSubButton
                              type="button"
                              isActive={selectedPlaylist === name}
                              className={styles.sidebarSubButton}
                              onClick={() => setSelectedPlaylist(name)}
                            >
                              <span>{name}</span>
                              <small>{playlists[name]?.length || 0}</small>
                              {selectedPlaylist === name ? <Check size={14} /> : null}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>

                      <div className={styles.repertoireActions}>
                        <button onClick={onCreatePlaylist} type="button"><Plus size={15} /> Criar</button>
                        <button onClick={onAddToPlaylist} type="button"><Music size={15} /> Adicionar</button>
                        <button onClick={onDeletePlaylist} type="button"><Trash2 size={15} /> Excluir</button>
                      </div>
                      {selectedPlaylist ? <p className={styles.repertoireHint}>{selectedPlaylistCount} música(s) neste repertório.</p> : null}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </SidebarMenu>
              </Collapsible>
            </SidebarGroup>

            <SidebarGroup className={styles.libraryGroup}>
              <SidebarGroupLabel>Biblioteca</SidebarGroupLabel>
              <div className={styles.libraryMeta}>{songCount} música(s)</div>
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
              <div className={styles.songLegend}>
                <span><FileMusic size={13} /> Letra cifrada</span>
                <span><Music2 size={13} /> MP3</span>
              </div>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className={styles.profileDock}>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu modal={false} dir="ltr">
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton type="button" className={styles.profileButton}>
                      <span className={styles.avatar}>{profileInitial}</span>
                      <span className={styles.profileText}>
                        <strong>Perfil</strong>
                        <small>{statusLabel}</small>
                      </span>
                      <ChevronDown className={styles.profileChevron} size={16} />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="right"
                    sideOffset={10}
                    collisionPadding={12}
                    className={styles.profileMenu}
                  >
                    <DropdownMenuLabel>
                      <span className={styles.menuTitle}>Perfil</span>
                      <small className={styles.menuSubtitle}>{connectionLabel}</small>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(event) => { event.preventDefault(); connected || isLoggedIn ? onLogout?.() : onLogin?.(); }}>
                      {connected || isLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                      {connected || isLoggedIn ? 'Sair do Google' : 'Credenciamento do Google'}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!canPickFolder} onSelect={(event) => { event.preventDefault(); onPickFolder?.(); }}>
                      <FolderOpen size={16} />
                      {hasFolder ? 'Trocar pasta do Drive' : 'Selecionar pasta do Drive'}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!canRefresh} onSelect={(event) => { event.preventDefault(); onRefresh?.(); }}>
                      <RefreshCw size={16} />
                      Atualizar biblioteca
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!hasFolder} onSelect={(event) => { event.preventDefault(); onClearFolder?.(); }}>
                      <Database size={16} />
                      Remover pasta
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <Cloud size={16} />
                      Offline sincronizado
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Settings size={16} />
                      Configurações da conta
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Bell size={16} />
                      Notificações
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <User size={16} />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <HelpCircle size={16} />
                      Suporte
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>
                      <small className={styles.menuSubtitle}>{folderLabel}</small>
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className={styles.profileLinks}>
              <span><ListMusic size={14} /> {songCount} músicas</span>
              <span>{favoriteCount} favoritas</span>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </ShadcnSidebar>
      </SidebarProvider>
    </>
  );
}
