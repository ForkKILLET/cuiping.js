import chalk from 'chalk'
import { Debug } from '../utils/debug.js'
import { ChemParser } from '../core/parse.js'
import { expandAggregateBonds } from '../core/expand.js'

export function testChem(input: string) {
	const parser = new ChemParser(input)

	try {
		const chem = parser.parse()
		console.dir(chem, { depth: Infinity })
		const chemEx = expandAggregateBonds(chem, 0)
		console.dir(chemEx, { depth: Infinity })
	}
	catch (err) {
		Debug.error(
			Debug.on ? (err as Error).stack : err
		)
	}
}
