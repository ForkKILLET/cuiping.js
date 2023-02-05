import type {
    Formula, Struct,
    AttrOfBond, BondCount, BondDir, Group, ChemStruct, ChemAndRefStruct, FuncStructHead, ChemStructHead, RefStructHead
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

export function combine(formula: Formula): ChemStruct {
    let totalStruct = 0
    let visitedStruct = 0

    let unnamedFuncStructId = 0
    const getGroupLabel = (struct: Struct<FuncStructHead>) => (
        struct.node.a.ref ??= `unnamed:${unnamedFuncStructId ++}:`
    )

    function callFuncStruct(struct: Struct): ChemAndRefStruct[] {
        let nextTree: Struct
        const newTrees: ChemAndRefStruct[] = []

        if (struct.S === 'func') {
            const def = struct.node.d

            if (def.type === 'chem') {
                const groupLabel = getGroupLabel(struct)
                const cloneChemProto = (proto: ChemAndRefStruct, rotateDeg: number, parent: ChemAndRefStruct | null = null): ChemAndRefStruct => {
                    const cloned = {
                        S: proto.S,
                        node: deepClone(proto.node),
                        children: proto.children,
                        parents: (parent && proto.parents.length)
                            ? [{
                                ...deepClone(proto.parents[0]),
                                d: proto.parents[0].d.map(d => MathEx.stdAng(d + rotateDeg)),
                                n: parent
                            }]
                            : []
                    } as Struct<ChemStructHead, ChemStructHead | RefStructHead, ChemStruct | RefStructHead>
                    cloned.children = cloned.children.map(bond => ({
                        ...bond,
                        d: bond.d.map(d => MathEx.stdAng(d + rotateDeg)),
                        n: cloneChemProto(bond.n, rotateDeg, cloned)
                    }))

                    if (proto.S === 'chem') {
                        const label = proto.node.a.ref
                        if (label && label in def.chem.exposedLabels) {
                            const labelDef = def.chem.exposedLabels[label]
                            cloned.labelDef = labelDef
                            formula.labels[groupLabel + label] = cloned
                        }
                    }
                    return cloned
                }

                nextTree = {
                    S: 'ref',
                    node: { l: [ groupLabel + def.chem.defaultOut ] },
                    parents: [],
                    children: struct.children
                }

                nextTree.children.forEach(child => {
                    child.n.parents[0].n = nextTree
                })

                newTrees.push(cloneChemProto(def.chem.proto, struct.node.a.deg ?? 0))
            }

            else throw Error(`Not implemented: func struct of ${def.type}`)
        }

        else nextTree = struct

        nextTree.children.forEach(child => {
            const { n } = child
            if (n.S === 'func') {
                if (n.node.d.type === 'chem') {
                    const groupLabel = getGroupLabel(n)
                    child.n = {
                        S: 'ref',
                        node: { l: [ groupLabel + n.node.d.chem.defaultIn ] },
                        parents: n.parents,
                        children: []
                    } as ChemAndRefStruct
                    child.n.parents[0].n.children[0].n = child.n
                }
            }

            const [ childNextTree, ...childNewTrees ] = callFuncStruct(n)

            if (n.S === 'func' && n.node.d.type === 'chem') newTrees.push(childNextTree)

            newTrees.push(...childNewTrees)
        })

        return [ nextTree as ChemAndRefStruct, ...newTrees ]
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

            if (! child.d.length) { // Note: use default dir
                if (struct.S === 'chem') {
                    const { labelDef } = struct
                    if (typeof labelDef?.defaultDir === 'number') {
                        child.d.push(labelDef.defaultDir)
                        return
                    }
                }

                throw Error('No default dir')
            }
        })

        if (struct.S === 'func') throw Error('Unreachable: uncalled func structs')

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
        return struct
    }

    function toTree(struct: ChemStruct, parentStruct: ChemStruct | null): ChemStruct {
        if (! struct.toTreeVisited) {
            struct.toTreeVisited = true
            visitedStruct ++
        }

        invert(struct, parentStruct)

        const childrenToDelete: number[] = []
        struct.children.forEach(bond => {
            if (bond.n.toTreeVisited) {
                bond.n = {
                    S: 'chem',
                    node: {
                        t: { B: [{ s: '', w: 1, a: 'base' as const, nd: true }], w: 1 },
                        a: {},
                        R: [ - 1, - 1 ],
                        i: - 1
                    },
                    children: [],
                    parents: []
                }
            }
            else bond.n = toTree(bond.n, struct)
        })
        childrenToDelete.forEach(i => struct.children.splice(i, 1))

        return struct
    }

    const forest = formula.structs.flatMap(callFuncStruct)

    Debug.D('callFuncStruct: %o\n%s', forest, {
        toString: () => forest.map(wrapStructString).join('\n')
    })

    const roots = forest.map(toGraph)
    const one = toTree(roots[0], null)

    Debug.D('toTree: %o\n%s', one, wrapStructString(one))

    if (visitedStruct < totalStruct)
        throw Error(`Structs aren't connected. (nodes ${visitedStruct} / ${totalStruct})`)

    return one
}

export function expand(
    struct: ChemStruct,
    rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
    depth: number = 0
): Chem {
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

            const a = { ...b.a }
            if (flipX !== flipY) {
                a.side = a.side === 'L' ? 'R' : a.side === 'R' ? 'L' : undefined
            }

            bonds.push({
                c: b.c,
                a,
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
