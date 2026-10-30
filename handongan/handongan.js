/* 한동안 소개 페이지 — 창밖 풍경은 이 파일이 붓질하듯 그린다.
   같은 언덕을 아침 · 한낮 · 해질녘 · 밤 네 번 그려 두고, 스크롤을 내릴수록 시간이 흐른다.
   구름은 그림자 색으로 덩어리를 먼저 채우고, 해 쪽으로 밀어 낸 밝은 덩어리를 그 위에만 얹는다(셀 음영). */
(() => {
  'use strict';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 1600, H = 1000, HZ = 640;

  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const R = (a, b) => a + (b - a) * rnd();
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const smooth = t => t * t * (3 - 2 * t);

  // ── 네 때의 빛 ─────────────────────────────────────────────────────────
  const TIMES = [
    { sky: [[0, '#6fa6dc'], [.5, '#b3d5f0'], [.86, '#f3e7da'], [1, '#fde4cc']], sun: [330, 470, '#fff3dc'], glow: .6, disc: 34,
      cloud: ['#a9b9d6', '#eef3fa', '#ffffff'], haze: '#e2ebf3', mtn: ['#a4bcd5', '#86a2bf', '#6d8ca8'], lit: '#fff2dc',
      lake: ['#e6eef4', '#9cbfd9'], hill: ['#86ab70', '#5f8a54'], grass: ['#44703c', '#86b45c', '#dcecaa'], tree: ['#2e5638', '#5c8d4c', '#b4d68a'], trunk: ['#3a2e2a', '#8a7058'], star: 0, mote: '#fff8e0' },
    { sky: [[0, '#2a78d2'], [.55, '#6eaeea'], [1, '#cfe6f8']], sun: [1420, 40, '#ffffff'], glow: .4, disc: 0,
      cloud: ['#9fb2d6', '#edf2fa', '#ffffff'], haze: '#cde2f4', mtn: ['#98b6d6', '#7397bb', '#57809f'], lit: '#ffffff',
      lake: ['#b8dcf6', '#4f93d0'], hill: ['#73aa50', '#4d8a3c'], grass: ['#3c7830', '#7cb84e', '#e2f29a'], tree: ['#22502b', '#4d8c3b', '#a8d870'], trunk: ['#33281f', '#7a6048'], star: 0, mote: '#ffffff' },
    { sky: [[0, '#2b3170'], [.42, '#8e5585'], [.76, '#ee8f5c'], [1, '#ffd39a']], sun: [560, 618, '#ffcf87'], glow: 1, disc: 48,
      cloud: ['#594c88', '#e8957a', '#ffd9aa'], haze: '#d9988a', mtn: ['#9a7ca6', '#6a5686', '#463b64'], lit: '#ffc489',
      lake: ['#ffcf9a', '#8a6a9a'], hill: ['#5c5670', '#3c3a54'], grass: ['#2a2a3e', '#6a5068', '#f2aa6a'], tree: ['#221f36', '#473a56', '#f09e6c'], trunk: ['#1c1824', '#6a4a50'], star: .18, mote: '#ffd49a' },
    { sky: [[0, '#040918'], [.55, '#0d1a3a'], [1, '#26406c']], sun: [1220, 190, '#eef2ff'], glow: .45, disc: 0, moon: 36,
      cloud: ['#1a2550', '#33467a', '#8ea3d6'], haze: '#22365e', mtn: ['#1e2d52', '#16233f', '#0f182f'], lit: '#9db0de',
      lake: ['#2c4474', '#0a1430'], hill: ['#13213a', '#0b1527'], grass: ['#070f1c', '#18304a', '#6684b4'], tree: ['#060c18', '#121f38', '#7a94c8'], trunk: ['#05070d', '#1c2538'], star: 1, mote: '#e8ff9a' },
  ];

  // ── 지형 — 네 때 모두 같은 모양 ─────────────────────────────────────────
  const ridge = (x, base, amp, f, ph) => base - amp * (0.55 * Math.sin(x * f + ph) + 0.3 * Math.sin(x * f * 2.3 + ph * 1.7) + 0.15 * Math.sin(x * f * 5.3 + ph * .3) + .35);
  const MTN = [[520, 150, .0034, 1.2], [585, 95, .0058, 2.6], [628, 50, .0105, 4.1]];
  const backHill = x => 688 + 22 * Math.sin(x * .0032 + 1) + 12 * Math.sin(x * .009);
  const frontHill = x => 880 - 200 * Math.exp(-(((x - 1210) / 520) ** 2)) + 14 * Math.sin(x * .011);
  const TREE_X = 1230;

  function sky(T) {
    const c = canvas(W, H), g = c.getContext('2d');
    let gr = g.createLinearGradient(0, 0, 0, HZ + 30);
    T.sky.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const [sx, sy, sc] = T.sun;
    gr = g.createRadialGradient(sx, sy, 0, sx, sy, 1000);
    gr.addColorStop(0, rgba(sc, T.glow)); gr.addColorStop(.18, rgba(sc, T.glow * .4)); gr.addColorStop(1, rgba(sc, 0));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (T.star) {
      seed = 7;
      for (let i = 0; i < 900; i++) {
        const x = R(0, W), y = HZ * Math.pow(rnd(), 1.5), s = R(.6, 1.9);
        g.fillStyle = `rgba(255,255,255,${T.star * R(.15, 1) * (1 - y / HZ) ** .6})`;
        g.fillRect(x, y, s, s);
      }
    }
    if (T.disc) {
      gr = g.createRadialGradient(sx, sy, 0, sx, sy, T.disc);
      gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.7, mix(sc, '#ffffff', .5)); gr.addColorStop(1, rgba(sc, .0));
      g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, T.disc, 0, 7); g.fill();
    }
    if (T.moon) {
      gr = g.createRadialGradient(sx, sy, 0, sx, sy, 180);
      gr.addColorStop(0, 'rgba(220,230,255,.35)'); gr.addColorStop(1, 'rgba(220,230,255,0)');
      g.fillStyle = gr; g.fillRect(sx - 200, sy - 200, 400, 400);
      g.fillStyle = '#f3f1e6'; g.beginPath(); g.arc(sx, sy, T.moon, 0, 7); g.fill();
      g.fillStyle = 'rgba(190,196,214,.35)';
      [[-10, -8, 8], [12, 6, 6], [-4, 14, 5]].forEach(([x, y, r]) => { g.beginPath(); g.arc(sx + x, sy + y, r, 0, 7); g.fill(); });
    }
    return c;
  }

  // 뭉게구름 하나 — 그림자 덩어리 위에 해 쪽으로 밀어 낸 밝은 덩어리
  function cumulus(g, T, cx, by, w, h) {
    const blobs = [], n = Math.round(w / 11);
    for (let i = 0; i < n; i++) {
      const lv = Math.pow(rnd(), 1.5);
      const spread = (1 - lv * .8) * w / 2;
      const r = (R(.16, .3) * h * (1 - lv * .45)) + w * .025;
      blobs.push([cx + R(-spread, spread), by - r * .55 - lv * h * .85, r, lv]);
    }
    const pad = 40, ox = cx - w / 2 - h * .5 - pad, oy = by - h * 1.6 - pad;
    const c = canvas(Math.ceil(w + h + pad * 2), Math.ceil(h * 1.6 + pad * 2)), t = c.getContext('2d');
    t.translate(-ox, -oy);
    const dir = Math.sign(T.sun[0] - cx) || 1, up = T.sun[1] < by ? 1 : .35;
    t.fillStyle = T.cloud[0];
    blobs.forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); });
    t.clearRect(ox, by, c.width, c.height);
    t.globalCompositeOperation = 'source-atop';
    t.fillStyle = T.cloud[1];
    blobs.forEach(([x, y, r]) => { t.beginPath(); t.arc(x + dir * r * .2, y - r * .26 * up, r * .92, 0, 7); t.fill(); });
    t.fillStyle = T.cloud[2];
    blobs.forEach(([x, y, r, lv]) => { if (lv > .3) { t.beginPath(); t.arc(x + dir * r * .3, y - r * .38 * up, r * .76, 0, 7); t.fill(); } });
    const gr = t.createLinearGradient(0, by - h * .45, 0, by);
    gr.addColorStop(0, rgba(T.cloud[0], 0)); gr.addColorStop(1, rgba(T.cloud[0], .75));
    t.fillStyle = gr; t.fillRect(ox, by - h * .45, c.width, h * .45);
    g.save(); g.filter = 'blur(1.6px)'; g.drawImage(c, ox, oy); g.restore();
  }

  const CW = 2200, CH = 700;
  function clouds(T) {
    seed = 99;
    const c = canvas(CW, CH), g = c.getContext('2d');
    [[1720, 560, 600, 340], [420, 380, 420, 170], [900, 230, 300, 100], [160, 190, 240, 70], [2080, 250, 240, 80], [1180, 470, 260, 90]]
      .forEach(([cx, by, w, h]) => cumulus(g, T, cx, by, w, h));
    return c;
  }

  function land(T) {
    seed = 42;
    const c = canvas(W, H), g = c.getContext('2d');
    const [sx] = T.sun;
    // 먼 산 세 겹 — 멀수록 하늘빛에 잠긴다
    MTN.forEach(([base, amp, f, ph], i) => {
      const top = base - amp * 1.4;
      const gr = g.createLinearGradient(0, top, 0, HZ + 10);
      gr.addColorStop(0, mix(T.mtn[i], T.haze, .2 - i * .05)); gr.addColorStop(1, mix(T.mtn[i], T.haze, .65 - i * .15));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) g.lineTo(x, ridge(x, base, amp, f, ph));
      g.lineTo(W, H); g.fill();
      // 해를 보는 비탈만 밝게
      for (let x = 0; x < W; x += 3) {
        const y = ridge(x, base, amp, f, ph), s = ridge(x + 5, base, amp, f, ph) - ridge(x - 5, base, amp, f, ph);
        if ((sx - x) * s >= 0) continue;
        const a = Math.min(.32, Math.abs(s) / 18) * (1 - i * .2);
        const len = 30 + amp * .5;
        const lg = g.createLinearGradient(0, y, 0, y + len);
        lg.addColorStop(0, rgba(T.lit, a)); lg.addColorStop(1, rgba(T.lit, 0));
        g.fillStyle = lg; g.fillRect(x, y, 3, len);
      }
    });
    // 지평선 안개
    let gr = g.createLinearGradient(0, HZ - 90, 0, HZ + 30);
    gr.addColorStop(0, rgba(T.haze, 0)); gr.addColorStop(.7, rgba(T.haze, .55)); gr.addColorStop(1, rgba(T.haze, 0));
    g.fillStyle = gr; g.fillRect(0, HZ - 90, W, 120);
    // 호수
    const lakeEnd = 980;
    g.save();
    g.beginPath(); g.moveTo(-10, HZ);
    for (let x = 0; x <= lakeEnd; x += 6) g.lineTo(x, HZ - 2 + Math.sin(x * .05) * 1.5);
    for (let x = lakeEnd; x >= 0; x -= 6) g.lineTo(x, HZ + (50 + 26 * Math.sin(x * .007 + 1)) * (1 - smooth(Math.max(0, Math.min(1, (x - lakeEnd + 300) / 300)))));
    g.closePath(); g.clip();
    gr = g.createLinearGradient(0, HZ, 0, HZ + 80);
    gr.addColorStop(0, T.lake[0]); gr.addColorStop(1, T.lake[1]);
    g.fillStyle = gr; g.fillRect(0, HZ - 4, lakeEnd + 10, 100);
    // 해 · 달이 물에 비친 기둥과 잔물결
    for (let i = 0; i < 260; i++) {
      const y = HZ + R(2, 80), near = Math.abs(R(-1, 1)) ** 2;
      const any = R(0, lakeEnd), x = (T.sun[0] < lakeEnd ? T.sun[0] : any) + R(-1, 1) * (40 + (y - HZ) * 1.2) * (near + .2);   // 난수는 늘 같은 횟수로 — 네 때의 모양이 같아야 한다
      g.fillStyle = rgba(T.disc || T.moon ? mix(T.sun[2], '#ffffff', .3) : '#ffffff', R(.12, .5));
      g.fillRect(x, y, R(8, 40), 1.2);
    }
    g.restore();
    // 뒤 언덕
    gr = g.createLinearGradient(0, 660, 0, 760);
    gr.addColorStop(0, mix(T.hill[0], T.lit, .12)); gr.addColorStop(1, T.hill[1]);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) g.lineTo(x, backHill(x));
    g.lineTo(W, H); g.fill();
    g.strokeStyle = rgba(T.lit, .35); g.lineWidth = 2;
    g.beginPath(); for (let x = 0; x <= W; x += 4) g.lineTo(x, backHill(x) + 1); g.stroke();
    for (let i = 0; i < 2600; i++) {
      const x = R(0, W), y = backHill(x) + R(2, 80);
      g.strokeStyle = rgba(rnd() > .5 ? T.grass[1] : T.hill[1], R(.25, .6));
      g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R(-1, 2), y - R(2, 5)); g.stroke();
    }
    // 앞 언덕
    gr = g.createLinearGradient(0, 680, 0, H);
    gr.addColorStop(0, mix(T.grass[1], T.lit, .18)); gr.addColorStop(.35, T.grass[1]); gr.addColorStop(1, T.grass[0]);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) g.lineTo(x, frontHill(x));
    g.lineTo(W, H); g.fill();
    // 나무 — 풀보다 먼저
    tree(g, T, TREE_X, frontHill(TREE_X) + 6);
    // 풀
    for (let i = 0; i < 16000; i++) {
      const x = R(-20, W + 20), top = frontHill(x), y = top + Math.pow(rnd(), 1.7) * (H - top + 30);
      const d = Math.min(1, (y - top) / (H - top));
      const len = 5 + d * 30 + R(0, 6), lean = .18 + R(-.3, .3);
      const k = rnd() * (1 - d * .6);
      g.strokeStyle = k > .72 ? rgba(T.grass[2], .55 + R(0, .35)) : rgba(k > .35 ? T.grass[1] : T.grass[0], .7);
      g.lineWidth = .8 + d * 1.8;
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + lean * len * .3, y - len * .6, x + lean * len, y - len);
      g.stroke();
    }
    // 들꽃
    for (let i = 0; i < 260; i++) {
      const x = R(0, W), top = frontHill(x), y = top + Math.pow(rnd(), 1.3) * (H - top);
      const d = (y - top) / (H - top);
      g.fillStyle = rgba(rnd() > .4 ? '#ffffff' : '#ffe08a', (T.star ? .25 : .8) * R(.5, 1));
      g.beginPath(); g.arc(x, y, .8 + d * 2.4, 0, 7); g.fill();
    }
    // 가장자리 그늘
    gr = g.createRadialGradient(W * .55, H * .45, H * .3, W * .55, H * .45, H * 1.05);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  }

  function tree(g, T, x0, y0) {
    const dir = Math.sign(T.sun[0] - x0) || 1;
    // 줄기와 가지
    g.fillStyle = T.trunk[0];
    g.beginPath();
    g.moveTo(x0 - 22, y0 + 8);
    g.quadraticCurveTo(x0 - 6, y0 - 110, x0 - 14, y0 - 250);
    g.lineTo(x0 + 12, y0 - 250);
    g.quadraticCurveTo(x0 + 6, y0 - 110, x0 + 24, y0 + 8);
    g.fill();
    g.fillStyle = T.trunk[1];
    g.beginPath();
    g.moveTo(x0 + dir * 4, y0 + 6);
    g.quadraticCurveTo(x0 + dir * 4, y0 - 110, x0 + dir * 2, y0 - 240);
    g.lineTo(x0 + dir * 9, y0 - 240);
    g.quadraticCurveTo(x0 + dir * 8, y0 - 110, x0 + dir * 18, y0 + 6);
    g.fill();
    g.strokeStyle = T.trunk[0]; g.lineCap = 'round';
    [[-1, 150, 120, 9], [1, 170, 140, 8], [-1, 230, 70, 6], [1, 240, 90, 5]].forEach(([s, h, len, w]) => {
      g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0 - h); g.quadraticCurveTo(x0 + s * len * .5, y0 - h - 20, x0 + s * len, y0 - h - 70); g.stroke();
    });
    // 잎 — 작은 원으로 테두리가 오돌토돌한 덩어리를 여럿 만들고, 아래 덩어리를 앞에 얹는다
    const cw = 680, ch = 520, cv = canvas(cw, ch), t = cv.getContext('2d');
    const cx = cw / 2, cy = ch / 2 + 10, clumps = [];
    for (let i = 0; i < 17; i++) {
      const a = R(0, Math.PI * 2), rr = Math.sqrt(rnd());
      clumps.push([cx + Math.cos(a) * rr * 200, cy + Math.sin(a) * rr * 110 - (1 - rr) * 30, R(70, 105), R(48, 70)]);
    }
    clumps.sort((p, q) => p[1] - q[1]);
    clumps.forEach(([x, y, rx, ry], k) => {
      const tw = Math.ceil(rx * 2 + 60), th = Math.ceil(ry * 2 + 60), tc = canvas(tw, th), u = tc.getContext('2d');
      const dots = [];
      for (let j = 0; j < 34; j++) {
        const a = R(0, Math.PI * 2), q = Math.sqrt(rnd()) * .82;
        dots.push([tw / 2 + Math.cos(a) * q * rx, th / 2 + Math.sin(a) * q * ry, R(14, 28)]);
      }
      u.fillStyle = T.tree[0];
      dots.forEach(([dx, dy, r]) => { u.beginPath(); u.arc(dx, dy, r, 0, 7); u.fill(); });
      u.globalCompositeOperation = 'source-atop';
      u.fillStyle = mix(T.tree[0], T.tree[1], .55 + k / clumps.length * .45);
      dots.forEach(([dx, dy, r]) => { u.beginPath(); u.arc(dx + dir * 9, dy - 12, r, 0, 7); u.fill(); });
      u.fillStyle = T.tree[2];
      dots.forEach(([dx, dy, r]) => { if (dy < th / 2) { u.beginPath(); u.arc(dx + dir * 18, dy - 22, r * .9, 0, 7); u.fill(); } });
      for (let j = 0; j < 160; j++) {
        u.fillStyle = rgba(T.tree[rnd() > .5 ? 0 : 1], R(.2, .5));
        u.beginPath(); u.ellipse(R(0, tw), R(0, th), R(2, 6), R(1.5, 3), R(0, 3), 0, 7); u.fill();
      }
      const sh = u.createLinearGradient(0, th * .45, 0, th);
      sh.addColorStop(0, rgba(T.tree[0], 0)); sh.addColorStop(1, rgba(T.tree[0], .7));
      u.fillStyle = sh; u.fillRect(0, 0, tw, th);
      t.drawImage(tc, x - tw / 2, y - th / 2);
    });
    g.drawImage(cv, x0 - cw / 2 + dir * -10, y0 - 290 - ch / 2);
    // 나무 그늘
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.beginPath(); g.ellipse(x0 - dir * 90, y0 + 6, 200, 18, 0, 0, 7); g.fill();
  }

  // ── 그리기 ─────────────────────────────────────────────────────────────
  const layers = [];   // [{sky, clouds, land}] — 때마다
  const paint = i => layers[i] || (layers[i] = { sky: sky(TIMES[i]), clouds: clouds(TIMES[i]), land: land(TIMES[i]) });

  const view = document.getElementById('scene');
  const vg = view.getContext('2d');
  let vw = 0, vh = 0, dpr = 1;
  function fit() {
    dpr = Math.min(2, devicePixelRatio || 1);
    vw = innerWidth; vh = innerHeight;
    view.width = Math.round(vw * dpr); view.height = Math.round(vh * dpr);
  }

  let time = 0, drift = 0;
  const motes = [];
  function frame() {
    const cw = view.width, ch = view.height;
    const s = Math.max(cw / W, ch / H), dw = W * s, dh = H * s;
    const dx = (cw - dw) * (vw < 700 ? .86 : .5), dy = (ch - dh) * .8;
    const a = Math.floor(time), b = Math.min(3, a + 1), f = smooth(time - a);
    const L = [[a, 1], [b, f]];
    vg.globalAlpha = 1;
    L.forEach(([i, al]) => { if (!al) return; const Ly = paint(i); vg.globalAlpha = al; vg.drawImage(Ly.sky, dx, dy, dw, dh); });
    const cx = -(CW - W) * (.5 - .5 * Math.cos(drift / 900)) * s;   // 천천히 갔다가 돌아온다
    L.forEach(([i, al]) => {
      if (!al) return;
      vg.globalAlpha = al;
      vg.drawImage(paint(i).clouds, dx + cx, dy, CW * s, CH * s);
    });
    L.forEach(([i, al]) => { if (!al) return; vg.globalAlpha = al; vg.drawImage(paint(i).land, dx, dy, dw, dh); });
    vg.globalAlpha = 1;
    // 떠다니는 빛 — 낮엔 꽃가루, 밤엔 반딧불
    const night = Math.max(0, time - 2);
    if (motes.length < 34) motes.push({ x: Math.random(), y: .66 + Math.random() * .34, p: Math.random() * 6, v: .2 + Math.random() * .5 });
    motes.forEach(m => {
      m.p += .02; m.x += .00018 * m.v; m.y -= .00008 * m.v;
      if (m.x > 1.02) m.x = -.02;
      const tw = night > .5 ? (Math.sin(m.p * 2.3) * .5 + .5) : .55;
      const col = night > .5 ? TIMES[3].mote : TIMES[Math.min(2, Math.round(time))].mote;
      const r = (night > .5 ? 1.7 : 1.2) * dpr;
      const px = dx + m.x * dw, py = dy + (m.y + Math.sin(m.p) * .004) * dh;
      if (px < 0 || px > cw || py < 0 || py > ch) return;
      vg.fillStyle = rgba(col, .75 * tw);
      vg.beginPath(); vg.arc(px, py, r, 0, 7); vg.fill();
      if (night > .5) { vg.fillStyle = rgba(col, .08 * tw); vg.beginPath(); vg.arc(px, py, r * 3.2, 0, 7); vg.fill(); }
    });
  }

  // 스크롤 위치 → 하루 중 때 (마디의 data-time 을 잇는다)
  let marks = [];
  function measure() {
    marks = [...document.querySelectorAll('[data-time]')].map(el => [el.offsetTop + el.offsetHeight / 2, Number(el.dataset.time)]);
  }
  function timeAt(y) {
    const p = y + vh / 2;
    if (!marks.length || p <= marks[0][0]) return 0;
    for (let i = 1; i < marks.length; i++) {
      const [y0, t0] = marks[i - 1], [y1, t1] = marks[i];
      if (p < y1) return t0 + (t1 - t0) * (p - y0) / (y1 - y0);
    }
    return marks[marks.length - 1][1];
  }

  // 메뉴 막대의 「오늘 N분」과 떠 있는 메시지
  const today = document.querySelector('[data-today]');
  const fmt = m => m < 60 ? `오늘 ${m}분` : `오늘 ${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}`;
  const SAYS = [[180, '세 시간째다... 물 좀 마셔요'], [300, '오늘 좀 몰아쳤네요. 잠깐 밖 보세요'], [410, '오늘은 여기까지?']];
  const said = new Set();
  const float = document.getElementById('float');
  let floatTimer;
  function say(text) {
    float.querySelector('span').textContent = text;
    float.hidden = false; float.classList.remove('is-out');
    clearTimeout(floatTimer);
    floatTimer = setTimeout(() => { float.classList.add('is-out'); setTimeout(() => { float.hidden = true; }, 420); }, 5200);
  }
  float.addEventListener('click', () => { float.hidden = true; document.getElementById('talk').scrollIntoView(); });
  function tickClock() {
    const min = Math.round(time / 3 * 420);
    today.textContent = fmt(min);
    SAYS.forEach(([at, text]) => { if (min >= at && !said.has(at)) { said.add(at); say(text); } });
  }

  let target = 0, last = 0;
  function loop(now) {
    if (now - last > 33) {
      last = now;
      time += (target - time) * .12;
      if (Math.abs(target - time) < .001) time = target;
      drift += .25;
      frame();
      tickClock();
    }
    requestAnimationFrame(loop);
  }
  function onScroll() {
    target = timeAt(scrollY);
    if (still) { time = target; frame(); tickClock(); }
  }

  // ── 창문 모형 · 보는 창만 밝게 ────────────────────────────────────────────────
  function desk() {
    const box = document.getElementById('desk');
    const wins = [...box.querySelectorAll('[data-win]')];
    wins.forEach(w => w.addEventListener('click', () => { wins.forEach(x => x.classList.toggle('is-active', x === w)); }));
    const dim = document.getElementById('dim');
    const set = () => box.style.setProperty('--dim', dim.value / 100);
    dim.addEventListener('input', set); set();
  }
  const pane = document.getElementById('pane');
  let paneAt = -1;
  function drawPane() {
    const i = Math.round(time);
    if (i === paneAt) return;
    paneAt = i;
    const g = pane.getContext('2d'), Ly = paint(i), s = pane.width / 900;
    g.drawImage(Ly.sky, -700 * s, -380 * s, W * s, H * s);
    g.drawImage(Ly.clouds, -700 * s, -380 * s, CW * s, CH * s);
    g.drawImage(Ly.land, -700 * s, -380 * s, W * s, H * s);
  }

  // ── 소리 — 브라우저가 지금 만들어 내는 장소의 소리 ─────────────────────
  const mix_ = { rain: true, wind: false, thunder: false };
  let A = null;
  function noise(ctx, brown) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s;
  }
  function startAudio() {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    const ctx = new C(), out = ctx.createGain(); out.gain.value = .8; out.connect(ctx.destination);
    const chain = (src, ...nodes) => { nodes.reduce((a, b) => (a.connect(b), b), src); return nodes[nodes.length - 1]; };
    const bp = (f, q) => { const n = ctx.createBiquadFilter(); n.type = 'bandpass'; n.frequency.value = f; n.Q.value = q; return n; };
    const lp = f => { const n = ctx.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = f; return n; };
    const gain = v => { const n = ctx.createGain(); n.gain.value = v; return n; };
    // 장소: 언덕을 지나는 바람결 + 새
    const place = gain(.7);
    chain(noise(ctx, true), lp(700), gain(.5), place).connect(out);
    const birds = gain(1); birds.connect(place);
    // 비
    const rain = gain(0);
    chain(noise(ctx), bp(2600, .6), lp(7000), gain(.22), rain).connect(out);
    chain(noise(ctx, true), lp(1600), gain(.35), rain);
    // 바람 — 세기가 천천히 오르내린다
    const wind = gain(0);
    const wf = bp(480, 1.4), wl = ctx.createOscillator(), wd = gain(260);
    wl.frequency.value = .11; wl.connect(wd); wd.connect(wf.frequency); wl.start();
    chain(noise(ctx, true), wf, gain(1.4), wind).connect(out);
    // 천둥
    const thunder = gain(0); thunder.connect(out);
    const boom = () => {
      if (A && mix_.thunder) {
        const s = noise(ctx, true), f = lp(160), g = gain(0), t = ctx.currentTime;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(2.2, t + .35); g.gain.exponentialRampToValueAtTime(.001, t + 4.5);
        chain(s, f, g, thunder); s.stop(t + 4.6);
      }
      setTimeout(boom, 7000 + Math.random() * 9000);
    };
    setTimeout(boom, 1500);
    const chirp = () => {
      if (A && time < 2.3) {
        const t = ctx.currentTime;
        for (let k = 0; k < 2 + (Math.random() * 3 | 0); k++) {
          const o = ctx.createOscillator(), g = gain(0), t0 = t + k * .14, f0 = 2800 + Math.random() * 1200;
          o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t0 + .08);
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.04, t0 + .02); g.gain.linearRampToValueAtTime(0, t0 + .1);
          o.connect(g); g.connect(birds); o.start(t0); o.stop(t0 + .12);
        }
      }
      setTimeout(chirp, 2500 + Math.random() * 5000);
    };
    chirp();
    A = { ctx, out, place, layer: { rain, wind, thunder } };
    applyMix();
    return true;
  }
  function applyMix() {
    if (!A) return;
    const t = A.ctx.currentTime;
    A.place.gain.setTargetAtTime(Number(document.getElementById('vol').value) / 100, t, .2);
    Object.entries(A.layer).forEach(([k, n]) => n.gain.setTargetAtTime(mix_[k] ? 1 : 0, t, .4));
  }
  function mixer() {
    const btn = document.getElementById('audio');
    btn.addEventListener('click', () => {
      if (!A) { if (!startAudio()) { btn.textContent = '이 브라우저는 소리를 못 내요'; return; } }
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on);
      btn.textContent = on ? '소리 끄기' : '소리 켜기';
      on ? A.ctx.resume() : A.ctx.suspend();
    });
    document.getElementById('vol').addEventListener('input', applyMix);
    const buttons = [...document.querySelectorAll('[data-layer]')];
    const sync = () => buttons.forEach(b => b.setAttribute('aria-pressed', mix_[b.dataset.layer]));
    buttons.forEach(b => {
      b.querySelector('.meter').innerHTML = '<i></i>'.repeat(12);
      b.addEventListener('click', () => { mix_[b.dataset.layer] = !mix_[b.dataset.layer]; sync(); applyMix(); });
    });
    // 소리 막대
    const bars = buttons.map(b => [b, [...b.querySelectorAll('.meter i')]]);
    let ph = 0;
    const dance = () => {
      ph += .25;
      bars.forEach(([b, is], j) => {
        if (!mix_[b.dataset.layer]) return;
        is.forEach((el, i) => {
          const base = j === 0 ? .55 : j === 1 ? .35 + .3 * Math.sin(ph * .2 + i * .3) : .15;
          el.style.height = `${Math.max(8, Math.min(100, (base + Math.random() * .4) * 100))}%`;
        });
      });
      if (!still) setTimeout(dance, 110);
    };
    dance();
  }

  // ── 하루의 끝 — 누르면 한 줄씩 떠오른다 ─────────────────────────────
  function day() {
    const box = document.getElementById('daycard'), btn = document.getElementById('close-day');
    const lines = [...box.querySelectorAll('.day__lines li')];
    btn.addEventListener('click', () => {
      box.classList.add('is-done');
      lines.forEach((li, i) => { li.classList.remove('is-on'); setTimeout(() => li.classList.add('is-on'), still ? 0 : 200 + i * 650); });
      btn.textContent = '다시 보기';
    });
  }

  // ── 지난 기록 탭 ───────────────────────────────────────────────────────
  function tabs() {
    const box = document.getElementById('trendbox');
    const ts = [...box.querySelectorAll('[data-tab]')];
    ts.forEach(t => t.addEventListener('click', () => {
      ts.forEach(x => x.setAttribute('aria-selected', x === t));
      box.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));
  }

  // ── 시작 ───────────────────────────────────────────────────────────────
  fit(); measure();
  paint(0);
  target = time = timeAt(scrollY);
  frame();
  addEventListener('resize', () => { fit(); measure(); onScroll(); frame(); });
  addEventListener('scroll', onScroll, { passive: true });
  desk(); mixer(); tabs(); day();
  // 나머지 때는 첫 화면이 뜬 뒤에 천천히 그린다
  const rest = [1, 2, 3];
  const idle = window.requestIdleCallback || (f => setTimeout(f, 60));
  const more = () => { const i = rest.shift(); if (i === undefined) return; paint(i); idle(more); };
  idle(more);
  setInterval(drawPane, 500); drawPane();
  if (!still) requestAnimationFrame(loop); else tickClock();
})();
