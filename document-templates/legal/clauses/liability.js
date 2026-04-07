import { createHeading, createParagraph, createBulletList } from '../../_shared/generator.js';

export function liability(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';

  return [
    createHeading('Limitation of Liability', 2),

    createParagraph(
      `To the maximum extent permitted by law, the total aggregate liability of ${company} arising out of or in connection with this Agreement, whether in contract, tort (including negligence), equity, statute, or otherwise, shall not exceed the total fees actually paid by ${client} to ${company} under this Agreement in the twelve (12) months immediately preceding the event giving rise to the claim.`
    ),

    createParagraph(
      `Neither party shall be liable to the other for any consequential, indirect, incidental, special, exemplary, or punitive damages, including but not limited to loss of revenue, loss of profits, loss of business, loss of anticipated savings, loss of data, loss of goodwill, or wasted management or office time, however caused and regardless of the theory of liability, even if the party has been advised of the possibility of such damages.`
    ),

    createHeading('Carve-outs', 3),

    createParagraph(
      'Nothing in this clause shall limit or exclude liability for:'
    ),

    ...createBulletList([
      'Death or personal injury caused by negligence.',
      'Fraud or fraudulent misrepresentation.',
      'Wilful misconduct or gross negligence.',
      'Any liability that cannot be lawfully excluded or limited under New Zealand law.',
    ]),

    createHeading('Consumer Guarantees Act 1993 (NZ)', 3),

    createParagraph(
      `Where the Consumer Guarantees Act 1993 applies to any goods or services supplied under this Agreement, nothing in this clause limits or excludes any rights or remedies available to ${client} under that Act. Where ${client} is acquiring the services for the purposes of a business, the parties agree that the Consumer Guarantees Act 1993 does not apply to the supply of goods or services under this Agreement, to the extent permitted by section 43(2) of that Act.`
    ),

    createParagraph(
      `Each party acknowledges that the limitations set out in this clause are reasonable having regard to the nature of the services, the fees payable, and the allocation of risk between the parties.`
    ),
  ];
}
