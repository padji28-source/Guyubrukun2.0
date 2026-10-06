import express from "express";
import "express-async-errors";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// ==========================================
// 1. CONFIGURATION & DATABASE SETUP
// ==========================================
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guyubrukun";
export let isDbConnected = false;

const rawSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!rawSecret || rawSecret.length < 16)) {
  console.error("FATAL: JWT_SECRET must be set and at least 16 characters in production.");
}

export const JWT_SECRET = rawSecret || "guyubrukun_jwt_secret_dev_2026_secure_key";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_token_secret`;

export async function connectDB() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return;
  }
  if (mongoose.connection && mongoose.connection.readyState === 2) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    isDbConnected = true;
  } catch (err) {
    console.error("MongoDB connection exception:", err);
    throw err;
  }
}

// ==========================================
// 2. MONGOOSE SCHEMAS & COMPOUND INDEXES
// ==========================================

// 1. User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  nama: { type: String, required: true },
  password: { type: String, required: true },
  alamat: { type: String },
  noHp: { type: String },
  status: { type: String },
  role: { type: String, enum: ['admin', 'warga', 'bendahara', 'sekretaris', 'pengurus', 'developer'], default: 'warga' },
  isApproved: { type: Boolean, default: false },
  isVip: { type: Boolean, default: false },
  rtId: { type: String, required: true },
  umur: { type: Number },
  tglLahir: { type: String },
  jenisKelamin: { type: String },
  members: [{
    id: String,
    name: String,
    role: String,
    age: Number,
    tglLahir: String,
    jenisKelamin: String
  }],
  photo: String,
  noKk: { type: String },
  dokumenKk: mongoose.Schema.Types.Mixed,
  dokumenKtp: mongoose.Schema.Types.Mixed,
}, { timestamps: true, strict: false });

UserSchema.index({ rtId: 1, username: 1 });
UserSchema.index({ rtId: 1, role: 1 });
UserSchema.index({ rtId: 1, isApproved: 1 });
UserSchema.index({ rtId: 1, alamat: 1 });

export const UserModel: mongoose.Model<any> = mongoose.models.User || mongoose.model("User", UserSchema);

// RT Config / Subscription Schema
const RtConfigSchema = new mongoose.Schema({
  rtId: { type: String, required: true, unique: true },
  isVip: { type: Boolean, default: false }
}, { timestamps: true });
export const RtConfigModel: mongoose.Model<any> = mongoose.models.RtConfig || mongoose.model("RtConfig", RtConfigSchema);

// 2. Iuran Schema
const IuranSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  nominal: { type: Number, required: true, min: 0 },
  jenis: { type: String, required: true },
  status: { type: String, required: true },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true },
  proofUrl: { type: String },
  userId: { type: String },
  bulan: { type: String },
  buktiUrl: { type: String }
}, { timestamps: true, strict: false });
IuranSchema.index({ rtId: 1, createdAt: -1 });
IuranSchema.index({ rtId: 1, bulan: 1 });
IuranSchema.index({ rtId: 1, userId: 1 });
IuranSchema.index({ rtId: 1, status: 1 });
export const IuranModel: mongoose.Model<any> = mongoose.models.Iuran || mongoose.model("Iuran", IuranSchema);

// 3. Kas Schema
const KasSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Masuk', 'Keluar'], required: true },
  amount: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, required: true },
  iuranId: { type: String },
  rtId: { type: String, required: true },
  status: { type: String, enum: ['setuju', 'butuh_konfirmasi', 'selesai'], default: 'selesai' },
  buktiTransaksi: { type: String },
  createdAt: { type: String, required: true }
}, { timestamps: true });
KasSchema.index({ rtId: 1, createdAt: -1 });
KasSchema.index({ rtId: 1, category: 1, type: 1 });
export const KasModel: mongoose.Model<any> = mongoose.models.Kas || mongoose.model("Kas", KasSchema);

// 4. Voting Schema
const VotingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Musyawarah Warga' },
  description: { type: String },
  deadline: { type: String },
  options: [{ id: String, text: String, count: Number }],
  votes: [{
    userId: { type: String, required: true },
    userName: { type: String },
    userBlok: { type: String },
    optionId: { type: String, required: true },
    date: { type: String, required: true }
  }],
  status: { type: String, enum: ['aktif', 'selesai'], default: 'aktif' },
  createdBy: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
VotingSchema.index({ rtId: 1, status: 1 });
VotingSchema.index({ rtId: 1, createdAt: -1 });
export const VotingModel: mongoose.Model<any> = mongoose.models.Voting || mongoose.model("Voting", VotingSchema);

// 5. Acara Schema
const AcaraSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  desc: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  location: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
AcaraSchema.index({ rtId: 1, date: -1 });
export const AcaraModel: mongoose.Model<any> = mongoose.models.Acara || mongoose.model("Acara", AcaraSchema);

// 6. Laporan Schema
const LaporanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  judul: { type: String, required: true },
  deskripsi: { type: String, required: true },
  status: { type: String, default: 'baru' },
  nama: { type: String },
  userName: { type: String },
  kategori: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: true });
LaporanSchema.index({ rtId: 1, status: 1 });
LaporanSchema.index({ rtId: 1, createdAt: -1 });
export const LaporanModel: mongoose.Model<any> = mongoose.models.Laporan || mongoose.model("Laporan", LaporanSchema);

// 7. Surat Schema
const SuratSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jenis: { type: String, required: true },
  keperluan: { type: String },
  status: { type: String, default: 'proses' },
  nama: { type: String },
  tempatLahir: { type: String },
  tanggalLahir: { type: String },
  statusPerkawinan: { type: String },
  jenisKelamin: { type: String },
  agama: { type: String },
  pekerjaan: { type: String },
  noKtpKk: { type: String },
  alamatSekarang: { type: String },
  alamatAsal: { type: String },
  mohonDibuatkan: { type: String },
  nomorSurat: { type: String },
  signaturePemohon: { type: String },
  signatureKetuaRt: { type: String },
  capPositionX: { type: Number, default: 0 },
  capPositionY: { type: Number, default: 0 },
  capWidth: { type: Number, default: 40 },
  capHeight: { type: Number, default: 40 },
  hasCap: { type: Boolean, default: false },
  userId: { type: String },
  userName: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
SuratSchema.index({ rtId: 1, createdAt: -1 });
export const SuratModel: mongoose.Model<any> = mongoose.models.Surat || mongoose.model("Surat", SuratSchema);

// 8. UMKM Schema
const UmkmSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nama: { type: String },
  name: { type: String },
  bannerUrl: { type: String },
  owner: { type: String },
  ownerId: { type: String },
  alamat: { type: String },
  products: [{
    id: String,
    namaProduk: String,
    harga: Number,
    satuan: String
  }],
  sosmed: { type: String },
  kontak: { type: String },
  phone: { type: String },
  category: { type: String, default: 'Kuliner' },
  desc: { type: String },
  price: { type: String },
  status: { type: String, enum: ['menunggu_verifikasi', 'disetujui', 'ditolak'], default: 'menunggu_verifikasi' },
  verifiedBy: { type: String },
  verifiedByRole: { type: String },
  verifiedAt: { type: String },
  catatanVerifikasi: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true, strict: false });
UmkmSchema.index({ rtId: 1, createdAt: -1 });
export const UmkmModel: mongoose.Model<any> = mongoose.models.Umkm || mongoose.model("Umkm", UmkmSchema);

// 9. Tamu Schema
const TamuSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  keperluan: { type: String },
  durasi: { type: String },
  alamatAsal: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
TamuSchema.index({ rtId: 1, createdAt: -1 });
export const TamuModel: mongoose.Model<any> = mongoose.models.Tamu || mongoose.model("Tamu", TamuSchema);

// 10. Media Schema
const MediaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  title: { type: String },
  uploaderName: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
MediaSchema.index({ rtId: 1, createdAt: -1 });
export const MediaModel: mongoose.Model<any> = mongoose.models.Media || mongoose.model("Media", MediaSchema);

// 11. Darurat Schema
const DaruratSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  type: { type: String },
  rtId: { type: String, required: true }
});
export const DaruratModel: mongoose.Model<any> = mongoose.models.Darurat || mongoose.model("Darurat", DaruratSchema);

// 12. Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  rtId: { type: String, required: true },
  timestamp: { type: String, required: true }
});
AuditLogSchema.index({ rtId: 1, timestamp: -1 });
export const AuditLogModel: mongoose.Model<any> = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

// 13. Notification Schema
const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  updaterName: { type: String },
  resource: { type: String },
  resourceId: { type: String },
  time: { type: String },
  read: { type: Boolean, default: false },
  rtId: { type: String, required: true }
});
NotificationSchema.index({ rtId: 1, read: 1 });
NotificationSchema.index({ rtId: 1, time: -1 });
export const NotificationModel: mongoose.Model<any> = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// 14. Dokumen Schema
const DokumenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileType: { type: String },
  description: { type: String },
  uploaderId: { type: String },
  uploaderName: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String }
}, { timestamps: true });
DokumenSchema.index({ rtId: 1, createdAt: -1 });
export const DokumenModel: mongoose.Model<any> = mongoose.models.Dokumen || mongoose.model("Dokumen", DokumenSchema);

// 15. Inventaris Schema
const InventarisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  condition: { type: String, enum: ['baik', 'rusak_ringan', 'rusak_berat'], default: 'baik' },
  location: { type: String },
  status: { type: String, enum: ['tersedia', 'dipinjam'], default: 'tersedia' },
  notes: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
InventarisSchema.index({ rtId: 1, createdAt: -1 });
export const InventarisModel: mongoose.Model<any> = mongoose.models.Inventaris || mongoose.model("Inventaris", InventarisSchema);

// 16. Notulen Schema
const NotulenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String },
  content: { type: String, required: true },
  leader: { type: String },
  attendees: { type: String },
  location: { type: String },
  rtId: { type: String, required: true },
  createdBy: { type: String }
}, { timestamps: true });
NotulenSchema.index({ rtId: 1, date: -1 });
export const NotulenModel: mongoose.Model<any> = mongoose.models.Notulen || mongoose.model("Notulen", NotulenSchema);

// 17. Menu Access Schema
const MenuAccessSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  allowedMenus: [{ type: String }],
  createMenus: [{ type: String }],
  updateMenus: [{ type: String }],
  deleteMenus: [{ type: String }]
}, { timestamps: true });
export const MenuAccessModel: mongoose.Model<any> = mongoose.models.MenuAccess || mongoose.model("MenuAccess", MenuAccessSchema);


// ==========================================
// 3. SECURITY & AUTH HELPERS
// ==========================================
export const clients = new Set<express.Response>();

export function broadcastEvent(event: string, data?: any) {
  for (const client of clients) {
    try {
      client.write(`event: ${event}\ndata: ${JSON.stringify(data || {})}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(input: string, stored: string): boolean {
  if (stored && stored.startsWith('$2') && stored.length >= 50) {
    return bcrypt.compareSync(input, stored);
  }
  return input === stored;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'admin' | 'warga' | 'bendahara' | 'sekretaris' | 'pengurus' | 'developer';
  nama: string;
  rtId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const pathName = req.path;
  if (!pathName.startsWith("/api/")) {
    return next();
  }

  const publicRoutes = [
    "/api/login",
    "/api/register",
    "/api/refresh-token",
    "/api/health",
    "/api/public/rt-list",
  ];

  if (publicRoutes.includes(pathName) || pathName.startsWith("/api/tangerang-logo-proxy") || pathName.startsWith("/api/stream")) {
    return next();
  }

  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: "AUTH_REQUIRED",
        message: "Autentikasi diperlukan. Silakan login terlebih dahulu."
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-nama'] = decoded.nama;
    req.headers['x-rt-id'] = decoded.rtId;
    next();
  } catch (err: any) {
    const isExpired = err?.name === "TokenExpiredError";
    return res.status(401).json({
      error: {
        code: isExpired ? "AUTH_EXPIRED" : "AUTH_INVALID",
        message: isExpired ? "Sesi telah berakhir. Silakan login kembali." : "Token tidak valid."
      }
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: { code: "AUTH_REQUIRED", message: "Autentikasi diperlukan." }
      });
    }

    if (user.role === 'developer' || allowedRoles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: `Akses ditolak: role '${user.role}' tidak memiliki izin untuk tindakan ini.`
      }
    });
  };
}

export function getScopedRtId(req: express.Request): string {
  if (req.user?.role === 'developer') {
    return (req.headers['x-rt-id'] as string) || req.user?.rtId || 'rt01';
  }
  return req.user?.rtId || (req.headers['x-rt-id'] as string) || 'rt01';
}

export function safeAuditPayload(val: any): any {
  if (val === null || val === undefined) return null;
  try {
    if (typeof val?.toObject === 'function') {
      val = val.toObject({ depopulate: true, getters: false, virtuals: false });
    }
    const clean = (obj: any, depth = 0): any => {
      if (depth > 4) return '[Max Depth]';
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.slice(0, 20).map(item => clean(item, depth + 1));
      }
      const res: any = {};
      for (const k of Object.keys(obj)) {
        if (k.toLowerCase().includes('password')) {
          res[k] = '*****';
          continue;
        }
        if (k.startsWith('$') || k === '__v') continue;
        const v = obj[k];
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 200) {
          res[k] = '[Dokumen Media / Base64]';
        } else {
          res[k] = clean(v, depth + 1);
        }
      }
      return res;
    };
    return clean(val);
  } catch {
    return null;
  }
}

export async function logAudit(rtId: string, user: string, action: string, details: string, before?: any, after?: any) {
  try {
    await AuditLogModel.create({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      user: user || "Sistem",
      action,
      details,
      before: safeAuditPayload(before),
      after: safeAuditPayload(after),
      rtId: rtId || "rt01",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to write audit trail log:", e);
  }
}

export async function addNotification(rtId: string = 'rt01', title: string, message: string, updaterName: string = 'Sistem', resource?: string, resourceId?: string) {
  try {
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      title,
      message,
      updaterName,
      resource,
      resourceId,
      time: new Date().toISOString(),
      read: false,
      rtId: rtId || 'rt01'
    };
    await NotificationModel.create(newNotif);
    broadcastEvent('update', { type: 'notifications', rtId });
  } catch (e) {
    console.error("Failed to write notification:", e);
  }
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Rate limiters
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi beberapa saat lagi."
    },
    data: []
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan pendaftaran akun. Silakan coba lagi setelah 1 jam."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkBruteForce(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;

  const record = failedAttempts.get(key);
  if (record && record.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: {
        code: "ACCOUNT_TEMPORARILY_LOCKED",
        message: `Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.`
      }
    });
  }
  next();
}

function recordFailedLogin(req: express.Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;
  const record = failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedAttempts.set(key, record);
}

function clearFailedLogin(req: express.Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const username = String(req.body?.username || '').trim().toLowerCase();
  const key = `${ip}_${username}`;
  failedAttempts.delete(key);
}

// Active sessions tracking
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

// ==========================================
// 4. EXPRESS APPLICATION SETUP
// ==========================================
export const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://upload.wikimedia.org", "https://*.wikimedia.org"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Global DB connection middleware
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    try {
      await connectDB();
    } catch {
      return res.status(500).json({ error: { code: "DATABASE_ERROR", message: "Gagal menghubungkan ke database." } });
    }
  }
  next();
});

// General rate limiter on all API endpoints
app.use("/api/", generalApiLimiter);

// Public stream endpoint for SSE live updates
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);
  req.on("close", () => {
    clients.delete(res);
  });
});

// Tangerang logo proxy endpoint
app.get("/api/tangerang-logo-proxy", async (_req, res) => {
  try {
    const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Seal_of_Tangerang_Regency.svg/500px-Seal_of_Tangerang_Regency.svg.png";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch logo");
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=604800");
    return res.send(Buffer.from(arrayBuffer));
  } catch {
    const transparentPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    res.setHeader("Content-Type", "image/png");
    return res.send(Buffer.from(transparentPngBase64, "base64"));
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: "modular-tables", isDbConnected });
});

// Apply auth middleware to all other /api routes
app.use(authMiddleware);

// ==========================================
// 5. REST API ROUTE HANDLERS
// ==========================================

const LoginValidator = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

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

function parseBlokAndNo(inputStr: string): { blok: string; no: string; display: string } | null {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const s = inputStr.trim();
  if (!s) return null;
  const match1 = s.match(/Blok\s*([a-zA-Z0-9]+)\s*(?:No\.?|Nomor|\/|-|,)?\s*([a-zA-Z0-9]+)?/i);
  if (match1 && match1[1] && match1[2]) {
    const blok = match1[1].toUpperCase();
    const rawNo = match1[2].toUpperCase();
    const no = /^\d+$/.test(rawNo) ? String(parseInt(rawNo, 10)) : rawNo;
    return { blok, no, display: `Blok ${blok} No. ${rawNo}` };
  }
  const match2 = s.match(/^([a-zA-Z])\s*[-_/\s]?\s*([0-9]+[a-zA-Z]?)$/i);
  if (match2 && match2[1] && match2[2]) {
    const blok = match2[1].toUpperCase();
    const rawNo = match2[2].toUpperCase();
    const no = /^\d+$/.test(rawNo) ? String(parseInt(rawNo, 10)) : rawNo;
    return { blok, no, display: `Blok ${blok} No. ${rawNo}` };
  }
  return null;
}

// --- AUTH ROUTES ---
app.post("/api/login", loginLimiter, checkBruteForce, async (req, res) => {
  const parseResult = LoginValidator.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Input tidak valid" });
  }

  const { username, password } = parseResult.data;
  const rtId = (req.headers['x-rt-id'] as string) || 'rt01';
  const cleanUsername = username.trim();
  const normalizedBlockUser = cleanUsername.replace(/^blok\s*/i, '').replace(/no\.?\s*/i, '').replace(/[\s-]+/g, '');

  const query: any = {
    $or: [
      { username: new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ...(normalizedBlockUser ? [{ username: new RegExp(`^${normalizedBlockUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] : [])
    ]
  };

  if (cleanUsername.toLowerCase() !== 'developer') {
    query.rtId = rtId;
  }

  const user = await UserModel.findOne(query);
  const cleanPwd = password.trim();
  const strippedPwd = cleanPwd.replace(/^blok\s*/i, '').replace(/no\.?\s*/i, '').replace(/[\s-]+/g, '');
  const blockPrefix = (user?.username || '').match(/^[A-Za-z]+/)?.[0] || '';
  const withBlockLetter = blockPrefix && /^\d+[A-Za-z]*$/.test(strippedPwd) ? `${blockPrefix}${strippedPwd}` : strippedPwd;

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

    if (!user.password.startsWith('$2') && user.password === password) {
      user.password = hashPassword(password);
      await user.save();
    }

    if (activeSessions.has(user.id) && Date.now() - activeSessions.get(user.id)! < 10000) {
      return res.status(409).json({ error: "User sedang aktif digunakan pada perangkat lain" });
    }
    activeSessions.set(user.id, Date.now());

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
    delete userJson.password;
    userJson.token = token;
    userJson.refreshToken = refreshToken;

    const rtConfig = await RtConfigModel.findOne({ rtId: user.rtId });
    userJson.isVip = rtConfig?.isVip || false;

    await logAudit(user.rtId, user.nama, "LOGIN", `User ${user.nama} (${user.role}) berhasil login.`);
    return res.json({ message: "Login Berhasil", user: userJson });
  } else {
    recordFailedLogin(req);
    return res.status(401).json({ error: "Username atau password salah" });
  }
});

app.post("/api/refresh-token", async (req, res) => {
  const { refreshToken, userId } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token tidak ditemukan" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    if (userId && decoded.id !== userId) return res.status(401).json({ error: "Identitas token tidak cocok" });

    const user = await UserModel.findOne({ id: decoded.id });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

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

    return res.json({ token: newAccessToken, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ error: "Refresh token tidak valid atau telah kadaluarsa" });
  }
});

app.post("/api/register", registerLimiter, async (req, res) => {
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
        return (parsedAlamat && parsedAlamat.blok === parsedTarget.blok && parsedAlamat.no === parsedTarget.no) ||
               (parsedUsername && parsedUsername.blok === parsedTarget.blok && parsedUsername.no === parsedTarget.no);
      });

      if (duplicate) {
        return res.status(400).json({
          error: `Blok ${parsedTarget.blok} No. ${parsedTarget.no} sudah terdaftar atas nama ${duplicate.nama || duplicate.username}.`
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

  await logAudit(rtId, nama, "REGISTER_WARGA", `Warga baru ${nama} didaftarkan dengan role ${assignedRole}`);
  await addNotification(rtId, "Warga Baru Terdaftar", `${nama} telah mendaftar ke portal RT.`, nama, "warga", newUser.id);
  broadcastEvent('update', { type: 'users', rtId });

  res.json({ message: "Registrasi sukses", user: cleanUser });
});

app.post("/api/ping", async (req, res) => {
  const { id } = req.body;
  let isVip = false;
  if (id) {
    const wasOnline = activeSessions.has(id);
    activeSessions.set(id, Date.now());
    if (!wasOnline) broadcastEvent('update', { type: 'online_status' });
    const rtId = getScopedRtId(req);
    const rtConfig = await RtConfigModel.findOne({ rtId });
    isVip = rtConfig?.isVip || false;
  }
  res.json({ success: true, isVip });
});

app.post("/api/logout", (req, res) => {
  const { id } = req.body;
  if (id) {
    activeSessions.delete(id);
    broadcastEvent('update', { type: 'online_status' });
  }
  res.json({ success: true });
});

app.put("/api/password", async (req, res) => {
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

// --- WARGA & PROFIL ROUTES ---
app.get("/api/warga/:id", async (req, res) => {
  const rtId = getScopedRtId(req);
  const user: any = await UserModel.findOne({ id: req.params.id, rtId }).select('-password').lean();
  if (!user) return res.status(404).json({ error: "Warga tidak ditemukan" });

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

app.get("/api/warga", async (req, res) => {
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

  const dbQuery = UserModel.find(query).select('-password');

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
    return res.json({ users: sanitized, data: sanitized, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
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

app.put("/api/profile", async (req, res) => {
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
  if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

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

app.put("/api/warga/:id/dokumen", async (req, res) => {
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
  if (!user) return res.status(404).json({ error: "Warga tidak ditemukan" });

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

  await logAudit(user.rtId || rtId, requester?.nama || 'Admin', "UPLOAD_DOKUMEN_WARGA", `Mengunggah dokumen untuk ${user.nama}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Dokumen berhasil disimpan", user: clean });
});

app.get("/api/warga-dokumen-kk", requireRole(['admin', 'sekretaris']), async (req, res) => {
  const rtId = getScopedRtId(req);
  const users = await UserModel.find({ rtId, role: { $ne: 'developer' } }).select('-password').lean();
  const formatted = users.map((u: any) => ({
    ...u,
    hasKk: Boolean(u.dokumenKk && String(u.dokumenKk).trim() !== ''),
    isOnline: activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id)! < 15000
  }));
  return res.json({ users: formatted });
});

app.post("/api/warga/:id/members", async (req, res) => {
  const { name, role, age, tglLahir, jenisKelamin } = req.body;
  const rtId = getScopedRtId(req);
  const targetId = req.params.id;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });
  if (!user) return res.status(404).json({ error: "Data warga tidak ditemukan" });

  const cleanName = String(name || '').trim();
  if (!cleanName) return res.status(400).json({ error: "Nama anggota tidak boleh kosong" });

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

app.put("/api/warga/:id/members/:memberId", async (req, res) => {
  const { name, role, age, tglLahir, jenisKelamin } = req.body;
  const rtId = getScopedRtId(req);
  const { id: targetId, memberId } = req.params;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });
  if (!user) return res.status(404).json({ error: "Data warga tidak ditemukan" });

  if (!Array.isArray(user.members)) user.members = [];
  const idx = user.members.findIndex((m: any) => String(m.id || m._id) === String(memberId));
  if (idx === -1) return res.status(404).json({ error: "Anggota keluarga tidak ditemukan" });

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

app.delete("/api/warga/:id/members/:memberId", async (req, res) => {
  const rtId = getScopedRtId(req);
  const { id: targetId, memberId } = req.params;

  let user = await UserModel.findOne({ id: targetId, rtId });
  if (!user) user = await UserModel.findOne({ id: targetId });
  if (!user) return res.status(404).json({ error: "Data warga tidak ditemukan" });

  if (!Array.isArray(user.members)) user.members = [];
  user.members = user.members.filter((m: any) => String(m.id || m._id) !== String(memberId));
  user.markModified('members');
  await user.save();

  await logAudit(user.rtId || rtId, req.user?.nama || user.nama, "DELETE_FAMILY_MEMBER", `Menghapus anggota keluarga dari KK ${user.nama}`);
  broadcastEvent('update', { type: 'users', rtId: user.rtId || rtId });

  return res.json({ message: "Anggota keluarga berhasil dihapus", user: user.toObject() });
});

app.put("/api/warga/:id/role", requireRole(['admin']), async (req, res) => {
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

app.put("/api/warga/:id/approval", requireRole(['admin']), async (req, res) => {
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

app.put("/api/warga/:id/vip", requireRole(['developer', 'admin']), async (req, res) => {
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

app.delete("/api/warga/:id", requireRole(['admin']), async (req, res) => {
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

// --- GENERAL DATA & MULTI-MODULE ROUTES ---
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

app.get("/api/data/:resource", async (req, res) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const rawLimit = parseInt(req.query.limit as string) || 0;
  const limit = Math.min(100, Math.max(0, rawLimit));
  const search = req.query.search as string;

  let sortField = "createdAt";
  if (resource === 'notulen' || resource === 'acara') sortField = "date";

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
        { $group: { _id: { category: "$category", type: "$type" }, totalAmount: { $sum: "$amount" } } }
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
      console.error("Gagal menghitung saldo Kas:", e);
    }
  }

  const dbQuery = model.find(query).sort({ [sortField]: -1 });

  if (limit > 0) {
    const total = await model.countDocuments(query);
    const skip = (page - 1) * limit;
    const results = await dbQuery.skip(skip).limit(limit).lean();
    return res.json({ data: results, pagination: { total, page, limit, pages: Math.ceil(total / limit) }, balances });
  } else {
    const results = await dbQuery.lean();
    return res.json({ data: results, balances });
  }
});

app.post("/api/data/:resource", async (req, res) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const role = req.user?.role || 'warga';
  const userId = req.user?.id || '';
  const userNama = req.user?.nama || 'Warga';

  if (resource === 'kas' && !['admin', 'developer', 'bendahara'].includes(role)) {
    return res.status(403).json({ error: "Hanya Ketua RT atau Bendahara yang dapat menginput transaksi kas." });
  }
  if (['acara', 'inventaris', 'darurat'].includes(resource) && !['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(role)) {
    return res.status(403).json({ error: `Anda tidak memiliki wewenang untuk menambahkan ${resource}.` });
  }
  if (resource === 'notulen' && !['admin', 'developer', 'sekretaris'].includes(role)) {
    return res.status(403).json({ error: "Hanya Ketua RT atau Sekretaris yang dapat membuat notulen." });
  }

  const itemId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
  const newItemData: any = { id: itemId, rtId, createdAt: new Date().toISOString(), ...req.body };

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
    newItemData.nomorSurat = `${sequence}/${formattedRt}/RW-021/${months[d.getMonth()]}/${d.getFullYear()}`;
    newItemData.userId = userId;
    newItemData.userName = userNama;
  }

  if (resource === 'iuran' && typeof newItemData.nominal === 'string') newItemData.nominal = Number(newItemData.nominal);
  if (resource === 'kas' && typeof newItemData.amount === 'string') newItemData.amount = Number(newItemData.amount);

  const createdItem = await model.create(newItemData);
  await logAudit(rtId, userNama, `CREATE_${resource.toUpperCase()}`, `Memasukkan record ke modul ${resource}`);

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

app.put("/api/data/:resource/:id", async (req, res) => {
  const resource = req.params.resource;
  const model = RESOURCE_MODELS[resource];
  if (!model) return res.status(404).json({ error: "Resource tidak ditemukan" });

  const rtId = getScopedRtId(req);
  const role = req.user?.role || 'warga';

  if (['kas', 'iuran'].includes(resource) && !['admin', 'developer', 'bendahara'].includes(role)) {
    return res.status(403).json({ error: `Akses ditolak: Hanya Ketua RT atau Bendahara yang dapat mengedit ${resource}.` });
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

app.delete("/api/data/:resource/:id", async (req, res) => {
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

// --- SEDEKAH & NOTIFIKASI & BROADCAST ---
app.post("/api/sedekah", async (req, res) => {
  const rtId = getScopedRtId(req);
  const { name, amount, message, paymentMethod } = req.body;
  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount < 1000) return res.status(400).json({ error: "Jumlah donasi minimal Rp 1.000." });
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
  await addNotification(rtId, "Infaq/Sedekah Diterima", `Alhamdulillah, donasi Rp ${parsedAmount.toLocaleString('id-ID')} diterima.`, donatorName);
  broadcastEvent('update', { type: 'kas', rtId });

  return res.json({ message: "Donasi berhasil diterima. Terima kasih!", item: newKas });
});

app.get("/api/notifications", async (req, res) => {
  const rtId = getScopedRtId(req);
  const list = await NotificationModel.find({ rtId }).sort({ time: -1 }).limit(50).lean();
  return res.json({ notifications: list });
});

app.post("/api/notifications/read", async (req, res) => {
  const rtId = getScopedRtId(req);
  await NotificationModel.updateMany({ rtId }, { $set: { read: true } });
  broadcastEvent('update', { type: 'notifications', rtId });
  return res.json({ success: true });
});

app.post("/api/broadcast", requireRole(['admin', 'pengurus', 'sekretaris', 'bendahara']), async (req, res) => {
  const { title, message } = req.body;
  const rtId = getScopedRtId(req);
  if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong" });

  await logAudit(rtId, req.user?.nama || 'Admin', "BROADCAST", `Mengirimkan pengumuman: ${title || 'Pemberitahuan'}`);
  await addNotification(rtId, title || "📢 Pengumuman RT", message, req.user?.nama || 'Admin', "broadcast");
  return res.json({ success: true, message: "Pesan broadcast berhasil dikirim ke semua warga" });
});

// --- VOTING ROUTES ---
app.get("/api/voting", async (req, res) => {
  const rtId = getScopedRtId(req);
  const data = await VotingModel.find({ rtId }).sort({ createdAt: -1 }).lean();
  res.json({ data });
});

app.post("/api/voting", requireRole(['admin']), async (req, res) => {
  const rtId = getScopedRtId(req);
  const { title, category, description, deadline, options, status, createdBy } = req.body;

  if (!title || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "Judul dan minimal 2 opsi pilihan wajib diisi." });
  }

  const newVote = await VotingModel.create({
    id: Date.now().toString(),
    title: String(title).trim(),
    category: category || 'Musyawarah Warga',
    description: description || '',
    deadline: deadline || '',
    options: options.map((opt: any, idx: number) => ({
      id: opt.id || String(idx + 1),
      text: String(opt.text || '').trim(),
      count: 0
    })),
    votes: [],
    status: status || 'aktif',
    createdBy: createdBy || req.user?.nama || 'Ketua RT',
    rtId,
    createdAt: new Date().toISOString()
  });

  await logAudit(rtId, req.user?.nama || 'Ketua RT', "CREATE_VOTING", `Ketua RT membuat voting: ${title}`);
  await addNotification(rtId, `Voting Baru: ${title}`, `Ketua RT membuka voting baru: "${title}".`, req.user?.nama || 'Ketua RT', 'voting', newVote.id);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Voting berhasil dibuat", data: newVote });
});

app.put("/api/voting/:id", requireRole(['admin']), async (req, res) => {
  const rtId = getScopedRtId(req);
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) return res.status(404).json({ error: "Voting tidak ditemukan" });

  const { title, category, description, deadline, options, status } = req.body;
  if (title !== undefined) voteDoc.title = String(title).trim();
  if (category !== undefined) voteDoc.category = category;
  if (description !== undefined) voteDoc.description = description;
  if (deadline !== undefined) voteDoc.deadline = deadline;
  if (status !== undefined) voteDoc.status = status;

  if (Array.isArray(options) && options.length >= 2) {
    const validIds = new Set(options.map((o: any, idx: number) => String(o.id || idx + 1)));
    const currentVotes = Array.isArray(voteDoc.votes) ? voteDoc.votes : [];
    const filteredVotes = currentVotes.filter((v: any) => validIds.has(String(v.optionId)));
    voteDoc.votes = filteredVotes;
    voteDoc.options = options.map((opt: any, idx: number) => {
      const optId = String(opt.id || idx + 1);
      const count = filteredVotes.filter((v: any) => String(v.optionId) === optId).length;
      return { id: optId, text: String(opt.text || '').trim(), count };
    });
    voteDoc.markModified('votes');
    voteDoc.markModified('options');
  }

  const afterObj = await voteDoc.save();
  await logAudit(rtId, req.user?.nama || "Ketua RT", "UPDATE_VOTING", `Mengupdate sesi voting: ${afterObj?.title}`);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Voting berhasil diperbarui", data: afterObj });
});

app.delete("/api/voting/:id", requireRole(['admin']), async (req, res) => {
  const rtId = getScopedRtId(req);
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) return res.status(404).json({ error: "Voting tidak ditemukan" });
  await VotingModel.deleteOne({ id: req.params.id, rtId });
  await logAudit(rtId, req.user?.nama || "Ketua RT", "DELETE_VOTING", `Menghapus voting: ${voteDoc.title}`);
  broadcastEvent('update', { type: 'voting', rtId });
  res.json({ message: "Voting berhasil dihapus" });
});

app.post("/api/voting/:id/vote", async (req, res) => {
  const rtId = getScopedRtId(req);
  const { optionId, userId, userName, userBlok } = req.body;
  const voterId = userId || req.user?.id;
  const voterName = userName || req.user?.nama || 'Warga';

  if (!voterId || !optionId) return res.status(400).json({ error: "Identitas pemilih dan opsi pilihan wajib diisi." });

  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) return res.status(404).json({ error: "Sesi voting tidak ditemukan!" });
  if (voteDoc.status === 'selesai') return res.status(400).json({ error: "Sesi voting ini sudah berakhir." });
  if (voteDoc.deadline && new Date(voteDoc.deadline).getTime() < Date.now()) {
    return res.status(400).json({ error: "Batas waktu voting ini telah berakhir." });
  }

  const existingVoteIndex = voteDoc.votes.findIndex((vt: any) => vt.userId === voterId);
  if (existingVoteIndex !== -1) {
    voteDoc.votes[existingVoteIndex].optionId = optionId;
    if (voterName) voteDoc.votes[existingVoteIndex].userName = voterName;
    if (userBlok) voteDoc.votes[existingVoteIndex].userBlok = userBlok;
    voteDoc.votes[existingVoteIndex].date = new Date().toISOString();
  } else {
    voteDoc.votes.push({
      userId: voterId,
      userName: voterName,
      userBlok: userBlok || '',
      optionId,
      date: new Date().toISOString()
    });
  }

  voteDoc.options = voteDoc.options.map((opt: any) => {
    const totalCount = voteDoc.votes.filter((v: any) => v.optionId === opt.id).length;
    return { ...opt, count: totalCount };
  });

  const updatedVote = await voteDoc.save();
  await logAudit(rtId, voterName, "CAST_VOTE", `Memberikan suara pada voting ${voteDoc.title}`);
  broadcastEvent('update', { type: 'voting', rtId });

  res.json({ message: "Suara berhasil disimpan", data: updatedVote });
});

// --- DASHBOARD ROUTE ---
app.get("/api/dashboard", async (req, res) => {
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
        if (!isNaN(diff) && diff > 0) return Math.max(0, Math.abs(new Date(diff).getUTCFullYear() - 1970));
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
      if (norm.startsWith('p') || norm.includes('perempuan') || norm.includes('wanita')) perempuanCount++;
      else if (norm.startsWith('l') || norm.includes('laki') || norm.includes('pria')) lakiLakiCount++;
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
      if (hasKk || hasKtp) docUploaded++;
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

// --- SMART RT AI ROUTE ---
function isValidGeminiApiKey(key?: string): boolean {
  if (!key) return false;
  const k = key.trim();
  return k.length >= 20 && !k.startsWith('MY_') && !k.startsWith('YOUR_') && !k.includes('placeholder');
}

app.post("/api/gemini/action", async (req, res) => {
  const { action, payload } = req.body;
  const rtId = getScopedRtId(req);

  try {
    let prompt = "";
    let systemInstruction = "Anda adalah Smart RT AI, asisten pemerintahan RT pintar di Indonesia yang membantu Ketua RT dan pengurus mengelola warga, kas, dokumen, rapat, dan laporan secara profesional.";

    if (action === "ringkasan_rapat") {
      prompt = `Buatlah ringkasan rapat formal, terstruktur, dan rapi berdasarkan transkrip atau catatan kasar berikut dalam Bahasa Indonesia:\n\nCatatan:\n${payload?.notes || ''}\n\nFormat keluaran:\n- **Judul Rapat**\n- **Tanggal & Waktu**\n- **Poin-Poin Pembahasan Penting**\n- **Keputusan Utama**\n- **Daftar Tindak Lanjut (Action Items) & Penanggung Jawab**\n\nBerikan format Markdown yang rapi.`;
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

// --- ADMIN & DEVELOPER ROUTES ---
app.get("/api/audit-logs", async (req, res) => {
  const rtId = getScopedRtId(req);
  try {
    const logs = await AuditLogModel.find({ rtId }).sort({ timestamp: -1 }).limit(150).lean();
    return res.json({ data: logs });
  } catch {
    return res.status(500).json({ error: "Gagal membaca audit logs" });
  }
});

app.get("/api/developer/stats", requireRole(['developer']), async (_req, res) => {
  try {
    const registeredCount = await UserModel.countDocuments({});
    const onlineCount = activeSessions.size;
    return res.json({ registeredCount, onlineCount });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil statistik developer" });
  }
});

app.put("/api/developer/rt/:rtId/vip", requireRole(['developer']), async (req, res) => {
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

app.get("/api/public/rt-list", async (_req, res) => {
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
      if (id.startsWith('rt')) label = `RT ${id.substring(2)}`;
      return { id, label };
    });

    return res.json({ success: true, data: list });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil daftar RT" });
  }
});

app.get("/api/developer/rt", requireRole(['developer']), async (_req, res) => {
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

app.post("/api/developer/rt", requireRole(['developer']), async (req, res) => {
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
    if (existing) return res.status(400).json({ error: `Nomor RT [${cleanRtId.toUpperCase()}] sudah terdaftar.` });

    const newConfig = await RtConfigModel.create({ rtId: cleanRtId, isVip: Boolean(isVip) });
    broadcastEvent('update', { type: 'rt_list_update' });
    return res.json({ success: true, message: `Nomor RT [${cleanRtId.toUpperCase()}] berhasil ditambahkan.`, rt: newConfig });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Gagal menambahkan RT baru" });
  }
});

app.get("/api/menu-permissions", async (_req, res) => {
  try {
    const list = await MenuAccessModel.find({}).lean();
    return res.json({ data: list });
  } catch {
    return res.status(500).json({ error: "Gagal mengambil konfigurasi menu" });
  }
});

app.post("/api/menu-permissions", requireRole(['developer']), async (req, res) => {
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

app.post("/api/iuran/remind", requireRole(['admin', 'pengurus', 'sekretaris', 'bendahara', 'developer']), async (req, res) => {
  const rtId = getScopedRtId(req);
  const { bulan, tahun, jenis, messageTemplate } = req.body;
  if (!bulan || !tahun) return res.status(400).json({ error: "Bulan dan tahun harus diisi" });

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

app.get("/api/backup/export", requireRole(['admin']), async (req, res) => {
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

// ==========================================
// 6. INITIAL SEED & DATABASE INIT
// ==========================================
export async function initDb(rtId: string = 'rt01') {
  await connectDB();
  try {
    let adminUsername = "ketuart1";
    let adminPassword = "rt12345";
    let statusText = "Ketua RT 01 / RW 21";
    let namaKetua = "Ketua RT 01";

    if (rtId === 'rt02') {
      adminUsername = "ketuart2";
      statusText = "Ketua RT 02 / RW 21";
      namaKetua = "Ketua RT 02";
    } else if (rtId === 'rt03') {
      adminUsername = "ketuart3";
      statusText = "Ketua RT 03 / RW 21";
      namaKetua = "Ketua RT 03";
    }

    const adminId = "admin_" + adminUsername;
    const existingAdmin = await UserModel.findOne({ $or: [{ id: adminId }, { username: adminUsername }] });
    if (!existingAdmin) {
      await UserModel.create({
        id: adminId,
        username: adminUsername,
        password: hashPassword(adminPassword),
        nama: namaKetua,
        role: "admin",
        alamat: "Jl. Bahagia No. 12, Kompleks Rukun",
        noHp: "0812-3456-7890",
        status: statusText,
        isApproved: true,
        rtId: rtId || 'rt01'
      });
    }

    const devUsername = "developer";
    const existingDev = await UserModel.findOne({ id: "dev_system" });
    if (!existingDev) {
      await UserModel.create({
        id: "dev_system",
        username: devUsername,
        password: hashPassword("developer123"),
        nama: "Sistem Developer",
        role: "developer",
        alamat: "Database Server Core",
        noHp: "0899-9999-9999",
        status: "System Developer",
        isApproved: true,
        rtId: rtId || 'rt01'
      });
    }

    const defaultPermissions = [
      {
        role: 'developer',
        allowedMenus: ['Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Inventaris', 'Smart RT AI', 'Pengaturan', 'Akses Menu']
      },
      {
        role: 'admin',
        allowedMenus: ['Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Inventaris', 'Smart RT AI', 'Pengaturan']
      },
      {
        role: 'sekretaris',
        allowedMenus: ['Dashboard', 'Warga', 'Surat Online', 'Dokumen', 'Laporan', 'Notulen Rapat', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Inventaris', 'Pengaturan']
      },
      {
        role: 'bendahara',
        allowedMenus: ['Dashboard', 'Warga', 'Iuran', 'Kas', 'Dokumen', 'Laporan', 'Voting', 'UMKM', 'Pengaturan']
      },
      {
        role: 'pengurus',
        allowedMenus: ['Dashboard', 'Warga', 'Dokumen', 'Laporan', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Inventaris', 'Pengaturan']
      },
      {
        role: 'warga',
        allowedMenus: ['Dashboard', 'Warga', 'Surat Online', 'Iuran', 'Dokumen', 'Laporan', 'Voting', 'Pengumuman', 'Media', 'UMKM', 'Smart RT AI', 'Pengaturan']
      }
    ];

    for (const perm of defaultPermissions) {
      const exists = await MenuAccessModel.findOne({ role: perm.role });
      if (!exists) await MenuAccessModel.create(perm);
    }

    const daruratCount = await DaruratModel.countDocuments({ rtId });
    if (daruratCount === 0) {
      await DaruratModel.insertMany([
        { id: `${rtId}_d1`, name: 'Ambulance & Gawat Darurat', tel: '118', type: 'Medis', rtId: rtId || 'rt01' },
        { id: `${rtId}_d2`, name: 'Polisi', tel: '110', type: 'Keamanan', rtId: rtId || 'rt01' },
        { id: `${rtId}_d3`, name: 'Pemadam Kebakaran', tel: '113', type: 'Kebakaran', rtId: rtId || 'rt01' },
        { id: `${rtId}_d4`, name: 'Ketua RT', tel: '081234567890', type: 'Lingkungan', rtId: rtId || 'rt01' },
        { id: `${rtId}_d5`, name: 'Security Pos Depan', tel: '089876543210', type: 'Keamanan', rtId: rtId || 'rt01' }
      ]);
    }
  } catch (e) {
    console.error("DB Initialization Warning:", e);
  }
}

// ==========================================
// 7. CENTRALIZED ERROR & 404 HANDLER
// ==========================================
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) return;
  const status = err.status || err.statusCode || 500;
  let code = "INTERNAL_ERROR";
  let message = "Terjadi kesalahan internal pada server.";

  if (err.name === "ValidationError" || err.name === "ZodError") {
    code = "VALIDATION_ERROR";
    message = err.errors?.[0]?.message || err.message || "Validasi data gagal.";
  } else if (err.name === "JsonWebTokenError") {
    code = "AUTH_INVALID";
    message = "Token autentikasi tidak valid.";
  } else if (err.name === "TokenExpiredError") {
    code = "AUTH_EXPIRED";
    message = "Token autentikasi telah kadaluarsa.";
  } else if (err.name === "UnauthorizedError" || status === 401) {
    code = "AUTH_REQUIRED";
    message = err.message || "Akses memerlukan autentikasi.";
  } else if (status === 403) {
    code = "FORBIDDEN";
    message = err.message || "Akses ditolak: Anda tidak memiliki wewenang.";
  } else if (status === 404) {
    code = "NOT_FOUND";
    message = err.message || "Resource tidak ditemukan.";
  } else if (status === 429) {
    code = "RATE_LIMITED";
    message = err.message || "Terlalu banyak permintaan.";
  }

  if (status >= 500) {
    console.error(`[API Error ${req.method} ${req.originalUrl}]:`, err?.message || err);
  }

  return res.status(status).json({ error: { code, message }, message });
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `Endpoint ${req.originalUrl} tidak ditemukan` } });
});

// ==========================================
// 8. SERVER LIFECYCLE & VITE INTEGRATION
// ==========================================
export async function startServer(listen = true) {
  const distPath = path.join(process.cwd(), "dist");
  const distIndex = path.join(distPath, "index.html");
  const isDevCommand = process.env.npm_lifecycle_event === "dev";
  const isProduction =
    !isDevCommand &&
    (process.env.NODE_ENV === "production" ||
      process.env.npm_lifecycle_event === "start" ||
      Boolean(process.env.VERCEL)) &&
    fs.existsSync(distIndex);

  if (!isProduction) {
    const viteDynamic = "vite";
    const viteModule = await import(viteDynamic);
    const vite = await viteModule.createServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(path.join(process.cwd(), "index.html"));
      }
    });
  }

  if (listen) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server launched successfully on port ${PORT}`);
    });
  }

  (async () => {
    try {
      await connectDB();
      if (!process.env.VERCEL) {
        await initDb("rt01");
        await initDb("rt02");
        await initDb("rt03");
      }
    } catch (err) {
      console.error("Background DB initialization warning:", err);
    }
  })();
}

if (!process.env.VERCEL) {
  startServer(true);
}

export default app;
