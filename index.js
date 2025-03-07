// Importar las dependencias
const express = require('express');
const db = require("./firebaseFiles/firebase"); // Importa la configuración de Firebase

// Crear una instancia de Express y definir el puerto
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto asignado por Heroku o el 3000 como fallback

// Middleware para procesar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡La API está funcionando en Heroku y en Firebase!');
});

// Ruta adicional de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Test exitoso en Heroku' });
});

// Ruta para agregar un documento a Firebase
app.post('/addData', async (req, res) => {
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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

