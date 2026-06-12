import { Loader2, Menu, Search, Star } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({ song, meta, onOpenMenu, loading = false }) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.menuButton} onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      <div className={styles.songInfo}>
        <strong>{song?.title || 'Selecione uma música'}</strong>
        <span>{meta || 'Google Drive • PDFs • Playbacks'}</span>
      </div>
      <div className={styles.controls}>
        {loading ? <Loader2 className={styles.spinner} size={19} aria-label="Carregando" /> : null}
        <button aria-label="Buscar"><Search size={19} /></button>
        <button aria-label="Favoritar"><Star size={19} /></button>
      </div>
    </div>
  );
}
