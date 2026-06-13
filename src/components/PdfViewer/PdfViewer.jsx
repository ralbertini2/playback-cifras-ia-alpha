import { FileText, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { usePdfViewer } from '../../hooks/usePdfViewer.js';
import styles from './PdfViewer.module.css';

export default function PdfViewer({ source, title = 'Selecione uma música' }) {
  const viewer = usePdfViewer(source);

  const zoomLabel = `${Math.round(viewer.zoom * 100)}%`;

  return (
    <section className={styles.viewer} aria-label="Visualizador de PDF">
      <header className={styles.header}>
        <div>
          <h2>{title}</h2>
          <p>
            {viewer.status === 'ready'
              ? `Página ${viewer.pageNumber} de ${viewer.pageCount}`
              : viewer.status === 'loading'
                ? 'Carregando documento...'
                : 'Nenhum PDF carregado'}
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={viewer.zoomOut} aria-label="Diminuir zoom">
            <Minus size={18} />
          </button>
          <span>{zoomLabel}</span>
          <button type="button" onClick={viewer.zoomIn} aria-label="Aumentar zoom">
            <Plus size={18} />
          </button>
          <button type="button" onClick={viewer.fitWidth} aria-label="Ajustar largura">
            <Maximize2 size={18} />
          </button>
          <button type="button" onClick={viewer.fitWidth} aria-label="Redefinir zoom">
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <div className={styles.stage}>
        {viewer.status === 'empty' && (
          <div className={styles.empty}>
            <FileText size={40} />
            <strong>Selecione uma música</strong>
            <span>O PDF será exibido aqui quando uma música válida for aberta.</span>
          </div>
        )}

        {viewer.status === 'loading' && (
          <div className={styles.empty}>
            <FileText size={40} />
            <strong>Carregando PDF...</strong>
            <span>Aguarde enquanto o documento é preparado.</span>
          </div>
        )}

        {viewer.status === 'error' && (
          <div className={styles.error}>
            <FileText size={40} />
            <strong>Não foi possível abrir este PDF.</strong>
            <span>{viewer.error}</span>
          </div>
        )}

        {viewer.status === 'ready' && (
          <div className={styles.canvasWrap}>
            <canvas ref={viewer.canvasRef} className={styles.canvas} />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button type="button" onClick={viewer.previousPage} disabled={viewer.pageNumber <= 1}>
          Anterior
        </button>
        <span>{viewer.pageCount ? `${viewer.pageNumber} / ${viewer.pageCount}` : '—'}</span>
        <button type="button" onClick={viewer.nextPage} disabled={!viewer.pageCount || viewer.pageNumber >= viewer.pageCount}>
          Próxima
        </button>
      </footer>
    </section>
  );
}
