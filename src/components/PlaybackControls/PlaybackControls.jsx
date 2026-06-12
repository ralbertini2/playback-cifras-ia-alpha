import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import styles from './PlaybackControls.module.css';

export default function PlaybackControls({ disabled, isPlaying, onToggle, onPrevious, onNext, onSeekBack, onSeekForward }) {
  return (
    <div className={styles.controls} aria-label="Controles de reprodução">
      <button type="button" onClick={onPrevious} disabled={disabled} aria-label="Música anterior">
        <SkipBack size={23} />
        <span>Voltar</span>
      </button>

      <button type="button" onClick={onSeekBack} disabled={disabled} className={styles.smallControl} aria-label="Voltar 10 segundos">
        <RotateCcw size={20} />
        <span>10s</span>
      </button>

      <button type="button" onClick={onToggle} disabled={disabled} className={styles.playButton} aria-label={isPlaying ? 'Pausar' : 'Tocar'}>
        {isPlaying ? <Pause size={31} /> : <Play size={31} />}
        <span>{isPlaying ? 'Pausar' : 'Tocar'}</span>
      </button>

      <button type="button" onClick={onSeekForward} disabled={disabled} className={styles.smallControl} aria-label="Avançar 10 segundos">
        <RotateCw size={20} />
        <span>10s</span>
      </button>

      <button type="button" onClick={onNext} disabled={disabled} aria-label="Próxima música">
        <SkipForward size={23} />
        <span>Próxima</span>
      </button>
    </div>
  );
}
