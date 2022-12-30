import { Debug } from '../utils/debug.js'
import { MathEx } from '../utils/math.js'
import { getWidth } from '../utils/measure.js'
import type { MaybeArray, TupleToUnion, ValueOf } from '../utils/types'

export const IdentifierCharset
	= 'abcdefghijklmnopqrstuvwxyz'
	+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	+ '0123456789'
export const RefNameCharset = IdentifierCharset + '.,'
export const GroupCharset
	= IdentifierCharset
	+ '^_'
	+ '()'
	+ '*' // Note: willcard
	+ '.' // Note: collpased carbon
export const BondCountCharset = '=#'
export const BondDirCharset = '-|/\\+'
export const BondDirModifierCharset = '!'
export const BondCharset = BondCountCharset + BondDirCharset + BondDirModifierCharset

export type Formula = {
	structs: Struct[],
	structNums: number,
	labels: Record<string, [Struct, number] | undefined>
}

export type StructHead = ChemStructHead | RefStructHead | AttrStructHead
export type Struct<
	H extends StructHead = StructHead, C extends StructHead = StructHead
> = H & {
	bonds: Bond<C>[]
	[key: `${string}Visited`]: boolean | undefined
}
export type ChemStructHead = {
	S: 'chem',
	node: Group
}
export type RefStructHead = {
	S: 'ref',
	node: Ref
}
export type AttrStructHead = {
	S: 'attr',
	node: AttrCall
}

export type Ref = {
	names: string[]
}

export type AttrCall = {
	d: AttrStructDef,
	a: Attr<any>
}
export type ChemDef = {}

export type Group = {
	t: GroupTypeset
	a: AttrOfGroup
}
export type GroupTypesetAlign = 'base' | 'sub' | 'sup'
export type GroupTypesetBox = {
	s: string,
	w: number,
	a: GroupTypesetAlign
}
export type GroupTypeset = {
	B: GroupTypesetBox[],
	w: number
}

export type BondCount = 1 | 2 | 3 
export type BondDir = number
export type Bond<H extends StructHead = StructHead> = {
	c: BondCount,
	d: BondDir[],
	n: Struct<H, H>,
	a: AttrOfBond,
	i: number // Note: index of connected atom
}
export type BondType = { c: BondCount, d: BondDir[], a: AttrOfBond }

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
	ref: { type: 'string' },
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
export type AttrOfGroup = Attr<typeof GroupAttrs>
export type AttrOfBond = Attr<typeof BondAttrs>

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

	protected abstract doParse(options?: any): T
}

export class ChemParser extends Parser<Formula> {
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
		let r = '', s = ''

		const boxes: GroupTypesetBox[] = []
		let alignShort = false, alignLong = false
		let align: GroupTypesetAlign = 'base'

		const eatChar = () => {
			if (! s) return
			let w = getWidth(s)
			if (align !== 'base') w /= 2
			boxes.push({ s, w, a: align })
		}

		while (
			this.current &&
			(GroupCharset.includes(this.current) || alignShort || alignLong)
		) {
			const ch = this.current

			if (ch === '^' || ch === '_') {
				eatChar()
				s = ''

				align = ch === '^' ? 'sup' : 'sub'
				if (this.after[0] === '(') {
					alignLong = true
					this.index ++
				}
				else alignShort = true
			}
			else if (ch === ')' && alignLong) alignLong = false
			else {
				if (! alignShort &&
					s[0] >= 'A' && s[0] <= 'Z' && ch >= 'a' && ch <= 'z'
				) s += ch
				else {
					eatChar()
	
					s = ch

					if (alignShort) alignShort = false
					else if (! alignLong) {
						if (ch >= '0' && ch <= '9') align = 'sub'
						else if (align !== 'base') align = 'base'
					}
				}
			}

			r += ch
			this.index ++
		}

		eatChar()

		if (alignLong) throw Error(`Unclosed ${align}script in group typeset '${r}'`)

		if (! r) throw this.expect('atom group')
		if (r.includes('*') && r.length > 1)
			throw Error(`Willcard groups mustn't include any characters except '*'`)
		if (r.includes('.') && r.length > 1)
			throw Error(`Collpased carbon mustn't include any characters except '.'`)

		const t: GroupTypeset = {
			B: boxes,
			w: boxes.reduce((w, B) => w + B.w, 0)
		}

		Debug.D('group typeset: %s -> %o', r, t)

		let a
		if (this.current === '{') {
			a = this.doParseAttr(GroupAttrs)
			a = a.validate({ group: { t, a: a.raw } })
		}
		else a = {}

		const group = { t, a }

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

	private doParseBondType({
		isPrefix = false,
		parsedBonds = [],
	}: {
		isPrefix?: boolean,
		parsedBonds?: Bond[],
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

				if (this.checkDupBondDir(parsedBonds, dirs, d))
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
	}: {
		requirePrefix?: boolean,
		parsedBonds?: Bond[],
	} = {}): Bond | undefined {
		if (! BondCharset.includes(this.current)) {
			if (requirePrefix) throw this.expect('prefix-styled bond')
			if (GroupCharset.includes(this.current)) {
				const n = this.doParseStruct()
				const { c, d, a } = this.doParseBondType({ isPrefix: false, parsedBonds })
				return { c, d, n, a, i: 0 }
			}
			else throw this.expect('bond')
		}
		else {
			const { c, d, a } = this.doParseBondType({ isPrefix: true, parsedBonds })
			const n = this.doParseStruct()
			return { c, d, n, a, i: 0 }
		}
	}

	private doParseBonds(): Bond[] {
		const bonds: Bond[] = []

		if (this.current === '[') {
			this.index ++
			bondsInBracket: while (true) {
				bonds.push(this.doParseBond({ parsedBonds: bonds })!)
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
				.try(() => this.doParseBond({ parsedBonds: bonds }))
				.except('atom group', null)
			if (bond) bonds.push(bond)
		}
		return bonds
	}

	private doParseAttrCall(): AttrCall {
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

		return { d: def, a }
	}

	private labels: Record<string, [Struct, number]> = {}

	private doParseRef(): Ref {
		this.index ++ // Note: skip '&'

		const names: string[] = []
		let s = ''
		// Todo: ref range
		while (RefNameCharset.includes(this.current)) {
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

		return { names }
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
					S: 'attr',
					node: this.doParseAttrCall()
				}
			default:
				return {
					S: 'chem',
					node: this.doParseGroup()
				}
		}
	}

	protected doParseStruct(): Struct {
		const head = this.doParseStructHead()
		const struct: Struct = { ...head, bonds: this.doParseBonds() }
		if (head.S === 'chem' && head.node.a.ref) {
			this.labels[head.node.a.ref] = [struct, this.structId]
		}
		return struct
	}

	private structId = 0

	protected doParse(): Formula {
		const structs: Struct[] = []
		while (true) {
			structs.push(this.doParseStruct())
			if (this.current === ';') {
				this.index ++
				this.structId ++
				continue
			}
			else break
		}
		const formula = {
			structs, labels: this.labels, structNums: this.structId + 1
		}
		Debug.D('formula: %o', formula)
		return formula
	}
}
