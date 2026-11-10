import test from "node:test";
import assert from "node:assert/strict";
import {
  addExpense, removeExpense, totalForMonth, validateExpense,
  validateSettings, daysInMonth, budgetSummary, CATEGORIES, CATEGORY_ICONS,
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

test("rejects a calendar date that does not exist", () => {
  assert.equal(validateExpense({ ...sample, date: "2026-02-31" }).valid, false);
});

test("deleting an expense removes it", () => {
  const expenses = [{ id: "e1", ...sample }, { id: "e2", ...sample }];
  assert.deepEqual(removeExpense(expenses, "e1").map((x) => x.id), ["e2"]);
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

