const express = require('express');
const { db } = require('../firebaseFiles/firebase'); // <-- Importar db correctamente
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
  res.send('¡La API está funcionando en Heroku y en Firebase!');
});

// Ruta para agregar un usuario a Firebase
router.post('/addUser', async (req, res) => {
  const { nombre, celular, correo, contrasena } = req.body;

  if (!nombre || !celular || !correo || !contrasena) {
    return res.status(400).send("Faltan parámetros: 'nombre', 'celular', 'correo' y 'contrasena' son obligatorios.");
  }

  try {
    // Verificar si el correo ya existe
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (!snapshot.empty) {
      return res.status(400).send({ error: "El correo ya está registrado" });
    }

    // Si el correo no existe, agregar usuario
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const docRef = await db.collection('usuarios').add({
      nombre,
      celular,
      correo,
      contrasena: hashedPassword
    });

    res.status(200).send({ message: "Usuario agregado exitosamente", id: docRef.id });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).send({ error: "Error al agregar el usuario", message: error.message });
  }
});

// Ruta para iniciar sesión
router.post('/signIn', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).send("Faltan parámetros: 'correo' y 'contrasena' son obligatorios.");
  }

  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (snapshot.empty) {
      return res.status(404).send({ error: "Usuario no encontrado" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(contrasena, userData.contrasena);
    if (!passwordMatch) {
      return res.status(401).send({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: userDoc.id, correo: userData.correo }, 'secret_key', { expiresIn: '1h' });
    res.status(200).send({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send({ error: "Error al iniciar sesión", message: error.message });
  }
});

// Ruta para agregar una mascota a Firebase
router.post('/addPet', async (req, res) => {
  const { nombre, raza, edad, amigable } = req.body;

  if (!nombre || !raza || !edad || amigable === undefined) {
    return res.status(400).send("Faltan parámetros: 'nombre', 'raza', 'edad' y 'amigable' son obligatorios.");
  }

  try {
    const docRef = await db.collection('mascotas').add({
      nombre,
      raza,
      edad,
      amigable
    });
    res.status(200).send({ message: "Mascota agregada", id: docRef.id });
  } catch (error) {
    console.error("Error al agregar la mascota:", error);
    res.status(500).send({ error: "Error al agregar la mascota", message: error.message });
  }
});

// Ruta para obtener todos los usuarios
router.get('/getUsers', async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).send({ error: "Error al obtener los usuarios", message: error.message });
  }
});

// Ruta para obtener todas las mascotas
router.get('/getPets', async (req, res) => {
  try {
    const snapshot = await db.collection('mascotas').get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(pets);
  } catch (error) {
    console.error("Error al obtener las mascotas:", error);
    res.status(500).send({ error: "Error al obtener las mascotas", message: error.message });
  }
});

module.exports = router;

