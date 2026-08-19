// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Configuração de TypeScript
  typescript: {
    strict: true,
    typeCheck: false // Desabilitado para evitar problemas com vite-plugin-checker
  },

  // Auto-imports configurados
  imports: {
    dirs: ['stores', 'composables', 'utils']
  },

  // Componentes auto-importados pelo nome do arquivo (sem prefixo de pasta)
  components: {
    pathPrefix: false
  },

  // CSS global
  css: ['~/assets/styles/main.css'],

  // Configuração do app
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap'
        }
      ]
    }
  },

  // Configuração de build
  build: {
    transpile: []
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],

  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/login', '/cadastro', '/confirm']
    }
  },

  // Pinia store configuration
  pinia: {
    storesDirs: ['./stores/**']
  },

  // Config de servidor (não exposta ao client) para o microserviço de
  // correção OMR (ver /service no repo omrchecker). Sem valor padrão de
  // produção de propósito — defina OMR_SERVICE_URL/OMR_SERVICE_TOKEN no
  // ambiente antes de habilitar o módulo de Simulados.
  runtimeConfig: {
    omrServiceUrl: process.env.OMR_SERVICE_URL || 'http://127.0.0.1:8010',
    omrServiceToken: process.env.OMR_SERVICE_TOKEN || ''
  }
})
