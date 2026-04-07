// Privacy Policy document template
// NZ Privacy Act 2020 primary, GDPR conditional

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

  const jurisdiction = (meta.jurisdiction || '').toLowerCase();
  const includeGdpr = params.includeGdpr || jurisdiction.includes('eu') || jurisdiction.includes('uk');
  const includeCookieRef = flags.needs_cookie_policy || false;

  const integrations = loadActiveIntegrationClauses(docsState.integrationClauses);
  const hasIntegrations = integrations.length > 0;

  const sections = [];

  // --- 1. Introduction ---
  sections.push(createHeading('Introduction', 1));
  sections.push(createParagraph(
    `${company} ("we", "us", or "our") operates ${projectName} (accessible at ${siteUrl}). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit our website or use our services.`
  ));
  sections.push(createParagraph(
    'We are committed to protecting your privacy and handling your personal information in accordance with the Privacy Act 2020 (NZ) and the Information Privacy Principles ("IPPs") contained therein.'
  ));
  if (includeGdpr) {
    sections.push(createParagraph(
      'Where our services are accessed by individuals located in the European Union or the United Kingdom, we also comply with the General Data Protection Regulation (EU) 2016/679 ("GDPR") and the UK GDPR as retained under the Data Protection Act 2018.'
    ));
  }
  sections.push(createParagraph(
    `This policy is effective as of ${effectiveDate}. By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.`
  ));

  // --- 2. Information We Collect ---
  sections.push(createHeading('Information We Collect', 1));
  sections.push(createParagraph(
    'We collect personal information through the following means:'
  ));

  // 2a. Information you provide directly
  sections.push(createHeading('Information You Provide Directly', 2));
  sections.push(createParagraph(
    'We collect information that you voluntarily provide to us when you interact with our services. This may include:'
  ));

  const directItems = [
    'Contact information such as your name, email address, phone number, and postal address',
    'Account credentials including your username and password (passwords are stored in hashed form only)',
  ];
  if (flags.needs_auth) {
    directItems.push('Profile information you provide when creating or updating your account');
  }
  if (flags.needs_payments) {
    directItems.push('Billing and payment information, including billing address and payment method details (payment card data is processed by our payment provider and is not stored on our servers)');
  }
  if (flags.needs_cms) {
    directItems.push('Content you create, upload, or publish through our platform, including text, images, and files');
  }
  directItems.push(
    'Communications you send to us, including enquiries, support requests, and feedback',
    'Information submitted through forms, surveys, or other interactive features on our website'
  );
  sections.push(...createBulletList(directItems));

  // 2b. Information collected automatically
  sections.push(createHeading('Information Collected Automatically', 2));
  sections.push(createParagraph(
    'When you visit our website, certain information is collected automatically by our servers and, where applicable, by third-party analytics services. This information may include:'
  ));
  sections.push(...createBulletList([
    'IP address and approximate geographic location derived from your IP address',
    'Browser type and version, operating system, and device type',
    'Pages visited, time spent on each page, and navigation paths through the site',
    'Referring website or source that directed you to our site',
    'Date and time of each visit or interaction',
    'Cookies and similar tracking technologies (see "Cookies and Tracking" below)',
  ]));

  // 2c. Information from third parties (conditional)
  if (hasIntegrations) {
    sections.push(createHeading('Information from Third Parties', 2));
    sections.push(createParagraph(
      'We may receive personal information about you from third-party services that are integrated with our platform. The specific information received depends on the services in use and your interactions with those services. Details of each third-party integration and the data they provide are set out in Section 5 ("Third-Party Service Providers") below.'
    ));
  }

  // --- 3. How We Use Your Information ---
  sections.push(createHeading('How We Use Your Information', 1));
  sections.push(createParagraph(
    'We use the personal information we collect for the following purposes:'
  ));

  const purposes = [
    'To provide, operate, and maintain our website and services',
    'To respond to your enquiries, support requests, and communications',
    'To improve and optimise our website, including analysing usage patterns and diagnosing technical issues',
    'To comply with applicable laws, regulations, and legal obligations, including the Privacy Act 2020 (NZ)',
    'To protect the security and integrity of our website and services, and to prevent fraud or other harmful activities',
  ];
  if (flags.needs_auth) {
    purposes.splice(1, 0,
      'To create and manage your user account, including authentication and access control',
      'To personalise your experience based on your account settings and preferences'
    );
  }
  if (flags.needs_payments) {
    purposes.splice(purposes.length - 2, 0,
      'To process payments, issue invoices, and manage billing records',
      'To detect and prevent fraudulent transactions'
    );
  }
  if (flags.needs_cms) {
    purposes.splice(purposes.length - 2, 0,
      'To deliver, display, and manage content you create or interact with on our platform'
    );
  }
  sections.push(...createBulletList(purposes));
  sections.push(createParagraph(
    'We will not use your personal information for purposes materially different from those described above without first obtaining your consent, except where required or permitted by law.'
  ));

  // --- 4. Legal Basis for Processing (GDPR conditional) ---
  if (includeGdpr) {
    sections.push(createHeading('Legal Basis for Processing', 1));
    sections.push(createParagraph(
      'Where the GDPR applies, we process your personal data only where we have a lawful basis to do so. The legal bases we rely on are:'
    ));

    sections.push(createHeading('Consent', 2));
    sections.push(createParagraph(
      'Where you have given clear, informed, and unambiguous consent for us to process your personal data for a specific purpose. You may withdraw your consent at any time by contacting us, and we will cease processing on that basis. Withdrawal of consent does not affect the lawfulness of processing carried out prior to withdrawal.'
    ));

    sections.push(createHeading('Performance of a Contract', 2));
    sections.push(createParagraph(
      'Where processing is necessary for the performance of a contract to which you are a party, or to take steps at your request prior to entering into a contract. This includes providing you with the services you have requested, processing payments, and managing your account.'
    ));

    sections.push(createHeading('Legitimate Interests', 2));
    sections.push(createParagraph(
      'Where processing is necessary for our legitimate interests or those of a third party, provided that those interests are not overridden by your rights and freedoms. Our legitimate interests include improving our services, ensuring security, preventing fraud, and conducting internal analytics. We conduct a balancing test for each processing activity relying on this basis.'
    ));

    sections.push(createHeading('Legal Obligation', 2));
    sections.push(createParagraph(
      'Where processing is necessary for compliance with a legal obligation to which we are subject, such as tax reporting, anti-money laundering requirements, or responding to lawful requests from public authorities.'
    ));
  }

  // --- 5. Third-Party Service Providers ---
  sections.push(createHeading('Third-Party Service Providers', 1));
  sections.push(createParagraph(
    'We use third-party service providers to help us operate our website and deliver our services. These providers may process personal information on our behalf, and we require them to handle your data in accordance with applicable privacy laws and this policy.'
  ));
  sections.push(createParagraph(
    'We do not sell your personal information to any third party. We share personal information with third parties only as described below, or where required or permitted by law.'
  ));

  if (hasIntegrations) {
    for (const { name, clause } of integrations) {
      const displayName = clause?.name || name.charAt(0).toUpperCase() + name.slice(1);
      sections.push(createHeading(displayName, 2));

      if (!clause) {
        sections.push(createParagraph(
          `We use ${displayName} in connection with our services. For details about how ${displayName} handles personal information, please refer to their privacy policy.`
        ));
        continue;
      }

      if (clause.data_collected) {
        sections.push(createHeading('Data Collected', 3));
        sections.push(createParagraph(clause.data_collected));
      }

      if (clause.storage_location) {
        sections.push(createHeading('Storage Location', 3));
        sections.push(createParagraph(clause.storage_location));
      }

      if (clause.third_party_data_sharing) {
        sections.push(createHeading('Data Sharing', 3));
        sections.push(createParagraph(clause.third_party_data_sharing));
      }

      if (clause.data_retention) {
        sections.push(createHeading('Retention', 3));
        sections.push(createParagraph(clause.data_retention));
      }

      if (clause.sub_processor_details) {
        sections.push(createHeading('Sub-Processor Details', 3));
        sections.push(createParagraph(clause.sub_processor_details));
      }
    }
  } else {
    sections.push(createParagraph(
      'Details of specific third-party service providers and the data they process will be listed here as integrations are configured for this project.'
    ));
  }

  // --- 6. Data Retention ---
  sections.push(createHeading('Data Retention', 1));
  sections.push(createParagraph(
    'We retain your personal information only for as long as is necessary to fulfil the purposes for which it was collected, or as required by applicable law. The retention periods we apply are based on the following principles:'
  ));
  sections.push(...createBulletList([
    'Account information is retained for the duration of your account and for a reasonable period thereafter to allow for reactivation, unless you request deletion',
    'Transaction and billing records are retained for seven (7) years to comply with New Zealand tax and financial reporting obligations under the Tax Administration Act 1994',
    'Communication records (support requests, enquiries) are retained for two (2) years after the last interaction, or longer where required for legal or compliance purposes',
    'Server logs and automatically collected technical data are retained for up to twelve (12) months and then securely deleted or anonymised',
    'Data collected for a specific, time-limited purpose (e.g., a survey or promotion) is deleted within ninety (90) days of the purpose being fulfilled',
  ]));

  if (hasIntegrations) {
    sections.push(createParagraph(
      'Third-party service providers may apply their own retention periods as described in Section 5 above. We encourage you to review the privacy policies of these providers for further detail.'
    ));
  }

  sections.push(createParagraph(
    'When personal information is no longer required, we securely destroy it by overwriting, degaussing, or physically destroying the storage media, or by rendering the information permanently de-identified so that it can no longer be associated with any individual.'
  ));

  // --- 7. Your Rights Under the Privacy Act 2020 ---
  sections.push(createHeading('Your Rights Under the Privacy Act 2020', 1));
  sections.push(createParagraph(
    'Under the Privacy Act 2020 (NZ), you have the following rights in relation to your personal information:'
  ));

  sections.push(createHeading('Right of Access (IPP 6)', 2));
  sections.push(createParagraph(
    'You have the right to request access to the personal information we hold about you. We will respond to your request within twenty (20) working days, as required by the Act. We may charge a reasonable fee to cover the costs of locating, retrieving, and supplying the information. Access may be refused only on the grounds specified in the Privacy Act 2020 (for example, where disclosure would endanger the safety of any individual, or where the information is subject to legal privilege).'
  ));

  sections.push(createHeading('Right of Correction (IPP 7)', 2));
  sections.push(createParagraph(
    'You have the right to request that we correct any personal information we hold about you that is inaccurate, incomplete, or misleading. If we do not agree that a correction is warranted, you may request that a statement of the correction sought be attached to the information. We will respond to correction requests within twenty (20) working days.'
  ));

  sections.push(createHeading('Complaints', 2));
  sections.push(createParagraph(
    'If you believe that we have breached the Privacy Act 2020 or the Information Privacy Principles, you have the right to lodge a complaint with us. We will investigate your complaint and respond within twenty (20) working days.'
  ));
  sections.push(createParagraph(
    'If you are not satisfied with our response, you may refer your complaint to the Office of the Privacy Commissioner:'
  ));
  sections.push(...createBulletList([
    'Office of the Privacy Commissioner',
    'PO Box 10094, The Terrace, Wellington 6143, New Zealand',
    'Phone: 0800 803 909',
    'Website: https://privacy.org.nz',
    'Email: enquiries@privacy.org.nz',
  ]));

  // --- 8. Your Rights Under the GDPR (conditional) ---
  if (includeGdpr) {
    sections.push(createHeading('Your Rights Under the GDPR', 1));
    sections.push(createParagraph(
      'Where the GDPR applies, you have the following additional rights in relation to your personal data. These rights are in addition to, and do not replace, your rights under the Privacy Act 2020 (NZ).'
    ));

    sections.push(createHeading('Right of Access', 2));
    sections.push(createParagraph(
      'You have the right to obtain confirmation as to whether your personal data is being processed, and to receive a copy of that data in a structured, commonly used, and machine-readable format. We will respond within thirty (30) days of receipt of your request.'
    ));

    sections.push(createHeading('Right to Rectification', 2));
    sections.push(createParagraph(
      'You have the right to request that we correct inaccurate personal data, and to have incomplete personal data completed.'
    ));

    sections.push(createHeading('Right to Erasure', 2));
    sections.push(createParagraph(
      'You have the right to request that we erase your personal data where: the data is no longer necessary for the purpose for which it was collected; you withdraw consent and there is no other lawful basis for processing; you object to processing and there are no overriding legitimate grounds; the data has been unlawfully processed; or erasure is required to comply with a legal obligation. This right does not apply where processing is necessary for compliance with a legal obligation, the establishment or defence of legal claims, or reasons of public interest.'
    ));

    sections.push(createHeading('Right to Data Portability', 2));
    sections.push(createParagraph(
      'You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller without hindrance. This right applies where the processing is based on consent or a contract, and is carried out by automated means.'
    ));

    sections.push(createHeading('Right to Restrict Processing', 2));
    sections.push(createParagraph(
      'You have the right to request that we restrict the processing of your personal data where: you contest the accuracy of the data (for the period needed to verify accuracy); the processing is unlawful and you request restriction rather than erasure; we no longer need the data but you require it for legal claims; or you have objected to processing pending verification of our legitimate grounds.'
    ));

    sections.push(createHeading('Right to Object', 2));
    sections.push(createParagraph(
      'You have the right to object to processing of your personal data where the processing is based on legitimate interests or the performance of a task carried out in the public interest. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests, rights, and freedoms. You have the absolute right to object to processing for direct marketing purposes at any time.'
    ));

    sections.push(createHeading('Right to Withdraw Consent', 2));
    sections.push(createParagraph(
      'Where we process your personal data on the basis of consent, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out prior to withdrawal. To withdraw consent, contact us using the details set out in the "Contact and Complaints" section below.'
    ));

    sections.push(createHeading('Exercising Your GDPR Rights', 2));
    sections.push(createParagraph(
      `To exercise any of the rights described above, please contact us at ${contactEmail}. We will respond to your request within thirty (30) days. If we are unable to comply with your request, we will inform you of the reasons. You also have the right to lodge a complaint with a supervisory authority in the EU Member State of your habitual residence, place of work, or place of the alleged infringement.`
    ));
  }

  // --- 9. Cookies and Tracking (conditional) ---
  if (includeCookieRef) {
    sections.push(createHeading('Cookies and Tracking Technologies', 1));
    sections.push(createParagraph(
      'Our website uses cookies and similar tracking technologies to distinguish you from other users, to provide essential functionality, and to help us understand how our website is used. Cookies are small text files placed on your device by your browser when you visit our website.'
    ));
    sections.push(createParagraph(
      'We use the following categories of cookies:'
    ));
    sections.push(...createBulletList([
      'Essential cookies: Required for the website to function correctly, including session management, security, and load balancing. These cookies cannot be disabled.',
      'Functional cookies: Remember your preferences and settings to enhance your experience.',
      'Analytics cookies: Help us understand how visitors use our website by collecting anonymised usage statistics.',
    ]));
    sections.push(createParagraph(
      'For full details about the cookies we use, their purposes, and how to manage or disable them, please refer to our Cookie Policy.'
    ));
  }

  // --- 10. International Data Transfers ---
  sections.push(createHeading('International Data Transfers', 1));
  sections.push(createParagraph(
    'Your personal information may be transferred to, stored in, and processed in countries other than New Zealand. In particular, some of our third-party service providers operate from or store data in the United States, the European Union, and other jurisdictions.'
  ));
  sections.push(createParagraph(
    'Where we transfer personal information outside of New Zealand, we take reasonable steps to ensure that the recipient provides a comparable standard of protection to that provided under the Privacy Act 2020 (NZ), including by using contractual protections with our service providers.'
  ));
  if (includeGdpr) {
    sections.push(createParagraph(
      'Where personal data is transferred outside the European Economic Area or the United Kingdom, we ensure that appropriate safeguards are in place in accordance with the GDPR. These safeguards may include Standard Contractual Clauses approved by the European Commission, adequacy decisions, or other recognised transfer mechanisms.'
    ));
  }

  // --- 11. Data Security ---
  sections.push(createHeading('Data Security', 1));
  sections.push(createParagraph(
    'We implement appropriate technical and organisational security measures to protect your personal information against unauthorised access, alteration, disclosure, destruction, or loss. These measures include, but are not limited to:'
  ));
  sections.push(...createBulletList([
    'Encryption of data in transit using Transport Layer Security (TLS/HTTPS)',
    'Encryption of sensitive data at rest using industry-standard encryption algorithms (AES-256 or equivalent)',
    'Access controls that restrict access to personal information to authorised personnel who require it for legitimate business purposes',
    'Regular security assessments and vulnerability testing of our systems',
    'Secure development practices, including code review and dependency management',
    'Incident response procedures to detect, investigate, and respond to security events',
  ]));
  sections.push(createParagraph(
    'While we take reasonable steps to protect your personal information, no method of transmission or storage is completely secure. We cannot guarantee the absolute security of your information, and any transmission is at your own risk.'
  ));

  // --- 12. Children's Privacy ---
  sections.push(createHeading('Children\'s Privacy', 1));
  sections.push(createParagraph(
    'Our services are not directed at, and we do not knowingly collect personal information from, individuals under the age of sixteen (16). If we become aware that we have inadvertently collected personal information from a child under 16, we will take reasonable steps to delete that information as soon as practicable.'
  ));
  sections.push(createParagraph(
    'If you are a parent or guardian and believe that your child has provided us with personal information, please contact us using the details set out in the "Contact and Complaints" section below, and we will take steps to remove the information and close any associated account.'
  ));

  // --- 13. Changes to This Policy ---
  sections.push(createHeading('Changes to This Privacy Policy', 1));
  sections.push(createParagraph(
    'We may update this Privacy Policy from time to time to reflect changes in our practices, our services, or applicable law. When we make material changes, we will notify you by posting the revised policy on our website with an updated effective date. Where the changes are significant, we may also notify you by email or through a prominent notice on our website.'
  ));
  sections.push(createParagraph(
    'We encourage you to review this policy periodically to stay informed about how we protect your personal information. Your continued use of our services after any changes to this policy constitutes your acceptance of the revised terms.'
  ));

  // --- 14. Contact and Complaints ---
  sections.push(createHeading('Contact and Complaints', 1));
  sections.push(createParagraph(
    'If you have any questions about this Privacy Policy, wish to exercise your privacy rights, or have a complaint about how we have handled your personal information, please contact us:'
  ));
  sections.push(...createBulletList([
    `Organisation: ${company}`,
    `Email: ${contactEmail}`,
    `Website: ${siteUrl}`,
  ]));
  sections.push(createParagraph(
    'We aim to acknowledge all privacy-related enquiries within five (5) working days and to provide a substantive response within twenty (20) working days.'
  ));
  sections.push(createParagraph(
    'If you are not satisfied with our response, you may refer your complaint to the Office of the Privacy Commissioner of New Zealand:'
  ));
  sections.push(...createBulletList([
    'Office of the Privacy Commissioner',
    'PO Box 10094, The Terrace, Wellington 6143, New Zealand',
    'Phone: 0800 803 909',
    'Website: https://privacy.org.nz',
  ]));
  if (includeGdpr) {
    sections.push(createParagraph(
      'If you are located in the European Union or United Kingdom, you also have the right to lodge a complaint with the supervisory authority in the EU Member State of your habitual residence, place of work, or place of the alleged infringement.'
    ));
  }

  return createDocument({
    title: 'Privacy Policy',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
