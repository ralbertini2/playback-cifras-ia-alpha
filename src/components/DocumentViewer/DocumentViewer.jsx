import { FileText, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import styles from './DocumentViewer.module.css';

function getLines(source) {
  const text = String(source?.text || '');
  return text.replace(/\r\n?/g, '\n').split('\n');
}

function getFormatLabel(source) {
  const format = String(source?.format || '').toLowerCase();
  if (format === 'docx') return 'DOCX renderizado no Modo Estudo';
  if (format === 'google-doc') return 'Google Docs renderizado no Modo Estudo';
  if (format === 'html') return 'HTML renderizado no Modo Estudo';
  if (format === 'rtf') return 'RTF renderizado no Modo Estudo';
  return 'Modo Estudo — Documento';
}

function sanitizeHtml(html = '') {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export default function DocumentViewer({ source, title = 'Documento' }) {
  const [fontSize, setFontSize] = useState(22);

  function decreaseFont() {
    setFontSize((current) => Math.max(14, current - 2));
  }

  function increaseFont() {
    setFontSize((current) => Math.min(42, current + 2));
  }
  if (!source) {
    return (
      <div className={styles.emptyState}>
        <FileText size={40} />
        <strong>Selecione um documento.</strong>
      </div>
    );
  }

  const lines = getLines(source);
  const html = sanitizeHtml(source?.html || '');
  const hasHtml = Boolean(html.trim());

  return (
    <div className={styles.viewerShell}>
      <article className={styles.documentPage}>
        <header className={styles.documentHeader}>
          <FileText size={22} />
          <div>
            <strong>{title || source?.title || 'Documento'}</strong>
            <span>{getFormatLabel(source)}</span>
          </div>
          <div className={styles.fontControls} aria-label="Tamanho da fonte do documento">
            <button type="button" onClick={decreaseFont} aria-label="Diminuir fonte"><Minus size={16} /></button>
            <strong>{fontSize}px</strong>
            <button type="button" onClick={increaseFont} aria-label="Aumentar fonte"><Plus size={16} /></button>
          </div>
        </header>

        {hasHtml ? (
          <div
            className={styles.documentHtml}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className={styles.documentBody} style={{ fontSize: `${fontSize}px` }}>
            {lines.map((line, index) => (
              <p key={`${index}-${line.slice(0, 12)}`} className={line.trim() ? styles.line : styles.blankLine}>
                {line || '\u00a0'}
              </p>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
