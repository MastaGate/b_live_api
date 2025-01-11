const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fonction pour vérifier la configuration Cloudinary
const verifyCloudinaryConfig = async () => {
  try {
    // Afficher la configuration (en masquant les secrets)
    const config = cloudinary.config();
    console.log('Cloudinary Configuration:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? '***' + config.api_key.slice(-4) : undefined,
      api_secret: config.api_secret ? '***' + config.api_secret.slice(-4) : undefined
    });

    // Vérifier si les variables d'environnement sont définies
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Variables d\'environnement Cloudinary manquantes');
    }

    console.log('🔄 Test de la connexion Cloudinary...');
    
    // Tester la connexion
    const result = await cloudinary.api.ping();
    console.log('📡 Réponse ping:', result);

    if (result.status === 'ok') {
      console.log('✅ Connexion à Cloudinary établie avec succès');
      
      try {
        // Tenter de récupérer les informations basiques du compte
        const account = await cloudinary.api.usage();
        console.log('📊 Informations du compte récupérées');
        
        if (account && account.plan) {
          console.log(`☁️  Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
          console.log(`📊 Plan: ${account.plan}`);
          if (account.usage && account.usage.storage) {
            console.log(`💾 Usage ce mois: ${account.usage.storage.usage_in_bytes} bytes`);
          }
        }
      } catch (usageError) {
        // Ne pas bloquer le démarrage si on ne peut pas récupérer les infos d'usage
        console.warn('⚠️ Impossible de récupérer les informations d\'usage:', usageError.message);
      }
      
      return true;
    } else {
      throw new Error('Statut de connexion invalide');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à Cloudinary:', error.message);
    console.error('Détails de l\'erreur:', error);
    console.error('Veuillez vérifier vos credentials Cloudinary dans le fichier .env');
    throw error;
  }
};

// Exporter la configuration et la fonction de vérification
module.exports = {
  cloudinary,
  verifyCloudinaryConfig
};
