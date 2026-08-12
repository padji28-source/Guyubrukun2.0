import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

let cachedDaruratData: any[] | null = null;

export const MobileDarurat = ({ onBack, currentUser }: { onBack: () => void, currentUser?: any }) => {
  const [data, setData] = useState<any[]>(cachedDaruratData || []);
  const [loading, setLoading] = useState(false);
  
  // Permission check: Ketua RT ('admin'), Developer, Pengurus, or allowed menu
  const canEdit = ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(currentUser?.role) || currentUser?.allowedMenus?.includes('Darurat');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', tel: '', type: 'Keamanan' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/data/darurat');
      const json = await res.json();
      cachedDaruratData = json.data || [];
      setData(cachedDaruratData!);
    } catch(e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', tel: '', type: 'Keamanan' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      tel: item.tel || '',
      type: item.type || 'Keamanan'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tel.trim()) {
      setToastMsg({ type: 'error', text: 'Nama kontak dan nomor telepon wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': currentUser?.role || 'admin',
        'x-rt-id': currentUser?.rtId || 'rt01'
      };

      if (editingItem) {
        // UPDATE existing contact
        const res = await apiFetch(`/api/data/darurat/${editingItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: formData.name.trim(),
            tel: formData.tel.trim(),
            type: formData.type.trim()
          })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Gagal memperbarui kontak darurat');
        }
        setToastMsg({ type: 'success', text: 'Kontak darurat berhasil diperbarui!' });
      } else {
        // CREATE new contact
        const res = await apiFetch('/api/data/darurat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: formData.name.trim(),
            tel: formData.tel.trim(),
            type: formData.type.trim(),
            rtId: currentUser?.rtId || 'rt01'
          })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Gagal menambahkan kontak darurat');
        }
        setToastMsg({ type: 'success', text: 'Kontak darurat baru berhasil ditambahkan!' });
      }

      setIsModalOpen(false);
      fetchData();
    } catch(err: any) {
      console.error(err);
      setToastMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kontak "${name}"?`)) return;

    try {
      const res = await apiFetch(`/api/data/darurat/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || 'admin',
          'x-rt-id': currentUser?.rtId || 'rt01'
        }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal menghapus kontak');
      }
      setToastMsg({ type: 'success', text: `Kontak "${name}" telah dihapus.` });
      fetchData();
    } catch(err: any) {
      console.error(err);
      setToastMsg({ type: 'error', text: err.message || 'Gagal menghapus kontak.' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Sticky Header ala iOS */}
        <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/80 border-b border-slate-200/60 px-4 py-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Kontak Darurat</h2>
              <p className="text-[11px] font-medium text-slate-500">Nomor penting siaga 24 jam</p>
            </div>
          </div>

          {/* Tombol Tambah Kontak untuk Ketua RT / Pengurus */}
          {canEdit && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-200 flex items-center gap-1.5 transition-all shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Kontak</span>
            </button>
          )}
        </div>

        {/* Toast Alert Notification */}
        {toastMsg && (
          <div className="p-4">
            <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-sm ${
              toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>{toastMsg.text}</span>
              <button onClick={() => setToastMsg(null)} className="font-bold text-slate-400 hover:text-slate-600">✕</button>
            </div>
          </div>
        )}

        <div className="p-4">
          {data.length > 0 ? (
            <div className="space-y-3.5">
              {data.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Ikon Avatar Darurat */}
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    
                    {/* Informasi Teks */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-sm text-slate-800 truncate">{item.name}</h5>
                        {item.type && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                            {item.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-semibold tracking-wide">
                        {item.tel}
                      </p>
                      
                      {/* Action Buttons khusus Ketua RT / Pengurus */}
                      {canEdit && (
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Kontak
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.name)} 
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Panggil (Action Button) */}
                  <a 
                    href={`tel:${item.tel}`} 
                    className="flex flex-col items-center justify-center w-12 h-12 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all shrink-0 group"
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
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 mb-4 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center border border-rose-100">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">Belum ada kontak darurat yang tersedia.</p>
              {canEdit && (
                <button
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 transition-all"
                >
                  + Tambah Kontak Pertama
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit / Tambah Kontak */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-base text-slate-800">
                  {editingItem ? 'Edit Kontak Darurat' : 'Tambah Kontak Darurat'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Nama Kontak / Instansi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Polsek, Puskesmas, Ketua RT"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Nomor Telepon / Hotline *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890 atau 110"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Kategori / Jenis
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  >
                    <option value="Keamanan">Keamanan (Polisi / Pos Security)</option>
                    <option value="Medis">Medis (Ambulans / Rumah Sakit)</option>
                    <option value="Kebakaran">Kebakaran (Pemadam Kebakaran)</option>
                    <option value="Lingkungan">Lingkungan (Ketua RT / RW / Pengurus)</option>
                    <option value="Bencana">Bencana / SAR</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Kontak</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
