require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/routes');  // Rutas de usuarios
const petRoutes = require('./routes/routes');    // Rutas de mascotas
const condominioRoutes = require('./routes/routes');  // Rutas de condominios
const adminRoutes = require('./routes/routes');  // Rutas de administradores
const pathRoutes = require('./routes/routes');  // Rutas de recorridos

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/condominios', condominioRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/paths', pathRoutes);

app.get('/', (req, res) => {
  res.send('¡La API está funcionando correctamente!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});