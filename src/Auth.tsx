import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect } from 'react';
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
        setError(data.error || `Error ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(`Gagal menghubungi server: ${err?.message || 'Unknown Error'}. Periksa koneksi internet atau status hosting.`);
    }
    setLoading(false);
  };

  return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <CuteMascot isFocusedPassword={isFocusedPassword} />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-600 mb-2">Login</h1>
          <p className="text-sm text-gray-500">Masuk ke aplikasi Guyub Rukun</p>
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
  const [blok, setBlok] = useState('');
  const [nomorRumah, setNomorRumah] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

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
    setLoading(true);
    try {
      const alamat = `Blok ${blok} No. ${nomorRumah}`;
      const res = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, alamat})
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-600 mb-2">Daftar Akun</h1>
          <p className="text-sm text-gray-500">Bergabung dengan Guyub Rukun</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan username Anda"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan nama Anda"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} onFocus={() => setIsFocusedPassword(true)} onBlur={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Masukkan password"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Blok Rumah</label>
            <select value={blok} onChange={e => setBlok(e.target.value)} onFocus={() => setIsFocusedPassword(false)} required className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500">
              <option value="">Pilih Blok</option>
              <option value="A">Blok A</option>
              <option value="B">Blok B</option>
              <option value="C">Blok C</option>
              <option value="D">Blok D</option>
              <option value="E">Blok E</option>
              <option value="F">Blok F</option>
              <option value="G">Blok G</option>
              <option value="H">Blok H</option>
              <option value="I">Blok I</option>
              <option value="J">Blok J</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Rumah</label>
            <input type="text" value={nomorRumah} onChange={e => setNomorRumah(e.target.value)} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: 12" />
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
          <button type="submit" disabled={loading} className="w-full h-12 flex items-center justify-center bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors mt-2">
            {loading ? (
              <div className="flex items-center justify-center space-x-1">
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
              </div>
            ) : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">Sudah punya akun? <button type="button" onClick={onNavLogin} className="text-teal-600 font-bold hover:underline">Masuk</button></p>
      </div>
  );
}
