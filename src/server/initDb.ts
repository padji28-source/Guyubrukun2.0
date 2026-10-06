import { UserModel, MenuAccessModel, DaruratModel, MediaModel, UmkmModel, connectDB } from "./db";
import { hashPassword } from "./middleware/auth";

export async function initDb(rtId: string = 'rt01') {
  await connectDB();
  try {
    let adminUsername = "ketuart1";
    let adminPassword = "rt12345";
    let statusText = "Ketua RT 01 / RW 21";
    let namaKetua = "Ketua RT 01";

    if (rtId === 'rt02') {
      adminUsername = "ketuart2";
      adminPassword = "rt12345";
      statusText = "Ketua RT 02 / RW 21";
      namaKetua = "Ketua RT 02";
    } else if (rtId === 'rt03') {
      adminUsername = "ketuart3";
      adminPassword = "rt12345";
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

    // Default permissions
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
      if (!exists) {
        await MenuAccessModel.create(perm);
      }
    }

    // Seed Darurat contacts if none exist
    const daruratCount = await DaruratModel.countDocuments({ rtId });
    if (daruratCount === 0) {
      const initialDarurat = [
        { id: `${rtId}_d1`, name: 'Ambulance & Gawat Darurat', tel: '118', type: 'Medis', rtId: rtId || 'rt01' },
        { id: `${rtId}_d2`, name: 'Polisi', tel: '110', type: 'Keamanan', rtId: rtId || 'rt01' },
        { id: `${rtId}_d3`, name: 'Pemadam Kebakaran', tel: '113', type: 'Kebakaran', rtId: rtId || 'rt01' },
        { id: `${rtId}_d4`, name: 'Ketua RT', tel: '081234567890', type: 'Lingkungan', rtId: rtId || 'rt01' },
        { id: `${rtId}_d5`, name: 'Security Pos Depan', tel: '089876543210', type: 'Keamanan', rtId: rtId || 'rt01' }
      ];
      await DaruratModel.insertMany(initialDarurat);
    }

    // Seed default media if empty
    const mediaCount = await MediaModel.countDocuments({ rtId });
    if (mediaCount === 0) {
      await MediaModel.create({
        id: `${rtId}_media1`,
        imageUrl: 'https://images.unsplash.com/photo-1593113511332-15f5ea6c4dcd?auto=format&fit=crop&w=300&q=80',
        title: 'Kerja Bakti Lingkungan',
        uploaderName: 'Ketua RT',
        rtId: rtId || 'rt01',
        createdAt: new Date().toISOString()
      });
    }

    // Seed UMKM if empty
    const umkmCount = await UmkmModel.countDocuments({ rtId: rtId || 'rt01' });
    if (umkmCount === 0) {
      await UmkmModel.create({
        id: `${rtId || 'rt01'}_umkm1`,
        nama: 'Dapur Nusantara Bu Siti',
        name: 'Dapur Nusantara Bu Siti',
        bannerUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
        owner: 'Warga Blok A No. 03',
        ownerId: '',
        alamat: 'Blok A No. 03',
        category: 'Kuliner',
        products: [
          { id: 'p1', namaProduk: 'Nasi Uduk Ayam Bakar', harga: 18000, satuan: 'porsi' },
          { id: 'p2', namaProduk: 'Soto Betawi Spesial', harga: 22000, satuan: 'porsi' }
        ],
        sosmed: '@dapurbusiti_rt01',
        kontak: '081288997766',
        phone: '081288997766',
        desc: 'Menerima pesanan sarapan pagi & katering warga RT.',
        status: 'disetujui',
        verifiedBy: 'Ketua RT',
        verifiedByRole: 'admin',
        verifiedAt: new Date().toISOString(),
        rtId: rtId || 'rt01',
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("DB Initialization Warning:", e);
  }
}
