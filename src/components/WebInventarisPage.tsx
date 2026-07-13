import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Clipboard, 
  Loader2, 
  Filter, 
  CheckCircle,
  X,
  RefreshCw,
  Clock,
  Wrench
} from 'lucide-react';

interface InventarisItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat';
  location: string;
  status: 'tersedia' | 'dipinjam';
  notes: string;
  createdAt?: string;
}

export const WebInventarisPage = ({ user }: { user: any }) => {
  const [items, setItems] = useState<InventarisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [conditionFilter, setConditionFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarisItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tenda');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formCondition, setFormCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat'>('baik');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<'tersedia' | 'dipinjam'>('tersedia');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const isEditor = ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(user?.role);
  const canDelete = ['admin', 'developer'].includes(user?.role);
  
  // Fetch all inventory items
  const fetchInventaris = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/data/inventaris', {
        headers: {
          'x-rt-id': localStorage.getItem('rtId') || 'rt01'
        }
      });
      const json = await res.json();
      if (res.ok) {
        setItems(json.data || []);
      } else {
        console.error('Failed to load assets', json.error);
      }
    } catch (e) {
      console.error('Error in fetching inventaris:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaris();
  }, []);

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama barang wajib diisi');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const payload = {
      name: formName,
      category: formCategory,
      quantity: Number(formQuantity),
      condition: formCondition,
      location: formLocation,
      status: formStatus,
      notes: formNotes,
      updaterName: user.name || 'Pengurus RT'
    };

    try {
      let url = '/api/data/inventaris';
      let method = 'POST';

      if (editingItem) {
        url = `/api/data/inventaris/${editingItem.id}`;
        method = 'PUT';
      }

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-rt-id': localStorage.getItem('rtId') || 'rt01'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        resetForm();
        fetchInventaris();
        // Trigger global data update event for widgets
        window.dispatchEvent(new Event('app_data_update'));
      } else {
        setFormError(json.error || 'Gagal menyimpan barang.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyambung ke server.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Item
  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang aset ini dari inventaris RT?')) {
      return;
    }

    try {
      const res = await apiFetch(`/api/data/inventaris/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-rt-id': localStorage.getItem('rtId') || 'rt01'
        },
        body: JSON.stringify({ updaterName: user.name })
      });

      if (res.ok) {
        fetchInventaris();
        window.dispatchEvent(new Event('app_data_update'));
      } else {
        alert('Gagal menghapus aset');
      }
    } catch (e) {
      console.error('Delete asset error:', e);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventarisItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormCondition(item.condition);
    setFormLocation(item.location || '');
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('Tenda');
    setFormQuantity(1);
    setFormCondition('baik');
    setFormLocation('');
    setFormStatus('tersedia');
    setFormNotes('');
    setFormError('');
  };

  // Filters calculation
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
    const matchesCondition = conditionFilter === 'Semua' || item.condition === conditionFilter;
    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  // Calculate quick metrics
  const totalItemsCount = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const baikCount = items.filter(i => i.condition === 'baik').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const rusakRinganCount = items.filter(i => i.condition === 'rusak_ringan').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const rusakBeratCount = items.filter(i => i.condition === 'rusak_berat').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const getConditionStyle = (cond: string) => {
    switch(cond) {
      case 'baik':
        return { bg: 'bg-green-50 text-green-700 border-green-100', label: 'Baik', icon: ShieldCheck };
      case 'rusak_ringan':
        return { bg: 'bg-yellow-50 text-yellow-700 border-yellow-101', label: 'Rusak Ringan', icon: Wrench };
      case 'rusak_berat':
        return { bg: 'bg-red-50 text-red-700 border-red-100', label: 'Rusak Berat', icon: AlertTriangle };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-100', label: 'Baik', icon: ShieldCheck };
    }
  };

  const getStatusStyle = (status: string) => {
    return status === 'dipinjam' 
      ? 'bg-rose-50 text-rose-700 border-rose-100' 
      : 'bg-teal-50 text-teal-700 border-teal-100';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-850 from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
              ASET RT GUYUB RUKUN
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaris Aset RT</h1>
          <p className="text-teal-100 text-xs max-w-xl">
            Sistem pencatatan fasilitas dan harta benda milik Rukun Tetangga secara digital. Membantu pelacakan peminjaman warga, pemantauan kondisi kelayakan, dan perencanaan pemeliharaan aset bersama.
          </p>
        </div>
        
        {isEditor && (
          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-white hover:bg-teal-50 text-teal-900 font-extrabold text-sm rounded-xl shadow-md transition flex items-center gap-2 shrink-0 pointer-events-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            Tambah Aset Baru
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Unit Aset</p>
          <p className="text-xl font-extrabold text-gray-800 mt-1">{totalItemsCount} <span className="text-xs font-normal text-gray-400">Unit</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Kondisi Prima (Baik)</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{baikCount} <span className="text-xs font-normal text-gray-400">Unit</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Rusak Ringan</p>
          <p className="text-xl font-extrabold text-yellow-600 mt-1">{rusakRinganCount} <span className="text-xs font-normal text-gray-400">Unit</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Rusak Berat</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{rusakBeratCount} <span className="text-xs font-normal text-gray-400">Unit</span></p>
        </div>
      </div>

      {/* Control Bar: Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-4 justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari aset RT (nama, lokasi, catatan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 bg-gray-50/50"
          />
        </div>

        {/* Triple Select Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Tenda">Tenda</option>
              <option value="Kursi">Kursi</option>
              <option value="Alat Kebersihan">Alat Kebersihan</option>
              <option value="Perlengkapan Rapat">Perlengkapan Rapat</option>
              <option value="Pertamanan & Got">Pertamanan & Got</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Condition */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            <option value="Semua">Semua Kondisi</option>
            <option value="baik">Kondisi Baik</option>
            <option value="rusak_ringan">Kondisi Rusak Ringan</option>
            <option value="rusak_berat">Kondisi Rusak Berat</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam Warga</option>
          </select>
        </div>
      </div>

      {/* Assets Grid/List rendering */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center gap-3 bg-white rounded-xl border">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Memuat lis inventaris aset RT...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3 bg-white rounded-xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300" />
          <h3 className="font-bold text-gray-700 text-sm">Tidak Ada Aset Ditemukan</h3>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Belum ada barang terdaftar atau tidak cocok dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const condStyle = getConditionStyle(item.condition);
            const CondIcon = condStyle.icon;
            return (
              <motion.div
                key={item.id}
                layoutId={`asset-${item.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-teal-600 tracking-wide uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-100/30">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-gray-800 tracking-tight leading-snug truncate mt-1.5">{item.name}</h3>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 bg-slate-100 px-3 py-1 rounded-lg shrink-0">
                      {item.quantity} Unit
                    </span>
                  </div>

                  {/* Badges bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 uppercase ${condStyle.bg}`}>
                      <CondIcon className="w-3.5 h-3.5" />
                      Kondisi {condStyle.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusStyle(item.status)}`}>
                      {item.status === 'dipinjam' ? 'Dipinjam' : 'Tersedia'}
                    </span>
                  </div>

                  {/* Informative details */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-50 text-[11px] text-gray-500">
                    {item.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">Lokasi: {item.location}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="flex items-start gap-1.5">
                        <Clipboard className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">Catatan: {item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(isEditor || canDelete) && (
                  <div className="flex items-center justify-end gap-2.5 mt-5 pt-3.5 border-t border-gray-50 shrink-0">
                    {isEditor && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 border border-gray-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg transition duration-150 pointer-events-auto cursor-pointer"
                        title="Edit Aset"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition duration-150 pointer-events-auto cursor-pointer"
                        title="Hapus Aset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL COMPONENT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Content box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-w-lg w-full z-10 relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{editingItem ? 'Edit Informasi Aset' : 'Tambah Aset RT Baru'}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Lengkapi parameters aset di bawah ini dengan akurat.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 px-2.5 text-xs text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg pointer-events-auto cursor-pointer font-extrabold transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form bodies */}
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-650 mb-1">Nama Barang Aset</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Contoh: Tenda Biru Lipat 4x6"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-650 mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="Tenda">Tenda</option>
                      <option value="Kursi">Kursi</option>
                      <option value="Alat Kebersihan">Alat Kebersihan</option>
                      <option value="Perlengkapan Rapat">Perlengkapan Rapat</option>
                      <option value="Pertamanan & Got">Pertamanan & Got</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-650 mb-1">Jumlah Aset (Qty)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      placeholder="1"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-650 mb-1">Kondisi</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as any)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="baik">Sangat Baik / Prima</option>
                      <option value="rusak_ringan">Rusak Ringan (Bisa Digunakan)</option>
                      <option value="rusak_berat">Rusak Berat (Butuh Ganti/Servis)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-650 mb-1">Status Pinjam</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="tersedia">Tersedia untuk Pinjaman</option>
                      <option value="dipinjam">Sedang Dipinjam Warga</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 mb-1">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Gudang RT Pos Ronda Barat"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 mb-1">Catatan Tambahan</label>
                  <textarea
                    placeholder="Contoh: Sumbangan dari donatur Bapak Edi RT 02. Kain tenda warna strip putih biru."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-4 border-t shrink-0 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-xl pointer-events-auto cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-150 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Simpan Informasi Aset
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
