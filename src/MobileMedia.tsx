import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App'; // Sesuaikan path jika perlu

let cachedMediaData: any[] | null = null;

export const MobileMedia = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [media, setMedia] = useState<any[]>(cachedMediaData || []);
  const [loading, setLoading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrPengurus = currentUser?.allowedMenus?.includes('Media') || currentUser?.role === 'developer';

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/media');
      const json = await res.json();
      cachedMediaData = json.data || [];
      setMedia(cachedMediaData!);
    } catch(e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);

      // Resize logic agar upload Base64 lebih ringan dan tidak error
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;
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

          const base64 = canvas.toDataURL('image/jpeg', 0.8); // Kompresi 80%

          try {
            await apiFetch('/api/data/media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                imageUrl: base64, 
                title: file.name,
                userId: currentUser?.id,
                uploaderName: currentUser?.nama
              })
            });
            fetchData();
          } catch(err) {
            console.error(err);
            console.log('Gagal mengunggah foto.');
          } finally {
            setLoading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string) => {
    
    try {
      await apiFetch(`/api/data/media/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(e) { 
      console.error(e); 
      console.log('Gagal menghapus foto');
    }
  };

  const reversedMedia = useMemo(() => [...media].reverse(), [media]);

  return (
    <div 
      className="bg-slate-50 min-h-screen pb-24 w-full"
    >
      <div className="max-w-xl mx-auto w-full relative">
        
        {/* Sticky Header Glassmorphism */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Galeri Kegiatan</h2>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 text-white font-bold px-4 py-2.5 rounded-full shadow-md shadow-teal-200 hover:bg-teal-700 active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Upload
              </>
            )}
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={loading} />
        </div>
       
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {reversedMedia.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="aspect-square bg-slate-200 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm border border-slate-100" 
                  onClick={() => setViewImage(item.imageUrl)}
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  {/* Gradient Overlay & Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold leading-tight truncate mb-0.5 shadow-sm">{item.uploaderName || 'Anonim'}</span>
                    <span className="text-white/70 text-[10px]">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Action Buttons (Unduh & Hapus) */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {(isAdminOrPengurus || item.userId === currentUser?.id) && (
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full shadow-sm hover:bg-rose-500 transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                    <a 
                      href={item.imageUrl} 
                      download={item.title || 'foto-rt'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-white/80 backdrop-blur-md text-slate-800 p-2 rounded-full shadow-sm hover:bg-white transition-colors flex items-center justify-center"
                      title="Unduh"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {media.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 mb-4 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Galeri Masih Kosong</h3>
              <p className="text-sm text-slate-500">Belum ada foto kegiatan. Jadilah yang pertama membagikan momen!</p>
            </motion.div>
          )}
        </div>

        {/* Lightbox / Image Viewer (Zoom) */}
        <AnimatePresence>
          {viewImage && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" 
              onClick={() => setViewImage(null)}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                {/* Header Lightbox */}
                <div className="absolute top-0 w-full flex justify-between items-center p-4 max-w-xl">
                  <span className="text-white/70 text-xs font-medium">Pratinjau Foto</span>
                  <button 
                    onClick={() => setViewImage(null)} 
                    className="bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 backdrop-blur-md transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  src={viewImage} 
                  alt="Zoom" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};