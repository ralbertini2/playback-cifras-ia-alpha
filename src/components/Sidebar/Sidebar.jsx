import { FolderOpen, LogIn, LogOut, Music, Plus, RefreshCcw, Trash2, X } from 'lucide-react';
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
  onClose,
  onLogin,
  onLogout,
  onPickFolder,
  onRefresh,
  onSelectSong,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
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
            <button onClick={onPickFolder} title="Escolher pasta"><FolderOpen size={18} /></button>
          </div>
          <div className={styles.actionsGrid}>
            <button onClick={connected ? onLogout : onLogin}>{connected ? <LogOut size={17} /> : <LogIn size={17} />}{connected ? 'Sair' : 'Entrar'}</button>
            <button onClick={onRefresh}><RefreshCcw size={17} />Atualizar</button>
          </div>
        </section>

        <section className={styles.section}>
          <label>Estilo</label>
          <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
            <option value="">Todos os estilos</option>
            {stylesList.map((style) => <option key={style} value={style}>{style}</option>)}
          </select>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <label>Repertórios</label>
            <div className={styles.miniActions}>
              <button onClick={onCreatePlaylist} title="Criar repertório"><Plus size={16} /></button>
              <button onClick={onAddToPlaylist} title="Adicionar música atual"><Music size={16} /></button>
              <button onClick={onDeletePlaylist} title="Excluir repertório"><Trash2 size={16} /></button>
            </div>
          </div>
          <select value={selectedPlaylist} onChange={(event) => setSelectedPlaylist(event.target.value)}>
            <option value="">Sem filtro de repertório</option>
            {Object.keys(playlists).sort((a, b) => a.localeCompare(b, 'pt-BR')).map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </section>

        <section className={styles.songSection}>
          <div className={styles.songHeader}>{songs.length} música(s)</div>
          <div className={styles.songList}>
            {songs.length === 0 ? (
              <div className={styles.empty}>Atualize a biblioteca para listar PDFs e playbacks.</div>
            ) : songs.map((song, index) => (
              <button
                key={song.id || `${song.title}-${index}`}
                className={`${styles.songItem} ${song.id === currentSongId ? styles.activeSong : ''}`}
                onClick={() => onSelectSong(index)}
              >
                <span>{song.title}</span>
                <small>{song.artist || song.style}</small>
              </button>
            ))}
          </div>
        </section>
      </nav>
    </>
  );
}
