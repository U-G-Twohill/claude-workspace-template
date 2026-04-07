import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function dataProtection(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';
  const includeGdpr = params.includeGdpr || false;

  const sections = [
    createHeading('Data Protection', 2),

    createHeading('Privacy Act 2020 (NZ)', 3),

    createParagraph(
      `Both parties shall comply with the Privacy Act 2020 (NZ) and the Information Privacy Principles ("IPPs") contained therein in respect of all personal information collected, used, stored, or disclosed in connection with this Agreement. Where ${company} processes personal information on behalf of ${client}, ${company} acts as an agent of ${client} for the purposes of the Privacy Act 2020 and shall process such information only in accordance with ${client}'s lawful instructions.`
    ),

    createHeading('Data Protection Principles', 3),

    createParagraph(
      'The parties agree to observe the following principles in relation to any personal information processed under this Agreement:'
    ),

    ...createBulletList([
      'Data minimisation: Only personal information that is necessary for the specified purpose shall be collected and processed.',
      'Purpose limitation: Personal information shall be collected and used only for the purposes directly related to the services under this Agreement, and shall not be used for any unrelated purpose without the consent of the data subject.',
      'Storage limitation: Personal information shall be retained only for as long as is necessary for the purposes for which it was collected, or as required by law. Upon expiry of the retention period, personal information shall be securely destroyed or anonymised.',
      'Accuracy: Reasonable steps shall be taken to ensure personal information is accurate, complete, and up to date.',
      'Security: Appropriate technical and organisational measures shall be implemented to protect personal information against unauthorised access, loss, alteration, or destruction.',
    ]),

    createHeading('Data Breach Notification', 3),

    createParagraph(
      `In the event of a privacy breach (as defined in the Privacy Act 2020) involving personal information processed under this Agreement, ${company} shall notify ${client} as soon as practicable after becoming aware of the breach. The notification shall include the nature of the breach, the categories and approximate number of individuals affected, the likely consequences, and the measures taken or proposed to address the breach.`
    ),

    createParagraph(
      `Where a breach is a "notifiable privacy breach" within the meaning of Part 6A of the Privacy Act 2020, ${company} shall cooperate with ${client} in notifying the Privacy Commissioner and affected individuals as required by law.`
    ),
  ];

  if (includeGdpr) {
    sections.push(
      createHeading('General Data Protection Regulation (EU/UK GDPR)', 3),

      createParagraph(
        `Where the services involve the processing of personal data of individuals located in the European Union or United Kingdom, the parties acknowledge that the General Data Protection Regulation (EU) 2016/679 ("GDPR") and/or the UK GDPR (as retained under the Data Protection Act 2018) may apply. In such circumstances, the following additional obligations apply:`
      ),

      ...createBulletList([
        `${company} shall process personal data only on the documented instructions of ${client}, including with regard to transfers of personal data to a third country or international organisation.`,
        `${company} shall ensure that persons authorised to process personal data have committed to confidentiality or are under an appropriate statutory obligation of confidentiality.`,
        `${company} shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, in accordance with Article 32 of the GDPR.`,
        `${company} shall notify ${client} without undue delay, and in any event within seventy-two (72) hours, after becoming aware of a personal data breach.`,
        `${company} shall assist ${client} in ensuring compliance with its obligations under Articles 32 to 36 of the GDPR, taking into account the nature of processing and the information available.`,
        `Upon termination of the services, ${company} shall, at ${client}'s election, delete or return all personal data and delete existing copies unless EU or Member State law requires retention.`,
      ]),
    );
  }

  sections.push(
    createHeading('Sub-processors', 3),

    createParagraph(
      `${company} shall not engage any sub-processor to process personal information on behalf of ${client} without the prior written consent of ${client}. Where consent is given, ${company} shall ensure that any sub-processor is bound by data protection obligations no less protective than those set out in this clause. ${company} shall remain fully liable to ${client} for the acts and omissions of any sub-processor.`
    ),
  );

  return sections;
}
