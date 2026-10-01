import './andika.css';
import './style.css';
import { dicts, type Dict, type Lang } from './i18n';
import { askPersist, idbLoad, idbPutNow, idbSave } from './db';
import {
  GAP_EM,
  LINE_HEIGHT,
  PAD_X,
  PAD_Y,
  buildSheets,
  type LayoutId,
  type Measure,
  type SheetModel,
} from './layout';

const DB = 'deka-moji';

interface State {
  lang: Lang;
  lyrics: string;
}

let state: State = { lang: 'ja', lyrics: '' };
let layout: LayoutId = 'banner';
let t: Dict = dicts.ja;
let saveFailed = false;
let needLyrics = false;

const appEl = document.getElementById('app');
if (!appEl) throw new Error('missing app');
const app: HTMLElement = appEl;

const MM = 96 / 25.4;
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

const measure: Measure = (text, fontMm) => {
  if (!measureCtx) return text.length * fontMm * 0.55;
  const px = fontMm * MM;
  measureCtx.font = `700 ${px}px Andika`;
  const width = measureCtx.measureText(text).width;
  if (!width) return text.length * fontMm * 0.55;
  return width / MM;
};

function isLang(v: unknown): v is Lang {
  return v === 'ja' || v === 'en';
}

function normalize(raw: unknown): State {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    lang: isLang(o.lang) ? o.lang : 'ja',
    lyrics: typeof o.lyrics === 'string' ? o.lyrics : '',
  };
}

let saveChain: Promise<void> = Promise.resolve();
let saveQueued = false;

function queueSave(): void {
  saveQueued = true;
  saveChain = saveChain
    .then(async () => {
      if (!saveQueued) return;
      saveQueued = false;
      try {
        await idbSave(DB, state);
        saveFailed = false;
        const banner = document.getElementById('save-banner');
        if (banner) banner.hidden = true;
      } catch {
        saveFailed = true;
        const banner = document.getElementById('save-banner');
        if (banner) banner.hidden = false;
      }
    })
    .catch(() => {
      saveFailed = true;
      const banner = document.getElementById('save-banner');
      if (banner) banner.hidden = false;
    });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) queueSave();
});
window.addEventListener('pagehide', () => {
  idbPutNow(DB, state);
  queueSave();
});

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string | null | undefined>,
  ...kids: Array<Node | string | null>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const kid of kids) {
    if (kid == null) continue;
    node.append(kid);
  }
  return node;
}

function sheetEl(model: SheetModel): HTMLElement {
  const canvas = el('div', {
    class: model.align === 'center' ? 'canvas center' : 'canvas',
  });
  canvas.style.width = `${model.canvasW}mm`;
  canvas.style.height = `${model.canvasH}mm`;
  canvas.style.marginLeft = `${-model.shiftX}mm`;
  canvas.style.marginTop = `${-model.shiftY}mm`;
  canvas.style.fontSize = `${model.fontMm}mm`;
  canvas.style.lineHeight = String(LINE_HEIGHT);
  canvas.style.padding = `${PAD_Y}mm ${PAD_X}mm`;
  for (const line of model.lines) {
    const p = el('p', { class: line.gap ? 'line gap' : 'line' });
    if (line.gap) p.style.marginTop = `${GAP_EM}em`;
    p.textContent = line.text;
    canvas.append(p);
  }
  const sheet = el('section', { class: 'sheet' }, canvas);
  for (const edge of model.crops) {
    sheet.append(el('div', { class: `crop crop-${edge}`, 'aria-hidden': 'true' }));
  }
  return sheet;
}

function draw(): void {
  const stage = document.getElementById('stage');
  const empty = document.getElementById('empty');
  if (!stage || !empty) return;
  stage.dataset.layout = layout;
  stage.replaceChildren();
  const lyrics = state.lyrics;
  const sheets = buildSheets(lyrics, layout, measure);
  if (!sheets.length) {
    empty.hidden = false;
    empty.textContent = t.empty;
    return;
  }
  empty.hidden = true;
  if (layout === 'banner') {
    for (let i = 0; i < sheets.length; i += 2) {
      const pair = sheets.slice(i, i + 2);
      const caps = el('div', { class: 'sheets' });
      for (const model of pair) {
        const capText = model.side === 'left' ? t.left : model.side === 'right' ? t.right : '';
        const group = el(
          'div',
          { class: 'group' },
          capText ? el('p', { class: 'cap no-print' }, capText) : null,
          sheetEl(model),
        );
        caps.append(group);
      }
      stage.append(caps);
    }
    return;
  }
  const wrap = el('div', { class: 'sheets' });
  for (const model of sheets) wrap.append(sheetEl(model));
  stage.append(wrap);
}

function applyLang(): void {
  t = dicts[state.lang];
  document.documentElement.lang = state.lang;
  document.title = t.app;
  const title = document.getElementById('title');
  const lead = document.getElementById('lead');
  const label = document.getElementById('lyrics-label');
  const box = document.getElementById('lyrics');
  const hint = document.getElementById('hint');
  const note = document.getElementById('print-note');
  const print = document.getElementById('print');
  const banner = document.getElementById('save-banner');
  const need = document.getElementById('need');
  const ja = document.getElementById('lang-ja');
  const en = document.getElementById('lang-en');
  if (title) title.textContent = t.app;
  if (lead) lead.textContent = t.lead;
  if (label) label.firstChild && (label.firstChild.textContent = t.lyrics);
  if (box instanceof HTMLTextAreaElement) box.placeholder = t.placeholder;
  if (hint) hint.textContent = t.hint;
  if (note) note.textContent = t.printNote;
  if (print) print.textContent = t.print;
  if (banner) banner.textContent = t.saveFail;
  if (need) {
    need.textContent = t.needLyrics;
    need.hidden = !needLyrics;
  }
  if (ja) ja.setAttribute('aria-pressed', state.lang === 'ja' ? 'true' : 'false');
  if (en) en.setAttribute('aria-pressed', state.lang === 'en' ? 'true' : 'false');
  const bannerBtn = document.getElementById('layout-banner');
  const hugeBtn = document.getElementById('layout-huge');
  const wallBtn = document.getElementById('layout-wall');
  if (bannerBtn) {
    bannerBtn.replaceChildren(t.banner, el('small', {}, t.bannerHelp));
    bannerBtn.setAttribute('aria-checked', layout === 'banner' ? 'true' : 'false');
  }
  if (hugeBtn) {
    hugeBtn.replaceChildren(t.huge, el('small', {}, t.hugeHelp));
    hugeBtn.setAttribute('aria-checked', layout === 'huge' ? 'true' : 'false');
  }
  if (wallBtn) {
    wallBtn.replaceChildren(t.wall, el('small', {}, t.wallHelp));
    wallBtn.setAttribute('aria-checked', layout === 'wall' ? 'true' : 'false');
  }
  const langs = document.querySelector('.langs');
  if (langs) langs.setAttribute('aria-label', t.langLabel);
  draw();
}

function setLang(lang: Lang): void {
  if (state.lang === lang) return;
  state.lang = lang;
  queueSave();
  applyLang();
}

function setLayout(next: LayoutId): void {
  layout = next;
  needLyrics = false;
  applyLang();
}

function render(): void {
  const box = el('textarea', {
    id: 'lyrics',
    rows: '8',
    spellcheck: 'false',
    autocomplete: 'off',
  });
  box.value = state.lyrics;
  box.addEventListener('input', () => {
    state.lyrics = box.value;
    needLyrics = false;
    const need = document.getElementById('need');
    if (need) need.hidden = true;
    queueSave();
    draw();
  });

  const label = el('label', { class: 'field no-print', id: 'lyrics-label', for: 'lyrics' }, t.lyrics, box);

  app.replaceChildren(
    el('div', { class: 'app' },
      el('header', { class: 'top no-print' },
        el('div', {},
          el('h1', { id: 'title' }, t.app),
          el('p', { class: 'lead', id: 'lead' }, t.lead),
        ),
        el('div', { class: 'langs', role: 'group' },
          el('button', { type: 'button', class: 'lang', id: 'lang-ja' }, dicts.ja.ja),
          el('button', { type: 'button', class: 'lang', id: 'lang-en' }, dicts.en.en),
        ),
      ),
      el('p', { class: 'save no-print', id: 'save-banner', role: 'status', hidden: saveFailed ? null : 'hidden' }, t.saveFail),
      label,
      el('p', { class: 'hint no-print', id: 'hint' }, t.hint),
      el('div', { class: 'layouts no-print', role: 'radiogroup', id: 'layouts' },
        el('button', { type: 'button', class: 'choice', id: 'layout-banner', role: 'radio' }),
        el('button', { type: 'button', class: 'choice', id: 'layout-huge', role: 'radio' }),
        el('button', { type: 'button', class: 'choice', id: 'layout-wall', role: 'radio' }),
      ),
      el('div', { class: 'row no-print' },
        el('button', { type: 'button', class: 'print', id: 'print' }, t.print),
        el('p', { class: 'note', id: 'print-note' }, t.printNote),
      ),
      el('p', { class: 'need no-print', id: 'need', hidden: 'hidden' }, t.needLyrics),
      el('div', { class: 'preview' },
        el('p', { class: 'empty no-print', id: 'empty' }, t.empty),
        el('div', { class: 'stage', id: 'stage' }),
      ),
    ),
  );

  document.getElementById('lang-ja')?.addEventListener('click', () => setLang('ja'));
  document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('layout-banner')?.addEventListener('click', () => setLayout('banner'));
  document.getElementById('layout-huge')?.addEventListener('click', () => setLayout('huge'));
  document.getElementById('layout-wall')?.addEventListener('click', () => setLayout('wall'));
  document.getElementById('print')?.addEventListener('click', () => {
    if (!state.lyrics.trim()) {
      needLyrics = true;
      const need = document.getElementById('need');
      if (need) need.hidden = false;
      return;
    }
    needLyrics = false;
    window.print();
  });
  applyLang();
}

async function boot(): Promise<void> {
  await askPersist();
  try {
    state = normalize(await idbLoad(DB));
  } catch {
    state = normalize({});
    saveFailed = true;
  }
  try {
    await document.fonts.load('700 48px Andika');
    await document.fonts.ready;
  } catch {
    /* system fallback still prints */
  }
  render();
  queueSave();
}

void boot();
