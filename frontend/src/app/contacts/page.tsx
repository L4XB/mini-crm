'use client';

import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactFilters } from '@/components/contacts/ContactFilters';
import { Contact } from '@/types/contact';

// Mock contact data
const MOCK_CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    phone: '+49 123 4567890',
    position: 'Geschäftsführer',
    company: 'Musterfirma GmbH',
    contactStage: 'customer',
    notes: 'Langjähriger Kunde mit Interesse an neuen Produkten.',
    tags: ['VIP', 'Langzeit']
  },
  {
    id: 2,
    name: 'Anna Schmidt',
    email: 'anna.schmidt@example.com',
    phone: '+49 987 6543210',
    position: 'Marketing Direktorin',
    company: 'Marketing AG',
    contactStage: 'lead',
    notes: 'Interesse an Marketing-Automation geäußert.',
    tags: ['Neu', 'Marketing']
  },
  {
    id: 3,
    name: 'Thomas Weber',
    email: 'thomas.weber@example.com',
    phone: '+49 234 5678901',
    position: 'IT-Leiter',
    company: 'Tech Solutions GmbH',
    contactStage: 'prospect',
    notes: 'Braucht ein Angebot für IT-Infrastruktur.',
    tags: ['IT', 'Dringend']
  },
  {
    id: 4,
    name: 'Laura Müller',
    email: 'laura.mueller@example.com',
    phone: '+49 345 6789012',
    position: 'Vertriebsleiterin',
    company: 'Vertrieb & Co KG',
    contactStage: 'customer',
    notes: 'Monatlicher Check-in vereinbart.',
    tags: ['Vertrieb', 'Wichtig']
  },
  {
    id: 5,
    name: 'Michael Klein',
    email: 'michael.klein@example.com',
    phone: '+49 456 7890123',
    position: 'Finanzdirektor',
    company: 'Finanzwesen AG',
    contactStage: 'inactive',
    notes: 'Seit 3 Monaten kein Kontakt.',
    tags: ['Finanzen']
  },
  {
    id: 6,
    name: 'Sophie Wagner',
    email: 'sophie.wagner@example.com',
    phone: '+49 567 8901234',
    position: 'HR Managerin',
    company: 'Personal GmbH',
    contactStage: 'prospect',
    notes: 'Interesse an HR-Management-Systemen.',
    tags: ['HR', 'Software']
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Mock contact stages
  const contactStages = [
    { value: 'all', label: 'Alle Phasen' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Interessent' },
    { value: 'customer', label: 'Kunde' },
    { value: 'inactive', label: 'Inaktiv' },
  ];

  const handleDeleteContact = (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Kontakt löschen möchten?')) {
      try {
        setContacts(contacts.filter(contact => contact.id !== id));
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Fehler beim Löschen des Kontakts.');
      }
    }
  };
  
  const handleExportContacts = () => {
    alert('CSV-Export-Funktion wird implementiert');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === 'all' || contact.contactStage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontakte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihre Geschäftskontakte und deren Informationen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/contacts/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Neuer Kontakt
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ContactFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            contactStages={contactStages}
            onExportContacts={handleExportContacts}
          />

          {isLoading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              {searchTerm || selectedStage !== 'all'
                ? 'Keine Kontakte entsprechen Ihren Filterkriterien.'
                : 'Keine Kontakte vorhanden. Erstellen Sie Ihren ersten Kontakt!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position / Unternehmen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontakt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full" 
                               style={{ backgroundColor: stringToColor(contact.name) }}>
                            <span className="text-white font-medium">{getInitials(contact.name)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link href={`/contacts/${contact.id}`} className="hover:text-indigo-600">
                                {contact.name}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.position}</div>
                        <div className="text-sm text-gray-500">{contact.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 mb-1">
                          <EnvelopeIcon className="mr-2 h-4 w-4 text-gray-400" />
                          <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${contact.contactStage === 'lead' ? 'bg-blue-100 text-blue-800' : 
                            contact.contactStage === 'prospect' ? 'bg-yellow-100 text-yellow-800' : 
                            contact.contactStage === 'customer' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {contactStages.find(stage => stage.value === contact.contactStage)?.label || 'Unbekannt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/contacts/${contact.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
