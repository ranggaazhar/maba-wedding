import { useState, type ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className={cn(
        'transition-all duration-300',
        collapsed ? 'pl-20' : 'pl-64'
      )}>
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}