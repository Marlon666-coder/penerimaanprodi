// ==========================================================
// SERVER BACKEND - SISTEM PENERIMAAN MAHASISWA BARU (PMB)
// Teknologi: Node.js + Express + Nodemailer
// ==========================================================

// 1. Memuat konfigurasi dari file .env
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware
// - express.json() agar server bisa membaca data JSON dari frontend
// - express.static() agar file frontend (HTML, CSS, JS) bisa dibuka di browser
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// 3. Akun demo untuk login (diambil dari .env, ada nilai default)
const DEMO_USERNAME = process.env.DEMO_USERNAME || "admin";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "admin123";

// 4. Tempat menyimpan data pendaftaran SEMENTARA (tanpa database).
//    Data akan hilang ketika server dimatikan.
const registrations = {};

// 5. Konfigurasi Nodemailer (menggunakan Gmail)
//    Email & App Password diambil dari .env, TIDAK ditulis di kode.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ----------------------------------------------------------
// FUNGSI BANTUAN
// ----------------------------------------------------------

// Membuat nomor pendaftaran unik, contoh: PMB-2026-123456
function generateRegistrationNumber() {
  const year = new Date().getFullYear();
  let number;
  do {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit
    number = `PMB-${year}-${randomDigits}`;
  } while (registrations[number]); // ulangi jika nomor sudah pernah dipakai
  return number;
}

// Mengubah tanggal "2008-01-10" menjadi "10 Januari 2008"
function formatDateIndonesia(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Mengecek format email sederhana
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Membuat isi email (teks biasa) sesuai format yang diminta
function createEmailText(data, registrationNumber, registrationDate) {
  return `SISTEM PENERIMAAN MAHASISWA BARU

Nomor Pendaftaran: ${registrationNumber}

DATA CALON MAHASISWA

Nama Lengkap: ${data.fullName}
NIK: ${data.nik}
Tempat Lahir: ${data.birthPlace}
Tanggal Lahir: ${formatDateIndonesia(data.birthDate)}
Jenis Kelamin: ${data.gender}
Alamat: ${data.address}
Nomor HP: ${data.phone}
Email: ${data.email}
Asal Sekolah: ${data.school}
Tahun Lulus: ${data.graduationYear}

PROGRAM STUDI PILIHAN

${data.studyProgram}

Tanggal Pendaftaran:
${registrationDate}
`;
}

// ----------------------------------------------------------
// ENDPOINT API
// ----------------------------------------------------------

// POST /api/login -> proses login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Validasi: username dan password wajib diisi
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi.",
    });
  }

  // Cek apakah cocok dengan akun demo
  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    return res.json({ success: true, message: "Login berhasil." });
  }

  return res.status(401).json({
    success: false,
    message: "Username atau password salah.",
  });
});

// POST /api/register -> menerima data pendaftaran & mengirim email
app.post("/api/register", async (req, res) => {
  const data = req.body;

  // 1. Validasi data (backend juga harus mengecek, bukan hanya frontend)
  const requiredFields = {
    fullName: "Nama Lengkap",
    nik: "NIK",
    birthPlace: "Tempat Lahir",
    birthDate: "Tanggal Lahir",
    gender: "Jenis Kelamin",
    address: "Alamat",
    phone: "Nomor HP",
    email: "Email",
    school: "Asal Sekolah",
    graduationYear: "Tahun Lulus",
    studyProgram: "Program Studi",
  };

  for (const field in requiredFields) {
    if (!data[field] || String(data[field]).trim() === "") {
      return res.status(400).json({
        success: false,
        message: `${requiredFields[field]} wajib diisi.`,
      });
    }
  }

  if (!isValidEmail(data.email)) {
    return res.status(400).json({
      success: false,
      message: "Format email tidak valid.",
    });
  }

  // 2. Membuat nomor pendaftaran unik
  const registrationNumber = generateRegistrationNumber();
  const registrationDate = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  // 3. Menyimpan data sementara di object
  registrations[registrationNumber] = {
    ...data,
    registrationNumber,
    registrationDate,
  };
  console.log(`Data diterima: ${registrationNumber} - ${data.fullName}`);

  // 4. Mengirim email ke admin menggunakan Nodemailer
  try {
    await transporter.sendMail({
      from: `"Sistem PMB" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Pendaftaran Mahasiswa Baru - ${data.fullName}`,
      text: createEmailText(data, registrationNumber, registrationDate),
    });

    console.log(`Email berhasil dikirim ke ${process.env.ADMIN_EMAIL}`);

    return res.json({
      success: true,
      message: "Pendaftaran berhasil dikirim",
      registrationNumber: registrationNumber,
      studyProgram: data.studyProgram,
    });
  } catch (error) {
    console.error("Gagal mengirim email:", error.message);

    return res.status(500).json({
      success: false,
      message: "Data berhasil diterima tetapi email gagal dikirim",
    });
  }
});

// ----------------------------------------------------------
// MENJALANKAN SERVER
// ----------------------------------------------------------
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(" Server PMB berjalan!");
  console.log(` Buka di browser: http://localhost:${PORT}`);
  console.log("==========================================");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(" PERINGATAN: EMAIL_USER / EMAIL_PASS belum diisi di file .env");
  }
});
