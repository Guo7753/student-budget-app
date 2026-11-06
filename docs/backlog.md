# Prioritised backlog and iteration plan

Project goal: help a university student record everyday expenses and understand monthly spending with minimal setup. The lecturer must approve this topic before it becomes the group's official project.

| ID | Priority | User story and acceptance criteria | Planned owner | Iteration |
| --- | --- | --- | --- | --- |
| B1 | Must | As a student, I can save an expense with amount, date, category, and optional note. A valid entry appears after saving and after reload. Zero, negative, or missing amount cannot be saved. | Guo, with Chen reviewing interaction | 1 |
| B2 | Must | As a student, I can see expenses for a selected month and delete one. The deleted entry disappears and the total changes. | Guo, with Li testing | 1 |
| B3 | Must | As a student, I can see total spending by category for a month. Given known fixtures, each category sum and overall sum are exact to two decimals. | Li, with Guo integrating | 2 |
| B4 | Should | As a student, I can edit an incorrect record. After saving, both list and totals reflect the corrected values. | Chen, with Li testing | 2 |
| B5 | Could | As a student, I can upload a sample receipt and see proposed date and amount. I can edit both, and nothing is saved until I confirm. If extraction fails, I can enter data manually. | Shang, with Guo reviewing | 2 stretch |

Iteration 1 goal: a student can reliably enter, inspect, and delete expenses. Evaluation: B1 and B2 acceptance tests pass; one user completes the flow without help; a reviewed Pull Request and automated check are visible in GitHub.

Iteration 2 goal: a student can interpret and correct monthly spending. Evaluation: B3 and B4 tests pass for a known fixture; at least one user checks the category summary. B5 begins only if the must-have work is done and the team has time to test error handling and privacy.

Definition of done: acceptance criteria met, automated tests pass, another member reviews the change, README or user guidance is updated if behavior changes, and the change is merged through a Pull Request. The current local proof of concept has automated tests but does not yet meet the review requirement.

Risks and responses:

| Risk | Effect | Response |
| --- | --- | --- |
| Scope grows beyond two short iterations | Core features remain incomplete | Keep B5 optional; finish must-have items first |
| Receipt extraction is inaccurate | Incorrect expense records | Require field confirmation; keep manual entry |
| Branch conflicts or uneven participation | Integration delays and weak contribution evidence | Small issues and branches, early PRs, named review and test activities |
| Receipt images contain personal data | Privacy harm | Use synthetic or consented samples; do not commit images or upload them to a third party without approval |
| Browser data is cleared | Records are lost | State the limitation in the prototype; investigate export or durable storage only if scope allows |

