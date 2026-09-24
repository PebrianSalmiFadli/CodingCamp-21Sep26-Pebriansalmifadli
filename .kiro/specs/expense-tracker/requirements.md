# Requirements Document

## Introduction

The Expense Tracker is a client-side personal finance web application built with HTML, CSS, and Vanilla JavaScript. It allows users to record, categorize, and visualize their personal expenses entirely in the browser, with all data persisted via the browser's Local Storage API. No backend server or build tooling is required.

## Glossary

- **App**: The Expense Tracker web application as a whole.
- **Transaction**: A single expense entry recorded by the user, consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI section that displays all recorded Transactions.
- **Input_Form**: The HTML form through which the user enters a new Transaction.
- **Category**: A classification label for a Transaction. Valid values are: Food, Transport, Fun.
- **Balance_Display**: The UI element at the top of the App that shows the running total of all Transaction amounts.
- **Chart**: The pie chart that visualizes the distribution of spending across Categories.
- **Storage**: The browser's Local Storage API used to persist Transaction data.
- **Validator**: The client-side logic responsible for checking that all Input_Form fields are filled before submission.

---

## Requirements

### Requirement 1: Transaction Input

**User Story:** As a user, I want to enter an expense with a name, amount, and category so that I can record my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL include a text field for the item name (maximum 100 characters), a numeric field for the amount, and a dropdown selector for the category.
2. THE Input_Form's category selector SHALL offer exactly three options: Food, Transport, and Fun.
3. WHEN the user submits the Input_Form with all fields filled, THE App SHALL create a new Transaction and add it to the Transaction_List.
4. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a numeric value between 0.01 and 999,999,999.99 inclusive, and a category is selected.
5. IF the Validator detects that any required field is empty or the amount is not within the range 0.01 to 999,999,999.99, THEN THE Input_Form SHALL display a descriptive inline error message identifying the invalid field(s) and SHALL NOT create a Transaction.
6. WHEN a Transaction is successfully created, THE Input_Form SHALL reset all fields to their default empty state: item name field cleared to empty string, amount field cleared to empty, and category selector reset to its default unselected/placeholder option.

---

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see all my recorded expenses in a list so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all recorded Transactions sorted by Transaction date and time descending (most recent first).
2. THE Transaction_List SHALL display the item name (truncated at 50 characters with an ellipsis if longer), amount formatted as a currency value with exactly 2 decimal places and a currency symbol, and category for each Transaction.
3. WHILE the number of Transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable without truncating or hiding any Transaction entries.
4. WHEN the Transaction_List contains no Transactions, THE App SHALL display a placeholder message indicating that no expenses have been recorded yet.
5. IF a Transaction entry is missing one or more required display fields (item name, amount, or category), THEN THE Transaction_List SHALL render that entry with a visible indicator (such as "N/A") for each missing field and SHALL NOT crash or omit the entry.

---

### Requirement 3: Transaction Deletion

**User Story:** As a user, I want to delete an individual expense from the list so that I can correct mistakes.

#### Acceptance Criteria

1. THE Transaction_List SHALL render a delete control for each Transaction entry.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL display a confirmation prompt before removing the Transaction.
3. WHEN the user confirms deletion, THE App SHALL remove that Transaction from the Transaction_List within 500 milliseconds.
4. IF the user cancels the confirmation prompt, THEN THE App SHALL retain the Transaction in the Transaction_List unchanged.
5. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the new total within 500 milliseconds.
6. WHEN a Transaction is deleted, THE Chart SHALL update to reflect the new category distribution within 500 milliseconds.

---

### Requirement 4: Balance Display

**User Story:** As a user, I want to see my total spending at a glance so that I can understand how much I have spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all Transaction amounts formatted as a currency value with exactly 2 decimal places and a currency symbol.
2. WHEN a Transaction is added, THE Balance_Display SHALL update to reflect the new total within 1 second without requiring a page reload.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the new total within 1 second without requiring a page reload.
4. WHEN the Transaction_List is empty, THE Balance_Display SHALL show a value of $0.00 (or the equivalent in the chosen currency format).
5. IF the total balance cannot be calculated due to a data error, THEN THE Balance_Display SHALL display an error indicator and SHALL NOT show an incorrect numeric value.
6. WHEN a Transaction amount has more than 2 decimal places, THE App SHALL round the value to 2 decimal places using standard rounding (round half up) before storing and displaying it.

---

### Requirement 5: Spending Distribution Chart

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand where my money goes.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart representing the proportion of total spending attributable to each Category that has at least one Transaction, where each Category is represented by a distinct visual segment labeled with the Category name and its percentage of total spending rounded to one decimal place.
2. WHEN a Transaction is added, THE Chart SHALL update to reflect the new category distribution within 500 milliseconds without requiring a page reload.
3. WHEN a Transaction is deleted, THE Chart SHALL update to reflect the new category distribution within 500 milliseconds without requiring a page reload.
4. WHEN the Transaction_List is empty, THE Chart SHALL display a placeholder state containing a text message indicating no spending data is available, replacing the pie chart segments entirely.
5. WHEN a Category's total spending value is 0.00 due to all its Transactions being deleted, THE Chart SHALL remove that Category's segment from the pie chart display.
6. THE Chart SHALL render using Chart.js loaded via a CDN, requiring no local build step.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my expenses to be saved between browser sessions so that I do not lose my data when I close the tab.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE Storage SHALL serialize and persist the updated Transaction collection before the UI is updated to reflect the addition.
2. WHEN a Transaction is deleted, THE Storage SHALL serialize and persist the updated Transaction collection before the UI is updated to reflect the deletion.
3. WHEN the App initializes, THE App SHALL deserialize and load all previously persisted Transactions from THE Storage and render them in the Transaction_List, the Balance_Display, and the Chart within 2 seconds of page load.
4. IF THE Storage contains no persisted data on initialization, THEN THE App SHALL initialize with an empty Transaction collection, displaying zero items, a balance of $0.00, and no chart data points.
5. IF THE Storage read operation fails on initialization (e.g., access denied or corrupted data), THEN THE App SHALL initialize with an empty Transaction collection and display a non-blocking error notification to the user.
6. IF a Storage write operation fails after a Transaction is created or deleted, THEN THE App SHALL display a non-blocking error notification indicating the data could not be saved and SHALL retain the Transaction in the in-memory collection for the current session.

---

### Requirement 7: Project Structure and Code Quality

**User Story:** As a developer, I want the project files organized cleanly so that the codebase is easy to read and maintain.

#### Acceptance Criteria

1. THE App SHALL be structured with exactly one HTML file at the project root, exactly one CSS file inside a `css/` directory, and exactly one JavaScript file inside a `js/` directory.
2. THE App SHALL use only HTML, CSS, and Vanilla JavaScript with no JavaScript frameworks or build tools.
3. THE App SHALL function as a standalone file opened directly in a browser (file:// protocol) without requiring a local development server.
4. THE App SHALL operate correctly in the current stable versions of Chrome, Firefox, Edge, and Safari, where "operates correctly" means all acceptance criteria for all requirements pass without errors or console warnings in each browser.
5. IF any JavaScript runtime error occurs during normal user interaction, THEN THE App SHALL not crash or become unresponsive, and the affected interaction SHALL display an error indication to the user without requiring a page reload.
6. THE App's JavaScript file SHALL contain no unused functions or variables, and each function SHALL be limited to a single, clearly defined responsibility as indicated by its name matching its behavior.

---

### Requirement 8: Performance and Visual Design

**User Story:** As a user, I want the app to load quickly and look clean so that it is pleasant and efficient to use.

#### Acceptance Criteria

1. THE App SHALL render the initial UI and display all persisted Transactions within 2 seconds of the page load event completing on a connection with a minimum download speed of 25 Mbps.
2. THE App SHALL update the UI state (form submission result, deletion confirmation) within 100 milliseconds of the triggering user interaction event.
3. THE App SHALL apply a consistent visual style where: typographic hierarchy uses a minimum of 2 distinct font sizes with the heading at least 4px larger than body text; all text-to-background color contrast meets WCAG 2.1 AA ratio of at least 4.5:1 for normal text and 3:1 for large text; and each Category in the Transaction_List and Chart is assigned a visually distinct color such that no two Categories share the same color.
4. THE App SHALL be fully usable on viewport widths from 320px to 1920px without horizontal scrolling or content overflow, where "fully usable" means all interactive controls (buttons, inputs, dropdowns) are reachable and operable without requiring horizontal scroll.
