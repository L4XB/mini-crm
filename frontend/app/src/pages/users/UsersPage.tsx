import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, getData } from '../../services/api';
import { User } from '../../types/User';
import { 
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import UserModal from '../../components/users/UserModal';

// Hilfsfunktion für sichere Datumsformatierung
const formatDate = (dateValue: string | number | Date): string => {
  try {
    // Bei ISO-String oder Timestamp
    const date = new Date(dateValue);
    // Überprüfe, ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }
    return format(date, 'dd.MM.yyyy', { locale: de });
  } catch (error) {
    console.error('Fehler bei der Datumsformatierung:', error);
    return 'Ungültiges Datum';
  }
};

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Fetch users
  const { data: users = [], isLoading, isError } = useQuery<User[]>('users', async () => {
    return await getData<User[]>('/api/v1/users');
  });

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (id: number) => api.delete(`/api/v1/users/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Benutzer erfolgreich gelöscht');
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Löschen des Benutzers';
        toast.error(message);
      }
    }
  );

  // Handle edit user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handle delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    // First apply role filter
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    
    // Then apply search filter
    const searchMatch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return roleMatch && searchMatch;
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Benutzerverwaltung
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie alle Benutzer im System
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Neuer Benutzer
          </motion.button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 sm:flex sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 mt-2 sm:mt-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
            placeholder="Benutzer durchsuchen..."
          />
        </div>

        {/* Filter by role */}
        <div className="mt-2 sm:mt-0 sm:ml-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-input w-full sm:w-auto"
          >
            <option value="all">Alle Rollen</option>
            <option value="user">Nur Benutzer</option>
            <option value="admin">Nur Admins</option>
          </select>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Benutzer werden geladen...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 h-12 w-12 flex items-center justify-center mx-auto">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden der Benutzer</h3>
            <p className="mt-1 text-sm text-gray-500">
              Versuchen Sie es später erneut oder aktualisieren Sie die Seite.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Benutzer gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || roleFilter !== 'all' 
                ? 'Keine Benutzer entsprechen Ihren Filterkriterien.' 
                : 'Erstellen Sie Ihren ersten Benutzer, um loszulegen.'}
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-800"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt am
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <Link 
                            to={`/users/${user.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {user.username}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" /> 
                        <a href={`mailto:${user.email}`} className="hover:text-primary-600">
                          {user.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <span className="flex items-center">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        ) : 'Benutzer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? 
                        formatDate(user.created_at) : 
                        'Nicht verfügbar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <UserModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        isEditing={isEditModalOpen}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
          }
        }}
        title="Benutzer löschen"
        message={`Sind Sie sicher, dass Sie ${selectedUser?.username} löschen möchten? Alle zugehörigen Daten werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`}
        isDeleting={deleteUserMutation.isLoading}
      />
    </div>
  );
};

export default UsersPage;
