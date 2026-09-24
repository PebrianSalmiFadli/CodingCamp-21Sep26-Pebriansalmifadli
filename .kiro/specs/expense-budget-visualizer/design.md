# Design — Expense & Budget Visualizer

## 1. Arsitektur Sistem

Aplikasi ini menggunakan arsitektur **Single Page Application (SPA) murni tanpa framework**. Tidak ada routing, tidak ada build step, tidak ada server.

```
Browser
  └── index.html
        ├── css/style.css       (styling & tema)
        └── js/script.js        (semua logika)
              ├── State Management (in-memory)
              ├── LocalStorage (persistence)
              └── Chart.js (via CDN)
```

---

## 2. Struktur File

```
/
├── index.html                              → markup & CDN links
├── css/
│   └── style.css                           → design tokens, komponen, responsif
├── js/
│   └── script.js                           → state, events, render, storage
└── .kiro/
    ├── config.json                         → konfigurasi proyek Kiro
    ├── steering/
    │   └── project.md                      → konteks permanen untuk Kiro
    └── specs/expense-budget-visualizer/
        ├── requirements.md
        ├── design.md                       ← file ini
        ├── tasks.md
        └── tasks.meta.json
```

---

## 3. Data Model

### Transaksi

```typescript
interface Transaction {
  id       : string;   // uid() — e.g. "lc3k2a9f7b"
  name     : string;   // nama item pengeluaran
  amount   : number;   // nominal Rupiah (integer > 0)
  category : "Food" | "Transport" | "Fun";
  ts       : number;   // Unix timestamp ms — Date.now()
}
```

### LocalStorage Schema

| Key | Tipe | Contoh Nilai |
|---|---|---|
| `ebv_transactions` | `Transaction[]` (JSON) | `[{"id":"lc3k","name":"Lunch","amount":35000,...}]` |
| `ebv_theme` | `string` | `"light"` \| `"dark"` |
| `ebv_limit` | `string` | `"500000"` (Rp 500.000) atau `"0"` (no limit) |

---

## 4. Arsitektur JavaScript (`script.js`)

### 4.1 Module Layout

```
script.js
│
├── CONSTANTS        → LS keys, CAT_EMOJI, CAT_COLOR
├── STATE            → transactions[], budgetLimit, chart instance
├── DOM REFERENCES   → objek `dom` berisi semua getElementById
│
├── UTILITIES
│   ├── toRupiah(n)        → format angka ke "Rp 1.250.000"
│   ├── uid()              → generate unique ID
│   ├── fmtDate(ts)        → format timestamp ke "24 Sep 2026"
│   └── esc(str)           → escape HTML (XSS prevention)
│
├── LOCAL STORAGE
│   ├── loadStorage()      → baca transactions + limit dari LS
│   ├── saveTx()           → tulis transactions ke LS
│   ├── saveLimit()        → tulis budgetLimit ke LS
│   ├── saveTheme(t)       → tulis tema ke LS
│   └── getSavedTheme()    → baca tema dari LS
│
├── THEME
│   ├── applyTheme(theme)  → set data-theme, update icon/label, sync chart
│   └── toggleTheme()      → flip tema & simpan ke LS
│
├── BALANCE & LIMIT
│   ├── getTotal()         → sum semua amounts
│   └── renderBalance()    → update DOM: total, progress bar, warning, shake
│
├── CHART
│   ├── getCategoryTotals() → aggregate amount per kategori
│   ├── initChart()         → inisialisasi Chart.js instance
│   ├── syncChartTheme()    → update warna legend saat tema berubah
│   └── renderChart()       → update data chart / show-hide empty state
│
├── LIST
│   ├── sorted()            → return sorted copy of transactions[]
│   └── renderList()        → render HTML semua tx-item ke #txList
│
├── REFRESH
│   └── refreshAll()        → renderBalance() + renderChart() + renderList()
│
├── VALIDATION
│   ├── setValid(input, err, valid) → toggle CSS error class
│   └── validateAll()              → validasi semua 3 field form
│
├── EVENT LISTENERS
│   ├── txForm → submit       → validateAll → push tx → saveTx → refreshAll
│   ├── txName/txAmount/txCategory → input/change → inline clear error
│   ├── txList → click        → event delegation → delete tx → refreshAll
│   ├── sortSelect → change   → renderList
│   ├── setBudgetBtn → click  → set limit → saveLimit → renderBalance
│   ├── clearBudgetBtn → click → clear limit → saveLimit → renderBalance
│   ├── budgetInput → keydown → Enter → setBudgetBtn.click()
│   └── themeToggle → click   → toggleTheme
│
└── BOOTSTRAP
    └── init()               → loadStorage → applyTheme → initChart → refreshAll
```

### 4.2 Data Flow Diagram

```
┌─────────────┐     submit      ┌──────────────┐
│  Input Form │ ─────────────►  │ validateAll() │
└─────────────┘                 └──────┬───────┘
                                       │ valid
                                       ▼
                                ┌──────────────┐    saveTx()
                                │ push to state│ ──────────────► LocalStorage
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │ refreshAll() │
                                └──────┬───────┘
                         ┌─────────────┼─────────────┐
                         ▼             ▼              ▼
                  renderBalance() renderChart()  renderList()
                         │             │              │
                         ▼             ▼              ▼
                     #totalAmount  #pieChart      #txList
                     #limitBarFill  (Chart.js)    (innerHTML)
                     #limitWarning
```

### 4.3 Delete Flow (Event Delegation)

```
User klik 🗑 di tx-item
        │
        ▼
txList.addEventListener('click')
        │
        ├─ e.target.closest('[data-delete]')
        │
        ▼
transactions = transactions.filter(t => t.id !== btn.dataset.delete)
        │
        ├─ saveTx()
        └─ refreshAll()
```

---

## 5. Komponen UI

### 5.1 Layout Hierarchy

```
<body>
  <header>          → sticky top bar + theme toggle
  <main>
    <balance-section>
      <balance-card>   → total + progress bar + warning
      <budget-panel>   → set/clear limit input
    </balance-section>
    <grid-two>
      <card>           → form tambah transaksi
      <card--chart>    → pie chart
    </grid-two>
    <card>             → daftar transaksi + sort
  </main>
  <footer>
```

### 5.2 CSS Design System

**CSS Custom Properties (Tokens)**

```css
/* Warna brand */
--primary: #6366f1         /* Indigo */
--primary-dark: #4f46e5

/* Warna kategori */
--food: #f97316            /* Orange */
--transport: #3b82f6       /* Blue */
--fun: #a855f7             /* Purple */

/* Surface / Background */
--bg, --surface, --surface-2, --border

/* Semantic */
--danger, --warning, --success
```

**Dark mode** diimplementasi dengan override `[data-theme="dark"]` pada semua token warna — tidak ada duplikasi rule CSS.

**Penamaan Class (BEM)**
- Block: `.balance-card`, `.tx-item`, `.budget-panel`
- Element: `.balance-card__amount`, `.tx-item__body`, `.tx-item__dot`
- Modifier: `.tx-item__dot--food`, `.btn--primary`, `.input--error`

### 5.3 Responsive Breakpoints

| Breakpoint | Perubahan Layout |
|---|---|
| > 700px | `grid-two` = 2 kolom (form + chart berdampingan) |
| ≤ 700px | `grid-two` = 1 kolom (form & chart stack vertikal) |
| ≤ 480px | Padding dikurangi, budget-panel row jadi vertikal, list-head stack |

---

## 6. Animasi & Visual Feedback

| Trigger | Animasi | Implementasi |
|---|---|---|
| Item baru ditambahkan | Slide + fade in dari atas | `@keyframes fadeSlide` |
| Total melebihi limit | Kartu balance shake | `@keyframes shake` + reflow trick |
| Warning over-budget | Banner blink/pulse | `@keyframes blink` |
| Progress bar update | Width transition | `transition: width .5s ease` |
| Chart data berubah | Smooth re-render | Chart.js `animation: { duration: 450 }` |

---

## 7. Keamanan

### XSS Prevention

Semua string dari input pengguna dilewatkan fungsi `esc()` sebelum dimasukkan ke innerHTML:

```js
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### LocalStorage Safety

- Parse dalam `try/catch` untuk mencegah crash jika data korup
- Hanya key spesifik proyek yang diakses (`ebv_*`)

---

## 8. Dependency Eksternal

| Library | Versi | Sumber | Digunakan Untuk |
|---|---|---|---|
| Chart.js | 4.4.3 | `cdn.jsdelivr.net` | Pie chart visualisasi pengeluaran |

Tidak ada dependency lain. Tidak perlu `npm install`.

---

## 9. Aksesibilitas (A11y)

- Semua input form memiliki `<label>` terhubung
- Error message menggunakan `role="alert"` (dibaca screen reader)
- Progress bar menggunakan `role="progressbar"` + `aria-valuenow`
- Warning banner menggunakan `aria-live="polite"`
- Tombol hapus memiliki `aria-label` deskriptif
- Tombol tema memiliki `aria-label`
- Canvas chart memiliki `role="img"` + `aria-label`
