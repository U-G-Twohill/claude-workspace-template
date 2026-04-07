import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function dispute(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Dispute Resolution', 2),

    createParagraph(
      `The parties agree to use their best endeavours to resolve any dispute, controversy, or claim arising out of or in connection with this Agreement (including any question regarding its existence, validity, or termination) through the following procedure before commencing any court proceedings.`
    ),

    createHeading('Good-Faith Negotiation', 3),

    createParagraph(
      `In the first instance, the parties shall attempt to resolve the dispute through good-faith negotiation. Either party may initiate this process by providing written notice to the other party, setting out the nature of the dispute and the resolution sought. The parties shall use reasonable endeavours to resolve the dispute within fourteen (14) days of such notice.`
    ),

    createHeading('Mediation', 3),

    createParagraph(
      `If the dispute is not resolved through negotiation within the period specified above, either party may refer the dispute to mediation administered by the Arbitrators' and Mediators' Institute of New Zealand Inc. (AMINZ) in accordance with the AMINZ Mediation Protocol. The mediation shall take place in New Zealand at a location agreed by the parties, or failing agreement, as determined by the mediator. The costs of the mediation shall be borne equally by the parties unless the mediator determines otherwise.`
    ),

    createHeading('Arbitration or Court Proceedings', 3),

    createParagraph(
      `If the dispute is not resolved through mediation within thirty (30) days of the appointment of the mediator (or such longer period as agreed by the parties), either party may refer the dispute to arbitration under the Arbitration Act 1996 (NZ) or commence proceedings in the courts of New Zealand. Nothing in this clause prevents either party from seeking urgent interim or interlocutory relief from a court of competent jurisdiction at any time.`
    ),

    createHeading('Governing Law and Jurisdiction', 3),

    createParagraph(
      `This Agreement shall be governed by and construed in accordance with the laws of New Zealand. Subject to the dispute resolution procedure set out above, the parties submit to the non-exclusive jurisdiction of the courts of New Zealand for the resolution of any disputes arising under or in connection with this Agreement.`
    ),

    createHeading('Continuation of Obligations', 3),

    createParagraph(
      `Pending resolution of any dispute, the parties shall continue to perform their respective obligations under this Agreement in good faith, except to the extent that such obligations are the subject of the dispute.`
    ),
  ];
}
