<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChemParser } from 'cuiping/core/parse'
import { expandAggregateBonds } from 'cuiping/core/expand'
import { locate } from 'cuiping/core/locate'
import { renderSVG } from 'cuiping/core/render'

const error = ref<boolean>(false)

const props = defineProps<{
    molecule: string | void
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
</script>

<template>
    <div>
        <p>The structure of <code>{{ molecule }}</code> is:</p>
        <div v-html="svg" :class="{ error }"></div>
    </div>
</template>

<style scoped>
code {
    color: forestgreen;
}
.error {
    color: red;
}
</style>