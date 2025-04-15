import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Task } from '../../types/Task';
import { Deal } from '../../types/Deal';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  BanknotesIcon as CurrencyEuroIcon // Verwende BanknotesIcon als Ersatz für CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format, isBefore, isToday, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TaskModal from '../../components/tasks/TaskModal';

const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Fetch tasks
  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>('tasks', async () => {
    const response = await api.get('/api/v1/tasks');
    return response.data;
  });

  // Fetch deals for association
  const { data: deals = [] } = useQuery<Deal[]>('deals', async () => {
    const response = await api.get('/api/v1/deals');
    return response.data;
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (id: number) => api.delete(`/api/v1/tasks/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Aufgabe erfolgreich gelöscht');
        setIsDeleteModalOpen(false);
        setSelectedTask(null);
      },
      onError: () => {
        toast.error('Fehler beim Löschen der Aufgabe');
      }
    }
  );

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation(
    (id: number) => api.patch(`/api/v1/tasks/${id}/toggle`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Aufgabenstatus aktualisiert');
      },
      onError: () => {
        toast.error('Fehler beim Aktualisieren des Aufgabenstatus');
      }
    }
  );

  // Handle edit task
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Handle delete task
  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  // Handle toggle task completion
  const handleToggleCompletion = (task: Task) => {
    toggleTaskMutation.mutate(task.id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // First apply status filter
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'completed' && task.completed) ||
      (statusFilter === 'active' && !task.completed) ||
      (statusFilter === 'overdue' && !task.completed && isBefore(new Date(task.due_date), new Date())) ||
      (statusFilter === 'today' && isToday(new Date(task.due_date)));
    
    // Then apply search filter
    const searchMatch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deal?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overdueTasks = tasks.filter(task => !task.completed && isBefore(new Date(task.due_date), new Date())).length;
  const todayTasks = tasks.filter(task => !task.completed && isToday(new Date(task.due_date))).length;
  const upcomingTasks = tasks.filter(task => 
    !task.completed && 
    !isToday(new Date(task.due_date)) && 
    isBefore(new Date(), new Date(task.due_date))
  ).length;

  // Sort tasks: Overdue first, then today, then upcoming, completed at the end
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks at the end
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Both are completed or both are not completed
    if (a.completed && b.completed) {
      // For completed tasks, sort by due date descending (most recently completed first)
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
    } else {
      // For active tasks, sort by due date ascending (overdue first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
  });

  // Helper function to get priority class based on due date
  const getPriorityClass = (dueDate: string, completed: boolean) => {
    if (completed) return 'bg-gray-100 text-gray-700';
    
    const today = new Date();
    const taskDate = new Date(dueDate);
    
    if (isBefore(taskDate, today)) {
      return 'bg-red-100 text-red-800'; // Overdue
    } else if (isToday(taskDate)) {
      return 'bg-yellow-100 text-yellow-800'; // Today
    } else if (isBefore(taskDate, addDays(today, 3))) {
      return 'bg-blue-100 text-blue-800'; // Soon (next 3 days)
    } else {
      return 'bg-green-100 text-green-800'; // Later
    }
  };

  // Helper function to get priority label
  const getPriorityLabel = (dueDate: string, completed: boolean) => {
    if (completed) return 'Erledigt';
    
    const today = new Date();
    const taskDate = new Date(dueDate);
    
    if (isBefore(taskDate, today)) {
      return 'Überfällig';
    } else if (isToday(taskDate)) {
      return 'Heute';
    } else if (isBefore(taskDate, addDays(today, 3))) {
      return 'Bald';
    } else {
      return 'Geplant';
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Aufgaben
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verwalten Sie Ihre täglichen Aktivitäten
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setSelectedTask(null);
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Neue Aufgabe
          </motion.button>
        </div>
      </div>

      {/* Task statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Gesamt</span>
          <span className="text-2xl font-semibold text-gray-900">{totalTasks}</span>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Überfällig</span>
          <span className="text-2xl font-semibold text-red-600">{overdueTasks}</span>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Heute</span>
          <span className="text-2xl font-semibold text-yellow-600">{todayTasks}</span>
        </div>
        <div className="card bg-white p-4 rounded-lg shadow flex flex-col">
          <span className="text-sm font-medium text-gray-500">Erledigt</span>
          <span className="text-2xl font-semibold text-green-600">{completedTasks}</span>
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
            placeholder="Aufgaben durchsuchen..."
          />
        </div>

        {/* Filter by status */}
        <div className="mt-2 sm:mt-0 sm:ml-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-full sm:w-auto"
          >
            <option value="all">Alle Aufgaben</option>
            <option value="active">Aktive Aufgaben</option>
            <option value="completed">Erledigte Aufgaben</option>
            <option value="overdue">Überfällige Aufgaben</option>
            <option value="today">Heutige Aufgaben</option>
          </select>
        </div>
      </div>

      {/* Tasks list */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Aufgaben werden geladen...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 h-12 w-12 flex items-center justify-center mx-auto">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Fehler beim Laden der Aufgaben</h3>
            <p className="mt-1 text-sm text-gray-500">
              Versuchen Sie es später erneut oder aktualisieren Sie die Seite.
            </p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Keine Aufgaben entsprechen Ihren Filterkriterien.' 
                : 'Erstellen Sie Ihre erste Aufgabe, um loszulegen.'}
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
          <ul className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <motion.li 
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-4 hover:bg-gray-50 ${task.completed ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <button
                      onClick={() => handleToggleCompletion(task)}
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        task.completed 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                          getPriorityClass(task.due_date, task.completed)
                        }`}>
                          {getPriorityLabel(task.due_date, task.completed)}
                        </span>
                      </div>
                    </div>
                    
                    {task.details && (
                      <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.details.length > 100 
                          ? task.details.substring(0, 100) + '...' 
                          : task.details}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>
                          Fällig am {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                      
                      {task.deal && (
                        <div className="flex items-center">
                          <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                          <span>Deal: {task.deal.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        deals={deals}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={() => {
          if (selectedTask) {
            deleteTaskMutation.mutate(selectedTask.id);
          }
        }}
        title="Aufgabe löschen"
        message={`Sind Sie sicher, dass Sie die Aufgabe "${selectedTask?.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        isDeleting={deleteTaskMutation.isLoading}
      />
    </div>
  );
};

export default TasksPage;
