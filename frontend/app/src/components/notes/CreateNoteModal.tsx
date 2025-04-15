import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Contact } from '../../types/Contact';
import { NoteFormData } from '../../types/Note';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  contacts,
}) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Stelle sicher, dass contacts ein Array ist und filtere dann
  const contactsArray = Array.isArray(contacts) ? contacts : [];
  
  // Filter contacts based on search term
  const filteredContacts = contactsArray.filter(contact =>
    `${contact?.first_name || ''} ${contact?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact?.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialValues: NoteFormData & { contact_id_selection: string } = {
    content: '',
    contact_id: 0,
    contact_id_selection: contacts?.[0]?.id?.toString() || '',
  };

  const validationSchema = Yup.object({
    content: Yup.string()
      .required('Notiz-Inhalt ist erforderlich')
      .min(3, 'Notiz muss mindestens 3 Zeichen lang sein'),
    contact_id_selection: Yup.string()
      .required('Kontakt ist erforderlich'),
  });

  const createNoteMutation = useMutation(
    (data: NoteFormData) => {
      console.log('Sende Notiz-Daten an API:', data);
      return api.post('/api/v1/notes', data);
    },
    {
      onSuccess: (response) => {
        // Aktualisiere alle relevanten Daten
        queryClient.invalidateQueries('notes');
        queryClient.invalidateQueries('contacts');
        
        // Wenn eine spezifische Kontakt-ID verwendet wurde, aktualisiere auch deren Daten
        if (data && data.contact_id) {
          queryClient.invalidateQueries(['contact', data.contact_id.toString()]);
        }
        
        toast.success('Notiz erfolgreich erstellt');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Erstellen der Notiz:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Erstellen der Notiz';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = async (values: NoteFormData & { contact_id_selection: string }) => {
    try {
      // Validierung
      if (!values.contact_id_selection) {
        toast.error('Bitte wählen Sie einen Kontakt aus');
        return;
      }
      
      // Convert contact_id_selection to a number for the API
      const contactId = parseInt(values.contact_id_selection);
      if (isNaN(contactId) || contactId <= 0) {
        toast.error('Ungültige Kontakt-ID');
        return;
      }
      
      const payload: NoteFormData = {
        content: values.content.trim(),
        contact_id: contactId,
      };
      
      // Speichere die aktuelle contact_id für die Aktualisierung im onSuccess-Handler
      data = payload;
      
      createNoteMutation.mutate(payload);
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Formulars:', error);
      toast.error('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };
  
  // Speichern der aktuellen Daten für den onSuccess-Handler
  let data: NoteFormData | null = null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Neue Notiz erstellen"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="contact_id_selection" className="form-label">
                Kontakt auswählen
              </label>
              
              {/* Search contacts */}
              <div className="relative mb-2">
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
              
              <Field
                as="select"
                id="contact_id_selection"
                name="contact_id_selection"
                className="form-input"
              >
                <option value="">Kontakt auswählen...</option>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name || ''} {contact.last_name || ''} {contact.company ? `(${contact.company})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Keine Kontakte gefunden</option>
                )}
              </Field>
              <ErrorMessage
                name="contact_id_selection"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div>
              <label htmlFor="content" className="form-label">
                Notiz
              </label>
              <Field
                as="textarea"
                id="content"
                name="content"
                rows={5}
                className="form-input"
                placeholder="Geben Sie hier Ihre Notiz ein..."
              />
              <ErrorMessage
                name="content"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Erstellen...
                  </span>
                ) : (
                  'Notiz erstellen'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateNoteModal;
