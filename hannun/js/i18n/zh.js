// 简体中文 — 试用窗口与页面脚本的文案（键与 ko.js 完全相同）
// 应用界面用语与 Localizable.xcstrings 的 zh-Hans 译文、PRD §5.2.1 保持一致。

export default {
  sample: { md: 'zh.md', json: 'zh.json', mdName: '屋顶菜园有多凉快.md', jsonName: '观测记录.json' },

  title: { reading: n => `正在 Hannun 中阅读[${n}]`, editing: n => `正在 Hannun 中编辑[${n}]` },

  mode: { preview: '预览', split: '分栏', edit: '编辑' },
  shortcutMode: '显示模式（⌘/）',
  toc: '目录',
  tocShortcut: '目录（⌘⇧T）',
  width: '正文宽度',
  widths: { full: '全宽', wide: '宽', medium: '中等', narrow: '窄' },
  typeTheme: '字体与主题',
  bodyFont: '正文',
  headFont: '标题',
  serif: '宋体',
  sans: '黑体',
  theme: '主题',
  light: '浅色',
  dark: '深色',
  dataView: '数据文档显示',
  views: { source: '源文本', tree: '树', list: '列表' },
  viewDefault: '默认',
  editor: '编辑器',
  palette: '语法面板',
  paletteHint: '语法面板（按住 ⌥）',
  loadFail: '无法载入预览，请检查网络连接。',
  zoomView: '放大查看',
  zoomIn: '放大',
  zoomOut: '缩小',

  diagramPending: '正在绘制图表…',
  diagramFail: '无法绘制图表',
  remoteImage: '不加载外部图片',
  frontmatter: '文档信息',
  frontLabels: { title: '标题', date: '日期', author: '作者', tags: '标签', description: '描述' },

  types: { array: '数组', null: '空', object: '字典', string: '字符串', number: '数字', boolean: '布尔值' },
  items: n => `${n} 项`,
  itemN: i => `第 ${i} 项`,
  listHead: { key: '键', type: '类型', value: '值' },
  root: '根',
  jsonFail: '无法读取 JSON',

  pal: {
    Digit1: '标题 1', Digit2: '标题 2', Digit3: '标题 3', Digit4: '标题 4', Digit5: '标题 5', Digit6: '标题 6',
    Digit0: '正文', KeyA: '切换标题', KeyS: '粗体', KeyD: '斜体', KeyF: '删除线', KeyG: '代码',
    KeyH: '项目符号', KeyJ: '编号', KeyK: '复选框', KeyL: '引用', KeyZ: '链接', KeyX: '图像', KeyC: '代码块', KeyV: '表格', KeyB: '分隔线',
  },
  insert: { link: '链接', imageAlt: '说明', table: '| 项目 | 值 |\n|---|---|\n|  |  |\n' },

  prefsDone: '已设为默认',

  runHome: 'Markdown 阅读器',
  runPrefix: 'Hannun — ',
  folio: n => `第 ${n} 页`,

  snip: {
    Digit1: ['标题 1', '# 标题'], Digit2: ['标题 2', '## 标题'], Digit3: ['标题 3', '### 标题'],
    Digit4: ['标题 4', '#### 标题'], Digit5: ['标题 5', '##### 标题'], Digit6: ['标题 6', '###### 标题'],
    Digit0: ['正文', '去掉标题标记'], KeyA: ['切换标题', '# → ## → ### … → 正文'],
    KeyS: ['粗体', '**文字**'], KeyD: ['斜体', '*文字*'], KeyF: ['删除线', '~~文字~~'], KeyG: ['行内代码', '`文字`'],
    KeyH: ['项目符号', '- 项目'], KeyJ: ['编号列表', '1. 项目'], KeyK: ['复选框', '- [ ] 待办'], KeyL: ['引用', '> 引用内容'],
    KeyZ: ['链接', '[文字](https://)'], KeyX: ['图像', '![说明](images/)'], KeyC: ['代码块', '```'],
    KeyV: ['表格', '| 项目 | 值 |'], KeyB: ['分隔线', '---'],
  },

  // 임시 문서 체험 — 상태 표시와 저장할 파일 이름
  scratch: { saved: '已自动备份', empty: '空白', file: '无标题' },

  // 원본 보존 — git diff 판
  gitdiff: { changed: n => `${n} 行有改动`, none: '没有改动' },

  // 원본 보존 — diff 비교에 처음 들어 있는 글 (Windows 에서 만든 회의록처럼 BOM + CRLF 로 다룬다)
  diffDoc: '# 周会\n\n| 事项 | 负责人 |\n|---|---|\n| 发布准备 | 天天 |\n| 截图 | 小雨 |\n\n* 整理帮助文档\n* 检查翻译\n',

  // 글꼴 빠른 전환 버튼 — 앱과 같은 모양(애플 textformat 이 언어마다 다르게 그린다)
  fontIcon: '格式',
  auto: '自动',
}
