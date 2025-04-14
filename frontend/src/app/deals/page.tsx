'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowPathIcon, 
  EllipsisHorizontalIcon, 
  ChevronDownIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, TagIcon, CurrencyEuroIcon } from '@heroicons/react/24/solid';
import { dealsService } from '@/services/api';
import { useRouter } from 'next/navigation';

// Define interface for Deal
interface Deal {
  id: number;
  title: string;
  customer: string;
  value: number;
  stage: string;
  stageName?: string;
  probability?: number;
  expectedCloseDate: string;
  assignedTo?: string;
  tags?: string[];
  lastActivity?: string;
  createdAt: string;
  status?: string;
}

// Empty array to be filled with API data
const EMPTY_DEALS: Deal[] = [
  {
    id: 1,
    title: 'Software Implementierung für ABC GmbH',
    customer: 'ABC GmbH',
    value: 15000,
    stage: 'proposal',
    stageName: 'Angebot',
    probability: 60,
    expectedCloseDate: '2025-06-15',
    assignedTo: 'Maria Schmidt',
    tags: ['Software', 'Implementation'],
    lastActivity: '2025-04-10T09:23:00Z',
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Wartungsvertrag XYZ AG',
    customer: 'XYZ AG',
    value: 5000,
    stage: 'negotiation',
    stageName: 'Verhandlung',
    probability: 80,
    expectedCloseDate: '2025-05-20',
    assignedTo: 'Thomas Müller',
    tags: ['Wartung', 'Service'],
    lastActivity: '2025-04-12T14:15:00Z',
    createdAt: '2025-03-15T11:30:00Z',
  },
  {
    id: 3,
    title: 'Cloud Migration für EFG GmbH',
    customer: 'EFG GmbH',
    value: 25000,
    stage: 'discovery',
    stageName: 'Bedarfsanalyse',
    probability: 40,
    expectedCloseDate: '2025-07-30',
    assignedTo: 'Anna Weber',
    tags: ['Cloud', 'Migration'],
    lastActivity: '2025-04-08T16:45:00Z',
    createdAt: '2025-04-01T09:15:00Z',
  },
  {
    id: 4,
    title: 'Lösungs-Workshop Klinik Gesund',
    customer: 'Klinik Gesund',
    value: 3500,
    stage: 'closing',
    stageName: 'Abschluss',
    probability: 95,
    expectedCloseDate: '2025-04-25',
    assignedTo: 'Daniel Fischer',
    tags: ['Workshop', 'Healthcare'],
    lastActivity: '2025-04-13T10:00:00Z',
    createdAt: '2025-03-20T13:00:00Z',
  },
  {
    id: 5,
    title: 'Software Lizenzierung Technik Start-up',
    customer: 'TechStart GmbH',
    value: 8200,
    stage: 'qualified',
    stageName: 'Qualifiziert',
    probability: 65,
    expectedCloseDate: '2025-06-05',
    assignedTo: 'Sabine Wolf',
    tags: ['Lizenzierung', 'Start-up'],
    lastActivity: '2025-04-11T11:30:00Z',
    createdAt: '2025-03-25T14:15:00Z',
  },
  {
    id: 6,
    title: 'IT Infrastruktur Erweiterung',
    customer: 'Logistik Partner AG',
    value: 32000,
    stage: 'proposal',
    stageName: 'Angebot',
    probability: 55,
    expectedCloseDate: '2025-08-10',
    assignedTo: 'Martin Klein',
    tags: ['IT', 'Infrastruktur'],
    lastActivity: '2025-04-09T15:20:00Z',
    createdAt: '2025-03-10T09:45:00Z',
  },
  {
    id: 7,
    title: 'Netzwerkanalyse für Handels AG',
    customer: 'Handels AG',
    value: 4800,
    stage: 'closed_won',
    stageName: 'Gewonnen',
    probability: 100,
    expectedCloseDate: '2025-04-01',
    assignedTo: 'Julia Becker',
    tags: ['Netzwerk', 'Analyse'],
    lastActivity: '2025-04-02T13:10:00Z',
    createdAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 8,
    title: 'Datenbankoptimierung für BankSicher',
    customer: 'BankSicher AG',
    value: 12500,
    stage: 'discovery',
    stageName: 'Bedarfsanalyse',
    probability: 35,
    expectedCloseDate: '2025-09-15',
    assignedTo: 'Thomas Müller',
    tags: ['Datenbank', 'Optimierung', 'Finanz'],
    lastActivity: '2025-04-07T09:00:00Z',
    createdAt: '2025-04-05T11:15:00Z',
  },
];

// Map API status to stage names
const getStageNameFromStatus = (status: string): string => {
  const stageMap: Record<string, string> = {
    'discovery': 'Discovery',
    'qualified': 'Qualified',
    'proposal': 'Proposal', 
    'negotiation': 'Negotiation',
    'closing': 'Closing',
    'won': 'Won',
    'lost': 'Lost',
    // Default values if API returns different statuses
    'in_progress': 'In Progress',
    'closed_won': 'Won',
    'closed_lost': 'Lost'
  };
  
  return stageMap[status] || 'Unknown';
};

// Stage color mapping
const STAGE_COLORS: Record<string, string> = {
  discovery: 'bg-blue-100 text-blue-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-orange-100 text-orange-800',
  closing: 'bg-indigo-100 text-indigo-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
  // Keep backwards compatibility
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800'
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Component for deal tags
const DealTag = ({ text }: { text: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {text}
  </span>
);

// Define more accurate type for Deal props with expectedDate instead of expectedCloseDate to align with API response
interface DealWithExpectedDate extends Omit<Deal, 'expectedCloseDate'> {
  expectedDate: string;
}

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealWithExpectedDate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'lastActivity',
    direction: 'desc',
  });

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dealsService.getAll();
        // Map API data to our Deal interface
        const formattedDeals = data.map((deal: any) => ({
          id: deal.id,
          title: deal.title || deal.name || `Deal #${deal.id}`,
          customer: deal.customer || deal.client || 'Unknown',
          value: deal.value || deal.amount || 0,
          stage: deal.stage || deal.status || 'discovery',
          stageName: getStageNameFromStatus(deal.stage || deal.status || 'discovery'),
          probability: deal.probability || 50,
          expectedDate: deal.expected_date || deal.expectedDate || deal.close_date || new Date().toISOString(),
          assignedTo: deal.assigned_to || deal.assignedTo || 'Unassigned',
          tags: deal.tags || [],
          lastActivity: deal.last_activity || deal.lastActivity || deal.updated_at || deal.updatedAt || new Date().toISOString(),
          createdAt: deal.created_at || deal.createdAt || new Date().toISOString()
        }));
        setDeals(formattedDeals);
      } catch (err) {
        console.error('Failed to fetch deals:', err);
        setError('Failed to load deals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Add a new deal
  const handleAddDeal = () => {
    router.push('/deals/new');
  };

  // Edit a deal
  const handleEditDeal = (id: number) => {
    router.push(`/deals/${id}`);
  };

  // Delete a deal
  const handleDeleteDeal = async (id: number) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await dealsService.delete(id);
        setDeals(deals.filter(deal => deal.id !== id));
      } catch (err) {
        console.error('Failed to delete deal:', err);
        setError('Failed to delete deal. Please try again.');
      }
    }
  };

  // Function to handle sorting
  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Sort deals based on current sort configuration with type-safe approach
  const sortedDeals = [...deals].sort((a: Deal, b: Deal) => {
    const key = sortConfig.key as keyof Deal;
    const valueA = a[key] as string | number;
    const valueB = b[key] as string | number;
    
    if (valueA < valueB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get total value of all deals
  const totalDealValue = deals.reduce((sum: number, deal: Deal) => sum + deal.value, 0);
  
  // Get count of deals by stage
  const dealsByStage = deals.reduce((acc: Record<string, number>, deal: Deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {});

  // Loading state
  if (isLoading) {
    return (
      <div className="pb-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="pb-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-10">
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your opportunities and track your sales progress.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2 text-gray-500" />
              Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => window.location.reload()}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-500" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleAddDeal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Deal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Deals</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{deals.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{formatCurrency(totalDealValue)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Negotiation</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{dealsByStage['negotiation'] || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Win Rate</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {deals.length > 0 ? Math.round(deals.reduce((sum, deal) => sum + (deal.probability || 0), 0) / deals.length) : 0}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kanban
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sort by:</span>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {sortConfig.key === 'lastActivity' ? 'Last Activity' : 
               sortConfig.key === 'value' ? 'Value' : 
               sortConfig.key === 'expectedCloseDate' ? 'Close Date' : 'Name'}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </button>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      </div>

      {/* Deal List View */}
      {viewMode === 'list' && (
        <div className="mt-2 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('title')}
                      >
                        Deal / Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('value')}
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stage
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('expectedCloseDate')}
                      >
                        Close Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Assigned To
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                              <div className="text-sm text-gray-500">{deal.customer}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(deal.value)}</div>
                          <div className="text-xs text-gray-500">{deal.probability}% Probability</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS]}`}>
                            {deal.stageName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(deal.expectedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.assignedTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditDeal(deal.id)}
                              className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="text-red-600 hover:text-red-900 focus:outline-none"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Discovery Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Discovery
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {sortedDeals.filter((deal: Deal) => deal.stage === 'discovery').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {sortedDeals.filter((deal: Deal) => deal.stage === 'discovery').map((deal: Deal) => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags && deal.tags.length > 0 && deal.tags.map((tag: string) => (
                      <DealTag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Proposal Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
              Proposal
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {sortedDeals.filter((deal: Deal) => deal.stage === 'proposal').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {sortedDeals.filter((deal: Deal) => deal.stage === 'proposal').map((deal: Deal) => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags && deal.tags.length > 0 && deal.tags.map((tag: string) => (
                      <DealTag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Negotiation Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
              Negotiation
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {sortedDeals.filter((deal: Deal) => deal.stage === 'negotiation').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {sortedDeals.filter((deal: Deal) => deal.stage === 'negotiation').map((deal: Deal) => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags && deal.tags.length > 0 && deal.tags.map((tag: string) => (
                      <DealTag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Closing/Won Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Closing / Won
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {sortedDeals.filter((deal: Deal) => deal.stage === 'closing' || deal.stage === 'closed_won' || deal.stage === 'won').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {sortedDeals.filter((deal: Deal) => deal.stage === 'closing' || deal.stage === 'closed_won' || deal.stage === 'won').map((deal: Deal) => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags && deal.tags.length > 0 && deal.tags.map((tag: string) => (
                      <DealTag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
