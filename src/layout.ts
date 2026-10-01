export type LayoutId = 'banner' | 'huge' | 'wall';
export type Crop = 'left' | 'right' | 'top' | 'bottom';

export interface LyricLine {
  text: string;
  gap: boolean;
}

export interface SheetModel {
  canvasW: number;
  canvasH: number;
  shiftX: number;
  shiftY: number;
  fontMm: number;
  align: 'left' | 'center';
  lines: LyricLine[];
  crops: Crop[];
  side: 'left' | 'right' | '';
}

export type Measure = (text: string, fontMm: number) => number;

export const LINE_HEIGHT = 1.55;
export const GAP_EM = 0.7;
export const PAD_X = 16;
export const PAD_Y = 14;

const SHEET_W = 420;
const SHEET_H = 297;
/** Shared strip so two A3 landscape sheets tape to about 83 cm. */
const OVERLAP = 10;

export function parseLyrics(raw: string): string[][] {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!text) return [];
  const stanzas: string[][] = [];
  for (const block of text.split(/\n[ \t]*\n/)) {
    const lines = block
      .split('\n')
      .map((line) => line.replace(/[ \t]+$/g, ''))
      .filter((line) => line.trim() !== '');
    if (lines.length) stanzas.push(lines);
  }
  return stanzas;
}

function flatten(stanzas: string[][]): LyricLine[] {
  const lines: LyricLine[] = [];
  stanzas.forEach((stanza, s) => {
    stanza.forEach((text, i) => {
      lines.push({ text, gap: s > 0 && i === 0 });
    });
  });
  return lines;
}

function blockHeight(lines: LyricLine[], fontMm: number): number {
  let height = 0;
  for (const line of lines) {
    if (line.gap) height += fontMm * GAP_EM;
    height += fontMm * LINE_HEIGHT;
  }
  return height;
}

export function fitFont(lines: LyricLine[], innerW: number, innerH: number, measure: Measure): number {
  if (!lines.length || innerW <= 0 || innerH <= 0) return 12;
  let lo = 4;
  let hi = 160;
  let best = lo;
  for (let n = 0; n < 22; n += 1) {
    const mid = (lo + hi) / 2;
    const wide = lines.some((line) => measure(line.text, mid) > innerW);
    const tall = blockHeight(lines, mid) > innerH;
    if (wide || tall) hi = mid;
    else {
      best = mid;
      lo = mid;
    }
  }
  return Math.floor(best * 10) / 10;
}

function tiled(
  lines: LyricLine[],
  cols: number,
  rows: number,
  align: 'left' | 'center',
  measure: Measure,
): SheetModel[] {
  const canvasW = cols * SHEET_W - (cols - 1) * OVERLAP;
  const canvasH = rows * SHEET_H - (rows - 1) * OVERLAP;
  const fontMm = fitFont(lines, canvasW - PAD_X * 2, canvasH - PAD_Y * 2, measure);
  const sheets: SheetModel[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const crops: Crop[] = [];
      if (col > 0) crops.push('left');
      if (col < cols - 1) crops.push('right');
      if (row > 0) crops.push('top');
      if (row < rows - 1) crops.push('bottom');
      const side: SheetModel['side'] = cols === 2 && rows === 1 ? (col === 0 ? 'left' : 'right') : '';
      sheets.push({
        canvasW,
        canvasH,
        shiftX: col * (SHEET_W - OVERLAP),
        shiftY: row * (SHEET_H - OVERLAP),
        fontMm,
        align,
        lines,
        crops,
        side,
      });
    }
  }
  return sheets;
}

export function buildSheets(raw: string, layout: LayoutId, measure: Measure): SheetModel[] {
  const stanzas = parseLyrics(raw);
  if (!stanzas.length) return [];
  if (layout === 'banner') {
    return stanzas.flatMap((stanza) =>
      tiled(
        stanza.map((text) => ({ text, gap: false })),
        2,
        1,
        'left',
        measure,
      ),
    );
  }
  if (layout === 'wall') {
    return tiled(flatten(stanzas), 3, 2, 'left', measure);
  }
  const lines = flatten(stanzas).map((line) => ({ text: line.text, gap: false }));
  const sheets: SheetModel[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    const pair = lines.slice(i, i + 2);
    const fontMm = fitFont(pair, SHEET_W - PAD_X * 2, SHEET_H - PAD_Y * 2, measure);
    sheets.push({
      canvasW: SHEET_W,
      canvasH: SHEET_H,
      shiftX: 0,
      shiftY: 0,
      fontMm,
      align: 'center',
      lines: pair,
      crops: [],
      side: '',
    });
  }
  return sheets;
}
