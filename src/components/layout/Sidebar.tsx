import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, FolderTree, Users, UserPlus, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', icon: Home, path: '/dashboard' },
  { title: 'Products', icon: Package, path: '/products' },
  { title: 'Categories', icon: FolderTree, path: '/categories' },
  { title: 'Users', icon: Users, path: '/users' },
  { title: 'Collaborators', icon: UserPlus, path: '/collaborators' },
  { title: 'Store', icon: Store, path: '/store' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapsed = () => {
    setCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newValue));
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newValue } }));
      return newValue;
    });
  };

  return (
    <aside
      className={cn(
        'glass-sidebar fixed left-0 top-0 z-40 h-screen smooth-transition',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-foreground">Casa Oliveira</span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="rounded-lg p-1.5 hover:bg-muted/50 smooth-transition"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 smooth-transition',
                'hover:bg-sidebar-accent/50',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-subtle)]'
                  : 'text-sidebar-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium animate-fade-in">{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
