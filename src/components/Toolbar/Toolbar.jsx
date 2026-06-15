import { Loader2, Menu, Search, Star, Volume2, VolumeX } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({
  song,
  meta,
  onOpenMenu,
  onOpenSearch,
  loading = false,
  favoriteActive = false,
  onToggleFavorite,
  audio,
}) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.menuButton} onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={22} /></button>
      <div className={styles.songInfo}>
        <strong>{song?.title || 'Selecione uma música'}</strong>
        <span>{meta || 'Google Drive • PDFs • Playbacks'}</span>
      </div>
      <div className={styles.controls}>
        {loading ? <Loader2 className={styles.spinner} size={19} aria-label="Carregando" /> : null}
        <div className={styles.volume} aria-label="Controle de volume">
          <button type="button" onClick={() => audio?.toggleMute?.()} aria-label="Ativar ou desativar som">
            {audio?.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audio?.volume ?? 0.8}
            onChange={(event) => audio?.setVolume?.(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>
        <button onClick={onOpenSearch || onOpenMenu} aria-label="Buscar"><Search size={19} /></button>
        <button className={favoriteActive ? styles.favoriteActive : ''} onClick={onToggleFavorite} aria-label="Favoritar música atual"><Star size={19} /></button>
      </div>
    </div>
  );
}
