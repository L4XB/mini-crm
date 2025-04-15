'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: 'Produkt',
      links: [
        { name: 'Funktionen', href: '/#features' },
        { name: 'Preise', href: '/pricing' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Unternehmen',
      links: [
        { name: 'Über uns', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Karriere', href: '/careers' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { name: 'Datenschutz', href: '/privacy' },
        { name: 'AGB', href: '/terms' },
        { name: 'Impressum', href: '/imprint' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Kontakt', href: '/contact' },
        { name: 'Hilfe', href: '/help' },
        { name: 'Status', href: '/status' },
      ],
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          <div className="space-y-8 xl:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white">Mini CRM</h2>
              <p className="text-gray-400 mt-2 max-w-xs">
                Die einfache und leistungsstarke CRM-Lösung für moderne Unternehmen jeder Größe.
              </p>
            </motion.div>
            <div className="flex space-x-6">
              {/* Social Media Links */}
              {[
                { name: 'Facebook', href: '#', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
                { name: 'Twitter', href: '#', icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                { name: 'LinkedIn', href: '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M2 4a2 2 0 114 0 2 2 0 01-4 0z' },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={item.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((section) => (
                <div key={section.title} className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-base text-gray-400 hover:text-white">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(2, 4).map((section) => (
                <div key={section.title} className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-base text-gray-400 hover:text-white">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {currentYear} Mini CRM. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
