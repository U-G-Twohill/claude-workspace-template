import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function forceMajeure(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Force Majeure', 2),

    createParagraph(
      `Neither party shall be liable for any failure to perform, or delay in performing, any of its obligations under this Agreement if and to the extent that such failure or delay results from events, circumstances, or causes beyond the reasonable control of the affected party ("Force Majeure Event").`
    ),

    createHeading('Force Majeure Events', 3),

    createParagraph(
      'Force Majeure Events include, without limitation:'
    ),

    ...createBulletList([
      'Natural disasters, including earthquakes, floods, volcanic eruptions, tsunamis, storms, or other severe weather events.',
      'Epidemics, pandemics, or public health emergencies.',
      'Acts of government, including legislative or regulatory changes, sanctions, embargoes, quarantines, or restrictions on movement.',
      'War, armed conflict, terrorism, civil unrest, or insurrection.',
      'Failure or disruption of essential infrastructure, including telecommunications networks, internet services, power supply, or cloud computing services, where such failure is not attributable to the affected party.',
      'Industrial action, strikes, or lockouts (other than those involving the affected party\'s own employees).',
      'Cyberattacks, including distributed denial-of-service attacks, ransomware, or other malicious interference with computer systems, where the affected party has maintained reasonable security measures.',
    ]),

    createHeading('Notice Requirement', 3),

    createParagraph(
      `The party affected by a Force Majeure Event shall notify the other party in writing within five (5) business days of becoming aware of the event, providing details of the nature of the event, its expected duration, and the obligations affected. The affected party shall use reasonable endeavours to mitigate the effects of the Force Majeure Event and to resume performance of its obligations as soon as reasonably practicable.`
    ),

    createHeading('Extended Force Majeure', 3),

    createParagraph(
      `If a Force Majeure Event continues for a period exceeding thirty (30) consecutive days, either party may terminate this Agreement by providing written notice to the other party. In such circumstances, ${client} shall pay ${company} for all work satisfactorily completed prior to the Force Majeure Event, and neither party shall have any further liability to the other in respect of obligations not yet performed, except as otherwise provided in clauses that survive termination.`
    ),
  ];
}
