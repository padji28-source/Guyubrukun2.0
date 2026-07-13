import { apiFetch } from './apiInterceptor';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

export const MobileDokumen = ({ onBack, currentUser, onUpdateUser }: { onBack: () => void, currentUser: any, onUpdateUser: (u: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [dokumenKk, setDokumenKk] = useState<string>(currentUser?.dokumenKk || '');
  const [dokumenKtp, setDokumenKtp] = useState<string[]>(
    Array.isArray(currentUser?.dokumenKtp) ? currentUser.dokumenKtp : (currentUser?.dokumenKtp ? [currentUser.dokumenKtp] : [])
  );
  const [hasUploaded, setHasUploaded] = useState(!!currentUser?.dokumenKk || !!currentUser?.dokumenKtp);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'ktp') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Resize image logic to avoid MongoDB 16MB document limit
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        if (type === 'kk') {
            setDokumenKk(dataUrl);
        } else {
            setDokumenKtp(prev => [...prev, dataUrl]);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Clear input value so same file can be selected again if deleted
    e.target.value = '';
  };

  const removeKtp = (index: number) => {
    setDokumenKtp(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: currentUser.id,
          dokumenKk,
          dokumenKtp
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user);
        setHasUploaded(true);
        setSuccessMsg('Dokumen berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        console.log(data.error || 'Gagal mengunggah dokumen');
      }
    } catch (e) {
      console.error(e);
      console.log('Terjadi kesalahan sistem');
    }
    setLoading(false);
  };

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24 w-full"
    >
      <div className="max-w-xl mx-auto w-full">
        
        {/* Sticky Header Glassmorphism */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 px-4 py-4 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex justify-center items-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
            aria-label="Kembali ke menu"
          >
            <icons.arrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dokumen Pribadi</h2>
        </div>

        <div className="p-4 mt-2 space-y-6">
          
          {/* Pesan Sukses */}
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section: Kartu Keluarga */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Kartu Keluarga (KK)</h3>
            <p className="text-xs text-slate-500 mb-4">Pastikan tulisan terbaca dengan jelas.</p>
            
            <AnimatePresence mode="wait">
              {dokumenKk ? (
                <motion.div 
                  key="kk-preview"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <img src={dokumenKk} alt="Preview KK" className="w-full h-auto object-cover max-h-56" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button onClick={() => setDokumenKk('')} className="bg-rose-500 text-white p-2 rounded-full shadow-lg hover:bg-rose-600 active:scale-95 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="kk-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <label htmlFor="upload-kk" className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-teal-400 transition-all group">
                    <div className="w-10 h-10 mb-2 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Ketuk untuk upload KK</span>
                  </label>
                  <input id="upload-kk" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'kk')} className="hidden" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: KTP */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Kartu Tanda Penduduk (KTP)</h3>
            <p className="text-xs text-slate-500 mb-4">Dapat mengunggah lebih dari 1 KTP (Suami/Istri).</p>

            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {dokumenKtp.map((ktp, idx) => (
                  <motion.div 
                    key={`ktp-${idx}`} 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-[4/3]"
                  >
                    <img src={ktp} alt={`Preview KTP ${idx+1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeKtp(idx)} 
                      className="absolute top-2 right-2 bg-rose-500/90 backdrop-blur text-white p-1.5 rounded-full shadow-sm hover:bg-rose-600 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Tombol Add KTP berupa kotak di dalam Grid */}
              <motion.div layout>
                <label htmlFor="upload-ktp" className="flex flex-col items-center justify-center w-full h-full min-h-[100px] aspect-[4/3] border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-teal-400 transition-all group">
                  <div className="w-8 h-8 mb-1 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center group-hover:bg-teal-100 group-hover:text-teal-600 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 text-center px-2">Tambah KTP</span>
                </label>
                <input id="upload-ktp" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'ktp')} className="hidden" />
              </motion.div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                 <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Menyimpan...
              </>
            ) : (hasUploaded ? 'Perbarui Dokumen' : 'Simpan Dokumen')}
          </button>

        </div>
      </div>
    </div>
  );
};