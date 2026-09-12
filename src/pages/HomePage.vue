<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

const emit = defineEmits<{
  'enter-editor': []
}>()

const projectStore = useProjectStore()
const newProjectName = ref('')

const projects = ref(projectStore.getProjectList())

function loadProjects() {
  projects.value = projectStore.getProjectList()
}

function createProject() {
  const name = newProjectName.value.trim() || `New Project ${Date.now().toString(36)}`
  projectStore.createProject(name)
  newProjectName.value = ''
  loadProjects()
  emit('enter-editor')
}

async function openProject(id: string) {
  await projectStore.loadProject(id)
  emit('enter-editor')
}

function deleteProject(id: string) {
  projectStore.deleteProject(id)
  loadProjects()
}

loadProjects()
</script>

<template>
  <div class="home">
    <header class="home-header">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#ff6a00"/>
          <path d="M8 10h16v3H8zM8 16h12v3H8zM8 22h16v3H8z" fill="white" fill-opacity="0.9"/>
        </svg>
        <div class="logo-text">
          <h1>WeSVG Studio</h1>
          <p>AI-powered WeChat SVG Editor</p>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="create-section">
        <h2>New Project</h2>
        <div class="create-form">
          <input
            v-model="newProjectName"
            type="text"
            placeholder="Project name (optional)"
            class="input"
            @keyup.enter="createProject"
          />
          <button class="btn btn-primary" @click="createProject">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create
          </button>
        </div>
      </section>

      <section class="projects-section">
        <h2>Recent Projects</h2>
        <div v-if="projects.length === 0" class="empty-state">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No projects yet. Create one to get started.</p>
        </div>
        <div v-else class="project-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card"
            @click="openProject(project.id)"
          >
            <div class="project-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              <div>
                <h3>{{ project.name }}</h3>
                <p>{{ new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</p>
              </div>
            </div>
            <button class="btn-delete" @click.stop="deleteProject(project.id)" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.home-header {
  padding: var(--space-8) var(--space-12);
  border-bottom: 1px solid var(--border-primary);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.logo-text h1 {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  letter-spacing: -0.4px;
  margin: 0;
}

.logo-text p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 2px 0 0;
}

.home-main {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6);
  width: 100%;
  overflow-y: auto;
}

.create-section {
  margin-bottom: var(--space-10);
}

.create-section h2,
.projects-section h2 {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: var(--space-4);
}

.create-form {
  display: flex;
  gap: var(--space-3);
}

.input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-panel);
  font-size: var(--text-md);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:focus {
  border-color: var(--accent);
}

.btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.project-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-4);
  background: var(--bg-panel);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.project-card:hover {
  border-color: var(--accent);
  background: var(--bg-panel-hover);
}

.project-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-tertiary);
}

.project-info h3 {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  margin: 0 0 2px;
}

.project-info p {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0;
}

.btn-delete {
  display: flex;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  opacity: 0;
  transition: all var(--transition-fast);
}

.project-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-4);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  text-align: center;
}
</style>
