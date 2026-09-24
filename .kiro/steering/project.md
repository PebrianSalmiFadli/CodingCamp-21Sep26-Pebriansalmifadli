---
inclusion: always
---

# Expense & Budget Visualizer — Project Steering

## Identitas Proyek

Ini adalah aplikasi web **Expense & Budget Visualizer** yang dibangun untuk Mini Project Coding Camp RevoU (September 2026).

Aplikasi ini berjalan sepenuhnya di sisi klien (*client-side only*) — tidak ada backend, tidak ada build tool, tidak ada package manager. Cukup buka `index.html` di browser.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Struktur | HTML5 (semantic elements) |
| Styling | CSS3 (Custom Properties, Flexbox, Grid) |
| Logika | Vanilla JavaScript ES6+ (`'use strict'`) |
| Chart | Chart.js v4.4.3 via CDN (`jsdelivr.net`) |
| Storage | Browser LocalStorage API |
| Framework | **Tidak ada** — murni Vanilla JS |

---

## Aturan Folder (Wajib Diikuti)

```
/
├── index.html          ← satu-satunya HTML, di root
├── css/
│   └── style.css       ← HANYA 1 file CSS, tidak boleh lebih
└── js/
    └── script.js       ← HANYA 1 file JS, tidak boleh lebih
```

- **Jangan** membuat file CSS tambahan di luar `css/style.css`.
- **Jangan** membuat file JS tambahan di luar `js/script.js`.
- **Jangan** membuat folder `node_modules`, `dist`, `build`, atau sejenisnya.
- **Jangan** menambahkan `package.json`, `webpack.config.js`, atau build tool apapun.

---

## Konvensi Kode

### HTML
- Gunakan HTML5 semantic tags (`<header>`, `<main>`, `<section>`, `<footer>`, `<ul>`, `<li>`)
- Setiap elemen interaktif yang di-akses JS **wajib** punya `id` unik
- Sertakan atribut `aria-*` untuk aksesibilitas di elemen interaktif
- Gunakan `hidden` attribute (bukan `style="display:none"`) untuk elemen yang disembunyikan di markup awal

### CSS
- Semua warna, spacing, dan radius didefinisikan sebagai **CSS Custom Properties** di `:root`
- Dark mode menggunakan selector `[data-theme="dark"]` pada `<html>`
- Penamaan class mengikuti pola **BEM** — `block__element--modifier`
- Jangan gunakan `!important` kecuali untuk state override (`.input--error`)
- Breakpoint responsif: `700px` (grid) dan `480px` (mobile tweaks)

### JavaScript
- Selalu mulai file dengan `'use strict';`
- Semua referensi DOM dikumpulkan dalam satu objek `dom = {}` di bagian atas
- Gunakan helper `$` sebagai alias singkat `document.getElementById`
- **Selalu escape** input pengguna dengan fungsi `esc()` sebelum dimasukkan ke innerHTML — ini mencegah XSS
- Data flow: `User Action → update state → save ke localStorage → refreshAll()`
- Fungsi `refreshAll()` selalu memanggil tiga renderer: `renderBalance()`, `renderChart()`, `renderList()`
- Gunakan **event delegation** untuk tombol hapus (listener di parent `#txList`, bukan di tiap tombol)

---

## LocalStorage Keys

| Key | Isi |
|---|---|
| `ebv_transactions` | Array transaksi (JSON string) |
| `ebv_theme` | Tema aktif: `"light"` atau `"dark"` |
| `ebv_limit` | Budget limit (string angka, `"0"` = tidak ada limit) |

---

## Skema Data Transaksi

```js
{
  id      : string,   // uid() — e.g. "lc3k2a9f"
  name    : string,   // nama item pengeluaran
  amount  : number,   // nominal dalam Rupiah (integer positif)
  category: string,   // "Food" | "Transport" | "Fun"
  ts      : number,   // timestamp Date.now()
}
```

---

## Kategori & Warna

| Kategori | Emoji | Warna CSS | CSS Variable |
|---|---|---|---|
| Food | 🍔 | `#f97316` | `--food` |
| Transport | 🚗 | `#3b82f6` | `--transport` |
| Fun | 🎉 | `#a855f7` | `--fun` |

Warna ini digunakan konsisten di: dot indicator, badge, dan pie chart.

---

## Fitur yang Sudah Ada (Jangan Duplikasi)

- ✅ Form tambah transaksi + validasi per-field
- ✅ Total balance (auto-recalculate)
- ✅ Daftar transaksi scrollable + hapus (event delegation)
- ✅ Pie chart Chart.js (auto-update saat data berubah)
- ✅ Dark / Light mode toggle (persisted ke localStorage)
- ✅ Sort transaksi: date, amount, category (6 opsi)
- ✅ Budget limit + progress bar + warning blink + shake animation

---

## Hal yang Tidak Boleh Dilakukan

- ❌ Jangan install/import React, Vue, Angular, atau framework JS apapun
- ❌ Jangan tambah backend, API call, atau fetch ke server eksternal
- ❌ Jangan gunakan `innerHTML` tanpa melewati `esc()` untuk data dari pengguna
- ❌ Jangan tambah file CSS atau JS baru — semua harus masuk ke file yang sudah ada
- ❌ Jangan gunakan `localStorage.clear()` — hapus hanya key spesifik proyek ini
