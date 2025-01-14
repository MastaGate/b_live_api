const { db, admin } = require('../config/firebase');
const { cloudinary } = require('../config/cloudinary');
const COLLECTION = 'livestreams';

class Livestream {
  static validateLivestreamData(data) {
    const errors = [];

    // Validation de contentId (doit être une URL valide)
    if (!data.contentId) {
      errors.push('Le champ contentId est requis');
    } else {
      try {
        new URL(data.contentId);
      } catch (e) {
        errors.push('Le champ contentId doit être une URL valide');
      }
    }

    // Validation de location (obligatoire)
    if (!data.location) {
      errors.push('Le champ location est requis');
    }

    // Validation de startTime et endTime (doivent être des chaînes DateTime valides)
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?([+-]\d{2}:\d{2}|Z)?$/;
    
    if (!data.startTime || !dateTimeRegex.test(data.startTime)) {
      errors.push('Le champ startTime doit être une date-heure valide (format ISO 8601)');
    }

    if (!data.endTime || !dateTimeRegex.test(data.endTime)) {
      errors.push('Le champ endTime doit être une date-heure valide (format ISO 8601)');
    }

    // Vérifier si endTime est après startTime
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      
      // Comparer uniquement les heures si c'est la même date
      const sameDate = start.getFullYear() === end.getFullYear() &&
                      start.getMonth() === end.getMonth() &&
                      start.getDate() === end.getDate();

      if (sameDate) {
        // Si même date, vérifier que l'heure de fin est postérieure
        const startHours = start.getHours() * 60 + start.getMinutes();
        const endHours = end.getHours() * 60 + end.getMinutes();
        
        if (endHours <= startHours) {
          errors.push('Pour une même date, l\'heure de fin doit être postérieure à l\'heure de début');
        }
      } else if (end < start) {
        // Si dates différentes, vérifier que la date de fin est postérieure
        errors.push('La date de fin doit être postérieure à la date de début');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  static async create(data) {
    try {
      // Valider les données avant de créer le livestream
      this.validateLivestreamData(data);

      const docRef = db.collection(COLLECTION).doc();
      
      // Gérer le téléchargement de la photo
      let imageUrl = '';
      if (data.photo) {
        try {
          console.log('Début upload Cloudinary...');
          // Upload direct du buffer vers Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(
            `data:${data.photo.mimetype};base64,${data.photo.buffer.toString('base64')}`,
            {
              folder: 'livestreams',
              public_id: `${docRef.id}_${Date.now()}`,
              resource_type: 'auto',
              timeout: 60000, // 60 secondes de timeout
              transformation: [
                { width: 800, height: 900, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            }
          );

          if (!uploadResponse || !uploadResponse.secure_url) {
            throw new Error('Réponse Cloudinary invalide');
          }

          imageUrl = uploadResponse.secure_url;
          console.log('Image uploadée avec succès:', imageUrl);
        } catch (error) {
          console.error('Détails de l\'erreur Cloudinary:', error);
          throw new Error(`Erreur lors de l'upload de l'image: ${error.message || 'Erreur inconnue'}`);
        }
      }

      const livestream = {
        id: docRef.id,
        contentId: data.contentId,
        title: data.title,
        description: data.description || '',
        category: data.category || 'other', // Ajout du champ category avec valeur par défaut
        imageUrl: imageUrl,
        status: data.status || 'scheduled',
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location, // Ajout du champ location obligatoire
        creatorId: data.creatorId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.set(livestream);
      return livestream;
    } catch (error) {
      console.error('Erreur lors de la création du livestream:', error);
      throw error;
    }
  }

  static async findById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findAll() {
    const snapshot = await db.collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async update(id, data) {
    const docRef = db.collection(COLLECTION).doc(id);
    const updates = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.update(updates);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  static async delete(id) {
    await db.collection(COLLECTION).doc(id).delete();
    return true;
  }
}

module.exports = Livestream;