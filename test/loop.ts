#!/bin/env ts-node

import chalk from 'chalk'
import { createInterface } from 'node:readline'
import { Debug } from '../src/util.js'
import { testChem } from './main.js'

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'gcp> '
})

Debug.red = chalk.red
Debug.on = !! process.env.DEBUG

rl.prompt()
rl.on('line', (ln) => {
	testChem(ln)
	rl.prompt()
})
