import path from "node:path";
import { StorageAdapter } from "../adapter.js";
import { LocalGitDriver } from "./drivers/localGitDriver.js";

/**
 * Git-Native Storage Adapter for LegitBlock.
 * Implements the StorageAdapter contract using Git (Local, GitHub, GitLab, or Forgejo/Codeberg)
 * as the primary immutable storage and replication engine.
 */
export class GitStorageAdapter extends StorageAdapter {
  /**
   * @param {object} options
   * @param {import("./drivers/baseGitDriver.js").BaseGitDriver} options.driver - Git driver instance
   * @param {string} [options.ledgerDir=".legitblock"] - Directory within repo holding blockchain data
   * @param {string} [options.branch="main"] - Active ledger branch
   * @param {boolean} [options.syncGovernanceDocs=true] - Sync ratified documents to governance/ as markdown
   * @param {boolean} [options.autoTagBlocks=true] - Automatically create Git tags for sealed blocks
   */
  constructor({
    driver,
    ledgerDir = ".legitblock",
    branch = "main",
    syncGovernanceDocs = true,
    autoTagBlocks = true
  } = {}) {
    super(`git-${driver?.name || "local"}`);
    this.driver = driver || new LocalGitDriver();
    this.ledgerDir = ledgerDir.replace(/\/+$/, "");
    this.branch = branch;
    this.syncGovernanceDocs = syncGovernanceDocs;
    this.autoTagBlocks = autoTagBlocks;

    this.blockchainFile = `${this.ledgerDir}/blockchain.json`;
    this.proposalsFile = `${this.ledgerDir}/proposals.json`;
    this.blocksDir = `${this.ledgerDir}/blocks`;
    this.proposalsDir = `${this.ledgerDir}/proposals`;
    this.governanceDir = "governance";

    // In-memory cache for fast synchronous access
    this._cachedChain = null;
    this._cachedProposals = null;
  }

  /**
   * Check if storage has an initialized blockchain
   */
  async isInitialized() {
    try {
      const exists = await this.driver.fileExists(this.blockchainFile, this.branch);
      if (!exists) return false;
      const data = await this.loadBlockchain();
      return Boolean(data && Array.isArray(data.chain) && data.chain.length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Load blockchain data from Git repository
   */
  async loadBlockchain() {
    try {
      const raw = await this.driver.readFile(this.blockchainFile, this.branch);
      if (!raw) return null;
      const data = JSON.parse(raw);
      this._cachedChain = data;
      return data;
    } catch (err) {
      console.error(`GitStorageAdapter (${this.driver.name}): Failed to load blockchain:`, err.message);
      return null;
    }
  }

  /**
   * Synchronous cache getter for store compatibility
   */
  loadBlockchainSync() {
    return this._cachedChain;
  }

  /**
   * Save blockchain data to Git repository
   */
  async saveBlockchain(chainData, commitMessage = null) {
    if (!chainData) return;
    this._cachedChain = chainData;

    const height = chainData.chain ? chainData.chain.length : 0;
    const msg = commitMessage || `LegitBlock: Commit blockchain ledger state (height: ${height})`;

    const filesToWrite = [
      {
        path: this.blockchainFile,
        content: JSON.stringify(chainData, null, 2)
      }
    ];

    // Write individual block archive files for transparent Git history
    if (Array.isArray(chainData.chain)) {
      for (const block of chainData.chain) {
        if (block && block.index !== undefined) {
          const blockFileName = `${this.blocksDir}/${String(block.index).padStart(6, "0")}.json`;
          filesToWrite.push({
            path: blockFileName,
            content: JSON.stringify(block, null, 2)
          });
        }
      }
    }

    const latestBlock = Array.isArray(chainData.chain) && chainData.chain.length > 0
      ? chainData.chain[chainData.chain.length - 1]
      : null;

    // Sync human-readable markdown documents into governance/
    if (this.syncGovernanceDocs && Array.isArray(chainData.chain)) {
      const docMap = new Map();
      for (const b of chainData.chain) {
        if (b.type === "DOCUMENT_INSERT" && b.data?.document) {
          docMap.set(b.data.document.id, b.data.document);
        } else if (b.type === "DOCUMENT_AMEND" && b.data?.documentId) {
          const existing = docMap.get(b.data.documentId) || {};
          docMap.set(b.data.documentId, {
            ...existing,
            title: b.data.title || existing.title,
            version: b.data.version || existing.version,
            content: b.data.content || existing.content
          });
        }
      }

      for (const [id, doc] of docMap.entries()) {
        const cleanName = (doc.title || id).toLowerCase().replace(/[^a-z0-9]+/g, "-");
        filesToWrite.push({
          path: `${this.governanceDir}/${cleanName}.md`,
          content: `# ${doc.title || "Governance Document"}\n\n**Document ID**: \`${id}\`  \n**Version**: \`${doc.version || "1.0"}\`  \n\n---\n\n${doc.content || ""}\n`
        });
      }
    }

    if (typeof this.driver.writeFiles === "function") {
      await this.driver.writeFiles(filesToWrite, msg, this.branch);
    } else {
      for (const f of filesToWrite) {
        await this.driver.writeFile(f.path, f.content, msg, this.branch);
      }
    }

    // Auto-tag block
    if (this.autoTagBlocks && latestBlock && latestBlock.index !== undefined) {
      const tagName = `block-${String(latestBlock.index).padStart(6, "0")}`;
      try {
        await this.driver.createTag(tagName, `Sealed LegitBlock Block #${latestBlock.index}`, this.branch);
      } catch {
        // Tag may already exist
      }
    }
  }

  saveBlockchainSync(chainData) {
    this._cachedChain = chainData;
    this.saveBlockchain(chainData).catch(err => {
      console.error(`GitStorageAdapter (${this.driver.name}): Async save error:`, err.message);
    });
  }

  /**
   * Load voting engine proposals data
   */
  async loadProposals() {
    try {
      const raw = await this.driver.readFile(this.proposalsFile, this.branch);
      if (!raw) return null;
      const data = JSON.parse(raw);
      this._cachedProposals = data;
      return data;
    } catch (err) {
      console.error(`GitStorageAdapter (${this.driver.name}): Failed to load proposals:`, err.message);
      return null;
    }
  }

  loadProposalsSync() {
    return this._cachedProposals;
  }

  /**
   * Save voting engine proposals data
   */
  async saveProposals(proposalsData, commitMessage = null) {
    if (!proposalsData) return;
    this._cachedProposals = proposalsData;

    const count = Array.isArray(proposalsData)
      ? proposalsData.length
      : proposalsData.proposals ? Object.keys(proposalsData.proposals).length : 0;
    const msg = commitMessage || `LegitBlock: Commit governance proposals state (${count} proposals)`;

    const filesToWrite = [
      {
        path: this.proposalsFile,
        content: JSON.stringify(proposalsData, null, 2)
      }
    ];

    // Write individual proposal files in .legitblock/proposals/ for clear Git diffs
    const propList = Array.isArray(proposalsData)
      ? proposalsData
      : Object.values(proposalsData.proposals || {});

    for (const p of propList) {
      if (p && p.id) {
        filesToWrite.push({
          path: `${this.proposalsDir}/${p.id}.json`,
          content: JSON.stringify(p, null, 2)
        });
      }
    }

    if (typeof this.driver.writeFiles === "function") {
      await this.driver.writeFiles(filesToWrite, msg, this.branch);
    } else {
      for (const f of filesToWrite) {
        await this.driver.writeFile(f.path, f.content, msg, this.branch);
      }
    }
  }

  saveProposalsSync(proposalsData) {
    this._cachedProposals = proposalsData;
    this.saveProposals(proposalsData).catch(err => {
      console.error(`GitStorageAdapter (${this.driver.name}): Async save error:`, err.message);
    });
  }

  async clear() {
    this._cachedChain = null;
    this._cachedProposals = null;
    await this.driver.writeFile(this.blockchainFile, JSON.stringify({ chain: [] }, null, 2), "LegitBlock: Clear blockchain", this.branch);
    await this.driver.writeFile(this.proposalsFile, JSON.stringify({ proposals: {} }, null, 2), "LegitBlock: Clear proposals", this.branch);
  }

  /**
   * Lifecycle Integration: Propose a document amendment via Git Pull Request / Merge Request
   * @param {object} proposal - The Proposal object
   * @returns {Promise<{ branch: string, pr?: object }>}
   */
  async openGovernancePullRequest(proposal) {
    const branchName = `proposal/${proposal.id}`;

    // 1. Create proposal branch
    await this.driver.createBranch(branchName, this.branch);

    // 2. Commit proposal draft to branch if document content is attached
    if (proposal.documentData?.content) {
      const title = proposal.targetDocumentTitle || proposal.title;
      const cleanName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filePath = `${this.governanceDir}/${cleanName}.md`;
      const draftContent = `# ${title} (PROPOSAL)\n\n**Proposal ID**: \`${proposal.id}\`  \n**Status**: \`VOTING_ACTIVE\`  \n\n---\n\n${proposal.documentData.content}\n`;
      
      await this.driver.writeFile(filePath, draftContent, `LegitBlock: Proposal Draft ${proposal.id}`, branchName);
    }

    // 3. Open PR / MR
    const pr = await this.driver.createPullRequest({
      title: `[LegitBlock Proposal] ${proposal.title}`,
      body: `### LegitBlock Constitutional Governance Resolution\n\n- **Proposal ID**: \`${proposal.id}\`\n- **Proposer**: ${proposal.proposer?.name || "Unknown"}\n- **Voting Rule**: ${proposal.votingRule?.name || "Simple Majority"}\n- **Description**: ${proposal.description || "N/A"}\n\n*Review and vote on this resolution through the LegitBlock portal.*`,
      head: branchName,
      base: this.branch
    });

    return {
      branch: branchName,
      pr
    };
  }

  /**
   * Lifecycle Integration: Merge the ratified PR and seal the block
   * @param {string|number} prId - PR Number or MR IID
   * @param {object} proposal - Ratified proposal
   * @returns {Promise<{ merged: boolean }>}
   */
  async mergeRatifiedPullRequest(prId, proposal) {
    const message = `LegitBlock: Ratified resolution ${proposal.id} (${proposal.title}) passed constitutional vote`;
    const res = await this.driver.mergePullRequest(prId, { commitMessage: message });
    return res;
  }
}
