#!/bin/env ts-node

import { createInterface } from 'node:readline'
import chalk from 'chalk'
import { Debug } from '../utils/debug.js'
import { testChem } from './main.js'

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'gcp> '
})

Debug.errStyle = chalk.red
Debug.on = !! process.env.DEBUG

rl.prompt()
rl.on('line', (ln) => {
    testChem(ln)
    rl.prompt()
})
