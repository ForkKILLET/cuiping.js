import { MathEx } from '../utils/math.js'

export type Group = string
export type BondCount = 1 | 2 | 3 
export type BondDir = number
export type Bond = {
	c: BondCount,
	d: BondDir[],
	n: Chem
}

export type Chem = {
	g: Group,
	bonds: Bond[]
}

export abstract class Parser<T> {
	constructor(protected str: string) {}

	protected expect(expect: string, got?: string) {
		return Error(`Expecting ${expect}, but got ${
			got ?? this.current
				? `'${this.current}'`
				: 'end of input'
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

	parse(onError?: (err: Error) => boolean): T | void {
		if (this.used) throw Error('Parser is already used.')
		this.used = true
		try {
			return this.doParse()
		}
		catch (err) {
			if (onError) {
				if (! onError(err as Error)) throw err
			}
			else throw err
		}
	}

	protected abstract doParse(options?: any): T
}

export const GroupCharset
	= 'abcdefghijklmnopqrstuvwxyz'
	+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	+ '0123456789'
	+ '()'
export const BondCountCharset = '=#'
export const BondDirCharset = '-|/\\'
export const BondCharset = BondCountCharset + BondDirCharset
export const BondsCharset = BondCharset + '[]'

export const BondCountTable: Record<string, BondCount> = {
	'=': 2,
	'#': 3
}
export const BondDirTable = {
	'-': 0,
	// Note: The y-axis of SVG is top-to-bottom.
	'/': 300,
	'|': 270,
	'\\': 60
}

export class ChemParser extends Parser<Chem> {
	private doParseGroup(): Group {
		let g = ''
		while (GroupCharset.includes(this.current)) {
			g += this.current
			this.index ++
		}

		if (! g) throw this.expect('atom group')

		return g
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
		let dirs: BondDir[] = []
		if (BondCountCharset.includes(this.current)) {
			c = BondCountTable[this.current as keyof typeof BondCountTable]
			this.index ++
		}
		while (BondDirCharset.includes(this.current)) {
			let d = BondDirTable[this.current as keyof typeof BondDirTable]
			if (! isPrefix || dirs.includes(d))
				d = MathEx.stdAng(d + 180)
			if (this.checkDupBondDir(parsedBonds, dirs, dirFrom, d))
				throw Error(`Duplicated bond direction (${d} deg)`)
			dirs.push(d)
			this.index ++
		}
		if (! dirs.length) throw this.expect('at least one bond direction')
		return [ c, dirs ]
	}

	private doParseBond({
		requirePrefix = false,
		parsedBonds = [],
		dirFrom = null
	}: {
		requirePrefix?: false,
		parsedBonds?: Bond[],
		dirFrom?: BondDir | null
	} = {}): Bond {
		if (! BondCharset.includes(this.current)) {
			if (requirePrefix) throw this.expect('prefix-styled bond')
			if (GroupCharset.includes(this.current)) {
				const n = this.doParse({})
				const [ c, d ] = this.doParseBondType({ isPrefix: false, parsedBonds, dirFrom })
				return { c, d, n }
			}
			else throw this.expect('bond')
		}
		else {
			const [ c, d ] = this.doParseBondType({ isPrefix: true, parsedBonds, dirFrom })
			const n = this.doParse()
			return { c, d, n }
		}
	}

	private doParseBonds({
		dirFrom = null
	}: {
		dirFrom?: BondDir | null
	}): Bond[] {
		const bonds: Bond[] = []

		while (BondsCharset.includes(this.current)) {
			if (this.current === '[') {
				this.index ++
				bondsInBracket: while (true) {
					bonds.push(this.doParseBond({ parsedBonds: bonds, dirFrom }))
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
			else break
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
