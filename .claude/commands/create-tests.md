# Create Tests

> Auto-generate meaningful test suites from code analysis — unit tests, integration tests, and edge cases.

## Variables

target: $ARGUMENTS (optional — a specific file, directory, or focus area. Default: analyze the project and generate tests for key modules)

## Instructions

You are generating a test suite for this project. Your goal is to produce tests that catch real bugs and verify real behavior — not tests that exist just for coverage numbers.

**Important:** This command creates test files and optionally a test configuration. It does NOT modify application code. If existing tests are found, it adds to them rather than replacing them.

---

### Phase 1: Project Analysis

1. **Read project context:**
   - Read `./CLAUDE.md` and `./context/` for project understanding
   - Read any existing harden reports in `./outputs/` — these contain known issues that should become test cases

2. **Detect the tech stack:**
   - Check package files (package.json, requirements.txt, Cargo.toml, go.mod, pyproject.toml, Gemfile, etc.)
   - Identify the language, framework, and existing test tooling
   - Check for existing test configuration (jest.config, pytest.ini, vitest.config, .mocharc, etc.)
   - Look for existing tests — note patterns, conventions, file locations

3. **Identify the test framework:**
   - If tests already exist: use the same framework and patterns
   - If no tests exist, recommend based on stack:
     - JavaScript/TypeScript: Vitest (preferred) or Jest
     - Python: pytest
     - Go: built-in testing package
     - Rust: built-in #[test]
     - Ruby: RSpec or Minitest
   - Confirm with the user if no existing framework is found

4. **Map testable surface:**
   - If `$ARGUMENTS` specifies a target: focus on that file/directory
   - If no target: identify the most critical modules:
     - Entry points and main logic
     - API endpoints / route handlers
     - Data transformation functions
     - Business logic / domain models
     - Utility functions with complex logic
     - Authentication / authorization flows
   - Prioritize: functions with side effects, complex branching, and external boundaries

Summarize: "This is a [stack] project using [test framework]. I'll generate tests for [target areas]. [N] existing tests found."

---

### Phase 2: Test Strategy

Before writing tests, define the strategy:

1. **Categorize test types needed:**
   - **Unit tests:** Pure functions, data transformations, business logic
   - **Integration tests:** API endpoints, database operations, service interactions
   - **Edge case tests:** Boundary values, error paths, null/undefined handling
   - **Regression tests:** Tests derived from harden report findings (if any)

2. **Identify what to mock vs. what to test directly:**
   - Mock: external APIs, databases, file system, network calls
   - Don't mock: internal business logic, data transformations, pure functions
   - Use the project's existing mocking patterns if they exist

3. **Set coverage targets:**
   - Critical paths (auth, payments, data mutations): aim for thorough coverage
   - Utilities and helpers: test the non-obvious cases
   - UI components (if applicable): test behavior, not implementation details

Write a brief test plan (not saved — just for guiding the next phase).

---

### Phase 3: Generate Tests

Write the test files following the project's conventions.

**For each test file:**

1. Read the source file being tested — understand every function, branch, and edge case
2. Write tests in order of importance:
   - **Happy path:** Does the normal case work?
   - **Error cases:** Does it handle failures correctly?
   - **Edge cases:** Boundaries, empty inputs, large inputs, special characters
   - **Regression:** If harden reports found issues in this file, write tests that would catch them

**Test quality rules:**

- **Test behavior, not implementation.** Tests should not break when internal refactoring happens.
- **Each test should test one thing.** Clear test names that describe the expected behavior.
- **No testing of framework code.** Don't test that Express routes or React renders — test YOUR logic.
- **Meaningful assertions.** Don't just assert "no error" — assert the correct return value, state change, or side effect.
- **DRY setup, not DRY assertions.** Share setup code (beforeEach, fixtures), but keep each test's assertions explicit.
- **No snapshot tests** unless the user specifically asks for them — they're brittle and low-value.

**Naming conventions:**
- Follow existing test file naming in the project
- If none: `[filename].test.[ext]` or `[filename]_test.[ext]` (match language convention)
- Place tests next to source files or in a `__tests__`/`tests`/`test` directory (match existing pattern)

**If creating test infrastructure:**
- Only create config files if none exist
- Install test dependencies if needed (add to package.json devDependencies, requirements-dev.txt, etc.)
- Create a minimal test runner script if the project has no `test` command

---

### Phase 4: Harden Report Integration

**If harden reports exist in `./outputs/harden-report-*.md`:**

1. Read the most recent harden report
2. For each Critical and High finding that relates to testable code:
   - Create a regression test that would catch the issue
   - Comment the test with a reference: `// Regression: Harden finding C1 — SQL injection in user query`
3. For Medium findings: create tests where straightforward

This closes the loop: `/harden` finds issues → `/create-tests` ensures they stay fixed.

---

### Phase 5: Validate & Report

1. **Run the tests** to verify they pass:
   - Execute the test runner command
   - If any tests fail: investigate whether the test is wrong or the code has a bug
   - Fix test issues (not code bugs — those go through `/create-plan`)
   - If a test reveals an actual bug: note it in the report but don't fix the application code

2. **Generate a coverage report** if the framework supports it

3. **Present the results:**

```
## Test Generation Complete

### Summary
- **Files created:** [count]
- **Tests written:** [count]
- **Test types:** [unit: N, integration: N, edge case: N, regression: N]
- **Framework:** [framework name]

### Test Files
- `path/to/file.test.ts` — [N] tests covering [module name]
- `path/to/file.test.ts` — [N] tests covering [module name]

### Coverage
- [coverage summary if available]

### Regression Tests from Harden Reports
- [N] tests created from harden findings
- Findings covered: [list finding IDs]

### Bugs Discovered
- [Any actual bugs found during test writing — recommend /create-plan to fix]

### Recommended Next Steps
1. Review generated tests for accuracy
2. Add to CI pipeline: `[test command]`
3. Run `/harden` to verify coverage of known issues
```

---

## Hard Rules

- Never modify application code — only create/modify test files
- Match existing test patterns and conventions in the project
- Don't write tests just for coverage — every test should catch a real potential bug
- Don't use snapshot tests unless explicitly asked
- If harden reports exist, always create regression tests for Critical/High findings
- Run the tests before reporting — don't deliver failing tests
