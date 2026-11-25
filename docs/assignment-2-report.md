# Student Budget Assignment 2 Evaluation Report

**CISE Assignment 2 | Group report | 22 November 2026**

**Members and student IDs:**  
Guo HouYang (team lead): 25307753  
Li Hao: 25307493  
Chen GuangYuan: 25307711  
Shang JiaLe: 25307221  
**Repository:** https://github.com/Guo7753/student-budget-app  
**Working branch:** `feature/assignment-2-final`  

## 1. Project scope and iteration approach

Student Budget is a browser application for students who want a low-effort view of everyday spending. The product records an amount, date, category, and optional note; shows the selected month's records and category spending; and keeps a starting balance and a monthly budget in browser localStorage. The stated boundary remains a personal coursework prototype. It does not process payments, connect to a bank, manage shared accounts, or provide financial advice. Browser-local storage is convenient for a short project but can be cleared and is not an appropriate production data store.

Assignment 1 selected an iterative and incremental approach because the useful form of spending feedback was uncertain. The Assignment 2 work retained that choice. Instead of attempting receipt extraction, the team delivered a usable manual-entry flow, then refined it after requests for clearer budgeting and quicker data entry. The resulting scope change was recorded in the backlog: B6 added a starting balance, month-specific budget, fixed daily budget, daily remaining value, and ten icon-labelled categories; B7 added arithmetic entry such as `12+3`; and B3 became a category chart. The second iteration completes B4, allowing a stored record to be corrected. Receipt assistance remains deferred because it adds privacy, extraction-accuracy, and data-handling risks without improving the priority manual flow.

The group used short backlog items, GitHub Issues and pull requests, a separate validation and calculation module, Node's test runner, and GitHub Actions. The design keeps calculations in `src/budget.js`, separated from browser rendering in `src/app.js`. This made calculator, monthly-total, category, daily-budget, and edit behaviour testable without browser setup. The UI builds note text with `textContent`; that decision is also examined in the quality scenario below.

## 2. Iteration outcomes and traceability

Iteration 1 concentrated on visibility of spending. B6, B3, and B7 were implemented in PR 9. A student can set a monthly budget, see balance, monthly remaining, daily budget, and daily remaining, then add a record using a calculator expression. Daily budget is the monthly budget divided by calendar days and rounded to cents. It remains fixed when an expense is recorded; only the remaining values change. The category chart uses the same ten categories as the form and includes zero-value categories, reducing the chance that an unrepresented category silently disappears.

The acceptance tests passed for calculator evaluation, invalid-expression rejection, category aggregation, calendar-day calculation, settings validation, and the fixed-daily-budget rule. Chen GuangYuan reviewed PR 9. The GitHub Actions run linked from the Iteration 1 record passed. Each of the three completed Iteration 1 backlog items had an Issue, the PR, named tests, and a CI link, giving traceability completeness of 3/3 for that increment. This is a completeness measure rather than a measure of code quality: it confirms that a reader can follow evidence, not that every defect was found.

Iteration 2 implements B4. Selecting Edit beside a record copies the amount, date, category, and note into the form and changes the primary action to Update expense. A valid update keeps the record ID, so the list, chart, and summaries use the corrected item rather than a duplicate. Cancel edit resets the form and leaves storage unchanged. Two new tests cover a valid correction and invalid or unknown record IDs. The local test command passed 14 tests after the change on 22 November 2026. A local browser check also confirmed the edit and cancel paths.

| Requirement | Requirement source | Implementation and review | Test or check | Outcome |
| --- | --- | --- | --- | --- |
| B6 budget dashboard | Issue 8 | PR 9, Chen review | settings and budget-summary tests | Passed |
| B3 category chart | Issue 4 | PR 9, Chen review | category-total test | Passed |
| B7 calculator | Issue 10 | PR 9, Chen review | parser and rejection tests | Passed |
| B4 record editing | Issue 5 | local branch; final PR review pending | edit and invalid-edit tests; browser check | Passed locally |

The B4 branch is deliberately reported as locally complete but not yet as a reviewed GitHub change. Before submission, the record needs its pull-request link, Actions run, reviewer result, and fixed merge commit. This distinction prevents planned or local work being represented as repository evidence.

## 3. Software quality evidence

The automated suite tests the core calculations and validation boundary. It accepts valid expenses, rejects zero, negative, malformed, non-finite, and over-limit amounts, rejects nonexistent calendar dates, verifies deletion, validates settings, checks leap-year month lengths, and confirms that calculator and editing results are stored as numeric values. The 14-test run is repeatable with `npm test` on Node.js 18 or later and requires no package download. These focused tests support confidence in the pure logic, although they do not replace cross-browser, accessibility, or persistence-failure testing.

The selected quality scenario, Q1, concerns note rendering. A user-supplied note could resemble markup; rendering it as HTML would make the list misleading or create an injection route. The test environment was Student Budget served locally with Node.js, Microsoft Edge on Windows, on 22 November 2026. The tester entered amount `12+3`, date `2026-11-22`, category Food, and note `<b>test</b>`, then saved the record. The expected result was a NZD 15.00 Food entry with the literal characters `<b>test</b>` visible. The observed result matched: the characters displayed as text and were not bold. This is consistent with the UI's use of `textContent`. The result covers this one display path only. It does not demonstrate security against malicious extensions, localStorage manipulation, server endpoints, or a future OCR integration.

## 4. Process improvement and collaboration evaluation

The Assignment 1 workflow provided an earlier review interval of about 125.4 hours for PR 2. Shang JiaLe recorded about 26.1 hours to first review for PR 9. The shorter later interval is encouraging but cannot show that a particular practice caused improvement because task sizes, reviewer availability, and the number of reviewers differed. The prior evidence did show a practical coordination problem: a reviewer did not have a concise, consistent statement of acceptance criteria, test command, quality scenario, and requested response window.

The retrospective therefore selected a small process change for Iteration 2: a pull-request review checklist and a requested 24-hour review window. The checklist names the requirement, changed files, `npm test`, Q1 scenario, review timestamp, and review rounds. It improves the review request by making the expected evidence visible before a teammate begins reading code. This is a deliberately lightweight practice for a small team. A longer meeting-heavy process would add coordination cost, while no checklist makes review evidence easier to omit.

The improvement is implemented as a repository artefact, but its effect is not yet measurable because the B4 branch has not received a new teammate review. The final comparison should add the B4 opening time, first-review time, review rounds, and traceability result. It should then compare the two values while reporting scope and reviewer-availability differences. If review cannot occur before the assessment, the report should retain this limitation rather than claim a time improvement. The next practical change would be to schedule the reviewer when the pull request is opened, rather than merely requesting a window.

## 5. Evaluation of methods and tools

The original iterative choice remains appropriate. Plan-driven development would have offered a stable sequence of requirements, detailed design, and verification before implementation. That approach is valuable when requirements are regulated, safety-critical, or expensive to change. For Student Budget, feedback changed the interface priorities quickly: the dashboard, fixed daily budget, calculator, and category chart were more useful than the optional receipt experiment. An iterative approach allowed that ordering to change while retaining explicit acceptance criteria and a documented scope change. Dybå and Dingsøyr (2008) caution that evidence about agile practices is context-dependent; the group therefore does not attribute the successful feature changes to an agile label alone. Serrador and Pinto (2015) found an association between agile use and project efficiency and stakeholder satisfaction across many projects, but that evidence does not predict a small coursework outcome.

The team used GitHub Issues and pull requests with automated Node tests. Compared with unstructured file sharing, this creates a visible path from requirement to code, review, and test. Modern code review can expose knowledge gaps and defects, but also has practical limits such as reviewer availability and incomplete context (Bacchelli & Bird, 2013). The review checklist responds to that limit by reducing the context a reviewer must reconstruct. Compared with pair programming, asynchronous pull-request review better suits members working at different times; pair programming could provide faster feedback for a complex calculation change, but requires simultaneous availability. The project used automated unit tests for deterministic calculations because they are quick to run in CI. A browser-based end-to-end suite would add stronger interaction coverage, but it would increase setup and maintenance for a short, zero-dependency prototype. The local browser checks therefore complement, rather than replace, the logic tests.

## 6. Limitations and conclusion

The working increment now supports budget setting, calculator-assisted entry, category insight, deletion, and correction of expenses. The evidence includes automated tests, a targeted browser check, PR 9 review activity, and an explicit process-improvement artefact. The project remains limited by browser-local data, no income entry, no receipt extraction, and incomplete B4 repository review evidence. The final submission should use a fixed commit after the B4 pull request, Actions run, and teammate review are added. The group should demonstrate the manual workflow, test result, literal-note Q1 scenario, and evidence limitation directly rather than describing a larger system than was built.

## References

Bacchelli, A., & Bird, C. (2013). Expectations, outcomes, and challenges of modern code review. *Proceedings of the 2013 International Conference on Software Engineering*, 712-721. https://doi.org/10.1109/ICSE.2013.6606617

Dybå, T., & Dingsøyr, T. (2008). Empirical studies of agile software development: A systematic review. *Information and Software Technology, 50*(9-10), 833-859. https://doi.org/10.1016/j.infsof.2008.01.006

Serrador, P., & Pinto, J. K. (2015). Does agile work? A quantitative analysis of agile project success. *International Journal of Project Management, 33*(5), 1040-1051. https://doi.org/10.1016/j.ijproman.2015.01.006
