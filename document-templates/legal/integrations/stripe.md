# Stripe Payment Processing

## Data Collected
- Payment card details (tokenized via Stripe.js/Elements — raw card numbers never touch our servers)
- Billing name and address
- Email address associated with payment
- Transaction history (amounts, dates, currency, status)
- IP address and device fingerprint (for fraud detection)
- Bank account details (if using direct debit payment methods)

## Storage Location
- Stripe, Inc. servers in the United States
- Card data is stored in PCI DSS Level 1 compliant infrastructure
- Tokenised card references are stored in our application database; actual card numbers are held exclusively by Stripe

## Third-Party Data Sharing
- Card network operators (Visa, Mastercard, Amex) receive transaction data as required for payment authorisation and settlement
- Fraud prevention and risk assessment services integrated within Stripe (Stripe Radar)
- Financial institutions involved in payment processing (issuing and acquiring banks)
- Regulatory and law enforcement bodies where required by applicable law
- No data is sold to third parties for marketing purposes

## Data Retention
- Transaction records retained for 7 years to comply with financial reporting and tax obligations (NZ Tax Administration Act, IRD requirements)
- Payment method tokens retained while the customer account is active
- Tokens deleted within 90 days of account closure or upon customer request (subject to legal retention requirements)
- Stripe retains data in accordance with their own retention schedule and applicable financial regulations

## User Rights
- Users may request a full export of their payment history via our support contact
- Users may request deletion of stored payment methods at any time through their account settings or by contacting support
- Users may update billing address and email through their account or by request
- Transaction records required for legal/tax compliance cannot be deleted before the retention period expires, but can be anonymised upon request where permitted

## Opt-Out
- Users may remove stored payment methods at any time, reverting to manual card entry per transaction
- Users cannot opt out of transaction record collection for completed payments (required for financial compliance)
- Users may choose alternative payment methods where available to limit data shared with specific card networks

## Sub-Processor Details
- Provider: Stripe, Inc.
- Privacy Policy: https://stripe.com/privacy
- DPA Available: Yes — https://stripe.com/legal/dpa
- Data Location: United States
- Certifications: PCI DSS Level 1, SOC 1 Type II, SOC 2 Type II, ISO 27001
