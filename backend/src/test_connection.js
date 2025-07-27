require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany();
  console.log('Usuarios encontrados:', usuarios);
}

main()
  .catch(e => {
    console.error('Error al conectar con Supabase/Prisma:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

