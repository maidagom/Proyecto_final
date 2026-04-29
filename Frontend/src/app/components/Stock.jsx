import { useState, useEffect } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle, Clock, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';

export function Stock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const { fetchWithAuth } = useAuth();

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/movimientos`);
      if (response) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m =>
    m.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.producto?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por producto, SKU, motivo o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          Total: <span className="font-bold text-gray-800">{filteredMovements.length}</span> registros
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando historial de movimientos...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Producto</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Cantidad</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700 font-semibold">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(m.fecha).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.tipo === 'ENTRADA' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{m.producto?.nombre}</div>
                        <div className="text-xs text-gray-500 font-mono">{m.producto?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                         <div className="flex items-center gap-1">
                           <User size={14} className="text-gray-400" />
                           {m.usuario?.nombre}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {m.motivo || <span className="text-gray-300 italic">Sin motivo</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron movimientos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
