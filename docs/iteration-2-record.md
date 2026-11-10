# Iteration 2 work in progress

Date started: 10 November 2026. This is a progress record, not a claim that Iteration 2 has finished or that four members have contributed.

## Goal and scope change

The Assignment 1 baseline planned category totals (B3), editing (B4), and a security quality check (Q1). On 10 November, the user requested a clearer interface, more categories with icons, and balance and budget tracking. [B6](https://github.com/Guo7753/student-budget-app/issues/8) was added to the living backlog. A later request on the same day asked for an in-field calculator and a category chart. This extends [B3](https://github.com/Guo7753/student-budget-app/issues/4) and adds [B7](https://github.com/Guo7753/student-budget-app/issues/10). B4 editing and Q1 are still pending. Receipt assistance (B5) remains optional. At the iteration review, explain how the scope change affected B4.

## B6 acceptance and observed local outcome

| Acceptance criterion | Current result | Evidence |
| --- | --- | --- |
| Save starting balance and month-specific budget | Passed: saved values and expense remained after refreshing the local preview | Code in `src/app.js`; manual browser check on 10 November |
| Show balance and monthly remaining | Implemented | `budgetSummary` test and browser check |
| Keep daily budget fixed when recording an expense | Passed: NZD 300 / 30 days = NZD 10; after recording NZD 12.50, daily budget stayed NZD 10 and daily remaining became -NZD 2.50 | `test/budget.test.js`; manual browser check on 10 November |
| Ten categories with leading icons | Implemented in selector and record list | `src/budget.js`, `src/app.js`; category test |
| Responsive desktop and narrow layout | Visually checked at desktop width and 390 px mobile width | Manual browser inspection on 10 November; screenshot evidence to preserve if required |
| Automated tests | Twelve local tests passed on 10 November; the earlier dashboard commit passed GitHub Actions | `npm test`; [PR 9 dashboard run](https://github.com/Guo7753/student-budget-app/actions/runs/42820110758); check latest run after calculator/chart upload |

## B3 chart and B7 calculator addendum, 10 November

| Acceptance criterion | Observed result | Evidence |
| --- | --- | --- |
| Calculate lunch 12 plus drink 3 in amount field | Passed: keypad input `12+3` previewed NZD 15.00 and saved a numeric NZD 15.00 expense | Manual browser check; `calculateAmount` and `addExpense` tests |
| Reject malformed or unsafe calculations | Passed locally for incomplete, non-finite, non-positive, over-limit, and JavaScript-like input | `test/budget.test.js` |
| Show spending by the exact ten expense categories | Passed: selected month's chart showed Food NZD 15.00 and nine zero categories after the example expense; the sample was deleted after checking | Manual browser check; category aggregation test |
| Match overall monthly total and handle an empty month | Passed in local tests | `test/budget.test.js` |
| Preserve fixed daily budget after calculator entry | Passed: with a NZD 900 monthly budget, daily budget remained NZD 30.00 while daily remaining fell from NZD 30.00 to NZD 15.00 | Manual browser check |

## Responsibilities and traceability

Guo HouYang directed and implemented B6, B3, and B7 with Codex assistance in [PR 9](https://github.com/Guo7753/student-budget-app/pull/9). No teammate review or other member's implementation is claimed here. The earlier [PR 2](https://github.com/Guo7753/student-budget-app/pull/2) remains the unmerged base and still needs a genuine teammate review.

## Process and quality evidence still to collect

- First teammate review time and review rounds for each PR.
- Traceability completeness for completed items.
- A retrospective decision based on actual Iteration 1 evidence, followed by one specific process change in Iteration 2.
- The planned [Q1 security scenario](https://github.com/Guo7753/student-budget-app/issues/7), with exact input, environment, steps, expected and observed result.
- Feedback from a user on the new dashboard and any design changes made in response.

Known limitations: no income entry or record editing yet, no receipt extraction, and browser-local storage only. Budget figures are guidance rather than financial advice.

