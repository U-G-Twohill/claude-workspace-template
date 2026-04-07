import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function warranties(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';
  const warrantyPeriod = params.warrantyPeriod || 30;

  return [
    createHeading('Warranties', 2),

    createHeading('Provider Warranties', 3),

    createParagraph(
      `${company} represents and warrants that:`
    ),

    ...createBulletList([
      `The services will be performed with reasonable care, skill, and diligence in accordance with generally accepted industry standards and practices.`,
      `The deliverables will be free from known material defects for a period of ${warrantyPeriod} days from the date of delivery or acceptance ("Warranty Period"). During the Warranty Period, ${company} shall, at no additional charge, correct any material defects in the deliverables that are reported in writing by ${client}, provided that such defects are not caused by modifications made by ${client} or third parties, or by use of the deliverables outside the scope described in this Agreement.`,
      `${company} has the right, power, and authority to enter into this Agreement and to perform its obligations hereunder.`,
      `The deliverables, to the best of ${company}'s knowledge, will not infringe the intellectual property rights of any third party.`,
      `${company} holds, and will maintain throughout the term of this Agreement, all licences, permits, and registrations necessary to perform the services.`,
    ]),

    createHeading('Client Warranties', 3),

    createParagraph(
      `${client} represents and warrants that:`
    ),

    ...createBulletList([
      `${client} has the right, power, and authority to enter into this Agreement and to perform its obligations hereunder.`,
      `All content, materials, data, and instructions provided by ${client} to ${company} for use in the deliverables are lawful, do not infringe the intellectual property rights of any third party, and comply with all applicable laws and regulations, including the Fair Trading Act 1986 (NZ) and the Privacy Act 2020 (NZ).`,
      `${client} shall provide timely feedback, approvals, and materials as reasonably required by ${company} for the performance of the services. ${client} acknowledges that delays in providing such items may result in corresponding delays to project timelines.`,
      `${client} shall designate an authorised representative to act as the primary point of contact and to make binding decisions on behalf of ${client} in relation to the services.`,
    ]),

    createHeading('Disclaimer', 3),

    createParagraph(
      `Except as expressly set out in this Agreement, all warranties, conditions, terms, representations, and undertakings, whether express or implied, statutory or otherwise, are excluded to the fullest extent permitted by law. Nothing in this clause excludes or limits any rights or remedies that ${client} may have under the Consumer Guarantees Act 1993 (NZ), to the extent that Act applies to the services provided under this Agreement.`
    ),
  ];
}
