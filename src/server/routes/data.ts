import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  SuratModel,
  LaporanModel,
  AcaraModel,
  UmkmModel,
  KasModel,
  IuranModel,
  DaruratModel,
  TamuModel,
  MediaModel,
  DokumenModel,
  InventarisModel,
  NotulenModel,
  NotificationModel,
  UserModel
} from "../db";
import {
  requireRole,
  getScopedRtId,
  logAudit,
  addNotification,
  broadcastEvent
} from "../middleware/auth";

export const dataRouter = Router();

const RESOURCE_MODELS: Record<string, mongoose.Model<any>> = {
  surat: SuratModel,
  laporan: LaporanModel,
  acara: AcaraModel,
  umkm: UmkmModel,
  kas: KasModel,
  iuran: IuranModel,
  darurat: DaruratModel,
  tamu: TamuModel,
  media: MediaModel,
  dokumen: DokumenModel,
  inventaris: InventarisModel,
  notulen: NotulenModel
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generic GET resource endpoint with Multi-Tenant Scoping & Pagination
dataRouter.get("/data/:resource", async (req: Request, res: Response) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const rawLimit = parseInt(req.query.limit as string) || 0;
  const limit = Math.min(100, Math.max(0, rawLimit));
  const search = req.query.search as string;

  let sortField = "createdAt";
  if (resource === 'notulen' || resource === 'acara') {
    sortField = "date";
  }

  const query: any = { rtId };
  if (req.query.userId) query.userId = req.query.userId;
  if (req.query.status) query.status = req.query.status;
  if (req.query.type) query.type = req.query.type;

  if (search && search.trim()) {
    const escaped = escapeRegex(search.trim());
    const searchRegex = { $regex: escaped, $options: 'i' };
    if (resource === 'kas' || resource === 'iuran') {
      query.$or = [{ name: searchRegex }, { message: searchRegex }, { nama: searchRegex }];
    } else if (resource === 'laporan' || resource === 'surat' || resource === 'acara' || resource === 'umkm') {
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { judul: searchRegex }, { deskripsi: searchRegex }, { nama: searchRegex }];
    }
  }

  let balances: any = undefined;
  if (resource === 'kas') {
    try {
      const aggregateResult = await KasModel.aggregate([
        { $match: { rtId } },
        {
          $group: {
            _id: { category: "$category", type: "$type" },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      balances = { "Kas RT": 0, "Dana Kematian": 0, "Dana Sosial": 0 };
      const catAmounts: { [key: string]: { Masuk: number; Keluar: number } } = {};

      aggregateResult.forEach((item: any) => {
        const category = item._id.category || "Kas RT";
        const type = item._id.type;
        if (!catAmounts[category]) catAmounts[category] = { Masuk: 0, Keluar: 0 };
        if (type === 'Masuk') catAmounts[category].Masuk += item.totalAmount;
        else if (type === 'Keluar') catAmounts[category].Keluar += item.totalAmount;
      });

      Object.keys(catAmounts).forEach(cat => {
        balances[cat] = catAmounts[cat].Masuk - catAmounts[cat].Keluar;
      });
    } catch (e) {
      console.error("Gagal menjumlahkan saldo Kas:", e);
    }
  }

  let dbQuery = model.find(query).sort({ [sortField]: -1 });

  if (limit > 0) {
    const total = await model.countDocuments(query);
    const skip = (page - 1) * limit;
    const results = await dbQuery.skip(skip).limit(limit).lean();
    return res.json({
      data: results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      balances
    });
  } else {
    const results = await dbQuery.lean();
    return res.json({ data: results, balances });
  }
});

// Generic POST resource endpoint
dataRouter.post("/data/:resource", async (req: Request, res: Response) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const role = req.user?.role || 'warga';
  const userId = req.user?.id || '';
  const userNama = req.user?.nama || 'Warga';

  // Role authorization
  if (resource === 'kas') {
    if (!['admin', 'developer', 'bendahara'].includes(role)) {
      return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT atau Bendahara yang dapat menginput transaksi kas." });
    }
  }
  if (['acara', 'inventaris', 'darurat'].includes(resource)) {
    if (!['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(role)) {
      return res.status(403).json({ error: `Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan ${resource}.` });
    }
  }
  if (resource === 'notulen') {
    if (!['admin', 'developer', 'sekretaris'].includes(role)) {
      return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT atau Sekretaris yang dapat membuat notulen rapat." });
    }
  }

  const itemId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
  const newItemData: any = {
    id: itemId,
    rtId,
    createdAt: new Date().toISOString(),
    ...req.body
  };

  if (resource === 'umkm') {
    newItemData.nama = req.body.nama || req.body.name || 'Usaha Warga';
    newItemData.name = newItemData.nama;
    newItemData.owner = req.body.owner || userNama;
    newItemData.ownerId = req.body.ownerId || userId;
    newItemData.kontak = req.body.kontak || req.body.phone || '';
    newItemData.phone = newItemData.kontak;
    newItemData.category = req.body.category || 'Kuliner';
    newItemData.status = 'menunggu_verifikasi';
  }

  if (resource === 'surat') {
    const count = await SuratModel.countDocuments({ rtId });
    const sequence = String(count + 1).padStart(2, '0');
    const rtNum = rtId.match(/\d+/)?.[0] || '1';
    const formattedRt = `RT-${String(rtNum).padStart(3, '0')}`;
    const d = new Date();
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonth = months[d.getMonth()];
    newItemData.nomorSurat = `${sequence}/${formattedRt}/RW-021/${currentMonth}/${d.getFullYear()}`;
    newItemData.userId = userId;
    newItemData.userName = userNama;
  }

  if (resource === 'iuran' && typeof newItemData.nominal === 'string') {
    newItemData.nominal = Number(newItemData.nominal);
  }
  if (resource === 'kas' && typeof newItemData.amount === 'string') {
    newItemData.amount = Number(newItemData.amount);
  }

  const createdItem = await model.create(newItemData);
  await logAudit(rtId, userNama, `CREATE_${resource.toUpperCase()}`, `Memasukkan record baru ke modul ${resource}`);

  // Fund splitting logic on verified payments
  if (resource === 'iuran' && createdItem.status === 'verifikasi') {
    const nominal = parseInt(createdItem.nominal || '0', 10);
    if (createdItem.jenis === 'Wifi') {
      await KasModel.create({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        type: 'Masuk',
        amount: 10000,
        name: createdItem.nama,
        message: 'Pembayaran Wifi (Kas RT)',
        category: 'Kas RT',
        iuranId: createdItem.id,
        rtId,
        status: 'selesai'
      });
    } else {
      const isSplit = nominal >= 5000;
      const danaKematianAmount = isSplit ? 5000 : 0;
      const kasRTAmount = nominal - danaKematianAmount;
      if (kasRTAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          createdAt: new Date().toISOString(),
          type: 'Masuk',
          amount: kasRTAmount,
          name: createdItem.nama,
          message: 'Iuran Warga (Kas RT)',
          category: 'Kas RT',
          iuranId: createdItem.id,
          rtId,
          status: 'selesai'
        });
      }
      if (danaKematianAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          createdAt: new Date().toISOString(),
          type: 'Masuk',
          amount: danaKematianAmount,
          name: createdItem.nama,
          message: 'Iuran Warga (Dana Kematian)',
          category: 'Dana Kematian',
          iuranId: createdItem.id,
          rtId,
          status: 'selesai'
        });
      }
    }
  }

  broadcastEvent('update', { type: resource, rtId });
  return res.json({ message: "Created successfully", item: createdItem });
});

// Generic PUT resource endpoint
dataRouter.put("/data/:resource/:id", async (req: Request, res: Response) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const role = req.user?.role || 'warga';
  const userId = req.user?.id || '';

  if (['kas', 'iuran'].includes(resource)) {
    if (!['admin', 'developer', 'bendahara'].includes(role)) {
      return res.status(403).json({ error: `Akses ditolak: Hanya Ketua RT atau Bendahara yang dapat mengedit ${resource}.` });
    }
  }

  const oldItem = await model.findOne({ id: req.params.id, rtId });
  if (!oldItem) return res.status(404).json({ error: "Item tidak ditemukan" });

  const updatePayload = { ...req.body };
  if (updatePayload.nominal !== undefined) updatePayload.nominal = Number(updatePayload.nominal);
  if (updatePayload.amount !== undefined) updatePayload.amount = Number(updatePayload.amount);

  const updatedItem = await model.findOneAndUpdate({ id: req.params.id, rtId }, updatePayload, { new: true });
  await logAudit(rtId, req.user?.nama || 'Sistem', `UPDATE_${resource.toUpperCase()}`, `Mengupdate data modul ${resource}`);
  broadcastEvent('update', { type: resource, rtId });

  return res.json({ message: "Updated successfully", item: updatedItem });
});

// Generic DELETE resource endpoint
dataRouter.delete("/data/:resource/:id", async (req: Request, res: Response) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const role = req.user?.role || 'warga';

  if (!['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(role)) {
    return res.status(403).json({ error: `Akses ditolak: Operasi hapus hanya untuk pengurus RT.` });
  }

  const oldItem = await model.findOne({ id: req.params.id, rtId });
  if (!oldItem) return res.status(404).json({ error: "Item tidak ditemukan" });

  await model.deleteOne({ id: req.params.id, rtId });
  await logAudit(rtId, req.user?.nama || 'Admin', `DELETE_${resource.toUpperCase()}`, `Menghapus record modul ${resource}`);
  broadcastEvent('update', { type: resource, rtId });

  return res.json({ message: "Deleted successfully" });
});

// Sedekah endpoint
dataRouter.post("/sedekah", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const { name, amount, message, paymentMethod } = req.body;
  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount < 1000) {
    return res.status(400).json({ error: "Jumlah donasi minimal Rp 1.000." });
  }

  const donatorName = name && name.trim() !== '' ? name.trim() : 'Hamba Allah';

  const newKas = await KasModel.create({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    type: 'Masuk',
    amount: parsedAmount,
    name: donatorName,
    message: `[Infaq & Sedekah - ${paymentMethod || 'Transfer'}] ${message || 'Infaq Masjid Al Ikhlas'}`,
    category: 'Lainnya',
    rtId,
    status: 'selesai'
  });

  await logAudit(rtId, donatorName, "CREATE_SEDEKAH", `Menerima donasi sedekah Rp ${parsedAmount.toLocaleString('id-ID')}`);
  await addNotification(rtId, "Infaq/Sedekah Diterima", `Alhamdulillah, donasi Rp ${parsedAmount.toLocaleString('id-ID')} dari ${donatorName} diterima.`, donatorName);
  broadcastEvent('update', { type: 'kas', rtId });

  return res.json({ message: "Donasi berhasil diterima. Terima kasih!", item: newKas });
});

// Notifications endpoints
dataRouter.get("/notifications", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const list = await NotificationModel.find({ rtId }).sort({ time: -1 }).limit(50).lean();
  return res.json({ notifications: list });
});

dataRouter.post("/notifications/read", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  await NotificationModel.updateMany({ rtId }, { $set: { read: true } });
  broadcastEvent('update', { type: 'notifications', rtId });
  return res.json({ success: true });
});

// Broadcast endpoint
dataRouter.post("/broadcast", requireRole(['admin', 'pengurus', 'sekretaris', 'bendahara']), async (req: Request, res: Response) => {
  const { title, message } = req.body;
  const rtId = getScopedRtId(req);

  if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong" });

  await logAudit(rtId, req.user?.nama || 'Admin', "BROADCAST", `Mengirimkan pengumuman: ${title || 'Pemberitahuan'}`);
  await addNotification(rtId, title || "📢 Pengumuman RT", message, req.user?.nama || 'Admin', "broadcast");
  return res.json({ success: true, message: "Pesan broadcast berhasil dikirim ke semua warga" });
});
