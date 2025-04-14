'use client';

import React, { useState } from 'react';
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Mock data for tasks
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Angebot für Software Implementierung finalisieren',
    description: 'Erstellen Sie das finale Angebot mit allen besprochenen Punkten für ABC GmbH.',
    status: 'pending',
    priority: 'high',
    dueDate: '2025-04-16T16:00:00Z',
    assignedTo: 'Maria Schmidt',
    relatedTo: { type: 'deal', id: 1, name: 'Software Implementierung für ABC GmbH' },
    createdAt: '2025-04-10T09:23:00Z',
  },
  {
    id: 2,
    title: 'Meeting mit XYZ AG Führungsteam',
    description: 'Besprechung der nächsten Schritte für den Wartungsvertrag.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2025-04-12T10:00:00Z',
    assignedTo: 'Thomas Müller',
    relatedTo: { type: 'deal', id: 2, name: 'Wartungsvertrag XYZ AG' },
    createdAt: '2025-04-01T11:30:00Z',
    completedAt: '2025-04-12T11:15:00Z',
  },
  {
    id: 3,
    title: 'Bedarfsanalyse für EFG GmbH durchführen',
    description: 'Detaillierte Anforderungen für die Cloud Migration erfassen.',
    status: 'pending',
    priority: 'high',
    dueDate: '2025-04-20T15:00:00Z',
    assignedTo: 'Anna Weber',
    relatedTo: { type: 'deal', id: 3, name: 'Cloud Migration für EFG GmbH' },
    createdAt: '2025-04-05T16:45:00Z',
  },
  {
    id: 4,
    title: 'Präsentation für Lösungs-Workshop vorbereiten',
    description: 'Erstellen Sie die Präsentation für den Workshop in der Klinik Gesund.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-04-18T09:00:00Z',
    assignedTo: 'Daniel Fischer',
    relatedTo: { type: 'deal', id: 4, name: 'Lösungs-Workshop Klinik Gesund' },
    createdAt: '2025-04-13T10:00:00Z',
  },
  {
    id: 5,
    title: 'Lizenzierungsoptionen recherchieren',
    description: 'Verschiedene Lizenzierungsmodelle für TechStart GmbH vergleichen.',
    status: 'completed',
    priority: 'low',
    dueDate: '2025-04-10T12:00:00Z',
    assignedTo: 'Sabine Wolf',
    relatedTo: { type: 'deal', id: 5, name: 'Software Lizenzierung Technik Start-up' },
    createdAt: '2025-04-01T14:15:00Z',
    completedAt: '2025-04-09T16:30:00Z',
  },
  {
    id: 6,
    title: 'Anforderungen für IT Infrastruktur Erweiterung sammeln',
    description: 'Detaillierte technische Anforderungen von Logistik Partner AG sammeln.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-04-25T14:00:00Z',
    assignedTo: 'Martin Klein',
    relatedTo: { type: 'deal', id: 6, name: 'IT Infrastruktur Erweiterung' },
    createdAt: '2025-04-09T15:20:00Z',
  },
  {
    id: 7,
    title: 'Dokumentation der Netzwerkanalyse fertigstellen',
    description: 'Abschlussbericht für die durchgeführte Netzwerkanalyse bei Handels AG erstellen.',
    status: 'completed',
    priority: 'low',
    dueDate: '2025-04-05T17:00:00Z',
    assignedTo: 'Julia Becker',
    relatedTo: { type: 'deal', id: 7, name: 'Netzwerkanalyse für Handels AG' },
    createdAt: '2025-03-31T13:10:00Z',
    completedAt: '2025-04-04T16:45:00Z',
  },
  {
    id: 8,
    title: 'Kundendaten für Kontaktaktualisierung sammeln',
    description: 'Aktualisierte Kontaktdaten von allen Ansprechpartnern bei BankSicher sammeln.',
    status: 'pending',
    priority: 'low',
    dueDate: '2025-04-28T12:00:00Z',
    assignedTo: 'Thomas Müller',
    relatedTo: { type: 'contact', id: 15, name: 'BankSicher AG' },
    createdAt: '2025-04-11T09:00:00Z',
  },
  {
    id: 9,
    title: 'Wöchentliches Team Meeting',
    description: 'Standup Meeting mit dem Vertriebsteam.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2025-04-15T09:30:00Z',
    assignedTo: 'Maria Schmidt',
    relatedTo: { type: 'other', id: null, name: 'Internes Meeting' },
    createdAt: '2025-04-08T14:20:00Z',
  },
  {
    id: 10,
    title: 'Follow-up E-Mail an Logistik Partner AG',
    description: 'Senden Sie eine Follow-up E-Mail nach dem letzten Meeting.',
    status: 'pending',
    priority: 'high',
    dueDate: '2025-04-15T15:00:00Z',
    assignedTo: 'Martin Klein',
    relatedTo: { type: 'deal', id: 6, name: 'IT Infrastruktur Erweiterung' },
    createdAt: '2025-04-14T08:45:00Z',
  },
];

// Priority and status mapping
const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const PRIORITY_LABELS = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

// Helper function to format times
const formatTime = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString('de-DE', options);
};

// Check if a task is overdue
const isOverdue = (dueDate: string, status: string) => {
  return status !== 'completed' && new Date(dueDate) < new Date();
};

// Task component
const TaskItem = ({ task }: { task: any }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div 
      className={`border rounded-lg mb-3 ${
        task.status === 'completed' 
          ? 'bg-gray-50 border-gray-200' 
          : isOverdue(task.dueDate, task.status) 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              checked={task.status === 'completed'}
              readOnly
            />
          </div>
          <div className="ml-3 flex-grow" onClick={toggleExpand}>
            <div className="flex justify-between">
              <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
                {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
              </span>
            </div>
            
            <div className="mt-1 flex flex-wrap gap-x-4">
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <CalendarDaysIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <ClockIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{formatTime(task.dueDate)}</span>
              </div>
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <UserIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{task.assignedTo}</span>
              </div>
              {task.relatedTo && (
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span className="italic">
                    {task.relatedTo.type === 'deal' ? 'Deal:' : task.relatedTo.type === 'contact' ? 'Kontakt:' : ''} {task.relatedTo.name}
                  </span>
                </div>
              )}
            </div>
            
            {expanded && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{task.description}</p>
                {task.status === 'completed' && task.completedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Abgeschlossen am {formatDate(task.completedAt)} um {formatTime(task.completedAt)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="ml-2 flex-shrink-0">
            <button type="button" className="text-gray-400 hover:text-gray-500">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TasksPage component
export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortKey, setSortKey] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle sort change
  const handleSort = (key: 'dueDate' | 'priority' | 'createdAt') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  // Filter tasks based on status
  const filteredTasks = MOCK_TASKS.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });
  
  // Sort tasks based on current sort configuration
  const priorityValues = { high: 3, medium: 2, low: 1 };
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortKey === 'priority') {
      const valueA = priorityValues[a.priority as keyof typeof priorityValues];
      const valueB = priorityValues[b.priority as keyof typeof priorityValues];
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (sortKey === 'dueDate' || sortKey === 'createdAt') {
      const dateA = new Date(a[sortKey]).getTime();
      const dateB = new Date(b[sortKey]).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
  
  // Get counts for the filter tabs
  const pendingCount = MOCK_TASKS.filter(task => task.status === 'pending').length;
  const completedCount = MOCK_TASKS.filter(task => task.status === 'completed').length;
  
  // Get overdue tasks count
  const overdueCount = MOCK_TASKS.filter(
    task => task.status === 'pending' && new Date(task.dueDate) < new Date()
  ).length;
  
  return (
    <div className="pb-10">
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
            <p className="mt-1 text-sm text-gray-500">
              Verwalten Sie Ihre Aufgaben und bleiben Sie organisiert.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Neue Aufgabe
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Anstehende Aufgaben</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{pendingCount}</div>
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
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Abgeschlossene Aufgaben</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{completedCount}</div>
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
                <CalendarDaysIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Überfällige Aufgaben</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{overdueCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setFilter('all')}
              className={`${
                filter === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Alle
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {MOCK_TASKS.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`${
                filter === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Anstehend
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`${
                filter === 'completed'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Abgeschlossen
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {completedCount}
              </span>
            </button>
          </nav>
        </div>
        
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sortieren:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSort('dueDate')}
                className={`text-sm flex items-center ${sortKey === 'dueDate' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
              >
                Fälligkeitsdatum
                {sortKey === 'dueDate' && (
                  sortDirection === 'asc' 
                    ? <ArrowUpIcon className="ml-1 h-4 w-4" /> 
                    : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('priority')}
                className={`text-sm flex items-center ${sortKey === 'priority' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
              >
                Priorität
                {sortKey === 'priority' && (
                  sortDirection === 'asc' 
                    ? <ArrowUpIcon className="ml-1 h-4 w-4" /> 
                    : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSort('createdAt')}
                className={`text-sm flex items-center ${sortKey === 'createdAt' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
              >
                Erstellungsdatum
                {sortKey === 'createdAt' && (
                  sortDirection === 'asc' 
                    ? <ArrowUpIcon className="ml-1 h-4 w-4" /> 
                    : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{sortedTasks.length} Aufgaben</span>
          </div>
        </div>
        
        {/* Tasks List */}
        <div className="p-4">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Keine Aufgaben gefunden</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Zeige <span className="font-medium">1</span> bis{' '}
                  <span className="font-medium">{sortedTasks.length}</span> von{' '}
                  <span className="font-medium">{sortedTasks.length}</span> Aufgaben
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    type="button"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Vorherige</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Nächste</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
