import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';
import { MobileLaporRT } from './MobileLaporRT';

let cachedLaporanData: any[] | null = null;
let cachedTamuData: any[] | null = null;

export const MobileLaporan = ({
  onBack,
  currentUser,
  initialTab = 'aduan'
}: {
  onBack: () => void;
  currentUser: any;
  initialTab?: 'aduan' | 'tamu' | 'laporan';
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'aduan' | 'tamu'>(
    initialTab === 'tamu' ? 'tamu' : 'aduan'
  );

  const [aduanData, setAduanData] = useState<any[]>(cachedLaporanData || []);
  const [tamuData, setTamuData] = useState<any[]>(cachedTamuData || []);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<'aduan' | 'tamu' | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const isAdminOrPengurus = ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(
    currentUser?.role
  );
  const isKetuaRT = currentUser?.role === 'admin' || currentUser?.role === 'developer';

  const fetchAduan = async () => {
    try {
      const res = await apiFetch('/api/data/laporan');
      const json = await res.json();
      cachedLaporanData = json.data || [];
      setAduanData(cachedLaporanData!);
    } catch (e) {
      console.error('Gagal mengambil data laporan aduan:', e);
    }
  };

  const fetchTamu = async () => {
    try {
      const res = await apiFetch('/api/data/tamu');
      const json = await res.json();
      cachedTamuData = json.data || [];
      setTamuData(cachedTamuData!);
    } catch (e) {
      console.error('Gagal mengambil data buku tamu:', e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchAduan(), fetchTamu()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Aduan
  const filteredAduan = useMemo(() => {
    return aduanData
      .filter(item => {
        const hasAccess = isAdminOrPengurus || item.userId === currentUser?.id;
        if (!hasAccess) return false;

        if (filterStatus === 'pending' && item.status?.toLowerCase() === 'selesai') return false;
        if (filterStatus === 'selesai' && item.status?.toLowerCase() !== 'selesai') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (item.judul || '').toLowerCase().includes(q);
          const matchUser = (item.userName || '').toLowerCase().includes(q);
          const matchCategory = (item.kategori || '').toLowerCase().includes(q);
          const matchDesc = (item.keterangan || '').toLowerCase().includes(q);
          return matchTitle || matchUser || matchCategory || matchDesc;
        }

        return true;
      })
      .reverse();
  }, [aduanData, isAdminOrPengurus, currentUser?.id, filterStatus, searchQuery]);

  // Filter Tamu
  const filteredTamu = useMemo(() => {
    return tamuData
      .filter(item => {
        const hasAccess = isAdminOrPengurus || item.userId === currentUser?.id;
        if (!hasAccess) return false;

        if (filterStatus === 'pending' && item.status?.toLowerCase() === 'selesai') return false;
        if (filterStatus === 'selesai' && item.status?.toLowerCase() !== 'selesai') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPelapor = (item.namaPelapor || '').toLowerCase().includes(q);
          const matchAlamat = (item.alamatPelapor || '').toLowerCase().includes(q);
          const matchHubungan = (item.hubunganTamu || '').toLowerCase().includes(q);
          return matchPelapor || matchAlamat || matchHubungan;
        }

        return true;
      })
      .reverse();
  }, [tamuData, isAdminOrPengurus, currentUser?.id, filterStatus, searchQuery]);

  // Handle Update Status Aduan
  const handleUpdateStatusAduan = async (id: string, newStatus: string) => {
    setAduanData(prev => prev.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
    try {
      await apiFetch(`/api/data/laporan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updaterName: currentUser?.nama })
      });
      fetchAduan();
    } catch (e) {
      console.error(e);
      fetchAduan();
    }
  };

  // Handle Delete Aduan
  const handleDeleteAduan = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan aduan ini?')) return;
    setAduanData(prev => prev.filter(item => item.id !== id));
    try {
      await apiFetch(`/api/data/laporan/${id}`, { method: 'DELETE' });
      fetchAduan();
    } catch (e) {
      console.error(e);
      fetchAduan();
    }
  };

  // Handle Update Status Tamu
  const handleUpdateStatusTamu = async (id: string, newStatus: string) => {
    setTamuData(prev => prev.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
    try {
      await apiFetch(`/api/data/tamu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updaterName: currentUser?.nama })
      });
      fetchTamu();
    } catch (e) {
      console.error(e);
      fetchTamu();
    }
  };

  // Handle Delete Tamu
  const handleDeleteTamu = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan tamu ini?')) return;
    setTamuData(prev => prev.filter(item => item.id !== id));
    try {
      await apiFetch(`/api/data/tamu/${id}`, { method: 'DELETE' });
      fetchTamu();
    } catch (e) {
      console.error(e);
      fetchTamu();
    }
  };

  // Export Excel / CSV
  const exportToExcel = () => {
    if (!isKetuaRT) {
      alert('Hanya Ketua RT / Admin yang memiliki akses untuk mengekspor data laporan.');
      return;
    }

    if (activeSubTab === 'aduan') {
      const headers = ['ID Laporan', 'Kategori', 'Judul Laporan', 'Nama Pelapor', 'Keterangan', 'GPS', 'Status', 'Tanggal'];
      const rows = aduanData.map(item => [
        item.id || '-',
        item.kategori || 'Keluhan',
        item.judul || '-',
        item.userName || '-',
        item.keterangan || '-',
        item.gps || '-',
        item.status || 'PENDING',
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Export_Laporan_Aduan_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['ID Catatan', 'Nama Pelapor', 'Alamat Pelapor', 'Hubungan Tamu', 'Jumlah Tamu', 'Waktu Menginap (Hari)', 'Status', 'Tanggal Lapor'];
      const rows = tamuData.map(item => [
        item.id || '-',
        item.namaPelapor || '-',
        item.alamatPelapor || '-',
        item.hubunganTamu || '-',
        `${item.jumlahTamu || 1} Orang`,
        `${item.waktuMenginap || 1} Hari`,
        item.status || 'DILAPORKAN',
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Export_Buku_Tamu_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper untuk warna badge status
  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'selesai') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s === 'proses') return 'bg-sky-100 text-sky-800 border-sky-300';
    return 'bg-amber-100 text-amber-800 border-amber-300'; // Pending / Dilaporkan
  };

  const pendingAduanCount = useMemo(() => {
    return aduanData.filter(d => (isAdminOrPengurus || d.userId === currentUser?.id) && d.status?.toLowerCase() !== 'selesai').length;
  }, [aduanData, isAdminOrPengurus, currentUser?.id]);

  const activeTamuCount = useMemo(() => {
    return tamuData.filter(d => (isAdminOrPengurus || d.userId === currentUser?.id) && d.status?.toLowerCase() !== 'selesai').length;
  }, [tamuData, isAdminOrPengurus, currentUser?.id]);

  if (showCreateForm) {
    return (
      <MobileLaporRT
        onBack={() => {
          setShowCreateForm(null);
          loadAllData();
        }}
        currentUser={currentUser}
        defaultTab={showCreateForm === 'tamu' ? 'Tamu' : 'Keluhan'}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full">
      <div className="max-w-2xl mx-auto w-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/85 border-b border-slate-200/70 px-4 py-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-xs border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Pusat Laporan & Tamu</h2>
              <p className="text-[11px] font-bold text-slate-500">Rekap Aduan Lingkungan & Buku Tamu 1x24 Jam</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isKetuaRT && (
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                title="Ekspor data ke format Excel / CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateForm(activeSubTab === 'tamu' ? 'tamu' : 'aduan')}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black transition shadow-sm cursor-pointer"
            >
              <span>+</span>
              <span>{activeSubTab === 'tamu' ? 'Lapor Tamu' : 'Buat Aduan'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Switcher (Laporan Aduan vs Buku Tamu) */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSubTab('aduan')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'aduan'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📢 Laporan Aduan</span>
              {pendingAduanCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeSubTab === 'aduan' ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 text-slate-700'
                }`}>
                  {pendingAduanCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('tamu')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'tamu'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👥 Buku Tamu 1x24 Jam</span>
              {activeTamuCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeSubTab === 'tamu' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}>
                  {activeTamuCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 py-2 flex gap-2">
          <div className="relative flex-1">
            <icons.search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder={activeSubTab === 'aduan' ? 'Cari judul, pelapor, kategori...' : 'Cari nama pelapor, alamat, hubungan...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none shadow-2xs"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 text-xs font-extrabold bg-white border border-slate-200 rounded-xl focus:border-teal-500 outline-none shadow-2xs cursor-pointer"
          >
            <option value="semua">Semua Status</option>
            <option value="pending">Sedang Aktif / Proses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 pt-2">
          {activeSubTab === 'aduan' ? (
            /* TAB 1: LAPORAN ADUAN */
            filteredAduan.length > 0 ? (
              <div className="space-y-3.5">
                <AnimatePresence>
                  {filteredAduan.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2.5 border-b border-slate-100 pb-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="inline-block bg-teal-50 text-teal-800 border border-teal-200/80 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                            {item.kategori || 'Keluhan'}
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                            {item.judul}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                            <span>👤</span>
                            <span className="font-bold text-slate-700">{item.userName || 'Warga'}</span>
                            <span className="text-slate-300">•</span>
                            <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shrink-0 ${getStatusStyle(item.status)}`}>
                          {item.status || 'PENDING'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                        {item.keterangan}
                      </p>

                      {(item.foto || item.gps) && (
                        <div className="grid grid-cols-2 gap-2 mt-0.5">
                          {item.foto && (
                            <div
                              onClick={() => setPreviewPhoto(item.foto)}
                              className="rounded-xl overflow-hidden shadow-xs border border-slate-200 h-28 cursor-pointer group relative bg-slate-900"
                            >
                              <img src={item.foto} alt="Lampiran Laporan" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-bold">
                                🔍 Lihat Foto
                              </div>
                            </div>
                          )}
                          {item.gps && (
                            <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-2.5 flex flex-col justify-center items-center text-center">
                              <svg className="w-5 h-5 text-amber-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-[10px] text-amber-900 font-bold truncate w-full">{item.gps}</span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.gps)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-teal-700 font-black underline mt-1 hover:text-teal-800"
                              >
                                Buka Google Maps →
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {(isAdminOrPengurus || isKetuaRT) && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-slate-100 mt-1">
                          {isAdminOrPengurus && item.status !== 'Selesai' && (
                            <>
                              {item.status !== 'Proses' && (
                                <button
                                  onClick={() => handleUpdateStatusAduan(item.id, 'Proses')}
                                  className="py-1.5 px-3 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-black transition-colors cursor-pointer"
                                >
                                  Terima & Proses
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatusAduan(item.id, 'Selesai')}
                                className="py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors shadow-2xs cursor-pointer"
                              >
                                ✓ Tandai Selesai
                              </button>
                            </>
                          )}
                          {isKetuaRT && (
                            <button
                              onClick={() => handleDeleteAduan(item.id)}
                              className="py-1.5 px-3 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="w-16 h-16 mb-3 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl">
                  📢
                </div>
                <h3 className="text-sm font-black text-slate-800 mb-1">Belum Ada Laporan Aduan</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  {isAdminOrPengurus
                    ? 'Tidak ada laporan aduan fasilitas/lingkungan yang masuk.'
                    : 'Anda belum pernah mengirimkan laporan aduan lingkungan.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateForm('aduan')}
                  className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-black shadow-sm hover:bg-teal-700 transition cursor-pointer"
                >
                  + Buat Laporan Aduan Baru
                </button>
              </div>
            )
          ) : (
            /* TAB 2: BUKU TAMU */
            filteredTamu.length > 0 ? (
              <div className="space-y-3.5">
                <AnimatePresence>
                  {filteredTamu.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-block bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Tamu 1x24 Jam
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            Pelapor: {item.namaPelapor || 'Warga'}
                          </h4>
                          <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1">
                            <span>🏠</span>
                            <span>{item.alamatPelapor || 'Alamat tidak tertera'}</span>
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            item.status?.toLowerCase() === 'selesai'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {item.status?.toUpperCase() || 'MENGINAP'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] font-bold block uppercase">Hubungan</span>
                          <span className="font-black text-slate-800 text-xs">{item.hubunganTamu || 'Tamu'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] font-bold block uppercase">Jumlah Tamu</span>
                          <span className="font-black text-slate-800 text-xs">{item.jumlahTamu || 1} Orang</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-slate-400 text-[10px] font-bold block uppercase">Rencana Menginap</span>
                          <span className="font-black text-teal-700 text-xs">{item.waktuMenginap || 1} Hari</span>
                        </div>
                      </div>

                      {/* Action Buttons for Tamu */}
                      {(isAdminOrPengurus || isKetuaRT) && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          {isAdminOrPengurus && item.status?.toLowerCase() !== 'selesai' && (
                            <button
                              onClick={() => handleUpdateStatusTamu(item.id, 'Selesai')}
                              className="py-1.5 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <span>✓</span>
                              <span>Tandai Selesai Menginap</span>
                            </button>
                          )}
                          {isKetuaRT && (
                            <button
                              onClick={() => handleDeleteTamu(item.id)}
                              className="py-1.5 px-3 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="w-16 h-16 mb-3 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-2xl">
                  👥
                </div>
                <h3 className="text-sm font-black text-slate-800 mb-1">Belum Ada Laporan Tamu</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  {isAdminOrPengurus
                    ? 'Belum ada warga yang melaporkan tamu menginap 1x24 jam.'
                    : 'Anda belum pernah melaporkan tamu yang menginap di rumah.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateForm('tamu')}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  + Lapor Tamu 1x24 Jam Baru
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal Preview Photo */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md cursor-pointer"
              >
                ✕
              </button>
              <img src={previewPhoto} alt="Pratinjau" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
