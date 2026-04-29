import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';

export function Roles() {
  const [roles] = useState([
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: ['Crear', 'Editar', 'Eliminar', 'Ver'],
      usuarios: 2,
    },
    {
      id: 2,
      nombre: 'Vendedor',
      descripcion: 'Gestión de ventas y clientes',
      permisos: ['Crear Ventas', 'Ver Productos', 'Ver Clientes'],
      usuarios: 5,
    },
    {
      id: 3,
      nombre: 'Almacenero',
      descripcion: 'Gestión de inventario y stock',
      permisos: ['Ver Stock', 'Actualizar Stock', 'Ver Productos'],
      usuarios: 3,
    },
    {
      id: 4,
      nombre: 'Auditor',
      descripcion: 'Solo lectura de reportes',
      permisos: ['Ver Reportes', 'Ver Estadísticas'],
      usuarios: 1,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-gray-900">Gestión de Roles</h2>
          <p className="text-gray-600 mt-1">Administra los permisos y accesos del sistema</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nuevo Rol
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">{role.nombre}</h3>
                  <p className="text-sm text-gray-600">{role.descripcion}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">Permisos:</p>
              <div className="flex flex-wrap gap-2">
                {role.permisos.map((permiso, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    {permiso}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="text-blue-600">{role.usuarios}</span> usuarios asignados
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
