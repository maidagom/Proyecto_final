# Sistema de Gestión de Stock Profesional

Este es un sistema Full-Stack robusto para el control de inventario, con navegación real, seguridad JWT y registro de movimientos.

## Características Principales
- **Navegación**: URLs reales con `react-router-dom`.
- **Autenticación**: Flujo seguro con JWT y encriptación de contraseñas (`bcryptjs`).
- **Roles**: Niveles de acceso para `ADMIN` (gestión total) y `OPERARIO` (solo stock).
- **Inventario**: Registro de entradas/salidas con actualización de stock en tiempo real.
- **Historial**: Seguimiento detallado de quién hizo qué movimiento y cuándo.

## Requisitos
- Node.js (v18+)
- MariaDB / MySQL

## Instalación y Configuración

1.  **Instalar dependencias generales**:
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configurar el Backend**:
    - Ve a la carpeta `Backend`.
    - Instala sus dependencias: `npm install`.
    - Asegúrate de que tu archivo `.env` tenga la URL correcta:
      `DATABASE_URL="mysql://usuario:password@localhost:3306/proyecto_final_fs"`
    - Ejecuta las migraciones: `npx prisma migrate dev`.
    - Poblar la base de datos (IMPORTANTE): `npx tsx seed.js`.

3.  **Iniciar el Sistema**:
    - Terminal 1 (Raíz): `npm run dev` (Corre el Frontend en puerto 5173).
    - Terminal 2 (Backend): `npm run dev` (Corre el API en puerto 3000).

## Usuarios de Prueba (Generados por Seed)
| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `admin` | `admin123` | Administrador |
| `operario` | `operario123` | Operario |

## Notas de Desarrollo
- El token JWT expira en 24h.
- Los operarios no pueden ver las pestañas de "Usuarios" ni "Categorías".
- No se permiten salidas de stock que resulten en valores negativos.
