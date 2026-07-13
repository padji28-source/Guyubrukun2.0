import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Kumpulan Ikon ---
const Icons = {
  back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>,
  receipt: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  check: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  clock: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  alert: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  search: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  upload: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  bell: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
};

let cachedIuranData: any[] | null = null;
let cachedWargaIuranData: any[] | null = null;

export const MobileIuran = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedIuranData || []);
  const [loading, setLoading] = useState(!cachedIuranData);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [nominal, setNominal] = useState(currentUser?.role === 'admin' ? '65000' : '85000');
  const [bulan, setBulan] = useState('Januari');
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [jenisIuran, setJenisIuran] = useState('Iuran Wajib');
  const [wargaList, setWargaList] = useState<any[]>(cachedWargaIuranData || []);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showTambahIuran, setShowTambahIuran] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // admin form state
  const [adminSelectedUserId, setAdminSelectedUserId] = useState('');
  
  useEffect(() => {
    if (adminSelectedUserId === 'all') {
      setNominal('85000');
    } else if (adminSelectedUserId) {
      const user = wargaList.find(w => w.id === adminSelectedUserId);
      if (user?.role === 'admin') setNominal('65000');
      else setNominal('85000');
    }
  }, [adminSelectedUserId, wargaList]);
  
  const [showBayarForm, setShowBayarForm] = useState(false);
  const [buktiBase64, setBuktiBase64] = useState('');
  const [viewBuktiUrl, setViewBuktiUrl] = useState<string | null>(null);

  // Reminders states
  const [showRemindForm, setShowRemindForm] = useState(false);
  const [remindBulan, setRemindBulan] = useState('Januari');
  const [remindTahun, setRemindTahun] = useState(new Date().getFullYear().toString());
  const [remindJenis, setRemindJenis] = useState('Iuran Wajib');
  const [remindTemplate, setRemindTemplate] = useState('Halo {nama}, Anda belum melakukan pembayaran {jenis} untuk periode {bulan}. Silakan lakukan pembayaran segera. Terima kasih.');
  const [remindLoading, setRemindLoading] = useState(false);
  const [remindResult, setRemindResult] = useState<{ success: boolean, count: number, reminded: string[] } | null>(null);

  const isAdminOrBendahara = ['admin', 'developer', 'bendahara'].includes(currentUser?.role);
  
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const totalTagihan = tagihanList.reduce((sum, item) => sum + Number(item.nominal || 0), 0);
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const [adminStatus, setAdminStatus] = useState('verifikasi');

  const fetchData = async () => {
    try {
      const userParam = !isAdminOrBendahara ? `&userId=${currentUser?.id}` : '';
      const statusParam = filterStatus !== 'Semua' ? `&status=${filterStatus === 'Belum Bayar' ? 'belum%20dibayar' : filterStatus === 'Verifikasi' ? 'menunggu' : 'verifikasi'}` : '';
      const res = await apiFetch(`/api/data/iuran?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}${userParam}${statusParam}`);
      const json = await res.json();
      
      if (json.pagination) {
        cachedIuranData = json.data || [];
        setData(cachedIuranData!);
        setTotalPages(json.pagination.pages || 1);
        setTotalElements(json.pagination.total || 0);
      } else {
        cachedIuranData = json.data || [];
        setData(cachedIuranData!);
        setTotalPages(1);
        setTotalElements(cachedIuranData!.length);
      }
      
      if (isAdminOrBendahara) {
        const resWarga = await apiFetch('/api/warga');
        const jsonWarga = await resWarga.json();
        cachedWargaIuranData = jsonWarga.users || [];
        setWargaList(cachedWargaIuranData!);
        if (jsonWarga.users?.length > 0 && !adminSelectedUserId) {
          setAdminSelectedUserId(jsonWarga.users[0].id);
        }
      }

      if (currentUser?.id) {
        const unpaidRes = await apiFetch(`/api/data/iuran?userId=${currentUser?.id}&status=belum%20dibayar`);
        const unpaidJson = await unpaidRes.json();
        setTagihanList(unpaidJson.data || []);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleSendReminders = async () => {
    setRemindLoading(true);
    setRemindResult(null);
    try {
      const res = await apiFetch('/api/iuran/remind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rt-id': currentUser?.rtId || 'rt01',
          'x-user-role': currentUser?.role || 'admin'
        },
        body: JSON.stringify({
          bulan: remindBulan,
          tahun: remindTahun,
          jenis: remindJenis,
          messageTemplate: remindTemplate
        })
      });
      const json = await res.json();
      if (res.ok) {
        setRemindResult({
          success: true,
          count: json.count,
          reminded: json.reminded || []
        });
        // refresh list
        fetchData();
      } else {
        alert(json.error || 'Gagal mengirim pengingat');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan jaringan');
    }
    setRemindLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, filterStatus]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setBuktiBase64(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPembayaran = async () => {
    
    if (!buktiBase64) {
      console.log('Harap unggah bukti pembayaran terlebih dahulu.');
      return;
    }
    
    // Optimistic Update
    const period = `${bulan} ${tahun}`;
    // Cek tagihan yang belum dibayar di periode dan jenis yang sama
    const existing = tagihanList.find(t => t.bulan === period && (t.jenis || 'Iuran Wajib') === jenisIuran);
    
    const tempId = existing ? existing.id : 'temp-bayar-' + Date.now();
    const newDataRow = {
       id: tempId,
       nominal: nominal,
       bulan: period,
       jenis: jenisIuran,
       status: 'menunggu',
       userId: currentUser?.id,
       nama: currentUser?.nama,
       buktiUrl: buktiBase64,
       date: new Date().toISOString()
    };
    
    if (existing) {
       setData(prev => prev.map(item => item.id === existing.id ? { ...item, ...newDataRow } : item));
    } else {
       setData(prev => [newDataRow, ...prev]);
    }
    
    setShowBayarForm(false);
    setBuktiBase64('');
    
    try {
      if (existing) {
        await apiFetch(`/api/data/iuran/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nominal, status: 'menunggu', buktiUrl: buktiBase64 })
        });
      } else {
        await apiFetch('/api/data/iuran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nominal, bulan: period, jenis: jenisIuran, status: 'menunggu', userId: currentUser?.id, nama: currentUser?.nama, buktiUrl: buktiBase64 })
        });
      }
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };

  const handleTambahAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminSelectedUserId) return;
    
    const targetUsers = adminSelectedUserId === 'all' 
      ? wargaList 
      : [wargaList.find(w => w.id === adminSelectedUserId)].filter(Boolean);

    const period = `${bulan} ${tahun}`;
    
    // Optimistic array building
    const tempRows = targetUsers.map((u, idx) => ({
      id: 'temp-iuran-' + Date.now() + '-' + idx,
      nominal: adminSelectedUserId === 'all' ? (u.role === 'admin' ? '65000' : '85000') : nominal,
      bulan: period,
      jenis: jenisIuran,
      status: adminStatus,
      userId: u.id,
      nama: u.nama,
      date: new Date().toISOString()
    }));
    
    setData(prev => [...tempRows, ...prev]);
    setShowTambahIuran(false);
    
    try {
      for (const selectedUser of targetUsers) {
        const userNominal = selectedUser.role === 'admin' ? '65000' : '85000';
        await apiFetch('/api/data/iuran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nominal: adminSelectedUserId === 'all' ? userNominal : nominal, 
            bulan: period,
            jenis: jenisIuran,
            status: adminStatus,
            userId: selectedUser.id,
            nama: selectedUser.nama
          })
        });
      }
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };

  const [showConfirmVerify, setShowConfirmVerify] = useState<{id: string, status: string} | null>(null);
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'verifikasi') setShowConfirmVerify({ id, status: newStatus });
    else await updateStatus(id, newStatus);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update status
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    try {
      await apiFetch(`/api/data/iuran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updaterName: currentUser?.nama })
      });
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };

  const confirmVerify = async () => {
    if (!showConfirmVerify) return;
    await updateStatus(showConfirmVerify.id, showConfirmVerify.status);
    setShowConfirmVerify(null);
  };
  const cancelVerify = () => setShowConfirmVerify(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const handleDeleteClick = (id: string) => setShowConfirmDelete(id);
  const confirmDelete = async () => {
    if (!showConfirmDelete) return;
    const deletedId = showConfirmDelete;
    
    // Optimistic delete
    setData(prev => prev.filter(item => item.id !== deletedId));
    setShowConfirmDelete(null);
    
    try {
      await apiFetch(`/api/data/iuran/${deletedId}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };
  const cancelDelete = () => setShowConfirmDelete(null);

  if (showBayarForm) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 pb-28 min-h-screen bg-slate-50">
        <div className="flex items-center mb-6">
          <button onClick={() => setShowBayarForm(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Icons.back className="w-5 h-5" />
          </button>
          <h2 className="ml-4 text-lg font-extrabold text-slate-800 tracking-tight">Form Pembayaran</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1">Jenis Pembayaran</label>
            <select value={jenisIuran} onChange={e => setJenisIuran(e.target.value)} disabled={loading} className="w-full p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none transition-all mb-4">
              <option value="Iuran Wajib">Iuran Wajib (Keamanan & Kebersihan)</option>
              <option value="Wifi">Pembayaran Wifi</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1">Tujuan Transfer</label>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full translate-x-8 -translate-y-8"></div>
              <p className="text-sm font-medium opacity-90">Bank BCA</p>
              <p className="text-2xl font-extrabold tracking-widest mt-1 mb-1">1234 5678 90</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">A.N. Bendahara RT 01</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1">Nominal Transfer (Rp)</label>
            <input type="number" value={nominal} onChange={e => setNominal(e.target.value)} disabled={loading} className="w-full p-3 text-sm font-extrabold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none transition-all" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1">Periode Pembayaran</label>
            <div className="flex gap-3">
              <select value={bulan} onChange={e => setBulan(e.target.value)} disabled={loading} className="w-1/2 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none transition-all">
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={tahun} onChange={e => setTahun(e.target.value)} disabled={loading} className="w-1/2 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none transition-all">
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1">Upload Bukti Transfer</label>
            <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${buktiBase64 ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50'}`}>
              <input type="file" id="fileUpload" accept="image/*" onChange={handleFileChange} disabled={loading} className="hidden" />
              <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center justify-center">
                {!buktiBase64 ? (
                  <>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-teal-600">
                      <Icons.upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-teal-600">Pilih Foto Bukti Transaksi</span>
                    <span className="text-[10px] text-slate-650 mt-1 font-semibold">Maksimal 5MB (JPG/PNG)</span>
                  </>
                ) : (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                    <img src={buktiBase64} alt="Bukti" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Ganti Foto</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button onClick={submitPembayaran} disabled={loading || !buktiBase64} className="w-full py-4 bg-teal-600 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            {loading ? 'Memproses...' : 'Kirim Bukti Pembayaran'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-28">
      {/* HEADER NAV */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          aria-label="Kembali ke menu"
        >
          <Icons.back className="w-5 h-5" />
        </button>
        <h2 className="ml-4 text-lg font-extrabold text-slate-800 tracking-tight">Iuran Warga</h2>
      </div>
      
      {/* KARTU TAGIHAN UTAMA */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-6 rounded-[2rem] text-white shadow-xl shadow-teal-200 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-10 w-24 h-24 bg-teal-900 opacity-20 rounded-full translate-y-10"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 mb-2 w-max">
              <Icons.receipt className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Tagihan Saya</p>
            </div>
            <h4 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">{formatter.format(totalTagihan)}</h4>
          </div>
          <button 
            onClick={() => {
              if (tagihanList.length > 0) {
                const [b, t] = tagihanList[0].bulan.split(' ');
                setBulan(b); setTahun(t); setNominal(tagihanList[0].nominal);
              }
              setShowBayarForm(true);
            }} 
            disabled={loading} 
            className="px-5 py-2.5 bg-white text-teal-700 rounded-full text-xs font-extrabold shadow-md hover:scale-105 transition-transform"
          >
            Bayar
          </button>
        </div>
        <p className="relative z-10 text-[11px] opacity-90 font-medium mt-4">
          {tagihanList.length > 0 
            ? `⚠️ Anda memiliki ${tagihanList.length} tagihan tertunggak.` 
            : '✅ Semua tagihan lunas. Anda dapat bayar mandiri.'}
        </p>
      </motion.div>

      {/* ADMIN CONTROLS */}
      {isAdminOrBendahara && (
        <div className="flex gap-3 mb-6">
          {!showTambahIuran && !showRemindForm ? (
            <>
              <button 
                onClick={() => setShowTambahIuran(true)} 
                className="flex-1 bg-slate-850 text-white font-extrabold text-[11px] py-4 rounded-2xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-sm font-extrabold leading-none">+</span> Buat Tagihan
              </button>
              <button 
                onClick={() => { setShowRemindForm(true); setRemindResult(null); }} 
                className="flex-1 bg-teal-600 text-white font-extrabold text-[11px] py-4 rounded-2xl shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.bell className="w-4 h-4 shrink-0 text-teal-100" /> Kirim Pengingat
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* REMINDER FORM */}
      {isAdminOrBendahara && showRemindForm && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-6"
        >
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
            <h4 className="font-extrabold text-slate-800 text-sm">Form Pengingat Iuran Otomatis</h4>
            <button 
              type="button" 
              onClick={() => { setShowRemindForm(false); setRemindResult(null); }} 
              className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-650 rounded-full hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bulan Tagihan</label>
                <select value={remindBulan} onChange={e => setRemindBulan(e.target.value)} className="w-full mt-1 p-3 text-xs font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none">
                  {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tahun</label>
                <select value={remindTahun} onChange={e => setRemindTahun(e.target.value)} className="w-full mt-1 p-3 text-xs font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none">
                  {['2024','2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Jenis Iuran</label>
              <select value={remindJenis} onChange={e => setRemindJenis(e.target.value)} className="w-full mt-1 p-3 text-xs font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none">
                <option value="Iuran Wajib">Iuran Wajib (Kas RT)</option>
                <option value="Iuran Keamanan">Iuran Keamanan</option>
                <option value="Iuran Kebersihan">Iuran Kebersihan</option>
                <option value="Dana Sosial">Dana Sosial / Infaq</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Template Pesan</label>
              <textarea 
                value={remindTemplate} 
                onChange={e => setRemindTemplate(e.target.value)} 
                rows={3} 
                placeholder="Gunakan {nama}, {bulan}, {jenis} sebagai placeholder..."
                className="w-full mt-1 p-3 text-xs font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none"
              />
              <p className="text-[9px] text-slate-400 font-medium mt-1">Sistem akan otomatis mengganti tag `{'{nama}'}`, `{'{bulan}'}` dan `{'{jenis}'}`.</p>
            </div>

            {remindResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold space-y-1">
                <p>✅ Pengingat Berhasil Dikirim!</p>
                <p className="font-medium text-[11px] text-emerald-600">Total: {remindResult.count} warga belum bayar yang telah diingatkan.</p>
                {remindResult.reminded.length > 0 && (
                  <p className="text-[10px] font-medium text-slate-500 truncate">Penerima: {remindResult.reminded.join(', ')}</p>
                )}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleSendReminders} 
              disabled={remindLoading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {remindLoading ? 'Memproses...' : '🔔 Kirim Pengingat Ke Semua Warga'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ADD TAGIHAN FORM */}
      {isAdminOrBendahara && showTambahIuran && (
        <AnimatePresence mode="wait">
          <motion.form 
            key="form-tambah" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleTambahAdmin} className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-6 relative overflow-hidden"
          >
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Form Tagihan Warga</h4>
                <button 
                  type="button" 
                  onClick={() => setShowTambahIuran(false)} 
                  className="w-11 h-11 flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200/40 rounded-full hover:bg-slate-200 transition-all"
                  aria-label="Tutup form tagihan"
                >
                  <Icons.back className="w-4 h-4 rotate-180" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Pilih Warga</label>
                  <select value={adminSelectedUserId} onChange={e => setAdminSelectedUserId(e.target.value)} required className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none">
                    <option value="" disabled>-- Silakan Pilih --</option>
                    <option value="all">Semua Warga Terdaftar</option>
                    {wargaList.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Status</label>
                    <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)} required className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none">
                      <option value="belum dibayar">Tagihan Baru</option>
                      <option value="verifikasi">Lunas Langsung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Jenis Iuran</label>
                    <select value={jenisIuran} onChange={e => setJenisIuran(e.target.value)} required className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none">
                      <option value="Iuran Wajib">Iuran Wajib</option>
                      <option value="Wifi">Wifi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Nominal (Rp)</label>
                    <input type="number" value={nominal} onChange={e => setNominal(e.target.value)} required className="w-full mt-1 p-3 text-sm font-bold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Bulan</label>
                    <select value={bulan} onChange={e => setBulan(e.target.value)} required className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none">
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1">Tahun</label>
                    <select value={tahun} onChange={e => setTahun(e.target.value)} required className="w-full mt-1 p-3 text-sm font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none appearance-none">
                      {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-teal-700 transition-all active:scale-[0.98]">{loading ? 'Menyimpan...' : 'Simpan Iuran'}</button>
              </div>
            </motion.form>
          </AnimatePresence>
        )}

      {/* FILTER & SEARCH */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="relative">
          <Icons.search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Cari warga atau bulan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-white border border-slate-200 rounded-2xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none shadow-sm transition-all"
          />
        </div>
        
        <div className="overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          <div className="flex gap-2 w-max">
            {['Semua', 'Belum Bayar', 'Verifikasi', 'Lunas'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilterStatus(f)} 
                className={`text-xs px-4 py-2 rounded-full font-bold transition-colors shadow-sm border ${filterStatus === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h4 className="font-extrabold text-slate-800 text-base mb-3 px-1">Riwayat Iuran {isAdminOrBendahara ? 'Warga' : 'Saya'}</h4>
      
      {/* DAFTAR RIWAYAT */}
      <div className="space-y-3">
        <AnimatePresence>
          {data.filter(d => {
            if (!isAdminOrBendahara && d.userId !== currentUser?.id) return false;
            if (filterStatus === 'Belum Bayar') return d.status === 'belum dibayar';
            if (filterStatus === 'Verifikasi') return d.status === 'menunggu';
            if (filterStatus === 'Lunas') return d.status === 'verifikasi';
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return d.nama?.toLowerCase().includes(query) || d.bulan?.toLowerCase().includes(query);
            }
            return true;
          }).map((item) => {
            
            // Determine Status UI
            let statusConfig = { color: 'bg-slate-100 text-slate-600', icon: <div/>, label: item.status };
            if (item.status === 'verifikasi') statusConfig = { color: 'bg-emerald-50 text-emerald-600', icon: <Icons.check className="w-4 h-4" />, label: 'LUNAS' };
            else if (item.status === 'menunggu') statusConfig = { color: 'bg-amber-50 text-amber-600', icon: <Icons.clock className="w-4 h-4" />, label: 'MENUNGGU VERIFIKASI' };
            else if (item.status === 'belum dibayar') statusConfig = { color: 'bg-rose-50 text-rose-600', icon: <Icons.alert className="w-4 h-4" />, label: 'BELUM DIBAYAR' };
            else if (item.status === 'butuh_konfirmasi') statusConfig = { color: 'bg-purple-50 text-purple-600', icon: <Icons.alert className="w-4 h-4" />, label: 'KONFIRMASI NOMINAL' };

            return (
            <motion.div 
              key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{item.bulan}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {isAdminOrBendahara ? item.nama : 'Tagihan Saya'} {item.jenis ? ` • ${item.jenis}` : ' • Iuran Wajib'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-extrabold text-slate-800 text-sm">{formatter.format(item.nominal)}</p>
                   <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 ${statusConfig.color} border border-current/10`}>
                      {statusConfig.label}
                   </span>
                </div>
              </div>

              {/* Aksi Tambahan untuk Admin */}
              {isAdminOrBendahara && (
                <div className="flex gap-2 pt-3 border-t border-slate-50 flex-wrap">
                  {item.buktiUrl && (
                    <button onClick={() => setViewBuktiUrl(item.buktiUrl)} className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-xl transition-colors">Lihat Bukti</button>
                  )}
                  {item.status !== 'verifikasi' && item.status !== 'butuh_konfirmasi' && (
                    <button onClick={() => handleUpdateStatus(item.id, 'verifikasi')} className="text-[10px] bg-teal-50 text-teal-600 hover:bg-teal-100 font-bold px-3 py-1.5 rounded-xl transition-colors">Verifikasi Lunas</button>
                  )}
                  {['admin', 'developer', 'bendahara'].includes(currentUser?.role) && item.status === 'butuh_konfirmasi' && (
                    <button onClick={() => handleUpdateStatus(item.id, 'verifikasi')} className="text-[10px] bg-teal-500 text-white hover:bg-teal-600 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">Sah Lunas</button>
                  )}
                  <button onClick={() => {
                    const newNominalStr = prompt('Koreksi nominal Iuran (angka saja):', item.nominal);
                    if (newNominalStr) {
                      const newAmount = parseInt(newNominalStr.replace(/\D/g, ''), 10);
                      if (!isNaN(newAmount)) {
                         const newStatus = currentUser?.role === 'admin' ? 'verifikasi' : 'butuh_konfirmasi';
                         apiFetch(`/api/data/iuran/${item.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nominal: newAmount, status: newStatus }) }).then(fetchData);
                      }
                    }
                  }} className="text-[10px] text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-bold transition-colors ml-auto">Koreksi</button>
                  {['admin', 'developer'].includes(currentUser?.role) && (
                    <button onClick={() => handleDeleteClick(item.id)} className="text-[10px] bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-xl transition-colors">Hapus</button>
                  )}
                </div>
              )}
            </motion.div>
            );
          })}
        </AnimatePresence>

        {data.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 mt-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icons.receipt className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-sm font-bold text-slate-600">Belum Ada Riwayat Iuran</p>
             <p className="text-xs text-slate-600 mt-1 font-semibold">Data tagihan atau pembayaran akan tampil di sini.</p>
          </div>
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

      {/* MODAL: LIHAT BUKTI */}
      <AnimatePresence>
        {viewBuktiUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden relative shadow-2xl"
            >
              <button onClick={() => setViewBuktiUrl(null)} className="absolute top-4 right-4 bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex justify-center items-center font-bold hover:bg-slate-200 transition-colors z-10">X</button>
              <div className="p-5 border-b border-slate-50"><h3 className="text-sm font-extrabold text-slate-800 text-center uppercase tracking-wide">Bukti Pembayaran</h3></div>
              <div className="p-5 flex justify-center bg-slate-50">
                <img src={viewBuktiUrl} alt="Bukti" className="max-h-[60vh] object-contain rounded-2xl shadow-sm border border-slate-200" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: KONFIRMASI VERIFIKASI */}
      <AnimatePresence>
        {showConfirmVerify && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-5">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-6 rounded-[2rem] w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.check className="w-8 h-8 text-teal-500" /></div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">Verifikasi Iuran?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Iuran yang diverifikasi akan dinyatakan <span className="font-bold text-teal-600">LUNAS</span> dan masuk ke buku kas. Lanjutkan?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={cancelVerify} className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex-1 hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={confirmVerify} className="px-5 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm flex-1 hover:bg-teal-700 transition-colors shadow-md shadow-teal-200">Ya, Verifikasi</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: KONFIRMASI HAPUS */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-5">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-6 rounded-[2rem] w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.alert className="w-8 h-8 text-rose-500" /></div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">Hapus Data Iuran?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Data yang telah dihapus tidak dapat dipulihkan. Yakin ingin menghapus?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={cancelDelete} className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex-1 hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={confirmDelete} className="px-5 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm flex-1 hover:bg-rose-700 transition-colors shadow-md shadow-rose-200">Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};