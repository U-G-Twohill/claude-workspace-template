// Performance Report document template
// Generates a comprehensive web performance audit report from docs-state parameters,
// module flags, and optional site-audit performance data

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  // options.siteAuditReport can contain performance data from /site-audit
  const perfData = options.siteAuditReport || null;

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const siteUrl = params['site-url'] || meta['site-url'] || '[SITE URL]';
  const company = getCompanyInfo(brandConfig || {});
  const reportDate = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

  // Extract performance data if available
  const cwv = perfData?.coreWebVitals || null;
  const lighthouse = perfData?.lighthouse || null;
  const pages = perfData?.pages || null;
  const assets = perfData?.assets || null;
  const server = perfData?.server || null;
  const mobile = perfData?.mobile || null;
  const database = perfData?.database || null;
  const api = perfData?.api || null;
  const overallGrade = perfData?.overallGrade || params['overall-grade'] || '[MEASURE]';
  const overallScore = perfData?.overallScore || params['overall-score'] || '[MEASURE]';

  const sections = [];

  // --- 1. Executive Summary ---
  sections.push(createHeading('Executive Summary', 1));

  sections.push(createParagraph(
    `This performance report evaluates the speed, responsiveness, and efficiency of ${projectName} (${siteUrl}). ` +
    `The assessment covers Core Web Vitals, page load performance, asset optimisation, server response, and mobile experience. ` +
    `The goal is to identify bottlenecks and provide actionable recommendations to improve user experience and search ranking.`
  ));

  sections.push(createHeading('Overall Performance Grade', 2));

  sections.push(createTable(
    ['Metric', 'Value'],
    [
      ['Overall Grade', overallGrade],
      ['Overall Score', overallScore],
      ['Lighthouse Performance Score', lighthouse?.performance || '[MEASURE]'],
      ['Largest Contentful Paint (LCP)', cwv?.lcp?.value || '[MEASURE]'],
      ['Interaction to Next Paint (INP)', cwv?.inp?.value || '[MEASURE]'],
      ['Cumulative Layout Shift (CLS)', cwv?.cls?.value || '[MEASURE]'],
      ['Total Page Weight', assets?.totalPageWeight || '[MEASURE]'],
      ['Time to First Byte (TTFB)', server?.ttfb || '[MEASURE]'],
    ]
  ));

  sections.push(createHeading('Key Findings', 2));

  if (perfData?.keyFindings && perfData.keyFindings.length > 0) {
    sections.push(...createBulletList(perfData.keyFindings));
  } else {
    sections.push(...createBulletList([
      '[MEASURE] — Largest Contentful Paint assessment and impact on user experience',
      '[MEASURE] — JavaScript bundle size and execution time analysis',
      '[MEASURE] — Image optimisation opportunities identified',
      '[MEASURE] — Server response time assessment and CDN effectiveness',
      '[MEASURE] — Mobile performance gap compared to desktop',
    ]));
  }

  // --- 2. Methodology ---
  sections.push(createHeading('Methodology', 1));

  sections.push(createParagraph(
    'This performance assessment uses industry-standard tools and follows Google\'s Web Vitals methodology. ' +
    'All tests are conducted under controlled conditions to ensure consistent, reproducible results.'
  ));

  sections.push(createHeading('Tools Used', 2));
  sections.push(...createBulletList([
    'Google Lighthouse — automated auditing for performance, accessibility, best practices, and SEO scoring',
    'WebPageTest — multi-location page load testing with waterfall analysis and filmstrip capture',
    'Chrome DevTools Performance Panel — runtime performance profiling, long task detection, and paint timing',
    'PageSpeed Insights — field data from Chrome User Experience Report (CrUX) combined with lab data',
    'Bundle analyser — JavaScript and CSS bundle size breakdown and dependency mapping',
  ]));

  if (ctx.framework) {
    sections.push(createHeading('Framework Context', 2));
    sections.push(createParagraph(`This project uses ${ctx.framework}. Performance targets and optimisation strategies are tailored to this framework's characteristics.`));
    const frameworkHints = [];
    const fw = ctx.framework.toLowerCase();
    if (fw.includes('next')) frameworkHints.push('Next.js: Focus on ISR/SSG usage, image optimisation via next/image, bundle splitting with dynamic imports');
    if (fw.includes('astro')) frameworkHints.push('Astro: Verify island hydration is minimal, check for unnecessary client-side JS, leverage zero-JS defaults');
    if (fw.includes('react')) frameworkHints.push('React: Check for unnecessary re-renders, lazy-loaded routes, memoisation of expensive components');
    if (fw.includes('vue') || fw.includes('nuxt')) frameworkHints.push('Vue/Nuxt: Verify async components, route-level code splitting, SSR hydration mismatch');
    if (frameworkHints.length > 0) sections.push(...createBulletList(frameworkHints));
  }

  if (ctx.dependencies && typeof ctx.dependencies === 'object') {
    const depNames = Object.keys(ctx.dependencies);
    const heavyDeps = depNames.filter(d => /moment|lodash(?!-es)|jquery|three|chart|d3|firebase/i.test(d));
    if (heavyDeps.length > 0) {
      sections.push(createParagraph(`Notable bundle-heavy dependencies detected: ${heavyDeps.join(', ')}. These should be assessed for tree-shaking or lighter alternatives.`));
    }
  }

  sections.push(createHeading('Test Conditions', 2));

  const testConditions = perfData?.testConditions || null;
  sections.push(createTable(
    ['Parameter', 'Value'],
    [
      ['Connection', testConditions?.connection || '4G (simulated) — 9 Mbps down, 1.5 Mbps up, 150ms RTT'],
      ['Device', testConditions?.device || 'Moto G Power (simulated) — mid-tier mobile device'],
      ['Location', testConditions?.location || 'Sydney, Australia (nearest CrUX-supported location to NZ)'],
      ['Runs', testConditions?.runs || '3 runs per page, median values reported'],
      ['Cache', testConditions?.cache || 'First visit (cold cache) and repeat visit (warm cache)'],
      ['Date', reportDate],
    ]
  ));

  sections.push(createParagraph(
    'Results reflect lab data (simulated conditions) unless otherwise noted. ' +
    'Field data from real users (CrUX) is included where available and is indicated as such.'
  ));

  // --- 3. Core Web Vitals ---
  sections.push(createHeading('Core Web Vitals', 1));

  sections.push(createParagraph(
    'Core Web Vitals are Google\'s primary user experience metrics. They directly influence search ranking ' +
    'and represent the most impactful performance indicators for real users. Each metric is assessed against ' +
    'Google\'s published thresholds for "Good", "Needs Improvement", and "Poor".'
  ));

  sections.push(createTable(
    ['Metric', 'Measured Value', 'Good Threshold', 'Poor Threshold', 'Rating'],
    [
      [
        'Largest Contentful Paint (LCP)',
        cwv?.lcp?.value || '[MEASURE]',
        '<= 2.5s',
        '> 4.0s',
        cwv?.lcp?.rating || '[MEASURE]',
      ],
      [
        'Interaction to Next Paint (INP)',
        cwv?.inp?.value || '[MEASURE]',
        '<= 200ms',
        '> 500ms',
        cwv?.inp?.rating || '[MEASURE]',
      ],
      [
        'Cumulative Layout Shift (CLS)',
        cwv?.cls?.value || '[MEASURE]',
        '<= 0.1',
        '> 0.25',
        cwv?.cls?.rating || '[MEASURE]',
      ],
    ]
  ));

  sections.push(createHeading('Largest Contentful Paint (LCP)', 2));
  sections.push(createParagraph(
    cwv?.lcp?.detail ||
    'LCP measures the time taken for the largest visible content element (typically a hero image, heading, or ' +
    'video poster) to render in the viewport. A fast LCP assures users that the page is useful. ' +
    '[MEASURE] — identify the LCP element, its render time, and contributing factors (server response, ' +
    'resource load, render delay).'
  ));
  sections.push(...createBulletList(cwv?.lcp?.factors || [
    '[MEASURE] — LCP element identification (image, text block, or video)',
    '[MEASURE] — Server response time contribution to LCP',
    '[MEASURE] — Resource load time (image download, font load)',
    '[MEASURE] — Render delay (JavaScript blocking, CSS blocking)',
  ]));

  sections.push(createHeading('Interaction to Next Paint (INP)', 2));
  sections.push(createParagraph(
    cwv?.inp?.detail ||
    'INP measures the responsiveness of the page to user interactions (clicks, taps, keyboard input). ' +
    'It captures the worst-case input delay across the full page lifecycle. INP replaced FID (First Input Delay) ' +
    'as a Core Web Vital in March 2024. [MEASURE] — profile interaction handlers, identify long tasks, ' +
    'and assess main thread availability.'
  ));
  sections.push(...createBulletList(cwv?.inp?.factors || [
    '[MEASURE] — Longest interaction delay and the triggering element',
    '[MEASURE] — Main thread blocking time during interaction',
    '[MEASURE] — JavaScript execution time contributing to input delay',
    '[MEASURE] — Event handler complexity and optimisation opportunities',
  ]));

  sections.push(createHeading('Cumulative Layout Shift (CLS)', 2));
  sections.push(createParagraph(
    cwv?.cls?.detail ||
    'CLS measures the visual stability of the page — how much content shifts unexpectedly during loading. ' +
    'Layout shifts frustrate users and can cause misclicks. [MEASURE] — identify the largest layout shift ' +
    'sources (images without dimensions, dynamically injected content, web fonts, ads).'
  ));
  sections.push(...createBulletList(cwv?.cls?.factors || [
    '[MEASURE] — Largest layout shift cluster and contributing elements',
    '[MEASURE] — Images or media without explicit width/height attributes',
    '[MEASURE] — Dynamically injected content above the fold',
    '[MEASURE] — Web font loading strategy and FOUT/FOIT impact',
  ]));

  // --- 4. Page Load Analysis ---
  sections.push(createHeading('Page Load Analysis', 1));

  sections.push(createParagraph(
    'Per-page load time analysis for key pages. Times reflect the median of 3 test runs under simulated ' +
    '4G conditions (cold cache). Fully Loaded includes all network activity until the page is idle.'
  ));

  if (pages && pages.length > 0) {
    sections.push(createTable(
      ['Page', 'First Contentful Paint', 'LCP', 'Time to Interactive', 'Fully Loaded', 'Page Weight'],
      pages.map(p => [
        p.name || p.url,
        p.fcp || '-',
        p.lcp || '-',
        p.tti || '-',
        p.fullyLoaded || '-',
        p.weight || '-',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Page', 'First Contentful Paint', 'LCP', 'Time to Interactive', 'Fully Loaded', 'Page Weight'],
      [
        ['Homepage', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
        ['About / Key Landing Page', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
        ['Product / Service Page', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
        ['Contact / Form Page', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
        ['Blog / Content Page', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
      ]
    ));
  }

  sections.push(createHeading('Waterfall Analysis', 2));
  sections.push(createParagraph(
    perfData?.waterfallSummary ||
    '[MEASURE] — Analyse the request waterfall for the slowest page. Identify blocking resources, ' +
    'render-blocking CSS/JS, sequential dependency chains, and opportunities for parallelisation. ' +
    'Note the critical path length and any requests that could be deferred, preloaded, or eliminated.'
  ));

  sections.push(createHeading('Third-Party Impact', 2));

  if (perfData?.thirdParty && perfData.thirdParty.length > 0) {
    sections.push(createParagraph('Third-party scripts and their performance impact:'));
    sections.push(createTable(
      ['Script / Service', 'Requests', 'Transfer Size', 'Main Thread Time', 'Impact'],
      perfData.thirdParty.map(tp => [
        tp.name, tp.requests || '-', tp.size || '-', tp.mainThreadTime || '-', tp.impact || '-',
      ])
    ));
  } else {
    sections.push(createParagraph(
      '[MEASURE] — Audit third-party scripts (analytics, chat widgets, social embeds, ad networks, fonts) ' +
      'for their impact on page load time and main thread execution. Third-party scripts are often the ' +
      'largest contributor to performance degradation and Total Blocking Time.'
    ));
  }

  // --- 5. Asset Analysis ---
  sections.push(createHeading('Asset Analysis', 1));

  sections.push(createParagraph(
    'Breakdown of page assets by type, size, and optimisation status. Oversized or unoptimised assets ' +
    'are the most common cause of slow page loads and can be addressed with the highest ROI.'
  ));

  sections.push(createHeading('JavaScript', 2));
  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['Total JS Size (transferred)', assets?.js?.transferSize || '[MEASURE]', '< 200 KB'],
      ['Total JS Size (uncompressed)', assets?.js?.uncompressedSize || '[MEASURE]', '< 600 KB'],
      ['Number of JS Files', assets?.js?.fileCount || '[MEASURE]', '< 10'],
      ['Main Bundle Size', assets?.js?.mainBundleSize || '[MEASURE]', '< 100 KB'],
      ['Unused JavaScript', assets?.js?.unusedBytes || '[MEASURE]', '< 20%'],
      ['Main Thread Execution Time', assets?.js?.executionTime || '[MEASURE]', '< 2s'],
    ]
  ));
  sections.push(...createBulletList(assets?.js?.findings || [
    '[MEASURE] — Code splitting effectiveness and lazy-loaded chunk sizes',
    '[MEASURE] — Tree-shaking effectiveness — unused library code shipped to client',
    '[MEASURE] — Polyfill assessment — unnecessary polyfills for modern browsers',
    '[MEASURE] — Minification and compression (gzip/brotli) verification',
  ]));

  sections.push(createHeading('CSS', 2));
  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['Total CSS Size (transferred)', assets?.css?.transferSize || '[MEASURE]', '< 50 KB'],
      ['Total CSS Size (uncompressed)', assets?.css?.uncompressedSize || '[MEASURE]', '< 150 KB'],
      ['Number of CSS Files', assets?.css?.fileCount || '[MEASURE]', '< 5'],
      ['Unused CSS', assets?.css?.unusedBytes || '[MEASURE]', '< 20%'],
      ['Render-Blocking CSS', assets?.css?.renderBlocking || '[MEASURE]', 'Critical CSS inlined'],
    ]
  ));
  sections.push(...createBulletList(assets?.css?.findings || [
    '[MEASURE] — Unused CSS percentage and pruning opportunities',
    '[MEASURE] — Critical CSS extraction and inlining status',
    '[MEASURE] — CSS framework overhead (if using Tailwind, Bootstrap, etc.)',
    '[MEASURE] — Media query organisation and responsive efficiency',
  ]));

  sections.push(createHeading('Images', 2));
  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['Total Image Size (transferred)', assets?.images?.transferSize || '[MEASURE]', '< 500 KB'],
      ['Number of Images', assets?.images?.count || '[MEASURE]', 'Varies'],
      ['Format', assets?.images?.formats || '[MEASURE]', 'WebP/AVIF preferred'],
      ['Responsive Images (srcset)', assets?.images?.responsiveCount || '[MEASURE]', '100% of content images'],
      ['Lazy Loading', assets?.images?.lazyLoadCount || '[MEASURE]', 'All below-fold images'],
      ['Missing Dimensions', assets?.images?.missingDimensions || '[MEASURE]', '0'],
    ]
  ));
  sections.push(...createBulletList(assets?.images?.findings || [
    '[MEASURE] — Images using legacy formats (PNG/JPEG) where WebP/AVIF would reduce size',
    '[MEASURE] — Oversized images served to small viewports (missing srcset/sizes)',
    '[MEASURE] — Above-fold images missing fetchpriority="high" or preload hints',
    '[MEASURE] — Decorative images missing appropriate alt="" or role="presentation"',
  ]));

  sections.push(createHeading('Fonts', 2));
  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['Total Font Size', assets?.fonts?.transferSize || '[MEASURE]', '< 100 KB'],
      ['Number of Font Files', assets?.fonts?.fileCount || '[MEASURE]', '< 4'],
      ['Font Display Strategy', assets?.fonts?.displayStrategy || '[MEASURE]', 'font-display: swap or optional'],
      ['Preloaded', assets?.fonts?.preloaded || '[MEASURE]', 'Critical fonts preloaded'],
      ['Self-Hosted', assets?.fonts?.selfHosted || '[MEASURE]', 'Recommended over Google Fonts CDN'],
    ]
  ));
  sections.push(...createBulletList(assets?.fonts?.findings || [
    '[MEASURE] — Font subsetting opportunities (Latin-only subset if appropriate)',
    '[MEASURE] — FOUT/FOIT assessment and font-display strategy effectiveness',
    '[MEASURE] — Variable font opportunity to reduce total font file count',
    '[MEASURE] — Unnecessary font weights or styles loaded but not used',
  ]));

  // --- 6. Server Performance ---
  sections.push(createHeading('Server Performance', 1));

  sections.push(createParagraph(
    'Server-side performance determines the baseline speed before any client-side rendering begins. ' +
    'Time to First Byte (TTFB) is the primary indicator of server responsiveness.'
  ));

  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['Time to First Byte (TTFB)', server?.ttfb || '[MEASURE]', '< 200ms (origin), < 100ms (CDN)'],
      ['Server Response Time', server?.responseTime || '[MEASURE]', '< 200ms'],
      ['DNS Lookup Time', server?.dnsLookup || '[MEASURE]', '< 20ms'],
      ['TCP Connection Time', server?.tcpConnection || '[MEASURE]', '< 50ms'],
      ['TLS Negotiation Time', server?.tlsNegotiation || '[MEASURE]', '< 50ms'],
      ['HTTP/2 or HTTP/3', server?.httpVersion || '[MEASURE]', 'HTTP/2 minimum, HTTP/3 preferred'],
      ['Compression', server?.compression || '[MEASURE]', 'Brotli preferred, gzip minimum'],
    ]
  ));

  sections.push(createHeading('CDN and Caching', 2));
  sections.push(createTable(
    ['Metric', 'Value', 'Target'],
    [
      ['CDN Provider', server?.cdnProvider || '[MEASURE]', 'CDN recommended for all production sites'],
      ['CDN Cache Hit Ratio', server?.cacheHitRatio || '[MEASURE]', '> 90%'],
      ['Cache-Control Headers', server?.cacheControl || '[MEASURE]', 'Appropriate max-age per asset type'],
      ['ETag / Last-Modified', server?.etag || '[MEASURE]', 'Enabled for conditional requests'],
      ['Service Worker Caching', server?.serviceWorker || '[MEASURE]', 'Recommended for repeat visits'],
    ]
  ));
  sections.push(...createBulletList(server?.cachingFindings || [
    '[MEASURE] — Static assets should have long cache lifetimes (1 year) with content-hashed filenames',
    '[MEASURE] — HTML documents should use short cache or no-cache with revalidation',
    '[MEASURE] — CDN cache invalidation strategy for content updates',
    '[MEASURE] — Preconnect/dns-prefetch hints for critical third-party origins',
  ]));

  // --- 7. Mobile Performance ---
  sections.push(createHeading('Mobile Performance', 1));

  sections.push(createParagraph(
    'Mobile performance is assessed separately because mobile devices have constrained CPU, memory, and ' +
    'network bandwidth compared to desktop. Google uses mobile performance as the primary ranking signal ' +
    '(mobile-first indexing). Over 60% of web traffic is mobile — poor mobile performance directly impacts revenue.'
  ));

  sections.push(createTable(
    ['Metric', 'Desktop', 'Mobile', 'Gap'],
    [
      ['Lighthouse Performance Score', mobile?.desktopScore || '[MEASURE]', mobile?.mobileScore || '[MEASURE]', mobile?.scoreGap || '[MEASURE]'],
      ['LCP', mobile?.desktopLcp || '[MEASURE]', mobile?.mobileLcp || '[MEASURE]', mobile?.lcpGap || '[MEASURE]'],
      ['INP', mobile?.desktopInp || '[MEASURE]', mobile?.mobileInp || '[MEASURE]', mobile?.inpGap || '[MEASURE]'],
      ['CLS', mobile?.desktopCls || '[MEASURE]', mobile?.mobileCls || '[MEASURE]', mobile?.clsGap || '[MEASURE]'],
      ['Total Blocking Time', mobile?.desktopTbt || '[MEASURE]', mobile?.mobileTbt || '[MEASURE]', mobile?.tbtGap || '[MEASURE]'],
      ['Page Weight', mobile?.desktopWeight || '[MEASURE]', mobile?.mobileWeight || '[MEASURE]', mobile?.weightGap || '[MEASURE]'],
    ]
  ));

  sections.push(createHeading('Mobile-Specific Findings', 2));
  sections.push(...createBulletList(mobile?.findings || [
    '[MEASURE] — Touch target sizing (minimum 48x48px per WCAG / Google guidelines)',
    '[MEASURE] — Viewport meta tag configuration and responsive breakpoints',
    '[MEASURE] — Mobile-specific image serving (art direction, resolution switching)',
    '[MEASURE] — JavaScript execution time on mid-tier mobile CPU (4x slowdown vs desktop)',
    '[MEASURE] — Above-the-fold content rendering without JavaScript dependency',
    '[MEASURE] — Input field optimisation (inputmode, autocomplete attributes)',
  ]));

  // --- 8. Database Performance (conditional) ---
  if (flags.needs_database) {
    sections.push(createHeading('Database Performance', 1));

    sections.push(createParagraph(
      'Database query performance directly impacts server response time (TTFB) and API latency. ' +
      'Slow queries are the most common cause of server-side performance bottlenecks in dynamic applications.'
    ));

    sections.push(createTable(
      ['Metric', 'Value', 'Target'],
      [
        ['Average Query Time', database?.avgQueryTime || '[MEASURE]', '< 50ms'],
        ['P95 Query Time', database?.p95QueryTime || '[MEASURE]', '< 200ms'],
        ['P99 Query Time', database?.p99QueryTime || '[MEASURE]', '< 500ms'],
        ['Slow Queries (> 500ms)', database?.slowQueryCount || '[MEASURE]', '0 in normal operation'],
        ['Connection Pool Size', database?.poolSize || '[MEASURE]', 'Tuned to expected concurrency'],
        ['Connection Pool Utilisation', database?.poolUtilisation || '[MEASURE]', '< 80%'],
        ['Index Coverage', database?.indexCoverage || '[MEASURE]', 'All frequent query patterns indexed'],
      ]
    ));

    sections.push(createHeading('Slow Query Analysis', 2));

    if (database?.slowQueries && database.slowQueries.length > 0) {
      sections.push(createTable(
        ['Query Pattern', 'Average Time', 'Calls / Hour', 'Impact', 'Recommendation'],
        database.slowQueries.map(q => [
          q.pattern || '-', q.avgTime || '-', q.frequency || '-', q.impact || '-', q.recommendation || '-',
        ])
      ));
    } else {
      sections.push(createParagraph(
        '[MEASURE] — Run EXPLAIN ANALYSE on the top 10 most frequent queries and any queries exceeding ' +
        '100ms. Identify missing indexes, full table scans, unnecessary joins, and N+1 query patterns. ' +
        'Check for connection pool exhaustion under load.'
      ));
    }

    sections.push(createHeading('Connection Pooling', 2));
    sections.push(...createBulletList(database?.poolingFindings || [
      '[MEASURE] — Connection pool sizing relative to application concurrency',
      '[MEASURE] — Connection lifetime and idle timeout configuration',
      '[MEASURE] — Pool exhaustion under peak load (connection wait time)',
      '[MEASURE] — Read replica utilisation for read-heavy workloads',
    ]));
  }

  // --- 9. API Performance (conditional) ---
  if (flags.needs_api) {
    sections.push(createHeading('API Performance', 1));

    sections.push(createParagraph(
      'API endpoint response times are measured server-side (excluding network latency) to isolate ' +
      'application performance from infrastructure performance. Targets are set based on endpoint ' +
      'criticality and user-facing impact.'
    ));

    if (api?.endpoints && api.endpoints.length > 0) {
      sections.push(createTable(
        ['Endpoint', 'Method', 'Avg Response', 'P95 Response', 'P99 Response', 'Calls / Min', 'Status'],
        api.endpoints.map(ep => [
          ep.path || '-',
          ep.method || '-',
          ep.avgResponse || '-',
          ep.p95Response || '-',
          ep.p99Response || '-',
          ep.callsPerMin || '-',
          ep.status || '-',
        ])
      ));
    } else {
      sections.push(createTable(
        ['Endpoint', 'Method', 'Avg Response', 'P95 Response', 'P99 Response', 'Calls / Min', 'Status'],
        [
          ['[MEASURE]', 'GET', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
          ['[MEASURE]', 'POST', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
          ['[MEASURE]', 'GET', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
          ['[MEASURE]', 'PUT', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
          ['[MEASURE]', 'DELETE', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]'],
        ]
      ));
    }

    sections.push(createHeading('API Response Time Targets', 2));
    sections.push(createTable(
      ['Category', 'Target', 'Rationale'],
      [
        ['Read (simple)', '< 50ms', 'Single record lookup with index, no joins'],
        ['Read (complex)', '< 200ms', 'Multi-table joins, aggregations, filtered lists'],
        ['Write (simple)', '< 100ms', 'Single record insert/update with validation'],
        ['Write (complex)', '< 500ms', 'Multi-step transactions, file processing'],
        ['Search / Filter', '< 300ms', 'Full-text search, complex filtering with pagination'],
        ['File Upload', '< 2s', 'Per MB, excluding network transfer time'],
        ['Report Generation', '< 5s', 'Complex aggregation — consider async for > 5s'],
      ]
    ));

    sections.push(createHeading('API Payload Analysis', 2));
    sections.push(...createBulletList(api?.payloadFindings || [
      '[MEASURE] — Average response payload size and over-fetching assessment',
      '[MEASURE] — Pagination implementation and maximum page size limits',
      '[MEASURE] — Response compression (gzip/brotli) enabled for API responses',
      '[MEASURE] — Unnecessary data fields returned (select only required fields)',
      '[MEASURE] — N+1 API call patterns from the frontend (batch or aggregate opportunities)',
    ]));
  }

  // --- 10. Recommendations ---
  sections.push(createHeading('Recommendations', 1));

  sections.push(createParagraph(
    'The following recommendations are prioritised by estimated impact on user experience and ease of ' +
    'implementation. Impact is rated High / Medium / Low based on expected improvement to Core Web Vitals ' +
    'and overall load time. Effort reflects implementation complexity.'
  ));

  sections.push(createHeading('Critical Priority', 2));
  sections.push(createParagraph(
    'Address immediately — these issues have the highest impact on user experience and search ranking.'
  ));

  if (perfData?.recommendations?.critical && perfData.recommendations.critical.length > 0) {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      perfData.recommendations.critical.map(r => [
        r.description, r.impact || 'High', r.effort || '-', r.estimate || '-',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      [
        ['[MEASURE] — Optimise LCP element loading (preload, priority hints)', 'High', '[MEASURE]', '[MEASURE]'],
        ['[MEASURE] — Reduce JavaScript bundle size (code splitting, tree shaking)', 'High', '[MEASURE]', '[MEASURE]'],
        ['[MEASURE] — Implement effective caching strategy (CDN, Cache-Control)', 'High', '[MEASURE]', '[MEASURE]'],
      ]
    ));
  }

  sections.push(createHeading('High Priority', 2));
  sections.push(createParagraph(
    'Address within the current sprint — significant improvements with moderate effort.'
  ));

  if (perfData?.recommendations?.high && perfData.recommendations.high.length > 0) {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      perfData.recommendations.high.map(r => [
        r.description, r.impact || 'High', r.effort || '-', r.estimate || '-',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      [
        ['[MEASURE] — Convert images to WebP/AVIF with responsive srcset', 'High', '[MEASURE]', '[MEASURE]'],
        ['[MEASURE] — Eliminate render-blocking CSS (critical CSS inlining)', 'Medium', '[MEASURE]', '[MEASURE]'],
        ['[MEASURE] — Defer non-critical JavaScript with async/defer attributes', 'Medium', '[MEASURE]', '[MEASURE]'],
        ['[MEASURE] — Optimise web font loading (preload, font-display: swap)', 'Medium', '[MEASURE]', '[MEASURE]'],
      ]
    ));
  }

  sections.push(createHeading('Medium Priority', 2));
  sections.push(createParagraph(
    'Schedule for upcoming work — incremental improvements that contribute to overall performance.'
  ));

  if (perfData?.recommendations?.medium && perfData.recommendations.medium.length > 0) {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      perfData.recommendations.medium.map(r => [
        r.description, r.impact || 'Medium', r.effort || '-', r.estimate || '-',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      [
        ['[MEASURE] — Implement resource hints (preconnect, dns-prefetch)', 'Medium', 'Low', '[MEASURE]'],
        ['[MEASURE] — Add explicit image dimensions to prevent CLS', 'Medium', 'Low', '[MEASURE]'],
        ['[MEASURE] — Audit and reduce third-party script impact', 'Medium', 'Medium', '[MEASURE]'],
        ['[MEASURE] — Implement service worker for repeat visit performance', 'Medium', 'High', '[MEASURE]'],
      ]
    ));
  }

  sections.push(createHeading('Low Priority', 2));
  sections.push(createParagraph(
    'Nice-to-have improvements — address when capacity allows or during regular maintenance.'
  ));

  if (perfData?.recommendations?.low && perfData.recommendations.low.length > 0) {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      perfData.recommendations.low.map(r => [
        r.description, r.impact || 'Low', r.effort || '-', r.estimate || '-',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Recommendation', 'Impact', 'Effort', 'Estimated Improvement'],
      [
        ['[MEASURE] — Enable HTTP/3 (QUIC) support', 'Low', 'Low', '[MEASURE]'],
        ['[MEASURE] — Subset custom fonts to required character sets', 'Low', 'Low', '[MEASURE]'],
        ['[MEASURE] — Implement priority hints (fetchpriority) on key resources', 'Low', 'Low', '[MEASURE]'],
        ['[MEASURE] — Audit CSS for unused rules and reduce specificity', 'Low', 'Medium', '[MEASURE]'],
      ]
    ));
  }

  // --- 11. Trend Analysis ---
  sections.push(createHeading('Trend Analysis', 1));

  sections.push(createParagraph(
    'Performance trends over time reveal whether optimisation efforts are effective and whether ' +
    'new features or content changes introduce regressions. Tracking trends is essential for ' +
    'maintenance clients to demonstrate ongoing value.'
  ));

  if (perfData?.trends && perfData.trends.length > 0) {
    sections.push(createTable(
      ['Date', 'Lighthouse Score', 'LCP', 'INP', 'CLS', 'Page Weight', 'Notes'],
      perfData.trends.map(t => [
        t.date, t.lighthouseScore || '-', t.lcp || '-', t.inp || '-',
        t.cls || '-', t.pageWeight || '-', t.notes || '',
      ])
    ));
  } else {
    sections.push(createTable(
      ['Date', 'Lighthouse Score', 'LCP', 'INP', 'CLS', 'Page Weight', 'Notes'],
      [
        ['[PREVIOUS AUDIT DATE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', '[MEASURE]', 'Previous audit baseline'],
        [reportDate, overallScore, cwv?.lcp?.value || '[MEASURE]', cwv?.inp?.value || '[MEASURE]', cwv?.cls?.value || '[MEASURE]', assets?.totalPageWeight || '[MEASURE]', 'Current audit'],
      ]
    ));
  }

  sections.push(createHeading('Performance Budget', 2));
  sections.push(createParagraph(
    'A performance budget defines the limits that the site must stay within. Exceeding these budgets ' +
    'triggers a review before deployment. Budgets should be enforced in the CI/CD pipeline.'
  ));
  sections.push(createTable(
    ['Metric', 'Budget', 'Current', 'Status'],
    [
      ['Lighthouse Performance Score', '>= 90', lighthouse?.performance || '[MEASURE]', '[MEASURE]'],
      ['LCP', '<= 2.5s', cwv?.lcp?.value || '[MEASURE]', '[MEASURE]'],
      ['INP', '<= 200ms', cwv?.inp?.value || '[MEASURE]', '[MEASURE]'],
      ['CLS', '<= 0.1', cwv?.cls?.value || '[MEASURE]', '[MEASURE]'],
      ['Total JS (transferred)', '<= 200 KB', assets?.js?.transferSize || '[MEASURE]', '[MEASURE]'],
      ['Total CSS (transferred)', '<= 50 KB', assets?.css?.transferSize || '[MEASURE]', '[MEASURE]'],
      ['Total Image (transferred)', '<= 500 KB', assets?.images?.transferSize || '[MEASURE]', '[MEASURE]'],
      ['Total Page Weight', '<= 1.5 MB', assets?.totalPageWeight || '[MEASURE]', '[MEASURE]'],
    ]
  ));

  // --- 12. Appendix ---
  sections.push(createHeading('Appendix', 1));

  sections.push(createHeading('Raw Lighthouse Scores', 2));
  sections.push(createTable(
    ['Category', 'Score', 'Rating'],
    [
      ['Performance', lighthouse?.performance || '[MEASURE]', ratingFromScore(lighthouse?.performance)],
      ['Accessibility', lighthouse?.accessibility || '[MEASURE]', ratingFromScore(lighthouse?.accessibility)],
      ['Best Practices', lighthouse?.bestPractices || '[MEASURE]', ratingFromScore(lighthouse?.bestPractices)],
      ['SEO', lighthouse?.seo || '[MEASURE]', ratingFromScore(lighthouse?.seo)],
    ]
  ));

  sections.push(createHeading('Detailed Timing Breakdown', 2));
  sections.push(createTable(
    ['Timing', 'Value'],
    [
      ['DNS Lookup', server?.dnsLookup || '[MEASURE]'],
      ['TCP Connection', server?.tcpConnection || '[MEASURE]'],
      ['TLS Negotiation', server?.tlsNegotiation || '[MEASURE]'],
      ['Time to First Byte (TTFB)', server?.ttfb || '[MEASURE]'],
      ['First Contentful Paint (FCP)', perfData?.fcp || '[MEASURE]'],
      ['Largest Contentful Paint (LCP)', cwv?.lcp?.value || '[MEASURE]'],
      ['Time to Interactive (TTI)', perfData?.tti || '[MEASURE]'],
      ['Total Blocking Time (TBT)', perfData?.tbt || '[MEASURE]'],
      ['Speed Index', perfData?.speedIndex || '[MEASURE]'],
      ['Fully Loaded', perfData?.fullyLoaded || '[MEASURE]'],
    ]
  ));

  sections.push(createHeading('Glossary', 2));
  sections.push(createTable(
    ['Term', 'Definition'],
    [
      ['LCP', 'Largest Contentful Paint — time until the largest visible element renders'],
      ['INP', 'Interaction to Next Paint — worst-case responsiveness to user input (replaced FID)'],
      ['CLS', 'Cumulative Layout Shift — visual stability score (lower is better)'],
      ['FCP', 'First Contentful Paint — time until the first text or image renders'],
      ['TTFB', 'Time to First Byte — server response time for the initial HTML document'],
      ['TTI', 'Time to Interactive — time until the page is fully interactive (no long tasks)'],
      ['TBT', 'Total Blocking Time — sum of all long task durations exceeding 50ms on the main thread'],
      ['CrUX', 'Chrome User Experience Report — real-user performance data from Chrome users'],
      ['CDN', 'Content Delivery Network — geographically distributed cache layer for faster delivery'],
      ['Brotli', 'Modern compression algorithm (10-25% smaller than gzip for text resources)'],
    ]
  ));

  sections.push(createHeading('Test Configuration', 2));
  sections.push(createParagraph(
    `Report generated for ${projectName} (${siteUrl}) on ${reportDate}. ` +
    `Prepared by ${company.name || '[COMPANY NAME]'}. ` +
    'Results are based on lab data unless otherwise noted. Field data (CrUX) is included where available. ' +
    'Performance metrics can vary based on network conditions, server load, and device capabilities.'
  ));

  return createDocument({
    title: 'Performance Report',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}

// --- Internal helpers ---

/**
 * Convert a numeric Lighthouse score to a rating label.
 */
function ratingFromScore(score) {
  if (score === null || score === undefined || score === '[MEASURE]') return '[MEASURE]';
  const num = typeof score === 'string' ? parseInt(score, 10) : score;
  if (isNaN(num)) return '[MEASURE]';
  if (num >= 90) return 'Good';
  if (num >= 50) return 'Needs Improvement';
  return 'Poor';
}
