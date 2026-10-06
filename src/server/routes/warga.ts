import { Router, Request, Response } from "express";
import { UserModel } from "../db";
import {
  requireRole,
  getScopedRtId,
  logAudit,
  addNotification,
  broadcastEvent
} from "../middleware/auth";
import { activeSessions } from "./auth";

export const wargaRouter = Router();

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get single warga
wargaRouter.get("/warga/:id", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const targetId = req.params.id;
  const user: any = await UserModel.findOne({ id: targetId, rtId }).select('-password').lean();

  if (!user) {
    return res.status(404).json({ error: "Warga tidak ditemukan" });
  }

  const requester = req.user;
  const isOwner = requester?.id === user.id || requester?.username === user.username;
  const isAdmin = ['admin', 'sekretaris', 'developer'].includes(requester?.role || '');

  if (!isOwner && !isAdmin) {
    delete user.dokumenKk;
    delete user.dokumenKtp;
    if (user.noKk) user.noKk = `${user.noKk.substring(0, 6)}******`;
  }

  return res.json({ user });
});

// List warga with Data Privacy protection
wargaRouter.get("/warga", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const rawLimit = parseInt(req.query.limit as string) || 0;
  const limit = Math.min(100, Math.max(0, rawLimit));
  const search = req.query.search as string;

  const query: any = { rtId, role: { $ne: 'developer' } };
  if (search && search.trim()) {
    const escaped = escapeRegex(search.trim());
    query.$or = [
      { nama: { $regex: escaped, $options: 'i' } },
      { username: { $regex: escaped, $options: 'i' } },
      { alamat: { $regex: escaped, $options: 'i' } },
      { noKk: { $regex: escaped, $options: 'i' } },
      { 'members.name': { $regex: escaped, $options: 'i' } }
    ];
  }

  const requester = req.user;
  const isAdmin = ['admin', 'sekretaris', 'developer'].includes(requester?.role || '');

  let dbQuery = UserModel.find(query).select('-password');

  if (limit > 0) {
    const total = await UserModel.countDocuments(query);
    const skip = (page - 1) * limit;
    const users = await dbQuery.skip(skip).limit(limit).lean();
    const sanitized = users.map((u: any) => {
      const isOwner = requester?.id === u.id;
      const isOnline = activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id)! < 15000;
      if (!isOwner && !isAdmin) {
        delete u.dokumenKk;
        delete u.dokumenKtp;
        if (u.noKk) u.noKk = `${u.noKk.substring(0, 6)}******`;
      }
      return { ...u, isOnline };
    });

    return res.json({
      users: sanitized,
      data: sanitized,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } else {
    const users = await dbQuery.lean();
    const sanitized = users.map((u: any) => {
      const isOwner = requester?.id === u.id;
      const isOnline = activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id)! < 15000;
      if (!isOwner && !isAdmin) {
        delete u.dokumenKk;
        delete u.dokumenKtp;
        if (u.noKk) u.noKk = `${u.noKk.substring(0, 6)}******`;
      }
      return { ...u, isOnline };
    });

    return res.json({ users: sanitized, data: sanitized });
  }
});

// Profile update endpoint
wargaRouter.put("/profile", async (req: Request, res: Response) => {
  const { id, nama, alamat, noHp, status, photo, umur, tglLahir, noKk, dokumenKk, dokumenKtp } = req.body;
  const rtId = getScopedRtId(req);
  const targetId = id || req.user?.id;
  const requester = req.user;

  const isOwner = requester?.id === targetId;
  const isKetua = ['admin', 'developer'].includes(requester?.role || '');

  if (!isOwner && !isKetua) {
    return res.status(403).json({ error: "Akses ditolak: Hanya pemilik akun atau Ketua RT yang dapat memperbarui profil." });
  }

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });

  if (!user) {
    return res.status(404).json({ error: "User tidak ditemukan" });
  }

  const beforeObj = user.toObject();
  if (nama !== undefined && nama !== '') user.nama = nama;
  if (alamat !== undefined) user.alamat = alamat;
  if (noHp !== undefined) user.noHp = noHp;
  if (status !== undefined) user.status = status;
  if (photo !== undefined) user.photo = photo;
  if (umur !== undefined) user.umur = Number(umur);
  if (tglLahir !== undefined) user.tglLahir = tglLahir;
  if (noKk !== undefined) user.noKk = noKk;
  if (dokumenKk !== undefined) {
    user.dokumenKk = dokumenKk;
    user.markModified('dokumenKk');
  }
  if (dokumenKtp !== undefined) {
    user.dokumenKtp = dokumenKtp;
    user.markModified('dokumenKtp');
  }

  const updatedUser = await user.save();
  const cleanUser = updatedUser.toObject();
  delete cleanUser.password;

  await logAudit(user.rtId || rtId, requester?.nama || user.nama, "PROFILE_UPDATE", `Memperbarui rincian profil / dokumen`, beforeObj, cleanUser);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Profile updated successfully", user: cleanUser });
});

// Update KK / KTP documents
wargaRouter.put("/warga/:id/dokumen", async (req: Request, res: Response) => {
  const { noKk, dokumenKk, dokumenKtp } = req.body;
  const rtId = getScopedRtId(req);
  const targetId = req.params.id;
  const requester = req.user;

  const isOwner = requester?.id === targetId;
  const isKetua = ['admin', 'developer'].includes(requester?.role || '');

  if (!isOwner && !isKetua) {
    return res.status(403).json({ error: "Akses ditolak: Hanya pemilik akun atau Ketua RT yang dapat mengunggah dokumen." });
  }

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });

  if (!user) {
    return res.status(404).json({ error: "Warga tidak ditemukan" });
  }

  if (noKk !== undefined) user.noKk = noKk;
  if (dokumenKk !== undefined) {
    user.dokumenKk = dokumenKk;
    user.markModified('dokumenKk');
  }
  if (dokumenKtp !== undefined) {
    user.dokumenKtp = dokumenKtp;
    user.markModified('dokumenKtp');
  }

  const updated = await user.save();
  const clean = updated.toObject();
  delete clean.password;

  await logAudit(user.rtId || rtId, requester?.nama || 'Admin', "UPLOAD_DOKUMEN_WARGA", `Mengunggah/memperbarui dokumen untuk ${user.nama}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Dokumen berhasil disimpan", user: clean });
});

// Dedicated endpoint for Ketua RT / Sekretaris to view all KKs
wargaRouter.get("/warga-dokumen-kk", requireRole(['admin', 'sekretaris']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const users = await UserModel.find({ rtId, role: { $ne: 'developer' } }).select('-password').lean();
  const formatted = users.map((u: any) => ({
    ...u,
    hasKk: Boolean(u.dokumenKk && String(u.dokumenKk).trim() !== ''),
    isOnline: activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id)! < 15000
  }));
  return res.json({ users: formatted });
});

// Family Members Endpoints
wargaRouter.post("/warga/:id/members", async (req: Request, res: Response) => {
  const { name, role, age, tglLahir, jenisKelamin } = req.body;
  const rtId = getScopedRtId(req);
  const targetId = req.params.id;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });

  if (!user) {
    return res.status(404).json({ error: "Data warga tidak ditemukan" });
  }

  const cleanName = String(name || '').trim();
  if (!cleanName) {
    return res.status(400).json({ error: "Nama anggota keluarga tidak boleh kosong" });
  }

  if (!Array.isArray(user.members)) user.members = [];

  const newMember = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    name: cleanName,
    role: role || 'Anggota',
    age: Number(age) || 0,
    tglLahir: tglLahir || '',
    jenisKelamin: jenisKelamin || (role === 'Istri' ? 'Perempuan' : 'Laki-laki')
  };

  user.members.push(newMember);
  user.markModified('members');
  await user.save();

  await logAudit(user.rtId || rtId, req.user?.nama || user.nama, "ADD_FAMILY_MEMBER", `Menambahkan anggota ${cleanName} ke KK ${user.nama}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Anggota keluarga berhasil ditambahkan", member: newMember, user: user.toObject() });
});

wargaRouter.put("/warga/:id/members/:memberId", async (req: Request, res: Response) => {
  const { name, role, age, tglLahir, jenisKelamin } = req.body;
  const rtId = getScopedRtId(req);
  const { id: targetId, memberId } = req.params;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });

  if (!user) {
    return res.status(404).json({ error: "Data warga tidak ditemukan" });
  }

  if (!Array.isArray(user.members)) user.members = [];

  const idx = user.members.findIndex((m: any) => String(m.id || m._id) === String(memberId));
  if (idx === -1) {
    return res.status(404).json({ error: "Anggota keluarga tidak ditemukan" });
  }

  const cleanName = String(name || user.members[idx].name || '').trim();
  user.members[idx] = {
    ...user.members[idx],
    id: user.members[idx].id || memberId,
    name: cleanName,
    role: role || user.members[idx].role,
    age: age !== undefined ? Number(age) || 0 : user.members[idx].age,
    tglLahir: tglLahir !== undefined ? tglLahir : user.members[idx].tglLahir,
    jenisKelamin: jenisKelamin !== undefined ? jenisKelamin : user.members[idx].jenisKelamin
  };

  user.markModified('members');
  await user.save();

  await logAudit(user.rtId || rtId, req.user?.nama || user.nama, "UPDATE_FAMILY_MEMBER", `Memperbarui anggota ${cleanName}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Data anggota keluarga berhasil diperbarui", user: user.toObject() });
});

wargaRouter.delete("/warga/:id/members/:memberId", async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const { id: targetId, memberId } = req.params;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });

  if (!user) {
    return res.status(404).json({ error: "Data warga tidak ditemukan" });
  }

  if (!Array.isArray(user.members)) user.members = [];

  user.members = user.members.filter((m: any) => String(m.id || m._id) !== String(memberId));
  user.markModified('members');
  await user.save();

  await logAudit(user.rtId || rtId, req.user?.nama || user.nama, "DELETE_FAMILY_MEMBER", `Menghapus anggota keluarga dari KK ${user.nama}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Anggota keluarga berhasil dihapus", user: user.toObject() });
});

// Admin Approval & Role Control
wargaRouter.put("/warga/:id/role", requireRole(['admin']), async (req: Request, res: Response) => {
  const { role } = req.body;
  const rtId = getScopedRtId(req);
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.id !== "admin") {
    user.role = role;
    await user.save();
    await logAudit(rtId, req.user?.nama || 'Admin', "PROMOTED_ROLE", `Mengubah peran warga ${user.nama} menjadi ${role}`);
    broadcastEvent('update', { type: 'users', rtId });
    return res.json({ message: "Role updated successfully", user });
  }
  return res.status(400).json({ error: "Gagal update role" });
});

wargaRouter.put("/warga/:id/approval", requireRole(['admin']), async (req: Request, res: Response) => {
  const { isApproved } = req.body;
  const rtId = getScopedRtId(req);
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.id !== "admin") {
    user.isApproved = isApproved;
    await user.save();
    await logAudit(rtId, req.user?.nama || 'Admin', "WARGA_APPROVAL", `Verifikasi pendaftaran ${user.nama}: ${isApproved ? 'SETUJU' : 'BATAL'}`);
    broadcastEvent('update', { type: 'users', rtId });
    return res.json({ message: "Status approval updated successfully", user });
  }
  return res.status(400).json({ error: "Gagal update status approval" });
});

wargaRouter.put("/warga/:id/vip", requireRole(['developer', 'admin']), async (req: Request, res: Response) => {
  const { isVip } = req.body;
  const rtId = getScopedRtId(req);
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user) {
    user.isVip = isVip;
    await user.save();
    broadcastEvent('update', { type: 'users', rtId });
    return res.json({ message: "VIP status updated successfully", user });
  }
  return res.status(404).json({ error: "User tidak ditemukan" });
});

wargaRouter.delete("/warga/:id", requireRole(['admin']), async (req: Request, res: Response) => {
  const rtId = getScopedRtId(req);
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user) {
    await UserModel.deleteOne({ id: req.params.id, rtId });
    await logAudit(rtId, req.user?.nama || 'Admin', "DELETE_WARGA", `Menghapus data warga ${user.nama}`);
    broadcastEvent('update', { type: 'users', rtId });
    return res.json({ message: "User deleted" });
  }
  return res.status(404).json({ error: "Warga tidak ditemukan" });
});
