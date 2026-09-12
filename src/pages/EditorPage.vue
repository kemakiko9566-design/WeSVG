<script setup lang="ts">
import { ref } from 'vue'
import TopNavigationBar from '@/components/TopNavigationBar.vue'
import LeftSidebar from '@/components/LeftSidebar.vue'
import SplitEditor from '@/components/SplitEditor.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import BottomStatusBar from '@/components/BottomStatusBar.vue'
import ExportDialog from '@/components/ExportDialog.vue'
import DevicePreview from '@/components/DevicePreview.vue'
import { useUIStore } from '@/stores/uiStore'

const emit = defineEmits<{
  'back-to-home': []
}>()

const uiStore = useUIStore()
const showExport = ref(false)
const showDevicePreview = ref(false)
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

function openExport() { showExport.value = true }
function closeExport() { showExport.value = false }
function openDevicePreview() { showDevicePreview.value = true }
function closeDevicePreview() { showDevicePreview.value = false }
</script>

<template>
  <div class="editor">
    <TopNavigationBar
      @back-home="emit('back-to-home')"
      @open-export="openExport"
      @open-device-preview="openDevicePreview"
    />

    <div class="editor-body">
      <!-- Sidebars only visible in design/split mode -->
      <LeftSidebar
        v-if="uiStore.editorMode === 'design' || uiStore.editorMode === 'split'"
        :collapsed="leftCollapsed"
        @toggle="leftCollapsed = !leftCollapsed"
      />

      <main class="main-area">
        <SplitEditor />
      </main>

      <RightSidebar
        v-if="uiStore.editorMode === 'design' || uiStore.editorMode === 'split'"
        :collapsed="rightCollapsed"
        @toggle="rightCollapsed = !rightCollapsed"
      />
    </div>

    <BottomStatusBar />

    <ExportDialog v-if="showExport" @close="closeExport" />
    <DevicePreview v-if="showDevicePreview" @close="closeDevicePreview" />
  </div>
</template>

<style scoped>
.editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-area {
  flex: 1;
  overflow: hidden;
}
</style>
