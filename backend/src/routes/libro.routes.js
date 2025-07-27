const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libro.controller');
const { authenticateJWT, isUser } = require('../middleware/auth');

// ⭐ CORRECCIÓN: Hemos eliminado la línea router.use(authenticateJWT, isUser);
// Ahora, las rutas son públicas por defecto. La autenticación se debe
// añadir individualmente solo a las rutas que la necesiten (como crear o borrar).

// GET /api/libros - Obtiene la lista de libros disponibles (PÚBLICA)
router.get('/', libroController.getLibrosDisponibles);

// GET /api/libros/:id - Obtiene el detalle de un libro (PÚBLICA)
// La autenticación se revisará en el frontend antes de permitir pedir un préstamo,
// pero cualquiera puede ver el detalle.
router.get('/:id', libroController.getLibroDetalle);

module.exports = router;
