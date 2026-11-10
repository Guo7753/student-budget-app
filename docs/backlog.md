# Prioritised backlog and iteration plan

Project goal: help a university student record everyday expenses and understand monthly spending with minimal setup. The lecturer must approve this topic before it becomes the group's official project.

| ID | Priority | User story and acceptance criteria | Planned owner | Iteration |
| --- | --- | --- | --- | --- |
| [B1](https://github.com/Guo7753/student-budget-app/issues/1) | Must | As a student, I can save an expense with amount, date, category, and optional note. A valid entry appears after saving and after reload. Zero, negative, or missing amount cannot be saved. | Guo, with Chen reviewing interaction | 1 |
| [B2](https://github.com/Guo7753/student-budget-app/issues/3) | Must | As a student, I can see expenses for a selected month and delete one. The deleted entry disappears and the total changes. | Guo, with Li testing | 1 |
| [B3](https://github.com/Guo7753/student-budget-app/issues/4) | Must | As a student, I can see total spending by category for a month. Given known fixtures, each category sum and overall sum are exact to two decimals. | Li, with Guo integrating | 2 |
| [B4](https://github.com/Guo7753/student-budget-app/issues/5) | Must | As a student, I can edit an incorrect record. After saving, both list and totals reflect the corrected values. | Chen, with Li testing | 2 |
| [B5](https://github.com/Guo7753/student-budget-app/issues/6) | Could | As a student, I can upload a sample receipt and see proposed date and amount. I can edit both, and nothing is saved until I confirm. If extraction fails, I can enter data manually. | Shang, with Guo reviewing | 2 stretch |
| [B6](https://github.com/Guo7753/student-budget-app/issues/8) | Must, added 10 Nov | As a student, I can set a starting balance and monthly budget, see a fixed daily budget and remaining amounts, and choose from ten icon-labelled categories. Adding an expense changes remaining amounts but not the daily budget. | Guo | 2 scope change |
| [B7](https://github.com/Guo7753/student-budget-app/issues/10) | Should, added 10 Nov | As a student, I can calculate a cost such as `12+3` inside the amount field, preview the result, and save NZD 15.00 as one expense. Invalid calculations cannot be saved. | Guo | 2 scope change |

Iteration 1 goal: a student can reliably enter, inspect, and delete expenses. Evaluation: B1 and B2 acceptance tests pass; one user completes the flow without help; a reviewed Pull Request and automated check are visible in GitHub.

Iteration 2 goal: a student can interpret and correct monthly spending. B6 and B7 were added on 10 November after user requests. B3 category totals are now proposed as a chart with the same ten categories as the expense form; B4 editing remains unimplemented. The iteration review must record the effect of this scope change; defer B5 first if time is short. Evaluate B3/B4 against known fixtures when implemented. Shang leads a reproducible security quality check using synthetic note inputs. The [Iteration 2 record](iteration-2-record.md) tracks actual outcomes separately from this plan.

Process and quality measures planned for Assignment 2:

| Measure | How to collect it in each iteration | Why it matters |
| --- | --- | --- |
| Traceability completeness | Count completed backlog items with linked Issue, PR, acceptance test, and CI result; divide by completed items | Shows whether a reviewer can follow each requirement to evidence |
| Review turnaround | Hours from PR opening to first teammate review; record a missing review explicitly | Reveals coordination delay that a process change may address |
| Review rework | Count review rounds and acceptance-criterion changes per PR | Helps interpret whether a faster review hid extra rework |

At the Iteration 1 retrospective, use the actual evidence to choose one specific improvement for Iteration 2, such as scheduling a review window or adding an acceptance checklist to the PR template. Record the change before applying it. Compare the same measures in both iterations and explain differences in task size, reviewer availability, and number of PRs; small samples do not prove causation.

Quality scenario for Iteration 2: [Q1](https://github.com/Guo7753/student-budget-app/issues/7) tests whether a note containing synthetic HTML such as `<b>test</b>` displays as literal text rather than markup. Shang records browser version, operating system, exact input, steps, screenshot or automated result, expected outcome, and observed outcome. This checks one relevant injection pathway, not overall application security. Use the [iteration record template](iteration-record-template.md) to preserve comparable evidence.

Definition of done: acceptance criteria met, automated tests pass, another member reviews the change, README or user guidance is updated if behavior changes, and the change is merged through a Pull Request. The current local proof of concept has automated tests but does not yet meet the review requirement.

Risks and responses:

| Risk | Effect | Response |
| --- | --- | --- |
| Scope grows beyond two short iterations | Core features remain incomplete | Keep B5 optional; finish must-have items first |
| Receipt extraction is inaccurate | Incorrect expense records | Require field confirmation; keep manual entry |
| Branch conflicts or uneven participation | Integration delays and weak contribution evidence | Small issues and branches, early PRs, named review and test activities |
| Receipt images contain personal data | Privacy harm | Use synthetic or consented samples; do not commit images or upload them to a third party without approval |
| Browser data is cleared | Records are lost | State the limitation in the prototype; investigate export or durable storage only if scope allows |

