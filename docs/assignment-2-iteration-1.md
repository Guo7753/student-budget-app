# Assignment 2 Iteration 1 record

## Goal and scope

The goal was to make the existing expense tracker more useful for day-to-day student budgeting. The selected work was B6 (budget dashboard), B3 (spending by category), and B7 (amount calculator). B6 and B7 were added after feedback requesting a balance, a monthly budget, fixed daily guidance, more categories, and a quicker way to enter combined purchases. B3 changed from a proposed category-total view to a chart using the same categories as the entry form.

Guo HouYang implemented and integrated the increment in PR 9. Chen GuangYuan reviewed the PR. Shang JiaLe measured the time to first review and proposed a review-window improvement. These are the verified activities recorded in the repository contribution record; planned ownership in the original backlog is not treated as completed work.

## Acceptance outcomes

| Item | Acceptance outcome | Result | Evidence |
| --- | --- | --- | --- |
| B6 | Save a starting balance and a budget per selected month | Passed in the browser preview; values persisted after reload | `validateSettings` and `budgetSummary` tests; PR 9 |
| B6 | Keep daily budget fixed after adding an expense | Passed: NZD 300 across 30 days remained NZD 10.00 after an NZD 12.50 expense | `budgetSummary` test |
| B6 | Show ten icon-labelled categories | Passed | `CATEGORIES`, `CATEGORY_ICONS`, and category test |
| B3 | Show category spending for the selected month and include zero categories | Passed | `categoryTotals` test and browser chart |
| B7 | Accept `12+3` and save NZD 15.00 | Passed | `calculateAmount` and `addExpense` tests |
| B7 | Reject malformed or JavaScript-like input | Passed | calculator-rejection test |

## Traceability and measures

| Requirement | Issue | Implementation and review | Acceptance test | CI or local result | Outcome |
| --- | --- | --- | --- | --- | --- |
| B6 budget dashboard | [Issue 8](https://github.com/Guo7753/student-budget-app/issues/8) | [PR 9](https://github.com/Guo7753/student-budget-app/pull/9), reviewed by Chen GuangYuan | `budgetSummary`, settings, category tests | [GitHub Actions run](https://github.com/Guo7753/student-budget-app/actions/runs/42821911313) | Passed |
| B3 category chart | [Issue 4](https://github.com/Guo7753/student-budget-app/issues/4) | PR 9 | `categoryTotals` test | GitHub Actions run above | Passed |
| B7 calculator | [Issue 10](https://github.com/Guo7753/student-budget-app/issues/10) | PR 9 | calculator and rejection tests | GitHub Actions run above | Passed |

Traceability completeness was 3/3 completed items (100%) when each item was checked for an Issue, PR, named test, and CI link. The first-review interval recorded by Shang was about 26.1 hours for PR 9. This is shorter than the earlier PR 2 interval of about 125.4 hours, but the two PRs differ in size and reviewer availability, so this comparison does not establish a cause. The review required no recorded code rework; it included discussion of the dashboard, chart, calculator, and test coverage.

## Retrospective and process improvement

The increment demonstrated a working route from entry to budget feedback and category insight. A process weakness remained: reviewers did not have a short, consistent prompt identifying acceptance criteria and test commands. The Iteration 2 improvement is a small review checklist that names the changed requirements, the test command, a quality scenario, and a desired 24-hour review window. It is documented in `docs/pr-review-checklist.md` and should be copied into the next PR description before review starts.

The improvement will be evaluated by recording the time from PR opening to first teammate review, review rounds, and whether each completed item still has an Issue, PR, test, and CI link. The next comparison must report task-size and reviewer-availability differences.

## Limitations

The data is browser-local. There is no income entry, bank integration, shared account, or production-grade financial-data handling. Editing existing records, the planned security scenario, and receipt assistance were deferred to the next iteration or beyond it.
