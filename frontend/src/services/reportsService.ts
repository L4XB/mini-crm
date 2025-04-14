import api from './api';

export interface SalesOverview {
  totalDeals: number;
  totalValue: number;
  avgDealSize: number;
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
  conversionRate: number;
}

export interface MonthlySales {
  month: string;
  value: number;
}

export interface Performer {
  name: string;
  deals: number;
  value: number;
}

export interface LeadSource {
  source: string;
  count: number;
  percentage: number;
}

export interface DealStage {
  stage: string;
  count: number;
  value: number;
}

export interface ActivityMetrics {
  callsMade: number;
  emailsSent: number;
  meetingsScheduled: number;
  tasksCompleted: number;
}

export interface ReportData {
  salesOverview: SalesOverview;
  salesByMonth: MonthlySales[];
  topPerformers: Performer[];
  leadSources: LeadSource[];
  dealsByStage: DealStage[];
  activityMetrics: ActivityMetrics;
}

const reportsService = {
  getReportData: async (reportType: string, dateRange: string): Promise<ReportData> => {
    try {
      const response = await api.get('/api/v1/reports', {
        params: { type: reportType, range: dateRange }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Berichtsdaten:', error);
      
      // Fallback auf Mock-Daten, wenn die API nicht erreichbar ist
      return {
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
          { month: 'Dez', value: 0 },
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
    }
  },
  
  exportReport: async (reportType: string, dateRange: string, format: string): Promise<Blob> => {
    try {
      const response = await api.get('/api/v1/reports/export', {
        params: { type: reportType, range: dateRange, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Exportieren des Berichts:', error);
      throw error;
    }
  }
};

export default reportsService;
