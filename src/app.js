import { addExpense, updateExpense, removeExpense, budgetSummary, validateSettings, calculateAmount, categoryTotals, dailyTotals, CATEGORIES, CATEGORY_ICONS } from "./budget.js";

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
const amountInput = document.querySelector("#amount");
const amountResult = document.querySelector("#amount-result");
const calculatorPad = document.querySelector("#calculator-pad");
const calculatorToggle = document.querySelector("#calculator-toggle");
const chart = document.querySelector("#category-chart");
const expenseSubmit = document.querySelector("#expense-submit");
const cancelEdit = document.querySelector("#cancel-edit");
const usagePanel = document.querySelector(".usage-panel");
const usageBar = document.querySelector("#usage-bar");
const usagePercent = document.querySelector("#usage-percent");
const usageCaption = document.querySelector("#usage-caption");
const usageBudget = document.querySelector("#usage-budget");
const trendChart = document.querySelector("#trend-chart");
const trendStats = document.querySelector("#trend-stats");
const trendMonth = document.querySelector("#trend-month");
const trendDesc = document.querySelector("#trend-desc");
const currency = new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" });

function localDate() {
  const today = new Date();
  const part = (number) => String(number).padStart(2, "0");
  return `${today.getFullYear()}-${part(today.getMonth() + 1)}-${part(today.getDate())}`;
}

function monthLabel(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return month;
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-NZ", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
}

function monthShort(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return month;
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-NZ", {
    month: "short", year: "numeric", timeZone: "UTC",
  });
}

function dayLabel(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-NZ", {
    day: "numeric", month: "short", timeZone: "UTC",
  });
}

let expenses = [];
let settings = { openingBalance: null, monthlyBudgets: {} };
let editingExpenseId = null;
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
populateMonthOptions();
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

function populateMonthOptions() {
  const months = new Set(expenses.map((expense) => expense.date.slice(0, 7)));
  months.add(today.slice(0, 7));
  if (dayInput.value) months.add(dayInput.value.slice(0, 7));
  if (monthInput.value) months.add(monthInput.value);
  const selected = monthInput.value;
  monthInput.replaceChildren();
  for (const month of [...months].sort()) {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = monthLabel(month);
    monthInput.append(option);
  }
  if (selected && months.has(selected)) monthInput.value = selected;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function niceCeiling(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}

function renderTrend(month) {
  const totals = dailyTotals(expenses, month);
  const days = totals.length;
  const monthSpent = totals.reduce((sum, item) => sum + item.amount, 0);
  const daysWithSpending = totals.filter((item) => item.amount > 0).length;
  const highest = totals.reduce((best, item) => (item.amount > best.amount ? item : best), { day: `${month}-01`, amount: 0 });
  const elapsedDays = month === today.slice(0, 7) ? Math.min(Number(today.slice(8, 10)), days) : days;
  const budget = currentBudget();
  const dailyBudget = budgetSummary(expenses, settings.openingBalance ?? 0, budget ?? 0, month, dayInput.value).dailyBudget;

  trendMonth.textContent = monthShort(month);
  trendStats.replaceChildren();
  const stats = [
    ["Spent this month", currency.format(monthSpent)],
    ["Average per day", currency.format(elapsedDays ? monthSpent / elapsedDays : 0)],
    ["Highest day", highest.amount > 0 ? `${currency.format(highest.amount)} · ${dayLabel(highest.day)}` : "—"],
    ["Days with spending", days ? `${daysWithSpending} of ${elapsedDays}` : "—"],
  ];
  for (const [label, value] of stats) {
    const item = document.createElement("div");
    item.className = "trend-stat";
    const title = document.createElement("span");
    title.textContent = label;
    const figure = document.createElement("strong");
    figure.textContent = value;
    item.append(title, figure);
    trendStats.append(item);
  }

  trendChart.replaceChildren();
  if (!days) {
    trendChart.setAttribute("viewBox", "0 0 760 200");
    trendChart.setAttribute("aria-label", "No daily spending data for this month");
    trendDesc.textContent = "Choose a valid month to see the daily spending trend.";
    return;
  }

  const width = 760;
  const height = 230;
  const padding = { top: 16, right: 14, bottom: 26, left: 46 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maximum = Math.max(...totals.map((item) => item.amount), budget !== null ? dailyBudget : 0, 1);
  const step = niceCeiling(maximum / 4);
  const intervals = Math.max(Math.ceil(maximum / step), 1);
  const yMaximum = step * intervals;
  const xAt = (index) => padding.left + (days === 1 ? plotWidth / 2 : (index / (days - 1)) * plotWidth);
  const yAt = (value) => padding.top + plotHeight - Math.min(value / yMaximum, 1) * plotHeight;

  for (let tick = 0; tick <= intervals; tick += 1) {
    const value = step * tick;
    const lineY = yAt(value);
    trendChart.append(svgElement("line", {
      x1: padding.left, x2: width - padding.right, y1: lineY, y2: lineY,
      class: tick === 0 ? "trend-axis-line" : "trend-grid",
    }));
    const label = svgElement("text", { x: padding.left - 8, y: lineY + 3.5, class: "trend-y-label", "text-anchor": "end" });
    label.textContent = `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
    trendChart.append(label);
  }

  if (budget !== null && dailyBudget > 0 && dailyBudget <= yMaximum) {
    const budgetY = yAt(dailyBudget);
    trendChart.append(svgElement("line", {
      x1: padding.left, x2: width - padding.right, y1: budgetY, y2: budgetY, class: "trend-budget-line",
    }));
    const budgetLabel = svgElement("text", {
      x: width - padding.right, y: budgetY - 6, class: "trend-budget-label", "text-anchor": "end",
    });
    budgetLabel.textContent = `Daily budget ${currency.format(dailyBudget)}`;
    trendChart.append(budgetLabel);
  }

  const points = totals.map((item, index) => [xAt(index), yAt(item.amount)]);
  const areaPath = `M ${points[0][0]},${yAt(0)} L ${points.map(([x, y]) => `${x},${y}`).join(" L ")} L ${points[points.length - 1][0]},${yAt(0)} Z`;
  trendChart.append(svgElement("path", { d: areaPath, class: "trend-area" }));
  trendChart.append(svgElement("polyline", {
    points: points.map(([x, y]) => `${x},${y}`).join(" "),
    class: "trend-line",
  }));

  for (const [index, item] of totals.entries()) {
    if (!item.amount) continue;
    const dot = svgElement("circle", { cx: xAt(index), cy: yAt(item.amount), r: 3.4, class: "trend-dot" });
    const title = svgElement("title");
    title.textContent = `${dayLabel(item.day)} · ${currency.format(item.amount)}`;
    dot.append(title);
    trendChart.append(dot);
  }

  const labelDays = [1, 5, 10, 15, 20, 25, days].filter((dayNumber, index, list) => dayNumber <= days && list.indexOf(dayNumber) === index);
  for (const dayNumber of labelDays) {
    const label = svgElement("text", { x: xAt(dayNumber - 1), y: height - 6, class: "trend-x-label", "text-anchor": "middle" });
    label.textContent = String(dayNumber);
    trendChart.append(label);
  }

  trendChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  trendChart.setAttribute("aria-label", `${monthShort(month)} daily spending: total ${currency.format(monthSpent)}, highest day ${currency.format(highest.amount)} on ${dayLabel(highest.day)}, ${daysWithSpending} days with spending.`);
  trendDesc.textContent = budget === null
    ? `Each point is one day's total for ${monthShort(month)}. Hover a point to see the exact amount. Set a monthly budget to compare each day with the daily allowance.`
    : `Each point is one day's total for ${monthShort(month)}. Hover a point to see the exact amount. The dashed line is the fixed daily budget of ${currency.format(dailyBudget)}.`;
}

function populateBudgetForm() {
  openingInput.value = settings.openingBalance ?? "";
  budgetInput.value = currentBudget() ?? "";
  document.querySelector("#budget-month-label").textContent = monthLabel(monthInput.value);
}

function setMetric(id, value, configured) {
  const element = document.querySelector(`#${id}`);
  element.textContent = configured ? currency.format(value) : "—";
  element.closest(".metric-card").classList.toggle("negative", configured && value < 0);
}

function showAmountResult() {
  const raw = amountInput.value.trim();
  const value = calculateAmount(raw);
  amountResult.textContent = !raw ? "Type a calculation or open the calculator."
    : value === null ? "Enter a valid positive calculation."
      : `= ${currency.format(value)}`;
  amountResult.classList.toggle("invalid", Boolean(raw) && value === null);
}

function renderChart(month) {
  const totals = categoryTotals(expenses, month);
  const maximum = Math.max(...totals.map(({ amount }) => amount), 0);
  const monthTotal = totals.reduce((sum, { amount }) => sum + amount, 0);
  chart.replaceChildren();
  document.querySelector("#chart-month").textContent = monthShort(month);
  if (!maximum) {
    const empty = document.createElement("li");
    empty.className = "chart-empty";
    const title = document.createElement("strong");
    title.textContent = "No spending recorded yet";
    const hint = document.createElement("span");
    hint.textContent = "Add an expense for this month to see the category breakdown.";
    empty.append(title, hint);
    chart.append(empty);
    return;
  }
  for (const { category, amount } of totals) {
    const item = document.createElement("li");
    item.className = "chart-item";
    const heading = document.createElement("div");
    heading.className = "chart-item-heading";
    const name = document.createElement("span");
    name.className = "chart-category";
    const icon = document.createElement("span");
    icon.className = "chart-icon";
    icon.textContent = CATEGORY_ICONS[category];
    icon.setAttribute("aria-hidden", "true");
    name.append(icon, document.createTextNode(category));
    const value = document.createElement("strong");
    value.className = "chart-value";
    value.textContent = currency.format(amount);
    if (amount > 0) {
      const share = document.createElement("span");
      share.className = "chart-share";
      share.textContent = `${Math.round(amount / monthTotal * 100)}%`;
      value.append(share);
    }
    heading.append(name, value);
    const track = document.createElement("div");
    track.className = "chart-track";
    const bar = document.createElement("span");
    bar.className = "chart-bar";
    bar.style.width = `${maximum ? amount / maximum * 100 : 0}%`;
    track.append(bar);
    item.append(heading, track);
    chart.append(item);
  }
}

function renderUsage(summary, budget) {
  if (budget === null) {
    usagePercent.textContent = "—";
    usageCaption.textContent = "Set a budget to see progress";
    usageBar.style.width = "0%";
    usageBudget.textContent = "—";
    usagePanel.classList.remove("warn", "over");
    usagePanel.querySelector(".usage-track").setAttribute("aria-label", "Monthly budget not set");
    return;
  }
  const percent = budget > 0 ? summary.monthlySpent / budget * 100 : 0;
  usagePercent.textContent = `${Math.round(percent)}%`;
  usageCaption.textContent = "of this month's budget used";
  usageBar.style.width = `${Math.min(percent, 100)}%`;
  usageBudget.textContent = currency.format(budget);
  usagePanel.classList.toggle("warn", percent >= 75 && percent < 100);
  usagePanel.classList.toggle("over", percent >= 100);
  usagePanel.querySelector(".usage-track").setAttribute(
    "aria-label",
    `${Math.round(percent)} percent of the monthly budget used, ${currency.format(summary.monthlySpent)} of ${currency.format(budget)}`,
  );
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
  renderUsage(summary, budget);
  document.querySelector("#daily-spent").textContent = budget === null
    ? "Set a monthly budget to see your daily allowance."
    : `${currency.format(summary.dailySpent)} spent on ${day} · daily budget stays fixed when you add expenses`;

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
    meta.className = "expense-meta";
    meta.textContent = `${expense.date}${expense.note ? ` · ${expense.note}` : ""}`;
    details.append(category, meta);
    const amount = document.createElement("strong");
    amount.className = "expense-amount";
    amount.textContent = currency.format(Number(expense.amount));
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "edit-button";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${expense.category} expense from ${expense.date}`);
    edit.addEventListener("click", () => beginEditing(expense));
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
    item.append(icon, details, amount, edit, button);
    list.append(item);
  }
  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = "Nothing recorded for this month";
    const hint = document.createElement("span");
    hint.textContent = "Add your first expense on the left, or pick another month to view.";
    empty.append(title, hint);
    list.append(empty);
  }
  document.querySelector("#entry-count").textContent = `${visible.length} ${visible.length === 1 ? "entry" : "entries"}`;
  renderChart(month);
  renderTrend(month);
}

function resetExpenseForm() {
  editingExpenseId = null;
  expenseForm.reset();
  expenseForm.elements.date.value = dayInput.value;
  expenseSubmit.innerHTML = "Save expense <span aria-hidden=\"true\">→</span>";
  cancelEdit.hidden = true;
  showAmountResult();
}

function beginEditing(expense) {
  editingExpenseId = expense.id;
  expenseForm.elements.amount.value = Number(expense.amount).toFixed(2);
  expenseForm.elements.date.value = expense.date;
  expenseForm.elements.category.value = expense.category;
  expenseForm.elements.note.value = expense.note;
  populateMonthOptions();
  monthInput.value = expense.date.slice(0, 7);
  dayInput.value = expense.date;
  populateBudgetForm();
  expenseSubmit.innerHTML = "Update expense <span aria-hidden=\"true\">→</span>";
  cancelEdit.hidden = false;
  expenseMessage.textContent = "Editing this expense. Save to replace the recorded details.";
  showAmountResult();
  expenseForm.elements.amount.focus();
  render();
}

calculatorToggle.addEventListener("click", () => {
  calculatorPad.hidden = !calculatorPad.hidden;
  calculatorToggle.setAttribute("aria-expanded", String(!calculatorPad.hidden));
  calculatorToggle.setAttribute("aria-label", calculatorPad.hidden ? "Open calculator" : "Close calculator");
  if (!calculatorPad.hidden) amountInput.focus();
});
calculatorPad.addEventListener("click", (event) => {
  const key = event.target.closest("button[data-key]")?.dataset.key;
  if (!key) return;
  if (key === "C") amountInput.value = "";
  else if (key === "⌫") amountInput.value = amountInput.value.slice(0, -1);
  else if (key === "=") {
    const value = calculateAmount(amountInput.value);
    if (value !== null) amountInput.value = value.toFixed(2);
  } else amountInput.value += key;
  showAmountResult();
  amountInput.focus();
});
amountInput.addEventListener("input", showAmountResult);

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(expenseForm));
  const result = editingExpenseId
    ? updateExpense(expenses, editingExpenseId, input)
    : addExpense(expenses, input, crypto.randomUUID());
  if (!result.valid) {
    expenseMessage.textContent = result.error;
    return;
  }
  expenses = result.expenses;
  localStorage.setItem(expenseKey, JSON.stringify(expenses));
  populateMonthOptions();
  monthInput.value = input.date.slice(0, 7);
  dayInput.value = input.date;
  populateBudgetForm();
  expenseMessage.textContent = editingExpenseId ? "Expense updated." : "Expense saved.";
  resetExpenseForm();
  render();
});

cancelEdit.addEventListener("click", () => {
  resetExpenseForm();
  expenseMessage.textContent = "Editing cancelled.";
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
    populateMonthOptions();
    monthInput.value = dayInput.value.slice(0, 7);
    populateBudgetForm();
  }
  render();
});

populateBudgetForm();
render();

