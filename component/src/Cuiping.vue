<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Canvg } from 'canvg'
import { ChemParser } from 'cuiping/core/parse'
import { expandAggregateBonds } from 'cuiping/core/expand'
import { renderSVG } from 'cuiping/core/render'
import type { svgRendererOption } from 'cuiping/core/render'

Object.assign(window, {ref_c:ref})

const props = withDefaults(defineProps<{
    molecule?: string,
    useCanvas?: boolean,
    canvasScale?: number,
    renderOptions?: svgRendererOption
}>(), {
    useCanvas: false,
    canvasScale: 1
})

const res = computed(() => {
    if (! props.molecule) return { state: 'empty' as const }

    let errMsg: string = ''
    const parser = new ChemParser(props.molecule)
    const chem = parser.parse((err) => {
        errMsg = err.toString()
        return true
    })

    if (errMsg) return {
        state: 'error' as const,
        errMsg
    }

    const chemEx = expandAggregateBonds(chem!)
    return {
        state: 'ok' as const,
        data: renderSVG(chemEx, props.renderOptions)
    }
})

function downloadSvg() {
    if (res.value.state !== 'ok') return

    const blob = new Blob([ res.value.data.svg ])
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
    if (props.molecule) navigator.clipboard
        .writeText(props.molecule)
        .finally(() => {
            isCopying.value = false
        })
}

const canvas = ref<HTMLCanvasElement>()
const canvg = ref<Canvg | undefined>()
const canvasOk = ref<boolean>(false)

const scaleHeight = ref(0)
const scaleWidth = ref(0)

watch([ canvas, props ], () => {
    canvasOk.value = false
    if (canvg.value) canvg.value.stop()

    if (res.value.state !== 'ok' || ! canvas.value) return

    const ctx = canvas.value.getContext('2d')
    if (! ctx) return

    const { data } = res.value
    scaleHeight.value = props.canvasScale * data.height
    scaleWidth.value = props.canvasScale * data.width

    nextTick(() => {
        const v = Canvg.fromString(ctx, data.svg)
        canvg.value = v
        v.start({
            ignoreMouse: true
        })
        canvasOk.value = true
    })
}, { immediate: true })
</script>

<template>
    <div class="root" :class="res.state">
        <div v-if="res.state === 'ok'" class="container">
            <template v-if="useCanvas">
                <canvas
                    ref="canvas"
                    :width="scaleWidth" :height="scaleHeight"
                ></canvas>
                <img v-if="canvasOk" :src="canvas!.toDataURL('data/png')" />
            </template>
            <div v-else v-html="res.data.svg"></div>
        </div>
        <p v-else-if="res.state === 'error'">{{ res.errMsg }}</p>
        <p v-else>...</p>
        <div class="toolbar">
            <div class="toolbar-inner">
                <button @click="downloadSvg">SVG</button>
                <button @click="copyFormula">
                    {{ isCopying ? 'Copying...' : 'Cuiping' }}
                </button>
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
    user-select: none;
}

.toolbar-inner {
    display: inline-flex;
    margin: 0 .5em;
    background-color: white;
    border-radius: .4em;
    box-shadow: 0 0 2px 2px #dadada;
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

.container {
    background: white;
}

canvas {
    display: none;
}

img, :deep(svg) {
    display: block;
}
</style>