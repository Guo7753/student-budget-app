export const CATEGORIES = [
  "Food", "Groceries", "Transport", "Study", "Housing", "Bills",
  "Health", "Shopping", "Entertainment", "Other",
];

export const CATEGORY_ICONS = {
  Food: "🍜", Groceries: "🛒", Transport: "🚌", Study: "📚", Housing: "🏠",
  Bills: "🧾", Health: "💊", Shopping: "🛍️", Entertainment: "🎬", Other: "✨",
};

const cents = (amount) => Math.round(Number(amount) * 100);

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
  const rawAmount = String(input.amount ?? "").trim();
  const amount = Number(rawAmount);
  if (!/^\d+(?:\.\d{1,2})?$/.test(rawAmount) || amount <= 0 || amount > 100000000) {
    return { valid: false, error: "Amount must be above zero with at most two decimals." };
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

