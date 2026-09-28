import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

interface RtDokumenItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  description?: string;
  uploaderId?: string;
  uploaderName?: string;
  createdAt?: string;
}

export const MobileDokumen = ({ onBack, currentUser, onUpdateUser }: { onBack: () => void, currentUser: any, onUpdateUser: (u: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'pribadi' | 'arsip'>('pribadi');
  const [loading, setLoading] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);

  const [dokumenKk, setDokumenKk] = useState<string>(currentUser?.dokumenKk || '');
  const [dokumenKtp, setDokumenKtp] = useState<string[]>(
    Array.isArray(currentUser?.dokumenKtp)
      ? currentUser.dokumenKtp
      : currentUser?.dokumenKtp
      ? [currentUser.dokumenKtp]
      : []
  );
  const [hasUploaded, setHasUploaded] = useState(
    Boolean(currentUser?.dokumenKk) ||
      (Array.isArray(currentUser?.dokumenKtp) ? currentUser.dokumenKtp.length > 0 : Boolean(currentUser?.dokumenKtp))
  );
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewItem, setPreviewItem] = useState<{ url: string; title: string } | null>(null);

  // Arsip Dokumen RT state
  const [arsipList, setArsipList] = useState<RtDokumenItem[]>([]);
  const [loadingArsip, setLoadingArsip] = useState(false);
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [arsipTitle, setArsipTitle] = useState('');
  const [arsipCategory, setArsipCategory] = useState('Surat RT');
  const [arsipDesc, setArsipDesc] = useState('');
  const [arsipFileUrl, setArsipFileUrl] = useState('');
  const [arsipFileName, setArsipFileName] = useState('');
  const [arsipFileType, setArsipFileType] = useState('');
  const [uploadingArsip, setUploadingArsip] = useState(false);

  // Sync latest user document state from backend on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    apiFetch(`/api/warga/${currentUser.id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          const u = data.user;
          const kk = u.dokumenKk || '';
          const ktp = Array.isArray(u.dokumenKtp)
            ? u.dokumenKtp
            : u.dokumenKtp
            ? [u.dokumenKtp]
            : [];
          setDokumenKk(kk);
          setDokumenKtp(ktp);
          setHasUploaded(Boolean(kk) || ktp.length > 0);
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

  const fetchArsipDokumen = async () => {
    setLoadingArsip(true);
    try {
      const res = await apiFetch('/api/data/dokumen');
      if (res.ok) {
        const json = await res.json();
        setArsipList(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) {
      console.error('Gagal memuat arsip dokumen:', e);
    } finally {
      setLoadingArsip(false);
    }
  };

  useEffect(() => {
    fetchArsipDokumen();
  }, []);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 4500);
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const saveDocumentsToServer = async (nextKk: string, nextKtp: string[], customSuccessMsg?: string) => {
    if (!currentUser?.id) {
      showToast('Sesi pengguna tidak ditemukan. Silakan login ulang.', true);
      return false;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: currentUser.id,
          dokumenKk: nextKk,
          dokumenKtp: nextKtp
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user);
        setHasUploaded(Boolean(nextKk) || nextKtp.length > 0);
        showToast(customSuccessMsg || 'Dokumen berhasil disimpan!');
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
        return true;
      } else {
        showToast(data.error || 'Gagal menyimpan dokumen ke server', true);
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan jaringan saat menyimpan dokumen', true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const processFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Ukuran file maksimal 10MB'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file yang dipilih'));

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          reject(new Error('File kosong atau tidak valid'));
          return;
        }

        // If PDF or non-raster image, return directly
        if (!file.type.startsWith('image/')) {
          resolve(result);
          return;
        }

        // Compress & resize image so text remains sharp and fits database limit
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(dataUrl);
            } else {
              resolve(result);
            }
          } catch {
            resolve(result);
          }
        };
        img.onerror = () => {
          // Fallback to original base64 if browser cannot decode image onto canvas
          resolve(result);
        };
        img.src = result;
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'ktp') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessingFile(true);
    setErrorMsg('');

    try {
      if (type === 'kk') {
        const dataUrl = await processFileToDataUrl(files[0]);
        setDokumenKk(dataUrl);
        await saveDocumentsToServer(dataUrl, dokumenKtp, 'Kartu Keluarga (KK) berhasil diunggah & disimpan!');
      } else {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const dataUrl = await processFileToDataUrl(files[i]);
          uploadedUrls.push(dataUrl);
        }
        const updatedKtp = [...dokumenKtp, ...uploadedUrls];
        setDokumenKtp(updatedKtp);
        await saveDocumentsToServer(dokumenKk, updatedKtp, 'Dokumen KTP berhasil diunggah & disimpan!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses file dokumen', true);
    } finally {
      setProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveKk = async () => {
    setDokumenKk('');
    await saveDocumentsToServer('', dokumenKtp, 'Dokumen KK berhasil dihapus.');
  };

  const removeKtp = async (index: number) => {
    const updatedKtp = dokumenKtp.filter((_, i) => i !== index);
    setDokumenKtp(updatedKtp);
    await saveDocumentsToServer(dokumenKk, updatedKtp, 'Dokumen KTP berhasil dihapus.');
  };

  const handleSave = async () => {
    await saveDocumentsToServer(dokumenKk, dokumenKtp, 'Dokumen berhasil diperbarui!');
  };

  const handleArsipFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingFile(true);
    try {
      const dataUrl = await processFileToDataUrl(file);
      setArsipFileUrl(dataUrl);
      setArsipFileName(file.name);
      setArsipFileType(file.type || 'image/jpeg');
      if (!arsipTitle.trim()) {
        setArsipTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal membaca file arsip', true);
    } finally {
      setProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleUploadArsip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arsipTitle.trim()) {
      showToast('Judul dokumen wajib diisi', true);
      return;
    }
    if (!arsipFileUrl) {
      showToast('Silakan pilih file dokumen terlebih dahulu', true);
      return;
    }

    setUploadingArsip(true);
    try {
      const res = await apiFetch('/api/data/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: arsipTitle.trim(),
          category: arsipCategory,
          description: arsipDesc.trim(),
          fileUrl: arsipFileUrl,
          fileName: arsipFileName,
          fileType: arsipFileType,
          uploaderId: currentUser?.id,
          uploaderName: currentUser?.nama || currentUser?.username || 'Warga'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Dokumen berhasil diunggah ke Arsip RT!');
        setShowArsipModal(false);
        setArsipTitle('');
        setArsipDesc('');
        setArsipFileUrl('');
        setArsipFileName('');
        setArsipFileType('');
        fetchArsipDokumen();
      } else {
        showToast(data.error || 'Gagal mengunggah dokumen arsip', true);
      }
    } catch (err) {
      showToast('Terjadi kesalahan saat mengunggah dokumen', true);
    } finally {
      setUploadingArsip(false);
    }
  };

  const handleDeleteArsip = async (docId: string) => {
    try {
      const res = await apiFetch(`/api/data/dokumen/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Dokumen arsip berhasil dihapus');
        fetchArsipDokumen();
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menghapus dokumen', true);
      }
    } catch {
      showToast('Gagal menghapus dokumen', true);
    }
  };

  const isPdfUrl = (url: string) => url.startsWith('data:application/pdf');
  const canDeleteArsip = (doc: RtDokumenItem) => {
    const role = currentUser?.role || 'warga';
    return ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(role) || doc.uploaderId === currentUser?.id;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full">
      <div className="max-w-2xl mx-auto w-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/85 border-b border-slate-200/60 px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Kembali"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">Dokumen Warga & RT</h2>
              <p className="text-[11px] text-slate-500 font-medium">Unggah KK, KTP, dan berkas administrasi RT</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('pribadi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pribadi' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              KK & KTP Saya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arsip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'arsip' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Arsip RT ({arsipList.length})
            </button>
          </div>
        </div>

        <div className="p-4 mt-1 space-y-5">
          {/* Status Alerts */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMsg}</span>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'pribadi' ? (
            <>
              {/* Section: Kartu Keluarga */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Kartu Keluarga (KK)</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dokumenKk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dokumenKk ? 'Sudah Diunggah' : 'Belum Ada'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Unggah foto atau PDF Kartu Keluarga. Dokumen otomatis tersimpan saat dipilih.</p>

                <input
                  id="upload-kk"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'kk')}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {dokumenKk ? (
                    <motion.div
                      key="kk-preview"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="space-y-3"
                    >
                      <div
                        onClick={() => setPreviewItem({ url: dokumenKk, title: 'Kartu Keluarga (KK)' })}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                      >
                        {isPdfUrl(dokumenKk) ? (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-slate-700">
                            <icons.dokumen className="w-12 h-12 text-teal-600 mb-2" />
                            <p className="text-xs font-bold">Berkas PDF Kartu Keluarga</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Ketuk untuk membuka dokumen</p>
                          </div>
                        ) : (
                          <img src={dokumenKk} alt="Preview KK" className="w-full h-auto object-contain max-h-64 mx-auto" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem({ url: dokumenKk, title: 'Kartu Keluarga (KK)' })}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Lihat Penuh
                        </button>
                        <label
                          htmlFor="upload-kk"
                          className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Ganti KK
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveKk}
                          disabled={loading}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="kk-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <label
                        htmlFor="upload-kk"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 transition-all group"
                      >
                        <div className="w-11 h-11 mb-2 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">Ketuk untuk pilih & unggah KK</span>
                        <span className="text-[10px] text-slate-400 mt-1">Mendukung Foto (JPG, PNG) atau PDF</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: KTP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Kartu Tanda Penduduk (KTP)</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dokumenKtp.length} File
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Dapat mengunggah lebih dari 1 KTP (Suami, Istri, atau Anggota Keluarga).</p>

                <input
                  id="upload-ktp"
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'ktp')}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {dokumenKtp.map((ktp, idx) => (
                      <motion.div
                        key={`ktp-${idx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col"
                      >
                        <div
                          onClick={() => setPreviewItem({ url: ktp, title: `KTP ${idx + 1}` })}
                          className="aspect-[4/3] w-full overflow-hidden cursor-pointer flex items-center justify-center bg-slate-100"
                        >
                          {isPdfUrl(ktp) ? (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-700">
                              <icons.dokumen className="w-8 h-8 text-teal-600 mb-1" />
                              <span className="text-[10px] font-bold">PDF KTP #{idx + 1}</span>
                            </div>
                          ) : (
                            <img src={ktp} alt={`Preview KTP ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewItem({ url: ktp, title: `KTP ${idx + 1}` })}
                            className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                          >
                            Lihat KTP #{idx + 1}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeKtp(idx)}
                            disabled={loading}
                            className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add KTP Card */}
                  <motion.div layout>
                    <label
                      htmlFor="upload-ktp"
                      className="flex flex-col items-center justify-center w-full h-full min-h-[130px] aspect-[4/3] border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 transition-all group"
                    >
                      <div className="w-9 h-9 mb-1.5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700 text-center px-2">Tambah KTP</span>
                      <span className="text-[10px] text-slate-400 text-center px-2 mt-0.5">Pilih Foto / PDF</span>
                    </label>
                  </motion.div>
                </div>
              </div>

              {/* Manual Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || processingFile}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading || processingFile ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{processingFile ? 'Memproses File...' : 'Menyimpan Dokumen...'}</span>
                  </>
                ) : (
                  <span>{hasUploaded ? 'Simpan & Perbarui Dokumen' : 'Simpan Dokumen'}</span>
                )}
              </button>
            </>
          ) : (
            /* TAB 2: ARSIP DOKUMEN RT */
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Arsip & Berkas Dokumen RT</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Unggah peraturan RT, surat edaran, template, atau berkas warga.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArsipModal(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  + Upload Dokumen Baru
                </button>
              </div>

              {loadingArsip ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  Memuat daftar dokumen...
                </div>
              ) : arsipList.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center">
                  <icons.dokumen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Dokumen Arsip</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Klik tombol di atas untuk mengunggah dokumen pertama.</p>
                  <button
                    type="button"
                    onClick={() => setShowArsipModal(true)}
                    className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    + Upload Dokumen Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {arsipList.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          onClick={() => setPreviewItem({ url: doc.fileUrl, title: doc.title })}
                          className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 overflow-hidden cursor-pointer"
                        >
                          {doc.fileUrl && !isPdfUrl(doc.fileUrl) ? (
                            <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                          ) : (
                            <icons.dokumen className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                              {doc.category || 'Dokumen'}
                            </span>
                            {doc.uploaderName && (
                              <span className="text-[10px] text-slate-400 truncate">Oleh: {doc.uploaderName}</span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate mt-1">{doc.title}</h4>
                          {doc.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{doc.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewItem({ url: doc.fileUrl, title: doc.title })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Lihat
                        </button>
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName || `${doc.title}.jpg`}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Unduh
                        </a>
                        {canDeleteArsip(doc) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteArsip(doc.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <icons.delete className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Upload Arsip Dokumen */}
      <AnimatePresence>
        {showArsipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowArsipModal(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleUploadArsip}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base">Upload Dokumen RT</h3>
                <button
                  type="button"
                  onClick={() => setShowArsipModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={arsipTitle}
                  onChange={(e) => setArsipTitle(e.target.value)}
                  placeholder="Contoh: Peraturan Tata Tertib RT 01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={arsipCategory}
                  onChange={(e) => setArsipCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="Surat RT">Surat RT</option>
                  <option value="Peraturan">Peraturan & Tata Tertib</option>
                  <option value="KK">Kartu Keluarga (KK)</option>
                  <option value="KTP">KTP Warga</option>
                  <option value="Lainnya">Berkas Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={arsipDesc}
                  onChange={(e) => setArsipDesc(e.target.value)}
                  placeholder="Ringkasan singkat isi dokumen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih File (Foto / PDF)</label>
                <input
                  id="upload-arsip-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleArsipFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="upload-arsip-file"
                  className="flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 cursor-pointer transition-all"
                >
                  {arsipFileUrl ? (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-1">
                        File Siap Diunggah
                      </span>
                      <p className="text-xs text-slate-600 font-semibold truncate max-w-[260px]">
                        {arsipFileName || 'Dokumen Terpilih'}
                      </p>
                      <p className="text-[10px] text-teal-600 font-bold mt-1">Ketuk untuk ganti file</p>
                    </div>
                  ) : (
                    <>
                      <icons.dokumen className="w-8 h-8 text-teal-600 mb-1.5" />
                      <span className="text-xs font-bold text-slate-700">Ketuk untuk pilih file dokumen</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Mendukung Gambar (JPG/PNG) & PDF</span>
                    </>
                  )}
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArsipModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingArsip || processingFile}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {uploadingArsip ? 'Mengunggah...' : 'Simpan & Upload'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">{previewItem.title}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewItem.url}
                    download={`${previewItem.title}.jpg`}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    Unduh
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-900/5 overflow-auto flex items-center justify-center min-h-[300px]">
                {isPdfUrl(previewItem.url) ? (
                  <iframe src={previewItem.url} title={previewItem.title} className="w-full h-[65vh] rounded-xl border-0" />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
