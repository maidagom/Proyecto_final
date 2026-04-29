import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';

export function Categorias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', color: 'bg-blue-500' });
  const { fetchWithAuth } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/categorias`);
      if (response) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingCategory ? 'PUT' : 'POST';
    const url = editingCategory ? `${API_URL}/categorias/${editingCategory.id}` : `${API_URL}/categorias`;
    
    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response && response.ok) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ nombre: '', descripcion: '', color: 'bg-blue-500' });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
        if (response && response.ok) {
          fetchCategories();
        } else if (response) {
          const err = await response.json();
          alert(err.error || 'Error al eliminar');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ nombre: '', descripcion: '', color: 'bg-blue-500' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Cargando categorías...</div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${category.color || 'bg-gray-500'} p-3 rounded-lg`}>
                  <FolderTree className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({ nombre: category.nombre, descripcion: category.descripcion || '', color: category.color || 'bg-blue-500' });
                      setShowModal(true);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg text-gray-900 mb-2 font-medium">{category.nombre}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.descripcion || 'Sin descripción'}</p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 font-bold">{category._count?.productos || 0}</span> productos
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color (Clase Tailwind)</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="bg-blue-500">Azul</option>
                  <option value="bg-green-500">Verde</option>
                  <option value="bg-red-500">Rojo</option>
                  <option value="bg-purple-500">Púrpura</option>
                  <option value="bg-orange-500">Naranja</option>
                  <option value="bg-pink-500">Rosa</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
