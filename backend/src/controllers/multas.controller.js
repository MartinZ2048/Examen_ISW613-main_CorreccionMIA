// src/controllers/multas.controller.js
const prisma = require('../prisma/client');
const { EstadoUsuario } = require('@prisma/client');

async function getMultasPendientesUsuario(req, res) {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ message: 'ID de usuario es requerido.' });
  }

  try {
    const multas = await prisma.multa.findMany({
      where: {
        usuarioId: parseInt(usuarioId),
        fechaFin: {
            gt: new Date() // Solo multas cuya fecha de fin no ha llegado
        }
      },
      include: {
        // Si se necesita añadir detalles de los préstamos históricos asociados a esta multa
        // prestamosHistoricos: {
        //   include: {
        //     ejemplar: {
        //       include: { libro: true }
        //     }
        //   }
        // }
      },
      orderBy: {
        fechaInicio: 'asc'
      }
    });

    res.status(200).json({
      message: 'Multas pendientes recuperadas exitosamente.',
      multas: multas,
    });

  } catch (error) {
    console.error('Error al obtener multas pendientes:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener multas.' });
  }
}

async function pagarMulta(req, res) {
  const { multaId } = req.params;

  try {
    // Usar una transacción para garantizar que todas las operaciones se completen o ninguna lo haga
    const multaHistoricaResult = await prisma.$transaction(async (tx) => {
      const multa = await tx.multa.findUnique({ // Usar tx para operaciones dentro de la transacción
        where: { id: parseInt(multaId) },
        include: { usuario: true } // Para poder actualizar el estado del usuario
      });

      if (!multa) {
        throw new Error('Multa no encontrada.');
      }

      if (multa.fechaFin <= new Date()) {
          throw new Error('La multa ya ha finalizado o ha sido pagada.');
      }

      // Crear registro en MultaHistorica
      const createdMultaHistorica = await tx.multaHistorica.create({ // Usar tx para operaciones dentro de la transacción
        data: {
          usuarioId: multa.usuarioId,
          fechaInicio: multa.fechaInicio,
          fechaFin: new Date(), 
        }
      });

      // Eliminar la multa activa
      await tx.multa.delete({ // Usar tx para operaciones dentro de la transacción
        where: { id: parseInt(multaId) },
      });

      // Verificar si el usuario tiene más multas activas
      const otrasMultasActivas = await tx.multa.count({ // Usar tx para operaciones dentro de la transacción
          where: {
              usuarioId: multa.usuarioId,
              fechaFin: { gt: new Date() }
          }
      });

      // Si no quedan más multas activas para el usuario, y si era MULTADO, volver a ACTIVO.
      if (otrasMultasActivas === 0 && multa.usuario.estado === EstadoUsuario.MULTADO) {
          await tx.usuario.update({ // Usar tx para operaciones dentro de la transacción
              where: { id: multa.usuarioId },
              data: { estado: EstadoUsuario.ACTIVO }
          });
      }
      return createdMultaHistorica; // Retornar el resultado al exterior de la transacción
    });

    res.status(200).json({
      message: 'Multa pagada exitosamente y movida a histórico.',
      multaHistorica: multaHistoricaResult,
    });

  } catch (error) {
    console.error('Error al pagar multa:', error.message);
    // Para distinguir entre errores de validación (que lanzamos) y errores de servidor
    if (error.message.includes('Multa no encontrada') || error.message.includes('finalizado')) {
        return res.status(400).json({ message: error.message }); // 400 para errores de negocio específicos
    }
    res.status(500).json({ message: 'Error interno del servidor al pagar la multa.' });
  }
}

module.exports = {
  getMultasPendientesUsuario,
  pagarMulta,
};