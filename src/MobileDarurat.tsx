import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { icons } from './App'; // Pastikan import icons dari App atau sesuaikan path-nya

let cachedDaruratData: any[] | null = null;

export const MobileDarurat = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedDaruratData || []);
  const isAdmin = currentUser?.allowedMenus?.includes('Darurat') || currentUser?.role === 'developer';

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/darurat');
      const json = await res.json();
      cachedDaruratData = json.data || [];
      setData(cachedDaruratData!);
    } catch(e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id: string) => {
    const item = data.find(d => d.id === id);
    if (!item) return;
    const newTel = prompt(`Masukkan nomor baru untuk ${item.name}`, item.tel);
    if (!newTel) return;

    try {
      await apiFetch(`/api/data/darurat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: newTel })
      });
      console.log('Data kontak darurat berhasil diperbarui!');
      fetchData();
    } catch(e) { 
      console.error(e); 
      console.log('Gagal memperbarui nomor darurat.');
    }
  };

  return (
    <div 
      className="bg-slate-50 min-h-screen pb-24 w-full"
    >
      <div className="max-w-xl mx-auto w-full">
        
        {/* Sticky Header ala iOS */}
        <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 px-4 py-4 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
            aria-label="Kembali ke menu"
          >
            <icons.arrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Kontak Darurat</h2>
        </div>

        <div className="p-4 mt-2">
          {data.length > 0 ? (
            <div className="space-y-4">
              {data.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }} // Snappier presentation
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    {/* Ikon Avatar Darurat */}
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    
                    {/* Informasi Teks */}
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">{item.name}</h5>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {item.type} • <span className="text-slate-800 font-semibold">{item.tel}</span>
                      </p>
                      
                      {/* Tombol Edit Khusus Admin */}
                      {isAdmin && (
                        <button 
                          onClick={() => handleUpdate(item.id)} 
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-800 mt-1.5 flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-md w-max min-h-[32px]"
                          aria-label={`Ubah nomor ${item.name}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Nomor
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tombol Panggil (Action Button) */}
                  <a 
                    href={`tel:${item.tel}`} 
                    className="flex flex-col items-center justify-center w-12 h-12 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-200 hover:bg-rose-700 hover:shadow-lg active:scale-95 transition-all shrink-0 group"
                    title={`Hubungi ${item.name}`}
                    aria-label={`Hubungi telepon darurat ${item.name}`}
                  >
                    <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 mb-4 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              </div>
              <p className="text-sm text-slate-500">Belum ada kontak darurat yang tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};