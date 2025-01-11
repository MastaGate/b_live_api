const { db, admin } = require('../config/firebase');
const COLLECTION = 'livestreams';

class Livestream {
  static async create(data) {
    try {
      const docRef = db.collection(COLLECTION).doc();
      
      // Gérer le téléchargement de la photo
      let imageUrl = '';
      if (data.photo) {
        const bucket = admin.storage().bucket();
        const fileName = `livestreams/${docRef.id}/thumbnail_${Date.now()}${data.photo.originalname}`;
        
        // Créer le fichier dans Firebase Storage
        const file = bucket.file(fileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: data.photo.mimetype,
          },
          resumable: false
        });

        // Gérer les erreurs de stream
        await new Promise((resolve, reject) => {
          stream.on('error', (error) => {
            reject(error);
          });

          stream.on('finish', async () => {
            // Rendre le fichier public
            await file.makePublic();
            
            // Obtenir l'URL publique
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve();
          });

          // Écrire le buffer du fichier dans le stream
          stream.end(data.photo.buffer);
        });
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