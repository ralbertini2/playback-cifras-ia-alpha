import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import styles from './PlayerBar.module.css';

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(value || 0));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export default function PlayerBar({ audio, onPrevious, onNext }) {
  const duration = audio?.duration || 0;
  const currentTime = audio?.currentTime || 0;
  const hasAudio = Boolean(audio?.hasValidSource || audio?.source);

  return (
    <section className={styles.player} aria-label="Player de playback">
      <div className={styles.volumeRow}>
        {audio?.error && <small className={styles.error}>{audio.error}</small>}
        <div className={styles.volume} aria-label="Controle de volume">
          <button type="button" onClick={() => audio?.toggleMute?.()} aria-label="Ativar ou desativar som">
            {audio?.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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

      <div className={styles.timeline}>
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={hasAudio ? currentTime : 0}
          disabled={!hasAudio}
          onChange={(event) => audio?.seek?.(Number(event.target.value))}
          aria-label="Progresso do áudio"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={onPrevious} aria-label="Música anterior">
          <SkipBack size={22} />
        </button>

        <button
          type="button"
          className={styles.play}
          onClick={() => audio?.toggle?.()}
          disabled={!hasAudio}
          aria-label={audio?.isPlaying ? 'Pausar' : 'Tocar'}
          title={!hasAudio ? 'Nenhum áudio válido selecionado' : undefined}
        >
          {audio?.isPlaying ? <Pause size={30} /> : <Play size={30} />}
        </button>

        <button type="button" onClick={onNext} aria-label="Próxima música">
          <SkipForward size={22} />
        </button>
      </div>
    </section>
  );
}
