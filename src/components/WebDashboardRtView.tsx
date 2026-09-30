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
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

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

    const addAge = (age: number) => {
      if (age < 0) return;
      if (age <= 4) balita++;
      else if (age <= 12) anak++;
      else if (age <= 20) remaja++;
      else dewasa++;
    };

    users
      .filter(u => u.role !== 'developer')
      .forEach(u => {
        addAge(resolveAge(u.umur, u.tglLahir));
        if (Array.isArray(u.members)) {
          u.members.forEach((m: any) => addAge(resolveAge(m.age, m.tglLahir)));
        }
      });

    const totalWithAge = balita + anak + remaja + dewasa;
    return {
      balita,
      anak,
      remaja,
      dewasa,
      totalWithAge,
      groups: [
        { key: 'balita', name: 'Balita', range: '0 - 4 Thn', count: balita, fill: '#3b82f6' },
        { key: 'anak', name: 'Anak', range: '5 - 12 Thn', count: anak, fill: '#10b981' },
        { key: 'remaja', name: 'Remaja', range: '13 - 20 Thn', count: remaja, fill: '#8b5cf6' },
        { key: 'dewasa', name: 'Dewasa', range: '> 20 Thn', count: dewasa, fill: '#f97316' }
      ]
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/dashboard');
      const data = await res.json();

      let nextDemographics = data?.metrics?.demographics;
      if (!nextDemographics || !Array.isArray(nextDemographics.groups) || nextDemographics.totalWithAge === 0) {
        const wargaRes = await apiFetch('/api/warga?limit=0&summary=1');
        if (wargaRes.ok) {
          const wargaJson = await wargaRes.json();
          nextDemographics = computeDemographicsFromUsers(wargaJson.users || []);
        }
      }

      if (data.metrics) {
        setMetrics({
          ...data.metrics,
          demographics: nextDemographics || {
            balita: 0,
            anak: 0,
            remaja: 0,
            dewasa: 0,
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
      { key: 'dewasa', name: 'Dewasa', range: '> 20 Thn', count: metrics.demographics?.dewasa || 0, fill: '#f97316' }
    ];
  }, [metrics.demographics]);

  const totalDemographicPersons = useMemo(() => {
    return demographicGroups.reduce((acc, g) => acc + (Number(g.count) || 0), 0);
  }, [demographicGroups]);

  const isAdministrativeRole = ['admin', 'developer', 'bendahara', 'sekretaris', 'pengurus'].includes(
    user?.role || 'admin'
  );

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
          <div className="lg:col-span-7 h-64 w-full bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={demographicGroups}
                margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
                barSize={44}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const item = payload[0].payload as DemographicGroup;
                      const pct =
                        totalDemographicPersons > 0
                          ? Math.round((item.count / totalDemographicPersons) * 100)
                          : 0;
                      return (
                        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs">
                          <p className="font-extrabold text-teal-300">
                            {item.name} ({item.range})
                          </p>
                          <p className="font-bold mt-1">
                            {item.count} Warga <span className="text-slate-300 font-normal">({pct}%)</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {demographicGroups.map(entry => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
