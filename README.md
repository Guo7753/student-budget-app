# Student Budget

A small browser-based expense tracker proposed for the CISE software engineering group assessment. The topic still requires lecturer approval. This repository contains a working proof of concept and the Assignment 1 planning material; the two planned iterations continue into Assignment 2.

## Run

Install Node.js 18 or later. From the repository root, run `npm start`, then open `http://127.0.0.1:8000`. No package download is needed. Data is stored in this browser's localStorage. The prototype labels amounts in NZD; the team should confirm the intended currency with users.

## Test

Run `npm test` with Node.js 18 or later. This uses Node's built-in test runner and requires no downloaded packages.

## Scope

The proof of concept supports manual expense entry, validation, ten icon-labelled categories, monthly listing and deletion, and a budget dashboard. Set a starting balance and a separate budget for each selected month. Balance is the starting balance minus **all** recorded expenses. Monthly remaining is that month's budget minus its expenses. Daily budget is the monthly budget divided by calendar days and rounded to cents; recording an expense does **not** change it. Daily remaining subtracts expenses for the selected day and can be negative. Settings and expenses persist in this browser only.

Planned work includes category totals, editing existing records, and an optional receipt-assist experiment. Receipt extraction must always ask the user to confirm fields before saving. Income entry, bank integration, payment, shared accounts, and production handling of personal financial data are excluded. Without income entry, the starting balance must be adjusted manually if new money is added.

## Project and evidence

- [Prioritised backlog and iteration plan](docs/backlog.md)
- [System overview and decisions](docs/design.md)
- [Workflow and evidence index](docs/evidence-index.md)
- [Contribution record](docs/contributions.md)
- [Report source](docs/report.md)
- [Iteration 2 work in progress](docs/iteration-2-record.md)

Before submission, add the real GitHub repository URL, an accessible submission commit or release, Issue and Pull Request links, a reviewer discussion, and the GitHub Actions result. The local files are not substitutes for those external records.

## Reuse and AI disclosure

The proof-of-concept code and draft planning material were prepared with Codex assistance under Guo HouYang's direction. The team must check the course's permitted generative AI use and disclose it in the final submission as required. The two research papers and the Scrum Guide used for the planning discussion are listed in the report. No third-party OCR service or reused application code is included.

