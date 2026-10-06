export type UserRole = 'admin' | 'warga' | 'bendahara' | 'sekretaris' | 'pengurus' | 'developer';

export interface FamilyMember {
  id?: string;
  _id?: string;
  name: string;
  role: string;
  age: number;
  tglLahir?: string;
  jenisKelamin?: string;
}

export interface User {
  id: string;
  _id?: string;
  username: string;
  nama: string;
  alamat?: string;
  noHp?: string;
  status?: string;
  role: UserRole;
  isApproved?: boolean;
  isVip?: boolean;
  rtId: string;
  umur?: number;
  tglLahir?: string;
  jenisKelamin?: string;
  members?: FamilyMember[];
  photo?: string;
  noKk?: string;
  dokumenKk?: string | any;
  dokumenKtp?: string | any;
  hasKk?: boolean;
  hasKtp?: boolean;
  isOnline?: boolean;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  users?: T[];
  balances?: Record<string, number>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface KasTransaction {
  id: string;
  type: 'Masuk' | 'Keluar';
  amount: number;
  name: string;
  message: string;
  category: string;
  iuranId?: string;
  rtId: string;
  status: 'setuju' | 'butuh_konfirmasi' | 'selesai';
  buktiTransaksi?: string;
  createdAt: string;
}

export interface IuranRecord {
  id: string;
  nama: string;
  nominal: number;
  jenis: string;
  status: string;
  rtId: string;
  createdAt: string;
  proofUrl?: string;
  userId?: string;
  bulan?: string;
  buktiUrl?: string;
}

export interface VotingOption {
  id: string;
  text: string;
  count: number;
}

export interface VoteRecord {
  userId: string;
  userName?: string;
  userBlok?: string;
  optionId: string;
  date: string;
}

export interface VotingSession {
  id: string;
  title: string;
  category?: string;
  description?: string;
  deadline?: string;
  options: VotingOption[];
  votes: VoteRecord[];
  status: 'aktif' | 'selesai';
  createdBy?: string;
  rtId: string;
  createdAt: string;
}

export interface LaporanItem {
  id: string;
  judul: string;
  deskripsi: string;
  status: 'baru' | 'proses' | 'selesai' | 'menunggu' | 'diproses';
  nama?: string;
  userName?: string;
  kategori?: string;
  rtId: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export interface SuratItem {
  id: string;
  jenis: string;
  keperluan?: string;
  status: string;
  nama?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  statusPerkawinan?: string;
  jenisKelamin?: string;
  agama?: string;
  pekerjaan?: string;
  noKtpKk?: string;
  alamatSekarang?: string;
  alamatAsal?: string;
  mohonDibuatkan?: string;
  nomorSurat?: string;
  signaturePemohon?: string;
  signatureKetuaRt?: string;
  capPositionX?: number;
  capPositionY?: number;
  capWidth?: number;
  capHeight?: number;
  hasCap?: boolean;
  userId?: string;
  userName?: string;
  rtId: string;
  createdAt: string;
}

export interface AcaraItem {
  id: string;
  title: string;
  desc?: string;
  date: string;
  time?: string;
  location?: string;
  rtId: string;
  createdAt: string;
}

export interface UmkmProduct {
  id?: string;
  namaProduk: string;
  harga: number;
  satuan: string;
}

export interface UmkmItem {
  id: string;
  nama?: string;
  name?: string;
  bannerUrl?: string;
  owner?: string;
  ownerId?: string;
  alamat?: string;
  products?: UmkmProduct[];
  sosmed?: string;
  kontak?: string;
  phone?: string;
  category?: string;
  desc?: string;
  price?: string;
  status?: 'menunggu_verifikasi' | 'disetujui' | 'ditolak';
  verifiedBy?: string;
  verifiedByRole?: string;
  verifiedAt?: string;
  catatanVerifikasi?: string;
  rtId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  updaterName?: string;
  resource?: string;
  resourceId?: string;
  time: string;
  read: boolean;
  rtId: string;
}

export interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  details?: string;
  before?: any;
  after?: any;
  rtId: string;
  timestamp: string;
}
