// Importar las dependencias
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto proporcionado por Heroku si está disponible

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡La API está funcionando en Heroku!');
});

// Ruta adicional de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Test exitoso en Heroku' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
