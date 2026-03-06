# Milestone: Authentication
> Type: milestone-template
> Category: web-project
> Order: 7
> Optional: true

## Goal
Authentication and authorisation working with secure session management and appropriate role controls.

## Tasks
- [ ] Choose auth approach (session-based, JWT, OAuth provider, etc.)
- [ ] Implement user registration and login
- [ ] Implement session management and secure cookie/token handling
- [ ] Add password hashing (bcrypt/argon2) — never store plaintext
- [ ] Implement logout and session invalidation
- [ ] Set up role/permission model if needed
- [ ] Add rate limiting to auth endpoints
- [ ] Test auth flows end-to-end (register, login, access protected route, logout)
- [ ] Run /harden security to verify no auth vulnerabilities

## Notes
Auth is a high-risk area. Use established libraries rather than rolling your own. Always hash passwords, use HTTPS, set secure cookie flags, and protect against CSRF.
