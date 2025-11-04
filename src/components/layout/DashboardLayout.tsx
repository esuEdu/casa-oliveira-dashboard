import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div 
        className="flex-1 smooth-transition"
        style={{ paddingLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        <Topbar title={title} />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
