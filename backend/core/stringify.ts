import type { Bond, Struct } from './index'

export function stringifyStruct(struct: Struct, memory: Struct[] = [], depth = 0) {
    const headStr = `[${struct.S}] ` + (
        struct.S === 'chem'
            ? struct.node.t.B.map(x => x.s).join('')
            : struct.S === 'ref'
                ? '&' + struct.node.names.join(',')
                : ''
    )
    if (memory.includes(struct)) return headStr + ' [loop]\n'
    else memory = [ ...memory, struct ]

    const next = (bonds: Bond[], symbol: string): string => {
        const str = bonds
            .map(({ n, d }) => symbol.padStart(4 * (depth + 1))
                + d.join(',').padEnd(3) + ' '
                + stringifyStruct(n, memory, depth + 1)
            )
            .join('\n')
        return str
    }
    const childrenStr = next(struct.children, '->  ')
    const parentStr = next(struct.parents, '<-  ')

    return headStr + '\n' + childrenStr + parentStr
}

export function printStruct(struct: Struct) {
    console.log('%o\n%s', struct, stringifyStruct(struct))
}

export function wrapStructString(struct: Struct) {
    return {
        toString: () => stringifyStruct(struct)
    }
}
