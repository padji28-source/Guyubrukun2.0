import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../apiInterceptor';
import {
  Users,
  Home,
  Wallet,
  CreditCard,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Store,
  MessageCircle,
  BarChart3,
  ArrowUpRight,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface DemographicGroup {
  key: string;
  name: string;
  range: string;
  count: number;
  fill: string;
}

export const WebDashboardRtView = ({
  user,
  onNavigateToWarga
}: {
  user?: any;
  onNavigateToWarga?: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    jumlahKK: 0,
    jumlahWarga: 0,
    saldoKas: 0,
    kasDetail: { kasRT: 0, danaKematian: 0, danaSosial: 0 },
    iuranBulanIni: { lunasPct: 0, totalIuranCount: 0, lunasCount: 0, totalAmount: 0 },
    demographics: {
      balita: 0,
      anak: 0,
      remaja: 0,
      dewasa: 0,
      lansia: 0,
      totalWithAge: 0,
      groups: [] as DemographicGroup[]
    },
    pengaduanAktif: [] as any[],
    agendaUpcoming: [] as any[],
    wargaList: [] as any[]
  });

  const computeDemographicsFromUsers = (users: any[]) => {
    const resolveAge = (rawAge: any, rawDob?: string): number => {
      if (rawDob && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDob).trim())) {
        const diff = Date.now() - new Date(String(rawDob).trim()).getTime();
        if (!isNaN(diff) && diff > 0) {
          return Math.max(0, Math.abs(new Date(diff).getUTCFullYear() - 1970));
        }
      }
      const parsed = parseInt(String(rawAge ?? '').replace(/\D/g, '') || '-1', 10);
      return isNaN(parsed) ? -1 : parsed;
    };

    let balita = 0;
    let anak = 0;
    let remaja = 0;
    let dewasa = 0;
    let lansia = 0;

    const addAge = (age: number) => {
      if (age < 0) return;
      if (age <= 4) balita++;
      else if (age <= 12) anak++;
      else if (age <= 20) remaja++;
      else if (age <= 70) dewasa++;
      else lansia++;
    };

    users
      .filter(u => u.role !== 'developer')
      .forEach(u => {
        addAge(resolveAge(u.umur, u.tglLahir));
        if (Array.isArray(u.members)) {
          u.members.forEach((m: any) => addAge(resolveAge(m.age, m.tglLahir)));
        }
      });

    const totalWithAge = balita + anak + remaja + dewasa + lansia;
    return {
      balita,
      anak,
      remaja,
      dewasa,
      lansia,
      totalWithAge,
      groups: [
        { key: 'balita', name: 'Balita', range: '0 - 4 Thn', count: balita, fill: '#3b82f6' },
        { key: 'anak', name: 'Anak', range: '5 - 12 Thn', count: anak, fill: '#10b981' },
        { key: 'remaja', name: 'Remaja', range: '13 - 20 Thn', count: remaja, fill: '#8b5cf6' },
        { key: 'dewasa', name: 'Dewasa', range: '21 - 70 Thn', count: dewasa, fill: '#f97316' },
        { key: 'lansia', name: 'Lansia', range: '> 70 Thn', count: lansia, fill: '#f43f5e' }
      ]
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, wargaRes] = await Promise.all([
        apiFetch('/api/dashboard'),
        apiFetch('/api/warga?limit=0&summary=1')
      ]);
      const data = await res.json();
      let fetchedWargaList: any[] = [];
      if (wargaRes.ok) {
        const wargaJson = await wargaRes.json();
        fetchedWargaList = (wargaJson.users || []).filter((u: any) => u.role !== 'developer');
      }

      let nextDemographics = data?.metrics?.demographics;
      if (!nextDemographics || !Array.isArray(nextDemographics.groups) || nextDemographics.totalWithAge === 0) {
        if (fetchedWargaList.length > 0) {
          nextDemographics = computeDemographicsFromUsers(fetchedWargaList);
        }
      }

      if (data.metrics) {
        setMetrics({
          ...data.metrics,
          wargaList: fetchedWargaList,
          demographics: nextDemographics || {
            balita: 0,
            anak: 0,
            remaja: 0,
            dewasa: 0,
            lansia: 0,
            totalWithAge: 0,
            groups: []
          }
        });
      }

      const umkmRes = await apiFetch('/api/data/umkm');
      const umkmData = await umkmRes.json();
      if (umkmData.data) {
        setUmkmList(umkmData.data);
      }
    } catch (e) {
      console.error('Failed to load Dashboard RT metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('app_data_update', fetchData);
    return () => window.removeEventListener('app_data_update', fetchData);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const demographicGroups: DemographicGroup[] = useMemo(() => {
    if (Array.isArray(metrics.demographics?.groups) && metrics.demographics.groups.length > 0) {
      return metrics.demographics.groups;
    }
    return [
      { key: 'balita', name: 'Balita', range: '0 - 4 Thn', count: metrics.demographics?.balita || 0, fill: '#3b82f6' },
      { key: 'anak', name: 'Anak', range: '5 - 12 Thn', count: metrics.demographics?.anak || 0, fill: '#10b981' },
      { key: 'remaja', name: 'Remaja', range: '13 - 20 Thn', count: metrics.demographics?.remaja || 0, fill: '#8b5cf6' },
      { key: 'dewasa', name: 'Dewasa', range: '21 - 70 Thn', count: metrics.demographics?.dewasa || 0, fill: '#f97316' },
      { key: 'lansia', name: 'Lansia', range: '> 70 Thn', count: metrics.demographics?.lansia || 0, fill: '#f43f5e' }
    ];
  }, [metrics.demographics]);

  const totalDemographicPersons = useMemo(() => {
    return demographicGroups.reduce((acc, g) => acc + (Number(g.count) || 0), 0);
  }, [demographicGroups]);

  const isAdministrativeRole = ['admin', 'developer', 'bendahara', 'sekretaris', 'pengurus'].includes(
    user?.role || 'admin'
  );

  // Interactive Peta Lingkungan state
  const [selectedBlokFilter, setSelectedBlokFilter] = useState<string>('ALL');
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapViewMode, setMapViewMode] = useState<'kavling' | 'osm'>('kavling');
  const [selectedHouse, setSelectedHouse] = useState<any | null>(null);

  const blokDefinitions = useMemo(() => [
    { key: 'A', label: 'Blok A', coordinator: 'Rizal', color: '#0d9488', bgLight: '#f0fdfa', border: '#99f6e4', zoneX: 8, zoneY: 12, zoneW: 26, zoneH: 34 },
    { key: 'C', label: 'Blok C', coordinator: 'Ikhsan', color: '#2563eb', bgLight: '#eff6ff', border: '#bfdbfe', zoneX: 37, zoneY: 12, zoneW: 26, zoneH: 34 },
    { key: 'D_GENAP', label: 'Blok D (Genap)', coordinator: 'Ari Hartoyo', color: '#7c3aed', bgLight: '#f5f3ff', border: '#ddd6fe', zoneX: 66, zoneY: 12, zoneW: 26, zoneH: 34 },
    { key: 'D_GANJIL', label: 'Blok D (Ganjil)', coordinator: 'Priyanto', color: '#ea580c', bgLight: '#fff7ed', border: '#fed7aa', zoneX: 8, zoneY: 54, zoneW: 26, zoneH: 34 },
    { key: 'E', label: 'Blok E', coordinator: 'Nurman', color: '#059669', bgLight: '#ecfdf5', border: '#a7f3d0', zoneX: 37, zoneY: 54, zoneW: 26, zoneH: 34 },
    { key: 'F', label: 'Blok F', coordinator: 'Azirwan', color: '#e11d48', bgLight: '#fff1f2', border: '#fecdd3', zoneX: 66, zoneY: 54, zoneW: 26, zoneH: 34 }
  ], []);

  const mappedHouses = useMemo(() => {
    const parseBlokAndNo = (alamatRaw: string) => {
      const addr = String(alamatRaw || '').toUpperCase();
      const blokMatch = addr.match(/BLOK\s*([A-Z])/i) || addr.match(/\b([A-F])\s*[-./]?\s*(\d+)/i);
      const numMatch = addr.match(/NO\.?\s*(\d+[A-Z]?)/i) || addr.match(/\b[A-F]\s*[-./]?\s*(\d+[A-Z]?)/i) || addr.match(/(\d+[A-Z]?)\s*$/);
      const rawBlok = blokMatch ? blokMatch[1].toUpperCase() : 'D';
      const houseNoStr = numMatch ? numMatch[1] : '1';
      const houseNum = parseInt(houseNoStr.replace(/\D/g, '') || '1', 10);

      let blokKey = rawBlok;
      if (rawBlok === 'D') {
        blokKey = houseNum % 2 === 0 ? 'D_GENAP' : 'D_GANJIL';
      } else if (!['A', 'C', 'E', 'F'].includes(rawBlok)) {
        blokKey = 'A';
      }
      return { blokKey, rawBlok, houseNoStr, houseNum };
    };

    const grouped: Record<string, any[]> = {
      A: [],
      C: [],
      D_GENAP: [],
      D_GANJIL: [],
      E: [],
      F: []
    };

    (metrics.wargaList || []).forEach((w: any) => {
      const { blokKey, rawBlok, houseNoStr, houseNum } = parseBlokAndNo(w.alamat || '');
      const targetKey = grouped[blokKey] ? blokKey : 'A';
      grouped[targetKey].push({
        id: w.id || w._id,
        nama: w.nama || w.username || 'Warga RT 01',
        alamat: w.alamat || `Blok ${rawBlok} No. ${houseNoStr}`,
        status: w.status || 'Tetap',
        role: w.role || 'warga',
        noHp: w.noHp || '-',
        jumlahAnggota: 1 + (Array.isArray(w.members) ? w.members.length : 0),
        blokKey: targetKey,
        rawBlok,
        houseNoStr,
        houseNum
      });
    });

    const allHouses: any[] = [];
    blokDefinitions.forEach(def => {
      const list = (grouped[def.key] || []).sort((a, b) => a.houseNum - b.houseNum);
      const cols = 4;
      list.forEach((h, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const maxRows = Math.max(Math.ceil(list.length / cols), 3);
        const pinX = def.zoneX + 3.5 + (col * ((def.zoneW - 7) / Math.max(cols - 1, 1)));
        const pinY = def.zoneY + 7 + (row * ((def.zoneH - 11) / Math.max(maxRows - 1, 1)));
        allHouses.push({
          ...h,
          blokLabel: def.label,
          coordinator: def.coordinator,
          color: def.color,
          pinX: Math.min(def.zoneX + def.zoneW - 2.5, Math.max(def.zoneX + 2.5, pinX)),
          pinY: Math.min(def.zoneY + def.zoneH - 3, Math.max(def.zoneY + 6, pinY))
        });
      });
    });

    return allHouses;
  }, [metrics.wargaList, blokDefinitions]);

  const filteredMapHouses = useMemo(() => {
    return mappedHouses.filter(h => {
      const matchBlok = selectedBlokFilter === 'ALL' || h.blokKey === selectedBlokFilter;
      const q = mapSearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        h.nama.toLowerCase().includes(q) ||
        h.alamat.toLowerCase().includes(q) ||
        h.houseNoStr.toLowerCase().includes(q) ||
        h.blokLabel.toLowerCase().includes(q);
      return matchBlok && matchSearch;
    });
  }, [mappedHouses, selectedBlokFilter, mapSearchQuery]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Title block skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        {/* Numerical Metrics Cards Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Demographics Bar Chart skeleton */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="h-5 w-56 bg-slate-200 rounded animate-pulse" />
          <div className="h-52 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Utama RT</h1>
          <p className="text-xs text-gray-500 mt-1">
            Metrik ringkas operasional, demografi warga, dan pelayanan Rukun Tetangga secara real-time.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-100 text-teal-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition pointer-events-auto cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          Perbarui Data
        </button>
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KK */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-400">Jumlah KK</span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {metrics.jumlahKK} <span className="text-xs text-gray-500 font-medium font-sans">Keluarga</span>
            </h2>
          </div>
        </div>

        {/* Total Warga */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3.5 rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-400">Jumlah Warga</span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {metrics.jumlahWarga} <span className="text-xs text-gray-500 font-medium font-sans">Orang</span>
            </h2>
          </div>
        </div>

        {/* Saldo Kas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-400">Total Saldo Kas RT</span>
            <h2 className="text-xl font-extrabold text-amber-700">{formatCurrency(metrics.saldoKas)}</h2>
          </div>
        </div>

        {/* Iuran Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-400">Iuran Bulan Ini</span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {metrics.iuranBulanIni.lunasPct}%{' '}
              <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                Lunas
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Demographics Bar Chart Widget (Distribusi Usia Seluruh Warga RT) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
                  Demografi Usia Warga (Semua Warga)
                </h3>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  {isAdministrativeRole ? 'Panel Pengurus & Admin RT' : 'Data Statistik Lingkungan RT'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Distribusi kelompok usia seluruh warga terdaftar ({totalDemographicPersons} jiwa dari {metrics.jumlahKK} Kepala Keluarga)
              </p>
            </div>
          </div>

          {onNavigateToWarga && (
            <button
              type="button"
              onClick={onNavigateToWarga}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center shrink-0"
            >
              <span>Buka Direktori Warga</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Bar Chart Column */}
          <div className="lg:col-span-7 h-64 w-full bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
            {(() => {
              const maxCount = Math.max(...demographicGroups.map(g => g.count), 4);
              const yTicks = [maxCount, Math.round(maxCount * 0.5), 0];
              return (
                <>
                  <div className="relative flex-1 flex items-end gap-3 sm:gap-6 pl-8 pr-3 pt-6 pb-1 border-b border-slate-200">
                    {/* Y-Axis & Gridlines */}
                    <div className="absolute inset-y-0 left-0 right-3 flex flex-col justify-between pointer-events-none pt-5 pb-1">
                      {yTicks.map((t, tIdx) => (
                        <div key={`web_ytick_${tIdx}`} className="flex items-center w-full">
                          <span className="w-7 text-right pr-2 text-[11px] font-semibold text-slate-400 tabular-nums">
                            {t}
                          </span>
                          <div className="flex-1 border-b border-dashed border-slate-200/80" />
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    {demographicGroups.map(item => {
                      const heightPct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 3) : 3;
                      const pct =
                        totalDemographicPersons > 0
                          ? Math.round((item.count / totalDemographicPersons) * 100)
                          : 0;
                      return (
                        <div
                          key={item.key}
                          onClick={onNavigateToWarga}
                          className={`relative z-10 flex-1 h-full flex flex-col items-center justify-end group ${
                            onNavigateToWarga ? 'cursor-pointer' : ''
                          }`}
                        >
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-2 z-20 bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg border border-slate-700 text-xs whitespace-nowrap">
                            <p className="font-extrabold text-teal-300">
                              {item.name} ({item.range})
                            </p>
                            <p className="font-bold mt-0.5">
                              {item.count} Warga <span className="text-slate-300 font-normal">({pct}%)</span>
                            </p>
                          </div>

                          <span className="text-xs font-extrabold text-slate-700 mb-1 tabular-nums">
                            {item.count}
                          </span>
                          <div
                            className="w-full max-w-[46px] rounded-t-xl transition-all duration-300 group-hover:brightness-110"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: item.fill,
                              opacity: item.count === 0 ? 0.25 : 1
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex items-center gap-3 sm:gap-6 pl-8 pr-3 pt-2">
                    {demographicGroups.map(item => (
                      <div key={`web_lbl_${item.key}`} className="flex-1 text-center">
                        <span className="text-xs font-bold text-slate-700 block leading-tight truncate">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Age Group Breakdown Cards Column */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {demographicGroups.map(group => {
              const pct =
                totalDemographicPersons > 0
                  ? Math.round((group.count / totalDemographicPersons) * 100)
                  : 0;
              return (
                <div
                  key={group.key}
                  onClick={onNavigateToWarga}
                  className={`p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 transition-all flex flex-col justify-between ${
                    onNavigateToWarga ? 'cursor-pointer hover:shadow-xs' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: group.fill }}
                      />
                      <span className="text-xs font-extrabold text-slate-800">{group.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{group.range}</span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">{group.count}</span>
                    <span className="text-xs font-extrabold text-teal-700 tabular-nums">{pct}%</span>
                  </div>

                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: group.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Peta Lingkungan Interaktif (Lokasi Rumah Warga Per Blok) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
                  Peta Lingkungan Interaktif RT 01 / RW 21
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {mappedHouses.length} Titik Rumah Terpetakan
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Sebaran lokasi hunian Kepala Keluarga per blok (Blok A, C, D Genap, D Ganjil, E, dan F) beserta Koordinator Blok.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={e => setMapSearchQuery(e.target.value)}
                placeholder="Cari warga / nomor rumah..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-700"
              />
            </div>

            {/* Map Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMapViewMode('kavling')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  mapViewMode === 'kavling'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3 h-3" />
                Denah Blok
              </button>
              <button
                type="button"
                onClick={() => setMapViewMode('osm')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  mapViewMode === 'osm'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Navigation className="w-3 h-3" />
                Peta Wilayah
              </button>
            </div>
          </div>
        </div>

        {/* Filter Blok Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedBlokFilter('ALL');
                setSelectedHouse(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                selectedBlokFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Blok ({mappedHouses.length})
            </button>
            {blokDefinitions.map(b => {
              const count = mappedHouses.filter(h => h.blokKey === b.key).length;
              const isSelected = selectedBlokFilter === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => {
                    setSelectedBlokFilter(isSelected ? 'ALL' : b.key);
                    setSelectedHouse(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : b.color }}
                  />
                  <span>{b.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMapZoom(z => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Perkecil Peta"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-extrabold text-slate-700 px-2 tabular-nums">
              {Math.round(mapZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setMapZoom(z => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Perbesar Peta"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMapZoom(1);
                setSelectedBlokFilter('ALL');
                setSelectedHouse(null);
                setMapSearchQuery('');
              }}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Reset Tampilan Peta"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Map Canvas + Detail Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Map Viewport */}
          <div className="lg:col-span-8 relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden min-h-[380px] sm:min-h-[430px] flex items-center justify-center">
            {mapViewMode === 'osm' && (
              <iframe
                title="Peta Wilayah Lingkungan RT 01"
                src="https://www.openstreetmap.org/export/embed.html?bbox=106.8180%2C-6.2350%2C106.8320%2C-6.2240&amp;layer=mapnik"
                className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
              />
            )}

            <div
              className="relative w-full h-[380px] sm:h-[430px] transition-transform duration-300 ease-out select-none"
              style={{
                transform: `scale(${mapZoom})`,
                transformOrigin: 'center center',
                backgroundImage:
                  mapViewMode === 'kavling'
                    ? 'radial-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px)'
                    : undefined,
                backgroundSize: '20px 20px'
              }}
            >
              {/* Main Roads & Community Landmarks SVG */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {/* Horizontal & Vertical Neighborhood Roads */}
                <rect x="4" y="48" width="92" height="4" rx="1" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.3" />
                <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(226, 232, 240, 0.45)" strokeWidth="0.35" strokeDasharray="1.5 1.5" />
                <rect x="34.5" y="8" width="2" height="84" rx="0.5" fill="rgba(30, 41, 59, 0.75)" />
                <rect x="63.5" y="8" width="2" height="84" rx="0.5" fill="rgba(30, 41, 59, 0.75)" />

                {/* Block Zones */}
                {blokDefinitions.map(def => {
                  const isDimmed = selectedBlokFilter !== 'ALL' && selectedBlokFilter !== def.key;
                  return (
                    <g key={def.key} opacity={isDimmed ? 0.25 : 0.92}>
                      <rect
                        x={def.zoneX}
                        y={def.zoneY}
                        width={def.zoneW}
                        height={def.zoneH}
                        rx="2.2"
                        fill="rgba(15, 23, 42, 0.78)"
                        stroke={def.color}
                        strokeWidth={selectedBlokFilter === def.key ? '0.9' : '0.45'}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Block Zone Headers */}
              {blokDefinitions.map(def => {
                const isDimmed = selectedBlokFilter !== 'ALL' && selectedBlokFilter !== def.key;
                return (
                  <button
                    key={`header_${def.key}`}
                    type="button"
                    onClick={() => setSelectedBlokFilter(selectedBlokFilter === def.key ? 'ALL' : def.key)}
                    style={{
                      left: `${def.zoneX + 1}%`,
                      top: `${def.zoneY + 1}%`,
                      borderColor: def.color
                    }}
                    className={`absolute z-10 px-2 py-0.5 rounded-md bg-slate-900/90 border text-left transition cursor-pointer ${
                      isDimmed ? 'opacity-30' : 'opacity-100 hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-[10px] font-extrabold text-white leading-tight">{def.label}</p>
                    <p className="text-[8px] font-semibold text-teal-300 leading-tight">
                      Koord: {def.coordinator}
                    </p>
                  </button>
                );
              })}

              {/* Center Road Label & Pos Kamling Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none bg-slate-950/90 border border-teal-500/40 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-teal-300 tracking-wider uppercase shadow-sm">
                Jl. Utama Lingkungan RT 01 / RW 21
              </div>

              {/* House Markers */}
              {filteredMapHouses.map(house => {
                const isActive = selectedHouse?.id === house.id;
                return (
                  <button
                    key={house.id}
                    type="button"
                    onClick={() => setSelectedHouse(house)}
                    style={{
                      left: `${house.pinX}%`,
                      top: `${house.pinY}%`,
                      backgroundColor: isActive ? '#ffffff' : house.color,
                      color: isActive ? house.color : '#ffffff',
                      borderColor: isActive ? house.color : 'rgba(255,255,255,0.85)'
                    }}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-lg border-2 shadow-md flex items-center justify-center text-[9px] font-black transition-all cursor-pointer ${
                      isActive ? 'scale-125 z-30 ring-4 ring-teal-400/40' : 'hover:scale-125 hover:z-30'
                    }`}
                    title={`${house.nama} (${house.alamat})`}
                  >
                    {house.houseNoStr}
                    {/* Quick Hover Tooltip */}
                    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl border border-slate-700 z-40">
                      {house.nama} · {house.alamat}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Map Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-xs border border-slate-800 px-3.5 py-2 rounded-xl text-[10px] text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                {blokDefinitions.map(b => (
                  <span key={`leg_${b.key}`} className="inline-flex items-center gap-1 font-bold">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                    {b.label}
                  </span>
                ))}
              </div>
              <span className="text-teal-300 font-semibold">Klik nomor rumah untuk detail KK</span>
            </div>
          </div>

          {/* Right Panel: Selected House / Block Summary */}
          <div className="lg:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            {selectedHouse ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span
                      className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white mb-1"
                      style={{ backgroundColor: selectedHouse.color }}
                    >
                      {selectedHouse.blokLabel} · No. {selectedHouse.houseNoStr}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{selectedHouse.nama}</h4>
                    <p className="text-xs font-semibold text-slate-500">{selectedHouse.alamat}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status Warga</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5 capitalize">{selectedHouse.status}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Anggota KK</p>
                    <p className="text-xs font-extrabold text-teal-700 mt-0.5">{selectedHouse.jumlahAnggota} Jiwa</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Koordinator {selectedHouse.blokLabel}</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      Bpk. {selectedHouse.coordinator}
                    </p>
                  </div>
                </div>

                {/* Other Houses in Same Block */}
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold text-slate-700">
                    Tetangga Satu Blok ({selectedHouse.blokLabel})
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {mappedHouses
                      .filter(h => h.blokKey === selectedHouse.blokKey)
                      .map(h => (
                        <button
                          key={`side_${h.id}`}
                          type="button"
                          onClick={() => setSelectedHouse(h)}
                          className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            h.id === selectedHouse.id
                              ? 'bg-teal-50 border-teal-300 font-extrabold text-teal-900'
                              : 'bg-white border-slate-200/70 hover:border-teal-200 text-slate-700 font-semibold'
                          }`}
                        >
                          <span className="truncate">{h.nama}</span>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">
                            No. {h.houseNoStr}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Ringkasan Koordinator & Populasi Blok
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pilih salah satu blok atau klik titik rumah pada peta untuk melihat detail Kepala Keluarga.
                  </p>
                </div>

                <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                  {blokDefinitions.map(b => {
                    const housesInBlok = mappedHouses.filter(h => h.blokKey === b.key);
                    const totalJiwaBlok = housesInBlok.reduce((acc, cur) => acc + (cur.jumlahAnggota || 1), 0);
                    return (
                      <button
                        key={`summary_${b.key}`}
                        type="button"
                        onClick={() => setSelectedBlokFilter(selectedBlokFilter === b.key ? 'ALL' : b.key)}
                        className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedBlokFilter === b.key
                            ? 'bg-teal-50/90 border-teal-400 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-8 rounded-full shrink-0"
                            style={{ backgroundColor: b.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{b.label}</p>
                            <p className="text-[10px] font-semibold text-slate-500 truncate">
                              Koordinator: <span className="text-slate-700 font-bold">{b.coordinator}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-black text-slate-900">{housesInBlok.length} KK</p>
                          <p className="text-[10px] font-bold text-teal-700">{totalJiwaBlok} Warga</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {onNavigateToWarga && (
              <button
                type="button"
                onClick={onNavigateToWarga}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Kelola Data Lengkap Warga</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis and Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rincian Kas & Pos Keuangan */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              Pos Keuangan Kas
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Buku Kas RT</span>
          </div>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition border border-gray-50">
              <span className="text-xs text-gray-600 font-medium">Kas Operasional RT</span>
              <span className="text-xs font-bold text-gray-900">{formatCurrency(metrics.kasDetail.kasRT)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition border border-gray-50">
              <span className="text-xs text-gray-600 font-medium font-sans">Kas Amalan Kematian</span>
              <span className="text-xs font-bold text-gray-900">
                {formatCurrency(metrics.kasDetail.danaKematian)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition border border-gray-50">
              <span className="text-xs text-gray-600 font-medium">Dana Sosial Kemasyarakatan</span>
              <span className="text-xs font-bold text-gray-900">{formatCurrency(metrics.kasDetail.danaSosial)}</span>
            </div>
          </div>
        </div>

        {/* Iuran & partisipasi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Partisipasi Iuran Warga
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Bulan Ini</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Partisipasi Bayar</span>
                  <span>
                    {metrics.iuranBulanIni.lunasCount} dari {metrics.iuranBulanIni.totalIuranCount} Terdaftar
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${metrics.iuranBulanIni.lunasPct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-emerald-50/50 border border-emerald-100/40 p-3 rounded-xl flex items-center justify-between">
              <span>Dana Terkumpul Bulan Ini:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(metrics.iuranBulanIni.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Pengaduan Aktif */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Laporan Pengaduan Aktif ({metrics.pengaduanAktif.length})
            </h3>
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">
              Butuh Penanganan
            </span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
            {metrics.pengaduanAktif.map((l, index) => (
              <div key={index} className="p-3 bg-red-50/40 border border-red-100/55 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-gray-800 line-clamp-1">{l.judul}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      l.status === 'diproses' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">{l.deskripsi}</p>
                <div className="flex justify-between border-t border-red-100/30 pt-1.5 text-[9px] text-gray-400 font-medium">
                  <span>Oleh: {l.userName || l.nama || 'Warga'}</span>
                  <span>Kategori: {l.kategori || 'Kebersihan'}</span>
                </div>
              </div>
            ))}
            {metrics.pengaduanAktif.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-gray-700">Semua Laporan Selesai</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Tidak ada laporan warga yang berstatus aktif/unresolved.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Agenda Kegiatan & Acara */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 text-teal-700">
              <Calendar className="w-4 h-4 text-teal-600" />
              Agenda & Acara Terdekat
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Kalender Kegiatan</span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
            {metrics.agendaUpcoming.map((ac, index) => {
              const dt = new Date(ac.time || ac.date);
              const day = dt.toLocaleDateString('id-ID', { day: 'numeric' });
              const month = dt.toLocaleDateString('id-ID', { month: 'short' });
              return (
                <div
                  key={index}
                  className="flex gap-3.5 items-center p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition border border-gray-100/50"
                >
                  <div className="w-12 h-12 bg-teal-600 text-white rounded-lg flex flex-col items-center justify-center font-bold font-sans shrink-0">
                    <span className="text-base leading-none">{day}</span>
                    <span className="text-[9px] leading-none uppercase mt-0.5">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{ac.title || ac.name}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight">
                      {ac.desc || ac.message || 'Rapat koordinasi warga'}
                    </p>
                  </div>
                </div>
              );
            })}
            {metrics.agendaUpcoming.length === 0 && (
              <div className="text-center py-8 text-gray-400 space-y-2">
                <Calendar className="w-9 h-9 mx-auto text-gray-300" />
                <p className="text-xs font-medium">Belum ada agenda terdekat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Etalase Promosi UMKM Warga (Gambar Slide & Kartu) */}
      {umkmList.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Iklan & Etalase UMKM Warga</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Dukung perekonomian warga dengan berbelanja di usaha lokal tetangga kita yang telah diverifikasi RT.
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {umkmList.filter((u: any) => !u.status || u.status === 'disetujui').length} Usaha Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {umkmList
              .filter((item: any) => !item.status || item.status === 'disetujui')
              .map((item, idx) => {
                const fallbackImgs = [
                  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
                  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
                ];
                const bannerImg = item.bannerUrl || fallbackImgs[idx % fallbackImgs.length];
                const rawWa = (item.kontak || item.phone || '').replace(/[^0-9]/g, '');
                const waNum = rawWa.startsWith('0') ? '62' + rawWa.slice(1) : rawWa;
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white border border-gray-100 hover:border-teal-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={bannerImg}
                        alt={item.nama || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <p className="text-[10px] text-teal-200 font-semibold truncate">
                          {item.category || 'UMKM'} · {item.alamat || item.owner}
                        </p>
                        <h4 className="text-sm font-extrabold truncate">{item.nama || item.name}</h4>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      {Array.isArray(item.products) && item.products.length > 0 ? (
                        <div className="space-y-1.5">
                          {item.products.slice(0, 2).map((p: any, pIdx: number) => (
                            <div
                              key={p.id || pIdx}
                              className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg"
                            >
                              <span className="font-medium text-slate-700 truncate">{p.namaProduk}</span>
                              <span className="font-bold text-teal-700 shrink-0">
                                {formatCurrency(Number(p.harga) || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        {waNum ? (
                          <a
                            href={`https://wa.me/${waNum}?text=Halo%20saya%20warga%20RT%20tertarik%20dengan%20usaha%20${encodeURIComponent(
                              item.nama || item.name
                            )}%20di%20aplikasi%20Guyub%20Rukun.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white text-[11px] font-black py-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Hubungi WA ({item.kontak || item.phone})
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No kontak tidak tersedia</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
