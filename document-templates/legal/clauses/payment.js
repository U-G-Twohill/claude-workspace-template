import { createHeading, createParagraph, createBulletList, createTable } from '../../_shared/generator.js';

export function payment(params = {}) {
  const company = params.companyName || 'ICU Media Design';
  const client = params.clientName || '[CLIENT NAME]';
  const paymentDays = params.paymentDays || 14;
  const currency = params.currency || 'NZD';
  const gstRegistered = params.gstRegistered !== undefined ? params.gstRegistered : true;
  const milestones = params.milestones || null;

  const sections = [
    createHeading('Payment Terms', 2),

    createHeading('Fees and Invoicing', 3),

    createParagraph(
      `${client} shall pay ${company} the fees set out in this Agreement in ${currency}. ${company} shall issue invoices in accordance with the payment schedule below. All invoices are due and payable within ${paymentDays} days of the date of invoice.`
    ),
  ];

  if (milestones && milestones.length > 0) {
    sections.push(
      createHeading('Payment Schedule', 3),

      createParagraph(
        'Payment is structured on a milestone basis as follows:'
      ),

      createTable(
        ['Milestone', 'Description', 'Amount'],
        milestones.map(m => [m.name || '', m.description || '', m.amount || '']),
      ),
    );
  } else {
    sections.push(
      createHeading('Payment Schedule', 3),

      createParagraph(
        'The payment schedule and fees shall be as set out in the accompanying proposal, statement of work, or schedule. Where no schedule is provided, fees shall be invoiced monthly in arrears for time and materials engagements, or upon completion for fixed-fee engagements.'
      ),
    );
  }

  sections.push(
    createHeading('Late Payment', 3),

    createParagraph(
      `If any invoice remains unpaid after the due date, ${company} reserves the right to charge interest on the outstanding amount at a rate of 1.5% per month (or the maximum rate permitted by law, whichever is lower), calculated from the due date until the date of payment in full. ${company} may also suspend the provision of services until all overdue amounts are paid, without prejudice to any other rights or remedies available under this Agreement or at law.`
    ),

    createParagraph(
      `${client} shall reimburse ${company} for all reasonable costs and expenses incurred in recovering overdue amounts, including debt collection fees and legal costs.`
    ),
  );

  if (gstRegistered) {
    sections.push(
      createHeading('Goods and Services Tax (GST)', 3),

      createParagraph(
        `All fees quoted under this Agreement are exclusive of Goods and Services Tax (GST) unless expressly stated otherwise. GST will be added to all invoices at the prevailing rate in accordance with the Goods and Services Tax Act 1985 (NZ). ${company} will provide valid GST tax invoices for all amounts charged.`
      ),
    );
  } else {
    sections.push(
      createHeading('Tax', 3),

      createParagraph(
        `All fees quoted under this Agreement are exclusive of any applicable taxes. Any taxes, duties, or levies imposed on the services shall be the responsibility of ${client} and will be added to invoices where applicable.`
      ),
    );
  }

  sections.push(
    createHeading('Scope Changes', 3),

    createParagraph(
      `Any work requested by ${client} that falls outside the scope defined in this Agreement shall require a formal change request. ${company} shall provide a written estimate for any additional work, and the additional work shall not commence until ${client} has approved the estimate in writing. Approved change requests shall be deemed amendments to this Agreement.`
    ),
  );

  return sections;
}
