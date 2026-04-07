// Independent Contractor Agreement document template
// NZ Employment Relations Act 2000 compliant

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { liability, confidentiality, dispute, entireAgreement } from './clauses/index.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const contractorName = options.contractorName || params['contractor-name'] || '[CONTRACTOR NAME]';
  const contractorCompany = options.contractorCompany || params['contractor-company'] || '';
  const services = options.services || params['services-description'] || ctx.description || '[DESCRIPTION OF SERVICES TO BE PROVIDED]';
  const startDate = options.startDate || params['start-date'] || '[START DATE]';
  const endDate = options.endDate || params['end-date'] || '[END DATE]';
  const rate = options.rate || params['contractor-rate'] || '[RATE]';
  const rateType = options.rateType || params['rate-type'] || 'hourly';
  const isGstRegistered = options.isGstRegistered !== undefined ? options.isGstRegistered : true;

  const sections = [];

  // 1. Parties
  sections.push(createHeading('Parties', 1));
  sections.push(createParagraph(
    'This Independent Contractor Agreement ("Agreement") is entered into between:'
  ));
  sections.push(...createBulletList([
    `${company} ("Principal") — the party engaging the Contractor to perform the Services.`,
    `${contractorName}${contractorCompany ? ` trading as ${contractorCompany}` : ''} ("Contractor") — the independent contractor engaged to perform the Services.`,
  ]));
  sections.push(createParagraph(
    'Each a "Party" and together the "Parties".'
  ));

  // 2. Engagement
  sections.push(createHeading('Nature of Engagement', 1));
  sections.push(createParagraph(
    'The Contractor is engaged as an independent contractor and not as an employee. Nothing in this Agreement shall be construed as creating an employment relationship, partnership, joint venture, or agency between the Parties.'
  ));
  sections.push(createParagraph(
    'The Contractor shall have full control over the manner and means by which the Services are performed, including the hours worked, the location of work, and the methods used, provided that the Services are completed in accordance with the specifications and timeframes set out in this Agreement. The Principal is interested only in the results to be achieved.'
  ));
  sections.push(createParagraph(
    'The Contractor is free to provide services to other clients during the term of this Agreement, provided that such engagements do not conflict with the Contractor\'s obligations under this Agreement or give rise to a conflict of interest.'
  ));

  // 3. Services
  sections.push(createHeading('Services', 1));
  sections.push(createParagraph(
    `The Contractor shall perform the following services in connection with the ${projectName} project (the "Services"):`
  ));
  sections.push(createParagraph(services));
  sections.push(createParagraph(
    'The Contractor shall perform the Services with reasonable skill, care, and diligence and in accordance with generally accepted professional standards applicable to the type of work being performed.'
  ));

  // 4. Term
  sections.push(createHeading('Term', 1));
  sections.push(createParagraph(
    `This Agreement commences on ${startDate} and continues until ${endDate}, unless terminated earlier in accordance with this Agreement (the "Term").`
  ));
  sections.push(createParagraph(
    'The Term may be extended by mutual written agreement of the Parties.'
  ));

  // 5. Payment
  sections.push(createHeading('Payment', 1));
  sections.push(createParagraph(
    `The Principal shall pay the Contractor at the rate of ${rate} (${rateType}) for the Services performed under this Agreement.`
  ));
  sections.push(createParagraph(
    'The Contractor shall submit itemised invoices to the Principal on a fortnightly or monthly basis (as agreed). Each invoice shall include a description of the Services performed, the hours worked (if applicable), and the amount due. The Principal shall pay each invoice within fourteen (14) days of receipt.'
  ));

  if (isGstRegistered) {
    sections.push(createParagraph(
      'Where the Contractor is registered for Goods and Services Tax ("GST") under the Goods and Services Tax Act 1985, the Contractor shall add GST to each invoice at the prevailing rate. The Contractor shall provide a valid GST invoice that complies with the requirements of the Inland Revenue Department.'
    ));
  } else {
    sections.push(createParagraph(
      'The Contractor represents that they are not currently registered for GST. If the Contractor becomes GST-registered during the Term, the Contractor shall promptly notify the Principal and GST shall be added to subsequent invoices at the prevailing rate.'
    ));
  }

  sections.push(createParagraph(
    'The rates specified in this Agreement are inclusive of all costs and expenses incurred by the Contractor in performing the Services, unless otherwise agreed in writing. Any pre-approved expenses shall be reimbursed upon presentation of receipts.'
  ));

  // 6. Intellectual Property
  sections.push(createHeading('Intellectual Property', 1));

  sections.push(createHeading('Work Product', 2));
  sections.push(createParagraph(
    `All work product, deliverables, materials, inventions, designs, code, documentation, and other outputs created by the Contractor in the performance of the Services ("Work Product") shall be the sole and exclusive property of the Principal. The Contractor hereby assigns to the Principal all right, title, and interest (including all intellectual property rights) in and to the Work Product, effective upon creation.`
  ));
  sections.push(createParagraph(
    'The Contractor shall execute any documents and take any actions reasonably requested by the Principal to give effect to this assignment and to enable the Principal to register, protect, and enforce its intellectual property rights in the Work Product.'
  ));

  sections.push(createHeading('Pre-Existing IP', 2));
  sections.push(createParagraph(
    'The Contractor retains all right, title, and interest in any intellectual property owned by the Contractor prior to the commencement of this Agreement or developed independently outside the scope of this Agreement ("Pre-Existing IP"). Where the Contractor incorporates any Pre-Existing IP into the Work Product, the Contractor grants the Principal a non-exclusive, perpetual, irrevocable, worldwide, royalty-free licence to use, reproduce, modify, and distribute such Pre-Existing IP as part of the Work Product.'
  ));
  sections.push(createParagraph(
    'The Contractor shall notify the Principal in advance of incorporating any Pre-Existing IP into the Work Product.'
  ));

  sections.push(createHeading('Moral Rights', 2));
  sections.push(createParagraph(
    'To the extent permitted by the Copyright Act 1994 (NZ), the Contractor waives all moral rights in the Work Product, including the right to be identified as the author and the right to object to derogatory treatment of the work.'
  ));

  // 7. Confidentiality (clause library)
  sections.push(...confidentiality({ companyName: company, clientName: contractorName }));

  // 8. Data Protection
  sections.push(createHeading('Data Protection', 1));
  sections.push(createParagraph(
    'The Contractor shall comply with the Privacy Act 2020 (NZ) and any other applicable data protection legislation in respect of any personal information received, accessed, or handled in connection with the Services.'
  ));
  sections.push(createParagraph(
    'Without limiting the above, the Contractor shall:'
  ));
  sections.push(...createBulletList([
    'Only access, collect, use, or disclose personal information to the extent necessary for the performance of the Services.',
    'Implement reasonable security safeguards to protect personal information against unauthorised access, use, disclosure, or loss.',
    'Not retain any personal information beyond the duration of this Agreement unless required by law, and shall securely delete or return all personal information to the Principal upon termination or expiry of this Agreement.',
    'Promptly notify the Principal of any actual or suspected privacy breach involving personal information accessed or handled in connection with the Services.',
    'Not transfer personal information outside New Zealand without the prior written consent of the Principal.',
  ]));

  // 9. Non-Solicitation
  sections.push(createHeading('Non-Solicitation', 1));
  sections.push(createParagraph(
    `During the Term and for a period of twelve (12) months following the termination or expiry of this Agreement, the Contractor shall not, whether directly or indirectly, solicit, canvass, approach, or entice away (or attempt to do so) any:`
  ));
  sections.push(...createBulletList([
    `Employee or contractor of ${company} for the purpose of offering them employment or engagement.`,
    `Client or customer of ${company} with whom the Contractor had dealings during the Term, for the purpose of providing services that are the same as or substantially similar to the Services.`,
  ]));
  sections.push(createParagraph(
    'The Contractor acknowledges that this restriction is reasonable and necessary to protect the legitimate business interests of the Principal, having regard to the nature of the Services and the access to confidential information and business relationships that the engagement provides.'
  ));

  // 10. Insurance
  sections.push(createHeading('Insurance', 1));
  sections.push(createParagraph(
    'The Contractor shall, at the Contractor\'s own expense, maintain adequate insurance coverage for the duration of this Agreement, including:'
  ));
  sections.push(...createBulletList([
    'Professional indemnity insurance appropriate to the nature and value of the Services.',
    'Public liability insurance.',
    'Any other insurance required by law or reasonably requested by the Principal.',
  ]));
  sections.push(createParagraph(
    'The Contractor shall provide evidence of current insurance coverage to the Principal upon request.'
  ));

  // 11. Contractor Status
  sections.push(createHeading('Contractor Status', 1));
  sections.push(createParagraph(
    'The Parties expressly acknowledge and agree that the Contractor is engaged as an independent contractor and is not an employee of the Principal for any purpose. Without limiting the generality of the foregoing:'
  ));
  sections.push(...createBulletList([
    'The Contractor is responsible for their own tax obligations, including income tax, and shall hold a valid IRD number. The Principal will not deduct PAYE or any other tax from payments to the Contractor.',
    'The Contractor is responsible for their own ACC levies and cover. The Principal makes no ACC contributions in respect of the Contractor.',
    'The Contractor is not entitled to holiday pay, sick leave, bereavement leave, or any other employee entitlements under the Holidays Act 2003 or any other employment legislation.',
    'The Contractor is not entitled to KiwiSaver employer contributions or any other employment benefits.',
    'The Contractor may provide tools, equipment, and materials at the Contractor\'s own expense, unless otherwise agreed.',
  ]));

  sections.push(createHeading('Employment Relations Act 2000 (NZ)', 2));
  sections.push(createParagraph(
    'The Parties have considered the tests set out in the Employment Relations Act 2000 and confirm that the real nature of this relationship is that of principal and independent contractor. In particular:'
  ));
  sections.push(...createBulletList([
    'The Contractor controls the manner and means of performing the Services (control test).',
    'The Contractor provides their own tools and equipment where appropriate (integration test).',
    'The Contractor bears the risk of profit or loss from their business activities (economic reality test).',
    'The Contractor is free to work for other clients simultaneously (exclusivity test).',
    'The intention of both Parties is to create an independent contractor relationship, not an employment relationship (intention test).',
  ]));
  sections.push(createParagraph(
    'If any court, tribunal, or authority determines that the Contractor is an employee of the Principal despite the terms of this Agreement, the Contractor shall indemnify the Principal for any resulting liability, including tax, ACC levies, holiday pay, and other employment-related costs, to the maximum extent permitted by law.'
  ));

  // 12. Termination
  sections.push(createHeading('Termination', 1));

  sections.push(createHeading('Termination on Notice', 2));
  sections.push(createParagraph(
    'Either Party may terminate this Agreement by giving seven (7) days\' written notice to the other Party.'
  ));

  sections.push(createHeading('Termination for Cause', 2));
  sections.push(createParagraph(
    'Either Party may terminate this Agreement immediately by written notice if the other Party:'
  ));
  sections.push(...createBulletList([
    'Commits a material breach of this Agreement that is not remedied within seven (7) days of written notice specifying the breach.',
    'Becomes insolvent, enters into liquidation, receivership, or voluntary administration, or makes an assignment for the benefit of creditors.',
    'Is convicted of a criminal offence that, in the reasonable opinion of the terminating Party, brings the other Party into disrepute or is incompatible with the continued performance of this Agreement.',
  ]));

  sections.push(createHeading('Effect of Termination', 2));
  sections.push(createParagraph(
    'Upon termination or expiry of this Agreement:'
  ));
  sections.push(...createBulletList([
    'The Contractor shall promptly deliver to the Principal all Work Product (whether complete or incomplete) and all property of the Principal in the Contractor\'s possession or control.',
    'The Principal shall pay the Contractor for all Services performed and expenses properly incurred up to the date of termination, in accordance with the payment terms of this Agreement.',
    'The provisions of this Agreement that by their nature are intended to survive termination shall continue in full force and effect, including the clauses relating to Intellectual Property, Confidentiality, Data Protection, Non-Solicitation, and Limitation of Liability.',
  ]));

  // 13. Limitation of Liability (clause library)
  sections.push(...liability({ companyName: company, clientName: contractorName }));

  // 14. Dispute Resolution (clause library)
  sections.push(...dispute({ companyName: company, clientName: contractorName }));

  // 15. Entire Agreement (clause library)
  sections.push(...entireAgreement({ companyName: company, clientName: contractorName }));

  // 16. Signatures
  sections.push(createHeading('Signatures', 1));
  sections.push(createParagraph(
    'By signing below, the Parties agree to be bound by the terms and conditions of this Independent Contractor Agreement.'
  ));
  sections.push(...createSignatureBlock([
    { role: 'Principal', name: company },
    { role: 'Contractor', name: contractorName },
  ]));

  return createDocument({
    title: 'Independent Contractor Agreement',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
