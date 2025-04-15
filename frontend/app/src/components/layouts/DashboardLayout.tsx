import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CurrencyEuroIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Kontakte', href: '/contacts', icon: UserGroupIcon },
    { name: 'Deals', href: '/deals', icon: CurrencyEuroIcon },
    { name: 'Aufgaben', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Notizen', href: '/notes', icon: DocumentTextIcon },
    { name: 'Einstellungen', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Add users link only for admin users
  if (user?.role === 'admin') {
    navigation.push({ name: 'Benutzer', href: '/users', icon: UsersIcon });
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-primary-700 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Menü schließen</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-white text-xl font-bold">Mini CRM</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-800 text-white'
                      : 'text-white hover:bg-primary-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className="mr-4 flex-shrink-0 h-6 w-6 text-primary-200"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
            <div className="flex items-center">
              <div>
                <UserCircleIcon className="h-10 w-10 text-primary-200" />
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">{user?.username}</p>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-primary-200 hover:text-white flex items-center mt-1"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-primary-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-white text-xl font-bold">Mini CRM</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-800 text-white'
                      : 'text-white hover:bg-primary-600'
                  }`}
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-6 w-6 text-primary-200"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
            <div className="flex items-center">
              <div>
                <UserCircleIcon className="h-9 w-9 text-primary-200" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-primary-200 hover:text-white flex items-center mt-1"
                >
                  <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" />
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Menü öffnen</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
