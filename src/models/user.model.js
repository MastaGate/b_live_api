const { db, admin } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const COLLECTION = 'users';

class User {
  static async create(userData) {
    // Hachage du mot de passe avant d'ajouter l'utilisateur
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRef = db.collection(COLLECTION).doc();  // Créer une référence de document

    const user = {
      id: userRef.id, // Utilisation de l'ID généré par Firestore
      username: userData.username,
      email: userData.email,
      password: hashedPassword, 
      role: userData.role || 'viewer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Enregistrer l'utilisateur dans la collection Firestore
    await userRef.set(user);

    return user; // Retourner l'utilisateur créé
  }

  static async findById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByEmail(email) {
    const snapshot = await db.collection(COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async comparePassword(hashedPassword, candidatePassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;