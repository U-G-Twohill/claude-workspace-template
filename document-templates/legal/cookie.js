// Cookie Policy document template
// ePrivacy principles, NZ Privacy Act 2020

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { loadActiveIntegrationClauses, resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const siteUrl = params['site-url'] || meta['site-url'] || ctx.client?.website || '[WEBSITE URL]';
  const contactEmail = params['contact-email'] || brandConfig?.contactEmail || '[CONTACT EMAIL]';
  const effectiveDate = params['effective-date'] || new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const integrations = loadActiveIntegrationClauses(docsState.integrationClauses);
  const hasAuth = flags.needs_auth || false;
  const hasCms = flags.needs_cms || false;

  // Determine which cookie categories apply
  const hasAnalyticsIntegrations = integrations.some(({ name }) =>
    ['google-analytics', 'ga4', 'plausible', 'fathom', 'matomo', 'hotjar', 'hubspot', 'mixpanel', 'amplitude'].includes(name.toLowerCase())
  );
  const hasMarketingIntegrations = integrations.some(({ name }) =>
    ['google-ads', 'facebook-pixel', 'meta-pixel', 'linkedin-ads', 'tiktok-pixel', 'pinterest-tag'].includes(name.toLowerCase())
  );

  const sections = [];

  // --- 1. What Are Cookies ---
  sections.push(createHeading('What Are Cookies', 1));
  sections.push(createParagraph(
    'Cookies are small text files that are placed on your computer, phone, or other device when you visit a website. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to the website operator.'
  ));
  sections.push(createParagraph(
    'Cookies are stored by your web browser and can be read by the website that created them on subsequent visits. Some cookies are deleted when you close your browser (session cookies), while others remain on your device for a set period or until you delete them (persistent cookies).'
  ));
  sections.push(createParagraph(
    `This Cookie Policy explains how ${company} ("we", "us", or "our") uses cookies and similar tracking technologies on ${projectName} (accessible at ${siteUrl}). This policy should be read alongside our Privacy Policy, which explains how we handle your personal information more broadly.`
  ));

  // --- 2. How We Use Cookies ---
  sections.push(createHeading('How We Use Cookies', 1));
  sections.push(createParagraph(
    'We use the following categories of cookies on our website:'
  ));

  // 2a. Essential (always)
  sections.push(createHeading('Essential Cookies', 2));
  sections.push(createParagraph(
    'These cookies are strictly necessary for the website to function and cannot be switched off in our systems. They are set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms. Without these cookies, the website cannot operate correctly.'
  ));
  sections.push(...createBulletList([
    'Session management: Maintain your session as you navigate between pages so you do not need to re-authenticate on each page load',
    'Security: Help protect against cross-site request forgery (CSRF) and other security threats by validating the authenticity of requests',
    'Load balancing: Distribute traffic across our servers to ensure consistent performance and availability',
    'Cookie consent: Remember your cookie consent preferences so you are not asked repeatedly',
  ]));

  // 2b. Functional (conditional)
  if (hasAuth || hasCms) {
    sections.push(createHeading('Functional Cookies', 2));
    sections.push(createParagraph(
      'These cookies enable enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have integrated into our pages. If you do not allow these cookies, some or all of these features may not function properly.'
    ));
    const functionalItems = [];
    if (hasAuth) {
      functionalItems.push(
        'Language and locale preferences: Remember your preferred language and regional settings',
        'Display settings: Remember your chosen theme (e.g., light or dark mode), font size, and layout preferences',
        'Account preferences: Store settings related to your user account so they persist across sessions'
      );
    }
    if (hasCms) {
      functionalItems.push(
        'Content preferences: Remember how you prefer content to be displayed, such as list vs. grid view',
        'Editor settings: Preserve your content editing preferences and draft state'
      );
    }
    sections.push(...createBulletList(functionalItems));
  }

  // 2c. Analytics (conditional)
  if (hasAnalyticsIntegrations) {
    sections.push(createHeading('Analytics Cookies', 2));
    sections.push(createParagraph(
      'These cookies help us understand how visitors interact with our website by collecting and reporting information about usage patterns. The data collected is aggregated and anonymised where possible. We use this information to improve our website, identify popular content, and detect usability issues.'
    ));
    sections.push(...createBulletList([
      'Page views and visitor counts: Track which pages are visited and how often',
      'Session duration and bounce rate: Measure how long visitors spend on the site and whether they engage with content',
      'Traffic sources: Identify how visitors arrived at our website (search engine, direct visit, referral link)',
      'Device and browser information: Understand the devices and browsers our visitors use so we can optimise compatibility',
    ]));
  }

  // 2d. Marketing (conditional)
  if (hasMarketingIntegrations) {
    sections.push(createHeading('Marketing Cookies', 2));
    sections.push(createParagraph(
      'These cookies are set by our advertising partners to build a profile of your interests and show you relevant advertisements on other websites. They work by uniquely identifying your browser and device. If you do not allow these cookies, you will still see advertisements, but they will be less relevant to your interests.'
    ));
    sections.push(...createBulletList([
      'Retargeting: Display advertisements for our services on other websites you visit after leaving our site',
      'Conversion tracking: Measure whether our advertising campaigns result in visits or actions on our website',
      'Audience building: Create anonymised audience segments for advertising purposes based on website behaviour',
    ]));
  }

  // --- 3. Cookie Table ---
  sections.push(createHeading('Cookies We Use', 1));
  sections.push(createParagraph(
    'The following table lists the specific cookies used on our website:'
  ));

  const cookieRows = [
    // Essential cookies (always present)
    ['session_id', company, 'Maintains your session state', 'Essential', 'Session'],
    ['csrf_token', company, 'Prevents cross-site request forgery attacks', 'Essential', 'Session'],
    ['cookie_consent', company, 'Records your cookie consent preferences', 'Essential', '12 months'],
  ];

  if (hasAuth) {
    cookieRows.push(
      ['auth_token', company, 'Authenticates your logged-in session', 'Essential', 'Session'],
      ['remember_me', company, 'Keeps you logged in between browser sessions (if selected)', 'Functional', '30 days'],
      ['user_preferences', company, 'Stores display and locale preferences', 'Functional', '12 months']
    );
  }

  // Integration-specific cookies
  for (const { name } of integrations) {
    const lc = name.toLowerCase();
    if (['google-analytics', 'ga4'].includes(lc)) {
      cookieRows.push(
        ['_ga', 'Google', 'Distinguishes unique users for Google Analytics', 'Analytics', '2 years'],
        ['_ga_*', 'Google', 'Maintains session state for Google Analytics 4', 'Analytics', '2 years'],
        ['_gid', 'Google', 'Distinguishes unique users (24-hour window)', 'Analytics', '24 hours']
      );
    } else if (lc === 'hotjar') {
      cookieRows.push(
        ['_hj*', 'Hotjar', 'Session recording and heatmap analytics', 'Analytics', 'Session to 1 year']
      );
    } else if (lc === 'hubspot') {
      cookieRows.push(
        ['__hstc', 'HubSpot', 'Tracks visitor identity across sessions', 'Analytics', '13 months'],
        ['hubspotutk', 'HubSpot', 'Tracks visitor identity for form submissions', 'Analytics', '13 months'],
        ['__hssc', 'HubSpot', 'Tracks current session for analytics', 'Analytics', '30 minutes']
      );
    } else if (['facebook-pixel', 'meta-pixel'].includes(lc)) {
      cookieRows.push(
        ['_fbp', 'Meta', 'Identifies browsers for advertising and site analytics', 'Marketing', '3 months'],
        ['_fbc', 'Meta', 'Stores last ad click information', 'Marketing', '3 months']
      );
    } else if (lc === 'google-ads') {
      cookieRows.push(
        ['_gcl_au', 'Google', 'Stores conversion data for Google Ads', 'Marketing', '3 months']
      );
    } else if (lc === 'linkedin-ads') {
      cookieRows.push(
        ['li_fat_id', 'LinkedIn', 'Identifies members for conversion tracking', 'Marketing', '30 days']
      );
    } else if (lc === 'stripe') {
      cookieRows.push(
        ['__stripe_mid', 'Stripe', 'Fraud detection and prevention', 'Essential', '1 year'],
        ['__stripe_sid', 'Stripe', 'Fraud detection for current session', 'Essential', '30 minutes']
      );
    } else if (lc === 'plausible') {
      // Plausible is cookieless — note it in text but no cookie rows
    } else if (lc === 'matomo') {
      cookieRows.push(
        ['_pk_id.*', 'Matomo', 'Stores unique visitor ID for analytics', 'Analytics', '13 months'],
        ['_pk_ses.*', 'Matomo', 'Tracks session activity for analytics', 'Analytics', '30 minutes']
      );
    }
  }

  sections.push(createTable(
    ['Name', 'Provider', 'Purpose', 'Type', 'Duration'],
    cookieRows
  ));

  // Note about cookieless analytics if relevant
  const hasPlausible = integrations.some(({ name }) => name.toLowerCase() === 'plausible');
  if (hasPlausible) {
    sections.push(createParagraph(
      'Note: We use Plausible Analytics, which does not use cookies and does not collect personal data. It is listed in our Privacy Policy as a third-party service but does not appear in the cookie table above as it operates without cookies.'
    ));
  }

  // --- 4. Third-Party Cookies ---
  sections.push(createHeading('Third-Party Cookies', 1));

  const cookieSettingIntegrations = integrations.filter(({ name }) => {
    const lc = name.toLowerCase();
    return !['plausible', 'fathom'].includes(lc); // Exclude cookieless services
  });

  if (cookieSettingIntegrations.length > 0) {
    sections.push(createParagraph(
      'Some cookies on our website are set by third-party services rather than by us directly. These third parties set cookies when you load our web pages because we have integrated their services (such as analytics, payment processing, or advertising). We do not control these cookies, and their use is governed by the privacy policies of the respective third parties.'
    ));

    for (const { name, clause } of cookieSettingIntegrations) {
      const displayName = clause?.name || name.charAt(0).toUpperCase() + name.slice(1);
      sections.push(createHeading(displayName, 2));

      if (clause?.sub_processor_details) {
        sections.push(createParagraph(clause.sub_processor_details));
      } else {
        sections.push(createParagraph(
          `${displayName} may set cookies on your device when you interact with features powered by their service. For details, refer to their privacy policy.`
        ));
      }

      if (clause?.opt_out) {
        sections.push(createParagraph(`Opt-out: ${clause.opt_out}`));
      }
    }
  } else {
    sections.push(createParagraph(
      'We do not currently use third-party services that set cookies on our website. If this changes, this section will be updated to reflect the third-party cookies in use.'
    ));
  }

  // --- 5. Managing Cookies ---
  sections.push(createHeading('Managing Cookies', 1));
  sections.push(createParagraph(
    'You can control and manage cookies through your browser settings. Most browsers allow you to view, delete, and block cookies from websites. Please note that disabling essential cookies may prevent our website from functioning correctly.'
  ));
  sections.push(createParagraph(
    'Instructions for managing cookies in common browsers:'
  ));
  sections.push(...createBulletList([
    'Google Chrome: Settings > Privacy and Security > Cookies and other site data. Alternatively, enter chrome://settings/cookies in your address bar.',
    'Mozilla Firefox: Settings > Privacy & Security > Cookies and Site Data. You can also manage exceptions for specific websites.',
    'Apple Safari: Preferences > Privacy > Manage Website Data. Safari also offers Intelligent Tracking Prevention, which limits cross-site tracking by default.',
    'Microsoft Edge: Settings > Cookies and site permissions > Manage and delete cookies and site data. Alternatively, enter edge://settings/content/cookies in your address bar.',
  ]));
  sections.push(createParagraph(
    'You can also opt out of interest-based advertising through industry tools such as the Network Advertising Initiative (https://optout.networkadvertising.org) or the Digital Advertising Alliance (https://optout.aboutads.info).'
  ));
  sections.push(createParagraph(
    'If you use multiple browsers or devices, you will need to manage your cookie settings in each browser separately.'
  ));

  // --- 6. Consent ---
  sections.push(createHeading('Consent', 1));
  sections.push(createParagraph(
    'When you first visit our website, we present a cookie consent banner that allows you to accept or decline non-essential cookies. Essential cookies are set regardless of your choice because they are required for the website to function.'
  ));
  sections.push(createParagraph(
    'Your consent preferences are stored in a cookie on your device so that we can respect your choice on future visits. You can change your preferences at any time by:'
  ));
  sections.push(...createBulletList([
    'Clicking the cookie settings link in the website footer',
    'Clearing your cookies through your browser settings and revisiting the website, which will display the consent banner again',
    'Contacting us directly to request a change to your consent preferences',
  ]));
  sections.push(createParagraph(
    'We keep records of the consent given by visitors, including the date and time of consent, the categories of cookies consented to, and the method by which consent was given, in accordance with the Privacy Act 2020 (NZ) and applicable ePrivacy requirements.'
  ));

  // --- 7. Changes to This Policy ---
  sections.push(createHeading('Changes to This Cookie Policy', 1));
  sections.push(createParagraph(
    'We may update this Cookie Policy from time to time to reflect changes in the cookies we use, our practices, or applicable law. When we make changes, we will update the effective date at the top of this policy and post the revised version on our website.'
  ));
  sections.push(createParagraph(
    'Where changes are significant, for example if we introduce a new category of cookies or a new third-party service that sets cookies, we will seek your consent again through the cookie consent banner.'
  ));
  sections.push(createParagraph(
    `This Cookie Policy is effective as of ${effectiveDate}.`
  ));

  // --- 8. Contact ---
  sections.push(createHeading('Contact', 1));
  sections.push(createParagraph(
    'If you have any questions about this Cookie Policy or our use of cookies, please contact us:'
  ));
  sections.push(...createBulletList([
    `Organisation: ${company}`,
    `Email: ${contactEmail}`,
    `Website: ${siteUrl}`,
  ]));

  return createDocument({
    title: 'Cookie Policy',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
