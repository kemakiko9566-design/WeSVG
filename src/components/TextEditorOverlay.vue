<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  x: number; y: number; width: number; height: number
  text: string; fontSize: number; fontFamily: string
  textAlign: string; fill: string
  scale: number
}>()

const emit = defineEmits<{
  save: [text: string]
  close: []
}>()

const inputRef = ref<HTMLTextAreaElement>()

const localText = ref(props.text)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('save', localText.value)
  }
  if (e.key === 'Escape') {
    emit('close')
  }
}

function handleBlur() {
  emit('save', localText.value)
}

onMounted(() => {
  inputRef.value?.focus()
  inputRef.value?.select()
})

// Adjust input style based on transform
const inputStyle = {
  position: 'fixed' as const,
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height + 8}px`,
  fontSize: `${props.fontSize}px`,
  fontFamily: props.fontFamily,
  textAlign: props.textAlign as 'left' | 'center' | 'right',
  color: props.fill || '#000',
  background: 'rgba(255,255,255,0.95)',
  border: '2px solid #FF6A00',
  borderRadius: '4px',
  outline: 'none',
  padding: '4px 8px',
  margin: '0',
  resize: 'none' as const,
  zIndex: '1000',
  overflow: 'hidden',
  lineHeight: '1.4',
  transform: `scale(${1 / props.scale})`,
  transformOrigin: 'top left',
}
</script>

<template>
  <textarea
    ref="inputRef"
    v-model="localText"
    :style="inputStyle"
    @keydown="handleKeydown"
    @blur="handleBlur"
  />
</template>
