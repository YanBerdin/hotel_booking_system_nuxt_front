// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/strapi',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    // Variables disponibles côté serveur uniquement
    authSecret: process.env.NUXT_AUTH_SECRET,
    // Variables exposées publiquement (côté client)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      strapiToken: process.env.STRAPI_API_TOKEN || '',
    }
  },
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v4',
    cookie: {}
    // La propriété 'entities' a été supprimée car elle n'existe pas dans le type ModuleOptions
  },
  auth: {
    provider: {
      type: 'authjs'
    },
    globalAppMiddleware: {
      isEnabled: false
    }
  },
  // Configuration pour résoudre le problème avec le module qs
  vite: {
    optimizeDeps: {
      include: ['qs']
    },
    build: {
      commonjsOptions: {
        // Cela aide à résoudre certains problèmes d'importation avec CommonJS
        transformMixedEsModules: true
      }
    }
  }
})
