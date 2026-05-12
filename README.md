# DoIt. — Premium Task Management System 🚀

Platform manajemen tugas minimalis dengan desain premium yang dirancang untuk membantu Anda fokus pada hal-hal yang benar-benar penting.

## ✨ Fitur Unggulan
- **Autentikasi Aman:** Sistem Register dan Login menggunakan **JWT (JSON Web Token)** dan hashing password dengan **Bcrypt**.
- **3-Stage Workflow:** Manajemen tugas dengan 3 status progres: `Todo`, `In-Progress`, dan `Completed`.
- **Desain Premium:** Antarmuka modern dengan efek **Glassmorphism**, *Dark Mode*, dan animasi halus.
- **Statistik Real-time:** Dashboard yang menampilkan jumlah tugas aktif dan selesai secara dinamis.
- **Search & Filter:** Mempermudah pencarian tugas berdasarkan judul, deskripsi, atau kategori status.
- **Responsif:** Tampilan yang nyaman diakses dari perangkat apa saja.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** Vanilla JavaScript, HTML5, CSS3, Tailwind CSS
- **Security:** JWT Authentication, Bcrypt Password Hashing, CORS, Dotenv

## 🚀 Cara Menjalankan Project

### 1. Persiapan Database
- Buat database baru di MySQL dengan nama `todo_app`.
- Impor struktur tabel `users` dan `tasks`.

### 2. Konfigurasi Backend
- Masuk ke folder `backend`.
- Jalankan `npm install` untuk menginstal dependency.
- Copy file `.env.example` menjadi `.env`.
- Sesuaikan konfigurasi database dan `JWT_SECRET` di file `.env`.
- Jalankan server:
  ```bash
  npm start
  # atau jika menggunakan nodemon
  npm run dev
  ```

### 3. Menjalankan Frontend
- Masuk ke folder `frontend`.
- Buka file `index.html` di browser pilihan Anda (disarankan menggunakan Live Server).

## 🔒 Keamanan
Project ini telah dioptimalkan untuk keamanan dasar aplikasi web:
- Pencegahan **SQL Injection** menggunakan *parameterized queries*.
- Pencegahan **XSS** melalui pembersihan input di sisi client.
- Perlindungan rute menggunakan **Middleware Autentikasi**.

---
*Dibuat untuk keperluan seleksi magang — Menunjukkan kemampuan Fullstack Development.*
