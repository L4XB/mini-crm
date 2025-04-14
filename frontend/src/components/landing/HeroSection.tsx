'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Text Content */}
          <motion.div 
            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="inline-block px-4 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Kundenbeziehungen perfekt verwalten
            </motion.span>
            
            <motion.h1 
              className="mt-1 text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="block">Effizientes CRM</span>
              <span className="block text-indigo-600">für moderne Unternehmen</span>
            </motion.h1>
            
            <motion.p 
              className="mt-5 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Mini CRM bietet eine intuitive und leistungsstarke Plattform zur Verwaltung Ihrer Kontakte, Deals und Aufgaben. Steigern Sie Ihren Umsatz und verbessern Sie Ihre Kundenbeziehungen mit unserer All-in-One-Lösung.
            </motion.p>

            <motion.div 
              className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                <motion.div 
                  className="rounded-md shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                  >
                    Kostenlos registrieren
                  </button>
                </motion.div>
                <motion.div 
                  className="mt-3 sm:mt-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                  >
                    Anmelden
                  </button>
                </motion.div>
              </div>

              <motion.p 
                className="mt-3 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Keine Kreditkarte erforderlich. 14-tägige kostenlose Testversion.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full rounded-lg shadow-xl overflow-hidden">
              <div className="relative bg-white">
                {/* Mockup Header */}
                <div className="h-10 bg-gray-900 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                {/* Dashboard Preview */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Stats Overview */}
                    <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Dashboard Übersicht</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-blue-600 text-xl font-bold">312</div>
                          <div className="text-xs text-gray-600 mt-1">Kontakte</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-green-600 text-xl font-bold">24.5K</div>
                          <div className="text-xs text-gray-600 mt-1">€ Pipeline</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <div className="text-purple-600 text-xl font-bold">8</div>
                          <div className="text-xs text-gray-600 mt-1">Aufgaben</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Deals */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Aktuelle Deals</h3>
                      <ul className="space-y-2">
                        <li className="text-xs bg-green-50 p-2 rounded flex justify-between">
                          <span>Wartungsvertrag</span>
                          <span className="font-medium">€5.200</span>
                        </li>
                        <li className="text-xs bg-yellow-50 p-2 rounded flex justify-between">
                          <span>Software-Lizenz</span>
                          <span className="font-medium">€3.800</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Tasks */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Heutige Aufgaben</h3>
                      <ul className="space-y-2">
                        <li className="text-xs flex items-center">
                          <input type="checkbox" className="mr-2 text-indigo-600" />
                          <span>Angebot erstellen</span>
                        </li>
                        <li className="text-xs flex items-center">
                          <input type="checkbox" className="mr-2 text-indigo-600" />
                          <span>Meeting vorbereiten</span>
                        </li>
                        <li className="text-xs flex items-center">
                          <input type="checkbox" className="mr-2 text-indigo-600" />
                          <span>Kunden anrufen</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
