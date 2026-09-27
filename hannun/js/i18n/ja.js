// 日本語 — 미리 써 보기 화면과 페이지 스크립트의 문구 (키는 ko.js 와 같다)
// 앱 화면 문구는 앱의 Localizable.xcstrings(ja) · PRD §5.2.1 과 맞춘다.

export default {
  sample: { md: 'ja.md', json: 'ja.json', mdName: '屋上菜園の夏.md', jsonName: '観測記録.json' },

  title: { reading: n => `Hannunで[${n}]を見ています`, editing: n => `Hannunで[${n}]を直しています` },

  mode: { preview: 'プレビュー', split: '分割表示', edit: '編集' },
  shortcutMode: '表示モード（⌘/）',
  toc: '目次',
  tocShortcut: '目次（⌘⇧T）',
  width: '本文の幅',
  widths: { full: '全幅', wide: '広い', medium: '標準', narrow: '狭い' },
  typeTheme: '書体とテーマ',
  bodyFont: '本文',
  headFont: '見出し',
  serif: '明朝',
  sans: 'ゴシック',
  theme: 'テーマ',
  light: 'ライト',
  dark: 'ダーク',
  dataView: 'データ文書の表示',
  views: { source: 'ソース', tree: 'ツリー', list: 'リスト' },
  viewDefault: '標準',
  editor: 'エディタ',
  palette: '記法パレット',
  paletteHint: '記法パレット（⌥ を押したまま）',
  loadFail: 'プレビューを読み込めませんでした。インターネット接続をご確認ください。',
  zoomView: '拡大表示',
  zoomIn: '拡大',
  zoomOut: '縮小',

  diagramPending: '図を描いています…',
  diagramFail: '図を描けませんでした',
  remoteImage: 'インターネット上の画像は読み込みません',
  frontmatter: 'メタデータ',
  frontLabels: { title: 'タイトル', date: '日付', author: '作成者', tags: 'タグ', description: '説明' },

  types: { array: '配列', null: 'なし', object: '辞書', string: '文字列', number: '数値', boolean: 'ブール値' },
  items: n => `${n} 項目`,
  itemN: i => `項目 ${i}`,
  listHead: { key: 'キー', type: '型', value: '値' },
  root: 'ルート',
  jsonFail: 'JSON を読み込めませんでした',

  pal: {
    Digit1: '見出し 1', Digit2: '見出し 2', Digit3: '見出し 3', Digit4: '見出し 4', Digit5: '見出し 5', Digit6: '見出し 6',
    Digit0: '本文', KeyA: '見出し切替', KeyS: '太字', KeyD: '斜体', KeyF: '取り消し線', KeyG: 'コード',
    KeyH: '箇条書き', KeyJ: '番号付き', KeyK: 'チェック', KeyL: '引用', KeyZ: 'リンク', KeyX: '画像', KeyC: 'コードブロック', KeyV: '表', KeyB: '区切り線',
  },
  insert: { link: 'リンク', imageAlt: '説明', table: '| 項目 | 値 |\n|---|---|\n|  |  |\n' },

  prefsDone: 'デフォルトに設定済み',

  runHome: 'Markdown ビューア',
  runPrefix: 'Hannun — ',
  folio: n => `${n}ページ`,

  snip: {
    Digit1: ['見出し 1', '# 見出し'], Digit2: ['見出し 2', '## 見出し'], Digit3: ['見出し 3', '### 見出し'],
    Digit4: ['見出し 4', '#### 見出し'], Digit5: ['見出し 5', '##### 見出し'], Digit6: ['見出し 6', '###### 見出し'],
    Digit0: ['本文', '見出しを解除します'], KeyA: ['見出し切替', '# → ## → ### … → 本文'],
    KeyS: ['太字', '**文字**'], KeyD: ['斜体', '*文字*'], KeyF: ['取り消し線', '~~文字~~'], KeyG: ['インラインコード', '`文字`'],
    KeyH: ['箇条書き', '- 項目'], KeyJ: ['番号付きリスト', '1. 項目'], KeyK: ['チェックボックス', '- [ ] やること'], KeyL: ['引用', '> 引用文'],
    KeyZ: ['リンク', '[文字](https://)'], KeyX: ['画像', '![説明](images/)'], KeyC: ['コードブロック', '```'],
    KeyV: ['表', '| 項目 | 値 |'], KeyB: ['区切り線', '---'],
  },

  // 임시 문서 체험 — 상태 표시와 저장할 파일 이름
  scratch: { saved: '自動バックアップ済み', empty: '空', file: '無題' },

  // 원본 보존 — git diff 판
  gitdiff: { changed: n => `${n} 行の変更`, none: '変更なし' },

  // 원본 보존 — diff 비교에 처음 들어 있는 글 (Windows 에서 만든 회의록처럼 BOM + CRLF 로 다룬다)
  diffDoc: '# 週次ミーティング\n\n| 項目 | 担当 |\n|---|---|\n| リリース準備 | 空 |\n| スクリーンショット | 陽太 |\n\n* ヘルプの整理\n* 翻訳の確認\n',

  // 글꼴 빠른 전환 버튼 — 앱과 같은 모양(애플 textformat 이 언어마다 다르게 그린다)
  fontIcon: 'あぁ',
  auto: '自動',
}
