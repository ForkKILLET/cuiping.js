#!/bin/env ts-node

import { ChemParser } from '../src/parse'

const parser = new ChemParser(process.argv[2])

try {
	console.dir(parser.parse(), { depth: 5 })
}
catch (err) {
	console.error('\x1b[31m' + (err as Error).stack + '\x1b[0m\n')
	process.exit(1)
}
