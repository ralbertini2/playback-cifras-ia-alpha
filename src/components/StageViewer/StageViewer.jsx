import { FileText } from 'lucide-react';
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
          <p>Selecione uma música para gerar a leitura textual da cifra.</p>
          <small>V4.0.5 — Stage Parser</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stageShell}>
      <div className={styles.stageViewport}>
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
            <div className={styles.rawText}>
              {page.lines.map((line) => (
                <div
                  key={line.id}
                  className={line.isChord ? styles.chordLine : styles.lyricLine}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </section>
        ))}

        {!stage.error && !isBusy && !stage.pages.some((page) => page.lines.length) && (
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
