import { createApp } from 'vue'

import { createI18n } from 'vue-i18n'
import { getLocale } from './i18n/locales'
import messages from './i18n/messages'

import App from './App.vue'
import './style.css'

const i18n = createI18n({
    locale: getLocale(),
    legacy: false,
    messages
})

createApp(App)
    .use(i18n)
    .mount('#app')
