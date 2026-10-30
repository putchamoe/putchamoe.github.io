/* 한끼 소개 페이지 — 그림은 전부 이 파일이 픽셀 단위로 그린다.
   빛은 늘 왼쪽 위에서 온다. 색은 PAL 안에서만 고르고, 계조는 4×4 바이어 디더링으로 낸다. */
(() => {
  'use strict';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 팔레트 ─────────────────────────────────────────────────────────────
  const PAL = {
    ink: '#1b1016', night: '#221726', dusk: '#33243a', plum: '#4a3150',
    cherry: ['#4f0b1f', '#8e1232', '#c42a4d', '#ee6a7f'],
    cream: ['#8f7d68', '#b8a48a', '#e8d9c0', '#fff6e6'],
    gold: ['#6b4a0e', '#b8861a', '#e6b83a', '#fde58a'],
    silver: ['#454c58', '#7f8999', '#b9c2cf', '#f0f4f8'],
    bronze: ['#55290f', '#94562a', '#c9854a', '#eeb886'],
    warm: ['#a8541e', '#f08c34', '#ffc65e', '#ffeaa6'],
    wood: ['#2a160e', '#4a2918', '#6e3f22', '#98602f'],
    leaf: ['#20391f', '#3a6431', '#679a42', '#a6cf6a'],
    water: ['#1d3360', '#2c5591', '#5689c9', '#a3cbf2'],
    stone: ['#2a2230', '#3b3242', '#5b5262', '#8c8494'],
    face: ['#a8681a', '#e0a530', '#f7cf55', '#fff0a0'],
    teal: ['#0f4a4a', '#1f8a80', '#3fc2b0', '#a4f0de'],
  };

  // ── 픽셀 캔버스 ─────────────────────────────────────────────────────────
  const rgbCache = {};
  const rgb = h => rgbCache[h] || (rgbCache[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const dith = (x, y, t) => t * 16 > BAYER[y & 3][x & 3] + 0.5;
  /** 0..1 값을 색 계단 위에 놓는다 — 계단 사이는 디더링 */
  const ramp = (r, v, x, y) => {
    v = Math.max(0, Math.min(0.999, v));
    const f = v * (r.length - 1), i = Math.floor(f);
    return i + 1 < r.length && dith(x, y, f - i) ? r[i + 1] : r[i];
  };
  /** 왼쪽 위 빛을 받은 둥근 면의 밝기 */
  const lit = (nx, ny, base = 0.5, k = 0.5) => base - (nx * 0.55 + ny * 0.8) * k;

  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  class Pix {
    constructor(w, h) {
      this.w = w; this.h = h;
      this.c = document.createElement('canvas');
      this.c.width = w; this.c.height = h;
      this.g = this.c.getContext('2d');
      this.img = this.g.createImageData(w, h);
      this.d = this.img.data;
    }
    set(x, y, h) {
      x |= 0; y |= 0;
      if (!h || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      const [r, g, b] = rgb(h), i = (y * this.w + x) * 4;
      this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = 255;
    }
    on(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[(y * this.w + x) * 4 + 3] > 0; }
    rect(x, y, w, h, f) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, typeof f === 'function' ? f(i, j) : f);
    }
    ell(cx, cy, rx, ry, f) {
      for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
        for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
          const nx = (i + 0.5 - cx) / rx, ny = (j + 0.5 - cy) / ry, r2 = nx * nx + ny * ny;
          if (r2 <= 1) this.set(i, j, typeof f === 'function' ? f(i, j, nx, ny, r2) : f);
        }
    }
    line(x0, y0, x1, y1, h) {
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) {
        this.set(x0, y0, typeof h === 'function' ? h(x0, y0) : h);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    }
    spr(rows, x, y, pal) {
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (pal[ch]) this.set(x + i, y + j, pal[ch]); }));
    }
    /** 칠해진 픽셀 둘레에 1px 테두리 */
    outline(h = PAL.ink) {
      const hit = [];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++)
        if (!this.on(x, y) && (this.on(x - 1, y) || this.on(x + 1, y) || this.on(x, y - 1) || this.on(x, y + 1))) hit.push([x, y]);
      hit.forEach(([x, y]) => this.set(x, y, h));
    }
    /** 글자를 팔레트 한 색으로 찍는다 — 안티앨리어싱을 버린다 */
    text(str, x, y, font, h, align = 'left') {
      const t = document.createElement('canvas').getContext('2d');
      t.font = font;
      const w = Math.ceil(t.measureText(str).width) + 4, hh = 40;
      t.canvas.width = w; t.canvas.height = hh;
      t.font = font; t.textBaseline = 'top'; t.fillStyle = '#000';
      t.fillText(str, 0, 0);
      const d = t.getImageData(0, 0, w, hh).data;
      const ox = align === 'center' ? x - Math.round(w / 2) + 2 : x;
      for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) this.set(ox + i, y + j, h);
    }
    done() { this.g.putImageData(this.img, 0, 0); return this.c; }
    url() { return this.done().toDataURL(); }
  }


  // ── 작은 그림: 그릇 · 숟가락 · 표정 · 휘장 · 핀 ─────────────────────────
  function bowl(metal, w = 30) {
    const r = PAL[metal], h = Math.round(w * 0.78), p = new Pix(w + 2, h + 2);
    const cx = (w + 2) / 2, top = 5, rx = w / 2 - 1, ry = h - 9;
    // 몸통 — 금속은 좁은 반사 띠가 있어야 금속으로 읽힌다
    p.ell(cx, top, rx, ry, (x, y, nx, ny) => {
      if (y < top) return null;
      let v = 0.42 - nx * 0.38 - ny * 0.12;
      if (Math.abs(nx + 0.48) < 0.1) v = 1;
      if (Math.abs(nx - 0.62) < 0.05) v = 0.62;
      return ramp(r, v, x, y);
    });
    // 굽
    p.rect(Math.round(cx - w * 0.17), top + ry - 1, Math.round(w * 0.34), 4, (x, y) => ramp(r, 0.35 - (x - cx) / w, x, y));
    // 입 — 안쪽은 어둡게, 앞 테는 밝게
    p.ell(cx, top, rx, 3.6, (x, y, nx, ny, r2) => r2 > 0.62 ? ramp(r, 0.8 - nx * 0.2, x, y) : ramp(r, 0.12 + nx * 0.25 + (ny > 0 ? 0.1 : 0), x, y));
    p.outline();
    return p.done();
  }

  function spoon(on) {
    const p = new Pix(7, 19);
    const a = on ? PAL.cream : ['#3b2a40', '#4a3550', '#5a4262', '#6a4f72'];
    p.ell(3.5, 4.5, 3.2, 4.3, (x, y, nx, ny) => ramp(a, lit(nx, ny, 0.6, 0.55), x, y));
    p.rect(3, 9, 1, 9, (x, y) => a[y % 5 === 0 ? 2 : 3]);
    p.rect(2, 9, 1, 2, a[1]);
    p.outline();
    return p.done();
  }

  const FACE_MOUTH = {
    beaming: { eyes: 'arc', mouth: [[5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [5, 11], [10, 11], [6, 12], [7, 12], [8, 12], [9, 12]], red: [[6, 11], [7, 11], [8, 11], [9, 11]], cheek: true },
    smile: { eyes: 'dot', mouth: [[5, 10], [10, 10], [6, 11], [7, 11], [8, 11], [9, 11]], cheek: true },
    neutral: { eyes: 'dot', mouth: [[5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11]] },
    sulky: { eyes: 'dot', mouth: [[6, 10], [7, 10], [8, 10], [9, 10], [5, 11], [10, 11]], brow: true },
    crying: { eyes: 'shut', mouth: [[6, 10], [7, 10], [8, 10], [9, 10], [5, 11], [10, 11]], tear: true },
  };
  function face(kind) {
    const p = new Pix(16, 16), f = FACE_MOUTH[kind], k = PAL.ink;
    p.ell(8, 8, 7, 7, (x, y, nx, ny) => ramp(PAL.face, lit(nx, ny, 0.62, 0.5), x, y));
    p.set(4, 3, PAL.face[3]); p.set(5, 3, PAL.face[3]); p.set(4, 4, PAL.face[3]);
    if (f.eyes === 'dot') { [[5, 6], [5, 7], [10, 6], [10, 7]].forEach(([x, y]) => p.set(x, y, k)); }
    if (f.eyes === 'arc') { [[4, 7], [5, 6], [6, 7], [9, 7], [10, 6], [11, 7]].forEach(([x, y]) => p.set(x, y, k)); }
    if (f.eyes === 'shut') { [[4, 7], [5, 7], [6, 7], [9, 7], [10, 7], [11, 7]].forEach(([x, y]) => p.set(x, y, k)); }
    if (f.brow) { [[4, 4], [5, 5], [11, 4], [10, 5]].forEach(([x, y]) => p.set(x, y, PAL.face[0])); }
    f.mouth.forEach(([x, y]) => p.set(x, y, k));
    (f.red || []).forEach(([x, y]) => p.set(x, y, PAL.cherry[2]));
    if (f.cheek) { p.set(3, 9, PAL.cherry[3]); p.set(12, 9, PAL.cherry[3]); }
    if (f.tear) { [[4, 8], [4, 9], [3, 10], [4, 10]].forEach(([x, y]) => p.set(x, y, PAL.water[3])); }
    p.outline();
    return p.done();
  }

  const BADGE_ICON = {
    value: ['.w.....w.', '.w..w..w.', 'wwwwwwwww', '.w.w.w.w.', 'wwwwwwwww', '..w...w..', '..w...w..'],
    queue: ['.w...w...w.', 'www.www.www', '.w...w...w.', '.w...w...w.', 'w.w.w.w.w.w'],
    solo: ['...ww...', '...ww...', '..wwww..', '.w.ww.w.', '...ww...', '..w..w..', '..w..w..'],
    gathering: ['.w.....w.', 'www.w.www', '...www...', 'wwwwwwwww', '.w.....w.', '.w.....w.'],
    mood: ['..w......', '..w....w.', 'wwwww.www', '..w....w.', '..w..w...', '....www..', '.....w...'],
    pairing: ['.wwwwww.', '.wwwwww.', '.w....w.', '..w..w..', '...ww...', '...ww...', '..wwww..'],
    oldSchool: ['..wwww..', '.w..w.w.', 'w...w..w', 'w...www.', 'w......w', '.w....w.', '..wwww..'],
    takeout: ['...ww...', '..w..w..', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
  };
  function badge(key) {
    const W = 22, H = 24, p = new Pix(W, H), cx = W / 2;
    const inside = (x, y) => {
      if (y < 1 || y > H - 2) return false;
      if (y < 13) return x >= 1 + (y < 3 ? 3 - y : 0) && x <= W - 2 - (y < 3 ? 3 - y : 0);
      const half = (W / 2 - 1) * (1 - (y - 12) / (H - 13));
      return Math.abs(x + 0.5 - cx) <= half;
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inside(x, y)) {
      const rim = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      const v = 0.75 - (x / W) * 0.35 - (y / H) * 0.45;
      p.set(x, y, rim ? ramp(PAL.gold, v + 0.2, x, y) : ramp(PAL.cherry, v, x, y));
    }
    const icon = BADGE_ICON[key], iw = icon[0].length;
    p.spr(icon, Math.round(cx - iw / 2), 5 + (icon.length < 7 ? 1 : 0), { w: PAL.cream[3] });
    p.outline();
    return p.done();
  }

  function pin(metal) {
    const p = new Pix(11, 14), r = metal === 'friend' ? PAL.teal : PAL[metal];
    if (metal === 'friend') {
      // 받은 모음 — 마름모
      p.ell(5.5, 5.5, 5, 5, (x, y) => {
        const d = Math.abs(x + 0.5 - 5.5) + Math.abs(y + 0.5 - 5.5);
        return d <= 5 ? ramp(r, 0.8 - (x + y) / 22, x, y) : null;
      });
      p.rect(5, 10, 1, 3, PAL.ink);
    } else {
      p.ell(5.5, 5, 5, 5, (x, y, nx, ny) => ramp(r, lit(nx, ny, 0.58, 0.55), x, y));
      for (let y = 9; y < 13; y++) { const h = 13 - y; p.rect(Math.round(5.5 - h / 2.2), y, Math.max(1, Math.round(h / 1.1)), 1, r[1]); }
      p.ell(5.5, 5, 2, 2, PAL.cream[3]);
    }
    p.outline();
    return p.done();
  }

  /** 자물쇠 채운 도시락 — 개인정보 */
  function lunchbox() {
    const p = new Pix(50, 40);
    p.ell(27, 35, 22, 4, (x, y) => dith(x, y, 0.5) ? PAL.ink : null);
    p.rect(5, 8, 40, 8, (x, y) => ramp(PAL.cherry, 0.95 - (y - 8) / 30 - (x - 5) / 120, x, y));
    p.rect(5, 16, 40, 18, (x, y) => ramp(PAL.cherry, 0.55 - (x - 5) / 70 - (y - 16) / 60, x, y));
    p.rect(5, 16, 40, 1, PAL.cherry[0]);
    p.rect(5, 21, 40, 1, PAL.cherry[0]);
    p.rect(23, 8, 4, 26, (x, y) => ramp(PAL.gold, y < 16 ? 0.9 : 0.6 - (x - 23) / 8, x, y));
    p.ell(25, 21, 4, 4.5, (x, y, nx, ny, r2) => r2 > 0.45 ? ramp(PAL.silver, lit(nx, ny, 0.6), x, y) : null);
    p.rect(20, 22, 10, 9, (x, y) => ramp(PAL.gold, 0.85 - (x - 20) / 14 - (y - 22) / 24, x, y));
    p.set(25, 25, PAL.ink); p.set(25, 26, PAL.ink); p.set(25, 27, PAL.ink);
    p.set(8, 10, PAL.cherry[3]); p.set(9, 10, PAL.cherry[3]); p.set(8, 11, PAL.cherry[3]);
    p.outline();
    return p.done();
  }

  // ── 음식 그림 (카드 한 장 64×46) ──────────────────────────────────────
  function table(p) {
    p.rect(0, 0, p.w, p.h, (x, y) => {
      const plank = Math.floor(y / 9), seam = y % 9 === 0;
      if (seam) return PAL.wood[0];
      const grain = Math.sin(x * 0.21 + plank * 3.1 + Math.sin(y * 0.7) * 1.4) * 0.12;
      return ramp(PAL.wood, 0.55 + grain - (x / p.w) * 0.25 - (y / p.h) * 0.15 + (plank % 2) * 0.06, x, y);
    });
  }
  const shadow = (p, cx, cy, rx, ry) => p.ell(cx + 3, cy + 3, rx, ry, (x, y) => dith(x, y, 0.6) ? PAL.wood[0] : null);

  const FOOD = {
    ramen(p) {
      shadow(p, 32, 26, 23, 12);
      // 그릇 몸통
      p.ell(32, 22, 23, 17, (x, y, nx) => y < 22 ? null : ramp(PAL.cherry, 0.62 - nx * 0.45 - (y - 22) / 40, x, y));
      p.rect(25, 37, 14, 3, (x, y) => ramp(PAL.cherry, 0.4 - (x - 32) / 20, x, y));
      for (let x = 14; x < 51; x += 6) p.rect(x, 30, 3, 1, PAL.cream[2]);
      // 테와 국물
      p.ell(32, 22, 23, 7.5, (x, y, nx, ny, r2) => r2 > 0.72 ? ramp(PAL.cream, 0.85 - nx * 0.3, x, y) : ramp(PAL.warm, 0.55 + ny * 0.25 - nx * 0.1, x, y));
      // 김
      p.rect(44, 13, 6, 9, (x, y) => (x + y) % 5 ? '#1e2a1e' : '#2f4030');
      // 면
      for (let k = 0; k < 5; k++) for (let x = 16; x < 46; x++) {
        const y = Math.round(21 + (k - 2) * 1.6 + Math.sin(x * 0.7 + k * 1.9) * 1.1);
        const nx = (x - 32) / 21, ny = (y - 22) / 6.8;
        if (nx * nx + ny * ny < 1) p.set(x, y, k % 2 ? '#f3cf7a' : '#ffe39a');
      }
      // 차슈
      p.ell(23, 20, 5, 3, (x, y, nx, ny, r2) => r2 > 0.6 ? '#7a3a1c' : ramp(['#b8664a', '#e39b7c', '#f6c9a6'], lit(nx, ny, 0.55), x, y));
      // 반숙 달걀
      p.ell(38, 20, 4, 3, (x, y, nx, ny) => ramp(['#e6dccb', '#fff8ec'], lit(nx, ny, 0.7), x, y));
      p.ell(38, 20.3, 2, 1.6, (x, y) => dith(x, y, 0.5) ? '#ffb52e' : '#f08c1a');
      // 나루토 · 파
      p.ell(30, 24, 2.6, 1.8, '#fff6e6'); p.set(30, 24, PAL.cherry[3]); p.set(29, 23, PAL.cherry[3]);
      [[27, 19], [33, 18], [35, 24], [26, 25], [42, 23]].forEach(([x, y]) => { p.set(x, y, PAL.leaf[3]); p.set(x + 1, y, PAL.leaf[2]); });
      // 젓가락
      p.line(46, 4, 61, 30, PAL.wood[3]); p.line(48, 3, 62, 27, '#c08a4c');
    },
    chicken(p) {
      shadow(p, 31, 26, 27, 13);
      p.ell(31, 25, 27, 13, (x, y, nx, ny, r2) => r2 > 0.78 ? ramp(PAL.cream, 0.75 - nx * 0.3 - ny * 0.2, x, y) : ramp(PAL.cream, 0.95 - ny * 0.15, x, y));
      const fry = ['#5a2a0e', '#9a4f18', '#d0822c', '#f2b456'];
      [[22, 25, 8, 6], [33, 21, 8, 6], [29, 31, 9, 5], [41, 28, 7, 5], [16, 30, 6, 4]].forEach(([cx, cy, rx, ry]) =>
        p.ell(cx, cy, rx, ry, (x, y, nx, ny) => ramp(fry, lit(nx, ny, 0.55, 0.6) + (dith(x * 3, y * 5, 0.3) ? 0.12 : 0), x, y)));
      [[13, 21], [40, 17], [47, 24]].forEach(([x, y]) => { p.rect(x, y, 3, 2, PAL.cream[3]); p.set(x + 3, y - 1, PAL.cream[2]); });
      // 파채 무더기
      for (let i = 0; i < 70; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), x = 44 + Math.cos(a) * r * 9, y = 19 + Math.sin(a) * r * 5;
        p.line(Math.round(x), Math.round(y), Math.round(x + 2), Math.round(y - 1), rnd() > 0.4 ? PAL.leaf[3] : PAL.leaf[2]);
      }
      [[42, 18], [46, 20], [44, 22], [48, 17]].forEach(([x, y]) => p.set(x, y, PAL.cherry[2]));
    },
    ssam(p) {
      shadow(p, 32, 27, 29, 13);
      // 쌈 채소 — 상추 몇 장을 겹쳐 쌓음
      [[13, 26, 11, 8], [19, 20, 10, 7], [9, 19, 8, 6]].forEach(([cx, cy, rx, ry], i) =>
        p.ell(cx, cy, rx, ry, (x, y, nx, ny, r2) => {
          if (r2 > 0.86 && dith(x * 5, y * 3, 0.5)) return PAL.leaf[1];
          const vein = Math.abs((x - cx) - (y - cy) * 0.6) < 0.6 && r2 < 0.7;
          return vein ? PAL.leaf[3] : ramp(PAL.leaf, lit(nx, ny, 0.6 - i * 0.05, 0.6), x, y);
        }));
      // 스테인리스 공깃밥 — 쇠 광택 줄
      p.ell(36, 25, 9, 7, (x, y, nx) => y < 22 ? null : (Math.abs(nx + 0.35) < 0.12 ? PAL.silver[3] : ramp(PAL.silver, 0.6 - nx * 0.45 - (y - 22) / 20, x, y)));
      p.ell(36, 21, 9, 3, (x, y, nx, ny, r2) => r2 > 0.62 ? ramp(PAL.silver, 0.85 - nx * 0.3, x, y) : (dith(x * 3, y * 7, 0.25) ? '#e6dccb' : '#fffaf0'));
      // 제육 한 접시
      p.ell(52, 30, 11, 6, (x, y, nx, ny, r2) => ramp(PAL.cream, r2 > 0.7 ? 0.65 - nx * 0.3 : 0.95, x, y));
      const pork = ['#5a160a', '#9a2e14', '#d0552a', '#f08a4a'];
      [[48, 29, 4, 2], [54, 28, 4, 2], [51, 32, 4, 2], [56, 31, 3, 2]].forEach(([cx, cy, rx, ry]) =>
        p.ell(cx, cy, rx, ry, (x, y, nx, ny) => ramp(pork, lit(nx, ny, 0.5, 0.6), x, y)));
      [[50, 27], [53, 31], [57, 29]].forEach(([x, y]) => { p.set(x, y, PAL.leaf[3]); p.set(x + 1, y, PAL.cream[3]); });
      // 쌈장 종지
      p.ell(28, 37, 5, 3, (x, y, nx, ny, r2) => r2 > 0.55 ? ramp(PAL.stone, 0.75 - nx * 0.3, x, y) : (dith(x, y, 0.3) ? '#8a3a1a' : '#6a2a12'));
      p.set(27, 36, '#c06a3a');
    },
    tteokbokki(p) {
      shadow(p, 32, 26, 27, 14);
      p.ell(32, 25, 27, 14, (x, y, nx, ny, r2) => r2 > 0.82 ? ramp(PAL.stone, 0.75 - nx * 0.4 - ny * 0.3, x, y) : null);
      const sauce = ['#6e1208', '#a8230f', '#d33a22', '#f2713e'];
      p.ell(32, 25, 23.5, 11, (x, y, nx, ny) => ramp(sauce, lit(nx, ny, 0.45, 0.35) + (dith(x * 7, y * 3, 0.15) ? 0.2 : 0), x, y));
      const tteok = ['#c85a3c', '#ec9a76', '#ffd4b8'];
      [[16, 22], [24, 27], [36, 20], [40, 29], [28, 19], [20, 31], [44, 23]].forEach(([x, y], i) => {
        const w = i % 2 ? 7 : 8;
        p.rect(x, y, w, 3, (xx, yy) => ramp(tteok, 0.85 - (yy - y) * 0.3 - (xx - x) / 30, xx, yy));
        p.set(x, y, null); p.rect(x, y + 3, w, 1, sauce[0]);
      });
      // 어묵 · 삶은 달걀
      p.rect(30, 26, 6, 5, (x, y) => ramp(['#b56d2c', '#e6b071', '#f8d7a4'], 0.8 - (y - 26) / 6, x, y));
      p.ell(47, 18, 4, 3.4, (x, y, nx, ny) => ramp(['#c86a4a', '#f2c2a6', '#fff2e6'], lit(nx, ny, 0.6), x, y));
      [[20, 20], [34, 24], [26, 33], [42, 26]].forEach(([x, y]) => { p.set(x, y, PAL.leaf[3]); p.set(x + 1, y + 1, PAL.leaf[2]); });
    },
    kimbap(p) {
      shadow(p, 32, 27, 28, 9);
      p.rect(4, 19, 56, 16, (x, y) => ramp(PAL.cream, 0.9 - (y - 19) / 30 - (x - 4) / 160, x, y));
      p.rect(4, 35, 56, 2, PAL.cream[0]);
      [[11, 24], [21, 25], [31, 24], [41, 25], [51, 24]].forEach(([cx, cy], i) => {
        p.ell(cx, cy, 5.5, 6, (x, y, nx, ny, r2) => r2 > 0.7 ? (dith(x, y, 0.3) ? '#2a3a2a' : '#141c14') : ramp(['#d9d2c2', '#fbf7ee'], lit(nx, ny, 0.7), x, y));
        const fill = ['#ffd23f', '#f08c34', '#3f8a35', '#7a3a1c', '#e44a5a'];
        p.set(cx - 1, cy - 1, fill[i % 5]); p.set(cx, cy - 1, fill[(i + 1) % 5]); p.set(cx - 1, cy, fill[(i + 2) % 5]); p.set(cx, cy, fill[(i + 3) % 5]); p.set(cx + 1, cy, fill[(i + 4) % 5]);
      });
      [[8, 31], [24, 32], [44, 31]].forEach(([x, y]) => p.rect(x, y, 2, 1, '#efe6cf'));
    },
    sushi(p) {
      shadow(p, 32, 28, 28, 8);
      p.rect(4, 22, 56, 10, (x, y) => ramp(PAL.wood, y === 22 ? 0.95 : 0.75 - (y - 22) / 18 - (x - 4) / 200, x, y));
      p.rect(8, 32, 4, 4, PAL.wood[1]); p.rect(52, 32, 4, 4, PAL.wood[1]);
      const fish = [['#d0502a', '#ff8a5c', '#ffc2a0'], ['#8e1430', '#d02a48', '#ff7d8e'], ['#d0502a', '#ff8a5c', '#ffc2a0'], ['#b89a3a', '#f5e3a0', '#fffbe0']];
      [12, 24, 36, 48].forEach((cx, i) => {
        p.ell(cx, 22, 5.5, 3, (x, y, nx, ny) => ramp(['#d9d2c2', '#fbf7ee'], lit(nx, ny, 0.65), x, y));
        p.ell(cx, 19, 6.2, 3, (x, y, nx, ny) => {
          const stripe = i % 2 === 0 && (x + y * 2) % 4 === 0;
          return stripe ? '#ffe6d6' : ramp(fish[i], lit(nx, ny, 0.6, 0.5), x, y);
        });
      });
      p.ell(55, 15, 3, 2, (x, y) => dith(x, y, 0.5) ? '#f6b0b0' : '#e88f96');
      p.ell(8, 15, 2, 1.5, PAL.leaf[2]);
    },
    cake(p) {
      shadow(p, 22, 30, 16, 7);
      p.ell(22, 30, 17, 7, (x, y, nx, ny, r2) => ramp(PAL.cream, r2 > 0.75 ? 0.6 - nx * 0.3 : 0.95, x, y));
      // 조각 — 앞면은 층, 윗면은 크림
      const layers = ['#f6e2b6', '#fff6e6', '#e44a5a', '#f6e2b6', '#fff6e6', '#f6e2b6'];
      for (let y = 18; y < 30; y++) p.rect(12, y, 18, 1, (x) => ramp([PAL.cream[1], layers[(y - 18) >> 1]], x < 14 ? 1 : 0.999 - (x - 12) / 60, x, y));
      for (let y = 13; y < 18; y++) p.rect(12 + (17 - y) * 2 - 4 < 12 ? 12 : 12, y, 18 - Math.max(0, (17 - y) * 0), 1, (x) => ramp(['#efe3d0', '#fffdf8'], 0.9 - (x - 12) / 40, x, y));
      p.ell(21, 11, 4, 3.5, (x, y, nx, ny) => ramp(['#7e0e22', '#c42a3d', '#ff6a76'], lit(nx, ny, 0.6), x, y));
      p.set(20, 7, PAL.leaf[3]); p.set(21, 7, PAL.leaf[2]); p.set(22, 7, PAL.leaf[3]);
      // 커피 잔
      shadow(p, 46, 31, 13, 5);
      p.ell(46, 31, 13, 5, (x, y, nx) => ramp(PAL.cream, 0.85 - nx * 0.3, x, y));
      p.rect(38, 16, 16, 13, (x, y) => ramp(PAL.cream, 0.95 - (x - 38) / 22, x, y));
      p.ell(46, 29, 8, 2.4, (x, y, nx) => ramp(PAL.cream, 0.6 - nx * 0.3, x, y));
      p.ell(46, 16, 8, 2.6, (x, y, nx, ny, r2) => r2 > 0.7 ? PAL.cream[3] : ramp(['#3a1d0e', '#6a3a1c', '#a8683a'], 0.4 + ny * 0.3, x, y));
      p.rect(54, 19, 3, 1, PAL.cream[2]); p.rect(56, 19, 1, 6, PAL.cream[1]); p.rect(54, 24, 3, 1, PAL.cream[2]);
    },
  };
  function food(kind) {
    seed = kind.length * 977;
    const p = new Pix(64, 46);
    table(p);
    FOOD[kind](p);
    return p.done();
  }

  // ── 첫 화면: 밤 골목의 식당 (320×180) ───────────────────────────────────
  const HW = 320, HH = 180;
  const shop = { x: 150, y: 40, win: { x: 162, y: 100, w: 80, h: 46 }, door: { x: 254, y: 98, w: 36, h: 62 }, lantern: { x: 150, y: 104 }, sign: { x: 182, y: 46, w: 92, h: 32 } };

  function heroBg() {
    seed = 11;
    const p = new Pix(HW, HH);
    // 하늘
    const sky = ['#120c1c', '#1b1428', '#281c36', '#3b2546', '#5a3150'];
    p.rect(0, 0, HW, 130, (x, y) => ramp(sky, y / 150 + 0.02, x, y));
    for (let i = 0; i < 70; i++) { const x = (rnd() * HW) | 0, y = (rnd() * 80) | 0; p.set(x, y, rnd() > 0.8 ? PAL.cream[3] : PAL.cream[1]); }
    // 달
    p.ell(150, 18, 15, 15, (x, y, nx, ny, r2) => dith(x, y, 0.25 * (1 - r2)) ? '#3a2b4a' : null);
    p.ell(150, 18, 8, 8, (x, y, nx, ny) => ramp(['#c9b98f', '#efe2bb', '#fff6dc'], lit(nx, ny, 0.65, 0.5) - (dith(x * 3, y * 2, 0.2) ? 0.15 : 0), x, y));
    // 먼 건물
    for (let x = 0; x < HW;) {
      const w = 10 + ((rnd() * 22) | 0), h = x < 140 ? 8 + ((rnd() * 10) | 0) : 30 + ((rnd() * 40) | 0), top = 118 - h;
      p.rect(x, top, w, 160 - top, (xx, yy) => dith(xx, yy, 0.15) ? '#2a2036' : '#211a2d');
      for (let wy = top + 4; wy < 112; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (rnd() > 0.82) p.rect(wx, wy, 2, 2, rnd() > 0.5 ? '#c99a4e' : '#7a5a3a');
      x += w + ((rnd() * 3) | 0);
    }
    // 왼쪽 벽돌 건물
    p.rect(0, 106, 112, 54, (x, y) => {
      const row = (y / 4) | 0, brick = (x + (row % 2) * 4) % 8 === 0 || y % 4 === 0;
      return brick ? '#21151e' : ramp(['#2a1a24', '#3a2430', '#4a2e3a'], 0.45 - x / 400 + (dith(x * 5, y * 3, 0.2) ? 0.1 : 0), x, y);
    });
    p.rect(0, 104, 114, 3, '#17101a');
    [[12, 118], [44, 118], [76, 118]].forEach(([x, y], i) => {
      p.rect(x, y, 22, 18, '#140d16');
      p.rect(x + 1, y + 1, 20, 16, (xx, yy) => i === 1 ? ramp(PAL.warm, 0.62 - (yy - y) / 40, xx, yy) : ramp(['#1d2440', '#283258'], 0.3 + (xx - x) / 50, xx, yy));
      p.rect(x + 10, y + 1, 1, 16, '#140d16'); p.rect(x + 1, y + 8, 20, 1, '#140d16');
      p.rect(x - 1, y + 18, 24, 2, '#4a2e3a');
    });
    // 사람 그림자 — 2층 불 켠 창 안
    p.ell(51, 126, 2.5, 2.5, '#7a3e1e'); p.rect(48, 129, 7, 6, '#7a3e1e');
    // 가로등
    p.rect(124, 94, 2, 66, '#120c16'); p.rect(120, 92, 10, 3, '#120c16');
    for (let y = 96; y < 160; y++) { const half = (y - 96) * 0.5; p.rect(Math.round(125 - half), y, Math.round(half * 2), 1, (x, yy) => dith(x, yy, 0.14 - (yy - 96) / 900) ? '#5b5470' : null); }
    p.ell(125, 96, 3, 2, '#fff2c8');
    // 식당 벽 — 판자
    p.rect(shop.x - 6, 46, HW - shop.x + 6, 114, (x, y) => {
      if (y % 5 === 0) return PAL.wood[0];
      const dx = x - 200, glow = Math.max(0, 1 - Math.hypot(dx * 0.6, y - 122) / 80) * 0.35;
      return ramp(PAL.wood, 0.25 + glow + Math.sin(x * 0.4 + y) * 0.04, x, y);
    });
    // 지붕 기와
    p.rect(shop.x - 10, 36, HW - shop.x + 10, 10, (x, y) => {
      const t = (x - shop.x) % 6, curve = y - 36 + (t === 0 || t === 5 ? 1 : 0);
      return curve > 8 ? '#141820' : ramp(['#1c2130', '#2c3348', '#4a5470', '#6c7896'], 0.65 - curve / 12 - (t > 3 ? 0.15 : 0), x, y);
    });
    // 간판
    const s = shop.sign;
    p.rect(s.x - 3, s.y - 3, s.w + 6, s.h + 6, PAL.wood[0]);
    p.rect(s.x - 2, s.y - 2, s.w + 4, s.h + 4, (x, y) => ramp(PAL.wood, 0.75 - (y - s.y) / 50, x, y));
    p.rect(s.x, s.y, s.w, s.h, (x, y) => ramp(PAL.cream, 0.95 - (y - s.y) / 40 - (x - s.x) / 400, x, y));
    p.text('한끼', s.x + s.w / 2 - 1, s.y + 2, 'bold 22px Galmuri11', PAL.cherry[1], 'center');
    p.text('HANKKI', s.x + s.w / 2, s.y + s.h - 8, '8px Galmuri7', PAL.wood[2], 'center');
    // 차양
    const aw = { x: shop.x + 4, y: 84, w: HW - shop.x - 8, h: 10 };
    p.rect(aw.x, aw.y - 2, aw.w, 2, '#140c10');
    for (let x = aw.x; x < aw.x + aw.w; x++) {
      const stripe = Math.floor((x - aw.x) / 7) % 2, r = stripe ? PAL.cream : PAL.cherry;
      const local = (x - aw.x) % 7, scallop = Math.round(Math.sqrt(Math.max(0, 12.25 - (local - 3) ** 2)) * 0.8);
      for (let y = aw.y; y < aw.y + aw.h + scallop; y++) p.set(x, y, ramp(r, 0.85 - (y - aw.y) / 16, x, y));
      for (let y = aw.y + aw.h + scallop; y < aw.y + aw.h + scallop + 3; y++) if (dith(x, y, 0.6)) p.set(x, y, PAL.wood[0]);
    }
    // 창 — 안쪽에서 새는 따뜻한 빛
    const w = shop.win;
    p.rect(w.x - 3, w.y - 3, w.w + 6, w.h + 6, PAL.wood[0]);
    p.rect(w.x, w.y, w.w, w.h, (x, y) => ramp(PAL.warm, 0.95 - Math.hypot(x - (w.x + 40), y - (w.y + 18)) / 70, x, y));
    // 창 안: 차림표 · 요리사 · 조리대
    [[w.x + 6, w.y + 5], [w.x + 18, w.y + 5], [w.x + 58, w.y + 5]].forEach(([x, y]) => {
      p.rect(x, y, 9, 12, PAL.cream[3]); p.rect(x, y + 12, 9, 1, PAL.warm[0]);
      for (let k = 0; k < 4; k++) p.rect(x + 2, y + 2 + k * 2 + (k > 1 ? 1 : 0), k === 0 ? 5 : 3 + (k % 2) * 2, 1, k === 0 ? PAL.cherry[1] : PAL.cream[0]);
    });
    p.ell(w.x + 44, w.y + 15, 3.5, 3.5, '#8a4520'); p.rect(w.x + 40, w.y + 12, 8, 2, PAL.cream[3]); p.rect(w.x + 41, w.y + 9, 6, 4, PAL.cream[3]);
    p.rect(w.x + 38, w.y + 19, 13, 13, (x, y) => dith(x, y, 0.3) ? '#8a4520' : '#7a3a1a');
    p.rect(w.x + 39, w.y + 20, 11, 10, (x, y) => ramp(PAL.cream, 0.9 - (x - w.x - 39) / 20, x, y));
    p.rect(w.x, w.y + 32, w.w, w.h - 32, (x, y) => ramp(PAL.wood, 0.8 - (y - w.y - 32) / 20, x, y));
    p.rect(w.x, w.y + 32, w.w, 1, PAL.wood[3]);
    // 조리대 위 그릇 (김은 움직이는 층에서)
    p.ell(w.x + 22, w.y + 29, 7, 5, (x, y, nx) => y < w.y + 29 ? null : ramp(PAL.cherry, 0.6 - nx * 0.4, x, y));
    p.ell(w.x + 22, w.y + 29, 7, 1.6, (x, y, nx, ny, r2) => r2 > 0.6 ? PAL.cream[3] : PAL.warm[1]);
    p.ell(w.x + 62, w.y + 30, 5, 3, (x, y, nx) => y < w.y + 30 ? null : ramp(PAL.cherry, 0.6 - nx * 0.4, x, y));
    p.ell(w.x + 62, w.y + 30, 5, 1.2, PAL.cream[3]);
    // 창살과 유리 반사
    p.rect(w.x + 39 + 1, w.y, 1, w.h, PAL.wood[1]);
    for (let k = 0; k < 12; k++) { p.set(w.x + 4 + k, w.y + 30 - k * 2, '#fff8d8'); p.set(w.x + 6 + k, w.y + 30 - k * 2, '#fff8d8'); }
    p.rect(w.x - 4, w.y + w.h + 3, w.w + 8, 3, PAL.wood[3]); p.rect(w.x - 4, w.y + w.h + 6, w.w + 8, 1, PAL.wood[0]);
    // 문 · 노렌
    const d = shop.door;
    p.rect(d.x - 2, d.y - 2, d.w + 4, d.h + 2, PAL.wood[0]);
    p.rect(d.x, d.y, d.w, d.h, (x, y) => (x - d.x) % 9 === 0 ? PAL.wood[0] : ramp(PAL.wood, 0.45 - (x - d.x) / 90 + (y > d.y + 30 && y < d.y + 46 ? 0 : 0), x, y));
    p.rect(d.x + 6, d.y + 26, d.w - 12, 16, (x, y) => ramp(PAL.warm, 0.7 - (y - d.y - 26) / 40, x, y));
    p.rect(d.x + d.w / 2, d.y + 26, 1, 16, PAL.wood[0]);
    p.rect(d.x - 3, d.y - 1, d.w + 6, 2, PAL.wood[3]);
    for (let x = d.x - 2; x < d.x + d.w + 2; x++) {
      const panel = Math.floor((x - d.x + 2) / 10), gap = (x - d.x + 2) % 10 === 9;
      if (gap) continue;
      for (let y = d.y + 1; y < d.y + 22; y++) p.set(x, y, ramp(PAL.cherry, 0.7 - (y - d.y) / 40 - (panel % 2) * 0.08, x, y));
    }
    // 노렌 위 그릇 그림 (앱 아이콘)
    const nx0 = d.x + d.w / 2;
    p.ell(nx0, d.y + 12, 7, 6, (x, y) => y < d.y + 12 ? null : PAL.cream[3]);
    p.rect(nx0 - 7, d.y + 11, 15, 1, PAL.cream[3]); p.rect(nx0 - 2, d.y + 18, 5, 1, PAL.cream[3]);
    [-4, 0, 4].forEach(o => { p.set(nx0 + o, d.y + 4, PAL.cream[3]); p.set(nx0 + o + 1, d.y + 6, PAL.cream[3]); p.set(nx0 + o, d.y + 8, PAL.cream[3]); });
    // 화분
    p.rect(d.x + d.w + 6, 150, 10, 10, (x, y) => ramp(PAL.bronze, 0.6 - (x - d.x - d.w - 6) / 14, x, y));
    p.ell(d.x + d.w + 11, 146, 7, 6, (x, y, nx, ny) => ramp(PAL.leaf, lit(nx, ny, 0.45, 0.5) + (dith(x * 3, y * 2, 0.3) ? 0.15 : 0), x, y));
    // 바닥 — 보도블록, 창 아래로 빛이 쏟아진다
    p.rect(0, 160, HW, 20, (x, y) => {
      const tile = (x + (((y - 160) / 5 | 0) % 2) * 6) % 12 === 0 || (y - 160) % 5 === 0;
      const spill = Math.max(0, 1 - Math.abs(x - 202) / (48 + (y - 160) * 2.2)) * (1 - (y - 160) / 26);
      const door = Math.max(0, 1 - Math.abs(x - 272) / (14 + (y - 160))) * (1 - (y - 160) / 22) * 0.6;
      const lamp = Math.max(0, 1 - Math.abs(x - 125) / 36) * 0.35;
      const v = 0.15 + Math.max(spill, door) * 0.75 + lamp * 0.3;
      if (tile) return v > 0.45 ? PAL.wood[1] : PAL.stone[0];
      return v > 0.4 ? ramp(['#3b2a2c', '#6a4430', '#a8683a', '#d99a4e'], v - 0.25, x, y) : ramp(PAL.stone, v + 0.15, x, y);
    });
    p.rect(0, 160, HW, 1, PAL.stone[3]);
    // 고양이
    p.ell(138, 154, 4, 5, '#0e0910'); p.ell(138, 147, 3, 3, '#0e0910');
    p.set(136, 143, '#0e0910'); p.set(140, 143, '#0e0910'); p.rect(142, 156, 4, 1, '#0e0910'); p.set(145, 155, '#0e0910');
    return p;
  }

  function hero() {
    const host = document.getElementById('scene');
    if (!host) return;
    const bg = heroBg().done();
    const c = document.createElement('canvas');
    c.width = HW; c.height = HH;
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', '밤 골목, 불 켜진 작은 식당 창 너머로 김이 오르는 그릇');
    host.prepend(c);
    const g = c.getContext('2d');
    const puffs = [];
    const emit = (x, y, spread, life) => puffs.push({ x: x + (Math.random() - 0.5) * spread, y, t: 0, life, ph: Math.random() * 6 });
    let frame = 0, last = 0;
    const draw = now => {
      if (now - last < 83) return requestAnimationFrame(draw);   // 12fps — 옛 게임 박자
      last = now; frame++;
      g.drawImage(bg, 0, 0);
      // 등 — 깜빡임
      const L = shop.lantern, flick = frame % 23 === 0 ? 0.6 : 1;
      for (let r = 16; r > 6; r -= 3) {
        g.fillStyle = `rgba(255,120,60,${0.05 * flick})`;
        g.beginPath(); g.arc(L.x, L.y, r, 0, 7); g.fill();
      }
      g.fillStyle = PAL.ink; g.fillRect(L.x, L.y - 14, 1, 7);
      g.fillStyle = '#140c10'; g.fillRect(L.x - 3, L.y - 7, 7, 2); g.fillRect(L.x - 3, L.y + 7, 7, 2);
      for (let y = -5; y < 7; y++) {
        const half = Math.round(Math.sqrt(1 - ((y + 0.5) / 6.5) ** 2) * 5);
        for (let x = -half; x <= half; x++) {
          g.fillStyle = ramp(['#8e1232', '#d6332e', '#ff7a4a', '#ffd38a'], (flick * (0.85 - Math.abs(x) / 7 - Math.abs(y) / 14)), x + 40, y + 40);
          g.fillRect(L.x + x, L.y + y, 1, 1);
        }
      }
      // 간판 둘레 전구 — 하나 걸러 돈다
      const s = shop.sign;
      const bulbs = [];
      for (let x = s.x - 2; x < s.x + s.w + 2; x += 4) { bulbs.push([x, s.y - 2]); bulbs.push([x, s.y + s.h + 1]); }
      bulbs.forEach(([x, y], i) => { g.fillStyle = (i >> 1) % 3 === frame % 3 ? '#fff2b0' : '#a8541e'; g.fillRect(x, y, 1, 1); });
      // 김
      const w = shop.win;
      if (frame % 2 === 0) emit(w.x + 22, w.y + 27, 8, 22);
      if (frame % 3 === 0) emit(w.x + 62, w.y + 28, 6, 16);
      if (frame % 2 === 1) emit(300, 34, 6, 40);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const q = puffs[i]; q.t++;
        q.y -= q.life > 30 ? 0.9 : 0.6; q.x += Math.sin(q.t * 0.35 + q.ph) * 0.35 + (q.life > 30 ? 0.25 : 0);
        const fade = q.t / q.life;
        if (fade >= 1) { puffs.splice(i, 1); continue; }
        const inWin = q.life <= 30;
        if (inWin && (q.y < w.y + 1)) { puffs.splice(i, 1); continue; }
        const size = q.life > 30 ? 2 + Math.floor(fade * 3) : 1 + Math.floor(fade * 2);
        for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) {
          const px = Math.round(q.x) + a, py = Math.round(q.y) + b;
          if (!dith(px, py, 1 - fade)) continue;
          g.fillStyle = inWin ? '#fff6e0' : '#8c7f96';
          g.fillRect(px, py, 1, 1);
        }
      }
      // 고양이 눈
      if (frame % 40 > 2) { g.fillStyle = '#e6c84a'; g.fillRect(137, 147, 1, 1); g.fillRect(139, 147, 1, 1); }
      if (!still) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // ── 지도 (세로 108×176) ────────────────────────────────────────────────
  const MW = 108, MH = 176;
  function mapArt() {
    seed = 3;
    const p = new Pix(MW, MH);
    const roadsH = [44, 104, 148], roadsV = [28, 74];
    const river = (x, y) => Math.abs(y - (x * 0.55 + 4)) < 6 && y < 80;
    const isRoad = (x, y) => roadsH.some(r => y >= r && y < r + 5) || roadsV.some(r => x >= r && x < r + 5);
    p.rect(0, 0, MW, MH, (x, y) => {
      if (river(x, y)) {
        if (isRoad(x, y)) return (x + y) % 7 === 0 ? PAL.stone[2] : PAL.cream[2];
        return ramp(PAL.water, 0.5 + Math.sin(x * 0.5 + y * 0.9) * 0.15, x, y);
      }
      if (Math.abs(y - (x * 0.55 + 4)) < 7.5 && y < 82) return ramp(['#c8b98a', '#e5d7a8'], 0.5, x, y);
      if (isRoad(x, y)) {
        const edge = roadsH.some(r => y === r || y === r + 4) || roadsV.some(r => x === r || x === r + 4);
        if (edge) return PAL.cream[1];
        const mid = roadsH.some(r => y === r + 2) && x % 6 < 3 || roadsV.some(r => x === r + 2) && y % 6 < 3;
        return mid ? PAL.cream[3] : PAL.cream[2];
      }
      return ramp(['#8fb46a', '#a8c97a', '#bfd98e'], 0.5 + (dith(x * 7, y * 5, 0.3) ? 0.15 : -0.1), x, y);
    });
    // 공원
    p.rect(80, 109, 26, 37, (x, y) => ramp(PAL.leaf, 0.6 + (dith(x * 3, y * 3, 0.4) ? 0.1 : 0), x, y));
    // 건물 블록
    const roofs = [PAL.cherry, ['#5b4426', '#9a7438', '#c9a050', '#ead08a'], ['#3a4256', '#5c6a88', '#8c9cba', '#c2cee2'], PAL.cream];
    const blocks = [[0, 49, 28, 55], [33, 49, 41, 55], [79, 49, 29, 55], [0, 109, 28, 39], [33, 109, 41, 39], [0, 153, 28, 23], [33, 153, 41, 23], [79, 153, 29, 23]];
    blocks.forEach(([bx, by, bw, bh]) => {
      for (let y = by + 2; y < by + bh - 6; y += 10) for (let x = bx + 2; x < bx + bw - 6;) {
        const w = 6 + ((rnd() * 7) | 0), h = 6 + ((rnd() * 3) | 0);
        if (x + w > bx + bw - 2) break;
        if (river(x, y) || river(x + w, y + h)) { x += w + 2; continue; }
        const r = roofs[(rnd() * roofs.length) | 0];
        p.rect(x + 1, y + 1, w, h, (xx, yy) => dith(xx, yy, 0.7) ? '#5d7a44' : null);
        p.rect(x, y, w, h, (xx, yy) => ramp(r, xx === x || yy === y ? 0.9 : xx === x + w - 1 || yy === y + h - 1 ? 0.15 : 0.55, xx, yy));
        x += w + 2;
      }
    });
    // 나무
    for (let i = 0; i < 26; i++) {
      const x = 82 + rnd() * 22, y = 111 + rnd() * 32;
      p.ell(x + 1, y + 1, 2.5, 2, (xx, yy) => dith(xx, yy, 0.6) ? PAL.leaf[0] : null);
      p.ell(x, y, 2.5, 2.5, (xx, yy, nx, ny) => ramp(PAL.leaf, lit(nx, ny, 0.6, 0.6), xx, yy));
    }
    return p.done();
  }

  // ── 붙이기 ─────────────────────────────────────────────────────────────
  const put = (el, canvas, scale) => {
    const img = new Image();
    img.src = canvas.toDataURL(); img.alt = el.dataset.alt || '';
    if (!img.alt) img.setAttribute('aria-hidden', 'true');
    if (scale) { img.width = canvas.width * scale; img.height = canvas.height * scale; }
    el.replaceChildren(img);
  };
  const sprites = {
    bowl: k => bowl(k), spoon: k => spoon(k === 'on'), face: k => face(k), badge: k => badge(k), pin: k => pin(k), food: k => food(k), lunchbox: () => lunchbox(),
    map: () => mapArt(),
  };

  function draw() {
    document.querySelectorAll('[data-px]').forEach(el => {
      const [kind, key] = el.dataset.px.split(':');
      put(el, sprites[kind](key), Number(el.dataset.scale) || 0);
    });
    hero();
    typewriter();
    mood();
    layers();
    deck();
    toggles();
    reveal();
  }

  // ── 움직임 ─────────────────────────────────────────────────────────────
  function typewriter() {
    document.querySelectorAll('[data-type]').forEach(el => {
      const full = el.textContent;
      if (still) return;
      el.textContent = '';
      let i = 0;
      const tick = () => { el.textContent = [...full].slice(0, ++i).join(''); if (i < [...full].length) setTimeout(tick, 70); else el.classList.add('is-done'); };
      setTimeout(tick, 900);
    });
  }

  const MOODS = [[0.5, 'crying', '울상'], [1.5, 'sulky', '시무룩'], [2.5, 'neutral', '무표정'], [3.5, 'smile', '미소'], [4.5, 'beaming', '활짝 웃음']];
  function mood() {
    const box = document.getElementById('mood');
    if (!box) return;
    const input = box.querySelector('input'), out = box.querySelector('[data-mood-face]'), num = box.querySelector('[data-mood-num]'), name = box.querySelector('[data-mood-name]');
    const faces = Object.fromEntries(MOODS.map(([, k]) => [k, face(k).toDataURL()]));
    const img = new Image(); img.alt = ''; out.replaceChildren(img);
    const set = () => {
      const v = Number(input.value), m = [...MOODS].reverse().find(([min]) => v >= min) || MOODS[0];
      img.src = faces[m[1]]; num.textContent = v.toFixed(1); name.textContent = m[2];
      input.setAttribute('aria-valuetext', `${v.toFixed(1)} ${m[2]}`);
    };
    input.addEventListener('input', set);
    set();
  }

  function layers() {
    document.querySelectorAll('[data-layer]').forEach(btn => btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on);
      document.querySelectorAll(`.pins [data-of="${btn.dataset.layer}"]`).forEach(el => el.classList.toggle('is-off', !on));
    }));
    document.querySelectorAll('.pins [data-pin]').forEach((el, i) => el.style.setProperty('--i', i));
  }

  function deck() {
    const box = document.getElementById('deck');
    if (!box) return;
    const cards = [...box.querySelectorAll('.meal')], count = box.parentElement.querySelector('[data-deck-count]');
    let at = 0;
    const show = dir => {
      at = (at + dir + cards.length) % cards.length;
      cards.forEach((c, i) => {
        const k = (i - at + cards.length) % cards.length;
        c.style.setProperty('--k', k);
        c.classList.toggle('is-top', k === 0);
        c.classList.toggle('is-out', dir !== 0 && k === cards.length - 1);
        c.setAttribute('aria-hidden', k !== 0);
      });
      if (count) count.textContent = `${at + 1} / ${cards.length}`;
    };
    box.parentElement.querySelectorAll('[data-deck]').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.deck))));
    let x0 = null;
    box.addEventListener('pointerdown', e => { x0 = e.clientX; });
    box.addEventListener('pointerup', e => { if (x0 !== null && Math.abs(e.clientX - x0) > 30) show(e.clientX < x0 ? 1 : -1); x0 = null; });
    box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(1); if (e.key === 'ArrowLeft') show(-1); });
    show(0);
  }

  function toggles() {
    document.querySelectorAll('.share__item button[aria-pressed]').forEach(b => b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    }));
  }

  function reveal() {
    const els = document.querySelectorAll('.up');
    if (still || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.2 });
    els.forEach(e => io.observe(e));
  }

  // 간판 글자를 픽셀로 찍으려면 글꼴이 먼저 와 있어야 한다
  Promise.all(['bold 22px Galmuri11', '8px Galmuri7'].map(f => document.fonts.load(f, '한끼HANKKI')))
    .catch(() => {}).finally(draw);
})();
