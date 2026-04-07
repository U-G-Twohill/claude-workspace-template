// Data Processing Agreement document template
// NZ Privacy Act 2020 compliant, GDPR Article 28 if EU users

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { loadActiveIntegrationClauses, resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const hasEuUsers = options.hasEuUsers || flags.needs_gdpr || false;

  const sections = [];

  // 1. Parties
  sections.push(createHeading('Parties', 1));
  sections.push(createParagraph(
    `This Data Processing Agreement ("DPA") is entered into between:`
  ));
  sections.push(...createBulletList([
    `${clientName} ("Data Controller" or "Controller") — the party that determines the purposes and means of the processing of Personal Data.`,
    `${company} ("Data Processor" or "Processor") — the party that processes Personal Data on behalf of the Controller.`,
  ]));
  sections.push(createParagraph(
    'Each a "Party" and together the "Parties".'
  ));

  // 2. Definitions
  sections.push(createHeading('Definitions', 1));
  sections.push(createParagraph(
    'In this DPA, unless the context otherwise requires:'
  ));
  sections.push(...createBulletList([
    '"Personal Data" (or "Personal Information") means information about an identifiable individual, as defined in the Privacy Act 2020 (NZ)' + (hasEuUsers ? ' and Article 4(1) of the GDPR' : '') + '.',
    '"Processing" means any operation or set of operations performed on Personal Data, whether or not by automated means, including collection, recording, organisation, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure by transmission, dissemination, alignment, combination, restriction, erasure, or destruction.',
    '"Data Subject" means the identified or identifiable natural person to whom the Personal Data relates.',
    '"Sub-Processor" means any third party engaged by the Processor to process Personal Data on behalf of the Controller.',
    '"Data Breach" means a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to Personal Data transmitted, stored, or otherwise processed.',
    '"Applicable Data Protection Law" means the Privacy Act 2020 (NZ)' + (hasEuUsers ? ', the General Data Protection Regulation (EU) 2016/679 ("GDPR"), and any applicable national implementing legislation' : '') + ', as amended from time to time.',
  ]));

  // 3. Subject Matter and Duration
  sections.push(createHeading('Subject Matter and Duration', 1));
  sections.push(createParagraph(
    `This DPA sets out the terms on which the Processor will process Personal Data on behalf of the Controller in connection with the services provided for the ${projectName} project (the "Services"), as described in the main services agreement between the Parties (the "Principal Agreement").`
  ));
  sections.push(createParagraph(
    'This DPA shall remain in effect for the duration of the Principal Agreement and for so long as the Processor retains any Personal Data processed on behalf of the Controller. In the event of any conflict between this DPA and the Principal Agreement, this DPA shall prevail with respect to the processing of Personal Data.'
  ));

  // 4. Nature and Purpose of Processing
  sections.push(createHeading('Nature and Purpose of Processing', 1));
  sections.push(createParagraph(
    'The Processor processes Personal Data solely for the purpose of providing the Services to the Controller. The nature and purpose of processing activities include:'
  ));

  const processingPurposes = [
    'Hosting and operating the website or application on behalf of the Controller.',
  ];
  if (flags.needs_auth) {
    processingPurposes.push('User account creation, authentication, and session management.');
  }
  if (flags.needs_payments) {
    processingPurposes.push('Processing payment transactions and maintaining payment records.');
  }
  if (flags.needs_cms) {
    processingPurposes.push('Content management, including storage and delivery of user-generated content.');
  }
  if (flags.needs_email) {
    processingPurposes.push('Sending transactional and marketing communications on behalf of the Controller.');
  }
  if (flags.needs_analytics) {
    processingPurposes.push('Collecting and analysing usage data to improve the Services.');
  }
  processingPurposes.push(
    'Technical support and maintenance of the Services.',
    'Backup and disaster recovery.',
  );
  sections.push(...createBulletList(processingPurposes));

  // 5. Types of Personal Data
  sections.push(createHeading('Types of Personal Data', 1));
  sections.push(createParagraph(
    'The categories of Personal Data processed under this DPA include:'
  ));

  const dataTypes = [
    ['Usage Data', 'IP addresses, browser type, pages visited, session duration, referral source', 'All projects'],
  ];
  if (flags.needs_auth) {
    dataTypes.push(['Account Data', 'Name, email address, username, hashed password, profile information', 'Authentication module']);
  }
  if (flags.needs_payments) {
    dataTypes.push(['Payment Data', 'Billing name, billing address, payment card last four digits, transaction history (full card numbers are not stored by the Processor)', 'Payment module']);
  }
  if (flags.needs_cms) {
    dataTypes.push(['Content Data', 'User-submitted content, uploads, comments, and associated metadata', 'CMS module']);
  }
  if (flags.needs_email) {
    dataTypes.push(['Communication Data', 'Email addresses, message content, delivery and engagement records', 'Email module']);
  }
  dataTypes.push(['Technical Data', 'Device identifiers, cookies, log data, error reports', 'All projects']);

  sections.push(createTable(['Category', 'Data Elements', 'Source'], dataTypes));

  // 6. Categories of Data Subjects
  sections.push(createHeading('Categories of Data Subjects', 1));
  sections.push(createParagraph(
    'The Personal Data processed under this DPA relates to the following categories of Data Subjects:'
  ));
  sections.push(...createBulletList([
    'End users of the website or application.',
    'Customers who purchase goods or services through the website or application.',
    'Visitors who access the website or application without creating an account.',
    'Business contacts of the Controller whose information is managed through the Services.',
  ]));

  // 7. Obligations of the Processor
  sections.push(createHeading('Obligations of the Processor', 1));
  sections.push(createParagraph(
    'The Processor shall:'
  ));
  sections.push(...createBulletList([
    'Process Personal Data only on documented instructions from the Controller, including with respect to transfers of Personal Data outside New Zealand' + (hasEuUsers ? ' or the European Economic Area' : '') + ', unless required to do so by applicable law, in which case the Processor shall inform the Controller of that legal requirement before processing (unless prohibited by law from doing so).',
    'Ensure that all personnel authorised to process Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.',
    'Implement and maintain appropriate technical and organisational security measures as described in this DPA to protect Personal Data against unauthorised or unlawful processing and against accidental loss, destruction, or damage.',
    'Assist the Controller, taking into account the nature of the processing, by appropriate technical and organisational measures, insofar as this is possible, in fulfilling the Controller\'s obligation to respond to requests from Data Subjects exercising their rights under Applicable Data Protection Law.',
    'Assist the Controller in ensuring compliance with obligations relating to the security of processing, notification of Data Breaches, data protection impact assessments, and prior consultation with supervisory authorities, taking into account the nature of processing and the information available to the Processor.',
    'At the choice of the Controller, delete or return all Personal Data to the Controller after the end of the provision of Services, and delete existing copies unless Applicable Data Protection Law requires storage of the Personal Data.',
    'Make available to the Controller all information necessary to demonstrate compliance with the obligations laid down in this DPA and allow for and contribute to audits, including inspections, conducted by the Controller or an auditor mandated by the Controller.',
    'Immediately inform the Controller if, in the Processor\'s opinion, an instruction from the Controller infringes Applicable Data Protection Law.',
  ]));

  // 8. Sub-Processors
  sections.push(createHeading('Sub-Processors', 1));
  sections.push(createParagraph(
    'The Controller provides general written authorisation for the Processor to engage Sub-Processors for the processing of Personal Data, subject to the following conditions:'
  ));
  sections.push(...createBulletList([
    'The Processor shall inform the Controller of any intended changes concerning the addition or replacement of Sub-Processors, giving the Controller the opportunity to object to such changes within fourteen (14) days of notification.',
    'The Processor shall impose on each Sub-Processor, by way of a written contract, data protection obligations no less protective than those set out in this DPA.',
    'The Processor shall remain fully liable to the Controller for the performance of each Sub-Processor\'s obligations.',
  ]));

  // Integration clause injection — list active integrations as sub-processors
  const integrationClauses = loadActiveIntegrationClauses(docsState.integrationClauses || {});
  if (integrationClauses.length > 0) {
    sections.push(createHeading('Current Sub-Processors', 2));
    sections.push(createParagraph(
      'The following Sub-Processors are currently authorised by the Controller:'
    ));

    const subProcessorRows = integrationClauses.map(({ name, clause }) => {
      if (clause) {
        return [
          clause.name || name,
          clause.data_collected || 'See integration documentation',
          clause.storage_location || 'See provider documentation',
          clause.sub_processor_details || 'See provider DPA',
          clause.certifications || 'N/A',
        ];
      }
      return [name, 'See integration documentation', 'See provider documentation', 'See provider DPA', 'N/A'];
    });

    sections.push(createTable(
      ['Sub-Processor', 'Data Processed', 'Data Location', 'DPA / Privacy Policy', 'Certifications'],
      subProcessorRows
    ));
  } else {
    sections.push(createHeading('Current Sub-Processors', 2));
    sections.push(createParagraph(
      'No Sub-Processors are currently engaged. The Processor shall notify the Controller before engaging any Sub-Processor and update this schedule accordingly.'
    ));
  }

  // 9. Security Measures
  sections.push(createHeading('Security Measures', 1));
  sections.push(createParagraph(
    'The Processor shall implement and maintain, at a minimum, the following technical and organisational measures to ensure a level of security appropriate to the risk of processing:'
  ));

  sections.push(createHeading('Technical Measures', 2));
  sections.push(...createBulletList([
    'Encryption of Personal Data in transit using TLS 1.2 or higher.',
    'Encryption of Personal Data at rest using AES-256 or equivalent.',
    'Secure authentication mechanisms, including multi-factor authentication for administrative access.',
    'Role-based access controls, ensuring personnel access only the Personal Data necessary for their role.',
    'Regular automated backups with encryption and tested restoration procedures.',
    'Intrusion detection, firewall protection, and regular vulnerability scanning.',
    'Secure software development practices, including dependency auditing and code review.',
    'Logging and monitoring of access to systems containing Personal Data.',
  ]));

  sections.push(createHeading('Organisational Measures', 2));
  sections.push(...createBulletList([
    'Confidentiality obligations for all personnel with access to Personal Data.',
    'Regular data protection training for personnel involved in the processing of Personal Data.',
    'Documented information security policies and procedures.',
    'Incident response and Data Breach management procedures.',
    'Regular review and testing of the effectiveness of security measures.',
    'Secure disposal of hardware and media containing Personal Data.',
  ]));

  // 10. Data Breach Notification
  sections.push(createHeading('Data Breach Notification', 1));
  sections.push(createParagraph(
    'The Processor shall notify the Controller without undue delay, and in any event within twenty-four (24) hours, after becoming aware of a Data Breach affecting Personal Data processed under this DPA.'
  ));
  sections.push(createParagraph(
    'The notification shall include, to the extent reasonably available:'
  ));
  sections.push(...createBulletList([
    'A description of the nature of the Data Breach, including the categories and approximate number of Data Subjects concerned, and the categories and approximate number of Personal Data records concerned.',
    'The name and contact details of the Processor\'s data protection contact point.',
    'A description of the likely consequences of the Data Breach.',
    'A description of the measures taken or proposed to be taken to address the Data Breach, including measures to mitigate its possible adverse effects.',
    'Where it is not possible to provide all information at the same time, the Processor shall provide the information in phases without undue further delay.',
  ]));
  sections.push(createParagraph(
    'The Processor shall cooperate with the Controller and take such reasonable steps as are directed by the Controller to assist in the investigation, mitigation, and remediation of each Data Breach. The Processor shall not notify any third party of a Data Breach without the prior written consent of the Controller, unless required to do so by law.'
  ));

  // 11. Data Subject Rights
  sections.push(createHeading('Data Subject Rights', 1));
  sections.push(createParagraph(
    'The Processor shall assist the Controller in responding to requests from Data Subjects to exercise their rights under Applicable Data Protection Law, including but not limited to:'
  ));
  sections.push(...createBulletList([
    'The right to access Personal Data held about them.',
    'The right to correction of inaccurate or incomplete Personal Data.',
    'The right to deletion of Personal Data where there is no lawful basis for continued processing.',
    ...(hasEuUsers ? [
      'The right to restriction of processing (GDPR Article 18).',
      'The right to data portability in a structured, commonly used, and machine-readable format (GDPR Article 20).',
      'The right to object to processing based on legitimate interests (GDPR Article 21).',
    ] : []),
  ]));
  sections.push(createParagraph(
    'The Processor shall promptly inform the Controller of any request received directly from a Data Subject and shall not respond to such request without the Controller\'s prior written authorisation, unless legally required to do so.'
  ));

  // 12. International Transfers
  sections.push(createHeading('International Transfers', 1));
  sections.push(createParagraph(
    'The Processor shall not transfer Personal Data to a country outside New Zealand' + (hasEuUsers ? ' or the European Economic Area' : '') + ' unless adequate safeguards are in place, including:'
  ));
  sections.push(...createBulletList([
    'The receiving country provides an adequate level of data protection as recognised by the New Zealand Privacy Commissioner' + (hasEuUsers ? ' or the European Commission' : '') + '.',
    ...(hasEuUsers ? [
      'Standard Contractual Clauses (SCCs) as adopted by the European Commission under Article 46(2)(c) of the GDPR are in place.',
    ] : []),
    'The transfer is necessary for the performance of the Services and appropriate contractual protections are in place with the data recipient.',
    'The Controller has provided prior written consent to the transfer.',
  ]));
  sections.push(createParagraph(
    'The Processor shall maintain a record of all international transfers of Personal Data and make this available to the Controller upon request.'
  ));

  // 13. Audit Rights
  sections.push(createHeading('Audit Rights', 1));
  sections.push(createParagraph(
    'The Controller (or its authorised representative) may audit the Processor\'s compliance with this DPA. The Processor shall make available all information necessary to demonstrate compliance and shall cooperate with such audits, subject to the following conditions:'
  ));
  sections.push(...createBulletList([
    'The Controller shall provide at least thirty (30) days\' prior written notice of any audit.',
    'Audits shall be conducted during normal business hours and shall not unreasonably interfere with the Processor\'s business operations.',
    'The Controller shall bear the costs of any audit unless the audit reveals a material breach of this DPA by the Processor.',
    'The Controller and its auditors shall comply with the Processor\'s reasonable security and confidentiality requirements.',
    'Audits shall be limited to once per twelve (12) month period unless a Data Breach has occurred or the Controller has reasonable grounds to suspect non-compliance.',
  ]));

  // 14. Termination and Data Return
  sections.push(createHeading('Termination and Data Return', 1));
  sections.push(createParagraph(
    'Upon termination or expiry of the Principal Agreement, or upon the Controller\'s written request at any time, the Processor shall:'
  ));
  sections.push(...createBulletList([
    'Cease all processing of Personal Data on behalf of the Controller.',
    'At the Controller\'s election, either return all Personal Data to the Controller in a structured, commonly used, and machine-readable format, or securely delete all Personal Data (including all copies, backups, and archives) within thirty (30) days.',
    'Provide the Controller with written certification that all Personal Data has been returned or securely deleted, as applicable.',
    'Where applicable law requires the Processor to retain any Personal Data, the Processor shall inform the Controller of such requirement, ensure the confidentiality of the retained data, and cease all further processing except as required by law.',
  ]));

  // 15. Liability
  sections.push(createHeading('Liability', 1));
  sections.push(createParagraph(
    'The liability of each Party under or in connection with this DPA shall be subject to the limitations and exclusions of liability set out in the Principal Agreement.'
  ));
  sections.push(createParagraph(
    'Nothing in this DPA shall limit either Party\'s liability for:'
  ));
  sections.push(...createBulletList([
    'Fraud or fraudulent misrepresentation.',
    'Death or personal injury caused by negligence.',
    'Any liability that cannot be excluded or limited under Applicable Data Protection Law.',
  ]));

  // 16. Governing Law
  sections.push(createHeading('Governing Law', 1));
  sections.push(createParagraph(
    'This DPA shall be governed by and construed in accordance with the laws of New Zealand. The parties submit to the non-exclusive jurisdiction of the courts of New Zealand for the resolution of any disputes arising under or in connection with this DPA.'
  ));
  if (hasEuUsers) {
    sections.push(createParagraph(
      'To the extent that the GDPR applies to the processing of Personal Data under this DPA, the Processor commits to comply with the requirements of the GDPR as they relate to the processing of Personal Data of Data Subjects located in the European Economic Area. In the event of any conflict between this DPA and the GDPR, the GDPR shall prevail with respect to the processing of Personal Data of EU Data Subjects.'
    ));
  }

  // 17. Signatures
  sections.push(createHeading('Signatures', 1));
  sections.push(createParagraph(
    'By signing below, the Parties agree to the terms of this Data Processing Agreement.'
  ));
  sections.push(...createSignatureBlock([
    { role: 'Data Controller', name: clientName },
    { role: 'Data Processor', name: company },
  ]));

  return createDocument({
    title: 'Data Processing Agreement',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
