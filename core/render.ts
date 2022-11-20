import { Layout } from './locate.js'

export type svgRendererOption = {
	unitLen?: number,
	offsetX?: number,
	offsetY?: number,
	displayBonds?: boolean,
	bondPadding?: number
}

export function renderSVG(l: Layout, {
	unitLen = 30,
	offsetX = 0,
	offsetY = 20,
	displayBonds = true,
	bondPadding = 5
} : svgRendererOption = {}): string {
	let svg = `<svg xmlns="http://www.w3.org/2000/svg">`

	const X = (x: number) => (x + l.offsetX) * unitLen + offsetX
	const Y = (y: number) => (y + l.offsetY) * unitLen + offsetY

	for (const { x, y, g } of l.groups) {
		svg += `<text x="${X(x)}" y="${Y(y)}">${g}</text>`
	}

	if (displayBonds) for (const { x1, y1, x2, y2 } of l.bonds) {
		svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="black"></line>`
	}

	svg += '</svg>'

	return svg
}
