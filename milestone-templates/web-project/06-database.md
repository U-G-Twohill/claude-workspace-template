# Milestone: Database
> Type: milestone-template
> Category: web-project
> Order: 6
> Optional: true

## Goal
Database schema designed, migrations working, seed data available, and backup strategy defined.

## Tasks
- [ ] Choose database engine and justify the choice
- [ ] Design schema (tables, relationships, indexes)
- [ ] Set up migration tooling (knex, prisma, alembic, etc.)
- [ ] Write initial migration
- [ ] Create seed data for development and testing
- [ ] Test migration up and down (rollback)
- [ ] Define backup strategy and schedule
- [ ] Document schema in docs/ or README

## Notes
Design the schema around access patterns, not just data structure. Consider what queries will be most frequent and index accordingly.
