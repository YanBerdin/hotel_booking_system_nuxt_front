<template>
    <div class="p-10 shadow-xl shadow-yellow-300 w-3/4 sm:w-1/2 rounded-xl max-h-screen">
        <div class="m-2">
            <h1 class="font-black text-yellow-800">New Guest</h1>
        </div>
        <div>
            <form @submit.prevent="newGuest">
                <div class="p-2 text-sm">
                    <label class="font-bold text-yellow-800 text-sm" for="checkin">FullName</label>
                    <input v-model="fullname" type="text" class="py-3 pr-3 w-full border-b-2 border-gray-200 focus:outline-none hover:border-yellow-300">
                </div>
                <div class="p-2 text-sm">
                    <label class="font-bold text-yellow-800 text-sm" for="checkin">Email</label>
                    <input v-model="email" type="email" class="py-3 pr-3 w-full border-b-2 border-gray-200 focus:outline-none hover:border-yellow-300">
                </div>
                <!-- check in and check out -->
                <div class="p-2">
                    <div class="mb-3 text-sm">
                        <label class="font-bold text-yellow-800" for="checkin">Check In</label>
                        <input v-model="checkIn" id="checkin" class="py-3 pr-3 w-full border-b-2 border-gray-200 focus:outline-none hover:border-yellow-300" type="date">
                    </div>
                    <div class="text-sm">
                        <label class="font-bold text-yellow-800 text-sm" for="leavedate">Leave Date</label>
                        <input v-model="leaveDate" id="leavedate" class="py-3 pr-3 w-full border-b-2 border-gray-200 focus:outline-none hover:border-yellow-300" type="date">
                    </div>
                </div>
                
                <div class="text-sm p-2">
                    <label for="rooms" class="text-sm text-yellow-800 font-bold">Select Room</label>
                    <select v-model="roomNo" id="rooms" name="" class="py-3 pr-3 w-full border-b-2 border-gray-200 focus:outline-none hover:border-yellow-300">
                        <option v-for="(room, i) in availableRooms" :key="i" :value="room.roomNo">{{ room.roomNo }}</option>
                    </select>
                </div>
                <div class="my-3">
                    <button class="p-3 bg-green-500 text-white" type="submit" :disabled="loading">
                        <span v-if="loading">En cours...</span>
                        <span v-else>Submit</span>
                    </button>
                    <button class="p-3 bg-red-500 text-white" @click.prevent="cancel">
                        Cancel 
                    </button>
                </div>
                
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGuestsStore } from '~/stores/guests'
import { useRoomsStore } from '~/stores/rooms'

// Récupération des stores
const guestsStore = useGuestsStore()
const roomsStore = useRoomsStore()

// Émission d'événements pour communiquer avec le composant parent
const emit = defineEmits(['guest-added', 'cancel'])

// Déclaration des variables réactives
const fullname = ref('')
const roomNo = ref('')
const checkIn = ref('')
const leaveDate = ref('')
const email = ref('')
const loading = ref(false)

// Computed properties
const availableRooms = computed(() => roomsStore.rooms.filter(el => !el.occupied))

// Méthodes
const newGuest = async () => {
    if (!fullname.value || !roomNo.value || !checkIn.value || !leaveDate.value) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
    }

    loading.value = true
    
    try {
        // Création d'un nouvel invité
        const guestData = {
            fullname: fullname.value,
            checkIn: checkIn.value,
            leaveDate: leaveDate.value,
            roomNo: parseInt(roomNo.value),
            statusfield: 'confirmed',
            paid: true
            // Le champ email a été supprimé car il n'est pas reconnu par l'API
        }
        
        // Ajout de l'invité à la base de données
        const newGuest = await guestsStore.addGuest(guestData)
        
        // Mise à jour de la chambre pour l'occuper
        await roomsStore.setRoomOccupied(parseInt(roomNo.value), newGuest)
        
        // Réinitialisation du formulaire
        resetForm()
        
        // Notification au composant parent
        emit('guest-added', newGuest)
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un invité:', error)
        alert('Une erreur est survenue lors de l\'ajout de l\'invité. Veuillez réessayer.')
    } finally {
        loading.value = false
    }
}

const cancel = () => {
    resetForm()
    emit('cancel')
}

const resetForm = () => {
    fullname.value = ''
    roomNo.value = ''
    checkIn.value = ''
    leaveDate.value = ''
    email.value = ''
}

// Chargement des données au montage du composant
onMounted(async () => {
    if (roomsStore.rooms.length === 0) {
        await roomsStore.fetchRooms()
    }
})
</script>

<style scoped>
</style>