import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Filter, FileText, CheckCircle2, Clock, 
  AlertTriangle, Download, ArrowLeft, RefreshCw, PenTool, 
  Check, MapPin, Smile, User2, Eye, Minimize2, CheckSquare, X, Calendar, FileCheck, Trash2
} from 'lucide-react';
import { apiFetch } from '../apiInterceptor';

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

// Desktop-scale optimized Signature Pad
interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  label: string;
}

const SignatureCanvas = ({ onSave, onClear, label }: SignatureCanvasProps) => {
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
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

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
      <div className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
        <span className="text-xs font-extrabold text-slate-700 tracking-tight uppercase flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-slate-500" /> {label}
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-[10px] font-black text-rose-600 hover:text-rose-750 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100/30 transition-all pointer-events-auto cursor-pointer"
        >
          Hapus Tanda Tangan
        </button>
      </div>
      <div className="border-[2px] border-dashed border-slate-250 rounded-xl bg-slate-50/30 overflow-hidden relative shadow-inner" style={{ height: '150px' }}>
        <canvas
          ref={canvasRef}
          width={450}
          height={150}
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
          <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none opacity-45">
            <p className="text-[11px] text-slate-400 font-bold select-none text-center">Tulis tanda tangan Anda di bidang abu-abu ini</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Dapat digores menggunakan stylus atau mouse</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const WebSuratOnlinePage = ({ 
  user, 
  hittedSuratId, 
  clearHighlight 
}: { 
  user: any; 
  hittedSuratId?: string | null; 
  clearHighlight?: () => void; 
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'proses' | 'selesai'>('semua');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Form (Citizen submission dialog)
  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fields
  const [formNama, setFormNama] = useState(user?.nama || '');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formStatusPerkawinan, setFormStatusPerkawinan] = useState('Belum Kawin');
  const [formJenisKelamin, setFormJenisKelamin] = useState('Laki-laki');
  const [formAgama, setFormAgama] = useState('Islam');
  const [formPekerjaan, setFormPekerjaan] = useState('');
  const [formNoKtpKk, setFormNoKtpKk] = useState('');
  const [formAlamatSekarang, setFormAlamatSekarang] = useState(user?.alamat || '');
  const [formAlamatAsal, setFormAlamatAsal] = useState('');
  const [formMohonDibuatkan, setFormMohonDibuatkan] = useState('');
  const [formSignaturePemohon, setFormSignaturePemohon] = useState('');

  // Approval Signature pad
  const [formSignatureRt, setFormSignatureRt] = useState('');
  const [editingNomorSurat, setEditingNomorSurat] = useState('');
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signStep, setSignStep] = useState<1 | 2>(1);
  
  // Cap/stamp fields
  const [capX, setCapX] = useState(-15);
  const [capY, setCapY] = useState(2);
  const [capSize, setCapSize] = useState(40);
  const [useCap, setUseCap] = useState(true);

  const isAdminOrPengurus = user?.allowedMenus?.includes('Surat Online') || user?.role === 'developer';
  const canSeeAllHistory = user?.role === 'admin' || user?.role === 'developer';

  const exportToExcel = () => {
    if (user?.role !== 'admin') {
      alert("Hanya Ketua RT yang memiliki akses untuk mengekspor data ke Excel.");
      return;
    }

    const headers = ["ID", "Nama Pengusul", "NIK", "No KK", "Alamat", "Keperluan", "Status", "Nomor Surat", "Tanggal Pengajuan"];
    const rows = data.map(item => [
      item.id || "-",
      item.nama || item.userName || "-",
      item.nik || "-",
      item.noKK || "-",
      item.alamatSekarang || "-",
      item.keperluan || "-",
      item.status || "-",
      item.nomorSurat || "-",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Surat_Online_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/data/surat');
      if (res.ok) {
        const json = await res.json();
        const apiData = json.data || [];
        setData(apiData);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Watch for notification trigger selection
  useEffect(() => {
    if (hittedSuratId && data.length > 0) {
      const matched = data.find(item => item.id === hittedSuratId);
      if (matched) {
        setSelectedItem(matched);
        setEditingNomorSurat(matched.nomorSurat || '');
        // Clear globally so it can trigger again on next click
        if (clearHighlight) clearHighlight();
      }
    }
  }, [hittedSuratId, data]);

  // Handle setting default initial selected item on load
  useEffect(() => {
    if (!selectedItem && data.length > 0) {
      const allowed = data.filter(d => canSeeAllHistory || d.userId === user?.id);
      if (allowed.length > 0) {
        setSelectedItem(allowed[0]);
        setEditingNomorSurat(allowed[0].nomorSurat || '');
      }
    }
  }, [data, selectedItem]);

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

  const handleResetForm = () => {
    setFormStep(1);
    setFormNama(user?.nama || '');
    setFormNoKtpKk('');
    setFormTempatLahir('');
    setFormTanggalLahir('');
    setFormStatusPerkawinan('Belum Kawin');
    setFormJenisKelamin('Laki-laki');
    setFormAgama('Islam');
    setFormPekerjaan('');
    setFormAlamatSekarang(user?.alamat || '');
    setFormAlamatAsal('');
    setFormMohonDibuatkan('');
    setFormSignaturePemohon('');
    setFormError('');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMohonDibuatkan.trim()) {
      setFormError('Wajib mengisi keterangan permohonan surat');
      return;
    }
    if (!formSignaturePemohon) {
      setFormError('Sila bubuhkan tanda tangan pemohon terlebih dahulu');
      return;
    }

    setSubmitting(true);
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
      userId: user?.id,
      userName: user?.nama
    };

    try {
      const res = await apiFetch('/api/data/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSuratPayload)
      });
      if (res.ok) {
        setShowFormModal(false);
        handleResetForm();
        fetchData();
      } else {
        const errJson = await res.json();
        setFormError(errJson.error || 'Gagal mengajukan surat');
      }
    } catch(e) {
      console.error(e);
      setFormError('Gagal koneksi server');
    } finally {
      setSubmitting(false);
    }
  };

  // RT Confirm & Signature
  const handleRtApprove = async () => {
    if (!selectedItem) return;
    if (!formSignatureRt) {
      alert('Tanda tangan Ketua RT wajib dibubuhkan.');
      return;
    }

    try {
      const res = await apiFetch(`/api/data/surat/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'selesai',
          nomorSurat: editingNomorSurat || selectedItem.nomorSurat,
          signatureKetuaRt: formSignatureRt,
          hasCap: useCap,
          capPositionX: capX,
          capPositionY: capY,
          capWidth: capSize,
          capHeight: capSize / 2.56,
          updaterName: user?.nama
        })
      });

      if (res.ok) {
        setIsSignOpen(false);
        setFormSignatureRt('');
        const updated = await res.json();
        // Update local items state
        setData(prev => prev.map(item => item.id === selectedItem.id ? { 
          ...item, 
          status: 'selesai', 
          nomorSurat: editingNomorSurat || item.nomorSurat, 
          signatureKetuaRt: formSignatureRt,
          hasCap: useCap,
          capPositionX: capX,
          capPositionY: capY,
          capWidth: capSize,
          capHeight: capSize / 2.56
        } : item));
        setSelectedItem(prev => ({ 
          ...prev, 
          status: 'selesai', 
          nomorSurat: editingNomorSurat || prev.nomorSurat, 
          signatureKetuaRt: formSignatureRt,
          hasCap: useCap,
          capPositionX: capX,
          capPositionY: capY,
          capWidth: capSize,
          capHeight: capSize / 2.56
        }));
        fetchData();
      } else {
        alert('Gagal memverifikasi dokumen');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLetter = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat pengantar yang sudah selesai ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        const res = await apiFetch(`/api/data/surat/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || 'warga'
          },
          body: JSON.stringify({
            updaterName: user?.nama
          })
        });
        if (res.ok) {
          alert('Surat pengantar berhasil dihapus.');
          setSelectedItem(null);
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

  const handleDownloadPDF = (surat: any) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    let fileName = `Surat_Pengantar_${surat.nama.replace(/\s+/g, '_')}_${surat.id.substring(0, 5)}.pdf`;

    import('jspdf').then(async ({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont("helvetica", "normal");

      // Draw Tangerang Logo
      try {
        const logoBase64 = await loadImageAsBase64("/api/tangerang-logo-proxy");
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 16, 12, 19, 21.5);
        }
      } catch (err) {
        console.error("Error drawing logo on pdf:", err);
      }

      // Kop
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("RUKUN TETANGGA 001/021", 112, 17, { align: "center" });
      
      doc.setFontSize(11);
      doc.text("KELURAHAN KUTAJAYA KECAMATAN PASARKEMIS", 112, 22.5, { align: "center" });
      doc.text("KABUPATEN TANGERANG", 112, 27.5, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("PERUM. WISMA GARDEN KEL. KUTAJAYA KEC. PASARKEMIS, KAB. TANGERANG", 112, 32.5, { align: "center" });
      
      // Lines
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0);
      doc.line(15, 35.5, 195, 35.5);
      doc.setLineWidth(0.4);
      doc.line(15, 36.7, 195, 36.7);
      
      // Title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("SURAT PENGANTAR", 105, 48, { align: "center" });
      
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Nomor : ${surat.nomorSurat || '.../RT-001/RW-021/...'}`, 105, 53, { align: "center" });

      // Intro
      doc.setFontSize(10);
      const introText = "Yang bertandatangan di bawah ini, Ketua RT 001 / RW 021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, dengan ini menerangkan bahwa:";
      const splitIntro = doc.splitTextToSize(introText, 180);
      doc.text(splitIntro, 15, 65);

      let tabY = 78;
      const stepY = 7.5;
      const valX = 70;

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
        doc.setFont("helvetica", "bold");
        doc.text(f.label, 20, tabY);
        doc.setFont("helvetica", "normal");
        doc.text(":", valX - 4, tabY);
        
        const wrapText = doc.splitTextToSize(f.val || '-', 120);
        doc.text(wrapText, valX, tabY);
        
        if (wrapText.length > 1) {
          tabY += stepY + (wrapText.length - 1) * 4;
        } else {
          tabY += stepY;
        }
      });

      // Statement
      tabY += 4;
      const stmt1 = "Benar bahwa nama tersebut diatas Warga/Penduduk di lingkungan RT001/RW021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, mohon kepada yang bersangkutan untuk dibuatkan:";
      const splitStmt1 = doc.splitTextToSize(stmt1, 180);
      doc.text(splitStmt1, 15, tabY);
      
      tabY += splitStmt1.length * 4.5 + 2;
      doc.setFont("helvetica", "bold");
      doc.text(`1. ${surat.mohonDibuatkan || surat.keperluan || '-'}`, 20, tabY);

      // Closing
      tabY += 10;
      doc.setFont("helvetica", "normal");
      const stmt2 = "Demikian Surat Pengantar ini dibuat untuk bahan pertimbangan serta realisasinya sebagaimana mestinya.";
      doc.text(stmt2, 15, tabY);

      // Signature placements
      const sigBlockY = Math.max(tabY + 22, 222);

      // Pemohon
      doc.setFont("helvetica", "bold");
      doc.text("Pemohon", 45, sigBlockY, { align: "center" });
      if (surat.signaturePemohon) {
        doc.addImage(surat.signaturePemohon, 'PNG', 25, sigBlockY + 4, 40, 20);
      }
      doc.setFont("helvetica", "normal");
      doc.text(`( ${surat.nama || '................................'} )`, 45, sigBlockY + 28, { align: "center" });

      // Ketua RT
      doc.setFont("helvetica", "bold");
      doc.text("Mengetahui", 155, sigBlockY, { align: "center" });
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
            console.error("Error drawing stamp/cap on pdf:", capErr);
          }
        }
      }
      doc.setFont("helvetica", "normal");
      doc.text("( Ketua RT 001 )", 155, sigBlockY + 33, { align: "center" });

      try {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        setPdfFileName(fileName);
        setPdfPreviewUrl(blobUrl);

        // Attempt direct click as a bonus
        const link = document.createElement('a'); 
        link.href = blobUrl; 
        link.download = fileName; 
        link.target = "_blank";
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
      } catch (err) {
        console.warn("PDF generation error:", err);
      } finally {
        setIsGeneratingPdf(false);
      }
    });
  };

  const filteredList = useMemo(() => {
    return data
      .filter(item => {
        // Enforce user visibility
        if (!canSeeAllHistory && item.userId !== user?.id) return false;
        
        // Match Search query
        const matchesSearch = 
          (item.nama || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.noKtpKk || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.keperluan || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.nomorSurat || '').toLowerCase().includes(search.toLowerCase());

        // Status Filter
        if (statusFilter === 'proses') return matchesSearch && item.status !== 'selesai';
        if (statusFilter === 'selesai') return matchesSearch && item.status === 'selesai';
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, search, statusFilter, canSeeAllHistory, user?.id]);

  const stats = useMemo(() => {
    const allowed = data.filter(d => canSeeAllHistory || d.userId === user?.id);
    const total = allowed.length;
    const proses = allowed.filter(d => d.status !== 'selesai').length;
    const selesai = allowed.filter(d => d.status === 'selesai').length;
    return { total, proses, selesai };
  }, [data, canSeeAllHistory, user?.id]);

  return (
    <div className="space-y-6 w-full h-full pb-10">
      <div className="flex flex-col xl:flex-row gap-6 w-full h-full">
        
        {/* LEFT MODULE Panel: List Overviews */}
        <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-4 bg-white border border-gray-100/80 rounded-2xl p-4 lg:p-5 shadow-xs">
        
        {/* Module Header Title */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
              <FileCheck className="w-5 h-5 text-teal-600" /> Pengajuan Surat Online
            </h3>
            <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">Pelayanan RT 01/RW 21</p>
          </div>
          {!isAdminOrPengurus && (
            <button
              onClick={() => {
                handleResetForm();
                setShowFormModal(true);
              }}
              className="bg-teal-600 text-white hover:bg-teal-700 px-3.5 py-2.5 rounded-xl text-xs font-black transition shadow-sm hover:shadow flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajukan Baru
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-black transition shadow-sm hover:shadow flex items-center gap-1 cursor-pointer"
              title="Ekspor pengajuan ke format Excel / CSV"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          )}
        </div>

        {/* Dynamic Card statistics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-2 border border-slate-100 rounded-xl">
          <div className="text-center p-2 rounded-lg bg-white shadow-3xs">
            <p className="text-[9px] text-slate-400 font-extrabold leading-tight">TOTAL</p>
            <p className="text-lg font-black text-slate-700 mt-0.5">{stats.total}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50/65 border border-amber-100/50">
            <p className="text-[9px] text-amber-600 font-extrabold leading-tight">PROSES</p>
            <p className="text-lg font-black text-amber-700 mt-0.5">{stats.proses}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-50/65 border border-emerald-100/50">
            <p className="text-[9px] text-emerald-600 font-extrabold leading-tight">SELESAI</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{stats.selesai}</p>
          </div>
        </div>

        {/* Filter Toolbar input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari warga, NIK, keperluan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 placeholder:text-slate-450 focus:border-teal-500 transition-all font-semibold"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-200/40 rounded-xl">
            {(['semua', 'proses', 'selesai'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg capitalize transition cursor-pointer ${statusFilter === mode ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/30'}`}
              >
                {mode === 'proses' ? 'Proses' : mode === 'selesai' ? 'Selesai' : 'Semua'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Lists Container */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 max-h-[460px] no-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-500" />
              <span>Memuat data pengajuan...</span>
            </div>
          ) : filteredList.length > 0 ? (
            filteredList.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isDone = item.status === 'selesai';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setEditingNomorSurat(item.nomorSurat || '');
                  }}
                  className={`relative p-3.5 border rounded-2xl text-left cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-teal-50/50 border-teal-500 shadow-xs ring-1 ring-teal-500/20' 
                      : 'bg-white hover:bg-slate-50/70 border-gray-150/60 shadow-3xs'
                  }`}
                >
                  {/* Status Tag Pill Left Edge Indicator */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl ${isDone ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                  <div className="pl-1.5 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-800 text-[13px] tracking-tight leading-snug line-clamp-1">
                        {item.nama || item.userName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase shrink-0 tracking-wider text-center border ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {item.status === 'selesai' ? 'Selesai' : 'Proses'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold line-clamp-1">
                      {item.mohonDibuatkan || item.keperluan || 'Surat Pengantar RT'}
                    </p>

                    <div className="pt-2 border-t border-slate-50 mt-1 flex justify-between items-center text-[9px] text-gray-400 font-semibold gap-2">
                      <span className="truncate">NIK: {item.noKtpKk || '-'}</span>
                      <span className="shrink-0">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">Tidak ada pengajuan</p>
              <p className="text-[10px] text-gray-400 mt-1 px-4">Ubah kriteria filter atau cari dengan nama warga lainnya.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MODULE PANEL: Document Preview Details & Tracking */}
      <div className="flex-1 bg-white border border-gray-100/85 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        {selectedItem ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            
            {/* Split Top Bar: Status Tracker Stepper Header */}
            <div className="bg-slate-50/50 border-b border-gray-100 p-4 shrink-0">
              <h4 className="text-xs font-extrabold text-slate-600 tracking-wider uppercase mb-3 text-center md:text-left flex items-center gap-1.5 justify-center md:justify-start">
                <Clock className="w-3.5 h-3.5 text-teal-600" fill="none" /> Lacak Log Progres Surat Anda
              </h4>
              
              {/* Responsive Tracker Stepper grid bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-3xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">✓</div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-teal-700 leading-none">Draft Diajukan</p>
                    <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 truncate">
                      Ttd Pemohon selesai
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition shadow-3xs ${selectedItem.status === 'selesai' ? 'bg-white border-gray-100' : 'bg-amber-50/40 border-amber-100'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${selectedItem.status === 'selesai' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                    {selectedItem.status === 'selesai' ? '✓' : '2'}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-extrabold leading-none ${selectedItem.status === 'selesai' ? 'text-teal-700' : 'text-amber-700'}`}>Klarifikasi RT</p>
                    <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 truncate">
                      {selectedItem.status === 'selesai' ? 'Disetujui Ketua RT' : 'Menunggu ttd RT'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex items-center gap-3 p-2.5 rounded-xl border shadow-3xs ${selectedItem.status === 'selesai' ? 'bg-teal-50/30 border-teal-100' : 'bg-white border-gray-100 opacity-60'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${selectedItem.status === 'selesai' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedItem.status === 'selesai' ? '✓' : '3'}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-extrabold leading-none ${selectedItem.status === 'selesai' ? 'text-teal-800' : 'text-slate-500'}`}>Dokumen Terbit</p>
                    <p className="text-[8.5px] text-slate-400 font-bold mt-0.5 truncate">
                      {selectedItem.status === 'selesai' ? 'Siap Unduh PDF' : 'Belum Terbit'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area: Elegant document sheet */}
            <div className="flex-grow p-4 lg:p-6 bg-slate-100/65 overflow-y-auto flex justify-center items-start">
              
              {/* Simulated Paper Sheets */}
              <div 
                className="w-full max-w-[580px] bg-white border border-slate-200 rounded-lg p-6 lg:p-10 shadow-md relative select-text"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a' }}
              >
                {/* Background Watermark/Aesthetics */}
                {selectedItem.status === 'selesai' ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-emerald-500/10 rounded-full flex items-center justify-center pointer-events-none select-none rotate-12">
                    <span className="text-emerald-500/10 text-xl font-bold font-sans tracking-widest leading-none uppercase text-center border-y-2 border-emerald-500/10 py-2 px-1">
                      DISUBMIT & SIGNED<br />RT 001 / RW 021
                    </span>
                  </div>
                ) : null}

                {/* Kop Surat Header */}
                <div className="flex items-center justify-between gap-4 font-sans pb-2 relative">
                  <div className="shrink-0">
                    <img 
                      src="/api/tangerang-logo-proxy" 
                      alt="Logo Kabupaten Tangerang" 
                      className="w-[56px] h-[64px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center flex-1 space-y-1 pr-6">
                    <h5 className="font-black text-[15px] text-black tracking-tight leading-none uppercase">
                      RUKUN TETANGGA 001/021
                    </h5>
                    <h6 className="font-bold text-[11px] text-black leading-none uppercase tracking-wide">
                      KELURAHAN KUTAJAYA KECAMATAN PASARKEMIS
                    </h6>
                    <p className="font-bold text-[11px] text-black leading-none uppercase tracking-wide">
                      KABUPATEN TANGERANG
                    </p>
                    <p className="text-[8px] text-black font-semibold tracking-wide leading-tight pt-0.5">
                      PERUM. WISMA GARDEN KEL. KUTAJAYA KEC. PASARKEMIS, KAB. TANGERANG
                    </p>
                  </div>
                  {/* Kop Lines divider built with layout precision */}
                  <div className="absolute left-0 right-0 -bottom-[1px]">
                    <div className="border-t-[2.5px] border-black"></div>
                    <div className="border-t-[0.8px] border-black mt-[1.5px]"></div>
                  </div>
                </div>

                {/* Document Title Block */}
                <div className="text-center mt-7 space-y-1 font-sans">
                  <h5 className="font-extrabold text-[13px] border-b border-black inline-block tracking-widest py-0.5 leading-none">
                    SURAT PENGANTAR
                  </h5>
                  <p className="text-[10px] text-slate-700 font-semibold tracking-wide">
                    Nomor : <span className="underline decoration-dotted">{selectedItem.nomorSurat || '_________________'}</span>
                  </p>
                </div>

                {/* Introduction Paragraph */}
                <div className="mt-6 text-[10px] leading-relaxed text-slate-800 text-justify font-sans">
                  Yang bertandatangan di bawah ini, Ketua RT 001 / RW 021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, dengan ini menerangkan bahwa:
                </div>

                {/* Table details list */}
                <div className="mt-5 space-y-2.5 text-[10px] font-sans pr-4">
                  {[
                    { label: "1. Nama", val: selectedItem.nama },
                    { label: "2. Tempat / Tanggal Lahir", val: `${selectedItem.tempatLahir || '-'}, ${selectedItem.tanggalLahir || '-'}` },
                    { label: "3. Status Perkawinan", val: selectedItem.statusPerkawinan },
                    { label: "4. Jenis Kelamin", val: selectedItem.jenisKelamin },
                    { label: "5. Agama", val: selectedItem.agama },
                    { label: "6. Pekerjaan", val: selectedItem.pekerjaan },
                    { label: "7. No. NIK KTP/KK", val: selectedItem.noKtpKk },
                    { label: "8. Alamat Sekarang", val: formatFullAddress(selectedItem.alamatSekarang) },
                    { label: "9. Alamat Asal", val: selectedItem.alamatAsal }
                  ].map((field, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-[145px] font-bold text-slate-800 shrink-0">{field.label}</div>
                      <div className="w-4 text-slate-800 font-bold shrink-0">:</div>
                      <div className="flex-1 text-slate-700 break-words font-medium leading-relaxed">{field.val || '-'}</div>
                    </div>
                  ))}
                </div>

                {/* Statement text */}
                <div className="mt-6 text-[10px] leading-relaxed text-slate-800 text-justify font-sans">
                  Benar bahwa nama tersebut diatas Warga/Penduduk di lingkungan RT001/RW021 Perumahan Wisma Garden Kelurahan Kutajaya Kecamatan Pasarkemis Kabupaten Tangerang, mohon kepada yang bersangkutan untuk dibuatkan:
                </div>

                {/* Requested Item */}
                <div className="mt-2 text-[10px] font-bold font-sans pl-4">
                  1. {selectedItem.mohonDibuatkan || selectedItem.keperluan || '-'}
                </div>

                {/* Thank statement */}
                <div className="mt-6 text-[10px] leading-relaxed text-slate-800 text-justify font-sans">
                  Demikian Surat Pengantar ini dibuat untuk bahan pertimbangan serta realisasinya sebagaimana mestinya.
                </div>

                {/* Signatures Column Grid */}
                <div className="mt-14 flex justify-between gap-10 font-sans text-[10px]">
                  
                  {/* Left Signature Column: Pemohon */}
                  <div className="text-center w-[160px] flex flex-col items-center">
                    <p className="font-bold text-slate-900 leading-none">Pemohon</p>
                    
                    {/* Pemohon Digital Signature Representation */}
                    <div className="h-[50px] w-full flex items-center justify-center my-1">
                      {selectedItem.signaturePemohon ? (
                        <img 
                          src={selectedItem.signaturePemohon} 
                          alt="Ttd Pemohon" 
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain mix-blend-multiply" 
                        />
                      ) : (
                        <div className="text-[8.5px] italic text-slate-350">TTD belum dibubuhkan</div>
                      )}
                    </div>
                    
                    <p className="font-bold text-slate-800 mt-[15px] border-b border-gray-300 px-1 inline-block">
                      ( {selectedItem.nama || '................................'} )
                    </p>
                  </div>

                  {/* Right Signature Column: Ketua RT */}
                  <div className="text-center w-[200px] flex flex-col items-center">
                    <p className="font-bold text-slate-900 leading-none">Mengetahui</p>
                    <p className="font-bold text-slate-900 leading-none mt-0.5">Ketua RT 001</p>
                    
                    {/* Ketua RT Digital Signature Representation */}
                    <div className="h-[50px] w-full flex items-center justify-center my-1 relative">
                      {selectedItem.signatureKetuaRt ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={selectedItem.signatureKetuaRt} 
                            alt="Ttd Ketua RT" 
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain mix-blend-multiply" 
                          />
                          {selectedItem.hasCap && (
                            <img
                              src="/caprt.png"
                              alt="Cap RT"
                              referrerPolicy="no-referrer"
                              className="absolute mix-blend-multiply pointer-events-none"
                              style={{
                                width: `${(selectedItem.capWidth ?? 40) * 1.5}px`,
                                height: `${(selectedItem.capHeight ?? (40 / 2.56)) * 1.5}px`,
                                left: `calc(50% - ${((selectedItem.capWidth ?? 40) * 1.5) / 2}px + ${(selectedItem.capPositionX ?? -15) * 1.5}px)`,
                                top: `calc(50% - ${((selectedItem.capHeight ?? (40 / 2.56)) * 1.5) / 2}px + ${(selectedItem.capPositionY ?? 2) * 1.5}px)`,
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-[8.5px] text-amber-600/70 border border-amber-200/50 bg-amber-50 rounded px-2.5 py-1 select-none font-bold">
                          Menunggu Persetujuan RT
                        </div>
                      )}
                    </div>
                    
                    <p className="font-bold text-slate-800 mt-[15px] border-b border-gray-300 px-1 inline-block">
                      ( Ketua RT 001 / RW 021 )
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* Sticky Action Footer Panel */}
            <div className="bg-slate-50 border-t border-gray-100 p-4 shrink-0 flex flex-wrap gap-3 items-center justify-between">
              
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Pengguna Aktif</span>
                <span className="text-xs font-black text-slate-700 capitalize mt-0.5">
                  {user.nama} ({user.role === 'admin' ? 'Ketua RT' : 'Warga'})
                </span>
              </div>

              <div className="flex gap-2.5">
                {/* RT Admin Sign Trigger Button */}
                {(user?.role === 'admin' || user?.role === 'sekretaris' || user?.role === 'developer') && selectedItem.status !== 'selesai' && (
                  <button
                    onClick={() => {
                      setFormSignatureRt('');
                      setSignStep(1);
                      setIsSignOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" /> Tandai Selesai + Ttd RT
                  </button>
                )}

                {/* Citizen download fully generated letter sheet */}
                {selectedItem.status === 'selesai' && (
                  <button
                    onClick={() => handleDownloadPDF(selectedItem)}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-3 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-100 hover:shadow-lg hover:shadow-teal-150 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Unduh Dokumen Resmi (PDF)
                  </button>
                )}

                {/* RT can delete finished letter */}
                {selectedItem.status === 'selesai' && (user?.role === 'admin' || user?.role === 'developer') && (
                  <button
                    onClick={() => handleDeleteLetter(selectedItem.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-3 text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-rose-100 hover:shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Surat
                  </button>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/25">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-350">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">Detail Pengajuan Belum Dipilih</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Pilih pengajuan surat di list samping kiri untuk memeriksa progres, kelengkapan data, dan membubuhkan persetujuan atau tanda tangan Ketua RT.</p>
          </div>
        )}
      </div>

      {/* CHIEF RT SIGNATURE DRAWER INLINE MODAL */}
      <AnimatePresence>
        {isSignOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSignOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto max-h-[92vh] max-w-md w-full z-10 relative p-6 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">Konfirmasi & Tanda Tangan Digital Ketua RT</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase mt-1">
                    Verifikasi Dokumen warga: <span className="text-teal-600">{selectedItem.nama}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsSignOpen(false)}
                  className="p-1.5 text-slate-450 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 select-none">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${signStep === 1 ? 'bg-teal-650 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  1. Tanda Tangan
                </span>
                <span className="text-slate-300 text-xs">➔</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${signStep === 2 ? 'bg-teal-650 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  2. Bubuhkan Cap RT
                </span>
              </div>

              {signStep === 1 ? (
                <div className="space-y-4">
                  {/* Editable Suggested Number Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Surat Pengantar (Bisa Diedit Manual)</label>
                    <input
                      type="text"
                      value={editingNomorSurat}
                      onChange={(e) => setEditingNomorSurat(e.target.value)}
                      placeholder="Ketik/sesuai format No Surat"
                      className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white font-mono text-slate-750 transition-all font-bold"
                    />
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                      Format standard: No/RT-01/RW-21/Bulan pembuatan/Tahun pembuatan. Nomor berurutan dibuat otomatis dari data server database.
                    </p>
                  </div>

                  {/* Digital Pad Signature */}
                  <div className="bg-slate-50/10 p-1 rounded-xl">
                    <SignatureCanvas 
                      label="Bubuhkan TTD Ketua RT 001" 
                      onSave={(dataUrl) => setFormSignatureRt(dataUrl)} 
                    />
                  </div>

                  {/* Quick checks warning */}
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/30 flex items-start gap-2.5 text-[10px] font-semibold text-teal-700">
                    <CheckSquare className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <p className="leading-relaxed">
                      Goreskan tanda tangan Anda pada kanvas di atas terlebih dahulu, kemudian klik tombol di bawah untuk melanjutkan ke pembubuhan Cap RT.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setIsSignOpen(false)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => setSignStep(2)}
                      disabled={!formSignatureRt}
                      className="flex-1 py-3 bg-teal-650 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Konfirmasi TTD & Lanjut ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Interactive Stamp Customizer */}
                  <div className="space-y-3.5 pt-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-750 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                        Atur Cap RT (Cap Basah)
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useCap}
                          onChange={(e) => setUseCap(e.target.checked)}
                          className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-[11px] font-extrabold text-slate-650">Gunakan Cap</span>
                      </label>
                    </div>

                    {useCap ? (
                      <>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">
                          Geser cap di bawah dengan cara menyeret (drag) langsung pada gambar atau gunakan slider kontrol untuk posisi yang presisi.
                        </p>

                        {/* Interactive Drag Frame */}
                        <div className="relative w-full h-[150px] bg-slate-900/[0.02] border border-slate-200/80 rounded-xl overflow-hidden flex items-center justify-center select-none shadow-inner">
                          <div className="absolute inset-0 flex flex-col justify-between p-2.5 pointer-events-none text-center">
                            <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest">Preview Area TTD + Cap</span>
                            <span className="text-[9px] font-black text-slate-300 border-t border-dashed border-slate-200 pt-1">MENGETAHUI KETUA RT 001</span>
                          </div>

                          {/* Signature & Stamp Group Wrapper */}
                          <div className="relative w-[180px] h-[90px] border border-dashed border-slate-200/80 bg-white flex items-center justify-center">
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
                                width: `${capSize * 2}px`,
                                height: `${(capSize / 2.56) * 2}px`,
                                left: `calc(50% - ${(capSize * 2) / 2}px + ${capX * 2}px)`,
                                top: `calc(50% - ${((capSize / 2.56) * 2) / 2}px + ${capY * 2}px)`,
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
                                  const deltaX = (moveEvent.clientX - startX) / 2;
                                  const deltaY = (moveEvent.clientY - startY) / 2;
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
                                  const deltaX = (moveEvent.touches[0].clientX - startX) / 2;
                                  const deltaY = (moveEvent.touches[0].clientY - startY) / 2;
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
                              <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors flex items-center justify-center rounded-full">
                                <span className="text-[8px] text-rose-550 font-black bg-white/90 px-1 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  DRAG
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Accurate Fine-tuning Controls */}
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
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
                              <span>Ukuran Diameter Cap</span>
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
                      <div className="p-5 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-500 font-bold select-none">
                        Cap basah ditiadakan. Surat pengantar hanya dibubuhkan tanda tangan Ketua RT saja.
                      </div>
                    )}
                  </div>

                  {/* Quick checks warning */}
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/30 flex items-start gap-2.5 text-[10px] font-semibold text-teal-700">
                    <CheckSquare className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <p className="leading-relaxed">
                      Pastikan posisi cap dan tanda tangan di preview box sudah sesuai. Klik tombol konfirmasi untuk menyelesaikan dan menerbitkan surat.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setSignStep(1)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      ⬅ Kembali ke TTD
                    </button>
                    <button
                      onClick={handleRtApprove}
                      className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* CITIZEN DIALOG SUBMISSION MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden max-w-lg w-full z-10 relative p-6 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start shrink-0 pb-3 border-b border-gray-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">Formulir Pengajuan Surat Pengantar RT</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Langkah {formStep} dari 3 permohonan digital</p>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body - scrollable */}
              <div className="flex-grow overflow-y-auto py-4 pr-1 space-y-4 max-h-[60vh] text-left no-scrollbar">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span>⚠️ {formError}</span>
                  </div>
                )}

                {/* Progress bullets */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[10px] font-bold text-gray-400">
                  <span className={formStep === 1 ? 'text-teal-600' : ''}>1. IDENTITAS MANDIRI</span>
                  <span className="text-slate-250">➔</span>
                  <span className={formStep === 2 ? 'text-teal-600' : ''}>2. STATUS & ALAMAT</span>
                  <span className="text-slate-250">➔</span>
                  <span className={formStep === 3 ? 'text-teal-600' : ''}>3. KEPERLUAN & VERIFIKASI TTD</span>
                </div>

                {/* Form Step 1 */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Sesuai KTP</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Muhammad Adji Prasetyo"
                        value={formNama} 
                        onChange={e => setFormNama(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No NIK KTP / KK</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masukkan 16 digit Nomor Induk Kependudukan"
                        value={formNoKtpKk} 
                        onChange={e => setFormNoKtpKk(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Contoh: Tangerang"
                          value={formTempatLahir} 
                          onChange={e => setFormTempatLahir(e.target.value)} 
                          className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                        <input 
                          type="date" 
                          required
                          value={formTanggalLahir} 
                          onChange={e => setFormTanggalLahir(e.target.value)} 
                          className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Laki-laki', 'Perempuan'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormJenisKelamin(g)}
                            className={`py-3 text-xs font-bold rounded-xl border transition cursor-pointer ${formJenisKelamin === g ? 'bg-teal-50 text-teal-700 border-teal-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Step 2 */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan</label>
                        <select
                          value={formStatusPerkawinan}
                          onChange={e => setFormStatusPerkawinan(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold"
                        >
                          <option value="Belum Kawin">Belum Kawin</option>
                          <option value="Kawin">Kawin</option>
                          <option value="Cerai Hidup">Cerai Hidup</option>
                          <option value="Cerai Mati">Cerai Mati</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
                        <select
                          value={formAgama}
                          onChange={e => setFormAgama(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold"
                        >
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan saat ini</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Karyawan Swasta, Ibu Rumah Tangga"
                        value={formPekerjaan} 
                        onChange={e => setFormPekerjaan(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Sekarang Domisili</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Alamat lengkap tempat tinggal saat ini"
                        value={formAlamatSekarang} 
                        onChange={e => setFormAlamatSekarang(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition resize-none font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">Alamat Asal (Sesuai KTP)</label>
                        <button
                          type="button"
                          onClick={handleCopyAlamat}
                          className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded transition cursor-pointer"
                        >
                          Sama dengan Alamat Sekarang
                        </button>
                      </div>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Alamat asal tertulis di kartu tanda penduduk"
                        value={formAlamatAsal} 
                        onChange={e => setFormAlamatAsal(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition resize-none font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Form Step 3 */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Pembuatan Surat</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Surat Pengantar Pembuatan KTP Baru"
                        value={formMohonDibuatkan} 
                        onChange={e => setFormMohonDibuatkan(e.target.value)} 
                        className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition font-medium"
                      />
                    </div>

                    {/* Signature pad for citizen applicant */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                      <SignatureCanvas 
                        label="Tanda Tangan Pemohon" 
                        onSave={(dataUrl) => setFormSignaturePemohon(dataUrl)} 
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons in footer */}
              <div className="shrink-0 pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                {formStep > 1 ? (
                  <button
                    onClick={handlePrevStep}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition cursor-pointer"
                  >
                    Kembali
                  </button>
                ) : (
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                )}

                {formStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer ml-auto"
                  >
                    Selanjutnya ➔
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitForm}
                    disabled={submitting}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    {submitting && (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Kirim & Ajukan Surat
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Ready Download Modal */}
      <AnimatePresence>
        {pdfPreviewUrl && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full z-10 relative p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Dokumen PDF Siap</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Jika pengunduhan otomatis gagal, silakan gunakan tombol di bawah ini.</p>
                </div>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-[300px] sm:min-h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <iframe src={`${pdfPreviewUrl}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
              </div>

              <div className="flex justify-end gap-3 pt-2 shrink-0">
                <a 
                  href={pdfPreviewUrl} 
                  download={pdfFileName}
                  className="flex-1 sm:flex-none px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition text-center cursor-pointer"
                >
                  Unduh Dokumen Sekarang
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>

      {/* Table of letters for Ketua RT and Sekretaris */}
      {(user?.role === 'admin' || user?.role === 'sekretaris' || user?.role === 'developer') && (
        <div className="bg-white border border-gray-150/60 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                Daftar Seluruh Pengajuan Surat (Ketua RT & Sekretaris)
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Pantau seluruh surat pengantar warga yang sedang diajukan maupun yang telah selesai ditandatangani.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-700 font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Akses Khusus Pengurus
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table 1: Sedang Diajukan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                  Sedang Diajukan ({data.filter(d => d.status !== 'selesai').length})
                </h4>
              </div>
              
              <div className="overflow-x-auto border border-gray-100 rounded-xl no-scrollbar bg-slate-50/30">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-gray-150/60">
                      <th className="p-3 pl-4">Warga / NIK</th>
                      <th className="p-3">Keperluan</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {data.filter(d => d.status !== 'selesai').length > 0 ? (
                      data.filter(d => d.status !== 'selesai').map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="font-extrabold text-slate-800">{item.nama || item.userName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.noKtpKk || '-'}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-600 font-bold line-clamp-1">{item.mohonDibuatkan || item.keperluan || 'Surat Pengantar RT'}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setEditingNomorSurat(item.nomorSurat || '');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-lg transition-colors shadow-2xs cursor-pointer"
                            >
                              Tinjau & Ttd
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-450 font-bold italic">
                          Tidak ada surat yang sedang diajukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Selesai Dibuatkan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Selesai Dibuatkan ({data.filter(d => d.status === 'selesai').length})
                </h4>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-xl no-scrollbar bg-slate-50/30">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-gray-150/60">
                      <th className="p-3 pl-4">No. Surat / Nama</th>
                      <th className="p-3">Keperluan</th>
                      <th className="p-3 text-right">Berkas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {data.filter(d => d.status === 'selesai').length > 0 ? (
                      data.filter(d => d.status === 'selesai').map((item) => (
                        <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded inline-block mb-1 font-mono font-bold">
                              {item.nomorSurat || 'Selesai'}
                            </div>
                            <div className="font-extrabold text-slate-800">{item.nama || item.userName}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-600 font-bold line-clamp-1">{item.mohonDibuatkan || item.keperluan || 'Surat Pengantar RT'}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                              Selesai: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditingNomorSurat(item.nomorSurat || '');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer"
                                title="Tampilkan Preview"
                              >
                                Tinjau
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(item)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Unduh PDF Resmi"
                              >
                                <Download className="w-3 h-3" /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-450 font-bold italic">
                          Belum ada surat yang selesai dibuatkan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
