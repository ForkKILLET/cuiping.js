import Conf from './Conf.vue'

export type Schema = {
    ty: 'boolean',
    def?: boolean
} | {
    ty: 'number',
    def?: number,
    min?: number,
    max?: number
} | {
    ty: 'color',
    def?: string
}

export type Schemas = Record<string, Schema>

export type SchemaToValue<S extends Schema>
    = S['ty'] extends 'boolean' ? boolean
    : S['ty'] extends 'number' ? number
    : never

export type SchemasToValues<SS extends Schemas> = {
    [K in keyof SS]: SchemaToValue<SS[K]>
}

export default Conf