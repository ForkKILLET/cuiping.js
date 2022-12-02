<script setup lang="ts">
import { watch, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Conf, { SchemasToValues } from './conf';

Object.assign(window,{ref_a:ref})

const molecule = ref<string | undefined>()

const examples: [ Record<string, string>, string][] = [
    [ { zh: '甲烷', en: 'methane' }, 'C[--||H]' ],
    [ { zh: '氮气', en: 'nitrogen' }, 'N#N' ],
    [ { zh: '乙烯', en: 'ethylene' }, 'C[H\\/]=C[\\/H]' ],
    [ { zh: '碳碳双键 (官能团)', en: 'C-C double bond (functional group)' }, 'C[*\\/]=C[\\/*]' ],
    [ { zh: '2-氯-1,3-丁二烯 (仅碳链)', en: 'chloroprene (carbon chain only)' }, 'C=C[|Cl]-C=C' ],
    [ { zh: '乙酸', en: 'acetic acid' }, 'C[H-,||H]-C[=|O]-O-H' ],
    [ { zh: '2-氯丙烷 (附样式)', en: '2-chloropropane (with style)' }, 'CH3-CH<B>[|Cl<C:green>]-CH3' ]
]

const history = reactive<string[]>(
    JSON.parse(localStorage.getItem('cuipingHistory') ?? '[]')
)
watch(history, () => {
    localStorage.setItem('cuipingHistory', JSON.stringify(history))
})

function selectMol(mol: string) {
    molecule.value = mol
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

const schemasComp = {
    useCanvas: { ty: 'boolean', def: false }
} as const

const confComp = ref<SchemasToValues<typeof schemasComp>>()

const schemasRender = {
	unitLen: { ty: 'number', def: 20 },
	paddingX: { ty: 'number', def: 20 },
	paddingY: { ty: 'number', def: 20 },
	displayBonds: { ty: 'boolean', def: true },
	bondGap: { ty: 'number', def: 2 },
	lineBaseColor: { ty: 'color', def: 'black' },
	textBaseColor: { ty: 'color', def: 'black' },
    halfFontSize: { ty: 'number', def: 8 },
    halfTextBoxWidth: { ty: 'number', def: 6 },
    halfTextBoxHeight: { ty: 'number', def: 8 },
    showTextBox: { ty: 'boolean', def: false }
} as const

const confRender = ref<SchemasToValues<typeof schemasRender>>()

const confFolden = ref<boolean>(
    JSON.parse(localStorage.getItem('cuipingConfFolden') ?? '"false"')
)
function toggleConf() {
    localStorage.setItem('cuipingConfFolden',
        JSON.stringify(confFolden.value = ! confFolden.value)
    )
}
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

        <p>
            <textarea
                v-model="molecule"
                :placeholder="t('info.enterFormula')"
            ></textarea>
        </p>

        <p v-html="
            t('info.structure', {
                formula: `<code>\`${molecule?.replace(/./g, (ch) => `&#x${ch.charCodeAt(0).toString(16)};`) ?? ''}\`</code>`
            })
        "></p>
        <Cuiping
            :molecule="molecule"
            v-bind="confComp" :render-options="confRender"
        />

        <div class="confs" :class="{ folden: confFolden }">
            <p>{{ t('title.conf') }}&emsp;<span class="folder" @click="toggleConf">&Delta;</span></p>
            <div>
                <Conf :schemas="schemasComp" v-model="confComp" />
                <Conf :schemas="schemasRender" v-model="confRender" />
            </div>
        </div>
    </header>

    <article>
        <h2>{{ t('title.history') }}</h2>
        <button @click="history.push(molecule ?? '')">{{ t('op.save_current') }}</button>
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
                <strong>{{ desc[i18n.locale.value] }}</strong><br />
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

a, a:visited {
    color: gray;
    transition: .5s color;
}

a:hover, a:active {
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
</style>