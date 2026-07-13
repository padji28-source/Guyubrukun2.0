import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from './apiInterceptor';
import { Html5Qrcode } from 'html5-qrcode';

export const MobileScanQR = ({ onBack, currentUser }: { onBack: () => void; currentUser: any }) => {
  const [wargaList, setWargaList] = useState<any[]>([]);
  const [loadingWarga, setLoadingWarga] = useState(true);
  const [scannedWarga, setScannedWarga] = useState<any | null>(null);
  const [duesHistory, setDuesHistory] = useState<any[]>([]);
  const [loadingDues, setLoadingDues] = useState(false);
  
  // Camera scanning state
  const [scanMode, setScanMode] = useState<'camera' | 'simulasi'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedSimWarga, setSelectedSimWarga] = useState<string>('');

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "real-qr-scanner-view";

  // Fetch all warga to match scans or for simulation dropdown
  useEffect(() => {
    const fetchAllWarga = async () => {
      try {
        const res = await apiFetch('/api/warga?limit=100');
        const data = await res.json();
        setWargaList(data.users || []);
      } catch (e) {
        console.error('Gagal mengambil data warga:', e);
      } finally {
        setLoadingWarga(false);
      }
    };
    fetchAllWarga();
  }, []);

  // Fetch dues history when a warga is scanned
  const fetchWargaDues = async (userId: string) => {
    setLoadingDues(true);
    try {
      const res = await apiFetch(`/api/data/iuran?userId=${userId}`);
      const data = await res.json();
      setDuesHistory(data.data || []);
    } catch (e) {
      console.error('Gagal mengambil histori iuran:', e);
    } finally {
      setLoadingDues(false);
    }
  };

  // Start HTML5 Real Camera Scanner
  const startCameraScanner = async () => {
    setCameraError(null);
    setIsScanning(true);
    
    // Tiny delay to ensure DOM element is mounted
    setTimeout(async () => {
      try {
        if (qrScannerRef.current) {
          await stopCameraScanner();
        }

        const scanner = new Html5Qrcode(scannerId);
        qrScannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            // Success QR Scanned!
            handleSuccessfulScan(decodedText);
          },
          (errorMessage) => {
            // Quietly ignore normal scanning frame errors
          }
        );
        
        setCameraPermissionGranted(true);
      } catch (err: any) {
        console.error("Gagal memulai kamera:", err);
        setCameraPermissionGranted(false);
        setIsScanning(false);
        setCameraError(
          err?.message || "Gagal mengakses kamera. Mohon berikan izin kamera pada browser Anda."
        );
      }
    }, 100);
  };

  // Stop HTML5 Real Camera Scanner
  const stopCameraScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        qrScannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  // Process decoded QR Text (supports raw IDs, JSON, and profile share URLs)
  const handleSuccessfulScan = async (decodedText: string) => {
    stopCameraScanner();
    
    let matchedId = '';
    
    try {
      // 1. Try to parse as JSON first (standard format produced by the application)
      const parsed = JSON.parse(decodedText);
      if (parsed && parsed.id) {
        matchedId = parsed.id;
      }
    } catch (e) {
      // 2. If not JSON, check if it contains a URL or a raw ID string
      if (decodedText.startsWith('http')) {
        // Try to search for query parameter data
        const urlObj = new URL(decodedText);
        const dataParam = urlObj.searchParams.get('data');
        if (dataParam) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(dataParam));
            if (parsedData && parsedData.id) {
              matchedId = parsedData.id;
            }
          } catch (err) {
            // fallback if parameter isn't JSON
          }
        }
      } else {
        // Treat raw decoded text as the ID itself
        matchedId = decodedText.trim();
      }
    }

    if (!matchedId) {
      // Fallback matching if we have custom text containing a user name
      const lowercaseText = decodedText.toLowerCase();
      const matchedWargaByText = wargaList.find(w => 
        lowercaseText.includes(w.nama?.toLowerCase()) || 
        lowercaseText.includes(w.id?.toLowerCase())
      );
      if (matchedWargaByText) {
        matchedId = matchedWargaByText.id;
      }
    }

    // Load data of the matched user
    if (matchedId) {
      // First search in the preloaded list
      const warga = wargaList.find((w) => w.id === matchedId);
      if (warga) {
        setScannedWarga(warga);
        fetchWargaDues(warga.id);
        return;
      } else {
        // Not found in the preloaded list, fetch directly from backend API
        setLoadingDues(true);
        try {
          const res = await apiFetch(`/api/warga/${matchedId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.user) {
              setScannedWarga(json.user);
              fetchWargaDues(json.user.id);
              return;
            }
          }
        } catch (err) {
          console.error("Gagal mengambil data warga dari server:", err);
        } finally {
          setLoadingDues(false);
        }
      }
    }

    // If no exact match found in currently loaded list, try checking if it matches any user as a fallback
    alert("QR Code terbaca: " + decodedText + "\nNamun, data Warga tidak terdaftar di database RT 01.");
    startCameraScanner(); // restart scanner
  };

  // Handle simulation scan trigger
  const handleSimulateScan = (wargaId: string) => {
    const warga = wargaList.find((w) => w.id === wargaId);
    if (!warga) return;

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScannedWarga(warga);
          fetchWargaDues(warga.id);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  // Automatically start camera scanning if mode is 'camera'
  useEffect(() => {
    if (scanMode === 'camera' && !scannedWarga) {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      // Ensure we clean up camera resources when unmounting
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(err => console.error("Unmount cleanup error:", err));
      }
    };
  }, [scanMode, scannedWarga]);

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 pb-12">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-3 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <button 
          onClick={() => {
            stopCameraScanner();
            onBack();
          }}
          className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            📸 Pindai QR Warga
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">KONSOL PENGURUS RT 01</p>
        </div>
      </div>

      <div className="p-4 flex-grow space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pb-10">
        
        {/* Toggle Mode Scanner */}
        {!scannedWarga && (
          <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 py-2 text-center font-extrabold text-[10px] rounded-lg transition-all ${scanMode === 'camera' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📷 Kamera Perangkat
            </button>
            <button
              onClick={() => setScanMode('simulasi')}
              className={`flex-1 py-2 text-center font-extrabold text-[10px] rounded-lg transition-all ${scanMode === 'simulasi' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ⚡ Simulasi Pengujian
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!scannedWarga ? (
            <motion.div
              key="scanner-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {scanMode === 'camera' ? (
                /* CAMERA MODE */
                <div className="space-y-4">
                  {/* Viewfinder Frame */}
                  <div className="relative aspect-square w-full max-w-[340px] mx-auto bg-slate-950 rounded-[2rem] border-4 border-slate-900 shadow-xl overflow-hidden flex flex-col justify-center items-center">
                    
                    {/* HTML5 Qrcode Camera Anchor Element */}
                    <div 
                      id={scannerId} 
                      className="absolute inset-0 w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                    ></div>

                    {/* Laser overlay animation on top */}
                    {isScanning && (
                      <motion.div 
                        animate={{ y: [-110, 110] }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "easeInOut" }}
                        className="absolute left-10 right-10 h-[2.5px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_rgba(45,212,191,0.9)] z-10 pointer-events-none"
                      />
                    )}

                    {/* Reticle Target Guide brackets */}
                    <div className="absolute inset-12 border border-white/20 rounded-2xl flex flex-col justify-between pointer-events-none p-2 z-10">
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-t-3 border-l-3 border-teal-400 rounded-tl-lg"></div>
                        <div className="w-6 h-6 border-t-3 border-r-3 border-teal-400 rounded-tr-lg"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-b-3 border-l-3 border-teal-400 rounded-bl-lg"></div>
                        <div className="w-6 h-6 border-b-3 border-r-3 border-teal-400 rounded-br-lg"></div>
                      </div>
                    </div>

                    {/* Permission / Status messages */}
                    {!isScanning && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                        {cameraError ? (
                          <div className="space-y-3 px-4">
                            <span className="text-3xl block">⚠️</span>
                            <p className="text-[11px] font-black text-rose-400 leading-tight">Gagal Mengakses Kamera</p>
                            <p className="text-[9px] text-slate-300 leading-relaxed max-w-[220px]">
                              {cameraError}
                            </p>
                            <button
                              onClick={startCameraScanner}
                              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[9px] rounded-lg transition-all"
                            >
                              Coba Hubungkan Ulang
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 border-2 border-dashed border-teal-500/50 rounded-full animate-spin flex items-center justify-center mb-1">
                              <span className="w-2.5 h-2.5 bg-teal-400 rounded-full"></span>
                            </div>
                            <p className="text-[10px] font-black text-slate-300">Menghubungkan Kamera...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Camera indicator */}
                    {isScanning && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 text-red-500 text-[8px] font-black tracking-widest uppercase z-10 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        <span>KAMERA AKTIF</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-400 font-bold text-center leading-normal max-w-xs mx-auto">
                    Arahkan kamera ke QR Code di Kartu Warga Digital di HP warga untuk memindai otomatis.
                  </p>
                </div>
              ) : (
                /* SIMULATOR MODE */
                <div className="space-y-4">
                  <div className="relative aspect-square w-full max-w-[340px] mx-auto bg-slate-900 rounded-[2rem] border-4 border-slate-950 shadow-xl overflow-hidden flex flex-col justify-center items-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10"></div>
                    
                    <div className="absolute inset-10 border border-teal-500/30 rounded-2xl flex flex-col justify-between pointer-events-none p-2">
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl-lg"></div>
                        <div className="w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr-lg"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
                        <div className="w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br-lg"></div>
                      </div>
                    </div>

                    <motion.div 
                      animate={{ y: [-80, 80] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.2, ease: "easeInOut" }}
                      className="absolute left-12 right-12 h-[2.5px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_8px_rgba(45,212,191,0.8)] z-10 pointer-events-none"
                    />

                    {isScanning ? (
                      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                        <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin flex items-center justify-center mb-4 shadow-lg shadow-teal-500/15">
                          <span className="text-teal-400 text-xs font-black">{scanProgress}%</span>
                        </div>
                        <p className="text-xs font-black text-white tracking-wide">MEMINDAI QR CODE</p>
                        <p className="text-[10px] text-slate-400 mt-1">Menyelaraskan data kependudukan...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-8 z-10">
                        <div className="w-14 h-14 bg-teal-950/50 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-3 shadow-inner">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <p className="text-xs font-bold text-white tracking-wide">Mode Simulasi Aktif</p>
                        <p className="text-[9px] text-slate-400 mt-1 max-w-[180px]">Pilih salah satu nama warga dari dropdown di bawah untuk menguji respon scanner.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
                    <span className="text-[8px] font-extrabold text-teal-600 bg-teal-50 border border-teal-100/40 px-2 py-0.5 rounded-full uppercase tracking-wider">PILIH WARGA</span>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-2">Daftar Warga untuk Simulasi</h3>
                    
                    {loadingWarga ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <select 
                          value={selectedSimWarga}
                          onChange={(e) => setSelectedSimWarga(e.target.value)}
                          className="w-full text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors"
                        >
                          <option value="">-- Pilih Nama Kepala Keluarga --</option>
                          {wargaList.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.nama} ({w.alamat || 'RT 01'})
                            </option>
                          ))}
                        </select>

                        <button 
                          onClick={() => handleSimulateScan(selectedSimWarga)}
                          disabled={!selectedSimWarga || isScanning}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>Mulai Pindai Simulasi</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {/* Scan Success Indicator */}
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-2.5 text-left">
                <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow-md shadow-emerald-500/20">
                  ✓
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-emerald-800 leading-none">PINDAN QR BERHASIL</h4>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1">Data Warga sinkron dengan server Pusat</p>
                </div>
              </div>

              {/* Head of Family Profile Detail */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden text-left border border-slate-700/40">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-500/5 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-extrabold tracking-widest text-teal-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase">KARTU KELUARGA TERVERIFIKASI</span>
                    <h3 className="text-[17px] font-black tracking-tight mt-2.5">{scannedWarga.nama}</h3>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-0.5 tracking-wider">ID: {scannedWarga.id?.substring(0, 12).toUpperCase()}</p>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold px-3 py-1 rounded-full">
                    Verified Active
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-white/5 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">ALAMAT RUMAH</span>
                    <span className="text-slate-100 font-black mt-1 block">{scannedWarga.alamat || 'RT 01, Blok -'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">STATUS HUNIAN</span>
                    <span className="text-teal-400 font-black mt-1 block">{scannedWarga.status || 'Warga Tetap'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">NOMOR TELEPON</span>
                    <span className="text-slate-100 font-black mt-1 block">{scannedWarga.noHp || '0812-xxxx-xxxx'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">UMUR KEPALA KELUARGA</span>
                    <span className="text-slate-100 font-black mt-1 block">{scannedWarga.umur ? `${scannedWarga.umur} Tahun` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Penghuni Rumah / Household Members */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">👨‍👩‍👧‍👦 Penghuni Rumah</h3>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {scannedWarga.members?.length ? scannedWarga.members.length + 1 : 1} Anggota
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  {/* Primary head of family as default first row */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-xs font-black shadow-sm">
                        KK
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-tight">{scannedWarga.nama}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Kepala Keluarga • {scannedWarga.umur || '-'} Thn</p>
                      </div>
                    </div>
                  </div>

                  {scannedWarga.members && scannedWarga.members.length > 0 ? (
                    scannedWarga.members.map((member: any, i: number) => {
                      const isIstri = member.role?.toLowerCase().includes('istri');
                      const isAnak = member.role?.toLowerCase().includes('anak');
                      const roleBg = isIstri ? 'bg-rose-50 text-rose-600' : (isAnak ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600');
                      const avatarChar = isIstri ? '👩' : (isAnak ? '👦' : '👤');

                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 ${roleBg} rounded-lg flex items-center justify-center text-sm font-black shadow-sm`}>
                              {avatarChar}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 leading-tight">{member.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">{member.role} • {member.age || '-'} Thn</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : null}
                </div>
              </div>

              {/* Histori Iuran Warga */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">💵 Histori Iuran Warga</h3>
                  <span className="text-[9px] font-bold bg-teal-50 text-teal-600 border border-teal-100/40 px-2.5 py-0.5 rounded-full">
                    Sistem Otomatis
                  </span>
                </div>

                {loadingDues ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">Memuat tagihan...</p>
                  </div>
                ) : duesHistory.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                    <span className="text-2xl block mb-2">💸</span>
                    <p className="text-xs font-black text-slate-700">Belum ada histori iuran</p>
                    <p className="text-[9px] text-slate-400 mt-1">Gunakan modul iuran untuk mengenerate tagihan bulanan.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {duesHistory.map((item) => {
                      const isLunas = item.status === 'lunas' || item.status === 'verifikasi';
                      const isPending = item.status === 'menunggu';
                      
                      const statusBg = isLunas 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60' 
                        : (isPending ? 'bg-amber-50 text-amber-700 border-amber-100/60' : 'bg-rose-50 text-rose-700 border-rose-100/60');
                      
                      const statusText = isLunas 
                        ? 'Lunas' 
                        : (isPending ? 'Menunggu Verifikasi' : 'Belum Dibayar');

                      return (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100/70 flex items-center justify-between text-left">
                          <div>
                            <p className="text-[11px] font-black text-slate-800 leading-tight">{item.bulan}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Iuran Bulanan RT 01</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-slate-800 leading-tight">{formatRupiah(item.nominal || item.amount || 25000)}</p>
                            <span className={`inline-block mt-1 text-[8px] font-black px-2 py-0.5 rounded-full border ${statusBg}`}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button 
                  onClick={() => {
                    setScannedWarga(null);
                    setDuesHistory([]);
                    setSelectedSimWarga('');
                  }}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
                  </svg>
                  <span>Pindai Warga Lain</span>
                </button>

                <button 
                  onClick={onBack}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all active:scale-97 cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
