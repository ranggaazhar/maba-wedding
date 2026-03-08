import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  ImageIcon,
  Package,
  Calendar,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Layers,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/Authapi';
import { useToast } from '../../hooks/use-toast';
import LogoMaba from '../../assets/logomaba.svg';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',         path: '/dashboard' },
  { icon: FolderOpen,      label: 'Kategori',          path: '/categories' },
  { icon: Layers,          label: 'Kategori Properti', path: '/property-categories' },
  { icon: ImageIcon,       label: 'Projects',          path: '/projects' },
  { icon: Package,         label: 'Properties',        path: '/properties' },
  { icon: Calendar,        label: 'Bookings',          path: '/bookings' },
  { icon: FileText,        label: 'Invoice',           path: '/invoices' },  // ← baru
  { icon: Star,            label: 'Reviews',           path: '/reviews' },
  { icon: Settings,        label: 'Settings',          path: '/settings' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      toast({ title: 'Success', description: 'Logged out successfully' });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r',
        'bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-border))]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center justify-between px-4",
        "border-b border-white/20"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img
                src={LogoMaba}
                alt="Logo Maba"
                className="h-12 w-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">ADMIN MABA</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                    isActive
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/20 mt-2">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={22} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}