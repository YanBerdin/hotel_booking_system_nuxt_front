import { useAuth as useAuthComposable } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  // Utilise useAuthComposable au lieu de useAuth directement
  const { status } = useAuthComposable()
  
  // Si l'utilisateur n'est pas authentifié et tente d'accéder à une page protégée
  if (status.value !== 'authenticated' && to.path.includes('/dashboard')) {
    // Rediriger vers la page de connexion
    return navigateTo('/login')
  }
})