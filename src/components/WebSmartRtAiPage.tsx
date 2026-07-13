import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { 
  Sparkles, 
  FileText, 
  TrendingUp, 
  FileEdit, 
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Cpu
} from 'lucide-react';

export const WebSmartRtAiPage = ({ user }: { user: any }) => {
  const [activeSubTab, setActiveSubTab] = useState<'rapat' | 'kas' | 'surat' | 'klasifikasi'>('rapat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [meetingNotes, setMeetingNotes] = useState('');
  const [suratJenis, setSuratJenis] = useState('Surat Pengantar');
  const [suratNama, setSuratNama] = useState('');
  const [suratKeperluan, setSuratKeperluan] = useState('');
  const [suratKeterangan, setSuratKeterangan] = useState('');
  
  const [laporanJudul, setLaporanJudul] = useState('');
  const [laporanDeskripsi, setLaporanDeskripsi] = useState('');

  const runAiAction = async (action: string, payload: any) => {
    setLoading(true);
    setResult('');
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/gemini/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rt-id': localStorage.getItem('rtId') || 'rt01'
        },
        body: JSON.stringify({ action, payload })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Terjadi kesalahan saat memproses permintaan AI.');
      }
      setResult(json.result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal terhubung dengan server atau API Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-cyan-900 rounded-2xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              INTEGRASI GEMINI 3.5 FLASH
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Smart RT AI Assistant</h1>
          <p className="text-teal-100 text-sm max-w-xl leading-relaxed">
            Asisten kecerdasan buatan khusus pengurus Rukun Tetangga. Otomasikan penulisan draf surat, analisis kesehatan kas, klasifikasikan laporan, dan rangkum rapat warga dlm sekejap.
          </p>
        </div>
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none">
          <Cpu className="w-80 h-80 -mr-10 -mt-10 animate-spin-slow" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Sidebar Controls */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2 shadow-sm h-fit">
          <p className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider mb-2">Fitur AI</p>
          {[
            { id: 'rapat', name: 'Ringkasan Rapat', desc: 'Rangkum notulen kasar rapat', icon: FileText },
            { id: 'kas', name: 'Analisis Keuangan Kas', desc: 'Evaluasi pemasukan & pengeluaran', icon: TrendingUp },
            { id: 'surat', name: 'Draf Surat Resmi RT', desc: 'Buat surat pengantar instan', icon: FileEdit },
            { id: 'klasifikasi', name: 'Klasifikasi Keluhan', desc: 'Kategorikan pengaduan warga', icon: AlertCircle },
          ].map((feat) => {
            const Icon = feat.icon;
            const active = activeSubTab === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => {
                  setActiveSubTab(feat.id as any);
                  setResult('');
                  setErrorMsg('');
                }}
                className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left transition-all ${
                  active 
                    ? 'bg-teal-50/70 border border-teal-100/80 text-teal-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${active ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm leading-tight">{feat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{feat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <AnimatePresence mode="wait">
              {activeSubTab === 'rapat' && (
                <motion.div
                  key="rapat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-800">Ringkasan Rapat Otomatis</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tempelkan transkrip audio, risalah kasar, atau corat-coret poin pembahasan rapat warga. Smart RT AI akan mengubahnya menjadi notulen rapat yang tertata rapi dlm hitungan detik.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan Kasar Rapat / Risalah</label>
                    <textarea
                      placeholder="Contoh: Rapat tgl 5 agustus. Hadir p rt, bendahara, pak eko, bu dwi. Bahas 17 agustusan, anggaran lomba 2 juta dari kas, p eko jadi ketua panitia. Sama bahas kerja bakti got buat musim hujan minggu depan jam 7 pagi..."
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      rows={6}
                      className="w-full text-sm p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={() => runAiAction('ringkasan_rapat', { notes: meetingNotes })}
                    disabled={loading || !meetingNotes.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Rangkum dlm Notulen Rapi
                  </button>
                </motion.div>
              )}

              {activeSubTab === 'kas' && (
                <motion.div
                  key="kas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-800">Analisis Kesehatan Kas RT</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Smart RT AI akan membaca seluruh data kas terbaru dari basis data Mongoose RT untuk memberikan gambaran arus keuangan, tren alokasi belanja, peringatan surplus/defisit, serta rekomendasi anggaran.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Layanan ini akan secara otomatis memindai transaksi masuk dan keluar serta mengelompokkannya ke dalam pos keuangan (Kas Umum, Dana Amalan Kematian, Kas Darurat, Sosial, dll.) secara cerdas.
                    </p>
                  </div>
                  <button
                    onClick={() => runAiAction('analisa_kas', {})}
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Mulai Analisa Keuangan Kas
                  </button>
                </motion.div>
              )}

              {activeSubTab === 'surat' && (
                <motion.div
                  key="surat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileEdit className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-800">Draft Surat Resmi RT Instan</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Dapatkan draf naskah surat pengantar atau keterangan kelakuan baik tingkat Rukun Tetangga yang formal dan sopan sesuai standar regulasi Indonesia dlm hitungan detik.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Surat</label>
                      <select
                        value={suratJenis}
                        onChange={(e) => setSuratJenis(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option>Surat Pengantar RT</option>
                        <option>Surat Keterangan Domisili</option>
                        <option>Surat Keterangan Kematian</option>
                        <option>Surat Pengantar Pembuatan KK/KTP</option>
                        <option>Surat Keterangan Usaha (SKU)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Penerima / Pemohon</label>
                      <input
                        type="text"
                        placeholder="Contoh: Muhammad Adji"
                        value={suratNama}
                        onChange={(e) => setSuratNama(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tujuan / Keperluan Surat</label>
                    <input
                      type="text"
                      placeholder="Contoh: Sebagai berkas pelengkap pendaftaran kepindahan domisili ke luar kota"
                      value={suratKeperluan}
                      onChange={(e) => setSuratKeperluan(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Keterangan Tambahan / Detail Pendukung</label>
                    <textarea
                      placeholder="Contoh: Alamat asal di RT 03 RW 05, sudah tinggal sejak thn 2012, berencana pindah karena tugas pekerjaan baru."
                      value={suratKeterangan}
                      onChange={(e) => setSuratKeterangan(e.target.value)}
                      rows={3}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => runAiAction('draft_surat', { jenis: suratJenis, nama: suratNama, keperluan: suratKeperluan, keterangan: suratKeterangan })}
                    disabled={loading || !suratNama.trim() || !suratKeperluan.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Buat Draf Surat Resmi
                  </button>
                </motion.div>
              )}

              {activeSubTab === 'klasifikasi' && (
                <motion.div
                  key="klasifikasi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-800">Klasifikasi & Analisis Laporan Warga</h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Unggah keluhan warga, maka Smart RT AI akan langsung mengelompokkannya ke ketegori yang sesuai, mendeteksi tingkat keparahan/prioritas, serta mengusulkan tindakan tercepat bagi pengurus RT.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Judul Laporan Keluhan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Lampu jalan mati di gang samping mushola"
                      value={laporanJudul}
                      onChange={(e) => setLaporanJudul(e.target.value)}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Detail Deskripsi Keluhan</label>
                    <textarea
                      placeholder="Contoh: Sudah 3 hari lampu jalan mati gelap gulita, warga khawatir kalau malam rawan terjadi hal2 kriminal/terpeleset karena jalannya berkerikil..."
                      value={laporanDeskripsi}
                      onChange={(e) => setLaporanDeskripsi(e.target.value)}
                      rows={4}
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => runAiAction('klasifikasi_laporan', { judul: laporanJudul, deskripsi: laporanDeskripsi })}
                    disabled={loading || !laporanJudul.trim() || !laporanDeskripsi.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Klasifikasikan Laporan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Block */}
          {(result || loading || errorMsg) && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                  Keluaran Smart RT AI
                </span>
                {result && (
                  <button
                    onClick={copyToClipboard}
                    className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1.5 p-1 bg-teal-50/50 hover:bg-teal-50 rounded px-2 border border-teal-100/50 transition pointer-events-auto cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin' : 'Salin Hasil'}
                  </button>
                )}
              </div>

              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                  <p className="text-xs text-gray-500 animate-pulse font-medium">Smart RT AI sedang memproses naskah untuk Anda...</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold">Gagal Eksekusi AI</p>
                    <p className="leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="text-xs text-gray-800 leading-relaxed font-sans prose prose-teal max-w-none bg-gray-50 rounded-xl p-5 border border-gray-100 overflow-x-auto whitespace-pre-wrap">
                  {result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
