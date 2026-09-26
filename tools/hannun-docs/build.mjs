// 도움말 · 지원 · 개인정보처리방침 — 언어별 마크다운 원고를 정적 HTML 로 굽는다
// 사용: node tools/hannun-docs/build.mjs tools/hannun-docs hannun
// 원고: tools/hannun-docs/{ko,en,ja,zh}/{help,support,privacy}.md
// 결과: 한국어는 hannun/{help,support,privacy}/, 나머지는 hannun/{en,ja,zh}/{…}/
// marked 는 HANNUN 저장소의 것을 빌려 쓴다 (앱과 같은 버전)
import { marked } from '/Users/jdu/Documents/dev_workspace/00.personal project/HANNUN/web/node_modules/marked/lib/marked.esm.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
const [SRC, OUT] = process.argv.slice(2)

const LANGS = {
  ko: {
    html: 'ko', name: '한국어', dir: '', font: 'Noto+Serif+KR:wght@400;600',
    langLabel: '언어', langPick: '언어 선택', toc: '차례', get: '다운로드', app: '한눈',
    madeBy: '펴낸 곳', maker: '풋참외', contact: '문의', privacyDt: '개인정보',
    links: { home: '한눈', help: '도움말', support: '지원', privacy: '개인정보처리방침', brand: '풋참외' },
    contactNote: '개발자가 직접 읽고 답장드립니다. 사용하는 기기와 한눈 버전을 함께 적어 주세요.',
    pages: {
      help: { num: '도움말', title: '한눈 사용 설명서', run: '도움말', lede: '파일을 여는 법부터 단축키, 문법 팔레트, 데이터 문서 보기까지. 문제가 생겼다면 <a href="../support/">지원</a> 페이지를 보세요.' },
      support: { num: '지원', title: '지원', run: '지원', lede: '문의 방법, 자주 겪는 문제와 해결 방법, 업데이트 예정 기능, 구매와 환불 안내입니다.' },
      privacy: { num: '방침', title: '개인정보처리방침', run: '개인정보처리방침', lede: '한눈은 이용자의 어떤 정보도 수집하지 않습니다. 홈페이지에서 받은 Mac 무료 버전만 업데이트 확인을 위해 인터넷에 접속하며, 설정에서 끌 수 있습니다.' },
    },
  },
  en: {
    html: 'en', name: 'English', dir: 'en/', font: 'Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400',
    langLabel: 'Language', langPick: 'Choose language', toc: 'Contents', get: 'Download', app: 'Hannun',
    madeBy: 'Published by', maker: 'Putchamoe', contact: 'Contact', privacyDt: 'Privacy',
    links: { home: 'Hannun', help: 'Help', support: 'Support', privacy: 'Privacy Policy', brand: 'Putchamoe' },
    contactNote: 'Every email is read and answered by the developer. Please include your device and your Hannun version.',
    pages: {
      help: { num: 'Help', title: 'Hannun User Guide', run: 'Help', lede: 'Opening files, shortcuts, the formatting palette, data files and more. Having trouble? See <a href="../support/">Support</a>.' },
      support: { num: 'Support', title: 'Support', run: 'Support', lede: 'How to reach us, fixes for common issues, what’s coming next, and purchases and refunds.' },
      privacy: { num: 'Policy', title: 'Privacy Policy', run: 'Privacy Policy', lede: 'Hannun collects no information about you. Only the free Mac version from our website goes online — to check for updates — and you can turn that off in Settings.' },
    },
  },
  ja: {
    html: 'ja', name: '日本語', dir: 'ja/', font: 'Noto+Serif+JP:wght@400;600',
    langLabel: '言語', langPick: '言語を選択', toc: '目次', get: 'ダウンロード', app: 'Hannun',
    madeBy: '発行', maker: 'プッチャメ', contact: 'お問い合わせ', privacyDt: 'プライバシー',
    links: { home: 'Hannun', help: 'ヘルプ', support: 'サポート', privacy: 'プライバシーポリシー', brand: 'プッチャメ' },
    contactNote: 'いただいたメールは開発者本人がすべて読み、お返事します。お使いのデバイスと Hannun のバージョンを添えてください。',
    pages: {
      help: { num: 'ヘルプ', title: 'Hannun 使い方ガイド', run: 'ヘルプ', lede: 'ファイルの開き方、ショートカット、データファイルの表示などをまとめました。困ったときは<a href="../support/">サポート</a>をご覧ください。' },
      support: { num: 'サポート', title: 'サポート', run: 'サポート', lede: 'お問い合わせ方法、よくあるトラブルと対処法、対応予定の機能、購入と返金についてのご案内です。' },
      privacy: { num: 'ポリシー', title: 'プライバシーポリシー', run: 'プライバシーポリシー', lede: 'Hannun は利用者の情報を一切収集しません。インターネットに接続するのは、ウェブサイトから入手した無料の Mac 版がアップデートを確認するときだけで、設定でオフにできます。' },
    },
  },
  zh: {
    html: 'zh-Hans', name: '简体中文', dir: 'zh/', font: 'Noto+Serif+SC:wght@400;600',
    langLabel: '语言', langPick: '选择语言', toc: '目录', get: '下载', app: 'Hannun',
    madeBy: '出品', maker: 'Putchamoe', contact: '联系我们', privacyDt: '隐私',
    links: { home: 'Hannun', help: '帮助', support: '支持', privacy: '隐私政策', brand: 'Putchamoe' },
    contactNote: '每封邮件都由开发者本人阅读并回复。请注明您使用的设备和 Hannun 版本。',
    pages: {
      help: { num: '帮助', title: 'Hannun 使用指南', run: '帮助', lede: '打开文件、快捷键、数据文件查看等使用方法都在这里。遇到问题请查看<a href="../support/">支持</a>页面。' },
      support: { num: '支持', title: '支持', run: '支持', lede: '联系方式、常见问题及解决方法、即将推出的功能，以及购买与退款说明。' },
      privacy: { num: '隐私', title: '隐私政策', run: '隐私政策', lede: 'Hannun 不收集您的任何信息。只有从官网下载的免费 Mac 版会在检查更新时联网，且可在设置中关闭。' },
    },
  },
}

const slug = t => t.replace(/<[^>]+>/g, '').replace(/[—·›()`]/g, ' ').trim().replace(/\s+/g, '-').toLowerCase()
const url = (code, doc) => `/hannun/${LANGS[code].dir}${doc ? doc + '/' : ''}`

function page(code, doc, md) {
  const L = LANGS[code]
  const P = L.pages[doc]
  let html = marked.parse(md, { gfm: true })
  const toc = []
  html = html.replace(/<(h[23])>(.*?)<\/h[23]>/g, (m, tag, inner) => {
    const id = slug(inner)
    if (tag === 'h2') toc.push(`<a href="#${id}">${inner.replace(/<[^>]+>/g, '')}</a>`)
    return `<${tag} id="${id}">${inner}</${tag}>`
  })
  html = html.replace(/<code>(⌘[^<]*|⌥|⌥⌘F)<\/code>/g, '<kbd>$1</kbd>')
  const alternates = Object.keys(LANGS).map(c => `<link rel="alternate" hreflang="${LANGS[c].html}" href="https://putchamoe.com${url(c, doc)}">`).join('\n')
  const switcher = Object.keys(LANGS)
    .map(c => `<a href="${url(c, doc)}" lang="${LANGS[c].html}" hreflang="${LANGS[c].html}"${c === code ? ' aria-current="page"' : ''}>${LANGS[c].name}</a>`)
    .join('\n        ')
  const contact = doc === 'support'
    ? `<p class="doc-contact"><span>${L.contact}</span><a href="mailto:hannun@putchamoe.com">hannun@putchamoe.com</a><small>${L.contactNote}</small></p>`
    : ''
  // 예전 주소(/hannun/privacy/#en 등)로 들어오면 그 언어 페이지로 보낸다
  const legacy = code === 'ko' && doc === 'privacy'
    ? `<script>(function(){var m={'#en':'/hannun/en/privacy/','#ja':'/hannun/ja/privacy/','#zh':'/hannun/zh/privacy/'};if(m[location.hash])location.replace(m[location.hash])})()</script>\n`
    : ''
  return `<!doctype html>
<html lang="${L.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${legacy}<title>${P.title} — ${L.app}</title>
<meta name="theme-color" content="#fbfaf7">
${alternates}
<link rel="icon" href="/hannun/img/icon-128.png">
<link rel="apple-touch-icon" href="/hannun/img/icon-512.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${L.font}&display=swap">
<link rel="stylesheet" href="/hannun/hannun.css">
</head>
<body class="docpage">
<header class="head">
  <div class="wrap">
    <a class="head__brand" href="${url(code)}"><img src="/hannun/img/icon-128.png" alt="">${L.app}</a>
    <div class="head__run"><b>${P.run}</b></div>
    <details class="head__lang">
      <summary aria-label="${L.langPick}">${L.name}</summary>
      <nav aria-label="${L.langLabel}">
        ${switcher}
      </nav>
    </details>
    <a class="head__get" href="${url(code)}#get">${L.get}</a>
  </div>
</header>
<main>
  <section class="doc-hero">
    <div class="wrap grid">
      <div class="num sec__num">${P.num}</div>
      <div class="main">
        <h1>${P.title}</h1>
        <p class="doc-lede">${P.lede}</p>
        ${contact}
      </div>
    </div>
  </section>
  <div class="wrap grid doc-body">
    <div class="num"></div>
    <article class="main doc">
${html}
    </article>
    <aside class="note doc-toc"><nav aria-label="${L.toc}"><h4>${L.toc}</h4>${toc.join('')}</nav></aside>
  </div>
</main>
<footer class="colophon">
  <div class="wrap grid">
    <div class="num"></div>
    <div class="main">
      <dl class="box">
        <div class="t">${L.app}</div>
        <dt>${L.madeBy}</dt><dd>${L.maker}</dd>
        <dt>${L.contact}</dt><dd><a href="mailto:hannun@putchamoe.com">hannun@putchamoe.com</a></dd>
        <dt>${L.privacyDt}</dt><dd><a href="mailto:privacy@putchamoe.com">privacy@putchamoe.com</a></dd>
      </dl>
      <p class="links"><a href="${url(code)}">${L.links.home}</a><a href="${url(code, 'help')}">${L.links.help}</a><a href="${url(code, 'support')}">${L.links.support}</a><a href="${url(code, 'privacy')}">${L.links.privacy}</a><a href="/">${L.links.brand}</a></p>
    </div>
  </div>
</footer>
<script>document.addEventListener('click',function(e){var d=document.querySelector('.head__lang');if(d&&d.open&&!d.contains(e.target))d.open=false})</script>
</body>
</html>
`
}

for (const code of Object.keys(LANGS)) {
  for (const doc of ['help', 'support', 'privacy']) {
    const src = `${SRC}/${code}/${doc}.md`
    if (!existsSync(src)) { console.log('없음', src); continue }
    const dir = `${OUT}/${LANGS[code].dir}${doc}`
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/index.html`, page(code, doc, readFileSync(src, 'utf8')))
    console.log('구움', dir)
  }
}
