<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HomePage from './pages/HomePage.vue'
import EditorPage from './pages/EditorPage.vue'
import { useProjectStore } from './stores/projectStore'

const projectStore = useProjectStore()
const currentPage = ref<'home' | 'editor'>('home')

function navigateToEditor() { currentPage.value = 'editor' }
function navigateToHome() { currentPage.value = 'home' }

// Global keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      projectStore.undo()
    }
    if (e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      projectStore.redo()
    }
    if (e.key === 'y') {
      e.preventDefault()
      projectStore.redo()
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <HomePage v-if="currentPage === 'home'" @enter-editor="navigateToEditor" />
  <EditorPage v-else @back-to-home="navigateToHome" />
</template>
