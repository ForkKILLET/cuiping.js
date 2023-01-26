import type { FuncStructDefs } from './parse.js'
import { ChemParser, combine } from './index.js'

const quickParse = (molecule: string) => {
    const formula = new ChemParser(molecule, {}).parse()
    const one = combine(formula)
    return one
}

export const funcStructDefs: FuncStructDefs = {
    Ben: {
        type: 'chem',
        attr: {},
        chem: {
            proto: quickParse(String.raw`.{&:1}/.{&:2}={S:R}.{&:3}\.{&:4}!=/{S:R}.{&:5}!.{&:6}!=\{S:R}&1`),
            exposedLabels: [ ...'123456' ],
            defaultIn: '1',
            defaultOut: '4'
        }
    }
}
