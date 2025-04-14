'use client';

import { Contact } from '@/types/contact';
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

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

// Helper function to generate avatar color from name
const generateAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 40%)`;
};

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

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
        <div className="p-4 border-b border-gray-200 bg-gray-50 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Kontakte durchsuchen..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-3 flex sm:mt-0 sm:ml-4">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FunnelIcon className="mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                Filter
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              </button>

              {showFilterMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                      Phase filtern
                    </div>
                    {contactStages.map((stage) => (
                      <button
                        key={stage.value}
                        className={`${selectedStage === stage.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm w-full text-left hover:bg-gray-50`}
                        onClick={() => {
                          setSelectedStage(stage.value);
                          setShowFilterMenu(false);
                        }}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleExportContacts}
            >
              <ArrowDownTrayIcon className="mr-2 h-5 w-5 text-gray-500" />
              Exportieren
            </button>
          </div>
        </div>

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
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: generateAvatarColor(contact.name) }}>
                          <span className="font-medium">{getInitials(contact.name)}</span>
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
                          <button className="text-gray-400 hover:text-indigo-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
  );
}
