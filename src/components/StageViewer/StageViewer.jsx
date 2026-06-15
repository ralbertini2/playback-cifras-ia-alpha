import { FileText, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

const MIN_FONT = 18;
const MAX_FONT = 42;
const FONT_STEP = 2;

function clampFont(value) {
  return Math.min(MAX_FONT, Math.max(MIN_FONT, value));
}

export default function StageViewer({ source }) {
  const stage = useStageText(source);
  const [fontSize, setFontSize] = useState(24);

  const decreaseFont = () => setFontSize((current) => clampFont(current - FONT_STEP));
  const increaseFont = () => setFontSize((current) => clampFont(current + FONT_STEP));

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageTopbar}>
        <span>Modo Palco</span>
        <div className={styles.fontControls} aria-label="Tamanho da fonte do Modo Palco">
          <button type="button" onClick={decreaseFont} aria-label="Diminuir fonte"><Minus size={16} /></button>
          <strong>{fontSize}px</strong>
          <button type="button" onClick={increaseFont} aria-label="Aumentar fonte"><Plus size={16} /></button>
        </div>
      </div>

      <div className={styles.stageViewport}>
        {stage.loading && <div className={styles.stageStatus}>Preparando Modo Palco...</div>}

        {stage.error && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível abrir o Modo Palco.</strong>
            <span>{stage.error}</span>
          </div>
        )}

        {!stage.loading && !stage.error && !stage.pages.length && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Nenhum texto encontrado no PDF.</strong>
            <span>Use o Modo Estudo para visualizar o PDF original.</span>
          </div>
        )}

        <div className={styles.stagePages} style={{ '--stage-font-size': `${fontSize}px` }}>
          {stage.pages.map((page) => (
            <section className={styles.stagePage} key={page.pageNumber} aria-label={`Página ${page.pageNumber}`}>
              {page.lines.map((line, index) => (
                <pre
                  className={line.isChord ? styles.chordLine : styles.lyricLine}
                  key={`${page.pageNumber}-${index}`}
                >{line.text}</pre>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
