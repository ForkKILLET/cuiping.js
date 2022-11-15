import chalk from 'chalk'
import { ChemParser } from '../src/parse.js'

export function testChem(input: string) {
	const parser = new ChemParser(input)

	try {
		console.dir(parser.parse(), { depth: Infinity })
	}
	catch (err) {
		console.error(chalk.red(
			process.env.DEBUG ? (err as Error).stack : err
		))
	}
}
