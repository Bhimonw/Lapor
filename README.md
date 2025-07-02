# LAPOR - Road Damage Reporting System

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive web application for reporting road damage with geolocation features, photo uploads, and administrative management capabilities.

## 🚀 Fitur

- **Autentikasi**: Register & Login dengan JWT
- **Pelaporan**: Upload foto, deskripsi, dan lokasi otomatis
- **Dashboard Admin**: Verifikasi dan kelola laporan
- **Geolocation**: Deteksi lokasi otomatis menggunakan HTML5 Geolocation API
- **Upload Foto**: Penyimpanan foto lokal dengan multer
- **Demo Accounts**: Login cepat untuk testing dengan tombol demo
- **Responsive Design**: Tampilan yang optimal di berbagai perangkat

## 📦 Tech Stack

- **Frontend**: React.js (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Geolocation**: HTML5 Geolocation API

## 🛠️ Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- Git

### Installation

1. Clone repository:
```bash
git clone https://github.com/Bhimonw/Lapor.git
cd Lapor
```

2. Install dependencies:
```bash
npm run install-all
```

3. Setup environment variables:
```bash
cp .env.example .env
```
Edit `.env` file dengan konfigurasi yang sesuai.

4. Start MongoDB service

5. Run development servers:
```bash
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🚀 Deployment

Aplikasi ini siap untuk di-deploy ke Railway. Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap deployment.

### Quick Deploy to Railway

1. Push code ke GitHub
2. Connect repository ke Railway
3. Set environment variables:
   - `MONGO_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Strong secret key
   - `NODE_ENV`: production
4. Deploy otomatis akan berjalan

Railway akan otomatis:
- Build frontend React
- Serve static files dari backend
- Set PORT environment variable
- Provide HTTPS domain

## 🎯 Demo Accounts

Untuk kemudahan testing, tersedia akun demo yang dapat diakses langsung melalui tombol di halaman login:

### Admin Account
- **Username**: `admin`
- **Password**: `Admin123`
- **Role**: Administrator (dapat melihat dan memverifikasi semua laporan)

### User Account
- **Username**: `user`
- **Password**: `User123`
- **Role**: User biasa (dapat membuat laporan)

> 💡 **Tip**: Gunakan tombol "Demo Admin" atau "Demo User" di halaman login untuk login otomatis!

## 📂 Struktur Proyek

```
lapor/
├── client/               ← React frontend
│   ├── src/
│   │   ├── pages/        ← Login, Laporan, Dashboard
│   │   ├── components/   ← Reusable UI components
│   │   ├── services/     ← API calls
│   │   ├── hooks/        ← Custom hooks
│   │   └── App.jsx
│   └── vite.config.js
│
├── server/               ← Express backend
│   ├── config/           ← Database connection
│   ├── models/           ← Mongoose models
│   ├── controllers/      ← Route controllers
│   ├── routes/           ← API routes
│   ├── middlewares/      ← Custom middlewares
│   ├── uploads/          ← Photo storage
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get all reports (admin)
- `PATCH /api/reports/:id/verify` - Verify report (admin)

## 👥 User Roles

- **User**: Dapat membuat laporan kerusakan jalan
- **Admin**: Dapat melihat dan memverifikasi semua laporan

## 📱 Usage

1. **Register/Login**: Buat akun atau login
2. **Buat Laporan**: Upload foto, tulis deskripsi, lokasi terdeteksi otomatis
3. **Admin Dashboard**: Admin dapat melihat dan memverifikasi laporan

## 🔧 Troubleshooting

### Common Issues

**CORS Error saat login:**
- Pastikan backend berjalan di port 3000
- Periksa konfigurasi API base URL di `client/src/services/api.js`

**MongoDB Connection Error:**
- Pastikan MongoDB service sudah berjalan
- Periksa connection string di file `.env`

**File Upload Error:**
- Pastikan folder `server/uploads` sudah ada
- Periksa permission folder uploads

**Port sudah digunakan:**
```bash
# Cek port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill process jika diperlukan
taskkill /PID <PID_NUMBER> /F
```

## ❓ FAQ

**Q: Bagaimana cara reset password?**
A: Fitur reset password belum tersedia. Gunakan akun demo atau hubungi admin.

**Q: Apakah bisa upload multiple foto?**
A: Saat ini hanya support 1 foto per laporan.

**Q: Bagaimana cara mengubah role user?**
A: Role user hanya bisa diubah langsung di database MongoDB.

**Q: Apakah ada limit ukuran foto?**
A: Ya, maksimal 5MB per foto.

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.