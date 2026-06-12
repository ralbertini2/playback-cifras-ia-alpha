import { FolderOpen, LogIn, LogOut, Music, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({
  open,
  connected,
  status,
  folderId,
  setFolderId,
  stylesList,
  selectedStyle,
  setSelectedStyle,
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  songs,
  currentSongId,
  onClose,
  onLogin,
  onLogout,
  onPickFolder,
  onRefresh,
  onSelectSong,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist
}) {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <header className={styles.brand}>
        <img src="./logo-playback-cifras.jpg" alt="Playback Cifras IA" className={styles.logo} />
        <button className={styles.iconButton} onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
      </header>

      <section className={styles.panel}>
        {connected ? (
          <button className={styles.secondaryButton} onClick={onLogout}><LogOut size={17} /> Sair do Google</button>
        ) : (
          <button className={styles.primaryButton} onClick={onLogin}><LogIn size={17} /> Entrar com Google</button>
        )}
        <p className={styles.status}>{status}</p>
      </section>

      <section className={styles.panel}>
        <label className={styles.label}>Google Drive</label>
        <input
          className={styles.input}
          value={folderId}
          onChange={(event) => setFolderId(event.target.value)}
          placeholder="ID ou link da pasta principal"
        />
        <div className={styles.actionRow}>
          <button className={styles.secondaryButton} onClick={onPickFolder}><FolderOpen size={17} /> Pasta</button>
          <button className={styles.secondaryButton} onClick={onRefresh}><RefreshCw size={17} /> Atualizar</button>
        </div>
        <p className={styles.hint}>PDF e MP3 devem ter o mesmo nome. A pasta pode conter músicas diretamente ou subpastas por estilo.</p>
      </section>

      <section className={styles.panel}>
        <label className={styles.label}>Estilo</label>
        <select className={styles.select} value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
          <option value="">Todos os estilos</option>
          {stylesList.map((style) => <option key={style} value={style}>{style}</option>)}
        </select>

        <label className={styles.label}>Playlist / Evento</label>
        <select className={styles.select} value={selectedPlaylist} onChange={(event) => setSelectedPlaylist(event.target.value)}>
          <option value="">Todas as playlists</option>
          {Object.keys(playlists).sort().map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <div className={styles.buttonGrid}>
          <button className={styles.miniButton} onClick={onCreatePlaylist}><Plus size={15} /> Nova</button>
          <button className={styles.miniButton} onClick={onAddToPlaylist}><Music size={15} /> Add</button>
          <button className={styles.miniButton} onClick={onDeletePlaylist}><Trash2 size={15} /> Excluir</button>
        </div>
      </section>

      <section className={styles.songList} aria-label="Lista de músicas">
        {songs.length === 0 ? (
          <div className={styles.emptyList}>Nenhuma música encontrada.</div>
        ) : songs.map((song, index) => (
          <button
            key={song.id}
            className={`${styles.songItem} ${song.id === currentSongId ? styles.active : ''}`}
            onClick={() => onSelectSong(index, true)}
          >
            <span className={styles.songIcon}>♪</span>
            <span><strong>{song.title}</strong><small>{song.style}</small></span>
          </button>
        ))}
      </section>
    </aside>
  );
}
