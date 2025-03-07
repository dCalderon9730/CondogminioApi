// /middlewares/jsonParser.js
const express = require('express');

// Middleware para procesar el cuerpo de las solicitudes como JSON
const jsonParser = express.json();
module.exports = jsonParser;
