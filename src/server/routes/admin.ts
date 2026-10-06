import { Router, Request, Response } from "express";
import {
  AuditLogModel,
  UserModel,
  RtConfigModel,
  MenuAccessModel,
  KasModel,
  IuranModel,
  VotingModel,
  AcaraModel,
  LaporanModel,
  SuratModel,
  UmkmModel,
  TamuModel,
  MediaModel,
  DaruratModel
} from "../db";
import {
  requireRole,
  getScopedRtId,
  logAudit,
  addNotification,
  broadcastEvent
} from "../middleware/auth";
import { activeSessions } from "./auth";

export const adminRouter = Router();

// Audit logs retrieval
adminRouter.get("/audit-logs", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  try {
    const logs = await AuditLogModel.find({ rtId }).sort({ timestamp: -1 }).limit(150).lean();
    return res.json({ data: logs });
  } catch {
    return res.status(500).json({ error: "Gagal membaca audit logs" });
  }
});

// Developer statistics
adminRouter.get("/developer/stats", requireRole(['developer']), async (_req: Request, res: Response) => {
  try {
    const registeredCount = await UserModel.countDocuments({});
    const onlineCount = activeSessions.size;
    return res.json({ registeredCount, onlineCount });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil statistik developer" });
  }
});

// RT VIP toggle
adminRouter.put("/developer/rt/:rtId/vip", requireRole(['developer']), async (req: Request, res: Response) => {
  try {
    const targetRtId = req.params.rtId;
    const { isVip } = req.body;
    await RtConfigModel.findOneAndUpdate(
      { rtId: targetRtId },
      { isVip },
      { upsert: true, new: true }
    );
    return res.json({ success: true, message: `Status VIP RT ${targetRtId} diubah menjadi ${isVip}.` });
  } catch {
    return res.status(500).json({ error: "Gagal memperbarui status VIP" });
  }
});

// Public RT list
adminRouter.get("/public/rt-list", async (_req: Request, res: Response) => {
  try {
    const configs = await RtConfigModel.find({}).lean();
    const rtsAgg = await UserModel.aggregate([
      { $match: { role: { $ne: 'developer' } } },
      { $group: { _id: "$rtId" } }
    ]);

    const allRtSet = new Set<string>(['rt01', 'rt02', 'rt03']);
    configs.forEach(c => { if (c.rtId) allRtSet.add(c.rtId); });
    rtsAgg.forEach(r => { if (r._id) allRtSet.add(r._id); });

    const list = Array.from(allRtSet).sort().map(id => {
      let label = id.toUpperCase();
      if (id.startsWith('rt')) {
        label = `RT ${id.substring(2)}`;
      }
      return { id, label };
    });

    return res.json({ success: true, data: list });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil daftar RT" });
  }
});

// Developer RT management
adminRouter.get("/developer/rt", requireRole(['developer']), async (_req: Request, res: Response) => {
  try {
    const rtsAgg = await UserModel.aggregate([
      { $match: { role: { $ne: 'developer' } } },
      { $group: { _id: "$rtId", totalUsers: { $sum: 1 } } }
    ]);
    const userCountMap = new Map();
    rtsAgg.forEach(r => { if (r._id) userCountMap.set(r._id, r.totalUsers); });

    const configs = await RtConfigModel.find({});
    const configMap = new Map();
    configs.forEach(c => configMap.set(c.rtId, c.isVip));

    const allRtIds = new Set<string>(['rt01', 'rt02', 'rt03']);
    configs.forEach(c => { if (c.rtId) allRtIds.add(c.rtId); });
    rtsAgg.forEach(r => { if (r._id) allRtIds.add(r._id); });

    const result = Array.from(allRtIds).map(rtId => ({
      rtId,
      totalUsers: userCountMap.get(rtId) || 0,
      isVip: configMap.get(rtId) || false
    })).sort((a, b) => a.rtId.localeCompare(b.rtId));

    return res.json({ success: true, data: result });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil rekap RT" });
  }
});

adminRouter.post("/developer/rt", requireRole(['developer']), async (req: Request, res: Response) => {
  try {
    const { rtId, isVip } = req.body;
    if (!rtId || typeof rtId !== 'string' || !rtId.trim()) {
      return res.status(400).json({ error: "Nomor RT wajib diisi." });
    }

    let cleanRtId = rtId.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanRtId.startsWith('rt')) {
      const num = parseInt(cleanRtId, 10);
      cleanRtId = !isNaN(num) ? `rt${num < 10 ? '0' + num : num}` : `rt_${cleanRtId}`;
    }

    const existing = await RtConfigModel.findOne({ rtId: cleanRtId });
    if (existing) {
      return res.status(400).json({ error: `Nomor RT [${cleanRtId.toUpperCase()}] sudah terdaftar.` });
    }

    const newConfig = await RtConfigModel.create({
      rtId: cleanRtId,
      isVip: Boolean(isVip)
    });

    broadcastEvent('update', { type: 'rt_list_update' });
    return res.json({ success: true, message: `Nomor RT [${cleanRtId.toUpperCase()}] berhasil ditambahkan.`, rt: newConfig });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Gagal menambahkan RT baru" });
  }
});

// Menu permissions
adminRouter.get("/menu-permissions", async (_req: Request, res: Response) => {
  try {
    const list = await MenuAccessModel.find({}).lean();
    return res.json({ data: list });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil konfigurasi menu" });
  }
});

adminRouter.post("/menu-permissions", requireRole(['developer']), async (req: Request, res: Response) => {
  const { role, allowedMenus, createMenus, updateMenus, deleteMenus } = req.body;
  if (!role || !Array.isArray(allowedMenus)) {
    return res.status(400).json({ error: "Parameter role dan allowedMenus dibutuhkan." });
  }

  try {
    const updated = await MenuAccessModel.findOneAndUpdate(
      { role },
      {
        allowedMenus,
        createMenus: Array.isArray(createMenus) ? createMenus : [],
        updateMenus: Array.isArray(updateMenus) ? updateMenus : [],
        deleteMenus: Array.isArray(deleteMenus) ? deleteMenus : []
      },
      { upsert: true, new: true }
    );
    broadcastEvent('update', { type: 'menu_permissions', role });
    return res.json({ message: `Hak akses menu untuk role ${role} berhasil diperbarui`, data: updated });
  } catch {
    return res.status(500).json({ error: "Gagal memperbarui konfigurasi menu" });
  }
});

// Automatic iuran reminders
adminRouter.post("/iuran/remind", requireRole(['admin', 'pengurus', 'sekretaris', 'bendahara', 'developer']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const { bulan, tahun, jenis, messageTemplate } = req.body;

  if (!bulan || !tahun) {
    return res.status(400).json({ error: "Bulan dan tahun harus diisi" });
  }

  const period = `${bulan} ${tahun}`;
  const targetJenis = jenis || "Iuran Wajib";

  try {
    const wargaList = await UserModel.find({ rtId, isApproved: true }).lean();
    const paidRecords = await IuranModel.find({ rtId, bulan: period, jenis: targetJenis }).lean();
    const unpaidWarga: any[] = [];
    const remindedNames: string[] = [];

    for (const user of wargaList) {
      if (['admin', 'bendahara', 'developer'].includes(user.role)) continue;
      const record = paidRecords.find(r => r.userId === user.id);
      if (!record || record.status === 'belum dibayar') {
        unpaidWarga.push(user);
        const finalMessage = messageTemplate
          ? messageTemplate.replace(/{nama}/g, user.nama).replace(/{bulan}/g, period).replace(/{jenis}/g, targetJenis)
          : `Halo ${user.nama}, Anda belum melakukan pembayaran ${targetJenis} untuk periode ${period}. Silakan bayar melalui menu Iuran.`;
        await addNotification(rtId, `Pengingat ${targetJenis}`, finalMessage, 'Sistem', 'iuran', record?.id || 'unpaid');
        remindedNames.push(user.nama);
      }
    }

    await logAudit(rtId, req.user?.nama || 'Admin', "REMIND_IURAN", `Mengirim pengingat iuran ${targetJenis} periode ${period} kepada ${unpaidWarga.length} warga.`);
    return res.json({ success: true, count: unpaidWarga.length, reminded: remindedNames });
  } catch {
    return res.status(500).json({ error: "Gagal mengirim pengingat iuran" });
  }
});

// Database backup export
adminRouter.get("/backup/export", requireRole(['admin']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  try {
    const [users, kas, iuran, voting, acara, laporan, surat, umkm, tamu, media, darurat, logs] = await Promise.all([
      UserModel.find({ rtId }).select('-password').lean(),
      KasModel.find({ rtId }).lean(),
      IuranModel.find({ rtId }).lean(),
      VotingModel.find({ rtId }).lean(),
      AcaraModel.find({ rtId }).lean(),
      LaporanModel.find({ rtId }).lean(),
      SuratModel.find({ rtId }).lean(),
      UmkmModel.find({ rtId }).lean(),
      TamuModel.find({ rtId }).lean(),
      MediaModel.find({ rtId }).lean(),
      DaruratModel.find({ rtId }).lean(),
      AuditLogModel.find({ rtId }).lean()
    ]);

    const snapshot = {
      rtId,
      exportedAt: new Date().toISOString(),
      formatVersion: "2.0",
      stats: { users: users.length, kas: kas.length, iuran: iuran.length, voting: voting.length, laporan: laporan.length, auditLogs: logs.length },
      collections: { users, kas, iuran, voting, acara, laporan, surat, umkm, tamu, media, darurat, auditLogs: logs }
    };

    await logAudit(rtId, req.user?.nama || "Admin", "EXPORT_DATABASE", "Melakukan ekspor database cadangan RT");
    res.setHeader("Content-disposition", `attachment; filename=CADANGAN_DATABASE_RT_${rtId.toUpperCase()}_${new Date().toISOString().split('T')[0]}.json`);
    res.setHeader("Content-Type", "application/json");
    return res.send(JSON.stringify(snapshot, null, 2));
  } catch {
    return res.status(500).json({ error: "Gagal mengekspor database cadangan." });
  }
});
