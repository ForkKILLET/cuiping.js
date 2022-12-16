export type MaybeArray<T> = T | T[]

export type ValueOf<T> = T[keyof T]

export type TupleToUnion<T extends Record<number, any>> = T[number]