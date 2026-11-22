# Assignment 2 Iteration 2 record

## Goal and scope

The goal was to complete the priority B4 correction workflow and evaluate one relevant security scenario. B4 lets a student correct an existing expense without changing its identifier. This iteration also applies the review checklist selected at the previous retrospective.

Guo HouYang implemented the edit workflow and its tests. The local browser check on 22 November 2026 confirmed that selecting Edit populated the form, changed the primary action to Update expense, and that Cancel edit left the record unchanged. The final peer-review outcome and review turnaround must be added after a teammate reviews the resulting PR; they are not yet claimed in this record.

## Acceptance outcomes

| Item | Acceptance outcome | Result | Evidence |
| --- | --- | --- | --- |
| B4 | Select Edit on a record and prefill amount, date, category, and note | Passed in local browser check | `src/app.js`; browser check, 22 November 2026 |
| B4 | Save a valid correction with the same record ID | Passed | `editing an expense preserves its id and recalculates its amount` test |
| B4 | Reject invalid correction and an unknown record ID | Passed | `editing rejects invalid data and an unknown expense id` test |
| B4 | Cancel edit without changing the stored record | Passed in local browser check | Edit workflow browser check, 22 November 2026 |

`npm test` passed 14 tests on 22 November 2026 after the edit change. The tests cover entry validation, deletion, editing, calculator parsing, categories, chart totals, budget settings, calendar-day calculation, and fixed daily-budget behaviour.

## Q1 security quality scenario

**Scenario and rationale.** Expense notes are user-supplied text shown in the record list. The relevant quality concern is that note text resembling HTML must not create markup in the page.

**Environment.** Student Budget served locally with Node.js; Microsoft Edge in the local browser test; Windows; 22 November 2026.

**Input and procedure.** Enter amount `12+3`, date `2026-11-22`, category Food, and note `<b>test</b>`. Save the expense, then inspect the record list.

**Expected result.** The record stores NZD 15.00. The characters `<b>test</b>` remain visible as text; the word is not bold and no HTML element is created from the note.

**Observed result.** Passed. The list displayed the literal text `<b>test</b>` beside the Food record. The implementation builds the note with `textContent`, rather than assigning HTML. This checks one displayed-note injection path only; it does not establish security for localStorage integrity, browser extensions, server APIs, or any future receipt-extraction integration.

## Process improvement and comparison

The Iteration 1 retrospective selected a PR review checklist and a requested 24-hour review window. The checklist is now stored in `docs/pr-review-checklist.md` and identifies the B4 acceptance tests and Q1 scenario for the reviewer. It is a concrete process change, but its effect cannot be measured until the next PR is opened and receives a genuine teammate review. Do not report a review-turnaround improvement before that evidence exists.

The feature’s traceability is complete locally for requirement-to-code-to-test, but the PR and CI columns remain pending. Once the review is complete, update this record with the PR link, Actions run, opening time, first-review time, review rounds, and a comparison with Iteration 1 that notes different scope and reviewer availability.

## Limitations and next step

The app still stores data only in the current browser and does not include income, receipt extraction, shared accounts, or production security controls. A later iteration could add export, accessibility testing, or receipt assistance only after those constraints are addressed.
