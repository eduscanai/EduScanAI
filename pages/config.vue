<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin'
})

// Redirecionar para a nova página de configurações
navigateTo('/admin/settings', { replace: true })
</script>
