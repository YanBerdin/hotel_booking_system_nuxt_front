<template>
  <div class="auth-status p-4 bg-gray-100 rounded-lg mb-4">
    <h3 class="font-bold mb-2">État d'authentification :</h3>
    <div>
      <p>Statut : <span :class="statusClass">{{ status }}</span></p>
      <p v-if="user">Utilisateur connecté : {{ user.name || user.email }}</p>
      <p v-else>Aucun utilisateur connecté</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth as useAuthComposable } from '#imports'

const { status, data } = useAuthComposable()

const user = computed(() => data.value?.user)
const statusClass = computed(() => {
  return {
    'text-green-600 font-bold': status.value === 'authenticated',
    'text-red-600': status.value === 'unauthenticated',
    'text-yellow-600': status.value === 'loading'
  }
})
</script>

<style scoped>
.auth-status {
  max-width: 400px;
}
</style>