const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // ⭐ 1. IMPORTAMOS CORS
const { PrismaClient } = require('@prisma/client');

// Importamos los enrutadores que contienen la lógica de cada recurso
const authRoutes = require('./routes/auth');
const libroRoutes = require('./routes/libro.routes');
const prestamosRoutes = require('./routes/prestamos.routes');
const multasRoutes = require('./routes/multas.routes');

// --- 2. INICIALIZACIÓN ---
dotenv.config();
const app = express();
const prisma = new PrismaClient();
// ⭐ 2. ASEGURAMOS QUE EL PUERTO DEL BACKEND SEA EL 3000
const PORT = process.env.PORT || 3000;

// --- 3. MIDDLEWARE ---

// ⭐ 3. CONFIGURAMOS Y USAMOS CORS
// Esto debe ir ANTES de las rutas para que se aplique a todas las peticiones.
const corsOptions = {
  origin: 'http://localhost:3001' // Solo aceptamos peticiones del frontend
};
app.use(cors(corsOptions));

// Middleware para que Express entienda el formato JSON en el cuerpo de las peticiones
app.use(express.json());

// --- 4. RUTAS ---
// Organizamos las rutas para que el código sea más limpio.
// Cada ruta base ('/api/auth', '/api/libros', etc.) usa su propio archivo de rutas.

app.get('/', (req, res) => {
  res.send('¡API de Biblioteca funcionando correctamente!');
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas para los diferentes recursos de la API
// El middleware de autenticación se aplica dentro de cada enrutador para mayor control.
app.use('/api/libros', libroRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/multas', multasRoutes);


// --- 5. MANEJO DE ERRORES Y ARRANQUE DEL SERVIDOR ---

// Middleware para capturar errores no manejados
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal en el servidor!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Desconexión de Prisma al cerrar la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
