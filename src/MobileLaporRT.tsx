import { apiFetch } from './apiInterceptor';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App'; // Sesuaikan jika perlu

export const MobileLaporRT = ({ onBack, currentUser, defaultTab }: { onBack: () => void, currentUser: any, defaultTab?: 'Keluhan' | 'Tamu' }) => {
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [kategori, setKategori] = useState('Jalan rusak');
  const [fotoDataUrl, setFotoDataUrl] = useState('');
  const [gpsLocation, setGpsLocation] = useState('');
  
  // Tab Management
  // Jika tidak ada defaultTab, kita buat 'Keluhan' sebagai default agar layarnya tidak kosong
  const [activeTab, setActiveTab] = useState<'Keluhan' | 'Tamu'>(defaultTab || 'Keluhan');
  
  // Tamu states
  const [hubunganTamu, setHubunganTamu] = useState('');
  const [jumlahTamu, setJumlahTamu] = useState('');
  const [waktuMenginap, setWaktuMenginap] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: '🚧 Jalan rusak', value: 'Jalan rusak' },
    { label: '💡 Lampu mati', value: 'Lampu mati' },
    { label: '🗑 Sampah', value: 'Sampah' },
    { label: '💧 Air', value: 'Air' },
    { label: '🐕 Hewan liar', value: 'Hewan liar' },
    { label: '⚠ Keamanan', value: 'Keamanan' },
  ];

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.log('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diberikan.');
        }
      );
    } else {
      console.log('Geolocation tidak didukung di browser ini.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKeluhan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSuccessMsg('');
    const tempJudul = judul;
    const tempKet = keterangan;
    
    setJudul('');
    setKeterangan('');
    setSuccessMsg('Mengirim...');
    
    try {
      await apiFetch('/api/data/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: tempJudul,
          keterangan: tempKet,
          kategori,
          foto: fotoDataUrl,
          gps: gpsLocation,
          status: 'Pending',
          userId: currentUser?.id,
          userName: currentUser?.nama
        })
      });
      setSuccessMsg('Laporan Keluhan berhasil dikirim!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(e) { 
      console.error(e); 
      setJudul(tempJudul);
      setKeterangan(tempKet);
      setSuccessMsg('Gagal mengirim keluhan');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSubmitTamu = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSuccessMsg('');
    
    const tempKeluarga = hubunganTamu;
    const tempJumlah = jumlahTamu;
    const tempWaktu = waktuMenginap;

    setHubunganTamu('');
    setJumlahTamu('');
    setWaktuMenginap('');
    setSuccessMsg('Mengirim...');

    try {
      await apiFetch('/api/data/tamu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPelapor: currentUser?.nama,
          alamatPelapor: currentUser?.alamat,
          hubunganTamu: tempKeluarga,
          jumlahTamu: tempJumlah,
          waktuMenginap: tempWaktu,
          status: 'Dilaporkan',
          userId: currentUser?.id
        })
      });
      setSuccessMsg('Laporan Tamu berhasil dikirim!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(e) { 
      console.error(e); 
      setHubunganTamu(tempKeluarga);
      setJumlahTamu(tempJumlah);
      setWaktuMenginap(tempWaktu);
      setSuccessMsg('Gagal mengirim laporan tamu');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Helper untuk rendering tab button agar rapi
  const renderTabButton = (tabName: 'Keluhan' | 'Tamu', iconPath: string, title: string) => {
    const isActive = activeTab === tabName;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 relative py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-300 ${
          isActive ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
        }`}
      >
        <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={iconPath} />
        </svg>
        <span className="text-xs font-bold">{title}</span>
        
        {/* Indikator Active Tab */}
        {isActive && (
          <motion.div layoutId="active-tab-indicator" className="absolute -bottom-1.5 w-1.5 h-1.5 bg-teal-800 rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24 w-full"
    >
      <div className="max-w-xl mx-auto w-full">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 px-4 py-4 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
            aria-label="Kembali ke menu"
          >
            <icons.arrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Lapor RT</h2>
        </div>

        <div className="p-4 mt-2">
          
          {/* Pesan Sukses Mengambang */}
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm"
              >
                <div className="bg-emerald-100 p-1.5 rounded-full shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold">{successMsg}</h4>
                  <p className="text-xs text-emerald-600/80 mt-0.5">Laporan Anda telah masuk ke sistem.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation (Hanya tampil jika tidak ada defaultTab yang dikunci dari luar) */}
          {!defaultTab && (
            <div className="flex gap-3 mb-6 bg-slate-100/50 p-1.5 rounded-3xl">
              {renderTabButton('Keluhan', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', 'Lapor Keluhan')}
              {renderTabButton('Tamu', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 'Lapor Tamu')}
            </div>
          )}

          {/* Form Area */}
          <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            
            {/* Header Form */}
            <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                {activeTab === 'Keluhan' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {activeTab === 'Keluhan' ? 'Formulir Keluhan Warga' : 'Formulir Laporan Tamu (1x24 Jam)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'Keluhan' ? 'Sampaikan masalah di lingkungan Anda.' : 'Wajib lapor jika ada tamu menginap.'}
                </p>
              </div>
            </div>

            {/* Content Form Berdasarkan Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'Keluhan' ? (
                <motion.form 
                  key="form-keluhan"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
                  onSubmit={handleSubmitKeluhan} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Laporan</label>
                    <input 
                      type="text" placeholder="Contoh: Lampu Jalan Mati di Gg. Mawar" value={judul} onChange={e => setJudul(e.target.value)} required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-600" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Laporan</label>
                    <select 
                      value={kategori} 
                      onChange={e => setKategori(e.target.value)} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan & Lokasi Detail</label>
                    <textarea 
                      placeholder="Ceritakan detail masalahnya..." value={keterangan} onChange={e => setKeterangan(e.target.value)} required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-600"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto Kondisi</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" 
                      />
                      {fotoDataUrl && <div className="mt-2 text-[10px] text-teal-600 font-medium">✅ Foto ditambahkan</div>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Titik GPS</label>
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Ambil Lokasi
                      </button>
                      {gpsLocation && <div className="mt-2 text-[10px] text-teal-600 font-medium truncate">📍 {gpsLocation}</div>}
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !judul.trim() || !keterangan.trim()} className="w-full py-3.5 mt-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2 min-h-[44px]">
                    {loading ? 'Mengirim...' : 'Kirim Laporan Keluhan'}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="form-tamu"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                  onSubmit={handleSubmitTamu} 
                  className="space-y-4"
                >
                  {/* Data Pelapor (Readonly) disembunyikan dalam grup agar rapi */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Data Pelapor (Otomatis)</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-700">{currentUser?.nama || 'Nama Tidak Diketahui'}</span>
                      <span className="text-xs text-slate-500">{currentUser?.alamat || 'Alamat belum diisi di profil'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Hubungan dengan Tamu</label>
                    <div className="relative">
                      <select 
                        value={hubunganTamu} onChange={e => setHubunganTamu(e.target.value)} required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      >
                         <option value="" disabled>Pilih status hubungan...</option>
                         <option value="Orang Tua">Keluarga (Orang Tua)</option>
                         <option value="Saudara">Keluarga (Saudara)</option>
                         <option value="Kerabat Jauh">Kerabat Jauh</option>
                         <option value="Teman">Teman / Rekan Kerja</option>
                         <option value="Lainnya">Lainnya</option>
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Tamu</label>
                      <div className="relative">
                        <input type="number" min="1" placeholder="Misal: 2" value={jumlahTamu} onChange={e => setJumlahTamu(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">Orang</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Rencana Inap</label>
                      <div className="relative">
                        <input type="number" min="1" placeholder="Misal: 3" value={waktuMenginap} onChange={e => setWaktuMenginap(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">Hari</span>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !hubunganTamu || !jumlahTamu || !waktuMenginap} className="w-full py-3.5 mt-4 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2">
                    {loading ? 'Mengirim...' : 'Kirim Laporan Tamu'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};