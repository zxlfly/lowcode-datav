<script setup lang="ts">
import { ref } from "vue"
import Editor from "./packages/editor/editor.tsx"
import initDataJson from "./data.json"
import DataSchema from "./config.ts"
const data = new DataSchema(initDataJson)

const state = ref(data)
</script>

<template>
    <Editor v-model="state" />
</template>

<style scoped lang="scss"></style>
