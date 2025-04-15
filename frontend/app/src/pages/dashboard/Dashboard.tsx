import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getData } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  CurrencyEuroIcon, 
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subDays, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { Contact } from '../../types/Contact';
import { Deal } from '../../types/Deal';
import { Task } from '../../types/Task';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  // Fetch contacts
  const { data: contacts = [] } = useQuery<Contact[]>('contacts', async () => {
    return await getData<Contact[]>('/api/v1/contacts');
  });

  // Fetch deals
  const { data: deals = [] } = useQuery<Deal[]>('deals', async () => {
    return await getData<Deal[]>('/api/v1/deals');
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>('tasks', async () => {
    return await getData<Task[]>('/api/v1/tasks');
  });

  // Calculate statistics
  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: any) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate total deal value
  const totalDealValue = deals.reduce((sum: number, deal: any) => sum + deal.value, 0);
  
  // Calculate deals by status
  const openDeals = deals.filter((deal: any) => deal.status === 'open').length;
  const wonDeals = deals.filter((deal: any) => deal.status === 'won').length;
  const lostDeals = deals.filter((deal: any) => deal.status === 'lost').length;

  // Deal status data for the chart
  const dealStatusData = {
    labels: ['Offen', 'Gewonnen', 'Verloren'],
    datasets: [
      {
        data: [openDeals, wonDeals, lostDeals],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Contact stages data
  const leadContacts = contacts.filter((contact: any) => contact.contact_stage === 'Lead').length;
  const prospectContacts = contacts.filter((contact: any) => contact.contact_stage === 'Prospect').length;
  const customerContacts = contacts.filter((contact: any) => contact.contact_stage === 'Customer').length;

  const contactStageData = {
    labels: ['Leads', 'Prospects', 'Kunden'],
    datasets: [
      {
        data: [leadContacts, prospectContacts, customerContacts],
        backgroundColor: [
          'rgba(249, 115, 22, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(20, 184, 166, 0.7)',
        ],
        borderColor: [
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(20, 184, 166)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Sales trend data for the last 7 days
  const dateLabels = Array.from({ length: 7 }, (_, i) => {
    return format(subDays(new Date(), 6 - i), 'dd.MM', { locale: de });
  });

  // Generiere Daten basierend auf den tatsächlichen Deals für die letzten 7 Tage
  const salesTrendData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Deal-Wert (€)',
        data: dateLabels.map((_, index) => {
          const date = subDays(new Date(), 6 - index);
          // Filtere Deals für diesen Tag
          const dealsOnDate = deals.filter((deal: any) => {
            if (!deal.created_at) return false;
            const dealDate = new Date(deal.created_at);
            return dealDate.getDate() === date.getDate() &&
                  dealDate.getMonth() === date.getMonth() &&
                  dealDate.getFullYear() === date.getFullYear();
          });
          // Berechne die Summe der Deal-Werte für diesen Tag
          return dealsOnDate.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
        }),
        fill: false,
        backgroundColor: 'rgb(99, 102, 241)',
        borderColor: 'rgba(99, 102, 241, 0.7)',
        tension: 0.4,
      },
    ],
  };

  // Filter upcoming tasks (due within the next 7 days and not completed)
  useEffect(() => {
    if (tasks.length > 0) {
      const upcoming = tasks
        .filter((task: any) => !task.completed && isBefore(new Date(), new Date(task.due_date)))
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);
      
      setUpcomingTasks(upcoming);
    }
  }, [tasks]);

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Übersicht über Ihre CRM-Aktivitäten
          </p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Contacts stat */}
        <motion.div 
          className="card flex items-start" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-3 rounded-md bg-primary-100 mr-4">
            <UserGroupIcon className="h-6 w-6 text-primary-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Kontakte</p>
            <p className="text-2xl font-semibold text-gray-900">{totalContacts}</p>
            <Link to="/contacts" className="text-xs text-primary-600 hover:text-primary-800">
              Alle ansehen →
            </Link>
          </div>
        </motion.div>

        {/* Deals stat */}
        <motion.div 
          className="card flex items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-3 rounded-md bg-green-100 mr-4">
            <CurrencyEuroIcon className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Deals</p>
            <p className="text-2xl font-semibold text-gray-900">{totalDeals}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">{totalDealValue.toLocaleString('de-DE')}</span> € Gesamtwert
            </p>
          </div>
        </motion.div>

        {/* Tasks stat */}
        <motion.div 
          className="card flex items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-3 rounded-md bg-purple-100 mr-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aufgaben</p>
            <p className="text-2xl font-semibold text-gray-900">{pendingTasks}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">{completedTasks}</span> abgeschlossen
            </p>
          </div>
        </motion.div>
        
        {/* Conversion rate */}
        <motion.div 
          className="card flex items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="p-3 rounded-md bg-blue-100 mr-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Deal Erfolgsquote</p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">{wonDeals}</span> gewonnene Deals
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Deal-Status</h2>
          <div className="h-60">
            <Doughnut 
              data={dealStatusData} 
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kontakt-Segmente</h2>
          <div className="h-60">
            <Doughnut 
              data={contactStageData} 
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Sales Trend */}
      <motion.div 
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">Umsatztrend (Letzte 7 Tage) <span className="text-xs text-gray-500 ml-2">Basierend auf echten Daten</span></h2>
        <div className="h-60">
          <Line 
            data={salesTrendData} 
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>
      </motion.div>

      {/* Upcoming Tasks */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Anstehende Aufgaben</h2>
          <Link 
            to="/tasks" 
            className="text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            Alle ansehen
          </Link>
        </div>
        
        {upcomingTasks.length > 0 ? (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-gray-500 truncate">{task.details}</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs font-medium text-gray-500">Fällig:</span>
                        <span className="ml-1 text-xs text-gray-900">
                          {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/tasks?id=${task.id}`}
                      className="ml-4 flex-shrink-0 bg-white rounded-md text-sm font-medium text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Ansehen
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine anstehenden Aufgaben</h3>
            <p className="mt-1 text-sm text-gray-500">
              Erstellen Sie eine neue Aufgabe, um den Überblick zu behalten.
            </p>
            <div className="mt-6">
              <Link
                to="/tasks"
                className="btn btn-primary"
              >
                Neue Aufgabe
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
