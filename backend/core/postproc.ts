import type {
	Formula, Struct,
	AttrOfBond, BondCount, BondDir, Group, ChemStructHead, AttrStructHead, StructHead
} from './parse.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'

export type ExpandedBond = {
	c: BondCount,
	d: BondDir,
	t: Chem,
	f: Group,
	a: AttrOfBond
}

export type Chem = {
	g: Group,
	bonds: ExpandedBond[]
}

export type DerefedStruct = Struct<ChemStructHead | AttrStructHead, ChemStructHead | AttrStructHead>

export function combine(formula: Formula): Chem {
	function connect(struct: Struct) {
		const bonds = struct.bonds

		while (struct.S === 'ref') {
			const refName = struct.node.names[0]
			const target = formula.labels[refName]
			if (! target) throw Error(`Unknown ref &${refName}`)
			struct = target
			bonds.push(...target.bonds)
		}

		struct.bonds = bonds
		if (struct.connectVisited) return struct
		struct.connectVisited = true
		
		struct.bonds.forEach(bond => {
			bond.n = connect(bond.n)
		})

		return struct
	}

	let [ first ] = formula.structs
	first = connect(first)

	const willcardGroup = () => ({ g: { t: { B: [ { s: '*', w: 1, a: 'base' as const } ], w: 1 }, a: {} }, bonds: [] })

	function expand(
		struct: DerefedStruct,
		rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
		depth: number = 0
	): Chem {
		struct.expandVisited = true

		if (struct.S === 'chem') {
			const bonds: ExpandedBond[] = []
			struct.bonds.forEach(b => {
				const [ d0 ] = b.d
 
				// Note: expand bond dirs
				b.d.forEach((d, i) => {
					let rD = rotateD
					let fX = flipX
					let fY = flipY

					if (i) {
						if (d + d0 === 360)
							fY = ! fY
						else if (d + d0 === 180)
							fX = ! fX
						else {
							const dd = d - d0
							rD += MathEx.stdAng(flipX === flipY ? dd : - dd)
						}
					}

					d += rotateD
					if (flipX) d = 180 - d
					if (flipY) d = 360 - d
					d = MathEx.stdAng(d)

					Debug.D(
						'>'.repeat(depth + 1) + ' '.repeat(8 * ((depth / 8 | 0) + 1) - depth) +
						'rd %d,\tfx %o,\tfy %o\t-> %d',
						rotateD, flipX, flipY, d
					)

					const t = b.n.expandVisited
						? willcardGroup()
						: expand({ ...b.n }, rD, fX, fY, depth + 1)

					bonds.push({
						c: b.c,
						a: b.a,
						d,
						t,
						f: struct.node
					})
				})
			})
			const chem = {
				g: struct.node,
				bonds
			}
			return chem
		}
		else if (struct.S === 'attr') {
			throw Error('Not implemented')
		}
		throw Error('Not implemented')
	}

	return expand(first as DerefedStruct)
}
