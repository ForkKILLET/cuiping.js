export type Group = string
export type BindCount = 1 | 2 | 3 
export type BindDir = number
export type Bind = {
	c: BindCount,
	d: BindDir[],
	n: Chem
}

export type Chem = {
	g: Group,
	binds: Bind[] | void
}

export const Dir = {
	right: 0,
	up: 90,
	left: 180,
	down: 270,
	h_rightup: 60,
	h_leftup: 120,
	h_leftdown: 240,
	h_rightdown: 300
}

export abstract class Parser<T> {
	constructor(protected str: string) {}

	protected expect(expect: string, got?: string) {
		return Error(`Expecting ${expect}, but got ${
			got ?? this.current ? `'${this.current}'` : 'end of input'
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

	parse(): T {
		if (this.used) throw Error('Parser is already used.')
		this.used = true
		return this.doParse()
	}

	abstract doParse(opt?: any): T
}

export const GroupCharset
	= 'abcdefghijklmnopqrstuvwxyz'
	+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	+ '0123456789'
	+ '()'
export const BindCountCharset = '=#'
export const BindDirCharset = '-|/\\'
export const BindCharset = BindCountCharset + BindDirCharset
export const BindsCharset = BindCharset + '[]'

export const BindCountTable: Record<string, BindCount> = {
	'=': 2,
	'#': 3
}
export const BindDirTable = {
	'-': 0,
	'/': 60,
	'|': 90,
	'\\': 300
}

export class ChemParser extends Parser<Chem> {
	doParseGroup(): Group {
		let g = ""
		while (GroupCharset.includes(this.current)) {
			g += this.current
			this.index ++
		}

		return g
	}

	doParseBindType(opt: { isPrefix: boolean } = { isPrefix: false }): [ BindCount, BindDir[] ] {
		let c: BindCount = 1
		let dirs: BindDir[] = []
		if (BindCountCharset.includes(this.current)) {
			c = BindCountTable[this.current as keyof typeof BindCountTable]
			this.index ++
		}
		while (BindDirCharset.includes(this.current)) {
			let d = BindDirTable[this.current as keyof typeof BindDirTable]
			if (! opt.isPrefix) d = (d + 180) % 360
			dirs.push(d)
			this.index ++
		}
		if (! dirs.length) this.expect('bind direction')
		return [ c, dirs ]
	}

	doParseBind(opt: { requirePrefix: boolean } = { requirePrefix: false }): Bind {
		console.log('parse bind')
		console.log(this.after)

		if (! BindCharset.includes(this.current)) {
			if (opt.requirePrefix) throw this.expect('prefix-styled bind')
			if (GroupCharset.includes(this.current)) {
				const n = this.doParse()
				const [ c, d ] = this.doParseBindType({ isPrefix: false })
				return { c, d, n }
			}
			else throw this.expect('bind')
		}
		else {
			const [ c, d ] = this.doParseBindType({ isPrefix: true })
			const n = this.doParse({ noBinds: true })
			return { c, d, n }
		}
	}

	doParseBinds(): Bind[] {
		const binds: Bind[] = []

		while (BindsCharset.includes(this.current)) {
			if (this.current === '[') {
				this.index ++
				bindsInBracket: while (true) {
					binds.push(this.doParseBind())
					switch (this.current as string) {
						case ']':
							this.index ++
							break bindsInBracket
						case ',':
							this.index ++
							continue
					}
				}
			}
			else break
		}
		return binds
	}

	doParse(opt: { noBinds: boolean } = { noBinds: false }): Chem {
		const g = this.doParseGroup()
		const binds = opt.noBinds ? [] : this.doParseBinds()
		return {
			g, binds
		}
	}
}
