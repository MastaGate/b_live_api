const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://b-live-74e10.firebaseio.com"
});

console.log('Firebase connecté avec succès !');

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };