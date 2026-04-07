import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function termination(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Termination', 2),

    createHeading('Termination for Convenience', 3),

    createParagraph(
      `Either party may terminate this Agreement by providing fourteen (14) days' written notice to the other party. Written notice may be given by email to the address specified in this Agreement or as otherwise notified in writing.`
    ),

    createHeading('Termination for Cause', 3),

    createParagraph(
      'Either party may terminate this Agreement immediately upon written notice if the other party:'
    ),

    ...createBulletList([
      'Commits a material breach of this Agreement and fails to remedy that breach within ten (10) business days of receiving written notice specifying the breach and requiring its remedy.',
      'Becomes insolvent, enters into liquidation, has a receiver or statutory manager appointed, or enters into any arrangement or composition with its creditors.',
      'Is unable to perform its obligations under this Agreement for a period exceeding thirty (30) consecutive days due to Force Majeure.',
    ]),

    createHeading('Consequences of Termination', 3),

    createParagraph(
      `Upon termination of this Agreement for any reason:`
    ),

    ...createBulletList([
      `${client} shall pay ${company} for all work satisfactorily completed and all expenses properly incurred up to and including the effective date of termination, calculated on a pro-rata basis where applicable.`,
      `${company} shall deliver to ${client} all completed and in-progress deliverables for which payment has been made, in their current state.`,
      'Each party shall return or destroy (at the Disclosing Party\'s election) all Confidential Information of the other party in its possession or control, and shall certify in writing that it has done so.',
      'All licences granted under this Agreement shall terminate, except for any perpetual licences expressly stated to survive termination.',
    ]),

    createHeading('Data Return and Deletion', 3),

    createParagraph(
      `In accordance with the Privacy Act 2020 (NZ), ${company} shall, upon termination, return or securely delete all personal information held on behalf of ${client}, unless retention is required by law or for the establishment, exercise, or defence of legal claims. ${company} shall confirm deletion in writing within twenty (20) business days of the effective date of termination.`
    ),

    createHeading('Survival', 3),

    createParagraph(
      'Termination of this Agreement shall not affect any rights, obligations, or liabilities of either party that have accrued prior to the date of termination. Clauses that by their nature are intended to survive termination (including, without limitation, Confidentiality, Limitation of Liability, Intellectual Property, Indemnity, and Dispute Resolution) shall continue in full force and effect.'
    ),
  ];
}
