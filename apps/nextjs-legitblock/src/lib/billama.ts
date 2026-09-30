import { BillamaClient } from '@billama/sdk';

let cachedClient: BillamaClient | null = null;

export function getBillamaClient(): BillamaClient {
  if (!cachedClient) {
    cachedClient = new BillamaClient({
      apiKey: process.env.BILLAMA_API_KEY || 'bk_live_legitblock_governance_grid',
      baseUrl: process.env.BILLAMA_BASE_URL || 'https://api.billama.net',
      organizationId: process.env.BILLAMA_ORG_ID || 'org_legitblock_governance',
      grid: {
        strategy: 'balanced',
        minVramGb: 16,
      },
    });
  }
  return cachedClient;
}

/**
 * Authenticates shareholders and board members against FreeIPA LDAP directory (ou=legitblock).
 */
export async function loginWithFreeIpaLdap(params: {
  username: string;
  password: string;
}) {
  const client = getBillamaClient();
  return await client.auth.loginWithLdap({
    username: params.username,
    password: params.password,
    tenant: 'legitblock',
  });
}

/**
 * Retrieves a presigned S3 upload URL for scanned incorporation documents, SEC filings,
 * bylaws, and notarized PDF documents in SeaweedFS.
 */
export async function getDocumentUploadUrl(
  filename: string,
  contentType: string = 'application/pdf'
): Promise<{ uploadUrl: string; key: string; downloadUrl: string }> {
  const client = getBillamaClient();
  const bucket = process.env.S3_BUCKET || 'legitblock-blobs';
  const timestamp = Date.now();
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `filings/${timestamp}-${cleanName}`;

  const presigned = await client.storage.getPresignedUploadUrl({
    bucket,
    key,
    contentType,
    expiresInSeconds: 3600,
  });

  return {
    uploadUrl: presigned.uploadUrl,
    key,
    downloadUrl: `${process.env.S3_PUBLIC_URL || 'https://s3.billama.net'}/${bucket}/${key}`,
  };
}

/**
 * Retrieves a presigned download URL for a stored document from SeaweedFS.
 */
export async function getDocumentDownloadUrl(key: string): Promise<string> {
  const client = getBillamaClient();
  const bucket = process.env.S3_BUCKET || 'legitblock-blobs';
  const presigned = await client.storage.getPresignedDownloadUrl({
    bucket,
    key,
    expiresInSeconds: 7200,
  });
  return presigned.downloadUrl;
}

/**
 * Checks entitlement for corporate governance actions, proposal voting, and ledger block mining.
 */
export async function checkGovernanceEntitlement(orgId: string, featureKey: string = 'governance_ledger') {
  const client = getBillamaClient();
  return await client.billing.checkEntitlement({
    featureKey,
    orgId,
  });
}

/**
 * Records metered usage for corporate blockchain state transitions and proposal votes,
 * dispatching latency metrics and SLA telemetry to OpenSnowcat.
 */
export async function recordGovernanceActionUsage(params: {
  orgId: string;
  actionType: 'BLOCK_MINE' | 'PROPOSAL_CREATE' | 'VOTE_CAST' | 'DOCUMENT_ANCHOR';
  blockHeight?: number;
}) {
  const start = Date.now();
  const client = getBillamaClient();
  let error = false;
  try {
    const res = await client.billing.recordUsage({
      appId: 'legitblock',
      featureKey: `governance_${params.actionType.toLowerCase()}`,
      quantity: 1,
      customerId: params.orgId,
      orgId: params.orgId,
    });
    return res;
  } catch (err) {
    error = true;
    throw err;
  } finally {
    const latencyMs = Date.now() - start;
    try {
      await client.snowcat.trackEngineering({
        metricName: 'governance_ledger_block_commit',
        value: latencyMs,
        unit: 'ms',
        component: 'legitblock_ledger_engine',
        orgId: params.orgId,
        error,
        tags: {
          action: params.actionType,
          blockHeight: String(params.blockHeight || 0),
        },
      });
    } catch {
      // Never fail core billing for telemetry
    }
  }
}

