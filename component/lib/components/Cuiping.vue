<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { render, SvgRendererOption } from 'cuiping'
import { Canvg } from 'canvg'
import SvgWrapper from './SvgWrapper.vue'

const props = withDefaults(defineProps<{
    molecule?: string,
    useImage?: boolean,
    imageScale?: number,
    renderOptions?: SvgRendererOption
}>(), {
    useImage: false,
    imageScale: 1
})

const res = computed(() => {
    if (! props.molecule) return { state: 'empty' as const }

    let errMsg: string = ''

    const data = render(props.molecule, {
        onError: err => {
            errMsg = err.toString()
            console.warn(err)
        },
        renderer: 'svg',
        rendererOptions: props.renderOptions ?? {}
    })

    if (data) return {
        state: 'ok' as const,
        data
    }

    else return {
        state: 'error' as const,
        errMsg
    }
})

function downloadSvg() {
    if (res.value.state !== 'ok') return

    const blob = new Blob([ res.value.data.svg ])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = `${res.value.data.id}.svg`
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
}

const copyState = ref<'Copying...' | 'Copied' | 'Cuiping'>('Cuiping')

function copyFormula() {
    if (copyState.value !== 'Cuiping') return
    copyState.value = 'Copying...'
    if (props.molecule) navigator.clipboard
        .writeText(props.molecule)
        .finally(() => {
            copyState.value = 'Copied'
            setTimeout(() => {
                copyState.value = 'Cuiping'
            }, 700)
        })
}

const scale = ref(1)
function zoomIn() {
    if (scale.value > 2)
        scale.value -= 0.5
    else if (scale.value > 1)
        scale.value -= 0.25
}
function zoomOut() {
    if (scale.value < 2)
        scale.value += 0.25
    else if (scale.value < 4)
        scale.value += 0.5
}

const canvas = ref<HTMLCanvasElement>()
const canvasDataUrl = ref<string>()
const redrawCounter = ref(0)
let canvg: Canvg

const redraw = () => {
    redrawCounter.value ++
}

watch([ canvas, props, redrawCounter ], () => {
    if (canvas.value && props.useImage && props.molecule && res.value.state === 'ok') {
        const svg = res.value.data.svg
            .replace(/width="([\d.]+)"/, (_, w) => `width="${w * props.imageScale}"`)
            .replace(/height="([\d.]+)"/, (_, h) => `height="${h * props.imageScale}"`)
        if (canvg) canvg.stop()
        const ctx = canvas.value.getContext('2d')!
        canvg = Canvg.fromString(ctx, svg)
        canvg.start()
        canvasDataUrl.value = canvas.value.toDataURL()
    }
})

defineExpose({
    res, redraw
})
</script>

<template>
    <div class="root" :class="res.state">
        <div
            v-if="res.state === 'ok'"
            class="container"
            :style="{
                width: res.data.width + 'px',
                height: res.data.height + 'px',
                transform: `scale(${scale})`,
                transformOrigin: 'left top'
            }"
            :class="{ glowing: scale !== 1 }"
        >
            <div
                v-if="useImage"
                :style="{
                    transform: useImage ? `scale(${1 / imageScale})` : undefined,
                    transformOrigin: 'left top'
                }"
            >
                <canvas ref="canvas"></canvas>
                <img :src="canvasDataUrl" />
            </div>
            <SvgWrapper v-else :svg="res.data.svg" :key="redrawCounter"></SvgWrapper>
        </div>
        <p v-else-if="res.state === 'error'">{{ res.errMsg }}</p>
        <p v-else>...</p>
        <div class="toolbar-outer">
            <div class="toolbar">
                <div class="toolbar-inner glowing">
                    <button @click="zoomOut">+</button>
                    <button @click="scale = 1">{{ scale * 100 }}%</button>
                    <button @click="zoomIn">-</button>
                    <button @click="downloadSvg">SVG</button>
                    <button @click="copyFormula">
                        {{ copyState }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container.glowing {
    box-shadow: 0 0 4px 0 #eee;
}
.toolbar-inner.glowing {
    box-shadow: 0 0 8px 0 #aaa;
}

.error {
    color: red;
}

.toolbar-outer {
    position: absolute;
    z-index: 1;
    top: -14px;
    left: 100%;
    height: 100%;
    width: min-content;
    box-sizing: border-box;
}

.toolbar {
    user-select: none;
    overflow: hidden;
    width: 0px;
    padding: 8px;
    box-sizing: border-box;
    transition: .2s width ease-in-out;
}

.toolbar-inner {
    display: inline-flex;
    margin: 0 16px;
    background-color: white;
    border-radius: 1em;
    overflow: hidden;
    height: 2em;
}

.toolbar button {
    background: none;
    border: none;
    outline: none;
    color: #1f1a1a;
    font-size: .8em;
    transition: .3s background-color;
    min-width: 2em;
    cursor: pointer;
}

.toolbar button:first-child {
    padding-left: .8em;
}

.toolbar button:last-child {
    padding-right: .8em;
}

.toolbar button:hover {
    background-color: #eee;
}

.root.ok:hover .toolbar {
    width: 100%;
}

.root {
    position: relative;
    display: inline-block;
}

.container {
    background: white;
}

img, :deep(svg) {
    display: block;
}

canvas {
    visibility: hidden;
    position: absolute;
}
</style>
