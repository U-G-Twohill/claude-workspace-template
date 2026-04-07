# Supabase (Database & Authentication)

## Data Collected
- User account data (email, display name, profile information)
- Authentication tokens and session data
- OAuth provider tokens (where social login is enabled)
- Application data stored in project database tables
- Auth audit logs (sign-in timestamps, IP addresses, user agent strings)
- Row-level security policy evaluations

## Storage Location
- Hosted on Amazon Web Services (AWS) infrastructure
- Region configurable per project — default is US, can be set to ap-southeast-2 (Sydney, Australia) for APAC/NZ compliance
- Database backups stored in the same AWS region as the primary instance
- Authentication data co-located with the project database

## Third-Party Data Sharing
- No application data is shared with third parties by default
- OAuth flows exchange tokens with the selected identity provider (Google, GitHub, etc.) only when social login is configured
- Supabase staff access is limited to infrastructure operations and requires explicit support ticket authorisation
- No data is sold or shared for advertising purposes

## Data Retention
- Application data retained for the lifetime of the project or until explicitly deleted by the application owner
- Authentication audit logs retained for 90 days by default
- Database backups retained for 7 days (Pro plan) or 30 days (Enterprise)
- Deleted project data is purged from backups within the backup retention window
- Account data deleted within 30 days of project deletion

## User Rights
- Users may request export of all personal data stored in the application database via the application owner
- Users may request account deletion, which removes their auth record and triggers cascade policies defined by the application
- Users may update their profile information and email through the application interface or auth API
- Application owners can provide data portability exports via Supabase's SQL access or API

## Opt-Out
- Users may delete their account to remove authentication data
- Users may choose not to use social login providers, limiting OAuth data exchange
- Application-specific data collection opt-outs are managed at the application level, not by Supabase directly
- Users may request the application owner restrict processing of their data under applicable privacy law

## Sub-Processor Details
- Provider: Supabase, Inc.
- Privacy Policy: https://supabase.com/privacy
- DPA Available: Yes — https://supabase.com/legal/dpa
- Data Location: AWS (configurable region; ap-southeast-2 available for NZ/AU)
- Certifications: SOC 2 Type II, HIPAA (Enterprise plan)
