// Client Onboarding Pack template
// Generates a comprehensive onboarding document for new client engagements

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { formatDate, formatCurrency, resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const projectDescription = params['project-description'] || reqs.goals || ctx.description || '[Project description to be confirmed]';
  const techStack = params['tech-stack'] || '[TO BE CONFIRMED]';
  const projectValue = params['project-value'] || '[TO BE CONFIRMED]';
  const paymentTerms = params['payment-terms'] || '50% upfront, 50% on completion';
  const milestoneDates = params['key-milestone-dates'] || {};
  const revisionLimit = params['revision-limit'] || '3';
  const firstMeetingDate = params['first-meeting-date'] || '[TO BE CONFIRMED]';
  const communicationChannel = params['communication-channel'] || 'Email';
  const updateFrequency = params['update-frequency'] || 'Weekly';
  const stagingUrl = params['staging-url'] || '[TO BE CONFIRMED]';

  const company = getCompanyInfo(brandConfig);
  const sections = [];

  // ---------------------------------------------------------------------------
  // 1. Welcome & Project Overview
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Welcome & Project Overview', 1));
  sections.push(createParagraph(`Welcome aboard, ${clientName}! We are excited to be working with you on ${projectName}. This onboarding pack contains everything you need to know about how we will work together, what to expect at each stage, and how to get the most out of our partnership.`));
  sections.push(createParagraph(projectDescription));

  const objectives = reqs.objectives || params['objectives'];
  if (objectives && Array.isArray(objectives) && objectives.length) {
    sections.push(createHeading('Objectives', 2));
    sections.push(...createBulletList(objectives));
  } else if (typeof objectives === 'string') {
    sections.push(createHeading('Objectives', 2));
    sections.push(createParagraph(objectives));
  }

  const successCriteria = reqs.successCriteria || params['success-criteria'];
  if (successCriteria && Array.isArray(successCriteria) && successCriteria.length) {
    sections.push(createHeading('Success Criteria', 2));
    sections.push(...createBulletList(successCriteria));
  } else if (typeof successCriteria === 'string') {
    sections.push(createHeading('Success Criteria', 2));
    sections.push(createParagraph(successCriteria));
  }

  // ---------------------------------------------------------------------------
  // 2. Your Team
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Your Team', 1));
  sections.push(createParagraph('You will be working directly with the following team members throughout the project:'));

  const teamMembers = params['team-members'] || [];
  if (Array.isArray(teamMembers) && teamMembers.length) {
    const teamRows = teamMembers.map(m => [
      m.name || '[TO BE CONFIRMED]',
      m.role || '[TO BE CONFIRMED]',
      m.email || '[TO BE CONFIRMED]',
    ]);
    sections.push(createTable(['Name', 'Role', 'Contact'], teamRows));
  } else {
    const teamRows = [
      [company.name || '[TO BE CONFIRMED]', 'Project Lead / Developer', company.email || '[TO BE CONFIRMED]'],
    ];
    sections.push(createTable(['Name', 'Role', 'Contact'], teamRows));
  }

  sections.push(createParagraph('All project communication should be directed to your primary contact unless otherwise agreed.'));

  // ---------------------------------------------------------------------------
  // 3. Project Timeline
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Project Timeline', 1));
  sections.push(createParagraph('The following milestones outline the key phases of the project. Dates are indicative and may adjust based on feedback turnaround and scope changes.'));

  const milestoneRows = [
    ['Kickoff & Discovery', milestoneDates['kickoff'] || milestoneDates['design-start'] || '[TO BE CONFIRMED]'],
    ['Design Phase', milestoneDates['design-start'] || '[TO BE CONFIRMED]'],
    ['Development Start', milestoneDates['development-start'] || '[TO BE CONFIRMED]'],
    ['Content Integration', milestoneDates['content-deadline'] || '[TO BE CONFIRMED]'],
    ['QA & Testing', milestoneDates['qa-start'] || '[TO BE CONFIRMED]'],
    ['Client Review & UAT', milestoneDates['uat-start'] || '[TO BE CONFIRMED]'],
    ['Launch', milestoneDates['launch-target'] || '[TO BE CONFIRMED]'],
    ['Post-Launch Support', milestoneDates['post-launch'] || 'From launch + 2 weeks'],
  ];
  sections.push(createTable(['Milestone', 'Target Date'], milestoneRows));

  // ---------------------------------------------------------------------------
  // 4. Your Responsibilities
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Your Responsibilities', 1));
  sections.push(createParagraph('To keep the project on track and deliver the best possible result, we will need your input and collaboration on the following:'));

  sections.push(createHeading('Content', 2));
  sections.push(...createBulletList([
    'Supply all written content (page copy, product descriptions, bios, etc.) by the agreed content deadline',
    'Provide high-resolution images, videos, and media assets',
    'Review and approve all content once integrated into the site',
  ]));

  sections.push(createHeading('Brand Assets', 2));
  sections.push(...createBulletList([
    'Logo files in vector format (SVG or AI) and high-resolution PNG',
    'Brand guidelines or style guide (colours, fonts, tone of voice)',
    'Any existing brand collateral for reference',
  ]));

  sections.push(createHeading('Approvals', 2));
  sections.push(...createBulletList([
    'Respond to review requests within 3 business days to avoid timeline delays',
    'Designate a single point of contact with authority to approve deliverables',
    'Provide consolidated feedback rather than piecemeal revisions',
  ]));

  sections.push(createHeading('Testing Feedback', 2));
  sections.push(...createBulletList([
    'Test the staging site thoroughly across your target devices and browsers',
    'Report any issues using the provided feedback process (screenshots and descriptions)',
    'Complete User Acceptance Testing (UAT) sign-off before launch',
  ]));

  // ---------------------------------------------------------------------------
  // 5. Our Responsibilities
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Our Responsibilities', 1));
  sections.push(createParagraph('We are committed to delivering a high-quality result and keeping you informed throughout the process. Here is what you can expect from us:'));

  sections.push(createHeading('Communication Schedule', 2));
  sections.push(...createBulletList([
    `${updateFrequency} progress updates via ${communicationChannel}`,
    'Sprint review sessions at the end of each development sprint',
    'Prompt responses to your questions within 1 business day',
    'Proactive notification of any risks, blockers, or timeline adjustments',
  ]));

  sections.push(createHeading('Deliverables', 2));
  sections.push(...createBulletList([
    `Staging access for review and testing at: ${stagingUrl}`,
    'Clear documentation for any systems you will manage post-launch',
    'Training session before handover (if applicable)',
    'All source files and credentials transferred at project completion',
  ]));

  // ---------------------------------------------------------------------------
  // 6. Technical Setup
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Technical Setup', 1));
  sections.push(createParagraph('The following technical items need to be arranged. We will guide you through each step.'));

  sections.push(createHeading('Domain & DNS', 2));
  sections.push(...createBulletList([
    'Confirm domain name registration and provide registrar login details (or delegate DNS access)',
    'If transferring a domain, initiate the transfer at least 2 weeks before launch',
    'We will handle DNS configuration and SSL certificate setup',
  ]));

  sections.push(createHeading('Hosting', 2));
  sections.push(createParagraph(`Technology Stack: ${techStack}`));
  sections.push(...createBulletList([
    'Hosting will be set up and configured as part of the project',
    'We will recommend a hosting solution appropriate for the project requirements',
    'Ongoing hosting costs (if any) will be outlined separately',
  ]));

  sections.push(createHeading('Email Accounts', 2));
  sections.push(...createBulletList([
    'Confirm required email addresses (e.g. info@, hello@)',
    'Provide details of existing email provider if migrating',
    'We will configure DNS records (MX, SPF, DKIM) for email deliverability',
  ]));

  if (flags.needs_auth) {
    sections.push(createHeading('User Accounts & Access', 2));
    sections.push(...createBulletList([
      'Provide a list of initial user accounts and their roles',
      'Confirm authentication requirements (social login, two-factor, SSO)',
      'We will set up admin accounts and provide secure credentials',
    ]));
  }

  if (flags.needs_analytics) {
    sections.push(createHeading('Analytics & Tracking', 2));
    sections.push(...createBulletList([
      'Provide Google Analytics property ID or grant access to your GA account',
      'Confirm any additional tracking requirements (Facebook Pixel, conversion tracking)',
      'We will configure tracking code and verify data is recording correctly',
    ]));
  }

  // ---------------------------------------------------------------------------
  // 7. Design Phase (conditional)
  // ---------------------------------------------------------------------------
  if (flags.needs_design) {
    sections.push(createHeading('Design Phase', 1));
    sections.push(createParagraph('The design phase establishes the visual direction for the project. Here is how it works:'));

    sections.push(createHeading('Design Brief', 2));
    sections.push(...createBulletList([
      'We will prepare a design brief based on our discovery session',
      'The brief captures your preferences, target audience, and visual direction',
      'You will review and approve the brief before design work begins',
    ]));

    sections.push(createHeading('Review Rounds', 2));
    sections.push(createParagraph(`You will receive up to ${revisionLimit} rounds of design revisions per deliverable. Each round works as follows:`));
    sections.push(...createBulletList([
      'Round 1: Initial design concepts presented for feedback',
      'Round 2: Revisions based on your consolidated feedback',
      `Round 3: Final refinements and sign-off${Number(revisionLimit) > 3 ? '' : ' (additional rounds quoted separately)'}`,
    ]));

    sections.push(createHeading('Revision Guidelines', 2));
    sections.push(...createBulletList([
      'Provide all feedback for a round in a single consolidated response',
      'Be specific about what you would like changed and why',
      'Reference specific elements (e.g. "the header image" rather than "the top bit")',
      `Revisions beyond ${revisionLimit} rounds will be quoted separately at the agreed rate`,
    ]));
  }

  // ---------------------------------------------------------------------------
  // 8. Development Workflow (conditional)
  // ---------------------------------------------------------------------------
  if (flags.needs_database || flags.needs_api) {
    sections.push(createHeading('Development Workflow', 1));
    sections.push(createParagraph('The development phase follows an agile approach to ensure regular progress and opportunities for your input.'));

    sections.push(createHeading('Sprint Structure', 2));
    sections.push(...createBulletList([
      'Development is organised into 1-2 week sprints',
      'Each sprint targets specific features or functionality',
      'Sprint priorities are agreed at the start of each cycle',
    ]));

    sections.push(createHeading('Demo Schedule', 2));
    sections.push(...createBulletList([
      'A demo of completed work is provided at the end of each sprint',
      'Demos are conducted via screen share or recorded video',
      'Your feedback is incorporated into the next sprint plan',
    ]));

    sections.push(createHeading('Staging Environment', 2));
    sections.push(createParagraph(`A staging environment will be available at: ${stagingUrl}`));
    sections.push(...createBulletList([
      'The staging site reflects the latest approved development work',
      'Use staging for testing and providing feedback — it is separate from the live site',
      'Do not share the staging URL publicly',
    ]));
  }

  // ---------------------------------------------------------------------------
  // 9. Payment Milestones (conditional)
  // ---------------------------------------------------------------------------
  if (flags.needs_payments || projectValue !== '[TO BE CONFIRMED]') {
    sections.push(createHeading('Payment Milestones', 1));
    sections.push(createParagraph('Payment is structured around project milestones to align cost with progress.'));

    const paymentSchedule = params['payment-schedule'];
    if (Array.isArray(paymentSchedule) && paymentSchedule.length) {
      const paymentRows = paymentSchedule.map(p => [
        p.milestone || '[TO BE CONFIRMED]',
        p.percentage ? `${p.percentage}%` : '[TO BE CONFIRMED]',
        typeof p.amount === 'number' ? formatCurrency(p.amount) : (p.amount || '[TO BE CONFIRMED]'),
        p.due || '[TO BE CONFIRMED]',
      ]);
      sections.push(createTable(['Milestone', 'Percentage', 'Amount', 'Due Date'], paymentRows));
    } else {
      const formattedValue = typeof projectValue === 'number' ? formatCurrency(projectValue) : projectValue;
      sections.push(createParagraph(`Total Project Value: ${formattedValue}`));
      sections.push(createParagraph(`Payment Terms: ${paymentTerms}`));

      const defaultPaymentRows = [
        ['Project Commencement', '50%', 'On signing', '[TO BE CONFIRMED]'],
        ['Project Completion', '50%', 'On launch', '[TO BE CONFIRMED]'],
      ];
      sections.push(createTable(['Milestone', 'Percentage', 'Timing', 'Due Date'], defaultPaymentRows));
    }

    sections.push(createParagraph('Invoices are issued at each milestone. Payment is due within 7 days of invoice unless otherwise agreed.'));
  }

  // ---------------------------------------------------------------------------
  // 10. Approval & Sign-Off Process
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Approval & Sign-Off Process', 1));
  sections.push(createParagraph('Clear approvals keep the project moving and prevent rework. Here is how the sign-off process works:'));

  sections.push(createHeading('Deliverable Review', 2));
  sections.push(...createBulletList([
    'Each deliverable is presented for review via staging or shared document',
    'You will have 3 business days to review and provide feedback',
    'Silence after 5 business days is treated as implicit approval to keep the project on track',
  ]));

  sections.push(createHeading('Revision Limits', 2));
  sections.push(...createBulletList([
    `Each deliverable includes up to ${revisionLimit} rounds of revisions`,
    'A "round" is one set of consolidated feedback and the resulting changes',
    `Additional rounds beyond ${revisionLimit} are quoted separately at the agreed rate`,
    'Scope changes (new features or functionality not in the original brief) are handled as change requests',
  ]));

  sections.push(createHeading('Acceptance Criteria', 2));
  sections.push(...createBulletList([
    'The project is considered complete when all agreed deliverables have been approved',
    'Final UAT sign-off confirms the project meets the agreed requirements',
    'A formal completion sign-off document will be provided for your records',
    'Post-launch support begins after sign-off (as outlined in the timeline)',
  ]));

  // ---------------------------------------------------------------------------
  // 11. Next Steps
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Next Steps', 1));
  sections.push(createParagraph('Here is what happens next to get the project underway:'));

  const nextSteps = [
    'Review this onboarding pack and raise any questions',
    `Attend the kickoff meeting on ${firstMeetingDate}`,
    'Provide brand assets and any existing content',
    'Confirm domain and hosting details (we will guide you)',
    'Designate your primary point of contact for approvals',
  ];

  if (flags.needs_design) {
    nextSteps.push('Complete the design brief questionnaire (provided separately)');
  }

  if (flags.needs_payments || projectValue !== '[TO BE CONFIRMED]') {
    nextSteps.push('Arrange the initial project payment per the schedule above');
  }

  sections.push(...createBulletList(nextSteps));

  sections.push(createParagraph(`If you have any questions at all, please do not hesitate to reach out. We look forward to getting started on ${projectName} with you.`));

  // ---------------------------------------------------------------------------
  // 12. Contact Information
  // ---------------------------------------------------------------------------
  sections.push(createHeading('Contact Information', 1));

  const contactRows = [];
  if (company.name) contactRows.push(['Company', company.name]);
  if (company.email) contactRows.push(['Email', company.email]);
  if (company.phone) contactRows.push(['Phone', company.phone]);
  if (company.website) contactRows.push(['Website', company.website]);
  if (company.location) contactRows.push(['Location', company.location]);

  if (contactRows.length) {
    sections.push(createTable(['', ''], contactRows));
  } else {
    sections.push(createParagraph('[Contact details to be confirmed]'));
  }

  if (company.name) {
    sections.push(createParagraph(`${company.name} — ${company.tagline || 'We look forward to working with you.'}`));
  }

  return createDocument({
    title: 'Client Onboarding Pack',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
