import { addExpense, removeExpense, totalForMonth, CATEGORIES } from "./budget.js";

const key = "student-budget-expenses-v1";
const form = document.querySelector("#expense-form");
const list = document.querySelector("#expense-list");
const message = document.querySelector("#message");
const total = document.querySelector("#total");
const monthInput = document.querySelector("#month");
let expenses;
try {
  const stored = JSON.parse(localStorage.getItem(key) || "[]");
  expenses = Array.isArray(stored) ? stored : [];
} catch {
  expenses = [];
  message.textContent = "Saved data could not be read. A new list has been started.";
}

document.querySelector("#date").valueAsDate = new Date();
monthInput.value = new Date().toISOString().slice(0, 7);
const categoryInput = document.querySelector("#category");
for (const category of CATEGORIES) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categoryInput.append(option);
}

function saveAndRender() {
  localStorage.setItem(key, JSON.stringify(expenses));
  render();
}

function render() {
  list.replaceChildren();
  const month = monthInput.value;
  const visible = expenses.filter((expense) => expense.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const expense of visible) {
    const item = document.createElement("li");
    const description = document.createElement("span");
    description.textContent = `${expense.date} · ${expense.category} · $${expense.amount.toFixed(2)}${expense.note ? ` · ${expense.note}` : ""}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Delete";
    button.setAttribute("aria-label", `Delete expense from ${expense.date}`);
    button.addEventListener("click", () => {
      expenses = removeExpense(expenses, expense.id);
      saveAndRender();
    });
    item.append(description, button);
    list.append(item);
  }
  if (!visible.length) {
    const empty = document.createElement("li");
    empty.textContent = "No expenses for this month.";
    list.append(empty);
  }
  total.textContent = `$${totalForMonth(expenses, month).toFixed(2)}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  const result = addExpense(expenses, input, crypto.randomUUID());
  if (!result.valid) {
    message.textContent = result.error;
    return;
  }
  expenses = result.expenses;
  message.textContent = "Expense saved.";
  saveAndRender();
  form.elements.amount.value = "";
  form.elements.note.value = "";
});
monthInput.addEventListener("change", render);
render();

