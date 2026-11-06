import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, BookOpen, Settings, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <aside className="flex w-full flex-row items-center gap-2 overflow-x-auto border-b border-borderWarm bg-white px-3 py-2 md:h-full md:w-64 md:flex-col md:items-stretch md:overflow-visible md:border-b-0 md:border-r md:border-borderWarm md:px-0 md:py-0">
      <div className="flex items-center gap-2 px-3 py-2 md:border-b md:border-slate-200 md:px-6 md:py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-slate-900">Vidya</span>
      </div>
      <nav className="flex flex-1 flex-row gap-1 md:flex-col md:space-y-1 md:px-3 md:py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-palePeach text-primary'
                    : 'text-textSecondary hover:bg-palePeach hover:text-textPrimary'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-3 py-2 md:border-t md:border-slate-200 md:px-3 md:py-4">
        <button
          onClick={() => void logout()}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
};