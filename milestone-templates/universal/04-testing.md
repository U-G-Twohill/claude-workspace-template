# Milestone: Testing
> Type: milestone-template
> Category: universal
> Order: 4
> Optional: false

## Goal
Comprehensive test coverage with all critical and high-severity issues resolved.

## Tasks
- [ ] Set up test framework and test runner
- [ ] Write unit tests for core logic
- [ ] Write integration tests for key workflows
- [ ] Run /create-tests to generate additional coverage
- [ ] Run /harden to find bugs, security issues, and edge cases
- [ ] Fix all Critical and High severity findings
- [ ] Re-run /harden to verify fixes (repeat until clean)

## Notes
Use the /harden -> /create-plan -> /implement -> /harden loop until the report comes back clean on Critical and High items. Medium/Low items can be deferred if justified.
