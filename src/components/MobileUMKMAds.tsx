import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { Store, ArrowRight, MessageCircle } from 'lucide-react';

export function MobileUMKMAds() {
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/data/umkm')
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          setUmkmList(json.data);
        }
      })
      .catch(err => console.error('Error fetching UMKM ads:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (umkmList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % umkmList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [umkmList]);

  if (loading || umkmList.length === 0) return null;

  const currentAd = umkmList[currentIndex];
  const gradientPresets = [
    'from-teal-600 via-emerald-600 to-cyan-700',
    'from-indigo-600 via-blue-600 to-teal-700',
    'from-purple-600 via-pink-600 to-rose-700',
    'from-amber-600 via-orange-600 to-rose-700',
  ];
  const bgGradient = gradientPresets[currentIndex % gradientPresets.length];

  return (
    <section className="px-5 mb-5 select-none relative">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-teal-600" />
          Iklan Usaha Warga
        </h4>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
          Sponsor Lokal
        </span>
      </div>

      <div className={`w-full text-white p-5 rounded-[2rem] shadow-lg bg-gradient-to-br ${bgGradient} relative overflow-hidden transition-all duration-500`}>
        {/* Ambient geometric layers */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 flex flex-col min-h-[110px] justify-between"
          >
            <div>
              <span className="bg-white/20 border border-white/25 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md inline-block mb-2">
                {currentAd.category || 'Usaha Mandiri'}
              </span>
              <h3 className="text-base font-black tracking-tight leading-tight mb-1 truncate drop-shadow-sm">
                {currentAd.nama}
              </h3>
              <p className="text-[11px] text-white/95 font-medium line-clamp-2 leading-normal drop-shadow-sm pr-4">
                {currentAd.desc}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
              {currentAd.kontak ? (
                <a
                  href={`https://wa.me/${currentAd.kontak.replace(/[^0-9]/g, '')}?text=Halo%20saya%20warga%20RT%20tertarik%20dengan%20usaha%20${encodeURIComponent(currentAd.nama)}%20di%20aplikasi%20Guyub%20Rukun.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-teal-800 hover:bg-teal-50 px-3.5 py-1.5 rounded-xl text-[11px] font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#128C7E] fill-[#128C7E]" />
                  Hubungi WA
                </a>
              ) : (
                <div className="text-[10px] text-white/70 italic">Hubungi via pengurus</div>
              )}

              {/* Slide indicators */}
              {umkmList.length > 1 && (
                <div className="flex gap-1">
                  {umkmList.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
