// English — strings for the live demo window and page scripts
// Keys must match ko.js exactly. App UI terms follow the app's English strings
// (Localizable.xcstrings) and PRD §5.2.1.

export default {
  sample: { md: 'en.md', json: 'en.json', mdName: 'rooftop-gardens.md', jsonName: 'field-log.json' },

  title: { reading: n => `Reading [${n}] in Hannun`, editing: n => `Editing [${n}] in Hannun` },

  mode: { preview: 'Preview', split: 'Split View', edit: 'Editor' },
  shortcutMode: 'View mode (⌘/)',
  toc: 'Table of Contents',
  tocShortcut: 'Table of Contents (⌘⇧T)',
  width: 'Content Width',
  widths: { full: 'Full', wide: 'Wide', medium: 'Medium', narrow: 'Narrow' },
  typeTheme: 'Fonts & Theme',
  bodyFont: 'Body',
  headFont: 'Headings',
  serif: 'Serif',
  sans: 'Sans-serif',
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  dataView: 'Data View',
  views: { source: 'Source', tree: 'Tree', list: 'List' },
  viewDefault: 'default',
  editor: 'Editor',
  palette: 'Syntax Palette',
  paletteHint: 'Syntax Palette (hold ⌥)',
  loadFail: "Couldn't load the preview. Check your internet connection.",
  zoomView: 'Zoomed view',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',

  diagramPending: 'Drawing diagram…',
  diagramFail: "Couldn't draw this diagram",
  remoteImage: 'Remote images are not loaded',
  frontmatter: 'Front matter',
  frontLabels: { title: 'Title', date: 'Date', author: 'Author', tags: 'Tags', description: 'Description' },

  types: { array: 'Array', null: 'Null', object: 'Dictionary', string: 'String', number: 'Number', boolean: 'Boolean' },
  items: n => (n === 1 ? '1 item' : `${n} items`),
  itemN: i => `Item ${i}`,
  listHead: { key: 'Key', type: 'Type', value: 'Value' },
  root: 'Root',
  jsonFail: "Couldn't read this JSON",

  pal: {
    Digit1: 'Heading 1', Digit2: 'Heading 2', Digit3: 'Heading 3', Digit4: 'Heading 4', Digit5: 'Heading 5', Digit6: 'Heading 6',
    Digit0: 'Body', KeyA: 'Cycle', KeyS: 'Bold', KeyD: 'Italic', KeyF: 'Strike', KeyG: 'Code',
    KeyH: 'Bullet', KeyJ: 'Numbered', KeyK: 'Checkbox', KeyL: 'Quote', KeyZ: 'Link', KeyX: 'Image', KeyC: 'Code Block', KeyV: 'Table', KeyB: 'Divider',
  },
  insert: { link: 'link', imageAlt: 'description', table: '| Item | Value |\n|---|---|\n|  |  |\n' },

  prefsDone: 'Default',

  runHome: 'Markdown Viewer',
  runPrefix: 'Hannun — ',
  folio: n => `p. ${n}`,

  snip: {
    Digit1: ['Heading 1', '# Heading'], Digit2: ['Heading 2', '## Heading'], Digit3: ['Heading 3', '### Heading'],
    Digit4: ['Heading 4', '#### Heading'], Digit5: ['Heading 5', '##### Heading'], Digit6: ['Heading 6', '###### Heading'],
    Digit0: ['Body text', 'Removes the heading'], KeyA: ['Cycle headings', '# → ## → ### … → body'],
    KeyS: ['Bold', '**text**'], KeyD: ['Italic', '*text*'], KeyF: ['Strikethrough', '~~text~~'], KeyG: ['Inline code', '`text`'],
    KeyH: ['Bullet', '- item'], KeyJ: ['Numbered list', '1. item'], KeyK: ['Checkbox', '- [ ] to-do'], KeyL: ['Quote', '> quote'],
    KeyZ: ['Link', '[text](https://)'], KeyX: ['Image', '![description](images/)'], KeyC: ['Code block', '```'],
    KeyV: ['Table', '| Item | Value |'], KeyB: ['Divider', '---'],
  },

  // 임시 문서 체험 — 상태 표시와 저장할 파일 이름
  scratch: { saved: 'Backed up', empty: 'Empty', file: 'Untitled' },

  // 원본 보존 — git diff 판
  gitdiff: { changed: n => `${n} line${n === 1 ? '' : 's'} changed`, none: 'No changes' },

  // 원본 보존 — diff 비교에 처음 들어 있는 글 (Windows 에서 만든 회의록처럼 BOM + CRLF 로 다룬다)
  diffDoc: '# Weekly sync\n\n| Task | Owner |\n|---|---|\n| Release prep | Sky |\n| Screenshots | Doyun |\n\n* Tidy up the help pages\n* Check translations\n',

  // 글꼴 빠른 전환 버튼 — 앱과 같은 모양(애플 textformat 이 언어마다 다르게 그린다)
  fontIcon: 'Aa',
  auto: 'Auto',
}
