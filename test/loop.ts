#!/bin/env ts-node

import { createInterface } from 'node:readline'
import { ChemParser } from '../src/parse'

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'cp> '
})

rl.prompt()
rl.on('line', (ln) => {
	try {
		const parser = new ChemParser(ln)
		console.dir(parser.parse(), { depth: 5 })
	}
	catch (err) {
		console.error('\x1b[31m' + (err as Error).stack + '\x1b[0m\n')
	}
	rl.prompt()
})
