import { FileText } from 'lucide-react';
import styles from './Viewer.module.css';

export default function Viewer({ pdfUrl, zoom }) {
  if (!pdfUrl) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <FileText size={44} />
          <h1>Playback Cifras IA v2</h1>
          <p>Shell React pronto para receber visualização de PDF, cifras e integrações da próxima etapa.</p>
          <small>v2.1 — React Layout Shell</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewer}>
      <iframe
        title="Visualizador de PDF"
        src={pdfUrl}
        className={styles.frame}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      />
    </div>
  );
}
