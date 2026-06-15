import { FileText, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import StageViewer from '../StageViewer/StageViewer.jsx';
import { usePdfViewer } from '../../hooks/usePdfViewer.js';
import styles from './PdfViewer.module.css';

export default function PdfViewer({ source }) {
  const [mode, setMode] = useState('study');
  const pdf = usePdfViewer(mode === 'study' ? source : null);
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
        <div className={styles.modeSwitch} aria-label="Modo de visualização">
          <button
            type="button"
            className={mode === 'study' ? styles.modeActive : ''}
            onClick={() => setMode('study')}
          >Modo Estudo</button>
          <span>|</span>
          <button
            type="button"
            className={mode === 'stage' ? styles.modeActive : ''}
            onClick={() => setMode('stage')}
          >Modo Palco</button>
        </div>

        {mode === 'study' && (
          <div className={styles.zoomControls} aria-label="Controles de zoom do PDF">
            <button onClick={pdf.zoomOut} aria-label="Reduzir zoom"><Minus size={17} /></button>
            <span>{Math.round(pdf.scale * 100)}%</span>
            <button onClick={pdf.zoomIn} aria-label="Aumentar zoom"><Plus size={17} /></button>
            <button onClick={pdf.fitWidth} aria-label="Ajustar à largura"><Maximize2 size={17} /></button>
            <button onClick={pdf.resetZoom} aria-label="Redefinir zoom"><RotateCcw size={17} /></button>
          </div>
        )}
      </div>

      {mode === 'stage' ? (
        <StageViewer source={source} />
      ) : (
        <div className={styles.canvasViewport} ref={pdf.containerRef}>
          {pdf.error && (
            <div className={styles.errorCard}>
              <FileText size={36} />
              <strong>Não foi possível abrir este PDF.</strong>
              <span>{pdf.error}</span>
            </div>
          )}
        </div>
      )}

      {mode === 'study' && isBusy && <div className={styles.loadingPill}>Carregando PDF...</div>}
    </div>
  );
}
