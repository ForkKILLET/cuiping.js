import type { Group, BondCount, AttrOfBond } from './parse.js'
import type { ExpandedChem } from './expand.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'
import { getWidth } from '../utils/measure.js'

export type LayoutBond = {
	c: BondCount,
	a: AttrOfBond,
	g1: Group,
	g2: Group,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	xo: number,
	yo: number
}

export type LayoutGroup = {
	t: Group['t'],
	a: Group['a'],
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
	halfTextBoxWidth: hw = 8,
	halfTextBoxHeight: hh = 8
}: {
	unitLen?: number,
	halfTextBoxWidth?: number,
	halfTextBoxHeight?: number
}): Layout {
	const groups: LayoutGroup[] = []
	const bonds: LayoutBond[] = []

	const dfs = (
		c: ExpandedChem,
		x1: number, y1: number,
		xo: number, yo: number
	) => {
		groups.push({ ...c.g, x: x1, y: y1, xo, yo })

		const w = c.g.t.w * 2
		const cxo = getWidth(c.g.t[0]) // Note: center offset x, depends on center atom

		c.bonds.forEach(b => {
			// Note: distance to text border
			const xr = MathEx.cosd(b.d) > 0 ? w - cxo : - cxo
			const yr = b.d < 180 ? + 1 : - 1

			const k = yr / xr // Note: slope of the line from center to corner
			const t = MathEx.tand(b.d) // Note: tangent of the bond angle

			const collpased = c.g.t[0] === '.'

			const dxo = collpased
				? 0
				: hw * (Math.abs(t) > Math.abs(k)
					? yr / t // Note: yr / dxo = tan d
					: xr)

			const dyo = collpased
				? 0
				: hh * (Math.abs(t) > Math.abs(k)
					? yr
					: xr * t) // Note: dyo / xr = tan d

			const { t: T } = b.t.g

			const x2 = x1 + MathEx.cosd(b.d) * u
			const cx2 = x1 + MathEx.cosd(b.d) * (u + getWidth(T[0]) * hw)
			const y2 = y1 + MathEx.sind(b.d) * u
			const cy2 = y1 + MathEx.sind(b.d) * (u + (collpased ? 0 : hh))

			const txo = MathEx.cosd(b.d) >= 0 // Note: text offset x of target group
				? 0
				: (- T.w + cxo) * 2 * hw

			bonds.push({
				g1: b.f, g2: b.t.g,
				x1, y1, x2, y2, xo: xo + dxo, yo: yo + dyo,
				c: b.c, a: b.a
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
		const h0 = g.t.w ? h : 0
		const x1 = g.x + g.xo - h0
		const x2 = g.x + g.xo + (g.t.w * 2 - 1) * h0
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

export type SvgRendererOption = {
	unitLen?: number,
	paddingX?: number,
	paddingY?: number,
	displayBonds?: boolean,
	bondGap?: number,
	lineBaseColor?: string,
	textBaseColor?: string,
	halfFontSize?: number,
	halfTextBoxWidth?: number,
	halfTextBoxHeight?: number,
	showTextBox?: boolean
}

export function renderSVG(c: ExpandedChem, opt: SvgRendererOption = {}): {
	svg: string,
	id: string,
	width: number,
	height: number
} {
	const l = locate(c, opt)

	const {
		unitLen: u = 30,
		paddingX = 20,
		paddingY = 20,
		displayBonds = true,
		bondGap: bg = 2,
		lineBaseColor = 'black',
		textBaseColor = 'black',
		halfFontSize = 8,
		halfTextBoxWidth: hw = 8,
		halfTextBoxHeight: hh = 8,
		showTextBox = false
	} = opt

	let svg = ''

	const vp = getViewport(l, hw)

	Debug.D('layout: %o, viewport: %o', l, vp)

	const width = vp.width + paddingX * 2
	const height = vp.height + paddingY * 2

	const id = `mol-${ (Math.random() * 1e6 | 0) }-${Date.now().toString().slice(- 10)}`

	svg += `<svg id="${id}" xmlns="http://www.w3.org/2000/svg" `
		+ `width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
	svg += `<style>`
			+ `#${id} text {`
				+ `dominant-baseline: central;`
				+ `text-anchor: middle;`
				+ `font-size: ${halfFontSize * 2}px;`
				+ `font-family: serif;`
			+ `}`
			+ `#${id} text:not([nobasecolor]) {`
				+ `fill: ${textBaseColor};`
			+ `}`
			+ `#${id} text[number] {`
				+ `font-size: ${halfFontSize * 1.5}px;`
				+ `dominant-baseline: hanging;`
			+ `}`
			+ `#${id} text[bold] {font-weight: bold;}`
			+ `#${id} line:not([nobasecolor]) {`
				+ `stroke: ${lineBaseColor};`
			+ `}`
		+ `</style>`

	const O = { x: 0, y: 0 }
	const X = (x: number) => x + vp.xOffset + paddingX + O.x
	const Y = (y: number) => y + vp.yOffset + paddingY + O.y

	for (const { x, y, xo, yo, t, a } of l.groups) {
		O.x = xo
		O.y = yo

		let w = 0
		for (const s of t) {
			const attr = []
			if (a.color)
				attr.push(`nobasecolor=""`, `fill="${a.color}"`)
			if (a.bold)
				attr.push(`bold=""`)

			const wb = getWidth(s)
			if (w > 0) w += wb / 2
			if (s !== '*' && s !== '.') {
				if (s.match(/\d/)) attr.push('number=""')
				svg += `<text x="${X(x + w * 2 * hw)}" y="${Y(y)}" ${attr.join(' ')}>${s}</text>`
			}
			if (showTextBox) // Note: text box
				svg += `<rect x="${X(x + (w * 2 - wb) * hw)}" y="${Y(y - hh)}" width="${hw * wb * 2 || 1}" height="${hh * 2}" stroke="red" fill="transparent"></rect>`

			w += wb / 2
		}
	}

	if (displayBonds) {
		const ln = (x1: number, y1: number, x2: number, y2: number, attr: string[]) => {
			svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" ${attr.join(' ')}></line>`
		}

		for (let {
			x1, y1, x2, y2, xo, yo, c, a
		} of l.bonds) {
			O.x = xo
			O.y = yo

			const attr: string[] = []
			if (a.color) attr.push('nobasecolor=""', `stroke="${a.color}"`)
		
			if (c === 1) ln(x1, y1, x2, y2, attr)
			else if (c === 2) {
				const xg = bg * (y2 - y1) / u
				const yg = bg * (x2 - x1) / u
				ln(x1 - xg, y1 + xg, x2 - xg, y2 + yg, attr)
				ln(x1 + xg, y1 - xg, x2 + xg, y2 - yg, attr)
			}
			else if (c === 3) {
				const xg = (bg + 1) * (y2 - y1) / u
				const yg = (bg + 1) * (x2 - x1) / u
				ln(x1, y1, x2, y2, attr)
				ln(x1 - xg, y1 + xg, x2 - xg, y2 + yg, attr)
				ln(x1 + xg, y1 - xg, x2 + xg, y2 - yg, attr)
			}
		}
	}

	svg += '</svg>'

	return { svg, id, width, height }
}
