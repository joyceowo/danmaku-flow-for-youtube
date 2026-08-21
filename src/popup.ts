import Vue from 'vue'
import App from '~/components/App.vue'
import vuetify from '~/plugins/vuetify'
import { readyStore } from '~/store'

void readyStore().then(() => {
  new Vue({
    el: '#app',
    render: (createElement) => createElement(App),
    vuetify,
  })
})
