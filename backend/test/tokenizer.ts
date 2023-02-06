import { tokenizer } from '../core/parse.js'
import assert from 'assert'
import { describe, it } from 'node:test'

function eq(a: string[], b: string[]) {
    if (a.length !== b.length) {
        console.log('Get', a, 'but expect', b)
        return false
    }
    for (let i = 0; i < a.length; i ++) {
        if (a[i] !== b[i]) {
            console.log('Get', a, 'but expect', b)
            return false
        }
    }
    return true
}

describe('tokenizer', () => {
    it('basic', () => {
        assert(eq(tokenizer('H2O'), [ 'H2O' ]))
    })

    it('brackets', () => {
        assert(eq(tokenizer('C[+H]'), [ 'C[+H]' ]))
        assert(eq(tokenizer('C`+raw'), [ 'C`+raw' ]))
        assert(eq(tokenizer('C`{+raw}'), [ 'C`{+raw}' ]))
        assert(eq(tokenizer('C(*comment*)'), [ 'C(*comment*)' ]))
    })

    it('combined', () => {
        assert(eq(tokenizer('CuSO4 + H2O -> CuSO4.5H2O'), [ 'CuSO4', '+', 'H2O', '->', 'CuSO4.5H2O' ]))
        assert(eq(tokenizer('C[+H]`+raw(*comm`e]nt*)'), [ 'C[+H]`+raw(*comm`e]nt*)' ]))

        assert(eq(tokenizer('C[+H`](*]*)] + H2O -> CuSO4.5H2O'), [ 'C[+H`](*]*)]', '+', 'H2O', '->', 'CuSO4.5H2O' ]))
    })
})
