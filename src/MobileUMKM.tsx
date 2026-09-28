import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface UmkmProductItem {
  id: string;
  namaProduk: string;
  harga: number;
  satuan?: string;
}

export interface UmkmItem {
  id: string;
  nama: string;
  name?: string;
  bannerUrl?: string;
  owner: string;
  ownerId?: string;
  alamat: string;
  products: UmkmProductItem[];
  sosmed?: string;
  kontak: string;
  phone?: string;
  category?: string;
  desc?: string;
  status?: 'menunggu_verifikasi' | 'disetujui' | 'ditolak';
  verifiedBy?: string;
  verifiedByRole?: string;
  verifiedAt?: string;
  catatanVerifikasi?: string;
  createdAt?: string;
}

let cachedUMKMData: UmkmItem[] | null = null;

const formatRupiah = (num: number | string | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
};

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'admin':
      return 'Ketua RT';
    case 'bendahara':
      return 'Bendahara';
    case 'pengurus':
      return 'Pengurus RT';
    case 'sekretaris':
      return 'Sekretaris';
    case 'developer':
      return 'Admin Sistem';
    default:
      return 'Pengurus RT';
  }
};

const formatWaNumber = (raw: string) => {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
};

const getSosmedHref = (sosmed?: string) => {
  if (!sosmed) return null;
  const trimmed = sosmed.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1).split(/\s+/)[0];
    return `https://instagram.com/${handle}`;
  }
  if (trimmed.toLowerCase().includes('instagram.com/') || trimmed.toLowerCase().includes('tiktok.com/') || trimmed.toLowerCase().includes('facebook.com/')) {
    return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
  }
  return null;
};

// Helper to compress uploaded banner photo into clean base64 data URL
const compressBannerImage = (file: File, maxWidth = 1000, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(ev.target?.result as string);
      img.src = ev.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const MobileUMKM = ({ onBack, currentUser }: { onBack: () => void; currentUser?: any }) => {
  const [data, setData] = useState<UmkmItem[]>(cachedUMKMData || []);
  const [loading, setLoading] = useState(!cachedUMKMData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Role check: Ketua RT (admin), pengurus, bendahara, sekretaris, developer can verify
  const canVerify = ['admin', 'bendahara', 'pengurus', 'sekretaris', 'developer'].includes(currentUser?.role);

  // Filter & Search State
  const [activeTab, setActiveTab] = useState<'semua' | 'usaha_saya' | 'perlu_verifikasi'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<UmkmItem | null>(null);

  // Form Modal State (Input / Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [category, setCategory] = useState('Kuliner');
  const [alamat, setAlamat] = useState(currentUser?.alamat || '');
  const [sosmed, setSosmed] = useState('');
  const [kontakWa, setKontakWa] = useState(currentUser?.noHp || '');
  const [desc, setDesc] = useState('');
  const [products, setProducts] = useState<UmkmProductItem[]>([
    { id: 'prod-1', namaProduk: '', harga: 0, satuan: 'pcs / porsi' },
  ]);

  // Toast Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/umkm');
      const json = await res.json();
      const rawList = Array.isArray(json.data) ? json.data : [];
      const normalized: UmkmItem[] = rawList.map((item: any) => ({
        ...item,
        id: item.id,
        nama: item.nama || item.name || 'Usaha Warga',
        owner: item.owner || 'Warga RT',
        ownerId: item.ownerId || '',
        alamat: item.alamat || 'Lingkungan RT',
        kontak: item.kontak || item.phone || '',
        sosmed: item.sosmed || '',
        bannerUrl: item.bannerUrl || '',
        category: item.category || 'Kuliner',
        desc: item.desc || '',
        products: Array.isArray(item.products) && item.products.length > 0
          ? item.products.map((p: any, idx: number) => ({
              id: p.id || `p-${idx}`,
              namaProduk: p.namaProduk || '',
              harga: Number(p.harga) || 0,
              satuan: p.satuan || '',
            }))
          : item.price
          ? [{ id: 'p-legacy', namaProduk: item.nama || item.name || 'Produk Utama', harga: Number(String(item.price).replace(/[^0-9]/g, '')) || 0 }]
          : [],
        // Legacy records without status are treated as 'disetujui'
        status: item.status || 'disetujui',
      }));
      cachedUMKMData = normalized;
      setData(normalized);
    } catch (e) {
      console.error('Error fetching UMKM:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => fetchData();
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, []);

  // Reset & Open Form for Creating New UMKM (Alamat & WA otomatis terisi sesuai akun warga yang login)
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setBannerUrl('');
    setNamaUsaha('');
    setCategory('Kuliner');
    setAlamat(currentUser?.alamat || '');
    setSosmed('');
    setKontakWa(currentUser?.noHp || '');
    setDesc('');
    setProducts([{ id: `prod-${Date.now()}`, namaProduk: '', harga: 0, satuan: '' }]);
    setShowFormModal(true);
  };

  // Open Form for Editing Existing UMKM
  const handleOpenEditForm = (item: UmkmItem) => {
    setEditingId(item.id);
    setBannerUrl(item.bannerUrl || '');
    setNamaUsaha(item.nama || '');
    setCategory(item.category || 'Kuliner');
    setAlamat(item.alamat || currentUser?.alamat || '');
    setSosmed(item.sosmed || '');
    setKontakWa(item.kontak || currentUser?.noHp || '');
    setDesc(item.desc || '');
    setProducts(
      item.products && item.products.length > 0
        ? item.products.map((p) => ({ ...p }))
        : [{ id: `prod-${Date.now()}`, namaProduk: '', harga: 0, satuan: '' }]
    );
    setShowFormModal(true);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    setUploadingBanner(true);
    try {
      const compressed = await compressBannerImage(file);
      setBannerUrl(compressed);
    } catch (err) {
      console.error('Gagal memproses foto banner:', err);
      showToast('error', 'Gagal memproses foto banner.');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleAddProductRow = () => {
    setProducts((prev) => [
      ...prev,
      { id: `prod-${Date.now()}-${prev.length}`, namaProduk: '', harga: 0, satuan: '' },
    ]);
  };

  const handleRemoveProductRow = (id: string) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleProductChange = (id: string, field: 'namaProduk' | 'harga' | 'satuan', value: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field === 'harga') {
          const cleanNumber = Number(value.replace(/[^0-9]/g, '')) || 0;
          return { ...p, harga: cleanNumber };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUsaha.trim()) {
      showToast('error', 'Nama Usaha wajib diisi.');
      return;
    }
    const validProducts = products.filter((p) => p.namaProduk.trim() !== '');
    if (validProducts.length === 0) {
      showToast('error', 'Masukkan minimal 1 produk beserta harganya.');
      return;
    }
    if (!kontakWa.trim()) {
      showToast('error', 'Nomor Kontak WA wajib diisi.');
      return;
    }

    setSubmitting(true);
    const payload = {
      nama: namaUsaha.trim(),
      name: namaUsaha.trim(),
      bannerUrl,
      owner: currentUser?.nama || 'Warga RT',
      ownerId: currentUser?.id || '',
      alamat: alamat.trim() || currentUser?.alamat || 'Lingkungan RT',
      products: validProducts,
      sosmed: sosmed.trim(),
      kontak: kontakWa.trim(),
      phone: kontakWa.trim(),
      category,
      desc: desc.trim(),
      updaterName: currentUser?.nama || 'Warga',
    };

    try {
      if (editingId) {
        const res = await apiFetch(`/api/data/umkm/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal memperbarui data UMKM.');
        }
        showToast(
          'success',
          canVerify
            ? 'Data UMKM berhasil diperbarui.'
            : 'Perubahan UMKM disimpan dan menunggu verifikasi pengurus.'
        );
      } else {
        const res = await apiFetch('/api/data/umkm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal mendaftarkan UMKM.');
        }
        showToast(
          'success',
          'Usaha berhasil didaftarkan! Menunggu verifikasi Ketua RT, Pengurus, atau Bendahara.'
        );
      }
      setShowFormModal(false);
      await fetchData();
      window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'umkm' }));
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan saat menyimpan UMKM.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Verifikasi oleh Ketua RT, Pengurus, dan Bendahara
  const handleVerifyStatus = async (item: UmkmItem, newStatus: 'disetujui' | 'ditolak') => {
    if (!canVerify) return;
    const verifierLabel = `${currentUser?.nama || 'Pengurus'} (${getRoleLabel(currentUser?.role)})`;
    try {
      const res = await apiFetch(`/api/data/umkm/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          verifiedBy: verifierLabel,
          verifiedByRole: currentUser?.role || 'pengurus',
          verifiedAt: new Date().toISOString(),
          updaterName: verifierLabel,
        }),
      });
      if (res.ok) {
        showToast(
          'success',
          newStatus === 'disetujui'
            ? `UMKM "${item.nama}" telah diverifikasi & disetujui!`
            : `Pengajuan UMKM "${item.nama}" telah ditolak.`
        );
        await fetchData();
        if (selectedDetail?.id === item.id) {
          setSelectedDetail((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  verifiedBy: verifierLabel,
                  verifiedAt: new Date().toISOString(),
                }
              : null
          );
        }
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'umkm' }));
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal memproses verifikasi UMKM.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Gagal memproses verifikasi UMKM.');
    }
  };

  const handleDelete = async (item: UmkmItem) => {
    try {
      const res = await apiFetch(`/api/data/umkm/${item.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updaterName: currentUser?.nama || 'Pengguna' }),
      });
      if (res.ok) {
        setData((prev) => prev.filter((d) => d.id !== item.id));
        if (selectedDetail?.id === item.id) setSelectedDetail(null);
        showToast('success', `UMKM "${item.nama}" berhasil dihapus.`);
        fetchData();
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal menghapus UMKM.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Gagal menghapus UMKM.');
    }
  };

  // Counts & Filtered Lists
  const pendingCount = useMemo(
    () => data.filter((d) => d.status === 'menunggu_verifikasi').length,
    [data]
  );

  const myUmkmCount = useMemo(
    () =>
      data.filter(
        (d) =>
          (currentUser?.id && d.ownerId === currentUser.id) ||
          (currentUser?.nama && d.owner?.toLowerCase() === currentUser.nama.toLowerCase())
      ).length,
    [data, currentUser]
  );

  const displayedList = useMemo(() => {
    return data.filter((item) => {
      const isMine =
        (currentUser?.id && item.ownerId === currentUser.id) ||
        (currentUser?.nama && item.owner?.toLowerCase() === currentUser.nama.toLowerCase());

      if (activeTab === 'perlu_verifikasi') {
        if (item.status !== 'menunggu_verifikasi') return false;
      } else if (activeTab === 'usaha_saya') {
        if (!isMine) return false;
      } else {
        // Tab 'semua':
        // Tampilkan UMKM yang sudah 'disetujui', ATAU milik warga itu sendiri, ATAU jika user adalah verifikator
        if (item.status !== 'disetujui' && !isMine && !canVerify) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.nama?.toLowerCase().includes(q);
        const matchOwner = item.owner?.toLowerCase().includes(q);
        const matchAlamat = item.alamat?.toLowerCase().includes(q);
        const matchProd = item.products?.some((p) => p.namaProduk.toLowerCase().includes(q));
        return matchNama || matchOwner || matchAlamat || matchProd;
      }

      return true;
    });
  }, [data, activeTab, searchQuery, currentUser, canVerify]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-6 pb-28 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold flex items-center justify-between gap-3 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Tombol Tambah UMKM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1.5">
          <button
            onClick={onBack}
            className="w-fit text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[40px] border border-teal-100 cursor-pointer"
          >
            <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl tracking-tight">
            Direktori UMKM Warga
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            Semua warga dapat mendaftarkan usahanya. Pengajuan akan diverifikasi oleh Ketua RT, Pengurus, atau Bendahara.
          </p>
        </div>

        <button
          onClick={handleOpenCreateForm}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs md:text-sm px-5 py-3.5 rounded-2xl shadow-md shadow-teal-600/15 transition-all flex items-center justify-center gap-2 min-h-[44px] shrink-0 cursor-pointer active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Daftarkan Usaha / UMKM
        </button>
      </div>

      {/* Info Banner Verifikasi untuk Ketua RT, Pengurus & Bendahara */}
      {canVerify && pendingCount > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              {pendingCount}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">
                Menunggu Verifikasi Pengurus ({pendingCount} Usaha Warga)
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Sebagai {getRoleLabel(currentUser?.role)}, Anda dapat memeriksa dan menyetujui UMKM yang diajukan warga.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('perlu_verifikasi')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Tinjau Sekarang
          </button>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('semua')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'semua'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua UMKM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usaha_saya')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'usaha_saya'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Usaha Saya ({myUmkmCount})
          </button>
          {canVerify && (
            <button
              type="button"
              onClick={() => setActiveTab('perlu_verifikasi')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'perlu_verifikasi'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Perlu Verifikasi</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari usaha, produk, atau alamat..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid Daftar UMKM */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayedList.map((item) => {
          const isOwner =
            (currentUser?.id && item.ownerId === currentUser.id) ||
            (currentUser?.nama && item.owner?.toLowerCase() === currentUser.nama.toLowerCase());
          const canManageItem = canVerify || isOwner;
          const sosmedHref = getSosmedHref(item.sosmed);
          const waNumber = formatWaNumber(item.kontak);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Foto Banner Usaha */}
              <div
                onClick={() => setSelectedDetail(item)}
                className="h-44 w-full bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 relative overflow-hidden cursor-pointer group"
              >
                {item.bannerUrl ? (
                  <img
                    src={item.bannerUrl}
                    alt={item.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-4 text-center">
                    <svg className="w-10 h-10 mb-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-[11px] font-semibold tracking-wide">{item.nama}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent" />

                {/* Action Edit / Delete di pojok kanan atas */}
                {canManageItem && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(item)}
                      className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="Edit UMKM"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="bg-white/90 hover:bg-rose-600 text-rose-600 hover:text-white p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="Hapus UMKM"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Title & Owner overlay on Banner bottom */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[11px] font-medium text-teal-200 flex items-center gap-1.5 truncate">
                    <span>{item.category || 'UMKM Warga'}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {item.status === 'menunggu_verifikasi'
                        ? 'Menunggu Verifikasi'
                        : item.status === 'ditolak'
                        ? 'Perlu Perbaikan'
                        : 'Terverifikasi RT'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base md:text-lg leading-snug truncate mt-0.5">
                    {item.nama}
                  </h4>
                </div>
              </div>

              {/* Body Card */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Informasi Pemilik & Alamat Otomatis */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Usaha</span>
                        <span className="font-bold text-slate-800 break-words">{item.alamat || '-'}</span>
                        <span className="text-slate-400"> · Oleh {item.owner}</span>
                      </div>
                    </div>

                    {/* Sosmed & Kontak WA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 mt-2">
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Sosmed</span>
                        {item.sosmed ? (
                          sosmedHref ? (
                            <a
                              href={sosmedHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-teal-700 hover:underline truncate block"
                            >
                              {item.sosmed}
                            </a>
                          ) : (
                            <span className="font-semibold text-slate-700 truncate block">{item.sosmed}</span>
                          )
                        ) : (
                          <span className="text-slate-400 italic">Tidak dicantumkan</span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Kontak WA</span>
                        <span className="font-bold text-slate-800">{item.kontak || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Daftar Produk & Harga (Multi-produk) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                        Daftar Produk & Harga ({item.products?.length || 0})
                      </span>
                      {(item.products?.length || 0) > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(item)}
                          className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          Lihat Semua
                        </button>
                      )}
                    </div>

                    {item.products && item.products.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
                        {item.products.slice(0, 3).map((prod, idx) => (
                          <div
                            key={prod.id || idx}
                            className="px-3 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">{prod.namaProduk}</p>
                              {prod.satuan && (
                                <p className="text-[10px] text-slate-400">{prod.satuan}</p>
                              )}
                            </div>
                            <span className="font-extrabold text-teal-700 shrink-0">
                              {formatRupiah(prod.harga)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-2">{item.desc || 'Hubungi penjual untuk info produk.'}</p>
                    )}
                  </div>
                </div>

                {/* Bagian Bawah: Status Verifikasi / Tombol Verifikasi & Tombol Hubungi WA */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {item.verifiedBy && item.status === 'disetujui' && (
                    <p className="text-[11px] text-slate-500">
                      Diverifikasi oleh <span className="font-semibold text-slate-700">{item.verifiedBy}</span>
                    </p>
                  )}

                  {/* Panel Verifikasi khusus Ketua RT, Pengurus, dan Bendahara */}
                  {canVerify && item.status === 'menunggu_verifikasi' && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2">
                      <p className="text-[11px] font-bold text-amber-900">
                        Verifikasi Pengajuan UMKM Warga:
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyStatus(item, 'disetujui')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          ✓ Setujui & Tayangkan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyStatus(item, 'ditolak')}
                          className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetail(item)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Detail Produk
                    </button>
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Halo ${item.owner}, saya warga RT tertarik memesan produk dari *${item.nama}* yang terdaftar di Direktori UMKM Warga.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Hubungi WA</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayedList.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-10 text-center my-6 max-w-md mx-auto">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h4 className="text-sm font-extrabold text-slate-800">
            {activeTab === 'perlu_verifikasi'
              ? 'Tidak Ada Antrean Verifikasi UMKM'
              : activeTab === 'usaha_saya'
              ? 'Anda Belum Mendaftarkan Usaha'
              : 'Belum Ada UMKM Terdaftar'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {activeTab === 'perlu_verifikasi'
              ? 'Seluruh pengajuan UMKM warga telah selesai ditinjau.'
              : 'Mari dukung ekonomi warga dengan mendaftarkan usaha atau produk rumah tangga Anda.'}
          </p>
          {activeTab !== 'perlu_verifikasi' && (
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              + Daftarkan Usaha Sekarang
            </button>
          )}
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT UMKM */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFormModal(false)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmitForm}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {editingId ? 'Edit Data UMKM' : 'Pendaftaran UMKM Warga'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lengkapi detail usaha Anda. Data akan diverifikasi oleh Ketua RT, Pengurus, atau Bendahara.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 1. Foto Banner Usaha */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2">
                  Foto Banner Usaha
                </label>
                <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 overflow-hidden flex flex-col items-center justify-center transition-colors">
                  {bannerUrl ? (
                    <>
                      <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/35 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3.5 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold cursor-pointer shadow-sm">
                          Ganti Banner
                          <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setBannerUrl('')}
                          className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                      <svg className="w-8 h-8 text-teal-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs font-bold text-teal-700">
                        {uploadingBanner ? 'Memproses Foto Banner...' : 'Klik untuk Unggah Foto Banner Usaha'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Format JPG, PNG, atau WEBP (Rasio landscape disarankan)
                      </span>
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* 2. Nama Usaha & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Nama Usaha *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    placeholder="Contoh: Dapur Bu Ani / Kopi Rukun"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                  >
                    <option value="Kuliner">Kuliner & Makanan</option>
                    <option value="Minuman">Minuman & Kedai</option>
                    <option value="Sembako">Sembako & Kelontong</option>
                    <option value="Jasa">Jasa & Layanan</option>
                    <option value="Fashion">Fashion & Pakaian</option>
                    <option value="Kerajinan">Kerajinan & Lainnya</option>
                  </select>
                </div>
              </div>

              {/* 3. Produk dan Harga Produk yang dijual (Bisa beberapa produk) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700">
                      Produk & Harga Produk yang Dijual *
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Bisa menambahkan beberapa produk sekaligus beserta harganya
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Tambah Produk
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {products.map((prod, index) => (
                    <div
                      key={prod.id}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          Nama Produk #{index + 1}
                        </label>
                        <input
                          type="text"
                          required={index === 0}
                          value={prod.namaProduk}
                          onChange={(e) => handleProductChange(prod.id, 'namaProduk', e.target.value)}
                          placeholder="Contoh: Nasi Uduk Komplit"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="col-span-9 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          Harga (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            required={index === 0}
                            value={prod.harga ? prod.harga.toLocaleString('id-ID') : ''}
                            onChange={(e) => handleProductChange(prod.id, 'harga', e.target.value)}
                            placeholder="15.000"
                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-1 flex justify-end pt-4">
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProductRow(prod.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                            title="Hapus produk ini"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Alamat (Otomatis terisi sesuai yang input) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-700">
                    Alamat Usaha *
                  </label>
                  <span className="text-[10px] font-semibold text-teal-600">
                    Otomatis terisi sesuai profil ({currentUser?.nama || 'Warga'})
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Alamat otomatis sesuai profil warga"
                  className="w-full px-3.5 py-2.5 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              {/* 5. Sosmed & Kontak WA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Sosmed :
                  </label>
                  <input
                    type="text"
                    value={sosmed}
                    onChange={(e) => setSosmed(e.target.value)}
                    placeholder="Contoh: @dapur_buani (IG / TikTok / FB)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Kontak WA : *
                  </label>
                  <input
                    type="tel"
                    required
                    value={kontakWa}
                    onChange={(e) => setKontakWa(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Deskripsi Tambahan (Opsional) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Catatan / Jam Operasional (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Buka setiap hari pukul 07.00 - 20.00 WIB, menerima pesan antar dalam RT."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500 resize-none"
                />
              </div>

              {/* Info Verifikasi */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                Catatan: Pengajuan UMKM warga akan diverifikasi terlebih dahulu oleh <strong>Ketua RT, Pengurus, atau Bendahara</strong> sebelum tampil ke seluruh warga.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingBanner}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Kirim & Ajukan Verifikasi'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL UMKM LENGKAP */}
      <AnimatePresence>
        {selectedDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDetail(null)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden"
            >
              {/* Banner Header */}
              <div className="h-52 w-full bg-gradient-to-br from-teal-600 to-emerald-800 relative">
                {selectedDetail.bannerUrl ? (
                  <img
                    src={selectedDetail.bannerUrl}
                    alt={selectedDetail.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60 font-extrabold text-lg">
                    {selectedDetail.nama}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="text-xs text-teal-200 font-medium">
                    {selectedDetail.category || 'UMKM Warga'} · Pemilik: {selectedDetail.owner}
                  </div>
                  <h3 className="text-xl font-extrabold mt-0.5">{selectedDetail.nama}</h3>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Detail Informasi Usaha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Usaha</span>
                    <span className="font-bold text-slate-800">{selectedDetail.alamat || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sosmed</span>
                    {selectedDetail.sosmed ? (
                      getSosmedHref(selectedDetail.sosmed) ? (
                        <a
                          href={getSosmedHref(selectedDetail.sosmed)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-teal-700 hover:underline break-all"
                        >
                          {selectedDetail.sosmed}
                        </a>
                      ) : (
                        <span className="font-bold text-slate-800 break-all">{selectedDetail.sosmed}</span>
                      )
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Kontak WA</span>
                    <span className="font-bold text-slate-800">{selectedDetail.kontak || '-'}</span>
                  </div>
                  {selectedDetail.desc && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Deskripsi / Jam Buka</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedDetail.desc}</p>
                    </div>
                  )}
                </div>

                {/* Daftar Semua Produk & Harga */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                    Katalog Produk & Harga ({selectedDetail.products?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                    {selectedDetail.products && selectedDetail.products.length > 0 ? (
                      selectedDetail.products.map((prod, idx) => (
                        <div
                          key={prod.id || idx}
                          className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900">{prod.namaProduk}</p>
                            <p className="text-xs font-extrabold text-teal-700 mt-0.5">
                              {formatRupiah(prod.harga)}
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/${formatWaNumber(selectedDetail.kontak)}?text=${encodeURIComponent(
                              `Halo ${selectedDetail.owner} (*${selectedDetail.nama}*), saya ingin memesan produk *${prod.namaProduk}* (${formatRupiah(prod.harga)}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-xl text-[11px] font-bold transition-colors shrink-0"
                          >
                            Pesan via WA
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-slate-400 text-center">
                        Belum ada rincian produk.
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Verifikasi di dalam Modal Detail bagi Ketua RT, Pengurus & Bendahara */}
                {canVerify && selectedDetail.status === 'menunggu_verifikasi' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-xs font-extrabold text-amber-900">
                      Tindakan Verifikasi ({getRoleLabel(currentUser?.role)}):
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyStatus(selectedDetail, 'disetujui')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        ✓ Verifikasi & Setujui UMKM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyStatus(selectedDetail, 'ditolak')}
                        className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}

                <a
                  href={`https://wa.me/${formatWaNumber(selectedDetail.kontak)}?text=${encodeURIComponent(
                    `Halo ${selectedDetail.owner}, saya warga RT ingin bertanya mengenai usaha *${selectedDetail.nama}*.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Hubungi WhatsApp ({selectedDetail.kontak})</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
