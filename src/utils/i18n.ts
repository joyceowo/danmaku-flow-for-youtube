import Vue from 'vue'
import en from '~/_locales/en/messages.json'
import ja from '~/_locales/ja/messages.json'
import ko from '~/_locales/ko/messages.json'
import zhTW from '~/_locales/zh_TW/messages.json'

export type Locale = 'en' | 'ja' | 'zh_TW' | 'ko'

type Messages = Record<string, { message: string }>

const messages: Record<Locale, Messages> = { en, ja, ko, zh_TW: zhTW }

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
