# Buku Panduan Penggunaan Aplikasi Guyub Rukun (RT Digital)

Selamat datang di Buku Panduan Penggunaan Aplikasi Guyub Rukun. Aplikasi ini dirancang untuk memudahkan pengurus RT dan warga dalam mengelola administrasi, keuangan, komunikasi, dan pelayanan tingkat Rukun Tetangga secara digital, transparan, dan mudah.

---

## DAFTAR ISI
1. [Pengenalan Sistem & Konsep Akses](#1-pengenalan-sistem--konsep-akses)
2. [Cara Login dan Mendaftar](#2-cara-login-dan-mendaftar)
3. [Panduan Untuk Pengurus RT (Admin / Ketua RT / Bendahara)](#3-panduan-untuk-pengurus-rt-admin--ketua-rt--bendahara)
4. [Panduan Untuk Warga](#4-panduan-untuk-warga)
5. [Penjelasan Fitur Utama](#5-penjelasan-fitur-utama)
   - Dashboard (Beranda)
   - Modul Keuangan (Iuran & Kas)
   - Surat Pengantar Digital
   - Smart RT AI
   - Pengumuman & Notifikasi
6. [Lupa Password & Bantuan Keamanan](#6-lupa-password--bantuan-keamanan)

---

## 1. Pengenalan Sistem & Konsep Akses

Aplikasi Guyub Rukun menggunakan sistem **Multi-Role** (Banyak Peran). Setiap pengguna akan memiliki antarmuka (tampilan) yang berbeda sesuai dengan jabatannya di lingkungan RT.

Terdapat tiga peran utama:
1. **Developer:** Hak akses khusus sistem untuk mengelola langganan VIP RT dan melihat statistik server.
2. **Admin (Ketua RT / Pengurus Inti):** Memiliki hak penuh untuk menyetujui akun warga, membuat laporan keuangan, menyetujui surat, mengelola rapat, dan mengonfigurasi akses menu.
3. **Warga:** Mengakses layanan dasar seperti membayar iuran, memantau transparansi kas, meminta surat pengantar, lapor tamu, UMKM, dan melihat panik darurat.

> **Catatan Penting:** Warga yang baru mendaftar tidak akan bisa login atau menggunakan menu utama sampai akunnya **disetujui (Approved)** oleh Admin RT.

---

## 2. Cara Login dan Mendaftar

### Pendaftaran Akun Baru (Warga)
1. Buka halaman utama aplikasi.
2. Klik tombol **"Daftar Akun Guyub Rukun"**.
3. Isi formulir pendaftaran:
   - **ID Unik RT:** Harus diisi dengan ID RT yang diberikan oleh pengurus (misalnya: `rt01` atau `rt12`).
   - Masukkan NIK (Username), Password, Nama Lengkap, No WhatsApp, Alamat, Umur, dan Status Keluarga.
4. Klik **Daftar Sekarang**.
5. Tunggu konfirmasi. Akun Anda berstatus `Menunggu Persetujuan Admin` dan baru bisa digunakan setelah diverifikasi.

### Cara Login
1. Di halaman login, masukkan **Username (NIK)**, **Password**, dan **ID RT**.
2. Klik **Login Utama**.
3. Jika berhasil, Anda akan diarahkan ke Beranda sesuai dengan peran (role) Anda (Tampilan Desktop untuk PC, atau Tampilan Mobile untuk Layar HP).

---

## 3. Panduan Untuk Pengurus RT (Admin / Ketua RT / Bendahara)

Pengurus RT memiliki kewajiban menjaga data. Berikut langkah hariannya:

### Menyetujui Akun Warga Baru
1. Buka menu **Data Warga**.
2. Anda akan melihat daftar warga. Warga yang belum diverifikasi berstatus `nonaktif`.
3. Klik tombol / ubah status warga tersebut menjadi `aktif` (hijau). Akun warga kini bisa digunakan.

### Mengelola Iuran & Kas RT
1. **Kas RT:** Klik menu **Kas**. Input setiap pemasukan atau pengeluaran secara rutin. Sertakan bukti nota jika ada.
2. **Iuran Warga:** Buka menu **Iuran**. Anda bisa merekap pembayaran iuran dari tiap rumah. Jika ada warga yang transfer, periksa di sini dan verifikasi agar otomatis masuk ke buku Kas RT.
3. **Cetak Laporan:** Buka menu **Laporan**. Klik opsi PDF atau Excel untuk mencetak neraca keuangan bulanan.

### Menyetujui Surat Pengantar
1. Jika ada warga yang mengajukan surat, buka menu **Surat Online**.
2. Cek kelengkapan data.
3. Ubah status surat dari `Pending` atau `Menunggu` ke `Disetujui`. 
4. Aplikasi akan otomatis menghasilkan Surat dalam bentuk file PDF dengan nomor surat dan siap cetak.

### Melakukan Backup Database (Sangat Disarankan)
1. Masuk ke manu **Pengaturan**.
2. Cari bagian **Backup & Restore Data**.
3. Klik **Export Data**. Simpan file JSON/Excel ini di komputer Anda dengan aman setidaknya seminggu sekali.

---

## 4. Panduan Untuk Warga

Sebagai Warga, Anda difasilitasi dengan banyak kemudahan tanpa perlu datang ke rumah Ketua RT:

### Membayar & Memantau Iuran
1. Buka aplikasi, masuk ke menu **Iuran**.
2. Anda bisa melihat tagihan bulan ini.
3. Klik **+ Buatkan Tagihan** -> Unggah bukti transfer Anda dan nominalnya.
4. Status akan "Menunggu Verifikasi Administrasi". Anda tinggal bersantai.

### Membuat Surat Pengantar Online
1. Perlu surat untuk kecamatan? Klik menu **Surat Pengantar**.
2. Isi form keperluan (Misal: Pembuatan KTP, SKCK, Ahli Waris).
3. Klik Ajukan. Anda tinggal menunggu notifikasi di aplikasi ketika Pak RT sudah menyetujuinya. PDF bisa diunduh langsung ke HP Anda.

### Modul Lainnya
* **Darurat (Tombol Panik):** Klik jika ada keadaan bahaya (kebakaran, maling). Alarm akan masuk ke seluruh HP warga dan pengurus.
* **Tamu:** Laporkan tamu yang menginap lebih dari 1x24 jam melalui form Tamu.
* **UMKM Warga:** Anda jualan makanan/jasa? Daftarkan usaha Anda di sini untuk dilihat tetangga!
* **Pengumuman:** Pusat info penting di kampung, mulai dari jadwal siskamling hingga kerja bakti.

---

## 5. Penjelasan Fitur Utama

Detail dari modul-modul andalan di Guyub Rukun:

* **Dashboard (Beranda):**
  Merupakan pusat informasi cepat. Di sini Anda bisa melihat grafik status Iuran bulanan, total uang kas (transparan 100%), jumlah warga, dan notifikasi terbaru.

* **Modul Keuangan yang Solid:**
  Sistem Iuran Warga dan Kas RT saling terhubung. Jika warga bayar iuran via aplikasi dan disetujui, uangnya otomatis masuk ke "Neraca Saldo Kas Masuk", menghindari kesalahan pencatatan buku warung.

* **Smart RT AI:**
  Dilengkapi Asisten Kecerdasan Buatan (AI) bernama Smart RT AI. Ketua RT bisa menggunakan ini untuk:
  - Menganalisis keuangan kas RT (apakah defisit atau sehat).
  - Draft Surat Otomatis dari kata kunci pendek.
  - Kategorisasi keluhan warga jadi lebih rapi.

* **Inventaris & Notulen Rapat:**
  Mencatat barang-barang aset RT (seperti tenda lipat, kursi, genset) dan menyimpan hasil rapat bulanan tanpa memakai kertas.

---

## 6. Lupa Password & Bantuan Keamanan

* **Saya lupa password saya!**
  Saat ini demi keamanan, warga yang lupa password harap menghubungi Admin/Ketua RT secara langsung. Admin berhak untuk melakukan reset/mengganti password akun warganya via menu **Data Warga**.

* **Praktik Keamanan yang Baik:**
  - JANGAN membagikan NIK atau ID Akun Anda kepada orang lain.
  - Gunakan password yang unik. Sistem saat ini sudah mengamankan password Anda dengan standar perbankan (Hashed bcrypt).
  - Pastikan keluar dari aplikasi / menekan tombol Logout (Keluar) apabila menggunakan HP atau Komputer umum (seperti di Warnet/Balai RT).

---
*Dikembangkan dengan sistem keamanan yang kuat, rate-limit, dan standar RBAC (Role-Based Access Control).*
*Semoga Guyub Rukun membawa lingkungan Anda ke era digitalisasi yang harmonis!*
