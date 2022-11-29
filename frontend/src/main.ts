import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from './i18n'
import App from './App.vue'
import './style.css'

const i18n = createI18n({
    locale: localStorage.getItem('cuipingLocale') || 'en',
    legacy: false,
    messages
})

createApp(App)
    .use(i18n)
    .mount('#app')
