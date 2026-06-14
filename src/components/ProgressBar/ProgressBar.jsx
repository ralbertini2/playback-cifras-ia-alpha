import styles from './ProgressBar.module.css';

export default function ProgressBar({ currentTimeLabel, durationLabel, progress, disabled, onSeek }) {
  return (
    <div className={styles.progressArea}>
      <span>{currentTimeLabel}</span>
      <input
        type="range"
        min="0"
        max="1000"
        value={Math.round((progress || 0) * 1000)}
        disabled={disabled}
        onChange={(event) => onSeek(Number(event.target.value) / 1000)}
        aria-label="Progresso do áudio"
      />
      <span>{durationLabel}</span>
    </div>
  );
}
