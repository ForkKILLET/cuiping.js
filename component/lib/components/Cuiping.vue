<script setup lang="ts">
import { computed, ref } from 'vue'
import { render, SvgRendererOption } from 'cuiping'

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
            }, 500)
        })
}

const imgBase64 = computed(() => 'data:image/svg+xml;base64,'
    + btoa(res.value.data!.svg
        .replace(/[\u00A0-\u2666]/g, c => `&#${c.charCodeAt(0)};`) ?? ''
    )
)

const imgWidth = computed(() => res.value.data!.width * props.imageScale)

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
</script>

<template>
    <div class="root" :class="res.state">
        <div
            v-if="res.state === 'ok'"
            class="container"
            :style="{
                width: res.data.width + 'px',
                height: res.data.height + 'px',
                transform: `scale(${scale})`
            }"
        >
            <img
                v-if="useImage"
                :src="imgBase64"
                :width="imgWidth"
            />
            <div v-else v-html="res.data.svg"></div>
        </div>
        <p v-else-if="res.state === 'error'">{{ res.errMsg }}</p>
        <p v-else>...</p>
        <div class="toolbar">
            <div class="toolbar-inner">
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

.root.ok:hover .toolbar {
    display: block;
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
</style>