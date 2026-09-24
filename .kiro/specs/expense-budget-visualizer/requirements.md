# Requirements — Expense & Budget Visualizer

## Overview

Aplikasi web client-side untuk mencatat pengeluaran harian, memvisualisasikan distribusi per kategori, dan memantau batas anggaran secara real-time. Tidak memerlukan backend server — semua data tersimpan di browser via LocalStorage.

---

## Functional Requirements

### FR-1: Input Form

**User Story:**
Sebagai pengguna, saya ingin menambahkan pengeluaran baru melalui form agar pengeluaran saya tercatat dengan rapi.

**Acceptance Criteria:**

- [ ] Form memiliki field **Item Name** (teks) — wajib diisi
- [ ] Form memiliki field **Amount** (angka, Rupiah) — wajib diisi, nilai > 0
- [ ] Form memiliki dropdown **Category** dengan opsi: Food, Transport, Fun — wajib dipilih
- [ ] Tombol submit tidak memproses form jika ada field yang kosong atau tidak valid
- [ ] Pesan error muncul per-field tepat di bawah input yang bermasalah
- [ ] Pesan error hilang saat pengguna mulai mengisi input yang valid
- [ ] Setelah submit berhasil, form direset ke kondisi kosong
- [ ] Fokus kursor kembali ke field Item Name setelah submit berhasil

---

### FR-2: Total Balance

**User Story:**
Sebagai pengguna, saya ingin melihat total pengeluaran saya secara langsung agar saya tahu sudah berapa banyak yang saya keluarkan.

**Acceptance Criteria:**

- [ ] Total pengeluaran ditampilkan di bagian paling atas halaman
- [ ] Nilai total diformat sebagai Rupiah Indonesia (contoh: `Rp 1.250.000`)
- [ ] Total otomatis diperbarui setiap kali transaksi ditambahkan
- [ ] Total otomatis diperbarui setiap kali transaksi dihapus
- [ ] Nilai awal saat tidak ada transaksi adalah `Rp 0`

---

### FR-3: Transaction List

**User Story:**
Sebagai pengguna, saya ingin melihat daftar semua pengeluaran agar saya bisa memantau riwayat transaksi.

**Acceptance Criteria:**

- [ ] Daftar menampilkan semua transaksi yang telah ditambahkan
- [ ] Setiap item menampilkan: nama item, jumlah (Rupiah), kategori, dan tanggal
- [ ] Daftar dapat di-scroll jika jumlah item melebihi area tampilan (max-height: 420px)
- [ ] Setiap item memiliki tombol hapus
- [ ] Menghapus item langsung memperbarui daftar, total balance, dan chart
- [ ] Menampilkan pesan kosong ("No transactions yet") jika belum ada data

---

### FR-4: Visual Chart

**User Story:**
Sebagai pengguna, saya ingin melihat distribusi pengeluaran per kategori dalam bentuk chart agar saya bisa mengetahui pola pengeluaran saya.

**Acceptance Criteria:**

- [ ] Pie chart ditampilkan menggunakan library Chart.js (via CDN)
- [ ] Chart menampilkan proporsi pengeluaran per kategori (Food, Transport, Fun)
- [ ] Tooltip pada chart menampilkan nominal Rupiah dan persentase
- [ ] Chart otomatis diperbarui saat transaksi ditambah atau dihapus
- [ ] Menampilkan pesan "No data yet" saat belum ada transaksi
- [ ] Legend chart berada di bagian bawah

---

### FR-5: Dark / Light Mode Toggle (Optional Challenge 1)

**User Story:**
Sebagai pengguna, saya ingin bisa mengganti tema tampilan agar nyaman digunakan di kondisi cahaya berbeda.

**Acceptance Criteria:**

- [ ] Tombol toggle tema tersedia di area header
- [ ] Toggle berpindah antara Light Mode dan Dark Mode
- [ ] Seluruh warna antarmuka berubah mengikuti tema aktif
- [ ] Preferensi tema tersimpan di LocalStorage
- [ ] Tema yang tersimpan dipulihkan saat halaman dibuka kembali
- [ ] Warna teks legend pada chart ikut menyesuaikan tema

---

### FR-6: Sort Transaksi (Optional Challenge 2)

**User Story:**
Sebagai pengguna, saya ingin mengurutkan daftar transaksi agar lebih mudah menemukan atau menganalisis data.

**Acceptance Criteria:**

- [ ] Dropdown sort tersedia di atas daftar transaksi
- [ ] Opsi sort meliputi: Newest, Oldest, Amount High→Low, Amount Low→High, Category A→Z, Category Z→A
- [ ] Daftar langsung diurutkan ulang saat opsi sort diubah
- [ ] Sort tidak mengubah urutan data asli di state / LocalStorage
- [ ] Default sort adalah "Newest first"

---

### FR-7: Budget Limit & Peringatan Visual (Optional Challenge 3)

**User Story:**
Sebagai pengguna, saya ingin menetapkan batas anggaran dan mendapat peringatan saat pengeluaran mendekati atau melebihi batas agar saya bisa mengontrol keuangan.

**Acceptance Criteria:**

- [ ] Input tersedia untuk menetapkan nilai budget limit (Rupiah)
- [ ] Tombol "Set" menyimpan limit dan menampilkannya
- [ ] Tombol "Clear" menghapus limit yang aktif
- [ ] Progress bar muncul di kartu balance saat limit aktif
- [ ] Progress bar menampilkan persentase pemakaian dan nilai nominal
- [ ] Warna progress bar: putih (<75%), kuning (75–99%), merah (≥100%)
- [ ] Banner peringatan "⚠️ Budget limit exceeded!" muncul saat total melebihi limit
- [ ] Banner peringatan memiliki animasi blink
- [ ] Kartu balance menampilkan animasi shake saat pertama kali melewati limit
- [ ] Nilai limit tersimpan di LocalStorage dan dipulihkan saat halaman dibuka kembali

---

## Non-Functional Requirements

### NFR-1: Technology Constraints

- [ ] Hanya menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES6+)
- [ ] Tidak menggunakan framework JavaScript (React, Vue, Angular, dll.)
- [ ] Tidak menggunakan backend server atau API eksternal
- [ ] Penyimpanan data menggunakan LocalStorage API saja

### NFR-2: File Structure

- [ ] Hanya 1 file HTML: `index.html` di root
- [ ] Hanya 1 file CSS: `css/style.css`
- [ ] Hanya 1 file JavaScript: `js/script.js`

### NFR-3: Performance & UX

- [ ] Halaman dapat dijalankan hanya dengan membuka `index.html` di browser
- [ ] Tidak ada lag yang terasa saat menambah/menghapus transaksi
- [ ] Chart diperbarui dalam < 500ms setelah perubahan data
- [ ] Tampilan responsif dan berfungsi baik di layar mobile (≥320px) maupun desktop

### NFR-4: Browser Compatibility

- [ ] Berjalan di Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

### NFR-5: Security

- [ ] Semua input pengguna di-escape sebelum dimasukkan ke innerHTML (mencegah XSS)
