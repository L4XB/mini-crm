import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { User } from '../../types/User';
import toast from 'react-hot-toast';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isEditing: boolean;
}

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const UserModal = ({ isOpen, onClose, user, isEditing }: UserModalProps): JSX.Element => {
  const queryClient = useQueryClient();

  // Create user mutation
  const createUserMutation = useMutation(
    (values: Omit<UserFormValues, 'confirmPassword'>) => 
      api.post('/api/v1/users', values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Benutzer erfolgreich erstellt');
        onClose();
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Erstellen des Benutzers';
        toast.error(message);
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    (values: Partial<UserFormValues>) => 
      api.put(`/api/v1/users/${user?.id}`, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Benutzer erfolgreich aktualisiert');
        onClose();
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Aktualisieren des Benutzers';
        toast.error(message);
      }
    }
  );

  // Initial values for the form
  const initialValues: UserFormValues = {
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'user',
  };

  // Validation schema for create
  const createValidationSchema = Yup.object({
    username: Yup.string()
      .required('Benutzername ist erforderlich')
      .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
      .max(32, 'Benutzername darf maximal 32 Zeichen lang sein'),
    email: Yup.string()
      .required('E-Mail ist erforderlich')
      .email('Ungültige E-Mail-Adresse'),
    password: Yup.string()
      .required('Passwort ist erforderlich')
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
    confirmPassword: Yup.string()
      .required('Passwortbestätigung ist erforderlich')
      .oneOf([Yup.ref('password')], 'Passwörter müssen übereinstimmen'),
    role: Yup.string()
      .required('Rolle ist erforderlich')
      .oneOf(['user', 'admin'], 'Ungültige Rolle'),
  });

  // Validation schema for edit
  const editValidationSchema = Yup.object({
    username: Yup.string()
      .required('Benutzername ist erforderlich')
      .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
      .max(32, 'Benutzername darf maximal 32 Zeichen lang sein'),
    email: Yup.string()
      .required('E-Mail ist erforderlich')
      .email('Ungültige E-Mail-Adresse'),
    password: Yup.string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
    confirmPassword: Yup.string()
      .test('passwords-match', 'Passwörter müssen übereinstimmen', function(value) {
        return this.parent.password === '' || value === this.parent.password;
      }),
    role: Yup.string()
      .required('Rolle ist erforderlich')
      .oneOf(['user', 'admin'], 'Ungültige Rolle'),
  });

  // Handle form submission
  const handleSubmit = (values: UserFormValues) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...apiValues } = values;

    if (isEditing) {
      // Wenn wir im Bearbeitungsmodus sind und kein Passwort gesetzt wurde, entfernen wir das Feld
      if (!apiValues.password) {
        const { password, ...rest } = apiValues;
        updateUserMutation.mutate(rest);
      } else {
        // Sonst verwenden wir alle Felder einschließlich Passwort
        updateUserMutation.mutate(apiValues);
      }
    } else {
      // Bei der Erstellung eines neuen Benutzers müssen wir immer das Passwort mitgeben
      createUserMutation.mutate(apiValues);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditing ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={isEditing ? editValidationSchema : createValidationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Benutzername
                        </label>
                        <Field
                          type="text"
                          id="username"
                          name="username"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.username && touched.username
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          E-Mail
                        </label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.email && touched.email
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          {isEditing ? 'Passwort (leer lassen, wenn unverändert)' : 'Passwort'}
                        </label>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.password && touched.password
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Passwort bestätigen
                        </label>
                        <Field
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.confirmPassword && touched.confirmPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Benutzerrolle
                        </label>
                        <Field
                          as="select"
                          id="role"
                          name="role"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="user">Benutzer</option>
                          <option value="admin">Administrator</option>
                        </Field>
                        <ErrorMessage
                          name="role"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || createUserMutation.isLoading || updateUserMutation.isLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          {(isSubmitting || createUserMutation.isLoading || updateUserMutation.isLoading) ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verarbeitung...
                            </span>
                          ) : isEditing ? 'Benutzer aktualisieren' : 'Benutzer erstellen'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UserModal;
