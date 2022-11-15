#!/bin/env ts-node

import { createInterface } from 'node:readline'
import { testChem } from './main.js'

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'gcp> '
})

rl.prompt()
rl.on('line', (ln) => {
	testChem(ln)
	rl.prompt()
})
