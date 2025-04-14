'use client';

import React from 'react';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar component */}
      <Sidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-4 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  {/* Page title can go here if needed */}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Suchen..."
                      className="w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10 py-2 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="inline-flex items-center p-2 border border-transparent rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
                  >
                    <span className="sr-only">Notifications</span>
                    <BellIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
