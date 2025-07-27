// src/app.js

// 1. Importar el módulo 'express'
const express = require('express');
const app = express(); // Crea una instancia de la aplicación Express

// 2. Definir el puerto donde el servidor escuchará
// process.env.PORT permite que el puerto sea configurable por variables de entorno (útil para despliegue)
// Si no se define en el entorno, usa 3000 por defecto.
const PORT = process.env.PORT || 3000;

// 3. Importar los módulos de rutas que has creado
// Estos archivos contienen las definiciones de las rutas de tu API 
const prestamosRoutes = require('./routes/prestamos.routes');
const multasRoutes = require('./routes/multas.routes');

// 4. Configurar Middlewares globales
// app.use() aplica un middleware a todas las solicitudes que pasen por él.

// Middleware para parsear el cuerpo de las peticiones en formato JSON.
// Esto es crucial para que req.body contenga los datos enviados en un POST/PUT JSON.
app.use(express.json());

// 5. Definir las rutas base para tus módulos de rutas
// app.use('/api/prestamos', prestamosRoutes);
// Esto significa que cualquier ruta definida en prestamosRoutes 
// será accesible bajo el prefijo '/api/prestamos' 
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/multas', multasRoutes);

// 6. Definir una ruta de prueba simple (opcional, pero buena para verificar que el servidor está levantado)
app.get('/', (req, res) => {
  res.send('API de Biblioteca funcionando!'); // Envía una respuesta de texto plano al navegador
});

// 7. Iniciar el servidor Express
// app.listen() hace que tu aplicación Express escuche las solicitudes entrantes en el puerto especificado.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`); // Muestra un mensaje en la consola cuando el servidor inicia
});