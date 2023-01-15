import type { App } from 'vue'
import Cuiping from './components/Cuiping.vue'

export default {
    install(Vue: App) {
        Vue.component('Cuiping', Cuiping)
    }
}

export { Cuiping }
