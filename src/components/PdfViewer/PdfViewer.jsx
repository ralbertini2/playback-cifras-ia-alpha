import { ChevronLeft, ChevronRight, FileText, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { usePdfViewer } from '../../hooks/usePdfViewer.js';
import styles from './PdfViewer.module.css';

export default function PdfViewer({ source, title }) {
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
        <div className={styles.documentTitle}>
          <strong>{title || 'PDF / Cifra'}</strong>
          <span>{pdf.totalPages ? `Página ${pdf.pageNumber} de ${pdf.totalPages}` : 'Carregando documento...'}</span>
        </div>
        <div className={styles.zoomControls} aria-label="Controles de zoom do PDF">
          <button onClick={pdf.zoomOut} aria-label="Reduzir zoom"><Minus size={17} /></button>
          <span>{Math.round(pdf.scale * 100)}%</span>
          <button onClick={pdf.zoomIn} aria-label="Aumentar zoom"><Plus size={17} /></button>
          <button onClick={pdf.fitWidth} aria-label="Ajustar à largura"><Maximize2 size={17} /></button>
          <button onClick={pdf.resetZoom} aria-label="Redefinir zoom"><RotateCcw size={17} /></button>
        </div>
      </div>

      <div className={styles.canvasViewport} ref={pdf.containerRef}>
        {pdf.error ? (
          <div className={styles.errorCard}>
            <FileText size={36} />
            <strong>Não foi possível abrir este PDF.</strong>
            <span>{pdf.error}</span>
          </div>
        ) : (
          <div className={styles.pageSurface} data-busy={isBusy ? 'true' : 'false'}>
            <canvas ref={pdf.canvasRef} className={styles.canvas} />
            {isBusy && <div className={styles.loadingPill}>Carregando PDF...</div>}
          </div>
        )}
      </div>

      <div className={styles.pageControls} aria-label="Controles de página do PDF">
        <button onClick={pdf.previousPage} disabled={!pdf.canGoPrevious}><ChevronLeft size={20} />Anterior</button>
        <span>{pdf.totalPages ? `${pdf.pageNumber} / ${pdf.totalPages}` : '—'}</span>
        <button onClick={pdf.nextPage} disabled={!pdf.canGoNext}>Próxima<ChevronRight size={20} /></button>
      </div>
    </div>
  );
}
