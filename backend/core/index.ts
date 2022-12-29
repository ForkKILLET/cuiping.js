import { ChemParser } from './parse'
import { combine } from './postproc'
import { renderSVG, SvgRendererOption } from './render'

export {
    GroupAttrs as Attributes,
    BondCharset,
    BondCountTable,
    BondDirTable,
    ChemParser,
    Parser
} from './parse'

export type {
    Bond,
    BondCount,
    BondDir,
    Struct,
    Formula,
    Group
} from './parse'

export {
    combine
} from './postproc'

export type {
    ExpandedBond,
    Chem
} from './postproc'

export {
    getViewport,
    locate,
    renderSVG,
} from './render'

export type {
    Layout,
    LayoutBond,
    LayoutGroup,
    SvgRendererOption
} from './render'

export function render(molecule: string, options: {
    onError?: (err: Error) => void,
    renderer: 'svg',
    rendererOptions: SvgRendererOption
}) {
    try {
        const parser = new ChemParser(molecule)
        const formula = parser.parse()
        const chem = combine(formula)
        if (options.renderer === 'svg') {
            return renderSVG(chem, options.rendererOptions)
        }
    }
    catch (error) {
        options.onError?.(error as Error)
    }
}