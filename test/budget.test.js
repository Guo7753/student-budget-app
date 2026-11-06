import test from "node:test";
import assert from "node:assert/strict";
import { addExpense, removeExpense, totalForMonth, validateExpense } from "../src/budget.js";

const sample = { amount: "12.50", date: "2026-11-06", category: "Food", note: "Lunch" };

test("accepts and stores a valid expense", () => {
  const result = addExpense([], sample, "e1");
  assert.equal(result.valid, true);
  assert.deepEqual(result.expenses[0], { id: "e1", amount: 12.5, date: "2026-11-06", category: "Food", note: "Lunch" });
});

test("rejects zero or negative amount", () => {
  assert.equal(validateExpense({ ...sample, amount: "0" }).valid, false);
  assert.equal(validateExpense({ ...sample, amount: "-3" }).valid, false);
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

