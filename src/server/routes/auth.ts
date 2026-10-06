import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel, RtConfigModel } from "../db";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  verifyPassword,
  hashPassword,
  logAudit,
  addNotification,
  broadcastEvent,
  getScopedRtId
} from "../middleware/auth";
import { loginLimiter, registerLimiter, checkBruteForce, recordFailedLogin, clearFailedLogin } from "../middleware/rateLimiter";

export const authRouter = Router();

export const activeSessions = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 65000) {
      activeSessions.delete(id);
      changed = true;
    }
  }
  if (changed) {
    broadcastEvent('update', { type: 'online_status' });
  }
}, 15000);

const RegisterValidator = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  password: z.string().min(4, "Password minimal 4 karakter"),
  alamat: z.string().optional(),
  noHp: z.string().optional(),
  status: z.string().optional(),
  umur: z.any().optional(),
  tglLahir: z.string().optional(),
  jenisKelamin: z.string().optional(),
  role: z.string().optional(),
  isApproved: z.boolean().optional(),
  noKk: z.string().optional(),
  dokumenKk: z.any().optional(),
  dokumenKtp: z.any().optional()
});

const LoginValidator = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

function parseBlokAndNo(inputStr: string): { blok: string; no: string; display: string } | null {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const s = inputStr.trim();
  if (!s) return null;

  const match1 = s.match(/Blok\s*([a-zA-Z0-9]+)\s*(?:No\.?|Nomor|\/|-|,)?\s*([a-zA-Z0-9]+)?/i);
  if (match1 && match1[1] && match1[2]) {
    const blok = match1[1].toUpperCase();
    const rawNo = match1[2].toUpperCase();
    const isPureNum = /^\d+$/.test(rawNo);
    const no = isPureNum ? String(parseInt(rawNo, 10)) : rawNo;
    return { blok, no, display: `Blok ${blok} No. ${rawNo}` };
  }

  const match2 = s.match(/^([a-zA-Z])\s*[-_/\s]?\s*([0-9]+[a-zA-Z]?)$/i);
  if (match2 && match2[1] && match2[2]) {
    const blok = match2[1].toUpperCase();
    const rawNo = match2[2].toUpperCase();
    const isPureNum = /^\d+$/.test(rawNo);
    const no = isPureNum ? String(parseInt(rawNo, 10)) : rawNo;
    return { blok, no, display: `Blok ${blok} No. ${rawNo}` };
  }

  return null;
}

authRouter.post("/login", loginLimiter, checkBruteForce, async (req: Request, res: Response) => {
  const parseResult = LoginValidator.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Input tidak valid" });
  }

  const { username, password } = parseResult.data;
  const rtId = (req.headers['x-rt-id'] as string) || 'rt01';

  const cleanUsername = username.trim();
  const normalizedBlockUser = cleanUsername
    .replace(/^blok\s*/i, '')
    .replace(/no\.?\s*/i, '')
    .replace(/[\s-]+/g, '');

  const query: any = {
    $or: [
      { username: new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ...(normalizedBlockUser
        ? [{ username: new RegExp(`^${normalizedBlockUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }]
        : [])
    ]
  };

  if (cleanUsername.toLowerCase() !== 'developer') {
    query.rtId = rtId;
  }

  const user = await UserModel.findOne(query);

  const cleanPwd = password.trim();
  const strippedPwd = cleanPwd
    .replace(/^blok\s*/i, '')
    .replace(/no\.?\s*/i, '')
    .replace(/[\s-]+/g, '');
  const blockPrefix = (user?.username || '').match(/^[A-Za-z]+/)?.[0] || '';
  const withBlockLetter =
    blockPrefix && /^\d+[A-Za-z]*$/.test(strippedPwd) ? `${blockPrefix}${strippedPwd}` : strippedPwd;

  const matchPwd = user && (
    verifyPassword(cleanPwd, user.password) ||
    verifyPassword(cleanPwd.toLowerCase(), user.password) ||
    verifyPassword(cleanPwd.toUpperCase(), user.password) ||
    verifyPassword(`Blok ${cleanPwd}`, user.password) ||
    verifyPassword(cleanPwd.replace(/^blok\s*/i, ''), user.password) ||
    verifyPassword(strippedPwd, user.password) ||
    verifyPassword(strippedPwd.toUpperCase(), user.password) ||
    verifyPassword(strippedPwd.toLowerCase(), user.password) ||
    verifyPassword(withBlockLetter.toUpperCase(), user.password) ||
    verifyPassword(withBlockLetter.toLowerCase(), user.password)
  );

  if (user && matchPwd) {
    clearFailedLogin(req);

    // Auto-migrate plaintext password to bcrypt hash
    if (!user.password.startsWith('$2') && user.password === password) {
      user.password = hashPassword(password);
      await user.save();
    }

    if (activeSessions.has(user.id) && Date.now() - activeSessions.get(user.id)! < 10000) {
      return res.status(409).json({ error: "User sedang aktif digunakan pada perangkat lain" });
    }
    activeSessions.set(user.id, Date.now());

    // Issue standard access token (30m) & refresh token (7d)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nama: user.nama, rtId: user.rtId },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, rtId: user.rtId },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const userJson = user.toObject();
    delete userJson.password; // Strip password
    userJson.token = token;
    userJson.refreshToken = refreshToken;

    const rtConfig = await RtConfigModel.findOne({ rtId: user.rtId });
    userJson.isVip = rtConfig?.isVip || false;

    await logAudit(user.rtId, user.nama, "LOGIN", `User ${user.nama} (${user.role}) berhasil masuk ke sistem.`);

    return res.json({ message: "Login Berhasil", user: userJson });
  } else {
    recordFailedLogin(req);
    return res.status(401).json({ error: "Username atau password salah" });
  }
});

authRouter.post("/refresh-token", async (req: Request, res: Response) => {
  const { refreshToken, userId } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    if (userId && decoded.id !== userId) {
      return res.status(401).json({ error: "Identitas token tidak cocok" });
    }

    const user = await UserModel.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nama: user.nama, rtId: user.rtId },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, username: user.username, rtId: user.rtId },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch {
    return res.status(401).json({ error: "Refresh token tidak valid atau telah kadaluarsa" });
  }
});

authRouter.post("/register", registerLimiter, async (req: Request, res: Response) => {
  const parseResult = RegisterValidator.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Input tidak valid" });
  }

  const { username, nama, password, alamat, noHp, status, umur, tglLahir, jenisKelamin, role, isApproved, noKk, dokumenKk, dokumenKtp } = parseResult.data;
  const rtId = (req.headers['x-rt-id'] as string) || 'rt01';

  const userExists = await UserModel.findOne({ rtId, username });
  if (userExists) {
    return res.status(400).json({ error: "Username sudah terdaftar" });
  }

  if (alamat) {
    const parsedTarget = parseBlokAndNo(alamat);
    if (parsedTarget) {
      const allUsers = await UserModel.find({ rtId, role: { $ne: 'developer' } }).lean();
      const duplicate = allUsers.find((u: any) => {
        const parsedAlamat = parseBlokAndNo(u.alamat || '');
        const parsedUsername = parseBlokAndNo(u.username || '');
        if (parsedAlamat && parsedAlamat.blok === parsedTarget.blok && parsedAlamat.no === parsedTarget.no) return true;
        if (parsedUsername && parsedUsername.blok === parsedTarget.blok && parsedUsername.no === parsedTarget.no) return true;
        return false;
      });

      if (duplicate) {
        return res.status(400).json({
          error: `Blok ${parsedTarget.blok} No. ${parsedTarget.no} sudah terdaftar atas nama ${duplicate.nama || duplicate.username}. Setiap rumah hanya dapat didaftarkan satu akun kepala keluarga.`
        });
      }
    }
  }

  const validRoles = ['warga', 'pengurus', 'sekretaris', 'bendahara', 'admin'];
  const assignedRole = role && validRoles.includes(role) ? role : "warga";

  const newUser = await UserModel.create({
    id: Date.now().toString(),
    username,
    nama,
    password: hashPassword(password),
    alamat,
    noHp,
    status,
    role: assignedRole,
    isApproved: typeof isApproved === 'boolean' ? isApproved : false,
    umur: Number(umur) || undefined,
    tglLahir: tglLahir || undefined,
    jenisKelamin: jenisKelamin || undefined,
    noKk: noKk || undefined,
    dokumenKk: dokumenKk || undefined,
    dokumenKtp: dokumenKtp || undefined,
    rtId,
    members: []
  });

  const cleanUser = newUser.toObject();
  delete cleanUser.password;

  await logAudit(rtId, nama, "REGISTER_WARGA", `Warga baru ${nama} didaftarkan dengan role ${assignedRole}`, null, cleanUser);
  await addNotification(rtId, "Warga Baru Terdaftar", `${nama} telah mendaftar ke portal RT.`, nama, "warga", newUser.id);
  broadcastEvent('update', { type: 'users', rtId });

  res.json({ message: "Registrasi sukses", user: cleanUser });
});

authRouter.post("/ping", async (req: Request, res: Response) => {
  const { id } = req.body;
  let isVip = false;
  if (id) {
    const wasOnline = activeSessions.has(id);
    activeSessions.set(id, Date.now());
    if (!wasOnline) {
      broadcastEvent('update', { type: 'online_status' });
    }
    const rtId = getScopedRtId(req);
    const rtConfig = await RtConfigModel.findOne({ rtId });
    isVip = rtConfig?.isVip || false;
  }
  res.json({ success: true, isVip });
});

authRouter.post("/logout", (req: Request, res: Response) => {
  const { id } = req.body;
  if (id) {
    activeSessions.delete(id);
    broadcastEvent('update', { type: 'online_status' });
  }
  res.json({ success: true });
});

authRouter.put("/password", async (req: Request, res: Response) => {
  const { id, oldPassword, newPassword } = req.body;
  const rtId = getScopedRtId(req);
  const targetId = id || req.user?.id;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: "Password baru minimal 4 karakter" });
  }

  const user = await UserModel.findOne({ id: targetId, rtId });
  if (user) {
    if (!verifyPassword(oldPassword, user.password)) {
      return res.status(400).json({ error: "Password lama tidak sesuai" });
    }
    user.password = hashPassword(newPassword);
    await user.save();
    await logAudit(rtId, user.nama, "PASSWORD_UPDATE", `Mengubah password akun`);
    res.json({ message: "Password berhasil diganti" });
  } else {
    res.status(404).json({ error: "User tidak ditemukan" });
  }
});
