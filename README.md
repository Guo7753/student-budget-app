# Student Budget

A small browser-based expense tracker proposed for the CISE software engineering group assessment. The topic was confirmed with the lecturer in class; no written record is available. This repository contains a working proof of concept and the Assignment 1 planning material; the two planned iterations continue into Assignment 2.

## Run

Install Node.js 18 or later. From the repository root, run `npm start`, then open `http://127.0.0.1:8000`. No package download is needed. Data is stored in this browser's localStorage. The prototype labels amounts in NZD; the team should confirm the intended currency with users.

## Test

Run `npm test` with Node.js 18 or later. This uses Node's built-in test runner and requires no downloaded packages.

## Scope

The proof of concept supports manual expense entry, validation, ten icon-labelled categories, monthly listing, editing, deletion, a category spending chart, and a budget dashboard. Select Edit beside a record to load its values, then Update expense to save a validated replacement with the same record ID; Cancel edit leaves the record unchanged. In the amount field, type a calculation such as `12+3`, or open the calculator keypad; the calculated amount is previewed and saved as NZD 15.00. The chart shows spending for all ten form categories in the selected month. Set a starting balance and a separate budget for each selected month. Balance is the starting balance minus all recorded expenses. Monthly remaining is that month's budget minus its expenses. Daily budget is the monthly budget divided by calendar days and rounded to cents; recording an expense does not change it. Daily remaining subtracts expenses for the selected day and can be negative. Settings and expenses persist in this browser only.

Receipt extraction remains optional. Receipt extraction must always ask the user to confirm fields before saving. Income entry, bank integration, payment, shared accounts, and production handling of personal financial data are excluded. Without income entry, the starting balance must be adjusted manually if new money is added.

## Project and evidence

- [Prioritised backlog and iteration plan](docs/backlog.md)
- [System overview and decisions](docs/design.md)
- [Workflow and evidence index](docs/evidence-index.md)
- [Contribution record](docs/contributions.md)
- [Report source](docs/report.md)
- [Iteration 2 work in progress](docs/iteration-2-record.md)
- [Assignment 2 Iteration 1 record](docs/assignment-2-iteration-1.md)
- [Assignment 2 Iteration 2 record](docs/assignment-2-iteration-2.md)
- [Assignment 2 evidence index](docs/assignment-2-evidence-index.md)
- [Assignment 2 daily progress log](docs/daily-progress.md)
- [Review checklist](docs/pr-review-checklist.md)
- [Team demonstration guide](docs/assignment-2-team-demo.md)

The Assignment 1 prototype was merged through [reviewed PR 2](https://github.com/Guo7753/student-budget-app/pull/2); its [Issue 1](https://github.com/Guo7753/student-budget-app/issues/1), [passing CI run](https://github.com/Guo7753/student-budget-app/actions/runs/42192009510), and [evidence index](docs/evidence-index.md) are linked. The budget dashboard, calculator, and category chart are recorded as Assignment 2 Iteration 1 evidence in [PR 9](https://github.com/Guo7753/student-budget-app/pull/9). The B4 editing PR and CI link must be added before final submission.

## Reuse and AI disclosure

The proof-of-concept code and draft planning material were prepared with Codex assistance under Guo HouYang's direction. The team must check the course's permitted generative AI use and disclose it in the final submission as required. The two research papers and the Scrum Guide used for the planning discussion are listed in the report. No third-party OCR service or reused application code is included.

