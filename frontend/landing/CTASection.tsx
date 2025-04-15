'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const CTASection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-16 sm:py-24 bg-indigo-700 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute top-64 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bereit, Ihr CRM auf die nächste Stufe zu bringen?
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-100">
              Registrieren Sie sich noch heute und erleben Sie, wie Mini CRM Ihre Kundenbeziehungen verbessern kann. Starten Sie mit unserem kostenlosen Testangebot.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => router.push('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                Kostenlos starten
              </motion.button>
              <motion.button
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
              >
                Mehr erfahren
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div
            className="mt-10 lg:mt-0"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kostenlose Testversion beinhaltet:</h3>
              <ul className="space-y-4">
                {[
                  'Unbegrenzte Kontakte',
                  'Deal-Management',
                  'Aufgaben und Erinnerungen',
                  'Grundlegende Berichte',
                  'E-Mail-Integration',
                  'Mobile Apps (iOS & Android)'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Keine Kreditkarte erforderlich. Nach Ablauf der 14-tägigen Testversion können Sie ein Abonnement abschließen oder bei der kostenlosen Basisversion bleiben.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
