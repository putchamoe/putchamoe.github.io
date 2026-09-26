// 문법 팔레트 — 도움말 "문법 팔레트" 표 그대로. 모든 서식은 토글이다.

import { T } from './i18n.js'

const P = [
  { code: 'Digit1', key: '1', label: '제목 1', row: 'num' },
  { code: 'Digit2', key: '2', label: '제목 2', row: 'num' },
  { code: 'Digit3', key: '3', label: '제목 3', row: 'num' },
  { code: 'Digit4', key: '4', label: '제목 4', row: 'num' },
  { code: 'Digit5', key: '5', label: '제목 5', row: 'num' },
  { code: 'Digit6', key: '6', label: '제목 6', row: 'num' },
  { code: 'Digit0', key: '0', label: '본문', row: 'num' },
  { code: 'KeyA', key: 'A', label: '제목 순환', row: 'home' },
  { code: 'KeyS', key: 'S', label: '굵게', hint: '⌘B', row: 'home' },
  { code: 'KeyD', key: 'D', label: '기울임', hint: '⌘I', row: 'home' },
  { code: 'KeyF', key: 'F', label: '취소선', row: 'home' },
  { code: 'KeyG', key: 'G', label: '코드', row: 'home' },
  { code: 'KeyH', key: 'H', label: '불릿', row: 'home' },
  { code: 'KeyJ', key: 'J', label: '번호', row: 'home' },
  { code: 'KeyK', key: 'K', label: '체크', row: 'home' },
  { code: 'KeyL', key: 'L', label: '인용', row: 'home' },
  { code: 'KeyZ', key: 'Z', label: '링크', hint: '⌘K', row: 'low' },
  { code: 'KeyX', key: 'X', label: '이미지', row: 'low' },
  { code: 'KeyC', key: 'C', label: '코드블록', hint: '⌘⇧K', row: 'low' },
  { code: 'KeyV', key: 'V', label: '표', row: 'low' },
  { code: 'KeyB', key: 'B', label: '수평선', row: 'low' },
]
export const PALETTE = P.map(p => ({ ...p, label: T.pal[p.code] || p.label }))

function replace(ta, a, b, text, selA, selB) {
  ta.focus({ preventScroll: true })
  ta.setSelectionRange(a, b)
  // execCommand 로 넣어야 ⌘Z 되돌리기에 남는다
  const ok = document.execCommand && document.execCommand('insertText', false, text)
  if (!ok || ta.value.slice(a, a + text.length) !== text) ta.setRangeText(text, a, b, 'end')
  ta.setSelectionRange(a + selA, a + selB)
}

function wrap(ta, mark) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta
  const L = mark.length
  const sel = v.slice(s, e)
  const loneStar = mark === '*'
  if (sel.length >= 2 * L && sel.startsWith(mark) && sel.endsWith(mark) && !(loneStar && sel.startsWith('**'))) {
    const inner = sel.slice(L, -L)
    return replace(ta, s, e, inner, 0, inner.length)
  }
  const outside = v.slice(s - L, s) === mark && v.slice(e, e + L) === mark
  const notDouble = !loneStar || (v[s - 2] !== '*' && v[e + 1] !== '*')
  if (s >= L && outside && notDouble) {
    return replace(ta, s - L, e + L, sel, 0, sel.length)
  }
  const text = sel || ''
  replace(ta, s, e, mark + text + mark, L, L + text.length)
}

const LIST_RE = /^(\s*)(?:[-*+] \[[ xX]\] |[-*+] |\d+\. )/
const KINDS = {
  KeyH: { test: /^\s*[-*+] (?!\[[ xX]\] )/, make: () => '- ' },
  KeyJ: { test: /^\s*\d+\. /, make: i => `${i + 1}. ` },
  KeyK: { test: /^\s*[-*+] \[[ xX]\] /, make: () => '- [ ] ' },
  KeyL: { test: /^> ?/, make: () => '> ', strip: /^> ?/ },
}

function lineRange(ta) {
  const v = ta.value
  const s = ta.selectionStart
  const e = ta.selectionEnd
  const a = v.lastIndexOf('\n', s - 1) + 1
  let b = v.indexOf('\n', e > s && v[e - 1] === '\n' ? e - 1 : e)
  if (b < 0) b = v.length
  return [a, b]
}

function mapLines(ta, fn) {
  const [a, b] = lineRange(ta)
  const caret = ta.selectionStart === ta.selectionEnd
  const lines = ta.value.slice(a, b).split('\n')
  const out = fn(lines).join('\n')
  if (caret) replace(ta, a, b, out, out.split('\n')[0].length, out.split('\n')[0].length)
  else replace(ta, a, b, out, 0, out.length)
}

function toggleList(ta, code) {
  const kind = KINDS[code]
  mapLines(ta, lines => {
    const all = lines.filter(l => l.trim()).every(l => kind.test.test(l))
    return lines.map((l, i) => {
      if (!l.trim() && lines.length > 1) return l
      if (all) return l.replace(kind.strip || LIST_RE, '$1')
      const base = kind.strip ? l : l.replace(LIST_RE, '$1')
      const indent = /^\s*/.exec(base)[0]
      return indent + kind.make(i) + base.slice(indent.length)
    })
  })
}

function heading(ta, n) {
  mapLines(ta, lines =>
    lines.map(l => {
      const cur = /^(#{1,6}) /.exec(l)
      const body = l.replace(/^#{1,6} /, '')
      if (n === 0 || (cur && cur[1].length === n)) return body
      return '#'.repeat(n) + ' ' + body
    }),
  )
}

function cycleHeading(ta) {
  const [a] = lineRange(ta)
  const cur = /^(#{1,6}) /.exec(ta.value.slice(a))
  const next = cur ? (cur[1].length + 1) % 7 : 1
  heading(ta, next)
}

function insertBlock(ta, text, selA, selB) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta
  const pre = s > 0 && v[s - 1] !== '\n' ? '\n\n' : s > 1 && v[s - 2] !== '\n' ? '\n' : ''
  replace(ta, s, e, pre + text, pre.length + selA, pre.length + selB)
}

export function applyFormat(ta, code) {
  const { selectionStart: s, selectionEnd: e, value: v } = ta
  const sel = v.slice(s, e)
  switch (code) {
    case 'KeyS': return wrap(ta, '**'), true
    case 'KeyD': return wrap(ta, '*'), true
    case 'KeyF': return wrap(ta, '~~'), true
    case 'KeyG': return wrap(ta, '`'), true
    case 'KeyH': case 'KeyJ': case 'KeyK': case 'KeyL': return toggleList(ta, code), true
    case 'KeyA': return cycleHeading(ta), true
    case 'Digit0': return heading(ta, 0), true
    case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5': case 'Digit6':
      return heading(ta, +code.slice(5)), true
    case 'KeyZ': {
      const m = /^\[([^\]]*)\]\(([^)]*)\)$/.exec(sel)
      if (m) return replace(ta, s, e, m[1], 0, m[1].length), true
      const label = sel || T.insert.link
      return replace(ta, s, e, `[${label}](https://)`, label.length + 3, label.length + 11), true
    }
    case 'KeyX': {
      const alt = sel || T.insert.imageAlt
      return replace(ta, s, e, `![${alt}](images/)`, alt.length + 4, alt.length + 11), true
    }
    case 'KeyC': {
      const m = /^```[^\n]*\n([\s\S]*?)\n?```$/.exec(sel)
      if (m) return replace(ta, s, e, m[1], 0, m[1].length), true
      return insertBlock(ta, '```\n' + sel + '\n```\n', 4, 4 + sel.length), true
    }
    case 'KeyV':
      return insertBlock(ta, T.insert.table, 2, T.insert.table.indexOf(' |', 2)), true
    case 'KeyB':
      return insertBlock(ta, '---\n', 4, 4), true
  }
  return false
}
