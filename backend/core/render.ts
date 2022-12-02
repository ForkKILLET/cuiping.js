import type { Group, BondCount } from './parse.js'
import type { ExpandedChem } from './expand.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'

export type LayoutBond = {
	c: BondCount,
	g1: Group,
	g2: Group,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	xo: number
	yo: number
}

export type LayoutGroup = {
	g: Group,
	x: number,
	y: number,
	xo: number,
	yo: number
}

export type Layout = {
	groups: LayoutGroup[],
	bonds: LayoutBond[]
}

export function locate(chem: ExpandedChem, {
	unitLen: u = 30,
	halfFontSize: h = 8
}: {
	unitLen?: number,
	halfFontSize?: number
}): Layout {
	const groups: LayoutGroup[] = []
	const bonds: LayoutBond[] = []

	const dfs = (
		c: ExpandedChem,
		x1: number, y1: number,
		xo: number, yo: number
	) => {
		groups.push({ g: c.g, x: x1, y: y1, xo, yo })

		const w = c.g.t.length * 2
		const cxo = 1 // Note: center offset x, depends on center atom

		c.bonds.forEach(b => {
			// Note: distance to text border
			const xr = MathEx.cosd(b.d) > 0 ? w - cxo : - cxo
			const yr = b.d < 180 ? + 1 : - 1

			const k = yr / xr // Note: slope of the line from center to corner
			const t = MathEx.tand(b.d) // Note: tangent of the bond angle

			const dxo = h * (Math.abs(t) > Math.abs(k)
				? yr / t // Note: yr / dxo = tan d
				: xr)
			const dyo = h * (Math.abs(t) > Math.abs(k)
				? yr
				: (xr + cxo) * t) // Note: dyo / xr = tan d

			const x2 = x1 + MathEx.cosd(b.d) * u
			const cx2 = x1 + MathEx.cosd(b.d) * (u + h)
			const y2 = y1 + MathEx.sind(b.d) * u
			const cy2 = y1 + MathEx.sind(b.d) * (u + h)

			bonds.push({
				g1: b.f, g2: b.t.g,
				x1, y1, x2, y2, xo: xo + cxo * h + dxo, yo: yo + dyo,
				c: b.c
			})

			dfs(
				b.t,
				cx2, cy2,
				xo + dxo,
				yo + dyo,
			)
		})
	}

	dfs(chem, 0, 0, 0, 0)

	return {
		groups,
		bonds
	}
}

export function getViewport(l: Layout, h: number) {
	let xMin = + Infinity, yMin = + Infinity,
		xMax = - Infinity, yMax = - Infinity
	for (const g of l.groups) {
		const y = g.y + g.yo
		if (y < yMin) yMin = y
		if (y > yMax) yMax = y
		const x = g.x + g.xo + g.g.t.length * h * 2 // Note: Calculate right border of text.
		if (x < xMin) xMin = x
		if (x > xMax) xMax = x
	}
	return {
		// Note: text anchor effects x offset and width
		xOffset: - xMin + h * 2,
		yOffset: - yMin,
		width: xMax - xMin + h * 2,
		height: yMax - yMin
	}
}

export type svgRendererOption = {
	unitLen?: number,
	paddingX?: number,
	paddingY?: number,
	displayBonds?: boolean,
	bondPadding?: number,
	bondGap?: number,
	lineBaseColor?: string
	textBaseColor?: string
	halfFontSize?: number
}

export function renderSVG(c: ExpandedChem, opt: svgRendererOption = {}): {
	svg: string,
	width: number,
	height: number
} {
	const l = locate(c, opt)

	const {
		unitLen: u = 30,
		paddingX = 20,
		paddingY = 20,
		displayBonds = true,
		bondPadding: bp = 0,
		bondGap: bg = 2,
		lineBaseColor = 'black',
		textBaseColor = 'black',
		halfFontSize: h = 8
	} = opt

	let svg = ''

	const vp = getViewport(l, h)

	Debug.D(l, vp)

	const width = vp.width + paddingX * 2
	const height = vp.height + paddingY * 2

	const id = `mol-${ (Math.random() * 1e6 | 0) }-${Date.now().toString().slice(- 10)}`

	svg += `<svg id="${id}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
	svg += `<style>`
			+ `#${id} text {`
				+ `dominant-baseline: central;`
				+ `text-anchor: middle;`
				+ `font-size: ${h * 2}px;`
				+ `fill: ${textBaseColor};`
			+ `}`
			+ `#${id} line {`
				+ `stroke: ${lineBaseColor};`
			+ `}`
		+ `</style>`

	const O = { x: 0, y: 0 }
	const X = (x: number) => x + vp.xOffset + paddingX + O.x
	const Y = (y: number) => y + vp.yOffset + paddingY + O.y

	for (const { x, y, xo, yo, g } of l.groups) {
		O.x = xo
		O.y = yo

		if (g.t === '*' || g.t === '.') continue
		let attr = ''
		if (g.a.color ??= g.a.C) {
			attr += `fill="${g.a.color}"`
		}
		for (const [i, ch] of [...g.t].entries()) {
			// Note: plus 1 for text anchor
			svg += `<text x="${X(x + (i * 2 + 1) * h)}" y="${Y(y)}" ${attr}>${ch}</text>`
			if (Debug.on) // Note: text border box
				svg += `<rect x="${X(x + (i * 2) * h)}" y="${Y(y - h)}" width="${h * 2}" height="${h * 2}" stroke="red" fill="transparent"></rect>`
		}
	}

	if (displayBonds) for (let {
		g1, g2, x1, y1, x2, y2, xo, yo, c
	} of l.bonds) {
		O.x = xo
		O.y = yo
	
		if (g1.t !== '.') {
			if (x2 !== x1) x1 += bp * (x2 - x1)
			if (y2 !== y1) y1 += bp * (y2 - y1)
		}
		if (g2.t !== '.') {
			if (x2 !== x1) x2 -= bp * (x2 - x1)
			if (y2 !== y1) y2 -= bp * (y2 - y1)
		}

		if (c === 1) svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}"></line>`
		else if (c === 2) {
			const xg = bg * (y2 - y1) / u
			const yg = bg * (x2 - x1) / u
			svg += `<line x1="${X(x1 - xg)}" y1="${Y(y1 + yg)}" x2="${X(x2 - xg)}" y2="${Y(y2 + yg)}"></line>`
			svg += `<line x1="${X(x1 + xg)}" y1="${Y(y1 - yg)}" x2="${X(x2 + xg)}" y2="${Y(y2 - yg)}"></line>`
		}
		else if (c === 3) {
			const xg = (bg + 1) * (y2 - y1) / u
			const yg = (bg + 1) * (x2 - x1) / u
			svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}"></line>`
			svg += `<line x1="${X(x1 - xg)}" y1="${Y(y1 + yg)}" x2="${X(x2 - xg)}" y2="${Y(y2 + yg)}"></line>`
			svg += `<line x1="${X(x1 + xg)}" y1="${Y(y1 - yg)}" x2="${X(x2 + xg)}" y2="${Y(y2 - yg)}"></line>`
		}
	}

	svg += '</svg>'

	return { svg, width, height }
}
