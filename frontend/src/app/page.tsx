'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

// Dynamisch importierte Komponenten mit Lazy Loading
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  loading: () => <div className="h-96 bg-indigo-50 flex items-center justify-center">Loading...</div>
});

const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), {
  loading: () => <div className="h-72 bg-white flex items-center justify-center">Loading...</div>
});

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), {
  loading: () => <div className="h-72 bg-indigo-50 flex items-center justify-center">Loading...</div>
});

const CTASection = dynamic(() => import('@/components/landing/CTASection'), {
  loading: () => <div className="h-72 bg-indigo-700 flex items-center justify-center">Loading...</div>
});

const Footer = dynamic(() => import('@/components/landing/Footer'), {
  loading: () => <div className="h-72 bg-gray-900 flex items-center justify-center">Loading...</div>
});

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            {/* Logo */}
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/">
                <span className="sr-only">Mini CRM</span>
                <div className="h-8 w-auto sm:h-10 text-2xl font-bold text-indigo-600 flex items-center">
                  <span className="text-indigo-500 mr-1">Mini</span>CRM
                </div>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="sr-only">Menü öffnen</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-10">
              <Link href="/#features" className="text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors">Funktionen</Link>
              <Link href="/pricing" className="text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors">Preise</Link>
              <Link href="/#testimonials" className="text-base font-medium text-gray-700 hover:text-indigo-600 transition-colors">Referenzen</Link>
            </nav>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
              <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                Anmelden
              </Link>
              <Link href="/register" className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Kostenlos registrieren
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on mobile menu state */}
        {isMobileMenuOpen && (
          <motion.div 
            className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="h-8 w-auto text-xl font-bold text-indigo-600">Mini CRM</span>
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="sr-only">Menü schließen</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    <Link href="/#features" className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="ml-3 text-base font-medium text-gray-900">Funktionen</span>
                    </Link>
                    <Link href="/pricing" className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="ml-3 text-base font-medium text-gray-900">Preise</span>
                    </Link>
                    <Link href="/#testimonials" className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="ml-3 text-base font-medium text-gray-900">Referenzen</span>
                    </Link>
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <Link href="/about" className="text-base font-medium text-gray-900 hover:text-gray-700">
                    Über uns
                  </Link>
                  <Link href="/contact" className="text-base font-medium text-gray-900 hover:text-gray-700">
                    Kontakt
                  </Link>
                </div>
                <div>
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Kostenlos registrieren
                  </Link>
                  <p className="mt-6 text-center text-base font-medium text-gray-500">
                    Bereits registriert?{' '}
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                      Anmelden
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials */}
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        
        {/* CTA Section */}
        <CTASection />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
