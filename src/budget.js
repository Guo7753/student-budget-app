export const CATEGORIES = [
  "Food", "Groceries", "Transport", "Study", "Housing", "Bills",
  "Health", "Shopping", "Entertainment", "Other",
];

export const CATEGORY_ICONS = {
  Food: "🍜", Groceries: "🛒", Transport: "🚌", Study: "📚", Housing: "🏠",
  Bills: "🧾", Health: "💊", Shopping: "🛍️", Entertainment: "🎬", Other: "✨",
};

const cents = (amount) => Math.round(Number(amount) * 100);

export function calculateAmount(expression) {
  const source = String(expression ?? "").replace(/[×xX]/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
  if (!source || !/^[\d.+\-*/()]+$/.test(source)) return null;
  let position = 0;
  function number() {
    if (source[position] === "(") {
      position++;
      const value = sum();
      if (source[position++] !== ")") throw Error("Missing closing bracket");
      return value;
    }
    const match = /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})/.exec(source.slice(position));
    if (!match) throw Error("Expected number");
    position += match[0].length;
    return Number(match[0]);
  }
  function product() {
    let value = number();
    while (source[position] === "*" || source[position] === "/") {
      const operator = source[position++];
      const right = number();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }
  function sum() {
    let value = product();
    while (source[position] === "+" || source[position] === "-") {
      const operator = source[position++];
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }
  try {
    const value = sum();
    if (position !== source.length || !Number.isFinite(value) || value <= 0 || value > 100000000) return null;
    return Math.round(value * 100) / 100;
  } catch {
    return null;
  }
}

export function categoryTotals(expenses, month) {
  const totals = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  for (const expense of expenses) {
    if (expense.date.startsWith(month) && Object.hasOwn(totals, expense.category)) {
      totals[expense.category] += cents(expense.amount);
    }
  }
  return CATEGORIES.map((category) => ({ category, amount: totals[category] / 100 }));
}

export function validateSettings(input) {
  for (const [field, label] of [["openingBalance", "Starting balance"], ["monthlyBudget", "Monthly budget"]]) {
    const raw = String(input[field] ?? "").trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || Number(raw) > 100000000) {
      return { valid: false, error: `${label} must be a non-negative amount with at most two decimals.` };
    }
  }
  return {
    valid: true,
    value: {
      openingBalance: Number(input.openingBalance),
      monthlyBudget: Number(input.monthlyBudget),
    },
  };
}

export function daysInMonth(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return 0;
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

export function budgetSummary(expenses, openingBalance, monthlyBudget, month, day) {
  const monthCents = expenses.filter((expense) => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + cents(expense.amount), 0);
  const dayCents = expenses.filter((expense) => expense.date === day)
    .reduce((sum, expense) => sum + cents(expense.amount), 0);
  const allCents = expenses.reduce((sum, expense) => sum + cents(expense.amount), 0);
  const days = daysInMonth(month);
  const dailyBudgetCents = days ? Math.round(cents(monthlyBudget) / days) : 0;
  return {
    balance: (cents(openingBalance) - allCents) / 100,
    monthlySpent: monthCents / 100,
    monthlyRemaining: (cents(monthlyBudget) - monthCents) / 100,
    dailyBudget: dailyBudgetCents / 100,
    dailySpent: dayCents / 100,
    dailyRemaining: (dailyBudgetCents - dayCents) / 100,
  };
}

export function validateExpense(input) {
  const amount = calculateAmount(input.amount);
  if (amount === null) {
    return { valid: false, error: "Enter a positive amount or a valid calculation, such as 12+3." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || "") ||
      Number.isNaN(Date.parse(`${input.date}T00:00:00`)) ||
      new Date(`${input.date}T00:00:00Z`).toISOString().slice(0, 10) !== input.date) {
    return { valid: false, error: "Choose a valid date." };
  }
  if (!CATEGORIES.includes(input.category)) {
    return { valid: false, error: "Choose a category." };
  }
  const note = String(input.note || "").trim();
  if (note.length > 100) {
    return { valid: false, error: "Note must be 100 characters or fewer." };
  }
  return { valid: true, value: { amount: Math.round(amount * 100) / 100,
    date: input.date, category: input.category, note } };
}

export function addExpense(expenses, input, id) {
  const result = validateExpense(input);
  if (!result.valid) return result;
  return { valid: true, expenses: [...expenses, { id, ...result.value }] };
}

export function removeExpense(expenses, id) {
  return expenses.filter((expense) => expense.id !== id);
}

export function totalForMonth(expenses, month) {
  return expenses.filter((expense) => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + cents(expense.amount), 0) / 100;
}

