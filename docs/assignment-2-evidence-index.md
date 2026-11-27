# Assignment 2 evidence index

This index lists the evidence for the fixed submission (release v2.0.0, merge commit `5e762b9`). Dates and times follow GitHub's UTC timestamps.

| Requirement or evaluation area | Evidence | Status |
| --- | --- | --- |
| Iteration 1 planning and outcome | [Iteration 1 record](assignment-2-iteration-1.md), Issues 4, 8 and 10, PR 11, Actions run | Complete for the recorded increment |
| Iteration 1 review and process measure | Chen's PR 9 review (approved 2026-11-11T15:00:59Z); Shang's review-wait measurement in PR 9 | Complete, with small-sample limitation |
| Iteration 2 B4 editing | `updateExpense`, browser edit and cancel checks, two edit tests, [PR 11](https://github.com/Guo7753/student-budget-app/pull/11) approved by Li Hao (2026-11-25T14:03:19Z) and merged (2026-11-25T14:56:08Z) | Complete |
| Q1 note-rendering scenario | Literal `<b>test</b>` browser result on 22 November 2026; `textContent` rendering in `src/app.js` | Complete for one note-rendering pathway |
| Q2 performance scenario | Calculation-layer timings for 100, 1,000 and 10,000 records recorded in [the report](assignment-2-report.md) section 3 | Complete for one machine and synthetic data |
| Process improvement | [Review checklist](pr-review-checklist.md) and requested 24-hour review window; first-review intervals of about 125.4 h (PR 2), 26.1 h (PR 9) and 7.9 h (PR 11) | Complete, with a causal limitation stated in the report |
| Daily team progress | [Dated workday log](daily-progress.md) and [Issue 12](https://github.com/Guo7753/student-budget-app/issues/12) | Complete for the recorded workdays |
| Group demonstration | [Demonstration guide](assignment-2-team-demo.md); slides, bilingual script and run sheet archived in the submission folder; demonstration held 27 November 2026 | Complete for the recorded session |
| Individual contribution explanations | [Member statements](individual-contribution-statements.md), also in the report appendix | Complete |
| Runnable application | [README](../README.md), `npm start`, `npm test` (22 tests) | Complete |
| Post-submission interface refinement | [PR 13](https://github.com/Guo7753/student-budget-app/pull/13) merged after the pull request was closed for review; commits `05d2a7b`-`268bcac`; [iteration 2 refinement section](assignment-2-iteration-2.md); `npm test` (22 tests) | Implemented and author-verified; no independent teammate review (stated as a limitation) |
| Final fixed submission | Release [v2.0.0](https://github.com/Guo7753/student-budget-app/releases/tag/v2.0.0), merge commit `5e762b9` | Complete |

The submitted report states the limitations that remain after these records: browser-local storage, no receipt assistance, the author-only verification of the final interface and income feature, and a process measurement based on three pull requests with different sizes and reviewers.
