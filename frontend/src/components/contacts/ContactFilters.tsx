'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  contactStages: { value: string; label: string }[];
  onExportContacts: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStage,
  setSelectedStage,
  contactStages,
  onExportContacts
}) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50 sm:flex sm:items-center sm:justify-between">
      <div className="relative max-w-xs w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Kontakte durchsuchen..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="mt-3 flex sm:mt-0 sm:ml-4">
        <div className="relative inline-block text-left">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <FunnelIcon className="mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Filter: {contactStages.find(stage => stage.value === selectedStage)?.label || 'Alle'}
            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
          </button>
          
          {showFilterMenu && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                  Phase filtern
                </div>
                {contactStages.map((stage) => (
                  <button
                    key={stage.value}
                    className={`${
                      selectedStage === stage.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } block px-4 py-2 text-sm w-full text-left hover:bg-gray-50`}
                    onClick={() => {
                      setSelectedStage(stage.value);
                      setShowFilterMenu(false);
                    }}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={onExportContacts}
        >
          <ArrowDownTrayIcon className="mr-2 h-5 w-5 text-gray-500" />
          Exportieren
        </button>
      </div>
    </div>
  );
};
