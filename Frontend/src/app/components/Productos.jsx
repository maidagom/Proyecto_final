import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';

export function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  
  // Forms state
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductProductForm] = useState({
    sku: '', codigo: '', nombre: '', descripcion: '', precio: 0, minStock: 0, categoriaId: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [moveData, setMoveData] = useState({ tipo: 'ENTRADA', cantidad: 1, motivo: '' });
  
  const { fetchWithAuth } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetchWithAuth(`${API_URL}/productos`),
        fetchWithAuth(`${API_URL}/categorias`)
      ]);
      
      if (resProd) setProducts(await resProd.json());
      if (resCat) setCategories(await resCat.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas y parseo de tipos
    const payload = {
      ...productForm,
      precio: parseFloat(productForm.precio),
      minStock: parseInt(productForm.minStock),
      categoriaId: parseInt(productForm.categoriaId)
    };

    if (!payload.categoriaId) {
      alert("Por favor seleccione una categoría válida.");
      return;
    }

    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `${API_URL}/productos/${editingProduct.id}` : `${API_URL}/productos`;
    
    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response && response.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        setProductProductForm({ sku: '', codigo: '', nombre: '', descripcion: '', precio: 0, minStock: 0, categoriaId: '' });
        fetchData();
      } else if (response) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const res = await fetchWithAuth(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
          fetchData();
        } else if (res) {
          const err = await res.json();
          alert(err.error);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moveData,
          productoId: selectedProduct.id,
        }),
      });

      if (response && response.ok) {
        setShowMoveModal(false);
        setMoveData({ tipo: 'ENTRADA', cantidad: 1, motivo: '' });
        fetchData();
      } else if (response) {
        const err = await response.json();
        alert(err.error || 'Error al registrar movimiento');
      }
    } catch (error) {
      console.error('Error recording movement:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (product) => {
    if (product.stock <= 0) return <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">Agotado</span>;
    if (product.stock <= product.minStock) return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Bajo Stock</span>;
    return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">Disponible</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setProductProductForm({ sku: '', codigo: '', nombre: '', descripcion: '', precio: 0, minStock: 0, categoriaId: '' });
            setShowProductModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando productos...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">SKU</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Producto</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Precio</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{product.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.categoria?.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4">{getStatusBadge(product)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          title="Registrar Movimiento"
                          onClick={() => { setSelectedProduct(product); setShowMoveModal(true); }}
                          className="p-2 hover:bg-orange-50 rounded-lg text-orange-600"
                        >
                          <ArrowUpCircle size={18} />
                        </button>
                        <button 
                          title="Editar"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductProductForm({
                              sku: product.sku,
                              codigo: product.codigo,
                              nombre: product.nombre,
                              descripcion: product.descripcion || '',
                              precio: product.precio,
                              minStock: product.minStock,
                              categoriaId: product.categoriaId
                            });
                            setShowProductModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          title="Eliminar"
                          onClick={() => handleDelete(product.id)}
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

      {/* Modal para Crear/Editar Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={productForm.nombre}
                  onChange={(e) => setProductProductForm({...productForm, nombre: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductProductForm({...productForm, sku: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código Interno</label>
                <input
                  type="text"
                  value={productForm.codigo}
                  onChange={(e) => setProductProductForm({...productForm, codigo: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={productForm.categoriaId}
                  onChange={(e) => setProductProductForm({...productForm, categoriaId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.precio}
                  onChange={(e) => setProductProductForm({...productForm, precio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  value={productForm.minStock}
                  onChange={(e) => setProductProductForm({...productForm, minStock: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={productForm.descripcion}
                  onChange={(e) => setProductProductForm({...productForm, descripcion: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
              <div className="md:col-span-2 flex gap-3 mt-4">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Movimientos */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl mb-2">Registrar Movimiento</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedProduct?.nombre} (Stock actual: {selectedProduct?.stock})</p>
            <form onSubmit={handleMovement} className="space-y-4">
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setMoveData({...moveData, tipo: 'ENTRADA'})}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 ${moveData.tipo === 'ENTRADA' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}
                >
                  <ArrowUpCircle size={18} /> Entrada
                </button>
                <button 
                  type="button"
                  onClick={() => setMoveData({...moveData, tipo: 'SALIDA'})}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 ${moveData.tipo === 'SALIDA' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600'}`}
                >
                  <ArrowDownCircle size={18} /> Salida
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={moveData.cantidad}
                  onChange={(e) => setMoveData({...moveData, cantidad: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <textarea
                  value={moveData.motivo}
                  onChange={(e) => setMoveData({...moveData, motivo: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Ej: Reposición, Venta, Dañado..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMoveModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
