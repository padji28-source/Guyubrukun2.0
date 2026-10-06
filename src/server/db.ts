import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/guyubrukun";
export let isDbConnected = false;

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
