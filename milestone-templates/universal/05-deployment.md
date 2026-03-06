# Milestone: Deployment
> Type: milestone-template
> Category: universal
> Order: 5
> Optional: false

## Goal
Project deployed to production with CI/CD pipeline, environment config, and monitoring in place.

## Tasks
- [ ] Configure environment variables and create .env.example
- [ ] Run /prepare-deploy to generate deployment config
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- [ ] Deploy to staging environment and verify
- [ ] Run smoke tests against staging
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Document deployment process in README or docs/

## Notes
Use /prepare-deploy to generate CI/CD config, Dockerfiles, and readiness checklists. Use /deploy-draft for Netlify preview deployments during development.
