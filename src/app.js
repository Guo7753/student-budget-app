import { addExpense, updateExpense, removeExpense, budgetSummary, validateSettings, calculateAmount, categoryTotals, dailyTotals, balanceTrend, CATEGORIES, CATEGORY_ICONS } from "./budget.js";

const expenseKey = "student-budget-expenses-v1";
const settingsKey = "student-budget-settings-v1";
const expenseForm = document.querySelector("#expense-form");
const budgetForm = document.querySelector("#budget-form");
const list = document.querySelector("#expense-list");
const expenseMessage = document.querySelector("#expense-message");
const budgetMessage = document.querySelector("#budget-message");
const monthInput = document.querySelector("#month");
const dayInput = document.querySelector("#day");
const dateInput = document.querySelector("#date");
const openingInput = document.querySelector("#opening-balance");
const budgetInput = document.querySelector("#monthly-budget");
const amountInput = document.querySelector("#amount");
const amountResult = document.querySelector("#amount-result");
const calculatorPad = document.querySelector("#calculator-pad");
const calculatorToggle = document.querySelector("#calculator-toggle");
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
const metricDetail = document.querySelector("#metric-detail");
const calendarGridWrap = document.querySelector("#calendar-grid-wrap");
const calendarLegend = document.querySelector("#calendar-legend");
const calendarDayBox = document.querySelector("#calendar-day-box");
const pieChartWrap = document.querySelector("#pie-chart");
const pieLegend = document.querySelector("#pie-legend");
const pieMonth = document.querySelector("#pie-month");
const pieNote = document.querySelector("#pie-note");
const pageData = document.querySelector("#page-data");
const pageInsights = document.querySelector("#page-insights");
const monthButton = document.querySelector("#month-button");
const monthButtonLabel = document.querySelector("#month-button-label");
const monthPopover = document.querySelector("#month-popover");
const monthGrid = document.querySelector("#month-grid");
const monthYearLabel = document.querySelector("#month-popover-year");
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
dateInput.value = today;
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

function monthRange(centerMonth) {
  const [year, monthNumber] = centerMonth.split("-").map(Number);
  const months = [];
  for (let offset = -12; offset <= 6; offset += 1) {
    const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
    months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function populateMonthOptions() {
  const months = new Set(monthRange(today.slice(0, 7)));
  for (const expense of expenses) months.add(expense.date.slice(0, 7));
  for (const key of Object.keys(settings.monthlyBudgets || {})) months.add(key);
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
  monthInput.value = selected && months.has(selected) ? selected : today.slice(0, 7);
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let pickerYear = null;

function updateMonthButton() {
  monthButtonLabel.textContent = monthLabel(monthInput.value);
}

function ensureMonthOption(month) {
  if ([...monthInput.options].some((option) => option.value === month)) return;
  const option = document.createElement("option");
  option.value = month;
  option.textContent = monthLabel(month);
  monthInput.append(option);
  const sorted = [...monthInput.options].sort((a, b) => a.value.localeCompare(b.value));
  monthInput.replaceChildren(...sorted);
}

function renderMonthGrid() {
  monthYearLabel.textContent = String(pickerYear);
  monthGrid.replaceChildren();
  const current = monthInput.value;
  const monthsWithData = new Set([
    ...expenses.map((expense) => expense.date.slice(0, 7)),
    ...Object.keys(settings.monthlyBudgets || {}),
  ]);
  for (let index = 0; index < 12; index += 1) {
    const value = `${pickerYear}-${String(index + 1).padStart(2, "0")}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = MONTH_NAMES[index].slice(0, 3);
    button.title = `${MONTH_NAMES[index]} ${pickerYear}`;
    if (value === current) button.setAttribute("aria-current", "true");
    if (monthsWithData.has(value)) button.classList.add("has-data");
    button.addEventListener("click", () => chooseMonth(value));
    monthGrid.append(button);
  }
}

function openMonthPicker() {
  pickerYear = Number(monthInput.value.slice(0, 4)) || new Date().getFullYear();
  renderMonthGrid();
  monthPopover.hidden = false;
  monthButton.setAttribute("aria-expanded", "true");
}

function closeMonthPicker() {
  monthPopover.hidden = true;
  monthButton.setAttribute("aria-expanded", "false");
}

function chooseMonth(value) {
  ensureMonthOption(value);
  monthInput.value = value;
  monthInput.dispatchEvent(new Event("change", { bubbles: true }));
  updateMonthButton();
  closeMonthPicker();
}

monthButton.addEventListener("click", () => {
  if (monthPopover.hidden) openMonthPicker();
  else closeMonthPicker();
});
document.querySelector("#month-prev-year").addEventListener("click", () => {
  pickerYear -= 1;
  renderMonthGrid();
});
document.querySelector("#month-next-year").addEventListener("click", () => {
  pickerYear += 1;
  renderMonthGrid();
});
document.addEventListener("click", (event) => {
  if (monthPopover.hidden || event.target.closest(".month-picker")) return;
  closeMonthPicker();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !monthPopover.hidden) closeMonthPicker();
});

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

/* ---------- expandable card detail panels ---------- */

let openPanel = null;
let calendarDay = null;

const PANEL_CONFIG = {
  balance: { kicker: "Balance", title: () => `How the balance changed in ${monthLabel(monthInput.value)}` },
  remaining: { kicker: "Monthly remaining", title: () => `Budget pace for ${monthLabel(monthInput.value)}` },
  "daily-budget": { kicker: "Daily budget", title: () => "How the daily budget is calculated" },
  "daily-remaining": { kicker: "Daily remaining", title: () => `Spending on ${dayLabel(dayInput.value)}` },
};

function closePanels() {
  openPanel = null;
  metricDetail.hidden = true;
  metricDetail.replaceChildren();
  syncCardStates();
}

function syncCardStates() {
  for (const card of document.querySelectorAll("[data-panel]")) {
    const active = card.dataset.panel === openPanel;
    card.setAttribute("aria-expanded", String(active));
    card.classList.toggle("is-open", active);
  }
}

function togglePanel(key) {
  if (openPanel === key) {
    closePanels();
    return;
  }
  openPanel = key;
  renderOpenPanel();
}

function renderOpenPanel() {
  syncCardStates();
  if (!openPanel) return;
  const config = PANEL_CONFIG[openPanel];
  if (!config) return;
  const section = document.createElement("section");
  section.className = "detail-card";

  const header = document.createElement("header");
  header.className = "detail-head";
  const heading = document.createElement("div");
  const kicker = document.createElement("p");
  kicker.className = "section-kicker";
  kicker.textContent = config.kicker;
  const title = document.createElement("h3");
  title.textContent = config.title();
  heading.append(kicker, title);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "detail-close";
  close.setAttribute("aria-label", "Close details");
  close.textContent = "×";
  close.addEventListener("click", () => closePanels());
  header.append(heading, close);

  const body = document.createElement("div");
  body.className = "detail-body";
  buildPanelBody(openPanel, body);

  section.append(header, body);
  metricDetail.replaceChildren(section);
  metricDetail.hidden = false;
}

function statTile(label, value, tone) {
  const tile = document.createElement("div");
  tile.className = "detail-stat";
  if (tone) tile.classList.add(`is-${tone}`);
  const caption = document.createElement("span");
  caption.textContent = label;
  const figure = document.createElement("strong");
  figure.textContent = value;
  tile.append(caption, figure);
  return tile;
}

function statRow(tiles) {
  const row = document.createElement("div");
  row.className = "detail-stats";
  row.append(...tiles);
  return row;
}

function expenseItem(expense) {
  const item = document.createElement("li");
  item.className = "detail-expense";
  const icon = document.createElement("span");
  icon.className = "detail-expense-icon";
  icon.textContent = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;
  icon.setAttribute("aria-hidden", "true");
  const details = document.createElement("span");
  details.className = "detail-expense-details";
  const name = document.createElement("strong");
  name.textContent = expense.category;
  const note = document.createElement("span");
  note.textContent = expense.note || "No note";
  details.append(name, note);
  const amount = document.createElement("strong");
  amount.className = "detail-expense-amount";
  amount.textContent = currency.format(Number(expense.amount));
  item.append(icon, details, amount);
  return item;
}

function expenseListFor(day) {
  const list = expenses
    .filter((expense) => expense.date === day)
    .sort((a, b) => Number(b.amount) - Number(a.amount));
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "detail-empty-inline";
    empty.textContent = "No expenses recorded on this day.";
    return empty;
  }
  const ul = document.createElement("ul");
  ul.className = "detail-expense-list";
  ul.append(...list.map(expenseItem));
  return ul;
}

function shortMoney(value) {
  const rounded = Math.round(Number(value) * 100) / 100;
  return `$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

function lineChart(points, options = {}) {
  const width = 720;
  const height = options.height ?? 200;
  const padding = { top: 14, right: 16, bottom: 24, left: 56 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const svg = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    class: "detail-chart",
    role: "img",
    "aria-label": options.label || "chart",
  });
  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  const step = niceCeiling((rawMax - rawMin || 1) / 4);
  const minBound = Math.floor(rawMin / step) * step;
  const maxBound = Math.max(Math.ceil(rawMax / step) * step, minBound + step);
  const xAt = (index) => padding.left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const yAt = (value) => padding.top + plotHeight - ((value - minBound) / (maxBound - minBound)) * plotHeight;

  for (let value = minBound; value <= maxBound + 0.001; value += step) {
    const lineY = yAt(value);
    svg.append(svgElement("line", {
      x1: padding.left, x2: width - padding.right, y1: lineY, y2: lineY,
      class: Math.abs(value) < 0.001 ? "trend-axis-line" : "trend-grid",
    }));
    const label = svgElement("text", { x: padding.left - 8, y: lineY + 3.5, class: "trend-y-label", "text-anchor": "end" });
    label.textContent = shortMoney(value);
    svg.append(label);
  }

  const coordinates = points.map((point, index) => [xAt(index), yAt(point.value)]);
  if (options.area) {
    svg.append(svgElement("path", {
      d: `M ${coordinates[0][0]},${yAt(Math.max(minBound, 0))} L ${coordinates.map(([x, y]) => `${x},${y}`).join(" L ")} L ${coordinates[coordinates.length - 1][0]},${yAt(Math.max(minBound, 0))} Z`,
      class: options.tone === "warm" ? "trend-area is-warm" : "trend-area",
    }));
  }
  svg.append(svgElement("polyline", {
    points: coordinates.map(([x, y]) => `${x},${y}`).join(" "),
    class: options.tone === "warm" ? "trend-line is-warm" : "trend-line",
  }));
  points.forEach((point, index) => {
    const dot = svgElement("circle", {
      cx: coordinates[index][0], cy: coordinates[index][1], r: 3, class: "trend-dot",
    });
    const title = svgElement("title");
    title.textContent = `${point.label} · ${currency.format(point.value)}`;
    dot.append(title);
    svg.append(dot);
  });
  const stepLabel = Math.max(1, Math.round(points.length / 6));
  points.forEach((point, index) => {
    if (index % stepLabel !== 0 && index !== points.length - 1) return;
    const label = svgElement("text", {
      x: coordinates[index][0], y: height - 6, class: "trend-x-label", "text-anchor": "middle",
    });
    label.textContent = String(Number(point.label.slice(8, 10)) || point.label);
    svg.append(label);
  });
  return svg;
}

function buildPanelBody(key, body) {
  const month = monthInput.value;
  const budget = currentBudget();
  const summary = budgetSummary(expenses, settings.openingBalance ?? 0, budget ?? 0, month, dayInput.value);
  const totals = dailyTotals(expenses, month);
  const daysInView = totals.length;
  const isCurrentMonth = month === today.slice(0, 7);
  const elapsedDays = isCurrentMonth ? Math.min(Number(today.slice(8, 10)), daysInView) : daysInView;

  if (key === "balance") {
    if (settings.openingBalance === null) {
      buildPrompt(body, "Set a starting balance to see how it changes day by day.");
      return;
    }
    const series = balanceTrend(expenses, settings.openingBalance, month);
    const lowest = series.reduce((low, point) => (point.balance < low.balance ? point : low), series[0] ?? { balance: 0, day: month });
    body.append(statRow([
      statTile("Starting balance", currency.format(settings.openingBalance)),
      statTile("Balance now", currency.format(summary.balance), summary.balance < 0 ? "danger" : null),
      statTile("Lowest point", `${currency.format(lowest.balance)} · ${dayLabel(lowest.day)}`, lowest.balance < 0 ? "danger" : null),
      statTile("Spent this month", currency.format(summary.monthlySpent)),
    ]));
    body.append(lineChart(series.map((point) => ({ label: point.day, value: point.balance })), {
      label: `Balance for each day of ${monthLabel(month)}`,
      area: true,
      tone: "warm",
    }));
    body.append(noteLine("Each point is the balance at the end of that day: starting balance minus every recorded expense up to that date."));
    return;
  }

  if (key === "remaining") {
    if (budget === null) {
      buildPrompt(body, "Set a monthly budget for this month to see the budget pace.");
      return;
    }
    const average = elapsedDays ? summary.monthlySpent / elapsedDays : 0;
    const projected = average * daysInView;
    const difference = budget - projected;
    const daysLeft = Math.max(daysInView - elapsedDays, 0);
    body.append(statRow([
      statTile("Budget", currency.format(budget)),
      statTile("Spent so far", currency.format(summary.monthlySpent)),
      statTile("Average per day", currency.format(average)),
      statTile("Projected total", currency.format(projected)),
    ]));
    const pace = document.createElement("div");
    pace.className = "pace";
    const track = document.createElement("div");
    track.className = "pace-track";
    const bar = document.createElement("span");
    bar.className = "pace-bar";
    bar.style.width = `${Math.min(budget > 0 ? summary.monthlySpent / budget * 100 : 0, 100)}%`;
    track.append(bar);
    const caption = document.createElement("p");
    caption.className = "pace-caption";
    caption.textContent = `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in ${monthLabel(month)}.`;
    pace.append(track, caption);
    body.append(pace);
    body.append(statRow([
      statTile("Projection", difference >= 0 ? `Under by ${currency.format(difference)}` : `Over by ${currency.format(Math.abs(difference))}`, difference >= 0 ? "safe" : "danger"),
      statTile("Remaining budget", currency.format(summary.monthlyRemaining), summary.monthlyRemaining < 0 ? "danger" : null),
    ]));
    body.append(noteLine(difference >= 0
      ? "At the current daily average, the month would end below the budget. This is a projection, not a guarantee."
      : "At the current daily average, the month would end above the budget. Reduce daily spending or adjust the budget."));
    return;
  }

  if (key === "daily-budget") {
    if (budget === null) {
      buildPrompt(body, "Set a monthly budget for this month to see how the daily budget is calculated.");
      return;
    }
    const formula = document.createElement("div");
    formula.className = "formula";
    const line = document.createElement("p");
    line.className = "formula-line";
    line.textContent = `${currency.format(budget)} ÷ ${daysInView} days = ${currency.format(summary.dailyBudget)} per day`;
    const rule = document.createElement("p");
    rule.className = "formula-rule";
    rule.textContent = "Adding, editing, or deleting an expense changes what remains, never this figure.";
    formula.append(line, rule);
    body.append(formula);
    body.append(statRow([
      statTile("Monthly budget", currency.format(budget)),
      statTile("Days in month", String(daysInView)),
      statTile("Daily budget", currency.format(summary.dailyBudget)),
      statTile("Spent on selected day", currency.format(summary.dailySpent)),
    ]));
    body.append(statRow([
      statTile("Remaining today", currency.format(summary.dailyRemaining), summary.dailyRemaining < 0 ? "danger" : "safe"),
      statTile("Remaining this month", currency.format(summary.monthlyRemaining), summary.monthlyRemaining < 0 ? "danger" : null),
    ]));
    return;
  }

  if (key === "daily-remaining") {
    const day = dayInput.value;
    const dayTotal = summary.dailySpent;
    body.append(statRow([
      statTile(`Spent on ${dayLabel(day)}`, currency.format(dayTotal)),
      statTile("Daily budget", budget === null ? "—" : currency.format(summary.dailyBudget)),
      statTile("Remaining that day", budget === null ? "—" : currency.format(summary.dailyRemaining), budget !== null && summary.dailyRemaining < 0 ? "danger" : "safe"),
    ]));
    body.append(expenseListFor(day));
    if (budget !== null && summary.dailyRemaining < 0) {
      body.append(noteLine(`This day is over the daily budget by ${currency.format(Math.abs(summary.dailyRemaining))}. The daily budget itself is unchanged.`));
    }
    return;
  }
}

function buildPrompt(body, message) {
  const prompt = document.createElement("p");
  prompt.className = "detail-prompt";
  prompt.textContent = message;
  body.append(prompt);
}

function noteLine(message) {
  const note = document.createElement("p");
  note.className = "detail-note";
  note.textContent = message;
  return note;
}

function buildCalendar(month, totals, dailyBudget) {
  const wrapper = document.createElement("div");
  wrapper.className = "calendar";
  const weekdays = document.createElement("div");
  weekdays.className = "calendar-weekdays";
  for (const name of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    const cell = document.createElement("span");
    cell.textContent = name;
    weekdays.append(cell);
  }
  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  const firstWeekday = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const leading = (firstWeekday + 6) % 7;
  for (let index = 0; index < leading; index += 1) {
    const filler = document.createElement("span");
    filler.className = "cal-day is-blank";
    filler.setAttribute("aria-hidden", "true");
    grid.append(filler);
  }
  for (const item of totals) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cal-day";
    cell.dataset.day = item.day;
    const dayNumber = document.createElement("span");
    dayNumber.className = "cal-day-number";
    dayNumber.textContent = String(Number(item.day.slice(8, 10)));
    cell.append(dayNumber);
    if (item.amount > 0) {
      const amount = document.createElement("span");
      amount.className = "cal-day-amount";
      amount.textContent = shortMoney(item.amount);
      cell.append(amount);
    }
    if (item.amount <= 0) cell.classList.add("is-none");
    else if (dailyBudget !== null && item.amount > dailyBudget) {
      cell.classList.add("is-over");
      if (dailyBudget > 0 && item.amount > dailyBudget * 2) cell.classList.add("is-over-heavy");
      const flag = document.createElement("span");
      flag.className = "cal-flag";
      flag.setAttribute("aria-hidden", "true");
      flag.textContent = "!";
      cell.append(flag);
    } else if (dailyBudget !== null) cell.classList.add("is-safe");
    if (item.day === today) cell.classList.add("is-today");
    if (item.day === calendarDay) cell.classList.add("is-selected");
    const label = `${dayLabel(item.day)}: ${currency.format(item.amount)}${dailyBudget !== null && item.amount > dailyBudget ? ", over the daily budget" : ""}`;
    cell.setAttribute("aria-label", label);
    grid.append(cell);
  }
  wrapper.append(weekdays, grid);
  return wrapper;
}

function buildCalendarLegend(hasBudget) {
  const legend = document.createElement("div");
  legend.className = "calendar-legend";
  const entries = hasBudget
    ? [["is-safe", "Within daily budget"], ["is-over", "Over daily budget"], ["is-none", "No spending"]]
    : [["is-none", "No spending"]];
  for (const [className, label] of entries) {
    const item = document.createElement("span");
    item.className = `legend-item ${className}`;
    const swatch = document.createElement("i");
    const text = document.createElement("span");
    text.textContent = label;
    item.append(swatch, text);
    legend.append(item);
  }
  return legend;
}

for (const card of document.querySelectorAll(".metric-card")) {
  card.addEventListener("click", () => togglePanel(card.dataset.panel));
}

calendarGridWrap.addEventListener("click", (event) => {
  const cell = event.target.closest(".cal-day[data-day]");
  if (!cell) return;
  calendarDay = calendarDay === cell.dataset.day ? null : cell.dataset.day;
  renderCalendarBlock();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && openPanel) closePanels();
});

/* ---------- insights: calendar and category share ---------- */

function renderCalendarBlock() {
  const month = monthInput.value;
  const totals = dailyTotals(expenses, month);
  const budget = currentBudget();
  const summary = budgetSummary(expenses, settings.openingBalance ?? 0, budget ?? 0, month, dayInput.value);
  const dailyBudget = budget === null ? null : summary.dailyBudget;
  calendarGridWrap.replaceChildren();
  calendarLegend.replaceChildren(...buildCalendarLegend(budget !== null).children);
  if (!totals.length) {
    const empty = document.createElement("p");
    empty.className = "detail-prompt";
    empty.textContent = "Choose a month to see the daily calendar.";
    calendarGridWrap.append(empty);
    calendarDayBox.replaceChildren();
    return;
  }
  calendarGridWrap.append(buildCalendar(month, totals, dailyBudget));
  calendarDayBox.replaceChildren();
  if (calendarDay) {
    const heading = document.createElement("h4");
    const dayTotal = totals.find((item) => item.day === calendarDay)?.amount ?? 0;
    heading.textContent = `${dayLabel(calendarDay)} · ${currency.format(dayTotal)}${dailyBudget !== null ? ` · daily budget ${currency.format(dailyBudget)}` : ""}`;
    calendarDayBox.append(heading, expenseListFor(calendarDay));
  }
}

const PIE_COLORS = ["#0f9c91", "#2f7ec4", "#7c5cf0", "#c2549e", "#e07a3f", "#b45309", "#e0483f", "#d4a516", "#5aa84a", "#7a8a86"];

function renderPie(month) {
  const totals = categoryTotals(expenses, month).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const total = totals.reduce((sum, item) => sum + item.amount, 0);
  pieMonth.textContent = monthShort(month);
  pieChartWrap.replaceChildren();
  pieLegend.replaceChildren();
  if (!total) {
    const empty = document.createElement("p");
    empty.className = "detail-prompt";
    empty.textContent = "No spending recorded for this month yet. Add an expense to see the category share.";
    pieChartWrap.append(empty);
    pieNote.textContent = "";
    return;
  }
  const size = 240;
  const radius = 84;
  const stroke = 30;
  const circumference = 2 * Math.PI * radius;
  const svg = svgElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    class: "pie-chart",
    role: "img",
    "aria-label": `Category share for ${monthLabel(month)}: ${totals.map((item) => `${item.category} ${Math.round(item.amount / total * 100)} percent`).join(", ")}`,
  });
  const background = svgElement("circle", {
    cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "#eef3f1", "stroke-width": stroke,
  });
  svg.append(background);
  let offset = 0;
  totals.forEach((item, index) => {
    const share = item.amount / total;
    const segment = svgElement("circle", {
      cx: size / 2, cy: size / 2, r: radius,
      fill: "none",
      stroke: PIE_COLORS[index % PIE_COLORS.length],
      "stroke-width": stroke,
      "stroke-dasharray": `${share * circumference} ${circumference - share * circumference}`,
      "stroke-dashoffset": -offset * circumference,
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
      "stroke-linecap": "butt",
    });
    const title = svgElement("title");
    title.textContent = `${item.category}: ${currency.format(item.amount)} (${Math.round(share * 100)}%)`;
    segment.append(title);
    svg.append(segment);
    offset += share;
  });
  const centreValue = svgElement("text", { x: size / 2, y: size / 2 - 4, class: "pie-centre-value", "text-anchor": "middle" });
  centreValue.textContent = shortMoney(total);
  const centreLabel = svgElement("text", { x: size / 2, y: size / 2 + 18, class: "pie-centre-label", "text-anchor": "middle" });
  centreLabel.textContent = "this month";
  svg.append(centreValue, centreLabel);
  pieChartWrap.append(svg);

  totals.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "pie-row";
    const swatch = document.createElement("i");
    swatch.style.background = PIE_COLORS[index % PIE_COLORS.length];
    swatch.setAttribute("aria-hidden", "true");
    const icon = document.createElement("span");
    icon.className = "pie-icon";
    icon.textContent = CATEGORY_ICONS[item.category] ?? "";
    icon.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "pie-name";
    name.textContent = item.category;
    const amount = document.createElement("strong");
    amount.className = "pie-amount";
    amount.textContent = currency.format(item.amount);
    const share = document.createElement("span");
    share.className = "pie-share";
    share.textContent = `${Math.round(item.amount / total * 100)}%`;
    row.append(swatch, icon, name, amount, share);
    pieLegend.append(row);
  });
  pieNote.textContent = `Total spent in ${monthLabel(month)}: ${currency.format(total)}. Shares are based on recorded expenses only.`;
}

/* ---------- page tabs ---------- */

const tabs = [...document.querySelectorAll(".tab")];

function showPage(page) {
  const isInsights = page === "insights";
  pageData.hidden = isInsights;
  pageInsights.hidden = !isInsights;
  for (const tab of tabs) tab.setAttribute("aria-selected", String(tab.dataset.page === page));
  if (isInsights) {
    renderTrend(monthInput.value);
    renderCalendarBlock();
    renderPie(monthInput.value);
  } else if (openPanel) {
    renderOpenPanel();
  }
}

for (const tab of tabs) {
  tab.addEventListener("click", () => showPage(tab.dataset.page));
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
  updateMonthButton();
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
  renderTrend(month);
  renderCalendarBlock();
  renderPie(month);
  if (openPanel) renderOpenPanel();
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
  if (editingExpenseId === null) dateInput.value = dayInput.value;
  populateBudgetForm();
  render();
});
dayInput.addEventListener("change", () => {
  if (dayInput.value.slice(0, 7) !== monthInput.value) {
    populateMonthOptions();
    monthInput.value = dayInput.value.slice(0, 7);
    populateBudgetForm();
  }
  if (editingExpenseId === null) dateInput.value = dayInput.value;
  render();
});
dateInput.addEventListener("change", () => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput.value)) return;
  populateMonthOptions();
  monthInput.value = dateInput.value.slice(0, 7);
  dayInput.value = dateInput.value;
  populateBudgetForm();
  render();
});

populateBudgetForm();
render();

