import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { api } from '../../services/api';
import { Deal } from '../../types/Deal';
import { 
  ArrowTrendingUpIcon, 
  BanknotesIcon, 
  ChartBarIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatting';

interface DealStatsProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  userId?: number;
}

const DealStats: React.FC<DealStatsProps> = ({ 
  timeRange = 'month', 
  userId 
}) => {
  // Fetch deals
  const { data: deals = [], isLoading } = useQuery<Deal[]>(
    ['deals', { timeRange, userId }],
    async () => {
      let url = '/api/v1/deals';
      const params = new URLSearchParams();
      
      if (timeRange) {
        params.append('time_range', timeRange);
      }
      
      if (userId) {
        params.append('user_id', userId.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    }
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!deals.length) {
      return {
        totalValue: 0,
        avgDealSize: 0,
        winRate: 0,
        openDeals: 0,
        closedWonDeals: 0,
        closedLostDeals: 0,
        stageData: {}
      };
    }

    const openDeals = deals.filter(deal => deal.status === 'open');
    const closedWonDeals = deals.filter(deal => deal.status === 'won');
    const closedLostDeals = deals.filter(deal => deal.status === 'lost');
    
    const totalValue = closedWonDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealSize = closedWonDeals.length 
      ? totalValue / closedWonDeals.length 
      : 0;
    
    const closedDeals = closedWonDeals.length + closedLostDeals.length;
    const winRate = closedDeals 
      ? (closedWonDeals.length / closedDeals) * 100 
      : 0;

    // Group deals by stage
    const stageData: Record<string, { count: number, value: number }> = {};
    deals.forEach(deal => {
      if (!stageData[deal.stage]) {
        stageData[deal.stage] = { count: 0, value: 0 };
      }
      stageData[deal.stage].count += 1;
      stageData[deal.stage].value += deal.value;
    });

    return {
      totalValue,
      avgDealSize,
      winRate,
      openDeals: openDeals.length,
      closedWonDeals: closedWonDeals.length,
      closedLostDeals: closedLostDeals.length,
      stageData
    };
  }, [deals]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'week': return 'Diese Woche';
      case 'month': return 'Diesen Monat';
      case 'quarter': return 'Dieses Quartal';
      case 'year': return 'Dieses Jahr';
      default: return 'Diesen Monat';
    }
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-32">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!deals.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-500 text-center">
          Keine Deals für {timeRangeLabel} gefunden.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Gesamtwert</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(stats.totalValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{timeRangeLabel}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Gewinnrate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Abgeschlossene Deals</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Average Deal Size */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Durchschnittswert</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(stats.avgDealSize)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pro gewonnener Deal</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <ChartBarIcon className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Open Deals */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Offene Deals</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.openDeals}
            </p>
            <p className="text-xs text-gray-500 mt-1">In der Pipeline</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <ClockIcon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Deal Stage Breakdown */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow-sm mt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deal-Status Übersicht</h3>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.stageData).map(([stage, data]) => (
              <div key={stage} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize">{stage}</h4>
                <div className="mt-2 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Anzahl</p>
                    <p className="text-lg font-medium">{data.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wert</p>
                    <p className="text-lg font-medium">{formatCurrency(data.value)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealStats;
