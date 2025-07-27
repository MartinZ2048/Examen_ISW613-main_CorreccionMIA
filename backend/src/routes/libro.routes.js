import { Router } from 'express';
// Importamos las funciones del controlador que manejarán las peticiones.
import { getListadoLibros, getDetalleLibro } from '../controllers/libro.controller.js';

const router = Router();

// Definimos la ruta para obtener el listado completo de libros.
// Petición final será: GET /api/libros/
router.get('/', getListadoLibros);

// Definimos la ruta para obtener el detalle de un libro por su ID.
// El ':id' es un parámetro dinámico que capturaremos en el controlador.
// Petición final será: GET /api/libros/1 (o cualquier número)
router.get('/:id', getDetalleLibro);

export default router;