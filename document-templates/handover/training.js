// Training Materials document template
// Generates a comprehensive training guide from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = (meta['project-slug'] || '[PROJECT]').replace(/-/g, ' ');
  const company = brandConfig ? getCompanyInfo(brandConfig) : {};
  const siteUrl = params['production-url'] || params['site-url'] || '[SITE URL]';
  const cmsName = params['cms-name'] || params['cms'] || 'the CMS';
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const enrichedClientName = resolveContext(docsState, 'client.name', '') || clientName;
  const appDescription = resolveContext(docsState, 'description', '');

  const sections = [];

  // 1. Training Overview
  sections.push(createHeading('Training Overview', 1));
  const trainingIntro = appDescription
    ? `This training guide is designed to help ${enrichedClientName} staff become confident and self-sufficient in managing ${projectName} — ${appDescription}. It covers all day-to-day operations, from content management to user administration.`
    : `This training guide is designed to help ${enrichedClientName} staff become confident and self-sufficient in managing ${projectName}. It covers all day-to-day operations, from content management to user administration.`;
  sections.push(createParagraph(trainingIntro));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['Application', projectName],
      ['Training Audience', 'Content editors, administrators, and site managers'],
      ['Prerequisites', 'Basic computer literacy and web browser familiarity'],
      ['Estimated Duration', '2–3 hours (can be split across sessions)'],
      ['Support Contact', company.email || '[SUPPORT EMAIL]'],
    ]
  ));

  // 2. Getting Started
  sections.push(createHeading('Getting Started', 1));

  sections.push(createHeading('Logging In', 2));
  sections.push(createBulletList([
    `Navigate to ${siteUrl}/admin (or the admin URL provided)`,
    'Enter your email address and password',
    'If MFA is enabled, enter the code from your authenticator app',
    'Click "Sign In" to access the dashboard',
  ]));

  sections.push(createHeading('Dashboard Overview', 2));
  sections.push(createParagraph('After logging in, you will see the main dashboard. This provides an at-a-glance summary of recent activity and quick links to common tasks.'));
  sections.push(createBulletList([
    'Navigation menu — access all sections from the left sidebar',
    'Quick actions — shortcuts for creating content, viewing reports',
    'Recent activity — shows the latest changes made by all users',
    'Notifications — alerts for tasks requiring your attention',
  ]));

  sections.push(createHeading('Your Profile', 2));
  sections.push(createBulletList([
    'Click your name or avatar in the top-right corner',
    'Update your display name, email, and profile photo',
    'Change your password (must meet complexity requirements)',
    'Set notification preferences',
  ]));

  // 3. Content Management
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management', 1));

    sections.push(createHeading('Creating Content', 2));
    sections.push(createParagraph(`${cmsName} allows you to create and publish content without any coding knowledge. Each content type has a specific set of fields tailored to its purpose.`));
    sections.push(createBulletList([
      'Click "New" or the "+" button from the content section',
      'Select the content type (page, post, product, etc.)',
      'Fill in the required fields — these are marked with an asterisk (*)',
      'Use the rich text editor for body content (formatting toolbar above)',
      'Add images by clicking the media button or dragging files into the editor',
      'Set the URL slug — this determines the page address',
      'Choose categories and tags to organise the content',
      'Click "Save Draft" to save without publishing, or "Publish" to make it live',
    ]));

    sections.push(createHeading('Editing Existing Content', 2));
    sections.push(createBulletList([
      'Navigate to the content list from the sidebar',
      'Use search or filters to find the item you want to edit',
      'Click the item title to open the editor',
      'Make your changes — all changes are tracked in the revision history',
      'Click "Update" to save and publish changes',
      'Use "Preview" to see changes before publishing',
    ]));

    sections.push(createHeading('Managing Media', 2));
    sections.push(createParagraph('The media library stores all uploaded images, documents, and files.'));
    sections.push(createBulletList([
      'Navigate to Media from the sidebar',
      'Upload files by clicking "Upload" or dragging files into the library',
      'Supported formats: JPEG, PNG, WebP, GIF, SVG, PDF, DOCX',
      'Images are automatically optimised and resized on upload',
      'Click any file to view details, edit alt text, or get the URL',
      'Delete unused media to keep the library organised',
    ]));

    sections.push(createHeading('Publishing Workflow', 2));
    sections.push(createTable(
      ['Status', 'Description', 'Who Can Set'],
      [
        ['Draft', 'Work in progress, not visible to the public', 'Authors, Editors, Admins'],
        ['In Review', 'Ready for editorial review', 'Authors, Editors'],
        ['Scheduled', 'Will publish automatically at a set date/time', 'Editors, Admins'],
        ['Published', 'Live and visible to the public', 'Editors, Admins'],
        ['Archived', 'Removed from public view but preserved', 'Editors, Admins'],
      ]
    ));
  }

  // 4. Navigation & Menus
  if (flags.needs_cms) {
    sections.push(createHeading('Navigation & Menus', 1));
    sections.push(createParagraph('Menus control the navigation links displayed on your website. You can add, remove, and reorder menu items.'));
    sections.push(createBulletList([
      'Navigate to Appearance > Menus from the admin sidebar',
      'Select the menu you want to edit (e.g. Main Navigation, Footer)',
      'Add items: click "Add Item" and choose a page, link, or category',
      'Reorder: drag and drop items to change their position',
      'Nest items: drag an item slightly to the right to create a sub-menu',
      'Remove items: click the item and select "Remove"',
      'Click "Save Menu" to apply changes — they take effect immediately',
    ]));
  }

  // 5. Forms & Enquiries
  if (flags.needs_forms || flags.needs_email) {
    sections.push(createHeading('Forms & Enquiries', 1));
    sections.push(createParagraph('Contact forms and other enquiry forms collect submissions from your website visitors.'));

    sections.push(createHeading('Viewing Submissions', 2));
    sections.push(createBulletList([
      'Navigate to Forms > Submissions from the admin sidebar',
      'Submissions are listed in reverse chronological order',
      'Click a submission to view the full details',
      'Use filters to narrow by form, date range, or status',
      'Export submissions as CSV for reporting or import into other systems',
    ]));

    sections.push(createHeading('Managing Form Notifications', 2));
    sections.push(createBulletList([
      'Each form can send email notifications to one or more recipients',
      'Navigate to Forms > select form > Notifications to manage recipients',
      'Add or remove email addresses as needed',
      'Notification emails include all submitted data',
    ]));
  }

  // 6. E-Commerce
  if (flags.needs_payments) {
    sections.push(createHeading('E-Commerce Management', 1));

    sections.push(createHeading('Managing Products', 2));
    sections.push(createBulletList([
      'Navigate to Products from the admin sidebar',
      'Click "Add Product" to create a new product',
      'Fill in: title, description, price, images, inventory count',
      'Set product categories and tags for organisation',
      'Enable/disable product visibility with the "Published" toggle',
      'Manage variants (size, colour, etc.) in the Variants tab',
    ]));

    sections.push(createHeading('Processing Orders', 2));
    sections.push(createTable(
      ['Order Status', 'Meaning', 'Action Required'],
      [
        ['Pending', 'Payment not yet confirmed', 'Wait for payment confirmation'],
        ['Processing', 'Payment received, awaiting fulfilment', 'Prepare and ship the order'],
        ['Shipped', 'Order dispatched', 'No action — customer notified automatically'],
        ['Completed', 'Order delivered', 'None'],
        ['Refunded', 'Payment returned to customer', 'None'],
        ['Cancelled', 'Order cancelled', 'Restock inventory if applicable'],
      ]
    ));

    sections.push(createHeading('Managing Discounts', 2));
    sections.push(createBulletList([
      'Navigate to Marketing > Discounts',
      'Click "Create Discount" and set: code, type (percentage/fixed), amount, expiry',
      'Set usage limits (total uses, per-customer limit)',
      'Restrict to specific products or categories if needed',
      'Discounts are automatically validated at checkout',
    ]));
  }

  // 7. Search
  if (flags.needs_search) {
    sections.push(createHeading('Site Search', 1));
    sections.push(createParagraph('The site search allows visitors to find content across the entire website.'));
    sections.push(createBulletList([
      'Search results update as users type (instant search)',
      'Results are ranked by relevance',
      'If search results seem outdated, ask an administrator to rebuild the search index',
      'Search analytics are available in the Analytics section',
    ]));
  }

  // 8. Analytics
  if (flags.needs_analytics) {
    sections.push(createHeading('Understanding Analytics', 1));
    sections.push(createParagraph('The analytics dashboard provides insights into how visitors use your website.'));

    sections.push(createHeading('Key Metrics', 2));
    sections.push(createTable(
      ['Metric', 'What It Means'],
      [
        ['Page Views', 'Total number of pages viewed across all visitors'],
        ['Unique Visitors', 'Number of distinct people who visited'],
        ['Bounce Rate', 'Percentage of visitors who left after viewing one page'],
        ['Average Session Duration', 'How long visitors typically stay on the site'],
        ['Top Pages', 'Most frequently visited pages'],
        ['Traffic Sources', 'Where visitors come from (search, social, direct, referral)'],
      ]
    ));

    sections.push(createHeading('Using Reports', 2));
    sections.push(createBulletList([
      'Navigate to Analytics from the admin sidebar',
      'Select a date range to compare different periods',
      'Use the dropdown filters to view specific content types or traffic sources',
      'Export reports as PDF or CSV for stakeholder meetings',
    ]));
  }

  // 9. User Management (for editors/managers)
  if (flags.needs_auth) {
    sections.push(createHeading('Managing Users', 1));
    sections.push(createParagraph('If you have admin or manager permissions, you can create and manage user accounts.'));
    sections.push(createBulletList([
      'Navigate to Users from the admin sidebar',
      'Click "Add User" to create a new account',
      'Enter their email, name, and assign a role',
      'The new user will receive a welcome email with login instructions',
      'To change a user\'s role, click their name and select a new role',
      'To deactivate a user, click "Deactivate" — this preserves their content',
    ]));

    sections.push(createHeading('Role Quick Reference', 2));
    sections.push(createTable(
      ['Role', 'Can Create Content', 'Can Edit Others\' Content', 'Can Manage Users', 'Can Access Settings'],
      [
        ['Author', 'Yes (own only)', 'No', 'No', 'No'],
        ['Editor', 'Yes', 'Yes', 'No', 'No'],
        ['Admin', 'Yes', 'Yes', 'Yes', 'Yes'],
      ]
    ));
  }

  // 10. Common Tasks Quick Reference
  sections.push(createHeading('Common Tasks Quick Reference', 1));
  sections.push(createTable(
    ['Task', 'Steps'],
    [
      ['Change page content', 'Content > find page > click to edit > make changes > Update'],
      ['Add a new page', 'Content > New > Page > fill fields > Publish'],
      ['Upload an image', 'Media > Upload > select file or drag-and-drop'],
      ['Update navigation menu', 'Appearance > Menus > edit > Save Menu'],
      ['Change your password', 'Profile (top-right) > Change Password > save'],
      ['View form submissions', 'Forms > Submissions > select form'],
      ['Check site analytics', 'Analytics > select date range > view reports'],
    ]
  ));

  // 11. Troubleshooting
  sections.push(createHeading('Troubleshooting', 1));
  sections.push(createTable(
    ['Problem', 'Solution'],
    [
      ['Cannot log in', 'Use "Forgot Password" link, or contact your admin to reset'],
      ['Changes not appearing on site', 'Clear browser cache (Ctrl+Shift+R), check publish status'],
      ['Image upload fails', 'Check file size (max 10MB) and format (JPEG, PNG, WebP, GIF)'],
      ['Page shows old content', 'Try clearing site cache via Admin > System > Cache'],
      ['Editor toolbar missing', 'Try a different browser or disable browser extensions'],
      ['Received an error message', 'Note the error, take a screenshot, and contact support'],
    ]
  ));

  // 12. Getting Help
  sections.push(createHeading('Getting Help', 1));
  sections.push(createParagraph('If you need assistance beyond what this training guide covers:'));
  sections.push(createBulletList([
    `Email support: ${company.email || '[SUPPORT EMAIL]'}`,
    `Phone support: ${company.phone || '[SUPPORT PHONE]'}`,
    'When contacting support, please include:',
  ]));
  sections.push(createBulletList([
    'A clear description of what you were trying to do',
    'The exact steps you took',
    'Any error messages (screenshots are helpful)',
    'The browser and device you are using',
  ]));

  return createDocument({
    title: 'Training Materials',
    subtitle: projectName,
    clientName: enrichedClientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
