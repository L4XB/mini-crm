'use client';

import React, { useState } from 'react';
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowPathIcon, 
  EllipsisHorizontalIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, TagIcon, CurrencyEuroIcon } from '@heroicons/react/24/solid';

// Mock data for deals
const MOCK_DEALS = [
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

// Stage color mapping
const STAGE_COLORS = {
  discovery: 'bg-blue-100 text-blue-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-orange-100 text-orange-800',
  closing: 'bg-indigo-100 text-indigo-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Component for deal tags
const DealTag = ({ text }: { text: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {text}
  </span>
);

export default function DealsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'lastActivity',
    direction: 'desc',
  });

  // Function to handle sorting
  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Sort deals based on current sort configuration
  const sortedDeals = [...MOCK_DEALS].sort((a: any, b: any) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get total value of all deals
  const totalDealValue = MOCK_DEALS.reduce((sum, deal) => sum + deal.value, 0);
  
  // Get count of deals by stage
  const dealsByStage = MOCK_DEALS.reduce((acc: Record<string, number>, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="pb-10">
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="mt-1 text-sm text-gray-500">
              Verwalten Sie Ihre Verkaufschancen und verfolgen Sie den Fortschritt.
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
            >
              <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-500" />
              Aktualisieren
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Deal erstellen
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Offene Deals</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{MOCK_DEALS.length}</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Gesamtwert</dt>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">In Verhandlung</dt>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Ø Abschlussquote</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {Math.round(MOCK_DEALS.reduce((sum, deal) => sum + deal.probability, 0) / MOCK_DEALS.length)}%
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
            Liste
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
          <span className="text-sm text-gray-500 mr-2">Sortieren nach:</span>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {sortConfig.key === 'lastActivity' ? 'Letzte Aktivität' : 
               sortConfig.key === 'value' ? 'Wert' : 
               sortConfig.key === 'expectedCloseDate' ? 'Abschlussdatum' : 'Name'}
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
                        Deal / Kunde
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('value')}
                      >
                        Wert
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phase
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('expectedCloseDate')}
                      >
                        Abschlussdatum
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Zugewiesen an
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Aktionen</span>
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
                          <div className="text-xs text-gray-500">{deal.probability}% Wahrscheinlichkeit</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS]}`}>
                            {deal.stageName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(deal.expectedCloseDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.assignedTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          >
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </button>
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
              Bedarfsanalyse
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {MOCK_DEALS.filter(d => d.stage === 'discovery').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {MOCK_DEALS.filter(deal => deal.stage === 'discovery').map(deal => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedCloseDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
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
              Angebot
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {MOCK_DEALS.filter(d => d.stage === 'proposal').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {MOCK_DEALS.filter(deal => deal.stage === 'proposal').map(deal => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedCloseDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
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
              Verhandlung
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {MOCK_DEALS.filter(d => d.stage === 'negotiation').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {MOCK_DEALS.filter(deal => deal.stage === 'negotiation').map(deal => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedCloseDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
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
              Abschluss / Gewonnen
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {MOCK_DEALS.filter(d => d.stage === 'closing' || d.stage === 'closed_won').length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {MOCK_DEALS.filter(deal => deal.stage === 'closing' || deal.stage === 'closed_won').map(deal => (
                <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                  <p className="text-gray-500 text-xs mt-1">{deal.customer}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-gray-900 font-medium text-sm">{formatCurrency(deal.value)}</span>
                    <span className="text-xs text-gray-500">{formatDate(deal.expectedCloseDate)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
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
