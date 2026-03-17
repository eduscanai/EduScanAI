import Carregando from '~/components/Carregando.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Carregando', Carregando)
})
