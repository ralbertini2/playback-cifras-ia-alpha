import { FileText } from 'lucide-react';
import styles from './DocumentViewer.module.css';

function getLines(source) {
  const text = String(source?.text || '');
  return text.replace(/\r\n?/g, '\n').split('\n');
}

export default function DocumentViewer({ source, title = 'Documento' }) {
  if (!source) {
    return (
      <div className={styles.emptyState}>
        <FileText size={40} />
        <strong>Selecione um documento.</strong>
      </div>
    );
  }

  const lines = getLines(source);
  const isWordFallback = source?.format === 'word-fallback';

  return (
    <div className={styles.viewerShell}>
      <article className={styles.documentPage}>
        <header className={styles.documentHeader}>
          <FileText size={22} />
          <div>
            <strong>{title || source?.title || 'Documento'}</strong>
            <span>{isWordFallback ? 'Word detectado' : 'Modo Estudo — Documento'}</span>
          </div>
        </header>

        <div className={styles.documentBody}>
          {lines.map((line, index) => (
            <p key={`${index}-${line.slice(0, 12)}`} className={line.trim() ? styles.line : styles.blankLine}>
              {line || '\u00a0'}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
