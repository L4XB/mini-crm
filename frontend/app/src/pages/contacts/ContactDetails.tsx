import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Contact } from '../../types/Contact';
import { Deal } from '../../types/Deal';
import { Note, NoteFormData } from '../../types/Note';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  UserCircleIcon,
  PlusIcon,
  DocumentTextIcon,
  BanknotesIcon as CurrencyEuroIcon // Verwende BanknotesIcon als Ersatz für CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ContactModal from '../../components/contacts/ContactModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import AddNoteModal from '../../components/notes/AddNoteModal';
import CreateDealModal from '../../components/deals/CreateDealModal';

const ContactDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
  
  // Get contact details
  const { data: contact, isLoading, isError } = useQuery<Contact>(
    ['contact', id],
    async () => {
      const response = await api.get(`/api/v1/contacts/${id}`);
      return response.data;
    }
  );
  
  // Delete contact mutation
  const deleteContactMutation = useMutation(
    () => api.delete(`/api/v1/contacts/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contacts');
        toast.success('Kontakt erfolgreich gelöscht');
        navigate('/contacts');
      },
      onError: () => {
        toast.error('Fehler beim Löschen des Kontakts');
      }
    }
  );
  
  // Delete note mutation
  const deleteNoteMutation = useMutation(
    (noteId: number) => api.delete(`/api/v1/notes/${noteId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contact', id]);
        toast.success('Notiz erfolgreich gelöscht');
      },
      onError: () => {
        toast.error('Fehler beim Löschen der Notiz');
      }
    }
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isError || !contact) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center">
          <UserCircleIcon className="h-16 w-16 text-gray-300" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Kontakt nicht gefunden</h3>
        <p className="mt-1 text-gray-500">
          Der gesuchte Kontakt existiert nicht oder Sie haben keine Berechtigung, ihn anzusehen.
        </p>
        <div className="mt-6">
          <Link to="/contacts" className="btn btn-primary">
            Zurück zur Kontaktliste
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Zurück
        </button>
      </div>
      
      {/* Contact header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-semibold text-primary-700">
            {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>
            <div className="flex items-center text-gray-500">
              <span className={`px-2 py-1 text-xs rounded-full ${
                contact.contact_stage === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                contact.contact_stage === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {contact.contact_stage}
              </span>
              {contact.position && (
                <span className="ml-2">{contact.position}</span>
              )}
              {contact.company && (
                <span className="ml-2">• {contact.company}</span>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex space-x-3 mt-4 md:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Bearbeiten
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Löschen
          </button>
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact info */}
        <motion.div 
          className="card col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kontaktdaten</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">E-Mail</p>
                <a 
                  href={`mailto:${contact.email}`} 
                  className="text-gray-900 hover:text-primary-600"
                >
                  {contact.email}
                </a>
              </div>
            </div>
            
            {contact.phone && (
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefon</p>
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="text-gray-900 hover:text-primary-600"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
            
            {contact.company && (
              <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Unternehmen</p>
                  <p className="text-gray-900">{contact.company}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <UserCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Erstellt am</p>
                <p className="text-gray-900">
                  {format(new Date(contact.created_at), 'dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Deals and actions section */}
        <motion.div 
          className="col-span-1 md:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Deals */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Deals</h2>
              <button
                onClick={() => setIsCreateDealModalOpen(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Deal erstellen
              </button>
            </div>
            
            {contact.deals && contact.deals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wert
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erwartet bis
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Aktionen</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contact.deals.map((deal: Deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/deals/${deal.id}`} className="hover:text-primary-600">
                              {deal.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {deal.value.toLocaleString('de-DE')} €
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                            deal.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            deal.status === 'won' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {deal.status === 'open' ? 'Offen' : 
                             deal.status === 'won' ? 'Gewonnen' : 'Verloren'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(deal.expected_date), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/deals/${deal.id}`} className="text-primary-600 hover:text-primary-900">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <div className="mx-auto h-12 w-12 text-gray-300">
                  <CurrencyEuroIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Deals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Es sind noch keine Deals für diesen Kontakt vorhanden.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateDealModalOpen(true)}
                    className="btn btn-primary"
                  >
                    Deal erstellen
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Notizen</h2>
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Notiz hinzufügen
              </button>
            </div>
            
            {contact.notes && contact.notes.length > 0 ? (
              <div className="space-y-4">
                {contact.notes.map((note: Note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">
                        {format(new Date(note.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}
                      </p>
                      <button
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-gray-900 whitespace-pre-line">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <div className="mx-auto h-12 w-12 text-gray-300">
                  <DocumentTextIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Notizen</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Es sind noch keine Notizen für diesen Kontakt vorhanden.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddNoteModalOpen(true)}
                    className="btn btn-primary"
                  >
                    Notiz hinzufügen
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Edit contact modal */}
      {isEditModalOpen && (
        <ContactModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          contact={contact}
        />
      )}
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteContactMutation.mutate()}
        title="Kontakt löschen"
        message={`Sind Sie sicher, dass Sie ${contact.first_name} ${contact.last_name} löschen möchten? Alle zugehörigen Notizen und Deals werden ebenfalls gelöscht.`}
        isDeleting={deleteContactMutation.isLoading}
      />
      
      {/* Add note modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        contactId={parseInt(id as string)}
      />
      
      {/* Create deal modal */}
      <CreateDealModal
        isOpen={isCreateDealModalOpen}
        onClose={() => setIsCreateDealModalOpen(false)}
        contactId={parseInt(id as string)}
      />
    </div>
  );
};

export default ContactDetails;
