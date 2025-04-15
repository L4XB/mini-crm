import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Deal } from '../../types/Deal';
import { Task } from '../../types/Task';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  CurrencyEuroIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditDealModal from '../../components/deals/EditDealModal';
import TaskModal from '../../components/tasks/TaskModal';

const DealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  
  // Get deal details
  const { data: deal, isLoading, isError } = useQuery<Deal>(
    ['deal', id],
    async () => {
      const response = await api.get(`/api/v1/deals/${id}`);
      return response.data;
    }
  );
  
  // Get all deals for TaskModal
  const { data: deals = [] } = useQuery<Deal[]>('deals', async () => {
    const response = await api.get('/api/v1/deals');
    return response.data;
  });
  
  // Delete deal mutation
  const deleteDealMutation = useMutation(
    () => api.delete(`/api/v1/deals/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deals');
        toast.success('Deal erfolgreich gelöscht');
        navigate('/deals');
      },
      onError: () => {
        toast.error('Fehler beim Löschen des Deals');
      }
    }
  );
  
  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (taskId: number) => api.delete(`/api/v1/tasks/${taskId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['deal', id]);
        toast.success('Aufgabe erfolgreich gelöscht');
        setIsDeleteTaskModalOpen(false);
        setSelectedTask(null);
      },
      onError: () => {
        toast.error('Fehler beim Löschen der Aufgabe');
      }
    }
  );
  
  // Toggle task completion mutation
  const toggleTaskMutation = useMutation(
    (taskId: number) => api.patch(`/api/v1/tasks/${taskId}/toggle`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['deal', id]);
        toast.success('Aufgabenstatus aktualisiert');
      },
      onError: () => {
        toast.error('Fehler beim Aktualisieren des Aufgabenstatus');
      }
    }
  );
  
  // Handle edit task
  const handleEditTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };
  
  // Handle delete task
  const handleDeleteTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskModalOpen(true);
  };
  
  // Handle toggle task completion
  const handleToggleTaskCompletion = (task: Task) => {
    toggleTaskMutation.mutate(task.id);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Offen';
      case 'won':
        return 'Gewonnen';
      case 'lost':
        return 'Verloren';
      default:
        return status;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isError || !deal) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center">
          <CurrencyEuroIcon className="h-16 w-16 text-gray-300" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Deal nicht gefunden</h3>
        <p className="mt-1 text-gray-500">
          Der gesuchte Deal existiert nicht oder Sie haben keine Berechtigung, ihn anzusehen.
        </p>
        <div className="mt-6">
          <Link to="/deals" className="btn btn-primary">
            Zurück zur Deal-Liste
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Zurück
        </button>
      </div>
      
      {/* Deal header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-xl font-semibold text-primary-700">
            <CurrencyEuroIcon className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {deal.title}
            </h1>
            <div className="flex items-center text-gray-500">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(deal.status)}`}>
                {getStatusDisplayText(deal.status)}
              </span>
              <span className="ml-2 font-medium">
                {deal.value.toLocaleString('de-DE')} €
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex space-x-3 mt-4 md:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Bearbeiten
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Löschen
          </button>
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deal info */}
        <motion.div 
          className="card col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Deal-Details</h2>
          
          <div className="space-y-4">
            {deal.contact && (
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kontakt</p>
                  <Link 
                    to={`/contacts/${deal.contact.id}`} 
                    className="text-gray-900 hover:text-primary-600"
                  >
                    {deal.contact.first_name} {deal.contact.last_name}
                  </Link>
                  {deal.contact.company && (
                    <p className="text-sm text-gray-500">
                      {deal.contact.company}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Wert</p>
                <p className="text-gray-900">{deal.value.toLocaleString('de-DE')} €</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Erwartetes Abschlussdatum</p>
                <p className="text-gray-900">
                  {format(new Date(deal.expected_date), 'dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            </div>
            
            {deal.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">Beschreibung</p>
                <p className="mt-2 text-gray-900 whitespace-pre-line">{deal.description}</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Erstellt am</p>
              <p className="text-gray-900">
                {format(new Date(deal.created_at), 'dd. MMMM yyyy', { locale: de })}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Tasks section */}
        <motion.div 
          className="col-span-1 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Aufgaben</h2>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Aufgabe hinzufügen
              </button>
            </div>
            
            {deal.tasks && deal.tasks.length > 0 ? (
              <div className="space-y-4">
                {deal.tasks.map((task: Task) => (
                  <div 
                    key={task.id}
                    className={`bg-gray-50 p-4 rounded-lg border-l-4 ${
                      task.completed 
                        ? 'border-green-500' 
                        : new Date(task.due_date) < new Date() 
                        ? 'border-red-500' 
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 flex-shrink-0">
                        <button
                          onClick={() => handleToggleTaskCompletion(task)}
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            task.completed 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {task.completed ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <ClipboardDocumentListIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Fällig: {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        </div>
                        
                        {task.details && (
                          <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.details}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTaskClick(task)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTaskClick(task)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <div className="mx-auto h-12 w-12 text-gray-300">
                  <ClipboardDocumentListIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Es sind noch keine Aufgaben für diesen Deal vorhanden.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="btn btn-primary"
                  >
                    Aufgabe erstellen
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Edit deal modal */}
      {isEditModalOpen && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          deal={deal}
        />
      )}
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteDealMutation.mutate()}
        title="Deal löschen"
        message={`Sind Sie sicher, dass Sie den Deal "${deal.title}" löschen möchten? Alle zugehörigen Aufgaben werden ebenfalls gelöscht.`}
        isDeleting={deleteDealMutation.isLoading}
      />
      
      {/* Create task modal */}
      <TaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        task={{
          id: 0,
          title: '',
          details: '',
          due_date: '',
          completed: false,
          deal_id: parseInt(id || '0'),
          user_id: 0,
          created_at: '',
          updated_at: '',
          deal: deal
        }}
        deals={deals}
      />
      
      {/* Edit task modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          deals={deals}
        />
      )}
      
      {/* Delete task confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => {
          setIsDeleteTaskModalOpen(false);
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

export default DealDetails;
