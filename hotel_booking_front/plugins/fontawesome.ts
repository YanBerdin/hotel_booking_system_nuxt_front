import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faHome, faUsers, faBed, faPlus, faCircle, 
  faBell, faArrowRight, faEye, faEyeSlash,
  faEdit, faTrashAlt, faEnvelope, faPhone
} from '@fortawesome/free-solid-svg-icons'

// Cette fonction est automatiquement exécutée par Nuxt
export default defineNuxtPlugin((nuxtApp) => {
  // Ajout des icônes à la bibliothèque
  library.add(
    faHome, faUsers, faBed, faPlus, faCircle, 
    faBell, faArrowRight, faEye, faEyeSlash,
    faEdit, faTrashAlt, faEnvelope, faPhone
  )

  // Enregistrement du composant globalement
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})