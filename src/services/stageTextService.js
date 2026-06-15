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


function multiplyTransforms(a, b) {
  if (!Array.isArray(a) && !(a instanceof Float32Array) && !(a instanceof Float64Array)) return b;
  if (!Array.isArray(b) && !(b instanceof Float32Array) && !(b instanceof Float64Array)) return a;

  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function getPdfTransform(pdfjs, viewport, item) {
  const viewportTransform = viewport?.transform || [1, 0, 0, 1, 0, 0];
  const itemTransform = item?.transform || [1, 0, 0, 1, 0, 0];

  if (pdfjs?.Util?.transform && typeof pdfjs.Util.transform === 'function') {
    return pdfjs.Util.transform(viewportTransform, itemTransform);
  }

  return multiplyTransforms(viewportTransform, itemTransform);
}

function safelyDestroyPdf(pdf) {
  if (!pdf?.destroy || typeof pdf.destroy !== 'function') return;

  try {
    const result = pdf.destroy();
    if (result?.catch && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch (_) {
    // PDF.js cleanup must never break the Stage parser.
  }
}

function isChordLike(text) {
  const clean = normalizeText(text);
  if (!clean) return false;
  if (clean.length > 42) return false;

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 14) return false;

  const chordTokens = tokens.filter((token) => CHORD_TOKEN_PATTERN.test(token));
  if (chordTokens.length === tokens.length) return true;

  return CHORD_LINE_PATTERN.test(clean) && chordTokens.length >= Math.max(1, Math.ceil(tokens.length * 0.45));
}

function createSpacedLine(items) {
  const sortedItems = [...items].sort((a, b) => a.left - b.left);
  const minLeft = Math.min(...sortedItems.map((item) => item.left));
  const averageWidth = Math.max(
    4,
    sortedItems.reduce((total, item) => total + item.width / Math.max(1, item.text.length), 0) / sortedItems.length,
  );

  let output = '';
  let cursor = 0;

  sortedItems.forEach((item) => {
    const targetColumn = Math.max(0, Math.round((item.left - minLeft) / averageWidth));
    const spaces = Math.max(1, targetColumn - cursor);
    output += ' '.repeat(spaces) + item.text;
    cursor = output.length;
  });

  return output.trimEnd();
}

function buildRawLines(items) {
  const sorted = [...items].sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.left - b.left;
  });

  const lineGroups = [];

  sorted.forEach((item) => {
    const tolerance = Math.max(5, item.fontSize * 0.5);
    let line = lineGroups.find((candidate) => Math.abs(candidate.top - item.top) <= tolerance);

    if (!line) {
      line = { top: item.top, items: [] };
      lineGroups.push(line);
    }

    line.items.push(item);
    line.top = (line.top + item.top) / 2;
  });

  return lineGroups
    .sort((a, b) => a.top - b.top)
    .map((line, index) => {
      const text = createSpacedLine(line.items);
      return {
        id: `line-${index}`,
        text,
        isChord: isChordLike(text),
      };
    })
    .filter((line) => line.text.trim());
}

export async function extractStagePages(source) {
  if (!source) return [];

  const pdfjs = await getPdfJs();
  const pdf = await loadPdfDocument(clonePdfSource(source));
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
      const rawItems = [];

      textContent.items.forEach((item, index) => {
        const text = normalizeText(item.str);
        if (!text) return;

        const transform = getPdfTransform(pdfjs, viewport, item);
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
          width: Math.max(1, item.width || text.length * Math.max(4, fontSize * 0.45)),
          fontSize: Math.max(8, fontSize),
        });
      });

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        lines: buildRawLines(rawItems),
      });
    }
  } finally {
    safelyDestroyPdf(pdf);
  }

  return pages;
}

export async function extractStagePagesFromPdf(source) {
  return extractStagePages(source);
}
