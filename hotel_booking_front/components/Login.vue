<template>
    <div class="grid w-4/5 md:w-3/5 mx-auto items-center justify-center h-screen">
        <!-- Ajout du composant de statut d'authentification -->
        <AuthStatus />
        
        <div class="w-full">
            <h1 class="font-black text-6xl mb-10">Welcome Admin</h1>
            <form @submit.prevent="login">
                <div class="">
                    <label for="username" class="w-full my-3">Username</label>
                    <input id="username" v-model="username" placeholder="Enter Username" type="text" class="w-full my-3 p-3 border-2">
                </div>
                <div class="">
                    <label for="password" class="my-3">Password</label> 
                    <span class=""> 
                        <FontAwesomeIcon v-if="!passwordVisible" :icon="['fas', 'eye']" class="cursor-pointer w-5" @click='switchVisibility' />
                        <FontAwesomeIcon v-if="passwordVisible" :icon="['fas', 'eye-slash']" class="cursor-pointer text-gray-400 w-5" @click='switchVisibility' />
                    </span>
                    <div class=""> 
                        <input 
                            id="password" 
                            v-model="password" placeholder="Enter password" 
                            :type="passwordFieldType" 
                            class="my-3 p-3 border-2 w-full"
                        >
                        
                    </div>
                </div>
                <div v-if="error" class="my-3 p-2 bg-red-100 text-red-700 rounded">
                    {{ error }}
                </div>
                <button type="submit" class="flex items-center justify-center p-4 bg-blue-500 text-white my-3 rounded-lg" :disabled="loading">
                    <span v-if="loading">Connexion en cours...</span>
                    <span v-else>Login <FontAwesomeIcon class="mx-3" :icon="['fas', 'arrow-right']" /></span>
                </button>              
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'nuxt/app'
import { useAuth as useAuthComposable } from '#imports'
import AuthStatus from '@/components/AuthStatus.vue'

const router = useRouter()
const { signIn, status } = useAuthComposable()

const username = ref('')
const password = ref('')
const passwordFieldType = ref('password')
const passwordVisible = ref(false)
const error = ref('')
const loading = ref(false)

const login = async () => {
    error.value = ''
    loading.value = true
    
    try {
        // Utilisation de la nouvelle méthode d'authentification
        const result = await signIn('credentials', {
            username: username.value,
            password: password.value,
            redirect: false
        })
        
        if (result?.error) {
            error.value = "Identifiants incorrects"
        } else {
            // Redirection après connexion réussie
            router.push('/dashboard/guests')
        }
    } catch (e) {
        error.value = "Une erreur est survenue lors de la connexion"
        console.error(e)
    } finally {
        loading.value = false
    }
}

const switchVisibility = () => {
    passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
    passwordVisible.value = !passwordVisible.value
}

// Vérifier si l'utilisateur est déjà connecté
onMounted(() => {
    if (status.value === 'authenticated') {
        router.push('/dashboard/guests')
    }
})
</script>

<style scoped>
</style>