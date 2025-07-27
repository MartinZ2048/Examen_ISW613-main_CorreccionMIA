import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Crear o actualizar usuarios para evitar duplicados (usando upsert)
  const alumno = await prisma.usuario.upsert({
    where: { login: 'alumno1' }, // Condición para encontrar
    update: { // Datos para actualizar si ya existe
      password: '123456',
      nombre: 'Laura',
      apellido1: 'Gómez',
      apellido2: 'Sánchez',
      email: 'laura.alumno@example.com',
      calle: 'Calle Luna',
      numero: '12',
      piso: '3B',
      ciudad: 'Madrid',
      codigoPostal: '28001',
      estado: 'ACTIVO',
      tipo: 'ALUMNO',
      telefonoPadres: '611223344'
    },
    create: { // Datos para crear si no existe
      login: 'alumno1',
      password: '123456',
      nombre: 'Laura',
      apellido1: 'Gómez',
      apellido2: 'Sánchez',
      email: 'laura.alumno@example.com',
      calle: 'Calle Luna',
      numero: '12',
      piso: '3B',
      ciudad: 'Madrid',
      codigoPostal: '28001',
      estado: 'ACTIVO',
      tipo: 'ALUMNO',
      telefonoPadres: '611223344'
    }
  })

  const profesor = await prisma.usuario.upsert({
    where: { login: 'profesor1' },
    update: {
      password: 'abcdef',
      nombre: 'Carlos',
      apellido1: 'Ruiz',
      apellido2: 'Martínez',
      email: 'carlos.prof@example.com',
      calle: 'Av. del Sol',
      numero: '5',
      ciudad: 'Sevilla',
      piso: null,
      codigoPostal: '41001',
      estado: 'ACTIVO',
      tipo: 'PROFESOR',
      departamento: 'Lengua y Literatura'
    },
    create: {
      login: 'profesor1',
      password: 'abcdef',
      nombre: 'Carlos',
      apellido1: 'Ruiz',
      apellido2: 'Martínez',
      email: 'carlos.prof@example.com',
      calle: 'Av. del Sol',
      numero: '5',
      ciudad: 'Sevilla',
      piso: null,
      codigoPostal: '41001',
      estado: 'ACTIVO',
      tipo: 'PROFESOR',
      departamento: 'Lengua y Literatura'
    }
  })

  // Crear o actualizar libros (usando upsert en base al ISBN)
  const libro1 = await prisma.libro.upsert({
    where: { isbn: '978-3-16-148410-0' },
    update: {
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      numPaginas: 417,
      numEjemplares: 2,
      numEjemplaresDisponibles: 1,
      portadaURL: 'https://example.com/portada1.jpg'
    },
    create: {
      isbn: '978-3-16-148410-0',
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      numPaginas: 417,
      numEjemplares: 2,
      numEjemplaresDisponibles: 1,
      portadaURL: 'https://example.com/portada1.jpg'
    }
  })

  const libro2 = await prisma.libro.upsert({
    where: { isbn: '978-0-14-044913-6' },
    update: {
      titulo: 'Don Quijote de la Mancha',
      autor: 'Miguel de Cervantes',
      numPaginas: 863,
      numEjemplares: 1,
      numEjemplaresDisponibles: 1,
      portadaURL: 'https://example.com/portada2.jpg'
    },
    create: {
      isbn: '978-0-14-044913-6',
      titulo: 'Don Quijote de la Mancha',
      autor: 'Miguel de Cervantes',
      numPaginas: 863,
      numEjemplares: 1,
      numEjemplaresDisponibles: 1,
      portadaURL: 'https://example.com/portada2.jpg'
    }
  })

  const libro3 = await prisma.libro.upsert({
    where: { isbn: '978-1-86197-876-9' },
    update: {
      titulo: '1984',
      autor: 'George Orwell',
      numPaginas: 328,
      numEjemplares: 3,
      numEjemplaresDisponibles: 3,
      portadaURL: 'https://example.com/portada3.jpg'
    },
    create: {
      isbn: '978-1-86197-876-9',
      titulo: '1984',
      autor: 'George Orwell',
      numPaginas: 328,
      numEjemplares: 3,
      numEjemplaresDisponibles: 3,
      portadaURL: 'https://example.com/portada3.jpg'
    }
  })

  const libro4 = await prisma.libro.upsert({
    where: { isbn: '978-0-7432-7356-5' },
    update: {
      titulo: 'El gran Gatsby',
      autor: 'F. Scott Fitzgerald',
      numPaginas: 180,
      numEjemplares: 2,
      numEjemplaresDisponibles: 2,
      portadaURL: 'https://example.com/portada4.jpg'
    },
    create: {
      isbn: '978-0-7432-7356-5',
      titulo: 'El gran Gatsby',
      autor: 'F. Scott Fitzgerald',
      numPaginas: 180,
      numEjemplares: 2,
      numEjemplaresDisponibles: 2,
      portadaURL: 'https://example.com/portada4.jpg'
    }
  })

  const libro5 = await prisma.libro.upsert({
    where: { isbn: '978-0-451-52493-5' },
    update: {
      titulo: 'Fahrenheit 451',
      autor: 'Ray Bradbury',
      numPaginas: 256,
      numEjemplares: 4,
      numEjemplaresDisponibles: 4,
      portadaURL: 'https://example.com/portada5.jpg'
    },
    create: {
      isbn: '978-0-451-52493-5',
      titulo: 'Fahrenheit 451',
      autor: 'Ray Bradbury',
      numPaginas: 256,
      numEjemplares: 4,
      numEjemplaresDisponibles: 4,
      portadaURL: 'https://example.com/portada5.jpg'
    }
  })

  // Crear o actualizar ejemplares (usando upsert en base a codigoEjemplar)
  const ejemplar1 = await prisma.ejemplar.upsert({
    where: { codigoEjemplar: 'EJ-1001' },
    update: {
      fechaAdquisicion: new Date('2020-05-20'),
      observaciones: 'Buen estado',
      estado: 'disponible', 
      libro: { connect: { id: libro1.id } }
    },
    create: {
      codigoEjemplar: 'EJ-1001',
      fechaAdquisicion: new Date('2020-05-20'),
      observaciones: 'Buen estado',
      estado: 'disponible',
      libro: { connect: { id: libro1.id } }
    }
  })

  const ejemplar2 = await prisma.ejemplar.upsert({
    where: { codigoEjemplar: 'EJ-1002' },
    update: {
      fechaAdquisicion: new Date('2021-08-10'),
      observaciones: 'Cubierta rayada',
      estado: 'disponible', 
      libro: { connect: { id: libro1.id } }
    },
    create: {
      codigoEjemplar: 'EJ-1002',
      fechaAdquisicion: new Date('2021-08-10'),
      observaciones: 'Cubierta rayada',
      estado: 'disponible', 
      libro: { connect: { id: libro1.id } }
    }
  })

  const ejemplar3 = await prisma.ejemplar.upsert({
    where: { codigoEjemplar: 'EJ-2001' },
    update: {
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible', 
      libro: { connect: { id: libro3.id } }
    },
    create: {
      codigoEjemplar: 'EJ-2001',
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible',
      libro: { connect: { id: libro3.id } }
    }
  })

  const ejemplar4 = await prisma.ejemplar.upsert({
    where: { codigoEjemplar: 'EJ-2002' },
    update: {
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible', 
      libro: { connect: { id: libro3.id } }
    },
    create: {
      codigoEjemplar: 'EJ-2002',
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible',
      libro: { connect: { id: libro3.id } }
    }
  })

  const ejemplar5 = await prisma.ejemplar.upsert({
    where: { codigoEjemplar: 'EJ-2003' },
    update: {
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible',
      libro: { connect: { id: libro3.id } }
    },
    create: {
      codigoEjemplar: 'EJ-2003',
      fechaAdquisicion: new Date('2023-01-12'),
      observaciones: 'Nuevo',
      estado: 'disponible', 
      libro: { connect: { id: libro3.id } }
    }
  })

  // NOTA IMPORTANTE: Para Prestamo, Multa, Recomendacion, PrestamoHistorico y MultaHistorica,
  // el uso de `create` generará nuevos registros cada vez que se ejecute el seed,
  // ya que no tienen un campo `@unique` obvio para usar con `upsert` que garantice
  // que no se dupliquen si la base de datos no se borra.

  // Añadimos un .catch para que el seed no falle si el ejemplar ya está prestado.
  await prisma.prestamo.create({
    data: {
      fechaInicio: new Date(),
      deberiaDevolverseEl: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días después
      usuario: { connect: { id: alumno.id } },
      ejemplar: { connect: { id: ejemplar1.id } }
    }
  }).catch(e => {
    console.warn(`Advertencia: No se pudo crear el préstamo activo para ejemplar ${ejemplar1.id}. Puede que ya exista o el ejemplar no esté disponible.`, e.message);
  });

  // Crear multa activa (se creará cada vez que se ejecute el seed)
  // Sin el campo `@unique` en multa, se creará una nueva cada vez.
  await prisma.multa.create({
    data: {
      fechaInicio: new Date(),
      dias: 4,
      monto: 4.00, 
      fechaFin: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      usuario: { connect: { id: alumno.id } }
    }
  }).catch(e => {
    console.warn(`Advertencia: No se pudo crear la multa activa para usuario ${alumno.id}.`, e.message);
  });

  // Crear recomendación (se creará cada vez)
  await prisma.recomendacion.create({
    data: {
      comentario: 'Si te gustó, también te gustará este clásico.',
      libroOrigen: { connect: { id: libro1.id } },
      libroRecomendado: { connect: { id: libro2.id } }
    }
  }).catch(e => {
    console.warn(`Advertencia: No se pudo crear la recomendación. Puede que ya exista.`, e.message);
  });

  // Crear préstamo histórico (se creará cada vez)
  await prisma.prestamoHistorico.create({
    data: {
      fechaInicio: new Date('2024-01-15'),
      deberiaDevolverseEl: new Date('2024-01-22'),
      fechaDevolucion: new Date('2024-01-23'),
      usuario: { connect: { id: profesor.id } },
      ejemplar: { connect: { id: ejemplar2.id } },
      multa: undefined // Si no hay multa asociada o si no se puede conectar
    }
  }).catch(e => {
    console.warn(`Advertencia: No se pudo crear el préstamo histórico para ejemplar ${ejemplar2.id}.`, e.message);
  });

  // Crear multa histórica (se creará cada vez)
  await prisma.multaHistorica.create({
    data: {
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2024-02-05'),
      monto: 2.0,
      usuario: { connect: { id: profesor.id } }
    }
  }).catch(e => {
    console.warn(`Advertencia: No se pudo crear la multa histórica para usuario ${profesor.id}.`, e.message);
  });
}

main()
  .then(() => {
    console.log('✅ Seed ejecutado correctamente')
  })
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })