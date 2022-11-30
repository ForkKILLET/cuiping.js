import { Layout } from './locate.js'

export type svgRendererOption = {
	unitLen?: number,
	paddingX?: number,
	paddingY?: number,
	displayBonds?: boolean,
	uBondPadding?: number,
	uBondGap?: number
}

export function renderSVG(l: Layout, {
	unitLen = 30,
	paddingX = 20,
	paddingY = 20,
	displayBonds = true,
	uBondPadding: bp = 0.2,
	uBondGap: bg = 0.08
} : svgRendererOption = {}): {
	svg: string,
	width: number,
	height: number
} {
	let svg = ''

	const width = l.width * unitLen + paddingX * 2
	const height = l.height * unitLen + paddingY * 2

	const id = `mol-${ (Math.random() * 1e6 | 0) }-${Date.now().toString().slice(- 10)}`

	svg += `<svg id="${id}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
	svg += `<style>`
			+ `#${id} text { text-anchor: middle; dominant-baseline: middle; }`
			+ `#${id} line { stroke: black; }`
		+ `</style>`

	const X = (x: number) => (x + l.offsetX) * unitLen + paddingX
	const Y = (y: number) => (y + l.offsetY) * unitLen + paddingY

	for (const { x, y, g } of l.groups) {
		if (g.t === '*' || g.t === '.') continue
		let attr = ''
		if (g.a.color ??= g.a.C) {
			attr += `fill="${g.a.color}"`
		}
		svg += `<text x="${X(x)}" y="${Y(y)}" ${attr}>${g.t}</text>`
	}

	if (displayBonds) for (let { g1, g2, x1, y1, x2, y2, c } of l.bonds) {
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
			const xg = bg * (y2 - y1)
			const yg = bg * (x2 - x1)
			svg += `<line x1="${X(x1 - xg)}" y1="${Y(y1 + yg)}" x2="${X(x2 - xg)}" y2="${Y(y2 + yg)}"></line>`
			svg += `<line x1="${X(x1 + xg)}" y1="${Y(y1 - yg)}" x2="${X(x2 + xg)}" y2="${Y(y2 - yg)}"></line>`
		}
		else if (c === 3) {
			const xg = (bg + 0.1) * (y2 - y1)
			const yg = (bg + 0.1) * (x2 - x1)
			svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}"></line>`
			svg += `<line x1="${X(x1 - xg)}" y1="${Y(y1 + yg)}" x2="${X(x2 - xg)}" y2="${Y(y2 + yg)}"></line>`
			svg += `<line x1="${X(x1 + xg)}" y1="${Y(y1 - yg)}" x2="${X(x2 + xg)}" y2="${Y(y2 - yg)}"></line>`
		}
	}

	svg += '</svg>'

	return { svg, width, height }
}
