import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Deal, DealFormData } from '../../types/Deal';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
}

const EditDealModal: React.FC<EditDealModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  const queryClient = useQueryClient();

  const initialValues: DealFormData = {
    title: deal.title,
    description: deal.description || '',
    value: deal.value,
    status: deal.status,
    expected_date: format(new Date(deal.expected_date), 'yyyy-MM-dd'),
    contact_id: deal.contact_id,
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

  const updateDealMutation = useMutation(
    (data: DealFormData) => api.put(`/api/v1/deals/${deal.id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deals');
        queryClient.invalidateQueries(['deal', deal.id.toString()]);
        if (deal.contact_id) {
          queryClient.invalidateQueries(['contact', deal.contact_id.toString()]);
        }
        toast.success('Deal erfolgreich aktualisiert');
        onClose();
      },
      onError: () => {
        toast.error('Fehler beim Aktualisieren des Deals');
      },
    }
  );

  const handleSubmit = async (values: DealFormData) => {
    updateDealMutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deal bearbeiten"
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
                    Aktualisieren...
                  </span>
                ) : (
                  'Deal aktualisieren'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default EditDealModal;
