import app from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.ts";

dotenv.config();

const aplicacion = app();
aplicacion.use(cors());
aplicacion.use(app.json());

const { PUERTO, JWT_SECRET = "super-secret-key" } = process.env;

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send({ error: "Acceso denegado" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ error: "Token inválido" });
        req.user = user;
        next();
    });
};

// Middleware de autorización por rol
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).send({ error: "No tienes permisos para esta acción" });
        }
        next();
    };
};

// --- AUTH ROUTES ---

aplicacion.post("/register", async (req, res) => {
    const { username, email, password, nombre, rol, estado } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = await prisma.usuario.create({
            data: { 
                username, 
                email, 
                password: hashedPassword,
                nombre: nombre || username, 
                rol: rol || 'OPERARIO', 
                estado: estado || 'activo' 
            }
        });

        const token = jwt.sign(
            { id: nuevoUsuario.id, username: nuevoUsuario.username, rol: nuevoUsuario.rol },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _pwd, ...safeUser } = nuevoUsuario;
        res.status(201).send({ user: safeUser, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const usuario = await prisma.usuario.findUnique({ where: { username } });
        if (!usuario) return res.status(401).send({ error: "Usuario no encontrado" });

        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) return res.status(401).send({ error: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _pwd, ...safeUser } = usuario;
        res.send({ user: safeUser, token });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// --- USUARIOS ROUTES ---

aplicacion.get("/usuarios", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const usuarios = await prisma.usuario.findMany({
        select: { id: true, username: true, email: true, nombre: true, rol: true, estado: true, createdAt: true }
    });
    res.send(usuarios);
});

aplicacion.put("/usuarios/:id", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { nombre, email, username, password, rol, estado } = req.body;
    try {
        const data = { nombre, email, username, rol, estado };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data
        });
        const { password: _pwd, ...safeUser } = usuarioActualizado;
        res.send(safeUser);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.delete("/usuarios/:id", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        if (parseInt(id) === req.user.id) {
            return res.status(400).send({ error: "No puedes eliminarte a ti mismo" });
        }
        await prisma.usuario.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// --- CATEGORIAS ROUTES ---

aplicacion.get("/categorias", authenticateToken, async (req, res) => {
    const categorias = await prisma.categoria.findMany({
        include: { _count: { select: { productos: true } } }
    });
    res.send(categorias);
});

aplicacion.post("/categorias", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { nombre, descripcion, color } = req.body;
    try {
        const nuevaCategoria = await prisma.categoria.create({
            data: { nombre, descripcion, color }
        });
        res.status(201).send(nuevaCategoria);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.put("/categorias/:id", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, color } = req.body;
    try {
        const categoriaActualizada = await prisma.categoria.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion, color }
        });
        res.send(categoriaActualizada);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.delete("/categorias/:id", authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.categoria.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).send({ error: "No se puede eliminar la categoría (puede tener productos asociados)" });
    }
});

// --- PRODUCTOS ROUTES ---

aplicacion.get("/productos", authenticateToken, async (req, res) => {
    const productos = await prisma.producto.findMany({
        include: { categoria: true, proveedor: true }
    });
    res.send(productos);
});

aplicacion.post("/productos", authenticateToken, async (req, res) => {
    const { sku, codigo, nombre, descripcion, precio, minStock, categoriaId } = req.body;
    try {
        const nuevoProducto = await prisma.producto.create({
            data: { 
                sku,
                codigo, 
                nombre, 
                descripcion,
                precio: parseFloat(precio), 
                stock: 0,
                minStock: parseInt(minStock) || 0, 
                estado: 'disponible',
                categoriaId: parseInt(categoriaId) 
            }
        });
        res.status(201).send(nuevoProducto);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.put("/productos/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { sku, codigo, nombre, descripcion, precio, minStock, categoriaId } = req.body;
    try {
        const productoActualizado = await prisma.producto.update({
            where: { id: parseInt(id) },
            data: { 
                sku,
                codigo, 
                nombre, 
                descripcion,
                precio: parseFloat(precio), 
                minStock: parseInt(minStock), 
                categoriaId: parseInt(categoriaId) 
            }
        });
        res.send(productoActualizado);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

aplicacion.delete("/productos/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction([
            prisma.movimiento.deleteMany({ where: { productoId: parseInt(id) } }),
            prisma.producto.delete({ where: { id: parseInt(id) } })
        ]);
        res.status(204).send();
    } catch (error) {
        res.status(400).send({ error: "No se pudo eliminar el producto." });
    }
});

// --- MOVIMIENTOS ROUTES ---

aplicacion.get("/movimientos", authenticateToken, async (req, res) => {
    const movimientos = await prisma.movimiento.findMany({
        include: { producto: true, usuario: { select: { nombre: true } }, proveedor: true },
        orderBy: { fecha: 'desc' }
    });
    res.send(movimientos);
});

aplicacion.post("/movimientos", authenticateToken, async (req, res) => {
    const { tipo, cantidad, motivo, productoId, proveedorId } = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Crear el movimiento
            const movimiento = await tx.movimiento.create({
                data: {
                    tipo,
                    cantidad: parseInt(cantidad),
                    motivo,
                    productoId: parseInt(productoId),
                    usuarioId: req.user.id,
                    proveedorId: proveedorId ? parseInt(proveedorId) : null
                }
            });

            // 2. Actualizar el stock del producto
            const qty = Math.abs(parseInt(cantidad));
            const adjustment = tipo === 'ENTRADA' ? qty : -qty;
            const producto = await tx.producto.update({
                where: { id: parseInt(productoId) },
                data: {
                    stock: { increment: adjustment }
                }
            });

            // Validar que el stock no sea negativo
            if (producto.stock < 0) {
                throw new Error("No hay suficiente stock para realizar esta salida");
            }

            return movimiento;
        });

        res.status(201).send(result);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// --- DASHBOARD ROUTES ---

aplicacion.get("/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const totalProductos = await prisma.producto.count();
        const stockBajo = await prisma.producto.count({
            where: { stock: { lte: prisma.producto.fields.minStock } }
        });
        const totalMovimientos = await prisma.movimiento.count();
        const categoriasCount = await prisma.categoria.count();

        res.send({ totalProductos, stockBajo, totalMovimientos, categoriasCount });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
