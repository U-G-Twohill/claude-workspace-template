# Resend Email Service

## Data Collected
- Recipient email addresses
- Sender email addresses and domain information
- Email subject lines and body content (HTML and plain text)
- Email delivery metadata (timestamps, message IDs)
- Delivery status events (sent, delivered, bounced, complained)
- Open tracking data (pixel-based, if enabled)
- Click tracking data (link redirect, if enabled)
- API key identity and usage metadata

## Storage Location
- United States, hosted on Amazon Web Services (AWS) infrastructure
- Email content processed through AWS Simple Email Service (SES) infrastructure
- Delivery logs and analytics stored on Resend's US-based servers

## Third-Party Data Sharing
- Email content is transmitted to the recipient's mail server as required for delivery
- No email content or recipient data is sold or shared with third parties for marketing
- AWS SES processes email transmission as an infrastructure sub-processor
- Bounce and complaint data may be shared with mailbox providers as part of standard email delivery feedback loops
- Domain authentication records (SPF, DKIM, DMARC) are published via DNS as required for email deliverability

## Data Retention
- Email delivery logs (metadata, status events) retained for the duration of the account
- Email content (body/subject) retained for 30 days for debugging and delivery retry purposes
- Bounce and suppression list data retained for the account lifetime to prevent sending to invalid addresses
- Analytics data (open/click events) retained for the account lifetime
- All data deleted within 30 days of account closure

## User Rights
- End users (email recipients) may request the application operator stop sending emails to their address
- The application operator can remove recipients from mailing lists and suppress future sends
- Recipients may request disclosure of what data is held about them by contacting the application operator
- Resend provides suppression list management via API for operator-managed opt-outs
- Bounce-suppressed addresses can be reviewed and managed through the Resend dashboard or API

## Opt-Out
- Email recipients may unsubscribe via the unsubscribe link included in emails (operator responsibility to include)
- Recipients may mark emails as spam, which triggers automatic suppression via feedback loops
- Open and click tracking can be disabled by the application operator at the domain or API level
- Application operators may disable tracking globally to minimise recipient data collection

## Sub-Processor Details
- Provider: Resend, Inc.
- Privacy Policy: https://resend.com/legal/privacy-policy
- DPA Available: Yes — available on request via support
- Data Location: United States (AWS)
- Certifications: SOC 2 Type II (in progress)
