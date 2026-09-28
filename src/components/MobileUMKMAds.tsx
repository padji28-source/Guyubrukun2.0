import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../apiInterceptor';
import { Store, MessageCircle, MapPin, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

const formatRupiah = (num: number | string | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
};

const fallbackBanners = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
];

export function MobileUMKMAds({ onActionClick }: { onActionClick?: (tab: string) => void }) {
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchVerifiedUmkm = () => {
    apiFetch('/api/data/umkm')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data)) {
          // Tampilkan UMKM yang sudah diverifikasi Ketua RT / Pengurus / Bendahara
          const verified = json.data.filter(
            (item: any) => !item.status || item.status === 'disetujui'
          );
          setUmkmList(verified);
        }
      })
      .catch((err) => console.error('Error fetching UMKM ads:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifiedUmkm();
    const handleUpdate = () => fetchVerifiedUmkm();
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, []);

  useEffect(() => {
    if (umkmList.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % umkmList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [umkmList.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (umkmList.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? umkmList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (umkmList.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % umkmList.length);
  };

  if (loading) {
    return (
      <section className="px-5 mb-8">
        <div className="h-52 w-full rounded-[2rem] bg-slate-200 animate-pulse" />
      </section>
    );
  }

  if (umkmList.length === 0) {
    return (
      <section className="px-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
            <Store className="w-4 h-4 text-teal-600" />
            Iklan UMKM Warga
          </h3>
          {onActionClick && (
            <button
              type="button"
              onClick={() => onActionClick('UMKM')}
              className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full cursor-pointer"
            >
              + Daftarkan Usaha
            </button>
          )}
        </div>
        <div
          onClick={() => onActionClick?.('UMKM')}
          className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[2rem] p-5 text-white shadow-md cursor-pointer flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-teal-200">Etalase UMKM RT</p>
            <h4 className="text-sm font-black mt-1">Promosikan Usaha Warga di Beranda</h4>
            <p className="text-[11px] text-white/85 mt-0.5">
              Klik untuk mendaftarkan banner usaha dan produk Anda.
            </p>
          </div>
          <Store className="w-10 h-10 text-white/40 shrink-0" />
        </div>
      </section>
    );
  }

  const safeIndex = currentIndex % umkmList.length;
  const currentAd = umkmList[safeIndex];
  const namaUsaha = currentAd.nama || currentAd.name || 'UMKM Warga';
  const bannerSrc = currentAd.bannerUrl || fallbackBanners[safeIndex % fallbackBanners.length];
  const rawWa = (currentAd.kontak || currentAd.phone || '').replace(/[^0-9]/g, '');
  const waNumber = rawWa.startsWith('0') ? '62' + rawWa.slice(1) : rawWa;
  const products = Array.isArray(currentAd.products) ? currentAd.products : [];

  return (
    <section className="px-5 mb-8 select-none">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-gray-800 text-sm">Iklan UMKM Warga</h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            · {safeIndex + 1}/{umkmList.length}
          </span>
        </div>
        {onActionClick && (
          <button
            type="button"
            onClick={() => onActionClick('UMKM')}
            className="text-[10px] font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
          >
            Lihat Semua UMKM
          </button>
        )}
      </div>

      {/* Image Slide Container */}
      <div
        onClick={() => onActionClick?.('UMKM')}
        className="relative w-full h-56 sm:h-64 rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 bg-slate-900 cursor-pointer group"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentAd.id || safeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 1.02 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % umkmList.length);
              } else if (info.offset.x > 40) {
                setDirection(-1);
                setCurrentIndex((prev) => (prev === 0 ? umkmList.length - 1 : prev - 1));
              }
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Full Banner Image */}
            <img
              src={bannerSrc}
              alt={namaUsaha}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-900/15" />

            {/* Top Progress / Story Bars */}
            {umkmList.length > 1 && (
              <div className="absolute top-3.5 left-4 right-4 flex gap-1.5 z-20">
                {umkmList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDirection(idx > safeIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer"
                    aria-label={`Slide ${idx + 1}`}
                  >
                    {idx === safeIndex && (
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="h-full bg-teal-400 rounded-full"
                      />
                    )}
                    {idx < safeIndex && <div className="h-full w-full bg-white/90 rounded-full" />}
                  </button>
                ))}
              </div>
            )}

            {/* Top Kicker Info */}
            <div className="absolute top-7 left-4 right-4 flex items-center justify-between text-[11px] text-white/90 font-semibold z-10">
              <span className="truncate">
                {currentAd.category || 'UMKM Warga'} · {currentAd.owner || 'Warga RT'}
              </span>
              {currentAd.sosmed && (
                <span className="text-teal-300 font-bold truncate max-w-[140px]">
                  {currentAd.sosmed}
                </span>
              )}
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col justify-end z-10 text-white">
              <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug truncate drop-shadow-sm">
                {namaUsaha}
              </h4>

              {currentAd.alamat && (
                <p className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{currentAd.alamat}</span>
                </p>
              )}

              {/* Daftar Produk & Harga di Slide */}
              {products.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-2.5 pb-0.5">
                  {products.slice(0, 3).map((p: any, idx: number) => (
                    <div
                      key={p.id || idx}
                      className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 shrink-0 text-[10px]"
                    >
                      <span className="text-white/90 font-medium">{p.namaProduk}</span>
                      <span className="mx-1 text-white/40">·</span>
                      <span className="text-teal-300 font-extrabold">{formatRupiah(p.harga)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                currentAd.desc && (
                  <p className="text-[11px] text-slate-200 line-clamp-1 mt-1.5">{currentAd.desc}</p>
                )
              )}

              {/* Bottom Action Row */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/15">
                <span className="text-[10px] text-teal-200 font-semibold truncate">
                  Ketuk banner untuk detail menu & katalog
                </span>

                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      `Halo, saya warga RT tertarik memesan produk dari *${namaUsaha}* di aplikasi Guyub Rukun.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Pesan WA</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left / Right Slide Arrow Buttons */}
        {umkmList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide UMKM Sebelumnya"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide UMKM Berikutnya"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
