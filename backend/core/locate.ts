import type { Group, BondCount } from './parse.js'
import type { ExpandedChem } from './expand.js'
import { MathEx } from '../utils/math.js'

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
	groups: LayoutGroup[],
	bonds: LayoutBond[],
	offsetX: number,
	offsetY: number,
	width: number,
	height: number
}

export function locate(chem: ExpandedChem): Layout {
	const groups: LayoutGroup[] = []
	const bonds: LayoutBond[] = []
	let xMin = 0, yMin = 0, xMax = 0, yMax = 0

	const dfs = (c: ExpandedChem, x1: number, y1: number) => {
		if (x1 < xMin) xMin = x1
		if (x1 > xMax) xMax = x1
		if (y1 < yMin) yMin = y1
		if (y1 > yMax) yMax = y1

		groups.push({ g: c.g, x: x1, y: y1 })

		c.bonds.forEach(b => {
			const x2 = x1 + MathEx.cosd(b.d)
			const y2 = y1 + MathEx.sind(b.d)

			bonds.push({ x1, y1, x2, y2, c: b.c })

			dfs(b.n, x2, y2)
		})
	}

	dfs(chem, 0, 0)

	return {
		groups,
		bonds,
		offsetX: - xMin,
		offsetY: - yMin,
		width: xMax - xMin,
		height: yMax - yMin
	}
}
