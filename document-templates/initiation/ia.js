// Information Architecture document template
// Generates a comprehensive IA document covering sitemap, content model, user journeys, and URL structure

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const projectType = params['project-type'] || 'website';
  const techStack = params['tech-stack'] || '[Tech stack — to be confirmed]';

  const sections = [];

  // 1. Content Inventory
  sections.push(createHeading('Content Inventory', 1));
  if (ctx.description) {
    sections.push(createParagraph(`Project purpose: ${ctx.description}`));
  }
  sections.push(createParagraph('A complete inventory of all content types, page types, and data entities within the project. This serves as the foundation for sitemap planning, template design, and CMS configuration.'));

  const contentRows = [
    ['Static Page', 'Fixed content pages (About, Contact, Privacy Policy)', 'High', 'Client-provided'],
    ['Landing Page', 'Marketing-focused pages with targeted messaging and CTAs', 'High', 'Client / Copywriter'],
    ['Blog Post / Article', 'Date-stamped editorial content with author attribution', 'Medium', 'Client / Content team'],
    ['Media Asset', 'Images, videos, downloadable files, and embedded content', 'Medium', 'Client-provided'],
    ['Form', 'Contact forms, enquiry forms, application forms', 'High', 'Defined in scope'],
  ];
  if (flags.needs_payments) {
    contentRows.push(
      ['Product', 'Purchasable items with pricing, descriptions, and images', 'High', 'Client / PIM'],
      ['Product Category', 'Groupings for product organisation and browsing', 'High', 'Client'],
      ['Order Confirmation', 'Transactional page displayed after successful purchase', 'High', 'Auto-generated'],
    );
  }
  if (flags.needs_auth) {
    contentRows.push(
      ['Dashboard View', 'Authenticated user interface with role-specific data', 'High', 'System-generated'],
      ['User Profile', 'User account details, preferences, and activity history', 'Medium', 'User-generated'],
    );
  }
  if (flags.needs_api) {
    contentRows.push(
      ['API Documentation', 'Endpoint reference, authentication guides, and examples', 'Medium', 'Auto-generated'],
    );
  }
  if (ctx.features && Array.isArray(ctx.features) && ctx.features.length > 0) {
    for (const feature of ctx.features) {
      const name = typeof feature === 'string' ? feature : feature.name || feature;
      contentRows.push([name, 'Feature identified from project context', 'Medium', 'Auto-detected']);
    }
  }
  sections.push(createTable(['Type', 'Description', 'Priority', 'Content Source'], contentRows));

  // 2. Sitemap / Navigation
  sections.push(createHeading('Sitemap / Navigation', 1));
  sections.push(createParagraph('The hierarchical site structure defines how content is organised and how users navigate between sections. Navigation is divided into primary (main menu), secondary (utility links), and footer groupings.'));

  sections.push(createHeading('Primary Navigation', 2));
  sections.push(createParagraph('Top-level navigation items visible on every page. Limited to 5-7 items for usability.'));
  sections.push(...createBulletList([
    'Home',
    'About — Company overview, team, values',
    'Services / Products — Core offerings with sub-pages per item',
    'Blog / Resources — Content hub with category filtering',
    'Contact — Enquiry form, location, and contact details',
  ]));

  sections.push(createHeading('Secondary Navigation', 2));
  sections.push(createParagraph('Utility links typically placed in the header bar above the main navigation or as icon links.'));
  sections.push(...createBulletList([
    'Search',
    'Phone / Email (click-to-action)',
    ...(flags.needs_auth ? ['Login / My Account'] : []),
    ...(flags.needs_payments ? ['Cart / Basket'] : []),
  ]));

  sections.push(createHeading('Footer Navigation', 2));
  sections.push(createParagraph('Comprehensive link set in the page footer, grouped by category.'));
  sections.push(...createBulletList([
    'Company — About, Team, Careers, Testimonials',
    'Services — Mirror of primary service pages',
    'Resources — Blog, FAQs, Knowledge Base',
    'Legal — Privacy Policy, Terms of Service, Cookie Policy',
    'Social — Links to social media profiles',
    'Contact — Address, phone, email, map',
  ]));

  sections.push(createHeading('Page Hierarchy', 2));
  sections.push(createParagraph('The full page tree, showing parent-child relationships and nesting depth.'));
  sections.push(...createBulletList([
    'Level 0: Homepage',
    'Level 1: Top-level sections (About, Services, Blog, Contact)',
    'Level 2: Sub-sections (individual services, blog categories, team members)',
    'Level 3: Detail pages (individual blog posts, case studies, sub-service pages)',
    ...(flags.needs_payments ? ['Level 2-3: Shop pages (categories, product listings, product detail)'] : []),
    ...(flags.needs_auth ? ['Level 1-2: Account pages (dashboard, profile, settings, order history)'] : []),
  ]));

  // 3. Page Templates
  sections.push(createHeading('Page Templates', 1));
  sections.push(createParagraph('Standard page layouts that are reused across the site. Each template defines the structural components and content zones available on that page type.'));

  const templateRows = [
    ['Homepage', 'Homepage', 'Hero section, featured content blocks, CTAs, testimonials, latest posts'],
    ['Listing / Archive', 'Blog index, services overview, team page', 'Page header, filterable grid/list of items, pagination, sidebar (optional)'],
    ['Detail / Single', 'Blog post, service detail, case study', 'Content header, body content, media, sidebar, related items, CTA'],
    ['Form Page', 'Contact, enquiry, application', 'Page header, introductory text, form fields, validation messages, success state'],
    ['Legal / Policy', 'Privacy policy, terms of service', 'Page header, long-form text content, table of contents (optional)'],
  ];
  if (flags.needs_auth) {
    templateRows.push(
      ['Dashboard', 'User dashboard, admin overview', 'Navigation sidebar, stats/widgets, data tables, action buttons'],
      ['Account Settings', 'Profile, preferences, security', 'Settings navigation, form sections, save/cancel actions'],
    );
  }
  if (flags.needs_payments) {
    templateRows.push(
      ['Product Listing', 'Shop category page, search results', 'Filter sidebar, product grid, sort controls, pagination'],
      ['Product Detail', 'Individual product page', 'Image gallery, pricing, variants, add-to-cart, description, reviews'],
      ['Checkout', 'Cart, checkout steps, confirmation', 'Progress indicator, form steps, order summary, payment fields'],
    );
  }
  sections.push(createTable(['Template', 'Pages Using It', 'Key Components'], templateRows));

  // 4. Content Model (conditional: needs_cms)
  if (flags.needs_cms) {
    sections.push(createHeading('Content Model', 1));
    sections.push(createParagraph('The content model defines structured content types, their fields, and relationships within the CMS. This drives editorial workflows, API responses, and front-end rendering.'));

    const contentModelRows = [
      ['Page', 'Title, Slug, Body, SEO Meta, Featured Image, Status, Publish Date', 'Has many: Media Assets; Belongs to: Navigation'],
      ['Blog Post', 'Title, Slug, Excerpt, Body, Author, Featured Image, Publish Date, Status', 'Belongs to: Category (many-to-many); Has many: Tags, Comments (optional)'],
      ['Category', 'Name, Slug, Description, Parent Category, Sort Order', 'Has many: Blog Posts; Self-referencing: Parent/Child'],
      ['Tag', 'Name, Slug', 'Has many: Blog Posts (many-to-many)'],
      ['Author', 'Name, Bio, Avatar, Email, Social Links', 'Has many: Blog Posts'],
      ['Media Asset', 'File, Alt Text, Caption, Type, Dimensions, File Size', 'Belongs to: Page, Blog Post, Product (polymorphic)'],
    ];
    if (flags.needs_payments) {
      contentModelRows.push(
        ['Product', 'Name, Slug, Description, Price, SKU, Images, Stock, Status, Weight', 'Belongs to: Product Category; Has many: Variants, Reviews'],
        ['Product Category', 'Name, Slug, Description, Image, Parent Category', 'Has many: Products; Self-referencing: Parent/Child'],
      );
    }
    sections.push(createTable(['Content Type', 'Fields', 'Relationships'], contentModelRows));

    sections.push(createHeading('Taxonomies', 2));
    sections.push(createParagraph('Taxonomy structures for organising and classifying content across the site.'));
    sections.push(...createBulletList([
      'Categories — hierarchical, used for broad content groupings (e.g. blog categories, service areas)',
      'Tags — flat, used for cross-cutting topics and fine-grained classification',
      ...(flags.needs_payments ? ['Product Categories — hierarchical, used for shop navigation and filtering'] : []),
      'Content Status — Draft, Published, Archived, Scheduled',
    ]));
  }

  // 5. Database Entities (conditional: needs_database)
  if (flags.needs_database) {
    sections.push(createHeading('Database Entities', 1));
    sections.push(createParagraph('Key data models and their relationships. This section defines the core entities stored in the database, their cardinality, and how they relate to each other.'));

    const entityRows = [
      ['Users', 'id, email, name, role, created_at, updated_at', 'One-to-Many'],
      ['Sessions', 'id, user_id, token, expires_at, created_at', 'Many-to-One (User)'],
    ];
    if (flags.needs_payments) {
      entityRows.push(
        ['Products', 'id, name, slug, price, description, stock, status', 'One-to-Many (Variants, Reviews)'],
        ['Orders', 'id, user_id, status, total, shipping_address, created_at', 'Many-to-One (User), One-to-Many (Line Items)'],
        ['Line Items', 'id, order_id, product_id, quantity, unit_price', 'Many-to-One (Order, Product)'],
      );
    }
    if (flags.needs_auth) {
      entityRows.push(
        ['Roles', 'id, name, permissions', 'Many-to-Many (Users)'],
        ['Audit Log', 'id, user_id, action, entity, entity_id, timestamp', 'Many-to-One (User)'],
      );
    }
    sections.push(createTable(['Entity', 'Key Fields', 'Cardinality'], entityRows));

    sections.push(createHeading('Relationships', 2));
    sections.push(...createBulletList([
      'Users have many Sessions (one-to-many, cascade delete)',
      ...(flags.needs_payments ? [
        'Users have many Orders (one-to-many)',
        'Orders have many Line Items (one-to-many, cascade delete)',
        'Products have many Line Items (one-to-many, restrict delete)',
        'Products have many Variants (one-to-many, cascade delete)',
      ] : []),
      ...(flags.needs_auth ? [
        'Users belong to many Roles (many-to-many via join table)',
        'Users have many Audit Log entries (one-to-many)',
      ] : []),
    ]));
  }

  // 6. User Journeys
  sections.push(createHeading('User Journeys', 1));
  sections.push(createParagraph('Key task flows that describe how users accomplish their primary goals within the application. Each journey maps the steps, pages visited, and decision points.'));

  sections.push(createHeading('Journey 1: First-Time Visitor Discovery', 2));
  sections.push(...createBulletList([
    'Entry: Homepage or landing page (via search, social, or direct link)',
    'Browse: Scan hero section, scroll featured content, explore services/products',
    'Engage: Click through to a service detail or blog post',
    'Convert: Complete a contact form enquiry or sign up for a newsletter',
    'Exit: Confirmation message, follow-up email triggered',
  ]));

  sections.push(createHeading('Journey 2: Returning Visitor Task Completion', 2));
  sections.push(...createBulletList([
    'Entry: Direct URL, bookmark, or search for specific page',
    'Navigate: Use primary navigation or search to find target content',
    'Act: Complete the intended task (read article, download resource, submit form)',
    'Cross-sell: View related content or recommended items',
    'Exit: Task completed, optional share or save action',
  ]));

  sections.push(createHeading('Journey 3: Content Consumer', 2));
  sections.push(...createBulletList([
    'Entry: Blog post or resource page (via search engine or social share)',
    'Read: Consume the content, view embedded media',
    'Explore: Click related posts, browse category archive',
    'Subscribe: Sign up for email updates or RSS feed',
    'Return: Receive notification of new content, revisit the site',
  ]));

  if (flags.needs_payments) {
    sections.push(createHeading('Journey 4: Purchase Flow', 2));
    sections.push(...createBulletList([
      'Entry: Product listing page (via navigation, search, or promotion)',
      'Browse: Filter and sort products, compare options',
      'Select: View product detail, choose variants, read reviews',
      'Add to Cart: Select quantity, add to basket, view cart summary',
      'Checkout: Enter shipping details, select payment method, review order',
      'Confirm: Receive order confirmation page and email receipt',
      'Post-purchase: Track order status, leave a review',
    ]));
  }

  if (flags.needs_auth) {
    sections.push(createHeading(`Journey ${flags.needs_payments ? '5' : '4'}: Authenticated User Session`, 2));
    sections.push(...createBulletList([
      'Entry: Login page or session restore from cookie/token',
      'Authenticate: Enter credentials, complete MFA (if enabled)',
      'Dashboard: View personalised dashboard with relevant data and actions',
      'Operate: Perform role-specific tasks (manage content, view reports, update settings)',
      'Account: Update profile, change password, manage preferences',
      'Exit: Logout, session expiry, or idle timeout',
    ]));
  }

  // 7. User Roles & Views (conditional: needs_auth)
  if (flags.needs_auth) {
    sections.push(createHeading('User Roles & Views', 1));
    sections.push(createParagraph('The role matrix defines what each user role can see and do within the application. Permissions are enforced at both the UI and API level.'));

    const roleRows = [
      ['Public / Anonymous', 'View published content, submit public forms, search', 'Public-facing pages only'],
      ['Registered User', 'All public permissions plus profile management, saved preferences, comment/review', 'Public pages + account dashboard'],
      ['Editor / Staff', 'Create and edit content, manage media, moderate comments', 'Public pages + CMS / admin panel'],
      ['Administrator', 'Full system access including user management, settings, integrations', 'All views including system settings'],
    ];
    if (flags.needs_payments) {
      roleRows.splice(2, 0,
        ['Customer', 'All registered user permissions plus order history, wishlist, payment methods', 'Public pages + account + order management'],
      );
    }
    sections.push(createTable(['Role', 'Permissions', 'Default View'], roleRows));
  }

  // 8. Search & Filtering (conditional: needs_database or substantial content implied)
  if (flags.needs_database || flags.needs_search || flags.needs_cms) {
    sections.push(createHeading('Search & Filtering', 1));
    sections.push(createParagraph('Search and filtering capabilities allow users to find content efficiently across the site. This section defines the search scope, available facets, sort options, and how results are displayed.'));

    sections.push(createHeading('Search Scope', 2));
    sections.push(...createBulletList([
      'Global site search — searches across all public content types',
      'Content-type-specific search (e.g. blog posts only, services only)',
      ...(flags.needs_payments ? ['Product search with attribute filtering'] : []),
      'Search suggestions / autocomplete for common queries',
      'Minimum query length: 2 characters',
    ]));

    sections.push(createHeading('Filter Facets', 2));
    sections.push(...createBulletList([
      'Category — filter by content category (hierarchical)',
      'Date — filter by publish date range or predefined periods',
      'Tags — filter by assigned tags (multi-select)',
      ...(flags.needs_payments ? [
        'Price Range — min/max price slider or predefined brackets',
        'Product Attributes — size, colour, material, brand (varies by product type)',
        'Availability — in stock, out of stock, pre-order',
      ] : []),
      'Content Type — filter by page type when searching globally',
    ]));

    sections.push(createHeading('Sort Options', 2));
    sections.push(...createBulletList([
      'Relevance (default for search results)',
      'Date: newest first / oldest first',
      'Alphabetical: A-Z / Z-A',
      ...(flags.needs_payments ? ['Price: low to high / high to low', 'Popularity / best selling'] : []),
    ]));

    sections.push(createHeading('Results Display', 2));
    sections.push(...createBulletList([
      'Card layout with thumbnail, title, excerpt, and metadata',
      'Results count and active filter summary',
      'Pagination: 12-24 items per page with page controls',
      'No-results state with suggestions and alternative actions',
      'Loading state with skeleton placeholders',
    ]));
  }

  // 9. E-commerce Taxonomy (conditional: needs_payments)
  if (flags.needs_payments) {
    sections.push(createHeading('E-commerce Taxonomy', 1));
    sections.push(createParagraph('The product taxonomy defines how products are categorised, attributed, and filtered within the shop. A well-structured taxonomy improves both navigation and SEO.'));

    sections.push(createHeading('Product Categories', 2));
    sections.push(createParagraph('Hierarchical category structure for organising products. Recommended depth: 2-3 levels maximum.'));
    sections.push(...createBulletList([
      'Top-level categories map to primary shop navigation',
      'Sub-categories provide focused browsing within a parent category',
      'Each product belongs to at least one category (primary) and optionally additional categories',
      'Category pages include description, image, and child category links',
    ]));

    sections.push(createHeading('Product Attributes', 2));
    sections.push(...createBulletList([
      'Global attributes shared across all products (brand, material, colour)',
      'Category-specific attributes (e.g. size for clothing, dimensions for furniture)',
      'Variant-defining attributes that create purchasable options (size + colour = variant)',
      'Informational attributes displayed on the product page but not filterable',
    ]));

    sections.push(createHeading('Filter Facets', 2));
    sections.push(...createBulletList([
      'Category (hierarchical navigation)',
      'Price range (slider or predefined brackets)',
      'Key attributes surfaced as filter options per category',
      'Availability (in stock / pre-order)',
      'Rating (if reviews are enabled)',
      'New arrivals / on sale (boolean flags)',
    ]));

    sections.push(createHeading('Collection Pages', 2));
    sections.push(createParagraph('Curated product groupings that exist outside the standard category hierarchy.'));
    sections.push(...createBulletList([
      'Featured Products — editorially curated highlights',
      'New Arrivals — automatically populated based on publish date',
      'Sale / Clearance — products with active discount pricing',
      'Seasonal Collections — time-limited groupings (e.g. summer range, holiday gifts)',
      'Best Sellers — automatically populated based on order volume',
    ]));
  }

  // 10. URL Structure
  sections.push(createHeading('URL Structure', 1));
  sections.push(createParagraph('Consistent, human-readable URL patterns improve both user experience and search engine optimisation. All URLs use lowercase, hyphen-separated slugs with no trailing slashes.'));

  sections.push(createHeading('URL Patterns', 2));
  const urlRows = [
    ['Homepage', '/'],
    ['Static Page', '/{page-slug}'],
    ['Blog Archive', '/blog'],
    ['Blog Category', '/blog/category/{category-slug}'],
    ['Blog Post', '/blog/{post-slug}'],
    ['Service Overview', '/services'],
    ['Service Detail', '/services/{service-slug}'],
    ['Contact', '/contact'],
  ];
  if (flags.needs_payments) {
    urlRows.push(
      ['Shop', '/shop'],
      ['Product Category', '/shop/{category-slug}'],
      ['Product Detail', '/shop/{category-slug}/{product-slug}'],
      ['Cart', '/cart'],
      ['Checkout', '/checkout'],
      ['Order Confirmation', '/checkout/confirmation/{order-id}'],
    );
  }
  if (flags.needs_auth) {
    urlRows.push(
      ['Login', '/login'],
      ['Register', '/register'],
      ['Dashboard', '/dashboard'],
      ['Account Settings', '/account/settings'],
      ['Profile', '/account/profile'],
    );
  }
  if (flags.needs_api) {
    urlRows.push(
      ['API Base', '/api/v1'],
      ['API Documentation', '/docs/api'],
    );
  }
  sections.push(createTable(['Page Type', 'URL Pattern'], urlRows));

  sections.push(createHeading('Canonical URLs', 2));
  sections.push(...createBulletList([
    'Every page specifies a canonical URL via <link rel="canonical">',
    'Paginated pages (e.g. /blog?page=2) canonicalise to the first page or use rel="prev/next"',
    'Parameter variations (e.g. sort, filter) are excluded from canonical URLs',
    'HTTPS is enforced — all HTTP requests redirect to HTTPS (301)',
    'www vs non-www: choose one canonical domain and redirect the other (301)',
  ]));

  sections.push(createHeading('Redirect Strategy', 2));
  sections.push(...createBulletList([
    'Permanent redirects (301) for content that has moved or URLs that have changed',
    'Redirect map maintained for legacy URLs from any previous site version',
    'Catch-all: unknown old URLs redirect to the most relevant section or homepage',
    'Trailing slash normalisation: redirect /page/ to /page (or vice versa, be consistent)',
  ]));

  // 11. Metadata & SEO
  sections.push(createHeading('Metadata & SEO', 1));
  sections.push(createParagraph('Metadata templates ensure consistent, optimised SEO across all page types. Each content type has defined patterns for title tags, meta descriptions, and structured data.'));

  sections.push(createHeading('Title Tag Templates', 2));
  sections.push(...createBulletList([
    'Homepage: {Site Name} — {Tagline}',
    'Static Page: {Page Title} | {Site Name}',
    'Blog Post: {Post Title} | {Blog Name} | {Site Name}',
    'Blog Category: {Category Name} Articles | {Site Name}',
    'Service Detail: {Service Name} — {Site Name}',
    ...(flags.needs_payments ? [
      'Product: {Product Name} | {Category} | {Site Name}',
      'Product Category: {Category Name} — Shop | {Site Name}',
    ] : []),
    'Maximum length: 60 characters (truncate gracefully)',
  ]));

  sections.push(createHeading('Meta Description Patterns', 2));
  sections.push(...createBulletList([
    'Homepage: Manually written, updated periodically, includes primary keywords',
    'Static Page: First 150-160 characters of page content or custom field',
    'Blog Post: Post excerpt or first 150-160 characters of body',
    'Service Detail: Service summary with call-to-action language',
    ...(flags.needs_payments ? ['Product: Product short description with price and key attributes'] : []),
    'Maximum length: 155 characters',
  ]));

  sections.push(createHeading('Structured Data (JSON-LD)', 2));
  sections.push(...createBulletList([
    'Organisation schema on all pages (name, logo, contact, social profiles)',
    'BreadcrumbList on all pages below homepage level',
    'Article / BlogPosting on blog posts (author, datePublished, dateModified, image)',
    'LocalBusiness on contact page (address, opening hours, geo coordinates)',
    'FAQPage on pages with FAQ sections',
    ...(flags.needs_payments ? [
      'Product on product pages (name, price, availability, reviews, SKU)',
      'BreadcrumbList reflecting product category hierarchy',
    ] : []),
    'WebSite with SearchAction for sitelinks search box eligibility',
  ]));

  sections.push(createHeading('Open Graph & Social Tags', 2));
  sections.push(...createBulletList([
    'og:title — mirrors the title tag',
    'og:description — mirrors the meta description',
    'og:image — featured image or default fallback (1200x630px recommended)',
    'og:url — canonical URL of the page',
    'og:type — website (homepage), article (blog posts), product (shop items)',
    'twitter:card — summary_large_image for content with images, summary otherwise',
    'twitter:site — site Twitter/X handle',
  ]));

  // 12. Taxonomy
  sections.push(createHeading('Taxonomy', 1));
  sections.push(createParagraph('The site taxonomy defines how content is classified and related. A clear taxonomy improves navigation, internal linking, and SEO by creating meaningful content groupings.'));

  sections.push(createHeading('Categories (Hierarchical)', 2));
  sections.push(...createBulletList([
    'Used for broad, mutually exclusive content groupings',
    'Support parent-child relationships (recommended max depth: 3 levels)',
    'Each content item should belong to one primary category',
    'Category pages serve as landing pages with curated introductions',
    'Categories appear in navigation, breadcrumbs, and URL structure',
  ]));

  sections.push(createHeading('Tags (Flat)', 2));
  sections.push(...createBulletList([
    'Used for cross-cutting topics that span multiple categories',
    'Non-hierarchical — all tags are equal in weight',
    'Multiple tags per content item (recommended limit: 5-10 per item)',
    'Tag archive pages list all content with that tag',
    'Tags power "related content" suggestions and internal linking',
  ]));

  sections.push(createHeading('Content Relationships', 2));
  sections.push(...createBulletList([
    'Related content: algorithmically suggested based on shared tags and categories',
    'Manual curation: editors can override automatic suggestions with hand-picked related items',
    'Series / sequences: ordered content collections (e.g. multi-part guide)',
    'Cross-references: inline links between related content pieces',
    ...(flags.needs_payments ? ['Product-to-content: link blog posts or guides to relevant products'] : []),
  ]));

  // 13. Internal Linking
  sections.push(createHeading('Internal Linking', 1));
  sections.push(createParagraph('A deliberate internal linking strategy distributes page authority, aids discovery of deeper content, and improves the overall user experience.'));

  sections.push(createHeading('Breadcrumbs', 2));
  sections.push(...createBulletList([
    'Present on all pages below homepage level',
    'Reflects the page hierarchy: Home > Section > Sub-section > Current Page',
    'Linked breadcrumb items (except the current page, which is plain text)',
    'Structured data markup (BreadcrumbList) for search engine display',
  ]));

  sections.push(createHeading('Related Content', 2));
  sections.push(...createBulletList([
    'Displayed at the bottom of detail pages (blog posts, services, products)',
    '3-4 related items shown as cards with thumbnail, title, and excerpt',
    'Selection logic: same category first, then shared tags, then recency',
    'Fallback: show most popular content if no strong matches exist',
  ]));

  sections.push(createHeading('Cross-References', 2));
  sections.push(...createBulletList([
    'In-content links to related pages where contextually relevant',
    'Service pages link to relevant case studies and blog posts',
    'Blog posts link to relevant services and other posts in the same series',
    'CTAs embedded within content to guide users to conversion pages',
  ]));

  sections.push(createHeading('Pagination', 2));
  sections.push(...createBulletList([
    'Numbered pagination on listing pages (blog archive, product listings)',
    'Show current page, first, last, and 2 pages either side of current',
    'rel="prev" and rel="next" link elements for search engine crawling',
    'Items per page: 12-24, configurable per content type',
    '"Load more" option as an alternative to traditional pagination where appropriate',
  ]));

  // 14. Special Pages
  sections.push(createHeading('Special Pages', 1));
  sections.push(createParagraph('Special pages handle non-standard states and system-level interactions. These pages are often overlooked but are critical for a polished user experience.'));

  sections.push(createHeading('404 — Page Not Found', 2));
  sections.push(...createBulletList([
    'Branded design consistent with the rest of the site',
    'Clear message explaining the page was not found',
    'Search bar for finding the intended content',
    'Links to popular pages and main navigation sections',
    'Contact link for reporting broken links',
  ]));

  sections.push(createHeading('Search Results', 2));
  sections.push(...createBulletList([
    'Query displayed prominently with result count',
    'Results grouped by content type (if searching globally)',
    'Highlighted search terms in result excerpts',
    'Spelling suggestions for potential typos',
    'No-results state with alternative suggestions',
  ]));

  sections.push(createHeading('Maintenance / Coming Soon', 2));
  sections.push(...createBulletList([
    'Branded holding page for planned downtime',
    'Expected return time displayed clearly',
    'Contact information for urgent enquiries',
    'HTTP 503 status code with Retry-After header',
  ]));

  sections.push(createHeading('Error States', 2));
  sections.push(...createBulletList([
    '500 — Server error: apologetic message, no technical details exposed, contact link',
    '403 — Forbidden: clear explanation of why access was denied, link to login or homepage',
    'Form validation errors: inline field-level messages, summary at top of form',
    'API error responses: user-friendly messages, technical details logged server-side',
  ]));

  sections.push(createHeading('Empty States', 2));
  sections.push(...createBulletList([
    'No search results: suggestions, popular content links, search tips',
    'Empty category: message explaining content is coming soon, link to related categories',
    ...(flags.needs_payments ? [
      'Empty cart: message with link back to shop, featured products',
      'No orders: message encouraging first purchase, link to shop',
    ] : []),
    ...(flags.needs_auth ? [
      'Empty dashboard: onboarding guidance, first-action prompts',
      'No notifications: confirmation that the user is up to date',
    ] : []),
  ]));

  return createDocument({
    title: 'Information Architecture',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
