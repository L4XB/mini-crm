'use client';

import { formatCurrency } from '@/lib/utils';
import {
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { contactsService, dealsService, tasksService } from '@/services/api';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Temporary mocked DashboardLayout until we fix the imports
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  // Define types for better TypeScript support
  interface Deal {
    id: number;
    name: string;
    amount: number;
    expectedDate: string;
    status?: 'won' | 'in_progress' | 'lost';
  }

  interface Task {
    id: number;
    title: string;
    completed: boolean;
    dueDate?: string;
    type?: string;
  }
  
  interface Contact {
    id: number;
    name: string;
  }

  interface DashboardStats {
    contacts: number;
    deals: number;
    tasks: number;
    pendingTasks: number;
    completedTasks: number;
    revenue: number;
    revenueTarget: number;
    upcomingDeals: Deal[];
  }

  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0,
    deals: 0,
    tasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    revenue: 0,
    revenueTarget: 250000,
    upcomingDeals: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Declare variables outside useEffect to make them accessible to chart functions
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  const [dealsData, setDealsData] = useState<Deal[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Load real data from API endpoints
        const contactsPromise = contactsService.getAll().catch(err => {
          console.error('Error loading contacts:', err);
          return [];
        });
        
        const dealsPromise = dealsService.getAll().catch(err => {
          console.error('Error loading deals:', err);
          return [];
        });
        
        const tasksPromise = tasksService.getAll().catch(err => {
          console.error('Error loading tasks:', err);
          return [];
        });
        
        // Load all data in parallel
        const [contacts, deals, tasks] = await Promise.all([contactsPromise, dealsPromise, tasksPromise]);
        
        // Store data in state
        setContactsData(contacts);
        setDealsData(deals);
        setTasksData(tasks);

        // Calculate dashboard stats
        const pendingTasks = tasks.filter((task: Task) => !task.completed);
        const completedTasks = tasks.filter((task: Task) => task.completed);
        const totalRevenue = deals.reduce((sum: number, deal: Deal) => sum + (deal.amount || 0), 0);

        // Get upcoming deals (next 30 days)
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30);

        const upcomingDeals = deals
          .filter((deal: Deal) => {
            if (!deal.expectedDate) return false;
            const expectedDate = new Date(deal.expectedDate);
            return expectedDate >= now && expectedDate <= in30Days;
          })
          .sort((a: Deal, b: Deal) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())
          .slice(0, 5);

        setStats({
          contacts: contacts?.length || 0,
          deals: deals?.length || 0,
          tasks: tasks?.length || 0,
          pendingTasks: pendingTasks?.length || 0,
          completedTasks: completedTasks?.length || 0,
          revenue: totalRevenue || 0,
          revenueTarget: 250000,
          upcomingDeals: upcomingDeals || []
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    // Nur wenn der Benutzer angemeldet ist, Daten abrufen
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    } else {
      setError('Please log in to view dashboard data.');
      setIsLoading(false);
    }
  }, []);

  // Revenue data from deals
  const generateRevenueData = (deals: Deal[] = []) => {
    // Create an array for each month, initialize with zeros
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = Array(12).fill(0);
    
    // Sum deal amounts by month
    deals.forEach(deal => {
      if (deal.amount && deal.expectedDate) {
        const date = new Date(deal.expectedDate);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyRevenue[month] += deal.amount;
        }
      }
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: `Revenue ${currentYear}`,
          data: monthlyRevenue,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3,
        }
      ],
    };
  };
  
  const revenueChartData = generateRevenueData(dealsData);

  // Generate real deal status data
  const generateDealsStatusData = (deals: Deal[]) => {
    // Count deals by status
    let won = 0;
    let inProgress = 0;
    let lost = 0;
    
    deals.forEach(deal => {
      if (deal.status === 'won') won++;
      else if (deal.status === 'lost') lost++;
      else inProgress++; // Default or in_progress
    });
    
    return {
      labels: ['Won', 'In Progress', 'Lost'],
      datasets: [
        {
          data: [won, inProgress, lost],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  const dealsStatusData = generateDealsStatusData(dealsData);

  // Generate task distribution by type
  const generateTasksByTypeData = (tasks: Task[]) => {
    // Count task types
    const types: Record<string, number> = {};
    
    tasks.forEach(task => {
      const type = task.type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    
    // Convert to arrays for chart
    const labels = Object.keys(types).length > 0 ? Object.keys(types) : ['No Tasks'];
    const data = Object.keys(types).length > 0 ? Object.values(types) : [0];
    
    return {
      labels,
      datasets: [
        {
          label: 'Tasks by Type',
          data,
          backgroundColor: 'rgba(147, 51, 234, 0.7)',
        },
      ],
    };
  };
  
  const tasksByTypeData = generateTasksByTypeData(tasksData);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Button component replacement to avoid type errors
  const Button = ({
    children,
    className = "",
    onClick = () => { },
    variant = "default"
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: string
  }) => (
    <button
      onClick={onClick}
      className={`${className} px-4 py-2 rounded-md ${variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
    >
      {children}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Willkommen zurück! Hier ist ein Überblick über Ihr CRM.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Kontakte</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.contacts}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/contacts" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Alle anzeigen
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Deals</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.deals}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/deals" className="font-medium text-blue-600 hover:text-blue-500">
                  Alle anzeigen
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aufgaben</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.tasks}</div>
                      <p className="text-sm text-gray-500">
                        <span className="text-green-500">{stats.completedTasks} erledigt</span> /
                        <span className="text-amber-500 ml-1">{stats.pendingTasks} offen</span>
                      </p>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/tasks" className="font-medium text-purple-600 hover:text-purple-500">
                  Alle anzeigen
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Umsatz</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(stats.revenue)}</div>
                      <p className="text-sm text-gray-500">
                        {Math.round((stats.revenue / stats.revenueTarget) * 100)}% vom Ziel
                      </p>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/reports" className="font-medium text-green-600 hover:text-green-500">
                  Details anzeigen
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Umsatzentwicklung</h3>
            <div className="h-80">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value as number);
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deal-Status-Verteilung</h3>
            <div className="h-80 flex justify-center items-center">
              <div style={{ width: '70%', height: '70%' }}>
                <Doughnut
                  data={dealsStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aufgabenverteilung nach Typ</h3>
            <div className="h-64">
              <Bar
                data={tasksByTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Anstehende Deals</h3>
              <span className="text-sm text-gray-500">Nächste 30 Tage</span>
            </div>

            {stats.upcomingDeals && stats.upcomingDeals.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingDeals.map((deal: Deal) => (
                  <div key={deal.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{deal.name}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-500">{formatCurrency(deal.amount)}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {deal.expectedDate ? format(new Date(deal.expectedDate), 'dd.MM.yyyy', { locale: de }) : 'kein Datum'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm p-4 text-center">Keine anstehenden Deals in den nächsten 30 Tagen.</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full text-sm py-2"
              >
                Alle Deals anzeigen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
