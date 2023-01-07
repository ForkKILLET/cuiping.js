import { watch, ref, reactive, Ref } from 'vue'
import Conf from './Conf.vue'

export type Schema = {
    ty: 'boolean'
} | {
    ty: 'number'
    min?: number
    max?: number
} | {
    ty: 'color'
}

export type Schemas = Record<string, Schema>

export type SchemaToValue<S extends Schema>
    = S['ty'] extends 'boolean' ? boolean
        : S['ty'] extends 'color' ? string
            : S['ty'] extends 'number' ? number
                : never

export type SchemasToValues<SS extends Schemas> = {
    [K in keyof SS]: SchemaToValue<SS[K]>
}

export { Conf }

export const storageRef = <T>(name: string, def: T) => {
    name = 'cuiping' + name.replace(/^[a-z]/, s => s.toUpperCase())

    let r: Ref<T>

    const saved = localStorage.getItem(name)
    if (saved) r = ref(JSON.parse(saved))
    else r = ref(def) as Ref<T>

    watch(r, () => {
        localStorage.setItem(name, JSON.stringify(r.value))
    }, { immediate: true })

    return r
}

export const storageReactive = <T extends object>(name: string, def: T) => {
    let r: T

    name = 'cuiping' + name.replace(/^[a-z]/, s => s.toUpperCase())

    const saved = localStorage.getItem(name)
    if (saved) r = reactive(JSON.parse(saved))
    else r = reactive(def) as T

    watch(r, () => {
        localStorage.setItem(name, JSON.stringify(r))
    }, { immediate: true })

    return r
}
