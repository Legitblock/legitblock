import { getBillamaClient } from './billama';

/**
 * OpenSnowcat Telemetry & Behavioral Analytics Pipeline for LegitBlock.
 * Tracks corporate governance funnels, legal incorporation kit e-commerce conversions,
 * blockchain state transition latency, and cryptographic document notarization SLAs.
 */

export async function trackPageView(title?: string, pageUrl?: string) {
  try {
    const client = getBillamaClient();
    return await client.snowcat.trackPageView({
      pageTitle: title || 'LegitBlock Corporate Governance & Legal Formation',
      pageUrl,
      orgId: 'org_legitblock_governance',
    });
  } catch {
    return false;
  }
}

export async function trackMarketing(params: {
  action: string;
  category?: string;
  label?: string;
  property?: string;
  value?: number;
  utmSource?: string;
  utmCampaign?: string;
  properties?: Record<string, any>;
}) {
  try {
    const client = getBillamaClient();
    return await client.snowcat.trackMarketing({
      ...params,
      orgId: 'org_legitblock_governance',
    });
  } catch {
    return false;
  }
}

export async function trackLegalShopAddToCart(params: {
  title: string;
  sku?: string;
  price: number;
  category?: string;
}) {
  return await trackMarketing({
    action: 'add_to_cart',
    category: 'legal_ecommerce',
    label: params.title,
    property: params.sku,
    value: params.price,
    properties: {
      category: params.category,
    },
  });
}

export async function trackLegalShopCheckout(params: {
  orderId: string;
  totalUsd: number;
  paymentRail?: string;
  customerEmail?: string;
  items: Array<{
    title: string;
    sku?: string;
    unitPriceUsd: number;
    quantity: number;
    category?: string;
  }>;
}) {
  try {
    const client = getBillamaClient();
    return await client.snowcat.trackEcommerce({
      orderId: params.orderId,
      orderNumber: params.orderId,
      totalUsd: params.totalUsd,
      paymentRail: params.paymentRail || 'CARD',
      userId: params.customerEmail,
      orgId: 'org_legitblock_governance',
      items: params.items.map((i) => ({
        name: i.title,
        sku: i.sku || i.title,
        price: i.unitPriceUsd,
        quantity: i.quantity,
        category: i.category || 'Corporate Formation & Legal Kits',
      })),
    });
  } catch {
    return false;
  }
}

export async function trackBlockchainTransition(params: {
  action: string;
  blockHeight: number;
  latencyMs: number;
  error?: boolean;
}) {
  try {
    const client = getBillamaClient();
    return await client.snowcat.trackEngineering({
      metricName: 'governance_ledger_block_commit',
      value: params.latencyMs,
      unit: 'ms',
      component: 'legitblock_ledger_engine',
      orgId: 'org_legitblock_governance',
      error: params.error,
      tags: { action: params.action, blockHeight: String(params.blockHeight) },
    });
  } catch {
    return false;
  }
}
