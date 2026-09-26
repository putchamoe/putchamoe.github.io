// 한국어 — 미리 써 보기 화면과 페이지 스크립트의 문구
// 다른 언어 파일은 이 파일과 **키가 똑같아야** 한다. 값만 그 언어로 쓴다.
// 앱 화면 문구(창 제목, 모드 이름 등)는 앱의 Localizable.xcstrings · PRD §5.2.1 과 맞춘다.

export default {
  // 샘플 문서 — hannun/sample/ 아래 파일과 탭에 보일 이름
  sample: { md: 'ko.md', json: 'ko.json', mdName: '옥상-텃밭의-여름.md', jsonName: '관측-기록.json' },

  // 창 제목 (PRD §5.2.1) — 대괄호는 실제로 표시한다
  title: { reading: n => `한눈에 [${n}] 보는 중`, editing: n => `한눈에 [${n}] 고치는 중` },

  mode: { preview: '프리뷰', split: '분할 보기', edit: '편집' },
  shortcutMode: '보기 모드 (⌘/)',
  toc: '목차',
  tocShortcut: '목차 (⌘⇧T)',
  width: '본문 너비',
  widths: { full: '전체', wide: '넓게', medium: '보통', narrow: '좁게' },
  typeTheme: '글꼴과 테마',
  bodyFont: '본문',
  headFont: '제목',
  serif: '명조',
  sans: '고딕',
  theme: '테마',
  light: '라이트',
  dark: '다크',
  dataView: '데이터 문서 보기',
  views: { source: '원문', tree: '트리', list: '목록' },
  viewDefault: '기본',
  editor: '편집기',
  palette: '문법 팔레트',
  paletteHint: '문법 팔레트 (⌥ 누르고 있기)',
  loadFail: '미리보기를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.',
  zoomView: '확대 보기',
  zoomIn: '확대',
  zoomOut: '축소',

  // 렌더러
  diagramPending: '다이어그램을 그리는 중…',
  diagramFail: '다이어그램을 그리지 못했습니다',
  remoteImage: '외부 이미지는 불러오지 않습니다',
  frontmatter: '머리말',
  frontLabels: { title: '제목', date: '날짜', author: '작성자', tags: '태그', description: '설명' },

  // 데이터 문서 보기 — 목록 보기의 형식 이름
  types: { array: '배열', null: '없음', object: '딕셔너리', string: '문자열', number: '숫자', boolean: '불리언' },
  items: n => `항목 ${n}개`,
  itemN: i => `항목 ${i}`,
  listHead: { key: '키', type: '형식', value: '값' },
  root: '최상위',
  jsonFail: 'JSON을 읽지 못했습니다',

  // 문법 팔레트 — 키 이름과 넣는 글
  pal: {
    Digit1: '제목 1', Digit2: '제목 2', Digit3: '제목 3', Digit4: '제목 4', Digit5: '제목 5', Digit6: '제목 6',
    Digit0: '본문', KeyA: '제목 순환', KeyS: '굵게', KeyD: '기울임', KeyF: '취소선', KeyG: '코드',
    KeyH: '불릿', KeyJ: '번호', KeyK: '체크', KeyL: '인용', KeyZ: '링크', KeyX: '이미지', KeyC: '코드블록', KeyV: '표', KeyB: '수평선',
  },
  insert: { link: '링크', imageAlt: '설명', table: '| 항목 | 값 |\n|---|---|\n|  |  |\n' },

  // 기본 앱 설정 그림 — 버튼을 누르면 바뀌는 글
  prefsDone: '기본 앱으로 설정됨',

  // 페이지 — 머리말(난외 표제)과 쪽수
  runHome: '마크다운 뷰어',
  runPrefix: '한눈 — ',
  folio: n => `${n}쪽`,

  // 원본 보존 — 바이트 보기에 처음 들어가 있는 글
  bytesText: '# 주간 회의\n- 날짜: 9월 26일\n- 참석: 네 명\n',

  // 문법 팔레트 판 — ⌥ + 키를 누르면 보여 줄 이름과 예시
  snip: {
    Digit1: ['제목 1', '# 제목'], Digit2: ['제목 2', '## 제목'], Digit3: ['제목 3', '### 제목'],
    Digit4: ['제목 4', '#### 제목'], Digit5: ['제목 5', '##### 제목'], Digit6: ['제목 6', '###### 제목'],
    Digit0: ['본문', '제목 표시를 없앱니다'], KeyA: ['제목 순환', '# → ## → ### … → 본문'],
    KeyS: ['굵게', '**글자**'], KeyD: ['기울임', '*글자*'], KeyF: ['취소선', '~~글자~~'], KeyG: ['인라인 코드', '`글자`'],
    KeyH: ['불릿', '- 항목'], KeyJ: ['번호 목록', '1. 항목'], KeyK: ['체크박스', '- [ ] 할 일'], KeyL: ['인용', '> 인용문'],
    KeyZ: ['링크', '[글자](https://)'], KeyX: ['이미지', '![설명](images/)'], KeyC: ['코드 블록', '```'],
    KeyV: ['표', '| 항목 | 값 |'], KeyB: ['수평선', '---'],
  },
}
