// @ts-nocheck - Désactivation temporaire des vérifications de type à cause d'incompatibilités
import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from '@auth/core/providers/credentials'

// Accès à la configuration runtime de Nuxt
const config = useRuntimeConfig()

export default NuxtAuthHandler({
  // Secret pour signer les cookies et les jetons JWT
  secret: config.authSecret,
  
  // Configuration des fournisseurs d'authentification
  providers: [
    // Configuration pour l'authentification par identifiants (username/password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // URL de l'API Strapi pour l'authentification
          const strapiUrl = config.public.strapiUrl || 'http://localhost:1337';
          
          // Appel à l'API d'authentification Strapi
          const response = await fetch(`${strapiUrl}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials?.username,
              password: credentials?.password
            })
          });
          
          const data = await response.json();
          
          // Vérification de la réponse Strapi
          if (response.ok && data.jwt && data.user) {
            // Retourner les données de l'utilisateur pour créer la session
            return {
              id: data.user.id.toString(),
              name: data.user.username,
              email: data.user.email,
              jwt: data.jwt // Stocker le JWT pour les requêtes API futures
            };
          }
          
          // En cas d'échec d'authentification
          return null;
        } catch (error) {
          console.error('Erreur d\'authentification avec Strapi:', error);
          return null;
        }
      }
    })
  ],
  // Pages personnalisées
  pages: {
    signIn: '/login',
  },
  // Configuration des callbacks
  callbacks: {
    // Ajouter le JWT à la session pour les requêtes API
    async session({ session, token }) {
      if (token?.jwt) {
        session.jwt = token.jwt;
      }
      return session;
    },
    // Sauvegarder le JWT dans le token
    async jwt({ token, user }) {
      if (user?.jwt) {
        token.jwt = user.jwt;
      }
      return token;
    }
  }
})
