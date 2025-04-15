import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
      .max(32, 'Benutzername darf maximal 32 Zeichen lang sein')
      .required('Benutzername ist erforderlich'),
    email: Yup.string()
      .email('Ungültige E-Mail-Adresse')
      .required('E-Mail ist erforderlich'),
    password: Yup.string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
      .required('Passwort ist erforderlich'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwörter müssen übereinstimmen')
      .required('Passwortbestätigung ist erforderlich'),
  });

  const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: any) => {
    try {
      setRegisterError(null);
      await register(values.username, values.email, values.password);
      navigate('/dashboard');
    } catch (error: any) {
      // Error is already handled by the auth context toast
      const errMsg = error.response?.data?.error || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      setRegisterError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
        Konto erstellen
      </h3>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="username" className="form-label">
                Benutzername
              </label>
              <Field
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Benutzername"
                className="form-input"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                E-Mail
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="E-Mail-Adresse"
                className="form-input"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Passwort
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Passwort"
                className="form-input"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Passwort bestätigen
              </label>
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Passwort bestätigen"
                className="form-input"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            {registerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {registerError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrieren...
                  </span>
                ) : (
                  'Registrieren'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Bereits ein Konto?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
