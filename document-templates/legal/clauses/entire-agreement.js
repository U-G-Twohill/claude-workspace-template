import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function entireAgreement(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Entire Agreement and Severability', 2),

    createHeading('Entire Agreement', 3),

    createParagraph(
      `This Agreement, together with any schedules, appendices, statements of work, and change requests incorporated by reference, constitutes the entire agreement between ${company} and ${client} with respect to the subject matter hereof. It supersedes all prior negotiations, representations, proposals, understandings, and agreements, whether written or oral, relating to such subject matter.`
    ),

    createParagraph(
      `Each party acknowledges that it has not entered into this Agreement in reliance on, and shall have no remedy in respect of, any representation, warranty, or undertaking (whether negligently or innocently made) that is not expressly set out in this Agreement. Nothing in this clause shall limit liability for fraud or fraudulent misrepresentation.`
    ),

    createHeading('Severability', 3),

    createParagraph(
      'If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be severed from this Agreement and the remaining provisions shall continue in full force and effect. The parties shall negotiate in good faith to replace any severed provision with a valid and enforceable provision that achieves, to the greatest extent possible, the economic, business, and other purposes of the severed provision.'
    ),

    createHeading('Headings', 3),

    createParagraph(
      'The headings in this Agreement are inserted for convenience of reference only and shall not affect the construction or interpretation of this Agreement.'
    ),

    createHeading('Governing Law', 3),

    createParagraph(
      'This Agreement shall be governed by and construed in accordance with the laws of New Zealand. The parties submit to the non-exclusive jurisdiction of the courts of New Zealand.'
    ),

    createHeading('Waiver', 3),

    createParagraph(
      'No failure or delay by either party in exercising any right, power, or remedy under this Agreement shall operate as a waiver of that right, power, or remedy, nor shall any single or partial exercise of any such right, power, or remedy preclude any other or further exercise of it, or the exercise of any other right, power, or remedy. Any waiver must be in writing and signed by the party granting the waiver.'
    ),

    createHeading('Assignment', 3),

    createParagraph(
      `Neither party may assign, transfer, or novate any of its rights or obligations under this Agreement without the prior written consent of the other party, such consent not to be unreasonably withheld. Notwithstanding the foregoing, ${company} may subcontract the performance of any part of the services, provided that ${company} remains fully responsible for the acts and omissions of any subcontractor.`
    ),
  ];
}
