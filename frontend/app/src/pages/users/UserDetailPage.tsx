import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, getData } from '../../services/api';
import { User } from '../../types/User';
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import UserModal from '../../components/users/UserModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface UserStats {
  contactsCount: number;
  dealsCount: number;
  tasksCount: number;
  notesCount: number;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Wird für Daten-Invalidierung nach Aktionen verwendet
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Validate user ID
  const userId = id ? parseInt(id) : 0;
  const isValidId = !isNaN(userId) && userId > 0;

  // Fetch user details
  const { 
    data: user, 
    isLoading, 
    isError,
    error 
  } = useQuery<User>(
    ['user', userId],
    async () => {
      if (!isValidId) {
        throw new Error('Ungültige Benutzer-ID');
      }
      return await getData<User>(`/api/v1/users/${userId}`);
    },
    {
      enabled: !!id,
      retry: false,
    }
  );

  // Fetch user statistics
  const { data: stats } = useQuery<UserStats>(
    ['user-stats', userId],
    async () => {
      if (!isValidId) {
        throw new Error('Ungültige Benutzer-ID');
      }
      try {
        return await getData<UserStats>(`/api/v1/users/${userId}/stats`);
      } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
        // Standard-Statistiken zurückgeben
        return {
          contactsCount: 0,
          dealsCount: 0,
          tasksCount: 0,
          notesCount: 0
        };
      }
    },
    {
      enabled: !!id,
      // Default values if the API doesn't exist or fails
      placeholderData: {
        contactsCount: 0,
        dealsCount: 0,
        tasksCount: 0,
        notesCount: 0,
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (id: number) => api.delete(`/api/v1/users/${id}`),
    {
      onSuccess: () => {
        // Cache invalidieren, um die Benutzerliste zu aktualisieren
        queryClient.invalidateQueries('users');
        toast.success('Benutzer erfolgreich gelöscht');
        navigate('/users');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Löschen des Benutzers';
        toast.error(message);
      }
    }
  );

  // Handle delete
  const handleDelete = () => {
    if (isValidId) {
      deleteUserMutation.mutate(userId);
    } else {
      toast.error('Ungültige Benutzer-ID');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-8 max-w-3xl mx-auto mt-8">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Fehler beim Laden des Benutzers</h3>
          <p className="mt-1 text-sm text-gray-500">
            {(error as any)?.response?.data?.error || 'Benutzer nicht gefunden oder Sie haben keine Berechtigung.'}
          </p>
          <div className="mt-6">
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Zurück zur Benutzerliste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-8 max-w-3xl mx-auto mt-8">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Benutzer nicht gefunden</h3>
          <div className="mt-6">
            <Link
              to="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Zurück zur Benutzerliste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button and actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Benutzerprofil
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            Bearbeiten
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-danger"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
            Löschen
          </button>
        </div>
      </div>

      {/* User profile card */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? (
                    <span className="flex items-center">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      Administrator
                    </span>
                  ) : 'Benutzer'}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {user.id}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                Benutzername
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.username}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                E-Mail
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`mailto:${user.email}`} className="text-primary-600 hover:text-primary-800">
                  {user.email}
                </a>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                Erstellt am
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(user.created_at), 'dd. MMMM yyyy', { locale: de })}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                Letzte Aktualisierung
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.updated_at && 
                  format(new Date(user.updated_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* User statistics */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Benutzerstatistiken</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Kontakte
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats?.contactsCount || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to={`/contacts?user=${user.id}`} className="font-medium text-primary-600 hover:text-primary-900">
                  Alle anzeigen
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Deals
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats?.dealsCount || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to={`/deals?user=${user.id}`} className="font-medium text-primary-600 hover:text-primary-900">
                  Alle anzeigen
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aufgaben
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats?.tasksCount || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to={`/tasks?user=${user.id}`} className="font-medium text-primary-600 hover:text-primary-900">
                  Alle anzeigen
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Notizen
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats?.notesCount || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to={`/notes?user=${user.id}`} className="font-medium text-primary-600 hover:text-primary-900">
                  Alle anzeigen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        isEditing={true}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Benutzer löschen"
        message={`Sind Sie sicher, dass Sie ${user.username} löschen möchten? Alle zugehörigen Daten werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`}
        isDeleting={deleteUserMutation.isLoading}
      />
    </div>
  );
};

export default UserDetailPage;
