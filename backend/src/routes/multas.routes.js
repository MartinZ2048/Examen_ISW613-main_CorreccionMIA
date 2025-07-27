// src/routes/multas.routes.js
const express = require('express');
const { getMultasPendientesUsuario, pagarMulta } = require('../controllers/multas.controller');
const router = express.Router();

router.get('/pendientes', getMultasPendientesUsuario);
router.post('/pagar/:multaId', pagarMulta);

module.exports = router;