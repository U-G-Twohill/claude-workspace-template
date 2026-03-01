# Website Security Headers & Checks Reference

> Reference checklist for the `/site-audit` security phase. Covers HTTP security headers, SSL/TLS, cookie security, exposed paths, and information disclosure.

---

## HTTP Security Headers

| Header | Check Method | Correct Value | What It Protects Against | Severity if Missing |
|--------|-------------|---------------|-------------------------|-------------------|
| `Strict-Transport-Security` (HSTS) | Check response headers | `max-age=31536000; includeSubDomains; preload` | Downgrade attacks, SSL stripping. Forces HTTPS for all future visits. | High |
| `Content-Security-Policy` (CSP) | Check response headers | Policy restricting script/style/image sources (e.g., `default-src 'self'; script-src 'self' https://trusted.cdn.com`) | Cross-site scripting (XSS), data injection, clickjacking via inline frames | High |
| `X-Content-Type-Options` | Check response headers | `nosniff` | MIME-type sniffing attacks where browser interprets files as executable | Medium |
| `X-Frame-Options` | Check response headers | `DENY` or `SAMEORIGIN` | Clickjacking — embedding the site in a malicious iframe | Medium |
| `Referrer-Policy` | Check response headers | `strict-origin-when-cross-origin` or `no-referrer` | Leaking sensitive URL paths to third-party sites via the Referer header | Medium |
| `Permissions-Policy` | Check response headers | Restrict unused browser features: `camera=(), microphone=(), geolocation=()` | Malicious scripts accessing device features without user knowledge | Low |
| `X-XSS-Protection` | Check response headers | `0` (modern recommendation) or absent | Deprecated header — old XSS filters had bypass vulnerabilities. Modern CSP replaces this. | Low |
| `Cross-Origin-Opener-Policy` | Check response headers | `same-origin` | Cross-origin attacks via window references, Spectre-style side-channel attacks | Low |
| `Cross-Origin-Resource-Policy` | Check response headers | `same-origin` or `cross-origin` (depending on needs) | Prevents other sites from loading your resources (images, scripts) | Low |
| `Cross-Origin-Embedder-Policy` | Check response headers | `require-corp` (if needed for SharedArrayBuffer) | Side-channel attacks; required for some advanced browser APIs | Low |

### Common CSP Misconfigurations

| Misconfiguration | Why It's Bad | Correct Approach |
|-----------------|-------------|-----------------|
| `unsafe-inline` in script-src | Allows inline scripts — defeats XSS protection entirely | Use nonces (`'nonce-xxx'`) or hashes for inline scripts |
| `unsafe-eval` in script-src | Allows `eval()` — major XSS vector | Refactor code to avoid eval, use strict CSP |
| `*` as source | Allows loading from any domain | Whitelist specific trusted domains |
| No `default-src` | Unspecified resource types have no restrictions | Always set `default-src 'self'` as baseline |
| `data:` in script-src | Allows scripts from data URIs — XSS bypass | Only allow `data:` for images if needed |

---

## SSL/TLS

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Valid SSL certificate | `curl -vI https://[domain]` or check certificate details | Certificate is valid (not expired, not self-signed) | Expired certificates show browser warnings — visitors leave immediately |
| Certificate expiration | Parse certificate expiry date | More than 30 days until expiry | Expired certs break the site entirely — plan renewal before expiry |
| HTTPS enforced | Request `http://[domain]`, check for 301 to HTTPS | HTTP redirects to HTTPS with 301 | HTTP connections are unencrypted — data can be intercepted; Google penalises HTTP |
| TLS version | Check supported TLS versions | TLS 1.2 minimum, TLS 1.3 preferred | Older TLS versions have known vulnerabilities; some browsers drop support |
| No mixed content | Check page source for `http://` resource URLs on an HTTPS page | All resources loaded via HTTPS | Mixed content warnings reduce trust and some browsers block mixed resources |

---

## Cookie Security

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| `Secure` flag | Inspect Set-Cookie headers | All cookies set with `Secure` flag on HTTPS sites | Without Secure flag, cookies are sent over HTTP and can be intercepted |
| `HttpOnly` flag | Inspect Set-Cookie headers | Session/auth cookies have `HttpOnly` flag | Without HttpOnly, JavaScript can steal session cookies via XSS |
| `SameSite` attribute | Inspect Set-Cookie headers | `SameSite=Lax` or `SameSite=Strict` | Prevents CSRF attacks — cookies sent on cross-site requests without SameSite |
| No sensitive data in cookies | Review cookie names and values | No plain-text credentials, tokens, or PII in cookie values | Exposed credentials in cookies are a direct security breach |

---

## Exposed Paths

Probe these common paths and check response codes. A 200 response (or a login page) indicates exposure.

| Path | What It Reveals | Severity |
|------|----------------|----------|
| `/.env` | Environment variables, database credentials, API keys | Critical |
| `/.git` or `/.git/config` | Source code repository, potentially full codebase | Critical |
| `/wp-admin` or `/wp-login.php` | WordPress admin panel — target for brute force | High |
| `/admin`, `/administrator` | CMS admin panels | High |
| `/phpinfo.php` or `/info.php` | Full PHP configuration, server paths, loaded modules | High |
| `/server-status` or `/server-info` | Apache server status page with request details | High |
| `/.htaccess` or `/.htpasswd` | Server configuration, password hashes | High |
| `/wp-config.php` | WordPress database credentials (if misconfigured) | Critical |
| `/api` or `/api/v1` | API endpoints that may lack authentication | Medium |
| `/debug`, `/test`, `/staging` | Development/test resources left exposed | Medium |
| `/backup`, `/db`, `/database` | Database dumps or backup files | Critical |
| `/.DS_Store` | macOS directory metadata (can reveal file structure) | Low |
| `/robots.txt` (review contents) | May reveal hidden admin paths via Disallow rules | Low |
| `/sitemap.xml` (review contents) | May list internal/staging URLs that shouldn't be public | Low |

### Probing Approach

- Send HEAD request first (lightweight)
- Only flag as exposed if response is 200 or a recognisable login/admin page
- 403 (Forbidden) is acceptable — the path exists but is protected
- 404 (Not Found) is the ideal response for sensitive paths
- Do NOT attempt to access, authenticate, or exploit — observation only

---

## Information Disclosure

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| `Server` header | Check response headers | Absent or generic (e.g., not `Apache/2.4.51` with version) | Version numbers help attackers target known vulnerabilities |
| `X-Powered-By` header | Check response headers | Absent | Reveals technology stack (e.g., `Express`, `PHP/8.1`) for targeted attacks |
| Generator meta tag | Search HTML for `<meta name="generator">` | Absent or no version number | Reveals CMS and version (e.g., `WordPress 6.4.2`) — enables targeted exploits |
| Error page disclosure | Trigger a 404 or 500 if possible | Custom error pages, no stack traces or framework details | Default error pages reveal technology stack; stack traces expose internal paths |
| Source code comments | Review HTML source for comments | No credentials, internal IPs, TODO items, or debug info in production HTML | Comments may reveal internal URLs, developer notes, or debugging endpoints |
| Directory listing | Request directories without index files | Directory listing disabled (returns 403 or custom page, not file list) | Directory listings expose all files including backups, configs, and logs |

---

## Redirect Security

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| HTTP → HTTPS redirect | Request `http://` version | 301 redirect to HTTPS equivalent | 302 redirects don't pass SEO value; no redirect means HTTP version is accessible |
| www → non-www (or vice versa) | Request both versions | Consistent redirect in one direction with 301 | Split authority between www and non-www versions |
| No open redirects | Check for redirect parameters in URLs | No URLs that accept arbitrary redirect targets (e.g., `?redirect=http://evil.com`) | Open redirects enable phishing — attacker uses your domain to redirect to malicious site |
| Redirect chain length | Follow all redirects | Maximum 1 hop from any entry point to final URL | Long redirect chains slow page load and may lose security headers |

---

## Scoring Guide

Map findings to the A-F grading system:

| Grade | Criteria |
|-------|---------|
| **A** (90-100) | All critical headers present, valid SSL, no exposed paths, no information disclosure |
| **B** (75-89) | Minor headers missing (Permissions-Policy, COOP), all critical items pass |
| **C** (60-74) | Some important headers missing (CSP or HSTS absent), minor exposure issues |
| **D** (40-59) | Critical headers missing, exposed admin panels, or information disclosure |
| **F** (0-39) | No HTTPS, critical paths exposed, credentials discoverable, or expired certificate |
