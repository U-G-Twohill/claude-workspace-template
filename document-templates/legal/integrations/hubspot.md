# HubSpot CRM

## Data Collected
- Contact information (name, email, phone, company, job title, address)
- Company/organisation records and associated metadata
- Deal/opportunity data (pipeline stage, value, close date, owner)
- Form submission data (all fields submitted via HubSpot forms)
- Website activity tracking (page views, session duration, referral source — via HubSpot tracking code)
- Email engagement data (opens, clicks, replies, bounces for emails sent through HubSpot)
- Meeting booking data (calendar integration, availability, meeting notes)
- Live chat and chatbot conversation transcripts
- Support ticket data (if Service Hub is used)
- Marketing campaign interaction data (ad clicks, social interactions)

## Storage Location
- **US data centre**: Amazon Web Services, US East (us-east-1, Virginia) — default
- **EU data centre**: Amazon Web Services, EU West (eu-west-1, Ireland) — available on request for EU data residency
- Data centre selection is made at account creation and determines where primary data is stored
- CDN and edge caching may process data in additional regions for performance

## Third-Party Data Sharing
- Infrastructure sub-processors (AWS, Google Cloud Platform) for hosting and compute
- Connected integrations receive data as configured by the account operator (e.g., Salesforce sync, Slack notifications)
- HubSpot does not sell contact data to third parties
- Anonymised and aggregated data may be used for HubSpot's benchmarking and product improvement
- Third-party enrichment services may be used if the operator enables data enrichment features (Clearbit, now HubSpot-owned)
- Email delivery sub-processors handle outbound email transmission

## Data Retention
- Contact and company records retained for the lifetime of the HubSpot account or until explicitly deleted
- Deleted contacts are soft-deleted for 90 days (recoverable), then permanently purged
- Email tracking data retained for the account lifetime
- Website analytics data retained for the account lifetime
- Audit logs retained for 90 days (activity logs) or 1 year (security logs)
- Data exports available at any time via HubSpot's export tools or API
- Upon account closure, all data is deleted within 90 days

## User Rights
- Contacts may request access to their stored data by contacting the application operator
- Contacts may request correction of inaccurate personal data
- Contacts may request deletion — operators can delete individual contact records, which removes associated activity data
- HubSpot provides a GDPR deletion tool that processes delete requests and confirms completion
- Contacts may request data portability — operators can export individual contact records via API or CSV
- The application operator is the data controller; HubSpot acts as a data processor

## Opt-Out
- Email recipients may unsubscribe via the unsubscribe link (required in all marketing emails)
- Contacts may opt out of tracking by blocking the HubSpot tracking cookie or using browser privacy settings
- HubSpot provides a cookie consent banner (configurable by the operator) for website tracking opt-in/opt-out
- Operators can configure subscription types so contacts can choose which communications they receive
- The "Do Not Contact" flag can be set on any contact record to suppress all outbound communication
- Contacts may request removal from all marketing lists while retaining their CRM record

## Sub-Processor Details
- Provider: HubSpot, Inc.
- Privacy Policy: https://legal.hubspot.com/privacy-policy
- DPA Available: Yes — https://legal.hubspot.com/dpa
- Data Location: US (us-east-1) or EU (eu-west-1), selectable at account creation
- Certifications: SOC 2 Type II, SOC 3, ISO 27001, ISO 27017, ISO 27018
