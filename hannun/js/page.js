// 페이지 — 체험 창 두 개, 머리말, 이 페이지 조절, 바이트 보기, 팔레트 판

import { createApp } from './app.js'
import { T } from './i18n.js'

const $ = s => document.querySelector(s)
const $$ = s => [...document.querySelectorAll(s)]
const root = document.documentElement

// ── 체험 창 ──────────────────────────────────────────────────────────

async function mountDemos() {
  // 샘플은 언어와 상관없이 /hannun/sample/ 한곳에 둔다
  const base = new URL('/hannun/sample/', location.href).href
  const [md, json] = await Promise.all([
    fetch(base + T.sample.md).then(r => r.text()),
    fetch(base + T.sample.json).then(r => r.text()),
  ])
  const demo = createApp($('#demo'), {
    tabs: [
      { id: 'md', name: T.sample.mdName, kind: 'md', text: md, base },
      { id: 'json', name: T.sample.jsonName, kind: 'json', text: json, base, hidden: true },
    ],
  })
  $('#demoReset').addEventListener('click', () => demo.reset())

  createApp($('#datademo'), {
    tabs: [{ id: 'json', name: T.sample.jsonName, kind: 'json', text: json, base }],
  })
}
mountDemos().catch(err => console.error(err))

// ── 머리말 — 지금 읽는 절과 쪽수 ─────────────────────────────────────

const run = $('#run')
const folio = $('#folio')
const secs = $$('[data-run]')
function updateHead() {
  const y = innerHeight * 0.35
  let cur = secs[0]
  for (const s of secs) if (s.getBoundingClientRect().top <= y) cur = s
  const label = cur.dataset.run
  if (run.dataset.cur !== label) {
    run.dataset.cur = label
    run.innerHTML = cur === secs[0] ? `<b>${T.runHome}</b>` : `${T.runPrefix}<b>${label}</b>`
  }
  folio.textContent = T.folio(Math.floor(scrollY / innerHeight) + 1)
}
addEventListener('scroll', updateHead, { passive: true })
addEventListener('resize', updateHead)
updateHead()

// ── 이 페이지를 원문으로 ─────────────────────────────────────────────

const srcBtn = $('#srcToggle')
function toggleSource() {
  const on = !root.hasAttribute('data-source')
  root.toggleAttribute('data-source', on)
  srcBtn.setAttribute('aria-pressed', String(on))
}
srcBtn.addEventListener('click', toggleSource)
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.code === 'Slash') && !e.target.closest?.('.hn-app, input, textarea')) {
    e.preventDefault()
    toggleSource()
  }
})

// ── 읽기 — 이 페이지의 너비와 서체 ───────────────────────────────────

$$('#knobs [data-knob]').forEach(group => {
  group.addEventListener('click', e => {
    const b = e.target.closest('button')
    if (!b) return
    const anchor = $('#read')
    const before = anchor.getBoundingClientRect().top
    const k = group.dataset.knob
    const v = b.dataset.v
    if (k === 'width') v === 'medium' ? delete root.dataset.width : (root.dataset.width = v)
    if (k === 'body') v === 'serif' ? delete root.dataset.bodyFont : (root.dataset.bodyFont = v)
    if (k === 'head') v === 'serif' ? delete root.dataset.headFont : (root.dataset.headFont = v)
    group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)))
    // 판면이 바뀌어도 읽던 자리를 붙잡아 둔다
    scrollBy(0, anchor.getBoundingClientRect().top - before)
  })
})

// ── 원본 보존 — 같은 글을 두 방식으로 저장했을 때의 git diff ─────────────
//
// 원본은 Windows 에서 만든 회의록처럼 UTF-8 BOM + CRLF 로 둔다.
// "일반 편집기"는 특정 앱이 아니라, 저장할 때 자기 방식으로 다시 쓰는 편집기의 예다.
//   BOM 을 떼고 · 줄바꿈을 LF 로 · 목록 기호를 - 로 · 표 칸을 다시 맞춘다

const diffBox = $('#diffDemo')
if (diffBox) {
  const ORIGINAL = T.diffDoc
  const ta = diffBox.querySelector('textarea')
  // 한글·한자·가나는 두 칸으로 센다 — 표 칸 맞춤에 쓴다
  const width = t => [...t].reduce((n, c) => n + (/[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(c) ? 2 : 1), 0)
  function normalize(text) {
    const lines = text.replace(/\n$/, '').split('\n').map(l => l.replace(/^(\s*)[*+] /, '$1- '))
    // 표 덩어리마다 칸 너비를 맞춰 다시 쓴다
    for (let i = 0; i < lines.length; i++) {
      if (!/^\s*\|/.test(lines[i])) continue
      let j = i
      while (j < lines.length && /^\s*\|/.test(lines[j])) j++
      const rows = lines.slice(i, j).map(r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
      const cols = Math.max(...rows.map(r => r.length))
      const w = Array.from({ length: cols }, (_, c) => Math.max(3, ...rows.map((r, k) => (/^:?-+:?$/.test(r[c] || '') ? 3 : width(r[c] || '')))))
      rows.forEach((r, k) => {
        const sep = r.every(c => /^:?-+:?$/.test(c))
        lines[i + k] = '| ' + w.map((cw, c) => (sep ? '-'.repeat(cw) : (r[c] || '') + ' '.repeat(cw - width(r[c] || '')))).join(' | ') + ' |'
      })
      i = j
    }
    return lines
  }
  const mark = (ls, crlf, bom) => ls.map((l, i) => (bom && i === 0 ? '<BOM>' : '') + l + (crlf ? '^M' : ''))
  const esc2 = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).replace(/\^M/g, '<i>^M</i>').replace(/&lt;BOM&gt;/g, '<i>&lt;BOM&gt;</i>')
  function diff(a, b) {
    const n = a.length, m = b.length
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    const out = []
    let i = 0, j = 0, changed = 0
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { out.push(`<span class="ctx">  ${esc2(a[i])}</span>`); i++; j++ }
      // git 처럼 지운 줄(-)을 먼저, 넣은 줄(+)을 뒤에
      else if (i < n && (j >= m || dp[i + 1][j] >= dp[i][j + 1])) { out.push(`<span class="del">- ${esc2(a[i])}</span>`); i++ }
      else { out.push(`<span class="add">+ ${esc2(b[j])}</span>`); j++; changed++ }
    }
    return { html: out.join(''), changed }
  }
  const before = mark(ORIGINAL.replace(/\n$/, '').split('\n'), true, true)
  function draw() {
    const text = ta.value
    const sides = {
      other: mark(normalize(text), false, false),
      hannun: mark(text.replace(/\n$/, '').split('\n'), true, true),
    }
    for (const [side, after] of Object.entries(sides)) {
      const col = diffBox.querySelector(`[data-side="${side}"]`)
      const d = diff(before, after)
      col.querySelector('pre').innerHTML = d.html
      const n = col.querySelector('[data-k="n"]')
      n.textContent = d.changed ? T.gitdiff.changed(d.changed) : T.gitdiff.none
      n.classList.toggle('bad', side === 'other')
    }
  }
  ta.value = ORIGINAL
  ta.addEventListener('input', draw)
  draw()
}

// ── 문법 팔레트 판 — 실제 키보드에 반응 ──────────────────────────────

const keys = $('#keys')
const out = $('#keysOut')
const SNIP = T.snip
const showSnip = code => {
  const s = SNIP[code]
  if (s) out.innerHTML = `<span><kbd>⌥</kbd> <kbd>${code.replace(/^(Key|Digit)/, '')}</kbd></span><span>${s[0]}</span><code>${s[1].replace(/</g, '&lt;')}</code>`
}
const capOf = code => keys.querySelector(`.cap[data-k="${code}"]`)
addEventListener('keydown', e => {
  if (e.key === 'Alt') {
    keys.classList.add('is-alt')
    capOf('Alt')?.classList.add('is-down')
    return
  }
  if (e.altKey && SNIP[e.code]) {
    capOf(e.code)?.classList.add('is-down')
    showSnip(e.code)
  }
})
addEventListener('keyup', e => {
  if (e.key === 'Alt') {
    keys.classList.remove('is-alt')
    keys.querySelectorAll('.is-down').forEach(c => c.classList.remove('is-down'))
  }
  capOf(e.code)?.classList.remove('is-down')
})
addEventListener('blur', () => {
  keys.classList.remove('is-alt')
  keys.querySelectorAll('.is-down').forEach(c => c.classList.remove('is-down'))
})
keys.addEventListener('pointerover', e => {
  const c = e.target.closest('.cap[data-k]')
  if (c && SNIP[c.dataset.k]) showSnip(c.dataset.k)
})
keys.addEventListener('pointerdown', e => {
  const c = e.target.closest('.cap[data-k]')
  if (!c) return
  c.classList.add('is-down')
  if (SNIP[c.dataset.k]) showSnip(c.dataset.k)
  setTimeout(() => c.classList.remove('is-down'), 140)
})

// ── 기본 앱 ──────────────────────────────────────────────────────────

$('#prefs').addEventListener('click', e => {
  const b = e.target.closest('button')
  if (!b) return
  const done = document.createElement('span')
  done.className = 'done'
  done.textContent = T.prefsDone
  b.replaceWith(done)
})

// ── 캡처가 아직 없으면 자리만 ────────────────────────────────────────

// 라이트 ↔ 다크 비교 — 다크 캡처가 없으면 슬라이더를 걷는다
$$('.fig__img').forEach(box => {
  const dark = box.querySelector('.fig__dark')
  const cut = box.querySelector('.fig__cut')
  if (!dark || !cut) return
  const light = box.querySelector('img:not(.fig__dark)')
  const drop = () => { dark.remove(); cut.remove() }
  // 같은 화면을 라이트·다크로 찍은 한 쌍만 비교한다 — 크기가 다르면 다른 화면이다
  const check = () => {
    if (!light.complete || !dark.complete) return
    if (!dark.naturalWidth || dark.naturalWidth !== light.naturalWidth || dark.naturalHeight !== light.naturalHeight) drop()
  }
  dark.addEventListener('error', drop)
  dark.addEventListener('load', check)
  light.addEventListener('load', check)
  light.addEventListener('error', drop)
  check()
  const set = () => box.style.setProperty('--cut', cut.value + '%')
  cut.addEventListener('input', set)
  set()
  // 끌기는 그림 어디서든 — 범위 입력의 손잡이만 잡히는 브라우저가 있다
  const fromX = e => {
    const r = box.getBoundingClientRect()
    cut.value = Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
    set()
  }
  box.addEventListener('pointerdown', e => {
    if (!box.contains(cut)) return
    box.setPointerCapture(e.pointerId)
    fromX(e)
    const move = ev => fromX(ev)
    const up = () => { box.removeEventListener('pointermove', move); box.removeEventListener('pointerup', up) }
    box.addEventListener('pointermove', move)
    box.addEventListener('pointerup', up)
  })
})

// 언어별 캡처가 없으면 한국어 캡처로 대신한다 (data-fallback)
$$('.fig__img img[data-fallback]').forEach(img => {
  img.addEventListener('error', function retry() {
    img.removeEventListener('error', retry)
    img.src = img.dataset.fallback
  }, { once: true })
})

$$('.fig__img img:not(.fig__dark)').forEach(img => {
  const miss = () => {
    img.parentElement.classList.add('is-missing')
    img.remove()
  }
  const ok = () => img.parentElement.classList.add('is-loaded')
  if (img.complete) img.naturalWidth ? ok() : miss()
  else {
    img.addEventListener('error', miss)
    img.addEventListener('load', ok)
  }
})

// ── 판 번호 — 릴리즈가 올라오면 자동으로 ──────────────────────────────

fetch('https://api.github.com/repos/putchamoe/hannun-releases/releases/latest')
  .then(r => (r.ok ? r.json() : null))
  .then(rel => {
    if (!rel?.tag_name) return
    const v = rel.tag_name.replace(/^v/, '')
    const dmg = rel.assets?.find(a => a.name.endsWith('.dmg'))
    $('#ver').textContent = dmg ? `${v} · ${(dmg.size / 1048576).toFixed(1)} MB` : v
    $('#colVer').textContent = v
    if (dmg) $$('a[href$="releases/latest"]').forEach(a => (a.href = dmg.browser_download_url))
  })
  .catch(() => {})

// 언어 메뉴 — 바깥을 누르면 닫는다
document.addEventListener('click', e => {
  const d = document.querySelector('.head__lang')
  if (d?.open && !d.contains(e.target)) d.open = false
})

// ── 임시 문서 — 새로고침해도 남아 있다 (이 브라우저에만) ────────────────

const scratch = $('#scratchWin')
if (scratch) {
  const KEY = 'hannun-scratch'
  const ta = scratch.querySelector('.scratch__ta')
  const state = scratch.querySelector('[data-r="state"]')
  const pos = scratch.querySelector('[data-r="pos"]')
  const bar = scratch.parentElement.querySelector('.scratch__acts')
  let fmt = 'md'
  const read = () => { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
  const write = v => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY) } catch {} }
  const status = () => {
    state.textContent = ta.value ? T.scratch.saved : T.scratch.empty
    const before = ta.value.slice(0, ta.selectionStart)
    pos.textContent = `${before.split('\n').length}:${before.length - before.lastIndexOf('\n')}`
  }
  ta.value = read()
  status()
  let timer
  ta.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => { write(ta.value); status() }, 250)
  })
  for (const ev of ['keyup', 'click']) ta.addEventListener(ev, status)
  bar.addEventListener('click', e => {
    const b = e.target.closest('button')
    if (!b) return
    if (b.dataset.fmt) {
      fmt = b.dataset.fmt
      bar.querySelectorAll('[data-fmt]').forEach(x => x.setAttribute('aria-pressed', String(x === b)))
    } else if (b.dataset.act === 'discard') {
      ta.value = ''
      write('')
      status()
      ta.focus()
    } else if (b.dataset.act === 'save') {
      const url = URL.createObjectURL(new Blob([ta.value], { type: fmt === 'md' ? 'text/markdown' : 'text/plain' }))
      const a = Object.assign(document.createElement('a'), { href: url, download: `${T.scratch.file}.${fmt}` })
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  })
}

