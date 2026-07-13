import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Calendar, 
  Users, 
  MapPin, 
  User,
  Loader2, 
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface NotulenItem {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  leader: string;
  attendees: string;
  location: string;
  createdBy?: string;
  createdAt?: string;
}

export const WebNotulenPage = ({ user }: { user: any }) => {
  const [items, setItems] = useState<NotulenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [selectedNotulen, setSelectedNotulen] = useState<NotulenItem | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NotulenItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Rapat Bulanan');
  const [formLeader, setFormLeader] = useState('');
  const [formAttendees, setFormAttendees] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState('');

  const isEditor = ['admin', 'developer', 'sekretaris'].includes(user?.role);

  const fetchNotulen = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/data/notulen');
      const json = await res.json();
      if (res.ok) {
        setItems(json.data || []);
      } else {
        console.error('Gagal mengambil data notulen:', json.error);
      }
    } catch (e) {
      console.error('Error fetching notulen:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotulen();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory('Rapat Bulanan');
    setFormLeader(user?.nama || '');
    setFormAttendees('');
    setFormLocation('');
    setFormContent('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item: NotulenItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDate(item.date);
    setFormCategory(item.category || 'Rapat Bulanan');
    setFormLeader(item.leader || '');
    setFormAttendees(item.attendees || '');
    setFormLocation(item.location || '');
    setFormContent(item.content);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus notulen rapat ini?')) return;
    
    try {
      const res = await apiFetch(`/api/data/notulen/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
        if (selectedNotulen?.id === id) {
          setSelectedNotulen(null);
        }
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menghapus notulen');
      }
    } catch (err) {
      console.error('Error deleting notulen:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Judul rapat wajib diisi');
      return;
    }
    if (!formDate) {
      setFormError('Tanggal rapat wajib diisi');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Isi pembahasan rapat wajib diisi');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const payload = {
      title: formTitle,
      date: formDate,
      category: formCategory,
      leader: formLeader,
      attendees: formAttendees,
      location: formLocation,
      content: formContent,
      createdBy: editingItem ? editingItem.createdBy : (user?.nama || 'Pengurus')
    };

    try {
      let res;
      if (editingItem) {
        res = await apiFetch(`/api/data/notulen/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/data/notulen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (res.ok) {
        fetchNotulen();
        setIsFormOpen(false);
        // Update detail view if selected and edited
        if (editingItem && selectedNotulen?.id === editingItem.id) {
          setSelectedNotulen({ ...editingItem, ...payload });
        }
      } else {
        setFormError(json.error || 'Gagal menyimpan notulen');
      }
    } catch (err) {
      console.error('Error saving notulen:', err);
      setFormError('Terjadi kesalahan koneksi internet');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leader?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-[calc(100vh-100px)] p-6 bg-[#FAFBFD] space-y-6">
      {/* Header and Call to Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Notulen Rapat</h2>
          <p className="text-xs text-gray-500 mt-1">Dokumentasi resmi hasil pembahasan, keputusan, dan kesepakatan rapat warga.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={fetchNotulen} 
            className="p-2.5 bg-gray-50 text-gray-600 hover:text-teal-600 rounded-xl border border-gray-100 hover:bg-teal-50 transition-colors"
            title="Muat ulang"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          {isEditor && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tulis Notulen
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Filter and List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari judul, pimpinan, pembahasan..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 focus:bg-white text-sm text-gray-700 rounded-xl border border-gray-150 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" />
            </div>

            {/* Category Quick Filter Cards */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Semua', 'Rapat Bulanan', 'Rapat Koordinasi', 'Kerja Bakti', 'Sosialisasi / Penyuluhan', 'Lainnya'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-bold transition-all ${
                    categoryFilter === cat 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                <p className="text-xs text-gray-400 mt-2 font-medium">Memuat notulen rapat...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-gray-100 text-center shadow-sm">
                <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600">Belum Ada Notulen Rapat</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ditemukan arsip keputusan rapat warga saat ini.</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedNotulen(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                    selectedNotulen?.id === item.id 
                      ? 'bg-teal-50/50 border-teal-300 shadow-sm ring-1 ring-teal-200' 
                      : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 tracking-wider">
                      {item.category || 'Rapat Bulanan'}
                    </span>
                    
                    {isEditor && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm mt-2.5 truncate">{item.title}</h3>
                  
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="truncate max-w-[100px]">{item.leader || 'Pimpinan'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detail View */}
        <div className="lg:col-span-7">
          {selectedNotulen ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-left"
            >
              {/* Detail Header */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                    {selectedNotulen.category || 'Rapat Bulanan'}
                  </span>
                  
                  {isEditor && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(selectedNotulen)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-250 hover:border-blue-500 hover:text-blue-600 text-xs text-gray-600 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={(e) => handleDelete(selectedNotulen.id, e)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 hover:bg-red-50 hover:text-red-600 text-xs text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-black text-gray-950 leading-tight">{selectedNotulen.title}</h1>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-gray-500">Tanggal Rapat:</span>
                    <span className="font-bold text-gray-800">{selectedNotulen.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-gray-500">Pimpinan:</span>
                    <span className="font-bold text-gray-800">{selectedNotulen.leader || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-gray-500">Lokasi:</span>
                    <span className="font-bold text-gray-800">{selectedNotulen.location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-gray-500">Peserta Rapat:</span>
                    <span className="font-bold text-gray-800 select-all shrink truncate max-w-[150px]" title={selectedNotulen.attendees}>
                      {selectedNotulen.attendees || 'Semua Warga'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minutes Content Block */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <FileText className="w-4 h-4 text-teal-600" /> Hasil Pembahasan & Keputusan
                </h4>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-teal-50/10 p-5 rounded-xl border border-teal-500/5 min-h-[150px]">
                  {selectedNotulen.content}
                </div>
              </div>

              {/* Creator details */}
              {selectedNotulen.createdBy && (
                <div className="text-[11px] text-gray-400 text-right italic pt-2">
                  Ditulis oleh: {selectedNotulen.createdBy}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 text-center min-h-[400px] shadow-sm">
              <FileText className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="font-bold text-gray-600 text-base">Detail Notulen Rapat</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Pilih salah satu notulen rapat warga di sebelah kiri untuk melihat detail pembahasan, pimpinan rapat, dan daftar hadir lengkap.</p>
            </div>
          )}
        </div>
      </div>

      {/* Write/Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-50/20">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  {editingItem ? 'Edit Notulen Rapat' : 'Tulis Notulen Baru'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Judul Rapat */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600">Judul Rapat <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Rapat Koordinasi Agustusan"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                      required
                    />
                  </div>

                  {/* Tanggal Rapat */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Tanggal Rapat <span className="text-red-500">*</span></label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                      required
                    />
                  </div>

                  {/* Kategori */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                    >
                      <option value="Rapat Bulanan">Rapat Bulanan</option>
                      <option value="Rapat Koordinasi">Rapat Koordinasi</option>
                      <option value="Kerja Bakti">Kerja Bakti</option>
                      <option value="Sosialisasi / Penyuluhan">Sosialisasi / Penyuluhan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Pimpinan Rapat */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Pimpinan Rapat</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Bpk. Muhammad Adji"
                      value={formLeader}
                      onChange={e => setFormLeader(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                    />
                  </div>

                  {/* Lokasi Rapat */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Lokasi / Tempat Rapat</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Balai Warga RT 01"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                    />
                  </div>

                  {/* Peserta Hadir */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600">Peserta yang Hadir</label>
                    <input 
                      type="text"
                      placeholder="Contoh: RT, Sekretaris, Bendahara, 25 Warga"
                      value={formAttendees}
                      onChange={e => setFormAttendees(e.target.value)}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                    />
                  </div>

                  {/* Pembahasan / Isi */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600">Isi Hasil Pembahasan / Keputusan Rapat <span className="text-red-500">*</span></label>
                    <textarea 
                      placeholder="Tulis poin-poin keputusan rapat secara lengkap disini..."
                      value={formContent}
                      onChange={e => setFormContent(e.target.value)}
                      rows={6}
                      className="w-full p-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-teal-500 rounded-xl text-sm outline-none transition"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition shadow"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                      </>
                    ) : 'Simpan Notulen'}
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
