import { ChemParser, Formula } from './parse.js'
import { combine } from './postproc.js'
import { renderSVG, SvgRendererOption, SvgResult } from './render.js'

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
    Formula,
    Group
} from './parse.js'

export {
    combine
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
        const parser = new ChemParser(molecule)
        const formula = parser.parse()
        const chem = combine(formula)
        if (options.renderer === 'svg') return {
            ...renderSVG(chem, options.rendererOptions),
            formula
        }
    }
    catch (error) {
        options.onError?.(error as Error)
    }
}
