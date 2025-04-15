import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { Task } from '../../types/Task';
import { useAuth } from '../../hooks/useAuth';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PlusIcon,
  UserCircleIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatRelativeTime } from '../../utils/formatting';
import toast from 'react-hot-toast';
import TaskModal from './TaskModal';
import { motion } from 'framer-motion';

interface TaskBoardProps {
  filterUserId?: number;
  filterContactId?: number;
  filterDealId?: number;
}

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ 
  filterUserId,
  filterContactId,
  filterDealId 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Define columns
  const columns: Column[] = [
    { 
      id: 'todo', 
      title: 'Zu erledigen', 
      icon: <ClockIcon className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'in_progress', 
      title: 'In Bearbeitung', 
      icon: <UserCircleIcon className="h-5 w-5 text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200'
    },
    { 
      id: 'completed', 
      title: 'Erledigt', 
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50 border-green-200' 
    }
  ];

  // Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>(
    ['tasks', { userId: filterUserId, contactId: filterContactId, dealId: filterDealId }],
    async () => {
      let url = '/api/v1/tasks';
      const params = new URLSearchParams();
      
      if (filterUserId) {
        params.append('user_id', filterUserId.toString());
      }
      
      if (filterContactId) {
        params.append('contact_id', filterContactId.toString());
      }
      
      if (filterDealId) {
        params.append('deal_id', filterDealId.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    (task: Partial<Task>) => api.put(`/api/v1/tasks/${task.id}`, task),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Fehler beim Aktualisieren der Aufgabe';
        toast.error(message);
      }
    }
  );

  // Group tasks by status
  const groupedTasks = tasks.reduce<Record<string, Task[]>>(
    (grouped, task) => {
      const status = task.status || 'todo';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
      return grouped;
    },
    columns.reduce<Record<string, Task[]>>((acc, column) => {
      acc[column.id] = [];
      return acc;
    }, {})
  );

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // If dropped outside of droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get the task being dragged
    const task = groupedTasks[source.droppableId][source.index];
    
    // Update task status
    if (source.droppableId !== destination.droppableId) {
      updateTaskMutation.mutate({
        id: task.id,
        status: destination.droppableId
      });
      
      // Optimistic update
      const newTasks = [...tasks];
      const updatedTask = { ...task, status: destination.droppableId };
      const taskIndex = newTasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        newTasks[taskIndex] = updatedTask;
      }
      
      queryClient.setQueryData<Task[]>(
        ['tasks', { userId: filterUserId, contactId: filterContactId, dealId: filterDealId }],
        newTasks
      );
    }
  };

  // Handle click on task
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsCreatingTask(false);
    setIsModalOpen(true);
  };

  // Handle creating new task
  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsCreatingTask(true);
    setIsModalOpen(true);
  };

  const getTaskPriorityColor = (priority: string | undefined): string => {
    // Wenn priority undefined ist, geben wir die Standardfarbe zurück
    if (!priority) return 'text-gray-600';
    
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoadingTasks) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Aufgaben-Board
        </h2>
        <button
          onClick={handleCreateTask}
          className="btn btn-primary btn-sm flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Neue Aufgabe
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben gefunden</h3>
          <p className="mt-1 text-sm text-gray-500">
            Erstellen Sie Ihre erste Aufgabe, um mit dem Taskmanagement zu beginnen.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateTask}
              className="btn btn-primary inline-flex items-center"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Aufgabe erstellen
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div 
                key={column.id}
                className={`bg-white rounded-lg shadow overflow-hidden ${
                  updateTaskMutation.isLoading ? 'opacity-50' : ''
                }`}
              >
                <div className={`p-4 ${column.color} border-b flex items-center justify-between`}>
                  <div className="flex items-center">
                    {column.icon}
                    <h3 className="ml-2 font-medium">{column.title}</h3>
                  </div>
                  <span className="bg-white text-xs font-medium rounded-full px-2.5 py-0.5 shadow-sm">
                    {groupedTasks[column.id]?.length || 0}
                  </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-2 min-h-[200px] max-h-[600px] overflow-y-auto"
                    >
                      {groupedTasks[column.id]?.map((task, index) => (
                        <Draggable 
                          key={task.id.toString()} 
                          draggableId={task.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleTaskClick(task)}
                              className={`p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-200 
                                cursor-pointer hover:shadow ${snapshot.isDragging ? 'shadow-md' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                  {task.title}
                                </h4>
                                <span className={`text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                                  {task.priority || 'Normal'}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                {task.due_date && (
                                  <div className="flex items-center mr-3">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {formatDate(task.due_date)}
                                  </div>
                                )}
                                
                                {task.assigned_to && (
                                  <div className="flex items-center">
                                    <UserCircleIcon className="h-3 w-3 mr-1" />
                                    {task.assigned_to.username || 'Unzugewiesen'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        isCreating={isCreatingTask}
        contactId={filterContactId}
        dealId={filterDealId}
      />
    </div>
  );
};

export default TaskBoard;
