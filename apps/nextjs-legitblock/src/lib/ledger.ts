import path from "node:path";
import {
  LegitBlockStore,
  LDAPAuthProvider,
  verifyUserToken,
  ALL_TEMPLATES,
  getTemplateById,
  getTemplateCategories,
  ProposalStatus
} from "@legitblock/legitblock-utils";

// Server singleton persistence instance
const dataDir = process.env.LEGITBLOCK_DATA_DIR || path.join(process.cwd(), "data", "legitblock");
let storeInstance: LegitBlockStore | null = null;
let authProviderInstance: LDAPAuthProvider | null = null;

export function getStore(): LegitBlockStore {
  if (!storeInstance) {
    storeInstance = new LegitBlockStore(dataDir);
  }
  storeInstance.syncIfModified();
  return storeInstance;
}

export function getBlockchain() {
  const store = getStore();
  return store.blockchain;
}

export function getVotingEngine() {
  const store = getStore();
  return store.votingEngine;
}

export function saveAll() {
  const s = getStore();
  s.saveBlockchain();
  s.saveVotingEngine();
}

export function getAuthProvider(): LDAPAuthProvider {
  if (!authProviderInstance) {
    authProviderInstance = new LDAPAuthProvider();
  }
  return authProviderInstance;
}

export function getUserFromRequest(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookie = req.headers.get("cookie");
      if (cookie) {
        const match = cookie.match(/legitblock_token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }
    if (!token) return null;
    return verifyUserToken(token);
  } catch {
    return null;
  }
}

export { ALL_TEMPLATES, getTemplateById, getTemplateCategories, ProposalStatus };
