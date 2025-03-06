const admin = require("firebase-admin");

// Inicializar Firebase con el archivo de credenciales
const serviceAccount = require("../config/CondogminioCredentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://condogminio.firebaseio.com", // Asegúrate de usar la URL correcta
});

// Acceder a Firestore
const db = admin.firestore();

module.exports = db;
