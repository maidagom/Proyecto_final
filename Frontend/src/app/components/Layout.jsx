import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderTree,
  Package,
  Archive,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard' },
  { id: 'productos',  label: 'Productos',    icon: Package,         path: '/productos' },
  { id: 'stock',      label: 'Stock',        icon: Archive,         path: '/stock' },
  { id: 'usuarios',   label: 'Usuarios',     icon: Users,           path: '/usuarios',   role: 'ADMIN' },
  { id: 'categorias', label: 'Categorías',   icon: FolderTree,      path: '/categorias', role: 'ADMIN' },
];

const roleBadgeColor = {
  ADMIN:    'bg-purple-100 text-purple-700',
  OPERARIO: 'bg-blue-100 text-blue-700',
};

export function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const username = user?.nombre ?? user?.username ?? '';
  const role = user?.rol ?? 'OPERARIO';

  const filteredMenu = menuItems.filter(item => !item.role || item.role === role);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`relative bg-slate-800 text-white transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between min-h-[65px]">
          {sidebarOpen && <h1 className="text-lg truncate">Sistema Stock</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg shrink-0 ml-auto">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{username}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${roleBadgeColor[role]}`}>{role}</span>
              </div>
            </div>
          )}

          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors">
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label ?? 'Dashboard'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Bienvenido</p>
                <p className="text-sm text-gray-900">{username}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
