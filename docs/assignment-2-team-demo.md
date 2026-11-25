# Student Budget team demonstration

**Format:** 10-minute demonstration followed by 5 minutes of questions  
**Audience:** course assessor and classmates  
**Purpose:** show the working priority workflow, tests, quality scenario, iteration evidence, process improvement, and each member's verified contribution.

## Demonstration setup

Before the session:

1. Start from the fixed Assignment 2 branch or commit that the group will submit. Keep its repository page open so the assessor can follow Issues, pull requests, reviews, Actions, and iteration evidence.
2. In the project root, run `npm test` and retain the passing output. Then run `npm start` and open `http://127.0.0.1:8000`.
3. Use a clean browser profile or remove only Student Budget test entries. Do not use real financial or receipt data.
4. Prepare the budget example: starting balance NZD 1,200; November budget NZD 900; an expense dated 22 November 2026. NZD 900 / 30 days gives a fixed daily budget of NZD 30.
5. Have the two iteration records, Assignment 2 evidence index, review checklist, and individual contribution statements ready in GitHub or local files.
6. If the final B4 review is still pending, say so clearly. Do not show the process improvement as effective until a real teammate review and comparable timing have been recorded.

## Ten-minute running order

| Time | Speaker | What to show and say | Assessment evidence |
| --- | --- | --- | --- |
| 0:00-1:00 | Guo HouYang | State the student spending problem, project boundary, two iteration goals, and the scope changes from Assignment 1. | Report scope section; backlog change history |
| 1:00-3:00 | Guo HouYang | Save the starting balance and budget. Enter Food `12+3`; show the NZD 15 preview, saved item, category chart, and monthly remaining. Explain that the daily budget stays NZD 30 while daily remaining changes. | B6/B7/B3 acceptance tests and working UI |
| 3:00-4:15 | Guo HouYang | Select Edit on the item, change its category or note, save, and show the list and chart update. Re-enter edit mode and cancel to show that cancellation preserves the record. | B4 tests and local browser check; identify PR/CI status honestly |
| 4:15-5:45 | Guo HouYang | Run or show `npm test`. Add a harmless note `<b>test</b>` and show that it appears literally rather than bold markup. | Test output; Q1 procedure and result in Iteration 2 record |
| 5:45-7:00 | Chen GuangYuan | Explain the actual PR 9 review: what was inspected, the comments about the dashboard/chart/calculator/tests, and the review outcome. | PR 9 review link and Iteration 1 record |
| 7:00-8:00 | Shang JiaLe | Explain the measured PR 2 and PR 9 first-review intervals, the small sample, possible workload/availability differences, and the review checklist chosen for Iteration 2. | Process-measurement comment; checklist; retrospective |
| 8:00-8:45 | Li Hao | Explain the PR 2 negative-amount validation concern and how the existing guard and test addressed it. | PR 2 review and CI record |
| 8:45-10:00 | Guo HouYang | Compare iterative and plan-driven work, summarize whether the process change can yet be evaluated, and state limits: browser-local storage, no income, no receipt extraction, and any outstanding B4 review. | Main report and Assignment 2 evidence index |

## Five-minute questions

Reserve the full five minutes. Use repository links to answer questions about traceability and contribution evidence. If asked whether the checklist improved review time, distinguish the implementation of the checklist from its still-pending measured effect. If asked about security, describe Q1 as one tested note-rendering pathway, not a general security certification. If asked about missing work, identify the exact item and evidence still needed.

## Daily team progress evidence

The Assignment 1 feedback said the report was reasonable but did not show the team's progress every day. The demonstration should therefore show the actual dated GitHub activity and iteration history, not imply that the existing record contains daily updates when it does not.

Before the demonstration, add one short dated progress entry for each actual workday in the Assignment 2 period. Each entry should state:

- date and member who made the update;
- Issue or backlog item worked on;
- concrete change, review, test, or blocker completed that day;
- link to the commit, PR, review, Actions run, or evidence snapshot;
- next step or handoff.

Use GitHub issue comments or a `docs/daily-progress.md` file with dated entries. Base each entry on real GitHub history or contemporaneous notes; do not backdate invented tasks or claim a member did work without their confirmation. In the demonstration, open the timeline and point out how progress, review, and CI evidence accumulate across days. If no daily record was kept, say that it is a gap and do not fabricate a retrospective daily log.

## Speaker preparation

Each member should rehearse their own section and verify its evidence link. A proposed role is only a speaking assignment; it does not replace the contribution statement or prove work. Each individual statement must identify that student's actual decisions, actions, outcomes, and links. Guo should narrate the implementation accurately, including the use of Codex assistance as disclosed in the repository and course policy.

## Suggested slide or screen sequence

1. Problem, stakeholders, boundary, and scope change.
2. Iteration 1 and Iteration 2 goals with linked backlog items.
3. Live entry and budget workflow.
4. Edit and cancel workflow.
5. Automated tests and Q1 note-rendering scenario.
6. GitHub timeline: issues, PRs, reviews, CI, and dated daily progress evidence.
7. Process measure, checklist improvement, limitations, and next step.

This outline is a rehearsal aid, not proof of a demonstration that has already happened. Record the actual date, attendees, questions, and follow-up actions after the session.
