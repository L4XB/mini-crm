import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <h2 className="text-center text-3xl font-extrabold text-white">Mini CRM</h2>
          </Link>
        </motion.div>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-white hover:text-primary-100 transition-colors duration-200"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
