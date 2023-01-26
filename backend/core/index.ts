import type { Formula } from './parse.js'
import { ChemParser } from './parse.js'
import { combine, expand } from './postproc.js'
import type { SvgRendererOption, SvgResult } from './render.js'
import { renderSVG } from './render.js'
import { funcStructDefs } from './builtin.js'

export {
    GroupAttrs as Attributes,
    BondCharset,
    BondCountTable,
    BondDirTable,
    ChemParser,
    Parser
} from './parse.js'

export type {
    Bond,
    BondCount,
    BondDir,
    Struct,
    StructHead,
    Formula,
    Group
} from './parse.js'

export {
    funcStructDefs
} from './builtin.js'

export {
    combine,
    expand
} from './postproc.js'

export type {
    ExpandedBond,
    Chem
} from './postproc.js'

export {
    getViewport,
    locate,
    renderSVG
} from './render.js'

export type {
    Layout,
    LayoutBond,
    LayoutGroup,
    SvgRendererOption
} from './render.js'

export function render(molecule: string, options: {
    onError?: (err: Error) => void
    renderer: 'svg'
    rendererOptions: SvgRendererOption
}): (SvgResult & { formula: Formula }) | undefined {
    try {
        const parser = new ChemParser(molecule, funcStructDefs)
        const formula = parser.parse()
        const one = combine(formula)
        const chem = expand(one)
        if (options.renderer === 'svg') return {
            ...renderSVG(chem, options.rendererOptions),
            formula
        }
    }
    catch (error) {
        options.onError?.(error as Error)
    }
}
