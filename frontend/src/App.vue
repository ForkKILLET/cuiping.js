<script setup lang="ts">
import { watch, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Cuiping from './components/Cuiping.vue'

const molecule = ref<string | undefined>()

const examples: [ Record<string, string>, string][] = [
    [ { zh: '甲烷', en: 'methane' }, 'C[--||H]' ],
    [ { zh: '氮气', en: 'nitrogen' }, 'N#N' ],
    [ { zh: '乙烯', en: 'ethylene' }, 'C[H\\/]=C[\\/H]' ],
    [ { zh: '碳碳双键 (官能团)', en: 'C-C double bond (functional group)' }, 'C[*\\/]=C[\\/*]' ],
    [ { zh: '2-氯-1,3-丁二烯 (仅碳链)', en: 'chloroprene (carbon chain only)' }, 'C=C[|Cl]-C=C' ],
    [ { zh: '乙酸', en: 'acetic acid' }, 'C[H-,||H]-C[=|O]-O-H' ]
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
            t('info.structure', { formula: `<code>\`${molecule ?? ''}\`</code>` })
        "></p>
        <Cuiping :molecule="molecule" />
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
                    <Cuiping :molecule="mol" :key="mol" />
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
                <Cuiping :molecule="mol" :key="mol" />
            </div>
        </div>

        <h2>{{ t('title.about') }}</h2>
        GitHub: <a href="//github.com/ForkKILLET/cuiping.js">ForkKILLET/cuiping.js</a> <br />
        npm: <a href="//www.npmjs.com/package/cuiping">cuiping</a>
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
    height: .1em;
    background-color: black;
}

textarea {
    font-size: 1.6em;
    outline: none;
    border: .1em solid black;
    border-radius: .3em;
    padding: .1em;
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
}

.mols > div {
    display: inline-block;
    padding: 1em;
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
</style>