// Importamos los servicios que vamos a utilizar.
import * as libroService from '../services/libro.service.js';

/**
 * Controlador para manejar la petición de obtener el listado de libros.
 * Corresponde a la ruta: GET /libros
 * @param {object} req - Objeto de la petición (request) de Express.
 * @param {object} res - Objeto de la respuesta (response) de Express.
 */
export const getListadoLibros = async (req, res) => {
  try {
    // Llama al servicio para obtener todos los libros.
    const libros = await libroService.getAllLibros();
    // Envía una respuesta con estado 200 (OK) y los libros en formato JSON.
    res.status(200).json(libros);
  } catch (error) {
    // En caso de un error en el servidor, envía un estado 500.
    res.status(500).json({ message: 'Error al obtener el listado de libros.', error: error.message });
  }
};

/**
 * Controlador para manejar la petición de obtener el detalle de un libro.
 * Corresponde a la ruta: GET /libros/:id
 * @param {object} req - Objeto de la petición (request) de Express.
 * @param {object} res - Objeto de la respuesta (response) de Express.
 */
export const getDetalleLibro = async (req, res) => {
  try {
    // Extrae el 'id' de los parámetros de la URL (ej: /api/libros/5)
    // y lo convierte a un número entero.
    const libroId = parseInt(req.params.id);

    // Llama al servicio para buscar el libro por su ID.
    const libro = await libroService.getLibroById(libroId);

    // Si el servicio devuelve null, significa que el libro no existe.
    if (!libro) {
      // Responde con un estado 404 (No Encontrado).
      return res.status(404).json({ message: 'Libro no encontrado.' });
    }

    // Si se encuentra el libro, responde con estado 200 (OK) y los datos del libro.
    res.status(200).json(libro);
  } catch (error) {
    // En caso de un error en el servidor, envía un estado 500.
    res.status(500).json({ message: 'Error al obtener el detalle del libro.', error: error.message });
  }
};
