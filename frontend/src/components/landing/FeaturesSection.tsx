'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  CurrencyEuroIcon, 
  ClipboardIcon,
  ChartBarIcon,
  BellAlertIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Kontaktverwaltung',
    description: 'Organisieren Sie alle Ihre Kontaktinformationen und Interaktionen an einem zentralen Ort. Segmentieren Sie Ihre Kontakte nach verschiedenen Kriterien.',
    icon: UserGroupIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Deal-Management',
    description: 'Verfolgen Sie Ihre Verkaufspipeline von Anfang bis Ende. Überwachen Sie den Fortschritt und analysieren Sie Verkaufstrends.',
    icon: CurrencyEuroIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Aufgaben und Erinnerungen',
    description: 'Organisieren Sie Ihre täglichen Aktivitäten und stellen Sie sicher, dass keine wichtige Aufgabe vergessen wird.',
    icon: ClipboardIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Berichte und Analysen',
    description: 'Visualisieren Sie Ihre Geschäftsdaten und treffen Sie fundierte Entscheidungen mit übersichtlichen Berichten und Dashboards.',
    icon: ChartBarIcon,
    color: 'bg-indigo-500',
  },
  {
    name: 'Benachrichtigungen',
    description: 'Erhalten Sie Echtzeit-Benachrichtigungen über wichtige Ereignisse und verpassen Sie keine Gelegenheit mehr.',
    icon: BellAlertIcon,
    color: 'bg-yellow-500',
  },
  {
    name: 'Notizen und Dokumentation',
    description: 'Erfassen Sie wichtige Informationen zu Kontakten, Deals und Meetings, um den Überblick zu behalten.',
    icon: DocumentTextIcon,
    color: 'bg-red-500',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2"
          >
            Leistungsstarke Funktionen
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight"
          >
            Alles, was Sie für erfolgreiches CRM benötigen
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mt-4 mx-auto text-xl text-gray-500"
          >
            Unser CRM bietet leistungsstarke Funktionen in einer benutzerfreundlichen Oberfläche.
          </motion.p>
        </div>

        <motion.div 
          className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.name}
              variants={fadeInUp}
              className="relative"
            >
              <div className="h-full bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col">
                <div className={`p-2 rounded-lg ${feature.color} inline-block mb-5`}>
                  <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.name}</h3>
                <p className="mt-4 text-base text-gray-500 flex-grow">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <a 
            href="/register" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Jetzt kostenlos testen
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
