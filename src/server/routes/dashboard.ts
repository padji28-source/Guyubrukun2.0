import { Router, Request, Response } from "express";
import { UserModel, KasModel, IuranModel, LaporanModel, AcaraModel, MediaModel } from "../db";
import { getScopedRtId } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);

  try {
    const [users, kas, iuran, laporan, acara, media] = await Promise.all([
      UserModel.find({ rtId, role: { $ne: 'developer' } })
        .select('id nama role status alamat noHp photo umur tglLahir jenisKelamin members dokumenKk dokumenKtp')
        .lean(),
      KasModel.find({ rtId }).select('type amount status category createdAt').lean(),
      IuranModel.find({ rtId }).select('bulan status nominal').lean(),
      LaporanModel.find({ rtId }).select('id judul deskripsi status nama userName kategori createdAt').lean(),
      AcaraModel.find({ rtId }).select('id title date time location rtId createdAt').lean(),
      MediaModel.find({ rtId }).select('id imageUrl title uploaderName rtId createdAt').lean()
    ]);

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

    let balitaCount = 0;
    let anakCount = 0;
    let remajaCount = 0;
    let dewasaCount = 0;
    let lansiaCount = 0;
    let lakiLakiCount = 0;
    let perempuanCount = 0;

    const categorizeAge = (age: number) => {
      if (age < 0) return;
      if (age <= 4) balitaCount++;
      else if (age <= 12) anakCount++;
      else if (age <= 20) remajaCount++;
      else if (age <= 70) dewasaCount++;
      else lansiaCount++;
    };

    const countGender = (g?: string) => {
      const norm = String(g || '').trim().toLowerCase();
      if (norm.startsWith('p') || norm.includes('perempuan') || norm.includes('wanita')) {
        perempuanCount++;
      } else if (norm.startsWith('l') || norm.includes('laki') || norm.includes('pria')) {
        lakiLakiCount++;
      }
    };

    const jumlahKK = users.length;
    let totalWarga = jumlahKK;
    let docUploaded = 0;

    users.forEach((u: any) => {
      totalWarga += (u.members?.length || 0);
      categorizeAge(resolvePersonAge(u.umur, u.tglLahir));
      countGender(u.jenisKelamin);

      if (Array.isArray(u.members)) {
        u.members.forEach((m: any) => {
          categorizeAge(resolvePersonAge(m.age, m.tglLahir));
          countGender(m.jenisKelamin);
        });
      }
      const hasKk = Boolean(u.dokumenKk && String(u.dokumenKk).trim() !== '');
      const hasKtp = Array.isArray(u.dokumenKtp) ? u.dokumenKtp.length > 0 : Boolean(u.dokumenKtp && String(u.dokumenKtp).trim() !== '');
      if (hasKk || hasKtp) {
        docUploaded++;
      }
    });

    const docNotUploaded = Math.max(0, jumlahKK - docUploaded);
    const totalWithAge = balitaCount + anakCount + remajaCount + dewasaCount + lansiaCount;

    const demographics = {
      balita: balitaCount,
      anak: anakCount,
      remaja: remajaCount,
      dewasa: dewasaCount,
      lansia: lansiaCount,
      lakiLaki: lakiLakiCount,
      perempuan: perempuanCount,
      totalWithAge,
      groups: [
        { key: 'balita', name: 'Balita', range: '0 - 4 Thn', count: balitaCount, fill: '#3b82f6' },
        { key: 'anak', name: 'Anak', range: '5 - 12 Thn', count: anakCount, fill: '#10b981' },
        { key: 'remaja', name: 'Remaja', range: '13 - 20 Thn', count: remajaCount, fill: '#8b5cf6' },
        { key: 'dewasa', name: 'Dewasa', range: '21 - 70 Thn', count: dewasaCount, fill: '#f97316' },
        { key: 'lansia', name: 'Lansia', range: '> 70 Thn', count: lansiaCount, fill: '#f43f5e' }
      ]
    };

    const roleOrder: Record<string, number> = { admin: 1, sekretaris: 2, bendahara: 3, pengurus: 4 };
    const pengurusRaw = users
      .filter((u: any) => ['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(u.role))
      .sort((a: any, b: any) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

    const pengurusList = pengurusRaw.map((u: any, idx: number) => {
      let jabatan = 'Pengurus RT';
      if (u.role === 'admin') jabatan = 'Ketua RT 01 / RW 21';
      else if (u.role === 'sekretaris') jabatan = 'Sekretaris RT';
      else if (u.role === 'bendahara') jabatan = 'Bendahara RT';
      else if (u.role === 'pengurus') jabatan = idx === 3 ? 'Koordinator Keamanan' : 'Koordinator Sosial';
      return {
        id: u.id,
        nama: u.nama,
        role: u.role,
        jabatan,
        alamat: u.alamat || 'Lingkungan RT',
        noHp: u.noHp || '',
        photo: u.photo || ''
      };
    });

    const getSaldo = (cat: string) => {
      const catItems = kas.filter((d: any) => (d.category || 'Kas RT') === cat);
      const catM = catItems.filter((d: any) => d.type === 'Masuk').reduce((a: number, b: any) => a + (b.amount || 0), 0);
      const catK = catItems.filter((d: any) => d.type === 'Keluar').reduce((a: number, b: any) => a + (b.amount || 0), 0);
      return catM - catK;
    };

    const kasRT = getSaldo('Kas RT');
    const danaKematian = getSaldo('Dana Kematian');
    const danaSosial = getSaldo('Dana Sosial');
    const saldoKas = kasRT + danaKematian + danaSosial;

    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const currentIuran = iuran.filter((i: any) => i.bulan === currentMonth);
    const totalIuranCount = currentIuran.length > 0 ? currentIuran.length : iuran.length;
    const lunasCount = (currentIuran.length > 0 ? currentIuran : iuran).filter((i: any) => i.status === 'verifikasi').length;
    const totalAmount = (currentIuran.length > 0 ? currentIuran : iuran).reduce((acc: number, curr: any) => acc + (Number(curr.nominal) || 0), 0);
    const lunasPct = totalIuranCount > 0 ? Math.round((lunasCount / totalIuranCount) * 100) : 0;

    const pengaduanAktif = laporan.filter((l: any) => l.status === 'menunggu' || l.status === 'diproses' || l.status === 'baru');

    const now = new Date();
    const agendaUpcoming = acara.filter((ac: any) => {
      const acDate = new Date(ac.time || ac.date);
      return acDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }).sort((a: any, b: any) => new Date(a.time || a.date).getTime() - new Date(b.time || b.date).getTime()).slice(0, 5);

    return res.json({
      metrics: {
        jumlahKK,
        jumlahWarga: totalWarga,
        docUploaded,
        docNotUploaded,
        demographics,
        pengurusList,
        saldoKas,
        kasDetail: { kasRT, danaKematian, danaSosial },
        iuranBulanIni: { lunasPct, totalIuranCount, lunasCount, totalAmount },
        pengaduanAktif,
        agendaUpcoming,
        wargaList: users.map(u => ({ _id: u._id, id: u.id, nama: u.nama, role: u.role }))
      },
      kas,
      laporan,
      acara,
      media
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return res.status(500).json({ error: "Gagal mengambil data dashboard" });
  }
});
