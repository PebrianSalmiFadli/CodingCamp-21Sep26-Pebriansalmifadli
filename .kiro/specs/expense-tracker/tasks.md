# Implementation Plan: Expense Tracker

## Overview

Build a single-page, client-side expense tracker using HTML, CSS, and Vanilla JavaScript with no framework or build step. The app persists data in `localStorage`, renders a Chart.js pie chart via CDN, and runs directly from the file system. Implementation follows the controller/service architecture defined in the design document, progressing from project scaffolding through data layer, pure logic services, UI rendering, event wiring, and visual polish.

## Tasks

- [ ] 1. Scaffold project file structure
  - Create `index.html` at the project root, `css/style.css`, and `js/app.js` — exactly the three files defined in the design
  - `index.html` must include: a `<link>` to `css/style.css`, a Chart.js CDN `<script>` tag (v4), and a deferred `<script>` tag for `js/app.js`
  - Add semantic HTML landmarks: a `<header>` for the balance display, a `<main>` containing the input form, transaction list, and chart canvas, and a fixed `<div id="notification">` at the bottom of the viewport
  - Add the category dropdown with exactly three `<option>` values: Food, Transport, Fun (plus a default placeholder option)
  - Add inline error placeholder elements (`<span class="error">`) beneath each form field for Requirement 1.5
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Implement data models and StorageService
  - [x] 2.1 Define the Transaction, CategoryTotals, and ValidationResult data shapes as JSDoc `@typedef` comments at the top of `js/app.js`
    - Transaction: `{ id, name, amount, category, createdAt }` as specified in the design
    - _Requirements: 7.6_

  - [x] 2.2 Implement `StorageService.load()` and `StorageService.save(transactions)`
    - Use the storage key `"expense_tracker_transactions"`
    - Wrap `JSON.parse` in `try/catch`; return `[]` on any failure
    - Wrap `JSON.stringify` / `setItem` in `try/catch`; call `UIRenderer.showNotification` on failure (non-blocking)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 2.3 Write property test for StorageService round-trip
    - **Property 3: Transaction serialization round-trip**
    - Use fast-check to generate arbitrary `Transaction[]` arrays; assert `StorageService.load()` after `StorageService.save()` produces a deeply equal array
    - Tag: `// Feature: expense-tracker, Property 3: Transaction serialization round-trip`
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 3. Implement Validator
  - [x] 3.1 Implement `Validator.validateForm(name, amount, category)` returning `{ valid, errors }`
    - Name: non-empty after `trim()`, maximum 100 characters
    - Amount: parses as finite number, in range `[0.01, 999_999_999.99]` inclusive
    - Category: must be one of `"Food"`, `"Transport"`, `"Fun"`
    - Return a human-readable error string per failing field; `valid: true` only when all three pass
    - _Requirements: 1.4, 1.5_

  - [ ]* 3.2 Write property test for Validator — valid inputs always pass
    - **Property 1 (partial): Valid inputs produce `valid: true`**
    - Use fast-check to generate valid name/amount/category combinations; assert `valid === true` and `errors` is empty
    - Tag: `// Feature: expense-tracker, Property 1: Form submission with valid inputs always grows the transaction list`
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 3.3 Write property test for Validator — invalid inputs always fail
    - **Property 2: Whitespace-only and out-of-range inputs are always rejected**
    - Use fast-check to generate inputs with whitespace-only names, out-of-range amounts, or missing category; assert `valid === false` and the relevant error key is present
    - Tag: `// Feature: expense-tracker, Property 2: Whitespace-only and out-of-range inputs are always rejected`
    - **Validates: Requirements 1.4, 1.5**

- [x] 4. Implement TransactionService
  - [x] 4.1 Implement `TransactionService.roundAmount(value)`
    - Half-up rounding to 2 decimal places (e.g., `1.005 → 1.01`, `1.004 → 1.00`)
    - _Requirements: 4.6_

  - [ ]* 4.2 Write property test for `roundAmount` idempotence
    - **Property 6: Amount rounding is idempotent**
    - Use fast-check to generate arbitrary finite floats; assert `roundAmount(roundAmount(x)) === roundAmount(x)`
    - Tag: `// Feature: expense-tracker, Property 6: Rounding idempotence`
    - **Validates: Requirements 4.6**

  - [x] 4.3 Implement `TransactionService.create(name, amount, category)`
    - Generate `id` via `crypto.randomUUID()` with `Date.now().toString()` fallback
    - Store `createdAt` as ISO 8601 string
    - Apply `roundAmount` to `amount` before storing
    - Return a complete `Transaction` object
    - _Requirements: 1.3, 4.6_

  - [x] 4.4 Implement `TransactionService.remove(transactions, id)`
    - Return a new array containing all transactions except the one matching `id`, preserving relative order
    - _Requirements: 3.3_

  - [ ]* 4.5 Write property test for deletion preserving others
    - **Property 7: Deletion preserves all other transactions**
    - Use fast-check to generate a non-empty `Transaction[]` and a random valid ID from that list; assert the result contains all other entries in the same relative order
    - Tag: `// Feature: expense-tracker, Property 7: Deletion preserves all other transactions`
    - **Validates: Requirements 3.3**

  - [x] 4.6 Implement `TransactionService.sortByDate(transactions)`
    - Return a new array sorted by `createdAt` descending (most recent first)
    - _Requirements: 2.1_

  - [ ]* 4.7 Write property test for sort order
    - **Property 8: Transaction list is always sorted descending by date**
    - Use fast-check to generate arbitrary `Transaction[]`; assert every adjacent pair `[a, b]` satisfies `a.createdAt >= b.createdAt`
    - Tag: `// Feature: expense-tracker, Property 8: Transaction list is always sorted descending by date`
    - **Validates: Requirements 2.1**

  - [x] 4.8 Implement `TransactionService.calcBalance(transactions)`
    - Return the arithmetic sum of all `amount` fields rounded to 2 decimal places; return `0` for an empty array
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.9 Write property test for balance calculation
    - **Property 4: Balance equals the sum of all transaction amounts**
    - Use fast-check to generate `Transaction[]` with amounts in valid range; assert `calcBalance` equals `sum(amounts)` rounded to 2 dp
    - Tag: `// Feature: expense-tracker, Property 4: Balance equals the sum of all transaction amounts`
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ] 4.10 Implement `TransactionService.calcCategoryTotals(transactions)`
    - Return `{ Food: number, Transport: number, Fun: number }` where each value is the sum of amounts for that category
    - _Requirements: 5.1_

  - [ ]* 4.11 Write property test for category totals partitioning balance
    - **Property 5: Category totals partition the balance**
    - Use fast-check to generate non-empty `Transaction[]`; assert `Food + Transport + Fun === calcBalance(transactions)`
    - Tag: `// Feature: expense-tracker, Property 5: Category totals partition the balance`
    - **Validates: Requirements 5.1**

- [ ] 5. Checkpoint — pure logic layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement UIRenderer
  - [ ] 6.1 Implement `UIRenderer.renderTransactionList(transactions)`
    - Sort transactions via `TransactionService.sortByDate` before rendering
    - Display each entry: item name truncated at 50 chars with ellipsis, amount formatted as currency to 2 dp with `$` symbol, category label
    - Render a delete button per entry with a `data-id` attribute
    - Render "N/A" for any missing required display field instead of crashing (Requirement 2.5)
    - Show the empty-state placeholder message when the array is empty (Requirement 2.4)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 6.2 Implement `UIRenderer.renderBalance(total)`
    - Format as `$X.XX` with exactly 2 decimal places
    - If `total` is `NaN` or `Infinity`, display `--` error indicator instead of a numeric value
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 6.3 Implement `UIRenderer.showFormErrors(errors)` and `UIRenderer.clearFormErrors()`
    - `showFormErrors`: inject error strings into the inline `<span class="error">` elements beneath each field
    - `clearFormErrors`: clear all error spans
    - _Requirements: 1.5_

  - [x] 6.4 Implement `UIRenderer.resetForm()`
    - Clear the item name field to empty string, clear the amount field, reset the category selector to its default placeholder option
    - _Requirements: 1.6_

  - [x] 6.5 Implement `UIRenderer.showNotification(message)`
    - Make `<div id="notification">` visible with the given message text for 4 seconds, then auto-hide
    - Must not block user interaction (CSS `pointer-events: none` while hidden)
    - _Requirements: 6.5, 6.6, 7.5_

- [ ] 7. Implement Chart.js pie chart rendering
  - [ ] 7.1 Implement `UIRenderer.renderChart(categoryTotals)`
    - Create a single `Chart` instance on first render; on subsequent calls mutate `chart.data` and call `chart.update()`
    - Destroy and recreate the instance when toggling between empty-state and data state (canvas visibility change)
    - Show only categories with amount > 0 as segments; label each segment with the category name and percentage rounded to 1 dp
    - Assign visually distinct, consistent colors to Food, Transport, and Fun (no two categories share the same color)
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 7.2 Implement the empty-state for the chart
    - When `categoryTotals` sums to 0, hide the canvas and show a text placeholder indicating no spending data is available
    - _Requirements: 5.4_

- [ ] 8. Implement event handlers and `init()`
  - [x] 8.1 Implement `handleFormSubmit(event)`
    - Prevent default form submission
    - Call `Validator.validateForm`; on failure call `UIRenderer.showFormErrors` and return
    - On success: call `UIRenderer.clearFormErrors`, `TransactionService.create`, push to the in-memory array, call `StorageService.save`, re-render list/balance/chart, call `UIRenderer.resetForm`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 4.2, 5.2, 6.1_

  - [ ]* 8.2 Write property test for form submission growing the transaction list
    - **Property 1: Form submission with valid inputs always grows the transaction list**
    - Use fast-check to generate valid input tuples; simulate the add flow against a local array; assert length increases by exactly 1
    - Tag: `// Feature: expense-tracker, Property 1: Form submission with valid inputs always grows the transaction list`
    - **Validates: Requirements 1.3**

  - [x] 8.3 Implement `handleDeleteClick(event)`
    - Identify the target transaction by reading `data-id` from the delete button
    - Display a confirmation prompt before deletion (Requirement 3.2)
    - On confirm: call `TransactionService.remove`, call `StorageService.save`, re-render list/balance/chart within 500 ms
    - On cancel: do nothing (Requirement 3.4)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.3, 5.3, 6.2_

  - [x] 8.4 Implement `init()`
    - Attach to `DOMContentLoaded`
    - Call `StorageService.load()` to hydrate the in-memory `transactions` array
    - If load returns `[]` due to a storage error, call `UIRenderer.showNotification` with an error message
    - Call `UIRenderer.renderTransactionList`, `UIRenderer.renderBalance`, `UIRenderer.renderChart` with initial state
    - Attach `handleFormSubmit` to the form's `submit` event
    - Attach `handleDeleteClick` to the transaction list via event delegation on `click`
    - _Requirements: 6.3, 6.4, 6.5_

- [ ] 9. Implement global error handling
  - Register a `window.onerror` handler that calls `UIRenderer.showNotification` with a generic error message and does not reload the page
  - Add a guard in `UIRenderer.renderTransactionList` for entries with missing fields (render "N/A" per field as required)
  - Add a guard in `UIRenderer.renderBalance` for `NaN`/`Infinity` totals (render `--`)
  - _Requirements: 2.5, 4.5, 7.5_

- [ ] 10. Checkpoint — functional app complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement responsive CSS and visual design
  - [ ] 11.1 Write base layout styles in `css/style.css`
    - Apply a mobile-first layout using CSS Flexbox or Grid; ensure the app is fully usable at 320 px minimum viewport width
    - No horizontal scrolling or content overflow at any viewport width from 320 px to 1920 px
    - All interactive controls (buttons, inputs, dropdowns) must remain reachable without horizontal scroll
    - _Requirements: 8.4_

  - [ ] 11.2 Implement typographic hierarchy and color contrast
    - Use a minimum of 2 distinct font sizes; the heading must be at least 4 px larger than body text
    - All text-to-background color contrast must meet WCAG 2.1 AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
    - _Requirements: 8.3_

  - [ ] 11.3 Apply per-category colors
    - Assign a visually distinct color to Food, Transport, and Fun in both the Transaction_List entries and the Chart segments
    - No two categories may share the same color
    - _Requirements: 8.3_

  - [ ] 11.4 Style the notification element
    - Position `<div id="notification">` fixed at the bottom of the viewport
    - Hidden by default (`opacity: 0; pointer-events: none`), visible for 4 seconds via a CSS transition or class toggle
    - _Requirements: 6.5, 6.6_

  - [ ] 11.5 Style the empty-state placeholders
    - Style the transaction list empty-state message (Requirement 2.4) and chart empty-state placeholder (Requirement 5.4) to be clearly visible and visually distinct from data rows
    - _Requirements: 2.4, 5.4_

- [ ] 12. Cross-browser verification
  - [ ] 12.1 Verify the app opens via `file://` protocol in Chrome, Firefox, Edge, and Safari without console errors or warnings
    - Check that `crypto.randomUUID()` is available or the fallback (`Date.now().toString()`) is triggered correctly
    - _Requirements: 7.3, 7.4_

  - [ ] 12.2 Verify all acceptance criteria pass in each target browser
    - Add a transaction → confirm it appears in the list, balance updates, chart updates
    - Delete a transaction → confirm confirmation prompt, entry removed, balance and chart update within 500 ms
    - Reload the page → confirm all persisted transactions are restored
    - Resize viewport to 320 px → confirm no horizontal scroll and all controls are reachable
    - _Requirements: 7.4, 8.1, 8.2_

- [ ] 13. Final checkpoint — all tests pass and cross-browser verified
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; the property-based tests use [fast-check](https://github.com/dubzzz/fast-check) and target only pure functions in `js/app.js`
- Each task references specific requirements for traceability
- `StorageService.save` is always called before the UI is re-rendered (write-before-render pattern from design)
- The single Chart.js instance lifecycle (create → mutate → update → destroy on empty-state toggle) is critical for avoiding canvas memory leaks
- `crypto.randomUUID()` is available in all modern browsers over `https://` and `file://` in Chromium-based browsers; the `Date.now().toString()` fallback covers older Safari

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.3", "3.2", "3.3", "4.2", "4.3"] },
    { "id": 3, "tasks": ["4.4", "4.6", "4.8", "4.10"] },
    { "id": 4, "tasks": ["4.5", "4.7", "4.9", "4.11", "6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["7.1", "7.2", "8.1", "8.3"] },
    { "id": 6, "tasks": ["8.2", "8.4"] },
    { "id": 7, "tasks": ["9"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 9, "tasks": ["12.1", "12.2"] }
  ]
}
```
