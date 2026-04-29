import { useState, useEffect } from 'react';
import { Package, ArrowRightLeft, Users, FolderTree } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';

export function Dashboard() {
  const [stats, setStats] = useState({ totalProductos: 0, stockBajo: 0, totalMovimientos: 0, categoriasCount: 0 });
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/dashboard/stats`);
        if (response) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Productos', value: stats.totalProductos, icon: Package, color: 'bg-blue-500' },
    { label: 'Stock Bajo', value: stats.stockBajo, icon: Package, color: 'bg-red-500', alert: stats.stockBajo > 0 },
    { label: 'Movimientos', value: stats.totalMovimientos, icon: ArrowRightLeft, color: 'bg-orange-500' },
    { label: 'Categorías', value: stats.categoriasCount, icon: FolderTree, color: 'bg-green-500' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.alert && <span className="text-red-600 text-xs font-bold animate-pulse">¡ATENCIÓN!</span>}
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-8 border border-gray-200 text-center">
        <h3 className="text-xl mb-4 font-medium text-gray-800">Bienvenido al Sistema de Gestión de Stock</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Utiliza el menú lateral para gestionar tus productos, categorías y usuarios. 
          Puedes registrar entradas y salidas de mercadería directamente desde la lista de productos.
        </p>
      </div>
    </div>
  );
}
