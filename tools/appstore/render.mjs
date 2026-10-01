// App Store 스크린샷 굽기 — slides.json 의 장면을 기기 규격 JPEG 로
// 사용: node tools/appstore/render.mjs [언어] [기기]   (생략하면 전부)
// 저장소 루트에서 로컬 서버(:8765)가 떠 있어야 한다. 결과: tools/appstore/out/{언어}/{기기}-{번호}.jpg
// 캡처가 아직 없는 장면은 건너뛰고 목록으로 알려 준다.
import { webkit } from '/Users/jdu/Documents/dev_workspace/00.personal project/HANNUN/web/node_modules/playwright/index.mjs'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const SIZE = { iphone: [1320, 2868], ipad: [2064, 2752], mac: [2880, 1800] }
const slides = JSON.parse(readFileSync(new URL('slides.json', import.meta.url)))
const [onlyLang, onlyDevice] = process.argv.slice(2)
const b = await webkit.launch()
const skipped = []
for (const lang of Object.keys(slides)) {
  if (onlyLang && lang !== onlyLang) continue
  for (const device of ['mac', 'ipad', 'iphone']) {
    if (onlyDevice && device !== onlyDevice) continue
    for (const [i, s] of (slides[lang][device] || []).entries()) {
      const imgs = [].concat(s.img || []).map(p => p.replace('{lang}/', lang === 'ko' ? '' : lang + '/').replace('{langdir}', lang))
      const missing = imgs.filter(p => !existsSync(ROOT + p))
      if (missing.length) { skipped.push(`${lang}/${device}-${i + 1} (${missing.join(', ')})`); continue }
      const [w, h] = SIZE[device]
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
      await p.goto(`http://localhost:8765/tools/appstore/slide.html?lang=${lang}&device=${device}&n=${i + 1}`, { waitUntil: 'networkidle' })
      await p.waitForSelector('body[data-ready]', { timeout: 30000 })
      mkdirSync(`${ROOT}tools/appstore/out/${lang}`, { recursive: true })
      // App Store 는 투명 채널을 받지 않는다 — JPEG
      await p.screenshot({ path: `${ROOT}tools/appstore/out/${lang}/${device}-${i + 1}.jpg`, type: 'jpeg', quality: 95 })
      console.log('구움', `${lang}/${device}-${i + 1}`)
      await p.close()
    }
  }
}
await b.close()
if (skipped.length) console.log('\n캡처 없어 건너뜀:\n  ' + skipped.join('\n  '))
