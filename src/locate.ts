import type { Chem, Group, BindCount } from './parse.js'

export type LayoutBind = {
	c: BindCount,
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
	binds: LayoutBind[],
	offsetX: number,
	offsetY: number
}

/*
export function locate(chem: Chem): Layout {
	const groups: LayoutGroup[] = []
	const binds: LayoutBind[] = []

	groups.push({ g: chem.g, x: 0, y: 0 })

	const dfs = (c: Chem, x1: number, y1: number) => {
		c.binds.forEach(b => {
			const x2 = x1 + Math.cos(b.d)
		})
	}
}
*/
