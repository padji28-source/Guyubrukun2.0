import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from './apiInterceptor';
import { icons } from './App';

let cachedVotingData: any[] | null = null;

const VOTING_CATEGORIES = [
  'Musyawarah Warga',
  'Pemilihan Pengurus',
  'Pembangunan & Lingkungan',
  'Kegiatan & Acara',
  'Iuran & Keuangan'
];

export const MobileVoting = ({ currentUser, onBack }: { currentUser: any; onBack: () => void }) => {
  const [votings, setVotings] = useState<any[]>(cachedVotingData || []);
  const [loading, setLoading] = useState(!cachedVotingData);
  const [submitting, setSubmitting] = useState(false);
  const [votingOptionLoading, setVotingOptionLoading] = useState<string | null>(null);

  // Hanya Ketua RT (admin / developer) yang dapat membuat, menutup, atau menghapus sesi voting
  const isKetuaRT = currentUser?.role === 'admin' || currentUser?.role === 'developer';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVotersId, setExpandedVotersId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast messages
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states for creating a new voting (Ketua RT)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Musyawarah Warga');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [options, setOptions] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  const showBanner = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setStatusMessage('');
      setTimeout(() => setErrorMessage(''), 4500);
    } else {
      setStatusMessage(msg);
      setErrorMessage('');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const fetchVotings = async () => {
    try {
      const res = await apiFetch('/api/voting');
      if (res.ok) {
        const json = await res.json();
        const list = (json.data || []).filter((v: any) => v.status !== 'dihapus');
        cachedVotingData = list;
        setVotings(list);
      }
    } catch (e) {
      console.error('Gagal mengambil data voting:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotings();
    const handleUpdate = (e: any) => {
      if (e.detail === 'voting') {
        fetchVotings();
      }
    };
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, []);

  const handleAddOption = () => {
    setOptions(prev => [...prev, { id: String(Date.now() + prev.length), text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      showBanner('Minimal harus terdapat 2 opsi pilihan dalam voting.', true);
      return;
    }
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKetuaRT) {
      showBanner('Akses ditolak: Hanya Ketua RT yang dapat membuat voting baru.', true);
      return;
    }

    const trimmedTitle = title.trim();
    const validOptions = options.map(o => ({ ...o, text: o.text.trim() })).filter(o => o.text !== '');

    if (!trimmedTitle) {
      showBanner('Harap isi judul atau topik voting terlebih dahulu.', true);
      return;
    }
    if (validOptions.length < 2) {
      showBanner('Harap isi minimal 2 opsi pilihan untuk dipilih warga.', true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          category,
          description: description.trim(),
          deadline,
          options: validOptions,
          createdBy: currentUser?.nama || 'Ketua RT'
        })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        setCategory('Musyawarah Warga');
        setDescription('');
        setDeadline('');
        setOptions([
          { id: '1', text: '' },
          { id: '2', text: '' }
        ]);
        showBanner('Voting baru berhasil diterbitkan untuk seluruh warga!');
        await fetchVotings();
      } else {
        showBanner(json.error || 'Gagal membuat sesi voting.', true);
      }
    } catch {
      showBanner('Terjadi kesalahan jaringan saat membuat voting.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (voting: any) => {
    if (!isKetuaRT) return;
    const nextStatus = voting.status === 'selesai' ? 'aktif' : 'selesai';
    try {
      const res = await apiFetch(`/api/voting/${voting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showBanner(
          nextStatus === 'selesai'
            ? `Sesi voting "${voting.title}" telah ditutup.`
            : `Sesi voting "${voting.title}" dibuka kembali.`
        );
        fetchVotings();
      }
    } catch {
      showBanner('Gagal memperbarui status voting.', true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isKetuaRT) return;
    try {
      const res = await apiFetch(`/api/voting/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        showBanner('Sesi voting berhasil dihapus.');
        fetchVotings();
      } else {
        // Fallback if DELETE not supported
        await apiFetch(`/api/voting/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'dihapus' })
        });
        setConfirmDeleteId(null);
        showBanner('Sesi voting berhasil dihapus.');
        fetchVotings();
      }
    } catch {
      showBanner('Gagal menghapus sesi voting.', true);
    }
  };

  const handleVote = async (votingId: string, optionId: string) => {
    if (!currentUser?.id) {
      showBanner('Silakan login terlebih dahulu untuk memberikan suara.', true);
      return;
    }
    setVotingOptionLoading(`${votingId}_${optionId}`);
    try {
      const res = await apiFetch(`/api/voting/${votingId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          userId: currentUser.id,
          userName: currentUser.nama || currentUser.username || 'Warga',
          userBlok: currentUser.alamat || ''
        })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        showBanner('Suara Anda berhasil disimpan!');
        await fetchVotings();
      } else {
        showBanner(json.error || 'Gagal menyimpan pilihan suara Anda.', true);
      }
    } catch {
      showBanner('Terjadi kesalahan saat mengirim suara.', true);
    } finally {
      setVotingOptionLoading(null);
    }
  };

  const stats = useMemo(() => {
    const activeCount = votings.filter(v => v.status === 'aktif').length;
    const completedCount = votings.filter(v => v.status === 'selesai').length;
    const myVotedCount = votings.filter(v =>
      Array.isArray(v.votes) && v.votes.some((vt: any) => vt.userId === currentUser?.id)
    ).length;
    return {
      total: votings.length,
      activeCount,
      completedCount,
      myVotedCount
    };
  }, [votings, currentUser?.id]);

  const filteredVotings = useMemo(() => {
    return votings.filter(v => {
      if (filterStatus === 'aktif' && v.status !== 'aktif') return false;
      if (filterStatus === 'selesai' && v.status !== 'selesai') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (v.title || '').toLowerCase().includes(q);
        const matchDesc = (v.description || '').toLowerCase().includes(q);
        const matchCat = (v.category || '').toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat;
      }
      return true;
    });
  }, [votings, filterStatus, searchQuery]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 relative pb-24">
      <div className="max-w-4xl mx-auto w-full">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl px-4 sm:px-6 py-4 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200 shadow-xs cursor-pointer shrink-0"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Voting & Musyawarah Warga
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Pengambilan keputusan bersama warga RT secara transparan (1 Akun = 1 Suara)
              </p>
            </div>
          </div>

          {isKetuaRT && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Buat Voting Baru</span>
            </button>
          )}
        </header>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Status Alerts */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <span>✅ {statusMessage}</span>
                <button type="button" onClick={() => setStatusMessage('')} className="text-emerald-700 font-extrabold ml-2 cursor-pointer">
                  ✕
                </button>
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <span>⚠️ {errorMessage}</span>
                <button type="button" onClick={() => setErrorMessage('')} className="text-rose-700 font-extrabold ml-2 cursor-pointer">
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Banner Info */}
          <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                {isKetuaRT ? 'Panel Pengelolaan Voting Ketua RT' : 'Partisipasi Suara Warga RT'}
              </p>
              <h2 className="text-base sm:text-lg font-extrabold leading-snug">
                {isKetuaRT
                  ? 'Buat & Kelola Topik Pemungutan Suara Warga'
                  : 'Salurkan Pendapat Anda untuk Kemajuan Lingkungan RT'}
              </h2>
              <p className="text-xs text-teal-100/90 max-w-xl leading-relaxed">
                {isKetuaRT
                  ? 'Sebagai Ketua RT, Anda dapat membuat topik voting baru, memantau perolehan suara warga secara langsung, serta mengakhiri sesi voting.'
                  : 'Setiap topik voting dibuat resmi oleh Ketua RT. Pilih salah satu opsi pada sesi yang sedang aktif untuk memberikan suara Anda.'}
              </p>
            </div>
            {isKetuaRT && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-extrabold shadow-xs transition-all shrink-0 cursor-pointer self-start sm:self-center"
              >
                + Buat Topik Voting
              </button>
            )}
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500">Voting Aktif</p>
              <p className="text-xl font-black text-teal-700 mt-0.5">{stats.activeCount}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500">Sudah Anda Pilih</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.myVotedCount}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500">Voting Selesai</p>
              <p className="text-xl font-black text-slate-600 mt-0.5">{stats.completedCount}</p>
            </div>
          </div>

          {/* Search & Segmented Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <icons.search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari judul musyawarah atau kategori..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-teal-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
              {[
                { id: 'semua', label: `Semua (${stats.total})` },
                { id: 'aktif', label: `Aktif (${stats.activeCount})` },
                { id: 'selesai', label: `Selesai (${stats.completedCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voting List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/60">
              <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-teal-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">Memuat daftar voting warga...</p>
            </div>
          ) : filteredVotings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600">
                <icons.voting className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">Belum Ada Sesi Voting</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isKetuaRT
                    ? 'Klik tombol "Buat Voting Baru" di atas untuk memulai pemungutan suara warga.'
                    : 'Ketua RT belum membuka topik pemungutan suara baru saat ini.'}
                </p>
              </div>
              {isKetuaRT && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  + Buat Voting Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVotings.map(voting => {
                const votesList = Array.isArray(voting.votes) ? voting.votes : [];
                const totalVotes = votesList.length;
                const userVote = votesList.find((v: any) => v.userId === currentUser?.id);
                const isExpired = Boolean(voting.deadline && new Date(voting.deadline).getTime() < Date.now());
                const isSelesai = voting.status === 'selesai' || isExpired;

                // Find highest vote count to highlight leading/winning option
                const maxVotes = Math.max(
                  0,
                  ...(voting.options || []).map((opt: any) =>
                    votesList.filter((v: any) => v.optionId === opt.id).length
                  )
                );

                return (
                  <div
                    key={voting.id}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isSelesai
                        ? 'border-slate-200/80'
                        : 'border-teal-200/90 shadow-xs'
                    }`}
                  >
                    {/* Card Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-teal-700">{voting.category || 'Musyawarah Warga'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Oleh {voting.createdBy || 'Ketua RT'}</span>
                        {voting.createdAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {new Date(voting.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-extrabold ${
                          isSelesai ? 'text-slate-500' : 'text-emerald-600'
                        }`}
                      >
                        {isSelesai ? '● Selesai Ditutup' : '● Sedang Berlangsung'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{voting.title}</h3>
                    {voting.description && (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{voting.description}</p>
                    )}

                    {voting.deadline && (
                      <p className="text-[11px] font-semibold text-amber-700 mt-2">
                        ⏰ Batas Waktu:{' '}
                        {new Date(voting.deadline).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}

                    {/* Options List */}
                    <div className="mt-4 space-y-2.5">
                      {(voting.options || []).map((opt: any, optIdx: number) => {
                        const optVotes = votesList.filter((v: any) => v.optionId === opt.id).length;
                        const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        const isSelected = userVote?.optionId === opt.id;
                        const isLeading = maxVotes > 0 && optVotes === maxVotes;
                        const isVotingThis = votingOptionLoading === `${voting.id}_${opt.id}`;

                        return (
                          <button
                            key={opt.id || optIdx}
                            type="button"
                            disabled={isSelesai || Boolean(votingOptionLoading)}
                            onClick={() => !isSelesai && handleVote(voting.id, opt.id)}
                            className={`w-full text-left relative overflow-hidden rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all ${
                              isSelesai ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/40'
                                : 'border-slate-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            {/* Progress fill bar */}
                            <div
                              className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ease-out ${
                                isSelected ? 'bg-teal-500/15' : isLeading ? 'bg-emerald-500/10' : 'bg-slate-100/80'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />

                            <div className="relative z-10 flex items-center gap-3 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`text-xs sm:text-sm block break-words ${
                                    isSelected ? 'font-extrabold text-teal-950' : 'font-bold text-slate-800'
                                  }`}
                                >
                                  {opt.text}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                                  {isSelected && (
                                    <span className="font-extrabold text-teal-700">✓ Pilihan Anda</span>
                                  )}
                                  {isLeading && totalVotes > 0 && (
                                    <span className="font-bold text-amber-700">
                                      {isSelesai ? '🏆 Suara Terbanyak' : '🔥 Unggul Sementara'}
                                    </span>
                                  )}
                                  {isVotingThis && (
                                    <span className="font-bold text-teal-600">Menyimpan suara...</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="relative z-10 text-right shrink-0">
                              <span className="text-xs font-extrabold text-slate-900 block">{percentage}%</span>
                              <span className="text-[10px] font-semibold text-slate-500">{optVotes} suara</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer Bar: Total Votes, Voter Transparency, and Ketua RT Actions */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-bold text-slate-700">Total: {totalVotes} Suara</span>
                        {totalVotes > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedVotersId(expandedVotersId === voting.id ? null : voting.id)
                            }
                            className="text-teal-700 hover:underline font-bold cursor-pointer"
                          >
                            {expandedVotersId === voting.id ? 'Sembunyikan Partisipan' : 'Lihat Partisipan'}
                          </button>
                        )}
                      </div>

                      {isKetuaRT && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(voting)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelesai
                                ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            {isSelesai ? 'Buka Kembali' : 'Tutup Voting'}
                          </button>

                          {confirmDeleteId === voting.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDelete(voting.id)}
                                className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(voting.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expandable Voter List */}
                    <AnimatePresence>
                      {expandedVotersId === voting.id && totalVotes > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-200 bg-slate-50 rounded-xl p-3 space-y-2">
                            <p className="text-[11px] font-bold text-slate-600">
                              Daftar Warga yang Telah Memberikan Suara ({totalVotes}):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {votesList.map((vt: any, vIdx: number) => {
                                const chosenOpt = (voting.options || []).find((o: any) => o.id === vt.optionId);
                                return (
                                  <div
                                    key={`${vt.userId}_${vIdx}`}
                                    className="bg-white px-3 py-2 rounded-lg border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-800 truncate">
                                        {vt.userName || `Warga #${vIdx + 1}`}
                                      </p>
                                      {vt.userBlok && (
                                        <p className="text-[10px] text-slate-500 truncate">{vt.userBlok}</p>
                                      )}
                                    </div>
                                    <span className="text-[11px] font-bold text-teal-700 truncate max-w-[140px]">
                                      {chosenOpt?.text || 'Memilih'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Voting Baru (Khusus Ketua RT) */}
      <AnimatePresence>
        {isKetuaRT && showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              onSubmit={handleCreate}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Buat Topik Voting Baru</h3>
                  <p className="text-xs text-slate-500">Khusus Ketua RT — Terbitkan pemungutan suara untuk warga</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul / Topik Voting *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemilihan Jadwal Kerja Bakti atau Perbaikan Pos RT"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Musyawarah</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-teal-500"
                  >
                    {VOTING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Batas Waktu (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi / Keterangan Musyawarah</label>
                <textarea
                  placeholder="Jelaskan latar belakang atau rincian opsi agar warga memahami pilihan..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">Daftar Pilihan / Opsi Suara *</label>
                  <span className="text-[11px] text-slate-500 font-semibold">{options.length} Opsi</span>
                </div>
                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-8 h-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Masukkan Pilihan Opsi ${idx + 1}`}
                        value={opt.text}
                        onChange={e =>
                          setOptions(prev =>
                            prev.map(o => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                          )
                        }
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-teal-500"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="w-8 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer"
                          title="Hapus opsi ini"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2.5 w-full py-2 border border-dashed border-teal-300 hover:bg-teal-50 text-teal-700 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  + Tambah Opsi Pilihan Lainnya
                </button>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Menerbitkan...' : 'Terbitkan Voting'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
