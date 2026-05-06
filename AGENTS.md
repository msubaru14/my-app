# AGENTS.md

---

## ■ Purpose

This document defines the rules for Codex when working on this repository.

The goal is to ensure:

* Safe changes
* Consistent implementation
* Reviewable diffs
* Minimal unnecessary work

---

## ■ Project Overview

This is a task management application.

* Users can register and log in
* Tasks can be created, updated, and deleted
* Authentication is handled using JWT

Current phase:

* Refactoring and structure improvement (NOT feature development)

---

## ■ Tech Stack

* Backend: Go
* Frontend: React + TypeScript
* Authentication: JWT
* API: JSON-based HTTP API

---

## ■ Directory Structure

```txt
.
├── backend
│   ├── controller
│   ├── db
│   ├── dto
│   ├── middleware
│   ├── model
│   ├── pkg
│   ├── repository
│   ├── router
│   ├── service
│   └── utils
├── docs
└── frontend
    ├── public
    └── src
        ├── features
        │   ├── tasks
        │   │   ├── components
        │   │   ├── hooks
        │   │   ├── api
        │   │   └── types
        │   └── auth
        │       ├── components
        │       ├── hooks
        │       ├── api
        │       └── types
        ├── components
        ├── hooks
        ├── lib
        ├── constants
        └── types
```

### Rules

* Backend must follow layer structure (controller → service → repository)
* Frontend feature code must stay inside `features/{feature}`
* Shared code must stay in common directories
* Do not move files across layers unless instructed

### Frontend Feature Dependency Rules

* Feature public entry points must be `frontend/src/features/{feature}/index.ts`
* Code outside a feature should import that feature through `features/{feature}`
* Code outside a feature should not import directly from that feature's internal directories such as `components`, `hooks`, `api`, or `types`
* Code inside the same feature may use relative imports to its own internal directories
* Cross-feature dependencies should be kept minimal and explicit
* Dependencies on `auth` from business features such as `tasks` are allowed when using authentication as shared application infrastructure
* Reverse dependencies from `auth` to business features such as `tasks` are prohibited
* Do not expose additional feature internals from `index.ts` unless the task explicitly requires it

---

## ■ Core Principles

1. Preserve existing behavior
2. Keep tasks small
3. Do not modify outside scope
4. Do not mix concerns
5. Do not guess
6. Report uncertainties
7. Always report results

---

## ■ Priority Order

1. Safety
2. Readability
3. Maintainability
4. Extensibility
5. Speed

---

## ■ Investigation Rules (IMPORTANT)

* Read only necessary files
* Do not scan entire repo
* Do not open files "just in case"
* Keep investigation minimal

If needed:

* Explain why
* List target files

---

## ■ Task Scope Rules

* 1 PR = 1 purpose
* Keep changes small
* Define scope clearly
* Identify impact before changes

---

## ■ Change Size Control

- Prefer minimal diff
- Avoid touching multiple files unless necessary
- If change grows, stop and report

---

## ■ Refactoring Rules

* Do not change behavior
* Do not change UI
* Do not introduce new architecture
* Do not improve unrelated code

If issues found:

* Report separately

---

## ■ Implementation Rules

* Follow existing patterns
* Follow naming conventions
* Do not introduce new libraries
* Do not change coding style

---

## ■ Before Implementation

Before making changes:

- Summarize understanding of the task
- List target files
- Confirm scope

If any uncertainty exists:
- Ask before proceeding

---

## ■ Understanding Verification

Codex may perform understanding checks to prevent work from becoming a black box for the Commander.

This is an operational rule, not an implementation rule.
The purpose is not to test or pressure the Commander, but to keep the Commander able to explain the purpose, scope, and impact of changes.

Understanding checks should be performed when risk is high, such as:

* Changes affect authentication, authorization, error handling, or shared code
* Changes span multiple layers or features
* A design decision affects future refactoring direction
* Before creating a PR for changes with non-trivial impact

For low-risk or routine changes, understanding checks do not need to be performed every time.
Codex may perform them occasionally or randomly at natural stopping points to avoid excessive process overhead.

When performing an understanding check, Codex should briefly confirm:

* What changed
* Why it changed
* What behavior should remain unchanged
* What risks or review points exist

If the Commander has unclear points, Codex should explain before proceeding.

---

## ■ File Movement Rules

* Move only specified files
* Do not change logic
* Fix imports only
* Do not delete unrelated files
* Verify after move
* Do not delete files unless explicitly instructed

---

## ■ Error Handling Rules

* Frontend error control must be based on `result.type` returned from `useApiError`
* Do not branch by message text
* API `error.code` must be used for control logic
* API `error.message` may be used only as a display message candidate
* Validation errors should use `details[].message` or normalized `result.message`
* Minimal behavior changes are allowed to unify error handling and display
* Avoid unrelated UI changes while updating error handling
* Refer to `docs/frontend-error-handling.md` for the detailed policy

---

## ■ Prohibited Actions

Do NOT:

* Perform unrelated refactoring
* Change behavior
* Change architecture
* Read unrelated files
* Guess requirements
* Add dependencies
* Modify UI
* Combine concerns

---

## ■ Git Workflow Rules

* Always create a new branch from latest main
* Do not reuse old branches
* 1 branch = 1 purpose
* Verify diff before PR (`git diff origin/main`)
* Trust GitHub PR diff over local diff
* If history is broken, create a new branch

Do NOT:

* Mix multiple changes in one branch
* Commit unrelated files

---

## ■ Verification Rules

When performing frontend browser operation checks, refer to `docs/codex-browser-check.md`.

Use that document for:

* Local startup assumptions
* Browser operation method
* Check points
* Change-specific checks
* Result reporting format

In addition to the standard scenario, verify behavior that matches the actual change.

Examples:

* Each branch of a changed condition
* Guard behavior moved or reorganized by the change
* Boundary cases such as unauthenticated, invalid token, empty data, and API error states

If the document cannot be followed:

* Report what could not be verified
* Explain why
* Do not guess the result

---

## ■ Reporting Rules

After task completion, report:

* Purpose
* Changes
* Files changed
* Impact scope
* Verification
* Risk level
* Concerns

---

## ■ PR Template Integration (IMPORTANT)

Codex must follow the repository PR template.

* The PR template is located at `.github/pull_request_template.md`; read this file directly before creating a PR.
* Ensure all required sections are filled
* Ensure checklist items are verified
* Ensure scope rules are satisfied
* Ensure behavior is preserved

If any checklist item cannot be confirmed:

* Report explicitly

---

## ■ Issue Template Integration

When creating a bug report issue, Codex must follow the repository bug report template.

* The bug report template is located at `.github/ISSUE_TEMPLATE/bug_report.md`; read this file directly before creating a bug report issue.
* Fill in the issue using the template sections.
* Do not mix bug reports with refactoring or feature tasks.

---

## Encoding Rules

* Markdown, TypeScript, JavaScript, CSS, JSON, and Go files are UTF-8.
* When reading files in PowerShell, use `Get-Content -Encoding UTF8` for text files that may contain Japanese.
* Do not treat mojibake from the terminal output as file corruption until the file has been re-read as UTF-8.

---

## ■ When Unsure

Do not guess.

Instead report:

* What is unclear
* Why it matters
* Possible options
* Safest recommendation

---

## ■ Task Instructions Take Priority

Task instructions override this document when more specific.

---
