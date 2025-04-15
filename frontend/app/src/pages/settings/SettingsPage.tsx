import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { 
  Cog6ToothIcon, 
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface UserSettingsFormValues {
  username: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AppSettingsFormValues {
  theme: string;
  language: string;
}

const SettingsPage: React.FC = () => {
  const { user, getMe } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery(['settings', user?.id], 
    async () => {
      if (!user) return null;
      const response = await api.get(`/api/v1/users/${user.id}/settings`);
      return response.data;
    },
    {
      enabled: !!user,
    }
  );

  // Update user profile mutation
  const updateUserMutation = useMutation(
    (values: UserSettingsFormValues) => api.put(`/api/v1/users/${user?.id}`, values),
    {
      onSuccess: async () => {
        toast.success('Profil erfolgreich aktualisiert');
        // Refresh user data
        await getMe();
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Aktualisieren des Profils';
        toast.error(message);
      }
    }
  );

  // Update password mutation
  const updatePasswordMutation = useMutation(
    (values: { password: string, old_password: string }) => 
      api.put(`/api/v1/users/${user?.id}`, values),
    {
      onSuccess: () => {
        toast.success('Passwort erfolgreich aktualisiert');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Aktualisieren des Passworts';
        toast.error(message);
      }
    }
  );

  // Update app settings mutation
  const updateSettingsMutation = useMutation(
    (values: AppSettingsFormValues) => api.put(`/api/v1/users/${user?.id}/settings`, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings', user?.id]);
        toast.success('Einstellungen erfolgreich aktualisiert');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Aktualisieren der Einstellungen';
        toast.error(message);
      }
    }
  );

  // Initial values for profile form
  const userSettingsInitialValues: UserSettingsFormValues = {
    username: user?.username || '',
    email: user?.email || '',
  };

  // Validation schema for profile form
  const userSettingsValidationSchema = Yup.object({
    username: Yup.string()
      .required('Benutzername ist erforderlich')
      .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
      .max(32, 'Benutzername darf maximal 32 Zeichen lang sein'),
    email: Yup.string()
      .required('E-Mail ist erforderlich')
      .email('Ungültige E-Mail-Adresse'),
  });

  // Initial values for password form
  const passwordInitialValues: PasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Validation schema for password form
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Aktuelles Passwort ist erforderlich'),
    newPassword: Yup.string()
      .required('Neues Passwort ist erforderlich')
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
    confirmPassword: Yup.string()
      .required('Passwortbestätigung ist erforderlich')
      .oneOf([Yup.ref('newPassword')], 'Passwörter müssen übereinstimmen'),
  });

  // Initial values for app settings form
  const appSettingsInitialValues: AppSettingsFormValues = {
    theme: settings?.theme || 'light',
    language: settings?.language || 'de',
  };

  // Validation schema for app settings form
  const appSettingsValidationSchema = Yup.object({
    theme: Yup.string()
      .required('Thema ist erforderlich')
      .oneOf(['light', 'dark'], 'Ungültiges Thema'),
    language: Yup.string()
      .required('Sprache ist erforderlich')
      .oneOf(['de', 'en'], 'Ungültige Sprache'),
  });

  // Handle profile form submission
  const handleUserSettingsSubmit = (values: UserSettingsFormValues) => {
    updateUserMutation.mutate(values);
  };

  // Handle password form submission
  const handlePasswordSubmit = (values: PasswordFormValues) => {
    updatePasswordMutation.mutate({
      old_password: values.currentPassword,
      password: values.newPassword,
    });
  };

  // Handle app settings form submission
  const handleAppSettingsSubmit = (values: AppSettingsFormValues) => {
    updateSettingsMutation.mutate(values);
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Einstellungen
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihr Profil und Ihre Anwendungseinstellungen
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings navigation */}
        <div className="w-full md:w-64 bg-white shadow rounded-lg h-fit">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'profile'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'password'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <KeyIcon className="h-5 w-5 mr-2" />
              Passwort
            </button>
            <button
              onClick={() => setActiveTab('app')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'app'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Anwendung
            </button>
          </nav>
        </div>

        {/* Settings content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow rounded-lg p-6"
          >
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Profileinstellungen</h2>
                <Formik
                  initialValues={userSettingsInitialValues}
                  validationSchema={userSettingsValidationSchema}
                  onSubmit={handleUserSettingsSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="username" className="form-label">
                          Benutzername
                        </label>
                        <Field
                          type="text"
                          id="username"
                          name="username"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
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

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting || updateUserMutation.isLoading}
                          className="btn btn-primary"
                        >
                          {(isSubmitting || updateUserMutation.isLoading) ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Speichern...
                            </span>
                          ) : (
                            'Änderungen speichern'
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900">Benutzerrolle</h3>
                  <div className="mt-2 flex items-center text-sm bg-gray-50 p-4 rounded-md">
                    <ShieldCheckIcon className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-gray-700">
                      Ihre Rolle: <span className="font-medium capitalize">{user?.role}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Passwort ändern</h2>
                <Formik
                  initialValues={passwordInitialValues}
                  validationSchema={passwordValidationSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ isSubmitting, resetForm }) => (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="form-label">
                          Aktuelles Passwort
                        </label>
                        <Field
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="currentPassword"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="form-label">
                          Neues Passwort
                        </label>
                        <Field
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="form-label">
                          Passwort bestätigen
                        </label>
                        <Field
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-sm text-red-600 mt-1"
                        />
                      </div>

                      <div className="mt-6 flex items-center space-x-3">
                        <button
                          type="submit"
                          disabled={isSubmitting || updatePasswordMutation.isLoading}
                          className="btn btn-primary"
                        >
                          {(isSubmitting || updatePasswordMutation.isLoading) ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Speichern...
                            </span>
                          ) : (
                            'Passwort ändern'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => resetForm()}
                          className="btn btn-secondary"
                        >
                          Zurücksetzen
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}

            {/* App Settings */}
            {activeTab === 'app' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Anwendungseinstellungen</h2>
                
                {isLoadingSettings ? (
                  <div className="flex justify-center py-8">
                    <ArrowPathIcon className="h-8 w-8 text-primary-500 animate-spin" />
                  </div>
                ) : (
                  <Formik
                    initialValues={appSettingsInitialValues}
                    validationSchema={appSettingsValidationSchema}
                    onSubmit={handleAppSettingsSubmit}
                    enableReinitialize
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        <div>
                          <label htmlFor="theme" className="form-label">
                            Darstellung
                          </label>
                          <Field
                            as="select"
                            id="theme"
                            name="theme"
                            className="form-input"
                          >
                            <option value="light">Hell</option>
                            <option value="dark">Dunkel</option>
                          </Field>
                          <ErrorMessage
                            name="theme"
                            component="div"
                            className="text-sm text-red-600 mt-1"
                          />
                        </div>

                        <div>
                          <label htmlFor="language" className="form-label">
                            Sprache
                          </label>
                          <Field
                            as="select"
                            id="language"
                            name="language"
                            className="form-input"
                          >
                            <option value="de">Deutsch</option>
                            <option value="en">Englisch</option>
                          </Field>
                          <ErrorMessage
                            name="language"
                            component="div"
                            className="text-sm text-red-600 mt-1"
                          />
                        </div>

                        <div className="mt-6">
                          <button
                            type="submit"
                            disabled={isSubmitting || updateSettingsMutation.isLoading}
                            className="btn btn-primary"
                          >
                            {(isSubmitting || updateSettingsMutation.isLoading) ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Speichern...
                              </span>
                            ) : (
                              'Einstellungen speichern'
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
