export type MaybeArray<T> = T | T[]

export type ValueOf<T> = T[keyof T]

export type TupleToUnion<T extends Record<number, any>> = T[number]

export type AllCharsInString<T extends string> = T extends `${infer F}${infer L}`
    ? F | AllCharsInString<L>
    : never

export const inCharset = <T extends string>(char: string, charset: T): char is AllCharsInString<T> =>
    charset.includes(char)