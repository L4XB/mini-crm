import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="bg-yellow-100 p-4 rounded-full">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-600" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-3xl font-bold text-gray-900"
        >
          404 - Seite nicht gefunden
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 text-lg text-gray-600"
        >
          Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Zurück zur Startseite
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
