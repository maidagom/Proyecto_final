import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';

export function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { fetchWithAuth, user: currentUser } = useAuth();
  
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    username: '',
    password: '',
    rol: 'OPERARIO',
    estado: 'activo'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/usuarios`);
      if (response) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `${API_URL}/usuarios/${editingUser.id}` : `${API_URL}/register`;
    
    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response && response.ok) {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ nombre: '', email: '', username: '', password: '', rol: 'OPERARIO', estado: 'activo' });
        fetchUsers();
      } else if (response) {
        const err = await response.json();
        alert(err.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("No puedes eliminarte a ti mismo");
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
        if (response && response.ok) {
          fetchUsers();
        } else if (response) {
          const err = await response.json();
          alert(err.error || 'Error al eliminar');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ nombre: '', email: '', username: '', password: '', rol: 'OPERARIO', estado: 'activo' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Rol</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.estado === 'activo' ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle size={16} />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              nombre: user.nombre,
                              email: user.email,
                              username: user.username,
                              password: '', // Password stays empty unless changing
                              rol: user.rol,
                              estado: user.estado
                            });
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {editingUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required={!editingUser}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="OPERARIO">Operario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
