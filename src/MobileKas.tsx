import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Ikon Lengkap & Modern ---
const Icons = {
  back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>,
  wallet: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  trendUp: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  trendDown: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  transfer: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  swap: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  check: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
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

// Definisi Opsi Pos Dana Kas
export const KAS_POS_OPTIONS = [
  { id: 'Dana Sosial', label: 'Dana Sosial (Dansos)', shortLabel: 'Dansos', icon: '🤝', color: 'amber' },
  { id: 'Kas RT', label: 'Kas Utama RT', shortLabel: 'Kas RT', icon: '🏛️', color: 'teal' },
  { id: 'Dana Kematian', label: 'Dana Kematian', shortLabel: 'Dana Kematian', icon: '🕊️', color: 'rose' }
];

export const MobileKas = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedKasData || []);
  const [allKasData, setAllKasData] = useState<any[]>(cachedAllKasData || []);
  const [loading, setLoading] = useState(!cachedKasData);
  const [type, setType] = useState('Masuk');
  const [category, setCategory] = useState('Kas RT');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // Transfer State (Fleksibel: Dansos ke Kas RT, Dana Kematian ke Dansos, dll.)
  const [transferFrom, setTransferFrom] = useState<string>('Dana Sosial');
  const [transferTo, setTransferTo] = useState<string>('Kas RT');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  // Notifikasi / Keterangan Feedback Instan
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Edit / Koreksi Transaksi Modal State
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editCategory, setEditCategory] = useState('Kas RT');

  const showNotification = (msg: string, notifType: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type: notifType });
    setTimeout(() => {
      setNotification(prev => prev?.message === msg ? null : prev);
    }, 4500);
  };

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
    if (!nominal || nominal <= 0) {
      showNotification('Nominal transaksi harus lebih dari Rp 0.', 'error');
      return;
    }

    const tempId = 'temp-' + Date.now();
    const newEntry = {
      id: tempId,
      type,
      category,
      amount: nominal,
      message: message.trim() || `Transaksi ${type} ${category}`,
      name: currentUser?.nama || 'Pengurus RT',
      status: 'selesai',
      createdAt: new Date().toISOString()
    };
    
    setData(prev => [newEntry, ...prev]);
    setAllKasData(prev => [newEntry, ...prev]);
    setBalances(prev => ({
      ...prev,
      [category]: (prev[category] || 0) + (type === 'Masuk' ? nominal : -nominal)
    }));
    setAmount('');
    setMessage('');

    showNotification(
      `Transaksi ${type === 'Masuk' ? 'pemasukan (+)' : 'pengeluaran (-)'} sebesar ${formatter.format(nominal)} pada ${category} berhasil dicatat!`,
      'success'
    );
    window.dispatchEvent(new CustomEvent('app_data_update'));

    try {
      await apiFetch('/api/data/kas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          category,
          amount: nominal, 
          message: newEntry.message,
          name: currentUser?.nama || 'Pengurus RT',
          status: 'selesai'
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
      showNotification('Gagal menyimpan transaksi kas ke server.', 'error');
    }
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => setShowConfirmDelete(id);
  const cancelDelete = () => setShowConfirmDelete(null);

  const confirmDelete = async () => {
    if (!showConfirmDelete) return;
    const deletedId = showConfirmDelete;
    const targetItem = data.find(item => item.id === deletedId) || allKasData.find(item => item.id === deletedId);
    
    // Optimistic delete
    setData(prev => prev.filter(item => item.id !== deletedId));
    setAllKasData(prev => prev.filter(item => item.id !== deletedId));
    if (targetItem) {
      const cat = targetItem.category || 'Kas RT';
      const delta = targetItem.type === 'Masuk' ? -targetItem.amount : targetItem.amount;
      setBalances(prev => ({
        ...prev,
        [cat]: (prev[cat] || 0) + delta
      }));
    }
    setShowConfirmDelete(null);

    showNotification('Catatan transaksi kas berhasil dihapus!', 'success');
    window.dispatchEvent(new CustomEvent('app_data_update'));

    try {
      await apiFetch(`/api/data/kas/${deletedId}`, { method: 'DELETE' });
      fetchData();
      fetchAllKasHistory();
    } catch(e) { 
      console.error(e); 
      fetchData(); 
      fetchAllKasHistory();
      showNotification('Gagal menghapus transaksi dari server.', 'error');
    }
  };

  const getSaldo = (cat: string) => {
    return balances[cat] || 0;
  };

  // Handler Koreksi / Edit Transaksi Kas
  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setEditAmount(String(item.amount || ''));
    setEditMessage(item.message || '');
    setEditCategory(item.category || 'Kas RT');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    const newAmount = parseInt(editAmount.replace(/\D/g, '') || '0', 10);
    if (isNaN(newAmount) || newAmount <= 0) {
      showNotification('Nominal koreksi harus lebih dari Rp 0.', 'error');
      return;
    }
    const oldAmount = editItem.amount || 0;
    const itemCat = editCategory || editItem.category || 'Kas RT';
    const itemType = editItem.type || 'Masuk';
    const amountDiff = newAmount - oldAmount;

    setData(prev => prev.map(item => item.id === editItem.id ? { ...item, amount: newAmount, message: editMessage, category: itemCat } : item));
    setAllKasData(prev => prev.map(item => item.id === editItem.id ? { ...item, amount: newAmount, message: editMessage, category: itemCat } : item));
    setBalances(prev => ({
      ...prev,
      [itemCat]: (prev[itemCat] || 0) + (itemType === 'Masuk' ? amountDiff : -amountDiff)
    }));

    const editedId = editItem.id;
    setEditItem(null);
    showNotification(`Transaksi kas berhasil dikoreksi menjadi ${formatter.format(newAmount)}!`, 'success');
    window.dispatchEvent(new CustomEvent('app_data_update'));

    try {
      const newStatus = currentUser?.role === 'admin' ? 'selesai' : 'butuh_konfirmasi';
      await apiFetch(`/api/data/kas/${editedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount, message: editMessage, category: itemCat, status: newStatus })
      });
      fetchData();
      fetchAllKasHistory();
    } catch (e) {
      console.error(e);
      fetchData();
      fetchAllKasHistory();
    }
  };

  // Handler Transfer Antar Pos Kas (Dansos ke Kas, Dana Kematian ke Dansos, dll.)
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (transferFrom === transferTo) {
      showNotification('Pos asal dan pos tujuan transfer tidak boleh sama.', 'error');
      return;
    }
    
    const nominal = parseInt(transferAmount.replace(/\D/g, '') || '0', 10);
    if (!nominal || nominal <= 0) {
      showNotification('Nominal transfer harus lebih besar dari Rp 0.', 'error');
      return;
    }
    
    const sourceSaldo = getSaldo(transferFrom);
    if (nominal > sourceSaldo) {
      showNotification(`Saldo ${transferFrom} tidak mencukupi (Tersedia: ${formatter.format(sourceSaldo)}).`, 'error');
      return;
    }
    
    // Keterangan transfer
    const customNote = transferNote.trim();
    const ketOut = customNote ? `Transfer ke ${transferTo}: ${customNote}` : `Transfer ke ${transferTo}`;
    const ketIn = customNote ? `Transfer dari ${transferFrom}: ${customNote}` : `Transfer dari ${transferFrom}`;

    // Optimistic Update tanpa delay
    const tempId1 = 'temp-out-' + Date.now();
    const tempId2 = 'temp-in-' + (Date.now() + 1);
    
    const entryOut = { 
      id: tempId1, 
      type: 'Keluar', 
      category: transferFrom, 
      amount: nominal, 
      message: ketOut, 
      name: currentUser?.nama || 'Bendahara RT', 
      status: 'selesai',
      createdAt: new Date().toISOString() 
    };
    const entryIn = { 
      id: tempId2, 
      type: 'Masuk', 
      category: transferTo, 
      amount: nominal, 
      message: ketIn, 
      name: currentUser?.nama || 'Bendahara RT', 
      status: 'selesai',
      createdAt: new Date().toISOString() 
    };
    
    setData(prev => [entryOut, entryIn, ...prev]);
    setAllKasData(prev => [entryOut, entryIn, ...prev]);
    setBalances(prev => ({
      ...prev,
      [transferFrom]: (prev[transferFrom] || 0) - nominal,
      [transferTo]: (prev[transferTo] || 0) + nominal
    }));
    setTransferAmount('');
    setTransferNote('');
    setShowTransfer(false);

    showNotification(
      `Transfer berhasil! ${formatter.format(nominal)} dipindahkan dari ${transferFrom} ke ${transferTo}.`,
      'success'
    );
    window.dispatchEvent(new CustomEvent('app_data_update'));

    try {
      await Promise.all([
        apiFetch('/api/data/kas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'Keluar', 
            category: transferFrom, 
            amount: nominal, 
            message: ketOut, 
            name: currentUser?.nama || 'Bendahara RT',
            status: 'selesai'
          })
        }),
        apiFetch('/api/data/kas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'Masuk', 
            category: transferTo, 
            amount: nominal, 
            message: ketIn, 
            name: currentUser?.nama || 'Bendahara RT',
            status: 'selesai'
          })
        })
      ]);
      fetchData();
      fetchAllKasHistory();
    } catch(e) { 
      console.error(e);
      setData(prev => prev.filter(item => item.id !== tempId1 && item.id !== tempId2));
      setAllKasData(prev => prev.filter(item => item.id !== tempId1 && item.id !== tempId2));
      fetchData();
      fetchAllKasHistory();
      showNotification('Gagal memproses transfer kas ke server.', 'error');
    }
  };

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const compactFormatter = new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' });

  // ==========================================
  // PENGOLAHAN KOMPOSISI POS KAS (TANPA GRAFIK)
  // ==========================================
  const komposisiPosKas = useMemo(() => {
    const rawList = allKasData.length > 0 ? allKasData : data;
    const saldoKasRT = Math.max(0, balances['Kas RT'] || 0);
    const saldoDansos = Math.max(0, balances['Dana Sosial'] || 0);
    const saldoKematian = Math.max(0, balances['Dana Kematian'] || 0);
    const totalSaldo = saldoKasRT + saldoDansos + saldoKematian;

    let totalMasuk = 0;
    let totalKeluar = 0;
    const activityMap: { [key: string]: { masuk: number; keluar: number; count: number } } = {
      'Kas RT': { masuk: 0, keluar: 0, count: 0 },
      'Dana Sosial': { masuk: 0, keluar: 0, count: 0 },
      'Dana Kematian': { masuk: 0, keluar: 0, count: 0 }
    };

    rawList.forEach((item: any) => {
      const cat = item.category || 'Kas RT';
      const amt = Number(item.amount) || 0;
      if (!activityMap[cat]) {
        activityMap[cat] = { masuk: 0, keluar: 0, count: 0 };
      }
      activityMap[cat].count++;
      if (item.type === 'Masuk') {
        totalMasuk += amt;
        activityMap[cat].masuk += amt;
      } else {
        totalKeluar += amt;
        activityMap[cat].keluar += amt;
      }
    });

    const calcPct = (val: number) => (totalSaldo > 0 ? Math.round((val / totalSaldo) * 100) : 0);
    const pctKasRT = calcPct(saldoKasRT);
    const pctDansos = calcPct(saldoDansos);
    const pctKematian = totalSaldo > 0 ? Math.max(0, 100 - pctKasRT - pctDansos) : 0;

    return {
      totalSaldo,
      totalMasuk,
      totalKeluar,
      totalTransaksi: rawList.length,
      items: [
        {
          id: 'Kas RT',
          name: 'Kas Utama RT',
          shortName: 'Kas RT',
          icon: '🏛️',
          color: '#0d9488',
          bgClass: 'bg-teal-50/70',
          borderClass: 'border-teal-200/80',
          textClass: 'text-teal-700',
          barClass: 'bg-teal-600',
          saldo: balances['Kas RT'] || 0,
          percentage: pctKasRT,
          desc: 'Operasional rutin, kebersihan, pemeliharaan & kegiatan RT',
          masuk: activityMap['Kas RT']?.masuk || 0,
          keluar: activityMap['Kas RT']?.keluar || 0,
          count: activityMap['Kas RT']?.count || 0
        },
        {
          id: 'Dana Sosial',
          name: 'Dana Sosial (Dansos)',
          shortName: 'Dansos',
          icon: '🤝',
          color: '#f59e0b',
          bgClass: 'bg-amber-50/70',
          borderClass: 'border-amber-200/80',
          textClass: 'text-amber-700',
          barClass: 'bg-amber-500',
          saldo: balances['Dana Sosial'] || 0,
          percentage: pctDansos,
          desc: 'Santunan warga, bantuan bencana/musibah & aksi kepedulian',
          masuk: activityMap['Dana Sosial']?.masuk || 0,
          keluar: activityMap['Dana Sosial']?.keluar || 0,
          count: activityMap['Dana Sosial']?.count || 0
        },
        {
          id: 'Dana Kematian',
          name: 'Dana Kematian',
          shortName: 'Dana Kematian',
          icon: '🕊️',
          color: '#f43f5e',
          bgClass: 'bg-rose-50/70',
          borderClass: 'border-rose-200/80',
          textClass: 'text-rose-700',
          barClass: 'bg-rose-500',
          saldo: balances['Dana Kematian'] || 0,
          percentage: pctKematian,
          desc: 'Uang duka cita, perlengkapan jenazah & pemakaman warga',
          masuk: activityMap['Dana Kematian']?.masuk || 0,
          keluar: activityMap['Dana Kematian']?.keluar || 0,
          count: activityMap['Dana Kematian']?.count || 0
        }
      ]
    };
  }, [balances, allKasData, data]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-28">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            aria-label="Kembali ke menu"
          >
            <Icons.back className="w-5 h-5" />
          </button>
          <div className="ml-3.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Buku & Kas RT</h2>
            <p className="text-xs text-slate-500 font-medium">Komposisi pos kas, transparansi keuangan, & mutasi kas</p>
          </div>
        </div>

        {/* Tombol Refresh Data */}
        <button
          onClick={() => { fetchData(); fetchAllKasHistory(); }}
          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="Muat ulang data kas"
        >
          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span className="hidden sm:inline">Perbarui</span>
        </button>
      </div>
      
      {/* NOTIFIKASI KETERANGAN AKSI INSTAN */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className={`mb-5 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md border ${
              notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{notification.type === 'error' ? '⚠️' : '✅'}</span>
              <p className="text-xs md:text-sm font-bold leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dana Sosial (Dansos)</p>
          <h4 className="text-base md:text-lg font-extrabold text-slate-800">{formatter.format(getSaldo('Dana Sosial'))}</h4>
        </motion.div>
      </div>

      {/* ========================================================= */}
      {/* SEKSI KOMPOSISI POS KAS (TANPA GRAFIK - BERSIH & INFORMATIF) */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2rem] p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 mb-8"
      >
        {/* Header Komposisi Pos Kas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-lg shadow-sm">
              📊
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Komposisi Pos Kas</h3>
              <p className="text-xs text-slate-500">Distribusi saldo & proporsi keuangan RT berdasarkan pos dana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              Total Pos: <strong className="text-teal-700 font-extrabold">{formatter.format(komposisiPosKas.totalSaldo)}</strong>
            </span>
          </div>
        </div>

        {/* Visual Multi-segment Distribution Bar */}
        <div className="mt-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Proporsi Saldo Antar Pos
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              100% Saldo Kas
            </span>
          </div>

          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner p-0.5 gap-0.5">
            {komposisiPosKas.items.map((item) => (
              <div
                key={`bar_${item.id}`}
                style={{ width: `${Math.max(item.percentage > 0 ? item.percentage : 0, item.saldo > 0 ? 3 : 0)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                title={`${item.name}: ${item.percentage}% (${formatter.format(item.saldo)})`}
              />
            ))}
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs">
            {komposisiPosKas.items.map((item) => (
              <div key={`legend_${item.id}`} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-600 text-[11px]">{item.shortName}:</span>
                <span className="font-extrabold text-slate-800 text-[11px]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid 3 Kartu Rincian Tiap Pos Kas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {komposisiPosKas.items.map((item) => (
            <div
              key={`card_${item.id}`}
              className={`p-4 rounded-2xl border transition-all ${item.bgClass} ${item.borderClass} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-extrabold text-slate-800 text-xs md:text-sm">{item.name}</span>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white shadow-xs border ${item.borderClass} ${item.textClass}`}>
                    {item.percentage}%
                  </span>
                </div>

                <div className="my-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo Saat Ini</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {formatter.format(item.saldo)}
                  </p>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                  {item.desc}
                </p>
              </div>

              {/* Mutasi Singkat */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold">
                  Masuk: +{compactFormatter.format(item.masuk)}
                </span>
                <span className="text-rose-700 font-bold">
                  Keluar: -{compactFormatter.format(item.keluar)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Finansial Singkat di Bagian Bawah Komposisi */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>📋 Tercatat <strong className="text-slate-800">{komposisiPosKas.totalTransaksi} transaksi</strong> di buku kas</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-600 font-bold">
              Total Masuk: +{compactFormatter.format(komposisiPosKas.totalMasuk)}
            </span>
            <span className="text-rose-600 font-bold">
              Total Keluar: -{compactFormatter.format(komposisiPosKas.totalKeluar)}
            </span>
          </div>
        </div>
      </motion.div>

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
                {/* PRESET TOMBOL TRANSFER CEPAT */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1 block mb-1.5">
                    Pilihan Cepat Transfer Antar Pos Dana
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setTransferFrom('Dana Sosial'); setTransferTo('Kas RT'); }}
                      className={`p-2.5 rounded-2xl text-left border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between ${
                        transferFrom === 'Dana Sosial' && transferTo === 'Kas RT'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🤝 Dansos ➔ 🏛️ Kas RT</span>
                      {transferFrom === 'Dana Sosial' && transferTo === 'Kas RT' && <span className="text-[10px]">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTransferFrom('Dana Kematian'); setTransferTo('Dana Sosial'); }}
                      className={`p-2.5 rounded-2xl text-left border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between ${
                        transferFrom === 'Dana Kematian' && transferTo === 'Dana Sosial'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🕊️ Kematian ➔ 🤝 Dansos</span>
                      {transferFrom === 'Dana Kematian' && transferTo === 'Dana Sosial' && <span className="text-[10px]">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTransferFrom('Kas RT'); setTransferTo('Dana Sosial'); }}
                      className={`p-2.5 rounded-2xl text-left border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between ${
                        transferFrom === 'Kas RT' && transferTo === 'Dana Sosial'
                          ? 'bg-teal-600 text-white border-teal-700 shadow-sm ring-2 ring-teal-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🏛️ Kas RT ➔ 🤝 Dansos</span>
                      {transferFrom === 'Kas RT' && transferTo === 'Dana Sosial' && <span className="text-[10px]">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTransferFrom('Dana Kematian'); setTransferTo('Kas RT'); }}
                      className={`p-2.5 rounded-2xl text-left border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between ${
                        transferFrom === 'Dana Kematian' && transferTo === 'Kas RT'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🕊️ Kematian ➔ 🏛️ Kas RT</span>
                      {transferFrom === 'Dana Kematian' && transferTo === 'Kas RT' && <span className="text-[10px]">✓</span>}
                    </button>
                  </div>
                </div>

                {/* PILIH POS SUMBER & TUJUAN DENGAN TOMBOL TUKAR */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* DARI POS */}
                    <div className="flex-1 w-full">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        Dari Pos Dana (Sumber)
                      </label>
                      <select
                        value={transferFrom}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTransferFrom(val);
                          if (val === transferTo) {
                            const other = KAS_POS_OPTIONS.find(p => p.id !== val)?.id || 'Kas RT';
                            setTransferTo(other);
                          }
                        }}
                        className="w-full p-3 text-xs md:text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-100 cursor-pointer"
                      >
                        {KAS_POS_OPTIONS.map(pos => (
                          <option key={`from_${pos.id}`} value={pos.id}>
                            {pos.icon} {pos.label} ({formatter.format(getSaldo(pos.id))})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TOMBOL TUKAR ARAH (SWAP) */}
                    <div className="pt-2 sm:pt-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const tmp = transferFrom;
                          setTransferFrom(transferTo);
                          setTransferTo(tmp);
                        }}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all cursor-pointer active:scale-95"
                        title="Tukar Arah Transfer"
                        aria-label="Tukar Arah Transfer"
                      >
                        <Icons.swap className="w-4 h-4" />
                      </button>
                    </div>

                    {/* KE POS */}
                    <div className="flex-1 w-full">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        Ke Pos Dana (Tujuan)
                      </label>
                      <select
                        value={transferTo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTransferTo(val);
                          if (val === transferFrom) {
                            const other = KAS_POS_OPTIONS.find(p => p.id !== val)?.id || 'Kas RT';
                            setTransferFrom(other);
                          }
                        }}
                        className="w-full p-3 text-xs md:text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-100 cursor-pointer"
                      >
                        {KAS_POS_OPTIONS.map(pos => (
                          <option key={`to_${pos.id}`} value={pos.id}>
                            {pos.icon} {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* INFO SALDO SUMBER & TUJUAN */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">
                      Saldo Tersedia <strong className="text-slate-800">{transferFrom}:</strong>
                    </span>
                    <span className={`font-extrabold ${getSaldo(transferFrom) <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatter.format(getSaldo(transferFrom))}
                    </span>
                  </div>
                </div>

                {/* NOMINAL TRANSFER */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                      Nominal Transfer (Rp)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTransferAmount(String(Math.max(0, getSaldo(transferFrom))))}
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                    >
                      Gunakan Semua Saldo
                    </button>
                  </div>
                  <input 
                    type="number" 
                    placeholder={`Maks. ${formatter.format(getSaldo(transferFrom))}`} 
                    value={transferAmount} 
                    onChange={e => setTransferAmount(e.target.value)} 
                    required 
                    min="1" 
                    max={getSaldo(transferFrom)}
                    className="w-full p-3 text-sm font-bold bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all" 
                  />

                  {/* CHIP PRESET NOMINAL */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[25000, 50000, 100000, 250000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTransferAmount(String(amt))}
                        disabled={amt > getSaldo(transferFrom)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          transferAmount === String(amt)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50'
                        }`}
                      >
                        +{compactFormatter.format(amt)}
                      </button>
                    ))}
                    {getSaldo(transferFrom) > 0 && (
                      <button
                        type="button"
                        onClick={() => setTransferAmount(String(getSaldo(transferFrom)))}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-all cursor-pointer"
                      >
                        Maksimal
                      </button>
                    )}
                  </div>

                  {parseInt(transferAmount || '0', 10) > getSaldo(transferFrom) && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">
                      ⚠️ Nominal transfer melebihi saldo tersedia di {transferFrom}.
                    </p>
                  )}
                </div>

                {/* KETERANGAN TRANSFER */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                    Keterangan / Keperluan Transfer (Opsional)
                  </label>
                  <input 
                    type="text" 
                    placeholder={`Contoh: Pengalihan ${transferFrom} untuk kebutuhan ${transferTo}`} 
                    value={transferNote} 
                    onChange={e => setTransferNote(e.target.value)} 
                    className="w-full mt-1 p-3 text-sm font-medium bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || parseInt(transferAmount || '0', 10) <= 0 || parseInt(transferAmount || '0', 10) > getSaldo(transferFrom)} 
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  {loading ? 'Memproses...' : `Transfer ${transferAmount ? formatter.format(parseInt(transferAmount) || 0) : ''} dari ${transferFrom} ke ${transferTo}`}
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
                      <button onClick={() => handleOpenEdit(item)} className="text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold hover:bg-blue-100 transition-colors cursor-pointer">
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

      {/* MODAL KOREKSI TRANSAKSI */}
      <AnimatePresence>
        {editItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icons.edit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Koreksi Transaksi Kas</h3>
                    <p className="text-[11px] text-slate-500">Edit nominal atau keterangan transaksi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Pos Dana
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-3 text-xs md:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {KAS_POS_OPTIONS.map(pos => (
                      <option key={`edit_${pos.id}`} value={pos.id}>{pos.icon} {pos.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Nominal Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full p-3 text-sm font-bold bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Keterangan / Catatan
                  </label>
                  <input
                    type="text"
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    required
                    className="w-full p-3 text-sm font-medium bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex-1 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex-1 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
