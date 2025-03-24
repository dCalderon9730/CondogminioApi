const express = require('express');
const { db } = require('../firebaseFiles/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta base de prueba
router.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});

//////////////////////////////////////////////////////////////////////////////////////////rutas Post///////////////////////////////////////////////////////////////////////////////////////
// Ruta sign in
router.post('/signIn', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const user = snapshot.docs[0].data();
    const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: snapshot.docs[0].id, correo: user.correo, nombre: user.nombre },
      "secreto_super_seguro",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para agregar un usuario
router.post('/addUser', async (req, res) => {
  const { nombre, cedula, correo, contrasena, idCondominios, fotografia, pais, nacimiento } = req.body;

  if (!nombre || !cedula || !correo || !contrasena || !idCondominios) {
    return res.status(400).send("Faltan parámetros obligatorios.");
  }

  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (!snapshot.empty) {
      return res.status(400).send({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const docRef = await db.collection('usuarios').add({
      nombre,
      cedula,
      correo,
      contrasena: hashedPassword,
      idCondominios,
      fotografia: fotografia || "",
      pais: pais || "",
      nacimiento: nacimiento || "",
    });
    res.status(200).send({ message: "Usuario agregado", id: docRef.id });
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    res.status(500).send({ error: "Error al agregar el usuario" });
  }
});

// Ruta para agregar un administrador
router.post('/addAdministrador', async (req, res) => {
  const { nombre, correo, telefono, contrasena } = req.body;

  if (!nombre || !correo || !telefono || !contrasena) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
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
    res.status(500).json({ error: "Error al agregar el administrador" });
  }
});

// Ruta para agregar un condominio
router.post('/addCondominio', async (req, res) => {
  const { nombre, direccion, idAdministrador, latitud, longitud } = req.body;

  if (!nombre || !direccion || !idAdministrador || !latitud || !longitud) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const docRef = await db.collection('condominios').add({
      nombre,
      direccion,
      idAdministrador,
      latitud,
      longitud
    });
    res.status(201).json({ message: "Condominio agregado", id: docRef.id });
  } catch (error) {
    console.error("Error al agregar el condominio:", error);
    res.status(500).json({ error: "Error al agregar el condominio" });
  }
});

// Ruta para agregar una mascota
router.post('/addPet', async (req, res) => {
  const { propietario, foto, nombre, nacimiento, edad, peso, raza, peligrosidad, descripcion, seguro, alimentacion, castrado, fechaCastracion } = req.body;
  
  if (!propietario || !nombre || !nacimiento || !edad || !peso || !raza || !peligrosidad || !descripcion || !seguro || !alimentacion || castrado === undefined) {
    return res.status(400).send("Faltan parámetros obligatorios.");
  }

  try {
    const fechaFinal = fechaCastracion || new Date().toISOString();
    const docRef = await db.collection('mascotas').add({
      propietario,
      foto: foto || "",
      nombre,
      nacimiento,
      edad,
      peso,
      raza,
      peligrosidad,
      descripcion,
      seguro,
      alimentacion,
      castrado,
      fechaCastracion: fechaFinal,
    });
    res.status(200).send({ message: "Mascota agregada", id: docRef.id });
  } catch (error) {
    console.error("Error al agregar la mascota:", error);
    res.status(500).send({ error: "Error al agregar la mascota" });
  }
});

// Ruta para registrar un recorrido
router.post('/addRecorrido', async (req, res) => {
  const { condominio, mascotas, fecha, hora, idUsuario } = req.body;

  if (!condominio || !mascotas || !fecha || !hora || !idUsuario) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const docRef = await db.collection('recorridos').add({
      condominio,
      mascotas,
      fecha,
      hora,
      idUsuario
    });
    res.status(201).json({ message: "Recorrido registrado", id: docRef.id });
  } catch (error) {
    console.error("Error al registrar el recorrido:", error);
    res.status(500).json({ error: "Error al registrar el recorrido" });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////rutas Get///////////////////////////////////////////////////////////////////////////////////////

// Ruta para verificar si un usuario está registrado
router.post('/checkUser', async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).send("El campo 'correo' es obligatorio.");
  }
  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (snapshot.empty) {
      return res.status(404).send({ message: "Usuario no registrado, por favor regístrese." });
    }
    res.status(200).send({ message: "Usuario registrado.", id: snapshot.docs[0].id });
  } catch (error) {
    res.status(500).send({ error: "Error al verificar el usuario", message: error.message });
  }
});

// Ruta para obtener todos los usuarios
router.get('/getUsers', async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los usuarios", message: error.message });
  }
});

// Ruta para obtener todos los condominios
router.get('/getCondominios', async (req, res) => {
  try {
    const snapshot = await db.collection('condominios').get();
    const condominios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(condominios);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los condominios", message: error.message });
  }
});

// Ruta para obtener todas las mascotas
router.get('/getPets', async (req, res) => {
  try {
    const snapshot = await db.collection('mascotas').get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener las mascotas", message: error.message });
  }
});

// Ruta para obtener los recorridos de un usuario si está registrado
router.post('/getUserRecorridos', async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).send("El campo 'correo' es obligatorio.");
  }
  try {
    const snapshot = await db.collection('usuarios').where('correo', '==', correo).get();
    if (snapshot.empty) {
      return res.status(404).send({ message: "Usuario no registrado, por favor regístrese." });
    }
    const userId = snapshot.docs[0].id;
    const recorridosSnapshot = await db.collection('recorridos').where('usuarioId', '==', userId).get();
    const recorridos = recorridosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(recorridos);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los recorridos", message: error.message });
  }
});

// Ruta para obtener todos los recorridos
router.get('/getRecorridos', async (req, res) => {
  try {
    const snapshot = await db.collection('recorridos').get();
    const recorridos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(recorridos);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener los recorridos", message: error.message });
  }
});

module.exports = router;
