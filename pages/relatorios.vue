<template>
  <div>
    <h1 class="text-heading-1 mb-8">Relatórios</h1>
    <Cartao>
      <p class="text-body text-text-secondary">
        Página de relatórios em desenvolvimento...
      </p>
    </Cartao>
  </div>
</template>

<script setup lang="ts">
import Cartao from '~/components/layout/Cartao/Cartao.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: ['admin', 'pedagogue']
})
</script>
