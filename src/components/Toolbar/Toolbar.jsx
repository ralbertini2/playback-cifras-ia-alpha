import { Loader2, Menu, Volume2, VolumeX } from 'lucide-react';
import styles from './Toolbar.module.css';

export default function Toolbar({
  song,
  meta,
  onOpenMenu,
  loading = false,
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
      </div>
    </div>
  );
}
