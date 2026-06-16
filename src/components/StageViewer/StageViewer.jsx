import { FileText, Gauge, Minus, Pause, Play, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

const DEFAULT_SCROLL_SPEED = 0;
const SPEED_STEP = 5;
const MAX_SCROLL_SPEED = 120;

function clampSpeed(value) {
  const next = Number(value) || 0;
  if (next <= 0) return 0;
  return Math.max(5, Math.min(MAX_SCROLL_SPEED, Math.round(next / SPEED_STEP) * SPEED_STEP));
}

export default function StageViewer({ source }) {
  const stage = useStageText(source);
  const isBusy = stage.status === 'loading';
  const viewportRef = useRef(null);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const [scrollSpeed, setScrollSpeed] = useState(DEFAULT_SCROLL_SPEED);
  const autoScrollActive = scrollSpeed > 0 && !stage.error && stage.pages.length > 0;

  useEffect(() => {
    if (!autoScrollActive) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastFrameRef.current = 0;
      return undefined;
    }

    function tick(timestamp) {
      const viewport = viewportRef.current;
      if (!viewport) return;

      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const deltaSeconds = Math.min(0.08, Math.max(0, (timestamp - lastFrameRef.current) / 1000));
      lastFrameRef.current = timestamp;

      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      if (viewport.scrollTop < maxScrollTop) {
        viewport.scrollTop = Math.min(maxScrollTop, viewport.scrollTop + scrollSpeed * deltaSeconds);
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setScrollSpeed(0);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastFrameRef.current = 0;
    };
  }, [autoScrollActive, scrollSpeed, stage.error, stage.pages.length]);

  function decreaseSpeed() {
    setScrollSpeed((current) => clampSpeed(current - SPEED_STEP));
  }

  function increaseSpeed() {
    setScrollSpeed((current) => clampSpeed(current + SPEED_STEP));
  }

  function toggleScroll() {
    setScrollSpeed((current) => (current > 0 ? 0 : 20));
  }

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Modo Palco</h1>
          <p>Selecione uma música para gerar a leitura textual da cifra.</p>
          <small>V4.0.13.1 — Stage Scroll Docx</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageToolbar}>
        <div className={styles.stageToolbarLabel}>
          <Gauge size={16} />
          <span>Auto scroll</span>
        </div>
        <div className={styles.scrollControls}>
          <button type="button" onClick={decreaseSpeed} aria-label="Diminuir velocidade"><Minus size={16} /></button>
          <button type="button" onClick={toggleScroll} aria-label={autoScrollActive ? 'Pausar auto scroll' : 'Iniciar auto scroll'}>
            {autoScrollActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button type="button" onClick={increaseSpeed} aria-label="Aumentar velocidade"><Plus size={16} /></button>
          <strong>{Math.round(scrollSpeed)} px/s</strong>
        </div>
      </div>

      <div className={styles.stageViewport} ref={viewportRef}>
        {isBusy && <div className={styles.loadingPill}>Lendo documento...</div>}

        {stage.error && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível ler o documento.</strong>
            <span>{stage.error}</span>
          </div>
        )}

        {!stage.error && stage.pages.map((page) => (
          <section key={page.pageNumber} className={styles.stagePage} aria-label={`Página ${page.pageNumber}`}>
            <div className={styles.pageLabel}>{page.sourceType ? 'Documento' : `Página ${page.pageNumber}`}</div>
            <div className={styles.rawText}>
              {page.lines.map((line) => (
                <div
                  key={line.id}
                  className={line.isChord ? styles.chordLine : styles.lyricLine}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </section>
        ))}

        {!stage.error && !isBusy && !stage.pages.some((page) => page.lines.length) && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Nenhum texto foi encontrado neste documento.</strong>
            <span>Use o Modo Estudo para visualizar o PDF original quando disponível.</span>
          </div>
        )}
      </div>
    </div>
  );
}
