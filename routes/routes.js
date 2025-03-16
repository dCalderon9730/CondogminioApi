const express = require('express');
const { db } = require('../firebaseFiles/firebase'); // <-- Importar db correctamente
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const router = express.Router();

//  Ruta base de prueba
router.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});


//  Ruta para agregar un usuario a Firebase
router.post('/addUser', async (req, res) => {
  const { nombre, celular, correo, contrasena, idCondominio, nombreCondominio } = req.body;

  if (!nombre || !celular || !correo || !contrasena) {
    return res.status(400).send("Faltan parámetros: 'nombre', 'celular', 'correo' y 'contrasena' son obligatorios.");
  }

  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (!snapshot.empty) {
        return res.status(400).send({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const docRef = await db.collection('usuarios').add({
        nombre,
        celular,
        correo,
        contrasena: hashedPassword,
        fotografia: "",  // Campo vacío
        pais: "",        // Campo vacío
        nacimiento: "",  // Campo vacío
        status: "pendiente",
    });

    // Crear la subcolección "condominios" usando el ID del usuario como ID del condominio
    await db.collection('usuarios').doc(docRef.id).collection('condominios').doc(docRef.id).set({
        id: idCondominio,
        nombre: nombreCondominio,
    });

    res.status(200).send({ message: "Usuario agregado", id: docRef.id });
} catch (error) {
    console.error("Error al agregar usuario:", error);
    res.status(500).send({ error: "Error al agregar el usuario" });
}
});


//  Ruta para iniciar sesión
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


//  Ruta para agregar una mascota
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


// Ruta para agregar un condominio
router.post('/addCondominio', async (req, res) => {
  const { nombre, direccion, administrador } = req.body;

  if (!nombre || !direccion || !administrador) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
      const docRef = await db.collection('condominios').add({
          nombre,
          direccion,
          administrador
      });
      res.status(201).json({ message: "Condominio agregado", id: docRef.id });
  } catch (error) {
      console.error("Error al agregar el condominio:", error);
      res.status(500).json({ error: "Error al agregar el condominio", message: error.message });
  }
});

// Ruta para agregar un administrador
router.post('/addAdministrador', async (req, res) => {
  const { nombre, correo, telefono, contrasena } = req.body;

  if (!nombre || !correo || !telefono || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
      // Encriptar la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      const docRef = await db.collection('administradores').add({
          nombre,
          correo,
          telefono,
          contrasena: hashedPassword
      });

      res.status(201).json({ message: "Administrador agregado", id: docRef.id });
  } catch (error) {
      console.error("Error al agregar el administrador:", error);
      res.status(500).json({ error: "Error al agregar el administrador", message: error.message });
  }
});


//  Ruta para obtener todos los usuarios
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


//  Ruta para obtener todas las mascotas
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


//  Ruta para obtener todos los condominios
router.get('/getCondominios', async (req, res) => {
  try {
    const snapshot = await db.collection('condominios').get();
    const condominios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(condominios);
  } catch (error) {
    console.error("Error al obtener los condominios:", error);
    res.status(500).send({ error: "Error al obtener los condominios", message: error.message });
  }
});


//  Ruta para obtener todos los administradores
router.get('/getAdministradores', async (req, res) => {
  try {
    const snapshot = await db.collection('administradores').get();
    const administradores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(administradores);
  } catch (error) {
    console.error("Error al obtener los administradores:", error);
    res.status(500).send({ error: "Error al obtener los administradores", message: error.message });
  }
});

module.exports = router;
