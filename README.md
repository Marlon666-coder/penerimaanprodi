# Sistem Penerimaan Mahasiswa Baru (PMB) Sederhana

Website simulasi pendaftaran mahasiswa baru dan pemilihan program studi.
Dibuat dengan **HTML, CSS, JavaScript** (frontend) dan **Node.js + Express + Nodemailer** (backend).
Tidak memakai database. Data pendaftaran dikirim ke email admin.

**Alur:** Login → Data Diri → Pilih Program Studi → Konfirmasi → Hasil → Email ke Admin

## Struktur Folder

```text
pmb-system/
├── backend/
│   ├── server.js       # Server Express + API + pengiriman email
│   ├── package.json    # Daftar library yang dibutuhkan
│   ├── .env            # Konfigurasi rahasia (email & app password)
│   └── .env.example    # Contoh isi .env
├── frontend/
│   ├── index.html      # Semua halaman website
│   ├── style.css       # Tampilan
│   └── script.js       # Logika halaman, validasi, dan panggilan API
├── .gitignore
└── README.md
```

Frontend **dijalankan oleh backend**, jadi cukup menjalankan satu server saja.

---

## Langkah 1 — Install Node.js

1. Buka https://nodejs.org
2. Download versi **LTS**, lalu install (klik Next sampai selesai).
3. Buka **Terminal** (Mac/Linux) atau **Command Prompt / PowerShell** (Windows), lalu cek:
   ```bash
   node -v
   npm -v
   ```
   Jika muncul nomor versi (misalnya `v22.x.x`), berarti berhasil.

## Langkah 2 — Masuk ke Folder Backend

```bash
cd pmb-system/backend
```

> Tips Windows: buka folder `backend` di File Explorer, klik kolom alamat, ketik `cmd`, lalu Enter.

## Langkah 3 — Install Library

```bash
npm install
```

Perintah ini mengunduh Express, Nodemailer, dan dotenv ke folder `node_modules`.

## Langkah 4 — Buat Gmail App Password

Gmail **tidak mengizinkan** password biasa untuk aplikasi. Anda perlu membuat **App Password** (16 huruf):

1. Login ke akun Google (misalnya `hzikri86@gmail.com`).
2. Buka https://myaccount.google.com/security
3. Aktifkan **Verifikasi 2 Langkah (2-Step Verification)** jika belum aktif. (Wajib!)
4. Buka https://myaccount.google.com/apppasswords
5. Isi nama aplikasi, misalnya `PMB System`, lalu klik **Create / Buat**.
6. Google menampilkan kode 16 huruf, contoh: `abcd efgh ijkl mnop`.
7. Salin kode tersebut **tanpa spasi**: `abcdefghijklmnop`.

## Langkah 5 — Isi File `.env`

Buka file `backend/.env` (jika belum ada, salin dari `.env.example` dan beri nama `.env`), lalu isi:

```env
PORT=3000

EMAIL_USER=hzikri86@gmail.com
EMAIL_PASS=abcdefghijklmnop
ADMIN_EMAIL=hzikri86@gmail.com

DEMO_USERNAME=admin
DEMO_PASSWORD=admin123
```

| Nama | Arti |
|------|------|
| `EMAIL_USER` | Gmail yang dipakai untuk **mengirim** email |
| `EMAIL_PASS` | **App Password** dari Langkah 4 (bukan password Gmail biasa) |
| `ADMIN_EMAIL` | Email yang **menerima** data pendaftaran |
| `DEMO_USERNAME` / `DEMO_PASSWORD` | Akun untuk login ke website |

> ⚠️ Jangan upload file `.env` ke GitHub. File ini sudah dimasukkan ke `.gitignore`.
> Setiap kali mengubah `.env`, matikan server (`Ctrl + C`) lalu jalankan lagi.

## Langkah 6 — Jalankan Server

```bash
npm start
```

Jika berhasil, akan muncul:

```text
==========================================
 Server PMB berjalan!
 Buka di browser: http://localhost:3000
==========================================
```

Biarkan terminal tetap terbuka selama website digunakan.

## Langkah 7 — Buka Website

Buka browser dan kunjungi: **http://localhost:3000**

1. Login dengan akun demo: **admin** / **admin123**
2. Isi Data Diri → klik **Lanjut Pilih Program Studi**
3. Pilih 1 program studi → klik **Lanjut ke Konfirmasi**
4. Periksa data → klik **Kirim Pendaftaran** → klik **OK**
5. Muncul halaman **Pendaftaran Berhasil!** dengan nomor `PMB-2026-XXXXXX`
6. Cek inbox `hzikri86@gmail.com` (cek juga folder **Spam**).

---

## API Backend

| Method | URL | Fungsi |
|--------|-----|--------|
| POST | `/api/login` | Cek username & password |
| POST | `/api/register` | Terima data, buat nomor pendaftaran, kirim email |

Contoh response berhasil:

```json
{
  "success": true,
  "message": "Pendaftaran berhasil dikirim",
  "registrationNumber": "PMB-2026-123456"
}
```

Contoh response jika email gagal:

```json
{
  "success": false,
  "message": "Data berhasil diterima tetapi email gagal dikirim"
}
```

## Masalah yang Sering Terjadi

| Masalah | Solusi |
|---------|--------|
| `'npm' is not recognized` | Node.js belum terinstall / tutup lalu buka lagi terminal |
| `Cannot find module 'express'` | Jalankan `npm install` di folder `backend` |
| "Tidak dapat terhubung ke server" | Server belum jalan. Jalankan `npm start` |
| "Email gagal dikirim" | Cek `EMAIL_USER` & `EMAIL_PASS` di `.env`. Pastikan pakai **App Password**, tanpa spasi. Lihat pesan error di terminal |
| `EADDRINUSE: port 3000` | Port dipakai program lain. Ganti `PORT=3001` di `.env` |
| Email tidak muncul di inbox | Cek folder **Spam** |

## Catatan

- Data hanya disimpan sementara di memori server, dan **hilang saat server dimatikan**.
- Password email hanya ada di file `.env` di backend, tidak pernah dikirim ke frontend.
