// 체험 창 — 한눈 맥 창(화면정의서 MAC-1 ~ MAC-7)을 웹으로 옮긴 것

import { renderMarkdown, renderDiagrams, clearDiagramCache, esc } from './render.js'
import { renderData } from './data.js'
import { applyFormat, PALETTE } from './format.js'
import { T } from './i18n.js'

const ICON = {
  toc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="2.5" width="13" height="11" rx="2.2"/><path d="M6 2.8v10.4M3.2 5.3h1.3M3.2 7.3h1.3M3.2 9.3h1.3"/></svg>',
  width: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 8h13M4.5 5 1.5 8l3 3M11.5 5l3 3-3 3"/></svg>',
  type: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.6 3.2h1.2l3.6 9.6H8.1l-.9-2.6H3.2l-.9 2.6H1Zm-1 5.9h3.2L5.2 4.6ZM12.3 6.1c1.6 0 2.5.9 2.5 2.4v4.3h-1.1v-.9c-.4.7-1.1 1-2 1-1.2 0-2-.7-2-1.8 0-1.1.8-1.7 2.3-1.8l1.7-.1v-.6c0-.9-.5-1.4-1.5-1.4-.8 0-1.3.3-1.5.9H9.6c.1-1.2 1.2-2 2.7-2Zm-.4 5.8c1 0 1.8-.7 1.8-1.6V9.8l-1.6.1c-.9.1-1.4.4-1.4 1 0 .6.5 1 1.2 1Z"/></svg>',
  preview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1.3 8S3.8 3.5 8 3.5 14.7 8 14.7 8 12.2 12.5 8 12.5 1.3 8 1.3 8Z"/><circle cx="8" cy="8" r="2.1"/></svg>',
  split: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="2.5" width="13" height="11" rx="2.2"/><path d="M8 2.8v10.4"/></svg>',
  edit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M10.6 2.6a1.4 1.4 0 0 1 2 2L5.2 12l-2.7.7.7-2.7Z"/><path d="M9.5 3.8l2 2"/></svg>',
  md: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 1.5h5.5L13 5v9.5H4Z"/><path d="M9.3 1.7V5.2H13"/><path d="M6 11V8l1.2 1.4L8.4 8v3M10 8.2v2.6M9.1 10l.9.9.9-.9"/></svg>',
  json: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M5.5 2.5c-1.5 0-1.8.7-1.8 1.9v1.4c0 1-.5 1.7-1.5 2.2 1 .5 1.5 1.2 1.5 2.2v1.4c0 1.2.3 1.9 1.8 1.9M10.5 2.5c1.5 0 1.8.7 1.8 1.9v1.4c0 1 .5 1.7 1.5 2.2-1 .5-1.5 1.2-1.5 2.2v1.4c0 1.2-.3 1.9-1.8 1.9"/></svg>',
  palette: '<svg viewBox="0 0 18 18" fill="currentColor"><path d="M5 3.5h1.3l3.8 10.2H8.8l-1-2.8H3.5l-1 2.8H1.2Zm-1.1 6.3h3.5L5.6 5ZM13.5 6.6c1.7 0 2.7 1 2.7 2.6v4.5h-1.2v-1c-.5.8-1.2 1.1-2.1 1.1-1.3 0-2.2-.8-2.2-1.9 0-1.2.9-1.8 2.4-1.9l1.9-.1v-.6c0-1-.6-1.5-1.6-1.5-.9 0-1.4.4-1.6 1h-1.2c.1-1.3 1.3-2.2 2.9-2.2Zm-.4 6.2c1.1 0 1.9-.8 1.9-1.7v-.6l-1.7.1c-1 .1-1.5.5-1.5 1.1 0 .7.5 1.1 1.3 1.1Z"/></svg>',
}

const MODES = ['preview', 'split', 'edit']
const MODE_LABEL = T.mode
const WIDTHS = ['full', 'wide', 'medium', 'narrow'].map(k => [k, T.widths[k]])
const VIEWS = ['source', 'tree', 'list'].map(k => [k, T.views[k]])

// ── 편집기 강조 ────────────────────────────────────────────────────────

function hlInline(s) {
  return s
    .split(/(`[^`]*`)/)
    .map((p, i) =>
      i % 2
        ? `<span class="md-code">${p}</span>`
        : p
            .replace(/(\$[^$\s][^$]*?\$)/g, '<span class="md-math">$1</span>')
            .replace(/(\*\*)(?=\S)(.+?)(\*\*)/g, '<span class="md-strong"><span class="md-mark">$1</span>$2<span class="md-mark">$3</span></span>')
            .replace(/(^|[^*])\*(?=[^\s*])([^*]+?)\*(?!\*)/g, '$1<span class="md-em"><span class="md-mark">*</span>$2<span class="md-mark">*</span></span>')
            .replace(/~~(.+?)~~/g, '<span class="md-del"><span class="md-mark">~~</span>$1<span class="md-mark">~~</span></span>')
            .replace(/(!?\[)([^\]]*)(\]\()([^)\s]*)(\))/g, '<span class="md-link">$1$2$3</span><span class="md-url">$4</span><span class="md-link">$5</span>'),
    )
    .join('')
}

function hlMarkdown(text) {
  let fence = null
  let front = false
  let math = false
  return text
    .split('\n')
    .map((raw, i) => {
      const e = esc(raw)
      let h
      if (i === 0 && raw === '---') { front = true; h = `<span class="md-front">${e}</span>` }
      else if (front) { h = `<span class="md-front">${e}</span>`; if (raw === '---') front = false }
      else if (fence) {
        if (raw.trimStart().startsWith(fence)) { fence = null; h = `<span class="md-fence">${e}</span>` }
        else h = `<span class="md-fenced">${e}</span>`
      }
      else if (/^\s*(```|~~~)/.test(raw)) { fence = raw.trim().slice(0, 3); h = `<span class="md-fence">${e}</span>` }
      else if (raw.trim() === '$$') { math = !math; h = `<span class="md-math">${e}</span>` }
      else if (math) h = `<span class="md-math">${e}</span>`
      else if (/^#{1,6} /.test(raw)) {
        const n = raw.indexOf(' ')
        h = `<span class="md-h"><span class="md-mark">${e.slice(0, n)}</span>${hlInline(e.slice(n))}</span>`
      }
      else if (/^&gt;/.test(e)) h = `<span class="md-quote">${hlInline(e)}</span>`
      else if (/^\s*([-*+] \[[ xX]\] |[-*+] |\d+\. )/.test(raw)) {
        const m = /^\s*([-*+] \[[ xX]\] |[-*+] |\d+\. )/.exec(e)
        h = `<span class="md-list">${m[0]}</span>${hlInline(e.slice(m[0].length))}`
      }
      else if (/^\s*\|/.test(raw)) h = hlInline(e).replace(/\|/g, '<span class="md-pipe">|</span>')
      else h = hlInline(e)
      return `<span class="hn-ln">${h}</span>`
    })
    .join('')
}

function hlJson(text) {
  return text
    .split('\n')
    .map(raw => {
      const h = esc(raw)
        .replace(/(&quot;|")((?:[^"\\]|\\.)*?)("|&quot;)(\s*:)?/g, (m, a, b, c, colon) =>
          colon ? `<span class="md-front">"${b}"</span>${colon}` : `<span class="md-fenced">"${b}"</span>`)
        .replace(/\b(true|false|null)\b/g, '<span class="md-h">$1</span>')
        .replace(/(:\s*|\[\s*|,\s*)(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi, '$1<span class="md-math">$2</span>')
      return `<span class="hn-ln">${h}</span>`
    })
    .join('')
}

// ── 창 ─────────────────────────────────────────────────────────────────

export function createApp(root, config) {
  const state = {
    tabs: config.tabs.map(t => ({ ...t, original: t.text, open: !t.hidden })),
    active: config.tabs.find(t => !t.hidden).id,
    mode: 'preview',
    theme: 'light',
    width: 'medium',
    bodyFont: 'serif',
    headFont: 'serif',
    view: config.view || 'source',
    toc: false,
    scale: 1,
    paletteOpen: false,
    altHeld: false,
    pinned: false,
  }
  const tab = () => state.tabs.find(t => t.id === state.active)
  // 자동 = 시스템 설정을 따른다
  const dark = matchMedia('(prefers-color-scheme: dark)')
  const shownTheme = () => (state.theme === 'auto' ? (dark.matches ? 'dark' : 'light') : state.theme)
  dark.addEventListener('change', () => { if (state.theme === 'auto') { drawChrome(); clearDiagramCache(); drawPreview() } })
  const idPrefix = root.id + '-'

  root.innerHTML = `
    <div class="hn-titlebar">
      <div class="hn-lights" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="hn-title" data-r="title"></div>
      <div class="hn-tools">
        <div class="hn-seg hn-viewseg" data-seg="view" data-r="viewSeg" role="group" aria-label="${T.dataView}" hidden></div>
        <div class="hn-group hn-group--nav">
          <button class="hn-tool" type="button" data-act="toc" aria-pressed="false" title="${T.tocShortcut}" aria-label="${T.toc}">${ICON.toc}</button>
        </div>
        <div class="hn-group">
          <button class="hn-tool" type="button" data-pop="width" aria-expanded="false" title="${T.width}" aria-label="${T.width}">${ICON.width}</button>
          <button class="hn-tool" type="button" data-pop="type" aria-expanded="false" title="${T.typeTheme}" aria-label="${T.typeTheme}"><span class="hn-tool__glyph">${T.fontIcon}</span></button>
        </div>
        <div class="hn-group" role="group" aria-label="${T.shortcutMode}">
          ${MODES.map(m => `<button class="hn-tool" type="button" data-mode="${m}" aria-pressed="false" title="${MODE_LABEL[m]} (⌘/)" aria-label="${MODE_LABEL[m]}">${ICON[m]}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="hn-tabbar" role="tablist" data-r="tabs"></div>
    <div class="hn-body">
      <nav class="hn-toc" data-r="toc" hidden aria-label="${T.toc}"></nav>
      <div class="hn-pane hn-pane--edit" data-r="editPane" hidden>
        <div class="hn-scroll" data-r="editScroll">
          <div class="hn-editor"><pre aria-hidden="true" data-r="hl"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${T.editor}" data-r="ta"></textarea></div>
        </div>
        <button class="hn-tool hn-palette-btn" type="button" data-act="palette" title="${T.paletteHint}" aria-label="${T.palette}">${ICON.palette}</button>
        <div class="hn-palette" data-r="palette" hidden></div>
      </div>
      <div class="hn-pane hn-pane--preview" data-r="prevPane">
        <div class="hn-scroll" data-r="prevScroll"><article class="hn-content" data-r="content"></article></div>
      </div>
    </div>
    <div class="hn-status" data-r="status" hidden></div>
    <div class="hn-pop" data-r="popWidth" hidden></div>
    <div class="hn-pop" data-r="popType" hidden></div>`

  const $ = n => root.querySelector(`[data-r="${n}"]`)
  const R = Object.fromEntries(['title', 'viewSeg', 'tabs', 'toc', 'editPane', 'editScroll', 'hl', 'ta', 'palette', 'prevPane', 'prevScroll', 'content', 'status', 'popWidth', 'popType'].map(n => [n, $(n)]))

  // ── 팔레트 ──
  const rowHome = PALETTE.filter(p => p.row === 'home')
  const rowLow = PALETTE.filter(p => p.row === 'low')
  const nums = PALETTE.filter(p => p.row === 'num')
  const keyBtn = (p, cls = '') =>
    `<button type="button" class="hn-key ${cls}" data-code="${p.code}" title="${p.label}${p.hint ? ' · ' + p.hint : ''}"><span>${p.label}</span><b>${p.key}</b>${p.hint ? `<small>${p.hint}</small>` : '<small>&nbsp;</small>'}</button>`
  R.palette.innerHTML =
    `<div class="hn-palette__num">${nums.map(p => `<button type="button" class="hn-key hn-key--num" data-code="${p.code}" title="${p.label}"><b>${p.key}</b></button>`).join('')}</div>` +
    rowHome.map(p => keyBtn(p)).join('') +
    '<span></span>' +
    rowLow.map(p => keyBtn(p)).join('')

  // ── 팝오버 ──
  const seg = (name, items, cur) =>
    `<div class="hn-seg" data-seg="${name}">${items.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === cur}">${l}</button>`).join('')}</div>`
  function drawPops() {
    R.popWidth.innerHTML = `<h5>${T.width}</h5>${seg('width', WIDTHS, state.width)}`
    R.popType.innerHTML =
      `<h5>${T.bodyFont}</h5>${seg('bodyFont', [['serif', T.serif], ['sans', T.sans]], state.bodyFont)}` +
      `<h5>${T.headFont}</h5>${seg('headFont', [['serif', T.serif], ['sans', T.sans]], state.headFont)}` +
      `<h5>${T.theme}</h5>${seg('theme', [['auto', T.auto], ['light', T.light], ['dark', T.dark]], state.theme)}`
  }
  function closePops(except) {
    for (const [name, el] of [['width', R.popWidth], ['type', R.popType]]) {
      if (name === except) continue
      el.hidden = true
      root.querySelector(`[data-pop="${name}"]`).setAttribute('aria-expanded', 'false')
    }
  }

  // ── 그리기 ──
  function drawTabs() {
    R.tabs.innerHTML = state.tabs
      .filter(t => t.open)
      .map(t => `<button type="button" role="tab" class="hn-tab${t.text !== t.original ? ' is-dirty' : ''}" data-tab="${t.id}" aria-selected="${t.id === state.active}">${ICON[t.kind]}<span class="hn-tab__name">${esc(t.name)}</span><span class="hn-tab__dot"></span></button>`)
      .join('')
  }

  function drawChrome() {
    const t = tab()
    if (t.kind === 'json' && state.mode === 'split') state.mode = 'edit'
    root.dataset.mode = state.mode
    root.dataset.theme = shownTheme()
    root.dataset.contentWidth = state.width
    root.dataset.bodyFont = state.bodyFont
    root.dataset.headingFont = state.headFont
    root.style.setProperty('--hn-scale', state.scale)
    // 파일 이름만 굵게 — 나머지 말은 언어마다 어순이 달라 T.title 이 정한다
    const mark = '\u0000'
    const phrase = (state.mode === 'preview' ? T.title.reading : T.title.editing)(mark)
    const [before, after] = phrase.split(mark)
    R.title.innerHTML = `<span>${esc(before)}</span>${esc(t.name)}<span>${esc(after)}</span>`
    root.querySelectorAll('[data-mode]').forEach(b => {
      if (b === root) return
      b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode))
      b.hidden = t.kind === 'json' && b.dataset.mode === 'split'
    })
    root.querySelector('[data-act="toc"]').setAttribute('aria-pressed', String(state.toc))
    R.toc.hidden = !state.toc || t.kind !== 'md'
    R.editPane.hidden = state.mode === 'preview'
    R.prevPane.hidden = state.mode === 'edit'
    R.status.hidden = state.mode === 'preview'
    R.palette.hidden = !(state.mode !== 'preview' && t.kind === 'md' && (state.altHeld || state.pinned))
    root.querySelector('[data-act="palette"]').hidden = t.kind !== 'md'
    // 데이터 문서는 보기 방식을 창 위에 늘 드러낸다 — 기본은 원문
    R.viewSeg.hidden = t.kind !== 'json'
    R.viewSeg.innerHTML = VIEWS.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === state.view}">${l}${v === 'source' ? `<small>${T.viewDefault}</small>` : ''}</button>`).join('')
    drawTabs()
    drawPops()
  }

  function drawEditor() {
    const t = tab()
    if (R.ta.value !== t.text) R.ta.value = t.text
    R.hl.innerHTML = t.kind === 'json' ? hlJson(t.text) : hlMarkdown(t.text)
    markCurrentLine()
  }

  function markCurrentLine() {
    const pos = R.ta.selectionStart
    const before = R.ta.value.slice(0, pos)
    const line = before.split('\n').length
    const col = pos - before.lastIndexOf('\n')
    R.hl.querySelector('.is-cur')?.classList.remove('is-cur')
    if (document.activeElement === R.ta) R.hl.children[line - 1]?.classList.add('is-cur')
    R.status.innerHTML = `<span>${line}:${col}</span><span>UTF-8</span><span>LF</span>`
  }

  let renderSeq = 0
  async function drawPreview() {
    const t = tab()
    const seq = ++renderSeq
    const keep = R.prevScroll.scrollTop
    if (t.kind === 'json') {
      R.content.innerHTML = renderData(t.text, state.view)
    } else {
      const holder = document.createElement('div')
      try {
        await renderMarkdown(t.text, holder, { base: t.base, theme: shownTheme(), idPrefix })
      } catch (err) {
        holder.innerHTML = `<p style="color:var(--hn-danger)">${esc(T.loadFail)}</p>`
        console.error(err)
      }
      if (seq !== renderSeq) return
      R.content.replaceChildren(...holder.childNodes)
      drawToc()
      renderDiagrams(R.content, shownTheme()).catch(err => console.error(err))
    }
    R.prevScroll.scrollTop = keep
  }

  function drawToc() {
    const hs = [...R.content.querySelectorAll('h1, h2, h3')]
    R.toc.innerHTML = `<h4>${T.toc}</h4>` + hs.map(h => `<a href="#${h.id}" data-depth="${h.tagName[1]}">${esc(h.textContent)}</a>`).join('')
    syncTocCurrent()
  }
  function syncTocCurrent() {
    if (R.toc.hidden) return
    const top = R.prevScroll.getBoundingClientRect().top + 24
    let cur = null
    for (const h of R.content.querySelectorAll('h1, h2, h3')) if (h.getBoundingClientRect().top <= top) cur = h.id
    R.toc.querySelectorAll('a').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + cur))
  }

  function renderAll() {
    drawChrome()
    drawEditor()
    drawPreview()
  }

  // ── 동작 ──
  function setMode(m) {
    state.mode = m
    drawChrome()
    if (m !== 'preview') {
      drawEditor()
      requestAnimationFrame(() => R.ta.focus({ preventScroll: true }))
    } else {
      root.focus({ preventScroll: true })
    }
  }
  function cycleMode() {
    const list = tab().kind === 'json' ? ['preview', 'edit'] : MODES
    setMode(list[(list.indexOf(state.mode) + 1) % list.length])
  }
  function openTab(id) {
    const t = state.tabs.find(x => x.id === id)
    if (!t) return
    t.open = true
    state.active = id
    R.prevScroll.scrollTop = 0
    renderAll()
  }

  let typeTimer
  function onInput() {
    const t = tab()
    t.text = R.ta.value
    R.hl.innerHTML = t.kind === 'json' ? hlJson(t.text) : hlMarkdown(t.text)
    markCurrentLine()
    drawTabs()
    clearTimeout(typeTimer)
    typeTimer = setTimeout(drawPreview, t.kind === 'json' ? 200 : 140)
  }

  function format(code) {
    if (tab().kind !== 'md' || state.mode === 'preview') return false
    const ok = applyFormat(R.ta, code)
    if (ok) onInput()
    const k = R.palette.querySelector(`[data-code="${code}"]`)
    if (k) {
      k.classList.add('is-hit')
      setTimeout(() => k.classList.remove('is-hit'), 160)
    }
    return ok
  }

  // 스크롤 동기화 — 나란히 보기에서 양쪽을 비율로 맞춘다
  let syncing = null
  function syncScroll(from, to) {
    if (state.mode !== 'split' || syncing === to) return
    syncing = from
    const max = from.scrollHeight - from.clientHeight
    const ratio = max > 0 ? from.scrollTop / max : 0
    to.scrollTop = ratio * (to.scrollHeight - to.clientHeight)
    requestAnimationFrame(() => (syncing = null))
  }
  R.editScroll.addEventListener('scroll', () => syncScroll(R.editScroll, R.prevScroll), { passive: true })
  R.prevScroll.addEventListener('scroll', () => { syncScroll(R.prevScroll, R.editScroll); syncTocCurrent() }, { passive: true })

  R.ta.addEventListener('input', onInput)
  for (const ev of ['keyup', 'click', 'focus', 'blur']) R.ta.addEventListener(ev, markCurrentLine)
  document.addEventListener('selectionchange', () => document.activeElement === R.ta && markCurrentLine())

  root.addEventListener('click', e => {
    // 팝오버 밖을 누르면 닫는다 (팝오버를 여닫는 단추는 아래에서 따로)
    if (!e.target.closest('.hn-pop, [data-pop]')) closePops()
    const t = e.target.closest('button, a, img, .hn-mermaid, summary')
    if (!t || !root.contains(t)) return
    if (t.dataset.mode && t !== root) return setMode(t.dataset.mode)
    if (t.dataset.tab) return openTab(t.dataset.tab)
    if (t.dataset.act === 'toc') {
      state.toc = !state.toc
      drawChrome()
      syncTocCurrent()
      return
    }
    if (t.dataset.act === 'palette') {
      state.pinned = !state.pinned
      drawChrome()
      R.ta.focus({ preventScroll: true })
      return
    }
    if (t.dataset.pop) {
      const el = t.dataset.pop === 'width' ? R.popWidth : R.popType
      const open = el.hidden
      closePops()
      el.hidden = !open
      t.setAttribute('aria-expanded', String(open))
      return
    }
    if (t.dataset.code) return format(t.dataset.code)
    const segEl = t.closest('[data-seg]')
    if (segEl && t.dataset.v) {
      const k = segEl.dataset.seg
      const prevTheme = state.theme
      state[k] = t.dataset.v
      drawChrome()
      if (k === 'theme' && prevTheme !== state.theme) { clearDiagramCache(); drawPreview() }
      if (k === 'view') drawPreview()
      return
    }
    if (t.tagName === 'A' && R.toc.contains(t)) {
      e.preventDefault()
      const h = R.content.querySelector(t.getAttribute('href'))
      if (h) R.prevScroll.scrollTo({ top: h.offsetTop - 16, behavior: 'smooth' })
      return
    }
    if (t.tagName === 'A' && R.content.contains(t)) {
      e.preventDefault()
      const href = t.getAttribute('href') || ''
      if (href.startsWith('#')) {
        const h = R.content.querySelector('#' + CSS.escape(idPrefix + decodeURIComponent(href.slice(1))))
        if (h) R.prevScroll.scrollTo({ top: h.offsetTop - 16, behavior: 'smooth' })
      } else if (/^https?:/i.test(href)) {
        window.open(href, '_blank', 'noopener')
      } else {
        const name = decodeURIComponent(href.replace(/^\.\//, '').split('#')[0])
        const target = state.tabs.find(x => x.name === name)
        if (target) openTab(target.id)
      }
      return
    }
    if (t.tagName === 'IMG' && R.content.contains(t)) return openLightbox(t)
    if (t.classList.contains('hn-mermaid') && t.querySelector('svg')) return openLightbox(t.querySelector('svg'))
  })
  // 팔레트 버튼을 눌러도 편집기 포커스를 뺏지 않는다
  R.palette.addEventListener('mousedown', e => e.preventDefault())

  // ── 키보드 ──
  root.addEventListener('keydown', e => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && (e.key === '/' || e.code === 'Slash')) {
      e.preventDefault()
      e.stopPropagation()
      return cycleMode()
    }
    if (mod && e.shiftKey && e.code === 'KeyT') {
      e.preventDefault()
      state.toc = !state.toc
      return drawChrome()
    }
    if (mod && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
      e.preventDefault()
      state.scale = e.key === '0' ? 1 : Math.min(1.6, Math.max(0.7, +(state.scale + (e.key === '-' ? -0.1 : 0.1)).toFixed(2)))
      return drawChrome()
    }
    if (e.key === 'Escape') {
      closePops()
      if (state.pinned) { state.pinned = false; drawChrome() }
      return
    }
    if (e.target !== R.ta) return
    if (e.key === 'Alt') {
      if (!state.altHeld) { state.altHeld = true; drawChrome() }
      return
    }
    if (e.altKey && !mod && PALETTE.some(p => p.code === e.code)) {
      e.preventDefault()
      return format(e.code)
    }
    if (mod && !e.altKey) {
      const map = { KeyB: 'KeyS', KeyI: 'KeyD', KeyK: e.shiftKey ? 'KeyC' : 'KeyZ' }
      if (map[e.code]) {
        e.preventDefault()
        return format(map[e.code])
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '    ') || R.ta.setRangeText('    ', R.ta.selectionStart, R.ta.selectionEnd, 'end')
    }
  })
  const releaseAlt = () => {
    if (state.altHeld) { state.altHeld = false; drawChrome() }
  }
  root.addEventListener('keyup', e => e.key === 'Alt' && releaseAlt())
  window.addEventListener('blur', releaseAlt)
  R.ta.addEventListener('blur', releaseAlt)

  // 핀치(트랙패드) — 프리뷰 배율
  R.prevScroll.addEventListener('wheel', e => {
    if (!e.ctrlKey) return
    e.preventDefault()
    state.scale = Math.min(1.6, Math.max(0.7, state.scale * Math.exp(-e.deltaY / 200)))
    root.style.setProperty('--hn-scale', state.scale.toFixed(3))
  }, { passive: false })

  // ── 확대 (라이트박스) ──
  function openLightbox(node) {
    const box = document.createElement('div')
    box.className = 'hn-lightbox'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-label', T.zoomView)
    const stage = document.createElement('div')
    stage.className = 'hn-lightbox__stage'
    let w, h
    let clone
    if (node.tagName === 'IMG') {
      clone = new Image()
      clone.src = node.currentSrc || node.src
      clone.alt = node.alt
      w = node.naturalWidth || 640
      h = node.naturalHeight || 300
      if (/\.svg($|\?)/i.test(clone.src)) { w *= 2; h *= 2 }
    } else {
      clone = node.cloneNode(true)
      clone.classList.add('hn-lightbox__svg')
      const vb = node.viewBox?.baseVal
      w = (vb?.width || node.getBoundingClientRect().width) * 1.6
      h = (vb?.height || node.getBoundingClientRect().height) * 1.6
      clone.removeAttribute('style')
    }
    clone.style.width = w + 'px'
    clone.style.height = h + 'px'
    stage.append(clone)
    const controls = document.createElement('div')
    controls.className = 'hn-lightbox__controls'
    controls.innerHTML = `<button type="button" data-z="-" aria-label="${T.zoomOut}">−</button><button type="button" data-z="fit" data-r="pct">100%</button><button type="button" data-z="+" aria-label="${T.zoomIn}">+</button>`
    box.append(stage, controls)
    root.append(box)

    const bw = () => box.clientWidth
    const bh = () => box.clientHeight
    const fit = () => Math.min(1, (bw() - 64) / w, (bh() - 64) / h)
    let z = fit()
    let x = 0
    let y = 0
    const apply = () => {
      stage.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${z})`
      controls.querySelector('[data-r="pct"]').textContent = Math.round(z * 100) + '%'
    }
    apply()
    const zoomTo = nz => { z = Math.min(8, Math.max(0.1, nz)); apply() }
    const close = () => { box.remove(); document.removeEventListener('keydown', onKey, true); root.focus({ preventScroll: true }) }
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    document.addEventListener('keydown', onKey, true)

    let drag = null
    let moved = false
    box.addEventListener('pointerdown', e => {
      if (e.target.closest('.hn-lightbox__controls')) return
      drag = { sx: e.clientX, sy: e.clientY, x, y }
      moved = false
      box.setPointerCapture(e.pointerId)
      box.classList.add('is-dragging')
    })
    box.addEventListener('pointermove', e => {
      if (!drag) return
      const dx = e.clientX - drag.sx
      const dy = e.clientY - drag.sy
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
      x = drag.x + dx
      y = drag.y + dy
      apply()
    })
    box.addEventListener('pointerup', e => {
      box.classList.remove('is-dragging')
      const wasDrag = moved
      drag = null
      if (!wasDrag && !stage.contains(e.target) && !e.target.closest('.hn-lightbox__controls')) close()
    })
    box.addEventListener('wheel', e => { e.preventDefault(); zoomTo(z * Math.exp(-e.deltaY / (e.ctrlKey ? 100 : 300))) }, { passive: false })
    box.addEventListener('dblclick', e => {
      if (e.target.closest('.hn-lightbox__controls')) return
      const f = fit()
      x = y = 0
      zoomTo(Math.abs(z - f) < 0.01 ? 1 : f)
    })
    controls.addEventListener('click', e => {
      const b = e.target.closest('button')
      if (!b) return
      if (b.dataset.z === '+') zoomTo(z * 1.25)
      else if (b.dataset.z === '-') zoomTo(z / 1.25)
      else { x = y = 0; const f = fit(); zoomTo(Math.abs(z - f) < 0.01 ? 1 : f) }
    })
  }

  // ── 바깥에서 쓰는 것 ──
  renderAll()
  return {
    reset() {
      state.tabs.forEach((t, i) => { t.text = t.original; t.open = !config.tabs[i].hidden })
      Object.assign(state, { active: config.tabs.find(t => !t.hidden).id, mode: 'preview', toc: false, scale: 1, pinned: false })
      R.prevScroll.scrollTop = 0
      R.editScroll.scrollTop = 0
      renderAll()
    },
    setMode,
    get state() { return state },
  }
}
