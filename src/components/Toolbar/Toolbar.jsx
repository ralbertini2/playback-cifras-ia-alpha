import { Menu, Minus, Plus, RotateCcw, Search, Star } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({ song, meta, onOpenMenu, zoom, setZoom }) {
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
        <button onClick={() => setZoom(Math.max(.7, +(zoom - .1).toFixed(2)))} aria-label="Reduzir zoom"><Minus size={18} /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(1.6, +(zoom + .1).toFixed(2)))} aria-label="Aumentar zoom"><Plus size={18} /></button>
        <button onClick={() => setZoom(1)} aria-label="Redefinir zoom"><RotateCcw size={18} /></button>
      </div>
    </div>
  );
}
