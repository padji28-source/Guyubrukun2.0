import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Ikon internal untuk komponen Acara
const EventIcons = {
  calendar: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  plus: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>,
  close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>,
  trash: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  document: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
};

let cachedAcaraData: any[] | null = null;

const getEventReminder = (dateStr: string) => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  eventDate.setHours(0,0,0,0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return null; // Acara sudah terlewat
  } else if (diffDays === 0) {
    return {
      text: '🚨 Pengingat: Hari ini berlangsung!',
      className: 'bg-rose-50 text-rose-700 border-rose-100 font-extrabold animate-pulse'
    };
  } else if (diffDays === 1) {
    return {
      text: '⏰ Pengingat: Berlangsung besok!',
      className: 'bg-amber-50 text-amber-700 border-amber-100 font-bold'
    };
  } else if (diffDays <= 7) {
    return {
      text: `🔔 Pengingat: Tinggal ${diffDays} hari lagi!`,
      className: 'bg-blue-50 text-blue-700 border-blue-100 font-semibold'
    };
  } else {
    return {
      text: `📅 Pengingat: Terjadwal ${diffDays} hari lagi`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100 font-medium'
    };
  }
};

export const MobileAcaraPage = ({ currentUser }: { currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedAcaraData || []);
  const [loading, setLoading] = useState(!cachedAcaraData);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');

  const canCreateAndEdit = ['admin', 'developer', 'sekretaris', 'bendahara'].includes(currentUser?.role);
  const canDelete = ['admin', 'developer'].includes(currentUser?.role);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/acara');
      const json = await res.json();
      // Mengurutkan acara berdasarkan tanggal terbaru
      const sortedEvents = (json.data || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      cachedAcaraData = sortedEvents;
      setData(cachedAcaraData!);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    // Optimistic Update
    const tempId = 'temp-acara-' + Date.now();
    const newAcara = { id: tempId, title, desc, date };
    
    setTitle(''); setDesc(''); setDate('');
    setShowForm(false);
    
    setData(prev => {
      const updated = [newAcara, ...prev];
      return updated.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    try {
      await apiFetch('/api/data/acara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, desc, date })
      });
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    
    
    setData(prev => prev.filter(item => item.id !== id));
    
    try {
      await apiFetch(`/api/data/acara/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { console.error(e); fetchData(); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-28">
      
      {/* HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/50 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-8 -translate-y-8 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900 opacity-20 rounded-full -translate-x-6 translate-y-6 blur-lg"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 shadow-sm">
              Informasi Warga
            </span>
            <h3 className="text-2xl font-extrabold mt-3 tracking-tight drop-shadow-sm">Agenda Acara</h3>
            <p className="text-xs font-medium text-blue-100 mt-1 opacity-90">Kumpulan kegiatan dan jadwal penting.</p>
          </div>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
             <EventIcons.calendar className="w-7 h-7 text-white" />
          </div>
        </div>
      </motion.div>

      {/* ADMIN CONTROLS (FORM TAMBAH ACARA) */}
      {canCreateAndEdit && (
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.button 
                key="btn-open"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                onClick={() => setShowForm(true)} 
                className="w-full py-4 bg-slate-800 text-white rounded-2xl text-sm font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-slate-700 transition-all flex justify-center items-center gap-2"
              >
                <EventIcons.plus className="w-5 h-5" /> Buat Acara Baru
              </motion.button>
            ) : (
              <motion.form 
                key="form-tambah"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                onSubmit={handleTambah} 
                className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-2">
                  <h4 className="font-extrabold text-slate-800 text-sm">Form Detail Acara</h4>
                  <button type="button" onClick={() => setShowForm(false)} className="w-11 h-11 flex justify-center items-center bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors border border-slate-200/50" aria-label="Tutup form">
                    <EventIcons.close className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5">Judul Kegiatan</label>
                  <input type="text" placeholder="Cth: Kerja Bakti Bulanan" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3.5 text-sm font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all text-slate-800" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5">Tanggal Acara</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3.5 text-sm font-bold bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all text-slate-800 appearance-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5">Deskripsi Lengkap</label>
                  <textarea placeholder="Detail informasi acara..." value={desc} onChange={e => setDesc(e.target.value)} required rows={3} className="w-full p-3.5 text-sm font-medium bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all text-slate-700 resize-none"></textarea>
                </div>
                
                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-md transition-all active:scale-[0.98] min-h-[44px]">
                  {loading ? 'Menyimpan...' : 'Simpan dan Terbitkan'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* DAFTAR ACARA */}
      <div className="flex items-center justify-between mb-4 px-1">
         <h4 className="font-extrabold text-slate-800 text-base tracking-tight">Acara Mendatang</h4>
         <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">
           {data.length} Total
         </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {data.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 mt-2">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <EventIcons.document className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-sm font-bold text-slate-600">Jadwal Kosong</p>
               <p className="text-xs text-slate-600 mt-1 font-semibold">Belum ada acara yang ditambahkan.</p>
            </motion.div>
          ) : (
            data.map((item, index) => {
              const dateObj = new Date(item.date);
              const month = dateObj.toLocaleString('id-ID', { month: 'short' });
              const day = dateObj.getDate();
              const fullDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              
              // Visual cue untuk acara yang sudah lewat (opsional UX tambahan)
              const isPast = dateObj.getTime() < new Date().setHours(0,0,0,0);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}
                  key={item.id} 
                  className={`bg-white rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-slate-100 p-4 flex gap-4 items-start relative overflow-hidden group ${isPast ? 'opacity-70' : ''}`}
                >
                  {/* Blok Tanggal Kiri */}
                  <div className={`w-16 h-[72px] rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner border border-slate-50 ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-b from-blue-50 to-indigo-50 text-blue-600'}`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{month}</span>
                    <span className="text-2xl font-black leading-none mt-0.5">{day}</span>
                  </div>
                  
                  {/* Konten Kanan */}
                  <div className="flex-grow min-w-0 pt-1 pb-1">
                    <h4 className={`text-sm font-extrabold mb-1.5 truncate pr-6 ${isPast ? 'text-slate-600' : 'text-slate-800'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                      <EventIcons.calendar className="w-3.5 h-3.5 shrink-0" /> {fullDate}
                    </p>
                    {(() => {
                      const reminder = getEventReminder(item.date);
                      return reminder ? (
                        <div className={`my-2 text-[10px] px-3 py-2 rounded-xl border flex items-center gap-2 font-bold ${reminder.className}`}>
                          <span>{reminder.text}</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                       <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{item.desc}</p>
                    </div>
                  </div>

                  {/* Tombol Hapus (Admin Only) */}
                  {canDelete && (
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors border border-rose-100 opacity-80 hover:opacity-100"
                      title="Hapus Acara"
                    >
                      <EventIcons.trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};