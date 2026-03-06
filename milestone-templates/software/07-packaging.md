# Milestone: Packaging
> Type: milestone-template
> Category: software
> Order: 7
> Optional: false

## Goal
Software is packaged, versioned, and distributable through the appropriate channel.

## Tasks
- [ ] Configure build output (transpilation, bundling, compilation)
- [ ] Set up semantic versioning
- [ ] Configure package manifest (package.json, setup.py, Cargo.toml, etc.)
- [ ] Define what's included/excluded in the published package
- [ ] Test installation from package (npm pack, pip install -e, etc.)
- [ ] Write release notes template or changelog format
- [ ] Set up publish workflow (npm publish, PyPI upload, GitHub release)
- [ ] Run /prepare-deploy to validate packaging config

## Notes
Test the install experience from a consumer's perspective. Install your own package in a fresh environment and verify it works as documented.
