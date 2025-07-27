// src/controllers/prestamos.controller.js
const prisma = require('../prisma/client');
const { DIAS_PRESTAMO_POR_ROL, MAX_PRESTAMOS_POR_ROL, COSTO_MULTA_POR_DIA, DIAS_PENALIZACION_MULTA_FACTOR } = require('../utils/constants');

const { EstadoUsuario } = require('@prisma/client'); 

const { getDaysDifference, addDays } = require('../utils/date.utils');



async function solicitarPrestamo(req, res) {
  const { usuarioId, ejemplarId } = req.body;

  try {
    // 1. Validar usuario y su estado
    const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(usuarioId) } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    // Un usuario MOROSO o MULTADO no puede tomar libros prestados 
    if (usuario.estado === EstadoUsuario.MOROSO || usuario.estado === EstadoUsuario.MULTADO) {
      return res.status(403).json({ message: `El usuario tiene estado ${usuario.estado} y no puede solicitar préstamos.` });
    }

    // 2. Validar disponibilidad del ejemplar
    const ejemplar = await prisma.ejemplar.findUnique({
      where: { id: parseInt(ejemplarId) },
      include: { libro: true } // Para poder actualizar numEjemplaresDisponibles
    });
    if (!ejemplar) {
      return res.status(404).json({ message: 'Ejemplar no encontrado.' });
    }
    if (ejemplar.estado !== 'disponible') { 
      return res.status(400).json({ message: `El ejemplar no está disponible para préstamo. Estado actual: ${ejemplar.estado}` });
    }

    // 3. Validar máximos de préstamos activos por usuario
    const prestamosActivos = await prisma.prestamo.count({
      where: {
        usuarioId: parseInt(usuarioId),
      }
    });

    const maxPrestamos = MAX_PRESTAMOS_POR_ROL[usuario.tipo]; 
    if (maxPrestamos !== undefined && prestamosActivos >= maxPrestamos) {
      return res.status(400).json({ message: `El usuario ya tiene el máximo de ${maxPrestamos} préstamos activos permitidos.` });
    }

    // 4. Calcular fecha de vencimiento
    const diasPermitidos = DIAS_PRESTAMO_POR_ROL[usuario.tipo] || 7;
    const deberiaDevolverseEl = addDays(new Date(), diasPermitidos);

    // 5. Crear el préstamo (activo)
    const nuevoPrestamo = await prisma.prestamo.create({
      data: {
        usuarioId: parseInt(usuarioId),
        ejemplarId: parseInt(ejemplarId),
        fechaInicio: new Date(),
        deberiaDevolverseEl: deberiaDevolverseEl,
      },
    });

    // 6. Actualizar el estado del ejemplar a "prestado"
    await prisma.ejemplar.update({
      where: { id: parseInt(ejemplarId) },
      data: { estado: 'prestado' },
    });

    // 7. Actualizar el número de ejemplares disponibles del libro
    await prisma.libro.update({
      where: { id: ejemplar.libroId },
      data: {
        numEjemplaresDisponibles: {
          decrement: 1 // Disminuir en 1
        }
      }
    });

    res.status(201).json({
      message: 'Préstamo registrado exitosamente.',
      prestamo: nuevoPrestamo
    });

  } catch (error) {
    console.error('Error al solicitar préstamo:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar el préstamo.' });
  }
}

async function devolverEjemplar(req, res) {
  const { ejemplarId } = req.params;
  const fechaDevolucion = new Date();

  try {
    // 1. Encontrar el préstamo activo para ese ejemplar
    const prestamoActivo = await prisma.prestamo.findFirst({
      where: {
        ejemplarId: parseInt(ejemplarId),
      },
      include: {
        usuario: true,
        ejemplar: true
      }
    });

    if (!prestamoActivo) {
      return res.status(404).json({ message: 'No se encontró un préstamo activo para este ejemplar.' });
    }

    let multaGenerada = null; // Para retornar si se generó/actualizó una multa
    let diasRetrasoPrestamo = 0;

    // 2. Calcular multa si aplica
    if (fechaDevolucion > prestamoActivo.deberiaDevolverseEl) {
      diasRetrasoPrestamo = getDaysDifference(prestamoActivo.deberiaDevolverseEl, fechaDevolucion);
      const diasPenalizacionPorEstePrestamo = diasRetrasoPrestamo * DIAS_PENALIZACION_MULTA_FACTOR; 

      const montoMultaCalculado = diasRetrasoPrestamo * COSTO_MULTA_POR_DIA;

      // Buscar una multa activa para el usuario (que no haya pasado su fechaFin)
      let multaExistente = await prisma.multa.findFirst({
        where: {
          usuarioId: prestamoActivo.usuarioId,
          fechaFin: {
            gt: new Date() 
          }
        }
      });

      if (multaExistente) {
        
        const nuevosDiasAcumulados = multaExistente.dias + diasPenalizacionPorEstePrestamo;
        const nuevoMontoAcumulado = parseFloat(multaExistente.monto) + montoMultaCalculado; // Convertir a float para sumar
        const nuevaFechaFin = addDays(new Date(), nuevosDiasAcumulados); 

        multaGenerada = await prisma.multa.update({
          where: { id: multaExistente.id },
          data: {
            dias: nuevosDiasAcumulados,
            monto: nuevoMontoAcumulado, 
            fechaFin: nuevaFechaFin,
          }
        });
      } else {
        // Si no hay multa activa, crear una nueva
        const fechaMultaInicio = new Date();
        const fechaMultaFinalizacion = addDays(fechaMultaInicio, diasPenalizacionPorEstePrestamo);

        multaGenerada = await prisma.multa.create({
          data: {
            usuarioId: prestamoActivo.usuarioId,
            fechaInicio: fechaMultaInicio,
            dias: diasPenalizacionPorEstePrestamo,
            monto: montoMultaCalculado,
            fechaFin: fechaMultaFinalizacion,
          }
        });
      }

      // Actualizar estado del usuario a MULTADO 
      await prisma.usuario.update({
        where: { id: prestamoActivo.usuarioId },
        data: { estado: EstadoUsuario.MULTADO }
      });
    }

    // 3. Crear registro en PrestamoHistorico y eliminar el Prestamo activo 
    const prestamoHistorico = await prisma.prestamoHistorico.create({
      data: {
        usuarioId: prestamoActivo.usuarioId,
        ejemplarId: prestamoActivo.ejemplarId,
        fechaInicio: prestamoActivo.fechaInicio,
        deberiaDevolverseEl: prestamoActivo.deberiaDevolverseEl,
        fechaDevolucion: fechaDevolucion,
        multaId: multaGenerada ? multaGenerada.id : null, // Asociar al registro de multa (si aplica)
      },
    });

    // Eliminar el préstamo activo
    await prisma.prestamo.delete({
      where: { id: prestamoActivo.id },
    });

    // 4. Actualizar el estado del ejemplar a "disponible"
    await prisma.ejemplar.update({
      where: { id: parseInt(ejemplarId) },
      data: { estado: 'disponible' },
    });

    // 5. Actualizar el número de ejemplares disponibles del libro
    await prisma.libro.update({
      where: { id: prestamoActivo.ejemplar.libroId },
      data: {
        numEjemplaresDisponibles: {
          increment: 1
        }
      }
    });

    
    res.status(200).json({
      message: 'Ejemplar devuelto exitosamente.',
      prestamoHistorico: prestamoHistorico,
      multaGenerada: multaGenerada,
    });

  } catch (error) {
    console.error('Error al devolver ejemplar:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la devolución.' });
  }
}

async function getMisPrestamos(req, res) {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuario es requerido.' });
  }

  try {
    // Préstamos activos (tabla Prestamo)
    const prestamosActivos = await prisma.prestamo.findMany({
      where: { usuarioId: parseInt(usuarioId) },
      include: {
        ejemplar: {
          include: {
            libro: true
          }
        }
      },
      orderBy: { fechaInicio: 'desc' }
    });

    // Histórico de préstamos (tabla PrestamoHistorico)
    const prestamosHistoricos = await prisma.prestamoHistorico.findMany({
      where: { usuarioId: parseInt(usuarioId) },
      include: {
        ejemplar: {
          include: {
            libro: true
          }
        },
        multa: true // Si está asociado a una multa
      },
      orderBy: { fechaDevolucion: 'desc' }
    });

    // Multa actual (si fechaFin > ahora)
    const multaActual = await prisma.multa.findFirst({
        where: {
            usuarioId: parseInt(usuarioId),
            fechaFin: {
                gt: new Date() // Multa que aún está activa
            }
        }
    });

    res.status(200).json({
      message: 'Historial de préstamos y multa actual recuperados exitosamente.',
      prestamosActivos: prestamosActivos,
      prestamosHistoricos: prestamosHistoricos,
      multaActual: multaActual,
    });

  } catch (error) {
    console.error('Error al obtener mis préstamos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener préstamos.' });
  }
}

module.exports = {
  solicitarPrestamo,
  devolverEjemplar,
  getMisPrestamos,
};