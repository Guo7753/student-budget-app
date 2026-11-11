# Student Budget

> The working prototype is currently proposed in [Pull Request #2](https://github.com/Guo7753/student-budget-app/pull/2). Check out the `feature/expense-entry` branch before following the run instructions. This note can be removed after a reviewed merge.

A small browser-based expense tracker proposed for the CISE software engineering group assessment. The topic still requires lecturer approval. This repository contains a working proof of concept and the Assignment 1 planning material; the two planned iterations continue into Assignment 2.

## Run

Install Node.js 18 or later. From the repository root, run `npm start`, then open `http://127.0.0.1:8000`. No package download is needed. Data is stored in this browser's localStorage. Currency is displayed as dollars for the prototype; the team should confirm the intended currency with the lecturer or users.

## Test

Run `npm test` with Node.js 18 or later. This uses Node's built-in test runner and requires no downloaded packages.

## Scope

The proof of concept supports manual expense entry, validation, a monthly list and total, and deletion. Planned work includes category totals and an optional receipt-assist experiment. Receipt extraction must always ask the user to confirm fields before saving. Bank integration, payment, shared accounts, and production handling of personal financial data are excluded.

## Project and evidence

- [Prioritised backlog and iteration plan](docs/backlog.md)
- [System overview and decisions](docs/design.md)
- [Workflow and evidence index](docs/evidence-index.md)
- [Contribution record](docs/contributions.md)
- [Report source](docs/report.md)

The Assignment 1 prototype was merged through [reviewed PR 2](https://github.com/Guo7753/student-budget-app/pull/2); its [Issue 1](https://github.com/Guo7753/student-budget-app/issues/1), [passing CI run](https://github.com/Guo7753/student-budget-app/actions/runs/42192009510), and [evidence index](docs/evidence-index.md) are linked. The expanded budget dashboard, calculator, and category chart remain in open [PR 9](https://github.com/Guo7753/student-budget-app/pull/9) for Assignment 2.

## Reuse and AI disclosure

The proof-of-concept code and draft planning material were prepared with Codex assistance under Guo HouYang's direction. The team must check the course's permitted generative AI use and disclose it in the final submission as required. The two research papers and the Scrum Guide used for the planning discussion are listed in the report. No third-party OCR service or reused application code is included.

