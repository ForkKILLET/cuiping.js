import { App } from 'vue'
import Cuiping from './Cuiping.vue'
import { Debug } from 'cuiping/utils/debug'

Debug.on = !! localStorage.getItem('cuipingDebug')

export default {
    install(Vue: App) {
        Vue.component('Cuiping', Cuiping)
    }
}