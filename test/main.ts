import chalk from 'chalk'
import { Debug } from '../src/util.js'
import { ChemParser } from '../src/parse.js'
import { expandAggregateBinds } from '../src/expand.js'

export function testChem(input: string) {
	const parser = new ChemParser(input)

	try {
		const chem = parser.parse()
		console.dir(chem, { depth: Infinity })
		const chemEx = expandAggregateBinds(chem, 0)
		console.dir(chemEx, { depth: Infinity })
	}
	catch (err) {
		Debug.error(
			Debug.on ? (err as Error).stack : err
		)
	}
}
