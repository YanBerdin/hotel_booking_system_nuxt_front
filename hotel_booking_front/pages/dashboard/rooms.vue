<template>
    <div>
        <div class="flex w-screen flex-row">
            <!-- first div here    -->
            <!-- side menu -->
            
            <SideNav class="hidden sm:block sm:w-1/6 h-screen bg-purple-600" :page="routeName" />
            <!-- main display -->
            <!-- second div here -->
            <div class="w-full overflow-x-hidden md:w-5/6 h-screen">
                <div class="w-screen h-10 m-8">
                    <h1 class="font-black">All Rooms</h1>
                </div>
                <div class="w-4/5 mx-auto min-h-screen">
                    <!-- Affichage des statistiques -->
                    <div class="block sm:grid sm:grid-cols-2 sm:gap-4 mb-10 items-center justify-center">
                        <div class="mb-10 sm:mb-0 w-full rounded-xl p-10 bg-pink-300">
                            <h2 class="text-xl font-bold mb-4">Chambres disponibles</h2>
                            <p class="text-3xl font-black">{{ availableRooms.length }}</p>
                        </div>
                        <div class="mb-10 sm:mb-0 w-full rounded-xl p-10 bg-green-300">
                            <h2 class="text-xl font-bold mb-4">Chambres occupées</h2>
                            <p class="text-3xl font-black">{{ occupiedRooms.length }}</p>
                        </div>
                    </div>
                    
                    <!-- Loading indicator -->
                    <div v-if="isLoading" class="w-full rounded-xl mb-20 p-10 text-center">
                        <Loading />
                    </div>
                    
                    <!-- Erreur -->
                    <div v-else-if="error" class="w-full rounded-xl mb-20 p-10 bg-red-200 text-red-800">
                        <p>{{ error }}</p>
                    </div>
                    
                    <!-- Liste des chambres -->
                    <div v-else class='w-full rounded-xl mb-20 p-10 bg-blue-100'>
                        <h2 class="text-2xl font-bold mb-6">Liste des chambres</h2>
                        <div v-if="rooms.length === 0" class="text-center p-5">
                            <p>Aucune chambre disponible</p>
                        </div>
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="room in rooms" :key="room.id" 
                                 class="p-4 rounded-lg shadow-md" 
                                 :class="room.occupied ? 'bg-red-50' : 'bg-green-50'">
                                <p class="text-lg font-bold">Chambre {{ room.roomNo }}</p>
                                <p>Type: {{ room.type }}</p>
                                <p>Prix: {{ room.price }} €</p>
                                <p>Status: <span :class="room.occupied ? 'text-red-500' : 'text-green-500'">
                                    {{ room.occupied ? 'Occupée' : 'Disponible' }}
                                </span></p>
                                <div v-if="room.occupied && room.guest" class="mt-2 p-2 bg-gray-100 rounded">
                                    <p class="font-semibold">Occupée par: {{ room.guest.fullname }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- end of second div -->
        </div>
    </div>
</template>
<script setup>
// Définition du middleware d'authentification
definePageMeta({
  middleware: ['auth']
})

import { ref, computed, onMounted } from 'vue'
import { useRoomsStore } from '~/stores/rooms'

const routeName = ref('rooms')
const error = ref(null)
const isLoading = ref(true)

// Utilisation du store Pinia pour les chambres
const roomsStore = useRoomsStore()
const rooms = computed(() => roomsStore.allRooms)

// Computed properties pour les statistiques
const availableRooms = computed(() => rooms.value.filter(room => !room.occupied))
const occupiedRooms = computed(() => rooms.value.filter(room => room.occupied))

// Récupération des chambres via le store
const fetchRooms = async () => {
  try {
    isLoading.value = true
    error.value = null
    await roomsStore.fetchRooms()
  } catch (err) {
    error.value = "Erreur lors de la récupération des chambres"
    console.error('Erreur lors de la récupération des chambres:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>
<style scoped>
</style>