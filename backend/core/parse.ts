import { Debug } from '../utils/debug.js'
import { MathEx } from '../utils/math.js'
import { getWidth } from '../utils/measure.js'
import type { AllCharsInString } from '../utils/types'
import { inCharset } from '../utils/types.js'

export const SpaceCharset = ' \t\t\n'
export const IdentifierCharset
    = 'abcdefghijklmnopqrstuvwxyz'
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    + '0123456789'
export const RefNameCharset = IdentifierCharset + '.,'
export const GroupCharset
    = IdentifierCharset
    + '^_`'
    + '()'
    + '?' // Note: willcard
    + '.' // Note: collpased carbonA
export const AttrEndCharset = ',}'
export const AttrExtraCharset = '~&<>:+-.'
export const AttrCharset = AttrEndCharset + AttrExtraCharset + IdentifierCharset
export const BondCountCharset = '=#'
export const BondDirCharset = '-|/\\+@'
export const BondModifiersCharset = '*!~:'
export const BondCharset = BondCountCharset + BondDirCharset + BondModifiersCharset

export type Formula = {
    structs: Struct[]
    groups: Group[]
    labels: Record<string, Struct | undefined>
}

export type StructHead = ChemStructHead | RefStructHead | FuncStructHead
export type Struct<
    H extends StructHead = StructHead,
    C extends StructHead = StructHead,
    P extends StructHead = StructHead
> = H & {
    children: Bond<C>[]
    parents: Bond<P>[]
    [key: `${string}Visited`]: boolean | undefined
}
export type ChemStructHead = {
    S: 'chem'
    node: Group
    labelDef?: LabelDef
}
export type RefStructHead = {
    S: 'ref'
    node: Ref
}
export type FuncStructHead = {
    S: 'func'
    node: FuncCall
}

export type PureStruct<H extends StructHead> = Struct<H, H, H>
export type ChemAndRefStruct = PureStruct<ChemStructHead | RefStructHead>
export type ChemStruct = PureStruct<ChemStructHead>

export type Ref = {
    l: string[]
}

export type FuncCall = {
    d: FuncStructDef
    a: AttrOfFuncCall
}

export type FuncStructDef = {
    type: 'chem'
    attr: AttrSchema
    chem: ChemDef
} | {
    type: 'void'
    attr: AttrSchema
}

export type FuncStructDefs = Record<string, FuncStructDef>

export type ChemDef = {
    proto: Struct<ChemStructHead, ChemStructHead, ChemStructHead>
    exposedLabels: Record<string, LabelDef>
    defaultIn: string
    defaultOut: string
}

export type LabelDef = {
    defaultDir?: number
}

export type Group = {
    t: GroupTypeset
    a: AttrOfGroup
    R: [number, number] // Note: range in the formula
    i: number
}
export type GroupTypesetAlign = 'base' | 'sub' | 'sup'
export const GroupTypesetAlignTable = {
    '^': 'sup',
    '_': 'sub',
    '`': 'base'
} as const
export type GroupTypesetBox = {
    s: string
    w: number
    a: GroupTypesetAlign
    cd?: boolean // Note: collapsed
    nd?: boolean // Note: not to display
}
export type GroupTypeset = {
    B: GroupTypesetBox[]
    w: number
}

export type BondCount = 1 | 2 | 3
export type BondDir = number
export type Bond<H extends StructHead = StructHead> = {
    c: BondCount
    d: BondDir[]
    n: Struct<H, H, H>
    a: AttrOfBond
}
export type BondType = { c: BondCount, d: BondDir[], a: AttrOfBond }
export type BondModifiers = {
    zeroWidth?: boolean
    add180Deg?: boolean
    useInferred?: boolean
    useDefDeg?: boolean
}

export const BondCountTable: Record<AllCharsInString<typeof BondCountCharset>, BondCount> = {
    '=': 2,
    '#': 3
}
export const BondDirTable = {
    '-': [ 0 ],
    // Note: the y-axis of SVG is top-to-bottom
    '/': [ 300 ],
    '|': [ 270 ],
    '\\': [ 60 ],
    '+': [ 0, 90, 180, 270 ]
}

export const BondModifiersTable: Record<AllCharsInString<typeof BondModifiersCharset>, keyof BondModifiers> = {
    '*': 'zeroWidth',
    '!': 'add180Deg',
    '~': 'useInferred',
    ':': 'useDefDeg'
}

const labelValidator: AttrValidator = (a, { abbrLabel }) => {
    if (abbrLabel) {
        if (a.ref)
            throw Error(`Abbr label '${abbrLabel} exists, so extra 'ref' attr is not allowed.`)
        else
            a.ref = abbrLabel
    }
}

const coordinateBondValidator: AttrValidator = (a: AttrOfBond, { bondType }) => {
    const cc = (a.from ?? a.to) as number
    const { c } = bondType!
    if (cc > c)
        throw Error(`Coordinated bonds (${cc}) more than total bonds (${c}).`)
}

export const GroupAttrs = {
    'color': { type: 'string' },
    'C': 'color',
    'bold': { type: 'boolean' },
    'B': 'bold',
    'ref': {
        type: 'string',
        validate: labelValidator
    },
    '&': 'ref'
} as const
export const BondAttrs = {
    'color': { type: 'string' },
    'C': 'color',
    'highEnergy': { type: 'boolean' },
    'HE': 'highEnergy',
    '~': 'highEnergy',
    'from': {
        type: 'union',
        options: [
            { type: 'boolean' },
            {
                type: 'integer', min: 1, max: 3,
                validate: coordinateBondValidator
            }
        ]
    },
    '<': 'from',
    'to': {
        type: 'union',
        options: [
            { type: 'boolean' },
            {
                type: 'integer', min: 1, max: 3,
                validate: coordinateBondValidator
            }
        ]
    },
    '>': 'to',
    'length': { type: 'float', min: 0 },
    'L': 'length',
    'side': {
        type: 'union',
        options: [
            { type: 'const', value: 'L' },
            { type: 'const', value: 'R' }
        ]
    },
    'S': 'side'
} as const
export const FuncCallAttrs = {
    'ref': {
        type: 'string',
        validate: labelValidator
    },
    '&': 'ref',
    'deg': { type: 'float' }
} as const
export type AttrOfGroup = Attr<typeof GroupAttrs>
export type AttrOfBond = Attr<typeof BondAttrs>
export type AttrOfFuncCall = Attr<typeof FuncCallAttrs>

export type AttrOne<R extends AttrSchemaRule> =
    R extends { type: 'union' } ? AttrMany<R['options']> :
        R extends { type: 'string' } ? string :
            R extends { type: 'boolean' } ? boolean :
                R extends { type: 'integer' | 'float' } ? number :
                    R extends { type: 'const', value: infer V } ? V :
                        never
export type AttrMany<S extends readonly AttrSchemaRule[]> = {
    [L in keyof S]: AttrOne<S[L]>
}[number]
export type Attr<S extends AttrSchema> = {
    -readonly [K in keyof S]?:
    S[K] extends keyof S
        ? S[S[K]] extends AttrSchemaRule
            ? AttrOne<S[S[K]]>
            : never
        : S[K] extends AttrSchemaRule
            ? AttrOne<S[K]>
            : never
}

export type AttrValidatorParams = {
    group?: Group
    bondType?: BondType
    abbrLabel?: string
}
export type AttrValidator = ((raw: any, params: AttrValidatorParams) => void)
export type AttrSchemaRule = ({
    type: 'boolean'
} | {
    type: 'integer'
    min?: number
    max?: number
} | {
    type: 'float'
    min?: number
    max?: number
} | {
    type: 'string'
} | {
    type: 'const'
    value: string
} | {
    type: 'union'
    options: readonly AttrSchemaRule[]
}) & {
    validate?: AttrValidator
}
export type AttrSchema = Record<string, string | AttrSchemaRule>

const isAttribute = (k: string, attrSchema: AttrSchema): k is keyof typeof attrSchema => {
    return k in attrSchema
}

export type AttrToValidate<T extends AttrSchema> = {
    raw: Attr<T>
    validate: (params: AttrValidatorParams) => Attr<T>
}

export abstract class Parser<T> {
    constructor(protected str: string) { }

    protected expect(expect: string, got?: string) {
        return Error(`Expecting ${expect}, but got ${got ?? (this.current
            ? `'${this.current}'`
            : 'end of input'
        )
        }.`)
    }

    private used = false

    protected index = 0
    protected get current(): string {
        return this.str[this.index]
    }

    protected get after(): string {
        return this.str.slice(this.index + 1)
    }

    getStr(): string {
        return this.str
    }

    parse(): T | never {
        if (this.used) throw Error('Parser is already used.')
        this.used = true
        const result = this.doParse()
        if (this.index !== this.str.length)
            throw Error(`Unexcepted trailing characters '${this.current + this.after}'`)
        return result
    }

    protected try<R>(fn: () => R) {
        const indexNow = this.index
        let res: R, err: Error | undefined
        try {
            res = fn()
        }
        catch (e) {
            err = e as Error
        }
        return {
            except: <D>(expect: string, or: D): R | D => {
                if (! err) return res
                if (err.message.startsWith(`Expecting ${expect}`)) {
                    this.index = indexNow
                    return or
                }
                throw err
            },
            catch: <D>(or: D): R | D => {
                if (! err) return res
                this.index = indexNow
                return or
            }
        }
    }

    protected maybeSpace() {
        while (inCharset(this.current, SpaceCharset)) this.index ++
    }

    protected doParseNumber() {
        let number = 0
        let hasMinus = false
        let hasDigit = false
        let dotPower

        if (this.current === '-') {
            hasMinus = true
            this.index ++
        }

        while (true) {
            if (this.current === '.') {
                const next = this.after[0]
                if (! next || next < '0' || next > '9') break
                if (dotPower) break
                else {
                    dotPower = 0.1
                }
            }
            else if (this.current >= '0' && this.current <= '9') {
                hasDigit = true
                if (dotPower) number += + this.current * dotPower
                else number = number * 10 + (+ this.current)
            }
            else break
            this.index ++
        }

        if (! hasDigit) throw this.expect('number')

        return number * (hasMinus ? - 1 : 1)
    }

    protected abstract doParse(options?: any): T
}

export class ChemParser extends Parser<Formula> {
    constructor(str: string, private readonly defs: FuncStructDefs = {}) {
        super(str)
    }

    protected override maybeSpace() {
        super.maybeSpace()

        while (this.current === '(' && this.after[0] === '*') { // Note: maybe comment
            let commentClosed = false
            this.index += 2
            while (this.current) {
                if (this.current as string === '*' && this.after[0] as string === ')') {
                    commentClosed = true
                    this.index += 2
                    break
                }
                this.index ++
            }
            if (! commentClosed) throw Error('Unclosed comment')
            super.maybeSpace()
        }
    }

    private doParseAttr<T extends AttrSchema>(attrSchema: T): AttrToValidate<T> {
        const a: Record<string, string | boolean | number> = {}
        if (this.current === '{') {
            this.index ++
            this.maybeSpace()

            let k = ''
            let readingValue = false
            attr: while (this.current) {
                if (inCharset(this.current, SpaceCharset)) {
                    this.maybeSpace()
                    if (readingValue && ! inCharset(this.current, AttrEndCharset))
                        throw Error('Attr value mustn\'t contain white spaces.')
                }
                if (! inCharset(this.current, AttrCharset))
                    throw Error(`unexpected char '${this.current}' in attr`)
                switch (this.current) {
                    case '}':
                        if (! readingValue) if (k) a[k] = true
                        break attr
                    case ':':
                        this.index ++
                        this.maybeSpace()
                        readingValue = true
                        a[k] = ''
                        break
                    case ',':
                        this.index ++
                        this.maybeSpace()
                        if (! readingValue) if (k) a[k] = true
                        else throw this.expect('Attribute key')
                        k = ''
                        readingValue = false
                        break
                    default:
                        if (readingValue) a[k] += this.current
                        else k += this.current
                        this.index ++
                }
            }
            if (! this.current) throw this.expect('delimiter \'}\' of attributes')
            this.index ++
            this.maybeSpace()

            Debug.D('attr: %o', a)
        }

        const validators: AttrValidator[] = Object.values(attrSchema)
            .map((s: string | AttrSchemaRule) => typeof s === 'string' ? undefined : s.validate)
            .filter((f): f is AttrValidator => !! f)

        for (const k in a) {
            if (isAttribute(k, attrSchema)) {
                let s = attrSchema[k]
                if (typeof s === 'string') {
                    a[s] = a[k]
                    s = attrSchema[s] as AttrSchemaRule
                }

                const tyNow = typeof a[k]
                let tyMatched = false
                let tyError: string | undefined

                const checkOne = (s: AttrSchemaRule, inner = false) => {
                    const ty = s.type

                    if (ty === 'union') {
                        for (const os of s.options) {
                            checkOne(os, true)
                            if (tyMatched) return
                        }
                    }

                    if (tyNow === ty
                        || (tyNow === 'string' && a[k] && ! isNaN(+ a[k]) && (ty === 'integer' || ty === 'float'))
                        || (ty === 'const' && a[k] === s.value)
                    ) {
                        switch (ty) {
                            case 'integer':
                            case 'float':
                                if (ty === 'integer' && ! Number.isInteger(+ a[k])) {
                                    tyError = 'not integer'
                                    return
                                }
                                if (s.min !== undefined && + a[k] < s.min) {
                                    tyError = `less than min value ${s.min}`
                                    return
                                }
                                if (s.max !== undefined && + a[k] > s.max) {
                                    tyError = `greater than max value ${s.max}`
                                    return
                                }
                                a[k] = + a[k]
                        }
                        if (inner && s.validate) { // Note: use inner validators only when the type is matched
                            validators.push(s.validate)
                        }
                        tyMatched = true
                    }
                }

                checkOne(s)

                if (! tyMatched)
                    throw this.expect(`attribute '${k}' to satisfy ${JSON.stringify(s)}`, a[k] + (tyError ? ': ' + tyError : ''))
            }
            else throw Error(`Unknown attribute '${k}'.`)
        }

        return {
            // @ts-expect-error
            // Hack: 杂鱼 TypeScript 这点深度就受不了啦？
            raw: a as Attr<T>,
            validate(params: AttrValidatorParams) {
                validators.forEach(f => {
                    f(this.raw, params)
                })
                return this.raw
            }
        }
    }

    private doParseGroup(): Group {
        let r = ''; let s = ''
        const Rb = this.index
        const boxes: GroupTypesetBox[] = []

        // Todo: refactor these states :(
        let alignShort = false; let alignLong = false; let aligned = false
        let align: GroupTypesetAlign = 'base'
        let hasNonDigit = false
        let cd = false

        const eatChar = (emptyCd = false) => {
            if (! emptyCd && ! s) return
            let w = getWidth(s)
            const nd = ! aligned && s === '?'
            if (aligned) aligned = false
            if (align !== 'base') w /= 2
            boxes.push({ s, w, a: align, cd, nd })
        }

        if (this.current === '.') {
            cd = true
            r += '.'
            this.index ++
        }

        while (
            this.current
            && (inCharset(this.current, GroupCharset) || alignShort || alignLong)
        ) {
            const ch = this.current

            if (ch === '^' || ch === '_' || ch === '`') {
                eatChar()
                s = ''

                align = GroupTypesetAlignTable[ch]
                if (this.after[0] === '{') {
                    alignLong = true
                    this.index ++
                }
                else alignShort = true
                aligned = true
            }
            else if (ch === '}' && alignLong) alignLong = false
            else {
                if (ch < '0' || ch > '9') {
                    hasNonDigit = true
                    if ((ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) hasNonDigit = false
                }

                if (! alignShort
                    && s[0] >= 'A' && s[0] <= 'Z' && ch >= 'a' && ch <= 'z'
                ) s += ch
                else {
                    eatChar()
                    s = ch

                    if (alignShort) alignShort = false
                    else if (! alignLong) {
                        if (ch >= '0' && ch <= '9' && hasNonDigit) align = 'sub'
                        else if (align !== 'base') align = 'base'
                    }
                }
            }

            r += ch
            this.index ++
        }

        eatChar(cd)
        const Re = this.index - 1

        this.maybeSpace()

        if (aligned)
            throw Error(`Unclosed ${align.replace('_', '')} typeset in group typeset '${r}'`)

        if (! r) throw this.expect('atom group')

        const t: GroupTypeset = {
            B: boxes,
            w: boxes.reduce((w, B) => w + B.w, 0)
        }

        Debug.D('group typeset: %s -> %o', r, t)

        const R: [number, number] = [ Rb, Re ]
        const i = this.groupId ++

        let label
        if (this.current === '\'') label = this.doParseLabelAbbr()

        const a = this.doParseAttr(GroupAttrs).validate({
            group: { t, a: {}, R, i },
            abbrLabel: label
        })

        const group = { t, a, R, i }
        this.groups.push(group)

        return group
    }

    private checkDupBondDir(
        parsedBonds: Bond[],
        currentDirs: BondDir[],
        dir: BondDir
    ) {
        return currentDirs.includes(dir)
            || parsedBonds.some(({ d: dirs }) => dirs.includes(dir))
    }

    private doParseBondModifiers(): BondModifiers {
        const modifiers: BondModifiers = {}
        while (inCharset(this.current, BondModifiersCharset)) {
            const modifierName = BondModifiersTable[this.current]
            if (modifiers[modifierName]) throw Error(`Duplicated bond modifier ${this.current}`)
            modifiers[modifierName] = true
            this.index ++
        }
        return modifiers
    }

    private doParseBondType({
        isPrefix = false,
        parsedBonds = [],
        dirFrom: df
    }: {
        isPrefix?: boolean
        parsedBonds?: Bond[]
        dirFrom: BondDir | null
    }): BondType {
        let c: BondCount = 1
        const dirs: BondDir[] = []

        const preModifiers = this.doParseBondModifiers()

        if (inCharset(this.current, BondCountCharset)) {
            c = BondCountTable[this.current]
            this.index ++
        }

        if (! preModifiers.useDefDeg) {
            const noImplictDir = ! inCharset(this.current, BondDirCharset)
            const auto0Deg = noImplictDir && (c > 1 || preModifiers.zeroWidth)
            const auto180Deg = noImplictDir && preModifiers.add180Deg
            const auto30Deg = noImplictDir && preModifiers.useInferred

            while (inCharset(this.current, BondDirCharset) || auto0Deg || auto30Deg || auto180Deg) {
                const ds = []
                if (auto30Deg) {
                    // Note: infer broken line
                    if (preModifiers.add180Deg) {
                        if (df === 150 || df === null) ds.push(30)
                        else if (df === 210) ds.push(330)
                    }
                    else {
                        if (df === 30 || df === null) ds.push(330)
                        else if (df === 330) ds.push(30)
                    }
                    if (! ds.length) {
                        throw Error(`Cannot infer the direction of '${preModifiers.add180Deg ? '!' : ''}~' (from direction ${df} deg)`)
                    }
                }
                else if (auto0Deg || auto180Deg) ds.push(0)
                else if (this.current === '@') {
                    this.index ++
                    let deflect = false
                    let filpX = false
                    let filpY = false
                    const op = this.current as string
                    if (op === '!') {
                        deflect = true
                        this.index ++
                    }
                    else if (op === '|') {
                        filpY = true
                        this.index ++
                    }
                    else if (op === '_') {
                        filpX = true
                        this.index ++
                    }

                    let d = MathEx.stdAng(- this.doParseNumber())
                    if (preModifiers.useInferred) { // Note: infer relative dir
                        if (df === null)
                            throw Error('Not implemented: Cannot infer relative direction for postfix bonds')
                        else d = MathEx.stdAng(df - 180 - d)
                    }

                    ds.push(d)
                    if (deflect) ds.push(MathEx.stdAng(d + 180))
                    else if (filpY) ds.push(MathEx.stdAng(180 - d))
                    else if (filpX) ds.push(MathEx.stdAng(- d))
                }
                else {
                    ds.push(...BondDirTable[this.current as keyof typeof BondDirTable])
                    this.index ++
                }

                for (let d of ds) {
                    if (preModifiers.useInferred) {
                        if (d === 60) d = 30
                        else if (d === 300) d = 330
                    }
                    if (preModifiers.add180Deg) d = MathEx.stdAng(d + 180)
                    if (! isPrefix) d = MathEx.stdAng(d + 180)
                    if (dirs.includes(d)) d = MathEx.stdAng(d + 180)

                    if (this.checkDupBondDir(parsedBonds, dirs, d))
                        throw Error(`Duplicated bond direction (${ds} deg)`)

                    dirs.push(d)
                }

                if (auto0Deg || auto30Deg || auto180Deg) break
            }

            if (! dirs.length) throw this.expect('at least one bond direction')
        }

        this.maybeSpace()

        const a = this.doParseAttr(BondAttrs).validate({
            bondType: { c, d: dirs, a: {} }
        })

        if (preModifiers.zeroWidth) a.length = 0

        return { c, d: dirs, a }
    }

    private doParseBond({
        requirePrefix = false,
        parsedBonds = [],
        self,
        dirFrom
    }: {
        requirePrefix?: boolean
        parsedBonds?: Bond[]
        self: Struct
        dirFrom: BondDir | null
    }): Bond | undefined {
        let bond: Bond

        if (! inCharset(this.current, BondCharset)) {
            if (requirePrefix) throw this.expect('prefix-styled bond')
            if (inCharset(this.current, GroupCharset) || this.current === '&' || this.current === '$') {
                const n = this.doParseStruct({ dirFrom: null })
                const { c, d, a } = this.doParseBondType({ isPrefix: false, parsedBonds, dirFrom })
                bond = { c, d, a, n }
            }
            else throw this.expect('bond')
        }
        else {
            const { c, d, a } = this.doParseBondType({ isPrefix: true, parsedBonds, dirFrom })
            const n = this.doParseStruct({ dirFrom: d[0] }) // Note: use the first direction
            bond = { c, d, a, n }
        }
        this.maybeSpace()

        const pd = bond.d.map(d => MathEx.stdAng(d + 180))
        if (bond.n.children.some(({ d: ds }) => ds.some(d => d === pd[0])))
            throw Error(`Duplicated bond direction (${pd[0]}deg, same as parent)`)

        const parent = {
            c: bond.c,
            d: [ ...pd ],
            a: { ...bond.a },
            n: self
        }
        parent.a.side = bond.a.side === 'L' ? 'R' : bond.a.side === 'R' ? 'L' : undefined
        bond.n.parents.push(parent)

        return bond
    }

    private doParseBonds({
        dirFrom,
        self
    }: {
        dirFrom: BondDir | null
        self: Struct
    }): Bond[] {
        const bonds: Bond[] = []

        if (this.current === '[') {
            this.index ++
            this.maybeSpace()
            while (true) {
                bonds.push(this.doParseBond({ parsedBonds: bonds, self, dirFrom })!)
                if (this.current as string === ',') this.index ++
                this.maybeSpace()
                if (this.current as string === ']') {
                    this.index ++
                    this.maybeSpace()
                    break
                }
            }
        }
        if (inCharset(this.current, BondCharset)) {
            const bond = this
                .try(() => this.doParseBond({ parsedBonds: bonds, self, dirFrom }))
                .except('atom group', null)
            if (bond) bonds.push(bond)
        }
        return bonds
    }

    private doParseFuncCall(): FuncCall {
        this.index ++ // Note: skip '$'

        let name = ''
        while (inCharset(this.current, IdentifierCharset)) {
            name += this.current
            this.index ++
        }
        this.maybeSpace()

        const def = this.defs[name]
        if (! def) throw Error(`Unknown func struct "${name}"`)
        if (def.type !== 'chem')
            throw this.expect('func struct of chem type', `${def.type} type`)

        let label
        if (this.current === '\'') label = this.doParseLabelAbbr()

        const a = this.doParseAttr({
            ...def.attr,
            ...FuncCallAttrs
        }).validate({
            abbrLabel: label
        })

        return { d: def, a }
    }

    private labels: Record<string, Struct> = {}
    private readonly groups: Group[] = []

    private doParseLabelAbbr(): string {
        this.index ++ // Note: skip '\''

        let label = ''
        while (inCharset(this.current, IdentifierCharset)) {
            label += this.current
            this.index ++
        }
        if (! label) throw Error('Abbr label cannot be empty.')
        this.maybeSpace()

        return label
    }

    private doParseRef(): Ref {
        this.index ++ // Note: skip '&'

        const names: string[] = []
        let s = ''
        // Todo: ref range
        while (inCharset(this.current, RefNameCharset)) {
            switch (this.current) {
                case ',':
                    names.push(s)
                    s = ''
                    break
                default:
                    s += this.current
            }
            this.index ++
        }
        names.push(s)

        return { l: names }
    }

    private doParseStructHead(): StructHead {
        switch (this.current) {
            case '&':
                return {
                    S: 'ref',
                    node: this.doParseRef()
                }
            case '$':
                return {
                    S: 'func',
                    node: this.doParseFuncCall()
                }
            default:
                return {
                    S: 'chem',
                    node: this.doParseGroup()
                }
        }
    }

    protected doParseStruct({
        dirFrom = null
    }: {
        dirFrom: BondDir | null
    }): Struct {
        const head = this.doParseStructHead()
        this.maybeSpace()

        const struct: Struct = {
            ...head,
            children: null as unknown as Struct['children'],
            parents: []
        }
        struct.children = this.doParseBonds({ self: struct, dirFrom })

        if (head.S === 'chem') {
            const label = head.node.a.ref
            if (label) {
                if (this.labels[label]) throw Error(`Not implemented: shared ref (label '${label}')`)
                else this.labels[label] = struct
            }
        }

        return struct
    }

    private groupId = 0

    protected doParse(): Formula {
        const structs: Struct[] = []
        this.maybeSpace()
        while (true) {
            structs.push(this.doParseStruct({ dirFrom: null }))
            this.maybeSpace()
            if (this.current === ';') {
                this.index ++
                this.maybeSpace()
                if (! this.current) break // Note: allow dangling semicolon
                continue
            }
            else break
        }
        const formula = {
            structs, labels: this.labels, groups: this.groups
        }
        Debug.D('formula: %o', formula)
        return formula
    }
}

function getReader(source: string) {
    let cursor = 0
    return {
        read() {
            const result = source[cursor]
            cursor ++
            return result
        },
        getLast() {
            return source[cursor - 1]
        },
        getCurrent() {
            return source[cursor]
        },
        getNext() {
            return source[cursor + 1]
        },
        get ended() {
            return cursor >= source.length
        }
    }
}

export function tokenizer(input: string) {
    const tokens = []
    let temp = ''
    const reader = getReader(input.trim())
    let depth = 0
    const readUntil = (token: string) => {
        while (reader.getLast() === '`' || reader.getCurrent() !== token[0] || (token[1] && reader.getNext() !== token[1])) {
            if (reader.ended) throw new Error('Unexpected end of input')
            temp += reader.read()
        }
        temp += reader.read()
        if (token.length === 2) temp += reader.read()
    }
    while (! reader.ended) {
        const ch = reader.read()
        if (ch === '(' && reader.getCurrent() === '*') {
            temp += '('
            readUntil('*)')
        }
        else if (ch === '`') {
            temp += '`'
            if (reader.getCurrent() === '{') readUntil('}')
            else temp += reader.read()
        }
        else if (ch === '[') {
            depth ++
            temp += '['
        }
        else if (ch === ']') {
            depth --
            temp += ']'
        }
        else if (ch === '+' && depth === 0) {
            tokens.push(temp.trim())
            temp = ''
            tokens.push('+')
        }
        else if (ch === '-' && reader.getCurrent() === '>' && depth === 0) {
            tokens.push(temp.trim())
            temp = ''
            reader.read()
            tokens.push('->')
        }
        else temp += ch
    }
    if (temp.length) tokens.push(temp.trim())
    return tokens
}
