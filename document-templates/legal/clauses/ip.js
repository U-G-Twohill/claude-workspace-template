import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function ip(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Intellectual Property', 2),

    createHeading('Ownership of Deliverables', 3),

    createParagraph(
      `Upon receipt of full and final payment of all fees due under this Agreement, ${company} assigns to ${client} all intellectual property rights in the final deliverables specifically created for ${client} under this Agreement. Until full payment is received, all intellectual property rights in the deliverables remain with ${company}.`
    ),

    createHeading('Pre-existing Intellectual Property', 3),

    createParagraph(
      `${company} retains all rights, title, and interest in its pre-existing intellectual property, including but not limited to:`
    ),

    ...createBulletList([
      'Proprietary tools, libraries, frameworks, and development methodologies.',
      'Code templates, boilerplate code, and reusable software components.',
      'Design patterns, wireframe templates, and UI component libraries.',
      'Internal processes, workflows, and know-how developed independently of this Agreement.',
    ]),

    createHeading('Licence for Embedded IP', 3),

    createParagraph(
      `Where any pre-existing intellectual property of ${company} is incorporated into or necessary for the use of the deliverables, ${company} grants ${client} a non-exclusive, perpetual, irrevocable, royalty-free licence to use, reproduce, and modify such pre-existing IP solely as part of and in connection with the deliverables. This licence does not extend to standalone use or redistribution of ${company}'s pre-existing IP independently of the deliverables.`
    ),

    createHeading('Portfolio Rights', 3),

    createParagraph(
      `${company} retains the right to display and reference the deliverables and the work performed under this Agreement in its portfolio, case studies, marketing materials, and award submissions. ${client} may opt out of this provision by providing written notice to ${company} prior to commencement of the project or at any time thereafter, in which case ${company} shall remove any such references within a reasonable timeframe.`
    ),

    createHeading('Open-Source Software', 3),

    createParagraph(
      `The deliverables may incorporate open-source software components. Any such components remain subject to their respective open-source licences, and nothing in this Agreement shall be construed as granting any rights to ${client} inconsistent with those licences. ${company} shall, upon request, provide ${client} with a list of all open-source components included in the deliverables and their applicable licences.`
    ),
  ];
}
