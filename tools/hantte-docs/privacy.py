# 한때 개인정보처리방침 — 네 언어 페이지를 굽는다. 한국어 본문은 hantte/privacy/index.html 에서 읽어 오고, 머리·언어 단추는 여기서 통일한다
# 사용: python3 tools/hantte-docs/privacy.py
import re
ROOT='/Users/jdu/Documents/dev_workspace/00.personal project/WEB/putchamoe.github.io/hantte/'
FONT_PRET='<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">'
FONTS={
 'ko': FONT_PRET,
 'en': FONT_PRET,
 'ja': '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-jp-dynamic-subset.min.css">\n'+FONT_PRET,
 'zh': FONT_PRET+'\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;800&display=swap">',
}
LANGS={'ko':('ko','한국어',''),'en':('en','English','en/'),'ja':('ja','日本語','ja/'),'zh':('zh-Hans','简体中文','zh/')}
def switcher(cur, pick, label):
    CUR=' aria-current="page"'
    NL='\n      '
    items=''.join(NL+f'<a href="/hantte/{d}privacy/" lang="{h}" hreflang="{h}"'+(CUR if k==cur else '')+f'>{n}</a>' for k,(h,n,d) in LANGS.items())
    return f'''  <details class="head__lang">
    <summary aria-label="{pick}">{LANGS[cur][1]}</summary>
    <nav aria-label="{label}">{items}
    </nav>
  </details>'''
def page(lang, t):
    up = '../' if lang=='ko' else '../../'
    alts=''.join(f'\n<link rel="alternate" hreflang="{h}" href="https://putchamoe.com/hantte/{d}privacy/">' for k,(h,n,d) in LANGS.items())
    return f'''<!doctype html>
<html lang="{LANGS[lang][0]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t['title']}</title>
<meta name="description" content="{t['desc']}">
<meta name="theme-color" content="#fbfaf5">{alts}
<link rel="alternate" hreflang="x-default" href="https://putchamoe.com/hantte/en/privacy/">
<link rel="icon" href="{up}img/icon-128.png">
<link rel="apple-touch-icon" href="{up}img/icon-512.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
{FONTS[lang]}
<link rel="stylesheet" href="{up}hantte.css">
<style>.doc__wash {{ background-image: url({up}img/splash-wide.jpg); }}</style>
</head>
<body>

<header class="head">
  <a class="head__brand" href="../"><img src="{up}img/icon-128.png" alt="">{t['app']}</a>
  <span class="head__run">{t['h1']}</span>
{switcher(lang, t['pick'], t['langLabel'])}
  <a class="head__get" href="../">{t['back']}</a>
</header>

<main class="doc">
  <div class="doc__wash" aria-hidden="true"></div>
  <div class="wrap">
    <h1>{t['h1']}</h1>
{t['body']}
    <p class="links"><a href="../">{t['back']}</a><a href="/">{t['brand']}</a></p>
  </div>
</main>

</body>
</html>
'''
T={}
# 한국어 — 기존 본문 그대로
ko=open(ROOT+'privacy/index.html',encoding='utf-8').read()
kobody=ko[ko.index('    <p class="doc__lede">'):ko.index('    <p class="links">')].rstrip('\n')
T['ko']=dict(title='한때 — 개인정보처리방침',desc='한때는 이용자의 정보를 수집하지 않습니다. 기록은 내 아이폰과 내 iCloud에만 저장됩니다.',app='한때',h1='개인정보처리방침',pick='언어 선택',langLabel='언어',back='한때 소개',brand='풋참외',body=kobody)

T['en']=dict(title='Hantte — Privacy Policy',desc='Hantte collects no information about you. Your records are stored only on your iPhone and in your iCloud.',app='Hantte',h1='Privacy Policy',pick='Choose language',langLabel='Language',back='About Hantte',brand='Putchamoe',body='''    <p class="doc__lede">Hantte collects no information about you. Your records are stored only on your iPhone and in your iCloud, and are never sent to the developer or anyone else.</p>
    <p class="doc__meta">Effective: the release date of Hantte 1.0 · Made by Putchamoe</p>

    <h2>Information we collect</h2>
    <p>None. Hantte has no server run by the developer, and there is no sign-up or sign-in. There are no ads, no analytics, and nothing that tracks you.</p>
    <p>Because we collect nothing, there is nothing we share with or hand over to any third party.</p>

    <h2>What the app handles, and where it is stored</h2>
    <p>Hantte reads and writes the following on your device. None of it is sent to the developer.</p>
    <table>
      <thead><tr><th>Information</th><th>Used for</th><th>Stored</th></tr></thead>
      <tbody>
        <tr><th>Location</th><td>Drawing the path you took on the map, and showing the places you visited and the distance you traveled.</td><td>Your device, your iCloud</td></tr>
        <tr><th>Photos</th><td>Reading photos in Photos along with when and where they were taken, to show them by day and place them where they were taken. Hantte makes no copies. It changes your photo library only when you choose <q>Add Location</q> or delete a photo yourself, and iOS asks you to confirm.</td><td>In Photos, as they are</td></tr>
        <tr><th>Notes · moments · My Places</th><td>The words you leave, the moments you gather, and places you save such as home and work.</td><td>Your device, your iCloud</td></tr>
        <tr><th>Steps · walking distance · flights climbed</th><td>Read from the Health app only when you turn on Health sync, and shown on screen. Hantte writes nothing to Health.</td><td>Daily totals on your device only; not uploaded to iCloud</td></tr>
        <tr><th>Device tilt</th><td>Used only to let on-screen effects such as falling leaves respond to how you tilt your phone.</td><td>Not stored</td></tr>
      </tbody>
    </table>

    <h2>iCloud sync</h2>
    <p>If you are signed in to iCloud on your device, your location history, My Places, notes and moments sync to your private iCloud storage. Only your Apple Account can open it; the developer cannot see it. If you don’t use iCloud, your records stay on your device. Hantte does not upload your photos or step counts to iCloud.</p>

    <h2>Apple services</h2>
    <p>Hantte uses Apple Maps services to draw maps, turn coordinates into place names, and search for addresses and places. The visible map area, the coordinates being looked up and the search terms you type are sent to Apple, and Apple’s privacy policy applies. Apart from iCloud sync and these map services, Hantte sends nothing over the internet.</p>

    <h2>Permissions</h2>
    <p>Hantte asks for each permission when you use the feature that needs it. You can use the rest of the app without granting it, and change your choice at any time in the iPhone Settings app.</p>
    <ul>
      <li><strong>Location</strong> — shows where you are on the map and records your path. <q>Always</q> is needed to keep tracing your path while the app is closed.</li>
      <li><strong>Photos</strong> — shows your photos by day and suggests moments. Changes your library only when you add a location or delete a photo.</li>
      <li><strong>Health</strong> — reads steps, walking distance and flights climbed. Asked only when you turn on Health sync.</li>
      <li><strong>Notifications</strong> — shows the weekly recap and moment suggestions. Notifications are created on your device; none are sent from a server.</li>
    </ul>

    <h2>When you share</h2>
    <p>Information leaves your device only when you make and share a poster yourself. A poster contains the photos you chose, the shape of your path, and the title, dates and numbers. The roads near the My Places you’ve saved, such as home and work, are hidden automatically.</p>

    <h2>Exporting and deleting your records</h2>
    <p>In Settings › Data you can export your records to a file and import them again. The file contains your location history, the names and addresses of My Places, notes, moments, daily step totals and app settings, but no original photos. Because it includes your home address and the paths you took, please take care when keeping or sending it.</p>
    <p>Your records remain on your device and in iCloud until you delete them. Deleting the app removes the records on your device; records left in iCloud can be deleted in the iPhone Settings app under your name › iCloud › Manage Storage.</p>

    <h2>Children</h2>
    <p>Hantte collects information from no one, children included.</p>

    <h2>Changes to this policy</h2>
    <p>If this policy changes, the new version will be posted on this page first, with an updated effective date.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hantte@putchamoe.com">hantte@putchamoe.com</a> — every email is read and answered by the person who made Hantte.</p>
''')

T['ja']=dict(title='ハンテ — プライバシーポリシー',desc='ハンテは利用者の情報を収集しません。記録はあなたの iPhone と iCloud にだけ保存されます。',app='ハンテ',h1='プライバシーポリシー',pick='言語を選択',langLabel='言語',back='ハンテについて',brand='プッチャメ',body='''    <p class="doc__lede">ハンテは利用者の情報を収集しません。記録はあなたの iPhone とあなたの iCloud にだけ保存され、開発者にもほかの誰にも送られません。</p>
    <p class="doc__meta">施行日：ハンテ 1.0 の公開日 · 制作：プッチャメ</p>

    <h2>収集する情報</h2>
    <p>ありません。ハンテには開発者が運営するサーバーがなく、会員登録やログインもありません。広告、分析ツール、利用者を追跡する機能も入れていません。</p>
    <p>収集する情報がないため、第三者に提供したり、処理を委託したりする情報もありません。</p>

    <h2>アプリが扱う情報と保存先</h2>
    <p>ハンテは次の情報をデバイスの中で読み書きします。これらの情報が開発者に送られることはありません。</p>
    <table>
      <thead><tr><th>情報</th><th>使いみち</th><th>保存先</th></tr></thead>
      <tbody>
        <tr><th>位置情報</th><td>たどった道を地図に描き、立ち寄った場所と移動距離を表示します。</td><td>あなたのデバイス、あなたの iCloud</td></tr>
        <tr><th>写真</th><td>写真アプリの写真と、撮影日時・撮影場所を読み込み、日付ごとに表示して撮った場所に置きます。写真をコピーすることはありません。自分で<q>位置を追加</q>や削除を選んだときだけ写真ライブラリを変更し、そのときは iOS が確認します。</td><td>写真アプリにあるそのまま</td></tr>
        <tr><th>ひとこと · ひととき · わたしの場所</th><td>自分で残した言葉、まとめたひととき、登録した家や職場などの場所です。</td><td>あなたのデバイス、あなたの iCloud</td></tr>
        <tr><th>歩数 · 歩いた距離 · 上った階数</th><td>ヘルスケア連携をオンにしたときだけヘルスケアから読み込み、画面に表示します。ヘルスケアに書き込むことはありません。</td><td>日ごとの合計をデバイスにのみ。iCloud には送りません</td></tr>
        <tr><th>デバイスの傾き</th><td>木の葉などの画面演出を、傾きに合わせて動かすためだけに使います。</td><td>保存しません</td></tr>
      </tbody>
    </table>

    <h2>iCloud 同期</h2>
    <p>デバイスで iCloud にサインインしている場合、位置の記録、わたしの場所、ひとこと、ひとときが、あなたの iCloud のプライベートな保存領域に同期されます。この領域はあなたの Apple アカウントでしか開けず、開発者は見ることができません。iCloud を使わない場合、記録はデバイスの中にだけ残ります。写真と歩数を、ハンテが iCloud に送ることはありません。</p>

    <h2>Apple のサービスの利用</h2>
    <p>地図を描くとき、座標を場所の名前に変えるとき、住所や場所を検索するときに、Apple のマップサービスを利用します。このとき、表示している地図の範囲、調べる座標、入力した検索語が Apple に送られ、Apple のプライバシーポリシーが適用されます。iCloud 同期とこのマップサービスのほかに、ハンテがインターネットに送る情報はありません。</p>

    <h2>権限</h2>
    <p>権限は、その機能を使うときにたずねます。許可しなくてもほかの機能は使え、iPhone の設定からいつでも変更できます。</p>
    <ul>
      <li><strong>位置情報</strong> — 地図に現在地を表示し、たどった道を残します。アプリを閉じているあいだも道をつなぐには<q>常に許可</q>が必要です。</li>
      <li><strong>写真</strong> — 日付ごとの写真を表示し、ひとときをおすすめします。位置を追加したり削除したりするときだけ写真ライブラリを変更します。</li>
      <li><strong>ヘルスケア</strong> — 歩数、歩いた距離、上った階数を読み込みます。連携をオンにするときだけたずねます。</li>
      <li><strong>通知</strong> — 一週間のふりかえりと、ひとときのおすすめを表示します。通知はデバイスの中で作られ、サーバーから送られることはありません。</li>
    </ul>

    <h2>共有するとき</h2>
    <p>情報がデバイスの外に出るのは、自分でポスターを作って共有するときだけです。ポスターには選んだ写真、道の形、タイトル · 期間 · 数字が入り、家や職場など登録したわたしの場所のまわりの道は自動で隠されます。</p>

    <h2>記録の書き出しと削除</h2>
    <p>設定 › データ から、記録をファイルに書き出したり、読み込んだりできます。書き出したファイルには位置の記録、わたしの場所の名前と住所、ひとこと、ひととき、歩数の合計、アプリの設定が含まれ、元の写真は含まれません。自宅の住所とたどった道が入ったファイルですので、保管や受け渡しにはご注意ください。</p>
    <p>記録は、自分で削除するまでデバイスと iCloud に残ります。アプリを削除するとデバイスの中の記録も削除され、iCloud に残った記録は iPhone の 設定 › ユーザ名 › iCloud › ストレージを管理 から削除できます。</p>

    <h2>お子さまについて</h2>
    <p>ハンテは誰からも情報を収集しません。お子さまの情報も同様です。</p>

    <h2>ポリシーの変更</h2>
    <p>内容が変わる場合は、まずこのページに掲載し、施行日を書き改めます。</p>

    <h2>お問い合わせ</h2>
    <p><a href="mailto:hantte@putchamoe.com">hantte@putchamoe.com</a> — いただいたメールは、作った本人がすべて読み、お返事します。</p>
''')

T['zh']=dict(title='HANTTE — 隐私政策',desc='HANTTE 不收集你的任何信息。记录只保存在你的 iPhone 和你的 iCloud 中。',app='HANTTE',h1='隐私政策',pick='选择语言',langLabel='语言',back='关于 HANTTE',brand='Putchamoe',body='''    <p class="doc__lede">HANTTE 不收集你的任何信息。记录只保存在你的 iPhone 和你的 iCloud 中，不会发送给开发者或其他任何人。</p>
    <p class="doc__meta">生效日期：HANTTE 1.0 发布之日 · 出品：Putchamoe</p>

    <h2>我们收集的信息</h2>
    <p>没有。HANTTE 没有由开发者运营的服务器，也没有注册或登录。没有广告、分析工具，也没有任何追踪你的功能。</p>
    <p>由于不收集任何信息，也就没有向第三方提供或委托处理的信息。</p>

    <h2>应用处理的信息及存放位置</h2>
    <p>HANTTE 在你的设备上读写以下信息。这些信息不会发送给开发者。</p>
    <table>
      <thead><tr><th>信息</th><th>用途</th><th>存放位置</th></tr></thead>
      <tbody>
        <tr><th>位置</th><td>在地图上画出你走过的路，显示去过的地方和移动距离。</td><td>你的设备、你的 iCloud</td></tr>
        <tr><th>照片</th><td>读取“照片”中的照片及其拍摄时间和地点，按日期显示并放在拍摄的地方。不会另存副本。只有你自己选择<q>添加位置</q>或删除照片时才会更改照片图库，届时 iOS 会再次确认。</td><td>保持在“照片”中原样</td></tr>
        <tr><th>一句话 · 时光 · 我的地点</th><td>你留下的文字、收好的时光，以及登记的家、公司等地点。</td><td>你的设备、你的 iCloud</td></tr>
        <tr><th>步数 · 步行距离 · 爬升楼层</th><td>仅在打开“健康”同步时从“健康”读取并显示在屏幕上。不会向“健康”写入任何内容。</td><td>每日合计仅存于你的设备，不上传 iCloud</td></tr>
        <tr><th>设备倾斜</th><td>仅用于让树叶等画面特效随倾斜而动。</td><td>不保存</td></tr>
      </tbody>
    </table>

    <h2>iCloud 同步</h2>
    <p>如果设备已登录 iCloud，位置记录、我的地点、一句话和时光会同步到你 iCloud 的私有存储空间。只有你的 Apple 账户能打开这个空间，开发者无法查看。不使用 iCloud 时，记录只留在设备里。HANTTE 不会把照片和步数上传到 iCloud。</p>

    <h2>Apple 服务的使用</h2>
    <p>绘制地图、把坐标转换为地名、搜索地址或地点时，会使用 Apple 地图服务。此时，当前显示的地图范围、要查询的坐标和你输入的搜索词会发送给 Apple，并适用 Apple 的隐私政策。除 iCloud 同步和上述地图服务外，HANTTE 不会通过互联网发送任何信息。</p>

    <h2>权限</h2>
    <p>权限会在你使用需要它的功能时才询问。即使不允许，其他功能也照样能用，并且可以随时在 iPhone 的“设置”中更改。</p>
    <ul>
      <li><strong>位置</strong> — 在地图上显示当前位置并记录走过的路。要在应用关闭时继续记录，需要设为<q>始终</q>。</li>
      <li><strong>照片</strong> — 按日期显示照片并推荐时光。只在添加位置或删除照片时更改照片图库。</li>
      <li><strong>健康</strong> — 读取步数、步行距离和爬升楼层。仅在打开同步时询问。</li>
      <li><strong>通知</strong> — 显示一周回顾和时光推荐。通知在设备上生成，不从服务器发送。</li>
    </ul>

    <h2>分享时</h2>
    <p>只有你自己制作并分享海报时，信息才会离开设备。海报包含你选择的照片、路线形状，以及标题、日期和数字；家和公司等已登记的我的地点附近的路会自动遮住。</p>

    <h2>导出与删除记录</h2>
    <p>在“设置 › 数据”中可以把记录导出为文件，也可以再导入。导出的文件包含位置记录、我的地点的名称和地址、一句话、时光、步数合计和应用设置，不包含原始照片。文件里有你的住址和走过的路，保存和传送时请多加注意。</p>
    <p>记录会一直保留在设备和 iCloud 中，直到你自己删除。删除应用会一并删除设备上的记录；留在 iCloud 中的记录可以在 iPhone 的“设置 › 你的姓名 › iCloud › 管理储存空间”中删除。</p>

    <h2>儿童</h2>
    <p>HANTTE 不向任何人收集信息，儿童也是如此。</p>

    <h2>政策变更</h2>
    <p>如有变更，会先在本页面公布，并更新生效日期。</p>

    <h2>联系我们</h2>
    <p><a href="mailto:hantte@putchamoe.com">hantte@putchamoe.com</a> — 每封邮件都由开发者本人阅读并回复。</p>
''')
OUT={'ko':'privacy/index.html','en':'en/privacy/index.html','ja':'ja/privacy/index.html','zh':'zh/privacy/index.html'}
for k in T:
    open(ROOT+OUT[k],'w',encoding='utf-8').write(page(k,T[k]))
print('ok')
