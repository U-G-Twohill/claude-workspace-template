# n8n Workflow Automation

## Data Collected
- Workflow execution data (input/output payloads for each node)
- Trigger data (webhook payloads, scheduled event data, polling results)
- API credentials stored for connected services
- Execution logs (timestamps, status, error messages)
- Workflow metadata (creation date, last modified, execution count)

## Storage Location
- **Self-hosted**: data remains on the host infrastructure under the operator's control (our servers or chosen cloud provider)
- **n8n Cloud**: hosted in the European Union (Germany, AWS eu-central-1)
- Credentials are encrypted at rest using AES-256 in both deployment modes
- Execution data stored in the configured database (SQLite default, PostgreSQL recommended for production)

## Third-Party Data Sharing
- Data flows to connected third-party services as configured in each workflow (e.g., if a workflow sends data to a CRM, that CRM receives the data)
- n8n itself does not share workflow data with third parties
- Self-hosted deployments have no data transmission to n8n GmbH (telemetry can be disabled)
- n8n Cloud transmits anonymised usage telemetry to n8n GmbH for product improvement (can be disabled on request)
- The operator is responsible for assessing data flows within each workflow configuration

## Data Retention
- **Self-hosted**: execution data retention is fully configurable — set via `EXECUTIONS_DATA_MAX_AGE` and `EXECUTIONS_DATA_PRUNE` environment variables
- **n8n Cloud**: execution logs retained based on plan tier (typically 7–30 days)
- Workflow definitions retained until explicitly deleted by the operator
- Stored credentials retained until explicitly deleted; encrypted at rest
- Pruned execution data is permanently deleted, not archived

## User Rights
- End users whose data passes through workflows may request disclosure of what data was processed by contacting the application operator
- The operator can export execution data and workflow definitions via the n8n API or UI
- Credential data cannot be exported in cleartext for security reasons — operators can verify which credentials exist
- Deletion requests are handled by the operator removing relevant execution data and workflow configurations

## Opt-Out
- End users may opt out of specific automated processes by contacting the application operator
- Self-hosted operators have full control over what data enters workflows
- Telemetry on self-hosted instances can be disabled via environment variable (`N8N_DIAGNOSTICS_ENABLED=false`)
- Individual workflow triggers can be deactivated without deleting the workflow

## Sub-Processor Details
- Provider: n8n GmbH
- Privacy Policy: https://n8n.io/legal/privacy
- DPA Available: Yes — available on request for n8n Cloud customers
- Data Location: EU (Germany) for n8n Cloud; operator-defined for self-hosted
- Certifications: Self-hosted option (full data sovereignty); n8n Cloud SOC 2 in progress
