import { PrismaClient } from './generated/prisma/client.js';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Passwords hashing
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const operatorPassword = await bcrypt.hash('operario123', salt);

  // 1. Usuarios
  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@sistema.com',
      password: adminPassword,
      nombre: 'Administrador Principal',
      rol: 'ADMIN',
      estado: 'activo',
    },
  });

  const operator = await prisma.usuario.upsert({
    where: { username: 'operario' },
    update: {},
    create: {
      username: 'operario',
      email: 'operario@sistema.com',
      password: operatorPassword,
      nombre: 'Operario de Almacén',
      rol: 'OPERARIO',
      estado: 'activo',
    },
  });

  // 2. Categorías
  const electronica = await prisma.categoria.upsert({
    where: { nombre: 'Electrónica' },
    update: {},
    create: { 
      nombre: 'Electrónica', 
      descripcion: 'Dispositivos electrónicos y gadgets', 
      color: 'bg-blue-500' 
    },
  });

  const oficina = await prisma.categoria.upsert({
    where: { nombre: 'Oficina' },
    update: {},
    create: { 
      nombre: 'Oficina', 
      descripcion: 'Artículos de escritorio y papelería', 
      color: 'bg-green-500' 
    },
  });

  // 3. Proveedores
  const provGlobal = await prisma.proveedor.upsert({
    where: { nombre: 'Global Tech S.A.' },
    update: {},
    create: {
      nombre: 'Global Tech S.A.',
      contacto: 'Soporte Global',
      telefono: '555-0199',
      email: 'ventas@globaltech.com',
    },
  });

  // 4. Productos
  const laptop = await prisma.producto.upsert({
    where: { sku: 'SKU-LAP-001' },
    update: {},
    create: {
      sku: 'SKU-LAP-001',
      codigo: 'PROD-001',
      nombre: 'Laptop Pro 15',
      descripcion: 'Laptop para diseño y desarrollo',
      precio: 1200.50,
      stock: 10,
      minStock: 2,
      estado: 'disponible',
      categoriaId: electronica.id,
      proveedorId: provGlobal.id,
    },
  });

  const monitor = await prisma.producto.upsert({
    where: { sku: 'SKU-MON-24' },
    update: {},
    create: {
      sku: 'SKU-MON-24',
      codigo: 'PROD-002',
      nombre: 'Monitor 24" 4K',
      descripcion: 'Monitor ultra HD para oficina',
      precio: 350.00,
      stock: 5,
      minStock: 1,
      estado: 'disponible',
      categoriaId: electronica.id,
    },
  });

  // 5. Movimientos iniciales
  await prisma.movimiento.create({
    data: {
      tipo: 'ENTRADA',
      cantidad: 10,
      motivo: 'Compra inicial',
      productoId: laptop.id,
      usuarioId: admin.id,
      proveedorId: provGlobal.id,
    }
  });

  console.log('Database seeded successfully!');
  console.log({ admin: 'admin/admin123', operator: 'operario/operario123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
