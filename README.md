# Student Budget

> The working prototype is currently proposed in [Pull Request #2](https://github.com/Guo7753/student-budget-app/pull/2). Check out the `feature/expense-entry` branch before following the run instructions. This note can be removed after a reviewed merge.

A small browser-based expense tracker proposed for the CISE software engineering group assessment. The topic still requires lecturer approval. This repository contains a working proof of concept and the Assignment 1 planning material; the two planned iterations continue into Assignment 2.

## Run

Use a local static server because JavaScript modules do not reliably run from a `file://` URL. From the repository root, run `python -m http.server 8000` (or any equivalent static server), then open `http://localhost:8000`. No package installation is needed for the app. Data is stored in this browser's localStorage. Currency is displayed as dollars for the prototype; the team should confirm the intended currency with the lecturer or users.

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

Before submission, add the real GitHub repository URL, an accessible submission commit or release, Issue and Pull Request links, a reviewer discussion, and the GitHub Actions result. The local files are not substitutes for those external records.

## Reuse and AI disclosure

The proof-of-concept code and draft planning material were prepared with Codex assistance under Guo HouYang's direction. The team must check the course's permitted generative AI use and disclose it in the final submission as required. The two research papers and the Scrum Guide used for the planning discussion are listed in the report. No third-party OCR service or reused application code is included.

