<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChemParser } from 'cuiping/core/parse'
import { expandAggregateBonds } from 'cuiping/core/expand'
import { locate } from 'cuiping/core/locate'
import { renderSVG } from 'cuiping/core/render'

const error = ref<boolean>(false)

const props = defineProps<{
    molecule?: string
}>()

const svg = computed(() => {
    if (! props.molecule) return '...'

    let errMsg: string = ''
    const parser = new ChemParser(props.molecule)
    const chem = parser.parse((err) => {
        errMsg = err.toString()
        error.value = true
        return true
    })

    if (errMsg) return errMsg
    error.value = false

    const chemEx = expandAggregateBonds(chem!)
    const layout = locate(chemEx)
    const svg = renderSVG(layout)
    return svg
})

function downloadSvg() {
    const blob = new Blob([svg.value])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = 'mol.svg'
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
}

const isCopying = ref<boolean>(false)

function copyFormula() {
    if (isCopying.value) return
    isCopying.value = true
    navigator.clipboard
        .writeText(props.molecule ?? '')
        .finally(() => {
            isCopying.value = false
        })
}
</script>

<template>
    <div class="root">
        <div v-html="svg" class="container" :class="{ error }"></div>
        <div class="toolbar">
            <div class="toolbar-inner">
                <button @click="downloadSvg">Download</button>
                <button @click="copyFormula">{{ isCopying ? 'Copying...' : 'Cuiping' }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.error {
    color: red;
}

.toolbar {
    position: absolute;
    z-index: 1;
    display: none;
    top: 0;
    left: 100%;
    height: 100%;
}

.toolbar-inner {
    display: inline-flex;
    margin: 0 .5em;
    background-color: white;
    border-radius: .4em;
    box-shadow: 0 0 0.1em 0.1em #dadada;
    overflow: hidden;
}

.toolbar button {
    background: none;
    border: none;
    outline: none;
    color: #1f1a1a;
    font-size: .8em;
    transition: .5s background-color;
}

.toolbar button:hover {
    background-color: #dadada;
}

.root:hover .toolbar {
    display: block;
}

.root {
    position: relative;
    display: inline-block;
}
</style>