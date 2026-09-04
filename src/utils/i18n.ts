import Vue from 'vue'
import en from '~/_locales/en/messages.json'
import ja from '~/_locales/ja/messages.json'
import ko from '~/_locales/ko/messages.json'
import zhTW from '~/_locales/zh_TW/messages.json'
import de from '~/_locales/de/messages.json'
import es from '~/_locales/es/messages.json'
import fr from '~/_locales/fr/messages.json'
import id from '~/_locales/id/messages.json'
import ptBR from '~/_locales/pt_BR/messages.json'
import th from '~/_locales/th/messages.json'
import tr from '~/_locales/tr/messages.json'
import vi from '~/_locales/vi/messages.json'

export type Locale =
  | 'en'
  | 'ja'
  | 'zh_TW'
  | 'ko'
  | 'id'
  | 'vi'
  | 'th'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt_BR'
  | 'tr'

type Messages = Record<string, { message: string }>

const messages: Record<Locale, Messages> = {
  de,
  en,
  es,
  fr,
  id,
  ja,
  ko,
  pt_BR: ptBR,
  th,
  tr,
  vi,
  zh_TW: zhTW,
}

const state = Vue.observable({ locale: 'en' as Locale })

export const setLocale = (locale?: string) => {
  if (locale && locale in messages) {
    state.locale = locale as Locale
  } else {
    state.locale = 'en'
  }
}

export const t = (key: string) =>
  messages[state.locale][key]?.message || messages.en[key]?.message || key
