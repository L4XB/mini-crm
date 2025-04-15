import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, getData } from '../../services/api';
import { Contact } from '../../types/Contact';
import { DealFormData } from '../../types/Deal';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CreateDealFromScratchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDealFromScratchModal: React.FC<CreateDealFromScratchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30); // Default expected date is 30 days from now

  // Fetch contacts for selection
  const { data: contactsData, isLoading: isLoadingContacts } = useQuery<Contact[]>(
    'contacts',
    async () => {
      try {
        return await getData<Contact[]>('/api/v1/contacts');
      } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
        return [];
      }
    },
    { enabled: isOpen } // Only fetch contacts when modal is open
  );
  
  // Stelle sicher, dass contacts immer ein Array ist
  const contacts = Array.isArray(contactsData) ? contactsData : [];

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    `${contact?.first_name || ''} ${contact?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact?.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialValues: DealFormData & { contact_id_selection: string } = {
    title: '',
    description: '',
    value: 0,
    status: 'open',
    expected_date: format(tomorrow, 'yyyy-MM-dd'),
    contact_id: 0,
    contact_id_selection: '', // Used for the dropdown UI, will be converted to number for the API
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Titel ist erforderlich')
      .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
      .max(128, 'Titel darf maximal 128 Zeichen lang sein'),
    description: Yup.string()
      .max(1024, 'Beschreibung darf maximal 1024 Zeichen lang sein'),
    value: Yup.number()
      .required('Wert ist erforderlich')
      .min(0, 'Wert muss größer oder gleich 0 sein'),
    status: Yup.string()
      .required('Status ist erforderlich')
      .oneOf(['open', 'won', 'lost'], 'Ungültiger Status'),
    expected_date: Yup.date()
      .required('Erwartetes Abschlussdatum ist erforderlich'),
    contact_id_selection: Yup.string()
      .required('Kontakt ist erforderlich'),
  });

  const createDealMutation = useMutation(
    (data: DealFormData) => api.post('/api/v1/deals', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deals');
        // Also invalidate the specific contact's data if needed
        if (initialValues.contact_id) {
          queryClient.invalidateQueries(['contact', initialValues.contact_id.toString()]);
        }
        toast.success('Deal erfolgreich erstellt');
        onClose();
      },
      onError: () => {
        toast.error('Fehler beim Erstellen des Deals');
      },
    }
  );

  const handleSubmit = async (values: DealFormData & { contact_id_selection: string }) => {
    // Convert contact_id_selection to a number for the API
    const payload: DealFormData = {
      ...values,
      contact_id: parseInt(values.contact_id_selection),
    };
    delete (payload as any).contact_id_selection;
    
    createDealMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Neuen Deal erstellen"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
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
              
              {isLoadingContacts ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Kontakte werden geladen...</p>
                </div>
              ) : (
                <div>
                  <Field
                    as="select"
                    id="contact_id_selection"
                    name="contact_id_selection"
                    className="form-input"
                  >
                    <option value="">Kontakt auswählen...</option>
                    {filteredContacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} {contact.company ? `(${contact.company})` : ''}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="contact_id_selection"
                    component="div"
                    className="text-sm text-red-600 mt-1"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="form-label">
                Titel
              </label>
              <Field
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="z.B. Software-Lizenzen Q2"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Beschreibung
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={3}
                className="form-input"
                placeholder="Optionale Beschreibung des Deals..."
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="value" className="form-label">
                  Wert (in €)
                </label>
                <Field
                  type="number"
                  id="value"
                  name="value"
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <ErrorMessage
                  name="value"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className="form-input"
                >
                  <option value="open">Offen</option>
                  <option value="won">Gewonnen</option>
                  <option value="lost">Verloren</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expected_date" className="form-label">
                Erwartetes Abschlussdatum
              </label>
              <Field
                type="date"
                id="expected_date"
                name="expected_date"
                className="form-input"
              />
              <ErrorMessage
                name="expected_date"
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
                  'Deal erstellen'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateDealFromScratchModal;
