import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Store,
  MessageCircle,
  BarChart3,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';

export const WebDashboardRtView = () => {
  const [loading, setLoading] = useState(true);
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [chartMode, setChartMode] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [metrics, setMetrics] = useState({
    jumlahKK: 0,
    jumlahWarga: 0,
    saldoKas: 0,
    kasDetail: { kasRT: 0, danaKematian: 0, danaSosial: 0 },
    iuranBulanIni: { lunasPct: 0, totalIuranCount: 0, lunasCount: 0, totalAmount: 0 },
    pengaduanAktif: [] as any[],
    agendaUpcoming: [] as any[],
    monthlyTrend: [] as any[],
    wargaList: [] as any[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/dashboard');
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Analysis and Details Row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-50">
                  <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden animate-pulse" />
              </div>
              <div className="h-10 bg-slate-50 border border-slate-50 p-3 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3.5 items-center p-3 bg-slate-50/50 rounded-xl border border-gray-50 animate-pulse">
                  <div className="w-11 h-11 bg-slate-200 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-full bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <p className="text-xs text-gray-500 mt-1">Metrik ringkas operasional dan pelayanan warga Rukun Tetangga secara real-time.</p>
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
            <h2 className="text-2xl font-extrabold text-gray-900">{metrics.jumlahKK} <span className="text-xs text-gray-500 font-medium font-sans">Keluarga</span></h2>
          </div>
        </div>

        {/* Total Warga */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200">
          <div className="p-3.5 rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-400">Jumlah Warga</span>
            <h2 className="text-2xl font-extrabold text-gray-900">{metrics.jumlahWarga} <span className="text-xs text-gray-500 font-medium font-sans">Orang</span></h2>
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
            <h2 className="text-2xl font-extrabold text-gray-900">{metrics.iuranBulanIni.lunasPct}% <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Lunas</span></h2>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart: Tren Keuangan Kas RT */}
      {(() => {
        const trendData = metrics.monthlyTrend && metrics.monthlyTrend.length > 0
          ? metrics.monthlyTrend
          : [
              { bulan: 'Mar', pemasukan: 1200000, pengeluaran: 450000, surplus: 750000 },
              { bulan: 'Apr', pemasukan: 1850000, pengeluaran: 620000, surplus: 1230000 },
              { bulan: 'Mei', pemasukan: 1500000, pengeluaran: 800000, surplus: 700000 },
              { bulan: 'Jun', pemasukan: 2100000, pengeluaran: 550000, surplus: 1550000 },
              { bulan: 'Jul', pemasukan: 1950000, pengeluaran: 720000, surplus: 1230000 },
              { bulan: 'Agu', pemasukan: 2400000, pengeluaran: 600000, surplus: 1800000 }
            ];

        const totalPemasukan = trendData.reduce((acc: number, curr: any) => acc + (curr.pemasukan || 0), 0);
        const totalPengeluaran = trendData.reduce((acc: number, curr: any) => acc + (curr.pengeluaran || 0), 0);
        const totalSurplus = totalPemasukan - totalPengeluaran;

        const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
            const pVal = payload.find((item: any) => item.dataKey === 'pemasukan')?.value || 0;
            const kVal = payload.find((item: any) => item.dataKey === 'pengeluaran')?.value || 0;
            const sVal = pVal - kVal;

            return (
              <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-2.5 min-w-[200px] backdrop-blur-md">
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>Bulan {label}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${sVal >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                    {sVal >= 0 ? 'Surplus Kas' : 'Defisit Kas'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      Pemasukan:
                    </span>
                    <span className="font-mono">Rp {pVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0"></span>
                      Pengeluaran:
                    </span>
                    <span className="font-mono">Rp {kVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-slate-100 font-extrabold">
                    <span>Selisih (Net):</span>
                    <span className={`font-mono ${sVal >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {sVal >= 0 ? '+' : ''}Rp {sVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        };

        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base">Grafik Tren Pengeluaran vs Pemasukan Kas RT</h3>
                </div>
                <p className="text-xs text-gray-500">Visualisasi interaktif rasio arus kas bulanan untuk evaluasi kesehatan keuangan pengurus.</p>
              </div>

              {/* Chart View Toggle Controls */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl self-start sm:self-auto border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setChartMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Semua Bar
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('pemasukan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartMode === 'pemasukan' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('pengeluaran')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartMode === 'pengeluaran' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            {/* Summary KPI Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Pemasukan (6 Bln)</span>
                  <span className="text-sm font-extrabold text-emerald-900 font-mono">Rp {totalPemasukan.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Total Pengeluaran (6 Bln)</span>
                  <span className="text-sm font-extrabold text-rose-900 font-mono">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2 bg-rose-500 text-white rounded-lg">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${totalSurplus >= 0 ? 'bg-teal-50/60 border-teal-100 text-teal-900' : 'bg-amber-50/60 border-amber-100 text-amber-900'}`}>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">Arus Kas Bersih (Surplus)</span>
                  <span className="text-sm font-extrabold font-mono">{totalSurplus >= 0 ? '+' : ''}Rp {totalSurplus.toLocaleString('id-ID')}</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase ${totalSurplus >= 0 ? 'bg-teal-600 text-white' : 'bg-amber-600 text-white'}`}>
                  {totalSurplus >= 0 ? 'Kas Sehat' : 'Defisit'}
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="w-full h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="bulan" 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString()}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(value) => <span className="text-xs font-bold text-gray-700 capitalize">{value}</span>}
                  />
                  {(chartMode === 'all' || chartMode === 'pemasukan') && (
                    <Bar 
                      name="Pemasukan Kas" 
                      dataKey="pemasukan" 
                      fill="#10B981" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={40}
                    />
                  )}
                  {(chartMode === 'all' || chartMode === 'pengeluaran') && (
                    <Bar 
                      name="Pengeluaran Kas" 
                      dataKey="pengeluaran" 
                      fill="#F43F5E" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={40}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

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
              <span className="text-xs font-bold text-gray-900">{formatCurrency(metrics.kasDetail.danaKematian)}</span>
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
                  <span>{metrics.iuranBulanIni.lunasCount} dari {metrics.iuranBulanIni.totalIuranCount} Terdaftar</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${metrics.iuranBulanIni.lunasPct}%` }} />
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
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">Butuh Penanganan</span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
            {metrics.pengaduanAktif.map((l, index) => (
              <div key={index} className="p-3 bg-red-50/40 border border-red-100/55 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-gray-800 line-clamp-1">{l.judul}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${l.status === 'diproses' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
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
                <p className="text-[10px] text-gray-400 mt-0.5">Tidak ada laporan warga yang berstatus aktif/unresolved.</p>
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
                <div key={index} className="flex gap-3.5 items-center p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition border border-gray-100/50">
                  <div className="w-12 h-12 bg-teal-600 text-white rounded-lg flex flex-col items-center justify-center font-bold font-sans shrink-0">
                    <span className="text-base leading-none">{day}</span>
                    <span className="text-[9px] leading-none uppercase mt-0.5">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{ac.title || ac.name}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight">{ac.desc || ac.message || 'Rapat koordinasi warga'}</p>
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

      {/* Etalase Promosi UMKM Warga */}
      {umkmList.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Etalase Sponsor & Iklan UMKM Mandiri Warga</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Dukung perekonomian warga dengan berbelanja di usaha lokal tetangga kita.</p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/50 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Iklan Warga RT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {umkmList.map((item) => (
              <div key={item.id} className="group relative bg-gray-50/50 hover:bg-white border border-gray-100/80 hover:border-teal-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] bg-teal-50 border border-teal-100 text-teal-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.category || 'Usaha Lokal'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">ID: {item.id.slice(-4)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">{item.nama}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-3 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100/70 flex items-center justify-between">
                  {item.kontak ? (
                    <a
                      href={`https://wa.me/${item.kontak.replace(/[^0-9]/g, '')}?text=Halo%20saya%20warga%20RT%20tertarik%20dengan%20usaha%20${encodeURIComponent(item.nama)}%20di%20aplikasi%20Guyub%20Rukun.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white text-[11px] font-black py-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Hubungi Toko (WA)
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">No kontak tidak tersedia</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
