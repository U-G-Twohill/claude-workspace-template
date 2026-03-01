# SEO Audit Checklist

> Reference checklist for the `/site-audit` command. Each item includes what to check, how to check it, pass/fail criteria, and business impact.

---

## Meta Tags

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Title tag exists | WebFetch HTML, look for `<title>` | Present, 30-60 characters, unique per page | Primary ranking signal and search snippet — missing or poor titles directly reduce click-through rates |
| Meta description exists | WebFetch HTML, look for `<meta name="description">` | Present, 120-160 characters, unique per page, contains target keywords naturally | Affects click-through rate from search results — Google may auto-generate a worse one |
| Viewport meta tag | Look for `<meta name="viewport" content="width=device-width, initial-scale=1">` | Present with `width=device-width` | Required for mobile-friendly designation — Google uses mobile-first indexing |
| Charset declaration | Look for `<meta charset="UTF-8">` or equivalent | Present, preferably UTF-8 | Prevents character encoding issues that break content display |
| Language attribute | Check `<html lang="...">` | Present with correct language code (e.g., `en`, `en-GB`) | Helps search engines serve content to correct language audience |

## Headings

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Single H1 per page | Parse HTML heading tags | Exactly one `<h1>` tag per page | Multiple H1s dilute topic signal — search engines may not understand page focus |
| H1 contains target keywords | Read H1 content | H1 is descriptive and includes primary page topic | H1 is a strong relevance signal for search ranking |
| Logical heading hierarchy | Check H1 → H2 → H3 nesting | No skipped levels (e.g., H1 directly to H3) | Proper hierarchy helps search engines understand content structure |
| Headings are not empty | Check heading tag content | All heading tags contain text | Empty headings waste ranking signals and indicate structural issues |

## Structured Data

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| JSON-LD present | Search for `<script type="application/ld+json">` | At least one valid JSON-LD block on key pages | Enables rich snippets (stars, FAQs, breadcrumbs) that dramatically improve click-through rates |
| Schema.org types used | Parse JSON-LD content | Uses appropriate types: Organization, LocalBusiness, Product, Article, BreadcrumbList, FAQ, etc. | Correct schema types unlock specific rich result features in search |
| No JSON-LD errors | Validate JSON syntax | Valid JSON, required properties present per schema.org spec | Invalid structured data is ignored by search engines — provides no benefit |
| Breadcrumb markup | Look for BreadcrumbList schema | Present on multi-level sites | Breadcrumb rich results improve navigation appearance in search |

## Sitemap & Robots.txt

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| sitemap.xml exists | Fetch `[domain]/sitemap.xml` | Returns valid XML sitemap | Without a sitemap, search engines may not discover all pages — especially on larger sites |
| Sitemap references key pages | Parse sitemap URLs | Important pages are included | Unreferenced pages may not get crawled or indexed |
| Sitemap referenced in robots.txt | Read robots.txt for `Sitemap:` directive | Sitemap URL declared in robots.txt | Helps search engines find the sitemap automatically |
| robots.txt exists | Fetch `[domain]/robots.txt` | Returns valid robots.txt | Missing robots.txt causes crawl errors in search console |
| robots.txt not blocking important content | Parse Disallow directives | CSS, JS, images, and key pages are not blocked | Blocking resources prevents proper rendering and indexing |
| No noindex on important pages | Check for `<meta name="robots" content="noindex">` and X-Robots-Tag header | Key pages are indexable | Noindex accidentally applied to important pages removes them from search entirely |

## Canonical URLs

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Canonical tag present | Look for `<link rel="canonical" href="...">` | Present on every page | Without canonicals, duplicate content issues dilute ranking signals |
| Self-referencing canonicals | Compare canonical URL to page URL | Canonical points to the page itself (or intentional canonical target) | Prevents unintentional consolidation of page signals |
| Canonical is absolute URL | Check canonical href value | Uses full URL with protocol, not relative path | Relative canonicals can resolve incorrectly |
| HTTP/HTTPS consistency | Compare canonical protocol to page protocol | Canonical uses HTTPS if site uses HTTPS | Mixed protocols create duplicate content signals |
| www/non-www consistency | Check canonical domain | Consistent www or non-www across all canonicals | Inconsistency splits ranking authority between www and non-www versions |

## Open Graph & Social

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| og:title | Look for `<meta property="og:title">` | Present, descriptive | Controls how the page appears when shared on Facebook, LinkedIn, etc. |
| og:description | Look for `<meta property="og:description">` | Present, compelling, 60-90 characters | Affects social sharing click-through rates |
| og:image | Look for `<meta property="og:image">` | Present, absolute URL, image exists, minimum 1200x630px recommended | Pages shared without images get significantly fewer clicks on social media |
| og:type | Look for `<meta property="og:type">` | Present (website, article, product, etc.) | Helps social platforms categorise the content correctly |
| og:url | Look for `<meta property="og:url">` | Present, matches canonical URL | Prevents split engagement metrics across URL variations |
| twitter:card | Look for `<meta name="twitter:card">` | Present (summary, summary_large_image) | Controls Twitter/X preview format — large images get more engagement |

## Images

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Alt text on all images | Check `<img>` tags for `alt` attribute | All content images have descriptive alt text (decorative images can have empty alt) | Missing alt text loses image search traffic and fails accessibility requirements |
| Alt text quality | Read alt text content | Descriptive of image content, not "image.jpg" or "photo" or keyword-stuffed | Poor alt text provides no SEO value and harms accessibility |
| Image dimensions specified | Check for `width` and `height` attributes or CSS | Dimensions specified to prevent layout shift | Missing dimensions cause CLS (Cumulative Layout Shift) which harms Core Web Vitals score |
| Images use modern formats | Check file extensions and Content-Type | WebP or AVIF used where possible (with fallbacks) | Modern formats are 25-50% smaller, improving load time and Core Web Vitals |
| Lazy loading on below-fold images | Check for `loading="lazy"` attribute | Below-fold images use lazy loading; above-fold images do NOT | Reduces initial page load time; lazy-loading above-fold images delays LCP |

## Internal Linking

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| No broken internal links | Check all internal `<a href>` targets return 200 | All internal links resolve | Broken links waste crawl budget and create poor user experience |
| Descriptive anchor text | Read link text content | Links use descriptive text, not "click here" or "read more" | Anchor text is a ranking signal — descriptive text helps pages rank for relevant terms |
| Key pages linked from navigation | Check nav element links | Important pages accessible within 3 clicks from homepage | Pages buried deep in site structure get less crawl priority and ranking weight |
| No orphan pages | Compare sitemap URLs to internally linked pages | All sitemap pages are reachable via internal links | Orphan pages (only in sitemap, not linked) are difficult for search engines to find and rank |

## Content Signals

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Sufficient content on key pages | Measure text content (excluding nav/footer) | Key pages have 300+ words of meaningful content | Thin content pages rarely rank — search engines need substance to understand relevance |
| No duplicate content across pages | Compare page content similarity | Pages have substantially unique content | Duplicate content causes search engines to pick one version, potentially the wrong one |
| No keyword stuffing | Analyse keyword density | Natural language, no excessive repetition of target terms | Keyword stuffing triggers algorithmic penalties and reads poorly to users |

## Mobile

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Mobile-friendly viewport | Check viewport meta tag | Present with `width=device-width` | Google uses mobile-first indexing — non-mobile sites rank poorly |
| No horizontal scroll on mobile | Puppeteer screenshot at 375px width | Content fits viewport, no overflow | Horizontal scrolling is a mobile usability failure signal |
| Tap targets adequately sized | Check button/link sizing | Interactive elements at least 48x48px with adequate spacing | Small tap targets frustrate mobile users and are flagged by Google |
| Text readable without zoom | Check font sizes | Body text at least 16px | Text requiring zoom to read is a mobile usability failure |

## Indexability

| Check | Method | Pass Criteria | Business Impact |
|-------|--------|--------------|-----------------|
| Pages return 200 status | Check HTTP status codes | Key pages return 200, redirects are 301 (not 302) | Non-200 pages may not be indexed; 302 redirects don't pass full link equity |
| No redirect chains | Follow redirect paths | Maximum 1 redirect hop | Redirect chains slow page delivery and may lose ranking signals |
| HTTPS enforced | Check HTTP → HTTPS redirect | HTTP requests redirect to HTTPS with 301 | HTTPS is a confirmed ranking signal; HTTP sites show security warnings |
| Page load under 3 seconds | Measure TTFB and page load | Time to interactive under 3 seconds | Slow pages have higher bounce rates and Google factors page speed into rankings |
