import { Menu, Search, Star } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({ song, meta, onOpenMenu }) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.menuButton} onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      <div className={styles.songInfo}>
        <strong>{song?.title || 'Selecione uma música'}</strong>
        <span>{meta || 'Google Drive • PDFs • Playbacks'}</span>
      </div>
      <div className={styles.controls}>
        <button aria-label="Buscar"><Search size={19} /></button>
        <button aria-label="Favoritar"><Star size={19} /></button>
      </div>
    </div>
  );
}
