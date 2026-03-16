# Playwright Drag-and-Drop DOM Test

## Overview

This project uses **Playwright** to automate testing of **drag-and-drop functionality on a web page using DOM elements**.
The script reads the content of the page, compares it with predefined **question and answer templates**, determines which items match, and then performs automated drag-and-drop actions to place the correct answers in the specified positions.

The system is designed to be flexible so that different question/answer sets can be used by simply updating template files.

---

## How It Works

1. **Load Web Page**

   * Playwright opens the target webpage.
   * The script reads all relevant DOM elements that contain questions and answers.

2. **Parse Page Content**

   * The script extracts the text or identifiers of draggable elements from the page.

3. **Compare With Templates**

   * The extracted content is compared against predefined **question and answer templates**.

4. **Match Questions and Answers**

   * The system determines which question corresponds to which answer.

5. **Perform Drag-and-Drop**

   * Once the match is found, Playwright performs the drag-and-drop action to move the correct answer to the designated question slot.

---

## Template Configuration

Question and answer templates are stored in:

```
tests/assets/templates
```

You can modify or add new template sets to support different question groups.

### Naming Convention

Each template set must follow this naming rule:

| Type              | File Naming       |
| ----------------- | ----------------- |
| Question Template | `template_name_Q` |
| Answer Template   | `template_name_A` |

Example:

```
tests/assets/templates/
    biology_Q.json
    biology_A.json
```

* `*_Q` → Contains **questions**
* `*_A` → Contains **answers**

The system will automatically load and match templates that share the same base filename.

---

## Project Structure

```
project/
│
├─ tests/
│   ├─ dragdrop.spec.ts
│   └─ assets/
│       └─ templates/
│           ├─ sample_Q.json
│           └─ sample_A.json
│
├─ playwright.config.ts
└─ README.md
```

---

## Running the Test

Install dependencies:

```
npm install
```

Run Playwright test:

```
npx playwright test
```

---

## Notes

* Ensure that the **question and answer templates correspond to the content on the webpage**.
* Template files must follow the naming convention for the system to match them automatically.
* Drag-and-drop behavior depends on DOM selectors defined inside the test scripts.

---

## Purpose

This automation helps verify that:

* Drag-and-drop interactions work correctly.
* Questions and answers are placed in the correct positions.
* Different question sets can be tested automatically using configurable templates.

---
