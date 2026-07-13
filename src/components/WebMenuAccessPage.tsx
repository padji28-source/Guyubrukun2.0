import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { 
  Shield, 
  Check, 
  Save, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Smartphone,
  Monitor,
  LayoutGrid,
  Info,
  Users,
  Activity
} from 'lucide-react';

interface MenuPermission {
  _id?: string;
  role: string;
  allowedMenus: string[];
  createMenus: string[];
  updateMenus: string[];
  deleteMenus: string[];
}

const AVAILABLE_MENUS = [
  { name: 'Dashboard', desc: 'Panel ringkasan statistik RT, jumlah kas, warga aktif, dan visualisasi grafik diagram.' },
  { name: 'Warga', desc: 'Daftar data kependudukan warga RT, verifikasi persetujuan warga baru, detail kontak.' },
  { name: 'Surat Online', desc: 'Sistem pengusulan & pencetakan surat pengantar (SPS) warga secara mandiri.' },
  { name: 'Iuran', desc: 'Pencatatan pembayaran iuran warga, bukti transfer, verifikasi lunas.' },
  { name: 'Kas', desc: 'Manajemen kas keuangan RT masuk / keluar, laporan kategori kas, konfirmasi bendahara.' },
  { name: 'Dokumen', desc: 'Arsip dokumen penting RT, folder kartu keluarga, dan template berkas.' },
  { name: 'Laporan', desc: 'Pelaporan keluhan lingkungan, perbaikan infrastruktur, lengkap dengan info GPS.' },
  { name: 'Notulen Rapat', desc: 'Arsip resmi notulen hasil rapat warga, pimpinan rapat, & kesepakatan tertulis.' },
  { name: 'Pengumuman', desc: 'Broadcast pengumuman warga, agenda kerja bakti, pengajian, dll.' },
  { name: 'Media', desc: 'Galeri dokumentasi foto kegiatan sosial warga, kerukunan RT.' },
  { name: 'UMKM', desc: 'Katalog etalase produk lokal usaha mikro buatan warga RT.' },
  { name: 'Tamu', desc: 'Form pendaftaran pelaporan tamu berkunjung 1x24 jam.' },
  { name: 'Inventaris', desc: 'Log peminjaman barang inventaris RT seperti tenda, kursi, dll.' },
  { name: 'Smart RT AI', desc: 'Pusat tanya jawab AI berbasis Gemini untuk panduan pengurus RT.' },
  { name: 'Pengaturan', desc: 'Informasi akun profil, ubah kata sandi, dan preferensi log keluar.' },
  { name: 'Akses Menu', desc: 'Konfigurasi hak akses menu sistem & limitasi berlangganan (Developer Only).' }
];

const ROLE_LABELS: { [key: string]: { label: string; color: string; desc: string } } = {
  developer: { 
    label: 'System Developer', 
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    desc: 'Pemilik lisensi core system dengan kekuasaan penuh atas konfigurasi berlangganan.'
  },
  admin: { 
    label: 'Ketua RT (Admin)', 
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    desc: 'Pengurus utama lingkungan RT, memiliki hak ekspor backup dan verifikasi data warga.'
  },
  sekretaris: { 
    label: 'Sekretaris RT', 
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    desc: 'Bertanggung jawab atas administrasi, notulen rapat, pengumuman, dan surat online.'
  },
  bendahara: { 
    label: 'Bendahara RT', 
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    desc: 'Mengelola keuangan, verifikasi iuran warga, dan manajemen kas masuk-keluar.'
  },
  pengurus: { 
    label: 'Pengurus Lainnya', 
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    desc: 'Pengurus pelaksana RT untuk membantu pengelolaan media, sarpras, dan data kependudukan.'
  },
  warga: { 
    label: 'Warga Mandiri', 
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    desc: 'Warga terdaftar yang menggunakan aplikasi untuk ajukan surat, iuran, lapor keluhan, & UMKM.'
  }
};

export const WebMenuAccessPage = ({ user }: { user: any }) => {
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('warga');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState<{ onlineCount: number; registeredCount: number }>({ onlineCount: 0, registeredCount: 0 });

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/api/developer/stats');
      if (res.ok) {
        const json = await res.json();
        setStats({
          onlineCount: json.onlineCount || 0,
          registeredCount: json.registeredCount || 0
        });
      }
    } catch (e) {
      console.error("Gagal memuat statistik developer", e);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/menu-permissions');
      if (res.ok) {
        const json = await res.json();
        setPermissions(json.data || []);
      } else {
        setMessage({ text: 'Gagal memuat konfigurasi hak akses menu', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Terjadi kesalahan koneksi saat memuat data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchStats();

    const handleUpdate = (e: any) => {
      if (e.detail === 'online_status') {
        fetchStats();
      }
    };
    window.addEventListener('app_data_update', handleUpdate);
    return () => {
      window.removeEventListener('app_data_update', handleUpdate);
    };
  }, []);

  const getRolePermissionObj = (role: string): MenuPermission => {
    const perm = permissions.find(p => p.role === role);
    return perm || { role, allowedMenus: [], createMenus: [], updateMenus: [], deleteMenus: [] };
  };

  const handleToggleMenu = (role: string, menuName: string, actionType: 'read' | 'create' | 'update' | 'delete') => {
    setPermissions(prev => {
      // Periksa apakah role sudah ada
      let hasRole = prev.find(p => p.role === role);
      let updatedPrev = [...prev];
      if (!hasRole) {
        updatedPrev.push({ role, allowedMenus: [], createMenus: [], updateMenus: [], deleteMenus: [] });
      }
      
      return updatedPrev.map(p => {
        if (p.role === role) {
          // Initialize if missing
          p.allowedMenus = p.allowedMenus || [];
          p.createMenus = p.createMenus || [];
          p.updateMenus = p.updateMenus || [];
          p.deleteMenus = p.deleteMenus || [];
          
          if (role === 'developer' && menuName === 'Akses Menu') {
            return p; // Protect developer
          }

          let updatedAllowed = [...p.allowedMenus];
          let updatedCreate = [...p.createMenus];
          let updatedUpdate = [...p.updateMenus];
          let updatedDelete = [...p.deleteMenus];

          if (actionType === 'read') {
            if (updatedAllowed.includes(menuName)) {
              updatedAllowed = updatedAllowed.filter(m => m !== menuName);
              // if read is disabled, disable all others
              updatedCreate = updatedCreate.filter(m => m !== menuName);
              updatedUpdate = updatedUpdate.filter(m => m !== menuName);
              updatedDelete = updatedDelete.filter(m => m !== menuName);
            } else {
              updatedAllowed.push(menuName);
            }
          } else if (actionType === 'create') {
            if (updatedCreate.includes(menuName)) updatedCreate = updatedCreate.filter(m => m !== menuName);
            else { updatedCreate.push(menuName); if (!updatedAllowed.includes(menuName)) updatedAllowed.push(menuName); }
          } else if (actionType === 'update') {
            if (updatedUpdate.includes(menuName)) updatedUpdate = updatedUpdate.filter(m => m !== menuName);
            else { updatedUpdate.push(menuName); if (!updatedAllowed.includes(menuName)) updatedAllowed.push(menuName); }
          } else if (actionType === 'delete') {
            if (updatedDelete.includes(menuName)) updatedDelete = updatedDelete.filter(m => m !== menuName);
            else { updatedDelete.push(menuName); if (!updatedAllowed.includes(menuName)) updatedAllowed.push(menuName); }
          }

          return { 
            ...p, 
            allowedMenus: updatedAllowed,
            createMenus: updatedCreate,
            updateMenus: updatedUpdate,
            deleteMenus: updatedDelete
          };
        }
        return p;
      });
    });
  };

  const handleSaveConfig = async (role: string) => {
    const perm = getRolePermissionObj(role);
    setSavingRole(role);
    setMessage(null);

    try {
      const res = await apiFetch('/api/menu-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role, 
          allowedMenus: perm.allowedMenus,
          createMenus: perm.createMenus,
          updateMenus: perm.updateMenus,
          deleteMenus: perm.deleteMenus
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ 
          text: `Lisensi & hak akses menu untuk peran [${ROLE_LABELS[role]?.label || role}] berhasil dijalankan!`, 
          type: 'success' 
        });
        // Auto remove message after 4s
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ text: json.error || 'Gagal memperbarui konfigurasi', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Kesalahan jaringan server saat menyimpan data', type: 'error' });
    } finally {
      setSavingRole(null);
    }
  };

  if (user?.role !== 'developer') {
    return (
      <div className="w-full flex items-center justify-center p-8 min-h-[400px]">
        <div className="bg-red-50 border border-red-150 p-6 rounded-2xl max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h3 className="font-bold text-red-800 text-lg">Akses Ditolak (Developer Only)</h3>
          <p className="text-sm text-red-600 leading-relaxed">
            Halaman ini khusus untuk Akun Developer Lisensi untuk mengatur <b>HAK MANAJEMEN (Edit & Hapus)</b> pada modul masing-masing role demi keperluan lisensi paket berlangganan RT.
          </p>
        </div>
      </div>
    );
  }

  const currentPermObj = getRolePermissionObj(selectedRole);
  const currentAllowed = currentPermObj.allowedMenus || [];

  const totalPermissionsCount = permissions.reduce((acc, curr) => acc + (curr.allowedMenus?.length || 0), 0);

  return (
    <div className="w-full min-h-[calc(100vh-100px)] p-6 bg-[#FAFBFD] space-y-6">
      {/* Upper Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
              Developer Licence Panel
            </span>
            <span className="bg-emerald-50 border border-emerald-150 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Live Control Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Akses Menu & Berlangganan</h2>
          <p className="text-xs text-gray-500">
            Batasi modul fitur aplikasi per peran kependudukan untuk mengatur segmentasi paket produk SaaS berlangganan RT.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchPermissions(); fetchStats(); }} 
            className="p-2.5 bg-gray-50 text-gray-600 hover:text-indigo-600 rounded-xl border border-gray-100 hover:bg-indigo-50 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Muat Ulang Konfigurasi"
          >
            <RefreshCw className="w-4 h-4" /> Aktualkan Data
          </button>
        </div>
      </div>

      {/* KPI Developer Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Registered Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-left">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Total User Terdaftar</span>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">
              {stats.registeredCount} <span className="text-xs font-semibold text-gray-400">user</span>
            </h3>
            <p className="text-[10px] text-gray-400">Semua warga yang terdaftar di database</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Online/Logged-In Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-left">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">User Sedang Login</span>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-indigo-600 tracking-tight">
                {stats.onlineCount} <span className="text-xs font-semibold text-indigo-400">aktif</span>
              </h3>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[10px] text-gray-400">Sesi user aktif login secara real-time</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Alert Message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border transition-all text-sm font-semibold flex items-center gap-3 text-left ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>{message.text}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Role select list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left">
            <h3 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" /> Pilih Peran (User Roles)
            </h3>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              Tentukan peran yang ingin diubah konfigurasinya demi keperluan skema pembatasan paket berlangganan.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {['developer', 'admin', 'sekretaris', 'bendahara', 'pengurus', 'warga'].map(role => {
                  const labelInfo = ROLE_LABELS[role] || { label: role, color: 'bg-gray-50 text-gray-700', desc: '' };
                  const isSelected = selectedRole === role;
                  const count = (getRolePermissionObj(role).allowedMenus || []).length;

                  return (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-100' 
                          : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm tracking-tight">{labelInfo.label}</span>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {count} Menu
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 line-clamp-2 ${
                        isSelected ? 'text-indigo-100' : 'text-gray-400'
                      }`}>
                        {labelInfo.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick SaaS Info Card */}
          <div className="bg-indigo-950 text-white p-5 rounded-2xl shadow-sm text-left relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Shield className="w-32 h-32" />
            </div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 shadow-sm">Info Segmentasi SaaS</h4>
            <p className="text-[11px] text-indigo-200 leading-relaxed mb-3">
              Perubahan pada menu langsung memperbarui <b>hak akses pengelolaan (Edit & Hapus)</b> seluruh pengguna ber-role terkait secara dynamic saat itu juga (Real-time SSE event disebarkan). Semua role tetap bisa melihat semua menu kecuali modul VIP.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-white/90">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Paket Standard: Matikan menu AI & Kas.</span>
            </div>
          </div>
        </div>

        {/* Right column: Active role configuration panel */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-left">
            {/* Active role header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
              <div>
                <span className={`inline-block text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
                  ROLE_LABELS[selectedRole]?.color || 'bg-gray-50 text-gray-700'
                }`}>
                  Peran Terpilih: {ROLE_LABELS[selectedRole]?.label || selectedRole}
                </span>
                <p className="text-xs text-gray-500 mt-1.5">
                  Centang modul menu yang ingin diaktifkan untuk peran ini. Non-aktifkan untuk menyembunyikan dari navigasi sidebar & mobile.
                </p>
              </div>

              <button
                onClick={() => handleSaveConfig(selectedRole)}
                disabled={savingRole === selectedRole || loading}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                {savingRole === selectedRole ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Terapkan & Simpan
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-medium text-gray-400">Menyelaraskan lisensi akses database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_MENUS.map(menu => {
                  const currentPerm = getRolePermissionObj(selectedRole);
                  const isRead = (currentPerm.allowedMenus || []).includes(menu.name);
                  const isCreate = (currentPerm.createMenus || []).includes(menu.name);
                  const isUpdate = (currentPerm.updateMenus || []).includes(menu.name);
                  const isDelete = (currentPerm.deleteMenus || []).includes(menu.name);
                  
                  // Enforce developer safety
                  const isDisabled = selectedRole === 'developer' && menu.name === 'Akses Menu';

                  return (
                    <div
                      key={menu.name}
                      className={`p-4 rounded-xl border text-left flex flex-col gap-3 transition-all relative select-none ${
                        isRead 
                          ? 'bg-indigo-50/30 border-indigo-200' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      } ${isDisabled ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      <div className="space-y-1">
                        <span className={`font-bold text-sm tracking-tight transition-colors ${
                          isRead ? 'text-indigo-900' : 'text-gray-800'
                        }`}>
                          {menu.name}
                        </span>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          {menu.desc}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        <button 
                          onClick={() => !isDisabled && handleToggleMenu(selectedRole, menu.name, 'read')}
                          className={`px-2 py-1 flex flex-col sm:flex-row items-center gap-1 rounded border text-[9px] font-bold ${
                            isRead ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isRead ? 'opacity-100' : 'opacity-0'}`} /> Read
                        </button>
                        <button 
                          onClick={() => !isDisabled && handleToggleMenu(selectedRole, menu.name, 'create')}
                          className={`px-2 py-1 flex flex-col sm:flex-row items-center gap-1 rounded border text-[9px] font-bold ${
                            isCreate ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isCreate ? 'opacity-100' : 'opacity-0'}`} /> Create
                        </button>
                        <button 
                          onClick={() => !isDisabled && handleToggleMenu(selectedRole, menu.name, 'update')}
                          className={`px-2 py-1 flex flex-col sm:flex-row items-center gap-1 rounded border text-[9px] font-bold ${
                            isUpdate ? 'bg-amber-500 text-white border-amber-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isUpdate ? 'opacity-100' : 'opacity-0'}`} /> Update
                        </button>
                        <button 
                          onClick={() => !isDisabled && handleToggleMenu(selectedRole, menu.name, 'delete')}
                          className={`px-2 py-1 flex flex-col sm:flex-row items-center gap-1 rounded border text-[9px] font-bold ${
                            isDelete ? 'bg-rose-600 text-white border-rose-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isDelete ? 'opacity-100' : 'opacity-0'}`} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Config panel footnotes */}
            <div className="text-[11px] text-gray-400 italic bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                Demi keamanan sistem, menu <strong>[Akses Menu]</strong> tidak dapat dinonaktifkan untuk peran <strong>System Developer</strong> agar hak kelayakan konfigurasi tetap siaga.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
