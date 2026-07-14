var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  addNotification: () => addNotification,
  app: () => app,
  default: () => server_default,
  startServer: () => startServer
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_express_async_errors = require("express-async-errors");
var import_path = __toESM(require("path"), 1);
var import_mongoose = __toESM(require("mongoose"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_zod = require("zod");
var import_genai = require("@google/genai");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
import_dotenv.default.config();
var JWT_SECRET = process.env.JWT_SECRET || "guyubrukunsecretkey_for_jwt2026";
function verifyPassword(input, stored) {
  if (stored && stored.startsWith("$2") && stored.length >= 50) {
    return import_bcryptjs.default.compareSync(input, stored);
  }
  return input === stored;
}
function hashPassword(password) {
  return import_bcryptjs.default.hashSync(password, 10);
}
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 1e4,
  // Limit each IP to 10000 requests per window to prevent blocking during dev/testing
  message: "Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit.",
  validate: { trustProxy: false, xForwardedForHeader: false }
});
var app = (0, import_express.default)();
app.set("trust proxy", 1);
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/", apiLimiter);
function authMiddleware(req, res, next) {
  const publicRoutes = [
    "/api/login",
    "/api/register",
    "/api/health"
  ];
  const pathName = req.path;
  if (!pathName.startsWith("/api/")) {
    return next();
  }
  if (publicRoutes.includes(pathName) || pathName.startsWith("/api/tangerang-logo-proxy") || pathName.startsWith("/api/stream")) {
    return next();
  }
  if (req.method === "GET" && (pathName === "/api/data/acara" || pathName === "/api/data/media")) {
    return next();
  }
  const authHeader = req.headers["authorization"];
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = req.query.token || req.headers["x-auth-token"] || "";
  }
  if (!token) {
    return res.status(401).json({ error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
    req.headers["x-user-username"] = decoded.username;
    req.headers["x-user-nama"] = decoded.nama;
    if (decoded.rtId) {
      req.headers["x-rt-id"] = decoded.rtId;
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Verifikasi sesi gagal atau token kedaluwarsa. Silakan login kembali." });
  }
}
app.use(authMiddleware);
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guyubrukun";
var SystemDataSchema = new import_mongoose.default.Schema({
  _id: String,
  data: import_mongoose.default.Schema.Types.Mixed
}, { strict: false });
var SystemDataModel = import_mongoose.default.models.SystemData || import_mongoose.default.model("SystemData", SystemDataSchema);
var UserSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  nama: { type: String, required: true },
  password: { type: String, required: true },
  alamat: { type: String },
  noHp: { type: String },
  status: { type: String },
  role: { type: String, enum: ["admin", "warga", "bendahara", "sekretaris", "pengurus", "developer"], default: "warga" },
  isApproved: { type: Boolean, default: false },
  isVip: { type: Boolean, default: false },
  rtId: { type: String, required: true },
  umur: { type: Number },
  members: [{
    id: String,
    name: String,
    role: String,
    age: Number,
    tglLahir: String
  }],
  photo: String,
  dokumenKk: String,
  dokumenKtp: String
}, { timestamps: true });
var UserModel = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);
var RtConfigSchema = new import_mongoose.default.Schema({
  rtId: { type: String, required: true, unique: true },
  isVip: { type: Boolean, default: false }
}, { timestamps: true });
var RtConfigModel = import_mongoose.default.models.RtConfig || import_mongoose.default.model("RtConfig", RtConfigSchema);
var IuranSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  nominal: { type: Number, required: true, min: 0 },
  jenis: { type: String, required: true },
  status: { type: String, required: true },
  // 'verifikasi', 'lunas', 'butuh_konfirmasi'
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true },
  proofUrl: { type: String },
  userId: { type: String },
  bulan: { type: String },
  buktiUrl: { type: String }
}, { timestamps: true, strict: false });
var IuranModel = import_mongoose.default.models.Iuran || import_mongoose.default.model("Iuran", IuranSchema);
var KasSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ["Masuk", "Keluar"], required: true },
  amount: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, required: true },
  // 'Kas RT', 'Dana Kematian', 'Lainnya'
  iuranId: { type: String },
  rtId: { type: String, required: true },
  status: { type: String, enum: ["setuju", "butuh_konfirmasi", "selesai"], default: "selesai" },
  buktiTransaksi: { type: String },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var KasModel = import_mongoose.default.models.Kas || import_mongoose.default.model("Kas", KasSchema);
var VotingSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  options: [{ id: String, text: String, count: Number }],
  votes: [{
    userId: { type: String, required: true },
    optionId: { type: String, required: true },
    date: { type: String, required: true }
  }],
  status: { type: String, enum: ["aktif", "selesai"], default: "aktif" },
  createdBy: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var VotingModel = import_mongoose.default.models.Voting || import_mongoose.default.model("Voting", VotingSchema);
var AcaraSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  desc: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  location: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var AcaraModel = import_mongoose.default.models.Acara || import_mongoose.default.model("Acara", AcaraSchema);
var LaporanSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  judul: { type: String, required: true },
  deskripsi: { type: String, required: true },
  status: { type: String, default: "baru" },
  // 'baru', 'proses', 'selesai'
  nama: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: true });
var LaporanModel = import_mongoose.default.models.Laporan || import_mongoose.default.model("Laporan", LaporanSchema);
var SuratSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  jenis: { type: String, required: true },
  keperluan: { type: String },
  status: { type: String, default: "proses" },
  // 'proses', 'selesai'
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
var SuratModel = import_mongoose.default.models.Surat || import_mongoose.default.model("Surat", SuratSchema);
var UmkmSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  category: { type: String, required: true },
  phone: { type: String },
  desc: { type: String },
  price: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var UmkmModel = import_mongoose.default.models.Umkm || import_mongoose.default.model("Umkm", UmkmSchema);
var TamuSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  keperluan: { type: String },
  durasi: { type: String },
  alamatAsal: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var TamuModel = import_mongoose.default.models.Tamu || import_mongoose.default.model("Tamu", TamuSchema);
var MediaSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  title: { type: String },
  uploaderName: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var MediaModel = import_mongoose.default.models.Media || import_mongoose.default.model("Media", MediaSchema);
var DaruratSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  type: { type: String },
  rtId: { type: String, required: true }
});
var DaruratModel = import_mongoose.default.models.Darurat || import_mongoose.default.model("Darurat", DaruratSchema);
var AuditLogSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  before: import_mongoose.default.Schema.Types.Mixed,
  after: import_mongoose.default.Schema.Types.Mixed,
  rtId: { type: String, required: true },
  timestamp: { type: String, required: true }
});
var AuditLogModel = import_mongoose.default.models.AuditLog || import_mongoose.default.model("AuditLog", AuditLogSchema);
var NotificationSchema = new import_mongoose.default.Schema({
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
var NotificationModel = import_mongoose.default.models.Notification || import_mongoose.default.model("Notification", NotificationSchema);
var DokumenSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  // 'KK', 'KTP', 'Surat RT', 'Peraturan', 'Lainnya'
  fileUrl: { type: String, required: true },
  // base64 or URL
  uploaderId: { type: String },
  uploaderName: { type: String },
  rtId: { type: String, required: true }
}, { timestamps: true });
var DokumenModel = import_mongoose.default.models.Dokumen || import_mongoose.default.model("Dokumen", DokumenSchema);
var InventarisSchema = new import_mongoose.default.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  // 'Tenda', 'Kursi', 'Alat Kebersihan', 'Lainnya'
  quantity: { type: Number, default: 1 },
  condition: { type: String, enum: ["baik", "rusak_ringan", "rusak_berat"], default: "baik" },
  location: { type: String },
  status: { type: String, enum: ["tersedia", "dipinjam"], default: "tersedia" },
  notes: { type: String },
  rtId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });
var InventarisModel = import_mongoose.default.models.Inventaris || import_mongoose.default.model("Inventaris", InventarisSchema);
var NotulenSchema = new import_mongoose.default.Schema({
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
var NotulenModel = import_mongoose.default.models.Notulen || import_mongoose.default.model("Notulen", NotulenSchema);
var MenuAccessSchema = new import_mongoose.default.Schema({
  role: { type: String, required: true, unique: true },
  allowedMenus: [{ type: String }],
  // Maps to "Read/View"
  createMenus: [{ type: String }],
  updateMenus: [{ type: String }],
  deleteMenus: [{ type: String }]
}, { timestamps: true });
var MenuAccessModel = import_mongoose.default.models.MenuAccess || import_mongoose.default.model("MenuAccess", MenuAccessSchema);
UserSchema.index({ username: 1 });
UserSchema.index({ id: 1 }, { unique: true });
UserSchema.index({ rtId: 1, role: 1 });
UserSchema.index({ rtId: 1, nama: 1 });
UserSchema.index({ rtId: 1, isApproved: 1 });
IuranSchema.index({ id: 1 }, { unique: true });
IuranSchema.index({ rtId: 1, createdAt: -1 });
IuranSchema.index({ rtId: 1, name: 1, createdAt: -1 });
IuranSchema.index({ rtId: 1, status: 1, createdAt: -1 });
KasSchema.index({ id: 1 }, { unique: true });
KasSchema.index({ rtId: 1, createdAt: -1 });
KasSchema.index({ rtId: 1, name: 1, createdAt: -1 });
KasSchema.index({ rtId: 1, type: 1, createdAt: -1 });
VotingSchema.index({ id: 1 }, { unique: true });
VotingSchema.index({ rtId: 1, createdAt: -1 });
AcaraSchema.index({ id: 1 }, { unique: true });
AcaraSchema.index({ rtId: 1, date: -1 });
LaporanSchema.index({ id: 1 }, { unique: true });
LaporanSchema.index({ rtId: 1, createdAt: -1 });
SuratSchema.index({ id: 1 }, { unique: true });
SuratSchema.index({ rtId: 1, createdAt: -1 });
UmkmSchema.index({ id: 1 }, { unique: true });
UmkmSchema.index({ rtId: 1, createdAt: -1 });
TamuSchema.index({ id: 1 }, { unique: true });
TamuSchema.index({ rtId: 1, createdAt: -1 });
MediaSchema.index({ id: 1 }, { unique: true });
MediaSchema.index({ rtId: 1, createdAt: -1 });
AuditLogSchema.index({ id: 1 }, { unique: true });
AuditLogSchema.index({ rtId: 1, timestamp: -1 });
NotificationSchema.index({ id: 1 }, { unique: true });
NotificationSchema.index({ rtId: 1, time: -1 });
DokumenSchema.index({ id: 1 }, { unique: true });
DokumenSchema.index({ rtId: 1, createdAt: -1 });
InventarisSchema.index({ id: 1 }, { unique: true });
InventarisSchema.index({ rtId: 1, createdAt: -1 });
NotulenSchema.index({ id: 1 }, { unique: true });
NotulenSchema.index({ rtId: 1, date: -1 });
MenuAccessSchema.index({ role: 1 }, { unique: true });
async function migrateLegacyDataIfAny(rtId) {
  try {
    const legacyDocId = rtId ? `users_${rtId}` : "users";
    const legacyDoc = await SystemDataModel.findById(legacyDocId);
    if (legacyDoc && legacyDoc.data && legacyDoc.data.list) {
      console.log(`[Migration] Legacy users found for ${rtId}. Upgrading to dedicated UserModel...`);
      for (const u of legacyDoc.data.list) {
        const exists = await UserModel.findOne({ id: u.id });
        if (!exists) {
          await UserModel.create({
            ...u,
            rtId: rtId || "rt01"
          });
        }
      }
      await SystemDataModel.findByIdAndDelete(legacyDocId);
    }
    const legacyAppId = rtId ? `app_data_${rtId}` : "app_data";
    const legacyApp = await SystemDataModel.findById(legacyAppId);
    if (legacyApp && legacyApp.data) {
      const data = legacyApp.data;
      console.log(`[Migration] Legacy App Data found for ${rtId}. Separating into collection modules...`);
      const map = {
        surat: SuratModel,
        laporan: LaporanModel,
        acara: AcaraModel,
        umkm: UmkmModel,
        kas: KasModel,
        iuran: IuranModel,
        darurat: DaruratModel,
        tamu: TamuModel,
        media: MediaModel,
        voting: VotingModel,
        dokumen: DokumenModel,
        inventaris: InventarisModel
      };
      for (const [key, model] of Object.entries(map)) {
        if (data[key] && Array.isArray(data[key])) {
          for (const item of data[key]) {
            const exists = await model.findOne({ id: item.id });
            if (!exists) {
              await model.create({
                ...item,
                rtId: rtId || "rt01"
              });
            }
          }
        }
      }
      await SystemDataModel.findByIdAndDelete(legacyAppId);
    }
  } catch (error) {
    console.error(`[Migration Error] Fault migrating legacy documents of ${rtId}:`, error);
  }
}
var isDbConnected = false;
async function connectDB() {
  if (import_mongoose.default.connection && import_mongoose.default.connection.readyState === 1) {
    isDbConnected = true;
    return;
  }
  if (import_mongoose.default.connection && import_mongoose.default.connection.readyState === 2) {
    return;
  }
  try {
    await import_mongoose.default.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 5e3
    });
    isDbConnected = true;
    console.log("Connected securely to MongoDB database system.");
  } catch (err) {
    console.error("MongoDB connection exception:", err);
  }
}
async function logAudit(rtId, user, action, details, before, after) {
  try {
    await AuditLogModel.create({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      user: user || "Sistem / Tamu",
      action,
      details,
      before,
      after,
      rtId: rtId || "rt01",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (e) {
    console.error("Failed to write audit trail log:", e);
  }
}
async function getUsers(rtId = "") {
  await connectDB();
  const q = rtId ? { rtId } : {};
  return await UserModel.find(q).lean();
}
async function saveUsers(rtId = "", users) {
  await connectDB();
  for (const user of users) {
    await UserModel.findOneAndUpdate(
      { id: user.id },
      { ...user, rtId: rtId || user.rtId || "rt01" },
      { upsert: true, new: true }
    );
  }
  const currentIds = users.map((u) => u.id);
  if (rtId) {
    await UserModel.deleteMany({ rtId, id: { $nin: currentIds } });
  }
  broadcastEvent("update", { type: "users", rtId });
}
async function getNotifications(rtId = "") {
  await connectDB();
  const q = rtId ? { rtId } : {};
  return await NotificationModel.find(q).sort({ time: -1 }).limit(100).lean();
}
async function initDb(rtId = "") {
  await connectDB();
  try {
    await migrateLegacyDataIfAny(rtId);
    let list = await getUsers(rtId);
    let adminUsername = "ketuart1";
    let adminPassword = "rt12345";
    let statusText = "Ketua RT 01 / RW 21";
    let namaKetua = "Ketua RT 01";
    if (rtId === "rt02") {
      adminUsername = "ketuart2";
      adminPassword = "rt12345";
      statusText = "Ketua RT 02 / RW 21";
      namaKetua = "Ketua RT 02";
    } else if (rtId === "rt03") {
      adminUsername = "ketuart3";
      adminPassword = "rt12345";
      statusText = "Ketua RT 03 / RW 21";
      namaKetua = "Ketua RT 03";
    }
    let cleanedList = list.filter((u) => u.role !== "admin" || u.username === adminUsername);
    if (cleanedList.length !== list.length) {
      list = cleanedList;
      await saveUsers(rtId, list);
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
        rtId: rtId || "rt01"
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
        status: "System Developer & Subscription Configurator",
        isApproved: true,
        rtId: rtId || "rt01"
      });
    }
    const defaultPermissions = [
      {
        role: "developer",
        allowedMenus: ["Dashboard", "Warga", "Surat Online", "Iuran", "Kas", "Dokumen", "Laporan", "Notulen Rapat", "Pengumuman", "Media", "UMKM", "Tamu", "Inventaris", "Smart RT AI", "Pengaturan", "Akses Menu"]
      },
      {
        role: "admin",
        allowedMenus: ["Dashboard", "Warga", "Surat Online", "Iuran", "Kas", "Dokumen", "Laporan", "Notulen Rapat", "Pengumuman", "Media", "UMKM", "Tamu", "Inventaris", "Smart RT AI", "Pengaturan"]
      },
      {
        role: "sekretaris",
        allowedMenus: ["Dashboard", "Warga", "Surat Online", "Dokumen", "Notulen Rapat", "Pengumuman", "Media", "Inventaris", "Pengaturan"]
      },
      {
        role: "bendahara",
        allowedMenus: ["Dashboard", "Iuran", "Kas", "Dokumen", "Laporan", "Pengaturan"]
      },
      {
        role: "pengurus",
        allowedMenus: ["Dashboard", "Warga", "Dokumen", "Laporan", "Pengumuman", "Media", "Inventaris", "Pengaturan"]
      },
      {
        role: "warga",
        allowedMenus: ["Dashboard", "Surat Online", "Iuran", "Laporan", "Pengumuman", "Media", "UMKM", "Tamu", "Smart RT AI", "Pengaturan"]
      }
    ];
    for (const perm of defaultPermissions) {
      const exists = await MenuAccessModel.findOne({ role: perm.role });
      if (!exists) {
        await MenuAccessModel.create(perm);
      }
    }
    const daruratCount = await DaruratModel.countDocuments({ rtId });
    if (daruratCount === 0) {
      const initialDarurat = [
        { id: `${rtId}_d1`, name: "Ambulance & Gawat Darurat", tel: "118", type: "Medis", rtId: rtId || "rt01" },
        { id: `${rtId}_d2`, name: "Polisi", tel: "110", type: "Keamanan", rtId: rtId || "rt01" },
        { id: `${rtId}_d3`, name: "Pemadam Kebakaran", tel: "113", type: "Kebakaran", rtId: rtId || "rt01" },
        { id: `${rtId}_d4`, name: "Ketua RT", tel: "081234567890", type: "Lingkungan", rtId: rtId || "rt01" },
        { id: `${rtId}_d5`, name: "Security Pos Depan", tel: "089876543210", type: "Keamanan", rtId: rtId || "rt01" }
      ];
      await DaruratModel.insertMany(initialDarurat);
    }
    const mediaCount = await MediaModel.countDocuments({ rtId });
    if (mediaCount === 0) {
      await MediaModel.create({
        id: `${rtId}_media1`,
        imageUrl: "https://images.unsplash.com/photo-1593113511332-15f5ea6c4dcd?auto=format&fit=crop&w=300&q=80",
        title: "Kerja Bakti 2024",
        uploaderName: "Admin",
        rtId: rtId || "rt01",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (e) {
    console.error("DB Initialization Error:", e);
  }
}
var clients = /* @__PURE__ */ new Set();
function broadcastEvent(event, data) {
  for (const client of clients) {
    try {
      client.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
    } catch (e) {
      clients.delete(client);
    }
  }
}
async function addNotification(rtId = "", title, message, updaterName = "Sistem", resource, resourceId) {
  const notifs = await getNotifications(rtId);
  if (notifs.length > 0) {
    const lastNotif = notifs[0];
    if (lastNotif.title === title && lastNotif.message === message && lastNotif.resourceId === resourceId) {
      return;
    }
  }
  const newNotif = {
    id: Date.now().toString(),
    title,
    message,
    updaterName,
    resource,
    resourceId,
    time: (/* @__PURE__ */ new Date()).toISOString(),
    read: false,
    rtId: rtId || "rt01"
  };
  await NotificationModel.create(newNotif);
  broadcastEvent("update", { type: "notifications", rtId });
}
var RegisterValidator = import_zod.z.object({
  username: import_zod.z.string().min(3, "Username minimal 3 karakter"),
  nama: import_zod.z.string().min(2, "Nama minimal 2 karakter"),
  password: import_zod.z.string().min(5, "Password minimal 5 karakter"),
  alamat: import_zod.z.string().optional(),
  noHp: import_zod.z.string().optional(),
  status: import_zod.z.string().optional(),
  umur: import_zod.z.any().optional()
});
var LoginValidator = import_zod.z.object({
  username: import_zod.z.string(),
  password: import_zod.z.string()
});
var KasTransactionValidator = import_zod.z.object({
  type: import_zod.z.enum(["Masuk", "Keluar"]),
  amount: import_zod.z.number().positive("Jumlah kas harus bilangan bernilai positif"),
  name: import_zod.z.string(),
  message: import_zod.z.string().min(1, "Berikan deksrispi transaksi"),
  category: import_zod.z.string(),
  status: import_zod.z.enum(["setuju", "butuh_konfirmasi", "selesai"]).optional()
});
var IuranValidator = import_zod.z.object({
  nama: import_zod.z.string(),
  nominal: import_zod.z.number().positive("Nominal iuran harus positif"),
  jenis: import_zod.z.string(),
  status: import_zod.z.string()
});
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e) {
      res.status(400).json({ error: e.errors?.[0]?.message || "Input validation failed!" });
    }
  };
}
function enforceRoles(allowed) {
  return (req, res, next) => {
    const role = req.headers["x-user-role"] || "warga";
    if (role === "developer" || allowed.includes(role)) {
      next();
    } else {
      res.status(403).json({ error: `Akses ditolak: role '${role}' tidak memiliki authorize di resource ini.` });
    }
  };
}
app.post("/api/register", validateRequest(RegisterValidator), async (req, res) => {
  const { username, nama, password, alamat, noHp, status, umur } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  await connectDB();
  const userExists = await UserModel.findOne({ rtId, username });
  if (userExists) {
    return res.status(400).json({ error: "Username sudah terdaftar" });
  }
  const newUser = await UserModel.create({
    id: Date.now().toString(),
    username,
    nama,
    password: hashPassword(password),
    alamat,
    noHp,
    status,
    role: "warga",
    isApproved: false,
    umur: Number(umur) || void 0,
    rtId,
    members: []
  });
  await logAudit(rtId, nama, "REGISTER_WARGA", `Warga baru ${nama} mendaftarkan dengan role warga`, null, newUser);
  await addNotification(rtId, "Warga Baru Terdaftar", `Warga baru ${nama} telah didaftarkan. Menunggu verifikasi.`, nama, "warga", newUser.id);
  res.json({ message: "Registrasi sukses", user: newUser });
});
var activeSessions = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 15e3) {
      activeSessions.delete(id);
      changed = true;
    }
  }
  if (changed) {
    broadcastEvent("update", { type: "online_status" });
  }
}, 5e3);
app.post("/api/login", validateRequest(LoginValidator), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const rtId = req.headers["x-rt-id"] || "rt01";
    await connectDB();
    const query = { username };
    if (username !== "developer") {
      query.rtId = rtId;
    }
    const user = await UserModel.findOne(query);
    if (user && verifyPassword(password, user.password)) {
      if (!user.password.startsWith("$2") && user.password === password) {
        user.password = hashPassword(password);
        await user.save();
      }
      if (activeSessions.has(user.id) && Date.now() - activeSessions.get(user.id) < 1e4) {
        return res.status(409).json({ error: "User sedang aktif digunakan pada perangkat lain" });
      }
      activeSessions.set(user.id, Date.now());
      const token = import_jsonwebtoken.default.sign(
        { id: user.id, username: user.username, role: user.role, nama: user.nama, rtId: user.rtId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      const userJson = user.toObject();
      userJson.token = token;
      const rtConfig = await RtConfigModel.findOne({ rtId: user.rtId });
      userJson.isVip = rtConfig?.isVip || false;
      res.json({ message: "Login Berhasil", user: userJson });
    } else {
      res.status(401).json({ error: "Username atau password salah" });
    }
  } catch (error) {
    next(error);
  }
});
app.post("/api/ping", async (req, res) => {
  const { id } = req.body;
  let isVip = false;
  if (id) {
    const wasOnline = activeSessions.has(id);
    activeSessions.set(id, Date.now());
    if (!wasOnline) {
      broadcastEvent("update", { type: "online_status" });
    }
    const rtId = req.headers["x-rt-id"] || "rt01";
    const rtConfig = await RtConfigModel.findOne({ rtId });
    isVip = rtConfig?.isVip || false;
  }
  res.json({ success: true, isVip });
});
app.post("/api/logout", (req, res) => {
  const { id } = req.body;
  if (id) {
    activeSessions.delete(id);
    broadcastEvent("update", { type: "online_status" });
  }
  res.json({ success: true });
});
app.get("/api/notifications", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    const list = await getNotifications(rtId);
    res.json({ notifications: list });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
app.post("/api/notifications/read", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    await NotificationModel.updateMany({ rtId }, { $set: { read: true } });
    broadcastEvent("update", { type: "notifications", rtId });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});
app.get("/api/tangerang-logo-proxy", async (req, res) => {
  try {
    const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Seal_of_Tangerang_Regency.svg/500px-Seal_of_Tangerang_Regency.svg.png";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.send(buffer);
  } catch (error) {
    console.error("Logo proxy error:", error);
    const transparentPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(transparentPngBase64, "base64"));
  }
});
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
app.put("/api/password", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id, rtId });
  if (user) {
    if (!verifyPassword(oldPassword, user.password)) {
      return res.status(400).json({ error: "Password lama tidak sesuai" });
    }
    const beforeObj = { password: "*****" };
    user.password = hashPassword(newPassword);
    await user.save();
    await logAudit(rtId, user.nama, "PASSWORD_UPDATE", `Mengubah password akun`, beforeObj, { password: "*****" });
    res.json({ message: "Password berhasil diganti" });
  } else {
    res.status(404).json({ error: "User tidak ditemukan" });
  }
});
app.put("/api/profile", async (req, res) => {
  const { id, username, nama, alamat, noHp, status, photo, umur, dokumenKk, dokumenKtp } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id, rtId });
  if (user) {
    const beforeObj = user.toObject();
    user.nama = nama || user.nama;
    user.alamat = alamat || user.alamat;
    user.noHp = noHp || user.noHp;
    user.status = status || user.status;
    user.photo = photo || user.photo;
    user.umur = umur !== void 0 ? Number(umur) : user.umur;
    user.dokumenKk = dokumenKk !== void 0 ? dokumenKk : user.dokumenKk;
    user.dokumenKtp = dokumenKtp !== void 0 ? dokumenKtp : user.dokumenKtp;
    const updatedUser = await user.save();
    await logAudit(rtId, user.nama, "PROFILE_UPDATE", `Memperbarui rincian profil`, beforeObj, updatedUser);
    const updater = req.body.updaterName || nama || user.nama || "Sistem";
    await addNotification(rtId, "Profil Diperbarui", `Warga ${user.nama} memperbarui profil.`, updater, "warga", id);
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } else {
    res.status(404).json({ error: "User tidak ditemukan" });
  }
});
app.get("/api/warga/:id", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    await connectDB();
    const user = await UserModel.findOne({ id: req.params.id, rtId }).lean();
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: "Warga tidak ditemukan" });
    }
  } catch (error) {
    console.error("Gagal mengambil rincian warga:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/warga", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;
  const search = req.query.search;
  const query = { rtId };
  if (search) {
    query.$or = [
      { nama: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } }
    ];
  }
  let dbQuery = UserModel.find(query);
  let sortedUsers = [];
  let total = 0;
  if (limit > 0) {
    total = await UserModel.countDocuments(query);
    const skip = (page - 1) * limit;
    const users = await dbQuery.skip(skip).limit(limit).lean();
    sortedUsers = users.map((u) => ({
      ...u,
      isOnline: activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id) < 15e3
    }));
    res.json({
      users: sortedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } else {
    const users = await dbQuery.lean();
    sortedUsers = users.map((u) => ({
      ...u,
      isOnline: activeSessions.has(u.id) && Date.now() - activeSessions.get(u.id) < 15e3
    }));
    res.json({ users: sortedUsers });
  }
});
app.delete("/api/warga/:id", enforceRoles(["admin"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user) {
    const beforeData = user.toObject();
    await UserModel.deleteOne({ id: req.params.id, rtId });
    await logAudit(rtId, req.headers["x-user-id"] || "Admin", "DELETE_WARGA", `Menghapus data warga ${user.nama}`, beforeData, null);
    await addNotification(rtId, "Warga Dihapus", `Data warga ${user.nama} telah dihapus.`, "Admin", "warga", req.params.id);
    res.json({ message: "User deleted" });
  } else {
    res.status(404).json({ error: "Warga tidak ditemukan" });
  }
});
app.post("/api/warga/:id/members", async (req, res) => {
  const { name, role, age, tglLahir } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user) {
    const beforeObj = JSON.parse(JSON.stringify(user.members || []));
    if (!user.members) user.members = [];
    const newMember = { id: Date.now().toString(), name, role, age: Number(age) || 0, tglLahir };
    user.members.push(newMember);
    await user.save();
    await logAudit(rtId, user.nama, "ADD_FAMILY_MEMBER", `Menambahkan anggota keluarga baru ${name} ke KK`, beforeObj, user.members);
    await addNotification(rtId, "Anggota Keluarga Bertambah", `Anggota baru ${name} ditambahkan ke KK ${user.nama}.`, user.nama, "warga", user.id);
    res.json({ message: "Family member added", member: newMember, user });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});
app.put("/api/warga/:id/members/:memberId", async (req, res) => {
  const { name, role, age, tglLahir } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.members) {
    const beforeObj = JSON.parse(JSON.stringify(user.members));
    const memberIndex = user.members.findIndex((m) => m.id === req.params.memberId);
    if (memberIndex !== -1) {
      user.members[memberIndex] = { ...user.members[memberIndex], name, role, age: Number(age) || 0, tglLahir };
      await user.save();
      await logAudit(rtId, user.nama, "UPDATE_FAMILY_MEMBER", `Memperbarui rincian keluarga ${name}`, beforeObj, user.members);
      await addNotification(rtId, "Anggota Keluarga Diperbarui", `Data anggota ${name} di KK ${user.nama} diperbarui.`, user.nama || "Sistem", "warga", user.id);
      res.json({ message: "Family member updated", user });
    } else {
      res.status(404).json({ error: "Member not found" });
    }
  } else {
    res.status(404).json({ error: "User not found" });
  }
});
app.delete("/api/warga/:id/members/:memberId", async (req, res) => {
  const role = req.headers["x-user-role"] || "warga";
  if (role !== "admin" && role !== "developer") {
    return res.status(403).json({ error: "Akses ditolak: Anggota keluarga hanya dapat dihapus oleh Ketua RT." });
  }
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.members) {
    const beforeObj = JSON.parse(JSON.stringify(user.members));
    const member = user.members.find((m) => m.id === req.params.memberId);
    user.members = user.members.filter((m) => m.id !== req.params.memberId);
    await user.save();
    if (member) {
      await logAudit(rtId, user.nama, "DELETE_FAMILY_MEMBER", `Menghapus anggota keluarga ${member.name}`, beforeObj, user.members);
      await addNotification(rtId, "Anggota Keluarga Dihapus", `Anggota ${member.name} dihapus dari KK ${user.nama}.`, user.nama, "warga", user.id);
    }
    res.json({ message: "Family member deleted", user });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});
app.put("/api/warga/:id/role", enforceRoles(["admin"]), async (req, res) => {
  const { role } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.id !== "admin") {
    const beforeRole = user.role;
    user.role = role;
    await user.save();
    await logAudit(rtId, "Admin", "PROMOTED_ROLE", `Mengubah peran warga ${user.nama} dari ${beforeRole} ke ${role}`, { role: beforeRole }, { role });
    await addNotification(rtId, "Peran Warga Diperbarui", `Peran warga ${user.nama} diubah menjadi ${role}.`, "Admin", "warga", user.id);
    res.json({ message: "Role updated successfully", user });
  } else {
    res.status(400).json({ error: "Gagal update role" });
  }
});
app.put("/api/warga/:id/approval", enforceRoles(["admin"]), async (req, res) => {
  const { isApproved } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user && user.id !== "admin") {
    const beforeState = user.isApproved;
    user.isApproved = isApproved;
    await user.save();
    await logAudit(rtId, "Admin", "WARGA_APPROVAL", `Verifikasi pendaftaran warga ${user.nama}: ${isApproved ? "SETUJU" : "BATAL"}`, { isApproved: beforeState }, { isApproved });
    const statusText = isApproved ? "disetujui" : "dibatalkan";
    await addNotification(rtId, "Status Warga Diperbarui", `Status warga ${user.nama} ${statusText}.`, "Admin", "warga", user.id);
    res.json({ message: "Status approval updated successfully", user });
  } else {
    res.status(400).json({ error: "Gagal update status approval" });
  }
});
app.put("/api/warga/:id/vip", enforceRoles(["developer", "admin"]), async (req, res) => {
  const { isVip } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const user = await UserModel.findOne({ id: req.params.id, rtId });
  if (user) {
    user.isVip = isVip;
    await user.save();
    const statusText = isVip ? "diaktifkan" : "dinonaktifkan";
    await addNotification(rtId, "Status VIP Diperbarui", `Akses VIP warga ${user.nama} ${statusText}.`, "Developer", "warga", user.id);
    res.json({ message: "VIP status updated successfully", user });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});
app.post("/api/transactions", async (req, res) => {
  const { type, amount, name, message } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  const formatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" });
  const formattedAmount = formatter.format(amount || 0);
  let notifTitle = `Transaksi ${type || "Baru"}`;
  let notifMessage = message || `Terdapat transaksi ${type ? type.toLowerCase() : "baru"} masuk sebesar ${formattedAmount} dari ${name || "Warga"}.`;
  await addNotification(rtId, notifTitle, notifMessage);
  res.json({ success: true, message: "Transaksi berhasil dan notifikasi dikirim" });
});
app.post("/api/broadcast", enforceRoles(["admin", "pengurus", "sekretaris", "bendahara"]), async (req, res) => {
  const { title, message, updaterName } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong" });
  await logAudit(rtId, updaterName || "Admin", "BROADCAST", `Mengirimkan pengumuman broadcast: ${title || "No Title"}`, null, { title, message });
  await addNotification(rtId, title || "\u{1F4E2} Pengumuman RT", message, updaterName || "Admin", "broadcast");
  res.json({ success: true, message: "Pesan broadcast berhasil dikirim ke semua warga" });
});
app.post("/api/iuran/remind", enforceRoles(["admin", "pengurus", "sekretaris", "bendahara", "developer"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const { bulan, tahun, jenis, messageTemplate } = req.body;
  if (!bulan || !tahun) {
    return res.status(400).json({ error: "Bulan dan tahun harus diisi" });
  }
  const period = `${bulan} ${tahun}`;
  const targetJenis = jenis || "Iuran Wajib";
  try {
    const wargaList = await UserModel.find({ rtId, isApproved: true }).lean();
    const paidRecords = await IuranModel.find({
      rtId,
      bulan: period,
      jenis: targetJenis
    }).lean();
    const unpaidWarga = [];
    const remindedNames = [];
    for (const user of wargaList) {
      if (["admin", "bendahara", "developer"].includes(user.role)) {
        continue;
      }
      const record = paidRecords.find((r) => r.userId === user.id);
      if (!record || record.status === "belum dibayar") {
        unpaidWarga.push(user);
        const finalMessage = messageTemplate ? messageTemplate.replace(/{nama}/g, user.nama).replace(/{bulan}/g, period).replace(/{jenis}/g, targetJenis) : `Halo ${user.nama}, Anda belum melakukan pembayaran ${targetJenis} untuk periode ${period}. Silakan lakukan pembayaran segera. Terima kasih.`;
        await addNotification(rtId, `Pengingat ${targetJenis}`, finalMessage, "Sistem", "iuran", record?.id || "unpaid");
        remindedNames.push(user.nama);
      }
    }
    await logAudit(rtId, req.headers["x-user-role"] || "Admin", "REMIND_IURAN", `Mengirim pengingat iuran ${targetJenis} periode ${period} kepada ${unpaidWarga.length} warga.`, null, { period, jenis: targetJenis });
    res.json({
      success: true,
      count: unpaidWarga.length,
      reminded: remindedNames
    });
  } catch (error) {
    console.error("Error sending iuran reminders:", error);
    res.status(500).json({ error: "Gagal mengirimkan pengingat iuran" });
  }
});
app.get("/api/data/:resource", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const resource = req.params.resource;
  const map = {
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
    notulen: NotulenModel,
    voting: VotingModel
  };
  const model = map[resource];
  if (!model) return res.status(404).json({ error: "Resource not found" });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;
  const search = req.query.search;
  let sortField = "createdAt";
  if (resource === "notulen" || resource === "acara") {
    sortField = "date";
  }
  const query = { rtId };
  if (req.query.userId) {
    query.userId = req.query.userId;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    if (resource === "kas" || resource === "iuran") {
      query.$or = [
        { name: searchRegex },
        { message: searchRegex }
      ];
    } else if (resource === "laporan" || resource === "surat" || resource === "acara" || resource === "umkm") {
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
  }
  let dbQuery = model.find(query);
  let balances = void 0;
  if (resource === "kas") {
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
      balances = {
        "Kas RT": 0,
        "Dana Kematian": 0,
        "Dana Sosial": 0
      };
      const catAmounts = {};
      aggregateResult.forEach((item) => {
        const category = item._id.category || "Kas RT";
        const type = item._id.type;
        if (!catAmounts[category]) {
          catAmounts[category] = { Masuk: 0, Keluar: 0 };
        }
        if (type === "Masuk") {
          catAmounts[category].Masuk += item.totalAmount;
        } else if (type === "Keluar") {
          catAmounts[category].Keluar += item.totalAmount;
        }
      });
      Object.keys(catAmounts).forEach((cat) => {
        balances[cat] = catAmounts[cat].Masuk - catAmounts[cat].Keluar;
      });
    } catch (e) {
      console.error("Gagal menjumlahkan saldo Kas:", e);
    }
  }
  if (limit > 0) {
    const total = await model.countDocuments(query);
    const skip = (page - 1) * limit;
    const results = await dbQuery.sort({ [sortField]: -1 }).skip(skip).limit(limit).lean();
    res.json({
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
    const results = await dbQuery.sort({ [sortField]: -1 }).lean();
    res.json({ data: results, balances });
  }
});
app.post("/api/data/:resource", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const resource = req.params.resource;
  const map = {
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
  const model = map[resource];
  if (!model) return res.status(404).json({ error: "Resource not found" });
  const role = req.headers["x-user-role"] || "warga";
  if (resource === "kas") {
    if (role !== "admin" && role !== "developer" && role !== "bendahara") {
      return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT atau Bendahara yang dapat menginput transaksi kas." });
    }
  }
  if (resource === "acara" || resource === "umkm" || resource === "inventaris") {
    if (role !== "admin" && role !== "developer" && role !== "sekretaris" && role !== "bendahara" && role !== "pengurus") {
      return res.status(403).json({ error: `Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan ${resource}.` });
    }
  }
  if (resource === "notulen") {
    if (role !== "admin" && role !== "developer" && role !== "sekretaris") {
      return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT atau Sekretaris yang dapat membuat notulen rapat." });
    }
  }
  if (resource === "iuran") {
    try {
      IuranValidator.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: e.errors?.[0]?.message || "Validasi nominal iuran gagal." });
    }
  }
  if (resource === "kas") {
    try {
      KasTransactionValidator.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: e.errors?.[0]?.message || "Validasi transaksi kas gagal." });
    }
  }
  const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const newItemData = {
    id: itemId,
    rtId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...req.body
  };
  if (resource === "surat") {
    const count = await SuratModel.countDocuments({ rtId });
    const sequence = String(count + 1).padStart(2, "0");
    const rtNum = rtId.match(/\d+/)?.[0] || "1";
    const formattedRt = `RT-${String(rtNum).padStart(3, "0")}`;
    const d = /* @__PURE__ */ new Date();
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const currentMonth = months[d.getMonth()];
    const year = d.getFullYear();
    const generatedNomor = `${sequence}/${formattedRt}/RW-021/${currentMonth}/${year}`;
    newItemData.nomorSurat = generatedNomor;
  }
  if (resource === "iuran" && typeof newItemData.nominal === "string") {
    newItemData.nominal = Number(newItemData.nominal);
  }
  if (resource === "kas" && typeof newItemData.amount === "string") {
    newItemData.amount = Number(newItemData.amount);
  }
  const createdItem = await model.create(newItemData);
  const creator = req.body.nama || req.body.name || req.body.uploaderName || req.body.pembuat || req.body.updaterName || "Sistem";
  await logAudit(rtId, creator, `CREATE_${resource.toUpperCase()}`, `Memasukkan record baru ke modul ${resource}`, null, createdItem);
  if (resource === "iuran" && createdItem.status === "verifikasi") {
    const nominal = parseInt(createdItem.nominal || "0", 10);
    if (createdItem.jenis === "Wifi") {
      const kasRTAmount = 1e4;
      await KasModel.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        type: "Masuk",
        amount: kasRTAmount,
        name: createdItem.nama,
        message: "Pembayaran Wifi (Kas RT)",
        category: "Kas RT",
        iuranId: createdItem.id,
        rtId,
        status: "selesai"
      });
    } else {
      const isSplit = nominal >= 5e3;
      const danaKematianAmount = isSplit ? 5e3 : 0;
      const kasRTAmount = nominal - danaKematianAmount;
      if (kasRTAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          type: "Masuk",
          amount: kasRTAmount,
          name: createdItem.nama,
          message: "Iuran Warga (Kas RT)",
          category: "Kas RT",
          iuranId: createdItem.id,
          rtId,
          status: "selesai"
        });
      }
      if (danaKematianAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          type: "Masuk",
          amount: danaKematianAmount,
          name: createdItem.nama,
          message: "Iuran Warga (Dana Kematian)",
          category: "Dana Kematian",
          iuranId: createdItem.id,
          rtId,
          status: "selesai"
        });
      }
    }
  }
  let title = `Input Baru: ${resource}`;
  if (resource === "laporan") title = "Laporan Baru";
  if (resource === "iuran") title = "Iuran Baru";
  if (resource === "kas") title = "Kas Baru";
  if (resource === "darurat") title = "Panggilan Darurat";
  if (resource === "acara") title = "Acara Baru";
  if (resource === "surat") title = "Surat Keluar Baru";
  await addNotification(rtId, title, `Terdapat data baru pada modul ${resource} oleh ${creator}.`, creator, resource, createdItem.id);
  res.json({ message: "Created successfully", item: createdItem });
});
app.put("/api/data/:resource/:id", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const resource = req.params.resource;
  const map = {
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
  const model = map[resource];
  if (!model) return res.status(404).json({ error: "Resource not found" });
  const role = req.headers["x-user-role"] || "warga";
  const userId = req.headers["x-user-id"];
  if (resource === "kas" || resource === "iuran") {
    if (role !== "admin" && role !== "developer" && role !== "bendahara") {
      return res.status(403).json({ error: `Akses ditolak: Hanya Ketua RT atau Bendahara yang dapat mengedit/memverifikasi transaksi ${resource}.` });
    }
  }
  if (resource === "acara" || resource === "umkm" || resource === "inventaris") {
    if (role !== "admin" && role !== "developer" && role !== "sekretaris" && role !== "bendahara" && role !== "pengurus") {
      return res.status(403).json({ error: `Akses ditolak: Anda tidak memiliki wewenang untuk mengedit ${resource}.` });
    }
  }
  if (resource === "notulen") {
    if (role !== "admin" && role !== "developer" && role !== "sekretaris") {
      return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT atau Sekretaris yang dapat mengedit notulen rapat." });
    }
  }
  if (resource === "surat") {
    if (role !== "admin" && role !== "developer" && role !== "sekretaris" && role !== "pengurus") {
      const existingSurat = await model.findOne({ id: req.params.id, rtId });
      if (!existingSurat || existingSurat.userId !== userId) {
        return res.status(403).json({ error: "Akses ditolak: Hanya Ketua RT, Sekretaris, Pengurus atau pembuat surat yang dapat mengedit surat ini." });
      }
    }
  }
  const oldItem = await model.findOne({ id: req.params.id, rtId });
  if (!oldItem) return res.status(404).json({ error: "Item not found" });
  const beforeDataObj = oldItem.toObject();
  const updatePayload = { ...req.body };
  if (updatePayload.nominal !== void 0) updatePayload.nominal = Number(updatePayload.nominal);
  if (updatePayload.amount !== void 0) updatePayload.amount = Number(updatePayload.amount);
  const updatedItem = await model.findOneAndUpdate({ id: req.params.id, rtId }, updatePayload, { new: true });
  const updater = req.body.updaterName || "Sistem";
  await logAudit(rtId, updater, `UPDATE_${resource.toUpperCase()}`, `Mengupdate record modul ${resource}`, beforeDataObj, updatedItem);
  if (resource === "surat" && oldItem.status !== updatedItem.status && updatedItem.status === "selesai") {
    await addNotification(rtId, "Surat Selesai", `Surat pengajuan untuk ${updatedItem.keperluan || "anda"} sudah bisa diambil.`, updater, resource, updatedItem.id);
  } else if (resource === "laporan" && oldItem.status !== updatedItem.status) {
    await addNotification(rtId, "Update Laporan", `Laporan ${updatedItem.judul || "warga"} kini berstatus mohon diproses: ${updatedItem.status}.`, updater, resource, updatedItem.id);
  } else if (resource === "iuran" && oldItem.status !== updatedItem.status && updatedItem.status === "verifikasi") {
    await addNotification(rtId, "Iuran Diverifikasi", `Iuran dari ${updatedItem.nama || "warga"} sebesar Rp ${updatedItem.nominal} telah diverifikasi dan masuk kas.`, updater, resource, updatedItem.id);
    const nominal = parseInt(updatedItem.nominal || "0", 10);
    if (updatedItem.jenis === "Wifi") {
      const kasRTAmount = 1e4;
      await KasModel.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        type: "Masuk",
        amount: kasRTAmount,
        name: updatedItem.nama,
        message: "Pembayaran Wifi (Kas RT)",
        category: "Kas RT",
        iuranId: updatedItem.id,
        rtId,
        status: "selesai"
      });
    } else {
      const isSplit = nominal >= 5e3;
      const danaKematianAmount = isSplit ? 5e3 : 0;
      const kasRTAmount = nominal - danaKematianAmount;
      if (kasRTAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          type: "Masuk",
          amount: kasRTAmount,
          name: updatedItem.nama,
          message: "Iuran Warga (Kas RT)",
          category: "Kas RT",
          iuranId: updatedItem.id,
          rtId,
          status: "selesai"
        });
      }
      if (danaKematianAmount > 0) {
        await KasModel.create({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          type: "Masuk",
          amount: danaKematianAmount,
          name: updatedItem.nama,
          message: "Iuran Warga (Dana Kematian)",
          category: "Dana Kematian",
          iuranId: updatedItem.id,
          rtId,
          status: "selesai"
        });
      }
    }
  } else {
    await addNotification(rtId, `Data Diupdate: ${resource}`, `Terdapat perubahan data pada modul ${resource} oleh ${updater}.`, updater, resource, updatedItem.id);
  }
  res.json({ message: "Updated successfully", item: updatedItem });
});
app.delete("/api/data/:resource/:id", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const resource = req.params.resource;
  const map = {
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
  const model = map[resource];
  if (!model) return res.status(404).json({ error: "Resource not found" });
  const role = req.headers["x-user-role"] || "warga";
  if (["surat", "laporan", "tamu", "kas", "iuran", "acara", "umkm", "inventaris", "notulen"].includes(resource)) {
    if (role !== "admin" && role !== "developer") {
      return res.status(403).json({ error: `Akses ditolak: Operasi hapus data ${resource} hanya dapat dilakukan oleh Ketua RT.` });
    }
  }
  const oldItem = await model.findOne({ id: req.params.id, rtId });
  if (!oldItem) return res.status(404).json({ error: "Item not found" });
  const beforeDataObj = oldItem.toObject();
  await model.deleteOne({ id: req.params.id, rtId });
  const updater = req.body?.updaterName || "Sistem";
  await logAudit(rtId, updater, `DELETE_${resource.toUpperCase()}`, `Menghapus record dari modul ${resource}`, beforeDataObj, null);
  if (resource === "kas" && oldItem.iuranId) {
    await IuranModel.deleteOne({ id: oldItem.iuranId, rtId });
    await KasModel.deleteMany({ iuranId: oldItem.iuranId, rtId });
  } else if (resource === "iuran") {
    await KasModel.deleteMany({ iuranId: req.params.id, rtId });
  }
  await addNotification(rtId, `Data Dihapus: ${resource}`, `Terdapat penghapusan data pada modul ${resource} oleh ${updater}.`, updater);
  res.json({ message: "Deleted successfully" });
});
app.post("/api/sedekah", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const { name, amount, message, paymentMethod } = req.body;
  if (!amount || Number(amount) < 1e3) {
    return res.status(400).json({ error: "Jumlah donasi minimal Rp 1.000." });
  }
  const donatorName = name && name.trim() !== "" ? name.trim() : "Hamba Allah";
  const parsedAmount = Number(amount);
  try {
    const newKas = await KasModel.create({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      type: "Masuk",
      amount: parsedAmount,
      name: donatorName,
      message: `[Sedekah QRIS - ${paymentMethod || "QRIS"}] ${message || "Infaq & Sedekah Masjid Al Ikhlas"}`,
      category: "Lainnya",
      rtId,
      status: "selesai"
    });
    await logAudit(rtId, donatorName, "CREATE_SEDEKAH_QRIS", `Menerima donasi QRIS sebesar Rp ${parsedAmount.toLocaleString("id-ID")} dari ${donatorName}`, null, newKas);
    await addNotification(
      rtId,
      "Sedekah QRIS Diterima",
      `Alhamdulillah, infaq/sedekah sebesar Rp ${parsedAmount.toLocaleString("id-ID")} dari ${donatorName} telah diterima melalui QRIS. Terima kasih atas kedermawanan Anda.`,
      donatorName
    );
    res.json({ message: "Donasi berhasil diterima. Terima kasih!", item: newKas });
  } catch (error) {
    console.error("Error saving QRIS donation:", error);
    res.status(500).json({ error: "Gagal menyimpan transaksi donasi." });
  }
});
app.get("/api/voting", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const data = await VotingModel.find({ rtId }).sort({ createdAt: -1 }).lean();
  res.json({ data });
});
app.post("/api/voting", enforceRoles(["admin", "pengurus", "sekretaris", "bendahara"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const { title, description, options, status, createdBy } = req.body;
  const newVote = await VotingModel.create({
    id: Date.now().toString(),
    title,
    description,
    options: options.map((opt) => ({ ...opt, count: 0 })),
    votes: [],
    status: status || "aktif",
    createdBy: createdBy || "Pengurus",
    rtId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await logAudit(rtId, createdBy || "Admin", "CREATE_VOTING", `Membuat polling voting baru: ${title}`, null, newVote);
  await addNotification(rtId, `Voting Baru: ${title}`, `Mari berpartisipasi pada voting baru: ${title}`, createdBy || "Pengurus");
  res.json({ message: "Voting created", data: newVote });
});
app.put("/api/voting/:id", enforceRoles(["admin", "pengurus", "sekretaris", "bendahara"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (voteDoc) {
    const beforeObj = voteDoc.toObject();
    await VotingModel.updateOne({ id: req.params.id, rtId }, { $set: req.body });
    const afterObj = await VotingModel.findOne({ id: req.params.id, rtId });
    await logAudit(rtId, "Admin", "UPDATE_VOTING", `Mengupdate satus/parameter voting: ${afterObj?.title}`, beforeObj, afterObj);
    res.json({ message: "Voting updated" });
  } else {
    res.status(404).json({ error: "Voting tidak ditemukan" });
  }
});
app.post("/api/voting/:id/vote", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  const { optionId, userId } = req.body;
  if (!userId || !optionId) {
    return res.status(400).json({ error: "Missing required voter specifications." });
  }
  const voteDoc = await VotingModel.findOne({ id: req.params.id, rtId });
  if (!voteDoc) {
    return res.status(404).json({ error: "Sesi voting tidak ditemukan!" });
  }
  if (voteDoc.status === "selesai") {
    return res.status(400).json({ error: "Sesi voting ini sudah berakhir dan ditutup." });
  }
  const existingVoteIndex = voteDoc.votes.findIndex((vt) => vt.userId === userId);
  const beforeObj = voteDoc.toObject();
  if (existingVoteIndex !== -1) {
    voteDoc.votes[existingVoteIndex].optionId = optionId;
    voteDoc.votes[existingVoteIndex].date = (/* @__PURE__ */ new Date()).toISOString();
  } else {
    voteDoc.votes.push({ userId, optionId, date: (/* @__PURE__ */ new Date()).toISOString() });
  }
  voteDoc.options = voteDoc.options.map((opt) => {
    const totalCount = voteDoc.votes.filter((v) => v.optionId === opt.id).length;
    return { ...opt, count: totalCount };
  });
  const updatedVote = await voteDoc.save();
  await logAudit(rtId, userId, "CAST_VOTE", `Warga menempatkan suara pada voting ${voteDoc.title}`, beforeObj, updatedVote);
  res.json({ message: "Suara berhasil dikirimkan", data: updatedVote });
});
app.get("/api/audit-logs", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    const logs = await AuditLogModel.find({ rtId }).sort({ timestamp: -1 }).limit(150).lean();
    res.json({ data: logs });
  } catch (e) {
    res.status(500).json({ error: "Failed to read logs" });
  }
});
app.get("/api/developer/stats", enforceRoles(["developer"]), async (req, res) => {
  try {
    const registeredCount = await UserModel.countDocuments({});
    const onlineCount = activeSessions.size;
    res.json({ registeredCount, onlineCount });
  } catch (e) {
    res.status(500).json({ error: "Gagal mengambil statistik developer" });
  }
});
app.put("/api/developer/rt/:rtId/vip", enforceRoles(["developer"]), async (req, res) => {
  try {
    const targetRtId = req.params.rtId;
    const { isVip } = req.body;
    await RtConfigModel.findOneAndUpdate(
      { rtId: targetRtId },
      { isVip },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: `Status VIP untuk RT ${targetRtId} diperbarui menjadi ${isVip}.` });
  } catch (e) {
    res.status(500).json({ error: "Gagal memperbarui status VIP" });
  }
});
app.get("/api/developer/rt", enforceRoles(["developer"]), async (req, res) => {
  try {
    const rtsAgg = await UserModel.aggregate([
      { $match: { role: { $ne: "developer" } } },
      { $group: { _id: "$rtId", totalUsers: { $sum: 1 } } }
    ]);
    const configs = await RtConfigModel.find({});
    const configMap = /* @__PURE__ */ new Map();
    configs.forEach((c) => configMap.set(c.rtId, c.isVip));
    const result = rtsAgg.map((r) => ({
      rtId: r._id,
      totalUsers: r.totalUsers,
      isVip: configMap.get(r._id) || false
    }));
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: "Gagal mengambil rekap RT" });
  }
});
app.get("/api/menu-permissions", async (req, res) => {
  try {
    const list = await MenuAccessModel.find({}).lean();
    res.json({ data: list });
  } catch (e) {
    res.status(500).json({ error: "Gagal mengambil konfigurasi menu" });
  }
});
app.post("/api/menu-permissions", enforceRoles(["developer"]), async (req, res) => {
  const { role, allowedMenus, createMenus, updateMenus, deleteMenus } = req.body;
  if (!role || !Array.isArray(allowedMenus)) {
    return res.status(400).json({ error: "Format request salah. Parameter role dan list allowedMenus dibutuhkan." });
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
    broadcastEvent("update", { type: "menu_permissions", role });
    res.json({ message: `Hak akses menu untuk role ${role} berhasil diperbarui`, data: updated });
  } catch (e) {
    res.status(500).json({ error: "Gagal memperbarui konfigurasi menu" });
  }
});
app.get("/api/backup/export", enforceRoles(["admin"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    const [users, kas, iuran, voting, acara, laporan, surat, umkm, tamu, media, darurat, logs] = await Promise.all([
      UserModel.find({ rtId }).lean(),
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
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      formatVersion: "1.0",
      stats: {
        users: users.length,
        kas: kas.length,
        iuran: iuran.length,
        voting: voting.length,
        laporan: laporan.length,
        auditLogs: logs.length
      },
      collections: {
        users,
        kas,
        iuran,
        voting,
        acara,
        laporan,
        surat,
        umkm,
        tamu,
        media,
        darurat,
        auditLogs: logs
      }
    };
    await logAudit(rtId, "Admin", "EXPORT_DATABASE", "Melakukan ekspor penuh database cadangan RT", null, null);
    res.setHeader("Content-disposition", `attachment; filename=CADANGAN_DATABASE_RT_${rtId.toUpperCase()}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(snapshot, null, 2));
  } catch (e) {
    res.status(500).json({ error: "Failed to export database cadangan." });
  }
});
app.post("/api/backup/restore", enforceRoles(["admin"]), async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    const backupData = req.body;
    if (backupData.rtId !== rtId) {
      return res.status(400).json({ error: "Data backup tidak sesuai dengan RT saat ini." });
    }
    if (backupData.users) {
      await UserModel.deleteMany({ rtId, role: { $ne: "developer" } });
      await UserModel.insertMany(backupData.users);
    }
    if (backupData.iuran) {
      await IuranModel.deleteMany({ rtId });
      await IuranModel.insertMany(backupData.iuran);
    }
    if (backupData.kas) {
      await KasModel.deleteMany({ rtId });
      await KasModel.insertMany(backupData.kas);
    }
    await logAudit(rtId, "Admin", "RESTORE_DATABASE", "Melakukan pemulihan data dari sistem cadangan", null, null);
    res.json({ success: true, message: "Restore data berhasil dilakukan (hanya sebagian modul utama)." });
  } catch (e) {
    res.status(500).json({ error: "Gagal memulihkan database cadangan." });
  }
});
app.post("/api/gemini/action", async (req, res) => {
  const { action, payload } = req.body;
  const rtId = req.headers["x-rt-id"] || "rt01";
  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({ error: "Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi di Settings > Secrets." });
  }
  try {
    const ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    let prompt = "";
    let systemInstruction = "Anda adalah Smart RT AI, asisten pemerintahan RT pintar di Indonesia yang membantu Ketua RT mengelola warga, kas, dokumen, rapat, dan laporan secara profesional.";
    if (action === "ringkasan_rapat") {
      prompt = `Buatlah ringkasan rapat formal, terstruktur, dan rapi berdasarkan transkrip atau catatan kasar berikut dalam Bahasa Indonesia:

Catatan:
${payload.notes}

Format keluaran:
- **Judul Rapat** (buat menarik & formal)
- **Tanggal & Waktu**
- **Poin-Poin Pembahasan Penting**
- **Keputusan Utama**
- **Daftar Tindak Lanjut (Action Items) & Penanggung Jawab**

Berikan format Markdown yang sangat elegan.`;
    } else if (action === "analisa_kas") {
      await connectDB();
      const kasRecords = await KasModel.find({ rtId }).sort({ createdAt: -1 }).limit(100).lean();
      const recordsStr = kasRecords.map((k) => `- [${k.type}] ${k.name || "Warga"}: Rp ${(k.amount || 0).toLocaleString("id-ID")} (${k.category || "Kas RT"}) - ${k.message || "Tanpa keterangan"}`).join("\n");
      prompt = `Analisalah transaksi keuangan/kas berikut dari RT kami dan berikan wawasan finansial, peringatan, potensi masalah, serta saran penghematan atau alokasi anggaran berikutnya:

Transaksi Terbaru:
${recordsStr || "Tidak ada transaksi terbaru untuk dianalisis."}

Berikan keluaran dalam format Markdown yang rapi dengan ringkasan status kas (Pemasukan, Pengeluaran, Saldo), tren kategori keuangan, serta rekomendasi aksi konkret.`;
    } else if (action === "draft_surat") {
      prompt = `Buatlah draf surat formal tingkat Rukun Tetangga (RT) berdasarkan informasi berikut dalam Bahasa Indonesia:

Kategori Surat: ${payload.jenis}
Nama Warga: ${payload.nama || "................"}
Keperluan: ${payload.keperluan || "................"}
Keterangan Tambahan: ${payload.keterangan || "Tidak ada"}

Surat harus mengikuti format resmi surat pengantar/keterangan RT di Indonesia (termasuk KOP Surat RT, nomor surat placeholder, isi surat yang santun, paragraf penutup, serta bagian tanda tangan Ketua RT). Gunakan format Markdown yang presisi dan profesional.`;
    } else if (action === "klasifikasi_laporan") {
      prompt = `Klasifikasikan laporan keluhan warga berikut ke dalam kategori yang sesuai (Keamananan / Kebersihan / Infrastruktur / Sosial / Lainnya) serta tingkat prioritas (Tinggi / Sedang / Rendah) dengan penjelasan singkat dan usulan langkah penanganan konkret pertama dari pengurus RT:

Judul: ${payload.judul}
Deskripsi: ${payload.deskripsi}

Berikan keluaran dalam format teks Markdown terstruktur dengan bagian Kategori, Prioritas, Alasan Klasifikasi, dan Rekomendasi Penanganan.`;
    } else {
      return res.status(400).json({ error: "Aksi tidak dikenal" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });
    res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: err.message || "Gagal memproses permintaan AI" });
  }
});
app.get("/api/dashboard", async (req, res) => {
  const rtId = req.headers["x-rt-id"] || "rt01";
  try {
    const [users, kas, iuran, laporan, acara] = await Promise.all([
      UserModel.find({ rtId, role: { $ne: "developer" } }).select("members").lean(),
      KasModel.find({ rtId }).select("type amount status category").lean(),
      IuranModel.find({ rtId }).select("bulan status nominal").lean(),
      LaporanModel.find({ rtId }).lean(),
      AcaraModel.find({ rtId }).lean()
    ]);
    const jumlahKK = users.length;
    let totalWarga = jumlahKK;
    users.forEach((u) => {
      totalWarga += u.members?.length || 0;
    });
    const getSaldo = (cat) => {
      const catItems = kas.filter((d) => (d.category || "Kas RT") === cat);
      const catM = catItems.filter((d) => d.type === "Masuk").reduce((a, b) => a + (b.amount || 0), 0);
      const catK = catItems.filter((d) => d.type === "Keluar").reduce((a, b) => a + (b.amount || 0), 0);
      return catM - catK;
    };
    const kasRT = getSaldo("Kas RT");
    const danaKematian = getSaldo("Dana Kematian");
    const danaSosial = getSaldo("Dana Sosial");
    const saldoKas = kasRT + danaKematian + danaSosial;
    const currentMonth = (/* @__PURE__ */ new Date()).toLocaleString("id-ID", { month: "long", year: "numeric" });
    const currentIuran = iuran.filter((i) => i.bulan === currentMonth);
    let lunasCount = 0;
    let totalIuranCount = currentIuran.length;
    let totalAmount = 0;
    if (totalIuranCount > 0) {
      lunasCount = currentIuran.filter((i) => i.status === "verifikasi").length;
      totalAmount = currentIuran.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
    } else {
      totalIuranCount = iuran.length;
      lunasCount = iuran.filter((i) => i.status === "verifikasi").length;
      totalAmount = iuran.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
    }
    const lunasPct = totalIuranCount > 0 ? Math.round(lunasCount / totalIuranCount * 100) : 0;
    const pengaduanAktif = laporan.filter((l) => l.status === "menunggu" || l.status === "diproses");
    const now = /* @__PURE__ */ new Date();
    const agendaUpcoming = acara.filter((ac) => {
      const acDate = new Date(ac.time || ac.date);
      return acDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }).sort((a, b) => new Date(a.time || a.date).getTime() - new Date(b.time || b.date).getTime()).slice(0, 5);
    const limitedUsers = users.map((u) => ({ _id: u._id, members: u.members?.map((m) => ({ _id: m._id })) }));
    res.json({
      metrics: {
        jumlahKK,
        jumlahWarga: totalWarga,
        saldoKas,
        kasDetail: { kasRT, danaKematian, danaSosial },
        iuranBulanIni: { lunasPct, totalIuranCount, lunasCount, totalAmount },
        pengaduanAktif,
        agendaUpcoming,
        wargaList: limitedUsers
      }
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "modular-tables", isDbConnected });
});
async function startServer(listen = true) {
  await connectDB();
  if (!process.env.VERCEL) {
    await initDb("rt01");
    await initDb("rt02");
    await initDb("rt03");
  }
  app.use((err, req, res, next) => {
    if (req.path.startsWith("/api/")) {
      console.error("API Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      next(err);
    }
  });
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const viteDynamic = "vite";
    const viteModule = await import(viteDynamic);
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  if (listen) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server launched successfully on port ${PORT}`);
    });
  }
}
if (!process.env.VERCEL) {
  startServer(true);
}
var server_default = app;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addNotification,
  app,
  startServer
});
//# sourceMappingURL=server.cjs.map
