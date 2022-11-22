<script setup lang="ts">
import { ref } from 'vue'
import Cuiping from './components/Cuiping.vue'

const molecule = ref<string | void>()
</script>

<template>
    <p>Cuiping.js</p>

    <input v-model="molecule" />

    <Cuiping :molecule="molecule" />
</template>
