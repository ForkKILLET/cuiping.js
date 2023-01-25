import type {
    Formula, Struct,
    AttrOfBond, BondCount, BondDir, Group, ChemStructHead, RefStructHead, StructHead
} from './parse.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'
import { wrapStructString } from './stringify.js'
import deepClone from 'deep-clone'

export type ExpandedBond = {
    c: BondCount
    d: BondDir
    t: Chem
    f: Group
    a: AttrOfBond
}

export type Chem = {
    g: Group
    bonds: ExpandedBond[]
}

type PureStruct<H extends StructHead> = Struct<H, H, H>
type ChemAndRefStruct = PureStruct<ChemStructHead | RefStructHead>
type ChemStruct = PureStruct<ChemStructHead>

export function combine(formula: Formula): ChemStruct {
    let totalStruct = 0
    let visitedStruct = 0

    let unnamedAttrStructId = 0

    function callAttrStruct(struct: Struct, parent: ChemAndRefStruct | null): ChemAndRefStruct[] {
        if (struct.S === 'attr') {
            const def = struct.node.d
            if (def.type !== 'chem')
                throw Error(`Not implemented: attr struct [type=${def.type}]`)

            else {
                const groupLabel = (struct.node.a.ref as string | undefined) ?? `unnamed:${unnamedAttrStructId ++}:`
                const newTrees: ChemAndRefStruct[] = []
                const cloneChemProto = (proto: ChemAndRefStruct): ChemAndRefStruct => {
                    const cloned = {
                        S: proto.S,
                        node: deepClone(proto.node),
                        treeId: proto.treeId,
                        children: proto.children.map(bond => ({
                            ...bond,
                            n: cloneChemProto(bond.n)
                        })),
                        parents: parent
                            ? [ deepClone({
                                ...proto.parents[0],
                                n: parent
                            }) ]
                            : []
                    } as ChemAndRefStruct
                    if (proto.S === 'chem') {
                        const label = proto.node.a.ref
                        if (label && def.chem.exposedLabels.includes(label)) {
                            formula.labels[groupLabel + label] = cloned
                        }
                    }
                    return cloned
                }
                return [ cloneChemProto(def.chem.proto), ...newTrees ]
            }
        }

        // Todo
        return [ struct as ChemAndRefStruct ]
    }

    function deref(struct: Struct): ChemStruct {
        if (struct.S === 'ref') {
            const label = struct.node.l[0]
            struct = formula.labels[label]!
        }
        return struct as ChemStruct
    }

    function toGraph(struct: Struct, index: number): ChemStruct {
        Debug.D('toGraph %d:\n%s', index, wrapStructString(struct))

        const { children, parents } = struct

        if (struct.S === 'ref') {
            const label = struct.node.l[0]
            const target = formula.labels[label]
            if (! target) throw Error(`Unknown ref &${label}`)

            // Note: Self -> Ref, Self children -> Ref children, Self parent -> Ref parent
            struct = target
            struct.children.push(...children)
            struct.parents.push(...parents)
        }

        children.forEach(child => {
            if (child.n.S === 'ref' && deref(child.n) === struct)
                throw Error(`Self-loop on ref &${child.n.node.l[0]}`)
            child.n.parents.forEach(parent => {
                parent.n = deref(parent.n)
            })
        })

        if (struct.S === 'attr') throw Error('Not implemented: attr structs')

        struct[`toGraph${index}Visited`] = true
        if (! struct.toGraphAnyVisited) {
            struct.toGraphAnyVisited = true
            totalStruct ++
        }

        struct.children.forEach(bond => {
            const target = deref(bond.n)
            if (! target[`toGraph${index}Visited`])
                bond.n = toGraph(bond.n, index)
            else
                bond.n = target
        })

        return struct as ChemStruct
    }

    function invert(struct: ChemStruct, parentStruct: ChemStruct | null): ChemStruct {
        struct.parents.forEach(parent => {
            if (parent.n === parentStruct) return
            parent.n.invertVisited = true
            struct.children.push(parent)
            parent.n.children = parent.n.children.filter(parentChild => parentChild.n !== struct)
        })
        struct.parents = []
        return struct
    }

    function toTree(struct: ChemStruct, parentStruct: ChemStruct | null): ChemStruct {
        if (! struct.toTreeVisited) {
            struct.toTreeVisited = true
            visitedStruct ++
        }

        invert(struct, parentStruct)

        const childrenToDelete: number[] = []
        struct.children.forEach((bond, i) => {
            if (bond.n.toTreeVisited) {
                bond.n = {
                    S: 'chem',
                    node: {
                        t: { B: [{ s: '?', w: 1, a: 'base' as const, nd: true }], w: 1 },
                        a: {},
                        R: [ - 1, - 1 ],
                        i: - 1
                    },
                    children: [],
                    parents: [],
                    treeId: bond.n.treeId
                }
            }
            else bond.n = toTree(bond.n, struct)
        })
        childrenToDelete.forEach(i => struct.children.splice(i, 1))

        return struct
    }

    const roots = formula.structs
        .flatMap(root => callAttrStruct(root, null))
        .map(toGraph)
    const one = toTree(roots[0], null)

    Debug.D('toTree: %o\n%s', one, wrapStructString(one))

    if (visitedStruct < totalStruct)
        throw Error(`Structs aren't connected. (nodes ${visitedStruct} / ${totalStruct})`)

    return one
}

export function expand(
    struct: Struct<ChemStructHead, ChemStructHead>,
    rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
    depth: number = 0
): Chem {
    if (struct.S === 'chem') {
        const bonds: ExpandedBond[] = []
        struct.children.forEach(b => {
            const [ d0 ] = b.d

            // Note: expand bond dirs
            b.d.forEach((d, i) => {
                let rD = rotateD
                let fX = flipX
                let fY = flipY

                if (i) {
                    if (d + d0 === 360)
                        fY = ! fY
                    else if (d + d0 === 180)
                        fX = ! fX
                    else {
                        const dd = d - d0
                        rD += MathEx.stdAng(flipX === flipY ? dd : - dd)
                    }
                }

                d += rotateD
                if (flipX) d = 180 - d
                if (flipY) d = 360 - d
                d = MathEx.stdAng(d)

                Debug.D(
                    '>'.repeat(depth + 1) + ' '.repeat(8 * ((depth / 8 | 0) + 1) - depth)
                    + 'rd %d,\tfx %o,\tfy %o\t-> %d',
                    rotateD, flipX, flipY, d
                )

                const t = expand({ ...b.n }, rD, fX, fY, depth + 1)

                bonds.push({
                    c: b.c,
                    a: b.a,
                    d,
                    t,
                    f: struct.node
                })
            })
        })
        const chem = {
            g: struct.node,
            bonds
        }
        return chem
    }
    throw Error('Not implemented: attr structs')
}
