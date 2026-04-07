// Website Terms of Service template
// Generates Terms of Service compliant with NZ law (Consumer Guarantees Act 1993, Fair Trading Act 1986)

import { createDocument, createHeading, createParagraph, createBulletList } from '../_shared/generator.js';
import { loadActiveIntegrationClauses, resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const websiteUrl = params['website-url'] || meta['website-url'] || ctx.client?.website || '[WEBSITE URL]';
  const contactEmail = brandConfig?.contactEmail || params['contact-email'] || '[CONTACT EMAIL]';
  const contactAddress = brandConfig?.address || params['contact-address'] || '[CONTACT ADDRESS]';
  const siteOwner = params['site-owner'] || clientName;
  const minimumAge = params['minimum-age'] || 16;

  const sections = [];

  // 1. Introduction and Acceptance
  sections.push(createHeading('Introduction and Acceptance', 1));

  sections.push(createParagraph(
    `Welcome to ${projectName} ("the Website"). These Terms of Service ("Terms") govern your access to and use of the Website operated by ${siteOwner} ("we", "us", or "our"). By accessing or using the Website, you ("you" or "User") acknowledge that you have read, understood, and agree to be bound by these Terms.`
  ));

  sections.push(createParagraph(
    'If you do not agree with any part of these Terms, you must not access or use the Website. Your continued use of the Website following the posting of any changes to these Terms constitutes acceptance of those changes.'
  ));

  sections.push(createParagraph(
    `You must be at least ${minimumAge} years of age to use this Website. By using the Website, you represent and warrant that you are at least ${minimumAge} years old. If you are under ${minimumAge}, you may not access or use the Website.`
  ));

  sections.push(createParagraph(
    'These Terms are governed by New Zealand law, including the Consumer Guarantees Act 1993, the Fair Trading Act 1986, and the Contract and Commercial Law Act 2017.'
  ));

  // 2. Definitions
  sections.push(createHeading('Definitions', 1));

  sections.push(createParagraph(
    'In these Terms, unless the context otherwise requires:'
  ));

  sections.push(...createBulletList([
    `"Website" means the website located at ${websiteUrl}, including all pages, subdomains, content, features, and services available through it.`,
    '"User" means any person who accesses or uses the Website, whether registered or unregistered.',
    '"Content" means all text, images, graphics, audio, video, data, software, and other materials published on or through the Website, whether provided by us, our Users, or third parties.',
    '"Services" means the services, features, and functionality made available through the Website.',
    '"Account" means a registered user account on the Website, where applicable.',
    '"Personal Information" has the meaning given to it in the Privacy Act 2020 (NZ).',
    '"Intellectual Property Rights" means all intellectual property rights, including copyright, trade marks, patents, design rights, trade secrets, and database rights, whether registered or unregistered.',
  ]));

  // 3. Use of the Website
  sections.push(createHeading('Use of the Website', 1));

  sections.push(createHeading('Permitted Use', 2));

  sections.push(createParagraph(
    'You may access and use the Website for lawful purposes only and in accordance with these Terms. You agree to comply with all applicable laws, regulations, and codes of conduct when using the Website, including the Fair Trading Act 1986 (NZ) and the Harmful Digital Communications Act 2015 (NZ).'
  ));

  sections.push(createHeading('Prohibited Conduct', 2));

  sections.push(createParagraph(
    'You must not:'
  ));

  sections.push(...createBulletList([
    'Use the Website in any way that breaches any applicable local, national, or international law or regulation.',
    'Use the Website for any fraudulent or unlawful purpose, or in connection with any criminal activity.',
    'Transmit or procure the sending of any unsolicited advertising, promotional material, spam, or similar solicitation.',
    'Introduce any viruses, trojans, worms, logic bombs, ransomware, or other material that is malicious or technologically harmful.',
    'Attempt to gain unauthorised access to the Website, the server on which the Website is hosted, or any server, computer, or database connected to the Website.',
    'Conduct any systematic or automated data collection activities (including scraping, data mining, or data extraction) on or in relation to the Website without our express written consent.',
    'Use the Website to transmit content that is defamatory, obscene, offensive, hateful, discriminatory, threatening, or otherwise objectionable.',
    'Impersonate any person or entity, or misrepresent your affiliation with any person or entity.',
    'Interfere with or disrupt the operation of the Website or the servers or networks used to make the Website available.',
    'Remove, alter, or obscure any copyright, trade mark, or other proprietary notices on the Website.',
  ]));

  sections.push(createParagraph(
    'We reserve the right to suspend or terminate your access to the Website immediately and without notice if we reasonably believe you have violated any of these prohibitions.'
  ));

  // 4. User Accounts (conditional)
  if (flags.needs_auth) {
    sections.push(createHeading('User Accounts', 1));

    sections.push(createHeading('Registration', 2));

    sections.push(createParagraph(
      'Certain features of the Website may require you to create an Account. When registering, you agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete.'
    ));

    sections.push(createHeading('Account Security', 2));

    sections.push(createParagraph(
      'You are responsible for maintaining the confidentiality of your Account credentials, including your password. You are responsible for all activities that occur under your Account, whether or not you have authorised such activities. You agree to notify us immediately of any unauthorised use of your Account or any other breach of security.'
    ));

    sections.push(createParagraph(
      'We reserve the right to disable any Account at any time if, in our reasonable opinion, you have failed to comply with these Terms or if we suspect that your Account has been compromised.'
    ));

    sections.push(createHeading('Account Termination', 2));

    sections.push(createParagraph(
      'You may close your Account at any time by contacting us. Upon closure, your right to access features that require an Account will cease immediately. We may retain certain information as required by law or for legitimate business purposes, in accordance with the Privacy Act 2020 (NZ).'
    ));
  }

  // 5. User Content (conditional)
  if (flags.needs_auth || flags.needs_cms) {
    sections.push(createHeading('User Content', 1));

    sections.push(createHeading('Licence Grant', 2));

    sections.push(createParagraph(
      'By submitting, posting, or uploading any content to the Website ("User Content"), you grant us a non-exclusive, worldwide, royalty-free, sublicensable, and transferable licence to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content in connection with the operation and promotion of the Website. This licence continues for as long as the User Content remains on the Website and for a reasonable period thereafter to allow for archival and backup purposes.'
    ));

    sections.push(createParagraph(
      'You retain all ownership rights in your User Content. You represent and warrant that you own or have the necessary rights, licences, and permissions to grant the above licence, and that your User Content does not infringe the intellectual property rights, privacy rights, or other rights of any third party.'
    ));

    sections.push(createHeading('Content Standards', 2));

    sections.push(createParagraph(
      'User Content must comply with these Terms and all applicable laws. You must not submit User Content that:'
    ));

    sections.push(...createBulletList([
      'Is false, misleading, deceptive, or likely to mislead or deceive, in breach of the Fair Trading Act 1986 (NZ).',
      'Infringes any intellectual property right, privacy right, or other right of any person.',
      'Is defamatory, obscene, offensive, discriminatory, threatening, or harassing.',
      'Constitutes a harmful digital communication under the Harmful Digital Communications Act 2015 (NZ).',
      'Contains personal information of another person without their consent, in breach of the Privacy Act 2020 (NZ).',
      'Contains viruses or other harmful code.',
    ]));

    sections.push(createHeading('Moderation', 2));

    sections.push(createParagraph(
      'We reserve the right, but are not obligated, to review, edit, refuse, or remove any User Content at our sole discretion and without notice. We do not endorse, guarantee, or assume responsibility for any User Content posted by Users. We shall not be liable for any loss or damage arising from User Content.'
    ));
  }

  // 6. Intellectual Property
  sections.push(createHeading('Intellectual Property', 1));

  sections.push(createParagraph(
    `All Content on the Website, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, and software, is the property of ${siteOwner} or its content suppliers and is protected by New Zealand and international copyright, trade mark, and other intellectual property laws.`
  ));

  sections.push(createParagraph(
    'You may view, download, and print Content from the Website for your personal, non-commercial use only, provided that you do not modify the Content and that you retain all copyright and other proprietary notices contained in the Content.'
  ));

  sections.push(createParagraph(
    'You must not reproduce, distribute, modify, create derivative works from, publicly display, publicly perform, republish, download, store, or transmit any Content on the Website except as expressly permitted by these Terms or with our prior written consent.'
  ));

  sections.push(createParagraph(
    `The ${projectName} name, logo, and all related names, logos, product and service names, designs, and slogans are trade marks of ${siteOwner} or its affiliates. You must not use such marks without our prior written permission.`
  ));

  // 7. Payment Terms (conditional)
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Terms', 1));

    sections.push(createHeading('Pricing', 2));

    sections.push(createParagraph(
      'All prices displayed on the Website are in New Zealand Dollars (NZD) unless otherwise stated. Prices are inclusive of Goods and Services Tax (GST) where applicable, in accordance with the Goods and Services Tax Act 1985 (NZ). We reserve the right to change prices at any time without prior notice, provided that price changes will not affect orders already confirmed.'
    ));

    sections.push(createHeading('Payment Processing', 2));

    sections.push(createParagraph(
      'Payments are processed through third-party payment processors. By making a purchase, you agree to the payment processor\'s terms of service. We do not store your full payment card details on our servers. All payment information is handled in accordance with applicable payment card industry standards.'
    ));

    sections.push(createHeading('Refunds', 2));

    sections.push(createParagraph(
      'Our refund policy is subject to the Consumer Guarantees Act 1993 (NZ). Where goods or services supplied through the Website fail to meet the guarantees set out in that Act, you are entitled to the remedies provided under the Act, including repair, replacement, or refund as appropriate.'
    ));

    sections.push(createParagraph(
      'Nothing in these Terms limits or excludes any rights or remedies you may have under the Consumer Guarantees Act 1993 where it applies. Where the Consumer Guarantees Act 1993 applies, you may be entitled to a refund, replacement, or repair depending on the nature and severity of the failure.'
    ));

    sections.push(createHeading('Consumer Guarantees', 2));

    sections.push(createParagraph(
      'Under the Consumer Guarantees Act 1993 (NZ), goods and services supplied to consumers come with automatic guarantees that cannot be excluded. These include guarantees that goods are of acceptable quality, fit for purpose, and match their description, and that services are carried out with reasonable care and skill and are fit for the purpose made known to us.'
    ));

    sections.push(createParagraph(
      'If you are acquiring goods or services for business purposes, you agree that the Consumer Guarantees Act 1993 does not apply to the supply, to the extent permitted by section 43(2) of that Act.'
    ));
  }

  // 8. Third-Party Services
  sections.push(createHeading('Third-Party Services', 1));

  sections.push(createParagraph(
    'The Website may contain links to, or integrate with, third-party websites, services, and applications ("Third-Party Services"). These Third-Party Services are not under our control, and we are not responsible for their content, privacy policies, terms of service, or practices. Your use of any Third-Party Service is at your own risk and subject to that service\'s own terms and policies.'
  ));

  sections.push(createParagraph(
    'We do not endorse or assume any responsibility for any Third-Party Services. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any Third-Party Service.'
  ));

  // Integration clause injection
  const integrationClauses = loadActiveIntegrationClauses(docsState.integrationClauses);

  if (integrationClauses.length > 0) {
    sections.push(createParagraph(
      'The Website uses the following third-party services. Your use of the Website constitutes acceptance of the applicable terms for these services:'
    ));

    for (const { name, clause } of integrationClauses) {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      sections.push(createHeading(displayName, 2));

      if (clause) {
        const summary = clause.name || displayName;
        sections.push(createParagraph(
          `The Website integrates with ${summary} for the provision of certain features and services. By using the Website, you acknowledge that your data may be processed by ${displayName} in accordance with their terms of service and privacy policy.`
        ));

        if (clause.data_collected) {
          sections.push(createParagraph(
            `Data processed by ${displayName}: ${clause.data_collected.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, '')).join('; ')}.`
          ));
        }

        if (clause.storage_location) {
          const locations = clause.storage_location.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, ''));
          if (locations.length > 0) {
            sections.push(createParagraph(
              `Data storage: ${locations[0]}.`
            ));
          }
        }
      } else {
        sections.push(createParagraph(
          `The Website integrates with ${displayName}. By using the Website, you acknowledge that certain data may be shared with ${displayName} as necessary for the operation of the Website. Please refer to ${displayName}'s own terms of service and privacy policy for further information about how your data is handled.`
        ));
      }
    }
  }

  // 9. Privacy
  sections.push(createHeading('Privacy', 1));

  sections.push(createParagraph(
    'Your privacy is important to us. Our collection, use, storage, and disclosure of personal information is governed by our Privacy Policy, which forms part of these Terms by reference. By using the Website, you consent to the practices described in the Privacy Policy.'
  ));

  sections.push(createParagraph(
    'We collect, use, and disclose personal information in accordance with the Privacy Act 2020 (NZ) and the Information Privacy Principles contained therein. We will not collect more personal information than is reasonably necessary for the purposes described in our Privacy Policy.'
  ));

  sections.push(createParagraph(
    'You have the right to request access to, and correction of, any personal information we hold about you, in accordance with the Privacy Act 2020 (NZ). To exercise these rights, please contact us using the details provided in the Contact Information section below.'
  ));

  // 10. Cookies (conditional)
  if (flags.needs_cookie_policy) {
    sections.push(createHeading('Cookies', 1));

    sections.push(createParagraph(
      'The Website uses cookies and similar tracking technologies to enhance your experience, analyse usage patterns, and provide certain features. Our use of cookies is described in detail in our Cookie Policy, which forms part of these Terms by reference.'
    ));

    sections.push(createParagraph(
      'By continuing to use the Website, you consent to the use of cookies as described in our Cookie Policy. You may manage your cookie preferences through your browser settings or through any cookie consent mechanism provided on the Website. Please note that disabling certain cookies may affect the functionality of the Website.'
    ));
  }

  // 11. Disclaimer of Warranties
  sections.push(createHeading('Disclaimer of Warranties', 1));

  sections.push(createParagraph(
    'The Website and all Content, Services, and features are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, to the fullest extent permitted by law.'
  ));

  sections.push(createParagraph(
    'We do not warrant that the Website will be uninterrupted, timely, secure, or error-free, that any defects will be corrected, or that the Website or the servers that host it are free of viruses or other harmful components.'
  ));

  sections.push(createParagraph(
    'To the maximum extent permitted by law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy.'
  ));

  sections.push(createHeading('Consumer Guarantees Act 1993 (NZ)', 2));

  sections.push(createParagraph(
    'Nothing in these Terms excludes, restricts, or modifies any right or remedy, or any guarantee, warranty, or other term or condition, implied or imposed by the Consumer Guarantees Act 1993 (NZ) or any other applicable legislation which cannot lawfully be excluded or limited. If the Consumer Guarantees Act 1993 applies, our liability is limited, to the extent permitted by law, to resupplying the services or paying the cost of having the services resupplied.'
  ));

  sections.push(createParagraph(
    'Where you are acquiring goods or services for business purposes, you agree that the Consumer Guarantees Act 1993 does not apply to the supply, to the extent permitted by section 43(2) of that Act.'
  ));

  // 12. Limitation of Liability
  sections.push(createHeading('Limitation of Liability', 1));

  sections.push(createParagraph(
    'To the maximum extent permitted by law, in no event shall we, our directors, officers, employees, agents, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, loss of business, loss of goodwill, or business interruption, arising out of or in connection with your use of or inability to use the Website, whether based on warranty, contract, tort (including negligence), statute, or any other legal theory.'
  ));

  sections.push(createParagraph(
    'Our total aggregate liability for all claims arising out of or in connection with these Terms or the Website shall not exceed one hundred New Zealand Dollars (NZD $100) or the amount you have paid to us through the Website in the twelve (12) months preceding the event giving rise to the claim, whichever is greater.'
  ));

  sections.push(createParagraph(
    'Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any liability that cannot be lawfully excluded or limited under New Zealand law, including liability under the Consumer Guarantees Act 1993 (NZ) where that Act applies.'
  ));

  // 13. Changes to Terms
  sections.push(createHeading('Changes to Terms', 1));

  sections.push(createParagraph(
    'We reserve the right to modify, amend, or replace these Terms at any time at our sole discretion. When we make material changes, we will update the "Last Updated" date at the top of these Terms and, where practicable, provide notice through the Website or by email.'
  ));

  sections.push(createParagraph(
    'Your continued use of the Website after any changes to these Terms constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Website immediately.'
  ));

  sections.push(createParagraph(
    'We encourage you to review these Terms periodically to stay informed about our terms and conditions. Material changes will not apply retroactively to disputes or events that arose before the changes were posted.'
  ));

  // 14. Governing Law
  sections.push(createHeading('Governing Law', 1));

  sections.push(createParagraph(
    'These Terms shall be governed by and construed in accordance with the laws of New Zealand. You agree to submit to the non-exclusive jurisdiction of the courts of New Zealand for the resolution of any disputes arising under or in connection with these Terms.'
  ));

  sections.push(createParagraph(
    'Any dispute arising out of or in connection with these Terms shall, in the first instance, be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within thirty (30) days, either party may refer the dispute to mediation or commence proceedings in the courts of New Zealand.'
  ));

  sections.push(createParagraph(
    'If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be severed and the remaining provisions shall continue in full force and effect.'
  ));

  // 15. Contact Information
  sections.push(createHeading('Contact Information', 1));

  sections.push(createParagraph(
    'If you have any questions, concerns, or complaints about these Terms or the Website, please contact us at:'
  ));

  sections.push(...createBulletList([
    `${siteOwner}`,
    `Email: ${contactEmail}`,
    `Address: ${contactAddress}`,
  ]));

  sections.push(createParagraph(
    'We will endeavour to respond to all enquiries within five (5) Business Days. If you are not satisfied with our response, you may refer your complaint to the relevant regulatory authority in New Zealand.'
  ));

  return createDocument({
    title: 'Terms of Service',
    subtitle: projectName,
    clientName: siteOwner,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
