import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Note } from '../../types/Note';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  const queryClient = useQueryClient();

  const initialValues = {
    content: note.content,
  };

  const validationSchema = Yup.object({
    content: Yup.string()
      .required('Notiz-Inhalt ist erforderlich')
      .min(3, 'Notiz muss mindestens 3 Zeichen lang sein'),
  });

  const updateNoteMutation = useMutation(
    (values: { content: string }) => api.put(`/api/v1/notes/${note.id}`, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes');
        if (note.contact_id) {
          queryClient.invalidateQueries(['contact', note.contact_id.toString()]);
        }
        toast.success('Notiz erfolgreich aktualisiert');
        onClose();
      },
      onError: () => {
        toast.error('Fehler beim Aktualisieren der Notiz');
      },
    }
  );

  const handleSubmit = async (values: { content: string }) => {
    updateNoteMutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notiz bearbeiten"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              {note.contact && (
                <p className="text-sm text-gray-600 mb-2">
                  Kontakt: {note.contact.first_name} {note.contact.last_name}
                </p>
              )}
              
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
                    Aktualisieren...
                  </span>
                ) : (
                  'Notiz aktualisieren'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default EditNoteModal;
