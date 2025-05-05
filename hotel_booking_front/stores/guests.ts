import { defineStore } from 'pinia'

// Définition des interfaces pour typer correctement les données
export interface Guest {
  id: number;
  fullname: string;
  email: string;
  checkIn: string;
  leaveDate: string;
  roomNo: number;
  status: 'active' | 'checked-out';
  paid: boolean;
  [key: string]: any; // Pour permettre d'autres propriétés
}

// Interface qui correspond à la structure de données retournée par Strapi
interface StrapiGuest {
  id: number;
  attributes: {
    fullname: string;
    email: string;
    checkIn: string;
    leaveDate: string;
    roomNo: number;
    status: 'active' | 'checked-out';
    paid: boolean;
    [key: string]: any;
  }
}

// Interface pour la réponse Strapi
interface StrapiResponse<T> {
  data: T;
  meta?: unknown;
}

// Interface pour la réponse Strapi avec plusieurs éléments
interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: unknown;
}

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
        
        // Ajout d'un invité avec le token d'authentification
        const { data, error } = await useFetch<StrapiResponse<StrapiGuest>>(`${useRuntimeConfig().public.strapiUrl}/api/guests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({ data: guest })
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          throw new Error('Pas de données retournées par l\'API');
        }
        
        // Conversion de la réponse Strapi vers notre format Guest
        const strapiData = data.value.data;
        const { id, ...otherAttributes } = strapiData.attributes || {};
        
        const newGuest = {
          id: strapiData.id, // On utilise uniquement l'id de la racine
          ...otherAttributes
        } as Guest;
        
        this.guests.push(newGuest)
        return newGuest
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un invité:', error)
        throw error
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
        status: 'checked-out'
      })
    }
  }
})