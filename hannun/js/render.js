// 마크다운 렌더 — 한눈 앱의 파이프라인(HANNUN/web/src/renderer.js)을 줄여 옮긴 것
//
//   마크다운 → 수식 자리 표시 → marked → DOMPurify → 수식·코드·다이어그램 채우기
//
// 라이브러리 판은 앱과 같게 고정한다 (HANNUN/web/package.json).

const CDN = 'https://cdn.jsdelivr.net/npm/'
const V = { marked: '18.0.11', purify: '3.4.14', katex: '0.18.4', mermaid: '11.17.1', prism: '1.30.0' }

let libsPromise = null
let mermaidPromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.append(s)
  })
}

async function loadPrism() {
  window.Prism = window.Prism || {}
  window.Prism.manual = true
  const base = `${CDN}prismjs@${V.prism}/components/`
  await loadScript(base + 'prism-core.min.js')
  // clike 가 javascript 보다 먼저 와야 한다
  for (const lang of ['clike', 'javascript', 'python', 'json', 'bash', 'yaml', 'markup']) {
    await loadScript(`${base}prism-${lang}.min.js`)
  }
}

export function loadLibs() {
  libsPromise ??= (async () => {
    const [{ marked }, { default: DOMPurify }, katexMod] = await Promise.all([
      import(`${CDN}marked@${V.marked}/lib/marked.esm.js`),
      import(`${CDN}dompurify@${V.purify}/dist/purify.es.mjs`),
      import(`${CDN}katex@${V.katex}/dist/katex.mjs`),
      loadPrism(),
    ])
    configureMarked(marked)
    return { marked, DOMPurify, katex: katexMod.default }
  })()
  return libsPromise
}

function loadMermaid() {
  mermaidPromise ??= import(`${CDN}mermaid@${V.mermaid}/dist/mermaid.esm.min.mjs`).then(m => m.default)
  return mermaidPromise
}

import { T } from './i18n.js'

export const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function configureMarked(marked) {
  marked.use({
    gfm: true,
    breaks: false,
    tokenizer: {
      // 앱과 같다 — 물결 하나(A~D, 10~20도)는 취소선이 아니다
      del(src) {
        const cap = /^~~(?=[^\s~])([\s\S]*?[^\s~])~~(?!~)/.exec(src)
        if (cap) return { type: 'del', raw: cap[0], text: cap[1], tokens: this.lexer.inlineTokens(cap[1]) }
        return undefined
      },
    },
    renderer: {
      code({ text, lang }) {
        const l = (lang || '').trim().split(/\s+/)[0].toLowerCase()
        if (l === 'mermaid') {
          return `<div class="hn-mermaid is-pending" data-mermaid="${esc(encodeURIComponent(text))}">${esc(T.diagramPending)}</div>\n`
        }
        return `<pre><code class="language-${esc(l || 'none')}">${esc(text)}</code></pre>\n`
      },
    },
  })
}

// ── 머리말(YAML frontmatter) ─────────────────────────────────────────────

function splitFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(md)
  if (!m) return { meta: null, body: md }
  const meta = []
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([^:#\s][^:]*):\s*(.*)$/.exec(line)
    if (!kv) continue
    let value = kv[2].trim()
    const arr = /^\[(.*)\]$/.exec(value)
    meta.push({ key: kv[1].trim(), value: arr ? arr[1].split(',').map(s => s.trim()).filter(Boolean) : value.replace(/^["']|["']$/g, '') })
  }
  return { meta, body: md.slice(m[0].length) }
}

// 앱과 같다 (HANNUN/web/src/frontmatter.js) — 아는 키는 우리말 이름으로, 정해진 순서로. 제목은 카드 머리에만
const KNOWN = T.frontLabels
const ORDER = ['title', 'date', 'author', 'tags', 'description']

function frontmatterCard(meta) {
  const title = meta.find(x => x.key.toLowerCase() === 'title')?.value || T.frontmatter
  const rank = k => { const i = ORDER.indexOf(k.toLowerCase()); return i < 0 ? ORDER.length : i }
  const rows = [...meta]
    .filter(x => x.key.toLowerCase() !== 'title')
    .sort((a, b) => rank(a.key) - rank(b.key))
    .map(({ key, value }) => {
      const v = Array.isArray(value) ? value.map(t => `<span class="hn-tag">${esc(t)}</span>`).join('') : esc(value)
      return `<dt>${esc(KNOWN[key.toLowerCase()] || key)}</dt><dd>${v}</dd>`
    })
    .join('')
  const el = document.createElement('details')
  el.className = 'hn-frontmatter'
  el.open = true
  el.innerHTML = `<summary><span class="hn-frontmatter__title">${esc(title)}</span><span class="hn-frontmatter__chevron"></span></summary><dl>${rows}</dl>`
  return el
}

// ── 수식 — 코드 안의 $ 는 건드리지 않는다 ───────────────────────────────

function extractMath(md) {
  const maths = []
  const re = /(^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\2[ \t]*$)|(`+)(?:[^`]|[^`][\s\S]*?[^`])\3(?!`)|\$\$([\s\S]+?)\$\$|\$(?=[^\s$])([^$\n]*?[^\s$\\])\$(?!\d)/gm
  const text = md.replace(re, (m, fence, _f, tick, display, inline) => {
    if (fence || tick) return m
    const i = maths.push({ tex: (display ?? inline).trim(), display: display != null }) - 1
    return display != null
      ? `\n\n<div class="hn-math--display" data-math="${i}"></div>\n\n`
      : `<span class="hn-math" data-math="${i}"></span>`
  })
  return { text, maths }
}

// ── 다이어그램 ─────────────────────────────────────────────────────────

const svgCache = new Map()
let mermaidTheme = null
let mermaidSeq = 0

async function renderMermaid(nodes, theme) {
  if (!nodes.length) return
  const mermaid = await loadMermaid()
  if (mermaidTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: theme === 'dark' ? 'dark' : 'default',
      fontFamily: '-apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
    })
    mermaidTheme = theme
  }
  for (const node of nodes) {
    const src = decodeURIComponent(node.dataset.mermaid)
    const key = theme + '\n' + src
    try {
      let svg = svgCache.get(key)
      if (!svg) {
        const id = `hn-mmd-${++mermaidSeq}`
        try {
          ;({ svg } = await mermaid.render(id, src))
        } finally {
          // 실패하면 mermaid 가 임시 요소를 body 에 남긴다
          document.getElementById('d' + id)?.remove()
        }
        svgCache.set(key, svg)
      }
      if (!node.isConnected) continue
      node.innerHTML = svg
      node.classList.remove('is-pending')
    } catch (err) {
      node.classList.remove('is-pending')
      node.classList.add('hn-mermaid--error')
      node.innerHTML = `<p>${esc(T.diagramFail)}</p><pre><code>${esc(src)}</code></pre>`
    }
  }
}

// ── 본체 ───────────────────────────────────────────────────────────────

function slugger() {
  const used = new Map()
  return raw => {
    const base = String(raw).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    return n ? `${base}-${n}` : base
  }
}

/**
 * @param {string} md
 * @param {HTMLElement} el   .hn-content
 * @param {{ base: string, theme: string, idPrefix: string }} opt
 */
export async function renderMarkdown(md, el, opt) {
  const { marked, DOMPurify, katex } = await loadLibs()
  const { meta, body } = splitFrontmatter(md)
  const { text, maths } = extractMath(body)
  const html = DOMPurify.sanitize(marked.parse(text), { ADD_ATTR: ['data-math', 'data-mermaid'] })

  const tpl = document.createElement('template')
  tpl.innerHTML = html
  const frag = tpl.content

  frag.querySelectorAll('[data-math]').forEach(node => {
    const m = maths[+node.dataset.math]
    if (!m) return
    try {
      katex.render(m.tex, node, { displayMode: m.display, throwOnError: true, output: 'htmlAndMathml' })
    } catch {
      node.className = 'hn-math--error'
      node.textContent = m.display ? `$$${m.tex}$$` : `$${m.tex}$`
    }
  })

  // 원격 이미지는 앱처럼 불러오지 않는다 — 추적 픽셀 방지
  frag.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || ''
    if (/^(https?:)?\/\//i.test(src)) {
      const span = document.createElement('span')
      span.className = 'hn-blocked'
      span.textContent = `${T.remoteImage} — ${img.alt || src}`
      img.replaceWith(span)
    } else {
      img.src = new URL(src, opt.base).href
    }
  })

  frag.querySelectorAll('pre code[class*="language-"]').forEach(code => {
    const lang = code.className.replace('language-', '')
    if (window.Prism?.languages[lang]) window.Prism.highlightElement(code)
  })

  const slug = slugger()
  frag.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => (h.id = opt.idPrefix + slug(h.textContent)))

  el.replaceChildren(...(meta ? [frontmatterCard(meta)] : []), frag)
}

/** 다이어그램은 문서에 붙은 뒤에 그린다 — mermaid 는 떨어진 노드에서 크기를 재지 못한다 */
export function renderDiagrams(el, theme) {
  return renderMermaid([...el.querySelectorAll('.hn-mermaid.is-pending[data-mermaid]')], theme)
}

export function clearDiagramCache() {
  svgCache.clear()
}
