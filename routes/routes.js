// /routes/routes.js
const express = require('express');
const db = require('../firebaseFiles/firebase');

const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
  res.send('¡La API está funcionando en Heroku y en Firebase!');
});

// Ruta adicional de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Test exitoso en Heroku' });
});

// Ruta para agregar un documento a Firebase
router.post('/addData', async (req, res) => {
  const { nombre, edad } = req.body;

  // Validar que los campos 'nombre' y 'edad' estén presentes
  if (!nombre || !edad) {
    return res.status(400).send("Faltan parámetros: 'nombre' y 'edad' son obligatorios.");
  }

  try {
    const docRef = await db.collection('usuarios').add({
      nombre: nombre,
      edad: edad
    });
    res.status(200).send("Documento agregado con ID: " + docRef.id);
  } catch (error) {
    console.error("Error al agregar el documento:", error);
    res.status(500).send("Error al agregar el documento: " + error.message);
  }
});

module.exports = router;
