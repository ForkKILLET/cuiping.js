import { Debug } from '../utils/debug.js'
import { ChemParser } from '../core/parse.js'
import { expand } from '../core/expand.js'
import { renderSVG } from '../core/render.js'

export function testChem(input: string) {
	const parser = new ChemParser(input)

	const chem = parser.parse((err) => {
		Debug.E(
			Debug.on ? (err as Error).stack : err
		)
		return true
	})
	if (chem) Debug.O(chem)
	else return

	const chemEx = expand(chem, 0)
	Debug.O(chemEx)

	const svg = renderSVG(chemEx)
	Debug.O(svg)
}
