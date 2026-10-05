export type Lang = 'ja' | 'en';

export interface Dict {
  app: string;
  lead: string;
  lyrics: string;
  placeholder: string;
  hint: string;
  banner: string;
  bannerHelp: string;
  huge: string;
  hugeHelp: string;
  wall: string;
  wallHelp: string;
  print: string;
  printNote: string;
  saveFail: string;
  needLyrics: string;
  empty: string;
  left: string;
  right: string;
  langLabel: string;
  ja: string;
  en: string;
}

export const dicts: Record<Lang, Dict> = {
  ja: {
    app: 'でか文字',
    lead: '歌詞を大きく印刷する',
    lyrics: '歌詞',
    placeholder: 'ここに貼る',
    hint: '空行で番が分かれる',
    banner: '横長く貼る',
    bannerHelp: '番ごとにA3横を2枚。重ねて貼ると約83cm。',
    huge: 'でかいまま',
    hugeHelp: '1枚に2行。そのまま貼る。',
    wall: 'かべの一枚',
    wallHelp: '歌全体をA3の2×3。',
    print: '印刷',
    printNote: '100%（実際のサイズ）で印刷。「用紙に合わせる」はオフ。A3・横。',
    saveFail: '保存できませんでした。文字はそのまま残しています。',
    needLyrics: '歌詞を貼ってから印刷',
    empty: '歌詞を貼ると、ここに見本が出ます',
    left: '左',
    right: '右',
    langLabel: '言語',
    ja: '日本語',
    en: 'English',
  },
  en: {
    app: 'Lyrics Enlarger',
    lead: 'Print lyrics big',
    lyrics: 'Lyrics',
    placeholder: 'Paste here',
    hint: 'A blank line starts a verse',
    banner: 'Wide banner',
    bannerHelp: 'Two A3 landscape sheets per verse. Taped, about 83 cm.',
    huge: 'Huge type',
    hugeHelp: 'Two lines on a sheet. No taping.',
    wall: 'Wall chart',
    wallHelp: 'The whole song on a 2×3 grid of A3.',
    print: 'Print',
    printNote: 'Print at 100% (actual size). Do not fit to page. A3 landscape.',
    saveFail: 'Could not save on this device. Your text is still here.',
    needLyrics: 'Paste lyrics before printing',
    empty: 'Paste lyrics to see a preview',
    left: 'Left',
    right: 'Right',
    langLabel: 'Language',
    ja: '日本語',
    en: 'English',
  },
};
