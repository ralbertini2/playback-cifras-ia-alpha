import { getPdfJs, loadPdfDocument } from './pdfService.js';

const CHORD_TOKEN_PATTERN = /^([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%)(?:\([^)]+\))?$/i;
const CHORD_LINE_PATTERN = /^(\s*(?:[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%|\||:|\(|\)|-)+\s*)+$/i;

function clonePdfData(data) {
  if (data instanceof Uint8Array) return data.slice();
  if (data instanceof ArrayBuffer) return new Uint8Array(data.slice(0));
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  }
  return data;
}

function clonePdfSource(source) {
  if (!source) return source;
  if (source instanceof Uint8Array) return source.slice();
  if (source instanceof ArrayBuffer) return new Uint8Array(source.slice(0));
  if (typeof source === 'object' && source.data) {
    return {
      ...source,
      data: clonePdfData(source.data),
    };
  }
  return source;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getTextHeight(transform, item) {
  const [, b, , d] = transform;
  const height = Math.max(Math.abs(b), Math.abs(d), item?.height || 10);
  return Number.isFinite(height) && height > 0 ? height : 10;
}

function isChordLike(text) {
  const clean = normalizeText(text);
  if (!clean) return false;
  if (clean.length > 32) return false;

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 10) return false;

  const chordTokens = tokens.filter((token) => CHORD_TOKEN_PATTERN.test(token));
  if (chordTokens.length === tokens.length) return true;

  return CHORD_LINE_PATTERN.test(clean) && chordTokens.length >= Math.max(1, Math.ceil(tokens.length * 0.45));
}

function buildLines(items) {
  const sorted = [...items].sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.left - b.left;
  });

  const lines = [];

  sorted.forEach((item) => {
    const tolerance = Math.max(5, item.fontSize * 0.45);
    let line = lines.find((candidate) => Math.abs(candidate.top - item.top) <= tolerance);

    if (!line) {
      line = { top: item.top, items: [] };
      lines.push(line);
    }

    line.items.push(item);
    line.top = (line.top + item.top) / 2;
  });

  return lines.map((line) => {
    const lineText = line.items
      .sort((a, b) => a.left - b.left)
      .map((item) => item.text)
      .join(' ')
      .trim();

    const lineIsChord = isChordLike(lineText);

    return line.items.map((item) => ({
      ...item,
      isChord: lineIsChord || isChordLike(item.text),
    }));
  }).flat();
}

export async function extractStagePagesFromPdf(source) {
  if (!source) return [];

  const pdfjs = await getPdfJs();
  const pdf = await loadPdfDocument(clonePdfSource(source));
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      const rawItems = [];

      textContent.items.forEach((item, index) => {
        const text = normalizeText(item.str);
        if (!text) return;

        const transform = pdfjs.Util.transform(viewport.transform, item.transform);
        const fontSize = getTextHeight(transform, item);
        const left = transform[4];
        const baseline = transform[5];
        const top = baseline - fontSize;

        if (!Number.isFinite(left) || !Number.isFinite(top)) return;

        rawItems.push({
          id: `${pageNumber}-${index}`,
          text,
          left,
          top,
          width: Math.max(1, item.width || 1),
          fontSize: Math.max(8, fontSize),
        });
      });

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        items: buildLines(rawItems),
      });
    }
  } finally {
    if (pdf?.destroy) {
      pdf.destroy().catch(() => {});
    }
  }

  return pages;
}

export const extractStagePages = extractStagePagesFromPdf;
