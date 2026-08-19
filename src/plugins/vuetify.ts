import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Theme } from '~/models'

Vue.use(Vuetify)

const vuetify = new Vuetify({
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: '#4f8cff',
        secondary: '#b36bff',
        accent: '#e6b0ff',
        background: '#070a32',
        surface: '#10134b',
      },
    },
  },
})

export const applyTheme = (theme: Theme) => {
  vuetify.framework.theme.dark = theme === 'dark'
}

export default vuetify
