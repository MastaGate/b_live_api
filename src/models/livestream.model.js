const { db, admin } = require('../config/firebase');
const COLLECTION = 'livestreams';

class Livestream {
  static async create(data) {
    try {
      const docRef = db.collection(COLLECTION).doc();
      
      // Gérer le téléchargement de la photo si elle existe
      let imageUrl = '';
      if (data.photoBlob) {
        const bucket = admin.storage().bucket();
        const fileName = `livestreams/${docRef.id}/thumbnail_${Date.now()}.jpg`;
        
        // Créer le fichier dans Firebase Storage
        const file = bucket.file(fileName);
        await file.save(data.photoBlob, {
          metadata: {
            contentType: 'image/jpeg',
          }
        });

        // Générer une URL publique valide pendant 1 an
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 an
        });
        
        imageUrl = url;
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