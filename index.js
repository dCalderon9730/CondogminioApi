require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/routes');
const petRoutes = require('./routes/routes');

// Crear una instancia de Express y definir el puerto
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto asignado por Heroku o el 3000 como fallback

// Middlewares
app.use(cors()); // Habilitar CORS para permitir peticiones desde otros dominios
app.use(express.json()); // Middleware para parsear JSON automáticamente

// Usar las rutas separadas
app.use('/api/users', userRoutes);  // Rutas relacionadas con usuarios
app.use('/api/pets', petRoutes);  // Rutas relacionadas con mascotas

// Ruta base para verificar que el servidor está activo
app.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
