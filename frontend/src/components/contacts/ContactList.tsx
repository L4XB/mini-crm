'use client';

import React from 'react';
import { Contact } from '@/types/contact';
import { 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ContactListProps {
  contacts: Contact[];
  onDeleteContact: (id: number) => void;
}

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Helper function to generate a color based on a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 40%)`;
};

// Map contact stages to badge colors
const stageBadgeColors = {
  lead: 'bg-blue-100 text-blue-800',
  prospect: 'bg-amber-100 text-amber-800',
  customer: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

// Map contact stages to display labels
const stageLabels = {
  lead: 'Lead',
  prospect: 'Interessent',
  customer: 'Kunde',
  inactive: 'Inaktiv',
};

export const ContactList: React.FC<ContactListProps> = ({ contacts, onDeleteContact }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kontaktdaten
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position & Unternehmen
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
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white" 
                    style={{ backgroundColor: stringToColor(contact.name) }}>
                    {getInitials(contact.name)}
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
                <div className="text-sm text-gray-900">
                  <div className="flex items-center mb-1">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{contact.position}</div>
                <div className="text-sm text-gray-500">{contact.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stageBadgeColors[contact.contactStage as keyof typeof stageBadgeColors]}`}>
                  {stageLabels[contact.contactStage as keyof typeof stageLabels]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Link href={`/contacts/${contact.id}/edit`}>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                      <span className="sr-only">Bearbeiten</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="sr-only">Löschen</span>
                  </button>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-500">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                      <span className="sr-only">Mehr</span>
                    </button>
                    {/* Dropdown menu would go here */}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
