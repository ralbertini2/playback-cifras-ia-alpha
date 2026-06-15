import { FileText, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { usePdfViewer } from '../../hooks/usePdfViewer.js';
import styles from './PdfViewer.module.css';

function ModeToggle({ mode, onModeChange }) {
  return (
    <div className={styles.modeToggle} aria-label="Modo de visualização">
      <button
        type="button"
        className={mode === 'study' ? styles.activeMode : ''}
        onClick={() => onModeChange?.('study')}
      >
        Modo Estudo
      </button>
      <button
        type="button"
        className={mode === 'stage' ? styles.activeMode : ''}
        onClick={() => onModeChange?.('stage')}
      >
        Modo Palco
      </button>
    </div>
  );
}

export default function PdfViewer({ source, mode = 'study', onModeChange }) {
  const pdf = usePdfViewer(source);
  const isBusy = pdf.status === 'loading' || pdf.status === 'rendering';

  if (!source) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Visualizador PDF React</h1>
          <p>Selecione uma música para abrir PDF/cifra. Esta área foi preparada para leitura em iPad vertical, desktop e mobile.</p>
          <small>v2.2 — PDF/Cifra Viewer</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewerShell}>
      <div className={styles.viewerTopbar}>
        <ModeToggle mode={mode} onModeChange={onModeChange} />

        <div className={styles.zoomControls} aria-label="Controles de zoom do PDF">
          <button onClick={pdf.zoomOut} aria-label="Reduzir zoom"><Minus size={17} /></button>
          <span>{Math.round(pdf.scale * 100)}%</span>
          <button onClick={pdf.zoomIn} aria-label="Aumentar zoom"><Plus size={17} /></button>
          <button onClick={pdf.fitWidth} aria-label="Ajustar à largura"><Maximize2 size={17} /></button>
          <button onClick={pdf.resetZoom} aria-label="Redefinir zoom"><RotateCcw size={17} /></button>
        </div>
      </div>

      <div className={styles.canvasViewport} ref={pdf.containerRef}>
        {pdf.error && (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível abrir este PDF.</strong>
            <span>{pdf.error}</span>
          </div>
        )}
      </div>

      {isBusy && <div className={styles.loadingPill}>Carregando PDF...</div>}
    </div>
  );
}
