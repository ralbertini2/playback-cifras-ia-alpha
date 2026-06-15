import { getPdfJs, loadPdfDocument } from './pdfService.js';

const CHORD_TOKEN = /^(?:[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?|N\.C\.?|NC|%|\|)$/i;

function clonePdfSource(source) {
  if (source instanceof Uint8Array) return new Uint8Array(source);
  if (source instanceof ArrayBuffer) return source.slice(0);
  return source;
}

function median(values) {
  if (!values.length) return 7;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] || 7;
}

function isChordLike(text) {
  const clean = String(text || '').trim();
  if (!clean) return false;
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 18) return false;
  return tokens.every((token) => CHORD_TOKEN.test(token.replace(/[,:;]/g, '')));
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function buildMonospaceLine(items, charWidth) {
  if (!items.length) return '';
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const minX = Math.min(...sorted.map((item) => item.x));
  const buffer = [];

  sorted.forEach((item) => {
    const text = normalizeText(item.text);
    if (!text) return;
    const column = Math.max(0, Math.round((item.x - minX) / charWidth));
    while (buffer.length < column) buffer.push(' ');
    for (let index = 0; index < text.length; index += 1) {
      buffer[column + index] = text[index];
    }
  });

  return buffer.join('').replace(/\s+$/g, '');
}

function groupTextItems(rawItems, viewport, pdfjs) {
  const positioned = rawItems
    .map((item) => {
      const transform = pdfjs.Util.transform(viewport.transform, item.transform);
      const text = normalizeText(item.str);
      return {
        text,
        x: transform[4],
        y: transform[5],
        width: item.width || 0,
      };
    })
    .filter((item) => item.text);

  const charWidths = positioned
    .map((item) => item.width / Math.max(1, item.text.length))
    .filter((value) => Number.isFinite(value) && value > 1 && value < 40);
  const charWidth = Math.max(5, median(charWidths));
  const lines = [];

  positioned
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((item) => {
      const match = lines.find((line) => Math.abs(line.y - item.y) <= 4);
      if (match) {
        match.items.push(item);
        match.y = (match.y + item.y) / 2;
      } else {
        lines.push({ y: item.y, items: [item] });
      }
    });

  return lines
    .sort((a, b) => a.y - b.y)
    .map((line) => {
      const text = buildMonospaceLine(line.items, charWidth);
      return {
        text,
        isChord: isChordLike(text),
      };
    })
    .filter((line) => line.text);
}

export async function extractStagePages(source) {
  if (!source) return [];

  const pdfjs = await getPdfJs();
  const documentProxy = await loadPdfDocument(clonePdfSource(source));
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
      const page = await documentProxy.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
      pages.push({
        pageNumber,
        lines: groupTextItems(textContent.items || [], viewport, pdfjs),
      });
    }
  } finally {
    if (documentProxy?.destroy) documentProxy.destroy().catch(() => {});
  }

  return pages;
}
