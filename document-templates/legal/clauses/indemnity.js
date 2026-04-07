import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function indemnity(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Indemnity', 2),

    createHeading('Client Indemnity', 3),

    createParagraph(
      `${client} shall indemnify, defend, and hold harmless ${company}, its directors, officers, employees, and contractors from and against any and all claims, demands, actions, losses, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with:`
    ),

    ...createBulletList([
      `Any content, materials, data, or instructions provided by ${client} to ${company} for use in the deliverables, including any claim that such content infringes the intellectual property rights of a third party or violates any applicable law.`,
      `${client}'s use of the deliverables in a manner not authorised by this Agreement or in breach of applicable law.`,
      `Any breach by ${client} of its representations, warranties, or obligations under this Agreement.`,
    ]),

    createHeading('Provider Indemnity', 3),

    createParagraph(
      `${company} shall indemnify, defend, and hold harmless ${client}, its directors, officers, and employees from and against any and all claims, demands, actions, losses, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with any claim that the deliverables created by ${company} under this Agreement (excluding any client-provided content) infringe the intellectual property rights of any third party, provided that:`
    ),

    ...createBulletList([
      `${client} promptly notifies ${company} in writing of any such claim.`,
      `${company} is given sole control of the defence and settlement of the claim (provided that ${company} shall not settle any claim in a manner that imposes obligations on ${client} without ${client}'s prior written consent).`,
      `${client} provides reasonable cooperation and assistance to ${company} in the defence of the claim, at ${company}'s expense.`,
    ]),

    createHeading('Remedial Action', 3),

    createParagraph(
      `If any deliverable becomes, or in ${company}'s reasonable opinion is likely to become, the subject of an intellectual property infringement claim, ${company} may at its own expense and option: (a) procure for ${client} the right to continue using the deliverable; (b) modify the deliverable to make it non-infringing while maintaining substantially equivalent functionality; or (c) replace the deliverable with a non-infringing alternative of substantially equivalent functionality.`
    ),

    createHeading('Indemnity Procedure', 3),

    createParagraph(
      'The indemnification obligations in this clause are subject to the following procedure:'
    ),

    ...createBulletList([
      'The indemnified party shall provide prompt written notice of any claim to the indemnifying party, provided that failure to give timely notice shall not relieve the indemnifying party of its obligations except to the extent it is materially prejudiced by such failure.',
      'The indemnifying party shall have the right to assume control of the defence of the claim, including the selection of legal counsel.',
      'The indemnified party shall cooperate fully with the indemnifying party in the defence of the claim and shall not settle or compromise any claim without the indemnifying party\'s prior written consent.',
      'The indemnifying party shall keep the indemnified party reasonably informed of the progress and status of the claim.',
    ]),
  ];
}
