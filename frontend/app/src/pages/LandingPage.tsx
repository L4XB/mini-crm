import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Kontaktverwaltung',
      description: 'Verwalten Sie Ihre Kontakte und organisieren Sie diese nach verschiedenen Kategorien und Segmenten.',
      icon: <UserGroupIcon className="h-8 w-8 text-primary-500" />
    },
    {
      title: 'Deal-Tracking',
      description: 'Überwachen Sie alle Ihre Deals, vom ersten Kontakt bis zum erfolgreichen Abschluss.',
      icon: <CurrencyEuroIcon className="h-8 w-8 text-primary-500" />
    },
    {
      title: 'Aufgabenmanagement',
      description: 'Erstellen und verfolgen Sie Aufgaben, um nichts Wichtiges zu vergessen.',
      icon: <ClipboardDocumentListIcon className="h-8 w-8 text-primary-500" />
    },
    {
      title: 'Dashboards & Berichte',
      description: 'Visualisieren Sie Ihre Daten mit intuitiven Dashboards und detaillierten Berichten.',
      icon: <ChartBarIcon className="h-8 w-8 text-primary-500" />
    }
  ];

  const benefits = [
    'Steigern Sie Ihre Verkaufseffizienz',
    'Verbessern Sie die Kundenbindung',
    'Zentralisieren Sie Ihre Kundendaten',
    'Optimieren Sie Ihre Vertriebsprozesse',
    'Erhalten Sie wertvolle Einblicke durch Analysen'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo192.png" 
              alt="Mini CRM Logo" 
              className="h-10 w-10 mr-3" 
            />
            <h1 className="text-2xl font-bold text-gray-900">Mini-CRM</h1>
          </div>
          <div>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Zum Dashboard
              </Link>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="btn btn-ghost">
                  Anmelden
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Vereinfachen Sie Ihr Kundenmanagement
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Mini-CRM bietet alle Werkzeuge, die Sie brauchen, um Ihre Kundenbeziehungen effektiv zu verwalten und zu verbessern.
              </p>
              <div className="flex gap-4">
                <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary">
                  {user ? "Zum Dashboard" : "Jetzt starten"} <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
                <a href="#features" className="btn btn-outline">
                  Mehr erfahren
                </a>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2 md:pl-10"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src="/dashboard-preview.jpg" 
                alt="Dashboard Preview" 
                className="rounded-lg shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Mini-CRM+Dashboard';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alles was Sie für Ihr CRM benötigen
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unsere benutzerfreundliche Plattform bietet alle Werkzeuge, die Sie für effektives Kundenmanagement benötigen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Warum Mini-CRM wählen?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Unser Mini-CRM wurde entwickelt, um Ihnen dabei zu helfen, Ihre Kundenbeziehungen zu verbessern und Ihren Vertriebsprozess zu optimieren.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                  >
                    <div className="flex-shrink-0 bg-primary-100 rounded-full p-1 mr-3">
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="md:w-1/2 md:pl-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bereit zum Starten?</h3>
                <p className="text-gray-600 mb-6">
                  Beginnen Sie noch heute mit Mini-CRM und verbessern Sie Ihr Kundenmanagement.
                </p>
                <Link 
                  to={user ? "/dashboard" : "/register"}
                  className="btn btn-primary w-full text-center"
                >
                  {user ? "Zum Dashboard" : "Kostenfrei beginnen"}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <img 
                  src="/logo192.png" 
                  alt="Mini CRM Logo" 
                  className="h-8 w-8 mr-3" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <h3 className="text-xl font-bold">Mini-CRM</h3>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                Eine einfache, aber leistungsstarke CRM-Lösung für Unternehmen jeder Größe.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Schnelllinks</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition">
                    Startseite
                  </Link>
                </li>
                <li>
                  <Link to={user ? "/dashboard" : "/login"} className="text-gray-400 hover:text-white transition">
                    {user ? "Dashboard" : "Anmelden"}
                  </Link>
                </li>
                {!user && (
                  <li>
                    <Link to="/register" className="text-gray-400 hover:text-white transition">
                      Registrieren
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Mini-CRM. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
