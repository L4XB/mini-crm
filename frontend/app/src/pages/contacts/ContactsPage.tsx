import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Contact, ContactFormData } from '../../types/Contact';
import { 
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ContactModal from '../../components/contacts/ContactModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { motion } from 'framer-motion';

const ContactsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [contactStageFilter, setContactStageFilter] = useState<string>('all');
  
  // Fetch contacts
  const { data: contacts = [], isLoading, isError } = useQuery<Contact[]>('contacts', async () => {
    const response = await api.get('/api/v1/contacts');
    return response.data;
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation(
    (id: number) => api.delete(`/api/v1/contacts/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contacts');
        toast.success('Kontakt erfolgreich gelöscht');
        setContactToDelete(null);
        setIsDeleteModalOpen(false);
      },
      onError: () => {
        toast.error('Fehler beim Löschen des Kontakts');
      }
    }
  );

  // Handle contact deletion
  const handleDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id);
    }
  };

  // Open edit modal
  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    // First apply stage filter
    const stageMatch = contactStageFilter === 'all' || contact.contact_stage === contactStageFilter;
    
    // Then apply search filter
    const searchMatch = searchTerm === '' || 
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return stageMatch && searchMatch;
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Kontakte
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihre Kunden und Leads
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Neuer Kontakt
          </motion.button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 sm:flex sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 mt-2 sm:mt-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
            placeholder="Kontakte durchsuchen..."
          />
        </div>

        {/* Filter by contact stage */}
        <div className="mt-2 sm:mt-0 sm:ml-2">
          <select
            value={contactStageFilter}
            onChange={(e) => setContactStageFilter(e.target.value)}
            className="form-input w-full sm:w-auto"
          >
            <option value="all">Alle Kontakte</option>
            <option value="Lead">Nur Leads</option>
            <option value="Prospect">Nur Prospects</option>
            <option value="Customer">Nur Kunden</option>
          </select>
        </div>
      </div>

      {/* Contacts list */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Kontakte werden geladen...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 h-12 w-12 flex items-center justify-center mx-auto">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden der Kontakte</h3>
            <p className="mt-1 text-sm text-gray-500">
              Versuchen Sie es später erneut oder aktualisieren Sie die Seite.
            </p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Kontakte gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || contactStageFilter !== 'all' 
                ? 'Keine Kontakte entsprechen Ihren Filterkriterien.' 
                : 'Erstellen Sie Ihren ersten Kontakt, um loszulegen.'}
            </p>
            {(searchTerm || contactStageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setContactStageFilter('all');
                }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-800"
              >
                Filter zurücksetzen
              </button>
            )}
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
                    Kontaktinfo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unternehmen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <motion.tr 
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <Link 
                            to={`/contacts/${contact.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {contact.first_name} {contact.last_name}
                          </Link>
                          <div className="text-sm text-gray-500">{contact.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" /> 
                        <a href={`mailto:${contact.email}`} className="hover:text-primary-600">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 mr-1" /> 
                          <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.company ? (
                        <div className="text-sm text-gray-900 flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-500" />
                          {contact.company}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        contact.contact_stage === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                        contact.contact_stage === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {contact.contact_stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(contact)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(contact)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        contact={editingContact}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Kontakt löschen"
        message={`Sind Sie sicher, dass Sie ${contactToDelete?.first_name} ${contactToDelete?.last_name} löschen möchten? Alle zugehörigen Deals, Aufgaben und Notizen werden ebenfalls gelöscht.`}
        isDeleting={deleteContactMutation.isLoading}
      />
    </div>
  );
};

export default ContactsPage;
