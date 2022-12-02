import type { Group, BondCount } from './parse.js'
import type { ExpandedChem } from './expand.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'
import { getWidth } from '../utils/measure.js'

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
	halfFontBorder: h = 8
}: {
	unitLen?: number,
	halfFontBorder?: number
}): Layout {
	const groups: LayoutGroup[] = []
	const bonds: LayoutBond[] = []

	const dfs = (
		c: ExpandedChem,
		x1: number, y1: number,
		xo: number, yo: number
	) => {
		groups.push({ g: c.g, x: x1, y: y1, xo, yo })

		const w = c.g.t.w * 2
		const cxo = getWidth(c.g.t[0]) // Note: center offset x, depends on center atom

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
				: xr * t) // Note: dyo / xr = tan d

			const { t: T } = b.t.g

			const x2 = x1 + MathEx.cosd(b.d) * u
			const cx2 = x1 + MathEx.cosd(b.d) * (u + getWidth(T[0]) * h)
			const y2 = y1 + MathEx.sind(b.d) * u
			const cy2 = y1 + MathEx.sind(b.d) * (u + h)

			const txo = MathEx.cosd(b.d) >= 0 // Note: text offset x of target group
				? 0
				: (- T.w + cxo) * 2 * h

			bonds.push({
				g1: b.f, g2: b.t.g,
				x1, y1, x2, y2, xo: xo + dxo, yo: yo + dyo,
				c: b.c
			})

			dfs(
				b.t,
				cx2, cy2,
				xo + dxo + txo,
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
		// Note: calculate border of text
		const x1 = g.x + g.xo - h
		const x2 = g.x + g.xo + (g.g.t.w * 2 - 1) * h
		if (x1 < xMin) xMin = x1
		if (x2 > xMax) xMax = x2
	}
	return {
		xMin, yMin, xMax, yMax,
		xOffset: - xMin,
		yOffset: - yMin,
		width: xMax - xMin,
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
	halfFontBorder?: number
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
		halfFontSize = 8,
		halfFontBorder: h = 8
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
				+ `font-size: ${halfFontSize * 2}px;`
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

		if (g.t[0] === '*' || g.t[0] === '.') continue
		let attr = ''
		if (g.a.color ??= g.a.C) {
			attr += `fill="${g.a.color}"`
		}

		let w = 0
		for (const s of g.t) {
			const wb = getWidth(s)
			if (w > 0) w += wb / 2
			svg += `<text x="${X(x + w * 2 * h)}" y="${Y(y)}" ${attr}>${s}</text>`
			if (Debug.on) // Note: text border box
				svg += `<rect x="${X(x + (w * 2 - wb) * h)}" y="${Y(y - h)}" width="${h * wb * 2}" height="${h * 2}" stroke="red" fill="transparent"></rect>`
			w += wb / 2
		}
	}

	if (displayBonds) for (let {
		g1, g2, x1, y1, x2, y2, xo, yo, c
	} of l.bonds) {
		O.x = xo
		O.y = yo
	
		if (g1.t[0] !== '.') {
			if (x2 !== x1) x1 += bp * (x2 - x1)
			if (y2 !== y1) y1 += bp * (y2 - y1)
		}
		if (g2.t[0] !== '.') {
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
