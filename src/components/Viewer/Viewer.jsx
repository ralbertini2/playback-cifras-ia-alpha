import styles from './Viewer.module.css';

export default function Viewer({ pdfUrl, zoom }) {
  if (!pdfUrl) {
    return (
      <section className={styles.viewer}>
        <div className={styles.emptyState}>
          <h1>Playback Cifras IA</h1>
          <p>Selecione uma pasta do Google Drive e carregue uma música para visualizar PDF/cifra e playback no mesmo ambiente.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.viewer}>
      <div className={styles.pdfCanvas} style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        <iframe src={pdfUrl} title="Cifra PDF" className={styles.iframe} />
      </div>
    </section>
  );
}
