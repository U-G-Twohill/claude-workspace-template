// User Manual document template
// Generates a comprehensive end-user manual from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || params['project-name'] || '[PROJECT NAME]';
  const company = getCompanyInfo(brandConfig || {});
  const siteUrl = params['production-url'] || params['site-url'] || '[your website URL]';
  const cmsName = params['cms-name'] || params['cms'] || 'the content management system';
  const supportEmail = params['support-email'] || company.email || '[support email]';
  const supportPhone = params['support-phone'] || company.phone || '';
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const enrichedClientName = resolveContext(docsState, 'client.name', '') || clientName;
  const appDescription = resolveContext(docsState, 'description', '');

  const sections = [];

  // =========================================================================
  // 1. Getting Started
  // =========================================================================
  sections.push(createHeading('Getting Started', 1));
  const overviewDesc = appDescription
    ? `${projectName} is ${appDescription}. This guide covers everything you need to manage and maintain your website on a day-to-day basis. It is written for non-technical users and assumes no prior development experience.`
    : `Welcome to the user manual for ${projectName}. This guide covers everything you need to manage and maintain your website on a day-to-day basis. It is written for non-technical users and assumes no prior development experience.`;
  sections.push(createParagraph(overviewDesc));
  sections.push(createParagraph('Each section focuses on a specific area of the site. You can read through sequentially or jump to the section relevant to your current task using the table of contents above.'));

  sections.push(createHeading('Accessing Your Website', 2));
  sections.push(createParagraph('Your website is accessible at the following address:'));
  sections.push(...createBulletList([
    `Live site: ${siteUrl}`,
    `Admin / CMS login: ${params['admin-url'] || siteUrl + '/admin'}`,
  ]));

  sections.push(createHeading('Browser Compatibility', 2));
  sections.push(createParagraph('The admin interface works best in modern browsers. We recommend using the latest version of any of the following:'));
  sections.push(...createBulletList([
    'Google Chrome (recommended)',
    'Mozilla Firefox',
    'Microsoft Edge',
    'Safari (macOS / iOS)',
  ]));

  sections.push(createHeading('Key Terminology', 2));
  sections.push(createTable(
    ['Term', 'Meaning'],
    [
      ['Dashboard', 'The main admin screen you see after logging in'],
      ['CMS', 'Content Management System — the tool used to edit your website content'],
      ['Page', 'A single page on your website (e.g. Home, About, Contact)'],
      ['Post / Article', 'A blog entry or news item with a publish date'],
      ['Media', 'Images, videos, and documents uploaded to the site'],
      ['Component / Block', 'A reusable section of a page (e.g. hero banner, testimonial slider)'],
      ['Slug', 'The URL-friendly version of a page title (e.g. "about-us")'],
      ['Draft', 'Content that has been saved but is not yet visible to the public'],
      ['Published', 'Content that is live and visible to all visitors'],
    ]
  ));

  // =========================================================================
  // 2. Account Management (conditional: needs_auth)
  // =========================================================================
  if (flags.needs_auth) {
    sections.push(createHeading('Account Management', 1));
    sections.push(createParagraph('Your website uses a login system to control access to the admin area. This section explains how to manage your account and user permissions.'));

    sections.push(createHeading('Logging In', 2));
    sections.push(createParagraph(`Navigate to ${params['admin-url'] || siteUrl + '/admin'} and enter your email address and password. If this is your first time logging in, use the credentials provided in your welcome email.`));
    sections.push(...createBulletList([
      'Enter your email address in the Email field',
      'Enter your password in the Password field',
      'Click the Log In button',
      'You will be redirected to the admin dashboard',
    ]));

    sections.push(createHeading('Changing Your Password', 2));
    sections.push(createParagraph('We recommend changing your password after your first login and periodically thereafter.'));
    sections.push(...createBulletList([
      'Click your name or profile icon in the top-right corner of the admin area',
      'Select Account Settings or Profile',
      'Enter your current password, then enter and confirm your new password',
      'Click Save or Update Password',
      'Use a strong password: at least 12 characters with a mix of letters, numbers, and symbols',
    ]));

    sections.push(createHeading('Resetting a Forgotten Password', 2));
    sections.push(...createBulletList([
      'On the login page, click the Forgot Password link',
      'Enter the email address associated with your account',
      'Check your inbox for a password reset email (check spam/junk if not found within a few minutes)',
      'Click the link in the email and set a new password',
      `If you do not receive the email, contact ${supportEmail} for assistance`,
    ]));

    sections.push(createHeading('User Roles and Permissions', 2));
    sections.push(createParagraph('Your site may have multiple user roles with different levels of access:'));
    sections.push(createTable(
      ['Role', 'Permissions'],
      [
        ['Administrator', 'Full access to all settings, content, users, and configuration'],
        ['Editor', 'Create, edit, and publish all content; manage media; cannot change settings or users'],
        ['Author', 'Create and edit their own content; submit for review; upload media'],
        ['Viewer', 'View content in the admin area; cannot make changes'],
      ]
    ));
    sections.push(createParagraph('To add or modify users, navigate to the Users section in the admin menu. Only administrators can manage user accounts.'));
  }

  // =========================================================================
  // 3. Content Management (conditional: needs_cms)
  // =========================================================================
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management', 1));
    sections.push(createParagraph(`${cmsName} allows you to create, edit, and organise all the content on your website without touching any code. This section covers the core content editing workflows.`));

    sections.push(createHeading('Pages', 2));
    sections.push(createParagraph('Pages are the main sections of your website (e.g. Home, About, Services, Contact). Most pages are already created and configured.'));

    sections.push(createHeading('Editing an Existing Page', 3));
    sections.push(...createBulletList([
      'Navigate to Pages in the admin menu',
      'Click on the page you want to edit',
      'Make your changes in the editor — text, images, and layout components can all be modified',
      'Click Preview to see your changes before publishing (if available)',
      'Click Save or Publish to make the changes live',
    ]));

    sections.push(createHeading('Creating a New Page', 3));
    sections.push(...createBulletList([
      'Navigate to Pages in the admin menu',
      'Click Create New Page or the + button',
      'Enter the page title — the URL slug will be generated automatically',
      'Add content using the editor: text blocks, images, and components',
      'Set the page status to Draft if you are not ready to publish',
      'Click Publish when the page is ready to go live',
    ]));

    sections.push(createHeading('Blog Posts / Articles', 2));
    sections.push(createParagraph('Blog posts work similarly to pages but are date-stamped and displayed in reverse chronological order on your blog page.'));
    sections.push(...createBulletList([
      'Navigate to Posts or Blog in the admin menu',
      'Click Create New Post',
      'Enter the title, body content, and optionally a featured image',
      'Assign one or more categories and/or tags to help organise the post',
      'Set the publish date — future dates will schedule the post for automatic publication',
      'Click Publish or Save as Draft',
    ]));

    sections.push(createHeading('Editing Tips', 2));
    sections.push(...createBulletList([
      'Use headings (H2, H3) to structure your content — this improves readability and SEO',
      'Keep paragraphs short — 2 to 4 sentences is ideal for web readability',
      'Add alt text to every image — this describes the image for search engines and screen readers',
      'Use the Preview function to check your layout before publishing',
      'Save your work frequently — most systems auto-save drafts, but manual saves are safest',
      'Avoid copying and pasting directly from Word — use the Paste as Plain Text option to prevent formatting issues',
    ]));
  }

  // =========================================================================
  // 4. Media Management
  // =========================================================================
  sections.push(createHeading('Media Management', 1));
  sections.push(createParagraph('The media library stores all images, documents, and files used on your website. Properly managed media keeps your site fast and professional.'));

  sections.push(createHeading('Uploading Files', 2));
  sections.push(...createBulletList([
    'Navigate to the Media Library in the admin menu',
    'Click Upload or drag and drop files into the upload area',
    'Supported image formats: JPEG, PNG, WebP, SVG, GIF',
    'Supported document formats: PDF, DOCX, XLSX (depending on configuration)',
    'Maximum file size: ' + (params['max-upload-size'] || '10 MB') + ' per file',
  ]));

  sections.push(createHeading('Image Best Practices', 2));
  sections.push(createParagraph('Following these guidelines ensures your site loads quickly and looks sharp on all devices:'));
  sections.push(createTable(
    ['Guideline', 'Recommendation'],
    [
      ['File format', 'Use JPEG for photos, PNG for graphics with transparency, WebP for optimal compression'],
      ['Resolution', 'Maximum 2000px on the longest side for full-width images; 1200px for content images'],
      ['File size', 'Aim for under 500 KB per image — compress before uploading using tools like TinyPNG or Squoosh'],
      ['Naming', 'Use descriptive filenames (e.g. team-photo-2026.jpg rather than IMG_4521.jpg)'],
      ['Alt text', 'Always add alt text — describe what the image shows in 1-2 sentences'],
    ]
  ));

  sections.push(createHeading('Organising Media', 2));
  sections.push(...createBulletList([
    'Use folders or tags (if available) to group related media together',
    'Delete unused media periodically to keep the library manageable',
    'Before deleting, check whether the file is used on any page — some CMS platforms warn you about this',
  ]));

  // =========================================================================
  // 5. Navigation & Menus
  // =========================================================================
  sections.push(createHeading('Navigation & Menus', 1));
  sections.push(createParagraph('Your website navigation (header menu, footer links, sidebar) can be updated through the admin area. Changes to navigation affect the entire site.'));

  sections.push(createHeading('Editing the Main Menu', 2));
  sections.push(...createBulletList([
    'Navigate to Menus or Navigation in the admin settings',
    'Select the menu you want to edit (e.g. Header Menu, Footer Menu)',
    'To add a page: select the page from the list and click Add to Menu',
    'To reorder items: drag and drop menu items into the desired order',
    'To create a dropdown: drag a menu item slightly to the right underneath a parent item',
    'To remove an item: click the item and select Remove or Delete',
    'Click Save Menu when finished',
  ]));

  sections.push(createHeading('Adding External Links', 2));
  sections.push(createParagraph('You can add links to external websites in your navigation:'));
  sections.push(...createBulletList([
    'In the menu editor, look for a Custom Link or External URL option',
    'Enter the full URL (including https://) and a label for the link',
    'Consider setting external links to open in a new tab so visitors stay on your site',
  ]));

  sections.push(createHeading('Best Practices', 2));
  sections.push(...createBulletList([
    'Keep the main menu to 5-7 items — too many options overwhelm visitors',
    'Use clear, concise labels (e.g. "Services" rather than "What We Offer To Our Clients")',
    'Place the most important items first — visitors scan left to right',
    'Test the navigation on mobile after making changes',
  ]));

  // =========================================================================
  // 6. Forms & Data
  // =========================================================================
  sections.push(createHeading('Forms & Data', 1));
  sections.push(createParagraph('Your website may include contact forms, enquiry forms, or other data collection forms. This section explains how to manage form submissions and settings.'));

  sections.push(createHeading('Viewing Submissions', 2));
  sections.push(...createBulletList([
    'Navigate to Forms or Submissions in the admin menu',
    'Select the form you want to review (e.g. Contact Form, Enquiry Form)',
    'Submissions are listed in reverse chronological order — newest first',
    'Click on a submission to see the full details',
    'Most forms also send an email notification to the configured address when a new submission arrives',
  ]));

  sections.push(createHeading('Managing Notification Emails', 2));
  sections.push(createParagraph('Form submissions are typically emailed to one or more recipients. To change who receives notifications:'));
  sections.push(...createBulletList([
    'Open the form settings in the admin area',
    'Look for the Notification Email or Recipients field',
    'Add or remove email addresses as needed',
    'Save the form settings',
    `If you cannot find this setting, contact ${supportEmail} for assistance`,
  ]));

  sections.push(createHeading('Exporting Data', 2));
  sections.push(createParagraph('You can export form submissions for record-keeping or analysis:'));
  sections.push(...createBulletList([
    'Navigate to the form submissions list',
    'Look for an Export or Download button',
    'Select the format (CSV is compatible with Excel and Google Sheets)',
    'Choose a date range if available',
    'The downloaded file contains all submission data for the selected period',
  ]));

  // =========================================================================
  // 7. E-commerce (conditional: needs_payments)
  // =========================================================================
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'the payment provider';
    const currency = params['currency'] || 'NZD';

    sections.push(createHeading('E-commerce', 1));
    sections.push(createParagraph(`Your website includes e-commerce functionality powered by ${paymentProvider}. This section covers managing products, orders, and payments.`));

    sections.push(createHeading('Managing Products', 2));
    sections.push(...createBulletList([
      'Navigate to Products in the admin menu',
      'To add a product: click Create New Product or the + button',
      'Enter the product name, description, price, and images',
      'Set inventory / stock quantity if applicable',
      'Assign the product to a category for easy browsing',
      'Set the product status to Published to make it available in the shop',
      'Click Save',
    ]));

    sections.push(createHeading('Product Details', 2));
    sections.push(createTable(
      ['Field', 'Description', 'Tips'],
      [
        ['Name', 'The product title displayed to customers', 'Keep it concise and descriptive'],
        ['Description', 'Detailed product information', 'Include materials, dimensions, and key features'],
        ['Price', `Product price in ${currency}`, 'Enter the price excluding or including tax as configured'],
        ['Images', 'Product photos', 'Use high-quality images; the first image is the main thumbnail'],
        ['SKU', 'Stock Keeping Unit — a unique identifier', 'Useful for inventory tracking'],
        ['Stock', 'Available quantity', 'Set to 0 to show as out of stock; leave blank for unlimited'],
        ['Category', 'Product grouping', 'Helps customers find related products'],
      ]
    ));

    sections.push(createHeading('Managing Orders', 2));
    sections.push(...createBulletList([
      'Navigate to Orders in the admin menu',
      'Orders are listed with their status: Pending, Processing, Completed, Refunded, or Cancelled',
      'Click on an order to view the full details: items, customer information, shipping address, and payment status',
      'Update the order status as you process it (e.g. from Processing to Completed when shipped)',
      'Refunds can be initiated from the order detail page — this will process the refund through ' + paymentProvider,
    ]));

    sections.push(createHeading('Payment Settings', 2));
    sections.push(createParagraph(`Payments are processed securely through ${paymentProvider}. Your customers' card details are never stored on your website.`));
    sections.push(...createBulletList([
      `Payment processing is handled by ${paymentProvider} — you do not need to handle card details directly`,
      `Transaction fees are set by ${paymentProvider} and deducted from each payment`,
      'Payouts are deposited to your linked bank account on the schedule configured in your ' + paymentProvider + ' dashboard',
      `To view transaction details or manage disputes, log in to your ${paymentProvider} dashboard`,
      `For payment configuration changes, contact ${supportEmail}`,
    ]));
  }

  // =========================================================================
  // 8. Search (conditional: needs_search)
  // =========================================================================
  if (flags.needs_search) {
    const searchTech = params['search-technology'] || 'the search engine';

    sections.push(createHeading('Search', 1));
    sections.push(createParagraph(`Your website includes a search feature powered by ${searchTech}. This allows visitors to find content quickly across all pages and posts.`));

    sections.push(createHeading('How Search Works', 2));
    sections.push(...createBulletList([
      'Visitors can use the search bar (typically in the header or a dedicated search page) to find content',
      'Search indexes page titles, body content, and metadata',
      'Results are ranked by relevance and displayed with a title, excerpt, and link',
      'The search index is updated automatically when content is published or modified',
    ]));

    sections.push(createHeading('Improving Search Results', 2));
    sections.push(createParagraph('You can influence how well your content appears in search results:'));
    sections.push(...createBulletList([
      'Use clear, descriptive page titles — these carry the most weight in search rankings',
      'Write meaningful headings within your content (H2, H3) — search uses these to understand content structure',
      'Add meta descriptions to pages — these appear as the excerpt in search results',
      'Use consistent terminology — if customers search for "pricing", ensure your pricing page uses that word',
      'Avoid duplicate content across multiple pages — this dilutes search relevance',
    ]));

    sections.push(createHeading('Search Analytics', 2));
    sections.push(createParagraph('If search analytics are enabled, you can review what visitors are searching for:'));
    sections.push(...createBulletList([
      'Navigate to the Search Analytics section in the admin area (if available)',
      'Review the most common search terms to understand what visitors are looking for',
      'Look for searches with zero results — these indicate content gaps you may want to address',
      'Use this data to inform new content creation and page naming',
    ]));
  }

  // =========================================================================
  // 9. Reports (conditional: needs_analytics)
  // =========================================================================
  if (flags.needs_analytics) {
    const analyticsProvider = params['analytics-provider'] || 'your analytics platform';

    sections.push(createHeading('Reports & Analytics', 1));
    sections.push(createParagraph(`Your website is connected to ${analyticsProvider} for tracking visitor behaviour and site performance. This section explains how to access and interpret the key metrics.`));

    sections.push(createHeading('Accessing Reports', 2));
    sections.push(...createBulletList([
      `Log in to ${analyticsProvider} using the credentials provided in your welcome pack`,
      'Select the property or site corresponding to your website',
      'Use the date range selector to view data for a specific period',
      'Reports can be exported as PDF or CSV for sharing with your team',
    ]));

    sections.push(createHeading('Key Metrics', 2));
    sections.push(createTable(
      ['Metric', 'What It Measures', 'Why It Matters'],
      [
        ['Visitors (Users)', 'Number of unique people visiting your site', 'Indicates your overall reach and audience size'],
        ['Page Views', 'Total number of pages viewed', 'Shows how much content visitors are consuming'],
        ['Bounce Rate', 'Percentage of visitors who leave after viewing only one page', 'High bounce rate may indicate content or UX issues'],
        ['Average Session Duration', 'How long visitors spend on your site', 'Longer sessions suggest engaged visitors'],
        ['Top Pages', 'Most visited pages on your site', 'Shows which content resonates most with your audience'],
        ['Traffic Sources', 'Where visitors come from (search, social, direct, referral)', 'Helps you understand which marketing channels are working'],
        ['Conversions / Goals', 'Completed actions (form submissions, purchases, sign-ups)', 'The most important metric — measures whether your site achieves its goals'],
      ]
    ));

    sections.push(createHeading('Understanding Your Data', 2));
    sections.push(...createBulletList([
      'Compare periods (e.g. this month vs last month) to identify trends',
      'Look at traffic sources to understand which channels drive the most visitors',
      'Review top pages monthly to ensure your most important content is performing well',
      'Check mobile vs desktop split — if most visitors are on mobile, ensure the mobile experience is excellent',
      'Track conversions (form submissions, sales) rather than just page views — conversions measure real business value',
      `For help interpreting your analytics data, contact ${supportEmail}`,
    ]));
  }

  // =========================================================================
  // 10. Troubleshooting
  // =========================================================================
  sections.push(createHeading('Troubleshooting', 1));
  sections.push(createParagraph('This section covers common issues you may encounter and how to resolve them. If your issue is not listed here, contact support for assistance.'));

  const troubleshootRows = [
    ['Cannot log in to the admin area', 'Incorrect password or account locked', 'Use the Forgot Password link to reset your password. If your account is locked, wait 15 minutes and try again.'],
    ['Changes not appearing on the live site', 'Browser cache showing old content', 'Clear your browser cache (Ctrl+Shift+Delete) or open the page in a private/incognito window. Changes may also take a few minutes to propagate if caching is enabled.'],
    ['Images appear blurry or distorted', 'Uploaded image is too small or wrong aspect ratio', 'Re-upload a higher resolution image. Check the recommended dimensions in the Media Management section.'],
    ['Page loads slowly', 'Large images or too many elements', 'Optimise images before uploading (compress and resize). Remove unused media and plugins if possible.'],
    ['Broken link or 404 error', 'Page was moved, renamed, or deleted', 'Check the page still exists in the admin. If it was renamed, the old URL may need a redirect.'],
    ['Form submissions not arriving by email', 'Notification email misconfigured or going to spam', 'Check the form notification settings. Ask recipients to check their spam folder. Verify the email address is correct.'],
    ['Content formatting looks wrong', 'Pasted from Word or another rich text editor', 'Delete the affected content, then paste again using Paste as Plain Text (Ctrl+Shift+V). Reapply formatting using the editor tools.'],
    ['Cannot upload a file', 'File too large or unsupported format', 'Check the file size limit (' + (params['max-upload-size'] || '10 MB') + '). Convert the file to a supported format (see Media Management section).'],
  ];

  if (flags.needs_auth) {
    troubleshootRows.push(['Forgotten which email is linked to your account', 'Multiple email addresses in use', `Contact ${supportEmail} and they can look up your account.`]);
  }
  if (flags.needs_payments) {
    troubleshootRows.push(['Customer reports payment failed', 'Card declined or payment gateway issue', 'Check the order status in the admin. Ask the customer to try a different payment method. Review the payment provider dashboard for error details.']);
  }

  sections.push(createTable(['Problem', 'Likely Cause', 'Solution'], troubleshootRows));

  sections.push(createHeading('Browser-Specific Issues', 2));
  sections.push(createParagraph('If you experience display or functionality issues:'));
  sections.push(...createBulletList([
    'Ensure your browser is updated to the latest version',
    'Try a different browser to determine whether the issue is browser-specific',
    'Disable browser extensions temporarily — ad blockers and privacy extensions can interfere with admin interfaces',
    'Clear your browser cache and cookies for the site',
  ]));

  // =========================================================================
  // 11. Support
  // =========================================================================
  sections.push(createHeading('Support', 1));
  sections.push(createParagraph('If you need assistance with anything not covered in this manual, our support team is here to help.'));

  sections.push(createHeading('Contact Details', 2));

  const contactRows = [
    ['Email', supportEmail],
  ];
  if (supportPhone) {
    contactRows.push(['Phone', supportPhone]);
  }
  if (company.website) {
    contactRows.push(['Website', company.website]);
  }
  contactRows.push(['Availability', params['support-hours'] || 'Monday to Friday, 9:00 AM - 5:00 PM (NZ time)']);
  sections.push(createTable(['Channel', 'Details'], contactRows));

  sections.push(createHeading('What to Include in a Support Request', 2));
  sections.push(createParagraph('To help us resolve your issue as quickly as possible, please include:'));
  sections.push(...createBulletList([
    'A clear description of the problem — what you expected to happen vs what actually happened',
    'The page or section of the admin area where the issue occurred',
    'Steps to reproduce the issue (what did you click or do before the problem appeared?)',
    'Screenshots if possible — these are extremely helpful for visual issues',
    'The browser and device you are using (e.g. Chrome on Windows, Safari on iPhone)',
    'Any error messages displayed on screen',
  ]));

  sections.push(createHeading('Response Times', 2));
  sections.push(createTable(
    ['Priority', 'Description', 'Target Response Time'],
    [
      ['Critical', 'Site is down or a major feature is completely broken', params['sla-critical'] || 'Within 2 hours during business hours'],
      ['High', 'A feature is impaired but the site is still usable', params['sla-high'] || 'Within 4 hours during business hours'],
      ['Normal', 'A non-urgent issue, question, or content change request', params['sla-normal'] || 'Within 1 business day'],
      ['Low', 'Feature request, suggestion, or minor cosmetic issue', params['sla-low'] || 'Within 3 business days'],
    ]
  ));

  sections.push(createHeading('Maintenance & Updates', 2));
  sections.push(createParagraph('Your website requires periodic maintenance to stay secure and performant:'));
  sections.push(...createBulletList([
    'Software updates (CMS, plugins, and dependencies) are applied regularly to patch security vulnerabilities',
    'Backups are taken automatically — in the event of data loss, we can restore from the most recent backup',
    'Scheduled maintenance windows, if needed, will be communicated in advance',
    `If you are on a maintenance plan, these updates are handled for you by ${company.name || 'the development team'}`,
    `For maintenance plan enquiries, contact ${supportEmail}`,
  ]));

  return createDocument({
    title: 'User Manual',
    subtitle: projectName,
    clientName: enrichedClientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
