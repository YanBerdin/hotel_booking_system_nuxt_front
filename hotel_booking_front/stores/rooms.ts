import { defineStore } from 'pinia'
import type { Guest } from './guests'

// Définition d'une interface pour les chambres adaptée à la structure réelle de l'API
export interface Room {
  id: number;
  documentId: string;
  type: string;
  occupied: boolean | null;
  roomNo: number;
  beds: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  guest?: Guest | null;
  price?: number;
}

// Interface pour la réponse Strapi adaptée à votre API
interface StrapiResponse {
  data: Room[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  };
}

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [] as Room[]
  }),
  getters: {
    allRooms: (state) => state.rooms,
    availableRooms: (state) => state.rooms.filter(room => !room.occupied)
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
          // Log de la session pour debug
          console.log('Session data:', data.value);
          
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
    
    async fetchRooms() {
      try {
        // Obtenir les en-têtes d'autorisation avec le token JWT
        const headers = await this.getAuthHeader();
        
        // Récupération des chambres avec le token d'authentification
        const { data, error } = await useFetch<StrapiResponse>(`${useRuntimeConfig().public.strapiUrl}/api/rooms`, {
          headers
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          this.rooms = [];
          return;
        }
        
        // La structure de l'API est déjà adaptée, pas besoin de transformation complexe
        this.rooms = data.value.data;
        
        // Ajout de prix par défaut si non défini (pour la compatibilité avec le code existant)
        this.rooms.forEach(room => {
          if (room.price === undefined) {
            // Prix par défaut basé sur le type de chambre
            room.price = room.type === 'vip' ? 200 : 100;
          }
        });
        
        console.log("Chambres chargées:", this.rooms);
      } catch (error) {
        console.error('Erreur lors de la récupération des chambres:', error)
      }
    },
    
    async updateRoom(id: number, roomData: Partial<Room>) {
      try {
        // Obtenir les en-têtes d'autorisation avec le token JWT
        const headers = await this.getAuthHeader();
        
        // Mise à jour d'une chambre avec le token d'authentification
        const { data, error } = await useFetch<{data: Room}>(`${useRuntimeConfig().public.strapiUrl}/api/rooms/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(roomData)
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          throw new Error('Pas de données retournées par l\'API');
        }
        
        const updatedRoom = data.value.data;
        
        const index = this.rooms.findIndex(r => r.id === id)
        if (index !== -1) {
          this.rooms[index] = updatedRoom
        }
        return updatedRoom
      } catch (error) {
        console.error('Erreur lors de la mise à jour d\'une chambre:', error)
        throw error
      }
    },
    
    async setRoomOccupied(roomNo: number, guest: Guest) {
      const room = this.rooms.find(r => r.roomNo === roomNo)
      if (room) {
        return await this.updateRoom(room.id, {
          occupied: true,
          guest
        })
      }
    },
    
    async setRoomAvailable(roomNo: number) {
      const room = this.rooms.find(r => r.roomNo === roomNo)
      if (room) {
        return await this.updateRoom(room.id, {
          occupied: false,
          guest: null
        })
      }
    }
  }
})