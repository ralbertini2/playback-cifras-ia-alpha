import { ListMusic, Music, Plus, Trash2 } from 'lucide-react';
import styles from './Setlists.module.css';

export default function Setlists({
  playlists = {},
  selectedPlaylist,
  setSelectedPlaylist,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
}) {
  const names = Object.keys(playlists).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selectedCount = selectedPlaylist ? playlists[selectedPlaylist]?.length || 0 : 0;

  return (
    <section className={styles.setlists} aria-label="Repertórios">
      <div className={styles.header}>
        <div>
          <label>Repertórios</label>
          <span>{selectedPlaylist ? `${selectedCount} música(s) no repertório` : `${names.length} repertório(s)`}</span>
        </div>
        <ListMusic size={18} />
      </div>

      <select value={selectedPlaylist} onChange={(event) => setSelectedPlaylist(event.target.value)}>
        <option value="">Sem filtro de repertório</option>
        {names.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>

      <div className={styles.actions}>
        <button onClick={onCreatePlaylist}><Plus size={16} /> Criar</button>
        <button onClick={onAddToPlaylist}><Music size={16} /> Adicionar</button>
        <button onClick={onDeletePlaylist}><Trash2 size={16} /> Excluir</button>
      </div>
    </section>
  );
}
