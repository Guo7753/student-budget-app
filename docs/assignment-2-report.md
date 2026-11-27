# Student Budget: Assignment 2 Evaluation Report

**CISE collaborative software engineering | Group assessment | 27 November 2026**

**Members:** Guo HouYang (25307753, team lead), Li Hao (25307493), Chen GuangYuan (25307711), Shang JiaLe (25307221)

**Repository:** https://github.com/Guo7753/student-budget-app
**Fixed submission:** release v2.0.0, merge commit 5e762b9
**Evidence index:** [assignment-2-evidence-index.md](assignment-2-evidence-index.md)

## 1. Project scope and changes

Student Budget is a browser application for students who make many small purchases and want a low-effort view of where their money goes. A student records an amount, date, category and optional note, and the application shows the selected month's records, a fixed daily budget, a spending trend, a category breakdown and, in a separate view, income. The product keeps a starting balance and a month-specific budget in browser local storage. It is a coursework prototype: it does not process payments, connect to a bank, manage shared accounts or give financial advice. Browser storage is convenient but can be cleared, so it is not a production data store.

Assignment 1 selected an iterative and incremental approach because the useful form of spending feedback was uncertain, and it proposed a prioritised backlog with B1 (validated expense entry), B2 (monthly list and deletion), B3 (category totals), B4 (record editing) and B5 (receipt assistance as an optional stretch item). Assignment 2 retained that approach and that ordering. Iteration 1 delivered B6 (balance and fixed-daily-budget dashboard), B7 (arithmetic entry such as 12+3) and B3 (category chart). Iteration 2 delivered B4 (editing without changing the record identifier) and the quality scenario Q1 (note rendering). B5 was deliberately not attempted because it would add privacy and extraction-accuracy risk without improving the priority manual flow.

Two scope changes are worth stating explicitly. First, a starting balance and month-specific budget replaced the simpler monthly total as the primary feedback, because a student needs to know what is left for a day rather than only what was spent. Second, after the first report draft the team added income tracking and a two-page interface, delivered in pull request 13. The change was driven by demonstration evidence: the two ideas that communicated the product's value were "spending against a fixed daily budget" and "income tracked separately". It is a real scope change, not part of the Assignment 1 plan, and it was verified by automated tests and author browser checks rather than by a teammate review; Section 6 treats that gap as a limitation rather than hiding it.

The design keeps calculations in `src/budget.js` and browser rendering in `src/app.js`. Expense and income records share one array, and an entry is income only when it carries `type: "income"`, so existing expense behaviour and tests were preserved. The separation made calculator, category, daily-budget, income and editing behaviour testable without browser setup. The interface builds note text with `textContent` rather than HTML, which the quality scenario below examines.

## 2. Iteration outcomes and traceability

Iteration 1 concentrated on visibility. Pull request 9 implemented B6, B7 and B3 and added the dashboard, the calculator parser supported by rejection tests, and the category chart using the same ten categories as the form, including zero-value categories so that an unrepresented category cannot silently disappear. Chen GuangYuan approved pull request 9 on 11 November 2026. The pull request was later closed as superseded and its content was re-landed in pull request 11 after review, so the reviewed change and the merged change are not the same object; this is recorded here rather than presented as a single clean merge.

Iteration 2 delivered B4. Selecting Edit copies the amount, date, category and note into the form and changes the primary action to Update expense. A valid update keeps the record identifier, so the list, charts and summaries use the corrected record rather than a duplicate; Cancel edit leaves stored data unchanged. Two tests cover a valid correction and an invalid or unknown identifier. Pull request 11 also carried the Iteration 1 content, was approved by Li Hao on 25 November 2026 and was merged the same day. The suite grew from 14 tests at the iteration boundary to 17 and then 22 as daily totals, balance trend, income totals, income exclusion and quick-add presets were added. The merge commit for the fixed submission is 5e762b9, released as v2.0.0 after pull request 13 was merged.

Traceability is summarised below. "CI" means the GitHub Actions "Tests" workflow, which runs `npm test` on Node 20 for every push and pull request; every row was green at submission.

| Requirement | Source | Implementation and review | Verification | Outcome |
| --- | --- | --- | --- | --- |
| B6 budget dashboard | Issue 8 | PR 11, Li review | settings and budget-summary tests | Passed |
| B7 calculator | Issue 10 | PR 11, Li review | parser and rejection tests | Passed |
| B3 category chart | Issue 4 | PR 11, Li review | category-total test | Passed |
| B4 editing | Issue 5 | PR 11, Li review | edit and unknown-id tests | Passed |
| Q1 note rendering | Issue 7 | PR 11, Li review | browser check, 22 Nov 2026 | Passed |
| Income boundary | PR 13 | author; no teammate review | income tests (4) | Passed with review gap |

The group demonstration on 27 November 2026 used the repository's demonstration deck and a live local run of the application: it showed the entry and fixed-daily-budget workflow, the month heatmap and burn-down comparison, the income view and the test output. The deck, the spoken script and this evidence index are archived with the submission.

Two traceability limits should be read with the table. The income row is author-verified only. The demonstration deck, the review checklist, the evidence index and a dated progress log are repository artefacts that make the path from requirement to change to check inspectable, but traceability completeness measures whether a reader can follow the evidence, not whether every defect was found.

## 3. Software quality evidence

The automated suite now contains 22 tests that run with `npm test` on Node 18 or later and require no package download. They cover validation of amounts and dates, rejection of zero, negative, malformed and over-limit amounts, calculator parsing and rejection of unsafe input, monthly totals and month exclusion, category completeness, settings validation including leap-year month lengths, the fixed-daily-budget rule, day-by-day totals, balance trend, quick-add validation and add/remove, and four income behaviours: income categories are accepted, income is excluded from spending totals, income increases the balance, and daily income series do not leak into the spending series. These are focused unit tests. They do not replace cross-browser, accessibility or storage-failure testing.

The selected quality scenario Q1 concerns note rendering. An expense note is user-supplied text displayed in the record list, so text that resembles markup must not create markup. The environment was the application served locally with Node, Microsoft Edge and Windows, on 22 November 2026. The procedure was to enter amount 12+3, date 2026-11-22, category Food and note `<b>test</b>`, save, and inspect the list. The expected result was a stored NZD 15.00 Food record with the characters `<b>test</b>` visible as text and not bold. The observed result matched, consistent with the implementation building the note with `textContent`. The scenario covers one display path only; it does not establish security against localStorage manipulation, browser extensions, server endpoints or a future receipt-extraction integration.

A second scenario, Q2, measured the calculation layer because the interface recalculates summaries on every render. A Node script generated 100, 1,000 and 10,000 synthetic November records across the ten categories and timed `budgetSummary`, `categoryTotals` and `dailyTotals` over 25 iterations on a Windows 11 machine with an Intel Core i7-13620H and Node v24.21.0. Medians are reported because means were distorted by warm-up outliers.

| Records | budgetSummary (ms) | categoryTotals (ms) | dailyTotals (ms) |
| --- | --- | --- | --- |
| 100 | 0.015 | 0.022 | 0.032 |
| 1,000 | 0.061 | 0.034 | 0.047 |
| 10,000 | 0.689 | 0.639 | 0.593 |

Even 10,000 records cost under one millisecond per calculation, so arithmetic is not the constraint for a student's monthly data; the practical limits are DOM rendering and local-storage writes, which this scenario did not measure. The result supports keeping the pure module and unit tests rather than adding a database or caching layer, and it illustrates the limits of evidence: a synthetic single-machine measurement informs architecture, not user-perceived performance on a low-end phone.

## 4. Process improvement and collaboration

The Assignment 1 plan intended every change to pass an Issue, a pull request, a review and an automated check. The actual problem was review latency. Li Hao's approval of pull request 2 arrived about 125.4 hours after it was opened, and Chen GuangYuan's approval of pull request 9 about 26.1 hours after opening; Shang JiaLe measured both intervals from the GitHub timestamps and recorded the comparison on pull request 9; dates and hours in this report follow GitHub's UTC timestamps. The earlier interval was long enough that implementation continued while a review was still pending, which weakened the plan's review gate.

The retrospective therefore selected a small, specific improvement for Iteration 2: a pull-request review checklist, stored as `docs/pr-review-checklist.md`, plus a requested 24-hour first-review window. The checklist names the requirement, changed files, the `npm test` command, the Q1 scenario, the expected review time and the number of review rounds. It reduces the context a reviewer must reconstruct and makes an omitted piece of evidence visible before reading code.

The observed effect is that pull request 11 received Li Hao's approval about 7.9 hours after it was opened. The interval fell substantially, and the checklist artefact exists, but the comparison is weak evidence of cause: the two pull requests differed in size (180 and 1,241 added lines), the reviewers differed, and availability differed. A single measurement per condition cannot separate the checklist from those differences, and the next change, pull request 13, received no teammate review at all, so the improvement cannot be claimed for the final increment. The defensible conclusion is that the checklist produced a clearer handoff and a measurable review time, not that it caused a sixteen-fold speed-up. The next practical change would be to book the reviewer when the pull request opens and to keep changes small enough to review within the window.

Collaboration otherwise relied on a visible backlog, small commits, pull requests with scope notes, and a dated daily progress log created in response to Assignment 1 feedback that the team had not shown day-to-day progress. The log records only workdays with a concrete commit or pull request link, and it deliberately does not reconstruct unrecorded days. Workload was uneven: implementation and documentation were concentrated in the team lead, while the other members contributed recorded reviews, a review-wait measurement and the review-window proposal. The team states this rather than presenting the Assignment 1 ownership plan as if every planned owner had delivered code.

## 5. Critical evaluation of methods and tools

The iterative and incremental choice remains appropriate. A plan-driven approach would have fixed requirements, design and verification gates before implementation, which is valuable where requirements are regulated, safety-related or expensive to change. For this product the useful features changed quickly: the dashboard, fixed daily budget, calculator and income view were more valuable than the planned receipt experiment, and an iterative flow allowed that reordering while keeping explicit acceptance criteria and a documented scope change. The evidence for agile benefits is context-dependent rather than universal (Dybå & Dingsøyr, 2008); Serrador and Pinto (2015) associate agile use with project efficiency and stakeholder satisfaction across many projects, but a four-person coursework increment is not strong evidence either way.

The team used feature branches, pull requests and asynchronous review rather than pair programming. Modern code review supports defect detection, knowledge transfer and team awareness, and reviewers compensate for limited context by reconstructing intent from the change (Bacchelli & Bird, 2013); large-scale practice at Google shows review is a lightweight, tool-supported activity whose value depends on small changes and clear ownership (Sadowski et al., 2018). Asynchronous review suits members who work at different times, which was the case here, but it depends on reviewer availability and can fail entirely, as pull request 13 shows. Pair programming would have given faster feedback on the calculator parser and income boundary because the author and a partner would share context, but it requires simultaneous availability and was not realistic for this team.

For verification, the team used Node's built-in test runner with GitHub Actions rather than only manual browser checks. Continuous integration makes the test result visible with the change and removes reliance on an unrecorded local claim; large open-source studies find CI is widely used and associated with more frequent integration, while its cost is setup and maintenance and its value depends on test quality (Hilton et al., 2016). A browser end-to-end suite would test interaction and rendering that unit tests cannot, but it would add dependencies and maintenance to a zero-dependency prototype, so the team used targeted manual browser checks for interaction paths and unit tests for calculations. This is a proportionate choice for the context, not a claim that unit tests are sufficient in general.

The comparison also has to separate paradigms from practices. The paradigm decision is iterative versus plan-driven; the practice decisions are review style, test level and CI. Choosing pull-request review does not by itself justify an iterative process, and choosing CI does not demonstrate an agile paradigm. Keeping the two levels distinct is what allows a recommendation to transfer: a regulated financial system could remain iterative for discovery while imposing plan-driven verification gates.

## 6. Limitations and conclusion

The increment supports budget setting, arithmetic entry, category insight, deletion, editing, a fixed daily budget with a month calendar and burn-down comparison, and income tracked separately from spending. Evidence includes 22 automated tests, a green CI workflow, three recorded teammate reviews across two reviewed pull requests, a reproducible injection check, a measurement-based performance scenario, iteration records and a dated progress log.

The limitations are substantial and stated in the report rather than only in the repository. Data lives in one browser profile; clearing site data deletes it. Receipt assistance is not implemented. The final interface and income feature were merged without a teammate review, and the process measurement rests on three pull requests with different sizes and reviewers. Q1 examines one display path, and Q2 uses synthetic data on one machine, so neither supports a general security or performance claim. Workload was concentrated in one member, and the Assignment 1 plan overestimated how evenly planned ownership would translate into delivered code.

The project therefore demonstrates a working, tested increment and a traceable, evidence-based process with limitations the team can name, rather than a production system. The next steps are a CSV export to reduce data loss, an accessibility audit with assistive technology, and a review protocol that books the reviewer when the pull request opens.

## References

Bacchelli, A., & Bird, C. (2013). Expectations, outcomes, and challenges of modern code review. In *Proceedings of the 2013 International Conference on Software Engineering* (pp. 712–721). IEEE. https://doi.org/10.1109/ICSE.2013.6606617

Dybå, T., & Dingsøyr, T. (2008). Empirical studies of agile software development: A systematic review. *Information and Software Technology, 50*(9–10), 833–859. https://doi.org/10.1016/j.infsof.2008.01.006

Hilton, M., Tunnell, T., Huang, K., Marinov, D., & Dig, D. (2016). Usage, costs, and benefits of continuous integration in open-source projects. In *Proceedings of the 31st IEEE/ACM International Conference on Automated Software Engineering* (pp. 426–437). ACM. https://doi.org/10.1145/2970276.2970358

Sadowski, C., Söderberg, E., Church, L., Sipko, M., & Bacchelli, A. (2018). Modern code review: A case study at Google. In *Proceedings of the 40th International Conference on Software Engineering: Software Engineering in Practice* (pp. 181–190). ACM. https://doi.org/10.1145/3183519.3183525

Serrador, P., & Pinto, J. K. (2015). Does agile work? A quantitative analysis of agile project success. *International Journal of Project Management, 33*(5), 1040–1051. https://doi.org/10.1016/j.ijproman.2015.01.006

## Appendix A — Individual contribution statements

**Guo HouYang (25307753).** I was team lead and the main implementer. I maintained the backlog and the iteration records, implemented the budget dashboard, the arithmetic entry, the category chart, the edit workflow, the income boundary and the interface refinement, and I ran the test suite and the browser checks. I also maintained the repository, the review checklist and the report drafts. Evidence: pull requests 9, 11 and 13; commits 0f3fc63 to 268bcac; `docs/assignment-2-iteration-1.md`, `docs/assignment-2-iteration-2.md` and `docs/daily-progress.md`.

**Li Hao (25307493).** I reviewed two pull requests. On pull request 2 I raised the concern that a negative amount had to be rejected rather than stored, and on pull request 11 I reviewed the budget, editing and evidence changes against the acceptance criteria and the test command, and approved the change. Evidence: the review records on pull requests 2 and 11.

**Chen GuangYuan (25307711).** I reviewed pull request 9, checking the dashboard, the category chart and the calculator against their stated scope and the test coverage, and I approved it with comments. Evidence: the review record on pull request 9.

**Shang JiaLe (25307221).** I measured the first-review intervals for pull requests 2 and 9 from the GitHub timestamps (about 125.4 hours and 26.1 hours) and recorded the comparison and a proposed 24-hour review window in a comment on pull request 9. Evidence: the comment on pull request 9.

The team records that implementation was concentrated in Guo HouYang. The Assignment 1 plan assigned implementation across members; that plan was not fully realised, and the table above reports what the repository can verify rather than the intended division.

## Appendix B — Demonstration summary

The demonstration was scheduled for ten minutes with five minutes of questions. It used the released build (v2.0.0) served locally: recording an expense with an arithmetic amount and showing that the fixed daily budget does not change; opening the monthly heatmap and the burn-down comparison from the budget card; switching the page-wide view to income and showing an income calendar, a savings rate and the income source breakdown; running `npm test` to show the 22 passing tests; and presenting the review-wait measurement and the statement of limitations. The slides and the bilingual spoken script are archived with the submission.

## Appendix C — Evidence index

| Evaluation area | Artefact | Link |
| --- | --- | --- |
| Fixed submission | Release v2.0.0, merge commit 5e762b9 | https://github.com/Guo7753/student-budget-app/releases/tag/v2.0.0 |
| Requirements | Backlog and Issues 4, 5, 7, 8, 10 | https://github.com/Guo7753/student-budget-app/blob/main/docs/backlog.md |
| Reviewed change | Pull request 11 (approved by Li Hao) | https://github.com/Guo7753/student-budget-app/pull/11 |
| Superseded change | Pull request 9 (reviewed by Chen GuangYuan, closed as superseded) | https://github.com/Guo7753/student-budget-app/pull/9 |
| Early reviewed change | Pull request 2 (approved by Li Hao) | https://github.com/Guo7753/student-budget-app/pull/2 |
| Interface and income refinement | Pull request 13 (author-verified, no teammate review) | https://github.com/Guo7753/student-budget-app/pull/13 |
| Tests and CI | `npm test` (22 tests), GitHub Actions "Tests" workflow | https://github.com/Guo7753/student-budget-app/actions |
| Iteration records | Iteration 1 and iteration 2 records | https://github.com/Guo7753/student-budget-app/tree/main/docs |
| Quality scenario Q1 | Note-rendering check in the iteration 2 record | https://github.com/Guo7753/student-budget-app/blob/main/docs/assignment-2-iteration-2.md |
| Process measurement | Review-wait comparison on pull request 9 | https://github.com/Guo7753/student-budget-app/pull/9 |
| Daily progress | Dated progress log and Issue 12 | https://github.com/Guo7753/student-budget-app/issues/12 |
| Review checklist | Checklist used for the pull-request review | https://github.com/Guo7753/student-budget-app/blob/main/docs/pr-review-checklist.md |

## Appendix D — Generative AI use disclosure

The team used generative AI assistants for code drafting, interface prototyping and report drafting, which the course permits with disclosure. The team remains responsible for the submitted content. Verification steps are recorded and were performed on GitHub or in the browser: `npm test` and the GitHub Actions workflow for the code, pull-request reviews by the named members, timestamped review-wait measurements, and reproducible browser checks for the quality scenarios. The interface and income refinement in pull request 13 was verified by its author with tests and browser checks rather than by an independent reviewer, and the report states this limitation. No evidence, review, measurement or member contribution in this report was fabricated.
