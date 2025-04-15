import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { api, getData } from '../../services/api';
import { Note } from '../../types/Note';
import { Contact } from '../../types/Contact';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditNoteModal from '../../components/notes/EditNoteModal';
import CreateNoteModal from '../../components/notes/CreateNoteModal';

const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Fetch notes
  const { data: notes = [], isLoading, isError } = useQuery<Note[]>('notes', async () => {
    const response = await api.get('/api/v1/notes');
    return response.data;
  });

  // Fetch contacts for the create modal
  const { data: contacts = [] } = useQuery<Contact[]>('contacts', async () => {
    // Verwendet die neue getData-Funktion, die das Backend-Antwortformat korrekt verarbeitet
    return await getData<Contact[]>('/api/v1/contacts');
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation(
    (id: number) => api.delete(`/api/v1/notes/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        toast.success('Notiz erfolgreich gelöscht');
        setIsDeleteModalOpen(false);
        setSelectedNote(null);
      },
      onError: () => {
        toast.error('Fehler beim Löschen der Notiz');
      }
    }
  );

  // Handle edit note
  const handleEditClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };

  // Handle delete note
  const handleDeleteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    // Apply search filter
    const searchMatch = searchTerm === '' || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.contact?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.contact?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Notizen
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihre Kontaktnotizen
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setSelectedNote(null);
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Neue Notiz
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
            placeholder="Notizen durchsuchen..."
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Notizen werden geladen...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 h-12 w-12 flex items-center justify-center mx-auto">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden der Notizen</h3>
            <p className="mt-1 text-sm text-gray-500">
              Versuchen Sie es später erneut oder aktualisieren Sie die Seite.
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Notizen gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Keine Notizen entsprechen Ihren Suchkriterien.' 
                : 'Erstellen Sie Ihre erste Notiz, um loszulegen.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-sm text-primary-600 hover:text-primary-800"
              >
                Suche zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    {note.contact && (
                      <div className="flex items-center mb-3">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <Link 
                          to={`/contacts/${note.contact.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                          {note.contact.first_name} {note.contact.last_name}
                        </Link>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {format(new Date(note.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}
                    </p>
                    
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(note)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(note)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        contacts={contacts}
      />

      {/* Edit Note Modal */}
      {selectedNote && (
        <EditNoteModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedNote(null);
          }}
          note={selectedNote}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedNote(null);
        }}
        onConfirm={() => {
          if (selectedNote) {
            deleteNoteMutation.mutate(selectedNote.id);
          }
        }}
        title="Notiz löschen"
        message="Sind Sie sicher, dass Sie diese Notiz löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        isDeleting={deleteNoteMutation.isLoading}
      />
    </div>
  );
};

export default NotesPage;
