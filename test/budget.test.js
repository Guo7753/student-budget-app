import test from "node:test";
import assert from "node:assert/strict";
import {
  addExpense, updateExpense, removeExpense, totalForMonth, validateExpense,
  validateSettings, daysInMonth, budgetSummary, calculateAmount, categoryTotals, dailyTotals, balanceTrend,
  validatePreset, addPreset, removePreset, incomeTotals,
  CATEGORIES, CATEGORY_ICONS, INCOME_CATEGORIES,
} from "../src/budget.js";

const sample = { amount: "12.50", date: "2026-11-06", category: "Food", note: "Lunch" };

test("accepts and stores a valid expense", () => {
  const result = addExpense([], sample, "e1");
  assert.equal(result.valid, true);
  assert.deepEqual(result.expenses[0], { id: "e1", amount: 12.5, date: "2026-11-06", category: "Food", note: "Lunch" });
});

test("rejects zero or negative amount", () => {
  assert.equal(validateExpense({ ...sample, amount: "0" }).valid, false);
  assert.equal(validateExpense({ ...sample, amount: "-3" }).valid, false);
  assert.equal(validateExpense({ ...sample, amount: "1.234" }).valid, false);
});

test("calculator handles everyday arithmetic and stores its result", () => {
  assert.equal(calculateAmount("12+3"), 15);
  assert.equal(calculateAmount("12+3×2"), 18);
  assert.equal(calculateAmount("(12+3)÷2"), 7.5);
  assert.equal(calculateAmount("10−3"), 7);
  assert.equal(addExpense([], { ...sample, amount: "12+3" }, "e2").expenses[0].amount, 15);
});

test("calculator rejects malformed and unsafe amounts", () => {
  for (const amount of ["12+", "1/0", "3-5", "1.234", "2**3", "alert(1)", "100000001"]) {
    assert.equal(calculateAmount(amount), null, amount);
    assert.equal(validateExpense({ ...sample, amount }).valid, false, amount);
  }
});

test("rejects a calendar date that does not exist", () => {
  assert.equal(validateExpense({ ...sample, date: "2026-02-31" }).valid, false);
});

test("deleting an expense removes it", () => {
  const expenses = [{ id: "e1", ...sample }, { id: "e2", ...sample }];
  assert.deepEqual(removeExpense(expenses, "e1").map((x) => x.id), ["e2"]);
});

test("editing an expense preserves its id and recalculates its amount", () => {
  const original = [{ id: "e1", ...sample }];
  const result = updateExpense(original, "e1", { ...sample, amount: "12+3", category: "Transport", note: "Bus" });
  assert.equal(result.valid, true);
  assert.deepEqual(result.expenses, [{ id: "e1", amount: 15, date: "2026-11-06", category: "Transport", note: "Bus" }]);
  assert.equal(totalForMonth(result.expenses, "2026-11"), 15);
});

test("editing rejects invalid data and an unknown expense id", () => {
  const original = [{ id: "e1", ...sample }];
  assert.equal(updateExpense(original, "e1", { ...sample, amount: "-3" }).valid, false);
  assert.equal(updateExpense(original, "missing", sample).valid, false);
  assert.deepEqual(original, [{ id: "e1", ...sample }]);
});

test("monthly total excludes other months", () => {
  const expenses = [{ ...sample, amount: 12.5 }, { ...sample, date: "2026-10-01", amount: 99 }, { ...sample, amount: 2.25 }];
  assert.equal(totalForMonth(expenses, "2026-11"), 14.75);
});

test("expanded categories have an icon", () => {
  assert.ok(CATEGORIES.includes("Groceries"));
  assert.ok(CATEGORIES.includes("Health"));
  assert.ok(CATEGORIES.every((category) => CATEGORY_ICONS[category]));
});

test("chart uses exactly the expense categories and selected month", () => {
  const expenses = [
    { ...sample, amount: 12, category: "Food" },
    { ...sample, amount: 3, category: "Food" },
    { ...sample, amount: 8, category: "Transport" },
    { ...sample, amount: 99, category: "Study", date: "2026-10-02" },
  ];
  const totals = categoryTotals(expenses, "2026-11");
  assert.deepEqual(totals.map(({ category }) => category), CATEGORIES);
  assert.equal(totals.find(({ category }) => category === "Food").amount, 15);
  assert.equal(totals.find(({ category }) => category === "Transport").amount, 8);
  assert.equal(totals.find(({ category }) => category === "Study").amount, 0);
  assert.equal(totals.reduce((sum, { amount }) => sum + amount, 0), totalForMonth(expenses, "2026-11"));
  assert.ok(categoryTotals(expenses, "2026-09").every(({ amount }) => amount === 0));
});

test("budget settings reject invalid money values", () => {
  assert.equal(validateSettings({ openingBalance: "1000", monthlyBudget: "300.50" }).valid, true);
  assert.equal(validateSettings({ openingBalance: "-1", monthlyBudget: "300" }).valid, false);
  assert.equal(validateSettings({ openingBalance: "1000", monthlyBudget: "3.456" }).valid, false);
});

test("daily budget uses calendar days including leap years", () => {
  assert.equal(daysInMonth("2026-11"), 30);
  assert.equal(daysInMonth("2028-02"), 29);
  assert.equal(daysInMonth("2027-02"), 28);
});

test("adding an expense changes remaining amounts, not the daily budget", () => {
  const existing = [{ id: "a", amount: 5, date: "2026-11-11", category: "Food" }];
  const before = budgetSummary(existing, 1000, 300, "2026-11", "2026-11-10");
  const after = budgetSummary([...existing, { id: "b", amount: 12.5, date: "2026-11-10", category: "Transport" }], 1000, 300, "2026-11", "2026-11-10");
  assert.equal(before.dailyBudget, 10);
  assert.equal(after.dailyBudget, 10);
  assert.equal(before.dailyRemaining, 10);
  assert.equal(after.dailyRemaining, -2.5);
  assert.equal(after.monthlyRemaining, 282.5);
  assert.equal(after.balance, 982.5);
});

test("daily totals add up each calendar day of the month", () => {
  const expenses = [
    { id: "a", amount: 10, date: "2026-11-02", category: "Food" },
    { id: "b", amount: 2.5, date: "2026-11-02", category: "Food" },
    { id: "c", amount: 5, date: "2026-11-05", category: "Study" },
  ];
  const totals = dailyTotals(expenses, "2026-11");
  assert.equal(totals.length, 30);
  assert.equal(totals[0].amount, 0);
  assert.equal(totals[1].amount, 12.5);
  assert.equal(totals[4].amount, 5);
  assert.equal(totals.reduce((sum, item) => sum + item.amount, 0), 17.5);
});

test("daily totals ignore other months and respect month length", () => {
  const expenses = [{ id: "a", amount: 10, date: "2026-10-02", category: "Food" }];
  const february = dailyTotals(expenses, "2026-02");
  assert.equal(february.length, 28);
  assert.equal(february.reduce((sum, item) => sum + item.amount, 0), 0);
  assert.deepEqual(dailyTotals(expenses, "not-a-month"), []);
});

test("balance trend subtracts spending day by day from the opening balance", () => {
  const expenses = [
    { id: "a", amount: 100, date: "2026-10-15", category: "Food" },
    { id: "b", amount: 20, date: "2026-11-02", category: "Food" },
    { id: "c", amount: 30, date: "2026-11-10", category: "Study" },
  ];
  const series = balanceTrend(expenses, 500, "2026-11");
  assert.equal(series.length, 30);
  assert.equal(series[0].balance, 400);
  assert.equal(series[1].balance, 380);
  assert.equal(series[9].balance, 350);
  assert.equal(series[29].balance, 350);
  assert.deepEqual(balanceTrend(expenses, 500, "not-a-month"), []);
});

test("quick add presets validate the amount, category and name", () => {
  const valid = validatePreset({ amount: "12+3.5", category: "Food", note: "Lunch set" });
  assert.equal(valid.valid, true);
  assert.equal(valid.value.amount, 15.5);
  assert.equal(valid.value.label, "Lunch set");
  assert.equal(validatePreset({ amount: "0", category: "Food" }).valid, false);
  assert.equal(validatePreset({ amount: "10", category: "Nope" }).valid, false);
  assert.equal(validatePreset({ amount: "10", category: "Food", label: "x".repeat(41) }).valid, false);
});

test("quick add presets can be added and removed", () => {
  const created = addPreset([], { amount: "4.5", category: "Food", note: "Coffee" }, "p1");
  assert.equal(created.valid, true);
  assert.equal(created.presets.length, 1);
  assert.deepEqual(created.presets[0], { id: "p1", amount: 4.5, category: "Food", note: "Coffee", label: "Coffee" });
  const updated = addPreset(created.presets, { amount: "9", category: "Transport" }, "p2");
  assert.equal(updated.presets[1].label, "Transport");
  assert.deepEqual(removePreset(updated.presets, "p1"), [updated.presets[1]]);
});

test("accepts income with an income category and rejects expense categories", () => {
  const income = validateExpense({ type: "income", amount: "850", date: "2026-11-01", category: "Salary", note: "Part-time pay" });
  assert.equal(income.valid, true);
  assert.equal(income.value.type, "income");
  assert.equal(income.value.amount, 850);
  assert.equal(validateExpense({ type: "income", amount: "50", date: "2026-11-01", category: "Food" }).valid, false);
  assert.equal(validateExpense({ type: "expense", amount: "50", date: "2026-11-01", category: "Salary" }).valid, false);
});

test("income is excluded from spending totals but increases the balance", () => {
  const entries = [
    { id: "e1", amount: 20, date: "2026-11-02", category: "Food" },
    { id: "i1", type: "income", amount: 500, date: "2026-11-01", category: "Salary" },
  ];
  const summary = budgetSummary(entries, 100, 300, "2026-11", "2026-11-02");
  assert.equal(summary.balance, 580);
  assert.equal(summary.monthlySpent, 20);
  assert.equal(summary.monthlyIncome, 500);
  assert.equal(summary.dailySpent, 20);
  assert.equal(categoryTotals(entries, "2026-11").reduce((sum, item) => sum + item.amount, 0), 20);
  assert.equal(dailyTotals(entries, "2026-11")[1].amount, 20);
  const income = incomeTotals(entries, "2026-11");
  assert.equal(income.find((item) => item.category === "Salary").amount, 500);
  assert.equal(INCOME_CATEGORIES.length, 6);
});
