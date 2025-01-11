const { db, admin } = require('../config/firebase');
const { cloudinary } = require('../config/cloudinary');
const COLLECTION = 'livestreams';

class Livestream {
  static async create(data) {
    try {
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