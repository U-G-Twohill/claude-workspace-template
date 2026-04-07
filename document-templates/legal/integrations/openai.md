# OpenAI API

## Data Collected
- User inputs and prompts submitted to the API
- Generated responses (completions, chat messages, embeddings)
- API usage metadata (token counts, model used, request timestamps)
- API key identity (organisation and project association)

## Storage Location
- OpenAI servers in the United States
- Data processed on OpenAI's infrastructure, which includes Microsoft Azure data centres
- No option to select a specific region for API data processing

## Third-Party Data Sharing
- API data submitted through the API is **not used for model training** (policy effective since March 2023 for API usage)
- Data may be shared with OpenAI's infrastructure sub-processors (Microsoft Azure) for compute
- OpenAI may disclose data to comply with legal obligations or law enforcement requests
- No data is sold to third parties
- Data submitted via ChatGPT consumer product (not API) has different terms — this clause covers API usage only

## Data Retention
- API inputs and outputs are retained for **30 days** for abuse and misuse monitoring
- After 30 days, API data is deleted and is not used for any purpose
- Zero-retention can be requested for eligible enterprise agreements
- Usage metadata (token counts, billing data) retained for the duration of the account plus any legally required period
- Abuse monitoring retention cannot be opted out of on standard API plans

## User Rights
- Users may request disclosure of data associated with their API account by contacting OpenAI's privacy team (privacy@openai.com)
- Users may request deletion of their API account and associated data
- Application operators are responsible for informing their end users that data is processed via OpenAI and for handling end-user rights requests
- End users should direct data access/deletion requests to the application operator, who coordinates with OpenAI where necessary

## Opt-Out
- Application operators may choose not to send personal data to the API by anonymising or pseudonymising inputs before submission
- Operators can implement prompt filtering to strip personally identifiable information before API calls
- End users may opt out of AI-powered features at the application level (operator responsibility to provide this option)
- There is no opt-out for the 30-day abuse monitoring retention on standard API plans

## Sub-Processor Details
- Provider: OpenAI, L.L.C.
- Privacy Policy: https://openai.com/privacy
- DPA Available: Yes — https://openai.com/policies/data-processing-addendum
- Data Location: United States
- Certifications: SOC 2 Type II
