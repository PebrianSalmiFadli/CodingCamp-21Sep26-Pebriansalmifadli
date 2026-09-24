# Tasks — Expense & Budget Visualizer

## Status Legend

- `[x]` Completed
- `[ ]` Pending
- `[-]` In Progress

---

## Phase 1 — Project Setup

- [x] **TASK-01** Buat struktur folder root: `css/` dan `js/`
- [x] **TASK-02** Buat file `index.html` dengan boilerplate HTML5, meta viewport, dan link ke CSS + JS
- [x] **TASK-03** Tambahkan Chart.js v4.4.3 via CDN `jsdelivr.net` di bagian bawah `<body>`
- [x] **TASK-04** Buat file `css/style.css` kosong dan `js/script.js` kosong

---

## Phase 2 — HTML Structure

- [x] **TASK-05** Buat `<header>` dengan brand title dan tombol theme toggle (`#themeToggle`, `#themeIcon`, `#themeLabel`)
- [x] **TASK-06** Buat `<section>` balance dengan `<div class="balance-card">` berisi:
  - `#totalAmount` untuk tampilan total
  - `#limitBarWrap`, `#limitBarFill`, `#limitBarText` untuk progress bar (hidden default)
  - `#limitWarning` untuk pesan over-budget (hidden default)
- [x] **TASK-07** Buat budget panel dengan `#budgetInput`, `#setBudgetBtn`, `#clearBudgetBtn`, `#budgetCurrent`
- [x] **TASK-08** Buat `<form id="txForm">` dengan field:
  - `#txName` (text input)
  - `#txAmount` (number input)
  - `#txCategory` (select: Food / Transport / Fun)
  - `#nameErr`, `#amountErr`, `#categoryErr` (error spans)
  - Submit button
- [x] **TASK-09** Buat section chart dengan `<canvas id="pieChart">` dan `#chartEmpty`
- [x] **TASK-10** Buat section daftar transaksi dengan `<ul id="txList">`, `#txEmpty`, dan `#sortSelect`
- [x] **TASK-11** Buat `<footer>` dengan informasi stack

---

## Phase 3 — CSS Styling

- [x] **TASK-12** Definisikan CSS Custom Properties (design tokens) di `:root` — warna, spacing, radius, shadow, font
- [x] **TASK-13** Definisikan override token untuk `[data-theme="dark"]`
- [x] **TASK-14** Styling komponen `header` dan `btn-theme`
- [x] **TASK-15** Styling `balance-card` (gradient background) dan `budget-panel`
- [x] **TASK-16** Styling `limit-bar`, `limit-bar__fill` (dengan modifier `--warn` dan `--danger`), dan `balance-card__warning`
- [x] **TASK-17** Styling komponen form: `.field`, `.field__label`, `.input`, `.input--error`, `.field__error`, `.input--select`
- [x] **TASK-18** Styling button variants: `.btn--primary`, `.btn--ghost`, `.btn--icon`, `.btn--block`
- [x] **TASK-19** Styling `.card` dan `.card--chart`
- [x] **TASK-20** Styling `.chart-container` dan `.chart-empty`
- [x] **TASK-21** Styling `.tx-list` (scrollable), `.tx-item`, `.tx-item__dot` (per kategori), `.badge`
- [x] **TASK-22** Tambahkan keyframe animasi: `fadeSlide`, `shake`, `blink`
- [x] **TASK-23** Implementasi layout `grid-two` dengan CSS Grid
- [x] **TASK-24** Tambahkan media queries responsif (breakpoint 700px dan 480px)
- [x] **TASK-25** Styling `footer`

---

## Phase 4 — JavaScript Core

- [x] **TASK-26** Definisikan konstanta: `LS_TX`, `LS_THEME`, `LS_LIMIT`, `CAT_EMOJI`, `CAT_COLOR`
- [x] **TASK-27** Definisikan state variables: `transactions[]`, `budgetLimit`, `chart`
- [x] **TASK-28** Buat objek `dom` berisi semua referensi elemen (26 referensi)
- [x] **TASK-29** Implementasi utility functions: `toRupiah()`, `uid()`, `fmtDate()`, `esc()`

---

## Phase 5 — LocalStorage

- [x] **TASK-30** Implementasi `loadStorage()` — baca transactions + limit dari LS dengan try/catch
- [x] **TASK-31** Implementasi `saveTx()` — serialize transactions array ke LS
- [x] **TASK-32** Implementasi `saveLimit()` dan `saveTheme()` / `getSavedTheme()`

---

## Phase 6 — Feature: Form & Validation

- [x] **TASK-33** Implementasi `setValid(input, err, valid)` — toggle CSS error class per field
- [x] **TASK-34** Implementasi `validateAll()` — validasi 3 field sekaligus, return boolean
- [x] **TASK-35** Pasang event listener `submit` pada `#txForm`:
  - Panggil `validateAll()`, jika gagal stop
  - Buat objek transaksi baru, `unshift` ke array state
  - Panggil `saveTx()` dan `refreshAll()`
  - Reset form dan kembalikan fokus ke `#txName`
- [x] **TASK-36** Pasang inline error clear: listener `input` pada `#txName` dan `#txAmount`, `change` pada `#txCategory`

---

## Phase 7 — Feature: Balance & Budget Limit

- [x] **TASK-37** Implementasi `getTotal()` — reduce sum semua amounts
- [x] **TASK-38** Implementasi `renderBalance()`:
  - Update `#totalAmount` dengan `toRupiah(total)`
  - Jika `budgetLimit > 0`: hitung pct, tampilkan progress bar, warnai bar, tampilkan/sembunyikan warning
  - Jika over budget: trigger shake animation pada `#balanceCard`
- [x] **TASK-39** Pasang event listener `setBudgetBtn`:
  - Validasi input angka > 0
  - Set `budgetLimit`, `saveLimit()`, update `#budgetCurrent`, panggil `renderBalance()`
- [x] **TASK-40** Pasang event listener `clearBudgetBtn`:
  - Reset `budgetLimit = 0`, `saveLimit()`, panggil `renderBalance()`
- [x] **TASK-41** Pasang event listener `keydown` pada `#budgetInput` untuk trigger Set via Enter

---

## Phase 8 — Feature: Chart

- [x] **TASK-42** Implementasi `getCategoryTotals()` — aggregate amount per kategori dari state
- [x] **TASK-43** Implementasi `initChart()` — inisialisasi Chart.js Pie Chart dengan konfigurasi penuh (legend, tooltip, animasi)
- [x] **TASK-44** Implementasi `syncChartTheme()` — update warna legend saat tema berubah
- [x] **TASK-45** Implementasi `renderChart()`:
  - Hitung totals per kategori
  - Update `chart.data.labels`, `data`, `backgroundColor`
  - Show/hide `#chartEmpty` dan `#pieChart` berdasarkan ada tidaknya data
  - Panggil `chart.update()`

---

## Phase 9 — Feature: Transaction List & Sort

- [x] **TASK-46** Implementasi `sorted()` — return sorted copy dari `transactions[]` berdasarkan `#sortSelect`
- [x] **TASK-47** Implementasi `renderList()`:
  - Panggil `sorted()`
  - Jika kosong: tampilkan `#txEmpty`
  - Jika ada data: generate HTML untuk setiap transaksi dengan dot, badge, amount, tombol hapus
  - Inject ke `innerHTML` menggunakan `esc()` untuk semua string user
- [x] **TASK-48** Pasang event listener `click` pada `#txList` (event delegation):
  - Cari `closest('[data-delete]')`
  - Filter transactions, `saveTx()`, `refreshAll()`
- [x] **TASK-49** Pasang event listener `change` pada `#sortSelect` → panggil `renderList()`

---

## Phase 10 — Feature: Dark / Light Mode

- [x] **TASK-50** Implementasi `applyTheme(theme)`:
  - Set `data-theme` attribute pada `<html>`
  - Update icon dan label tombol tema
  - Panggil `syncChartTheme()` jika chart sudah diinisialisasi
- [x] **TASK-51** Implementasi `toggleTheme()` — flip tema saat ini, panggil `applyTheme()` dan `saveTheme()`
- [x] **TASK-52** Pasang event listener `click` pada `#themeToggle`

---

## Phase 11 — Bootstrap & Integration

- [x] **TASK-53** Implementasi fungsi `refreshAll()` — wrapper yang memanggil `renderBalance()`, `renderChart()`, `renderList()`
- [x] **TASK-54** Implementasi `init()`:
  - `loadStorage()`
  - Restore `#budgetCurrent` text
  - `applyTheme(getSavedTheme())`
  - `initChart()`
  - `refreshAll()`
- [x] **TASK-55** Guard CDN: `typeof Chart !== 'undefined' ? init() : window.addEventListener('load', init)`

---

## Phase 12 — QA & Verification

- [x] **TASK-56** Verifikasi semua 26 ID di `dom` object ada di HTML
- [x] **TASK-57** Verifikasi tidak ada file CSS/JS tambahan di luar yang ditetapkan
- [x] **TASK-58** Verifikasi data flow: tambah transaksi → balance update → chart update → list update
- [x] **TASK-59** Verifikasi LocalStorage: data tetap ada setelah page refresh
- [x] **TASK-60** Verifikasi tema tersimpan setelah page refresh
- [x] **TASK-61** Verifikasi budget limit tersimpan setelah page refresh
- [x] **TASK-62** Verifikasi validasi form: coba submit dengan field kosong
- [x] **TASK-63** Verifikasi XSS: coba input nama dengan karakter `<script>alert(1)</script>`

---

## Summary

| Phase | Tasks | Status |
|---|---|---|
| 1 — Project Setup | TASK 01–04 | ✅ Completed |
| 2 — HTML Structure | TASK 05–11 | ✅ Completed |
| 3 — CSS Styling | TASK 12–25 | ✅ Completed |
| 4 — JS Core | TASK 26–29 | ✅ Completed |
| 5 — LocalStorage | TASK 30–32 | ✅ Completed |
| 6 — Form & Validation | TASK 33–36 | ✅ Completed |
| 7 — Balance & Budget | TASK 37–41 | ✅ Completed |
| 8 — Chart | TASK 42–45 | ✅ Completed |
| 9 — List & Sort | TASK 46–49 | ✅ Completed |
| 10 — Dark/Light Mode | TASK 50–52 | ✅ Completed |
| 11 — Bootstrap | TASK 53–55 | ✅ Completed |
| 12 — QA | TASK 56–63 | ✅ Completed |
| **Total** | **63 tasks** | **✅ 63/63** |
