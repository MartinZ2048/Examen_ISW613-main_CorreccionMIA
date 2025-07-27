import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Servicio para obtener el listado de todos los libros.
 * La disponibilidad ya está incluida en el modelo de datos (`numEjemplaresDisponibles`).
 * @returns {Promise<Array>} Un arreglo con todos los libros.
 */
export const getAllLibros = async () => {
  // Usamos findMany de Prisma para obtener todos los registros de la tabla Libro.
  const libros = await prisma.libro.findMany();
  return libros;
};

/**
 * Servicio para obtener el detalle de un libro específico por su ID.
 * Este servicio también "incluye" las recomendaciones donde el libro es el origen.
 * Esto cumple el requisito de "Embebido de recomendaciones".
 * @param {number} id - El ID del libro que se quiere encontrar.
 * @returns {Promise<Object|null>} El objeto del libro con sus recomendaciones, o null si no se encuentra.
 */
export const getLibroById = async (id) => {
  const libro = await prisma.libro.findUnique({
    where: {
      // La condición de búsqueda: el 'id' debe coincidir.
      id: id,
    },
    // 'include' es la magia de Prisma para traer datos de tablas relacionadas.
    include: {
      // Le pedimos que incluya las recomendaciones donde este libro es el 'origen'.
      // El nombre 'recomendacionesOrigen' viene de la relación definida en `schema.prisma`.
      recomendacionesOrigen: {
        // Para cada recomendación encontrada, queremos incluir también los datos completos
        // del libro que está siendo recomendado.
        include: {
          libroRecomendado: true, // Esto anida el objeto completo del libro recomendado.
        },
      },
    },
  });
  return libro;
};
