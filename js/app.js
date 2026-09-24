/**
 * app.js — Expense Tracker main application file
 */

const STORAGE_KEY = "expense_tracker_transactions";

const StorageService = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.error("StorageService.load: failed to parse stored data", err);
      return [];
    }
  },

  save(transactions) {
    try {
      const serialized = JSON.stringify(transactions);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      console.error("StorageService.save: failed to persist data", err);
      if (typeof UIRenderer !== "undefined" && typeof UIRenderer.showNotification === "function") {
        UIRenderer.showNotification("Your data could not be saved. Changes are retained for this session only.");
      }
    }
  },
};

const TransactionService = {
  roundAmount(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },

  create(name, amount, category) {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString();

    return {
      id,
      name: String(name).trim(),
      amount: TransactionService.roundAmount(parseFloat(amount)),
      category,
      createdAt: new Date().toISOString(),
    };
  },

  remove(transactions, id) {
    return transactions.filter((t) => t.id !== id);
  },

  sortByDate(transactions) {
    return [...transactions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  calcBalance(transactions) {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return TransactionService.roundAmount(total);
  },

  calcCategoryTotals(transactions) {
    const totals = { Food: 0, Transport: 0, Fun: 0 };
    for (const t of transactions) {
      if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
        totals[t.category] = TransactionService.roundAmount(
          totals[t.category] + t.amount
        );
      }
    }
    return totals;
  },
};

const VALID_CATEGORIES = ["Food", "Transport", "Fun"];
const AMOUNT_MIN = 0.01;
const AMOUNT_MAX = 999_999_999.99;

const Validator = {
  validateForm(name, amount, category) {
    const errors = {};

    const trimmedName = (name ?? "").trim();
    if (trimmedName.length === 0) {
      errors.name = "Item name is required.";
    } else if (trimmedName.length > 100) {
      errors.name = "Item name must be 100 characters or fewer.";
    }

    const parsedAmount = parseFloat(amount);
    if (amount === "" || amount === null || amount === undefined || !isFinite(parsedAmount)) {
      errors.amount = "Amount must be a valid number.";
    } else if (parsedAmount < AMOUNT_MIN || parsedAmount > AMOUNT_MAX) {
      errors.amount = `Amount must be between ${AMOUNT_MIN.toFixed(2)} and ${AMOUNT_MAX.toFixed(2)}.`;
    }

    if (!VALID_CATEGORIES.includes(category)) {
      errors.category = "Please select a category: Food, Transport, or Fun.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

const UIRenderer = {
  showFormErrors(errors) {
    const nameSpan     = document.getElementById("error-name");
    const amountSpan   = document.getElementById("error-amount");
    const categorySpan = document.getElementById("error-category");

    if (nameSpan)     nameSpan.textContent     = errors.name     ?? "";
    if (amountSpan)   amountSpan.textContent   = errors.amount   ?? "";
    if (categorySpan) categorySpan.textContent = errors.category ?? "";
  },

  clearFormErrors() {
    const nameSpan     = document.getElementById("error-name");
    const amountSpan   = document.getElementById("error-amount");
    const categorySpan = document.getElementById("error-category");

    if (nameSpan)     nameSpan.textContent     = "";
    if (amountSpan)   amountSpan.textContent   = "";
    if (categorySpan) categorySpan.textContent = "";
  },

  resetForm() {
    const nameInput      = document.getElementById("item-name");
    const amountInput    = document.getElementById("item-amount");
    const categorySelect = document.getElementById("item-category");

    if (nameInput)      nameInput.value      = "";
    if (amountInput)    amountInput.value    = "";
    if (categorySelect) categorySelect.value = "";
  },

  showNotification(message) {
    const el = document.getElementById("notification");
    if (!el) return;
    el.textContent = message;
    el.classList.add("visible");
    setTimeout(() => {
      el.classList.remove("visible");
    }, 4000);
  },

  renderTransactionList(transactions) {
    const list       = document.getElementById("transaction-items");
    const emptyState = document.getElementById("empty-state");
    if (!list) return;

    list.innerHTML = "";

    if (!Array.isArray(transactions) || transactions.length === 0) {
      if (emptyState) emptyState.style.display = "";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    const sorted = TransactionService.sortByDate(transactions);

    for (const t of sorted) {
      const rawName     = t.name     ?? "N/A";
      const rawAmount   = t.amount   != null ? t.amount   : null;
      const rawCategory = t.category ?? "N/A";

      const displayName   = rawName.length > 50 ? rawName.slice(0, 50) + "…" : rawName;
      const displayAmount = rawAmount != null ? "$" + rawAmount.toFixed(2) : "N/A";

      const li = document.createElement("li");
      li.className = `transaction-item category-${rawCategory.toLowerCase()}`;
      li.dataset.id = t.id;

      li.innerHTML = `
        <span class="transaction-name" title="${rawName.replace(/"/g, "&quot;")}">
          ${escapeHtml(displayName)}
        </span>
        <span class="transaction-category">${escapeHtml(rawCategory)}</span>
        <span class="transaction-amount">${displayAmount}</span>
        <button class="delete-btn" data-id="${t.id}" aria-label="Delete ${escapeHtml(displayName)}">
          &times;
        </button>
      `;

      list.appendChild(li);
    }
  },

  renderBalance(total) {
    const el = document.getElementById("balance-amount");
    if (!el) return;

    if (typeof total !== "number" || !isFinite(total)) {
      el.textContent = "--";
    } else {
      el.textContent = "$" + total.toFixed(2);
    }
  },

  renderChart(categoryTotals) {
    const canvas     = document.getElementById("spending-chart");
    const emptyState = document.getElementById("chart-empty-state");
    if (!canvas) return;

    const CATEGORY_COLORS = {
      Food:      "#f59e0b",
      Transport: "#3b82f6",
      Fun:       "#10b981",
    };

    const total = (categoryTotals.Food ?? 0)
                + (categoryTotals.Transport ?? 0)
                + (categoryTotals.Fun ?? 0);

    if (total === 0) {
      canvas.style.display = "none";
      if (emptyState) emptyState.style.display = "";

      if (UIRenderer._chartInstance) {
        UIRenderer._chartInstance.destroy();
        UIRenderer._chartInstance = null;
      }
      return;
    }

    canvas.style.display = "";
    if (emptyState) emptyState.style.display = "none";

    const entries = Object.entries(categoryTotals).filter(([, v]) => v > 0);
    const labels  = entries.map(([k]) => k);
    const data    = entries.map(([, v]) => v);
    const colors  = entries.map(([k]) => CATEGORY_COLORS[k] ?? "#6b7280");

    const percentages = data.map((v) => ((v / total) * 100).toFixed(1) + "%");
    const chartLabels = labels.map((l, i) => `${l} (${percentages[i]})`);

    if (!UIRenderer._chartInstance) {
      UIRenderer._chartInstance = new Chart(canvas, {
        type: "pie",
        data: {
          labels: chartLabels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    } else {
      UIRenderer._chartInstance.data.labels              = chartLabels;
      UIRenderer._chartInstance.data.datasets[0].data          = data;
      UIRenderer._chartInstance.data.datasets[0].backgroundColor = colors;
      UIRenderer._chartInstance.update();
    }
  },

  _chartInstance: null,
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let transactions = [];

function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput      = document.getElementById("item-name");
  const amountInput    = document.getElementById("item-amount");
  const categorySelect = document.getElementById("item-category");

  const name     = nameInput     ? nameInput.value     : "";
  const amount   = amountInput   ? amountInput.value   : "";
  const category = categorySelect ? categorySelect.value : "";

  const result = Validator.validateForm(name, amount, category);

  if (!result.valid) {
    UIRenderer.showFormErrors(result.errors);
    return;
  }

  UIRenderer.clearFormErrors();

  const newTransaction = TransactionService.create(name, amount, category);
  transactions.push(newTransaction);

  StorageService.save(transactions);

  UIRenderer.renderTransactionList(transactions);
  UIRenderer.renderBalance(TransactionService.calcBalance(transactions));
  UIRenderer.renderChart(TransactionService.calcCategoryTotals(transactions));

  UIRenderer.resetForm();
}

function handleDeleteClick(event) {
  const button = event.target.closest("[data-id]");
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  const confirmed = window.confirm("Are you sure you want to delete this expense?");
  if (!confirmed) return;

  transactions = TransactionService.remove(transactions, id);

  StorageService.save(transactions);

  UIRenderer.renderTransactionList(transactions);
  UIRenderer.renderBalance(TransactionService.calcBalance(transactions));
  UIRenderer.renderChart(TransactionService.calcCategoryTotals(transactions));
}

function init() {
  transactions = StorageService.load();

  window.onerror = function (_msg, _src, _line, _col, _err) {
    UIRenderer.showNotification("An unexpected error occurred. Please refresh if the app stops working.");
    return false;
  };

  UIRenderer.renderTransactionList(transactions);
  UIRenderer.renderBalance(TransactionService.calcBalance(transactions));
  UIRenderer.renderChart(TransactionService.calcCategoryTotals(transactions));

  const form = document.getElementById("expense-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const list = document.getElementById("transaction-items");
  if (list) {
    list.addEventListener("click", handleDeleteClick);
  }
}

document.addEventListener("DOMContentLoaded", init);