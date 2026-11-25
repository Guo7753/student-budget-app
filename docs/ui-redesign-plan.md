# UI redesign plan (demonstration build)

This note records the planned interface changes for the team demonstration on 27 November 2026. It is the starting point of the `feature/ui-polish` branch; the implementation commits follow.

## Why

The current interface is functional but visually plain. The demonstration is assessed partly on how clearly the working software communicates its value, so the interface needs a stronger visual hierarchy without changing the underlying calculation rules that the tests already cover.

## Planned changes

1. **Layout and typography** - card-based sections, a consistent spacing scale, a readable type hierarchy, and aligned numeric values so amounts can be compared at a glance.
2. **Budget feedback** - a monthly budget usage indicator and clearer separation between fixed daily budget, monthly remaining, and daily remaining.
3. **Daily spending trend** - a line and area chart of spending per calendar day for the selected month, with the total, the average per day, the highest day, and a dashed reference line for the fixed daily budget.
4. **English month selector** - the month to view is a labelled list of month names instead of the browser's locale-dependent month control, so the interface reads the same on every machine used for the demonstration.
5. **Category insight** - a clearer chart presentation with the same ten categories used by the entry form, including an explicit empty state.
6. **Entry workflow** - inline validation feedback, a visible calculation preview, a compact calculator affordance, and clear edit/cancel modes.
7. **Responsiveness** - single-column layout on narrow screens, two-column layout on laptop widths.
8. **Accessibility and interaction** - visible focus states, keyboard support for the calculator, accessible labels, and reduced reliance on colour alone.
9. **Empty and loading states** - guided first-use messages instead of blank panels.
10. **Two pages with navigation** - a **Data** page for month selection, summary cards, budget setting, expense entry and the month's expense list; and an **Insights** page for analysis. Page switching keeps the selected month and day.
11. **Expandable detail panels** - the summary cards open panels that explain their figure: a balance timeline, a month-end budget projection, the daily-budget calculation and its fixed behaviour, and the selected day's expenses. Over-budget days use a red treatment plus a visible marker so the meaning does not depend on colour alone.
12. **Insights content** - the daily spending trend and the month calendar are combined into one card, so a day's total, the shape of the month, and whether each day stayed within the daily budget are read together. A category-share donut chart replaces the previous horizontal bars, with a ranked legend showing amount and percentage, which reduces visual noise while keeping the comparison readable.

## Constraints

- The calculation rules in `src/budget.js` and their existing tests must keep the same behaviour: fixed daily budget, integer-cent arithmetic, ten categories, validated expressions, edit-in-place semantics.
- Any new logic added by the redesign receives its own automated test.
- No new runtime dependency: the application stays dependency-free and runs with `npm start` and `npm test`.
- The demonstration must still be reproducible offline from a local checkout.

## Review checklist

The pull request will be reviewed against `docs/pr-review-checklist.md`, which asks for the requirement, changed files, `npm test`, the note-rendering quality scenario, the reviewer and timestamp, and the review outcome.
