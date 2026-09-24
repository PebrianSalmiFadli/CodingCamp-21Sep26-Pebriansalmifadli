/**
 * Expense & Budget Visualizer — script.js
 * ─────────────────────────────────────────
 * Stack : Vanilla JS (ES6+), no frameworks
 * Storage: browser localStorage
 * Chart  : Chart.js 4 via CDN
 *
 * Features
 *  ✔ Add / Delete transactions
 *  ✔ Total balance (auto-updates)
 *  ✔ LocalStorage persistence
 *  ✔ Pie chart (auto-updates)
 *  ✔ Form validation (per-field errors)
 *  ✔ Sort (date, amount, category)
 *  ✔ Budget limit + progress bar + over-budget warning
 *  ✔ Dark / Light mode toggle (persisted)
 *  ✔ XSS-safe rendering
 */

'use strict';

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const LS_TX      = 'ebv_transactions';
const LS_THEME   = 'ebv_theme';
const LS_LIMIT   = 'ebv_limit';

const CAT_EMOJI = { Food: '🍔', Transport: '🚗', Fun: '🎉' };
const CAT_COLOR = { Food: '#f97316', Transport: '#3b82f6', Fun: '#a855f7' };

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
/** @type {{ id:string, name:string, amount:number, category:string, ts:number }[]} */
let transactions = [];
let budgetLimit  = 0;          // 0 = no limit
let chart        = null;       // Chart.js instance

/* ═══════════════════════════════════════════
   DOM REFERENCES
═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const dom = {
  /* theme */
  themeToggle : $('themeToggle'),
  themeIcon   : $('themeIcon'),
  themeLabel  : $('themeLabel'),

  /* balance */
  balanceCard   : $('balanceCard'),
  totalAmount   : $('totalAmount'),
  limitBarWrap  : $('limitBarWrap'),
  limitBarFill  : $('limitBarFill'),
  limitBarRole  : $('limitBarRole'),
  limitBarText  : $('limitBarText'),
  limitWarning  : $('limitWarning'),

  /* budget panel */
  budgetInput   : $('budgetInput'),
  setBudgetBtn  : $('setBudgetBtn'),
  clearBudgetBtn: $('clearBudgetBtn'),
  budgetCurrent : $('budgetCurrent'),

  /* form */
  txForm      : $('txForm'),
  txName      : $('txName'),
  txAmount    : $('txAmount'),
  txCategory  : $('txCategory'),
  nameErr     : $('nameErr'),
  amountErr   : $('amountErr'),
  categoryErr : $('categoryErr'),

  /* chart */
  pieChart    : $('pieChart'),
  chartEmpty  : $('chartEmpty'),

  /* list */
  txList      : $('txList'),
  txEmpty     : $('txEmpty'),
  sortSelect  : $('sortSelect'),
};

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */

/** Format a number as Rupiah string */
function toRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

/** Generate a short unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Format timestamp to readable date */
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Escape HTML to prevent XSS */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════ */
function loadStorage() {
  try { transactions = JSON.parse(localStorage.getItem(LS_TX)) || []; }
  catch { transactions = []; }

  budgetLimit = parseFloat(localStorage.getItem(LS_LIMIT)) || 0;
}

function saveTx()    { localStorage.setItem(LS_TX,    JSON.stringify(transactions)); }
function saveLimit() { localStorage.setItem(LS_LIMIT, String(budgetLimit)); }
function saveTheme(t){ localStorage.setItem(LS_THEME, t); }
function getSavedTheme() { return localStorage.getItem(LS_THEME) || 'light'; }

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    dom.themeIcon.textContent  = '☀️';
    dom.themeLabel.textContent = 'Light Mode';
  } else {
    dom.themeIcon.textContent  = '🌙';
    dom.themeLabel.textContent = 'Dark Mode';
  }
  if (chart) syncChartTheme();
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}

/* ═══════════════════════════════════════════
   BALANCE & BUDGET LIMIT
═══════════════════════════════════════════ */
function getTotal() {
  return transactions.reduce((s, t) => s + t.amount, 0);
}

function renderBalance() {
  const total = getTotal();
  dom.totalAmount.textContent = toRupiah(total);

  if (budgetLimit > 0) {
    const pct      = Math.min((total / budgetLimit) * 100, 100);
    const over     = total > budgetLimit;

    dom.limitBarWrap.hidden = false;
    dom.limitBarFill.style.width = pct + '%';
    dom.limitBarRole.setAttribute('aria-valuenow', Math.round(pct));
    dom.limitBarText.textContent =
      `${toRupiah(total)} / ${toRupiah(budgetLimit)} (${Math.round(pct)}%)`;

    // colour the bar
    dom.limitBarFill.classList.remove('limit-bar__fill--warn', 'limit-bar__fill--danger');
    if (pct >= 100)     dom.limitBarFill.classList.add('limit-bar__fill--danger');
    else if (pct >= 75) dom.limitBarFill.classList.add('limit-bar__fill--warn');

    // over-budget warning
    dom.limitWarning.hidden = !over;

    // shake card on over-budget
    if (over) {
      dom.balanceCard.classList.remove('shake');
      void dom.balanceCard.offsetWidth;   // force reflow to restart animation
      dom.balanceCard.classList.add('shake');
    }
  } else {
    dom.limitBarWrap.hidden = true;
    dom.limitWarning.hidden = true;
  }
}

/* ═══════════════════════════════════════════
   CHART
═══════════════════════════════════════════ */
function getCategoryTotals() {
  const map = {};
  transactions.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return map;
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function chartTextColor() { return isDark() ? '#e2e8f0' : '#0f172a'; }

function initChart() {
  chart = new Chart(dom.pieChart, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 2, borderColor: 'transparent', hoverOffset: 12 }] },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 450, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: chartTextColor(),
            font: { size: 13, weight: '700', family: "'Segoe UI', system-ui, sans-serif" },
            padding: 16,
            boxWidth: 13,
            boxHeight: 13,
          },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = sum > 0 ? ((ctx.parsed / sum) * 100).toFixed(1) : 0;
              return `  ${toRupiah(ctx.parsed)}  (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function syncChartTheme() {
  chart.options.plugins.legend.labels.color = chartTextColor();
  chart.update();
}

function renderChart() {
  if (!chart) return;
  const totals = getCategoryTotals();
  const labels = Object.keys(totals);
  const hasData = labels.length > 0;

  // show/hide empty state
  dom.chartEmpty.style.display  = hasData ? 'none'  : 'flex';
  dom.pieChart.style.display    = hasData ? 'block' : 'none';

  if (!hasData) return;

  chart.data.labels                      = labels;
  chart.data.datasets[0].data            = labels.map(l => totals[l]);
  chart.data.datasets[0].backgroundColor = labels.map(l => CAT_COLOR[l] || '#94a3b8');
  chart.update();
}

/* ═══════════════════════════════════════════
   TRANSACTION LIST RENDERING
═══════════════════════════════════════════ */

/** Return sorted copy of transactions based on current sort value */
function sorted() {
  const arr = [...transactions];
  switch (dom.sortSelect.value) {
    case 'amount-desc':    return arr.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':     return arr.sort((a, b) => a.amount - b.amount);
    case 'category-asc':   return arr.sort((a, b) => a.category.localeCompare(b.category));
    case 'category-desc':  return arr.sort((a, b) => b.category.localeCompare(a.category));
    case 'date-asc':       return arr.sort((a, b) => a.ts - b.ts);
    case 'date-desc':
    default:               return arr.sort((a, b) => b.ts - a.ts);
  }
}

function renderList() {
  const list = sorted();

  if (list.length === 0) {
    dom.txList.innerHTML = '';
    dom.txEmpty.style.display = 'block';
    return;
  }

  dom.txEmpty.style.display = 'none';
  dom.txList.innerHTML = list.map(t => {
    const catKey = t.category.toLowerCase();
    const emoji  = CAT_EMOJI[t.category] || '💸';
    return `
      <li class="tx-item" data-id="${t.id}">
        <span class="tx-item__dot tx-item__dot--${catKey}" aria-hidden="true"></span>
        <div class="tx-item__body">
          <div class="tx-item__name">${esc(t.name)}</div>
          <div class="tx-item__meta">
            <span class="badge badge--${catKey}">${emoji} ${esc(t.category)}</span>
            <span class="tx-item__date">${fmtDate(t.ts)}</span>
          </div>
        </div>
        <span class="tx-item__amount">−${toRupiah(t.amount)}</span>
        <button
          class="btn btn--icon"
          data-delete="${t.id}"
          aria-label="Delete ${esc(t.name)}"
          title="Delete"
        >🗑</button>
      </li>`;
  }).join('');
}

/* ═══════════════════════════════════════════
   FULL UI REFRESH
═══════════════════════════════════════════ */
function refreshAll() {
  renderBalance();
  renderChart();
  renderList();
}

/* ═══════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════ */

/**
 * Mark a field valid or invalid, returns the isValid boolean.
 * @param {HTMLElement} input
 * @param {HTMLElement} errEl
 * @param {boolean} valid
 */
function setValid(input, errEl, valid) {
  input.classList.toggle('input--error', !valid);
  errEl.classList.toggle('field__error--show', !valid);
  return valid;
}

function validateAll() {
  const nameOk  = setValid(dom.txName,     dom.nameErr,     dom.txName.value.trim() !== '');
  const val     = parseFloat(dom.txAmount.value);
  const amtOk   = setValid(dom.txAmount,   dom.amountErr,   !isNaN(val) && val > 0);
  const catOk   = setValid(dom.txCategory, dom.categoryErr, dom.txCategory.value !== '');
  return nameOk && amtOk && catOk;
}

/* ═══════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════ */

/* — Form submit — */
dom.txForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateAll()) return;

  transactions.unshift({
    id      : uid(),
    name    : dom.txName.value.trim(),
    amount  : parseFloat(dom.txAmount.value),
    category: dom.txCategory.value,
    ts      : Date.now(),
  });

  saveTx();
  refreshAll();

  // reset form & errors
  dom.txForm.reset();
  [dom.txName, dom.txAmount, dom.txCategory].forEach(el => el.classList.remove('input--error'));
  [dom.nameErr, dom.amountErr, dom.categoryErr].forEach(el => el.classList.remove('field__error--show'));
  dom.txName.focus();
});

/* — Inline clear-on-type — */
dom.txName.addEventListener('input', () => {
  if (dom.txName.value.trim()) {
    dom.txName.classList.remove('input--error');
    dom.nameErr.classList.remove('field__error--show');
  }
});
dom.txAmount.addEventListener('input', () => {
  const v = parseFloat(dom.txAmount.value);
  if (!isNaN(v) && v > 0) {
    dom.txAmount.classList.remove('input--error');
    dom.amountErr.classList.remove('field__error--show');
  }
});
dom.txCategory.addEventListener('change', () => {
  if (dom.txCategory.value) {
    dom.txCategory.classList.remove('input--error');
    dom.categoryErr.classList.remove('field__error--show');
  }
});

/* — Delete (event delegation on the list) — */
dom.txList.addEventListener('click', e => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  transactions = transactions.filter(t => t.id !== btn.dataset.delete);
  saveTx();
  refreshAll();
});

/* — Sort — */
dom.sortSelect.addEventListener('change', renderList);

/* — Budget limit — */
dom.setBudgetBtn.addEventListener('click', () => {
  const v = parseFloat(dom.budgetInput.value);
  if (isNaN(v) || v <= 0) {
    dom.budgetInput.classList.add('input--error');
    dom.budgetInput.focus();
    return;
  }
  dom.budgetInput.classList.remove('input--error');
  budgetLimit = v;
  saveLimit();
  dom.budgetCurrent.textContent = `Current limit: ${toRupiah(budgetLimit)}`;
  dom.budgetInput.value = '';
  renderBalance();
});

dom.clearBudgetBtn.addEventListener('click', () => {
  budgetLimit = 0;
  saveLimit();
  dom.budgetInput.value     = '';
  dom.budgetCurrent.textContent = 'No limit set.';
  dom.budgetInput.classList.remove('input--error');
  renderBalance();
});

dom.budgetInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') dom.setBudgetBtn.click();
});

/* — Theme toggle — */
dom.themeToggle.addEventListener('click', toggleTheme);

/* ═══════════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════════ */
function init() {
  loadStorage();

  // restore budget display text
  dom.budgetCurrent.textContent = budgetLimit > 0
    ? `Current limit: ${toRupiah(budgetLimit)}`
    : 'No limit set.';

  // apply saved theme
  applyTheme(getSavedTheme());

  // init chart then paint UI
  initChart();
  refreshAll();
}

// Guard: wait for Chart.js CDN if needed
typeof Chart !== 'undefined' ? init() : window.addEventListener('load', init);
