const { db, admin } = require('../config/firebase');

const COLLECTION = 'livestreams';

class Livestream {
  static async create(data) {
    const docRef = db.collection(COLLECTION).doc();
    const livestream = {
      id: docRef.id,
      contentId: data.contentId,
      title: data.title,
      description: data.description,
      status: data.status || 'scheduled',
      startTime: data.startTime,
      endTime: data.endTime,
      creatorId: data.creatorId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(livestream);
    return livestream;
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