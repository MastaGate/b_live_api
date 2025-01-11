const { db, admin } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const COLLECTION = 'livestreams';

class Livestream {
  static async create(data) {
    try {
      const docRef = db.collection(COLLECTION).doc();
      
      // Gérer le téléchargement de la photo
      let imageUrl = '';
      if (data.photo) {
        try {
          // Créer un stream à partir du buffer de l'image
          const streamifier = require('streamifier');
          const stream = streamifier.createReadStream(data.photo.buffer);

          // Upload vers Cloudinary
          const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'livestreams',
                public_id: `${docRef.id}_${Date.now()}`,
                resource_type: 'image',
                transformation: [
                  { width: 1280, height: 720, crop: 'limit' }, // HD resolution
                  { quality: 'auto:good' } // Optimisation automatique de la qualité
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            
            stream.pipe(uploadStream);
          });

          imageUrl = uploadResponse.secure_url;
        } catch (error) {
          console.error('Erreur lors du téléchargement de l\'image:', error);
          throw new Error('Erreur lors du téléchargement de l\'image vers Cloudinary');
        }
      }

      const livestream = {
        id: docRef.id,
        contentId: data.contentId,
        title: data.title,
        description: data.description || '',
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