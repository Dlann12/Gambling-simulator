# 🎰 RoyalVegas — Judi Simulator Game v1.0

**RoyalVegas** adalah platform simulasi kasino virtual interaktif berbasis web yang dibangun untuk tujuan **edukasi probabilitas matematika, studi algoritma RNG (Random Number Generator), dan hiburan**. 

> [!IMPORTANT]
> **Pernyataan Penafian (Disclaimer):**
> Aplikasi ini adalah **100% SIMULASI VIRTUAL**. Seluruh koin, transaksi, dan saldo adalah angka tiruan (dummy). **TIDAK ADA** uang sungguhan, taruhan nyata, deposit, maupun penarikan dana (withdraw) dalam bentuk apapun.

---

## 📁 Struktur Direktori Proyek

Arsitektur aplikasi telah dipisahkan secara modular, bersih, dan langsung kompatibel dengan **GitHub Pages**:

```text
Judi Simulator/
├── index.html              # Halaman utama aplikasi (Entry point & GitHub Pages ready)
├── css/
│   └── style.css           # Styling kustom kasino mewah (Neon glow, scrollbar, animasi)
├── js/
│   ├── tailwind-config.js  # Konfigurasi tema Tailwind CSS (Warna casino, tipografi Cinzel)
│   ├── audio.js            # Web Audio API Synthesizer (Efek suara dadu, koin, kartu & menang)
│   ├── state.js            # State model, data pengguna awal, daily missions & helpers
│   ├── games.js            # Mesin game: Slot 777, Dadu 7, Rolet Eropa, & Blackjack 21
│   ├── admin.js            # Autentikasi user, bonus harian, VIP box, & Panel Admin
│   └── app.js              # Master UI Renderer & inisialisasi aplikasi
├── .gitignore              # Berkas pengecualian Git
└── README.md               # Dokumentasi resmi proyek
```

---

## ✨ Fitur & Mode Permainan

### 1. Empat Permainan Kasino Klasik
- 🎰 **Slot Machine 777**: Simulasi mesin slot 3-gulungan dengan simbol buah, lonceng, angka 7 keberuntungan, dan berlian jackpot beserta pengali taruhan dinamis.
- 🎲 **Dadu 7 (Under / Over 7)**: Permainan tebak total dua dadu dengan animasi kocokan 3D (pilihan: *Di Bawah 7*, *Tepat 7*, *Di Atas 7*, *Genap*, *Ganjil*).
- 🎡 **European Roulette**: Roda rolet Eropa 37 nomor (0-36) berbasis animasi HTML5 Canvas dengan taruhan *Merah/Hitam*, *Genap/Ganjil*, *Low (1-18)*, *High (19-36)*, atau tebak angka tunggal.
- 🃏 **Blackjack 21**: Aturan resmi kasino internasional melawan Dealer virtual dengan aksi *Hit*, *Stand*, dan *Double Down* (Dealer wajib Stand di nilai 17+).

### 2. Fitur Progresi & Ekonomi Virtual
- **Saldo Awal 10.000 Koin Demo**: Langsung diberikan saat pertama kali membuka aplikasi.
- **Bonus Harian & Misi**: Klaim koin harian gratis serta selesaikan misi tantangan harian kasino.
- **Sistem Level & EXP**: Dapatkan poin pengalaman (XP) setiap kali bermain untuk meningkatkan Level Sultan Anda.
- **Peti VIP / Mystery Box Gacha**: Dapatkan bonus kejutan acak mulai dari ratusan koin hingga jackpot 5.000 koin virtual.
- **Simulasi Top-Up Edukasi**: Demonstrasi aliran pembayaran instan virtual via Bank, E-Wallet, dan QRIS simulasi.

### 3. Panel Admin & Pengawasan Transaksi (Backoffice)
- **Kontrol RTP & Max Bet**: Admin dapat mengatur persentase Return to Player (*Ketat 0.8x*, *Standar 1.0x*, *Murah Hati 1.25x*, hingga *Event Sultan 1.5x*).
- **Manajemen Akun Pemain**: Ubah status pemain (*Aktif / Ditangguhkan*) serta penyesuaian saldo virtual untuk tujuan uji coba.
- **Log Audit Sistem**: Catatan audit transaksi yang mencatat setiap aksi sistem secara transparan.
- **Skema Relasional Database In-Memory**: Inspektur skema tabel relasional (`users`, `wallets`, `game_histories`, `audit_logs`).

### 4. Audio Prosedural Tanpa File Eksternal
- Menggunakan **Web Audio API** bawaan peramban untuk menghasilkan efek suara klik chip, putaran rolet, pembagian kartu blackjack, jingle kekalahan, dan fanfare kemenangan jackpot.

---

## 🚀 Cara Menjalankan Secara Lokal

Aplikasi ini berbasis web statis murni sehingga dapat langsung dijalankan tanpa perlu proses instalasi atau build step:

### Opsi 1: Python HTTP Server (Paling Cepat)
```bash
cd "/home/kerja/Documents/Project Of Me/Judi Simulator"
python3 -m http.server 8080
```
Buka browser dan buka: `http://localhost:8080`

### Opsi 2: VS Code Live Server
- Buka folder `Judi Simulator` di VS Code.
- Klik kanan `index.html` > pilih **Open with Live Server**.

### Opsi 3: Node.js `serve`
```bash
npx serve .
```

---

## 📤 Panduan Push ke GitHub

Untuk mengunggah proyek ini ke repositori GitHub Anda:

1. **Inisialisasi Git & Commit:**
   ```bash
   cd "/home/kerja/Documents/Project Of Me/Judi Simulator"
   git init
   git add .
   git commit -m "feat: inisialisasi struktur modular RoyalVegas Casino Simulator"
   ```

2. **Hubungkan & Push ke Repositori GitHub Anda:**
   ```bash
   # Ganti URL di bawah dengan URL repositori GitHub baru Anda:
   git remote add origin https://github.com/<username-anda>/<nama-repo>.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy Gratis di GitHub Pages:**
   - Buka repositori Anda di GitHub.
   - Masuk ke menu **Settings** > **Pages**.
   - Pada bagian **Build and deployment**, pilih branch `main` pada folder `/ (root)`, lalu klik **Save**.
   - Game simulasi Anda akan langsung online dan bisa dicoba langsung oleh pengunjung!

---

## 🛠️ Teknologi yang Digunakan

- **HTML5 Semantic Markup & Canvas API** (Animasi Roda Rolet)
- **Tailwind CSS (JIT CDN)** untuk antarmuka kasino mewah yang responsif
- **Vanilla JavaScript (ES6+)** berarsitektur modular tanpa framework berat
- **Web Audio API** untuk sintesis efek suara retro kasino
- **Google Fonts** (*Cinzel*, *Inter*, *JetBrains Mono*)
- **Font Awesome 6** untuk koleksi ikon game kasino
