// ==========================================================
// SCRIPT FRONTEND - SISTEM PMB
// Mengatur perpindahan halaman, validasi form, dan
// komunikasi dengan backend (API).
// ==========================================================

// Alamat API backend. Karena frontend dibuka dari server yang sama
// (http://localhost:3000), cukup gunakan path "/api".
const API_URL = "/api";

// Daftar program studi beserta deskripsinya
const studyPrograms = [
  {
    name: "Teknik Informatika",
    description: "Mempelajari pemrograman, algoritma, software, dan teknologi komputer.",
  },
  {
    name: "Sistem Informasi",
    description: "Mempelajari teknologi informasi dan penerapannya dalam bisnis dan organisasi.",
  },
  {
    name: "Teknik Industri",
    description: "Mempelajari perancangan, perbaikan, dan optimasi sistem produksi dan industri.",
  },
  {
    name: "Manajemen",
    description: "Mempelajari cara mengelola organisasi, pemasaran, SDM, dan keuangan perusahaan.",
  },
  {
    name: "Akuntansi",
    description: "Mempelajari pencatatan, pelaporan, dan analisis keuangan suatu organisasi.",
  },
  {
    name: "Ilmu Komunikasi",
    description: "Mempelajari komunikasi massa, media, jurnalistik, dan hubungan masyarakat.",
  },
];

// Object untuk menyimpan data pendaftar sementara (di browser)
let registrationData = {};

// ----------------------------------------------------------
// FUNGSI BANTUAN
// ----------------------------------------------------------

// Mengambil elemen berdasarkan id (agar kode lebih pendek)
function getElement(id) {
  return document.getElementById(id);
}

// Menampilkan satu halaman dan menyembunyikan halaman lain
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.add("hidden"));
  getElement(pageId).classList.remove("hidden");

  updateSteps(pageId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Memperbarui indikator langkah (1. Data Diri, 2. Program Studi, dst)
function updateSteps(pageId) {
  const stepNumbers = {
    "page-biodata": 1,
    "page-program": 2,
    "page-confirm": 3,
    "page-result": 4,
  };
  const currentStep = stepNumbers[pageId];
  const stepsBox = getElement("steps");

  // Indikator tidak ditampilkan di halaman login
  if (!currentStep) {
    stepsBox.classList.add("hidden");
    return;
  }
  stepsBox.classList.remove("hidden");

  document.querySelectorAll(".step").forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.remove("active", "done");
    if (stepNumber === currentStep) step.classList.add("active");
    if (stepNumber < currentStep) step.classList.add("done");
  });
}

// Menampilkan pesan error pada kotak alert
function showError(elementId, message) {
  const box = getElement(elementId);
  box.textContent = message;
  box.classList.remove("hidden");
}

// Menyembunyikan pesan error
function hideError(elementId) {
  getElement(elementId).classList.add("hidden");
}

// Mengecek format email sederhana
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mengubah "2008-01-10" menjadi "10 Januari 2008"
function formatDateIndonesia(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Cek status login (disimpan di sessionStorage browser)
function isLoggedIn() {
  return sessionStorage.getItem("isLoggedIn") === "true";
}

// Mengatur tampilan tombol Logout di navbar
function updateNavbar() {
  getElement("navLogout").classList.toggle("hidden", !isLoggedIn());
}

// ----------------------------------------------------------
// HALAMAN 1: LOGIN
// ----------------------------------------------------------
getElement("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // mencegah halaman reload
  hideError("loginError");

  const username = getElement("username").value.trim();
  const password = getElement("password").value;

  // Validasi sederhana di frontend
  if (!username) {
    showError("loginError", "Username / email wajib diisi.");
    return;
  }
  if (!password) {
    showError("loginError", "Password wajib diisi.");
    return;
  }

  const loginButton = getElement("loginButton");
  loginButton.disabled = true;
  loginButton.textContent = "Memproses...";

  try {
    // Kirim data login ke backend
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (result.success) {
      sessionStorage.setItem("isLoggedIn", "true");
      updateNavbar();
      getElement("loginForm").reset();
      showPage("page-biodata");
    } else {
      showError("loginError", result.message);
    }
  } catch (error) {
    showError("loginError", "Tidak dapat terhubung ke server. Pastikan backend sudah dijalankan.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

// ----------------------------------------------------------
// HALAMAN 2: DATA DIRI
// ----------------------------------------------------------
getElement("biodataForm").addEventListener("submit", function (event) {
  event.preventDefault();
  hideError("biodataError");

  // Hapus tanda merah dari validasi sebelumnya
  document.querySelectorAll(".input-error").forEach((input) => {
    input.classList.remove("input-error");
  });

  // Ambil semua nilai dari form
  const selectedGender = document.querySelector('input[name="gender"]:checked');
  const formData = {
    fullName: getElement("fullName").value.trim(),
    nik: getElement("nik").value.trim(),
    birthPlace: getElement("birthPlace").value.trim(),
    birthDate: getElement("birthDate").value,
    gender: selectedGender ? selectedGender.value : "",
    address: getElement("address").value.trim(),
    phone: getElement("phone").value.trim(),
    email: getElement("email").value.trim(),
    school: getElement("school").value.trim(),
    graduationYear: getElement("graduationYear").value.trim(),
  };

  // Daftar aturan validasi: [id input, kondisi salah, pesan error]
  const rules = [
    ["fullName", !formData.fullName, "Nama Lengkap tidak boleh kosong."],
    ["nik", !formData.nik, "NIK tidak boleh kosong."],
    ["nik", !/^[0-9]+$/.test(formData.nik), "NIK hanya boleh berisi angka."],
    ["birthPlace", !formData.birthPlace, "Tempat Lahir tidak boleh kosong."],
    ["birthDate", !formData.birthDate, "Tanggal Lahir tidak boleh kosong."],
    [null, !formData.gender, "Silakan pilih Jenis Kelamin."],
    ["address", !formData.address, "Alamat tidak boleh kosong."],
    ["phone", !formData.phone, "Nomor HP tidak boleh kosong."],
    ["phone", !/^[0-9+]{8,15}$/.test(formData.phone), "Nomor HP harus berupa angka (8-15 digit)."],
    ["email", !formData.email, "Email tidak boleh kosong."],
    ["email", !isValidEmail(formData.email), "Format email tidak valid. Contoh: nama@gmail.com"],
    ["school", !formData.school, "Asal Sekolah tidak boleh kosong."],
    ["graduationYear", !formData.graduationYear, "Tahun Lulus tidak boleh kosong."],
  ];

  // Cek aturan satu per satu, berhenti di kesalahan pertama
  for (const [inputId, isInvalid, message] of rules) {
    if (isInvalid) {
      showError("biodataError", message);
      if (inputId) {
        getElement(inputId).classList.add("input-error");
        getElement(inputId).focus();
      }
      return;
    }
  }

  // Semua valid -> simpan data dan lanjut ke halaman program studi
  registrationData = { ...registrationData, ...formData };
  showPage("page-program");
});

// ----------------------------------------------------------
// HALAMAN 3: PILIH PROGRAM STUDI
// ----------------------------------------------------------

// Membuat card program studi secara otomatis dari array studyPrograms
function renderStudyPrograms() {
  const programList = getElement("programList");

  studyPrograms.forEach((program) => {
    const card = document.createElement("label");
    card.className = "program-card";
    card.innerHTML = `
      <input type="radio" name="studyProgram" value="${program.name}" />
      <div>
        <h4>${program.name}</h4>
        <p>${program.description}</p>
      </div>
    `;
    programList.appendChild(card);
  });

  // Memberi warna pada card yang dipilih
  programList.addEventListener("change", function () {
    document.querySelectorAll(".program-card").forEach((card) => {
      const radio = card.querySelector("input");
      card.classList.toggle("selected", radio.checked);
    });
    hideError("programError");
  });
}

getElement("backToBiodata").addEventListener("click", function () {
  showPage("page-biodata");
});

getElement("toConfirmation").addEventListener("click", function () {
  const selectedProgram = document.querySelector('input[name="studyProgram"]:checked');

  if (!selectedProgram) {
    showError("programError", "Program studi wajib dipilih.");
    return;
  }

  registrationData.studyProgram = selectedProgram.value;
  showConfirmation();
  showPage("page-confirm");
});

// ----------------------------------------------------------
// HALAMAN 4: KONFIRMASI
// ----------------------------------------------------------

// Menampilkan ringkasan data ke tabel konfirmasi
function showConfirmation() {
  const rows = [
    ["Nama Lengkap", registrationData.fullName],
    ["NIK", registrationData.nik],
    ["Tempat Lahir", registrationData.birthPlace],
    ["Tanggal Lahir", formatDateIndonesia(registrationData.birthDate)],
    ["Jenis Kelamin", registrationData.gender],
    ["Alamat", registrationData.address],
    ["Nomor HP", registrationData.phone],
    ["Email", registrationData.email],
    ["Asal Sekolah", registrationData.school],
    ["Tahun Lulus", registrationData.graduationYear],
  ];

  const table = getElement("summaryTable");
  table.innerHTML = ""; // kosongkan tabel dulu

  rows.forEach(([label, value]) => {
    const row = table.insertRow();
    row.insertCell().textContent = label;
    // textContent dipakai agar input pengguna tidak dianggap sebagai HTML
    row.insertCell().textContent = value;
  });

  getElement("summaryProgram").textContent = registrationData.studyProgram;
  hideError("submitError");
}

getElement("backToProgram").addEventListener("click", function () {
  showPage("page-program");
});

getElement("submitButton").addEventListener("click", async function () {
  // Konfirmasi sebelum mengirim
  const isSure = confirm("Apakah Anda yakin ingin mengirim data pendaftaran?");
  if (!isSure) return;

  hideError("submitError");
  const submitButton = getElement("submitButton");
  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";

  try {
    // Kirim seluruh data pendaftaran ke backend
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData),
    });
    const result = await response.json();

    if (result.success) {
      // Tampilkan halaman hasil
      getElement("resultNumber").textContent = result.registrationNumber;
      getElement("resultProgram").textContent = registrationData.studyProgram;
      showPage("page-result");
    } else {
      showError("submitError", result.message);
    }
  } catch (error) {
    showError("submitError", "Tidak dapat terhubung ke server. Pastikan backend sudah dijalankan.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kirim Pendaftaran";
  }
});

// ----------------------------------------------------------
// HALAMAN 5: HASIL
// ----------------------------------------------------------

// Mengosongkan semua form agar bisa mendaftar ulang
function resetAllForms() {
  registrationData = {};
  getElement("biodataForm").reset();
  document.querySelectorAll('input[name="studyProgram"]').forEach((radio) => {
    radio.checked = false;
  });
  document.querySelectorAll(".program-card").forEach((card) => {
    card.classList.remove("selected");
  });
}

getElement("backToHome").addEventListener("click", function () {
  resetAllForms();
  showPage("page-biodata");
});

// ----------------------------------------------------------
// NAVBAR
// ----------------------------------------------------------

// Home -> halaman awal (login jika belum login, data diri jika sudah)
getElement("navHome").addEventListener("click", function (event) {
  event.preventDefault();
  showPage(isLoggedIn() ? "page-biodata" : "page-login");
});

// Pendaftaran -> harus login terlebih dahulu
getElement("navRegister").addEventListener("click", function (event) {
  event.preventDefault();
  if (isLoggedIn()) {
    showPage("page-biodata");
  } else {
    showPage("page-login");
    showError("loginError", "Silakan login terlebih dahulu untuk melakukan pendaftaran.");
  }
});

// Logout -> hapus status login dan kembali ke halaman login
getElement("navLogout").addEventListener("click", function (event) {
  event.preventDefault();
  sessionStorage.removeItem("isLoggedIn");
  resetAllForms();
  updateNavbar();
  hideError("loginError");
  showPage("page-login");
});

// ----------------------------------------------------------
// SAAT HALAMAN PERTAMA KALI DIBUKA
// ----------------------------------------------------------
renderStudyPrograms();
updateNavbar();
showPage(isLoggedIn() ? "page-biodata" : "page-login");
