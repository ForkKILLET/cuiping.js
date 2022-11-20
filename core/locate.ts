import type { Group, BondCount } from './parse.js'
import type { ExpandedChem } from './expand.js'

export type LayoutBond = {
	c: BondCount,
	x1: number,
	y1: number,
	x2: number,
	y2: number
}

export type LayoutGroup = {
	g: Group,
	x: number,
	y: number
}

export type Layout = {
	groups: Group,
	bonds: LayoutBond[],
	offsetX: number,
	offsetY: number
}

/*
export function locate(chem: ExpandedChem): Layout {
	const groups: LayoutGroup[] = []
	const bonds: LayoutBond[] = []

	groups.push({ g: chem.g, x: 0, y: 0 })

	const dfs = (c: ExpandedChem, x1: number, y1: number) => {
		c.bonds.forEach(b => {
			const x2 = x1 + Math.cos(b.d)
			const y2 = y1 + Math.sin(b.d)
		})
	}
}
*/
