// Workspace background config
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type WorkspaceBgType = 'color' | 'image' | 'gif'

export const useBackgroundStore = defineStore('background', () => {
  const type = ref<WorkspaceBgType>('color')
  const color = ref('#171717')
  const url = ref('')
  const opacity = ref(1)
  const blur = ref(0)

  function setColor(c: string) {
    type.value = 'color'
    color.value = c
  }
  function setImage(u: string) {
    type.value = 'image'
    url.value = u
  }
  function setGif(u: string) {
    type.value = 'gif'
    url.value = u
  }
  function setOpacity(o: number) {
    opacity.value = o
  }
  function setBlur(b: number) {
    blur.value = b
  }

  return { type, color, url, opacity, blur, setColor, setImage, setGif, setOpacity, setBlur }
})
