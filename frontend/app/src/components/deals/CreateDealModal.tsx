import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { DealFormData } from '../../types/Deal';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  contactId,
}) => {
  const queryClient = useQueryClient();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30); // Default expected date is 30 days from now

  const initialValues: DealFormData = {
    title: '',
    description: '',
    value: 0,
    status: 'open',
    expected_date: format(tomorrow, 'yyyy-MM-dd'),
    contact_id: contactId,
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
  });

  const createDealMutation = useMutation(
    async (data: DealFormData) => {
      console.log('Erstelle Deal:', data);
      return await api.post('/api/v1/deals', data);
    },
    {
      onSuccess: () => {
        // Invalidiere alle relevanten Caches
        queryClient.invalidateQueries(['contact', contactId.toString()]);
        queryClient.invalidateQueries('deals');
        queryClient.invalidateQueries('dashboard');
        toast.success('Deal erfolgreich erstellt');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Erstellen des Deals:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Erstellen des Deals';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = async (values: DealFormData) => {
    try {
      // Sicherstellen, dass die Kontakt-ID vorhanden ist
      if (!contactId) {
        toast.error('Kein gültiger Kontakt ausgewählt');
        return;
      }
      
      // Werte aufbereiten
      const preparedData: DealFormData = {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || '',
        value: typeof values.value === 'string' ? parseFloat(values.value) : values.value,
        contact_id: contactId
      };
      
      // Validierung des Datums
      if (!preparedData.expected_date) {
        preparedData.expected_date = format(tomorrow, 'yyyy-MM-dd');
      }
      
      createDealMutation.mutate(preparedData);
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Formulars:', error);
      toast.error('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deal erstellen"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
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

export default CreateDealModal;
