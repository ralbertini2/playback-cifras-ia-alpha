import { Volume2, VolumeX } from 'lucide-react';
import styles from './VolumeControl.module.css';

export default function VolumeControl({ volume, muted, disabled, onVolumeChange, onToggleMute }) {
  return (
    <div className={styles.volumeControl} aria-label="Controle de volume">
      <button type="button" onClick={onToggleMute} disabled={disabled} aria-label={muted ? 'Ativar som' : 'Silenciar'}>
        {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round((muted ? 0 : volume) * 100)}
        disabled={disabled}
        onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
        aria-label="Volume"
      />
    </div>
  );
}
