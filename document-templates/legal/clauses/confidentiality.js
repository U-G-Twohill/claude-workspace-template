import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function confidentiality(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Confidentiality', 2),

    createHeading('Mutual Obligation', 3),

    createParagraph(
      `Each party (the "Receiving Party") agrees to hold in strict confidence all Confidential Information disclosed by the other party (the "Disclosing Party") and shall not, without the prior written consent of the Disclosing Party, disclose such Confidential Information to any third party or use it for any purpose other than the performance of obligations under this Agreement.`
    ),

    createHeading('Definition of Confidential Information', 3),

    createParagraph(
      '"Confidential Information" means all information, whether written, oral, electronic, or visual, disclosed by one party to the other in connection with this Agreement that is marked as confidential or that a reasonable person would consider confidential given the nature of the information and the circumstances of disclosure. This includes, without limitation:'
    ),

    ...createBulletList([
      'Business plans, strategies, financial information, and pricing.',
      'Customer and client data, including personal information.',
      'Technical information, source code, algorithms, and system architecture.',
      'Trade secrets, proprietary processes, and know-how.',
      'The terms and conditions of this Agreement.',
    ]),

    createHeading('Exclusions', 3),

    createParagraph(
      'Confidential Information does not include information that:'
    ),

    ...createBulletList([
      'Is or becomes publicly available through no fault of the Receiving Party.',
      'Was already known to the Receiving Party prior to disclosure, as evidenced by written records.',
      'Is independently developed by the Receiving Party without reference to the Confidential Information.',
      'Is rightfully received from a third party without restriction on disclosure.',
      'Is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives the Disclosing Party prompt written notice (where legally permitted) and cooperates with any efforts to obtain protective treatment.',
    ]),

    createHeading('Obligations', 3),

    createParagraph(
      'The Receiving Party shall protect Confidential Information using at least the same degree of care it uses to protect its own confidential information, and in no event less than a reasonable degree of care. The Receiving Party shall limit access to Confidential Information to those employees, contractors, and advisors who have a need to know and who are bound by confidentiality obligations at least as protective as those contained herein.'
    ),

    createHeading('Survival', 3),

    createParagraph(
      'The obligations under this clause survive the expiration or termination of this Agreement for a period of two (2) years.'
    ),

    createHeading('Privacy Act 2020 (NZ)', 3),

    createParagraph(
      `Both parties acknowledge their obligations under the Privacy Act 2020 (NZ) in respect of any personal information received or handled in connection with this Agreement. Each party shall comply with the Information Privacy Principles set out in the Privacy Act 2020 and shall not do anything that would cause the other party to breach the Act.`
    ),
  ];
}
