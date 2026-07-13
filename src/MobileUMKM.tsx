import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';

let cachedUMKMData: any[] | null = null;

export const MobileUMKM = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedUMKMData || []);
  const [loading, setLoading] = useState(!cachedUMKMData);
  const [nama, setNama] = useState('');
  const [desc, setDesc] = useState('');
  const [kontak, setKontak] = useState('');
  const [showTambahUMKM, setShowTambahUMKM] = useState(false);

  const canCreateAndEdit = ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(currentUser?.role);
  const canDelete = ['admin', 'developer'].includes(currentUser?.role);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/umkm');
      const json = await res.json();
      cachedUMKMData = json.data || [];
      setData(cachedUMKMData!);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const tempId = 'temp-umkm-' + Date.now();
    const newData = {
       id: tempId,
       nama,
       desc,
       kontak,
       date: new Date().toISOString()
    };
    
    setData(prev => [newData, ...prev]);
    setNama('');
    setDesc('');
    setKontak('');
    setShowTambahUMKM(false);

    try {
      await apiFetch('/api/data/umkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, desc, kontak }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    
    
    setData(prev => prev.filter(item => item.id !== id));
    
    try {
      await apiFetch(`/api/data/umkm/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 pb-28 font-sans">
      {/* Header & Back Button */}
      <div className="flex flex-col mb-6 space-y-3">
        <button
          onClick={onBack}
          className="w-fit text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 min-h-[44px] shadow-sm border border-teal-100/30"
          aria-label="Kembali ke menu"
        >
          <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
        <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">
          Direktori UMKM Warga
        </h3>
        <p className="text-gray-600 text-xs font-medium">Dukung usaha lokal di lingkungan kita.</p>
      </div>

      {/* Form Tambah UMKM */}
      {canCreateAndEdit && (
        !showTambahUMKM ? (
          <button
            onClick={() => setShowTambahUMKM(true)}
            className="w-full mb-6 bg-teal-600 text-white font-bold text-sm py-4 rounded-2xl shadow-sm shadow-teal-200 hover:bg-teal-700 hover:shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Tambah UMKM Baru"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah UMKM Baru
          </button>
        ) : (
          <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative transition-all">
            <button
              type="button"
              onClick={() => setShowTambahUMKM(false)}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
              aria-label="Tutup form"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <span className="bg-teal-100 text-teal-600 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              Form Tambah UMKM
            </h4>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nama Usaha</label>
                <input type="text" placeholder="Contoh: Kedai Kopi Pak Budi" value={nama} onChange={e => setNama(e.target.value)} required className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Deskripsi Singkat</label>
                <textarea placeholder="Menjual aneka kopi dan roti bakar..." value={desc} onChange={e => setDesc(e.target.value)} required rows={3} className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Nomor Kontak / WA</label>
                <input type="tel" placeholder="081234567890" value={kontak} onChange={e => setKontak(e.target.value)} required className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Menyimpan...
                  </span>
                ) : 'Simpan Data'}
              </button>
            </form>
          </div>
        )
      )}

      {/* Daftar UMKM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-shadow duration-300 flex flex-col">
            {/* Header/Image Placeholder */}
            <div className="h-24 bg-gradient-to-br from-teal-400 to-emerald-600 relative flex items-center justify-center">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {canDelete && (
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-red-500 hover:text-white hover:bg-red-500 shadow-sm transition-colors"
                  title="Hapus UMKM"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Card Content */}
            <div className="p-4 flex flex-col flex-grow">
              <h5 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{item.nama}</h5>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-grow">
                {item.desc}
              </p>
              
              <a 
                href={`https://wa.me/${item.kontak.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full mt-4 py-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Hubungi WA
              </a>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">Belum ada UMKM</p>
          <p className="text-xs text-gray-500 mt-1">Data UMKM warga akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
};