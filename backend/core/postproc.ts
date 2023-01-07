import type {
    Formula, Struct,
    AttrOfBond, BondCount, BondDir, Group, ChemStructHead
} from './parse.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'

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

type ChemOnlyStruct = Struct<ChemStructHead, ChemStructHead, ChemStructHead>

export function combine(formula: Formula): Chem {
    let totalStruct = 0
    let visitedStruct = 0

    function deref(struct: Struct): ChemOnlyStruct {
        if (struct.S === 'ref') {
            const refName = struct.node.names[0]
            struct = formula.labels[refName]!
        }
        return struct as ChemOnlyStruct
    }

    function toGraph(struct: Struct): ChemOnlyStruct {
        const { children, parents } = struct

        if (struct.S === 'ref') {
            const refName = struct.node.names[0]
            const target = formula.labels[refName]
            if (! target) throw Error(`Unknown ref &${refName}`)

            // Note: Self -> Ref, Self children -> Ref children, Self parent -> Ref parent
            struct = target
            struct.children.push(...children)
            struct.parents.push(...parents)
        }

        children.forEach(child => {
            if (child.n.S === 'ref' && deref(child.n) === struct)
                throw Error(`Self-loop on ref &${child.n.node.names[0]}`)
            child.n.parents.forEach(parent => {
                parent.n = deref(parent.n)
            })
        })

        if (struct.S === 'attr') throw Error('Not implemented')

        if (! struct.toGraphVisited) {
            totalStruct ++
            struct.toGraphVisited = true
        }

        struct.children.forEach(bond => {
            if (! bond.n.toGraphVisited) {
                bond.n = toGraph(bond.n)
            }
        })

        return struct as ChemOnlyStruct
    }

    function invert(struct: ChemOnlyStruct): ChemOnlyStruct {
        struct.parents.forEach(bond => {
            if (bond.n.toTreeVisited) return
            bond.n.parentVisited = true
            invert(bond.n)
            struct.children.push(bond)
        })
        struct.parents = []
        return struct
    }

    function toTree(struct: ChemOnlyStruct): ChemOnlyStruct {
        if (! struct.toTreeVisited) {
            struct.toTreeVisited = true
            visitedStruct ++
        }

        invert(struct)

        const childrenToDelete: number[] = []
        struct.children.forEach((bond, i) => {
            if (bond.n.toTreeVisited) {
                if (bond.n.parentVisited) {
                    childrenToDelete.unshift(i)
                    return
                }
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
            else bond.n = toTree(bond.n)
        })
        childrenToDelete.forEach(i => struct.children.splice(i, 1))

        return struct
    }

    function toRoot(struct: ChemOnlyStruct): ChemOnlyStruct {
        if (! struct.toRootVisited) {
            struct.toRootVisited = true
        }
        else return struct
        return struct.parents.length
            ? toRoot(struct.parents[0].n)
            : struct
    }

    const roots = formula.structs.map(toGraph)
    const one = toTree(toRoot(roots[0]))

    Debug.D('one tree: %o', one)

    if (visitedStruct < totalStruct)
        throw Error(`Structs aren't connected. (nodes ${visitedStruct} / ${totalStruct})`)

    function expand(
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
        else if (struct.S === 'attr') {
            throw Error('Not implemented')
        }
        throw Error('Not implemented')
    }

    return expand(one)
}
