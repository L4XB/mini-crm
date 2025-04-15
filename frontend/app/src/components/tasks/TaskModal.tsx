import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Task } from '../../types/Task';
import { Deal } from '../../types/Deal';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  deals?: Deal[];
  isCreating?: boolean;
  contactId?: number;
  dealId?: number;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  deals,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!task;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const initialValues = {
    title: task?.title || '',
    details: task?.details || '',
    due_date: task?.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : format(tomorrow, 'yyyy-MM-dd'),
    deal_id: task?.deal_id || '',
    completed: task?.completed || false,
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Titel ist erforderlich')
      .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
      .max(128, 'Titel darf maximal 128 Zeichen lang sein'),
    details: Yup.string()
      .max(1024, 'Beschreibung darf maximal 1024 Zeichen lang sein'),
    due_date: Yup.date()
      .required('Fälligkeitsdatum ist erforderlich'),
    deal_id: Yup.string().nullable(),
    completed: Yup.boolean(),
  });

  const createTaskMutation = useMutation(
    async (values: any) => {
      // Convert deal_id to number or null
      const payload = {
        ...values,
        deal_id: values.deal_id ? parseInt(values.deal_id) : null,
      };
      console.log('Erstelle Aufgabe:', payload);
      return await api.post('/api/v1/tasks', payload);
    },
    {
      onSuccess: () => {
        // Alle relevanten Caches invalidieren
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('dashboard');
        
        // Falls einen Deal zugeordnet ist, auch dessen Daten aktualisieren
        if (initialValues.deal_id) {
          queryClient.invalidateQueries(['deal', initialValues.deal_id]);
        }
        
        toast.success('Aufgabe erfolgreich erstellt');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Erstellen der Aufgabe:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Erstellen der Aufgabe';
        toast.error(errorMessage);
      },
    }
  );

  const updateTaskMutation = useMutation(
    async (values: any) => {
      if (!task?.id) {
        throw new Error('Keine Aufgaben-ID vorhanden');
      }
      
      // Convert deal_id to number or null
      const payload = {
        ...values,
        deal_id: values.deal_id ? parseInt(values.deal_id) : null,
      };
      
      console.log('Aktualisiere Aufgabe:', task.id, payload);
      return await api.put(`/api/v1/tasks/${task.id}`, payload);
    },
    {
      onSuccess: () => {
        // Alle relevanten Caches invalidieren
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('dashboard');
        
        // Wenn es einen alten oder neuen Deal gibt, dessen Daten aktualisieren
        if (task?.deal_id) {
          queryClient.invalidateQueries(['deal', task.deal_id.toString()]);
        }
        if (initialValues.deal_id && initialValues.deal_id !== task?.deal_id) {
          queryClient.invalidateQueries(['deal', initialValues.deal_id]);
        }
        
        toast.success('Aufgabe erfolgreich aktualisiert');
        onClose();
      },
      onError: (error: any) => {
        console.error('Fehler beim Aktualisieren der Aufgabe:', error);
        const errorMessage = error?.response?.data?.error || 'Fehler beim Aktualisieren der Aufgabe';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = async (values: any) => {
    try {
      // Werte aufbereiten
      const preparedValues = {
        ...values,
        title: values.title.trim(),
        details: values.details?.trim() || '',
        // Stellt sicher, dass due_date ein gültiges Datum ist
        due_date: values.due_date || format(tomorrow, 'yyyy-MM-dd'),
        // Stellt sicher, dass deal_id ein gültiger Wert ist
        deal_id: values.deal_id || null,
        completed: !!values.completed
      };
      
      if (isEditing) {
        updateTaskMutation.mutate(preparedValues);
      } else {
        createTaskMutation.mutate(preparedValues);
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
      title={isEditing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, setFieldValue }) => (
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
                placeholder="z.B. Meeting vorbereiten"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div>
              <label htmlFor="details" className="form-label">
                Details
              </label>
              <Field
                as="textarea"
                id="details"
                name="details"
                rows={3}
                className="form-input"
                placeholder="Optionale Beschreibung der Aufgabe..."
              />
              <ErrorMessage
                name="details"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="due_date" className="form-label">
                  Fälligkeitsdatum
                </label>
                <Field
                  type="date"
                  id="due_date"
                  name="due_date"
                  className="form-input"
                />
                <ErrorMessage
                  name="due_date"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>

              <div>
                <label htmlFor="deal_id" className="form-label">
                  Zugehöriger Deal (optional)
                </label>
                <Field
                  as="select"
                  id="deal_id"
                  name="deal_id"
                  className="form-input"
                >
                  <option value="">Keinen Deal auswählen</option>
                  {Array.isArray(deals) && deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="deal_id"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center">
                <Field
                  type="checkbox"
                  id="completed"
                  name="completed"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                  Als erledigt markieren
                </label>
              </div>
            )}

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
                  'Aufgabe aktualisieren'
                ) : (
                  'Aufgabe erstellen'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default TaskModal;
