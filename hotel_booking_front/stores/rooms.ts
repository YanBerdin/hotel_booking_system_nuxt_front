import { defineStore } from 'pinia'
import type { Guest } from './guests'

// Définition d'une interface pour les chambres
export interface Room {
  id: number;
  roomNo: number;
  occupied: boolean;
  guest: Guest | null;
  type: string;
  price: number;
  [key: string]: any; // Pour permettre d'autres propriétés
}

// Interface qui correspond à la structure de données retournée par Strapi
interface StrapiRoom {
  id: number;
  attributes: {
    roomNo: number;
    occupied: boolean;
    guest: Guest | null;
    type: string;
    price: number;
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
    getAuthHeader() {
      const config = useRuntimeConfig();
      const token = config.public.strapiToken || '';
      return {
        Authorization: `Bearer ${token}`
      };
    },
    
    async fetchRooms() {
      try {
        // Récupération des chambres avec le token d'API
        const { data, error } = await useFetch<StrapiCollectionResponse<StrapiRoom>>(`${useRuntimeConfig().public.strapiUrl}/api/rooms`, {
          headers: this.getAuthHeader()
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          this.rooms = [];
          return;
        }
        
        // Conversion des données de la réponse Strapi vers notre format Room
        this.rooms = (data.value.data || []).map((item) => {
          // On extrait les attributs sans inclure id s'il existe dans attributes
          const { id, ...otherAttributes } = item.attributes || {};
          
          return {
            id: item.id, // On utilise uniquement l'id de la racine
            ...otherAttributes
          } as Room;
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des chambres:', error)
      }
    },
    
    async updateRoom(id: number, roomData: Partial<Room>) {
      try {
        // Mise à jour d'une chambre avec le token d'API
        const { data, error } = await useFetch<StrapiResponse<StrapiRoom>>(`${useRuntimeConfig().public.strapiUrl}/api/rooms/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeader()
          },
          body: JSON.stringify({ data: roomData })
        });
        
        if (error.value) {
          throw new Error(`Erreur API: ${error.value.message}`);
        }
        
        if (!data.value) {
          throw new Error('Pas de données retournées par l\'API');
        }
        
        // Conversion de la réponse Strapi vers notre format Room
        const strapiData = data.value.data;
        const { id: attributeId, ...otherAttributes } = strapiData.attributes || {};
        
        const updatedRoom = {
          id: strapiData.id, // On utilise uniquement l'id de la racine
          ...otherAttributes
        } as Room;
        
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