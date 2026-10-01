# でか文字（Deka Moji）

歌詞を大きな文字で A3 横に印刷する PWA。**無料・広告なし・ログイン不要・オフライン対応。**

幼稚園の英語の授業で、床から読める歌詞ポスターを作るためのものです。画面の言葉は日本語と English。歌詞そのものは翻訳しません。

## できること

- 歌詞を貼る。最初は空欄
- 三つの印刷
  - **横長く貼る** — 番（空行で区切る）ごとに A3 横を 2 枚。少し重ねて貼ると幅約 83cm
  - **でかいまま** — 1 枚に 2 行。貼り合わせなし
  - **かべの一枚** — 歌全体を A3 横の 2×3（2 段・3 列）
- 印刷は 100%（実際のサイズ）。「用紙に合わせる」はオフ。用紙は A3・横
- 最後の歌詞と表示言語は IndexedDB にだけ保存

文字は Andika Bold（SIL Open Font License 1.1）。ライセンスは `OFL.txt`。

## English

**Deka Moji** prints lyrics as large A3 landscape posters. Free, no ads, no login, offline. The screen is Japanese or English. Pasted lyrics are not translated.

- Starts empty. Paste lyrics.
- **Wide banner** — each verse (split by a blank line) is two A3 landscape sheets. Tape them with a small overlap, about 83 cm wide.
- **Huge type** — two lines on one sheet. Hang as-is.
- **Wall chart** — the whole song as a 2×3 grid of A3 sheets (2 rows, 3 columns).
- Print at 100% (actual size). Do not fit to page. Paper: A3 landscape.
- Last lyrics and the chosen language stay in IndexedDB on this device.

Typeface: Andika Bold, SIL Open Font License 1.1. See `OFL.txt`.

## 開発 / Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vite + vanilla TypeScript + vite-plugin-pwa（`registerType: 'autoUpdate'`, `base: './'`）。
