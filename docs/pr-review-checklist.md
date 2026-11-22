# Pull request review checklist

Copy this checklist into the description of an Assignment 2 pull request before requesting review.

- [ ] Link the backlog item or Issue and restate the acceptance criteria.
- [ ] Name the changed files and any scope change.
- [ ] Run `npm test` and link the GitHub Actions result when available.
- [ ] State the quality scenario to check and the expected outcome.
- [ ] Request a teammate review within 24 hours and record the first-review timestamp.
- [ ] Record review rounds, required changes, and the final outcome in the iteration record.

For the B4 edit-record change, a reviewer should confirm that Edit loads the existing details, Update keeps the same record identity, invalid updates are rejected, and Cancel edit changes nothing. The Q1 scenario is to save `<b>test</b>` as a note and verify that it remains literal text in the list.
