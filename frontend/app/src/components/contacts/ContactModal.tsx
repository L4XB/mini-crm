import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Contact, ContactFormData } from '../../types/Contact';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!contact;

  const initialValues: ContactFormData = {
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    position: contact?.position || '',
    company: contact?.company || '',
    contact_stage: contact?.contact_stage || 'Lead',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .required('Vorname ist erforderlich')
      .min(2, 'Vorname muss mindestens 2 Zeichen lang sein')
      .max(64, 'Vorname darf maximal 64 Zeichen lang sein'),
    last_name: Yup.string()
      .required('Nachname ist erforderlich')
      .min(2, 'Nachname muss mindestens 2 Zeichen lang sein')
      .max(64, 'Nachname darf maximal 64 Zeichen lang sein'),
    email: Yup.string()
      .required('E-Mail ist erforderlich')
      .email('Ungültiges E-Mail-Format'),
    phone: Yup.string()
      .max(32, 'Telefonnummer darf maximal 32 Zeichen lang sein'),
    position: Yup.string()
      .max(64, 'Position darf maximal 64 Zeichen lang sein'),
    company: Yup.string()
      .max(128, 'Firmenname darf maximal 128 Zeichen lang sein'),
    contact_stage: Yup.string()
      .required('Kontaktstatus ist erforderlich')
      .oneOf(['Lead', 'Prospect', 'Customer'], 'Ungültiger Status'),
  });

  const createContactMutation = useMutation(
    async (data: ContactFormData) => {
      console.log('Erstelle Kontakt:', data);
      return await api.post('/api/v1/contacts', data);
    },
    {
      onSuccess: () => {
        // Invalidiere alle kontaktbezogenen Daten
        queryClient.invalidateQueries('contacts');
        queryClient.invalidateQueries('dashboard');
        
        toast.success('Kontakt erfolgreich erstellt');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Erstellen des Kontakts:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Erstellen des Kontakts';
        toast.error(errorMessage);
      },
    }
  );

  const updateContactMutation = useMutation(
    async (data: ContactFormData) => {
      if (!contact?.id) {
        throw new Error('Keine Kontakt-ID vorhanden');
      }
      console.log('Aktualisiere Kontakt:', contact.id, data);
      return await api.put(`/api/v1/contacts/${contact.id}`, data);
    },
    {
      onSuccess: () => {
        // Invalidiere alle relevanten Caches
        queryClient.invalidateQueries('contacts');
        queryClient.invalidateQueries('dashboard');
        
        // Invalidiere spezifische Kontaktdaten, wenn sie gecacht sind
        if (contact?.id) {
          queryClient.invalidateQueries(['contact', contact.id]);
          queryClient.invalidateQueries(['contact', contact.id.toString()]);
        }
        
        toast.success('Kontakt erfolgreich aktualisiert');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Aktualisieren des Kontakts:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Aktualisieren des Kontakts';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = async (values: ContactFormData) => {
    try {
      // Trimme alle String-Werte
      const trimmedValues: ContactFormData = {
        ...values,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || '',
        position: values.position?.trim() || '',
        company: values.company?.trim() || '',
        contact_stage: values.contact_stage
      };
      
      // Führe die entsprechende Mutation aus
      if (isEditing) {
        updateContactMutation.mutate(trimmedValues);
      } else {
        createContactMutation.mutate(trimmedValues);
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Formulars:', error);
      toast.error('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Kontakt bearbeiten' : 'Neuen Kontakt erstellen'}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="form-label">
                  Vorname
                </label>
                <Field
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="form-input"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="form-label">
                  Nachname
                </label>
                <Field
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="form-input"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                E-Mail
              </label>
              <Field
                type="email"
                id="email"
                name="email"
                className="form-input"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Telefon
              </label>
              <Field
                type="text"
                id="phone"
                name="phone"
                className="form-input"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="form-label">
                  Unternehmen
                </label>
                <Field
                  type="text"
                  id="company"
                  name="company"
                  className="form-input"
                />
                <ErrorMessage
                  name="company"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>

              <div>
                <label htmlFor="position" className="form-label">
                  Position
                </label>
                <Field
                  type="text"
                  id="position"
                  name="position"
                  className="form-input"
                />
                <ErrorMessage
                  name="position"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact_stage" className="form-label">
                Status
              </label>
              <Field
                as="select"
                id="contact_stage"
                name="contact_stage"
                className="form-input"
              >
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Kunde</option>
              </Field>
              <ErrorMessage
                name="contact_stage"
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
                    {isEditing ? 'Aktualisieren...' : 'Erstellen...'}
                  </span>
                ) : isEditing ? (
                  'Kontakt aktualisieren'
                ) : (
                  'Kontakt erstellen'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ContactModal;
