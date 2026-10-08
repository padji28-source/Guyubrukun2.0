import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

// --- Ikon Lengkap & Modern ---
const Icons = {
  back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>,
  wallet: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  trendUp: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  trendDown: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  transfer: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  edit: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  delete: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  chart: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  pie: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
  line: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
  calendar: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  filter: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  chevronDown: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  chevronUp: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
};

let cachedKasData: any[] | null = null;
let cachedAllKasData: any[] | null = null;

// Warna Pos Kas
const CATEGORY_COLORS: { [key: string]: string } = {
  'Kas RT': '#0d9488',       // Teal-600
  'Dana Kematian': '#f43f5e', // Rose-500
  'Dana Sosial': '#f59e0b',   // Amber-500
  'Lainnya': '#6366f1'        // Indigo-500
};

export const MobileKas = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedKasData || []);
  const [allKasData, setAllKasData] = useState<any[]>(cachedAllKasData || []);
  const [loading, setLoading] = useState(!cachedKasData);
  const [type, setType] = useState('Masuk');
  const [category, setCategory] = useState('Kas RT');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  // Pagination and search states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Saldo Balances
  const [balances, setBalances] = useState<{ [key: string]: number }>({
    "Kas RT": 0,
    "Dana Kematian": 0,
    "Dana Sosial": 0
  });

  // Chart UI Controls
  const [showChartSection, setShowChartSection] = useState<boolean>(true);
  const [chartViewMode, setChartViewMode] = useState<'tren' | 'perbandingan' | 'pos'>('tren');
  const [chartPeriod, setChartPeriod] = useState<'all' | 'month' | '3months' | '6months' | 'year'>('all');
  const [chartCategoryFilter, setChartCategoryFilter] = useState<string>('all');

  const isAdminOrBendahara = ['admin', 'developer', 'bendahara'].includes(currentUser?.role);

  // Fetch paginated list
  const fetchData = async () => {
    try {
      const res = await apiFetch(`/api/data/kas?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.pagination) {
        cachedKasData = json.data || [];
        setData(cachedKasData!);
        setTotalPages(json.pagination.pages || 1);
        setTotalElements(json.pagination.total || 0);
      } else {
        cachedKasData = json.data || [];
        setData(cachedKasData!);
        setTotalPages(1);
        setTotalElements(cachedKasData!.length);
      }
      
      if (json.balances) {
        setBalances(json.balances);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // Fetch lightweight aggregated transactions for comprehensive historical charting
  const fetchAllKasHistory = async () => {
    try {
      const res = await apiFetch('/api/data/kas/chart');
      const json = await res.json();
      const list = json.items || json.data || [];
      if (Array.isArray(list)) {
        cachedAllKasData = list;
        setAllKasData(list);
      }
      if (json.balances) {
        setBalances(json.balances);
      }
    } catch (e) {
      console.error("Gagal memuat histori transaksi kas lengkap:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  useEffect(() => {
    fetchAllKasHistory();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Optimistic Update
    const nominal = parseInt(amount.replace(/\D/g, '') || '0');
    const tempId = 'temp-' + Date.now();
    const newEntry = {
      id: tempId,
      type,
      category,
      amount: nominal,
      message,
      name: currentUser?.nama,
      createdAt: new Date().toISOString()
    };
    
    setData(prev => [newEntry, ...prev]);
    setAllKasData(prev => [newEntry, ...prev]);
    setAmount('');
    setMessage('');

    try {
      await apiFetch('/api/data/kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          category,
          amount: nominal, 
          message,
          name: currentUser?.nama
        })
      });
      fetchData();
      fetchAllKasHistory();
    } catch(e) { 
      console.error(e);
      setData(prev => prev.filter(item => item.id !== tempId));
      setAllKasData(prev => prev.filter(item => item.id !== tempId));
      fetchData();
      fetchAllKasHistory();
    }
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => setShowConfirmDelete(id);
  const cancelDelete = () => setShowConfirmDelete(null);

  const confirmDelete = async () => {
    if (!showConfirmDelete) return;
    const deletedId = showConfirmDelete;
    
    // Optimistic delete
    setData(prev => prev.filter(item => item.id !== deletedId));
    setAllKasData(prev => prev.filter(item => item.id !== deletedId));
    setShowConfirmDelete(null);

    try {
      await apiFetch(`/api/data/kas/${deletedId}`, { method: 'DELETE' });
      fetchData();
      fetchAllKasHistory();
    } catch(e) { 
      console.error(e); 
      fetchData(); 
      fetchAllKasHistory();
    }
  };

  const getSaldo = (cat: string) => {
    return balances[cat] || 0;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nominal = parseInt(transferAmount.replace(/\D/g, '') || '0');
    if (nominal <= 0) {
      return;
    }
    if (nominal > getSaldo('Kas RT')) {
      return;
    }
    
    // Optimistic Update
    const tempId1 = 'temp-out-' + Date.now();
    const tempId2 = 'temp-in-' + Date.now();
    
    const entryOut = { id: tempId1, type: 'Keluar', category: 'Kas RT', amount: nominal, message: 'Transfer ke Dana Sosial', name: currentUser?.nama, createdAt: new Date().toISOString() };
    const entryIn = { id: tempId2, type: 'Masuk', category: 'Dana Sosial', amount: nominal, message: 'Transfer dari Kas RT', name: currentUser?.nama, createdAt: new Date().toISOString() };
    
    setData(prev => [entryOut, entryIn, ...prev]);
    setAllKasData(prev => [entryOut, entryIn, ...prev]);
    setTransferAmount('');
    setShowTransfer(false);

    try {
      await apiFetch('/api/data/kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Keluar', category: 'Kas RT', amount: nominal, message: 'Transfer ke Dana Sosial', name: currentUser?.nama })
      });
      await apiFetch('/api/data/kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Masuk', category: 'Dana Sosial', amount: nominal, message: 'Transfer dari Kas RT', name: currentUser?.nama })
      });
      fetchData();
      fetchAllKasHistory();
    } catch(e) { 
      console.error(e);
      setData(prev => prev.filter(item => item.id !== tempId1 && item.id !== tempId2));
      setAllKasData(prev => prev.filter(item => item.id !== tempId1 && item.id !== tempId2));
      fetchData();
      fetchAllKasHistory();
    }
  };

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const compactFormatter = new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' });

  // ==========================================
  // PENGOLAHAN DATA GRAFIK RIWAYAT TRANSAKSI
  // ==========================================
  const chartAnalytics = useMemo(() => {
    const rawList = allKasData.length > 0 ? allKasData : data;
    if (!rawList || rawList.length === 0) {
      return {
        timeSeriesData: [],
        categoryData: [],
        totalMasuk: 0,
        totalKeluar: 0,
        netCashflow: 0,
        totalTransaksi: 0,
        rataRataMasuk: 0,
        rataRataKeluar: 0
      };
    }

    const now = new Date();
    
    // 1. Filter rentang waktu & kategori
    const filtered = rawList.filter(item => {
      // Filter Kategori Pos
      if (chartCategoryFilter !== 'all') {
        const itemCat = item.category || 'Kas RT';
        if (itemCat !== chartCategoryFilter) return false;
      }

      // Filter Waktu
      if (chartPeriod === 'all') return true;

      const itemDate = new Date(item.createdAt || item.date || Date.now());
      if (isNaN(itemDate.getTime())) return true;

      if (chartPeriod === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (chartPeriod === '3months') {
        const past = new Date();
        past.setDate(now.getDate() - 90);
        return itemDate >= past;
      } else if (chartPeriod === '6months') {
        const past = new Date();
        past.setDate(now.getDate() - 180);
        return itemDate >= past;
      } else if (chartPeriod === 'year') {
        const past = new Date();
        past.setFullYear(now.getFullYear() - 1);
        return itemDate >= past;
      }
      return true;
    });

    // 2. Metrik Ringkasan (KPIs)
    let totalMasuk = 0;
    let totalKeluar = 0;
    let countMasuk = 0;
    let countKeluar = 0;

    filtered.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'Masuk') {
        totalMasuk += amt;
        countMasuk++;
      } else if (item.type === 'Keluar') {
        totalKeluar += amt;
        countKeluar++;
      }
    });

    const netCashflow = totalMasuk - totalKeluar;
    const totalTransaksi = filtered.length;
    const rataRataMasuk = countMasuk > 0 ? Math.round(totalMasuk / countMasuk) : 0;
    const rataRataKeluar = countKeluar > 0 ? Math.round(totalKeluar / countKeluar) : 0;

    // 3. Pengelompokan Time Series Chronological
    // Urutkan transaksi dari terlama ke terbaru
    const sortedChronological = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      return dateA - dateB;
    });

    // Tentukan apakah pengelompokan berdasarkan Hari atau Bulan
    const isDaily = chartPeriod === 'month' || (filtered.length <= 15 && chartPeriod !== 'all' && chartPeriod !== 'year');

    const groupedMap = new Map<string, { label: string, sortKey: number, Masuk: number, Keluar: number, Net: number, SaldoKumulatif: number }>();
    
    let runningBalance = 0;

    sortedChronological.forEach(item => {
      const d = new Date(item.createdAt || item.date || Date.now());
      let groupKey = '';
      let displayLabel = '';
      let sortKey = d.getTime();

      if (isDaily) {
        groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        displayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      } else {
        groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        displayLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      }

      const amt = Number(item.amount) || 0;
      if (item.type === 'Masuk') {
        runningBalance += amt;
      } else if (item.type === 'Keluar') {
        runningBalance -= amt;
      }

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          label: displayLabel,
          sortKey,
          Masuk: 0,
          Keluar: 0,
          Net: 0,
          SaldoKumulatif: runningBalance
        });
      }

      const group = groupedMap.get(groupKey)!;
      if (item.type === 'Masuk') {
        group.Masuk += amt;
      } else if (item.type === 'Keluar') {
        group.Keluar += amt;
      }
      group.Net = group.Masuk - group.Keluar;
      group.SaldoKumulatif = runningBalance;
    });

    const timeSeriesData = Array.from(groupedMap.values());

    // 4. Pengelompokan Kategori Pos Kas (untuk Pie/Donut Chart)
    const categoryTotals: { [key: string]: { total: number, masuk: number, keluar: number } } = {
      'Kas RT': { total: 0, masuk: 0, keluar: 0 },
      'Dana Kematian': { total: 0, masuk: 0, keluar: 0 },
      'Dana Sosial': { total: 0, masuk: 0, keluar: 0 }
    };

    filtered.forEach(item => {
      const cat = item.category || 'Kas RT';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, masuk: 0, keluar: 0 };
      }
      const amt = Number(item.amount) || 0;
      categoryTotals[cat].total += amt;
      if (item.type === 'Masuk') {
        categoryTotals[cat].masuk += amt;
      } else {
        categoryTotals[cat].keluar += amt;
      }
    });

    const grandTotalVolume = Object.values(categoryTotals).reduce((sum, item) => sum + item.total, 0);

    const categoryData = Object.keys(categoryTotals).map(catKey => {
      const info = categoryTotals[catKey];
      return {
        name: catKey,
        value: info.total,
        masuk: info.masuk,
        keluar: info.keluar,
        percentage: grandTotalVolume > 0 ? ((info.total / grandTotalVolume) * 100).toFixed(1) : '0',
        color: CATEGORY_COLORS[catKey] || '#6366f1'
      };
    }).filter(cat => cat.value > 0);

    return {
      timeSeriesData,
      categoryData,
      totalMasuk,
      totalKeluar,
      netCashflow,
      totalTransaksi,
      rataRataMasuk,
      rataRataKeluar
    };
  }, [allKasData, data, chartPeriod, chartCategoryFilter]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 text-xs min-w-[170px] z-50">
          <p className="font-extrabold text-slate-200 text-xs mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-normal">Riwayat Kas</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const color = entry.color || entry.stroke || entry.fill;
              const isPemasukan = entry.name === 'Masuk' || entry.name === 'Pemasukan';
              const isPengeluaran = entry.name === 'Keluar' || entry.name === 'Pengeluaran';
              return (
                <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                    {entry.name}:
                  </span>
                  <span className={`font-bold ${isPemasukan ? 'text-emerald-400' : isPengeluaran ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {formatter.format(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Pie Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 text-xs min-w-[190px] z-50">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dataItem.color }}></span>
            <p className="font-extrabold text-slate-100">{dataItem.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Transaksi:</span>
              <span className="font-bold text-slate-100">{formatter.format(dataItem.value)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-400">Pemasukan:</span>
              <span className="font-semibold text-emerald-300">+{formatter.format(dataItem.masuk)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-rose-400">Pengeluaran:</span>
              <span className="font-semibold text-rose-300">-{formatter.format(dataItem.keluar)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              <span>Porsi Kas:</span>
              <span className="font-bold text-amber-300">{dataItem.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-28">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Kembali ke menu"
          >
            <Icons.back className="w-5 h-5" />
          </button>
          <div className="ml-3.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Buku & Grafik Kas RT</h2>
            <p className="text-xs text-slate-500 font-medium">Transparansi arus kas, analitik, & mutasi keuangan</p>
          </div>
        </div>

        {/* Tombol Refresh / Toggle Grafik */}
        <button
          onClick={() => setShowChartSection(prev => !prev)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            showChartSection 
              ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Icons.chart className="w-4 h-4 text-teal-600" />
          <span className="hidden sm:inline">{showChartSection ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}</span>
          <span className="sm:hidden">Grafik</span>
          {showChartSection ? <Icons.chevronUp className="w-3.5 h-3.5" /> : <Icons.chevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {/* SALDO UTAMA CARD (Modern Wallet Style) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-6 rounded-[2rem] text-white shadow-xl shadow-teal-200/50 mb-5 relative overflow-hidden"
      >
        {/* Dekorasi Latar Belakang Abstrak */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white opacity-10 rounded-full translate-x-12 -translate-y-12 blur-sm"></div>
        <div className="absolute bottom-0 right-10 w-28 h-28 bg-teal-900 opacity-20 rounded-full translate-y-10"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            <Icons.wallet className="w-4 h-4" />
            <p className="text-[11px] font-bold uppercase tracking-wider">Kas Utama RT 01</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-emerald-400/20 text-emerald-100 font-semibold px-2.5 py-1 rounded-full border border-emerald-300/30">
              Total Pos: {formatter.format(getSaldo('Kas RT') + getSaldo('Dana Kematian') + getSaldo('Dana Sosial'))}
            </span>
          </div>
        </div>
        <h4 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight drop-shadow-sm relative z-10">
          {formatter.format(getSaldo('Kas RT'))}
        </h4>
      </motion.div>

      {/* SALDO SUB-FUNDS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4.5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-1">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center mb-1">
             <span className="text-rose-500 font-bold text-sm">🕊️</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dana Kematian</p>
          <h4 className="text-base md:text-lg font-extrabold text-slate-800">{formatter.format(getSaldo('Dana Kematian'))}</h4>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4.5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-1">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center mb-1">
             <span className="text-amber-500 font-bold text-sm">🤝</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dana Sosial</p>
          <h4 className="text-base md:text-lg font-extrabold text-slate-800">{formatter.format(getSaldo('Dana Sosial'))}</h4>
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* SEKSI GRAFIK RIWAYAT TRANSAKSI KAS (INTERAKTIF & RESPONSIF) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showChartSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white rounded-[2rem] p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100">
              {/* Header Grafik & Filter */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Icons.chart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Grafik Riwayat Transaksi Kas</h3>
                      <p className="text-[11px] text-slate-500">Visualisasi tren pemasukan, pengeluaran, dan komposisi dana</p>
                    </div>
                  </div>
                </div>

                {/* Filter Periode & Pos Kas */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pilihan Periode Waktu */}
                  <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
                    <button
                      onClick={() => setChartPeriod('all')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${chartPeriod === 'all' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setChartPeriod('month')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${chartPeriod === 'month' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Bulan Ini
                    </button>
                    <button
                      onClick={() => setChartPeriod('3months')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${chartPeriod === '3months' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      3 Bulan
                    </button>
                    <button
                      onClick={() => setChartPeriod('6months')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${chartPeriod === '6months' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      6 Bulan
                    </button>
                  </div>

                  {/* Filter Pos Kas Dropdown */}
                  <select
                    value={chartCategoryFilter}
                    onChange={(e) => setChartCategoryFilter(e.target.value)}
                    aria-label="Filter Pos Kas untuk Grafik"
                    className="text-[11px] font-bold bg-slate-100/80 text-slate-700 px-3 py-1.5 rounded-xl outline-none border-transparent focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">Semua Pos Kas</option>
                    <option value="Kas RT">Kas Utama RT</option>
                    <option value="Dana Kematian">Dana Kematian</option>
                    <option value="Dana Sosial">Dana Sosial</option>
                  </select>
                </div>
              </div>

              {/* Quick Summary Cards (Statistik Periode Terpilih) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
                <div className="bg-emerald-50/70 border border-emerald-100/80 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Pemasukan
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-emerald-800 mt-1">
                    +{formatter.format(chartAnalytics.totalMasuk)}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-medium mt-0.5">
                    Rata-rata: {compactFormatter.format(chartAnalytics.rataRataMasuk)}
                  </p>
                </div>

                <div className="bg-rose-50/70 border border-rose-100/80 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Pengeluaran
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-rose-800 mt-1">
                    -{formatter.format(chartAnalytics.totalKeluar)}
                  </p>
                  <p className="text-[9px] text-rose-600 font-medium mt-0.5">
                    Rata-rata: {compactFormatter.format(chartAnalytics.rataRataKeluar)}
                  </p>
                </div>

                <div className="bg-blue-50/70 border border-blue-100/80 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Arus Kas Bersih
                  </p>
                  <p className={`text-sm md:text-base font-extrabold mt-1 ${chartAnalytics.netCashflow >= 0 ? 'text-blue-800' : 'text-rose-700'}`}>
                    {chartAnalytics.netCashflow >= 0 ? '+' : ''}{formatter.format(chartAnalytics.netCashflow)}
                  </p>
                  <p className="text-[9px] text-blue-600 font-medium mt-0.5">
                    {chartAnalytics.netCashflow >= 0 ? 'Surplus Finansial' : 'Defisit Periode'}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Total Transaksi
                  </p>
                  <p className="text-sm md:text-base font-extrabold text-slate-800 mt-1">
                    {chartAnalytics.totalTransaksi} Mutasi
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                    Tercatat di sistem
                  </p>
                </div>
              </div>

              {/* Tipe Mode Grafik Tabs */}
              <div className="flex items-center justify-between mb-4 mt-2">
                <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full sm:w-auto">
                  <button
                    onClick={() => setChartViewMode('tren')}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      chartViewMode === 'tren' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icons.line className="w-3.5 h-3.5" />
                    <span>Tren Arus Kas</span>
                  </button>

                  <button
                    onClick={() => setChartViewMode('perbandingan')}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      chartViewMode === 'perbandingan' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icons.chart className="w-3.5 h-3.5" />
                    <span>Perbandingan Bulanan</span>
                  </button>

                  <button
                    onClick={() => setChartViewMode('pos')}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      chartViewMode === 'pos' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icons.pie className="w-3.5 h-3.5" />
                    <span>Komposisi Pos Kas</span>
                  </button>
                </div>
              </div>

              {/* CONTAINER GRAFIK RECHARTS */}
              <div className="w-full h-72 md:h-80 pt-2">
                {chartAnalytics.timeSeriesData.length === 0 && chartAnalytics.categoryData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl">
                    <Icons.chart className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Belum Ada Data Transaksi untuk Periode Ini</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Ubah filter periode atau catat transaksi kas baru untuk melihat visualisasi grafik.</p>
                  </div>
                ) : (
                  <>
                    {/* MODE 1: TREN ARUS KAS (AREA / LINE CHART) */}
                    {chartViewMode === 'tren' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartAnalytics.timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 11, fill: '#64748b' }} 
                            axisLine={{ stroke: '#e2e8f0' }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false}
                            tickFormatter={(val) => compactFormatter.format(val)}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend 
                            wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
                            formatter={(value) => (
                              <span className="text-slate-700 text-xs">
                                {value === 'Masuk' ? 'Pemasukan (+)' : value === 'Keluar' ? 'Pengeluaran (-)' : 'Saldo Kumulatif'}
                              </span>
                            )}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Masuk" 
                            name="Masuk" 
                            stroke="#10b981" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorMasuk)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Keluar" 
                            name="Keluar" 
                            stroke="#f43f5e" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorKeluar)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="SaldoKumulatif" 
                            name="Saldo Kumulatif" 
                            stroke="#0284c7" 
                            strokeWidth={2} 
                            strokeDasharray="4 4"
                            fillOpacity={1} 
                            fill="url(#colorSaldo)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* MODE 2: PERBANDINGAN PEMASUKAN VS PENGELUARAN (BAR CHART) */}
                    {chartViewMode === 'perbandingan' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartAnalytics.timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 11, fill: '#64748b' }} 
                            axisLine={{ stroke: '#e2e8f0' }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false}
                            tickFormatter={(val) => compactFormatter.format(val)}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend 
                            wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
                            formatter={(value) => (
                              <span className="text-slate-700 text-xs">
                                {value === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            )}
                          />
                          <Bar 
                            dataKey="Masuk" 
                            name="Masuk" 
                            fill="#10b981" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={32}
                          />
                          <Bar 
                            dataKey="Keluar" 
                            name="Keluar" 
                            fill="#f43f5e" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={32}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* MODE 3: KOMPOSISI POS KAS (DONUT / PIE CHART) */}
                    {chartViewMode === 'pos' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
                        <div className="h-56 md:h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip content={<CustomPieTooltip />} />
                              <Pie
                                data={chartAnalytics.categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {chartAnalytics.categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Rincian Tabel Komposisi */}
                        <div className="space-y-2.5 px-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Volume per Pos</p>
                          {chartAnalytics.categoryData.map((cat, idx) => (
                            <div key={idx} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                                  <p className="text-[10px] text-slate-500">{cat.percentage}% dari total perputaran</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-extrabold text-slate-800 block">{formatter.format(cat.value)}</span>
                                <span className="text-[9px] text-emerald-600 font-semibold">Masuk: {compactFormatter.format(cat.masuk)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM INPUT TRANSAKSI / TRANSFER (ADMIN & BENDAHARA ONLY) */}
      {isAdminOrBendahara && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          {/* SEGMENTED CONTROL / TABS */}
          <div className="bg-slate-200/60 p-1 rounded-2xl flex mb-4 relative">
            <button 
              onClick={() => setShowTransfer(false)} 
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all z-10 ${!showTransfer ? 'text-slate-800 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Catat Arus Kas
            </button>
            <button 
              onClick={() => setShowTransfer(true)} 
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all z-10 ${showTransfer ? 'text-slate-800 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Transfer Antar Dana
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!showTransfer ? (
              <motion.form 
                key="catat" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                onSubmit={handleTambah} className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4"
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Kategori Pos</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none transition-all cursor-pointer">
                      <option value="Kas RT">Kas Utama RT</option>
                      <option value="Dana Kematian">Dana Kematian</option>
                      <option value="Dana Sosial">Dana Sosial</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Jenis</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none transition-all cursor-pointer">
                      <option value="Masuk">Pemasukan (+)</option>
                      <option value="Keluar">Pengeluaran (-)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Nominal (Rp)</label>
                  <input type="number" placeholder="Contoh: 50000" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full mt-1 p-3 text-sm font-bold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Keterangan / Catatan</label>
                  <input type="text" placeholder="Tuliskan keperluan transaksi..." value={message} onChange={e => setMessage(e.target.value)} required className="w-full mt-1 p-3 text-sm font-medium bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none transition-all" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                  {loading ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="transfer" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
                onSubmit={handleTransfer} className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4"
              >
                <div className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <div className="flex-1 text-center">
                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Dari</p>
                     <p className="font-extrabold text-slate-800 text-sm mt-1">Kas RT</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
                     <Icons.transfer className="w-4 h-4"/>
                   </div>
                   <div className="flex-1 text-center">
                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Ke</p>
                     <p className="font-extrabold text-teal-600 text-sm mt-1">Dana Sosial</p>
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Nominal Transfer (Rp)</label>
                  <input type="number" placeholder="Maks. sesuai saldo Kas RT" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required className="w-full mt-1 p-3 text-sm font-bold bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all" min="1" max={getSaldo('Kas RT')} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                  {loading ? 'Memproses...' : 'Transfer Dana Sekarang'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RIWAYAT TRANSAKSI (TABEL & SEARCH) */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-extrabold text-slate-800 text-base">Riwayat Transaksi</h4>
          <span className="text-xs font-semibold text-slate-500">{totalElements} catatan</span>
        </div>
        <div className="relative">
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Cari transaksi berdasarkan catatan / nama..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-white border border-slate-200 rounded-2xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
            <Icons.wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-bold">Belum ada catatan transaksi.</p>
          </div>
        ) : (
          <AnimatePresence>
            {data.map((item, idx) => (
              <motion.div 
                key={`kas_${item.id || 'k'}_${idx}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-slate-100 flex gap-4 items-center group"
              >
                {/* Ikon Indikator Masuk/Keluar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'Masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {item.type === 'Masuk' ? <Icons.trendDown className="w-6 h-6"/> : <Icons.trendUp className="w-6 h-6"/>}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{item.message}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 truncate flex items-center gap-1.5 flex-wrap">
                     <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-semibold" style={{ borderLeft: `3px solid ${CATEGORY_COLORS[item.category] || '#0d9488'}` }}>
                       {item.category || 'Kas RT'}
                     </span> 
                     <span>•</span>
                     <span>{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </p>
                  {item.status === 'butuh_konfirmasi' && (
                    <span className="inline-block text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full mt-1.5 border border-amber-100">⏳ Butuh Konfirmasi RT</span>
                  )}
                  
                  {/* Action Buttons for Admins */}
                  <div className="flex gap-2 mt-2">
                    {currentUser?.role === 'admin' && item.status === 'butuh_konfirmasi' && (
                      <button onClick={async () => {
                         await apiFetch(`/api/data/kas/${item.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status: 'selesai' }) });
                         fetchData();
                         fetchAllKasHistory();
                      }} className="text-[10px] text-white bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer">Setujui</button>
                    )}
                    {isAdminOrBendahara && (
                      <button onClick={() => {
                        const newNominalStr = prompt('Masukkan nominal koreksi (angka saja):', item.amount);
                        if (newNominalStr) {
                          const newAmount = parseInt(newNominalStr.replace(/\D/g, ''), 10);
                          if (!isNaN(newAmount) && newAmount !== item.amount) {
                             const newStatus = currentUser?.role === 'admin' ? 'selesai' : 'butuh_konfirmasi';
                             apiFetch(`/api/data/kas/${item.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount: newAmount, status: newStatus }) }).then(() => {
                               fetchData();
                               fetchAllKasHistory();
                             });
                          }
                        }
                      }} className="text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold hover:bg-blue-100 transition-colors cursor-pointer">
                        <Icons.edit className="w-3 h-3"/> Koreksi
                      </button>
                    )}
                    {['admin', 'developer'].includes(currentUser?.role) && (
                      <button onClick={() => handleDeleteClick(item.id)} className="text-[10px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold hover:bg-rose-100 transition-colors cursor-pointer">
                        <Icons.delete className="w-3 h-3"/> Hapus
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <span className={`text-sm md:text-base font-extrabold block ${item.type === 'Masuk' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {item.type === 'Masuk' ? '+' : '-'} {formatter.format(item.amount)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">Oleh: {item.name?.split(' ')[0] || 'Pengurus'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-2 mt-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white rounded-xl transition-colors cursor-pointer select-none shadow-sm"
            >
              Sebelumnya
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Halaman {page} dari {totalPages} ({totalElements} data)
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-950 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer select-none shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-[2rem] w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Icons.delete className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">Hapus Transaksi?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Data yang telah dihapus akan memengaruhi saldo kas dan tidak dapat dipulihkan. Yakin ingin melanjutkan?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={cancelDelete} className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex-1 hover:bg-slate-200 transition-colors cursor-pointer">
                  Batal
                </button>
                <button onClick={confirmDelete} className="px-5 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm flex-1 hover:bg-rose-700 transition-colors shadow-md shadow-rose-200 cursor-pointer">
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
