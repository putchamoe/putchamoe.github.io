// 데이터 문서 보기 — 원문 · 트리 · 목록 (화면정의서 §3.13, HANNUN/web/src/data/)

import { esc } from './render.js'
import { T } from './i18n.js'

const isObj = v => v !== null && typeof v === 'object'
const entries = v => (Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v))

function scalar(v, quoted) {
  if (v === null) return '<span class="hn-data__null">null</span>'
  if (typeof v === 'string') return `<span class="hn-data__string">${esc(quoted ? JSON.stringify(v) : v)}</span>`
  if (typeof v === 'number') return `<span class="hn-data__number">${v}</span>`
  if (typeof v === 'boolean') return `<span class="hn-data__bool">${v}</span>`
  return esc(String(v))
}

// ── 원문 — 편집기와 같은 모양으로 괄호 단위 접기 ─────────────────────

function source(v, key, d, last) {
  const comma = last ? '' : '<span class="hn-data__punct">,</span>'
  const k = key == null ? '' : `<span class="hn-data__key">${esc(JSON.stringify(String(key)))}</span><span class="hn-data__punct">: </span>`
  if (isObj(v) && entries(v).length) {
    const [open, close] = Array.isArray(v) ? ['[', ']'] : ['{', '}']
    const kids = entries(v)
    const inner = kids.map(([ck, cv], i) => source(cv, Array.isArray(v) ? null : ck, d + 1, i === kids.length - 1)).join('')
    return `<details open><summary style="--d:${d}">${k}<span class="hn-data__punct">${open}</span><span class="hn-data__fold"> … <span class="hn-data__punct">${close}</span>${comma}</span></summary>${inner}<div class="hn-data__row" style="--d:${d}"><span class="hn-data__punct">${close}</span>${comma}</div></details>`
  }
  const empty = Array.isArray(v) ? '[]' : isObj(v) ? '{}' : null
  return `<div class="hn-data__row" style="--d:${d}">${k}${empty ? `<span class="hn-data__punct">${empty}</span>` : scalar(v, true)}${comma}</div>`
}

// ── 트리 — 이름과 값만. 같은 모양 항목이 줄지으면 표로 ────────────────

function sameShape(arr) {
  if (arr.length < 2 || !arr.every(x => isObj(x) && !Array.isArray(x))) return null
  const keys = Object.keys(arr[0])
  const sig = keys.join('\u0000')
  if (!arr.every(x => Object.keys(x).join('\u0000') === sig)) return null
  if (arr.some(x => Object.values(x).some(isObj))) return null
  return keys
}

function tree(v, key, d) {
  const label = key == null ? '' : typeof key === 'number' ? `<span class="hn-data__index">${key}</span>` : `<span class="hn-data__key">${esc(key)}</span>`
  if (isObj(v)) {
    const kids = entries(v)
    const count = `<span class="hn-data__count">${kids.length}</span>`
    const cols = Array.isArray(v) && sameShape(v)
    const body = cols
      ? `<div class="hn-data__table-wrap" style="--d:${d}"><table class="hn-data__table"><thead><tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${v
          .map((row, i) => `<tr><td class="hn-data__index is-num">${i}</td>${cols.map(c => `<td${typeof row[c] === 'number' ? ' class="is-num"' : ''}>${row[c] === null ? '<span class="hn-data__null">—</span>' : esc(row[c])}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`
      : kids.map(([ck, cv]) => tree(cv, ck, d + 1)).join('')
    if (key == null) return body
    return `<details open><summary style="--d:${d}">${label}${count}</summary>${body}</details>`
  }
  return `<div class="hn-data__row hn-data__leaf" style="--d:${d}">${label}${scalar(v, false)}</div>`
}

// ── 목록 — 키 · 형식 · 값 (Xcode 속성 목록) ──────────────────────────

const TYPE = v => (Array.isArray(v) ? T.types.array : v === null ? T.types.null : isObj(v) ? T.types.object : T.types[typeof v])

function list(v, key, d) {
  const kname = typeof key === 'number' ? T.itemN(key) : key
  const row = (val, cls = '') =>
    `<div class="hn-list__row ${cls}"><span class="hn-list__key" style="--d:${d}">${esc(kname)}</span><span class="hn-list__type">${TYPE(v)}</span><span class="hn-list__value">${val}</span></div>`
  if (isObj(v)) {
    const kids = entries(v)
    const inner = kids.map(([ck, cv]) => list(cv, ck, d + 1)).join('')
    return `<details${d < 1 ? ' open' : ''}><summary>${row(`<span class="hn-data__count">${esc(T.items(kids.length))}</span>`)}</summary>${inner}</details>`
  }
  return row(scalar(v, false))
}

/** @returns {string} html */
export function renderData(text, view) {
  let value
  try {
    value = JSON.parse(text)
  } catch (err) {
    return `<p style="font-family:var(--hn-font-sans);color:var(--hn-danger)">${esc(T.jsonFail)} — ${esc(err.message)}</p><pre><code>${esc(text)}</code></pre>`
  }
  if (view === 'tree') return `<div class="hn-data hn-data--tree">${tree(value, null, -1)}</div>`
  if (view === 'list') {
    const head = `<div class="hn-list__row hn-list__head"><span class="hn-list__key">${esc(T.listHead.key)}</span><span>${esc(T.listHead.type)}</span><span>${esc(T.listHead.value)}</span></div>`
    return `<div class="hn-data hn-data--list">${head}${list(value, T.root, 0)}</div>`
  }
  return `<div class="hn-data hn-data--source">${source(value, null, 0, true)}</div>`
}
