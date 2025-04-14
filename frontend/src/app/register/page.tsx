'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { authService } from '@/services/api';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simplified Button component
const Button = ({
  children,
  className = "",
  type = "button",
  isLoading = false,
  disabled = false,
  onClick = () => { }
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    type={type}
    disabled={isLoading || disabled}
    onClick={onClick}
    className={`${className} flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${isLoading ? 'opacity-70' : ''}`}
  >
    {isLoading && (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    {children}
  </button>
);

export default function RegisterPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    setIsRegistering(true);
    setError(null);
    setSuccess(null);
    
    // Registrierungsdaten für das Backend vorbereiten
    const userData = {
      username: data.username,
      email: data.email,
      password: data.password
    };
    
    console.log('Versuche Registrierung mit:', { ...userData, password: '***' });

    try {
      // Verwende den echten API-Service
      console.log('Versuche Registrierung mit echtem API-Service...');
      const responseData = await authService.register(userData);
      console.log('Registrierungsantwort:', responseData);
      
      setSuccess("Registrierung erfolgreich! Sie können sich jetzt anmelden.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorResponse = err as { response?: { status?: number, data?: { message?: string, error?: string } } };

      // Spezifische Fehlerbehandlung für häufige Fehler
      if (errorResponse.response?.status === 409) {
        setError('Diese E-Mail-Adresse wird bereits verwendet. Bitte versuchen Sie eine andere E-Mail-Adresse.');
      } else if (errorResponse.response?.data?.error) {
        setError(errorResponse.response.data.error);
      } else if (errorResponse.response?.data?.message) {
        setError(errorResponse.response.data.message);
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Registrieren
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Oder{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            melden Sie sich mit Ihrem Konto an
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {success}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Benutzername
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register("username", { required: "Benutzername ist erforderlich", minLength: { value: 3, message: "Mindestens 3 Zeichen" } })}
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register("email", { 
                    required: "E-Mail ist erforderlich", 
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: "Ungültige E-Mail-Adresse" 
                    } 
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register("password", { 
                    required: "Passwort ist erforderlich", 
                    minLength: { value: 6, message: "Mindestens 6 Zeichen" } 
                  })}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Passwort bestätigen
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register("confirmPassword", { 
                    required: "Passwortbestätigung ist erforderlich",
                    validate: value => value === password || "Passwörter stimmen nicht überein"
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isRegistering}
                disabled={isRegistering}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Registrieren
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
