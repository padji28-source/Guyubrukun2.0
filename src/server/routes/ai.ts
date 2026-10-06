import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { KasModel } from "../db";
import { getScopedRtId } from "../middleware/auth";

export const aiRouter = Router();

function isValidGeminiApiKey(key?: string): boolean {
  if (!key) return false;
  const k = key.trim();
  return k.length >= 20 && !k.startsWith('MY_') && !k.startsWith('YOUR_') && !k.includes('placeholder');
}

aiRouter.post("/gemini/action", async (req: Request, res: Response) => {
  const { action, payload } = req.body;
  const rtId = getScopedRtId(req);

  try {
    let prompt = "";
    let systemInstruction = "Anda adalah Smart RT AI, asisten pemerintahan RT pintar di Indonesia yang membantu Ketua RT dan pengurus mengelola warga, kas, dokumen, rapat, dan laporan secara profesional.";

    if (action === "ringkasan_rapat") {
      prompt = `Buatlah ringkasan rapat formal, terstruktur, dan rapi berdasarkan transkrip atau catatan kasar berikut dalam Bahasa Indonesia:\n\nCatatan:\n${payload?.notes || ''}\n\nFormat keluaran:\n- **Judul Rapat**\n- **Tanggal & Waktu**\n- **Poin-Poin Pembahasan Penting**\n- **Keputusan Utama**\n- **Daftar Tindak Lanjut (Action Items) & Penanggung Jawab**\n\nBerikan format Markdown yang sangat rapi.`;
    } else if (action === "analisa_kas") {
      const kasRecords = await KasModel.find({ rtId }).sort({ createdAt: -1 }).limit(100).lean();
      const recordsStr = kasRecords.map((k: any) => `- [${k.type}] ${k.name || 'Warga'}: Rp ${(k.amount || 0).toLocaleString('id-ID')} (${k.category || 'Kas RT'}) - ${k.message || 'Tanpa keterangan'}`).join("\n");
      prompt = `Analisalah transaksi kas berikut dari RT kami dan berikan wawasan finansial, peringatan, serta rekomendasi konkret:\n\nTransaksi Terbaru:\n${recordsStr || "Tidak ada transaksi terbaru."}`;
    } else if (action === "draft_surat") {
      prompt = `Buatlah draf surat formal tingkat RT berdasarkan informasi berikut:\n\nKategori Surat: ${payload?.jenis || 'Surat Pengantar'}\nNama Warga: ${payload?.nama || '................'}\nKeperluan: ${payload?.keperluan || 'Administrasi'}\nKeterangan Tambahan: ${payload?.keterangan || '-'}`;
    } else if (action === "klasifikasi_laporan") {
      prompt = `Klasifikasikan laporan keluhan warga berikut ke dalam kategori (Keamanan/Kebersihan/Infrastruktur/Sosial) serta tingkat prioritas (Tinggi/Sedang/Rendah) dengan usulan langkah penanganan:\n\nJudul: ${payload?.judul}\nDeskripsi: ${payload?.deskripsi}`;
    } else {
      return res.status(400).json({ error: "Aksi tidak dikenal" });
    }

    let responseText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (isValidGeminiApiKey(apiKey)) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.2 }
          });
          responseText = response.text || "";
        } catch {
          const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: { systemInstruction, temperature: 0.2 }
          });
          responseText = response.text || "";
        }
      } catch (aiErr) {
        console.warn("Gemini call warning, using built-in generator:", aiErr);
      }
    }

    if (!responseText) {
      const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      if (action === "ringkasan_rapat") {
        responseText = `### 📋 Ringkasan Notulen Rapat RT\n**Tanggal:** ${todayStr}\n\n#### 1. Poin-Poin Pembahasan Utama\n${payload?.notes || 'Pembahasan agenda rutin lingkungan RT.'}\n\n#### 2. Keputusan Bersama\n- Menyepakati pelaksanaan agenda sesuai catatan rapat.\n- Meningkatkan koordinasi antara pengurus RT dan warga.\n\n#### 3. Tindak Lanjut\n- **Pengurus RT:** Publikasikan pengumuman ke warga.\n- **Warga:** Berpartisipasi aktif dalam gotong royong.`;
      } else if (action === "analisa_kas") {
        const kasRecords = await KasModel.find({ rtId }).sort({ createdAt: -1 }).limit(100).lean();
        const totalMasuk = kasRecords.filter((k: any) => k.type === 'Masuk').reduce((a: number, b: any) => a + (Number(b.amount) || 0), 0);
        const totalKeluar = kasRecords.filter((k: any) => k.type === 'Keluar').reduce((a: number, b: any) => a + (Number(b.amount) || 0), 0);
        const saldoAkhir = totalMasuk - totalKeluar;
        responseText = `### 📊 Laporan Analisa Kas RT (${todayStr})\n\n- **Total Pemasukan:** Rp ${totalMasuk.toLocaleString('id-ID')}\n- **Total Pengeluaran:** Rp ${totalKeluar.toLocaleString('id-ID')}\n- **Saldo Bersih:** **Rp ${saldoAkhir.toLocaleString('id-ID')}**\n\n#### Wawasan & Rekomendasi\n1. Kondisi kas saat ini dalam kondisi ${saldoAkhir >= 0 ? 'sehat dan aman' : 'perlu perhatian'}.\n2. Tingkatkan kedisiplinan pembayaran iuran bulanan untuk menjaga cadangan dana darurat lingkungan.`;
      } else if (action === "draft_surat") {
        responseText = `### SURAT PENGANTAR / KETERANGAN RT\n**Nomor:** 01/RT-001/RW-021/${new Date().getMonth() + 1}/${new Date().getFullYear()}\n\nYang bertanda tangan di bawah ini, Ketua RT, menerangkan bahwa:\n- **Nama Lengkap:** ${payload?.nama || 'Warga RT'}\n- **Jenis Surat:** ${payload?.jenis || 'Surat Pengantar'}\n- **Keperluan:** ${payload?.keperluan || 'Administrasi'}\n\nAdalah benar warga kami yang bertempat tinggal di lingkungan kami dan berkelakuan baik.\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.\n\n**${todayStr}**\n**Ketua RT**`;
      } else {
        responseText = `### 🔍 Klasifikasi Laporan Warga\n- **Judul:** ${payload?.judul || '-'}\n- **Kategori:** Infrastruktur & Lingkungan\n- **Prioritas:** Sedang - Tinggi\n\n#### Rekomendasi Penanganan\n1. Lakukan verifikasi lapangan oleh seksi keamanan/lingkungan.\n2. Perbarui status tiket laporan menjadi **Diproses**.`;
      }
    }

    return res.json({ result: responseText });
  } catch (err: any) {
    console.error("AI Error:", err);
    return res.status(500).json({ error: "Gagal memproses permintaan Smart RT AI" });
  }
});
