import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
 import { LayoutDashboard, Package, Users, Settings, LogOut, ShoppingCart, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
 { to: '/admin/vendas', icon: ShoppingCart, label: 'Vendas' },
 { to: '/admin/clientes', icon: UserCircle, label: 'Clientes' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários', masterOnly: true },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export function AdminLayout() {
  const { user, logout, isMaster, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.masterOnly || isMaster
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-primary/30"
            />
            <span className="font-bold text-sm text-foreground tracking-tight">
              TATO'S ADMIN
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="text-xs">
            <p className="text-foreground font-medium truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-sm text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
