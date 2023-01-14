<script setup lang="ts">
defineProps<{
    svg: string
}>()
</script>

<template>
    <div v-html="svg"></div>
</template>
