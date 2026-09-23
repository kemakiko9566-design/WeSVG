<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore, type EditorMode } from '@/stores/uiStore'

const emit = defineEmits<{
  'back-home': []
  'open-export': []
  'open-device-preview': []
}>()

const projectStore = useProjectStore()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const projectName = computed(() => projectStore.currentProject?.name ?? 'Untitled')

const modes: { key: EditorMode; label: string }[] = [
  { key: 'design', label: 'Design' },
  { key: 'split', label: 'Split' },
  { key: 'code', label: 'Code' },
  { key: 'ai', label: 'AI' },
]

function save() {
  projectStore.saveCurrentProject()
}

function setMode(mode: EditorMode) {
  uiStore.setEditorMode(mode)
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="icon-btn" title="Back to Home" @click="emit('back-home')">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="logo">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#ff6a00" />
          <path d="M8 10h16v3H8zM8 16h12v3H8zM8 22h16v3H8z" fill="white" fill-opacity="0.9" />
        </svg>
        <span class="logo-text">WeSVG</span>
      </div>
      <div class="divider"></div>
      <span class="project-name">{{ projectName }}</span>
    </div>

    <!-- Mode switcher -->
    <div class="mode-switcher">
      <button
        v-for="mode in modes"
        :key="mode.key"
        class="mode-btn"
        :class="{ active: uiStore.editorMode === mode.key }"
        @click="setMode(mode.key)"
      >
        {{ mode.label }}
      </button>
    </div>

    <div class="navbar-right">
      <button class="icon-btn" title="Device Preview" @click="emit('open-device-preview')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </button>
      <button class="icon-btn" title="Save" @click="save">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>
      <div class="divider"></div>
      <button class="btn btn-export" @click="emit('open-export')">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      <button class="btn btn-publish">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        Publish
      </button>
      <div class="avatar"><span>U</span></div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  gap: var(--space-4);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.logo-text {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-primary);
}

.project-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

/* ---- Mode Switcher ---- */
.mode-switcher {
  display: flex;
  gap: 2px;
  background: var(--bg-primary);
  padding: 2px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.mode-btn {
  padding: 4px 14px;
  border-radius: 5px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.mode-btn.active {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
}

.mode-btn:hover:not(.active) {
  color: var(--text-secondary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
}

.btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
}

.btn-export {
  background: var(--bg-panel-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-export:hover {
  background: var(--border-primary);
}

.btn-publish {
  background: var(--accent);
  color: white;
}

.btn-publish:hover {
  background: var(--accent-hover);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--bg-panel-hover);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  margin-left: var(--space-1);
}
</style>
