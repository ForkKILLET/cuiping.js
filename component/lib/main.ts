import type { App } from 'vue'
import Cuiping from './components/Cuiping.vue'
import { Debug } from 'cuiping/utils/debug'

Debug.on = !! localStorage.getItem('cuipingDebug')

export default {
    install(Vue: App) {
        Vue.component('Cuiping', Cuiping)
    }
}

export { Cuiping }
