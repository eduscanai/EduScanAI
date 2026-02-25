<template>
  <div
    :class="[
      'rounded-full overflow-hidden flex items-center justify-center',
      classeAvatar
    ]"
    :style="estiloAvatar"
  >
    <img
      v-if="image"
      :src="image"
      :alt="alt"
      class="w-full h-full object-cover"
    />
    <svg v-else class="text-gray-500" :width="tamanhoIcone" :height="tamanhoIcone" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PropriedadesAvatar {
  image?: string
  alt?: string
  size?: number
  borderColor?: string
  borderWidth?: number
}

const props = withDefaults(defineProps<PropriedadesAvatar>(), {
  alt: 'Avatar',
  size: 40,
  borderWidth: 2
})

const classeAvatar = computed(() => {
  return 'bg-gray-200'
})

const estiloAvatar = computed(() => {
  const styles: Record<string, string> = {
    width: `${props.size}px`,
    height: `${props.size}px`
  }

  if (props.borderColor) {
    styles.border = `${props.borderWidth}px solid ${props.borderColor}`
  }

  return styles
})

const tamanhoIcone = computed(() => {
  return Math.round(props.size * 0.6)
})
</script>
