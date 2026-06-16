import { FileText, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

function getCurrentAudioTime(audio) {
  if (audio && typeof audio.getCurrentTime === 'function') return audio.getCurrentTime();
  return Number(audio?.currentTime || 0) || 0;
}

function StageLine({ line }) {
  const hasItems = Array.isArray(line.items) && line.items.length > 0;
  const className = line.isChord ? styles.chordLine : styles.lyricLine;

  if (!hasItems) {
    return <div className={className}>{line.text || ' '}</div>;
  }

  return (
    <div className={`${styles.positionedLine} ${className}`}>
      {line.items.map((item) => (
        <span
          key={item.id}
          className={line.isChord ? styles.chordToken : styles.lyricToken}
          style={{ left: `${item.leftPct}%` }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

export default function StageViewer({ source, audio }) {
  const stage = useStageText(source);
  const isBusy = stage.status === 'loading';
  const viewportRef = useRef(null);
  const frameRef = useRef(0);
  const audioRef = useRef(audio);
  const lastTargetRef = useRef(0);
  const [fontSize, setFontSize] = useState(38);
  const hasPages = useMemo(() => stage.pages.some((page) => page.lines.length), [stage.pages]);

  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasPages) return undefined;

    function syncToAudio() {
      const nextViewport = viewportRef.current;
      const nextAudio = audioRef.current;

      if (!nextViewport || !nextAudio) {
        frameRef.current = window.requestAnimationFrame(syncToAudio);
        return;
      }

      const duration = Number(nextAudio.duration || 0);
      const maxScroll = Math.max(0, nextViewport.scrollHeight - nextViewport.clientHeight);

      if (duration > 0 && maxScroll > 0) {
        const currentTime = getCurrentAudioTime(nextAudio);
        const progress = Math.max(0, Math.min(1, currentTime / duration));
        const target = maxScroll * progress;
        const current = nextViewport.scrollTop;
        const diff = target - current;
        const smoothing = nextAudio.isPlaying ? 0.075 : 0.28;

        if (Math.abs(target - lastTargetRef.current) > 0.25 || Math.abs(diff) > 0.5) {
          nextViewport.scrollTop = current + diff * smoothing;
          lastTargetRef.current = target;
        }
      }

      frameRef.current = window.requestAnimationFrame(syncToAudio);
    }

    frameRef.current = window.requestAnimationFrame(syncToAudio);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [hasPages, source]);

  useEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
    lastTargetRef.current = 0;
  }, [source]);

  function changeFontSize(delta) {
    setFontSize((current) => Math.max(26, Math.min(64, current + delta)));
  }

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Modo Palco</h1>
          <p>Selecione uma música para gerar a leitura textual da cifra.</p>
          <small>V4.0.11 — Stage Sync</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageToolbar}>
        <div className={styles.stageTitle}>
          <strong>Modo Palco</strong>
          <span>Scroll fluido proporcional ao MP3</span>
        </div>

        <div className={styles.stageControls}>
          <div className={styles.syncBadge}>
            {audio?.hasValidSource ? 'Sync MP3' : 'Sem MP3'}
          </div>
          <div className={styles.fontControls} aria-label="Tamanho da letra do Modo Palco">
            <button type="button" onClick={() => changeFontSize(-2)} aria-label="Diminuir fonte"><Minus size={16} /></button>
            <span>{fontSize}px</span>
            <button type="button" onClick={() => changeFontSize(2)} aria-label="Aumentar fonte"><Plus size={16} /></button>
          </div>
        </div>
      </div>

      <div className={styles.stageViewport} ref={viewportRef}>
        {isBusy && <div className={styles.loadingPill}>Lendo texto do PDF...</div>}

        {stage.error && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível ler o texto do PDF.</strong>
            <span>{stage.error}</span>
          </div>
        )}

        {!stage.error && stage.pages.map((page) => (
          <section key={page.pageNumber} className={styles.stagePage} aria-label={`Página ${page.pageNumber}`}>
            <div className={styles.pageLabel}>Página {page.pageNumber}</div>
            <div className={styles.stageText} style={{ fontSize: `${fontSize}px` }}>
              {page.lines.map((line) => <StageLine key={line.id} line={line} />)}
            </div>
          </section>
        ))}

        {!stage.error && !isBusy && !hasPages && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Nenhum texto foi encontrado neste PDF.</strong>
            <span>Use o Modo Estudo para visualizar o PDF original.</span>
          </div>
        )}
      </div>
    </div>
  );
}
