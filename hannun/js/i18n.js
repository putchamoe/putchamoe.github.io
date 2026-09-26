// 페이지 언어(<html lang>)에 맞는 문구를 불러온다. 없으면 한국어.
import ko from './i18n/ko.js'

const code = (document.documentElement.lang || 'ko').toLowerCase().startsWith('zh') ? 'zh' : (document.documentElement.lang || 'ko').slice(0, 2)
let dict = ko
if (code !== 'ko') {
  try {
    dict = (await import(`./i18n/${code}.js`)).default
  } catch {
    dict = ko
  }
}
export const T = dict
export const LANG = code
