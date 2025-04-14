'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const testimonials = [
  {
    content: "Mini CRM hat unseren Verkaufsprozess komplett verändert. Wir haben unsere Abschlussrate um 35% steigern können, seit wir das System nutzen.",
    author: "Laura Schmidt",
    role: "Vertriebsleiterin, TechGrow GmbH",
    imageUrl: "/images/avatar-1.png"
  },
  {
    content: "Endlich ein CRM, das einfach zu bedienen ist und trotzdem alle Funktionen bietet, die wir benötigen. Besonders die Aufgabenverwaltung ist hervorragend.",
    author: "Thomas Weber",
    role: "Geschäftsführer, Weber Consulting",
    imageUrl: "/images/avatar-2.png"
  },
  {
    content: "Die Berichterstellung und Analysefunktionen geben uns wertvolle Einblicke in unsere Verkaufspipeline. Die besten Investitionen, die wir je getätigt haben.",
    author: "Maria Becker",
    role: "Marketing Direktorin, Digital Solutions AG",
    imageUrl: "/images/avatar-3.png"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Was unsere Kunden sagen
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Erfahren Sie, wie Mini CRM Unternehmen dabei hilft, ihre Kundenbeziehungen zu verbessern.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4 relative">
                  <Image 
                    src={testimonial.imageUrl} 
                    alt={testimonial.author} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{testimonial.author}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-indigo-100" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="relative text-base text-gray-600 italic">{testimonial.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
