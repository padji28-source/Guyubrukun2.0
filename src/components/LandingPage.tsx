import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  HelpCircle, 
  Phone, 
  Users, 
  Store, 
  Vote, 
  Bot, 
  Bell, 
  ArrowRight, 
  Menu, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Activity, 
  ChevronDown, 
  MessageSquare, 
  Send,
  Heart,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { LogoCommunityIcon } from '../App';

interface LandingPageProps {
  onEnterPortal: (mode: 'login' | 'register') => void;
}

export function LandingPage({ onEnterPortal }: LandingPageProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [guideTab, setGuideTab] = useState<'warga' | 'pengurus'>('warga');

  const [rtData, setRtData] = useState<{
    jumlahKK: number;
    jumlahWarga: number;
    saldoKas: number;
    lakiLaki: number;
    perempuan: number;
    groups: { key: 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia'; name: string; range: string; count: number; fill: string; desc: string }[];
    pengurusList: { id: string; nama: string; role: string; jabatan: string; alamat: string; noHp: string; photo?: string }[];
  }>({
    jumlahKK: 62,
    jumlahWarga: 157,
    saldoKas: 13111500,
    lakiLaki: 82,
    perempuan: 75,
    groups: [
      { key: 'balita', name: 'Balita', range: '0 - 4 Thn', count: 23, fill: '#3b82f6', desc: 'Usia dini & pemantauan tumbuh kembang Posyandu' },
      { key: 'anak', name: 'Anak', range: '5 - 12 Thn', count: 20, fill: '#10b981', desc: 'Usia sekolah dasar & pendidikan karakter anak' },
      { key: 'remaja', name: 'Remaja', range: '13 - 20 Thn', count: 11, fill: '#8b5cf6', desc: 'Generasi muda & kepemudaan Karang Taruna RT 01' },
      { key: 'dewasa', name: 'Dewasa', range: '21 - 70 Thn', count: 103, fill: '#f97316', desc: 'Usia produktif, kepala keluarga & penggerak warga' },
      { key: 'lansia', name: 'Lansia', range: '> 70 Thn', count: 0, fill: '#f43f5e', desc: 'Warga senior & prioritas layanan kesehatan lansia' }
    ],
    pengurusList: [
      { id: 'admin', nama: 'M Adji Prasetyo', role: 'admin', jabatan: 'Ketua RT 01 / RW 21', alamat: 'Blok F No. 22', noHp: '081214007871' },
      { id: '1780632155228', nama: 'Sugiarto', role: 'sekretaris', jabatan: 'Sekretaris I', alamat: 'Blok D No. 21', noHp: '087774173981' },
      { id: '1780632232043', nama: 'Muhamad Rudiyanto', role: 'sekretaris', jabatan: 'Sekretaris II', alamat: 'Blok D No. 11A', noHp: '' },
      { id: '1780631318323', nama: 'Syarif Hidayatullah', role: 'bendahara', jabatan: 'Bendahara I', alamat: 'Blok F No. 08', noHp: '0811133121245' },
      { id: '1780632112878', nama: 'Wahyu Hidayat', role: 'bendahara', jabatan: 'Bendahara II', alamat: 'Blok F No. 16', noHp: '083806671251' },
      { id: '1780632188648', nama: 'Suharja', role: 'pengurus', jabatan: 'Koordinator Keamanan & Ketertiban', alamat: 'Blok D No. 25', noHp: '' },
      { id: '1783122633258', nama: 'Imam', role: 'pengurus', jabatan: 'Koordinator Humas & Sosial Lingkungan', alamat: 'Blok D No. 17', noHp: '' }
    ]
  });

  useEffect(() => {
    let mounted = true;
    fetch('/api/dashboard/summary', { headers: { 'x-rt-id': 'rt01' } })
      .then(r => r.json())
      .then(data => {
        if (!mounted || !data?.metrics) return;
        const m = data.metrics;
        const d = m.demographics || {};
        const descMap: Record<string, string> = {
          balita: 'Usia dini & pemantauan tumbuh kembang Posyandu',
          anak: 'Usia sekolah dasar & pendidikan karakter anak',
          remaja: 'Generasi muda & kepemudaan Karang Taruna RT 01',
          dewasa: 'Usia produktif, kepala keluarga & penggerak warga',
          lansia: 'Warga senior & prioritas layanan kesehatan lansia'
        };
        const updatedGroups = [
          { key: 'balita' as const, name: 'Balita', range: '0 - 4 Thn', count: d.balita ?? 23, fill: '#3b82f6', desc: descMap.balita },
          { key: 'anak' as const, name: 'Anak', range: '5 - 12 Thn', count: d.anak ?? 20, fill: '#10b981', desc: descMap.anak },
          { key: 'remaja' as const, name: 'Remaja', range: '13 - 20 Thn', count: d.remaja ?? 11, fill: '#8b5cf6', desc: descMap.remaja },
          { key: 'dewasa' as const, name: 'Dewasa', range: '21 - 70 Thn', count: d.dewasa ?? 103, fill: '#f97316', desc: descMap.dewasa },
          { key: 'lansia' as const, name: 'Lansia', range: '> 70 Thn', count: d.lansia ?? 0, fill: '#f43f5e', desc: descMap.lansia }
        ];
        setRtData(prev => ({
          jumlahKK: m.jumlahKK ?? prev.jumlahKK,
          jumlahWarga: m.jumlahWarga ?? prev.jumlahWarga,
          saldoKas: m.saldoKas ?? prev.saldoKas,
          lakiLaki: d.lakiLaki || prev.lakiLaki,
          perempuan: d.perempuan || prev.perempuan,
          groups: updatedGroups,
          pengurusList: Array.isArray(data.pengurusList) && data.pengurusList.length > 0 ? data.pengurusList : (Array.isArray(m.pengurusList) && m.pengurusList.length > 0 ? m.pengurusList : prev.pengurusList)
        }));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: 'Total Warga RT 01', value: `${rtData.jumlahWarga} Jiwa`, sub: `${rtData.jumlahKK} Kepala Keluarga (KK)`, icon: Users, color: 'text-teal-600 bg-teal-50' },
    { label: 'Kepala Keluarga', value: `${rtData.jumlahKK} KK`, sub: 'Warga Terverifikasi Aktif', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Transparansi Kas', value: `Rp ${(rtData.saldoKas / 1000000).toFixed(1).replace('.', ',')} Jt`, sub: 'Saldo Kas Tercatat Real-time', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pengurus & Koordinator', value: '26 Orang', sub: 'Pengurus Inti, Seksi & Blok', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  ];

  const features = [
    {
      title: 'Administrasi Surat Online',
      desc: 'Ajukan surat pengantar RT/RW secara online kapan saja tanpa perlu berkunjung secara fisik ke rumah Ketua RT.',
      icon: FileText,
      badge: 'Instan',
      color: 'from-teal-500/10 to-emerald-500/5 hover:border-teal-200'
    },
    {
      title: 'Transparansi Kas Digital',
      desc: 'Pantau laporan keuangan, iuran bulanan warga, pengeluaran pembangunan, dan saldo kas RT secara terbuka dan real-time.',
      icon: TrendingUp,
      badge: '100% Terbuka',
      color: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-200'
    },
    {
      title: 'Aduan & Aspirasi Lingkungan',
      desc: 'Laporkan kendala lingkungan seperti jalan rusak, lampu mati, atau isu keamanan lengkap dengan foto, serta pantau progres penanganannya.',
      icon: MessageSquare,
      badge: 'Responsif',
      color: 'from-rose-500/10 to-orange-500/5 hover:border-rose-200'
    },
    {
      title: 'Asisten Pintar AI (Smart RT AI)',
      desc: 'Layanan tanya jawab 24 jam dengan asisten AI yang cerdas mengenai informasi RT, jadwal ronda, pengumuman, dan aturan warga.',
      icon: Bot,
      badge: 'AI-Powered',
      color: 'from-violet-500/10 to-fuchsia-500/5 hover:border-violet-200'
    },
    {
      title: 'Musyawarah & E-Voting',
      desc: 'Ambil keputusan bersama secara demokratis melalui pemungutan suara online (e-voting) warga tanpa harus berkumpul tatap muka.',
      icon: Vote,
      badge: 'Demokratis',
      color: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-200'
    },
    {
      title: 'Pasar & Iklan UMKM Warga',
      desc: 'Dukung perekonomian tetangga dengan memajang produk usaha Anda atau berbelanja produk berkualitas buatan warga setempat.',
      icon: Store,
      badge: 'Ekonomi Lokal',
      color: 'from-amber-500/10 to-yellow-500/5 hover:border-amber-200'
    }
  ];

  const workflow = [
    { step: '01', title: 'Registrasi Mandiri', desc: 'Warga mengisi biodata, NIK, No. KK, dan mengunggah foto profil secara mudah.' },
    { step: '02', title: 'Verifikasi Pengurus', desc: 'Ketua RT atau Sekretaris meninjau data warga dan mengaktifkan akun digital Anda.' },
    { step: '03', title: 'Akses Layanan Digital', desc: 'Nikmati semua layanan surat online, pantau kas RT, berpartisipasi e-voting, dan lapor tamu.' },
    { step: '04', title: 'Komunitas Terintegrasi', desc: 'Dukung lingkungan RT yang rukun, transparan, aman, dan berdaya saing tinggi.' }
  ];

  const events = [
    {
      title: 'Rapat Evaluasi Triwulan & Silaturahmi',
      date: 'Minggu, 19 Juli 2026',
      time: '19:30 WIB - Selesai',
      loc: 'Balai Warga RT 01',
      tag: 'Musyawarah',
      desc: 'Membahas evaluasi kas RT, program kerja siskamling, dan ramah tamah antar warga.'
    },
    {
      title: 'Kerja Bakti Akbar Bersih Lingkungan',
      date: 'Minggu, 26 Juli 2026',
      time: '07:00 - 11:00 WIB',
      loc: 'Wilayah Lingkungan RT 01',
      tag: 'Sosial',
      desc: 'Gotong royong membersihkan saluran air, merapikan tanaman liar, dan pengecatan gapura.'
    },
    {
      title: 'Pemeriksaan Kesehatan Gratis Posyandu',
      date: 'Rabu, 05 Agustus 2026',
      time: '08:30 - 12:00 WIB',
      loc: 'Pos Ronda RT 01',
      tag: 'Kesehatan',
      desc: 'Layanan imunisasi balita, pemeriksaan tensi lansia, dan pembagian makanan tambahan bergizi.'
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar akun di portal warga?',
      a: 'Sangat mudah! Anda hanya perlu mengeklik tombol "Daftar Warga" di bagian atas halaman ini, memilih RT tempat tinggal Anda, lalu mengisi formulir registrasi dengan menyertakan NIK, No. KK, alamat lengkap, dan membuat password pribadi Anda.'
    },
    {
      q: 'Apakah pengajuan surat pengantar dikenakan biaya?',
      a: 'Tidak sama sekali. Seluruh proses pelayanan administrasi surat-menyurat di portal warga Guyub Rukun RT 01 ini 100% gratis dan transparan untuk seluruh warga terdaftar.'
    },
    {
      q: 'Bagaimana keamanan data pribadi yang saya unggah?',
      a: 'Data pribadi Anda, termasuk NIK, No. KK, dan informasi lainnya disimpan di server database cloud yang aman dengan enkripsi tingkat tinggi. Pengurus RT berkomitmen menjaga kerahasiaan data warga sesuai undang-undang perlindungan data pribadi.'
    },
    {
      q: 'Apakah warga non-permanen (kost/kontrak) boleh mendaftar?',
      a: 'Tentu saja boleh. Portal ini dibuat untuk merangkul seluruh warga di lingkungan RT 01. Saat registrasi, Anda dapat memilih status tempat tinggal sebagai "Warga Kontrak" atau "Warga Kost" agar pengurus dapat mengelompokkan data dengan akurat.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactSubmitted(false), 5000);
    }, 1200);
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 selection:bg-teal-500 selection:text-white font-sans overflow-x-hidden antialiased">
      {/* 1. STICKY HEADER & NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-xl shadow-md shadow-teal-500/10 border border-teal-400/20 shrink-0">
              <LogoCommunityIcon size="20" colorAccent="#ffffff" colorPrimary="#ffffff" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black leading-none tracking-tight text-slate-800">
                GUYUB <span className="text-teal-600">RUKUN</span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Balai Warga Digital</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-600">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-teal-600 transition-colors cursor-pointer">Beranda</button>
            <button onClick={() => scrollToId('data-warga')} className="hover:text-teal-600 transition-colors cursor-pointer text-teal-700 font-bold">Data Warga RT 01</button>
            <button onClick={() => scrollToId('struktur-organisasi')} className="hover:text-teal-600 transition-colors cursor-pointer text-teal-700 font-bold">Struktur Organisasi</button>
            <button onClick={() => scrollToId('fitur')} className="hover:text-teal-600 transition-colors cursor-pointer">Layanan & Fitur</button>
            <button onClick={() => scrollToId('panduan')} className="hover:text-teal-600 transition-colors cursor-pointer text-teal-600 font-extrabold bg-teal-50 px-2.5 py-1 rounded-lg">Cara Pakai 💡</button>
            <button onClick={() => scrollToId('faq')} className="hover:text-teal-600 transition-colors cursor-pointer">FAQ</button>
            <button onClick={() => scrollToId('hubungi')} className="hover:text-teal-600 transition-colors cursor-pointer">Hubungi Kami</button>
          </nav>

          {/* Action CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => onEnterPortal('login')}
              className="px-5 py-2.5 text-slate-700 hover:text-teal-600 font-bold text-xs transition-colors rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Masuk Portal
            </button>
            <button 
              onClick={() => onEnterPortal('register')}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-500/15 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Daftar Warga
            </button>
          </div>

          {/* Mobile Menu Trigger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-inner"
            >
              <div className="flex flex-col gap-4 px-6 py-6 font-semibold text-slate-600 text-sm">
                <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer">Beranda</button>
                <button onClick={() => { scrollToId('data-warga'); setMobileMenuOpen(false); }} className="text-left py-1 text-teal-700 font-bold hover:text-teal-600 cursor-pointer">Data Warga RT 01 (Kategori Usia)</button>
                <button onClick={() => { scrollToId('struktur-organisasi'); setMobileMenuOpen(false); }} className="text-left py-1 text-teal-700 font-bold hover:text-teal-600 cursor-pointer">Struktur Organisasi RT 01</button>
                <button onClick={() => { scrollToId('fitur'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer">Layanan & Fitur</button>
                <button onClick={() => { scrollToId('panduan'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer text-teal-600 font-extrabold bg-teal-50 px-2.5 py-1 rounded-lg">Cara Pakai 💡</button>
                <button onClick={() => { scrollToId('alur'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer">Alur Pelayanan</button>
                <button onClick={() => { scrollToId('faq'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer">FAQ</button>
                <button onClick={() => { scrollToId('hubungi'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-teal-600 cursor-pointer">Hubungi Kami</button>
                <div className="h-px bg-slate-100 my-2"></div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onEnterPortal('login'); }}
                    className="flex-1 py-3 text-center text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl font-bold text-xs"
                  >
                    Masuk Portal
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onEnterPortal('register'); }}
                    className="flex-1 py-3 text-center bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/10"
                  >
                    Daftar Warga
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative py-12 md:py-24 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 right-0 w-[40rem] h-[40rem] bg-teal-200/20 rounded-full blur-3xl -translate-y-12 translate-x-32"></div>
        <div className="absolute bottom-1/4 left-0 w-[30rem] h-[30rem] bg-emerald-200/20 rounded-full blur-3xl translate-y-12 -translate-x-32"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-12 gap-12 items-center">
          {/* Left Column Text Content */}
          <div className="md:col-span-7 flex flex-col items-start text-left">
            {/* Live Indicator Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 font-extrabold text-[10px] uppercase tracking-wider rounded-full mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              Sistem Informasi Digital Rukun Tetangga (RT)
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]"
            >
              Kelola Layanan RT Lebih <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Transparan</span>, Cepat, & <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Guyub Rukun</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 mt-6 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl"
            >
              Satu portal terintegrasi untuk mempermudah permohonan surat pengantar, pemantauan kas transparan, aduan warga, e-voting musyawarah, ronda siskamling, promosi UMKM lokal, hingga asisten AI warga 24 jam.
            </motion.p>

            {/* CTA Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => onEnterPortal('login')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-teal-500/20 active:scale-98 hover:shadow-2xl hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Masuk Portal Warga</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToId('data-warga')}
                className="w-full sm:w-auto px-7 py-4 bg-white border-2 border-slate-200 hover:border-teal-400 text-slate-700 font-extrabold text-sm rounded-2xl hover:bg-slate-50 active:scale-98 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Data Warga & Struktur RT 01</span>
              </button>
              {deferredPrompt && (
                <button 
                  onClick={handleInstall}
                  className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                >
                  <span>📥 Pasang Aplikasi</span>
                </button>
              )}
            </motion.div>

            {/* Quick Badges of benefits */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-slate-400 border-t border-slate-100 pt-8 w-full"
            >
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal-600" /> Bebas Pungli / 100% Gratis</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-teal-600" /> Pemantauan Real-time</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Mempererat Guyub Tetangga</span>
            </motion.div>
          </div>

          {/* Right Column App UI Preview Mock-up */}
          <div className="md:col-span-5 relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full max-w-[340px] relative aspect-[9/18.8] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 ring-12 ring-slate-900/50 overflow-hidden"
            >
              {/* Phone Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-45 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full mb-1"></div>
              </div>

              {/* Simulated UI Screen */}
              <div className="w-full h-full bg-[#f8fafc] rounded-[30px] overflow-hidden relative flex flex-col text-slate-800 text-[10px] leading-tight select-none pt-4">
                
                {/* Simulated Status Bar */}
                <div className="px-5 pt-2 pb-1.5 flex justify-between items-center text-slate-400 font-bold text-[8px] bg-white">
                  <span>19:37 WIB</span>
                  <div className="flex gap-1 items-center">
                    <span className="text-[7px]">LTE</span>
                    <div className="w-3.5 h-2 bg-slate-300 rounded-xs relative flex items-center p-0.5">
                      <div className="w-1.5 h-full bg-teal-500 rounded-3xs"></div>
                    </div>
                  </div>
                </div>

                {/* Simulated App Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100/60 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.015)]">
                  <div className="flex items-center gap-2">
                    {/* Green App Logo */}
                    <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/10 shrink-0">
                      <LogoCommunityIcon size="18" colorAccent="#ffffff" colorPrimary="#ffffff" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-black leading-none text-slate-800 tracking-tight flex items-center gap-1">
                        GUYUB <span className="text-teal-600">RUKUN</span>
                      </span>
                      <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Aplikasi Warga</span>
                    </div>
                  </div>
                  {/* Notification Circle */}
                  <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 relative cursor-pointer hover:bg-slate-50">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  </div>
                </div>

                {/* Profile Greeting Area */}
                <div className="px-4 py-3 bg-gradient-to-r from-teal-50/70 to-emerald-50/20 flex items-center justify-between text-left">
                  <div>
                    <h4 className="text-[14px] font-black text-slate-800 leading-tight">Halo, M Adji!</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">Warga RT 01, Blok F No. 22</p>
                  </div>
                  {/* Red jersey avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="#1e293b" />
                        <path d="M-10 20 L110 80 M-10 40 L110 100" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                        {/* Red Sports Jersey */}
                        <path d="M25 45 L35 30 L42 35 L42 100 L58 100 L58 35 L65 30 L75 45 L68 55 L58 50 L58 100 L42 100 L42 50 L32 55 Z" fill="#b91c1c" />
                        <path d="M25 45 L28 41 L35 30 M75 45 L72 41 L65 30" stroke="#ffffff" strokeWidth="1.5" />
                        <path d="M46 32 L50 38 L54 32" stroke="#ffffff" strokeWidth="2" fill="none" />
                        <text x="50" y="68" fill="#ffffff" fontSize="26" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">7</text>
                      </svg>
                    </div>
                    {/* Green online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                </div>

                {/* Simulated Content Scrollable View */}
                <div className="flex-grow overflow-y-auto px-4 py-2 space-y-3.5">
                  {/* Teal Balance Card */}
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-4 text-white text-left relative overflow-hidden shadow-md shadow-teal-500/10">
                    <div className="absolute right-0 bottom-0 w-28 h-28 bg-white/5 rounded-full translate-x-10 translate-y-10 blur-sm"></div>

                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[8px] font-extrabold tracking-widest text-emerald-100 uppercase">SALDO KAS RT 01</span>
                      <div className="flex gap-2 items-center text-white/80">
                        <span className="text-[10px]">👁️</span>
                        <span className="text-[10px]">💳</span>
                      </div>
                    </div>

                    <div className="text-[19px] font-black text-white tracking-tight mt-1.5 relative z-10">
                      Rp 8.818.500
                    </div>

                    <div className="flex gap-1.5 mt-3 relative z-10">
                      <div className="bg-white/15 backdrop-blur-xs text-white text-[7px] font-extrabold px-2.5 py-1 rounded-full flex items-center">
                        Sosial: Rp 1.400.000
                      </div>
                      <div className="bg-white/15 backdrop-blur-xs text-white text-[7px] font-extrabold px-2.5 py-1 rounded-full flex items-center">
                        Kematian: Rp 6.345.000
                      </div>
                    </div>
                  </div>

                  {/* Layanan Warga Section */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-left">
                      <span className="text-[11px] font-black text-slate-800">Layanan Warga</span>
                      <div className="flex gap-1">
                        <span className="text-[6.5px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/40">Edit Posisi</span>
                        <span className="text-[6.5px] font-extrabold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-100/40">Lihat Semua</span>
                      </div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-4 gap-x-1.5 gap-y-3 pt-1 text-center">
                      {/* 1. Surat */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Surat</span>
                      </div>

                      {/* 2. Lapor RT */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#ff5b73] to-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-500/10">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Lapor RT</span>
                      </div>

                      {/* 3. Dokumen */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#ea580c] rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-500/10">
                          <span className="text-sm">📁</span>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Dokumen</span>
                      </div>

                      {/* 4. Notulen Rapat */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center text-white shadow-md shadow-cyan-500/10">
                          <span className="text-sm">📄</span>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Notulen Rapat</span>
                      </div>

                      {/* 5. Media */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#d946ef] to-[#a21caf] rounded-2xl flex items-center justify-center text-white shadow-md shadow-fuchsia-500/10">
                          <span className="text-sm">🖼️</span>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Media</span>
                      </div>

                      {/* 6. Iuran */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#047857] rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
                          <span className="text-sm">💵</span>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Iuran</span>
                      </div>

                      {/* 7. Kas */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
                          <span className="text-sm">💼</span>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Kas</span>
                      </div>

                      {/* 8. Data Warga */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-2xl flex items-center justify-center text-white shadow-md shadow-violet-500/10">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[7.5px] font-black text-slate-600 leading-tight">Data Warga</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Calendar Section */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-800">Kalender Kegiatan RT</span>
                        <span className="text-[6.5px] font-bold text-slate-400">Juli 2026</span>
                      </div>
                      <span className="text-[6px] font-extrabold bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">Lihat Semua</span>
                    </div>

                    {/* Mini Calendar Days */}
                    <div className="grid grid-cols-7 gap-0.5 text-center font-bold text-[6px] text-slate-400">
                      <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center font-black text-[7px] text-slate-700">
                      <span className="text-slate-200">29</span>
                      <span className="text-slate-200">30</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span className="text-teal-600">5</span>
                      <span>6</span>
                      <span>7</span>
                      <span>8</span>
                      <span>9</span>
                      <span>10</span>
                      <span>11</span>
                      <span className="text-teal-600">12</span>
                      <span className="bg-teal-500 text-white rounded-full flex items-center justify-center w-3.5 h-3.5 mx-auto relative text-[6px]">
                        13
                      </span>
                      <span>14</span>
                      <span>15</span>
                      <span>16</span>
                      <span>17</span>
                      <span className="text-teal-600">18</span>
                      <span className="relative text-rose-500">
                        19
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-rose-500 rounded-full"></span>
                      </span>
                      <span>20</span>
                      <span>21</span>
                      <span>22</span>
                      <span>23</span>
                      <span>24</span>
                      <span className="text-teal-600">25</span>
                      <span className="relative text-emerald-600">
                        26
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-emerald-500 rounded-full"></span>
                      </span>
                    </div>

                    {/* Upcoming Simulated Event */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] shrink-0">📅</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[7.5px] font-black text-slate-800 truncate leading-none">Rapat Evaluasi Triwulan</span>
                          <span className="text-[6px] font-bold text-slate-400 mt-0.5">Minggu, 19 Juli • 19:30 WIB</span>
                        </div>
                      </div>
                      <span className="text-[5.5px] font-black text-rose-500 bg-rose-50 px-1 py-0.5 rounded shrink-0">Musyawarah</span>
                    </div>
                  </div>
                </div>

                {/* Sticky Mobile Bottom Bar */}
                <div className="mt-auto bg-white border-t border-slate-100 py-2 px-5 flex justify-between text-slate-400 font-bold text-[7.5px] shadow-[0_-1px_3px_rgba(0,0,0,0.01)]">
                  <div className="flex flex-col items-center gap-0.5 text-teal-600">
                    <span className="text-base leading-none">🏠</span>
                    <span className="font-extrabold">Beranda</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base leading-none">📅</span>
                    <span>Acara</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base leading-none">📋</span>
                    <span>Laporan</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base leading-none">👤</span>
                    <span>Profil</span>
                  </div>
                </div>
              </div>

              {/* Outer decorative highlights */}
              <div className="absolute top-1/2 left-0 w-1.5 h-10 bg-slate-800 rounded-r-lg -translate-y-12"></div>
              <div className="absolute top-1/2 left-0 w-1.5 h-14 bg-slate-800 rounded-r-lg"></div>
              <div className="absolute top-1/3 right-0 w-1.5 h-16 bg-slate-800 rounded-l-lg"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. QUICK STATS SECTION */}
      <section id="statistik" className="py-12 md:py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className={`p-4 rounded-2xl shrink-0 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none tabular-nums">{item.value}</p>
                  <p className="text-xs font-bold text-slate-800 mt-2">{item.label}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5 STATISTIK WARGA RT 01 SESUAI KATEGORI USIA */}
      <section id="data-warga" className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <span className="text-xs font-bold tracking-wider text-teal-700">
              Demografi Kependudukan · RT 01 / RW 21 Wisma Garden
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2 leading-tight">
              Statistik Warga RT 01 Berdasarkan Kategori Usia
            </h2>
            <p className="text-slate-500 mt-3 text-sm md:text-base font-medium leading-relaxed">
              Rekapitulasi jumlah warga lingkungan RT 01 secara real-time yang dikelompokkan ke dalam 5 kategori usia mulai dari Balita hingga Lansia (&gt; 70 Tahun) tanpa menampilkan data pribadi warga.
            </p>
          </div>

          {/* 5 Age Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
            {rtData.groups.map((grp, idx) => {
              const total = Math.max(1, rtData.jumlahWarga);
              const pct = Math.round((grp.count / total) * 100);
              return (
                <motion.div
                  key={grp.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="text-left p-5 rounded-2xl border bg-white text-slate-800 border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: grp.fill }}
                      />
                      <span className="text-xs font-semibold tabular-nums text-slate-500">
                        {grp.range}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <h3 className="text-base font-black tracking-tight text-slate-900">
                        {grp.name}
                      </h3>
                      <span className="text-2xl font-black tabular-nums text-slate-900">
                        {grp.count} <span className="text-xs font-semibold">Jiwa</span>
                      </span>
                    </div>

                    <p className="text-[11px] mt-2 leading-relaxed text-slate-500">
                      {grp.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5 tabular-nums">
                      <span className="text-slate-500">Proporsi Warga</span>
                      <span className="text-slate-700">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(grp.count > 0 ? 6 : 0, pct)}%`, backgroundColor: grp.fill }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Visual Distribution Chart & Summary Bar */}
          <div className="mt-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Grafik & Komposisi Demografi Warga RT 01 ({rtData.jumlahWarga} Jiwa · {rtData.jumlahKK} KK)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Laki-laki: <strong className="text-slate-800 tabular-nums">{rtData.lakiLaki} Jiwa</strong> · Perempuan: <strong className="text-slate-800 tabular-nums">{rtData.perempuan} Jiwa</strong>
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">
                Data Statistik Terverifikasi Pengurus RT 01
              </span>
            </div>

            {/* Vertical Bar Chart */}
            {(() => {
              const maxCount = Math.max(...rtData.groups.map(g => g.count), 4);
              const yTicks = [maxCount, Math.round(maxCount * 0.5), 0];
              return (
                <div className="h-52 w-full bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mt-6 flex flex-col justify-between">
                  <div className="relative flex-1 flex items-end gap-3 sm:gap-6 pl-8 pr-3 pt-6 pb-1 border-b border-slate-200">
                    {/* Y-Axis & Gridlines */}
                    <div className="absolute inset-y-0 left-0 right-3 flex flex-col justify-between pointer-events-none pt-5 pb-1">
                      {yTicks.map((t, tIdx) => (
                        <div key={`ytick_${tIdx}`} className="flex items-center w-full">
                          <span className="w-7 text-right pr-2 text-[11px] font-semibold text-slate-400 tabular-nums">
                            {t}
                          </span>
                          <div className="flex-1 border-b border-dashed border-slate-200/80" />
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    {rtData.groups.map(item => {
                      const heightPct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 3) : 3;
                      return (
                        <div
                          key={`chart_bar_${item.key}`}
                          className="relative z-10 flex-1 h-full flex flex-col items-center justify-end"
                        >
                          <span className="text-xs font-black text-slate-800 mb-1.5 tabular-nums">
                            {item.count}
                          </span>
                          <div
                            className="w-full max-w-[56px] rounded-t-xl transition-all duration-500"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: item.fill,
                              opacity: item.count === 0 ? 0.25 : 1
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex items-center gap-3 sm:gap-6 pl-8 pr-3 pt-2">
                    {rtData.groups.map(item => (
                      <div key={`chart_lbl_${item.key}`} className="flex-1 text-center">
                        <span className="text-xs font-bold text-slate-800 block leading-tight truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {item.range}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Stacked Proportion Bar */}
            <div className="mt-6">
              <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {rtData.groups.map((grp) => {
                  const pct = rtData.jumlahWarga > 0 ? (grp.count / rtData.jumlahWarga) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={`bar_${grp.key}`}
                      style={{ width: `${pct}%`, backgroundColor: grp.fill }}
                      title={`${grp.name} (${grp.range}): ${grp.count} Jiwa`}
                      className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 mt-3 text-xs text-slate-600">
                {rtData.groups.map((grp) => (
                  <div key={`leg_${grp.key}`} className="flex items-center gap-2 tabular-nums">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: grp.fill }} />
                    <span className="font-semibold text-slate-800">{grp.name}</span>
                    <span className="text-slate-400">({grp.range})</span>
                    <span className="font-bold text-slate-900">{grp.count} Jiwa</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.8 STRUKTUR ORGANISASI PENGURUS RT 01 */}
      <section id="struktur-organisasi" className="py-20 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <span className="text-xs font-bold tracking-wider text-teal-700">
              Tata Kelola Lingkungan · Masa Bakti Aktif
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2 leading-tight">
              Struktur Organisasi Pengurus RT 01 / RW 21
            </h2>
            <p className="text-slate-500 mt-3 text-sm md:text-base font-medium leading-relaxed">
              Susunan kepengurusan Rukun Tetangga 01 / RW 21 Wisma Garden, Kelurahan Kutajaya, Kecamatan Pasarkemis, Kabupaten Tangerang yang bertugas melayani administrasi dan kerukunan warga.
            </p>
          </div>

          {/* Hierarchical Organization Chart */}
          {(() => {
            const ketua = rtData.pengurusList.find(p => p.role === 'admin') || {
              id: 'admin',
              nama: 'M Adji Prasetyo',
              role: 'admin',
              jabatan: 'Ketua RT 01 / RW 21',
              alamat: 'Blok F No. 22',
              noHp: '081214007871'
            };
            const sekretarisList = rtData.pengurusList.filter(p => p.role === 'sekretaris');
            const bendaharaList = rtData.pengurusList.filter(p => p.role === 'bendahara');

            const seksiBidang = [
              {
                bidang: 'Seksi Humas',
                desc: 'Hubungan masyarakat, komunikasi informasi & publikasi warga',
                accent: 'bg-sky-600 text-white',
                badgeBg: 'bg-sky-50 text-sky-700',
                anggota: ['Imam']
              },
              {
                bidang: 'Seksi Kerohanian',
                desc: 'Kegiatan keagamaan, pengajian & kerukunan umat beragama',
                accent: 'bg-emerald-600 text-white',
                badgeBg: 'bg-emerald-50 text-emerald-700',
                anggota: ['Hafiz', 'Fauzi', 'Wahyu Widodo']
              },
              {
                bidang: 'Seksi Sosial, Pemuda & Olahraga',
                desc: 'Kegiatan kepemudaan, olahraga warga & kepedulian sosial',
                accent: 'bg-indigo-600 text-white',
                badgeBg: 'bg-indigo-50 text-indigo-700',
                anggota: ['Ilham', 'Hendra', 'Fajri']
              },
              {
                bidang: 'Seksi Ketertiban & Keamanan',
                desc: 'Koordinasi siskamling, ronda malam & ketertiban lingkungan',
                accent: 'bg-rose-600 text-white',
                badgeBg: 'bg-rose-50 text-rose-700',
                anggota: ['Fredy', 'Andi', 'Edi Prasetyo']
              },
              {
                bidang: 'Seksi Pembangunan, Lingkungan & Kebersihan',
                desc: 'Kerja bakti, pemeliharaan fasilitas & penghijauan RT 01',
                accent: 'bg-teal-600 text-white',
                badgeBg: 'bg-teal-50 text-teal-700',
                anggota: ['Dwi', 'Wahid', 'Akhmad']
              },
              {
                bidang: 'Seksi Konsumsi & Perlengkapan',
                desc: 'Pengelolaan inventaris warga, logistik & konsumsi kegiatan',
                accent: 'bg-amber-500 text-white',
                badgeBg: 'bg-amber-50 text-amber-700',
                anggota: ['Suharja', 'Didik']
              }
            ];

            const koordinatorBlok = [
              { blok: 'Blok A', nama: 'Rizal' },
              { blok: 'Blok C', nama: 'Ikhsan' },
              { blok: 'Blok D (Genap)', nama: 'Ari Hartoyo' },
              { blok: 'Blok D (Ganjil)', nama: 'Priyanto' },
              { blok: 'Blok E', nama: 'Nurman' },
              { blok: 'Blok F', nama: 'Azirwan' }
            ];

            const getInitials = (name: string) =>
              String(name || 'RT')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(n => n[0]?.toUpperCase())
                .join('');

            return (
              <div className="mt-14 space-y-10">
                {/* TIER 1: KETUA RT */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl shadow-lg border border-teal-500/30 relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                        {getInitials(ketua.nama)}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="text-xs font-bold text-teal-400">
                          Pimpinan Lingkungan
                        </span>
                        <h3 className="text-xl font-black tracking-tight text-white truncate mt-0.5">
                          {ketua.nama}
                        </h3>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">
                          {ketua.jabatan}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Connector Line */}
                  <div className="w-0.5 h-8 bg-teal-500/40" />
                  <div className="w-full max-w-4xl h-0.5 bg-teal-500/30 hidden md:block" />
                </div>

                {/* TIER 2: SEKRETARIS & BENDAHARA */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Sekretaris Group */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-black text-slate-900">Sekretaris RT 01</h4>
                          <p className="text-xs text-slate-500">Administrasi Surat, Kependudukan & Arsip</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {sekretarisList.map((sek, idx) => (
                        <div
                          key={`sek_${sek.id}_${idx}`}
                          className="bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3.5"
                        >
                          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                            {getInitials(sek.nama)}
                          </div>
                          <div className="min-w-0 text-left">
                            <h5 className="text-sm font-bold text-slate-900 truncate">{sek.nama}</h5>
                            <p className="text-xs font-semibold text-blue-600">{sek.jabatan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bendahara Group */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-black text-slate-900">Bendahara RT 01</h4>
                          <p className="text-xs text-slate-500">Pengelolaan Kas RT, Dana Sosial & Iuran Warga</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {bendaharaList.map((ben, idx) => (
                        <div
                          key={`ben_${ben.id}_${idx}`}
                          className="bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3.5"
                        >
                          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
                            {getInitials(ben.nama)}
                          </div>
                          <div className="min-w-0 text-left">
                            <h5 className="text-sm font-bold text-slate-900 truncate">{ben.nama}</h5>
                            <p className="text-xs font-semibold text-emerald-600">{ben.jabatan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TIER 3: SEKSI - SEKSI BIDANG KEPENGURUSAN */}
                <div className="max-w-6xl mx-auto pt-2">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">Seksi – Seksi Bidang Kepengurusan RT 01</h3>
                    <p className="text-xs text-slate-500 mt-1">Pembagian tugas pelayanan sosial, keamanan, pembangunan, dan kegiatan warga</p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seksiBidang.map((seksi, sIdx) => (
                      <motion.div
                        key={`seksi_${sIdx}`}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: sIdx * 0.05 }}
                        className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-3 pb-3.5 mb-3.5 border-b border-slate-200/70">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${seksi.accent}`}>
                              0{sIdx + 1}
                            </div>
                            <div className="text-left min-w-0">
                              <h4 className="text-sm font-black text-slate-900 leading-snug">{seksi.bidang}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{seksi.desc}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {seksi.anggota.map((namaAnggota, aIdx) => (
                              <div
                                key={`angg_${sIdx}_${aIdx}`}
                                className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/70 flex items-center gap-3"
                              >
                                <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${seksi.badgeBg}`}>
                                  {getInitials(namaAnggota)}
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{namaAnggota}</p>
                                  <p className="text-[10px] font-medium text-slate-400">Pengurus {seksi.bidang.replace('Seksi ', '')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* TIER 4: KOORDINATOR BLOK */}
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="text-left">
                      <span className="text-xs font-bold text-teal-400">Perwakilan Wilayah</span>
                      <h3 className="text-lg md:text-xl font-black text-white mt-0.5">Koordinator Blok Lingkungan RT 01</h3>
                      <p className="text-xs text-slate-300 mt-1">Penghubung komunikasi cepat dan koordinasi warga di setiap blok hunian</p>
                    </div>
                    <span className="text-xs font-semibold text-teal-300 tabular-nums">
                      6 Wilayah Blok Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6">
                    {koordinatorBlok.map((item, bIdx) => (
                      <motion.div
                        key={`blok_${bIdx}`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: bIdx * 0.05 }}
                        className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-left flex flex-col justify-between hover:bg-white/15 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-black text-teal-300">{item.blok}</span>
                          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white leading-snug">{item.nama}</p>
                          <p className="text-[10px] font-medium text-slate-300 mt-0.5">Koordinator {item.blok}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="fitur" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Header */}
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full uppercase">FITUR & LAYANAN UNGgULAN</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-4 leading-tight">
              Satu Aplikasi Cerdas Untuk Segala Kebutuhan Warga RT & RW
            </h2>
            <p className="text-slate-500 mt-4 text-sm md:text-base font-medium leading-relaxed">
              Memodernisasi sistem administrasi konvensional menjadi digital demi mewujudkan tata kelola lingkungan yang efektif, mandiri, terbuka, dan harmonis.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`p-8 bg-gradient-to-br ${feat.color} bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] text-left flex flex-col justify-between transition-all`}
              >
                <div>
                  {/* Icon & Badge */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-4 bg-white shadow-md shadow-slate-100 border border-slate-100 text-teal-600 rounded-2xl">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-extrabold bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{feat.badge}</span>
                  </div>

                  {/* Text */}
                  <h3 className="text-base font-black text-slate-800 tracking-tight mb-3">{feat.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{feat.desc}</p>
                </div>

                {/* Arrow indicator */}
                <div className="mt-8 flex items-center gap-1.5 text-[10px] font-extrabold text-teal-600 hover:text-teal-700 cursor-pointer" onClick={() => onEnterPortal('login')}>
                  <span>Mulai Gunakan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE WORKFLOW SECTION */}
      <section id="alur" className="py-20 bg-white border-y border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-teal-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-32"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Header */}
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full uppercase">ALUR KERJA MUDAH</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Bagaimana Portal Warga Bekerja?</h2>
            <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">
              Layanan digital didesain sesederhana mungkin agar mudah digunakan oleh seluruh kelompok usia warga, termasuk lansia.
            </p>
          </div>

          {/* Workflow Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-16 text-left">
            {workflow.map((flow, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100/80 flex flex-col justify-between"
              >
                {/* Background watermarked step number */}
                <div className="absolute top-4 right-6 text-5xl font-black text-slate-200/50 select-none tracking-tighter">{flow.step}</div>
                
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-extrabold text-sm flex items-center justify-center mb-6 shadow-md shadow-teal-500/10">
                    {flow.step}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">{flow.title}</h3>
                  <p className="text-slate-500 text-[11px] font-bold leading-relaxed">{flow.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prompt banner under workflow */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 md:p-12 rounded-3xl text-white text-left relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
            <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <span className="text-[9px] font-extrabold text-teal-400 uppercase tracking-widest">AKSES SEKARANG</span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Ingin mendaftarkan keluarga Anda di Portal Digital RT 01?</h3>
                <p className="text-slate-300 mt-2 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                  Hubungkan profil keluarga Anda untuk kemudahan akses layanan administrasi surat-menyurat RT, verifikasi iuran, dan pantau kas transparan.
                </p>
              </div>
              <div className="md:col-span-4 flex justify-start md:justify-end">
                <button 
                  onClick={() => onEnterPortal('register')}
                  className="px-6 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Daftar Warga Baru Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 INTERACTIVE APP USAGE GUIDE */}
      <section id="panduan" className="py-20 bg-[#f8fafc] border-b border-slate-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-teal-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-emerald-100/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center mb-14">
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full uppercase">PANDUAN INTERAKTIF</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-4">
              Cara Penggunaan Aplikasi Guyub Rukun
            </h2>
            <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">
              Pilih tipe peran Anda di bawah ini untuk melihat panduan langkah demi langkah cara mengoperasikan portal warga dengan mudah.
            </p>

            {/* Guide Tab Switcher */}
            <div className="mt-8 flex bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 max-w-md w-full">
              <button 
                onClick={() => setGuideTab('warga')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${guideTab === 'warga' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >
                <Users className="w-4 h-4" />
                <span>Sebagai Warga</span>
              </button>
              <button 
                onClick={() => setGuideTab('pengurus')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 ${guideTab === 'pengurus' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sebagai Pengurus RT</span>
              </button>
            </div>
          </div>

          {/* Guide Steps Layout */}
          <AnimatePresence mode="wait">
            {guideTab === 'warga' ? (
              <motion.div 
                key="warga-guide"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-blue-100">
                    Langkah 1
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Masuk Portal & Pilih RT</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Mulailah dengan mengakses aplikasi dan memilih wilayah kependudukan RT Anda.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-blue-500">✓</span> Klik tombol "Masuk Portal Warga"</li>
                    <li className="flex items-start gap-1.5"><span className="text-blue-500">✓</span> Pilih RT tempat Anda tinggal (misal: RT 01)</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-emerald-100">
                    Langkah 2
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Registrasi Akun Mandiri</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Buat akun digital Anda agar terdaftar resmi dalam sistem database pengurus.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500">✓</span> Isi NIK, No. KK, No. HP, & status hunian</li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500">✓</span> Buat password & unggah foto profil Anda</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-amber-100">
                    Langkah 3
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Verifikasi Pengurus RT</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Pengurus akan meninjau data Anda guna menghindari pendaftaran fiktif.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-amber-500">✓</span> Admin menerima notifikasi pendaftaran</li>
                    <li className="flex items-start gap-1.5"><span className="text-amber-500">✓</span> Akun aktif & siap digunakan (Instan saat uji coba)</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-teal-100">
                    Langkah 4
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Akses Layanan Mandiri</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Nikmati seluruh kepraktisan pelayanan warga digital dalam satu genggaman.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-teal-500">✓</span> Buat Surat Pengantar & Lapor RT cepat</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-500">✓</span> Bayar Iuran, cek Kas, & Tanya Smart AI 24 Jam</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="pengurus-guide"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#6d28d9]"></div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-purple-100">
                    Langkah 1
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Login Konsol Pengurus</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Masuk menggunakan akun khusus tingkat Pengurus / Administrator RT.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-purple-600">✓</span> Gunakan email & password admin Anda</li>
                    <li className="flex items-start gap-1.5"><span className="text-purple-600">✓</span> Akses dashboard utama yang kaya data kontrol</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#ea580c]"></div>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-orange-100">
                    Langkah 2
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Verifikasi Pendaftar Baru</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Validasi keaslian data warga baru demi memelihara kerukunan & keamanan.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-orange-600">✓</span> Cek NIK, KK, & Alamat di tab verifikasi</li>
                    <li className="flex items-start gap-1.5"><span className="text-orange-600">✓</span> Terima warga dengan satu klik aman</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#059669]"></div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-emerald-100">
                    Langkah 3
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Atur Kas & Keuangan</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Kelola transparansi keuangan warga secara digital dan terbuka.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-emerald-600">✓</span> Input iuran bulanan masuk & pengeluaran kas</li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-600">✓</span> Anggaran ter-update otomatis di gadget warga</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 font-extrabold text-xs flex items-center justify-center mb-5 border border-teal-100">
                    Langkah 4
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2.5">Proses Surat & Aduan</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
                    Layani permohonan warga tanpa tumpukan kertas fisik.
                  </p>
                  <ul className="text-[10px] font-bold text-slate-600 space-y-2 border-t border-slate-50 pt-3">
                    <li className="flex items-start gap-1.5"><span className="text-teal-600">✓</span> Setujui & terbitkan Surat Pengantar digital</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-600">✓</span> Tindak lanjuti aduan warga secara interaktif</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt Buttons inside usage section */}
          <div className="mt-14 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => onEnterPortal('login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-teal-500/20 hover:scale-101 active:scale-95 transition-all cursor-pointer"
            >
              Coba Masuk Portal Sekarang
            </button>
            <button 
              onClick={() => scrollToId('hubungi')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-600 hover:text-teal-600 font-black text-xs rounded-xl hover:bg-slate-50 hover:border-teal-300 transition-all cursor-pointer"
            >
              Tanya Pengurus RT
            </button>
          </div>
        </div>
      </section>

      {/* 6. EVENT HIGHLIGHTS SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center mb-16">
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full uppercase">AGENDA & KEGIATAN RT</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Aktifitas & Kegiatan Mendatang</h2>
            <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">
              Jadwal agenda musyawarah, gotong royong, posyandu, dan ronda malam warga di lingkungan RT 01.
            </p>
          </div>

          {/* Event Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {events.map((evt, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:border-teal-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[9px] font-extrabold rounded-md uppercase tracking-wider border border-teal-100/50">
                      {evt.tag}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" /> Mendatang
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-800 leading-snug hover:text-teal-600 transition-colors">
                    {evt.title}
                  </h3>
                  
                  <p className="text-slate-500 text-[11px] font-medium mt-3.5 leading-relaxed">
                    {evt.desc}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 space-y-2 text-[11px] font-extrabold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium text-slate-500">{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium text-slate-500 truncate">{evt.loc}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE FAQS SECTION */}
      <section id="faq" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[10px] font-extrabold tracking-widest text-teal-600 bg-teal-50 border border-teal-100 px-3.5 py-1.5 rounded-full uppercase">TANYA JAWAB</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed max-w-xl">
              Butuh penjelasan cepat mengenai penggunaan portal? Cari jawaban Anda di bawah ini atau tanyakan asisten AI kami.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl transition-all overflow-hidden ${isOpen ? 'border-teal-500/30 bg-teal-50/10 shadow-[0_4px_20px_rgba(0,0,0,0.015)]' : 'border-slate-100 bg-slate-50'}`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left font-extrabold text-sm text-slate-800 gap-4 cursor-pointer focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-teal-600 transition-transform shrink-0 ${isOpen ? 'rotate-180' : 'none'}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-100/50 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CONTACT FORM SECTION */}
      <section id="hubungi" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden grid md:grid-cols-12">
            {/* Left Info Panel */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
              
              <div className="space-y-8">
                <div>
                  <span className="text-[9px] font-extrabold text-teal-400 uppercase tracking-widest">HUBUNGI PENGURUS</span>
                  <h3 className="text-2xl font-black tracking-tight mt-1">Saluran Layanan Mandiri Warga RT 01</h3>
                  <p className="text-slate-300 mt-2.5 text-[11px] font-bold leading-relaxed">
                    Butuh koordinasi langsung, verifikasi data kependudukan manual, atau ada masukan pembangunan lingkungan?
                  </p>
                </div>

                <div className="space-y-4 text-[11px] font-extrabold text-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-teal-400" /></div>
                    <span>Sekretariat RT 01, RW 21, Wisma Garden, Kutajaya, Pasarkemis, Tangerang</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-teal-400" /></div>
                    <span>+62 812-1400-7871 (Ketua RT)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0"><MessageSquare className="w-4 h-4 text-teal-400" /></div>
                    <span>muhammad.adjiprasetyo28@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-[10px] font-extrabold text-slate-400">
                Layanan Digital dikelola secara mandiri oleh tim pengurus RT 01 Tangerang.
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="md:col-span-7 p-8 md:p-12">
              <h4 className="text-lg font-black text-slate-800 tracking-tight mb-6">Kirim Pesan Cepat</h4>
              
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({...contactForm, name: e.target.value})}
                      placeholder="Nama Anda"
                      className="w-full mt-1.5 p-3.5 text-xs font-semibold bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      placeholder="nama@email.com"
                      className="w-full mt-1.5 p-3.5 text-xs font-semibold bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjek</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.subject}
                    onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="Contoh: Pengajuan Pendaftaran Warga Baru"
                    className="w-full mt-1.5 p-3.5 text-xs font-semibold bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Isi Pesan</label>
                  <textarea 
                    rows={4} 
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Tuliskan pesan detail Anda di sini..."
                    className="w-full mt-1.5 p-3.5 text-xs font-semibold bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 rounded-xl outline-none transition-all resize-none"
                  />
                </div>

                {contactSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2"
                  >
                    <span>✅ Pesan Anda berhasil dikirim! Kami akan menghubungi Anda segera.</span>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={contactLoading}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {contactLoading ? 'Mengirim...' : (
                    <>
                      <span>Kirim Pesan Pengurus</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DEEP FOOTER */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-10 border-b border-slate-800 pb-12">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="bg-teal-500 p-2 rounded-xl shrink-0">
                <LogoCommunityIcon size="18" colorAccent="#0F766E" colorPrimary="#0F766E" />
              </div>
              <span className="text-lg font-black tracking-tight">
                GUYUB <span className="text-teal-400">RUKUN</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              Sistem Portal Balai Warga Digital RT 01 / RW 21, Tangerang, Banten. Membawa kemudahan administrasi kependudukan, keterbukaan laporan kas, siskamling, dan perekonomian warga lokal.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-400">PINTASAN NAVIGASI</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-bold">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">Beranda Utama</button>
              <button onClick={() => scrollToId('data-warga')} className="hover:text-white transition-colors text-left cursor-pointer">Data Warga RT 01 (Usia)</button>
              <button onClick={() => scrollToId('struktur-organisasi')} className="hover:text-white transition-colors text-left cursor-pointer">Struktur Organisasi RT 01</button>
              <button onClick={() => scrollToId('fitur')} className="hover:text-white transition-colors text-left cursor-pointer">Fitur Pelayanan</button>
              <button onClick={() => scrollToId('alur')} className="hover:text-white transition-colors text-left cursor-pointer">Alur Pendaftaran</button>
            </div>
          </div>

          {/* Links Col 2 */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Dukungan & Hubungan</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-bold">
              <button onClick={() => scrollToId('faq')} className="hover:text-white transition-colors text-left cursor-pointer">Pertanyaan Umum (FAQ)</button>
              <button onClick={() => scrollToId('hubungi')} className="hover:text-white transition-colors text-left cursor-pointer">Layanan Pengaduan Pengurus</button>
              <span className="text-slate-550 pt-2 text-[10px]">Hari Kerja: Senin - Minggu • 24 Jam Digital</span>
            </div>
          </div>
        </div>

        {/* Copy / Lower bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] font-bold text-slate-500 gap-4">
          <div>
            © 2026 Portal Warga Guyub Rukun RT 01. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Syarat & Ketentuan</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
