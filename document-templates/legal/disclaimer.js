// Website Disclaimer document template

import { createDocument, createHeading, createParagraph, createBulletList } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const meta = docsState.meta || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const websiteUrl = params['website-url'] || meta['website-url'] || ctx.client?.website || '[WEBSITE URL]';

  const sections = [];

  // 1. General Disclaimer
  sections.push(createHeading('General Disclaimer', 1));
  sections.push(createParagraph(
    `The information provided on ${websiteUrl} (the "Website"), operated by ${company} on behalf of ${clientName}, is for general informational purposes only. All information on the Website is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Website.`
  ));
  sections.push(createParagraph(
    'Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Website or reliance on any information provided on the Website. Your use of the Website and your reliance on any information on the Website is solely at your own risk.'
  ));

  // 2. No Professional Advice
  sections.push(createHeading('No Professional Advice', 1));
  sections.push(createParagraph(
    'The Website does not contain, and should not be construed as containing, legal, financial, medical, accounting, tax, or any other professional advice. If you require advice of this nature, you should consult an appropriately qualified professional. No action should be taken or refrained from based solely on the content of the Website without first seeking appropriate professional advice.'
  ));
  sections.push(createParagraph(
    'Nothing on the Website creates, or is intended to create, a professional-client relationship between the Website operator and any visitor or user of the Website.'
  ));

  // 3. Accuracy of Information
  sections.push(createHeading('Accuracy of Information', 1));
  sections.push(createParagraph(
    `${company} makes reasonable efforts to ensure the information on the Website is accurate and up to date. However, we do not guarantee or warrant that:`
  ));
  sections.push(...createBulletList([
    'The information on the Website is complete, accurate, or current at all times.',
    'The Website will be free from errors, omissions, or inaccuracies.',
    'Information that was accurate at the time of publication will remain accurate over time.',
    'The Website will be updated at any particular frequency.',
  ]));
  sections.push(createParagraph(
    'Information on the Website may become outdated and we are under no obligation to update it. We reserve the right to modify, correct, or remove content at any time without notice.'
  ));

  // 4. External Links
  sections.push(createHeading('External Links', 1));
  sections.push(createParagraph(
    'The Website may contain links to third-party websites, applications, or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, terms of use, or practices of any third-party websites or services.'
  ));
  sections.push(createParagraph(
    'The inclusion of any link does not imply endorsement, approval, or recommendation by us. We strongly advise you to read the terms and conditions and privacy policy of any third-party website you visit. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any content, goods, or services available on or through any third-party website.'
  ));

  // 5. Use at Your Own Risk
  sections.push(createHeading('Use at Your Own Risk', 1));
  sections.push(createParagraph(
    'Any tools, calculators, interactive features, downloads, or other resources provided on the Website are made available on an "as is" and "as available" basis without any warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.'
  ));
  sections.push(createParagraph(
    'You acknowledge and agree that your use of such tools and resources is entirely at your own risk. We do not warrant that results obtained from such tools or resources will be accurate, reliable, or suitable for any particular purpose. You should independently verify any outputs before relying on them for any decision.'
  ));

  // 6. Limitation of Liability
  sections.push(createHeading('Limitation of Liability', 1));
  sections.push(createParagraph(
    `To the maximum extent permitted by applicable law, ${company} and its directors, employees, agents, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:`
  ));
  sections.push(...createBulletList([
    'Your access to or use of, or inability to access or use, the Website.',
    'Any conduct or content of any third party on or linked from the Website.',
    'Any content obtained from the Website.',
    'Unauthorised access, use, or alteration of your transmissions or content.',
    'Any reliance placed on the information, tools, or resources provided on the Website.',
  ]));
  sections.push(createParagraph(
    'Nothing in this disclaimer excludes or limits any rights you may have under the Consumer Guarantees Act 1993 (NZ) where it applies. Where goods or services are supplied to consumers as defined by the Consumer Guarantees Act 1993, the guarantees under that Act cannot be excluded. For services acquired for business purposes, the parties agree to contract out of the Consumer Guarantees Act 1993 to the extent permitted by section 43(2) of that Act.'
  ));

  // 7. Testimonials and Case Studies (conditional)
  if (options.hasTestimonials) {
    sections.push(createHeading('Testimonials and Case Studies', 1));
    sections.push(createParagraph(
      'The Website may contain testimonials, reviews, case studies, or endorsements from clients, customers, or users. These reflect the individual experiences and opinions of those persons and do not necessarily represent the views of the Website operator.'
    ));
    sections.push(createParagraph(
      'Testimonials and case studies are provided for illustrative purposes only. Results described are specific to the individuals or businesses featured and are not guaranteed. Your results may vary depending on your individual circumstances, effort, and other factors. Past performance is not indicative of future results.'
    ));
    sections.push(createParagraph(
      'We do not verify, endorse, or vouch for the accuracy of any testimonial or case study. Where testimonials have been provided in exchange for compensation, this will be disclosed.'
    ));
  }

  // 8. Changes
  sections.push(createHeading('Changes to This Disclaimer', 1));
  sections.push(createParagraph(
    `${company} reserves the right to update, amend, or replace this disclaimer at any time and without prior notice. Changes are effective immediately upon posting on the Website. The date of the most recent revision will be indicated at the top of this page. Your continued use of the Website following the posting of any changes constitutes your acceptance of those changes.`
  ));
  sections.push(createParagraph(
    'We encourage you to review this disclaimer periodically to stay informed about how we are protecting your interests.'
  ));

  // 9. Governing Law
  sections.push(createHeading('Governing Law', 1));
  sections.push(createParagraph(
    'This disclaimer is governed by and construed in accordance with the laws of New Zealand. Any disputes arising in connection with this disclaimer shall be subject to the non-exclusive jurisdiction of the courts of New Zealand.'
  ));
  sections.push(createParagraph(
    'If any provision of this disclaimer is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be severed and the remaining provisions shall continue in full force and effect.'
  ));

  return createDocument({
    title: 'Website Disclaimer',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
