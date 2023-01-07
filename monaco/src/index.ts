import * as Monaco from 'monaco-editor'
import { GroupAttrs, BondAttrs, Formula } from 'cuiping/core/parse'

export const getMonacoForCuiping = (monaco: typeof Monaco, {
    getFormula,
    markGroup
}: {
    getFormula?: () => Formula | undefined,
    markGroup?: (groupId: number) => void
}) => {
    monaco.languages.register({ id: 'cuipingFormula' })

    monaco.languages.setMonarchTokensProvider('cuipingFormula', {
        tokenizer: {
            root: [
                [ /\[/, 'bonds', '@bonds' ],
                [ /&\w*/, 'ref' ],
                [ /\{/, 'attrs', '@attrs' ],
                [ /[+\-|\/\\*!~=#]/, 'bond.type' ],
                [ /\s+/, 'space' ],
                [ /(?=([\^_`](.|\([^)]*?\))|[^[\]{+\-|\/\\*!~=#;,]+)+)/, 'group.dlmt', '@group' ],
                [ /;/, 'semicolon' ]
            ],
            bonds: [
                { include: 'root' },
                [ /,/, 'bonds.comma' ],
                [ /\]/, 'bonds', '@pop' ]
            ],
            attrs: [
                [ /(?=[^,:}]+:[^,}]*)/, 'attr.dlmt', '@attr-with-value' ],
                [ /(?=[^,:}]+)/, 'attr.dlmt', '@attr-without-value' ],
                [ /}/, 'attrs', '@pop' ]
            ],
            'attr-with-value': [
                [ /[^,:}]+?(?=:)/, 'attr.key' ],
                [ /:/, 'attr.colon' ],
                [ /[^,}]+?(?=[,}])/, 'attr.value' ],
                [ /,/, 'attrs.comma', '@pop' ],
                [ /(?=})/, 'attr.dlmt', '@pop' ]
            ],
            'attr-without-value': [
                [ /[^,:}]+?(?=[,}])/, 'attr.key' ],
                [ /,/, 'attrs.comma', '@pop' ],
                [ /(?=})/, 'attr.dlmt', '@pop' ]
            ],
            group: [
                [ /[\^_`]{/, 'group.typeset', '@group-typeset-multiple' ],
                [ /[\^_`]/, 'group.typeset', '@group-typeset' ],
                [ /[^[\]{+\-|\/\\*!~=#;,\^_`]+/, 'group.content' ],
                [ /(?=[[\]{+\-|\/\\*!~=#;,])/, 'group.dlmt', '@pop' ]
            ],
            'group-typeset-multiple': [
                [ /[^}]+/, 'group.content.typeset' ],
                [ /}/, 'group.typeset', '@pop' ]
            ],
            'group-typeset': [
                [ /./, 'group.content.typeset', '@pop' ]
            ]
        }
    })

    monaco.languages.setLanguageConfiguration('cuipingFormula', {
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' }
        ]
    })

    type CompletionList = Monaco.languages.CompletionList
    const { CompletionItemKind } = monaco.languages 

    const attrSuggestions = (attr: typeof GroupAttrs | typeof BondAttrs, range: Monaco.IRange) => Object.keys(attr)
        .map(name => ({
            label: name,
            insertText: name,
            kind: CompletionItemKind.Field,
            range
        }))

    monaco.languages.registerCompletionItemProvider('cuipingFormula', {
        triggerCharacters: [
            ...'abcdefghijklmnopqrstucwxyz'
            + 'ABCDEFGHIJKLMNOPQRSTUCWXYZ'
            + '&'
        ],
        provideCompletionItems: (model, position): CompletionList => {
            const before = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            })
            const all = model.getValue()

            const noSuggestions = {
                suggestions: []
            }

            const word = model.getWordUntilPosition(position)

            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            }

            if (before.match(/(?<![\^_`]({[^}]*)?)&\w*$/)) { // Note: complete ref
                const refNames = [ ...all.matchAll(/(&|ref)\s*:\s*(\w+)/g) ]
                range.startColumn --
                return {
                    suggestions: refNames.map(res => ({
                        label: '&' + res[2],
                        insertText: '&' + res[2],
                        kind: CompletionItemKind.Reference,
                        range
                    }))
                }
            }

            const res = before.match(/(.)\s*{\s*([^}]*,)*[^:}]+$/)
            if (res) {
                if (res[1].match(/[\^_`]/)) return noSuggestions
                if (res[1].match(/[+\-|\/\\*!~=#]/)) return {
                    suggestions: attrSuggestions(BondAttrs, range)
                }
                return {
                    suggestions: attrSuggestions(GroupAttrs, range)
                }
            }

            return noSuggestions
        }
    })

    monaco.editor.defineTheme('cuipingFormulaDefaultTheme', {
        base: 'vs',
        inherit: false,
        rules: [
            { token: 'bonds', foreground: 'FA9246' },
            { token: 'ref', foreground: 'DC68E6', fontStyle: 'italic' },
            { token: 'bond.type', foreground: '545A7B', fontStyle: 'bold' },
            { token: 'group.typeset', foreground: 'AAAAAA', fontStyle: 'italic' },
            { token: 'group.content.typeset', foreground: 'B9E260', fontStyle: 'italic' },
            { token: 'attrs', foreground: '62C169' },
            { token: 'attr.key', foreground: '64D99D', fontStyle: 'bold' },
            { token: 'attr.colon', foreground: '89E2B5' },
            { token: 'bonds.comma', foreground: 'B7ACf0' },
            { token: 'semicolon', foreground: 'B7ACf0' }
        ],
        colors: {
            'editor.foreground': '#876FFF'
        }
    })

    if (getFormula && markGroup) monaco.editor.addEditorAction({
        id: 'cuipingFormula.markGroupInOutput',
        label: 'Toggle Group Mark',
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
        ],
        contextMenuGroupId: 'navigation',
        run: (ed) => {
            const model = ed.getModel()
            const position = ed.getPosition()
            const formula = getFormula()
            if (model && position && formula) {
                const offset = model.getOffsetAt(position)
                const group = formula.groups.find(g => g.R[0] <= offset && offset <= g.R[1] + 1)
                if (group) markGroup(group.i)
            }
        }
    })

    if (MonacoEnvironment) MonacoEnvironment.getWorkerUrl = () => 'data:application/javascript;base64,'
        + btoa(`console.log("Mocano, I DON'T NEED ANY WORKERS, YOU KNOW?")`)

    return monaco
}
