<script setup lang="ts">
import { ref } from 'vue'
import Cuiping from './components/Cuiping.vue'

const molecule = ref<string | void>()

const examples = [
    'C[--||H]',
    'C[H\\/,=-C[\\/H]]',
    'S[-|OH,O-|]',
    'C[H-,||H,-C[=|O,-O[-H]]]'
]
</script>

<template>
    <header>
        <h1>Cuiping.js</h1>

        <p><input v-model="molecule" placeholder="Enter Cuiping formula" /></p>

        <p>The structure of <code>"{{ molecule }}"</code> is:</p>
        <Cuiping :molecule="molecule" />
    </header>

    <article>
        <h2>Examples</h2>
        <div class="examples">
            <div v-for="mol in examples">
                <code>{{ mol }}</code>
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

input {
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
    display: block;
    background-color: black;
    padding: .1em .3em;
    border-radius: .4em;
    margin-bottom: 1em;
}

.examples {
    display: flex;
}

.examples > div {
    display: inline-block;
    padding: 1em;
}

.examples > div:nth-child(2n + 1) {
    background-color: #e0e0e0;
}

:deep(svg) {
    background-color: white;
}
</style>