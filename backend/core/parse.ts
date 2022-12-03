import { Debug } from '../utils/debug.js'
import { MathEx } from '../utils/math.js'
import { getWidth } from '../utils/measure.js'

export type Group = {
	t: string[] & { w: number }
	// Note:
	// each item contains the characters in one border box
	// w: relative text width
	a: Record<string, string | boolean>
}
export type BondCount = 1 | 2 | 3 
export type BondDir = number
export type Bond = {
	c: BondCount,
	d: BondDir[],
	n: Chem,
	i: number // Note: index of connected atom
}

export type Chem = {
	g: Group,
	bonds: Bond[]
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

export const GroupCharset
	= 'abcdefghijklmnopqrstuvwxyz'
	+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	+ '0123456789'
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

export const Attributes = {
	color: { type: 'string' },
	C: 'color',
	bold: { type: 'boolean' },
	B: 'bold'
} as const

const isAttribute = (k: string): k is keyof typeof Attributes => {
	return k in Attributes
}

export class ChemParser extends Parser<Chem> {
	constructor(str: string) {
		super(str.replace(/\s/g, ''))
	}

	private doParseGroup(): Group {
		let s = ''
		while (GroupCharset.includes(this.current)) {
			s += this.current
			this.index ++
		}

		const a: Record<string, string | boolean> = {}
		if (this.current === '<') {
			this.index ++
			let k = ''
			let readingValue = false
			attr: while (this.current) {
				switch (this.current as string) {
					case '>':
						if (! readingValue) a[k] = true
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
			if (! this.current) throw this.expect(`delimiter '>' of attribute`)
			this.index ++
		}

		Debug.D('attr: %o', a)

		for (const k in a) {
			if (isAttribute(k)) {
				let ak = Attributes[k]
				if (typeof ak === 'string') {
					a[ak] = a[k]
					ak = Attributes[ak]
				}
				const ty = ak.type
				const tyNow = typeof a[k]
				if (tyNow !== ty) throw this.expect(`group atrribute '${k}' to be ${ty} type`, tyNow)
			}
			else throw Error(`Unknown group attribute '${k}'.`)
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
	} = {}): [ BondCount, BondDir[] ] {
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
				if (! isPrefix || dirs.includes(d)) d = MathEx.stdAng(d + 180)

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
		return [ c, dirs ]
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
				const [ c, d ] = this.doParseBondType({ isPrefix: false, parsedBonds, dirFrom })
				return { c, d, n, i: 0 }
			}
			else throw this.expect('bond')
		}
		else {
			const [ c, d ] = this.doParseBondType({ isPrefix: true, parsedBonds, dirFrom })
			const n = this.doParse()
			return { c, d, n, i: 0 }
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

	protected doParse({
		dirFrom = null
	}: {
		dirFrom?: BondDir | null
	} = {}): Chem {
		const g = this.doParseGroup()
		const bonds = this.doParseBonds({ dirFrom })
		return {
			g, bonds
		}
	}
}
