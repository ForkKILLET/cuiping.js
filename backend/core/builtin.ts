import type { FuncStructDefs, LabelDef } from './parse.js'
import { ChemParser, combine } from './index.js'
import { MathEx } from '../utils/math.js'

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
            proto: quickParse(String.raw`.{&:4}/.{&:3}={S:R}.{&:2}\.{&:1}!=/{S:R}.{&:6}!.{&:5}!=\{S:R}&1`),
            exposedLabels: Object.fromEntries([ ...'123456' ]
                .map((label): [ string, LabelDef ] => [ label, { defaultDir: MathEx.stdAng(60 - (+ label * 60)) }])
            ),
            defaultIn: '4',
            defaultOut: '1'
        }
    }
}
