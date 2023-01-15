import type { Struct } from './index'

export function stringifyStruct(struct: Struct, memory = new Set<Struct>(), depth = 0) {
    const headStr = `[${struct.S}] ` + (
        struct.S === 'chem'
            ? struct.node.t.B.map(x => x.s).join('')
            : struct.S === 'ref'
                ? '&' + struct.node.names.join(',')
                : ''
    )
    if (memory.has(struct)) return headStr + ' [loop]\n'
    else memory.add(struct)
    const childrenStr: string = struct.children
        .map(({ n, d }) => '->  '.repeat(depth + 1)
            + d.join(',').padEnd(3) + ' '
            + stringifyStruct(n, memory, depth + 1)
        )
        .join('\n')
    return headStr + '\n' + childrenStr
}

export function printStruct(struct: Struct) {
    console.log(stringifyStruct(struct))
}

export function wrapStructString(struct: Struct) {
    return {
        toString: () => stringifyStruct(struct)
    }
}
