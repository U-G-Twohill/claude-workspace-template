# Milestone: Dependencies
> Type: milestone-template
> Category: universal
> Order: 2
> Optional: false

## Goal
All dependencies installed, audited, version-locked, and documented.

## Tasks
- [ ] Install core dependencies
- [ ] Install dev dependencies (linters, formatters, test runners)
- [ ] Lock dependency versions (package-lock.json, requirements.txt, etc.)
- [ ] Run /audit-deps to check for known vulnerabilities
- [ ] Document dependencies and their purpose in README
- [ ] Verify clean install from scratch (delete node_modules/venv, reinstall)

## Notes
Run /audit-deps after initial install and again before deployment. Keep dependencies minimal — don't add packages for trivial functionality.
