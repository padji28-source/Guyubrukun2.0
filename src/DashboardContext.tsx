import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, invalidateCache } from './apiInterceptor';

export interface DemographicsData {
  balita: number;
  anak: number;
  remaja: number;
  dewasa: number;
  lansia: number;
  lakiLaki: number;
  perempuan: number;
  totalWithAge: number;
  groups: Array<{ key: string; name: string; range: string; count: number; fill: string }>;
}

export interface KasDetail {
  kasRT: number;
  danaKematian: number;
  danaSosial: number;
}

export interface IuranBulanIni {
  totalIuranCount: number;
  lunasCount: number;
  totalAmount: number;
  lunasPct: number;
}

export interface DashboardMetrics {
  jumlahKK: number;
  jumlahWarga: number;
  docUploaded: number;
  docNotUploaded: number;
  saldoKas: number;
  kasDetail: KasDetail;
  iuranBulanIni: IuranBulanIni;
  pengaduanAktifCount: number;
  pengaduanAktif: any[];
  demographics: DemographicsData;
}

export interface DashboardSummaryData {
  metrics: DashboardMetrics;
  pengurusList: any[];
  agendaUpcoming: any[];
  latestMedia: any[];
  kasChart?: Array<{ bulan: string; value: number }>;
}

interface DashboardContextType {
  data: DashboardSummaryData | null;
  loading: boolean;
  error: any;
  refreshDashboard: (force?: boolean) => Promise<void>;
}

const defaultDemographics: DemographicsData = {
  balita: 0,
  anak: 0,
  remaja: 0,
  dewasa: 0,
  lansia: 0,
  lakiLaki: 0,
  perempuan: 0,
  totalWithAge: 0,
  groups: []
};

const defaultMetrics: DashboardMetrics = {
  jumlahKK: 0,
  jumlahWarga: 0,
  docUploaded: 0,
  docNotUploaded: 0,
  saldoKas: 0,
  kasDetail: { kasRT: 0, danaKematian: 0, danaSosial: 0 },
  iuranBulanIni: { totalIuranCount: 0, lunasCount: 0, totalAmount: 0, lunasPct: 0 },
  pengaduanAktifCount: 0,
  pengaduanAktif: [],
  demographics: defaultDemographics
};

const DashboardContext = createContext<DashboardContextType>({
  data: null,
  loading: true,
  error: null,
  refreshDashboard: async () => {}
});

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const refreshTimeoutRef = useRef<any>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchSummary = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current && !isRefresh) return;
    isFetchingRef.current = true;
    if (!data) setLoading(true);

    try {
      const res = await apiFetch('/api/dashboard/summary');
      if (res.ok) {
        const json = await res.json();
        const summary: DashboardSummaryData = {
          metrics: {
            ...defaultMetrics,
            ...(json.metrics || {}),
            kasDetail: { ...defaultMetrics.kasDetail, ...(json.metrics?.kasDetail || {}) },
            iuranBulanIni: { ...defaultMetrics.iuranBulanIni, ...(json.metrics?.iuranBulanIni || {}) },
            demographics: { ...defaultDemographics, ...(json.metrics?.demographics || {}) },
            pengaduanAktif: json.metrics?.pengaduanAktif || []
          },
          pengurusList: json.pengurusList || [],
          agendaUpcoming: json.agendaUpcoming || [],
          latestMedia: json.latestMedia || [],
          kasChart: json.kasChart || []
        };
        setData(summary);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [data]);

  const debouncedRefresh = useCallback((force = false) => {
    if (force) {
      invalidateCache('dashboard');
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchSummary(true);
    }, 350);
  }, [fetchSummary]);

  useEffect(() => {
    fetchSummary();

    const handleUpdate = (e: any) => {
      const detail = e.detail;
      const resource = typeof detail === 'string' ? detail : detail?.resource || detail?.type;
      
      // Only refresh dashboard if the updated resource impacts dashboard metrics
      const impactsDashboard = !resource || [
        'all',
        'dashboard',
        'kas',
        'warga',
        'users',
        'iuran',
        'laporan',
        'acara',
        'media',
        'dokumen'
      ].some(k => String(resource).toLowerCase().includes(k));

      if (impactsDashboard) {
        debouncedRefresh(true);
      }
    };

    window.addEventListener('app_data_update', handleUpdate);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'selected_rt') {
        debouncedRefresh(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('app_data_update', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchSummary, debouncedRefresh]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refreshDashboard: async (f) => debouncedRefresh(f) }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardData = () => useContext(DashboardContext);
