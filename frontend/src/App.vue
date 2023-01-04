<script setup lang="ts">
import { watch, ref } from 'vue'

import { useI18n } from 'vue-i18n'
import type { Locales } from './i18n/locales'

import { Cuiping } from 'cuiping-component'
import 'cuiping-component/dist/style.css'

import { Conf, SchemasToValues, storageRef, storageReactive } from './conf';
import examples from './examples'

import * as originalMonaco from 'monaco-editor'
import { getMonacoForCuiping } from 'cuiping-monaco'

import { version as backVer } from 'cuiping/package.json'
import { version as compVer } from 'cuiping-component/package.json'
import { version as frontVer } from '../package.json'

const molecule = ref<string | undefined>()

const history = storageReactive<string[]>('history', [])

function selectMol(mol: string) {
    updateMolecule(mol)
    window.scrollTo({
        left: 0,
        top: 0,
        behavior: 'smooth'
    })
}

const i18n = useI18n()
const { t } = i18n

function setLocale(locale: string) {
    localStorage.setItem('cuipingLocale', i18n.locale.value = locale)
}

const schemasOther = {
    useEditor: { ty: 'boolean' }
} as const

const confOther = storageReactive<SchemasToValues<typeof schemasOther>>('confOther', {
    useEditor: true
})

const schemasComp = {
    useImage: { ty: 'boolean' },
    imageScale: { ty: 'number', min: 0 }
} as const

const confComp = storageReactive<SchemasToValues<typeof schemasComp>>('confComp', {
    useImage: false,
    imageScale: 1
})

const schemasRender = {
	unitLen: { ty: 'number', min: 0 },
	paddingX: { ty: 'number' },
	paddingY: { ty: 'number' },
	displayBonds: { ty: 'boolean' },
	bondGap: { ty: 'number', min: 0 },
	lineBaseColor: { ty: 'color' },
	textBaseColor: { ty: 'color' },
    halfFontSize: { ty: 'number', min: 0 },
    halfTextBoxWidth: { ty: 'number', min: 0 },
    halfTextBoxHeight: { ty: 'number', min: 0 },
    displayTextBox: { ty: 'boolean' }
} as const

const confRender = storageReactive<SchemasToValues<typeof schemasRender>>('confRender', {
    unitLen: 20,
    paddingX: 20,
    paddingY: 20,
    displayBonds: true,
    bondGap: 2,
    lineBaseColor: 'black',
    textBaseColor: 'black',
    halfFontSize: 8,
    halfTextBoxWidth: 6,
    halfTextBoxHeight: 8,
    displayTextBox: false
})

const confFolden = storageRef<boolean>('confFolden', false)

const buildTime = import.meta.env.VITE_BUILD_TIME ?? 'now'
const buildEnv = import.meta.env.VITE_BUILD_ENV ?? 'local'
const [ lastCommitHash, lastCommitMessage ] = import.meta.env.VITE_LAST_COMMIT?.split(/(?<! .*) /) ?? []

const monacoContainer = ref<HTMLDivElement>()

let monaco: typeof originalMonaco
let monacoEditor: originalMonaco.editor.IStandaloneCodeEditor

const updatingMolecule = ref<boolean>(false)
function updateMolecule(value: string) {
    molecule.value = value
    if (monacoContainer.value && monacoEditor) {
        updatingMolecule.value = true
        monacoEditor.setValue(value)
    }
}


watch(monacoContainer, () => {
    if (monacoContainer.value && ! updatingMolecule.value) {
        monaco = getMonacoForCuiping(originalMonaco)
        monacoEditor = monaco.editor.create(monacoContainer.value, {
            theme: 'cuipingFormulaDefaultTheme',
            value: molecule.value,
            language: 'cuipingFormula',
            automaticLayout: true
        })
        monacoEditor.getModel()?.onDidChangeContent(() => {
            if (! updatingMolecule.value) molecule.value = monacoEditor.getValue()
            else updatingMolecule.value = false
        })
    }
}, { immediate: true })
</script>

<template>
    <header>
        <h1>Cuiping.js</h1>

        <span v-for="locale, i in i18n.availableLocales">
            {{ i ? ' | ' : '' }}<span
                class="locale"
                :class="{ active: locale === i18n.locale.value }"
                @click="setLocale(locale)"
            >{{ locale }}</span>
        </span>

        <div v-if="confOther?.useEditor"
            ref="monacoContainer" class="monaco-container"
        ></div>
        <p v-else>
            <textarea
                v-model="molecule"
                :placeholder="t('info.enterFormula')" spellcheck="false"
            ></textarea>
        </p>

        <p v-html="
            t('info.structure', {
                formula: `<code>\`${
                    molecule?.replace(/./g, (ch) => `&#x${ch.charCodeAt(0).toString(16)};`) ?? ''
                }\`</code>`
            })
        "></p>
        <Cuiping
            :molecule="molecule"
            v-bind="confComp" :render-options="confRender"
        />

        <div class="confs" :class="{ folden: confFolden }">
            <p>{{ t('title.conf') }}&emsp;
                <span class="folder" @click="confFolden = ! confFolden">&Delta;</span>
            </p>
            <div>
                <Conf :schemas="schemasOther" v-model="confOther" />
                <Conf :schemas="schemasComp" v-model="confComp" />
                <Conf :schemas="schemasRender" v-model="confRender" />
            </div>
        </div>
    </header>

    <article>
        <h2>{{ t('title.history') }}</h2>
        <button @click="history.unshift(molecule ?? '')">{{ t('op.save_current') }}</button>
        <button @click="history.splice(0, history.length)">{{ t('op.clear') }}</button>
        <br />
        <div class="mols">
            <template v-if="history.length">
                <div v-for="mol, index in history">
                    <code>{{ mol }}</code>
                    <button @click="history.splice(index, 1)">{{ t('op.remove') }}</button>
                    <button @click="selectMol(mol)">{{ t('op.select') }}</button>
                    <br />
                    <Cuiping
                        :molecule="mol" :key="mol"
                        v-bind="confComp" :render-options="confRender"
                    />
                </div>
            </template>
            <p v-else>{{ t('info.noHistory') }}</p>
        </div>

        <h2>{{ t('title.examples') }}</h2>
        <div class="mols">
            <div v-for="[ desc, mol ] in examples">
                <strong>{{ desc[i18n.locale.value as Locales] }}</strong><br />
                <code>{{ mol }}</code>
                <button @click="selectMol(mol)">{{ t('op.select') }}</button>
                <br />
                <Cuiping
                    :molecule="mol" :key="mol"
                    v-bind="confComp" :render-options="confRender"
                />
            </div>
        </div>

        <h2>{{ t('title.about') }}</h2>
        GitHub: <a href="//github.com/ForkKILLET/cuiping.js">ForkKILLET/cuiping.js</a> <br />
        npm: <a href="//www.npmjs.com/package/cuiping">cuiping (backend)</a> |
        <a href="//www.npmjs.com/package/cuiping-component">cuiping-component</a>
        <br />
        <i class="build">
            backend @ {{ backVer }} | component @ {{ compVer }} | frontend @ {{ frontVer }} <br />
            {{ t('info.build', { buildTime, buildEnv }) }} <br />
            <span
                v-if="lastCommitHash"
                v-html="t('info.lastCommit', { message: lastCommitMessage, hash: lastCommitHash })"
            ></span>
        </i>
    </article>
</template>

<style scoped>
header {
    padding-top: 10vh;
    text-align: center;
    background-color: #1f1a1a;
    color: white;
}

.locale.active {
    color: #1cd91c;
}

.locale {
    padding: .2em;
    cursor: pointer;
}

article {
    margin: 0;
    padding: 2vw 5vw;
    background-color: #e6f0e8;
}

h1 {
    color: #1cd91c;
    font-size: 3em;
}

h2 {
    position: relative;
    margin-left: 20vw;
}

h2::before {
    position: absolute;
    display: block;
    content: '';
    left: -20vw;
    top: .4em;
    width: calc(20vw - .5em);
    height: 2px;
    background-color: black;
}

textarea {
    font-size: 1.4em;
    outline: none;
    border: .1em solid black;
    border-radius: .3em;
    padding: .1em;
    font-family: monospace;
    transition: .3s box-shadow ease-out;
}

textarea:focus {
    box-shadow: 0 0 .15em .07em #1cd91c;
}

:deep(code) {
    color: #1cd91c;
}

article code {
    display: inline-block;
    background-color: black;
    padding: .1em .3em;
    border-radius: .4em;
    margin-bottom: 1em;
}

.mols {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: -1em;
}

.mols > div {
    display: inline-block;
    padding: 1em;
    margin-bottom: 1em;
}

.mols > div:nth-child(2n + 1) {
    background-color: #e0e0e0;
}

:deep(svg) {
    background-color: white;
}

button {
    border: none;
    outline: none;
    background: none;
    text-decoration: underline;
    transition: .5s color;
}

button:hover {
    color: #1cd91c;
}

:deep(a), :deep(a:visited) {
    color: #159715;
    transition: .5s color;
}

:deep(a:hover), :deep(a:active) {
    color: #1cd91c;
}

.confs {
    width: 50vw;
    margin: auto;
    border-radius: 1em 1em 0 0;
    padding: .5em;
    background-color: white;
    color: black;
}

.confs > p {
    font-size: 1.3em;
    font-weight: bold;
    margin: .4em 0;
}

.confs > div {
    max-height: 40vw;
    transition: .4s max-height;
    overflow-y: scroll;
}

.confs.folden > div {
    max-height: 0;
}

.folder {
    display: inline-block;
    user-select: none;
    transition: .6s transform;
}

.folden .folder {
    transform: rotate(180deg);
}

.build {
    color: gray;
}

.monaco-container {
    height: 20vh;
    width: 80vw;
    max-width: 50em;
    resize: both;
    overflow: hidden;
    text-align: left;
    margin: auto;
}
</style>