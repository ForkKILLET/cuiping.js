#!/bin/env ts-node

import chalk from 'chalk'
import { render } from '../core/index.js'
import testcases from './testcases.js'

const verbose = !! process.env.VERBOSE
const digit = testcases.length.toString().length
let total = 0
let failed = 0

console.log('TEST starting')

testcases.forEach((v, i) => {
    if (typeof v === 'string') {
        console.log('TEST group: ' + chalk.whiteBright.bold(v))
        return
    }

    const [ molecule, answer ] = v
    total ++
    const moleculeMsg = '[ ' + chalk.blueBright(molecule.replace(/\n/g, ' ')) + ' ] '
    const indexMsg = total.toString().padStart(digit)
    const passedMsg = chalk.greenBright.bold(`CASE ${indexMsg} passed: `) + moleculeMsg
    const failedMsg = chalk.redBright.bold(`CASE ${indexMsg} failed: `) + moleculeMsg

    let thisFailed = false
    const fail = () => {
        thisFailed = true
        failed ++
    }

    const result = render(molecule, {
        onError: err => {
            if (typeof answer === 'string') {
                console.log(failedMsg + 'unexpected error')
                fail()
            }
            else if (answer.message === err.message) {
                console.log(passedMsg + 'correct error')
            }
            else {
                console.log(failedMsg + 'wrong error')
                fail()
            }
            if (verbose && thisFailed) {
                console.debug('expect: ' + chalk.gray(typeof answer === 'string' ? answer : answer.message))
                console.debug('got   : ' + chalk.gray(err.message))
            }
        },
        renderer: 'svg',
        rendererOptions: {}
    })

    if (! result) return

    const output = result.svg
        .replace(/ id="mol-\d+-\d+" xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '')
        .replace(/<style>.+?<\/style>/, '')

    if (typeof answer === 'string') {
        if (output === answer) {
            console.log(passedMsg + 'correct output')
        }
        else {
            console.log(failedMsg + 'wrong output')
            fail()
        }
    }
    else {
        console.log(failedMsg + 'unexpected output')
    }

    if (verbose && thisFailed) {
        console.debug('expect: ' + chalk.gray(answer))
        console.debug('got   : ' + chalk.gray(output))
    }
})

const succeeded = total - failed

console.log('TEST finished')
console.log((failed
    ? chalk.redBright.bold('TEST failed: ')
    : chalk.greenBright.bold('TEST succeeded: ')
) + `passed (${succeeded} / ${total}, ${(succeeded / total * 100).toFixed(2)}%)`)

if (failed) process.exit(1)
