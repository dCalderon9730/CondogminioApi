require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/routes');  // Rutas de usuarios
const petRoutes = require('./routes/routes');    // Rutas de mascotas
const condominioRoutes = require('./routes/routes');  // Rutas de condominios
const adminRoutes = require('./routes/routes');  // Rutas de administradores

// Crear una instancia de Express y definir el puerto
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto asignado por Heroku o 3000 como fallback

// Middlewares
app.use(cors()); // Habilitar CORS para permitir peticiones desde otros dominios
app.use(express.json()); // Middleware para parsear JSON automáticamente

// Usar las rutas separadas
app.use('/api/users', userRoutes);  // Rutas relacionadas con usuarios
app.use('/api/pets', petRoutes);    // Rutas relacionadas con mascotas
app.use('/api/condominios', condominioRoutes);  // Rutas de condominios
app.use('/api/admins', adminRoutes);  // Rutas de administradores

// Ruta base para verificar que el servidor está activo
app.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
