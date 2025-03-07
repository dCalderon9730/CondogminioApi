const express = require('express');
const admin = require('../firebaseFiles/firebase');  // Asegúrate de que la ruta sea correcta
const router = express.Router();  // Asegúrate de inicializar Router correctamente

// Ruta para autenticar con Google
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  // Verificar que se haya proporcionado el idToken
  if (!idToken) {
    return res.status(400).send('El token de ID es obligatorio');
  }

  try {
    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Si el token es válido, devolver el UID del usuario
    res.status(200).json({ message: 'Autenticación exitosa', uid });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).send('Token inválido');
  }
});

module.exports = router;  // Exportar router para ser usado en otros archivos
