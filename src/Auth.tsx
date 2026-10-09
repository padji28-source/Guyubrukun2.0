import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'motion/react';
import { icons } from './App';

export const CuteMascot = ({ isFocusedPassword }: { isFocusedPassword?: boolean }) => {
  return (
    <div className="w-32 h-32 mx-auto relative mb-4">
      <motion.svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-md rounded-3xl overflow-hidden"
        animate={{
          y: isFocusedPassword ? 0 : [0, -3, 0],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg)" />
        
        {/* Left person */}
        <motion.g 
           animate={{ y: isFocusedPassword ? 2 : 0 }} 
           transition={{ duration: 0.3 }}
        >
          <circle cx="30" cy="35" r="8" fill="#A5F3FC" />
          <path d="M15 65 Q30 40 45 65 Z" fill="#A5F3FC" />
        </motion.g>

        {/* Right person */}
        <motion.g 
           animate={{ y: isFocusedPassword ? 2 : 0 }} 
           transition={{ duration: 0.3 }}
        >
          <circle cx="70" cy="35" r="8" fill="#FEF08A" />
          <path d="M55 65 Q70 40 85 65 Z" fill="#FEF08A" />
        </motion.g>

        {/* Center person */}
        <motion.g 
           animate={{ y: isFocusedPassword ? 5 : 0, scale: isFocusedPassword ? 0.95 : 1 }} 
           style={{ transformOrigin: '50px 65px' }}
           transition={{ duration: 0.3 }}
        >
          <circle cx="50" cy="28" r="9" fill="#FFFFFF" />
          <path d="M30 65 C40 30 60 30 70 65 Z" fill="#FFFFFF" />
          
          {/* Eyes for center person to make it cute when typing password */}
          <motion.circle cx="47" cy="26" r="1.5" fill="#0F766E" animate={{ scaleY: isFocusedPassword ? 0 : 1 }} />
          <motion.circle cx="53" cy="26" r="1.5" fill="#0F766E" animate={{ scaleY: isFocusedPassword ? 0 : 1 }} />
          <motion.path 
             d={isFocusedPassword ? "M45 28 Q50 26 55 28" : "M48 30 Q50 32 52 30"} 
             stroke="#0F766E" strokeWidth="1" fill="none" strokeLinecap="round" 
          />
        </motion.g>

        {/* Ground line */}
        <path d="M15 65 L85 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

        {/* Text */}
        <text x="50" y="85" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">GUYUB RUKUN</text>
        
      </motion.svg>
      {/* Sparkles */}
      {!isFocusedPassword && (
        <motion.div
           className="absolute -top-2 -right-2 text-yellow-400"
           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5], rotate: [0, 45, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
    </div>
  )
}

export function Login({ onLogin, onNavRegister }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const currentRt = localStorage.getItem('selected_rt') || 'rt01';
  const displayRt = currentRt.toUpperCase().replace('RT', 'RT ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan.');
    }
    setLoading(false);
  };

  return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <CuteMascot isFocusedPassword={isFocusedPassword} />
        <div className="text-center mb-8">
          <div className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
            Lingkungan {displayRt}
          </div>
          <h1 className="text-2xl font-bold text-teal-600 mb-2">Login</h1>
          <p className="text-sm text-gray-500">Masuk ke aplikasi Guyub Rukun ({displayRt})</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan username Anda"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setIsFocusedPassword(true)} onBlur={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan password"/>
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 flex items-center justify-center bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
            {loading ? (
              <div className="flex items-center justify-center space-x-1">
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
              </div>
            ) : 'Masuk'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">Belum punya akun? <button type="button" onClick={onNavRegister} className="text-teal-600 font-bold hover:underline">Daftar</button></p>
      </div>
  );
}

export function Register({ onRegister, onNavLogin }: any) {
  const [formData, setFormData] = useState({ username: '', nama: '', password: '', noHp: '', status: '', umur: '', tglLahir: '' });
  const [selectedRt, setSelectedRt] = useState<string>(() => localStorage.getItem('selected_rt') || 'rt01');
  const [blok, setBlok] = useState('');
  const [nomorRumah, setNomorRumah] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [registeredHouses, setRegisteredHouses] = useState<{ blok: string; no: string; display: string; nama?: string; username?: string }[]>([]);

  const isRt01 = selectedRt.toLowerCase() === 'rt01';
  const isRt02 = selectedRt.toLowerCase() === 'rt02';
  const isRt03 = selectedRt.toLowerCase() === 'rt03';
  const displayRt = selectedRt.toUpperCase().replace('RT', 'RT ');
  const availableBlocks = isRt01 ? ['A', 'C', 'D', 'E', 'F'] : (isRt02 ? ['B'] : ['G', 'H', 'I']);

  const handleRtChange = (rt: string) => {
    setSelectedRt(rt);
    localStorage.setItem('selected_rt', rt);
    setBlok('');
    setNomorRumah('');
    setError('');
  };

  useEffect(() => {
    fetch(`/api/public/registered-houses?rtId=${selectedRt}`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.registeredHouses)) {
          setRegisteredHouses(data.registeredHouses);
        }
      })
      .catch(() => {});
  }, [selectedRt]);

  // Real-time check: apakah blok dan nomor rumah ini sudah terdaftar
  const houseCheck = useMemo(() => {
    if (!blok || !nomorRumah) return null;
    const b = blok.trim().toUpperCase();
    const rawNo = nomorRumah.trim().toUpperCase();
    const isPureNum = /^\d+$/.test(rawNo);
    const normNo = isPureNum ? String(parseInt(rawNo, 10)) : rawNo;

    const dup = registeredHouses.find(h => h.blok === b && h.no === normNo);
    if (dup) {
      return {
        isTaken: true,
        display: dup.display || `Blok ${b} No. ${rawNo}`,
        registeredTo: dup.nama || dup.username || 'Warga lain'
      };
    }
    return {
      isTaken: false,
      display: `Blok ${b} No. ${rawNo}`
    };
  }, [blok, nomorRumah, registeredHouses]);

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
  };

  const handleTglLahirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tgl = e.target.value;
    setFormData({...formData, tglLahir: tgl, umur: calculateAge(tgl)});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (houseCheck?.isTaken) {
      setError(`Alamat ${houseCheck.display} sudah terdaftar atas nama "${houseCheck.registeredTo}". Blok dan nomor rumah yang sudah terdaftar tidak dapat didaftarkan kembali. Setiap rumah hanya dapat didaftarkan satu akun kepala keluarga.`);
      return;
    }

    setLoading(true);
    try {
      const alamat = `Blok ${blok} No. ${nomorRumah}`;
      const res = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-rt-id': selectedRt
        },
        body: JSON.stringify({
          ...formData,
          alamat,
          blok,
          nomorRumah,
          rtId: selectedRt
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('Registrasi berhasil! Silahkan masuk terlebih dahulu.');
        onNavLogin();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan.');
    }
    setLoading(false);
  };

  return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <CuteMascot isFocusedPassword={isFocusedPassword} />
        <div className="text-center mb-6">
          <div className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
            Pendaftaran {displayRt}
          </div>
          <h1 className="text-2xl font-bold text-teal-600 mb-2">Daftar Akun</h1>
          <p className="text-xs text-gray-500 mb-3">
            {isRt01 ? 'Wilayah RT 01: Blok A, C, D, E, F' : isRt02 ? 'Wilayah RT 02: Blok B' : 'Wilayah RT 03: Blok G, H, I'}
          </p>

          {/* RT Selection Tab */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 max-w-xs mx-auto">
            {['rt01', 'rt02', 'rt03'].map(rt => {
              const label = rt.toUpperCase().replace('RT', 'RT ');
              const isActive = selectedRt.toLowerCase() === rt;
              return (
                <button
                  key={rt}
                  type="button"
                  onClick={() => handleRtChange(rt)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input type="text" value={formData.username} onChange={e => { setError(''); setFormData({...formData, username: e.target.value}); }} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan username Anda"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" value={formData.nama} onChange={e => { setError(''); setFormData({...formData, nama: e.target.value}); }} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan nama Anda"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={formData.password} onChange={e => { setError(''); setFormData({...formData, password: e.target.value}); }} onFocus={() => setIsFocusedPassword(true)} onBlur={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan password"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Blok Rumah ({displayRt})
            </label>
            <select value={blok} onChange={e => { setError(''); setBlok(e.target.value); }} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500">
              <option value="">Pilih Blok</option>
              {availableBlocks.map(b => (
                <option key={b} value={b}>Blok {b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Rumah</label>
            <input 
              type="text" 
              value={nomorRumah} 
              onChange={e => { setError(''); setNomorRumah(e.target.value); }} 
              required 
              className={`w-full p-3 border rounded-xl text-sm outline-none transition-colors ${
                houseCheck?.isTaken 
                  ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500' 
                  : (houseCheck && !houseCheck.isTaken ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 focus:border-teal-500')
              }`} 
              placeholder="Cth: 12" 
            />
            {houseCheck && houseCheck.isTaken && (
              <div className="mt-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold leading-relaxed">
                <span className="text-base leading-none">⛔</span>
                <div>
                  <p className="font-extrabold">{houseCheck.display} sudah terdaftar{houseCheck.registeredTo ? ` atas nama "${houseCheck.registeredTo}"` : ''}.</p>
                  <p className="text-[11px] font-medium text-rose-600 mt-0.5">Blok dan nomor rumah yang sudah terdaftar tidak dapat didaftarkan kembali. Setiap rumah hanya dapat didaftarkan satu akun kepala keluarga.</p>
                </div>
              </div>
            )}
            {houseCheck && !houseCheck.isTaken && (
              <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                <span>✅</span>
                <span>{houseCheck.display} tersedia untuk pendaftaran baru di {displayRt}.</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">No. HP</label>
            <input type="tel" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="0812..."/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status Warga</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500">
              <option value="">Pilih Status</option>
              <option value="Warga Tetap">Warga Tetap</option>
              <option value="Warga Sementara (Kontrak)">Warga Sementara (Kontrak)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
            <input type="date" value={formData.tglLahir} onChange={handleTglLahirChange} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Umur</label>
            <input type="number" value={formData.umur} readOnly className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none cursor-not-allowed" placeholder="Otomatis terisi" min="0"/>
          </div>
          <button 
            type="submit" 
            disabled={loading || Boolean(houseCheck?.isTaken)} 
            className="w-full h-12 flex items-center justify-center bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-1">
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
              </div>
            ) : (houseCheck?.isTaken ? 'Alamat Sudah Terdaftar' : 'Daftar Sekarang')}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">Sudah punya akun? <button type="button" onClick={onNavLogin} className="text-teal-600 font-bold hover:underline">Masuk</button></p>
      </div>
  );
}
