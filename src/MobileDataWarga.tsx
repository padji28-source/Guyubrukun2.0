import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

// Icon Set - Diperbarui dan ditambah beberapa icon untuk mendukung UI baru
const icons = {
  search: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  lainnya: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  edit: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  delete: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  sparkles: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4M4 19h4m13-4v4m-2-2h4m-5-9V5m-2 2h4M9 12a3 3 0 116 0 3 3 0 01-6 0z" /></svg>,
  document: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  users: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  eye: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  upload: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
};

// Client-side helper to extract No. KK from document preview/base64
function extractNoKkFromDoc(kkDoc: string): string | null {
  if (!kkDoc || typeof kkDoc !== 'string') return null;
  const s = kkDoc.trim();
  if (!s) return null;

  if (s.startsWith('data:image/svg+xml') || s.includes('<svg')) {
    let svgText = s;
    if (s.startsWith('data:image/svg+xml')) {
      const base64Part = s.split(',')[1] || '';
      try {
        svgText = s.includes(';base64,')
          ? atob(base64Part)
          : decodeURIComponent(base64Part);
      } catch {}
    }
    const svgMatch = svgText.match(/No\.?\s*KK\s*:?\s*([0-9\s]{12,20})/i) ||
                     svgText.match(/NOMOR\s*:?\s*([0-9\s]{12,20})/i) ||
                     svgText.match(/>\s*No\.?\s*KK\s*:\s*([0-9]{12,18})\s*</i) ||
                     svgText.match(/>\s*([1-9][0-9]{15})\s*</);
    if (svgMatch && svgMatch[1]) {
      const clean = svgMatch[1].replace(/\D/g, '');
      if (clean.length >= 12 && clean.length <= 18) return clean;
    }
  }

  const textMatch = s.match(/(?:No\.?\s*KK|NOMOR\s*KARTU\s*KELUARGA|No\.?\s*Kartu\s*Keluarga|NOMOR\s*KK|No\.\s*KK)\s*[:.]?\s*([0-9\s]{12,22})/i);
  if (textMatch && textMatch[1]) {
    const clean = textMatch[1].replace(/\D/g, '');
    if (clean.length >= 12 && clean.length <= 18) return clean;
  }

  const digit16Match = s.match(/\b([1-9][0-9]{15})\b/);
  if (digit16Match && digit16Match[1]) return digit16Match[1];

  return null;
}

// Helper to resolve No. KK from citizen object or document fallback
const getResolvedNoKk = (w: any): string => {
  if (w?.noKk && String(w.noKk).trim() !== '') return String(w.noKk).trim();
  if (w?.dokumenKk) {
    const extracted = extractNoKkFromDoc(String(w.dokumenKk));
    if (extracted) return extracted;
  }
  return '';
};

let cachedDataWarga: any[] | null = null;
let cachedAllWargaFull: any[] | null = null;

export const MobileDataWarga = ({ onBack, currentUser }: { onBack: () => void, currentUser: any }) => {
  const isDeveloper = currentUser?.role === 'developer';
  const isKetuaRT = currentUser?.role === 'admin' || isDeveloper;
  const isSekretaris = currentUser?.role === 'sekretaris';
  const isPrivilegedKkViewer = isKetuaRT || isSekretaris;
  const isAdmin = isKetuaRT;

  // Sub-menu state inside Data Warga: 'direktori' vs 'dokumen_kk' (Hanya Ketua RT & Sekretaris yang dapat mengakses 'dokumen_kk')
  const [activeSubMenu, setActiveSubMenu] = useState<'direktori' | 'dokumen_kk'>('direktori');

  const [wargaData, setWargaData] = useState<any[]>(cachedDataWarga || []);
  const [allWargaFullData, setAllWargaFullData] = useState<any[]>(cachedAllWargaFull || []);
  const [allWargaKkData, setAllWargaKkData] = useState<any[]>([]);
  const [loadingKkMenu, setLoadingKkMenu] = useState(false);
  const [kkFilterStatus, setKkFilterStatus] = useState<'terupload' | 'semua' | 'belum'>('terupload');
  const [kkSearchQuery, setKkSearchQuery] = useState('');
  const [kkFilterBlok, setKkFilterBlok] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Forms states
  const [showAddWarga, setShowAddWarga] = useState(false);
  const [newWarga, setNewWarga] = useState({ username: '', nama: '', password: '', noHp: '', status: '', umur: '', tglLahir: '', jenisKelamin: 'Laki-laki', role: 'warga', noKk: '', dokumenKk: '', dokumenKtp: [] as string[] });
  const [newWargaBlok, setNewWargaBlok] = useState('');
  const [newWargaNomor, setNewWargaNomor] = useState('');
  const [uploadingDocWargaId, setUploadingDocWargaId] = useState<string | null>(null);
  const [docStatusMessage, setDocStatusMessage] = useState<string>('');
  const [docErrorMessage, setDocErrorMessage] = useState<string>('');
  const [lastExtractedInfo, setLastExtractedInfo] = useState<{ wargaName: string; addedMembers: any[]; message: string } | null>(null);

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [activeWargaId, setActiveWargaId] = useState('');
  const [memberForm, setMemberForm] = useState({ name: '', role: '', age: '', tglLahir: '', jenisKelamin: 'Laki-laki' });
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk klik kategori usia (Balita, Anak, Remaja, Dewasa) bagi semua peran
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<'balita' | 'anak' | 'remaja' | 'dewasa' | null>(null);
  const [ageCategorySearch, setAgeCategorySearch] = useState('');
  const [ageCategoryGenderFilter, setAgeCategoryGenderFilter] = useState<'semua' | 'Laki-laki' | 'Perempuan'>('semua');

  const showStatusBanner = (msg: string, isError = false) => {
    if (isError) {
      setDocErrorMessage(msg);
      setDocStatusMessage('');
      setTimeout(() => setDocErrorMessage(''), 5000);
    } else {
      setDocStatusMessage(msg);
      setDocErrorMessage('');
      setTimeout(() => setDocStatusMessage(''), 5000);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
  };

  const handleTglLahirMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tgl = e.target.value;
    setMemberForm({ ...memberForm, tglLahir: tgl, age: calculateAge(tgl) });
  };

  const [filterBlok, setFilterBlok] = useState('');
  const [filterAgeCategory, setFilterAgeCategory] = useState<'' | 'balita' | 'anak' | 'remaja' | 'dewasa' | 'lansia'>('');
  const [previewDocs, setPreviewDocs] = useState<{ docs: { url: string; title: string }[]; currentIndex: number; wargaName: string } | null>(null);
  const [previewPhotoWarga, setPreviewPhotoWarga] = useState<any | null>(null);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchWarga = async () => {
    try {
      const res = await apiFetch(`/api/warga?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearchQuery)}`);
      const data = await res.json();
      if (data.pagination) {
        cachedDataWarga = data.users || [];
        setWargaData(cachedDataWarga!);
        setTotalPages(data.pagination.pages || 1);
        setTotalElements(data.pagination.total || 0);
      } else {
        cachedDataWarga = data.users || [];
        setWargaData(cachedDataWarga!);
        setTotalPages(1);
        setTotalElements(cachedDataWarga!.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllWargaFull = async () => {
    try {
      const res = await apiFetch('/api/warga?limit=0&summary=1');
      if (res.ok) {
        const data = await res.json();
        const list = data.users || [];
        cachedAllWargaFull = list;
        setAllWargaFullData(list);
      }
    } catch (e) {
      console.error('Gagal memuat seluruh data warga untuk demografi:', e);
    }
  };

  const fetchAllKkWargaForKetuaRT = async () => {
    if (!isPrivilegedKkViewer) return;
    setLoadingKkMenu(true);
    try {
      const res = await apiFetch('/api/warga-dokumen-kk');
      if (res.ok) {
        const data = await res.json();
        setAllWargaKkData(data.users || []);
      }
    } catch (e) {
      console.error('Gagal memuat data dokumen KK:', e);
    } finally {
      setLoadingKkMenu(false);
    }
  };

  useEffect(() => {
    fetchWarga();
  }, [page, limit, debouncedSearchQuery]);

  useEffect(() => {
    fetchAllWargaFull();
    if (isPrivilegedKkViewer) {
      fetchAllKkWargaForKetuaRT();
    }
  }, [isPrivilegedKkViewer, activeSubMenu]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail === 'users' || e.detail === 'online_status') {
        fetchWarga();
        fetchAllWargaFull();
        if (isPrivilegedKkViewer) {
          fetchAllKkWargaForKetuaRT();
        }
      }
    };
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, [page, limit, debouncedSearchQuery, isPrivilegedKkViewer]);

  const processFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 12 * 1024 * 1024) {
        reject(new Error('Ukuran file maksimal 12MB'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
          resolve(result);
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 2000;
            let width = img.width;
            let height = img.height;
            if (width > height && width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else if (height >= width && height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.9));
            } else {
              resolve(result);
            }
          } catch {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadWargaDoc = async (warga: any, type: 'kk' | 'ktp', e: React.ChangeEvent<HTMLInputElement>, autoExtractAfterUpload = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const isSelf = Boolean(
      currentUser &&
        ((currentUser.id && String(warga?.id) === String(currentUser.id)) ||
          (currentUser.username &&
            String(warga?.username || '').toLowerCase() === String(currentUser.username).toLowerCase()))
    );
    if (!isKetuaRT && !isSelf) {
      showStatusBanner('Akses ditolak: Hanya Ketua RT yang dapat memperbarui dokumen warga lain.', true);
      e.target.value = '';
      return;
    }
    setUploadingDocWargaId(warga.id);
    try {
      const existingKtp = Array.isArray(warga.dokumenKtp)
        ? warga.dokumenKtp
        : warga.dokumenKtp
        ? [warga.dokumenKtp]
        : [];

      let payload: any = {};
      let uploadedKkDataUrl = '';
      if (type === 'kk') {
        uploadedKkDataUrl = await processFileToBase64(files[0]);
        payload = { dokumenKk: uploadedKkDataUrl };
      } else {
        const newKtps: string[] = [];
        for (let i = 0; i < files.length; i++) {
          newKtps.push(await processFileToBase64(files[i]));
        }
        payload = { dokumenKtp: [...existingKtp, ...newKtps] };
      }

      const res = await apiFetch(`/api/warga/${warga.id}/dokumen`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showStatusBanner(`Dokumen ${type.toUpperCase()} untuk ${warga.nama} berhasil diunggah!`);
        await fetchWarga();
        if (isKetuaRT) {
          await fetchAllKkWargaForKetuaRT();
        }
        if (autoExtractAfterUpload && isKetuaRT && type === 'kk' && uploadedKkDataUrl) {
          await handleExtractKK(warga.id, uploadedKkDataUrl, warga.nama);
        }
      } else {
        showStatusBanner(data.error || 'Gagal mengunggah dokumen', true);
      }
    } catch (err: any) {
      console.error(err);
      showStatusBanner(err?.message || 'Gagal memproses file dokumen', true);
    } finally {
      setUploadingDocWargaId(null);
      e.target.value = '';
    }
  };

  const handleDeleteKkDoc = async (warga: any) => {
    const isSelf = Boolean(
      currentUser &&
        ((currentUser.id && String(warga?.id) === String(currentUser.id)) ||
          (currentUser.username &&
            String(warga?.username || '').toLowerCase() === String(currentUser.username).toLowerCase()))
    );
    if (!isKetuaRT && !isSelf) {
      showStatusBanner('Akses ditolak: Hanya Ketua RT yang dapat menghapus dokumen warga lain.', true);
      return;
    }
    setUploadingDocWargaId(warga.id);
    try {
      const res = await apiFetch(`/api/warga/${warga.id}/dokumen`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokumenKk: '' })
      });
      if (res.ok) {
        showStatusBanner(`Dokumen KK untuk ${warga.nama} telah dihapus.`);
        fetchWarga();
        if (isKetuaRT) {
          fetchAllKkWargaForKetuaRT();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDocWargaId(null);
    }
  };

  const handleAddWarga = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Duplikat Blok & No Rumah sebelum submit
    if (newWargaBlok && newWargaNomor) {
      const targetBlok = newWargaBlok.trim().toUpperCase();
      const rawNo = newWargaNomor.trim().toUpperCase();
      const isPureNum = /^\d+$/.test(rawNo);
      const normNo = isPureNum ? String(parseInt(rawNo, 10)) : rawNo;

      const fullList = allWargaFullData.length > 0 ? allWargaFullData : wargaData;
      const duplicateWarga = fullList.find((w: any) => {
        const info = parseHouseInfo(w);
        if (!info || !info.blok || !info.nomor) return false;
        const wRawNo = info.nomor.trim().toUpperCase();
        const wNormNo = /^\d+$/.test(wRawNo) ? String(parseInt(wRawNo, 10)) : wRawNo;
        return info.blok === targetBlok && wNormNo === normNo;
      });

      if (duplicateWarga) {
        showStatusBanner(`Blok ${targetBlok} No. ${newWargaNomor} sudah terdaftar atas nama ${duplicateWarga.nama || duplicateWarga.username}. Setiap rumah hanya dapat didaftarkan satu akun kepala keluarga.`, true);
        return;
      }
    }

    try {
      const alamat = `Blok ${newWargaBlok} No. ${newWargaNomor}`;
      const rtValue = localStorage.getItem('selected_rt') || 'rt01';
      const displayRt = rtValue.toUpperCase().replace('RT', 'RT ');
      const res = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWarga,
          isApproved: true,
          alamat,
          rt: displayRt
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showStatusBanner(data.error || 'Gagal menambahkan warga baru', true);
        return;
      }
      setShowAddWarga(false);
      setNewWarga({ username: '', nama: '', password: '', noHp: '', status: '', umur: '', tglLahir: '', jenisKelamin: 'Laki-laki', role: 'warga', noKk: '', dokumenKk: '', dokumenKtp: [] });
      setNewWargaBlok('');
      setNewWargaNomor('');
      showStatusBanner('Warga / Pengurus baru berhasil ditambahkan!');
      fetchWarga();
      fetchAllWargaFull();
      if (isKetuaRT) {
        fetchAllKkWargaForKetuaRT();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWargaId) {
      showStatusBanner('Pilih data warga terlebih dahulu.', true);
      return;
    }
    if (!memberForm.name.trim()) {
      showStatusBanner('Nama anggota keluarga wajib diisi.', true);
      return;
    }

    setIsSavingMember(true);
    try {
      let res;
      if (editingMember) {
        const memberId = editingMember.id || editingMember._id || editingMember.name;
        res = await apiFetch(`/api/warga/${encodeURIComponent(activeWargaId)}/members/${encodeURIComponent(memberId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: memberForm.name.trim(),
            role: memberForm.role || 'Anggota',
            age: Number(memberForm.age) || 0,
            tglLahir: memberForm.tglLahir || '',
            jenisKelamin: memberForm.jenisKelamin || (memberForm.role === 'Istri' ? 'Perempuan' : 'Laki-laki')
          })
        });
      } else {
        res = await apiFetch(`/api/warga/${encodeURIComponent(activeWargaId)}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: memberForm.name.trim(),
            role: memberForm.role || 'Anggota',
            age: Number(memberForm.age) || 0,
            tglLahir: memberForm.tglLahir || '',
            jenisKelamin: memberForm.jenisKelamin || (memberForm.role === 'Istri' ? 'Perempuan' : 'Laki-laki')
          })
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowMemberForm(false);
        setEditingMember(null);
        setMemberForm({ name: '', role: '', age: '', tglLahir: '', jenisKelamin: 'Laki-laki' });
        showStatusBanner(editingMember ? 'Data anggota keluarga berhasil diperbarui!' : 'Anggota keluarga baru berhasil ditambahkan!');
        fetchWarga();
        fetchAllWargaFull();
        if (isKetuaRT) {
          fetchAllKkWargaForKetuaRT();
        }
      } else {
        showStatusBanner(data.error || 'Gagal menyimpan data anggota keluarga.', true);
      }
    } catch (e: any) {
      console.error("Gagal menyimpan anggota keluarga:", e);
      showStatusBanner(e?.message || 'Terjadi kesalahan saat menyimpan data anggota keluarga.', true);
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleDeleteMember = async (wargaId: string, memberId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus anggota keluarga ini?')) return;
    try {
      const res = await apiFetch(`/api/warga/${encodeURIComponent(wargaId)}/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowMemberForm(false);
        setEditingMember(null);
        showStatusBanner('Data anggota keluarga berhasil dihapus.');
        fetchWarga();
        fetchAllWargaFull();
        if (isKetuaRT) {
          fetchAllKkWargaForKetuaRT();
        }
      } else {
        showStatusBanner(data.error || 'Gagal menghapus anggota keluarga.', true);
      }
    } catch (e: any) {
      console.error("Gagal menghapus anggota keluarga:", e);
      showStatusBanner(e?.message || 'Terjadi kesalahan saat menghapus anggota keluarga.', true);
    }
  };

  // Server-side AI Extract KK handler (Khusus Ketua RT)
  const handleExtractKK = async (wargaId: string, customKkData?: string, fallbackName?: string) => {
    if (!isKetuaRT) {
      showStatusBanner('Akses ditolak: Fitur AI Extract KK hanya dapat digunakan oleh Ketua RT.', true);
      return;
    }
    setExtractingId(wargaId);
    setLastExtractedInfo(null);
    try {
      const targetUser =
        wargaData.find(w => w.id === wargaId) ||
        allWargaKkData.find(w => w.id === wargaId);

      const hasKk = Boolean(customKkData || targetUser?.dokumenKk);
      if (!hasKk) {
        showStatusBanner('Warga ini belum mengunggah Kartu Keluarga (KK). Silakan upload KK terlebih dahulu.', true);
        setExtractingId(null);
        return;
      }

      const res = await apiFetch(`/api/warga/${wargaId}/extract-kk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customKkData ? { dokumenKk: customKkData } : {})
      });

      const data = await res.json();
      if (!res.ok) {
        showStatusBanner(data.error || 'Gagal mengekstrak data dari Kartu Keluarga.', true);
        return;
      }

      const wargaName = data.user?.nama || targetUser?.nama || fallbackName || 'Warga';
      if (data.user) {
        setWargaData(prev => prev.map(w => (w.id === wargaId ? { ...w, ...data.user } : w)));
        setAllWargaKkData(prev =>
          prev.map(w => (w.id === wargaId ? { ...w, ...data.user, hasKk: Boolean(data.user.dokumenKk) } : w))
        );
      }
      setExpandedId(wargaId);
      showStatusBanner(data.message || `Berhasil mengekstrak data KK ${wargaName}!`);
      setLastExtractedInfo({
        wargaName,
        addedMembers: data.addedMembers || data.user?.members || [],
        message: data.message || `Ekstraksi KK selesai.`
      });

      await fetchWarga();
      if (isKetuaRT) {
        await fetchAllKkWargaForKetuaRT();
      }
    } catch (e: any) {
      console.error('Extraction error:', e);
      showStatusBanner('Terjadi kesalahan jaringan saat mengekstrak data dari KK.', true);
    } finally {
      setExtractingId(null);
    }
  };

  // Helper inferensi Jenis Kelamin & Tanggal Lahir untuk Data Warga
  const inferJenisKelamin = (name: string, role?: string, explicitJk?: string): 'Laki-laki' | 'Perempuan' => {
    const jk = String(explicitJk || '').trim().toLowerCase();
    if (jk === 'perempuan' || jk === 'p' || jk === 'wanita') return 'Perempuan';
    if (jk === 'laki-laki' || jk === 'l' || jk === 'pria') return 'Laki-laki';

    const r = String(role || '').trim().toLowerCase();
    if (r === 'istri' || r === 'ibu') return 'Perempuan';
    if (r === 'suami' || r === 'ayah') return 'Laki-laki';

    const femalePattern = /(\bny\.|\bibu\b|\bhj\.|\bsiti\b|\bsri\b|\bayu\b|\bdewi\b|\bputri\b|\bnabila\b|\baisyah\b|\bzahra\b|\bfitri\b|\brina\b|\bani\b|\bwulan\b|\bindah\b|\blestari\b|\bratna\b|\bbunga\b|\bcitra\b|\bdian\b|\beka\b|\bintan\b|\bkartika\b|\bmaya\b|\bmelati\b|\bnadia\b|\bnur\b|\brahma\b|\brani\b|\brizka\b|\bsalma\b|\bsari\b|\btiara\b|\bvina\b|\byuli\b|\byuni\b|\bannisa\b|\bnurul\b)/i;
    if (femalePattern.test(name || '')) return 'Perempuan';
    return 'Laki-laki';
  };

  const formatTanggalLahirWarga = (rawDob?: string, age?: number): string => {
    const dob = String(rawDob || '').trim();
    if (dob) {
      // Cek format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        const dt = new Date(dob);
        if (!isNaN(dt.getTime())) {
          return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        }
      }
      return dob;
    }
    if (typeof age === 'number' && age >= 0) {
      const estYear = new Date().getFullYear() - age;
      return `Tahun ${estYear}`;
    }
    return '-';
  };

  // Kumpulan seluruh individu warga (Kepala Keluarga + Anggota Keluarga) dari Data Warga
  const isOwnAccount = (w: any) =>
    Boolean(
      currentUser &&
        ((currentUser.id && String(w?.id) === String(currentUser.id)) ||
          (currentUser.username &&
            String(w?.username || '').toLowerCase() === String(currentUser.username).toLowerCase()))
    );

  const allPersonsList = useMemo(() => {
    const rawSource =
      allWargaKkData.length > 0
        ? allWargaKkData
        : allWargaFullData.length > 0
        ? allWargaFullData
        : wargaData;
    // Demografi Usia Warga menampilkan seluruh warga RT (untuk Ketua RT, Bendahara, Pengurus, Sekretaris, dan Warga)
    const sourceList = rawSource.filter(w => w.role !== 'developer');
    const persons: Array<{
      id: string;
      wargaId: string;
      isHead: boolean;
      nama: string;
      hubungan: string;
      kepalaKeluarga: string;
      wargaObj: any;
      memberObj?: any;
      blokFormatted: string;
      blokShort: string;
      jenisKelamin: 'Laki-laki' | 'Perempuan';
      tglLahirRaw: string;
      tglLahirFormatted: string;
      umur: number;
      category: 'balita' | 'anak' | 'remaja' | 'dewasa';
    }> = [];

    const resolveAge = (rawAge: any, rawDob?: string): number => {
      if (rawDob && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDob).trim())) {
        const diff = Date.now() - new Date(String(rawDob).trim()).getTime();
        if (!isNaN(diff) && diff > 0) {
          return Math.max(0, Math.abs(new Date(diff).getUTCFullYear() - 1970));
        }
      }
      const parsed = parseInt(String(rawAge ?? '').replace(/\D/g, '') || '-1', 10);
      return isNaN(parsed) ? -1 : parsed;
    };

    const getCat = (age: number): 'balita' | 'anak' | 'remaja' | 'dewasa' => {
      if (age <= 4) return 'balita';
      if (age <= 12) return 'anak';
      if (age <= 20) return 'remaja';
      return 'dewasa';
    };

    sourceList.forEach(w => {
      const headAge = resolveAge(w.umur, w.tglLahir);
      const alamatStr = String(w?.alamat || '').trim();
      const m1 = alamatStr.match(/Blok\s*([a-zA-Z0-9]+)\s*(?:No\.?|Nomor|\/|-)?\s*([a-zA-Z0-9]+)?/i);
      const blokFormatted = m1 && m1[1]
        ? (m1[2] ? `Blok ${m1[1].toUpperCase()} • No. ${m1[2].toUpperCase()}` : `Blok ${m1[1].toUpperCase()}`)
        : (alamatStr || 'Alamat Belum Diisi');
      const blokShort = m1 && m1[1]
        ? (m1[2] ? `${m1[1].toUpperCase()}-${m1[2].toUpperCase()}` : m1[1].toUpperCase())
        : '-';

      if (headAge >= 0) {
        persons.push({
          id: `kk_${w.id}`,
          wargaId: w.id,
          isHead: true,
          nama: w.nama || 'Warga',
          hubungan: 'Kepala Keluarga',
          kepalaKeluarga: w.nama || 'Warga',
          wargaObj: w,
          blokFormatted,
          blokShort,
          jenisKelamin: inferJenisKelamin(w.nama, 'Kepala Keluarga', w.jenisKelamin),
          tglLahirRaw: w.tglLahir || '',
          tglLahirFormatted: formatTanggalLahirWarga(w.tglLahir, headAge),
          umur: headAge,
          category: getCat(headAge)
        });
      }

      if (Array.isArray(w.members)) {
        w.members.forEach((m: any, mIdx: number) => {
          const mAge = resolveAge(m.age, m.tglLahir);
          if (mAge >= 0) {
            persons.push({
              id: `mem_${w.id}_${m.id || m._id || mIdx}`,
              wargaId: w.id,
              isHead: false,
              nama: m.name || 'Anggota Keluarga',
              hubungan: m.role || 'Anggota',
              kepalaKeluarga: w.nama || 'Warga',
              wargaObj: w,
              memberObj: m,
              blokFormatted,
              blokShort,
              jenisKelamin: inferJenisKelamin(m.name, m.role, m.jenisKelamin),
              tglLahirRaw: m.tglLahir || '',
              tglLahirFormatted: formatTanggalLahirWarga(m.tglLahir, mAge),
              umur: mAge,
              category: getCat(mAge)
            });
          }
        });
      }
    });

    return persons;
  }, [wargaData, allWargaFullData, allWargaKkData, isKetuaRT]);

  const allAges = useMemo(() => allPersonsList.map(p => p.umur), [allPersonsList]);

  const filteredSelectedAgePersons = useMemo(() => {
    if (!selectedAgeCategory) return [];
    return allPersonsList
      .filter(p => p.category === selectedAgeCategory)
      .filter(p => {
        if (ageCategoryGenderFilter !== 'semua' && p.jenisKelamin !== ageCategoryGenderFilter) {
          return false;
        }
        if (ageCategorySearch.trim()) {
          const q = ageCategorySearch.toLowerCase();
          return (
            p.nama.toLowerCase().includes(q) ||
            p.blokFormatted.toLowerCase().includes(q) ||
            p.blokShort.toLowerCase().includes(q) ||
            p.kepalaKeluarga.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [allPersonsList, selectedAgeCategory, ageCategoryGenderFilter, ageCategorySearch]);

  const exportAgeCategoryToCsv = () => {
    if (!selectedAgeCategory) return;
    const catLabels: Record<string, string> = {
      balita: 'Balita (0-4 Tahun)',
      anak: 'Anak (5-12 Tahun)',
      remaja: 'Remaja (13-20 Tahun)',
      dewasa: 'Dewasa (>20 Tahun)'
    };
    const headers = ['No', 'Nama Lengkap', 'Hubungan Keluarga', 'Kepala Keluarga', 'Blok / Alamat', 'Jenis Kelamin', 'Tanggal Lahir', 'Umur (Tahun)'];
    const rows = filteredSelectedAgePersons.map((p, idx) => [
      String(idx + 1),
      p.nama,
      p.hubungan,
      p.kepalaKeluarga,
      p.blokFormatted,
      p.jenisKelamin,
      p.tglLahirFormatted,
      `${p.umur} Tahun`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Data_Warga_${selectedAgeCategory.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatusBanner(`Laporan Excel (CSV) kategori ${selectedAgeCategory.toUpperCase()} berhasil diunduh!`);
  };

  const exportFilteredWargaToCsv = () => {
    const sourceWarga =
      !filterAgeCategory && !filterBlok && !debouncedSearchQuery && allWargaFullData.length > 0
        ? allWargaFullData.filter(w => w.role !== 'developer')
        : filteredWargaData;

    const getAgeCategoryLabel = (age: number): string => {
      if (age < 0) return '-';
      if (age <= 4) return 'Balita (0-4 Thn)';
      if (age <= 12) return 'Anak (5-12 Thn)';
      if (age <= 20) return 'Remaja (13-20 Thn)';
      if (age >= 60) return 'Lansia (≥60 Thn)';
      return 'Dewasa (>20 Thn)';
    };

    const headers = [
      'No',
      'No. KK',
      'Nama Lengkap',
      'Status Hubungan',
      'Kepala Keluarga',
      'Blok / Alamat',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'Umur (Tahun)',
      'Kategori Usia',
      'No. HP',
      'Status Warga',
      'Jabatan RT'
    ];

    const rows: string[][] = [];
    let rowNo = 1;

    sourceWarga.forEach(w => {
      const headAge = resolvePersonAge(w.umur, w.tglLahir);
      const headJk = inferJenisKelamin(w.nama || '', 'Kepala Keluarga', w.jenisKelamin);
      const headDob = formatTanggalLahirWarga(w.tglLahir, headAge >= 0 ? headAge : undefined);
      const headNoKk = getResolvedNoKk(w) || '-';
      const roleLabel =
        w.role === 'admin'
          ? 'Ketua RT'
          : w.role === 'bendahara'
          ? 'Bendahara'
          : w.role === 'sekretaris'
          ? 'Sekretaris'
          : w.role === 'pengurus'
          ? 'Pengurus'
          : 'Warga';

      const includeHead = !filterAgeCategory || matchesAgeCategoryFilter(headAge, filterAgeCategory);
      if (includeHead) {
        rows.push([
          String(rowNo++),
          headNoKk,
          w.nama || '-',
          'Kepala Keluarga',
          w.nama || '-',
          w.alamat || '-',
          headJk,
          headDob,
          headAge >= 0 ? `${headAge} Tahun` : '-',
          getAgeCategoryLabel(headAge),
          w.noHp || '-',
          w.status || 'Warga Tetap',
          roleLabel
        ]);
      }

      if (Array.isArray(w.members)) {
        w.members.forEach((m: any) => {
          const mAge = resolvePersonAge(m.age, m.tglLahir);
          const includeMember = !filterAgeCategory || matchesAgeCategoryFilter(mAge, filterAgeCategory);
          // Jika sedang mencari nama spesifik, pastikan anggota atau KK cocok
          const q = debouncedSearchQuery.trim().toLowerCase();
          const nameMatchesQuery =
            !q ||
            (m.name || '').toLowerCase().includes(q) ||
            (w.nama || '').toLowerCase().includes(q) ||
            (headNoKk && headNoKk.toLowerCase().includes(q));

          if (includeMember && nameMatchesQuery) {
            const mJk = inferJenisKelamin(m.name || '', m.role, m.jenisKelamin);
            const mDob = formatTanggalLahirWarga(m.tglLahir, mAge >= 0 ? mAge : undefined);
            rows.push([
              String(rowNo++),
              headNoKk,
              m.name || '-',
              m.role || 'Anggota Keluarga',
              w.nama || '-',
              w.alamat || '-',
              mJk,
              mDob,
              mAge >= 0 ? `${mAge} Tahun` : '-',
              getAgeCategoryLabel(mAge),
              w.noHp || '-',
              w.status || 'Warga Tetap',
              'Anggota Keluarga'
            ]);
          }
        });
      }
    });

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filterParts: string[] = [];
    if (filterBlok) filterParts.push(`Blok_${filterBlok}`);
    if (filterAgeCategory) filterParts.push(`Usia_${filterAgeCategory.toUpperCase()}`);
    if (debouncedSearchQuery.trim()) filterParts.push('Pencarian');
    const suffix = filterParts.length > 0 ? filterParts.join('_') : 'Semua';
    const dateStr = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Data_Warga_${suffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showStatusBanner(`Berhasil mengunduh ${rows.length} baris data warga ke format Excel (CSV)!`);
  };

  const resolvePersonAge = (rawAge: any, rawDob?: string): number => {
    if (rawDob && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDob).trim())) {
      const diff = Date.now() - new Date(String(rawDob).trim()).getTime();
      if (!isNaN(diff) && diff > 0) {
        return Math.max(0, Math.abs(new Date(diff).getUTCFullYear() - 1970));
      }
    }
    const parsed = parseInt(String(rawAge ?? '').replace(/\D/g, '') || '-1', 10);
    return isNaN(parsed) ? -1 : parsed;
  };

  const matchesAgeCategoryFilter = (age: number, cat: string): boolean => {
    if (!cat) return true;
    if (age < 0) return false;
    switch (cat) {
      case 'balita':
        return age >= 0 && age <= 4;
      case 'anak':
        return age >= 5 && age <= 12;
      case 'remaja':
        return age >= 13 && age <= 20;
      case 'dewasa':
        return age > 20;
      case 'lansia':
        return age >= 60;
      default:
        return true;
    }
  };

  const getMatchingPersonsInWarga = (w: any, cat: string): Array<{ name: string; age: number; role: string }> => {
    if (!cat) return [];
    const matches: Array<{ name: string; age: number; role: string }> = [];
    const headAge = resolvePersonAge(w.umur, w.tglLahir);
    if (matchesAgeCategoryFilter(headAge, cat)) {
      matches.push({ name: w.nama || 'Kepala Keluarga', age: headAge, role: 'KK' });
    }
    if (Array.isArray(w.members)) {
      w.members.forEach((m: any) => {
        const mAge = resolvePersonAge(m.age, m.tglLahir);
        if (matchesAgeCategoryFilter(mAge, cat)) {
          matches.push({ name: m.name || 'Anggota', age: mAge, role: m.role || 'Anggota' });
        }
      });
    }
    return matches;
  };

  const filteredWargaData = useMemo(() => {
    const baseList = allWargaFullData.length > 0 ? allWargaFullData : wargaData;
    const ownDetailed = wargaData.find(w => isOwnAccount(w));

    const sourceData = baseList.map(w => {
      if (ownDetailed && isOwnAccount(w)) {
        return { ...w, ...ownDetailed };
      }
      return w;
    });

    const filtered = sourceData.filter(w => {
      if (w.role === 'developer') return false;
      const q = debouncedSearchQuery.toLowerCase();
      const canSearchMembers = isKetuaRT || isOwnAccount(w);
      const resolvedNoKk = getResolvedNoKk(w).toLowerCase();
      const matchName =
        !q ||
        (w.nama || '').toLowerCase().includes(q) ||
        (w.username || '').toLowerCase().includes(q) ||
        (w.alamat || '').toLowerCase().includes(q) ||
        resolvedNoKk.includes(q) ||
        (canSearchMembers && (w.members || []).some((m: any) => (m.name || '').toLowerCase().includes(q)));
      const matchBlok = !filterBlok || w.alamat?.match(/Blok\s+([a-zA-Z0-9]+)/i)?.[1] === filterBlok;
      const matchAge =
        !filterAgeCategory || getMatchingPersonsInWarga(w, filterAgeCategory).length > 0;
      return matchName && matchBlok && matchAge;
    });

    // Tempatkan akun user yang sedang aktif di urutan paling atas
    return [...filtered].sort((a, b) => {
      const isCurrentA = isOwnAccount(a);
      const isCurrentB = isOwnAccount(b);
      if (isCurrentA && !isCurrentB) return -1;
      if (!isCurrentA && isCurrentB) return 1;
      return 0;
    });
  }, [wargaData, allWargaFullData, debouncedSearchQuery, filterBlok, filterAgeCategory, currentUser, isKetuaRT]);

  // Summary & Filtered list for "Data Dokumen KK" menu (Ketua RT only)
  const kkStats = useMemo(() => {
    const list = allWargaKkData.filter(w => w.role !== 'developer');
    const uploaded = list.filter(w => Boolean(w.dokumenKk && String(w.dokumenKk).trim() !== ''));
    const notUploaded = list.filter(w => !w.dokumenKk || String(w.dokumenKk).trim() === '');
    return {
      total: list.length,
      uploadedCount: uploaded.length,
      notUploadedCount: notUploaded.length
    };
  }, [allWargaKkData]);

  const filteredKkMenuData = useMemo(() => {
    const filtered = allWargaKkData
      .filter(w => w.role !== 'developer')
      .filter(w => {
        const hasKk = Boolean(w.dokumenKk && String(w.dokumenKk).trim() !== '');
        if (kkFilterStatus === 'terupload' && !hasKk) return false;
        if (kkFilterStatus === 'belum' && hasKk) return false;

        const q = kkSearchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          (w.nama || '').toLowerCase().includes(q) ||
          (w.alamat || '').toLowerCase().includes(q) ||
          (w.username || '').toLowerCase().includes(q) ||
          (w.members || []).some((m: any) => (m.name || '').toLowerCase().includes(q));

        const matchBlok = !kkFilterBlok || w.alamat?.match(/Blok\s+([a-zA-Z0-9]+)/i)?.[1] === kkFilterBlok;
        return matchSearch && matchBlok;
      });

    return [...filtered].sort((a, b) => {
      const isCurrentA = currentUser && (a.id === currentUser.id || a.username === currentUser.username);
      const isCurrentB = currentUser && (b.id === currentUser.id || b.username === currentUser.username);
      if (isCurrentA && !isCurrentB) return -1;
      if (!isCurrentA && isCurrentB) return 1;
      return 0;
    });
  }, [allWargaKkData, kkFilterStatus, kkSearchQuery, kkFilterBlok, currentUser]);

  const isPdfUrl = (url?: string) => Boolean(url && url.startsWith('data:application/pdf'));

  // Helper & Component untuk menampilkan Badge Visual Blok dan No Rumah yang kontras & mencolok
  const parseHouseInfo = (warga: any) => {
    const alamat = String(warga?.alamat || '').trim();
    
    // Format standar: Blok X No. Y / Blok X Nomor Y / Blok X No Y
    const match1 = alamat.match(/Blok\s*([a-zA-Z0-9]+)\s*(?:No\.?|Nomor|\/|-)?\s*([a-zA-Z0-9]+)?/i);
    if (match1 && match1[1]) {
      const blok = match1[1].toUpperCase();
      const nomor = match1[2] ? match1[2].toUpperCase() : '';
      return {
        blok,
        nomor,
        hasSpecific: true,
        shortCode: nomor ? `${blok}${nomor}` : blok,
        fullFormatted: nomor ? `Blok ${blok} • No. ${nomor}` : `Blok ${blok}`
      };
    }

    // Format singkat: A1-01 / B3/12 / C2-5
    const match2 = alamat.match(/^([a-zA-Z]+)[-\s/]+([0-9]+)$/i);
    if (match2) {
      const blok = match2[1].toUpperCase();
      const nomor = match2[2];
      return {
        blok,
        nomor,
        hasSpecific: true,
        shortCode: `${blok}${nomor}`,
        fullFormatted: `Blok ${blok} • No. ${nomor}`
      };
    }

    // Format username: misal A101
    if (warga?.username && /^[A-Za-z]+\d+/i.test(warga.username)) {
      const uMatch = warga.username.match(/^([A-Za-z]+)(\d+)$/);
      if (uMatch) {
        const blok = uMatch[1].toUpperCase();
        const nomor = uMatch[2];
        return {
          blok,
          nomor,
          hasSpecific: true,
          shortCode: `${blok}${nomor}`,
          fullFormatted: `Blok ${blok} • No. ${nomor}`
        };
      }
    }

    return {
      blok: '',
      nomor: '',
      hasSpecific: false,
      shortCode: (warga?.nama || 'W').charAt(0).toUpperCase(),
      fullFormatted: alamat || 'Alamat belum diisi'
    };
  };

  const getHouseShortCode = (warga: any): string => {
    return parseHouseInfo(warga).shortCode;
  };

  const getFormattedBlokNo = (warga: any): string => {
    return parseHouseInfo(warga).fullFormatted;
  };

  // Komponen Badge Blok & No Rumah yang konsisten dengan tampilan di menu Dokumen
  const HouseBadge = ({ warga, size = 'md' }: { warga: any; size?: 'sm' | 'md' | 'lg' }) => {
    const info = parseHouseInfo(warga);
    return (
      <span
        className={`inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg font-extrabold shrink-0 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
        }`}
      >
        🏠 {info.fullFormatted}
      </span>
    );
  };

  return (
    <div className="p-5 pb-24 bg-gray-50 min-h-screen">
      {/* HEADER & NAV */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <icons.back className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-2">
          {isKetuaRT && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-full border border-amber-200">
              Akses Ketua RT
            </span>
          )}
          <div className="bg-teal-100 text-teal-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-teal-200">
            Total {isKetuaRT && kkStats.total > 0 ? kkStats.total : totalElements || wargaData.length} KK
          </div>
        </div>
      </div>

      {/* MENU TAB NAVIGATION INSIDE DATA WARGA (DATA DOKUMEN KK HANYA UNTUK KETUA RT & SEKRETARIS) */}
      {isPrivilegedKkViewer && (
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/80 mb-5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubMenu('direktori')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubMenu === 'direktori'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <icons.users className="w-4 h-4" />
            <span>Direktori Warga</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubMenu('dokumen_kk')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubMenu === 'dokumen_kk'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <icons.document className="w-4 h-4" />
            <span>Data Dokumen KK</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeSubMenu === 'dokumen_kk'
                  ? 'bg-white/25 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {kkStats.uploadedCount}
            </span>
          </button>
        </div>
      )}

      {/* STATUS & AI EXTRACTION FEEDBACK BANNERS */}
      <AnimatePresence>
        {docStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>{docStatusMessage}</span>
            </span>
            <button type="button" onClick={() => setDocStatusMessage('')} className="text-emerald-600 hover:text-emerald-900 ml-2">✕</button>
          </motion.div>
        )}
        {docErrorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{docErrorMessage}</span>
            </span>
            <button type="button" onClick={() => setDocErrorMessage('')} className="text-rose-600 hover:text-rose-900 ml-2">✕</button>
          </motion.div>
        )}
        {isKetuaRT && lastExtractedInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mb-5 bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200 p-4 rounded-2xl shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold text-xs">
                  <icons.sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Hasil AI Extract KK — {lastExtractedInfo.wargaName}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">{lastExtractedInfo.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setLastExtractedInfo(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1.5"
              >
                ✕
              </button>
            </div>
            {lastExtractedInfo.addedMembers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {lastExtractedInfo.addedMembers.map((m: any, mIdx: number) => (
                  <span
                    key={m.id ? `ext_${m.id}_${mIdx}` : `ext_${mIdx}_${m.name || 'mem'}`}
                    className="bg-white border border-indigo-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span className="text-indigo-700">{m.name}</span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-extrabold">{m.role}</span>
                    <span className="text-[10px] text-teal-600">{m.age} Thn</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* SUB-MENU 2: DATA DOKUMEN KK (HANYA BISA DILIHAT OLEH KETUA RT & SEKRETARIS) */}
      {/* ===================================================================== */}
      {isPrivilegedKkViewer && activeSubMenu === 'dokumen_kk' ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Header Banner Data Dokumen KK */}
          <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  <span>🔒 Khusus Ketua RT & Sekretaris</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Data Dokumen Kartu Keluarga (KK)</h2>
                <p className="text-xs text-teal-100 mt-1 max-w-xl">
                  Daftar seluruh dokumen Kartu Keluarga (KK) warga yang telah diunggah. Ketua RT dan Sekretaris dapat memeriksa dokumen KK asli dan menjalankan <strong>AI Extract KK</strong> secara langsung.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAllKkWargaForKetuaRT}
                className="self-start sm:self-center bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Segarkan Data
              </button>
            </div>
          </div>

          {/* Ringkasan Statistik KK */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setKkFilterStatus('terupload')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                kkFilterStatus === 'terupload'
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm ring-2 ring-emerald-100'
                  : 'bg-white border-slate-100 shadow-xs hover:border-emerald-200'
              }`}
            >
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">KK Sudah Diupload</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{kkStats.uploadedCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Dokumen KK tersedia</p>
            </button>

            <button
              type="button"
              onClick={() => setKkFilterStatus('belum')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                kkFilterStatus === 'belum'
                  ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-100'
                  : 'bg-white border-slate-100 shadow-xs hover:border-amber-200'
              }`}
            >
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Belum Upload KK</p>
              <p className="text-2xl font-black text-amber-800 mt-1">{kkStats.notUploadedCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Menunggu unggahan</p>
            </button>

            <button
              type="button"
              onClick={() => setKkFilterStatus('semua')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                kkFilterStatus === 'semua'
                  ? 'bg-teal-50 border-teal-300 shadow-sm ring-2 ring-teal-100'
                  : 'bg-white border-slate-100 shadow-xs hover:border-teal-200'
              }`}
            >
              <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider">Total KK Warga</p>
              <p className="text-2xl font-black text-teal-800 mt-1">{kkStats.total}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Seluruh Kepala Keluarga</p>
            </button>
          </div>

          {/* Filter & Pencarian Dokumen KK */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <icons.search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama kepala keluarga, anggota, atau blok rumah..."
                  value={kkSearchQuery}
                  onChange={(e) => setKkSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none transition-all font-medium"
                />
              </div>
              <select
                value={kkFilterBlok}
                onChange={(e) => setKkFilterBlok(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-bold text-slate-700"
              >
                <option value="">Semua Blok</option>
                {Array.from(
                  new Set(
                    allWargaKkData
                      .map(w => w.alamat?.match(/Blok\s+([a-zA-Z0-9]+)/i)?.[1])
                      .filter(Boolean)
                  )
                )
                  .sort()
                  .map(b => (
                    <option key={String(b)} value={String(b)}>
                      Blok {String(b)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'terupload', label: `Sudah Upload KK (${kkStats.uploadedCount})` },
                { id: 'semua', label: `Semua Warga (${kkStats.total})` },
                { id: 'belum', label: `Belum Upload KK (${kkStats.notUploadedCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setKkFilterStatus(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    kkFilterStatus === tab.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar Kartu Keluarga (KK) */}
          {loadingKkMenu ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 text-xs text-slate-400 font-semibold">
              Memuat daftar dokumen Kartu Keluarga...
            </div>
          ) : filteredKkMenuData.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 space-y-2">
              <icons.document className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                {kkFilterStatus === 'terupload'
                  ? 'Belum ada dokumen KK yang sesuai filter.'
                  : 'Tidak ada data warga yang ditemukan.'}
              </p>
              {kkFilterStatus === 'terupload' && kkStats.notUploadedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setKkFilterStatus('semua')}
                  className="text-xs font-extrabold text-teal-600 hover:underline cursor-pointer"
                >
                  Lihat seluruh warga untuk mengunggah KK →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKkMenuData.map((warga, idx) => {
                const hasKk = Boolean(warga.dokumenKk && String(warga.dokumenKk).trim() !== '');
                const members = warga.members || [];
                const isExtractingThis = extractingId === warga.id;
                const isUploadingThis = uploadingDocWargaId === warga.id;
                const canEditFamily = isKetuaRT || currentUser?.id === warga.id || currentUser?.role === 'admin' || currentUser?.role === 'developer';

                const citizenKkNum = getResolvedNoKk(warga);

                return (
                  <div
                    key={warga.id ? `kk_${warga.id}_${idx}` : `kk_row_${idx}`}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Document Preview Banner */}
                    {hasKk ? (
                      <div
                        onClick={() =>
                          setPreviewDocs({
                            docs: [{ url: warga.dokumenKk, title: `Kartu Keluarga - ${warga.nama}` }],
                            currentIndex: 0,
                            wargaName: warga.nama
                          })
                        }
                        className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer group"
                      >
                        {isPdfUrl(warga.dokumenKk) ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-4">
                            <icons.document className="w-12 h-12 text-teal-400 mb-2" />
                            <span className="text-xs font-bold">Dokumen PDF Kartu Keluarga</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">Klik untuk membuka pratinjau</span>
                          </div>
                        ) : (
                          <img
                            src={warga.dokumenKk}
                            alt={`KK ${warga.nama}`}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent flex items-end justify-between p-3.5 gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="inline-block bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                ✓ KK Terupload
                              </span>
                              <HouseBadge warga={warga} size="sm" />
                              {citizenKkNum && (
                                <span className="inline-block bg-teal-900/90 text-teal-200 border border-teal-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                                  No. KK: {citizenKkNum}
                                </span>
                              )}
                            </div>
                            <p className="text-white font-extrabold text-sm leading-snug break-words">{warga.nama}</p>
                          </div>
                          <span className="bg-white/95 text-slate-900 text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            <icons.eye className="w-3.5 h-3.5" />
                            Lihat KK
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 bg-slate-50 border-b border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Belum Upload KK
                          </span>
                          <HouseBadge warga={warga} size="sm" />
                        </div>
                        <p className="font-extrabold text-slate-800 text-sm leading-snug">{warga.nama}</p>
                      </div>
                    )}

                    {/* Card Details & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div>
                        {/* No. KK Detail Box */}
                        {citizenKkNum && (
                          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs">📋</span>
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wider">No. Kartu Keluarga (KK)</p>
                                <p className="font-mono font-black text-xs text-teal-950 tracking-wide truncate">{citizenKkNum}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(citizenKkNum);
                                showStatusBanner('No. KK berhasil disalin!');
                              }}
                              className="text-[9px] font-extrabold bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                            >
                              Salin
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span className="font-bold text-slate-700">
                            Anggota Keluarga ({members.length + 1} Orang)
                          </span>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                            Kepala Kel: {warga.umur ? `${warga.umur} Thn` : '-'}
                          </span>
                        </div>

                        {members.length === 0 ? (
                          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <p className="text-[11px] text-slate-400 italic">
                              Belum ada anggota keluarga tercatat. {hasKk ? 'Klik "AI Extract KK" untuk mengekstrak otomatis.' : ''}
                            </p>
                            {canEditFamily && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveWargaId(warga.id);
                                  setEditingMember(null);
                                  setMemberForm({ name: '', role: '', age: '', tglLahir: '', jenisKelamin: 'Laki-laki' });
                                  setShowMemberForm(true);
                                }}
                                className="text-[10px] font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                + Tambah
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {members.map((m: any, mIdx: number) => (
                              <span
                                key={m.id ? `chip_${warga.id}_${m.id}_${mIdx}` : `chip_${warga.id}_${mIdx}_${m.name || ''}`}
                                onClick={() => {
                                  if (canEditFamily) {
                                    setActiveWargaId(warga.id);
                                    setEditingMember(m);
                                    setMemberForm({
                                      name: m.name || '',
                                      role: m.role || '',
                                      tglLahir: m.tglLahir || '',
                                      age: String(m.age || ''),
                                      jenisKelamin: inferJenisKelamin(m.name || '', m.role, m.jenisKelamin)
                                    });
                                    setShowMemberForm(true);
                                  }
                                }}
                                className={`inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-xl font-semibold ${
                                  canEditFamily ? 'cursor-pointer hover:bg-teal-50 hover:border-teal-300 transition-colors group' : ''
                                }`}
                                title={canEditFamily ? 'Klik untuk mengedit anggota keluarga' : ''}
                              >
                                <span className="font-bold text-slate-800 group-hover:text-teal-800">{m.name}</span>
                                <span className="text-[9px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold">{m.role}</span>
                                <span className="text-[10px] text-slate-400">({m.age}th)</span>
                                {canEditFamily && <icons.edit className="w-2.5 h-2.5 text-teal-600 opacity-60 group-hover:opacity-100 ml-0.5" />}
                              </span>
                            ))}
                            {canEditFamily && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveWargaId(warga.id);
                                  setEditingMember(null);
                                  setMemberForm({ name: '', role: '', age: '', tglLahir: '', jenisKelamin: 'Laki-laki' });
                                  setShowMemberForm(true);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer"
                              >
                                <span>+ Anggota</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ketua RT Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        {hasKk && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDocs({
                                  docs: [{ url: warga.dokumenKk, title: `Kartu Keluarga - ${warga.nama}` }],
                                  currentIndex: 0,
                                  wargaName: warga.nama
                                })
                              }
                              className="flex-1 min-w-[100px] py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <icons.eye className="w-3.5 h-3.5" />
                              <span>Lihat KK</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExtractKK(warga.id)}
                              disabled={isExtractingThis}
                              className="flex-1 min-w-[120px] py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                            >
                              <icons.sparkles className="w-3.5 h-3.5" />
                              <span>{isExtractingThis ? 'Mengekstrak...' : 'AI Extract KK'}</span>
                            </button>
                          </>
                        )}

                        <label className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                          <icons.upload className="w-3.5 h-3.5" />
                          <span>{isUploadingThis ? 'Memproses...' : hasKk ? 'Ganti KK' : '+ Upload KK'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            disabled={isUploadingThis}
                            onChange={(e) => handleUploadWargaDoc(warga, 'kk', e)}
                          />
                        </label>

                        {hasKk && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKkDoc(warga)}
                            disabled={isUploadingThis}
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Dokumen KK"
                          >
                            <icons.delete className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : showAddWarga ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <h4 className="font-bold text-gray-800 text-lg mb-4">Tambah Warga Baru</h4>
          <form onSubmit={handleAddWarga} className="space-y-4">
            <input type="text" placeholder="Username" value={newWarga.username} onChange={e => setNewWarga({ ...newWarga, username: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />
            <input type="text" placeholder="Nama Lengkap" value={newWarga.nama} onChange={e => setNewWarga({ ...newWarga, nama: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />
            <input type="password" placeholder="Password Login" value={newWarga.password} onChange={e => setNewWarga({ ...newWarga, password: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />

            <div className="flex gap-3">
              <select value={newWargaBlok} onChange={e => setNewWargaBlok(e.target.value)} required className="w-1/2 text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none appearance-none">
                <option value="">Pilih Blok</option>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(b => <option key={b} value={b}>Blok {b}</option>)}
              </select>
              <input type="text" placeholder="No Rumah (Cth: 12)" value={newWargaNomor} onChange={e => setNewWargaNomor(e.target.value)} required className="w-1/2 text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />
            </div>

            <input type="tel" placeholder="Nomor HP" value={newWarga.noHp} onChange={e => setNewWarga({ ...newWarga, noHp: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 pl-1">Jenis Kelamin</label>
                <select value={newWarga.jenisKelamin} onChange={e => setNewWarga({ ...newWarga, jenisKelamin: e.target.value })} className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 pl-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={newWarga.tglLahir}
                  onChange={e => {
                    const tgl = e.target.value;
                    setNewWarga({ ...newWarga, tglLahir: tgl, umur: calculateAge(tgl) || newWarga.umur });
                  }}
                  className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 pl-1">Usia (Tahun)</label>
                <input type="number" placeholder="Usia (Tahun)" value={newWarga.umur} onChange={e => setNewWarga({ ...newWarga, umur: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none" />
              </div>
            </div>

            <select value={newWarga.status} onChange={e => setNewWarga({ ...newWarga, status: e.target.value })} required className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none appearance-none">
              <option value="">Pilih Status Warga</option>
              <option value="Warga Tetap">Warga Tetap</option>
              <option value="Warga Sementara (Kontrak)">Warga Sementara (Kontrak)</option>
            </select>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 pl-1">Peran / Jabatan di RT</label>
              <select value={newWarga.role} onChange={e => setNewWarga({ ...newWarga, role: e.target.value })} className="w-full text-sm p-3 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none">
                <option value="warga">Warga</option>
                <option value="pengurus">Pengurus RT</option>
                <option value="sekretaris">Sekretaris RT</option>
                <option value="bendahara">Bendahara RT</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-teal-400 cursor-pointer text-center">
                <span className="text-xs font-bold text-teal-700">
                  {newWarga.dokumenKk ? '✓ KK Terpilih (Ganti)' : '+ Upload KK (Opsional)'}
                </span>
                <span className="text-[10px] text-gray-400">Foto / PDF</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const dataUrl = await processFileToBase64(f);
                      const extracted = extractNoKkFromDoc(dataUrl);
                      setNewWarga(prev => ({ ...prev, dokumenKk: dataUrl, noKk: extracted || prev.noKk }));
                    }
                  }}
                />
              </label>

              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-indigo-400 cursor-pointer text-center">
                <span className="text-xs font-bold text-indigo-700">
                  {newWarga.dokumenKtp.length > 0 ? `✓ ${newWarga.dokumenKtp.length} KTP Terpilih (+ Tambah)` : '+ Upload KTP (Opsional)'}
                </span>
                <span className="text-[10px] text-gray-400">Foto / PDF (Bisa &gt; 1)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const urls: string[] = [];
                      for (let i = 0; i < files.length; i++) {
                        urls.push(await processFileToBase64(files[i]));
                      }
                      setNewWarga(prev => ({ ...prev, dokumenKtp: [...prev.dokumenKtp, ...urls] }));
                    }
                  }}
                />
              </label>
            </div>

            {newWarga.dokumenKk && (
              <div>
                <label className="block text-[11px] font-bold text-teal-700 mb-1 pl-1">No. Kartu Keluarga (Hasil Ekstraksi KK)</label>
                <input
                  type="text"
                  placeholder="Nomor KK (16 digit)"
                  value={newWarga.noKk}
                  onChange={e => setNewWarga({ ...newWarga, noKk: e.target.value })}
                  className="w-full text-sm font-mono p-3 bg-teal-50/50 border border-teal-200 focus:bg-white focus:border-teal-500 rounded-xl transition-all outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddWarga(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">Simpan Data</button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <h2 className="text-xl font-extrabold text-gray-800 mb-4 tracking-tight">Direktori Warga & Pengurus</h2>

          {/* STATS CARDS & BAR CHART (KLIK UNTUK LIHAT DAFTAR WARGA PER KATEGORI USIA) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs mb-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Demografi Usia Warga (Semua Warga)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Distribusi usia seluruh warga RT ({allPersonsList.length} jiwa terdata)
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                ✨ Klik grafik / kategori usia untuk lihat daftar warga
              </span>
            </div>

            {/* Bar Chart Visualisasi Distribusi Usia Seluruh Warga */}
            <div className="h-44 w-full bg-slate-50/70 border border-slate-100 rounded-2xl p-3 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      key: 'balita',
                      name: 'Balita',
                      range: '0 - 4 Thn',
                      count: allPersonsList.filter(p => p.category === 'balita').length,
                      fill: '#3b82f6'
                    },
                    {
                      key: 'anak',
                      name: 'Anak',
                      range: '5 - 12 Thn',
                      count: allPersonsList.filter(p => p.category === 'anak').length,
                      fill: '#10b981'
                    },
                    {
                      key: 'remaja',
                      name: 'Remaja',
                      range: '13 - 20 Thn',
                      count: allPersonsList.filter(p => p.category === 'remaja').length,
                      fill: '#8b5cf6'
                    },
                    {
                      key: 'dewasa',
                      name: 'Dewasa',
                      range: '> 20 Thn',
                      count: allPersonsList.filter(p => p.category === 'dewasa').length,
                      fill: '#f97316'
                    }
                  ]}
                  margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                  barSize={38}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const item = payload[0].payload as any;
                        const pct =
                          allPersonsList.length > 0
                            ? Math.round((item.count / allPersonsList.length) * 100)
                            : 0;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-md text-xs">
                            <p className="font-extrabold text-teal-300">
                              {item.name} ({item.range})
                            </p>
                            <p className="font-bold mt-0.5">
                              {item.count} Warga ({pct}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    className="cursor-pointer"
                    onClick={(data: any) => {
                      if (data?.key) {
                        setSelectedAgeCategory(prev => (prev === data.key ? null : data.key));
                      }
                    }}
                  >
                    {[
                      { key: 'balita', fill: '#3b82f6' },
                      { key: 'anak', fill: '#10b981' },
                      { key: 'remaja', fill: '#8b5cf6' },
                      { key: 'dewasa', fill: '#f97316' }
                    ].map(entry => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                key: 'balita' as const,
                label: 'Balita',
                range: '0 - 4 Thn',
                count: allPersonsList.filter(p => p.category === 'balita').length,
                bg: 'from-blue-50 to-white',
                border: 'border-blue-200',
                activeRing: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/90 shadow-md',
                textLabel: 'text-blue-600',
                textCount: 'text-blue-900',
                badgeBg: 'bg-blue-100 text-blue-800'
              },
              {
                key: 'anak' as const,
                label: 'Anak',
                range: '5 - 12 Thn',
                count: allPersonsList.filter(p => p.category === 'anak').length,
                bg: 'from-emerald-50 to-white',
                border: 'border-emerald-200',
                activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/90 shadow-md',
                textLabel: 'text-emerald-600',
                textCount: 'text-emerald-900',
                badgeBg: 'bg-emerald-100 text-emerald-800'
              },
              {
                key: 'remaja' as const,
                label: 'Remaja',
                range: '13 - 20 Thn',
                count: allPersonsList.filter(p => p.category === 'remaja').length,
                bg: 'from-purple-50 to-white',
                border: 'border-purple-200',
                activeRing: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/90 shadow-md',
                textLabel: 'text-purple-600',
                textCount: 'text-purple-900',
                badgeBg: 'bg-purple-100 text-purple-800'
              },
              {
                key: 'dewasa' as const,
                label: 'Dewasa',
                range: '> 20 Thn',
                count: allPersonsList.filter(p => p.category === 'dewasa').length,
                bg: 'from-orange-50 to-white',
                border: 'border-orange-200',
                activeRing: 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/90 shadow-md',
                textLabel: 'text-orange-600',
                textCount: 'text-orange-900',
                badgeBg: 'bg-orange-100 text-orange-800'
              }
            ].map(card => {
              const isSelected = selectedAgeCategory === card.key;
              return (
                <div
                  key={card.key}
                  onClick={() => {
                    setSelectedAgeCategory(prev => (prev === card.key ? null : card.key));
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedAgeCategory(prev => (prev === card.key ? null : card.key));
                    }
                  }}
                  className={`bg-gradient-to-b ${card.bg} border p-3.5 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center transition-all select-none cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-98 ${
                    isSelected ? card.activeRing : card.border
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <p className={`text-xs ${card.textLabel} font-extrabold`}>{card.label}</p>
                    <span className="text-[9px] text-slate-400 font-bold">({card.range})</span>
                  </div>
                  <p className={`font-black ${card.textCount} text-2xl leading-none my-0.5`}>
                    {card.count}
                  </p>
                  <span
                    className={`mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
                      isSelected ? 'bg-slate-900 text-white' : card.badgeBg
                    }`}
                  >
                    {isSelected ? 'Tutup Daftar ✕' : 'Lihat Daftar ›'}
                  </span>
                </div>
              );
            })}
          </div>
          </div>

          {/* PANEL DAFTAR WARGA BERDASARKAN KATEGORI USIA */}
          <AnimatePresence>
            {selectedAgeCategory && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-white rounded-3xl border-2 border-teal-500/80 shadow-xl overflow-hidden">
                  {/* Header Daftar Kategori Usia */}
                  <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-teal-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Data Demografi Warga
                        </span>
                        <span className="text-teal-300 text-xs font-bold">
                          Total: {filteredSelectedAgePersons.length} Warga
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight mt-1">
                        Daftar Warga Kriteria:{' '}
                        <span className="text-teal-400 uppercase">
                          {selectedAgeCategory === 'balita'
                            ? 'Balita (0 - 4 Tahun)'
                            : selectedAgeCategory === 'anak'
                            ? 'Anak (5 - 12 Tahun)'
                            : selectedAgeCategory === 'remaja'
                            ? 'Remaja (13 - 20 Tahun)'
                            : 'Dewasa (> 20 Tahun)'}
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={exportAgeCategoryToCsv}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📥</span>
                        <span>Unduh Excel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAgeCategory(null)}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
                        title="Tutup daftar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Filter & Pencarian dalam Kategori Usia */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <icons.search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Cari nama warga atau blok rumah..."
                        value={ageCategorySearch}
                        onChange={e => setAgeCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(['semua', 'Laki-laki', 'Perempuan'] as const).map(jk => (
                        <button
                          key={jk}
                          type="button"
                          onClick={() => setAgeCategoryGenderFilter(jk)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            ageCategoryGenderFilter === jk
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {jk === 'semua' ? 'Semua JK' : jk}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabel & Card List Warga Sesuai Kriteria */}
                  <div className="p-4">
                    {filteredSelectedAgePersons.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-600">
                          Tidak ada data warga pada kategori usia ini.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Pastikan usia atau tanggal lahir warga/anggota keluarga telah diisi pada Data Warga.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-50/80">
                              <th className="py-3 px-3 rounded-tl-xl">No</th>
                              <th className="py-3 px-3">Nama Lengkap</th>
                              <th className="py-3 px-3">Blok / Rumah</th>
                              <th className="py-3 px-3">Jenis Kelamin</th>
                              <th className="py-3 px-3">Tanggal Lahir</th>
                              <th className="py-3 px-3 rounded-tr-xl text-right">Umur</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredSelectedAgePersons.map((person, idx) => (
                              <tr
                                key={person.id ? `person_${person.id}_${idx}` : `person_${idx}`}
                                className="hover:bg-teal-50/40 transition-colors group cursor-pointer"
                                onClick={() => {
                                  const targetW = person.wargaObj || allWargaFullData.find(w => w.id === person.wargaId) || wargaData.find(w => w.id === person.wargaId);
                                  if (targetW) setPreviewPhotoWarga(targetW);
                                }}
                              >
                                <td className="py-3 px-3 font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 hover:text-teal-700">
                                    <span>{person.nama}</span>
                                    <span className="text-[10px] text-teal-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">👁️ Foto</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {person.hubungan}
                                    </span>
                                    {!person.isHead && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        (KK: {person.kepalaKeluarga})
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <HouseBadge warga={person.wargaObj} size="sm" />
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${
                                      person.jenisKelamin === 'Perempuan'
                                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                                        : 'bg-sky-50 text-sky-700 border-sky-200'
                                    }`}
                                  >
                                    <span>{person.jenisKelamin === 'Perempuan' ? '♀' : '♂'}</span>
                                    <span>{person.jenisKelamin}</span>
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-700">
                                  <div className="flex items-center gap-1.5">
                                    <span>📅</span>
                                    <span>{person.tglLahirFormatted}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center gap-2 justify-end">
                                    <span className="bg-teal-50 text-teal-800 border border-teal-200 font-black px-2.5 py-1 rounded-xl text-xs">
                                      {person.umur} Thn
                                    </span>
                                    {!person.isHead && person.memberObj && (isKetuaRT || person.wargaId === currentUser?.id || person.wargaObj?.username === currentUser?.username) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveWargaId(person.wargaId);
                                            setEditingMember(person.memberObj);
                                            setMemberForm({
                                              name: person.memberObj.name || '',
                                              role: person.memberObj.role || '',
                                              tglLahir: person.memberObj.tglLahir || '',
                                              age: String(person.memberObj.age || ''),
                                              jenisKelamin: person.jenisKelamin
                                            });
                                            setShowMemberForm(true);
                                          }}
                                          className="p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                                          title="Edit Data Anggota"
                                        >
                                          <icons.edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMember(person.wargaId, person.memberObj.id || person.memberObj._id || person.memberObj.name)}
                                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                          title="Hapus Data Anggota"
                                        >
                                          <icons.delete className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddWarga(true)}
                className="w-full bg-gray-900 text-white font-semibold text-sm py-3.5 px-4 rounded-2xl shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-lg leading-none">+</span> Tambah Data Warga Baru
              </motion.button>

              {isPrivilegedKkViewer && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSubMenu('dokumen_kk')}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-md hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <icons.document className="w-4 h-4" />
                  <span>Data Dokumen KK ({kkStats.uploadedCount} Terupload)</span>
                </motion.button>
              )}
            </div>
          )}

          {/* SEARCH & FILTER WARGA */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-grow">
                <icons.search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama warga / blok rumah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                {/* Filter Blok */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={filterBlok}
                    onChange={(e) => setFilterBlok(e.target.value)}
                    className="w-full px-3.5 py-3 h-full text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none shadow-sm appearance-none pr-8 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="">Semua Blok</option>
                    {Array.from(
                      new Set(
                        (allWargaFullData.length > 0 ? allWargaFullData : wargaData)
                          .map(w => w.alamat?.match(/Blok\s+([a-zA-Z0-9]+)/i)?.[1])
                          .filter(Boolean)
                      )
                    )
                      .sort()
                      .map(b => (
                        <option key={String(b)} value={String(b)}>
                          Blok {String(b)}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                {/* Tombol Unduh Excel (CSV) untuk Pelaporan Offline */}
                {isKetuaRT && (
                  <button
                    type="button"
                    onClick={exportFilteredWargaToCsv}
                    title="Unduh data warga yang sedang difilter ke dalam format CSV/Excel"
                    className="px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>📥</span>
                    <span>Unduh Excel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info Filter Aktif */}
            {(filterBlok || searchQuery) && (
              <div className="flex items-center justify-between bg-teal-50/80 border border-teal-200 px-3.5 py-2 rounded-xl text-xs">
                <div className="text-teal-900 font-bold flex flex-wrap items-center gap-1.5">
                  <span>🔍 Menampilkan {filteredWargaData.length} Kepala Keluarga</span>
                  {filterBlok && (
                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                      Blok {filterBlok}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFilterAgeCategory('');
                    setFilterBlok('');
                    setSearchQuery('');
                  }}
                  className="text-teal-700 hover:text-teal-950 font-extrabold underline text-[11px] cursor-pointer shrink-0 ml-2"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {!isKetuaRT && (
              <div className="bg-teal-50/80 border border-teal-200 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-900">
                  <span>👥</span>
                  <span>Menampilkan seluruh Data Warga RT ({filteredWargaData.length} KK) — Rincian Data Keluarga hanya muncul pada akun login Anda</span>
                </div>
              </div>
            )}
          </div>

          {/* LIST WARGA */}
          <div className="space-y-4">
            {filteredWargaData.map((warga, idx) => {
              const members = warga.members || [];
              const isCurrentUser = isOwnAccount(warga);
              const canEditFamily = isKetuaRT || isCurrentUser;
              const canViewFamily = isKetuaRT || isCurrentUser;
              const isExpanded = canViewFamily && (!isKetuaRT ? (expandedId === null || expandedId === warga.id) : expandedId === warga.id);
              const hasKk = Boolean(warga.hasKk || (warga.dokumenKk && String(warga.dokumenKk).trim() !== ''));
              const hasKtp = Boolean(warga.hasKtp || (Array.isArray(warga.dokumenKtp) ? warga.dokumenKtp.length > 0 : Boolean(warga.dokumenKtp)));
              const houseInfo = parseHouseInfo(warga);
              const citizenNoKk = getResolvedNoKk(warga);
              const canViewCitizenNoKk = isPrivilegedKkViewer || isCurrentUser;

              return (
                <div key={`${warga.id || 'warga'}_${idx}`} className={`bg-white rounded-[1.5rem] border ${isCurrentUser ? 'border-teal-500 shadow-md ring-2 ring-teal-500/20' : isExpanded ? 'border-teal-400 shadow-xl ring-2 ring-teal-500/15' : 'border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] hover:border-teal-300 hover:shadow-md'} overflow-hidden transition-all duration-300`}>
                  <div
                    className="p-4 flex items-start sm:items-center gap-3.5 select-none cursor-pointer"
                    onClick={() => {
                      if (canViewFamily) {
                        setExpandedId(isExpanded ? '__closed__' : warga.id);
                      } else {
                        setPreviewPhotoWarga(warga);
                      }
                    }}
                  >
                    {/* Avatar / Foto Profil Warga (Klik untuk Pratinjau Foto) */}
                    <div 
                      className="relative shrink-0 mt-0.5 sm:mt-0 group/avatar cursor-pointer"
                      title="Klik untuk melihat pratinjau foto profil"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPhotoWarga(warga);
                      }}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-sm flex flex-col items-center justify-center shrink-0 overflow-hidden border border-slate-100 px-0.5 transition-transform group-hover/avatar:scale-105 shadow-xs">
                        {warga.photo ? (
                          <img
                            src={warga.photo}
                            alt={warga.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : houseInfo.hasSpecific && houseInfo.shortCode.length > 1 ? (
                          <>
                            <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 leading-none">BLOK</span>
                            <span className="font-black text-xs leading-tight mt-0.5">{houseInfo.shortCode}</span>
                          </>
                        ) : (
                          houseInfo.shortCode
                        )}
                      </div>

                      <span className={`absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 ${warga.isOnline ? 'bg-emerald-500 ring-2 ring-white' : 'bg-slate-300'} rounded-full shadow-xs`}></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h5 className="font-extrabold text-slate-800 text-sm leading-snug break-words">
                          {warga.nama}
                        </h5>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          warga.role === 'admin'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : warga.role === 'pengurus'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : warga.role === 'bendahara'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : warga.role === 'sekretaris'
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {warga.role === 'admin'
                            ? 'Ketua RT / Admin'
                            : warga.role === 'pengurus'
                            ? 'Pengurus RT'
                            : warga.role === 'bendahara'
                            ? 'Bendahara'
                            : warga.role === 'sekretaris'
                            ? 'Sekretaris'
                            : 'Warga'}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest shrink-0 border border-teal-400 shadow-xs flex items-center gap-1">
                            <span>★</span>
                            <span>Akun Anda</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <HouseBadge warga={warga} size="md" />
                        {warga.username && (
                          <span className="text-[11px] text-slate-400 font-semibold">@{warga.username}</span>
                        )}
                      </div>

                      {/* Baris No. Kartu Keluarga (Hanya Terlihat oleh Ketua RT, Sekretaris, dan Akun Warga Terkait) */}
                      {canViewCitizenNoKk && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {citizenNoKk ? (
                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 text-teal-950 px-2.5 py-1 rounded-xl shadow-2xs text-[11px] font-mono font-bold">
                              <span className="text-teal-700 font-sans text-[10px] uppercase tracking-wider font-extrabold">📋 No. KK:</span>
                              <span className="font-extrabold tracking-wider">{citizenNoKk}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(citizenNoKk);
                                  showStatusBanner(`No. KK ${citizenNoKk} disalin!`);
                                }}
                                title="Salin No. KK"
                                className="text-[9px] bg-white text-teal-700 border border-teal-200 hover:bg-teal-100 px-1.5 py-0.5 rounded-md font-sans font-extrabold cursor-pointer transition-colors ml-0.5"
                              >
                                Salin
                              </button>
                            </div>
                          ) : hasKk ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              <span>📋 No. KK:</span>
                              <span className="font-normal italic">Terunggah di KK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-medium">
                              <span>📋 No. KK:</span>
                              <span className="italic">Belum ada</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {warga.rt || 'RT 01'}
                          </span>
                          <span className="inline-flex items-center bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            👨‍👩‍👧‍👦 {members.length + 1} Jiwa
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              hasKk
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            KK: {hasKk ? '✓ Tersedia' : 'Belum Ada'}
                          </span>
                          {hasKtp && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              KTP: ✓ Tersedia
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPhotoWarga(warga);
                            }}
                            className="px-2.5 py-1 text-[11px] font-extrabold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                            title="Pratinjau profil & identitas warga"
                          >
                            <span>📷</span>
                            <span className="hidden sm:inline">Profil</span>
                          </button>

                          {canViewFamily && (
                            <div className={`p-1.5 rounded-xl transition-colors flex items-center justify-center shrink-0 ${isExpanded ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>
                              <icons.lainnya className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {canViewFamily && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-gray-100 bg-slate-50/70"
                      >
                        <div className="pt-4 space-y-4">
                          {/* DETAIL NO. KK & DOKUMEN (Hanya Ketua RT, Sekretaris, dan Akun Warga Terkait) */}
                          {citizenNoKk && canViewCitizenNoKk && (
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                  KK
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">No. Kartu Keluarga (KK)</p>
                                  <p className="font-mono font-black text-sm text-teal-950 tracking-wide mt-0.5 truncate">{citizenNoKk}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(citizenNoKk);
                                  showStatusBanner('No. KK berhasil disalin ke clipboard!');
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
                              >
                                <span>Salin</span>
                              </button>
                            </div>
                          )}

                          {/* DETAIL RUMAH & ALAMAT */}
                          <div className="bg-white p-3.5 rounded-2xl border border-teal-100/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Identitas Rumah / Unit</p>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{warga.alamat || 'Alamat belum dilengkapi'}</p>
                            </div>
                            <HouseBadge warga={warga} size="md" />
                          </div>

                          {/* ADMIN CONTROLS */}
                          {(isAdmin || currentUser?.role === 'developer') && warga.id !== currentUser?.id && (
                            <div className="bg-white p-3 rounded-2xl border border-red-100 flex flex-wrap gap-3 items-end">
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Role Akun</label>
                                <select
                                  value={warga.role || 'warga'}
                                  onChange={async (e) => {
                                    await apiFetch(`/api/warga/${warga.id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: e.target.value }) });
                                    fetchWarga();
                                  }}
                                  className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none"
                                >
                                  {currentUser?.role === 'developer' && <option value="admin">Admin</option>}
                                  <option value="warga">Warga</option>
                                  <option value="pengurus">Pengurus</option>
                                  <option value="bendahara">Bendahara</option>
                                  <option value="sekretaris">Sekretaris</option>
                                </select>
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
                                <select
                                  value={warga.isApproved ? 'aktif' : 'tidak_aktif'}
                                  onChange={async (e) => {
                                    await apiFetch(`/api/warga/${warga.id}/approval`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: e.target.value === 'aktif' }) });
                                    fetchWarga();
                                  }}
                                  className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none"
                                >
                                  <option value="aktif">Aktif</option>
                                  <option value="tidak_aktif">Nonaktif / Belum disetujui</option>
                                </select>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); apiFetch(`/api/warga/${warga.id}`, { method: 'DELETE' }).then(() => { showStatusBanner('Warga berhasil dihapus.'); fetchWarga(); if (isKetuaRT) fetchAllKkWargaForKetuaRT(); }); }} className="text-red-600 bg-red-50 hover:bg-red-100 font-semibold px-3 py-2 rounded-xl text-xs transition-colors h-[34px]">
                                Hapus Warga
                              </button>
                            </div>
                          )}

                          {/* INFO & ACTIONS */}
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-gray-100">
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">
                                  Dokumen {['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(warga.role) ? 'Pengurus' : 'Warga'}
                                </p>
                                <p className="text-xs font-semibold mt-0.5">
                                  {(hasKk || hasKtp)
                                    ? <span className="text-green-600 flex items-center gap-1">✅ Tersedia ({hasKk ? 'KK' : ''}{hasKk && hasKtp ? ' & ' : ''}{hasKtp ? 'KTP' : ''})</span>
                                    : <span className="text-orange-500 flex items-center gap-1">⚠️ Belum Lengkap</span>}
                                </p>
                              </div>
                              {(isKetuaRT || isCurrentUser) && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <label className="text-xs text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                                    {uploadingDocWargaId === warga.id ? 'Memproses...' : hasKk ? 'Ganti KK' : '+ Upload KK'}
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf"
                                      className="hidden"
                                      disabled={uploadingDocWargaId === warga.id}
                                      onChange={(e) => handleUploadWargaDoc(warga, 'kk', e)}
                                    />
                                  </label>
                                  <label className="text-xs text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                                    + Upload KTP
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf"
                                      multiple
                                      className="hidden"
                                      disabled={uploadingDocWargaId === warga.id}
                                      onChange={(e) => handleUploadWargaDoc(warga, 'ktp', e)}
                                    />
                                  </label>
                                  {/* Lihat File KK hanya untuk Ketua RT (atau pemilik dokumen sendiri) */}
                                  {(isKetuaRT || isCurrentUser) && (hasKk || hasKtp) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const docs: { url: string; title: string }[] = [];
                                        if (warga.dokumenKk) docs.push({ url: warga.dokumenKk, title: 'Kartu Keluarga' });
                                        if (Array.isArray(warga.dokumenKtp)) {
                                          warga.dokumenKtp.forEach((ktp: string, i: number) => docs.push({ url: ktp, title: `KTP ${i + 1}` }));
                                        } else if (warga.dokumenKtp) {
                                          docs.push({ url: warga.dokumenKtp, title: 'KTP' });
                                        }
                                        if (docs.length > 0) setPreviewDocs({ docs, currentIndex: 0, wargaName: warga.nama });
                                      }}
                                      className="text-xs text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                    >
                                      Lihat File
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap justify-between items-end gap-2">
                              <div>
                                <h6 className="text-sm font-bold text-gray-800">Anggota Keluarga</h6>
                                <p className="text-[10px] text-gray-500 mt-0.5">Kepala Kel: Usia {warga.umur || '-'} Thn</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {isKetuaRT && (
                                  hasKk ? (
                                    <button
                                      type="button"
                                      onClick={() => handleExtractKK(warga.id)}
                                      disabled={extractingId === warga.id}
                                      className="flex items-center gap-1.5 text-xs text-white font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-3 py-1.5 rounded-xl disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                                    >
                                      <icons.sparkles className="w-3.5 h-3.5" />
                                      {extractingId === warga.id ? 'Mengekstrak KK...' : 'AI Extract KK'}
                                    </button>
                                  ) : (
                                    <label className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all shadow-xs cursor-pointer">
                                      <icons.sparkles className="w-3.5 h-3.5" />
                                      <span>{uploadingDocWargaId === warga.id || extractingId === warga.id ? 'Memproses...' : 'Upload & AI Extract KK'}</span>
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        disabled={uploadingDocWargaId === warga.id || extractingId === warga.id}
                                        onChange={(e) => handleUploadWargaDoc(warga, 'kk', e, true)}
                                      />
                                    </label>
                                  )
                                )}
                                {canEditFamily && (
                                  <button onClick={() => { setActiveWargaId(warga.id); setMemberForm({ name: '', role: '', age: '', tglLahir: '', jenisKelamin: 'Laki-laki' }); setEditingMember(null); setShowMemberForm(true); }} className="text-xs text-white font-bold bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer">
                                    + Tambah
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* MEMBER LIST */}
                          {members.length === 0 ? (
                            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-200">
                              <p className="text-xs text-gray-400 font-medium">
                                Belum ada tanggungan/anggota keluarga.
                                {hasKk && isKetuaRT ? ' Klik tombol "AI Extract KK" di atas untuk mengisi anggota keluarga otomatis dari Kartu Keluarga.' : ''}
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-2">
                              {members.map((member: any, mIdx: number) => (
                                <div key={member.id ? `mem_${warga.id}_${member.id}` : `mem_${warga.id}_${mIdx}_${member.name || ''}`} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                      {(member.name || 'A').charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">{member.name}</p>
                                      <p className="text-[10px] text-gray-500 bg-gray-50 inline-block px-1.5 py-0.5 rounded mt-0.5 border border-gray-100">{member.role}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">{member.age} Thn</span>
                                    {canEditFamily && (
                                      <div className="flex gap-1">
                                        <button onClick={() => { setActiveWargaId(warga.id); setEditingMember(member); setMemberForm({ name: member.name || '', role: member.role || '', tglLahir: member.tglLahir || '', age: String(member.age || ''), jenisKelamin: inferJenisKelamin(member.name || '', member.role, member.jenisKelamin) }); setShowMemberForm(true); }} className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" title="Edit Anggota"><icons.edit className="w-4 h-4" /></button>
                                        {(isKetuaRT || currentUser?.id === warga.id || currentUser?.username === warga.username) && (
                                          <button onClick={() => handleDeleteMember(warga.id, member.id || member._id || member.name)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" title="Hapus Anggota"><icons.delete className="w-4 h-4" /></button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filteredWargaData.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold text-sm">
                  {filterAgeCategory || filterBlok || searchQuery
                    ? 'Tidak ada data warga yang cocok dengan filter yang dipilih.'
                    : 'Belum ada data warga terdaftar.'}
                </p>
              </div>
            )}

            {/* Pagination Controls (hanya bila data penuh belum dimuat) */}
            {allWargaFullData.length === 0 && totalPages > 1 && !filterBlok && (
              <div className="flex items-center justify-between pt-4 pb-2 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-gray-50 rounded-xl transition-colors cursor-pointer select-none"
                >
                  Sebelumnya
                </button>
                <span className="text-xs font-medium text-gray-500">
                  Halaman {page} dari {totalPages} ({totalElements} warga)
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 rounded-xl transition-colors cursor-pointer select-none"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL PRATINJAU FOTO PROFIL WARGA (PHOTO ONLY PREVIEW) */}
      <AnimatePresence>
        {previewPhotoWarga && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setPreviewPhotoWarga(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 relative p-5"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-base truncate">
                      {previewPhotoWarga.nama}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                      {previewPhotoWarga.role === 'admin'
                        ? 'Ketua RT'
                        : previewPhotoWarga.role === 'pengurus'
                        ? 'Pengurus RT'
                        : previewPhotoWarga.role === 'bendahara'
                        ? 'Bendahara'
                        : previewPhotoWarga.role === 'sekretaris'
                        ? 'Sekretaris'
                        : 'Warga'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {previewPhotoWarga.alamat || 'RT 01'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewPhotoWarga(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer shrink-0"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>

              {/* Tampilan Foto Profil Utama */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative shadow-inner border border-slate-200">
                {previewPhotoWarga.photo ? (
                  <img 
                    src={previewPhotoWarga.photo} 
                    alt={previewPhotoWarga.nama} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center text-3xl font-black mb-3 border-2 border-slate-700">
                      {(previewPhotoWarga.nama || 'W').charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold text-slate-300">Belum Mengunggah Foto Profil</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Foto kustom belum diatur pada akun ini</p>
                  </div>
                )}
              </div>

              {/* Rincian Profil & No. KK di Modal Pratinjau */}
              <div className="mt-3 space-y-2">
                {getResolvedNoKk(previewPhotoWarga) ? (
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold text-teal-700 uppercase tracking-wider">No. Kartu Keluarga (KK)</p>
                      <p className="font-mono font-black text-xs sm:text-sm text-teal-950 tracking-wider mt-0.5 truncate">
                        {getResolvedNoKk(previewPhotoWarga)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const num = getResolvedNoKk(previewPhotoWarga);
                        navigator.clipboard.writeText(num);
                        showStatusBanner(`No. KK ${num} berhasil disalin!`);
                      }}
                      className="px-2.5 py-1 text-[10px] font-extrabold bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Salin
                    </button>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Status Warga</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{previewPhotoWarga.status || 'Warga Tetap'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Keluarga</p>
                    <p className="text-xs font-bold text-teal-700 mt-0.5 truncate">
                      👨‍👩‍👧‍👦 {((previewPhotoWarga.members || []).length) + 1} Jiwa
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => setPreviewPhotoWarga(null)}
                className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Tutup Pratinjau Foto
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocs && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewDocs(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] w-full max-w-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Dokumen Kartu Keluarga / Identitas</h3>
                  <p className="text-xs text-gray-500">{previewDocs.wargaName} — {previewDocs.docs[previewDocs.currentIndex].title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDocs.docs[previewDocs.currentIndex].url}
                    download={`${previewDocs.wargaName.replace(/\s+/g, '_')}_${previewDocs.docs[previewDocs.currentIndex].title.replace(/\s+/g, '_')}`}
                    className="text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Unduh
                  </a>
                  <button onClick={() => setPreviewDocs(null)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-auto text-center flex items-center justify-center relative min-h-[50vh] bg-gray-100/50">
                {previewDocs.docs.length > 1 && (
                  <button onClick={() => setPreviewDocs({ ...previewDocs, currentIndex: (previewDocs.currentIndex - 1 + previewDocs.docs.length) % previewDocs.docs.length })} className="absolute left-2 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white z-10 transition-transform hover:scale-105 cursor-pointer">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                )}

                {isPdfUrl(previewDocs.docs[previewDocs.currentIndex].url) ? (
                  <iframe
                    src={previewDocs.docs[previewDocs.currentIndex].url}
                    title={previewDocs.docs[previewDocs.currentIndex].title}
                    className="w-full h-[65vh] rounded-xl border border-gray-200 bg-white"
                  />
                ) : (
                  <img
                    src={previewDocs.docs[previewDocs.currentIndex].url}
                    alt="Dokumen"
                    className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-sm"
                  />
                )}

                {previewDocs.docs.length > 1 && (
                  <button onClick={() => setPreviewDocs({ ...previewDocs, currentIndex: (previewDocs.currentIndex + 1) % previewDocs.docs.length })} className="absolute right-2 bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white z-10 transition-transform hover:scale-105 cursor-pointer">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                )}
              </div>

              {previewDocs.docs.length > 1 && (
                <div className="flex justify-center p-3 gap-2 bg-white">
                  {previewDocs.docs.map((_, index) => (
                    <div key={index} className={`h-2.5 rounded-full transition-all duration-300 ${index === previewDocs.currentIndex ? 'w-6 bg-teal-500' : 'w-2.5 bg-gray-200'}`} />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DIALOG: EDIT / TAMBAH ANGGOTA KELUARGA */}
      <AnimatePresence>
        {showMemberForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">
                    {editingMember ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kepala Keluarga:{' '}
                    <span className="font-bold text-teal-700">
                      {wargaData.find(w => w.id === activeWargaId)?.nama ||
                        allWargaKkData.find(w => w.id === activeWargaId)?.nama ||
                        'Warga'}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberForm(false);
                    setEditingMember(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Nama Lengkap Anggota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Siti Aisyah"
                    value={memberForm.name}
                    onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                    required
                    autoFocus
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Status Hubungan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={memberForm.role}
                      onChange={e => {
                        const r = e.target.value;
                        const autoJk = r === 'Istri' ? 'Perempuan' : r === 'Suami' || r === 'Kepala Keluarga' ? 'Laki-laki' : memberForm.jenisKelamin;
                        setMemberForm({ ...memberForm, role: r, jenisKelamin: autoJk });
                      }}
                      required
                      className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                    >
                      <option value="">-- Pilih Hubungan --</option>
                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Cucu">Cucu</option>
                      <option value="Kerabat">Kerabat</option>
                      <option value="Famili Lain">Famili Lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={memberForm.jenisKelamin || 'Laki-laki'}
                      onChange={e => setMemberForm({ ...memberForm, jenisKelamin: e.target.value })}
                      required
                      className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={memberForm.tglLahir}
                      onChange={handleTglLahirMemberChange}
                      className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Usia (Tahun) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="Contoh: 15"
                      value={String(memberForm.age || '').replace(/\D/g, '')}
                      onChange={e => setMemberForm({ ...memberForm, age: e.target.value })}
                      required
                      className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  {editingMember && (isKetuaRT || activeWargaId === currentUser?.id || currentUser?.username === (wargaData.find(w => w.id === activeWargaId)?.username || '')) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editingMember) {
                          handleDeleteMember(activeWargaId, editingMember.id || editingMember._id || editingMember.name);
                        }
                      }}
                      className="px-3 py-3 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <icons.delete className="w-4 h-4" />
                      <span>Hapus Anggota</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberForm(false);
                      setEditingMember(null);
                    }}
                    className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMember}
                    className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingMember ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Anggota</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
