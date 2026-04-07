import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function amendments(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Amendments', 2),

    createParagraph(
      `No amendment, variation, or modification of this Agreement shall be valid or binding unless it is made in writing and signed by authorised representatives of both ${company} and ${client}.`
    ),

    createHeading('Minor Changes', 3),

    createParagraph(
      'Notwithstanding the above, minor administrative changes (such as updates to contact details, nominated representatives, or scheduling adjustments that do not affect scope, fees, or deliverables) may be agreed by email between the parties\' authorised representatives. Such email agreements shall be deemed valid amendments to this Agreement for the purposes of the matters they address.'
    ),

    createHeading('Material Changes', 3),

    createParagraph(
      `Material changes to this Agreement, including but not limited to changes to scope, fees, deliverables, timelines, or any terms that affect the rights or obligations of either party, require a formal change request. The change request shall describe the proposed change, the reason for the change, and any impact on fees, timelines, or deliverables. No material change shall take effect until it has been agreed in writing by both parties.`
    ),

    createParagraph(
      `${company} shall maintain a record of all agreed amendments and change requests, and shall make such records available to ${client} upon reasonable request.`
    ),
  ];
}
