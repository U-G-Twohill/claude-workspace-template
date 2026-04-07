// Project Plan document template
// Generates a comprehensive, development-ready project plan from requirements data
// This is the most detailed document in the system — it serves as the single source
// of truth for all project development work, kanban population, and downstream documents

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, formatCurrency } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};
  const ctx = docsState.projectContext || {};
  const chain = docsState.chainContext || {};
  const rawSections = ctx.requirementsRawSections || {};

  // Core data
  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const techStack = params['tech-stack'] || ctx.projectStack || '[Tech stack TBC]';
  const projectType = meta['project-type'] || 'web-app';
  const budgetBand = reqs['budget-band'] || params['project-value'] || '';

  // Parse structured data
  let pages = [];
  try { pages = reqs.pages ? JSON.parse(reqs.pages) : []; } catch { pages = []; }
  let futureFeatures = [];
  try { futureFeatures = reqs.features ? JSON.parse(reqs.features) : []; } catch { futureFeatures = []; }

  const sections = [];

  // =====================================================================
  // SECTION 1: PROJECT OVERVIEW
  // =====================================================================
  sections.push(createHeading('Project Overview', 1));

  sections.push(createTable(
    ['Field', 'Detail'],
    [
      ['Project', projectName],
      ['Client', clientName],
      ['Project Type', projectType],
      ['Tech Stack', techStack],
      ...(budgetBand ? [['Budget', budgetBand]] : []),
      ...(reqs.timeline ? [['Timeline', reqs.timeline]] : []),
    ]
  ));

  // Goals
  if (reqs.goals) {
    sections.push(createHeading('Objectives', 2));
    const goalLines = reqs.goals.split('\n').filter(l => l.trim());
    if (goalLines.length > 1) {
      sections.push(...createBulletList(goalLines.map(l => l.replace(/^\*\*[^*]+\*\*\s*/, '').replace(/^[-*]\s+/, '').trim()).filter(Boolean)));
    } else {
      sections.push(createParagraph(reqs.goals.replace(/^\*\*\s*/, '')));
    }
  }

  // Audience
  if (reqs.audience) {
    sections.push(createHeading('Target Audience', 2));
    sections.push(createParagraph(reqs.audience.replace(/^\*\*\s*/, '')));
  }

  // =====================================================================
  // SECTION 2: ARCHITECTURE & TECHNICAL DECISIONS
  // =====================================================================
  sections.push(createHeading('Architecture & Technical Decisions', 1));

  sections.push(createHeading('Tech Stack', 2));
  sections.push(createParagraph(techStack));

  // Technical constraints from requirements
  if (reqs.constraints) {
    sections.push(createHeading('Technical Requirements', 2));
    const constraintLines = reqs.constraints.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (constraintLines.length > 0) {
      sections.push(...createBulletList(constraintLines.map(l =>
        l.replace(/^[-*]\s*/, '').trim()
      )));
    } else {
      sections.push(createParagraph(reqs.constraints));
    }
  }

  // CMS approach
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management System', 2));
    sections.push(createParagraph('This project requires a CMS/admin panel for client self-management of content.'));
    if (reqs.constraints && /cms|admin panel|content management/i.test(reqs.constraints)) {
      const cmsLines = reqs.constraints.split('\n').filter(l => /cms|admin|content manag|self-manage/i.test(l));
      if (cmsLines.length > 0) {
        sections.push(...createBulletList(cmsLines.map(l => l.replace(/^[-*]\s*\*\*[^*]+\*\*\s*[—–-]?\s*/, '').replace(/^[-*]\s+/, '').trim())));
      }
    }
  }

  // Database
  if (flags.needs_database) {
    sections.push(createHeading('Database Architecture', 2));
    sections.push(createParagraph('Database design and implementation required. Schema will be defined during the technical planning phase.'));
  }

  // Authentication
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication & Access Control', 2));
    sections.push(createParagraph('User authentication system required with role-based access control.'));
  }

  // Integrations
  if (reqs['integrations-needed']) {
    sections.push(createHeading('Integrations', 2));
    const intLines = reqs['integrations-needed'].split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (intLines.length > 0) {
      sections.push(...createBulletList(intLines.map(l => l.replace(/^[-*]\s*\*\*[^*]+\*\*\s*[—–-]?\s*/, '').replace(/^[-*]\s+/, '').trim())));
    }
  }

  // =====================================================================
  // SECTION 3: DESIGN DIRECTION
  // =====================================================================
  if (flags.needs_design) {
    sections.push(createHeading('Design Direction', 1));

    if (reqs['design-direction']) {
      const designLines = reqs['design-direction'].split('\n').filter(l => l.trim());
      for (const line of designLines) {
        const bulletMatch = line.match(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*(.*)/);
        if (bulletMatch) {
          sections.push(createParagraph(`${bulletMatch[1]}: ${bulletMatch[2]}`, { bold: true }));
        } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          sections.push(createParagraph(line.replace(/^[-*]\s+/, '').trim()));
        } else if (line.trim()) {
          sections.push(createParagraph(line.trim()));
        }
      }
    } else {
      sections.push(createParagraph('Design direction to be established during the Design phase. Brand assets, colour palette, typography, and visual tone will be developed in collaboration with the client.'));
    }
  }

  // =====================================================================
  // SECTION 4: SCOPE — PAGES & FEATURES
  // =====================================================================
  sections.push(createHeading('Scope — Pages & Features', 1));

  if (pages.length > 0) {
    sections.push(createHeading('Pages', 2));
    sections.push(createTable(
      ['Page', 'Description'],
      pages.map(p => [p.name, p.description || ''])
    ));
    sections.push(createParagraph(`Total: ${pages.length} pages in V1 scope.`));
  } else {
    sections.push(createParagraph('Pages and features to be confirmed during the Discovery & Planning phase.'));
  }

  // Scope items from module flags
  sections.push(createHeading('Capabilities', 2));
  const capabilities = [];
  if (flags.needs_design) capabilities.push('Custom design and visual identity');
  if (flags.needs_cms) capabilities.push('Content management system (CMS) for self-managed updates');
  if (flags.needs_database) capabilities.push('Database design and implementation');
  if (flags.needs_auth) capabilities.push('User authentication and access control');
  if (flags.needs_api) capabilities.push('API development');
  if (flags.needs_payments) capabilities.push('Payment processing integration');
  capabilities.push('Responsive design (mobile, tablet, desktop)');
  capabilities.push('SEO fundamentals (meta tags, sitemap, structured data)');
  capabilities.push('Performance optimisation');
  if (flags.needs_privacy_policy || flags.needs_tos) capabilities.push('Legal pages (privacy policy, terms of service)');
  if (flags.needs_cookie_policy) capabilities.push('Cookie policy and consent management');
  if (flags.needs_training_docs || flags.needs_user_manual) capabilities.push('Training documentation and user guides');
  sections.push(...createBulletList(capabilities));

  // Out of scope / future
  if (futureFeatures.length > 0) {
    sections.push(createHeading('Out of Scope — Future Phases', 2));
    sections.push(createParagraph('The following features are noted for future development and are explicitly excluded from V1:'));
    sections.push(...createBulletList(futureFeatures.map(f =>
      `${f.name.replace(/"/g, '')}${f.description ? ' — ' + f.description : ''}`
    )));
  }

  // =====================================================================
  // SECTION 5: CONTENT STRATEGY
  // =====================================================================
  if (reqs['content-plan']) {
    sections.push(createHeading('Content Strategy', 1));
    const contentLines = reqs['content-plan'].split('\n').filter(l => l.trim());
    const bullets = contentLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (bullets.length > 0) {
      sections.push(...createBulletList(bullets.map(l =>
        l.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim()
      )));
    } else {
      sections.push(createParagraph(reqs['content-plan']));
    }
  }

  // =====================================================================
  // SECTION 6: MILESTONES & TASK BREAKDOWN
  // =====================================================================
  sections.push(createHeading('Milestones & Task Breakdown', 1));

  // --- MILESTONE 1: Discovery & Planning ---
  sections.push(createHeading('Milestone 1: Discovery & Planning', 2));
  sections.push(createParagraph('Finalise requirements, confirm technical approach, and prepare the project for development.'));
  const discoveryTasks = [
    'Requirements review and finalisation',
    'Technical architecture confirmation',
    'Stack and framework setup',
    'Repository creation and environment configuration',
    'Integration planning and API key provisioning',
    'Document initialisation (docs-state, module flags)',
    'Generate remaining project documents (contract, design brief, etc.)',
  ];
  sections.push(...createBulletList(discoveryTasks));

  // --- MILESTONE 2: Design ---
  if (flags.needs_design) {
    sections.push(createHeading('Milestone 2: Design', 2));
    sections.push(createParagraph('Establish visual identity, create wireframes and mockups, and get design sign-off before development begins.'));

    const designTasks = [
      'Brand direction development (colour palette, typography, visual tone)',
    ];
    if (pages.length > 0) {
      designTasks.push(`Wireframes for all ${pages.length} pages: ${pages.map(p => p.name).join(', ')}`);
      designTasks.push('Design mockups for key pages (Home + 1-2 interior pages)');
    } else {
      designTasks.push('Wireframes for all pages');
      designTasks.push('Design mockups for key pages');
    }
    designTasks.push(
      'Mobile-first responsive design approach',
      'Design review round with client feedback',
      'Design revisions and sign-off',
    );
    sections.push(...createBulletList(designTasks));
  }

  // --- MILESTONE 3: Development ---
  const devMilestoneNum = flags.needs_design ? 3 : 2;
  sections.push(createHeading(`Milestone ${devMilestoneNum}: Development`, 2));
  sections.push(createParagraph('Build all pages and features. Task groups are organised by capability area.'));

  // Frontend task group
  sections.push(createHeading('Frontend', 3));
  if (pages.length > 0) {
    const frontendTasks = [
      'Component architecture and shared layout',
    ];
    for (const page of pages) {
      frontendTasks.push(`${page.name} page — ${page.description || 'implementation'}`);
    }
    frontendTasks.push(
      'Responsive layout (mobile, tablet, desktop)',
      'Animations and interactions',
      'Performance optimisation',
    );
    sections.push(...createBulletList(frontendTasks));
  } else {
    sections.push(...createBulletList([
      'Component architecture and shared layout',
      'Page templates and implementation',
      'Responsive layout',
      'Performance optimisation',
    ]));
  }

  // CMS task group
  if (flags.needs_cms) {
    sections.push(createHeading('CMS Setup', 3));
    const cmsTasks = [
      'CMS platform selection and configuration',
      'Content model definition (post types, fields, relationships)',
      'Editorial workflow setup',
      'Media management configuration',
    ];
    if (reqs['handover-expectations'] && /self-manage|self manage/i.test(reqs['handover-expectations'])) {
      cmsTasks.push('Client self-management interface setup');
    }
    sections.push(...createBulletList(cmsTasks));
  }

  // Database task group
  if (flags.needs_database) {
    sections.push(createHeading('Database', 3));
    sections.push(...createBulletList([
      'Schema design and documentation',
      'Database migrations',
      'Seed data and test fixtures',
      'Query optimisation',
      'Backup strategy',
    ]));
  }

  // Auth task group
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication', 3));
    sections.push(...createBulletList([
      'Auth provider setup',
      'Session management',
      'Role and permission model',
      'Password reset flow',
      'Protected routes and middleware',
    ]));
  }

  // Payments task group
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Processing', 3));
    sections.push(...createBulletList([
      'Payment gateway integration (Stripe)',
      'Checkout flow implementation',
      'Webhook handling for payment events',
      'Invoice/receipt generation',
      'Refund handling',
    ]));
  }

  // Integrations task group
  const integrations = Object.keys(docsState.integrationClauses || {}).filter(k => docsState.integrationClauses[k] === 'active');
  if (integrations.length > 0) {
    sections.push(createHeading('Integrations', 3));
    sections.push(...createBulletList(integrations.map(i =>
      `${i.charAt(0).toUpperCase() + i.slice(1)} — setup, testing, error handling`
    )));
  }

  // Content population task group
  sections.push(createHeading('Content Population', 3));
  if (reqs['content-plan']) {
    const contentTasks = reqs['content-plan'].split('\n')
      .filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'))
      .map(l => l.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim())
      .filter(Boolean);
    if (contentTasks.length > 0) {
      sections.push(...createBulletList(contentTasks));
    } else {
      sections.push(...createBulletList(['Populate all pages with content (placeholder or final)']));
    }
  } else {
    sections.push(...createBulletList([
      'Populate all pages with content (placeholder or final)',
      'Image and media asset preparation',
    ]));
  }

  // n8n automation
  if (flags.needs_n8n) {
    sections.push(createHeading('Automation (n8n)', 3));
    sections.push(...createBulletList([
      'Workflow design and configuration',
      'Trigger setup and error handling',
      'Monitoring and alerting',
      'Automation documentation',
    ]));
  }

  // --- MILESTONE 4: Quality Assurance ---
  const qaMilestoneNum = devMilestoneNum + 1;
  sections.push(createHeading(`Milestone ${qaMilestoneNum}: Quality Assurance`, 2));
  sections.push(createParagraph('Systematic testing across all dimensions before launch.'));

  const qaTasks = [
    'Functional testing — all pages and features',
    'Cross-browser testing (Chrome, Firefox, Safari, Edge)',
    'Cross-device testing (mobile, tablet, desktop)',
    'Performance audit (Lighthouse, Core Web Vitals)',
    'Accessibility audit (WCAG 2.1 AA compliance)',
  ];
  if (flags.needs_auth || flags.needs_payments) {
    qaTasks.push('Security audit — authentication, payment flows, data handling');
  }
  if (flags.needs_privacy_policy || flags.needs_tos || flags.needs_cookie_policy) {
    qaTasks.push('Legal document review — all legal pages reviewed and self-review flag set');
  }
  qaTasks.push(
    'Bug fixes and remediation',
    'Client UAT (User Acceptance Testing) — send test build, collect feedback, iterate',
  );
  sections.push(...createBulletList(qaTasks));

  // --- MILESTONE 5: Launch ---
  const launchMilestoneNum = qaMilestoneNum + 1;
  sections.push(createHeading(`Milestone ${launchMilestoneNum}: Launch`, 2));
  sections.push(createParagraph('Deploy to production and verify everything works.'));

  const launchTasks = [
    'Pre-launch checklist — all legal docs present, environment variables confirmed, error monitoring active',
  ];
  // Project-specific hosting
  if (reqs.constraints && /hostinger/i.test(reqs.constraints)) {
    launchTasks.push('Deploy to Hostinger hosting');
  } else {
    launchTasks.push('Deploy to production hosting');
  }
  launchTasks.push(
    'DNS configuration and domain setup',
    'SSL certificate verification',
    'Post-launch smoke testing',
    'Performance baseline capture',
    '24-hour monitoring window',
  );
  sections.push(...createBulletList(launchTasks));

  // --- MILESTONE 6: Handover ---
  if (flags.needs_handover) {
    const handoverMilestoneNum = launchMilestoneNum + 1;
    sections.push(createHeading(`Milestone ${handoverMilestoneNum}: Handover`, 2));
    sections.push(createParagraph('Documentation, training, and project closure.'));

    const handoverTasks = [];
    if (reqs['handover-expectations']) {
      const hLines = reqs['handover-expectations'].split('\n')
        .filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'))
        .map(l => l.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim())
        .filter(Boolean);
      handoverTasks.push(...hLines);
    }
    if (flags.needs_training_docs) {
      if (!handoverTasks.some(t => /training|documentation/i.test(t))) {
        handoverTasks.push('Written training documentation');
      }
    }
    if (flags.needs_user_manual) {
      if (!handoverTasks.some(t => /user manual|admin guide/i.test(t))) {
        handoverTasks.push('User manual and admin guide');
      }
    }
    handoverTasks.push('Support handover and escalation process');
    handoverTasks.push('Project closure report');
    sections.push(...createBulletList(handoverTasks));
  }

  // =====================================================================
  // SECTION 6b: USER STORIES (optional)
  // =====================================================================
  if (options.userStories) {
    sections.push(createHeading('User Stories', 1));
    sections.push(createParagraph('The following user stories describe the key functionality from the end-user perspective.'));

    const stories = [];

    // Page-specific stories from requirements — use the actual description to form the story
    if (pages.length > 0) {
      for (const page of pages) {
        const desc = (page.description || '').trim();
        if (desc) {
          // Use the actual page description to create a meaningful story
          const lowerDesc = desc.toLowerCase();
          // Clean description into a "so that" clause
          let soThat = desc;
          // Remove leading articles and verbs that don't read well after "so I can"
          soThat = soThat.replace(/^(A |The |An )/i, '').replace(/\.$/, '');

          stories.push(`As a visitor, I want to access the ${page.name} page so I can ${soThat.charAt(0).toLowerCase() + soThat.slice(1)}.`);
        } else {
          stories.push(`As a visitor, I want to access the ${page.name} page to find relevant information.`);
        }
      }
    }

    // Module-flag-driven stories
    if (flags.needs_auth) {
      stories.push('As a user, I want to create an account so I can access personalised features.');
      stories.push('As a user, I want to log in securely so my data is protected.');
      stories.push('As an admin, I want to manage user roles so I can control access levels.');
    }
    if (flags.needs_payments) {
      stories.push('As a customer, I want to make secure payments so I can purchase products or services.');
      stories.push('As an admin, I want to view payment history so I can track revenue.');
    }
    if (flags.needs_cms) {
      stories.push('As an admin, I want to add and edit content through a CMS so I can keep the site up to date without a developer.');
      stories.push('As an admin, I want to manage media (images, videos) so I can update the gallery and other pages.');
    }

    // Generic stories for all projects
    stories.push('As a visitor, I want the site to load quickly so I have a good experience.');
    stories.push('As a visitor, I want the site to work well on mobile so I can access it anywhere.');

    sections.push(...createBulletList(stories));
  }

  // =====================================================================
  // SECTION 7: LEGAL & COMPLIANCE
  // =====================================================================
  if (flags.needs_privacy_policy || flags.needs_tos || flags.needs_cookie_policy || flags.needs_dpa || reqs['legal-requirements']) {
    sections.push(createHeading('Legal & Compliance', 1));

    if (reqs['legal-requirements']) {
      const legalLines = reqs['legal-requirements'].split('\n').filter(l => l.trim());
      const bullets = legalLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
      if (bullets.length > 0) {
        sections.push(...createBulletList(bullets.map(l =>
          l.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim()
        )));
      } else {
        sections.push(createParagraph(reqs['legal-requirements']));
      }
    }

    // List documents to be generated
    const legalDocs = [];
    if (flags.needs_privacy_policy) legalDocs.push('Privacy Policy');
    if (flags.needs_tos) legalDocs.push('Terms of Service');
    if (flags.needs_cookie_policy) legalDocs.push('Cookie Policy');
    if (flags.needs_dpa) legalDocs.push('Data Processing Agreement (DPA)');
    if (legalDocs.length > 0) {
      sections.push(createHeading('Legal Documents to Generate', 2));
      sections.push(...createBulletList(legalDocs));
    }
  }

  // =====================================================================
  // SECTION 8: RISKS & MITIGATIONS
  // =====================================================================
  sections.push(createHeading('Risks & Mitigations', 1));

  const risks = [];

  // Project-specific risks derived from actual constraints
  if (reqs.constraints && /domain.*not.*secured|domain.*tbc|domain.*tbd/i.test(reqs.constraints)) {
    risks.push(['Domain not yet secured', 'Deploy to temporary/staging URL; cut over when domain is ready', 'Low']);
  }
  if (reqs['design-direction'] && /brand.*temporary|brand.*in development|brand.*tbd/i.test(reqs['design-direction'])) {
    risks.push(['Branding still in development', 'Develop brand direction as part of design phase; plan for iteration', 'Medium']);
  }
  if (budgetBand && /\$|nzd/i.test(budgetBand)) {
    risks.push(['Budget constraints', 'Scope carefully defined; change request process for additions', 'Medium']);
  }
  if (reqs['content-plan'] && /placeholder|dummy|client.*provide/i.test(reqs['content-plan'])) {
    risks.push(['Content dependencies on client', 'Placeholder content for development; client content deadlines agreed', 'Medium']);
  }
  if (flags.needs_cms && reqs['handover-expectations'] && /undecided|unsure/i.test(reqs['handover-expectations'])) {
    risks.push(['Maintenance approach undecided', 'Full documentation regardless; maintenance plan offered as option', 'Low']);
  }

  // Standard risks as fallback/supplement
  risks.push(['Scope creep', 'Change request process in place; all changes documented and quoted separately', 'Medium']);
  risks.push(['Timeline delays', 'Buffer built into each milestone; regular progress updates', 'Medium']);
  risks.push(['Technical complexity', 'Spike/prototype before committing to approach; proven stack', 'Low']);

  sections.push(createTable(['Risk', 'Mitigation', 'Likelihood'], risks));

  // =====================================================================
  // SECTION 9: FUTURE SCOPE / PHASE 2
  // =====================================================================
  if (futureFeatures.length > 0) {
    sections.push(createHeading('Future Scope — Phase 2', 1));
    sections.push(createParagraph('The following features are planned for future development after V1 launch. They are documented here for reference and can be quoted separately when ready.'));
    sections.push(createTable(
      ['Feature', 'Description'],
      futureFeatures.map(f => [f.name.replace(/"/g, ''), f.description || ''])
    ));
  }

  // =====================================================================
  // SECTION 10: COMMUNICATION PLAN
  // =====================================================================
  sections.push(createHeading('Communication Plan', 1));

  const isDevMode = options.audience === 'developer';

  const commItems = [
    'Weekly progress updates via email or agreed channel',
    'Milestone reviews and sign-off at each phase transition',
    'Direct communication via email or phone for urgent matters',
    ...(isDevMode ? ['Project tracked in Project Hub with real-time status'] : ['Project tracked with real-time status updates']),
  ];
  if (reqs['handover-expectations'] && /documentation|training/i.test(reqs['handover-expectations'])) {
    commItems.push('Written documentation for all handover processes');
  }
  sections.push(...createBulletList(commItems));

  // =====================================================================
  // SECTION 11: DEVELOPMENT WORKFLOW
  // =====================================================================
  sections.push(createHeading('Development Workflow', 1));

  sections.push(createParagraph(`Built on ${techStack}. Version-controlled with Git.`));

  if (isDevMode) {
    // Developer mode: full internal workflow
    sections.push(...createBulletList([
      'Git-based version control with feature branches',
      'Project Hub for task tracking and status',
      'Claude Code toolkit for development workflow (/prime, /create-plan, /implement, /harden)',
      'Automated quality checks via /harden before each milestone',
    ]));

    const devCommands = ctx.devCommands || {};
    const cmdEntries = Object.entries(devCommands);
    if (cmdEntries.length > 0) {
      sections.push(createHeading('Dev Commands (Internal)', 2));
      sections.push(createTable(
        ['Command', 'Script'],
        cmdEntries.map(([name, script]) => [name, script])
      ));
    }
  } else {
    // Client mode: clean, professional workflow description
    sections.push(...createBulletList([
      'Feature branch workflow with code review',
      'Automated testing before deployment',
      'Staged deployment (development → staging → production)',
      'Version control with full change history',
    ]));
  }

  // =====================================================================
  // SECTION 12: DELIVERABLES SUMMARY
  // =====================================================================
  sections.push(createHeading('Deliverables Summary', 1));

  const deliverableRows = [];

  // Discovery deliverables
  deliverableRows.push(['Technical architecture document', 'Discovery', 'Confirmed stack, integrations, hosting']);
  deliverableRows.push(['Project documents (contract, etc.)', 'Discovery', 'Contract, onboarding pack, and supporting documents']);

  // Design deliverables
  if (flags.needs_design) {
    deliverableRows.push(['Brand direction', 'Design', 'Colour palette, typography, visual tone']);
    deliverableRows.push(['Wireframes', 'Design', pages.length > 0 ? `All ${pages.length} pages wireframed` : 'All pages wireframed']);
    deliverableRows.push(['Design mockups', 'Design', 'Key pages designed and approved']);
  }

  // Development deliverables
  if (pages.length > 0) {
    deliverableRows.push([`${pages.length}-page website`, 'Development', pages.map(p => p.name).join(', ')]);
  } else {
    deliverableRows.push(['Complete website', 'Development', 'All pages functional']);
  }
  if (flags.needs_cms) deliverableRows.push(['CMS/admin panel', 'Development', 'Self-service content management']);
  if (flags.needs_auth) deliverableRows.push(['Authentication system', 'Development', 'User login and access control']);
  if (flags.needs_payments) deliverableRows.push(['Payment processing', 'Development', 'Checkout flow and gateway']);
  deliverableRows.push(['Responsive design', 'Development', 'Mobile, tablet, desktop']);

  // QA deliverables
  deliverableRows.push(['Test results', 'QA', 'Cross-browser, performance, accessibility']);
  deliverableRows.push(['Client UAT sign-off', 'QA', 'Client-approved test build']);

  // Launch deliverables
  deliverableRows.push(['Production deployment', 'Launch', 'Live site on hosting platform']);

  // Legal deliverables
  if (flags.needs_privacy_policy) deliverableRows.push(['Privacy policy', 'Launch', 'Data collection disclosure']);
  if (flags.needs_tos) deliverableRows.push(['Terms of service', 'Launch', 'User agreement']);
  if (flags.needs_cookie_policy) deliverableRows.push(['Cookie policy', 'Launch', 'Tracking disclosure']);

  // Handover deliverables
  if (flags.needs_handover) {
    deliverableRows.push(['Project closure report', 'Handover', 'Final summary and documentation']);
    if (flags.needs_training_docs) deliverableRows.push(['Training documentation', 'Handover', 'Written guides for CMS and management']);
    if (flags.needs_user_manual) deliverableRows.push(['User manual', 'Handover', 'End-user documentation']);
  }

  sections.push(createTable(['Deliverable', 'Phase', 'Description'], deliverableRows));

  return createDocument({
    title: 'Project Plan',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
    version: options.version ? `v${options.version}` : undefined,
  });
}
