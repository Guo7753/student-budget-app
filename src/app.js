import { addExpense, removeExpense, budgetSummary, validateSettings, CATEGORIES, CATEGORY_ICONS } from "./budget.js";

const expenseKey = "student-budget-expenses-v1";
const settingsKey = "student-budget-settings-v1";
const expenseForm = document.querySelector("#expense-form");
const budgetForm = document.querySelector("#budget-form");
const list = document.querySelector("#expense-list");
const expenseMessage = document.querySelector("#expense-message");
const budgetMessage = document.querySelector("#budget-message");
const monthInput = document.querySelector("#month");
const dayInput = document.querySelector("#day");
const openingInput = document.querySelector("#opening-balance");
const budgetInput = document.querySelector("#monthly-budget");
const currency = new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" });

function localDate() {
  const today = new Date();
  const part = (number) => String(number).padStart(2, "0");
  return `${today.getFullYear()}-${part(today.getMonth() + 1)}-${part(today.getDate())}`;
}

let expenses = [];
let settings = { openingBalance: null, monthlyBudgets: {} };
try {
  const savedExpenses = JSON.parse(localStorage.getItem(expenseKey) || "[]");
  if (Array.isArray(savedExpenses)) expenses = savedExpenses;
  const savedSettings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  if (Number.isFinite(savedSettings.openingBalance) && savedSettings.openingBalance >= 0) {
    settings.openingBalance = savedSettings.openingBalance;
  }
  if (savedSettings.monthlyBudgets && typeof savedSettings.monthlyBudgets === "object") {
    settings.monthlyBudgets = savedSettings.monthlyBudgets;
  }
} catch {
  expenseMessage.textContent = "Saved data could not be read. Check this browser's storage.";
}

const today = localDate();
document.querySelector("#date").value = today;
monthInput.value = today.slice(0, 7);
dayInput.value = today;
const categoryInput = document.querySelector("#category");
for (const category of CATEGORIES) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = `${CATEGORY_ICONS[category]}  ${category}`;
  categoryInput.append(option);
}

function currentBudget() {
  const value = settings.monthlyBudgets[monthInput.value];
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function populateBudgetForm() {
  openingInput.value = settings.openingBalance ?? "";
  budgetInput.value = currentBudget() ?? "";
  document.querySelector("#budget-month-label").textContent = monthInput.value;
}

function setMetric(id, value, configured) {
  const element = document.querySelector(`#${id}`);
  element.textContent = configured ? currency.format(value) : "—";
  element.closest(".metric-card").classList.toggle("negative", configured && value < 0);
}

function render() {
  const month = monthInput.value;
  const day = dayInput.value;
  const budget = currentBudget();
  const summary = budgetSummary(expenses, settings.openingBalance ?? 0, budget ?? 0, month, day);
  setMetric("balance", summary.balance, settings.openingBalance !== null);
  setMetric("monthly-remaining", summary.monthlyRemaining, budget !== null);
  setMetric("daily-budget", summary.dailyBudget, budget !== null);
  setMetric("daily-remaining", summary.dailyRemaining, budget !== null);
  document.querySelector("#monthly-spent").textContent = currency.format(summary.monthlySpent);
  document.querySelector("#daily-spent").textContent = budget === null
    ? "Set a monthly budget to see your daily allowance."
    : `${currency.format(summary.dailySpent)} spent on ${day}. Daily budget stays fixed when you add expenses.`;

  list.replaceChildren();
  const visible = expenses.filter((expense) => expense.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const expense of visible) {
    const item = document.createElement("li");
    item.className = "expense-row";
    const icon = document.createElement("span");
    icon.className = "expense-icon";
    icon.textContent = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;
    icon.setAttribute("aria-hidden", "true");
    const details = document.createElement("div");
    details.className = "expense-details";
    const category = document.createElement("strong");
    category.textContent = expense.category;
    const meta = document.createElement("span");
    meta.textContent = `${expense.date}${expense.note ? ` · ${expense.note}` : ""}`;
    details.append(category, meta);
    const amount = document.createElement("strong");
    amount.className = "expense-amount";
    amount.textContent = currency.format(Number(expense.amount));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-button";
    button.textContent = "Delete";
    button.setAttribute("aria-label", `Delete ${expense.category} expense from ${expense.date}`);
    button.addEventListener("click", () => {
      expenses = removeExpense(expenses, expense.id);
      localStorage.setItem(expenseKey, JSON.stringify(expenses));
      render();
    });
    item.append(icon, details, amount, button);
    list.append(item);
  }
  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No expenses for this month yet. Add one to start your record.";
    list.append(empty);
  }
  document.querySelector("#entry-count").textContent = `${visible.length} ${visible.length === 1 ? "entry" : "entries"}`;
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(expenseForm));
  const result = addExpense(expenses, input, crypto.randomUUID());
  if (!result.valid) {
    expenseMessage.textContent = result.error;
    return;
  }
  expenses = result.expenses;
  localStorage.setItem(expenseKey, JSON.stringify(expenses));
  monthInput.value = input.date.slice(0, 7);
  dayInput.value = input.date;
  populateBudgetForm();
  expenseMessage.textContent = "Expense saved.";
  expenseForm.elements.amount.value = "";
  expenseForm.elements.note.value = "";
  render();
});

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = validateSettings(Object.fromEntries(new FormData(budgetForm)));
  if (!result.valid) {
    budgetMessage.textContent = result.error;
    return;
  }
  settings.openingBalance = result.value.openingBalance;
  settings.monthlyBudgets[monthInput.value] = result.value.monthlyBudget;
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  budgetMessage.textContent = `Budget saved for ${monthInput.value}.`;
  render();
});

monthInput.addEventListener("change", () => {
  if (!dayInput.value.startsWith(monthInput.value)) dayInput.value = `${monthInput.value}-01`;
  populateBudgetForm();
  render();
});
dayInput.addEventListener("change", () => {
  if (dayInput.value.slice(0, 7) !== monthInput.value) {
    monthInput.value = dayInput.value.slice(0, 7);
    populateBudgetForm();
  }
  render();
});

populateBudgetForm();
render();

