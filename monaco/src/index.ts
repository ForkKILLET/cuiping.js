import * as Monaco from 'monaco-editor'

export const getMonacoForCuiping = (monaco: typeof Monaco) => {
    monaco.languages.register({ id: 'cuipingFormula' })

    monaco.languages.setMonarchTokensProvider('cuipingFormula', {
        tokenizer: {
            root: [
                [ /\[/, 'bonds', '@bonds' ],
                [ /&\w+/, 'ref' ],
                [ /\{/, 'attrs', '@attrs' ],
                [ /[+\-|\/\\!*=#]/, 'bond.type' ],
                [ /(?=([\^_`](.|\([^)]*?\))|[^[\]{+\-|\/\\!*=#]+)+)/, 'group.dlmt', '@group' ]
            ],
            bonds: [
                { include: 'root' },
                [ /\]/, 'bonds', '@pop' ]
            ],
            attrs: [
                [ /(?=[^,:}]+:[^,}]+)/, 'attr.dlmt', '@attr-with-value' ],
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
                [ /[^[\]{+\-|\/\\!*=#\^_`]+/, 'group.content' ],
                [ /(?=[[\]{+\-|\/\\!*=#])/, 'group.dlmt', '@pop' ]
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
            { token: 'attr.key', foreground: '#3CCDFF' },
            { token: 'attr.colon', foreground: '0000FF' }
        ],
        colors: {
            'editor.foreground': '#000000'
        }
    })

    return monaco
}
