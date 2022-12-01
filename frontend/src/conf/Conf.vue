<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Schemas } from './index'

const { t } = useI18n()

type Values = Record<string, any>

const props = defineProps<{
    schemas: Schemas,
    modelValue?: Values
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', values: Values): void
}>()

const defaultValues: Values = {}
for (const k in props.schemas)
    defaultValues[k] = props.schemas[k].def
const values: Values = reactive(defaultValues)

function update() {
    emit('update:modelValue', values)
}
update()
</script>

<template>
    <div class="conf root">
        <li v-for="s, k in schemas">
            <span class="name">{{ t(`conf.${k}`) }}</span>
            <input
                v-if="s.ty === 'boolean'"
                type="checkbox"
                v-model="values[k]"
                @change="update"
            />
            <input
                v-else-if="s.ty === 'number'"
                type="number" :min="s.min" :max="s.max"
                v-model="values[k]"
                @change="update"
            />
            <input
                v-else-if="s.ty === 'color'"
                type="color"
                v-model="values[k]"
                @change="update"
            />
        </li>
    </div>
</template>

<style scoped>
li {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: .1em;
    padding: .2em 1em;
    transition: .3s background-color;
}

li:hover {
    background-color: #d2d2d2;
}

input {
    outline: none;
    background-color: white;
    border: .05em solid black;
    min-width: 0;
}

input[type=color] {
    height: 2em;
}
</style>
