'use client';

import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Mock report data
const MOCK_REPORT_DATA = {
  salesOverview: {
    totalDeals: 125,
    totalValue: 754230,
    avgDealSize: 6034,
    wonDeals: 78,
    lostDeals: 32,
    openDeals: 15,
    conversionRate: 71,
  },
  salesByMonth: [
    { month: 'Jan', value: 52400 },
    { month: 'Feb', value: 47900 },
    { month: 'Mär', value: 63200 },
    { month: 'Apr', value: 58700 },
    { month: 'Mai', value: 71500 },
    { month: 'Jun', value: 68300 },
    { month: 'Jul', value: 74600 },
    { month: 'Aug', value: 69800 },
    { month: 'Sep', value: 82100 },
    { month: 'Okt', value: 79500 },
    { month: 'Nov', value: 85600 },
    { month: 'Dez', value: 0 }, // Current month, no data yet
  ],
  topPerformers: [
    { name: 'Maria Schmidt', deals: 28, value: 167500 },
    { name: 'Thomas Müller', deals: 23, value: 145800 },
    { name: 'Anna Weber', deals: 18, value: 132400 },
    { name: 'Daniel Fischer', deals: 15, value: 98700 },
    { name: 'Sabine Wolf', deals: 12, value: 87600 },
  ],
  leadSources: [
    { source: 'Website', count: 45, percentage: 36 },
    { source: 'Empfehlung', count: 32, percentage: 25.6 },
    { source: 'Messe', count: 18, percentage: 14.4 },
    { source: 'Kaltakquise', count: 16, percentage: 12.8 },
    { source: 'Social Media', count: 14, percentage: 11.2 },
  ],
  dealsByStage: [
    { stage: 'Bedarfsanalyse', count: 22, value: 132000 },
    { stage: 'Angebot', count: 18, value: 108000 },
    { stage: 'Verhandlung', count: 15, value: 90000 },
    { stage: 'Abschluss', count: 9, value: 54000 },
  ],
  activityMetrics: {
    callsMade: 326,
    emailsSent: 548,
    meetingsScheduled: 87,
    tasksCompleted: 203,
  },
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Card component for metrics
const MetricCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
        {icon}
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-semibold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

// Bar chart component
const BarChart = ({ data, title }: { data: any[]; title: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-4">
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600">{item.month}</div>
              <div className="relative w-full h-5 bg-gray-200 rounded">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded"
                  style={{ width: `${item.value / maxValue * 100}%` }}
                ></div>
              </div>
              <div className="ml-2 w-24 text-sm text-gray-600 text-right">
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Table component
const Table = ({ data, columns, title }: { data: any[]; columns: { key: string; label: string; format?: (value: any) => string }[]; title: string }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.format ? column.format(row[column.key]) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Pie chart component (simplified for this demo)
const PieChart = ({ data, title }: { data: any[]; title: string }) => {
  // Simple colors for the pie segments
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-4">
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-4 h-4 ${colors[index % colors.length]} rounded-full`}></div>
              <div className="ml-2 w-40 text-sm text-gray-600">{item.source}</div>
              <div className="flex-grow">
                <div className="relative h-4 bg-gray-200 rounded">
                  <div
                    className={`absolute top-0 left-0 h-full ${colors[index % colors.length]} rounded`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-2 w-16 text-sm text-gray-600 text-right">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Report date range selector
const DateRangeSelector = ({ range, setRange }: { range: string; setRange: (range: string) => void }) => {
  const ranges = ['Diese Woche', 'Dieser Monat', 'Dieses Quartal', 'Dieses Jahr', 'Letztes Jahr', 'Benutzerdefiniert'];
  
  return (
    <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            range === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
};

// Report type selector
const ReportTypeSelector = ({ type, setType }: { type: string; setType: (type: string) => void }) => {
  const types = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'sales', label: 'Verkauf' },
    { id: 'activity', label: 'Aktivitäten' },
    { id: 'leads', label: 'Leads' },
    { id: 'performance', label: 'Leistung' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => setType(t.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            type === t.id 
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('Dieser Monat');
  const [reportType, setReportType] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  const handleExportReport = () => {
    alert('Export-Funktion wird implementiert');
  };
  
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berichte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analysen und Statistiken für Geschäftsentscheidungen.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={handleRefreshData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isRefreshing}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" />
            Exportieren
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <DateRangeSelector range={dateRange} setRange={setDateRange} />
            </div>
            <div>
              <ReportTypeSelector type={reportType} setType={setReportType} />
            </div>
          </div>
        </div>
        
        {/* Overview Report */}
        {reportType === 'overview' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Vertriebsübersicht</h2>
              <p className="text-sm text-gray-500">Allgemeine Kennzahlen für {dateRange.toLowerCase()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard 
                title="Gesamtumsatz" 
                value={formatCurrency(MOCK_REPORT_DATA.salesOverview.totalValue)} 
                icon={<CurrencyEuroIcon className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
              <MetricCard 
                title="Ø Deal-Größe" 
                value={formatCurrency(MOCK_REPORT_DATA.salesOverview.avgDealSize)} 
                icon={<ChartBarIcon className="h-6 w-6 text-white" />}
                color="bg-blue-500"
              />
              <MetricCard 
                title="Abschlussrate" 
                value={`${MOCK_REPORT_DATA.salesOverview.conversionRate}%`} 
                icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
                color="bg-indigo-500"
              />
              <MetricCard 
                title="Anzahl Deals" 
                value={MOCK_REPORT_DATA.salesOverview.totalDeals} 
                icon={<BriefcaseIcon className="h-6 w-6 text-white" />}
                color="bg-yellow-500"
              />
            </div>
            
            <div className="mb-6">
              <BarChart data={MOCK_REPORT_DATA.salesByMonth} title="Umsatz nach Monat" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Table 
                data={MOCK_REPORT_DATA.topPerformers} 
                columns={[
                  { key: 'name', label: 'Mitarbeiter' },
                  { key: 'deals', label: 'Anzahl Deals' },
                  { key: 'value', label: 'Gesamtumsatz', format: (value) => formatCurrency(value) },
                ]}
                title="Top Performer"
              />
              <PieChart data={MOCK_REPORT_DATA.leadSources} title="Lead-Quellen" />
            </div>
          </div>
        )}
        
        {/* Sales Report */}
        {reportType === 'sales' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Vertriebsbericht</h2>
              <p className="text-sm text-gray-500">Detaillierte Vertriebszahlen für {dateRange.toLowerCase()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <MetricCard 
                title="Gewonnene Deals" 
                value={MOCK_REPORT_DATA.salesOverview.wonDeals} 
                icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
              <MetricCard 
                title="Verlorene Deals" 
                value={MOCK_REPORT_DATA.salesOverview.lostDeals} 
                icon={<XCircleIcon className="h-6 w-6 text-white" />}
                color="bg-red-500"
              />
              <MetricCard 
                title="Offene Deals" 
                value={MOCK_REPORT_DATA.salesOverview.openDeals} 
                icon={<ClipboardDocumentListIcon className="h-6 w-6 text-white" />}
                color="bg-yellow-500"
              />
            </div>
            
            <div className="mb-6">
              <Table 
                data={MOCK_REPORT_DATA.dealsByStage} 
                columns={[
                  { key: 'stage', label: 'Phase' },
                  { key: 'count', label: 'Anzahl' },
                  { key: 'value', label: 'Gesamtwert', format: (value) => formatCurrency(value) },
                ]}
                title="Deals nach Phase"
              />
            </div>
          </div>
        )}
        
        {/* Activity Report */}
        {reportType === 'activity' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Aktivitätsbericht</h2>
              <p className="text-sm text-gray-500">Übersicht der Benutzeraktivitäten für {dateRange.toLowerCase()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard 
                title="Anrufe getätigt" 
                value={MOCK_REPORT_DATA.activityMetrics.callsMade} 
                icon={<UserGroupIcon className="h-6 w-6 text-white" />}
                color="bg-blue-500"
              />
              <MetricCard 
                title="E-Mails gesendet" 
                value={MOCK_REPORT_DATA.activityMetrics.emailsSent} 
                icon={<UserGroupIcon className="h-6 w-6 text-white" />}
                color="bg-indigo-500"
              />
              <MetricCard 
                title="Meetings geplant" 
                value={MOCK_REPORT_DATA.activityMetrics.meetingsScheduled} 
                icon={<CalendarIcon className="h-6 w-6 text-white" />}
                color="bg-purple-500"
              />
              <MetricCard 
                title="Aufgaben erledigt" 
                value={MOCK_REPORT_DATA.activityMetrics.tasksCompleted} 
                icon={<ClipboardDocumentListIcon className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
            </div>
          </div>
        )}
        
        {/* Additional report types would be implemented similarly */}
        {(reportType === 'leads' || reportType === 'performance') && (
          <div className="p-6 text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Bericht in Entwicklung</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dieser Berichtstyp wird in Kürze verfügbar sein.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
