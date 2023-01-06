import * as Monaco from 'monaco-editor'
import { GroupAttrs, BondAttrs, Attr } from 'cuiping/core/parse'

export const getMonacoForCuiping = (monaco: typeof Monaco) => {
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
                const refNames = [ ...all.matchAll(/(&|ref):(\w+)/g) ]
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

            const res = before.match(/(.)\s*{([^}]*,)*[^}]+$/)
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
            { token: 'bonds', foreground: '0000FF' },
            { token: 'ref', foreground: '#007F00', fontStyle: 'italic' },
            { token: 'bond.type', foreground: 'FF0000' },
            { token: 'group.typeset', foreground: 'FF9933' },
            { token: 'group.content.typeset', foreground: 'AAAAAA', fontStyle: 'italic' },
            { token: 'attrs', foreground: '0000FF' },
            { token: 'attr.key', foreground: '3CCDFF' },
            { token: 'attr.colon', foreground: '0000FF' }
        ],
        colors: {
            'editor.foreground': '#000000'
        }
    })

    return monaco
}
