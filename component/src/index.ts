import { App } from 'vue'
import Cuiping from './Cuiping.vue'

export default {
    install(Vue: App) {
        Vue.component('Cuiping', Cuiping)
    }
}