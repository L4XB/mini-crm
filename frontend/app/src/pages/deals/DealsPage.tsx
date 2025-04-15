import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Deal } from '../../types/Deal';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  ExclamationCircleIcon,
  CurrencyEuroIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditDealModal from '../../components/deals/EditDealModal';
import CreateDealFromScratchModal from '../../components/deals/CreateDealFromScratchModal';

const DealsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Fetch deals
  const { data: deals = [], isLoading, isError } = useQuery<Deal[]>('deals', async () => {
    const response = await api.get('/api/v1/deals');
    return response.data;
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation(
    (id: number) => api.delete(`/api/v1/deals/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deals');
        toast.success('Deal erfolgreich gelöscht');
        setIsDeleteModalOpen(false);
        setSelectedDeal(null);
      },
      onError: () => {
        toast.error('Fehler beim Löschen des Deals');
      }
    }
  );

  // Handle edit deal
  const handleEditClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  // Handle delete deal
  const handleDeleteClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDeleteModalOpen(true);
  };

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    // First apply status filter
    const statusMatch = statusFilter === 'all' || deal.status === statusFilter;
    
    // Then apply search filter
    const searchMatch = searchTerm === '' || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.contact?.first_name + ' ' + deal.contact?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Calculate statistics
  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const openDealsCount = filteredDeals.filter(deal => deal.status === 'open').length;
  const wonDealsCount = filteredDeals.filter(deal => deal.status === 'won').length;
  const lostDealsCount = filteredDeals.filter(deal => deal.status === 'lost').length;

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Deals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihre Verkaufschancen
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Neuer Deal
          </motion.button>
        </div>
      </div>

      {/* Deal statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Gesamtwert</span>
          <span className="text-2xl font-semibold text-gray-900">
            {totalValue.toLocaleString('de-DE')} €
          </span>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Offen</span>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-blue-600">{openDealsCount}</span>
            <span className="ml-2 text-sm text-gray-500">Deals</span>
          </div>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Gewonnen</span>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-green-600">{wonDealsCount}</span>
            <span className="ml-2 text-sm text-gray-500">Deals</span>
          </div>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Verloren</span>
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-red-600">{lostDealsCount}</span>
            <span className="ml-2 text-sm text-gray-500">Deals</span>
          </div>
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
            placeholder="Deals durchsuchen..."
          />
        </div>

        {/* Filter by status */}
        <div className="mt-2 sm:mt-0 sm:ml-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-full sm:w-auto"
          >
            <option value="all">Alle Deals</option>
            <option value="open">Nur offen</option>
            <option value="won">Nur gewonnen</option>
            <option value="lost">Nur verloren</option>
          </select>
        </div>
      </div>

      {/* Deals list */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Deals werden geladen...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 h-12 w-12 flex items-center justify-center mx-auto">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden der Deals</h3>
            <p className="mt-1 text-sm text-gray-500">
              Versuchen Sie es später erneut oder aktualisieren Sie die Seite.
            </p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyEuroIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Deals gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Keine Deals entsprechen Ihren Filterkriterien.' 
                : 'Erstellen Sie Ihren ersten Deal, um loszulegen.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
                    Deal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wert
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erwartet bis
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <motion.tr 
                    key={deal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <Link 
                            to={`/deals/${deal.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {deal.title}
                          </Link>
                          {deal.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {deal.description.length > 50 
                                ? deal.description.substring(0, 50) + '...' 
                                : deal.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deal.contact ? (
                        <Link 
                          to={`/contacts/${deal.contact.id}`}
                          className="text-sm text-gray-900 hover:text-primary-600"
                        >
                          {deal.contact.first_name} {deal.contact.last_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {deal.value.toLocaleString('de-DE')} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        deal.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        deal.status === 'won' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {deal.status === 'open' ? 'Offen' : 
                         deal.status === 'won' ? 'Gewonnen' : 'Verloren'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {format(new Date(deal.expected_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(deal)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(deal)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <Link 
                        to={`/deals/${deal.id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      <CreateDealFromScratchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Deal Modal */}
      {selectedDeal && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDeal(null);
          }}
          deal={selectedDeal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeal(null);
        }}
        onConfirm={() => {
          if (selectedDeal) {
            deleteDealMutation.mutate(selectedDeal.id);
          }
        }}
        title="Deal löschen"
        message={`Sind Sie sicher, dass Sie den Deal "${selectedDeal?.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        isDeleting={deleteDealMutation.isLoading}
      />
    </div>
  );
};

export default DealsPage;
