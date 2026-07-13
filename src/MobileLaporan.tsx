import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

let cachedLaporanData: any[] | null = null;

export const MobileLaporan = ({ onBack, currentUser }: { onBack: () => void, currentUser: any }) => {
  const [data, setData] = useState<any[]>(cachedLaporanData || []);
  const isAdminOrPengurus = ['admin', 'developer', 'sekretaris', 'bendahara'].includes(currentUser?.role);

  const exportToExcel = () => {
    if (currentUser?.role !== 'admin') {
      alert("Hanya Ketua RT yang memiliki akses untuk mengekspor data ke Excel.");
      return;
    }

    const headers = ["ID Laporan", "Jenis / Kategori", "Judul Laporan", "Nama Pelapor", "Isi Laporan / Keterangan", "Koordinat GPS", "Status", "Tanggal"];
    const rows = data.map(item => [
      item.id || "-",
      item.kategori || "Keluhan",
      item.judul || "-",
      item.userName || "-",
      item.keterangan || "-",
      item.gps || "-",
      item.status || "PENDING",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Laporan_Warga_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/laporan');
      const json = await res.json();
      cachedLaporanData = json.data || [];
      setData(cachedLaporanData!);
    } catch(e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    try {
      await apiFetch(`/api/data/laporan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updaterName: currentUser?.nama })
      });
      fetchData();
    } catch(e) { 
      console.error(e); 
      fetchData();
    }
  };

  const handleDeleteLaporan = async (id: string) => {
    
    setData(prev => prev.filter(item => item.id !== id));
    try {
      await apiFetch(`/api/data/laporan/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
      console.log('Gagal menghapus laporan');
      fetchData();
    }
  };

  // Menggunakan useMemo agar filter & reverse tidak dihitung ulang berkali-kali pada tiap render
  const filteredData = useMemo(() => {
    return data
      .filter(d => isAdminOrPengurus || d.userId === currentUser?.id)
      .reverse();
  }, [data, isAdminOrPengurus, currentUser?.id]);

  // Helper untuk warna badge status
  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'selesai') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'proses') return 'bg-sky-100 text-sky-700 border-sky-200';
    return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
  };

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24 w-full"
    >
      {/* Wrapper responsif untuk layar lebar */}
      <div className="max-w-xl mx-auto w-full">
        
        {/* Sticky Header ala iOS (Glassmorphism) */}
        <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Laporan</h2>
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              title="Ekspor laporan ke format Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Export Excel</span>
            </button>
          )}
        </div>

        <div className="p-4 mt-2">
          {filteredData.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredData.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout // Animasi saat item bergeser karena ada yang dihapus/ditambah
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-3"
                  >
                    {/* Bagian Judul & Status */}
                    <div className="flex justify-between items-start gap-3 border-b border-slate-50 pb-3">
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-teal-600 mb-1 uppercase tracking-wider">{item.kategori || 'Keluhan'}</div>
                        <h5 className="text-sm font-bold text-slate-800 leading-tight">{item.judul}</h5>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">👤</span>
                          {item.userName}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusStyle(item.status)}`}>
                        {item.status || 'PENDING'}
                      </span>
                    </div>

                    {/* Keterangan */}
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {item.keterangan}
                    </p>
                    
                    {/* Media Tambahan */}
                    {(item.foto || item.gps) && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {item.foto && (
                          <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 h-24">
                            <img src={item.foto} alt="Lampiran Laporan" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {item.gps && (
                          <div className="rounded-xl bg-orange-50 border border-orange-100 p-2 flex flex-col justify-center items-center text-center">
                            <svg className="w-6 h-6 text-orange-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-[9px] text-orange-600 font-medium truncate w-full">{item.gps}</span>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.gps)}`} target="_blank" rel="noreferrer" className="text-[10px] text-orange-700 font-bold underline mt-1">Buka Map</a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {(isAdminOrPengurus || currentUser?.role === 'admin') && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-3 border-t border-slate-50">
                        {isAdminOrPengurus && item.status !== 'Selesai' && (
                          <div className="flex gap-2 flex-1 w-full">
                            {item.status !== 'Proses' && (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'Proses')} 
                                className="flex-1 py-2 px-3 text-xs bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 active:bg-sky-200 transition-colors"
                              >
                                Terima / Proses
                              </button>
                            )}
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'Selesai')} 
                              className="flex-1 py-2 px-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
                            >
                              Tandai Selesai
                            </button>
                          </div>
                        )}
                        {currentUser?.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteLaporan(item.id)} 
                            className="w-full sm:w-auto py-2 px-4 text-xs bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 active:bg-rose-200 transition-colors"
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
            /* Empty State yang lebih menarik */
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div className="w-20 h-20 mb-4 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Tidak ada laporan</h3>
              <p className="text-sm text-slate-500">
                {isAdminOrPengurus 
                  ? "Belum ada laporan keluhan yang masuk ke sistem."
                  : "Anda belum pernah membuat laporan keluhan."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};