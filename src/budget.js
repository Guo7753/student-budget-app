export const CATEGORIES = ["Food", "Transport", "Study", "Housing", "Other"];

export function validateExpense(input) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero." };
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
  return Math.round(expenses.filter((expense) => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + Math.round(expense.amount * 100), 0)) / 100;
}

