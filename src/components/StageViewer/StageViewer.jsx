import { FileText, Minus, Play, Plus, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

const SCROLL_SPEEDS = [
  { id: 'stop', label: 'Parado', speed: 0 },
  { id: 'slow', label: 'Lento', speed: 18 },
  { id: 'medium', label: 'Médio', speed: 34 },
  { id: 'fast', label: 'Rápido', speed: 54 },
];

export default function StageViewer({ source }) {
  const stage = useStageText(source);
  const isBusy = stage.status === 'loading';
  const viewportRef = useRef(null);
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);
  const [fontSize, setFontSize] = useState(28);
  const [scrollMode, setScrollMode] = useState('stop');

  const activeScroll = useMemo(
    () => SCROLL_SPEEDS.find((option) => option.id === scrollMode) || SCROLL_SPEEDS[0],
    [scrollMode],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !activeScroll.speed || stage.status !== 'ready') return undefined;

    function tick(timestamp) {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      const elapsed = Math.min(64, timestamp - lastTickRef.current);
      lastTickRef.current = timestamp;
      viewport.scrollTop += (activeScroll.speed * elapsed) / 1000;
      frameRef.current = window.requestAnimationFrame(tick);
    }

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastTickRef.current = 0;
    };
  }, [activeScroll.speed, stage.status]);

  useEffect(() => {
    setScrollMode('stop');
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
  }, [source]);

  function changeFontSize(delta) {
    setFontSize((current) => Math.max(18, Math.min(46, current + delta)));
  }

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Modo Palco</h1>
          <p>Selecione uma música para gerar a leitura textual da cifra.</p>
          <small>V4.0.9 — Stage Parser</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageToolbar}>
        <div className={styles.stageTitle}>
          <strong>Modo Palco</strong>
          <span>Texto extraído do PDF para apresentação</span>
        </div>

        <div className={styles.stageControls}>
          <div className={styles.fontControls} aria-label="Tamanho da letra do Modo Palco">
            <button type="button" onClick={() => changeFontSize(-2)} aria-label="Diminuir fonte"><Minus size={16} /></button>
            <span>{fontSize}px</span>
            <button type="button" onClick={() => changeFontSize(2)} aria-label="Aumentar fonte"><Plus size={16} /></button>
          </div>

          <div className={styles.scrollControls} aria-label="Rolagem automática do Modo Palco">
            {SCROLL_SPEEDS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={scrollMode === option.id ? styles.activeScroll : ''}
                onClick={() => setScrollMode(option.id)}
                aria-label={`Rolagem ${option.label}`}
              >
                {option.id === 'stop' ? <Square size={12} /> : <Play size={12} />}
                <span>{option.label}</span>
              </button>
            ))}
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
            <div className={styles.rawText} style={{ fontSize: `${fontSize}px` }}>
              {page.lines.map((line) => (
                <div
                  key={line.id}
                  className={line.isChord ? styles.chordLine : styles.lyricLine}
                >
                  {line.text || ' '}
                </div>
              ))}
            </div>
          </section>
        ))}

        {!stage.error && !isBusy && !stage.pages.some((page) => page.lines.length) && (
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
