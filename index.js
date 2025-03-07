require('dotenv').config();
const express = require('express');
const jsonParser = require('./middlewares/jsonParser');
const routes = require('./routes/routes');
const authRoutes = require('./routes/auth');  // Importar las rutas de autenticación con Google

// Crear una instancia de Express y definir el puerto
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto asignado por Heroku o el 3000 como fallback

// Usar el middleware para procesar el cuerpo como JSON
app.use(jsonParser);

// Usar las rutas definidas en routes.js
app.use('/api', routes);  // Prefijo para las rutas generales
app.use('/api/auth', authRoutes);  // Prefijo para las rutas de autenticación

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});


