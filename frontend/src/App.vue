<script setup lang="ts">
import { watch, reactive, ref } from 'vue'
import Cuiping from './components/Cuiping.vue'

const molecule = ref<string | undefined>()

const examples = [
    'C[--||H]',
    'C=C[|Cl]-C=C',
    'C[H\\/]=C[\\/H]',
    'C[H-,||H,-C[=|O,-O[-H]]]'
]

const history = reactive<string[]>(JSON.parse(localStorage.getItem('cuipingHistory') ?? '[]'))
watch(history, () => {
    localStorage.setItem('cuipingHistory', JSON.stringify(history))
})
</script>

<template>
    <header>
        <h1>Cuiping.js</h1>

        <p><textarea v-model="molecule" placeholder="Enter Cuiping formula"></textarea></p>

        <p>The structure of <code>"{{ molecule }}"</code> is:</p>
        <Cuiping :molecule="molecule" />
    </header>

    <article>
        <h2>History</h2>
        <button @click="history.push(molecule ?? '')">Save current</button>
        <button @click="history.splice(0, history.length)">Clear</button>
        <br />
        <div class="mols">
            <template v-if="history.length">
                <div v-for="mol, index in history">
                    <code>{{ mol }}</code>
                    <button @click="history.splice(index, 1)">Remove</button>
                    <button @click="molecule = mol">Select</button>
                    <br />
                    <Cuiping :molecule="mol" :key="mol" />
                </div>
            </template>
            <p v-else>No history yet.</p>
        </div>

        <h2>Examples</h2>
        <div class="mols">
            <div v-for="mol in examples">
                <code>{{ mol }}</code>
                <button @click="molecule = mol">Select</button>
                <br />
                <Cuiping :molecule="mol" :key="mol" />
            </div>
        </div>

        <h2>About</h2>
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

code {
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