import { FileText, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

export default function StageViewer({ source, audio }) {
  const stage = useStageText(source);
  const isBusy = stage.status === 'loading';
  const viewportRef = useRef(null);
  const frameRef = useRef(0);
  const [fontSize, setFontSize] = useState(36);
  const hasPages = useMemo(() => stage.pages.some((page) => page.lines.length), [stage.pages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const duration = Number(audio?.duration || 0);

    if (!viewport || !duration || !hasPages) return undefined;

    function syncToAudio() {
      const nextViewport = viewportRef.current;
      if (!nextViewport) return;

      const maxScroll = Math.max(0, nextViewport.scrollHeight - nextViewport.clientHeight);
      const progress = Math.max(0, Math.min(1, Number(audio?.currentTime || 0) / duration));
      const target = maxScroll * progress;
      const diff = target - nextViewport.scrollTop;

      if (Math.abs(diff) > 1) {
        nextViewport.scrollTop += diff * 0.18;
      }

      frameRef.current = window.requestAnimationFrame(syncToAudio);
    }

    frameRef.current = window.requestAnimationFrame(syncToAudio);
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [audio?.currentTime, audio?.duration, hasPages]);

  useEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
  }, [source]);

  function changeFontSize(delta) {
    setFontSize((current) => Math.max(24, Math.min(56, current + delta)));
  }

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Modo Palco</h1>
          <p>Selecione uma música para gerar a leitura textual da cifra.</p>
          <small>V4.0.10 — Stage Parser</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageToolbar}>
        <div className={styles.stageTitle}>
          <strong>Modo Palco</strong>
          <span>Scroll sincronizado com o MP3</span>
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
