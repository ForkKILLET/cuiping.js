import { group } from 'node:console'
import { Debug } from '../utils/debug.js'
import { MathEx } from '../utils/math.js'
import { getWidth } from '../utils/measure.js'
import type { MaybeArray, TupleToUnion, ValueOf } from '../utils/types'

export abstract class Parser<T> {
	constructor(protected str: string) {}

	protected expect(expect: string, got?: string) {
		return Error(`Expecting ${expect}, but got ${
			got ?? (this.current
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
		return this.str.slice(this.index)
	}

	getStr(): string {
		return this.str
	}

	parse(onError?: (err: Error) => boolean): T | undefined {
		if (this.used) throw Error('Parser is already used.')
		this.used = true
		try {
			const result = this.doParse()
			if (this.index !== this.str.length)
				throw Error(`Unexcepted trailing characters '${this.after}'`)
			Debug.D('parse: %o', result)
			return result
		}
		catch (err) {
			if (onError) {
				if (! onError(err as Error)) throw err
			}
			else throw err
		}
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

	protected abstract doParse(options?: any): T
}

export type AttrOne<R extends AttrSchemaRule> =
	R extends { type: 'string' } ? string :
	R extends { type: 'boolean' } ? boolean :
	R extends { type: 'integer' } ? number :
	never

export type AttrMany<S extends readonly AttrSchemaRule[]> =
	TupleToUnion<{ 
		[L in keyof S]: S[L] extends AttrSchemaRule
			? AttrOne<S[L]>
			: never
	}>

export type AttrMaybeOne<S extends Readonly<ValueOf<AttrSchema>>> =
	S extends readonly AttrSchemaRule[] ? TupleToUnion<{ 
		[L in keyof S]: S[L] extends AttrSchemaRule
			? AttrOne<S[L]>
			: never
	}> :
	S extends AttrSchemaRule ? AttrOne<S> :
	never

export type Attr<S extends AttrSchema> = {
	[K in keyof S]?:
		S[K] extends keyof S
			? S[S[K]] extends MaybeArray<AttrSchemaRule>
				? AttrMaybeOne<S[S[K]]>
				: never
			: S[K] extends Readonly<MaybeArray<AttrSchemaRule>>
				? AttrMaybeOne<S[K]>
				: never
}

export type AttrOfGroup = Attr<typeof GroupAttrs>
export type AttrOfBond = Attr<typeof BondAttrs>

export type AttrValidatorParams = {
	group?: Group,
	bondType?: BondType
}

export type AttrValidator =
	((raw: Attr<any>, params: AttrValidatorParams) => void)

export type AttrSchemaRule = Readonly<({
	type: 'boolean'
} | {
	type: 'integer',
	min?: number,
	max?: number
} | {
	type: 'string'
}) & {
	validate?: AttrValidator
}>

export type AttrSchema = Readonly<Record<string, string | Readonly<MaybeArray<AttrSchemaRule>>>>

export type Group = {
	t: string[] & { w: number }
	a: AttrOfGroup
}
export type BondCount = 1 | 2 | 3 
export type BondDir = number
export type Bond = {
	c: BondCount,
	d: BondDir[],
	n: Struct,
	a: AttrOfBond,
	i: number // Note: index of connected atom
}
export type BondType = { c: BondCount, d: BondDir[], a: AttrOfBond }

export type Struct = ChemStruct | AttrStruct

export type ChemStruct = {
	S: 'chem',
	g: Group,
	bonds: Bond[]
}

export const IdentifierCharset
	= 'abcdefghijklmnopqrstuvwxyz'
	+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	+ '0123456789'
export const GroupCharset
	= IdentifierCharset
	+ '()'
	+ '*' // Note: willcard
	+ '.' // Note: collpased carbon
export const BondCountCharset = '=#'
export const BondDirCharset = '-|/\\+'
export const BondDirModifierCharset = '!'
export const BondCharset = BondCountCharset + BondDirCharset + BondDirModifierCharset

export const BondCountTable: Record<string, BondCount> = {
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

export const GroupAttrs = {
	color: { type: 'string' },
	C: 'color',
	bold: { type: 'boolean' },
	B: 'bold',
	ref: { type: 'integer' },
	'&': 'ref'
} as const

const coordinateBondValidator: AttrValidator = ((attr, { bondType }) => {
	const a = attr as AttrOfBond
	const cc = (a.from ?? a.to) as number
	const { c } = bondType!
	if (cc > c)
		throw Error(`Coordinated bonds (${cc}) more than total bonds (${c}).`)
})

export const BondAttrs = {
	color: { type: 'string' },
	C: 'color',
	highEnergy: { type: 'boolean' },
	HE: 'highEnergy',
	'~': 'highEnergy',
	from: [
		{ type: 'boolean' },
		{
			type: 'integer', min: 1, max: 3,
			validate: coordinateBondValidator
		}
	],
	'<': 'from',
	to: [
		{ type: 'boolean' },
		{
			type: 'integer', min: 1, max: 3,
			validate: coordinateBondValidator
		}
	],
	'>': 'to'
} as const

export type AttrStruct = {
	S: 'attr',
	d: AttrStructDef,
	a: Attr<any>
}

export type ChemDef = {

}

export type AttrStructDef = {
	type: 'chem',
	attr: AttrSchema,
	chem: ChemDef
} | {
	type: 'void',
	attr: AttrSchema
}

export type AttrStructDefs = Record<string, AttrStructDef>

const isAttribute = (k: string, attrSchema: AttrSchema): k is keyof typeof attrSchema => {
	return k in attrSchema
}

export type AttrToValidate<T extends AttrSchema> = {
	raw: Attr<T>,
	validate: (params: AttrValidatorParams) => Attr<T>
}

export class ChemParser extends Parser<Struct> {
	constructor(str: string, private defs: AttrStructDefs = {}) {
		super(str.replace(/\s/g, ''))
	}

	private doParseAttr<T extends AttrSchema>(attrSchema: T): AttrToValidate<T> {
		this.index ++ // Note: skip '{'

		let vf: AttrValidator

		const a: Record<string, string | boolean> = {}
		let k = ''
		let readingValue = false
		attr: while (this.current) {
			switch (this.current as string) {
				case '}':
					if (! readingValue) {
						if (! k) throw Error('Attributes mustn\'t be empty.')
						a[k] = true
					}
					break attr
				case ':':
					readingValue = true
					a[k] = ''
					break
				case ',':
					if (! readingValue) a[k] = true
					k = ''
					readingValue = false
					break
				default:
					if (readingValue) a[k] += this.current
					else k += this.current
			}
			this.index ++
		}
		if (! this.current) throw this.expect(`delimiter '}' of attributes`)
		this.index ++

		Debug.D('attr: %o', a)

		for (const k in a) {
			if (isAttribute(k, attrSchema)) {
				let ss = attrSchema[k]
				if (typeof ss === 'string') {
					a[ss] = a[k]
					ss = attrSchema[ss] as Readonly<AttrSchemaRule>
				}
				if (! Array.isArray(ss)) ss = [ ss as AttrSchemaRule ]
				const tyNow = typeof a[k]
				let tyMatched = false
				let tyError: string | undefined
				typeCheck: for (const s of ss as AttrSchemaRule[]) {
					const ty = s.type
					if (
						tyNow === ty ||
						(tyNow === 'string' && a[k] && ! isNaN(+ a[k]) && ty === 'integer')
					) {
						switch (ty) {
							case 'integer':
								if (! Number.isInteger(+ a[k])) {
									tyError = 'not integer'
									break typeCheck
								}
								if (s.min !== undefined && + a[k] < s.min) {
									tyError = `less than min value ${s.min}`
									break typeCheck
								}
								if (s.max !== undefined && + a[k] > s.max) {
									tyError = `greater than max value ${s.max}`
									break typeCheck
								}
						}
						if (s.validate) vf = s.validate
						tyMatched = true
						break
					}
				}
				if (! tyMatched)
					throw this.expect(`attribute '${k}' to be ${
						ss.map(s => s.type).join(' or ')
					} type`, a[k] + (tyError ? ': ' + tyError : ''))
			}
			else throw Error(`Unknown attribute '${k}'.`)
		}

		return {
			raw: a as Attr<T>,
			validate(params: AttrValidatorParams) {
				vf?.(this.raw, params)
				return this.raw
			}
		}
	}
	
	private doParseGroup(): Group {
		let s = ''
		while (GroupCharset.includes(this.current)) {
			s += this.current
			this.index ++
		}

		if (! s) throw this.expect('atom group')
		if (s.includes('*') && s.length > 1)
			throw Error(`Willcard groups mustn't include any characters except '*'`)
		if (s.includes('.') && s.length > 1)
			throw Error(`Collpased carbon mustn't include any characters except '.'`)

		const t = Object.assign([] as string[], { w: 0 })

		for (const [ i, ch ] of [...s].entries()) {
			if (i && (
				s[i - 1].match(/[A-Z]/) && ch.match(/[a-z]/)
			)) {
				t[t.length - 1] += ch
				continue
			}
			t.push(ch)
		}

		t.w = t.reduce((w, ch) => w + getWidth(ch), 0)

		let a
		if (this.current === '{') {
			a = this.doParseAttr(GroupAttrs)
			a = a.validate({ group: { t, a: a.raw } })
		}
		else a = {}

		return { t, a }
	}

	private checkDupBondDir(
		parsedBonds: Bond[],
		currentDirs: BondDir[],
		dirFrom: BondDir | null,
		dir: BondDir
	) {
		return currentDirs.includes(dir)
			|| parsedBonds.some(({ d: dirs }) => dirs.includes(dir))
			|| dir === dirFrom
	}

	private doParseBondType({
		isPrefix = false,
		parsedBonds = [],
		dirFrom = null
	}: {
		isPrefix?: boolean,
		parsedBonds?: Bond[],
		dirFrom?: BondDir | null
	} = {}): BondType {
		let c: BondCount = 1
		const dirs: BondDir[] = []

		const plus180Deg = this.current === '!'
		if (plus180Deg) this.index ++

		if (BondCountCharset.includes(this.current)) {
			c = BondCountTable[this.current as keyof typeof BondCountTable]
			this.index ++
		}

		const noImplictDir = ! BondDirCharset.includes(this.current)
		const auto0Deg = noImplictDir && c > 1
		const auto180Deg = noImplictDir && plus180Deg

		while (BondDirCharset.includes(this.current) || auto0Deg || auto180Deg) {
			const ds = []
			if (auto0Deg || auto180Deg) ds.push(0)
			else ds.push(...BondDirTable[this.current as keyof typeof BondDirTable])

			for (let d of ds) {
				if (plus180Deg) d = MathEx.stdAng(d + 180)
				if (! isPrefix) d = MathEx.stdAng(d + 180)
				if (dirs.includes(d)) d = MathEx.stdAng(d + 180)

				if (this.checkDupBondDir(parsedBonds, dirs, dirFrom, d))
					throw Error(`Duplicated bond direction (${ds} deg)`)

				dirs.push(d)
			}

			if (auto0Deg || auto180Deg) break
			this.index ++
		}
		if (! dirs.length) {
			throw this.expect('at least one bond direction')
		}

		let a
		if (this.current === '{') {
			a = this.doParseAttr(BondAttrs)
			a = a.validate({ bondType: { c, d: dirs, a: a.raw } })
		}
		else a = {}

		return { c, d: dirs, a }
	}

	private doParseBond({
		requirePrefix = false,
		parsedBonds = [],
		dirFrom = null,
	}: {
		requirePrefix?: boolean,
		parsedBonds?: Bond[],
		dirFrom?: BondDir | null,
	} = {}): Bond | undefined {
		if (! BondCharset.includes(this.current)) {
			if (requirePrefix) throw this.expect('prefix-styled bond')
			if (GroupCharset.includes(this.current)) {
				const n = this.doParse()
				const { c, d, a } = this.doParseBondType({ isPrefix: false, parsedBonds, dirFrom })
				return { c, d, n, a, i: 0 }
			}
			else throw this.expect('bond')
		}
		else {
			const { c, d, a } = this.doParseBondType({ isPrefix: true, parsedBonds, dirFrom })
			const n = this.doParse()
			return { c, d, n, a, i: 0 }
		}
	}

	private doParseBonds({
		dirFrom = null,
	}: {
		dirFrom?: BondDir | null,
	}): Bond[] {
		const bonds: Bond[] = []

		if (this.current === '[') {
			this.index ++
			bondsInBracket: while (true) {
				bonds.push(this.doParseBond({ parsedBonds: bonds, dirFrom })!)
				switch (this.current as string) {
					case ']':
						this.index ++
						break bondsInBracket
					case ',':
						this.index ++
						continue
				}
			}
		}
		if (BondCharset.includes(this.current)) {
			const bond = this
				.try(() => this.doParseBond({ parsedBonds: bonds, dirFrom }))
				.except('atom group', null)
			if (bond) bonds.push(bond)
		}
		return bonds
	}

	private doParseAttrStruct(): AttrStruct {
		this.index ++ // Note: skip '$'

		let name = ''
		while (IdentifierCharset.includes(this.current)) {
			name += this.current
			this.index ++
		}

		const def = this.defs[name]
		if (! def) throw Error(`Unknown attr struct "${name}"`)
		if (def.type !== 'chem')
			throw this.expect('attr struct in chem type', `${def.type} type`)

		const a = this.current === '{'
			? this.doParseAttr({ ...GroupAttrs, ...def.attr })
			: {}

		return { S: 'attr', d: def, a }
	}

	protected doParse({
		dirFrom = null
	}: {
		dirFrom?: BondDir | null
	} = {}): Struct {
		if (this.current === '$') {
			return this.doParseAttrStruct()
		}

		const g = this.doParseGroup()
		const bonds = this.doParseBonds({ dirFrom })
		return {
			S: 'chem', g, bonds
		}
	}
}
