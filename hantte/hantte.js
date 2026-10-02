// 한때 랜딩 — 길(스크롤), 지도 두 장, 날들, 리플레이, 액자
(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const NS = 'http://www.w3.org/2000/svg'
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  // 그림 · 사진은 언어별 페이지(/hantte/en/ …)에서도 /hantte/ 한곳에서 부른다
  const BASE = new URL('.', document.currentScript.src).href
  const LANG = (document.documentElement.lang || 'ko').slice(0, 2)

  // ── 화면 글자 — 네 언어 ────────────────────────────────────────────
  const STR = {
    ko: {
      trip: '봄, 남쪽 바다',
      places: ['해안 도로', '전망대', '바닷가 찻집', '해 질 녘 바다', '소나무 숲길', '언덕', '꽃길', '절벽 길', '방파제', '저녁', '모래밭', '돌아오는 길'],
      words: ['🚗 드디어 출발', '🍵 유자차가 제일 맛있었다', '⛰️ 바람이 시원했다', '🌊 한참 앉아 있었다', '👋 또 오자'],
      map: ['솔숲 공원', '바다', '언덕 공원', '솔숲', '남쪽 바다', '작은 섬'],
      todayMap: '오늘 지나온 길이 그려진 지도',
      tripMap: t => `예시 한때의 지도 — ${t}`,
      play: '리플레이 재생', pause: '리플레이 멈춤',
      days: { 3: '하루하루를 크게', 5: '평소에 보는 크기', 15: '한 달이 한 줄에', 31: '한 해가 한 장에' },
      photo: p => `예시 사진 — ${p}`,
    },
    en: {
      trip: 'Spring, by the South Sea',
      places: ['Coast road', 'Lookout', 'Seaside tea house', 'Sunset over the sea', 'Pine trail', 'Hilltop', 'Flower path', 'Cliff path', 'Pier', 'Dinner', 'Sandy beach', 'Heading home'],
      words: ['🚗 And we’re off', '🍵 The yuzu tea was the best', '⛰️ Such a cool breeze', '🌊 Sat here for ages', '👋 Let’s come back'],
      map: ['Pine Park', 'Sea', 'Hill Park', 'Pines', 'South Sea', 'Islet'],
      todayMap: 'A map with today’s path drawn on it',
      tripMap: t => `Map of a sample Hantte — ${t}`,
      play: 'Play replay', pause: 'Pause replay',
      days: { 3: 'Each day, up close', 5: 'The everyday view', 15: 'A month in a row', 31: 'A whole year on one page' },
      photo: p => `Sample photo — ${p}`,
    },
    ja: {
      trip: '春、南の海',
      places: ['海沿いの道', '展望台', '海辺の茶屋', '夕暮れの海', '松林の小道', '丘', '花の道', '崖の道', '防波堤', '夕ごはん', '砂浜', '帰り道'],
      words: ['🚗 いよいよ出発', '🍵 ゆず茶がいちばんおいしかった', '⛰️ 風が気持ちよかった', '🌊 しばらく座っていた', '👋 また来よう'],
      map: ['松林公園', '海', '丘の公園', '松林', '南の海', '小さな島'],
      todayMap: '今日たどった道が描かれた地図',
      tripMap: t => `ハンテの例の地図 — ${t}`,
      play: 'リプレイを再生', pause: 'リプレイを一時停止',
      days: { 3: '一日ずつ大きく', 5: 'いつもの大きさ', 15: 'ひと月が一列に', 31: '一年が一枚に' },
      photo: p => `サンプル写真 — ${p}`,
    },
    zh: {
      trip: '春天，南边的海',
      places: ['海岸公路', '观景台', '海边茶馆', '日落时的海', '松林小路', '山丘', '花径', '崖边小路', '防波堤', '晚饭', '沙滩', '回家的路'],
      words: ['🚗 终于出发了', '🍵 柚子茶最好喝', '⛰️ 风好舒服', '🌊 在这里坐了好久', '👋 下次再来'],
      map: ['松林公园', '海', '山丘公园', '松林', '南边的海', '小岛'],
      todayMap: '画着今天走过的路的地图',
      tripMap: t => `HANTTE 示例地图 — ${t}`,
      play: '播放回放', pause: '暂停回放',
      days: { 3: '一天一天，放大看', 5: '平常的大小', 15: '一个月排成一行', 31: '一整年，收进一张' },
      photo: p => `示例照片 — ${p}`,
    },
  }
  const T = STR[LANG] || STR.ko
  const LOC = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }[LANG] || 'ko-KR'
  const at = (d, h, m) => new Date(2026, 3, d, h, m)
  const stamp = new Intl.DateTimeFormat(LOC, { month: LANG === 'en' ? 'short' : 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const when = new Intl.DateTimeFormat(LOC, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  // 점들을 부드럽게 잇는다 (Catmull-Rom → 베지어)
  function smooth(pts, k = 6) {
    let d = `M${pts[0][0]} ${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
      d += ` C${(p1[0] + (p2[0] - p0[0]) / k).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / k).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / k).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / k).toFixed(1)} ${p2[0]} ${p2[1]}`
    }
    return d
  }

  // ── 길 — 스크롤한 만큼 그려지고, 열기구가 그 끝을 따라간다 ─────────

  const spine = $('#spine'), rider = $('#rider')
  const spCase = $('.spine__case'), spLine = $('.spine__line')
  const run = $('#run')
  let stops = [], total = 0

  function layoutSpine() {
    const els = $$('[data-stop]')
    const amp = innerWidth <= 640 ? 7 : innerWidth <= 1020 ? 24 : 36
    stops = els.map(el => {
      const r = el.getBoundingClientRect()
      return { el, x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY }
    })
    const pts = []
    let sign = 1
    stops.forEach((s, i) => {
      pts.push([s.x, s.y])
      const n = stops[i + 1]
      if (!n) return
      const turns = Math.max(1, Math.round((n.y - s.y) / 300))
      for (let j = 1; j <= turns; j++) {
        const t = j / (turns + 1)
        pts.push([s.x + (n.x - s.x) * t + amp * sign, s.y + (n.y - s.y) * t])
        sign = -sign
      }
    })
    const h = document.documentElement.scrollHeight
    spine.style.height = h + 'px'
    spine.setAttribute('viewBox', `0 0 ${innerWidth} ${h}`)
    spine.setAttribute('preserveAspectRatio', 'xMinYMin slice')
    spine.style.width = innerWidth + 'px'
    const d = smooth(pts.map(p => [+p[0].toFixed(1), +p[1].toFixed(1)]))
    spCase.setAttribute('d', d)
    spLine.setAttribute('d', d)
    total = spLine.getTotalLength()
    for (const p of [spCase, spLine]) p.style.strokeDasharray = `${total} ${total}`
    followSpine()
  }

  function lengthAtY(y) {
    let lo = 0, hi = total
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2
      if (spLine.getPointAtLength(mid).y < y) lo = mid
      else hi = mid
    }
    return (lo + hi) / 2
  }

  const secs = $$('[data-run]')
  function followSpine() {
    if (!stops.length) return
    const first = stops[0].y, last = stops[stops.length - 1].y
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4
    const y = atEnd ? last : Math.min(last, Math.max(first, scrollY + innerHeight * 0.52))
    const len = lengthAtY(y)
    const p = spLine.getPointAtLength(len)
    for (const el of [spCase, spLine]) el.style.strokeDashoffset = total - len
    rider.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`
    rider.classList.add('is-on')
    for (const s of stops) s.el.classList.toggle('is-past', s.y <= y + 2)

    let cur = secs[0]
    for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight * 0.52) cur = s
    if (run.textContent !== cur.dataset.run) run.textContent = cur.dataset.run
  }

  if (spine) {
    let tick = false
    addEventListener('scroll', () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => { tick = false; followSpine() })
    }, { passive: true })
    addEventListener('resize', layoutSpine)
    addEventListener('load', layoutSpine)
    document.fonts?.ready.then(layoutSpine)
    new ResizeObserver(layoutSpine).observe(document.body)
    layoutSpine()
  }

  // ── 지도 ───────────────────────────────────────────────────────────

  const MAP = { land: '#F5F3EE', water: '#AEDCF2', park: '#D3ECC4', sand: '#F3E9C8', road: '#FFFFFF', roadEdge: '#E3DED3', label: '#8E958A' }
  let uid = 0

  function photoPin(x, y, id, n, r = 19) {
    const c = 'c' + uid++
    return `<g filter="url(#pinShadow)"><circle cx="${x}" cy="${y}" r="${r + 3}" fill="#fff"/>` +
      `<clipPath id="${c}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>` +
      `<image href="${BASE}photos/s/${id}.jpg" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#${c})" preserveAspectRatio="xMidYMid slice"/>` +
      (n > 1 ? `<circle cx="${x + r - 3}" cy="${y - r + 3}" r="9" fill="#1d2618"/><text x="${x + r - 3}" y="${y - r + 7}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${n}</text>` : '') + '</g>'
  }
  const wordPin = (x, y, emoji) =>
    `<g filter="url(#pinShadow)"><path d="M${x - 17} ${y - 40}h34a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-11l-6 8-6-8h-11a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8z" fill="#fff"/><text x="${x}" y="${y - 17}" text-anchor="middle" font-size="19">${emoji}</text></g>`
  const defs = `<defs><filter id="pinShadow" x="-40%" y="-40%" width="200%" height="200%"><feDropShadow dx="1.5" dy="3" stdDeviation="2.5" flood-color="#28320f" flood-opacity=".35"/></filter></defs>`
  const routeTwo = (d, extra = '') =>
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" ${extra}/><path d="${d}" fill="none" stroke="#67B825" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`

  // 오늘 — 세로 지도
  function todayMap(el) {
    const sure1 = smooth([[52, 150], [70, 215], [118, 262], [150, 318], [196, 352]])
    const near = smooth([[196, 352], [214, 392], [196, 432], [160, 462]])
    const gap = smooth([[160, 462], [120, 492], [104, 528]])
    const sure2 = smooth([[104, 528], [128, 566], [176, 580], [214, 548]])
    el.innerHTML = `<svg viewBox="0 0 360 744" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${T.todayMap}">${defs}
      <rect width="360" height="744" fill="${MAP.land}"/>
      <path d="M262 0C232 110 318 210 276 330S214 520 300 744H360V0Z" fill="${MAP.sand}"/>
      <path d="M274 0C246 110 330 212 288 332S228 520 314 744H360V0Z" fill="${MAP.water}"/>
      <path d="M-10 250C40 232 96 262 92 318S20 372-10 356Z" fill="${MAP.park}"/>
      <path d="M150 600C196 588 250 620 236 668S150 710 130 676 120 610 150 600Z" fill="${MAP.park}"/>
      <path d="M96 40C150 30 196 60 180 104S100 120 84 90 70 46 96 40Z" fill="${MAP.park}"/>
      <g fill="none" stroke-linecap="round">
        <path d="M-10 130C80 150 150 120 250 170M30 0C60 180 150 300 150 460S60 620 40 744M-10 470C90 440 200 470 262 430M150 320C200 300 240 320 280 300M90 560C160 540 220 580 290 600" stroke="${MAP.roadEdge}" stroke-width="13"/>
        <path d="M-10 130C80 150 150 120 250 170M30 0C60 180 150 300 150 460S60 620 40 744M-10 470C90 440 200 470 262 430M150 320C200 300 240 320 280 300M90 560C160 540 220 580 290 600" stroke="${MAP.road}" stroke-width="10"/>
        <path d="M0 60L130 200M200 0L170 150M60 400L140 420M180 480L250 560M20 640L120 700" stroke="${MAP.road}" stroke-width="5"/>
      </g>
      <g font-size="10.5" fill="${MAP.label}" font-weight="500"><text x="20" y="312">${T.map[0]}</text><text x="300" y="250" fill="#5d9fc4">${T.map[1]}</text><text x="158" y="648">${T.map[2]}</text></g>
      ${routeTwo(sure1)}
      ${routeTwo(near, 'stroke-dasharray="10 9"')}
      <path d="${gap}" fill="none" stroke="#67B825" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0.1 13"/>
      ${routeTwo(sure2)}
      <circle cx="52" cy="150" r="6" fill="#fff" stroke="#67B825" stroke-width="3"/>
      ${photoPin(118, 262, 17, 3)}
      ${photoPin(196, 352, 106, 5)}
      ${wordPin(160, 462, '🍵')}
      ${photoPin(128, 566, 323, 2)}
      <circle cx="214" cy="548" r="13" fill="#67B825" opacity=".22"/><circle cx="214" cy="548" r="7" fill="#67B825" stroke="#fff" stroke-width="3"/>
      <image href="${BASE}img/balloon.svg" x="189" y="478" width="50" height="65"/>
    </svg>`
  }

  // 한때 — 가로 지도와 예시 여정
  const TRIP = [
    { at: [96, 150], t: at(17, 9, 40), photos: [191], w: 0 },
    { at: [176, 268], t: at(17, 11, 20), photos: [16, 10] },
    { at: [300, 262], t: at(17, 14, 5), photos: [326, 42], w: 1 },
    { at: [404, 296], t: at(17, 18, 52), photos: [385] },
    { at: [452, 196], t: at(18, 8, 30), photos: [17] },
    { at: [548, 118], t: at(18, 10, 15), photos: [287, 28], w: 2 },
    { at: [640, 184], t: at(18, 11, 40), photos: [106, 82] },
    { at: [684, 318], t: at(18, 14, 20), photos: [323] },
    { at: [764, 300], t: at(18, 17, 10), photos: [77], w: 3 },
    { at: [806, 214], t: at(18, 19, 0), photos: [292] },
    { at: [852, 292], t: at(19, 9, 10), photos: [215, 13] },
    { at: [836, 92], t: at(19, 15, 30), photos: [314], w: 4 },
  ]
  TRIP.forEach((s, i) => { s.place = T.places[i]; s.word = s.w == null ? '' : T.words[s.w]; s.time = stamp.format(s.t) })

  function tripMap(el) {
    const d = smooth(TRIP.map(s => s.at), 5)
    el.innerHTML = `<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${T.tripMap(T.trip)}">${defs}
      <rect width="900" height="520" fill="${MAP.land}"/>
      <path d="M0 318C80 290 150 348 230 338S360 268 430 318 560 408 640 368 780 288 900 328V520H0Z" fill="${MAP.sand}"/>
      <path d="M0 330C80 302 150 360 230 350S360 280 430 330 560 420 640 380 780 300 900 340V520H0Z" fill="${MAP.water}"/>
      <ellipse cx="150" cy="450" rx="54" ry="20" fill="${MAP.sand}"/><ellipse cx="150" cy="448" rx="48" ry="16" fill="${MAP.park}"/>
      <ellipse cx="520" cy="474" rx="34" ry="13" fill="${MAP.sand}"/><ellipse cx="520" cy="472" rx="29" ry="10" fill="${MAP.park}"/>
      <ellipse cx="804" cy="440" rx="22" ry="9" fill="${MAP.park}"/>
      <path d="M470 60C560 30 660 70 640 150S500 230 440 190 410 86 470 60Z" fill="${MAP.park}"/>
      <path d="M90 150C150 130 230 160 210 220S110 250 80 220 60 162 90 150Z" fill="${MAP.park}"/>
      <path d="M740 40C800 30 880 60 860 110S760 130 730 100 716 46 740 40Z" fill="${MAP.park}"/>
      <g fill="none" stroke-linecap="round">
        <path d="M0 60C200 100 300 40 480 30S760 20 900 70M40 0C80 160 200 250 330 250S520 300 700 290 840 240 900 250M330 250C330 150 380 80 480 30M700 290C720 180 800 120 900 150" stroke="${MAP.roadEdge}" stroke-width="12"/>
        <path d="M0 60C200 100 300 40 480 30S760 20 900 70M40 0C80 160 200 250 330 250S520 300 700 290 840 240 900 250M330 250C330 150 380 80 480 30M700 290C720 180 800 120 900 150" stroke="${MAP.road}" stroke-width="9"/>
        <path d="M120 0L250 150M560 0L600 250M0 200L160 260M760 150L640 300M250 150L420 120" stroke="${MAP.road}" stroke-width="4.5"/>
        <path d="M764 300L792 352" stroke="#d9cfb8" stroke-width="5"/>
      </g>
      <g font-size="12" fill="${MAP.label}" font-weight="500"><text x="512" y="100">${T.map[3]}</text><text x="330" y="440" fill="#5d9fc4" font-size="14">${T.map[4]}</text><text x="124" y="452" font-size="10.5">${T.map[5]}</text></g>
      <path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".9"/>
      <path d="${d}" fill="none" stroke="#67B825" stroke-width="4" stroke-linecap="round" opacity=".28"/>
      <path class="rp-case" d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
      <path class="rp-line" d="${d}" fill="none" stroke="#67B825" stroke-width="5" stroke-linecap="round"/>
      <g class="rp-dots">${TRIP.map(s => `<circle cx="${s.at[0]}" cy="${s.at[1]}" r="6" fill="#fff" stroke="#c4cab9" stroke-width="3"/>`).join('')}</g>
      <image class="rp-char" href="${BASE}img/balloon.svg" width="62" height="80"/>
    </svg>`
  }

  $$('[data-map="today"]').forEach(todayMap)

  // ── 리플레이 ───────────────────────────────────────────────────────

  const replay = $('#replay')
  if (replay) {
    tripMap($('[data-map="trip"]', replay))
    const line = $('.rp-line', replay), cas = $('.rp-case', replay), chr = $('.rp-char', replay)
    const dots = $$('.rp-dots circle', replay)
    const pop = $('#replayPop'), popImgs = $$('img', pop), popWord = $('p', pop)
    const play = $('#replayPlay'), scrub = $('#replayScrub'), time = $('#replayTime')
    const len = line.getTotalLength()
    for (const p of [line, cas]) p.style.strokeDasharray = `${len} ${len}`

    // 정거장마다 길 위의 거리를 찾아 둔다
    let from = 0
    for (const s of TRIP) {
      let best = from, bd = 1e9
      for (let l = from; l <= len; l += 2) {
        const p = line.getPointAtLength(l), dd = (p.x - s.at[0]) ** 2 + (p.y - s.at[1]) ** 2
        if (dd < bd) { bd = dd; best = l }
        if (dd > bd + 4000) break
      }
      s.len = from = best
    }

    let t = 0, playing = false, last = 0, shown = -1
    const DUR = 26000

    function draw() {
      const l = t * len
      const p = line.getPointAtLength(l)
      for (const el of [line, cas]) el.style.strokeDashoffset = len - l
      chr.setAttribute('x', p.x - 31)
      chr.setAttribute('y', p.y - 78)
      let i = -1
      TRIP.forEach((s, k) => { if (s.len <= l + 0.5) i = k })
      dots.forEach((dot, k) => dot.setAttribute('stroke', k <= i ? '#67B825' : '#c4cab9'))
      if (i !== shown) {
        shown = i
        if (i < 0) pop.hidden = true
        else {
          const s = TRIP[i]
          popImgs[0].src = `${BASE}photos/s/${s.photos[0]}.jpg`
          popImgs[1].hidden = !s.photos[1]
          if (s.photos[1]) popImgs[1].src = `${BASE}photos/s/${s.photos[1]}.jpg`
          popWord.textContent = s.word || ''
          const below = s.at[1] < 190
          pop.style.left = Math.min(86, Math.max(14, s.at[0] / 900 * 100)) + '%'
          pop.style.top = (s.at[1] / 520 * 100) + '%'
          pop.style.translate = below ? '-50% 22px' : ''
          pop.style.transformOrigin = below ? '50% 0' : ''
          pop.hidden = false
          time.textContent = `${s.time} · ${s.place}`
        }
      }
      if (i < 0) time.textContent = TRIP[0].time
      scrub.value = Math.round(t * 1000)
    }

    function frame(now) {
      if (!playing) return
      t = Math.min(1, t + (now - last) / DUR)
      last = now
      draw()
      if (t >= 1) setPlaying(false)
      else requestAnimationFrame(frame)
    }
    function setPlaying(on) {
      playing = on
      play.classList.toggle('is-playing', on)
      play.setAttribute('aria-label', on ? T.pause : T.play)
      if (on) { if (t >= 1) t = 0; last = performance.now(); requestAnimationFrame(frame) }
    }
    play.addEventListener('click', () => setPlaying(!playing))
    scrub.addEventListener('input', () => { setPlaying(false); t = scrub.value / 1000; draw() })

    // 처음 화면에 들어오면 한 번 스스로 재생한다
    let auto = !calm
    new IntersectionObserver(es => {
      for (const e of es) {
        if (e.isIntersecting && auto) { auto = false; setPlaying(true) }
        else if (!e.isIntersecting && playing) setPlaying(false)
      }
    }, { threshold: 0.55 }).observe($('.replay__stage', replay))
    t = calm ? 0.42 : 0
    draw()
  }

  // ── 날들 ───────────────────────────────────────────────────────────

  const grid = $('#daysGrid')
  if (grid) {
    const IDS = [323, 106, 16, 77, 385, 17, 287, 215, 74, 82, 13, 191, 42, 326, 292, 314, 10, 28, 124, 128, 162, 179, 217, 255, 110, 206, 152, 306, 360, 225, 365, 312, 63, 203, 141, 184, 381, 374, 11, 12, 14, 15, 18, 19, 25, 27, 33, 37, 38, 46, 47, 54, 59, 62, 66, 71, 85, 93, 95, 103, 108, 112, 116, 118, 125, 127, 129, 130, 132, 140, 142, 144, 147, 154, 155, 165, 166, 168, 170, 173, 174, 176, 177, 182, 186, 190, 196, 197, 199, 200, 204, 213, 219, 222, 228, 231, 235, 243, 247]
    const CAP = T.days
    const cap = $('#daysCap'), btns = $$('#daysSeg button')
    function setCols(n) {
      const need = n * n
      while (grid.children.length < need) {
        const i = grid.children.length
        const img = new Image()
        img.alt = ''
        img.decoding = 'async'
        img.src = `${BASE}photos/s/${IDS[(i * 37 + (i / IDS.length | 0) * 11) % IDS.length]}.jpg`
        grid.append(img)
      }
      grid.style.setProperty('--cols', n)
      cap.textContent = CAP[n]
      for (const b of btns) b.setAttribute('aria-pressed', String(+b.dataset.v === n))
    }
    for (const b of btns) b.addEventListener('click', () => setCols(+b.dataset.v))
    new IntersectionObserver((es, io) => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); setCols(5) }
    }, { rootMargin: '400px' }).observe(grid)
    cap.textContent = CAP[5]
  }

  // ── 액자 ───────────────────────────────────────────────────────────

  const fr = $('#frame-demo')
  if (fr) {
    const SLIDES = [
      { id: 323, stop: 7 }, { id: 326, stop: 2 }, { id: 287, stop: 5 }, { id: 106, stop: 6 },
      { id: 77, stop: 8 }, { id: 385, stop: 3 }, { id: 215, stop: 10 },
    ].map(f => ({ id: f.id, place: TRIP[f.stop].place, when: when.format(TRIP[f.stop].t), word: TRIP[f.stop].word }))
    const imgs = $$('.frame__img', fr)
    const K = k => $(`[data-k="${k}"]`, fr)
    let n = 0, cur = 0, timer = 0
    function show(i) {
      const s = SLIDES[i % SLIDES.length]
      const next = imgs[cur ^= 1]
      next.src = `${BASE}photos/${s.id}.jpg`
      next.alt = T.photo(s.place)
      next.classList.add('is-on')
      imgs[cur ^ 1].classList.remove('is-on')
      K('place').textContent = s.place
      K('when').textContent = s.when
      K('word').textContent = s.word
    }
    show(0)
    new IntersectionObserver(es => {
      const on = es.some(e => e.isIntersecting)
      clearInterval(timer)
      if (on) timer = setInterval(() => show(++n), 4000)
    }, { threshold: 0.3 }).observe(fr)
  }
})()
