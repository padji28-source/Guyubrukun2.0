import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './apiInterceptor';

export interface DemographicGroup {
  key: string;
  name: string;
  range: string;
  count: number;
  fill: string;
}

export interface DashboardMetrics {
  jumlahKK: number;
  jumlahWarga: number;
  docUploaded: number;
  docNotUploaded: number;
  saldoKas: number;
  kasDetail: {
    kasRT: number;
    danaKematian: number;
    danaSosial: number;
  };
  iuranBulanIni: {
    lunasPct: number;
    totalIuranCount: number;
    lunasCount: number;
    totalAmount: number;
  };
  demographics: {
    balita: number;
    anak: number;
    remaja: number;
    dewasa: number;
    lansia: number;
    lakiLaki: number;
    perempuan: number;
    totalWithAge: number;
    groups: DemographicGroup[];
  };
  pengurusList: any[];
  pengaduanAktif: any[];
  agendaUpcoming: any[];
  wargaList?: any[];
}

export interface DashboardContextValue {
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const defaultMetrics: DashboardMetrics = {
  jumlahKK: 0,
  jumlahWarga: 0,
  docUploaded: 0,
  docNotUploaded: 0,
  saldoKas: 0,
  kasDetail: { kasRT: 0, danaKematian: 0, danaSosial: 0 },
  iuranBulanIni: { lunasPct: 0, totalIuranCount: 0, lunasCount: 0, totalAmount: 0 },
  demographics: {
    balita: 0,
    anak: 0,
    remaja: 0,
    dewasa: 0,
    lansia: 0,
    lakiLaki: 0,
    perempuan: 0,
    totalWithAge: 0,
    groups: []
  },
  pengurusList: [],
  pengaduanAktif: [],
  agendaUpcoming: [],
  wargaList: []
};

const DashboardContext = createContext<DashboardContextValue>({
  metrics: defaultMetrics,
  loading: false,
  error: null,
  refresh: async () => {}
});

// In-memory cache for instant hydration
let cachedMetrics: DashboardMetrics | null = null;
let activeFetchPromise: Promise<DashboardMetrics | null> | null = null;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(cachedMetrics || defaultMetrics);
  const [loading, setLoading] = useState<boolean>(!cachedMetrics);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async (isBackground = false): Promise<DashboardMetrics | null> => {
    // If a request is already in-flight, return the same promise to prevent duplicate requests
    if (activeFetchPromise) {
      return activeFetchPromise;
    }

    if (!isBackground && !cachedMetrics) {
      setLoading(true);
    }
    setError(null);

    activeFetchPromise = (async () => {
      try {
        const res = await apiFetch('/api/dashboard/summary');
        if (!res.ok) {
          throw new Error(`Dashboard request failed: ${res.status}`);
        }
        const json = await res.json();
        const m: DashboardMetrics = json.metrics || json;
        cachedMetrics = m;
        setMetrics(m);
        return m;
      } catch (err: any) {
        console.warn('Dashboard fetch warning:', err);
        setError(err.message || 'Gagal memuat dashboard');
        return null;
      } finally {
        activeFetchPromise = null;
        setLoading(false);
      }
    })();

    return activeFetchPromise;
  }, []);

  const refresh = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData(Boolean(cachedMetrics));

    const handleUpdate = () => {
      // Debounce updates by 500ms so multiple rapid events don't trigger burst requests
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        fetchDashboardData(true);
      }, 500);
    };

    window.addEventListener('app_data_update', handleUpdate);
    return () => {
      window.removeEventListener('app_data_update', handleUpdate);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider value={{ metrics, loading, error, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardData = () => {
  return useContext(DashboardContext);
};
