import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from './apiInterceptor';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL("image/png"));
          return;
        } catch (e) {
          console.error("toDataURL error", e);
        }
      }
      resolve("");
    };
    img.onerror = (err) => {
      console.error("loadImageAsBase64 load error", err);
      resolve("");
    };
  });
};

const formatFullAddress = (alamat: string) => {
  if (!alamat) return "-";
  let cleaned = alamat.trim();
  
  if (!cleaned.toLowerCase().includes("wisma garden") && !cleaned.toLowerCase().includes("perum")) {
    cleaned = "Perum. Wisma Garden " + cleaned;
  }
  
  if (!cleaned.toLowerCase().includes("rt001/rw021") && !cleaned.toLowerCase().includes("rt 001") && !cleaned.toLowerCase().includes("rt.01") && !cleaned.toLowerCase().includes("rt/rw")) {
    cleaned += " RT001/RW021";
  }
  if (!cleaned.toLowerCase().includes("kutajaya") && !cleaned.toLowerCase().includes("kelurahan")) {
    if (cleaned.endsWith(",")) {
      cleaned += " Kelurahan. Kutajaya";
    } else {
      cleaned += ", Kelurahan. Kutajaya";
    }
  }
  if (!cleaned.toLowerCase().includes("pasarkemis") && !cleaned.toLowerCase().includes("kecamatan")) {
    cleaned += " Kecamatan. Pasarkemis";
  }
  if (!cleaned.toLowerCase().includes("tangerang") && !cleaned.toLowerCase().includes("kabupaten")) {
    cleaned += " Kabupaten Tangerang";
  }
  return cleaned;
};

// Compact & Highly Robust Web-Mobile Touch Signature Pad
interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  label: string;
}

export const SignaturePad = ({ onSave, onClear, label }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support both mouse and touch events with accurate scaling
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Adjust for coordinate space scaling in responsive canvas
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsEmpty(false);

    // Save as Data URL continuously
    onSave(canvas.toDataURL('image/png'));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave('');
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100/30 transition pointer-events-auto cursor-pointer"
        >
          Hapus TTD
        </button>
      </div>
      <div className="border-[1.5px] border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden relative" style={{ height: '140px' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <p className="text-[10px] text-slate-500 font-bold select-none text-center">Tulis Tanda Tangan Anda di Sini</p>
          </div>
        )}
      </div>
    </div>
  );
};

let cachedSuratData: any[] | null = null;

export const MobileSuratPengantar = ({ 
  onBack, 
  currentUser,
  hittedSuratId,
  clearHighlight
}: { 
  onBack: () => void, 
  currentUser: any,
  hittedSuratId?: string | null,
  clearHighlight?: () => void
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  
  const [data, setData] = useState<any[]>(cachedSuratData || []);
  const [loading, setLoading] = useState(!cachedSuratData);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Form Fields State
  const [formNama, setFormNama] = useState(currentUser?.nama || '');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formStatusPerkawinan, setFormStatusPerkawinan] = useState('Belum Kawin');
  const [formJenisKelamin, setFormJenisKelamin] = useState('Laki-laki');
  const [formAgama, setFormAgama] = useState('Islam');
  const [formPekerjaan, setFormPekerjaan] = useState('');
  const [formNoKtpKk, setFormNoKtpKk] = useState('');
  const [formAlamatSekarang, setFormAlamatSekarang] = useState(currentUser?.alamat || '');
  const [formAlamatAsal, setFormAlamatAsal] = useState('');
  const [formMohonDibuatkan, setFormMohonDibuatkan] = useState('');
  const [formSignaturePemohon, setFormSignaturePemohon] = useState('');
  const [formError, setFormError] = useState('');

  // RT Signature Drawer State
  const [activeRtSignatureItem, setActiveRtSignatureItem] = useState<any | null>(null);
  const [formSignatureRt, setFormSignatureRt] = useState('');
  
  // Cap/stamp fields for RT signature confirmation
  const [capX, setCapX] = useState(-15);
  const [capY, setCapY] = useState(2);
  const [capSize, setCapSize] = useState(40);
  const [useCap, setUseCap] = useState(true);

  // Applicant Edit Signature State (SEBELUM DIKONFIRMASI)
  const [activeEditSignatureItem, setActiveEditSignatureItem] = useState<any | null>(null);
  const [formSignaturePemohonEdit, setFormSignaturePemohonEdit] = useState('');
  const [signStep, setSignStep] = useState<1 | 2>(1);

  const isAdminOrPengurus = currentUser?.allowedMenus?.includes('Surat Online') || currentUser?.role === 'developer';
  const canSeeAllHistory = currentUser?.role === 'admin' || currentUser?.role === 'developer';

  // Watch for notification trigger selection on mobile
  useEffect(() => {
    if (hittedSuratId && data.length > 0) {
      const matched = data.find(item => item.id === hittedSuratId);
      if (matched) {
        if (isAdminOrPengurus && matched.status !== 'selesai') {
          setSignStep(1);
          setActiveRtSignatureItem(matched);
        } else {
          // Highlight/scroll to element
          const elem = document.getElementById(`surat-item-${matched.id}`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        if (clearHighlight) clearHighlight();
      }
    }
  }, [hittedSuratId, data, isAdminOrPengurus]);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/data/surat');
      const json = await res.json();
      cachedSuratData = json.data || [];
      setData(cachedSuratData!);
    } catch(e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const handleDeleteLetter = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat pengantar yang sudah selesai ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        const res = await apiFetch(`/api/data/surat/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'warga'
          },
          body: JSON.stringify({
            updaterName: currentUser?.nama
          })
        });
        if (res.ok) {
          alert('Surat pengantar berhasil dihapus.');
          fetchData();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Gagal menghapus surat pengantar.');
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat menghapus surat pengantar.');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!formNama) setFormNama(currentUser.nama || '');
      if (!formAlamatSekarang) setFormAlamatSekarang(currentUser.alamat || '');
    }
  }, [currentUser]);

  const handleNextStep = () => {
    if (formStep === 1) {
      if (!formNama.trim() || !formNoKtpKk.trim() || !formTempatLahir.trim() || !formTanggalLahir.trim()) {
        setFormError('Sila isi semua data wajib di langkah ini');
        return;
      }
    } else if (formStep === 2) {
      if (!formPekerjaan.trim() || !formAlamatSekarang.trim() || !formAlamatAsal.trim()) {
        setFormError('Sila isi semua data wajib di langkah ini');
        return;
      }
    }
    setFormError('');
    setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    setFormError('');
    setFormStep(formStep - 1);
  };

  const handleCopyAlamat = () => {
    setFormAlamatAsal(formAlamatSekarang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formMohonDibuatkan.trim()) {
      setFormError('Wajib mengisi keterangan permohonan surat');
      return;
    }

    if (!formSignaturePemohon) {
      setFormError('Sila bubuhkan tanda tangan pemohon terlebih dahulu');
      return;
    }

    setLoading(true);
    setFormError('');

    const newSuratPayload = {
      jenis: 'Surat Pengantar RT',
      keperluan: formMohonDibuatkan,
      nama: formNama,
      status: 'proses',
      tempatLahir: formTempatLahir,
      tanggalLahir: formTanggalLahir,
      statusPerkawinan: formStatusPerkawinan,
      jenisKelamin: formJenisKelamin,
      agama: formAgama,
      pekerjaan: formPekerjaan,
      noKtpKk: formNoKtpKk,
      alamatSekarang: formAlamatSekarang,
      alamatAsal: formAlamatAsal,
      mohonDibuatkan: formMohonDibuatkan,
      signaturePemohon: formSignaturePemohon,
      userId: currentUser?.id,
      userName: currentUser?.nama
    };

    // Optimistic item
    const tempId = 'temp-surat-' + Date.now();
    const tempSurat = {
      ...newSuratPayload,
      id: tempId,
      nomorSurat: 'Menggenerasi...',
      createdAt: new Date().toISOString()
    };

    setData(prev => [tempSurat, ...prev]);
    
    // Reset form states
    setShowForm(false);
    resetFormValue();

    try {
      const res = await apiFetch('/api/data/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSuratPayload)
      });
      if (res.ok) {
        fetchData();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Gagal mengajukan surat');
        fetchData();
      }
    } catch(e) {
      console.error(e);
      fetchData();
    }
  };

  const resetFormValue = () => {
    setFormStep(1);
    setFormTempatLahir('');
    setFormTanggalLahir('');
    setFormStatusPerkawinan('Belum Kawin');
    setFormJenisKelamin('Laki-laki');
    setFormAgama('Islam');
    setFormPekerjaan('');
    setFormNoKtpKk('');
    setFormAlamatAsal('');
    setFormMohonDibuatkan('');
    setFormSignaturePemohon('');
    setFormError('');
  };

  // Fungsi mengubah TTD Pemohon jika salah sebelum dikonfirmasi RT
  const handleUpdatePemohonSignature = async () => {
    if (!activeEditSignatureItem || isSubmitting) return;
    
    if (!formSignaturePemohonEdit) {
      alert('Anda belum membuat coretan tanda tangan yang baru.');
      return;
    }

    const targetId = activeEditSignatureItem.id;
    const previousData = [...data];

    // Optimistic Update
    setData(prev => prev.map(item => 
      item.id === targetId ? { ...item, signaturePemohon: formSignaturePemohonEdit } : item
    ));
    setActiveEditSignatureItem(null);
    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/api/data/surat/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signaturePemohon: formSignaturePemohonEdit,
          updaterName: currentUser?.nama 
        })
      });
      
      if (res.ok) {
        setFormSignaturePemohonEdit('');
        await fetchData();
      } else {
        setData(previousData);
        alert('Gagal memperbarui tanda tangan. Silakan coba lagi.');
      }
    } catch (err) {
      setData(previousData);
      console.error('Update signature failed:', err);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // RT confirms with signature
  const handleRtConfirmApproval = async () => {
    if (!activeRtSignatureItem || isSubmitting) return; // Mencegah klik ganda
    
    if (!formSignatureRt) {
      alert('Tanda tangan Ketua RT wajib dibubuhkan.');
      return;
    }

    const targetId = activeRtSignatureItem.id;
    const previousData = [...data]; // Simpan cadangan data sebelum diubah (untuk rollback)

    // 1. Optimistic Update
    setData(prev => prev.map(item => 
      item.id === targetId ? { 
        ...item, 
        status: 'selesai', 
        signatureKetuaRt: formSignatureRt,
        hasCap: useCap,
        capPositionX: capX,
        capPositionY: capY,
        capWidth: capSize,
        capHeight: capSize / 2.56
      } : item
    ));
    setActiveRtSignatureItem(null);
    setIsSubmitting(true); // Aktifkan loading

    try {
      const res = await apiFetch(`/api/data/surat/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'selesai', 
          signatureKetuaRt: formSignatureRt,
          hasCap: useCap,
          capPositionX: capX,
          capPositionY: capY,
          capWidth: capSize,
          capHeight: capSize / 2.56,
          updaterName: currentUser?.nama 
        })
      });
      
      if (res.ok) {
        setFormSignatureRt('');
        await fetchData(); // Tunggu data terbaru agar sinkron
      } else {
        // 2. Rollback jika server error
        setData(previousData);
        alert('Gagal menyetujui surat. Silakan coba lagi.');
      }
    } catch (err) {
      // 3. Rollback jika network error
      setData(previousData);
      console.error('Approval failed:', err);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false); // Matikan loading apapun hasilnya
    }
  };

  const handleDownloadPDF = (surat: any) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    let fileName = `Surat_Pengantar_${surat.nama.replace(/\s+/g, '_')}_${surat.id.substring(0, 5)}.pdf`;

    import('jspdf').then(async ({ jsPDF }) => {
      // ... (Kode Download PDF tidak diubah agar tetap persis) ...
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      doc.setFont("helvetica", "normal");
      try {
        const logoBase64 = await loadImageAsBase64("/api/tangerang-logo-proxy");
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 16, 12, 19, 21.5);
      } catch (err) { console.error("Error drawing logo on pdf:", err); }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("RUKUN TETANGGA 001/021", 112, 18, { align: "center" });
      doc.setFontSize(10.5);
      doc.text("KELURAHAN KUTAJAYA KECAMATAN PASARKEMIS", 112, 23, { align: "center" });
      doc.text("KABUPATEN TANGERANG", 112, 28, { align: "center" });
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text("PERUM. WISMA GARDEN KEL. KUTAJAYA KEC. PASARKEMIS, KAB. TANGERANG", 112, 33, { align: "center" });
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0); doc.line(15, 36, 195, 36);
      doc.setLineWidth(0.4); doc.line(15, 37.2, 195, 37.2);
      
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("SURAT PENGANTAR", 105, 48, { align: "center" });
      doc.setFontSize(10.5); doc.setFont("helvetica", "normal");
      doc.text(`Nomor : ${surat.nomorSurat || '.../RT-001/RW-021/...'}`, 105, 53, { align: "center" });

      doc.setFontSize(10);
      const introText = "Yang bertandatangan di bawah ini, Ketua RT 001 / RW 021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, dengan ini menerangkan bahwa:";
      const splitIntro = doc.splitTextToSize(introText, 180);
      doc.text(splitIntro, 15, 65);

      let tabY = 78; const stepY = 7.5; const valX = 70;
      const fields = [
        { label: "1. Nama", val: surat.nama },
        { label: "2. Tempat / Tanggal Lahir", val: `${surat.tempatLahir || '-'}, ${surat.tanggalLahir || '-'}` },
        { label: "3. Status Perkawinan", val: surat.statusPerkawinan },
        { label: "4. Jenis Kelamin", val: surat.jenisKelamin },
        { label: "5. Agama", val: surat.agama },
        { label: "6. Pekerjaan", val: surat.pekerjaan },
        { label: "7. No. NIK KTP/KK", val: surat.noKtpKk },
        { label: "8. Alamat Sekarang", val: formatFullAddress(surat.alamatSekarang) },
        { label: "9. Alamat Asal", val: surat.alamatAsal }
      ];

      fields.forEach((f) => {
        doc.setFont("helvetica", "bold"); doc.text(f.label, 20, tabY);
        doc.setFont("helvetica", "normal"); doc.text(":", valX - 4, tabY);
        const wrapText = doc.splitTextToSize(f.val || '-', 120);
        doc.text(wrapText, valX, tabY);
        if (wrapText.length > 1) { tabY += stepY + (wrapText.length - 1) * 4; } else { tabY += stepY; }
      });

      tabY += 4;
      const stmt1 = "Benar bahwa nama tersebut diatas Warga/Penduduk di lingkungan RT001/RW021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, mohon kepada yang bersangkutan untuk dibuatkan:";
      const splitStmt1 = doc.splitTextToSize(stmt1, 180);
      doc.text(splitStmt1, 15, tabY);
      
      tabY += splitStmt1.length * 4.5 + 2;
      doc.setFont("helvetica", "bold");
      doc.text(`1. ${surat.mohonDibuatkan || surat.keperluan || '-'}`, 20, tabY);

      tabY += 10;
      doc.setFont("helvetica", "normal");
      const stmt2 = "Demikian Surat Pengantar ini dibuat untuk bahan pertimbangan serta realisasinya sebagaimana mestinya.";
      doc.text(stmt2, 15, tabY);

      const sigBlockY = Math.max(tabY + 22, 222);

      doc.setFont("helvetica", "bold"); doc.text("Pemohon", 45, sigBlockY, { align: "center" });
      if (surat.signaturePemohon) { doc.addImage(surat.signaturePemohon, 'PNG', 25, sigBlockY + 4, 40, 20); }
      doc.setFont("helvetica", "normal"); doc.text(`( ${surat.nama || '................................'} )`, 45, sigBlockY + 28, { align: "center" });

      doc.setFont("helvetica", "bold"); doc.text("Mengetahui", 155, sigBlockY, { align: "center" });
      doc.text("Ketua RT 001", 155, sigBlockY + 5, { align: "center" });
      if (surat.signatureKetuaRt) {
        doc.addImage(surat.signatureKetuaRt, 'PNG', 135, sigBlockY + 9, 40, 20);
        
        if (surat.hasCap) {
          try {
            const capBase64 = await loadImageAsBase64("/caprt.png");
            if (capBase64) {
              const capX = 135 + (surat.capPositionX ?? -5);
              const capY = (sigBlockY + 9) + (surat.capPositionY ?? -5);
              const capW = surat.capWidth ?? 30;
              const capH = surat.capHeight ?? 30;
              doc.addImage(capBase64, 'PNG', capX, capY, capW, capH);
            }
          } catch (capErr) {
            console.error("Error drawing stamp/cap on mobile pdf:", capErr);
          }
        }
      }
      doc.setFont("helvetica", "normal"); doc.text("( Ketua RT 001 )", 155, sigBlockY + 33, { align: "center" });

      try {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        setPdfFileName(fileName);
        setPdfPreviewUrl(blobUrl);

        const link = document.createElement('a'); 
        link.href = blobUrl; 
        link.download = fileName; 
        link.target = "_blank";
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
      } catch (err) {
        console.warn("Mobile blob download fallback:", err);
      } finally {
        setIsGeneratingPdf(false);
      }
    });
  };

  const filteredData = useMemo(() => {
    return data
      .filter(d => canSeeAllHistory || d.userId === currentUser?.id)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, canSeeAllHistory, currentUser?.id]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'selesai') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-amber-50 text-amber-700 border-amber-100'; // Pending
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Header toolbar */}
        <div className="sticky top-0 z-25 backdrop-blur-lg bg-white/80 border-b border-slate-200/50 px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="w-11 h-11 flex justify-center items-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 transition-all pointer-events-auto cursor-pointer"
              aria-label="Kembali ke menu"
            >
              <icons.arrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Kop Surat Pengantar</h2>
          </div>
          <span className="bg-teal-50 text-teal-700 font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded border border-teal-100/30">
            RT 01/RW 21
          </span>
        </div>

        <div className="p-4 space-y-6">

          {/* Collapsible Form Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => {
                setShowForm(!showForm);
                if(!showForm) resetFormValue();
              }} 
              className="w-full p-4 flex justify-between items-center bg-teal-50/40 hover:bg-teal-50 transition pointer-events-auto cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xs">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v4a2 2 0 002 2h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-slate-800 text-sm">Ajukan Surat Pengantar</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Tanda Tangan Digital & format PDF langsung</p>
                </div>
              </div>
              <motion.div 
                animate={{ rotate: showForm ? 180 : 0 }} 
                className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-xs text-slate-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-white"
                >
                  <form onSubmit={handleSubmit} className="p-5 border-t border-slate-100 space-y-4">
                    
                    {/* Error container */}
                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span>⚠️ {formError}</span>
                      </div>
                    )}

                    {/* Step bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-50 text-[10px] font-bold text-gray-400">
                      <span className={formStep === 1 ? 'text-teal-600' : ''}>1. IDENTITAS</span>
                      <span className="text-slate-200">➔</span>
                      <span className={formStep === 2 ? 'text-teal-600' : ''}>2. STATUS & ALAMAT</span>
                      <span className="text-slate-200">➔</span>
                      <span className={formStep === 3 ? 'text-teal-600' : ''}>3. KEPERLUAN & TTD</span>
                    </div>

                    {/* STEP 1 & 2 OMITTED FOR BREVITY BUT KEPT IN CODE */}
                    {formStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                          <input type="text" required placeholder="Contoh: Muhammad Adji Prasetyo" value={formNama} onChange={e => setFormNama(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">No NIK KTP / KK</label>
                          <input type="text" required placeholder="Masukkan 16 digit No KTP atau No KK" value={formNoKtpKk} onChange={e => setFormNoKtpKk(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition" />
                        </div>
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                            <input type="text" required placeholder="Kota tempat lahir" value={formTempatLahir} onChange={e => setFormTempatLahir(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                            <input type="date" required value={formTanggalLahir} onChange={e => setFormTanggalLahir(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Laki-laki', 'Perempuan'].map((g) => (
                              <button key={g} type="button" onClick={() => setFormJenisKelamin(g)} className={`py-3 text-xs font-bold rounded-xl border transition pointer-events-auto cursor-pointer ${formJenisKelamin === g ? 'bg-teal-50 text-teal-700 border-teal-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{g}</button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button type="button" onClick={handleNextStep} className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer flex items-center gap-1">Lanjut Langkah 2 ➔</button>
                        </div>
                      </div>
                    )}

                    {formStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan</label>
                            <select value={formStatusPerkawinan} onChange={e => setFormStatusPerkawinan(e.target.value)} className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold">
                              <option value="Belum Kawin">Belum Kawin</option>
                              <option value="Kawin">Kawin</option>
                              <option value="Cerai Hidup">Cerai Hidup</option>
                              <option value="Cerai Mati">Cerai Mati</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
                            <select value={formAgama} onChange={e => setFormAgama(e.target.value)} className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold">
                              <option value="Islam">Islam</option>
                              <option value="Kristen">Kristen</option>
                              <option value="Katolik">Katolik</option>
                              <option value="Hindu">Hindu</option>
                              <option value="Buddha">Buddha</option>
                              <option value="Khonghucu">Khonghucu</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan</label>
                          <input type="text" required placeholder="Contoh: Karyawan Swasta, Wiraswasta" value={formPekerjaan} onChange={e => setFormPekerjaan(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Sekarang</label>
                          <textarea rows={2} required placeholder="Alamat domisili saat ini" value={formAlamatSekarang} onChange={e => setFormAlamatSekarang(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition resize-none" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-slate-700">Alamat Asal (Sesuai KTP)</label>
                            <button type="button" onClick={handleCopyAlamat} className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded transition pointer-events-auto cursor-pointer">Sama dengan Alamat Sekarang</button>
                          </div>
                          <textarea rows={2} required placeholder="Alamat asal tertulis di KTP" value={formAlamatAsal} onChange={e => setFormAlamatAsal(e.target.value)} className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition resize-none" />
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                          <button type="button" onClick={handlePrevStep} className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition pointer-events-auto cursor-pointer">Back</button>
                          <button type="button" onClick={handleNextStep} className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer">Lanjut Langkah 3 ➔</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {formStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Mohon Dibuatkan / Keperluan Surat</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: Surat Pengantar Pembuatan KTP Baru"
                            value={formMohonDibuatkan} 
                            onChange={e => setFormMohonDibuatkan(e.target.value)} 
                            className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition placeholder:text-slate-600"
                          />
                        </div>

                        {/* SIGNATURE PAD FOR PEMOHON */}
                        <div className="bg-slate-100/30 p-3 rounded-xl border border-dashed border-slate-220 mt-3">
                          <SignaturePad 
                            label="Tanda Tangan Pemohon" 
                            onSave={(dataUrl) => setFormSignaturePemohon(dataUrl)} 
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition pointer-events-auto cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-55 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer flex items-center gap-1.5"
                          >
                            {loading && (
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            Kirim Permohonan Surat
                          </button>
                        </div>
                      </div>
                    )}

                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List/History Section */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm ml-1 flex items-center gap-1.5">
              <span>📃 Riwayat Pengajuan Surat</span>
              <span className="bg-slate-200/80 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                {filteredData.length}
              </span>
            </h3>

            {filteredData.length > 0 ? (
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div 
                    key={item.id}
                    id={`surat-item-${item.id}`}
                    className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition duration-300 ${
                      hittedSuratId === item.id 
                        ? 'bg-teal-50/75 border-teal-500 ring-2 ring-teal-500/20' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-teal-600 tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/30">
                            {item.jenis || 'Surat Pengantar RT'}
                          </span>
                          <h4 className="font-extrabold text-slate-800 text-sm tracking-tight pt-1 leading-snug">
                            {item.mohonDibuatkan || item.keperluan}
                          </h4>
                          <p className="text-[10px] text-slate-600 font-semibold">
                            Nomor: <span className="font-mono text-slate-500">{item.nomorSurat || 'Tunda (pending)'}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider shrink-0 uppercase border ${getStatusStyle(item.status)}`}>
                          {item.status === 'selesai' ? 'SELESAI' : 'PROSES'}
                        </span>
                      </div>

                      {/* Display brief properties of applicant */}
                      <div className="grid grid-cols-2 gap-y-2 p-3 bg-slate-50/60 rounded-xl text-[10.5px] font-medium text-slate-500 border border-slate-100/30">
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Nama Pemohon</p>
                          <p className="font-bold text-slate-700 leading-tight mt-0.5">{item.nama || item.userName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">No KTP/KK</p>
                          <p className="font-semibold text-slate-700 leading-tight mt-0.5">{item.noKtpKk || '-'}</p>
                        </div>
                        {item.createdAt && (
                          <div className="col-span-2 pt-1 border-t border-slate-50 mt-1 flex items-center gap-1 text-[9px] text-slate-500 font-semibold">
                            <span>⌚ Diajukan pada:</span> 
                            <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Tanda Tangan Digital pada Tampilan Mobile */}
                      <div className="mt-3 pt-3 border-t border-slate-100/60 grid grid-cols-2 gap-3.5 text-center">
                        
                        {/* BOX TTD PEMOHON */}
                        <div className="flex flex-col items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/40 relative group">
                          <div className="flex justify-between w-full items-center mb-1">
                            <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-wider">TTD Pemohon</p>
                            
                            {/* TOMBOL EDIT TTD: Muncul jika status belum selesai (Proses) */}
                            {item.status !== 'selesai' && (item.userId === currentUser?.id || isAdminOrPengurus) && (
                              <button
                                onClick={() => {
                                  setActiveEditSignatureItem(item);
                                  setFormSignaturePemohonEdit('');
                                }}
                                className="text-[9px] text-teal-600 hover:text-teal-700 font-bold pointer-events-auto cursor-pointer bg-teal-50 px-1.5 py-0.5 rounded shadow-xs"
                              >
                                ✏️ Ubah
                              </button>
                            )}
                          </div>
                          
                          <div className="h-14 w-full flex items-center justify-center bg-white/75 rounded-lg p-1 border border-slate-100 overflow-hidden">
                            {item.signaturePemohon ? (
                              <img 
                                src={item.signaturePemohon} 
                                alt="TTD Pemohon" 
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain mix-blend-multiply" 
                              />
                            ) : (
                              <span className="text-[9px] italic text-slate-500 font-semibold">Belum ada</span>
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-600 truncate w-full mt-0.5">{item.nama || item.userName}</p>
                        </div>

                        {/* BOX TTD RT */}
                        <div className="flex flex-col items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/40">
                          <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-wider">TTD Ketua RT</p>
                          <div className="h-14 w-full flex items-center justify-center my-1 bg-white/75 rounded-lg p-1 border border-slate-100 overflow-hidden">
                            {item.signatureKetuaRt ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <img 
                                  src={item.signatureKetuaRt} 
                                  alt="TTD Ketua RT" 
                                  referrerPolicy="no-referrer"
                                  className="max-h-full max-w-full object-contain mix-blend-multiply" 
                                />
                                {item.hasCap && (
                                  <img 
                                    src="/caprt.png" 
                                    alt="Cap RT" 
                                    referrerPolicy="no-referrer"
                                    className="absolute mix-blend-multiply pointer-events-none" 
                                    style={{
                                      width: `${(item.capWidth ?? 40) * 1.3}px`,
                                      height: `${(item.capHeight ?? (40 / 2.56)) * 1.3}px`,
                                      left: `calc(50% - ${((item.capWidth ?? 40) * 1.3) / 2}px + ${(item.capPositionX ?? -15) * 1.3}px)`,
                                      top: `calc(50% - ${((item.capHeight ?? (40 / 2.56)) * 1.3) / 2}px + ${(item.capPositionY ?? 2) * 1.3}px)`
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] italic text-amber-500 font-extrabold animate-pulse">Menunggu...</span>
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-600 truncate w-full mt-0.5">Ketua RT 001</p>
                        </div>

                      </div>
                    </div>

                    {/* ADMIN ACTION: RT Digital Signature Confirmation Box */}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'sekretaris' || currentUser?.role === 'developer') && item.status !== 'selesai' && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            setFormSignatureRt('');
                            setSignStep(1);
                            setActiveRtSignatureItem(item);
                          }}
                          className="w-full py-2.5 px-4 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition shadow-xs flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5a2.25 2.25 0 01-2-2.25V6.25A2.25 2.25 0 015.25 4H10" />
                          </svg>
                          Tandai Selesai + TTD Digital RT
                        </button>
                      </div>
                    )}

                    {/* Citizen Action: Download fully filled PDF */}
                    {item.status === 'selesai' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <button 
                          onClick={() => handleDownloadPDF(item)} 
                          className="w-full py-2.5 px-4 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          Unduh PDF Hasil TTD Lengkap
                        </button>

                        {(currentUser?.role === 'admin' || currentUser?.role === 'developer') && (
                          <button 
                            onClick={() => handleDeleteLetter(item.id)} 
                            className="w-full py-2.5 px-4 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus Surat
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white mt-4">
                <icons.surat className="w-10 h-10 text-slate-350 mb-3" />
                <h4 className="text-xs font-bold text-slate-700">Belum ada pengajuan</h4>
                <p className="text-[10px] text-slate-600 font-semibold mt-1 max-w-xs">Pengajuan Surat Pengantar warga dengan TTD digital yang diterbitkan RT akan terdaftar di sini.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL / DRAWER FOR CHIEF RT SIGNATURE */}
      <AnimatePresence>
        {activeRtSignatureItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveRtSignatureItem(null)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full z-10 relative p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Bubuhkan Tanda Tangan Digital RT</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Menyisipkan TTD Ketua RT untuk: <span className="font-bold text-slate-600">{activeRtSignatureItem.nama}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setActiveRtSignatureItem(null)}
                  className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full text-xs pointer-events-auto cursor-pointer border border-slate-200/50"
                  aria-label="Tutup form"
                >
                  ✕
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1 pb-1 border-b border-slate-100 select-none">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider transition-colors ${signStep === 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  1. Tanda Tangan
                </span>
                <span className="text-slate-300 text-[10px]">➔</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider transition-colors ${signStep === 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  2. Atur Cap RT
                </span>
              </div>

              {signStep === 1 ? (
                <div className="space-y-3 pt-1">
                  {/* Pad component */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                    <SignaturePad 
                      label="Tanda Tangan Ketua RT 001" 
                      onSave={(dataUrl) => setFormSignatureRt(dataUrl)} 
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold bg-teal-50 px-2.5 py-2 rounded-lg border border-teal-100/50 leading-relaxed">
                    Silakan gores tanda tangan pada pad abu-abu di atas terlebih dahulu, kemudian klik tombol untuk masuk ke langkah pembubuhan cap basah.
                  </p>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => setActiveRtSignatureItem(null)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition pointer-events-auto cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => setSignStep(2)}
                      disabled={!formSignatureRt}
                      className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Konfirmasi TTD & Lanjut ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Interactive Stamp Customizer */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        Atur Cap RT (Cap Basah)
                      </label>
                      <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useCap}
                          onChange={(e) => setUseCap(e.target.checked)}
                          className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-[11px] font-bold text-slate-600 ml-1">Gunakan Cap</span>
                      </label>
                    </div>

                    {useCap ? (
                      <>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">
                          Seret (drag) langsung pada gambar atau gunakan slider untuk posisi presisi.
                        </p>

                        {/* Interactive Drag Frame */}
                        <div className="relative w-full h-[140px] bg-slate-900/[0.02] border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center select-none shadow-inner">
                          <div className="absolute inset-x-0 top-1.5 text-center pointer-events-none">
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Preview Area TTD + Cap</span>
                          </div>

                          {/* Signature & Stamp Group Wrapper */}
                          <div className="relative w-[160px] h-[80px] border border-dashed border-slate-200 bg-white flex items-center justify-center">
                            {/* Sign Base Image */}
                            <img
                              src={formSignatureRt}
                              alt="Signature Preview"
                              className="max-w-full max-h-full object-contain mix-blend-multiply opacity-80"
                            />

                            {/* Cap Overlaid Absolute Div */}
                            <div
                              className="absolute border border-dashed border-rose-500/50 rounded-full cursor-move group"
                              style={{
                                width: `${capSize * 1.8}px`,
                                height: `${(capSize / 2.56) * 1.8}px`,
                                left: `calc(50% - ${(capSize * 1.8) / 2}px + ${capX * 1.8}px)`,
                                top: `calc(50% - ${((capSize / 2.56) * 1.8) / 2}px + ${capY * 1.8}px)`,
                                backgroundImage: 'url("/caprt.png")',
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                              }}
                              onMouseDown={(e) => {
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const initialX = capX;
                                const initialY = capY;

                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  const deltaX = (moveEvent.clientX - startX) / 1.8;
                                  const deltaY = (moveEvent.clientY - startY) / 1.8;
                                  setCapX(Math.max(-40, Math.min(40, Math.round(initialX + deltaX))));
                                  setCapY(Math.max(-30, Math.min(30, Math.round(initialY + deltaY))));
                                };

                                const handleMouseUp = () => {
                                  window.removeEventListener('mousemove', handleMouseMove);
                                  window.removeEventListener('mouseup', handleMouseUp);
                                };

                                window.addEventListener('mousemove', handleMouseMove);
                                window.addEventListener('mouseup', handleMouseUp);
                              }}
                              onTouchStart={(e) => {
                                if (e.touches.length === 0) return;
                                const startX = e.touches[0].clientX;
                                const startY = e.touches[0].clientY;
                                const initialX = capX;
                                const initialY = capY;

                                const handleTouchMove = (moveEvent: TouchEvent) => {
                                  if (moveEvent.touches.length === 0) return;
                                  const deltaX = (moveEvent.touches[0].clientX - startX) / 1.8;
                                  const deltaY = (moveEvent.touches[0].clientY - startY) / 1.8;
                                  setCapX(Math.max(-40, Math.min(40, Math.round(initialX + deltaX))));
                                  setCapY(Math.max(-30, Math.min(30, Math.round(initialY + deltaY))));
                                };

                                const handleTouchEnd = () => {
                                  window.removeEventListener('touchmove', handleTouchMove);
                                  window.removeEventListener('touchend', handleTouchEnd);
                                };

                                window.addEventListener('touchmove', handleTouchMove);
                                window.addEventListener('touchend', handleTouchEnd);
                              }}
                            >
                              <div className="absolute inset-0 bg-rose-500/5 flex items-center justify-center rounded-full">
                                <span className="text-[7px] text-rose-550 font-bold bg-white/90 px-1 py-0.5 rounded shadow-xs">
                                  GESER
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sliders */}
                        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Geser Kiri/Kanan (X)</span>
                              <span className="font-mono text-teal-600">{capX} mm</span>
                            </div>
                            <input
                              type="range"
                              min="-40"
                              max="40"
                              value={capX}
                              onChange={(e) => setCapX(Number(e.target.value))}
                              className="w-full accent-teal-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Geser Atas/Bawah (Y)</span>
                              <span className="font-mono text-teal-600">{capY} mm</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={capY}
                              onChange={(e) => setCapY(Number(e.target.value))}
                              className="w-full accent-teal-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Ukuran Cap</span>
                              <span className="font-mono text-teal-600">{capSize} mm</span>
                            </div>
                            <input
                              type="range"
                              min="15"
                              max="50"
                              value={capSize}
                              onChange={(e) => setCapSize(Number(e.target.value))}
                              className="w-full accent-teal-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-500 font-bold select-none">
                        Cap basah ditiadakan. Surat pengantar hanya dibubuhkan tanda tangan Ketua RT saja.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => setSignStep(1)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition pointer-events-auto cursor-pointer"
                    >
                      ⬅ Kembali ke TTD
                    </button>
                    <button
                      onClick={handleRtConfirmApproval}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Konfirmasi & Setujui
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL / DRAWER FOR UBAH TTD PEMOHON */}
      <AnimatePresence>
        {activeEditSignatureItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEditSignatureItem(null)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full z-10 relative p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Ubah Tanda Tangan Anda</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Memperbarui TTD untuk permohonan: <br/><span className="font-bold text-slate-600">{activeEditSignatureItem.keperluan || activeEditSignatureItem.mohonDibuatkan}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setActiveEditSignatureItem(null)}
                  className="w-11 h-11 flex justify-center items-center text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-full text-xs pointer-events-auto cursor-pointer"
                  aria-label="Tutup ubah ttd"
                >
                  ✕
                </button>
              </div>

              {/* Pad component */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                <SignaturePad 
                  label="Tanda Tangan Pemohon Baru" 
                  onSave={(dataUrl) => setFormSignaturePemohonEdit(dataUrl)} 
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setActiveEditSignatureItem(null)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition pointer-events-auto cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdatePemohonSignature}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan TTD Baru'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Ready Download Modal for Mobile */}
      <AnimatePresence>
        {pdfPreviewUrl && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full z-10 relative p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Dokumen PDF Siap</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Silakan unduh atau pratinjau dokumen Anda di bawah ini.</p>
                </div>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                  }}
                  className="w-11 h-11 flex justify-center items-center text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-full text-xs pointer-events-auto cursor-pointer"
                  aria-label="Tutup preview PDF"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <iframe src={`${pdfPreviewUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
              </div>

              <div className="flex justify-end pt-2 shrink-0">
                <a 
                  href={pdfPreviewUrl} 
                  download={pdfFileName}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition pointer-events-auto cursor-pointer text-center"
                >
                  Simpan & Unduh Dokumen
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};