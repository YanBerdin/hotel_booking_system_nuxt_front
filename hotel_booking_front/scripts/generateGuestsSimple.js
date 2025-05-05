// Script pour générer des données fictives pour la table guests sans dépendance aux chambres existantes
// Usage: node scripts/generateGuestsSimple.js [nombre_de_guests]

import 'dotenv/config';
import { faker } from '@faker-js/faker/locale/fr';
import axios from 'axios';
import crypto from 'crypto';

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Nombre de guests à générer (par défaut: 10)
const numberOfGuests = parseInt(process.argv[2], 10) || 10;

// Fonction pour générer un document_id aléatoire
const generateDocumentId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// Fonction pour générer un objet guest avec des données aléatoires
const generateGuest = () => {
  // Date d'arrivée entre il y a 30 jours et aujourd'hui
  const checkInDate = faker.date.recent({ days: 30 });
  
  // Date de départ entre 1 et 14 jours après l'arrivée
  const leaveDate = faker.date.soon({ days: 14, refDate: checkInDate });
  
  // Formatage des dates en ISO string
  const checkInFormatted = checkInDate.toISOString();
  const leaveFormatted = leaveDate.toISOString();
  
  // Statut actuel
  const now = new Date();
  let status = 'en cours';
  if (now > leaveDate) {
    status = 'parti';
  } else if (now < checkInDate) {
    status = 'à venir';
  }

  // Numéro de chambre aléatoire entre 100 et 999
  const roomNo = faker.number.int({ min: 100, max: 999 });

  return {
    document_id: generateDocumentId(),
    fullname: faker.person.fullName(),
    paid: faker.datatype.boolean(0.7), // 70% de chance d'être payé
    check_in: checkInFormatted,
    leave_date: leaveFormatted,
    statusfield: status,
    room_no: roomNo,
    locale: 'fr',
    // Ces champs sont généralement gérés automatiquement par Strapi,
    // mais nous les ajoutons par précaution pour correspondre à votre schema
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Fonction pour envoyer les données à l'API Strapi
const sendToStrapi = async (guest) => {
  try {
    const response = await axios.post(`${STRAPI_URL}/api/guests`, {
      data: guest
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du guest à Strapi:', error.response?.data || error.message);
    return null;
  }
};

// Fonction principale pour générer et envoyer des guests
const generateGuests = async () => {
  console.log(`Génération de ${numberOfGuests} guests...`);
  
  // Générer et envoyer chaque guest
  for (let i = 0; i < numberOfGuests; i++) {
    // Générer un guest
    const guest = generateGuest();
    
    // Afficher les détails
    console.log(`Génération du guest ${i + 1}/${numberOfGuests}: ${guest.fullname}, Chambre ${guest.room_no}`);
    
    // Envoyer à Strapi
    const result = await sendToStrapi(guest);
    
    if (result) {
      console.log(`✅ Guest ${i + 1} créé avec succès avec l'ID ${result.data.id}`);
    } else {
      console.error(`❌ Échec de la création du guest ${i + 1}`);
    }
    
    // Attendre un peu pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('Génération des guests terminée!');
};

// Lancer la génération
generateGuests();