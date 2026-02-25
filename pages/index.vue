<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const user = useSupabaseUser()

if (user.value) {
  navigateTo('/dashboard', { replace: true })
} else {
  navigateTo('/login', { replace: true })
}
</script>
