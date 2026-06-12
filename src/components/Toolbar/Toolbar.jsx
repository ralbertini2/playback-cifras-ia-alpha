import { Menu, Minus, Plus, Star } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({ song, meta, onOpenMenu, zoom, setZoom }) {
  return (
    <header className={styles.toolbar}>
      <button className={styles.iconButton} onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      <div className={styles.now}>
        <strong>{song?.title || 'Nenhuma música carregada'}</strong>
        <span>{meta || 'Entre com Google e carregue sua pasta de repertório.'}</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.toolButton} title="Favoritar"><Star size={18} /></button>
        <button className={styles.toolButton} onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}>A−</button>
        <span className={styles.zoom}>{Math.round(zoom * 100)}%</span>
        <button className={styles.toolButton} onClick={() => setZoom(Math.min(2, zoom + 0.1))}>A+</button>
        <button className={styles.toolButton}><Minus size={18} /></button>
        <button className={styles.toolButton}><Plus size={18} /></button>
      </div>
    </header>
  );
}
