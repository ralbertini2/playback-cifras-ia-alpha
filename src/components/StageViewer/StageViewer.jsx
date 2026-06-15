import { FileText, Minus, Plus, RotateCcw } from 'lucide-react';
import { useStageText } from '../../hooks/useStageText.js';
import styles from './StageViewer.module.css';

export default function StageViewer({ source }) {
  const stage = useStageText(source);
  const isBusy = stage.status === 'loading';

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Modo Palco</h1>
          <p>Selecione uma música para gerar uma visualização cifrada com texto maior.</p>
          <small>V4.0.0 — Modo Palco V1</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageTopbar}>
        <div className={styles.fontControls} aria-label="Controles do Modo Palco">
          <button type="button" onClick={stage.decreaseScale} aria-label="Diminuir fonte"><Minus size={17} /></button>
          <span>{Math.round(stage.scale * 100)}%</span>
          <button type="button" onClick={stage.increaseScale} aria-label="Aumentar fonte"><Plus size={17} /></button>
          <button type="button" onClick={stage.resetScale} aria-label="Redefinir fonte"><RotateCcw size={17} /></button>
        </div>
      </div>

      <div className={styles.stageViewport}>
        {stage.error && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível gerar o Modo Palco.</strong>
            <span>{stage.error}</span>
          </div>
        )}

        {!stage.error && stage.pages.map((page) => (
          <section
            key={page.pageNumber}
            className={styles.stagePage}
            style={{
              width: `${Math.round(page.width * stage.scale)}px`,
              height: `${Math.round(page.height * stage.scale)}px`,
            }}
            aria-label={`Página ${page.pageNumber}`}
          >
            {page.items.map((item) => (
              <span
                key={item.id}
                className={item.isChord ? styles.chordText : styles.lyricText}
                style={{
                  left: `${item.left * stage.scale}px`,
                  top: `${item.top * stage.scale}px`,
                  fontSize: `${item.fontSize * stage.scale}px`,
                  maxWidth: `${Math.max(12, item.width * stage.scale * 1.7)}px`,
                }}
              >
                {item.text}
              </span>
            ))}
          </section>
        ))}

        {!stage.error && !isBusy && !stage.pages.length && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Nenhum texto foi encontrado neste PDF.</strong>
            <span>Use o Modo Estudo para visualizar o PDF original.</span>
          </div>
        )}
      </div>

      {isBusy && <div className={styles.loadingPill}>Gerando Modo Palco...</div>}
    </div>
  );
}
