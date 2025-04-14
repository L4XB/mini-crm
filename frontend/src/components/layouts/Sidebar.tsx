'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Squares2X2Icon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string }>;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Mock user data - replace with real authentication later
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    imageUrl: null,
    role: 'Administrator'
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'Kontakte', href: '/contacts', icon: UserGroupIcon, badge: 3 },
    { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon, badge: 2 },
    { name: 'Aufgaben', href: '/tasks', icon: ClipboardDocumentListIcon, badge: 5 },
    { name: 'Notizen', href: '/notes', icon: DocumentTextIcon },
    { name: 'Berichte', href: '/reports', icon: ChartBarIcon },
    { name: 'Einstellungen', href: '/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    router.push('/login');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Generate random background color based on name
  const getAvatarBgColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        onClick={toggleMobileSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isMobileSidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={toggleMobileSidebar} 
          aria-hidden="true"
        />

        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-700 to-indigo-900 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 pt-5 pb-2 flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl font-bold text-white">Mini CRM</span>
              </div>
            </div>

            <div className="mt-6 px-2 space-y-1 flex-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-indigo-900 text-indigo-100 py-0.5 px-2 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            
            <div className="border-t border-indigo-800 pt-4 mt-4">
              <div className="px-4">
                <div className="flex items-center">
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: getAvatarBgColor(user.name) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{user.name}</p>
                    <p className="text-sm font-medium text-indigo-200">{user.role}</p>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-indigo-300"
                      aria-hidden="true"
                    />
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-700 to-indigo-900 overflow-y-auto">
          <div className="px-4 pt-5 pb-4 flex flex-shrink-0 items-center">
            <Link href="/dashboard" className="text-3xl font-bold text-white hover:text-indigo-100">
              Mini CRM
            </Link>
          </div>
          <div className="mt-6 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-indigo-900 text-indigo-100 py-0.5 px-2 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <div className="border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: getAvatarBgColor(user.name) }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-indigo-200">{user.role}</p>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-indigo-100 hover:bg-indigo-600"
                >
                  <ArrowLeftOnRectangleIcon
                    className="mr-3 flex-shrink-0 h-5 w-5 text-indigo-300 group-hover:text-white"
                    aria-hidden="true"
                  />
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
