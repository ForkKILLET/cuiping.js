import { Debug } from '../utils/debug.js'
import { ChemParser } from '../core/parse.js'
import { combine, expand } from '../core/postproc.js'
import { renderSVG } from '../core/render.js'

export function testChem(input: string) {
    const parser = new ChemParser(input)

    try {
        const formula = parser.parse()
        if (! Debug.on) Debug.O(formula)

        const one = combine(formula)
        if (! Debug.on) Debug.O(one)

        const chem = expand(one)
        if (! Debug.on) Debug.O(chem)

        const svg = renderSVG(chem)
        if (! Debug.on) Debug.O(svg)
    }
    catch (err) {
        if (err instanceof Error) {
            Debug.E(Debug.on ? err.stack : err.message)
        }
    }
}
