import type {
	Formula, Struct,
	AttrOfBond, Bond, BondCount, BondDir, Group, ChemStructHead, AttrStructHead, StructHead
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

type ChemOnlyStruct = Struct<ChemStructHead, ChemStructHead, ChemStructHead>

export function combine(formula: Formula): Chem {
	let totalStruct = 0

	function toGraph(struct: Struct): ChemOnlyStruct {
		const { children, parents } = struct

		while (struct.S === 'ref') {
			const refName = struct.node.names[0]
			const target = formula.labels[refName]
			if (! target) throw Error(`Unknown ref &${refName}`)

			// Note: Self -> Ref, Self children -> Ref children, Self parent -> Ref parent
			struct = target
			struct.children.push(...children)
			struct.parents.unshift(...parents)
		}

		if (struct.S === 'attr') throw Error('Not implemented')

		if (! struct.toGraphVisited) totalStruct ++
		struct.toGraphVisited = true

		struct.children.forEach(bond => {
			if (! bond.n.toGraphVisited) {
				bond.n = toGraph(bond.n)
			}
		})

		return struct as ChemOnlyStruct
	}

	let visitedStruct = 0

	function invert(struct: ChemOnlyStruct): ChemOnlyStruct {
		struct.parents.slice(1).forEach(bond => {
			invert(bond.n)
			struct.children.push(bond)
		})
		struct.parents = []
		return struct
	}
	
	function toTree(struct: ChemOnlyStruct): ChemOnlyStruct {
		if (! struct.toTreeVisited) {
			struct.toTreeVisited = true
			visitedStruct ++
		}

		invert(struct)

		struct.children.forEach(bond => {
			if (bond.n.toTreeVisited) {
				bond.n = {
					S: 'chem',
					node: { t: { B: [ { s: '?', w: 1, a: 'base' as const } ], w: 1 }, a: {} },
					children: [],
					parents: [],
					treeId: bond.n.treeId
				}
			}
			else bond.n = toTree(bond.n)
		})

		return struct
	}

	const roots = formula.structs.map(toGraph)
	const one = toTree(roots[0])

	if (visitedStruct !== totalStruct)
		throw Error(`Structs aren't connected. (nodes ${visitedStruct} / ${totalStruct})`)

	function expand(
		struct: Struct<ChemStructHead, ChemStructHead>,
		rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
		depth: number = 0
	): Chem {
		if (struct.S === 'chem') {
			const bonds: ExpandedBond[] = []
			struct.children.forEach(b => {
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

					const t = expand({ ...b.n }, rD, fX, fY, depth + 1)

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
	
	return expand(one)
}
