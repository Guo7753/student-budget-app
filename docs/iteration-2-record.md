# Iteration 2 work in progress

Date started: 10 November 2026. This is a progress record, not a claim that Iteration 2 has finished or that four members have contributed.

## Goal and scope change

The Assignment 1 baseline planned category totals (B3), editing (B4), and a security quality check (Q1). On 10 November, the user requested a clearer interface, more categories with icons, and balance and budget tracking. [B6](https://github.com/Guo7753/student-budget-app/issues/8) was added to the living backlog and developed ahead of B3/B4. Receipt assistance (B5) remains optional. At the iteration review, record whether B3/B4 can still fit and explain any deferral.

## B6 acceptance and observed local outcome

| Acceptance criterion | Current result | Evidence |
| --- | --- | --- |
| Save starting balance and month-specific budget | Passed: saved values and expense remained after refreshing the local preview | Code in `src/app.js`; manual browser check on 10 November |
| Show balance and monthly remaining | Implemented | `budgetSummary` test and browser check |
| Keep daily budget fixed when recording an expense | Passed: NZD 300 / 30 days = NZD 10; after recording NZD 12.50, daily budget stayed NZD 10 and daily remaining became -NZD 2.50 | `test/budget.test.js`; manual browser check on 10 November |
| Ten categories with leading icons | Implemented in selector and record list | `src/budget.js`, `src/app.js`; category test |
| Responsive desktop and narrow layout | Visually checked at desktop width and 390 px mobile width | Manual browser inspection on 10 November; screenshot evidence to preserve if required |
| Automated tests | Nine local tests passed on 10 November; GitHub Actions passed | `npm test`; [PR 9 Actions run](https://github.com/Guo7753/student-budget-app/actions/runs/42820110758) |

## Responsibilities and traceability

Guo HouYang directed and implemented B6 with Codex assistance in [PR 9](https://github.com/Guo7753/student-budget-app/pull/9). No teammate review or other member's implementation is claimed here. The earlier [PR 2](https://github.com/Guo7753/student-budget-app/pull/2) remains the unmerged base and still needs a genuine teammate review.

## Process and quality evidence still to collect

- First teammate review time and review rounds for each PR.
- Traceability completeness for completed items.
- A retrospective decision based on actual Iteration 1 evidence, followed by one specific process change in Iteration 2.
- The planned [Q1 security scenario](https://github.com/Guo7753/student-budget-app/issues/7), with exact input, environment, steps, expected and observed result.
- Feedback from a user on the new dashboard and any design changes made in response.

Known limitations: no income entry, no record editing or category totals yet, no receipt extraction, and browser-local storage only. Budget figures are guidance rather than financial advice.

