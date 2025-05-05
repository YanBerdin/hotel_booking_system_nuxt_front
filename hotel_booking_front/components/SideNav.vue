<template>
    <div>
        <!-- side nav -->
        <div class=" ">
            <div class="">
                <NuxtLogo class="w-20 mx-auto" />
            </div>
            <div class="text-white text-center w-full mb-5">
                <NuxtLink to="/dashboard">
                    <div :ref="el => navRefs.index = el" class="p-5 w-1/3 text-xl mx-auto rounded-full">
                        <FontAwesomeIcon :icon="['fas', 'home']" />
                    </div>
                    <p class="text-sm text-white">Home</p>
                </NuxtLink>
            </div>
            
            <div class="text-white text-center w-full mb-5">
                <NuxtLink to="/dashboard/guests">
                    <div :ref="el => navRefs.guests = el" class="p-5 w-1/3 text-xl mx-auto rounded-full">
                        <FontAwesomeIcon :icon="['fas', 'users']" />
                    </div>
                    <p class="text-sm text-white">Guests</p>
                </NuxtLink>
            </div>
            <div class="text-white text-center w-full my-5">
                <NuxtLink to="/dashboard/rooms">
                    <div :ref="el => navRefs.rooms = el" class="w-1/3 text-xl mx-auto rounded-full p-5">
                        <FontAwesomeIcon :icon="['fas', 'bed']" /> 
                    </div>
                    <p class="text-sm text-white">Rooms</p>
                </NuxtLink>
            </div>
            <div class="text-white text-center cursor-pointer w-full my-7">
                <p @click="logout">Logout</p>
            </div>
        </div>
        <!-- end of first div -->
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'nuxt/app'
import { useAuth as useAuthComposable } from '#imports'

// Définition des props
const props = defineProps({
  page: {
    type: String,
    required: true
  }
})

const router = useRouter()
const { signOut } = useAuthComposable()
const navRefs = reactive({
  index: null,
  guests: null,
  rooms: null
})

// Méthode de déconnexion
const logout = async () => {
  try {
    await signOut({ callbackUrl: '/' })
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    router.push('/')
  }
}

// Application des classes CSS à l'élément actif du menu
onMounted(() => {
  if (props.page && navRefs[props.page]) {
    const item = navRefs[props.page]
    const addClass = ['bg-purple-800', 'shadow-xl']
    addClass.forEach(className => {
      item.classList.add(className)
    })
  }
})
</script>

<style scoped>
</style>