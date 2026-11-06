import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const titles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard': { title: 'Dashboard', breadcrumb: ['Home', 'Dashboard'] },
  '/profile': { title: 'My Profile', breadcrumb: ['Home', 'My Profile'] },
  '/courses': { title: 'Courses', breadcrumb: ['Home', 'Courses'] },
  '/settings': { title: 'Settings', breadcrumb: ['Home', 'Settings'] },
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const meta = titles[location.pathname] || { title: 'Vidya', breadcrumb: ['Home'] };
  return (
    <div className="flex h-screen flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={meta.title} breadcrumb={meta.breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};