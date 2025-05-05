import { defineStore } from 'pinia'
import type { Guest, StrapiGuest, StrapiResponse, StrapiCollectionResponse } from '~/types/guest'

export const useGuestsStore = defineStore('guests', {
  state: () => ({
    guests: [] as Guest[]
  }),
  getters: {
    allGuests: (state) => state.guests
  },
  actions: {
    // Fonction utilitaire pour obtenir l'en-tête d'autorisation
    async getAuthHeader() {
      // Obtenir le token de l'API Strapi
      const config = useRuntimeConfig();
      const token = config.public.strapiToken || '';
      
      try {
        // Essayer d'obtenir la session utilisateur si disponible
        const { status, data } = useAuth();
        
        if (status.value === 'authenticated' && data.value) {
          // Accéder au JWT de manière sécurisée en utilisant as any pour éviter les erreurs TypeScript
          const sessionData = data.value as any;
          const jwtToken = sessionData?.jwt || 
                          sessionData?.token?.jwt ||
                          sessionData?.user?.jwt || 
                          '';
          
          if (jwtToken) {
            return {
              Authorization: `Bearer ${jwtToken}`
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session :', error);
      }
      
      // Fallback sur le token API
      return {
        Authorization: `Bearer ${token}`
      };
    },
    
    async fetchGuests() {
      try {
        // Obtenir les en-têtes d'autorisation avec le token JWT
        const headers = await this.getAuthHeader();
        
        // Récupération des invités avec le token d'authentification
        const { data, error } = await useFetch<StrapiCollectionResponse<StrapiGuest>>(`${useRuntimeConfig().public.strapiUrl}/api/guests`, {
          headers
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          this.guests = [];
          return;
        }
        
        // Conversion des données de la réponse Strapi vers notre format Guest
        this.guests = (data.value.data || []).map((item) => {
          // On extrait les attributs sans inclure id s'il existe dans attributes
          const { id, ...otherAttributes } = item.attributes || {};
          
          return {
            id: item.id, // On utilise uniquement l'id de la racine
            ...otherAttributes
          } as Guest;
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des invités:', error)
      }
    },
    
    async addGuest(guest: Partial<Guest>) {
      try {
        // Obtenir les en-têtes d'autorisation avec le token JWT
        const headers = await this.getAuthHeader();
        console.log('Headers d\'autorisation:', headers);
        
        // S'assurer que toutes les propriétés sont du bon type avant l'envoi
        const guestData = {
          ...guest,
          roomNo: typeof guest.roomNo === 'string' ? parseInt(guest.roomNo as string) : guest.roomNo,
          paid: guest.paid === undefined ? true : guest.paid,
          statusfield: guest.statusfield || 'confirmed'
        };
        
        console.log('Données de l\'invité à envoyer:', guestData);
        console.log('Payload complet:', JSON.stringify({ data: guestData }));
        
        // Utiliser $fetch au lieu de useFetch comme recommandé par Nuxt
        try {
          // Étape 1: Créer l'invité
          const responseData = await $fetch<StrapiResponse<StrapiGuest>>(`${useRuntimeConfig().public.strapiUrl}/api/guests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            body: { data: guestData }
          });
          
          console.log('Réponse complète du serveur:', responseData);
          
          // Étape 2: Publier immédiatement l'invité pour éviter la duplication
          if (responseData.data && responseData.data.id) {
            try {
              await $fetch(`${useRuntimeConfig().public.strapiUrl}/api/guests/${responseData.data.id}/actions/publish`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...headers
                }
              });
              console.log('Invité publié avec succès');
            } catch (publishError) {
              console.warn('Impossible de publier l\'invité automatiquement:', publishError);
              // On continue même si la publication échoue
            }
          }
          
          // Si succès, traiter la réponse
          const strapiData = responseData.data;
          const { id, ...otherAttributes } = strapiData.attributes || {};
          
          const newGuest = {
            id: strapiData.id,
            ...otherAttributes
          } as Guest;
          
          this.guests.push(newGuest);
          console.log('Nouvel invité ajouté au store:', newGuest);
          return newGuest;
          
        } catch (fetchError: any) {
          console.error('Erreur détaillée:', fetchError);
          
          // Afficher les détails de l'erreur s'ils sont disponibles
          if (fetchError.response) {
            console.error("Réponse d'erreur:", fetchError.response._data || fetchError.response);
          }
          
          throw new Error(`Erreur API: ${fetchError.message || 'Erreur inconnue lors de l\'ajout d\'un invité'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un invité:', error);
        throw error;
      }
    },
    
    async updateGuest(id: number, guestData: Partial<Guest>) {
      try {
        // Obtenir les en-têtes d'autorisation avec le token JWT
        const headers = await this.getAuthHeader();
        
        // Mise à jour d'un invité avec le token d'authentification
        const { data: responseData, error } = await useFetch<StrapiResponse<StrapiGuest>>(`${useRuntimeConfig().public.strapiUrl}/api/guests/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ data: guestData })
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!responseData.value) {
          throw new Error('Pas de données retournées par l\'API');
        }
        
        // Conversion de la réponse Strapi vers notre format Guest
        const strapiData = responseData.value.data;
        const { id: attributeId, ...otherAttributes } = strapiData.attributes || {};
        
        const updatedGuest = {
          id: strapiData.id, // On utilise uniquement l'id de la racine
          ...otherAttributes
        } as Guest;
        
        const index = this.guests.findIndex(g => g.id === id)
        if (index !== -1) {
          this.guests[index] = updatedGuest
        }
        return updatedGuest
      } catch (error) {
        console.error('Erreur lors de la mise à jour d\'un invité:', error)
        throw error
      }
    },
    
    async checkOutGuest(guest: Guest) {
      return await this.updateGuest(guest.id, {
        statusfield: 'checked-out' // Corrigé de 'inactive' à 'checked-out' pour correspondre à l'interface
      })
    }
  }
})