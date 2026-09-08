import fs from "node:fs";
import path from "node:path";
import { Block } from "./block.js";
import { hashObject } from "./crypto.js";

/**
 * Organizational Blockchain class managing the immutable ledger
 * of an organization: documents, amendments, votes, and membership.
 */
export class Blockchain {
  /**
   * @param {object} [options={}]
   * @param {object} [options.organization={}] - Organization metadata
   * @param {number} [options.difficulty=1] - Consensus mining difficulty
   * @param {Block[]} [options.chain=[]] - Existing chain if loading
   */
  constructor({ organization = {}, difficulty = 1, chain = [] } = {}) {
    this.organization = organization;
    this.difficulty = difficulty;
    this.chain = chain.length > 0 ? chain.map(b => (b instanceof Block ? b : Block.fromJSON(b))) : [];
  }

  /**
   * Initialize organization with a Genesis Block
   * @param {object} params
   * @param {string} params.orgName - Name of the organization
   * @param {string} params.orgType - Business type (e.g. "c_corp", "worker_coop")
   * @param {string} [params.jurisdiction="Delaware"]
   * @param {Array<object>} [params.foundingMembers=[]] - Initial founding members
   * @param {Array<object>} [params.initialDocuments=[]] - Founding documents included at genesis
   * @param {object} [params.governanceRules={}]
   * @param {string} [params.validator="genesis-founder"]
   * @returns {Block} The created genesis block
   */
  initializeGenesis({
    orgName,
    orgType,
    jurisdiction = "Delaware",
    foundingMembers = [],
    initialDocuments = [],
    governanceRules = {},
    validator = "genesis-founder"
  }) {
    if (this.chain.length > 0) {
      throw new Error("Blockchain already initialized with a genesis block");
    }

    this.organization = {
      id: "org-" + Date.now(),
      name: orgName,
      type: orgType,
      jurisdiction,
      createdAt: new Date().toISOString(),
      governanceRules,
      foundingMembers: foundingMembers.map(m => ({
        id: m.id || m.username || m.dn,
        name: m.name || m.username,
        email: m.email,
        role: m.role || "Founding Member",
        votingWeight: m.votingWeight || 1,
        addedAt: new Date().toISOString()
      }))
    };

    const genesisPayload = {
      message: "LegitBlock Genesis: " + orgName + " (" + orgType + ")",
      organization: this.organization,
      foundingMembers: this.organization.foundingMembers,
      initialDocumentsSummary: initialDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        version: doc.version || "1.0",
        hash: doc.hash || hashObject(doc.content)
      }))
    };

    const genesisBlock = new Block({
      index: 0,
      timestamp: new Date().toISOString(),
      previousHash: "0".repeat(64),
      type: "GENESIS",
      data: genesisPayload,
      validator
    });

    if (this.difficulty > 0) {
      genesisBlock.mineBlock(this.difficulty);
    }

    this.chain.push(genesisBlock);

    // If initial documents are provided, record each document insertion block
    for (const doc of initialDocuments) {
      this.recordDocumentInsert({
        document: doc,
        proposalId: "genesis-proposal",
        validator,
        notes: "Initial founding document ratified at genesis"
      });
    }

    return genesisBlock;
  }

  /**
   * Get the most recent block in the chain
   * @returns {Block|null}
   */
  getLatestBlock() {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1] : null;
  }

  /**
   * Add a generic validated block to the chain
   * @param {string} type - Block type
   * @param {any} data - Payload
   * @param {string} [validator="system"]
   * @returns {Block}
   */
  addBlock(type, data, validator = "system") {
    const latestBlock = this.getLatestBlock();
    if (!latestBlock) {
      throw new Error("Cannot add block to uninitialized chain: initialize genesis first");
    }

    const newBlock = new Block({
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      previousHash: latestBlock.hash,
      type,
      data,
      validator
    });

    if (this.difficulty > 0) {
      newBlock.mineBlock(this.difficulty);
    }

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Record ratifying and inserting a new document
   * @param {object} params
   * @param {object} params.document - Document object
   * @param {string} [params.proposalId] - Ratifying proposal ID
   * @param {string} [params.validator="system"]
   * @param {string} [params.notes=""]
   * @returns {Block}
   */
  recordDocumentInsert({ document, proposalId = null, validator = "system", notes = "" }) {
    const payload = {
      action: "INSERT",
      proposalId,
      documentId: document.id,
      title: document.title,
      category: document.category,
      version: document.version || "1.0",
      content: document.content,
      contentHash: document.hash || hashObject(document.content),
      effectiveDate: document.effectiveDate || new Date().toISOString(),
      status: "active",
      notes
    };
    return this.addBlock("DOCUMENT_INSERT", payload, validator);
  }

  /**
   * Record ratifying an amendment to an existing document
   * @param {object} params
   * @param {string} params.documentId - Document ID being amended
   * @param {string} params.newContent - Updated document content
   * @param {string} params.newVersion - New version string (e.g. "1.1")
   * @param {string} [params.diff=""] - Unified diff string
   * @param {string} [params.proposalId] - Ratifying proposal ID
   * @param {string} [params.validator="system"]
   * @param {string} [params.notes=""]
   * @returns {Block}
   */
  recordDocumentAmendment({
    documentId,
    title,
    newContent,
    newVersion,
    diff = "",
    proposalId = null,
    validator = "system",
    notes = ""
  }) {
    const payload = {
      action: "AMEND",
      proposalId,
      documentId,
      title,
      version: newVersion,
      content: newContent,
      contentHash: hashObject(newContent),
      diff,
      effectiveDate: new Date().toISOString(),
      status: "active",
      notes
    };
    return this.addBlock("DOCUMENT_AMEND", payload, validator);
  }

  /**
   * Record a vote tally / proposal execution
   * @param {object} proposal - The executed Proposal object
   * @param {string} [validator="system"]
   * @returns {Block}
   */
  recordVoteExecution(proposal, validator = "system") {
    const payload = {
      action: "VOTE_EXECUTE",
      proposalId: proposal.id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description,
      proposer: proposal.proposer,
      votingRule: proposal.votingRule,
      totalVotes: proposal.tally.total,
      approveVotes: proposal.tally.approve,
      rejectVotes: proposal.tally.reject,
      abstainVotes: proposal.tally.abstain,
      result: proposal.status,
      quorumMet: proposal.tally.quorumMet,
      thresholdMet: proposal.tally.thresholdMet,
      votesSummary: Object.values(proposal.votes || {}).map(v => ({
        voterId: v.voterId,
        voterName: v.voterName,
        decision: v.decision,
        timestamp: v.timestamp
      })),
      executedAt: new Date().toISOString()
    };
    return this.addBlock("VOTE_TALLY", payload, validator);
  }

  /**
   * Record adding or modifying a member
   * @param {object} member
   * @param {string} [validator="system"]
   * @returns {Block}
   */
  recordMemberUpdate(member, action = "ADD", validator = "system") {
    const payload = {
      action,
      member: {
        id: member.id || member.username,
        name: member.name,
        email: member.email,
        role: member.role,
        votingWeight: member.votingWeight || 1
      },
      updatedAt: new Date().toISOString()
    };
    return this.addBlock("MEMBER_UPDATE", payload, validator);
  }

  /**
   * Validate the complete cryptographic integrity of the blockchain
   * @returns {{ valid: boolean, error?: string, brokenBlockIndex?: number }}
   */
  isChainValid() {
    if (this.chain.length === 0) {
      return { valid: true };
    }

    // Validate Genesis block
    const genesis = this.chain[0];
    if (genesis.index !== 0 || !genesis.isValid()) {
      return {
        valid: false,
        error: "Genesis block is invalid or corrupted",
        brokenBlockIndex: 0
      };
    }

    // Validate subsequent blocks
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.index !== i) {
        return {
          valid: false,
          error: "Block index mismatch at #" + i + " (expected " + i + ", found " + currentBlock.index + ")",
          brokenBlockIndex: i
        };
      }

      if (!currentBlock.isValid()) {
        return {
          valid: false,
          error: "Block #" + i + " hash is invalid (contents have been tampered with)",
          brokenBlockIndex: i
        };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          error: "Block #" + i + " previousHash does not match Block #" + (i - 1) + " hash",
          brokenBlockIndex: i
        };
      }
    }

    return { valid: true };
  }

  /**
   * Replay the blockchain state to construct the current state of all active documents
   * @returns {Array<object>} Current active documents
   */
  getAllDocuments() {
    const docsMap = new Map();

    for (const block of this.chain) {
      if (block.type === "DOCUMENT_INSERT") {
        const d = block.data;
        docsMap.set(d.documentId, {
          id: d.documentId,
          title: d.title,
          category: d.category,
          version: d.version,
          content: d.content,
          contentHash: d.contentHash,
          effectiveDate: d.effectiveDate,
          status: d.status,
          initialBlockIndex: block.index,
          latestBlockIndex: block.index,
          historyCount: 1
        });
      } else if (block.type === "DOCUMENT_AMEND") {
        const d = block.data;
        const existing = docsMap.get(d.documentId) || {};
        docsMap.set(d.documentId, {
          ...existing,
          id: d.documentId,
          title: d.title || existing.title,
          version: d.version,
          content: d.content,
          contentHash: d.contentHash,
          effectiveDate: d.effectiveDate,
          status: d.status,
          latestBlockIndex: block.index,
          historyCount: (existing.historyCount || 0) + 1
        });
      }
    }

    return Array.from(docsMap.values());
  }

  /**
   * Replay document modification history from the chain for a specific document ID
   * @param {string} documentId
   * @returns {Array<object>} History events with block indices, diffs, timestamps
   */
  getDocumentHistory(documentId) {
    const history = [];

    for (const block of this.chain) {
      if (
        (block.type === "DOCUMENT_INSERT" || block.type === "DOCUMENT_AMEND") &&
        block.data.documentId === documentId
      ) {
        history.push({
          blockIndex: block.index,
          blockHash: block.hash,
          timestamp: block.timestamp,
          action: block.data.action,
          version: block.data.version,
          proposalId: block.data.proposalId,
          diff: block.data.diff || null,
          contentHash: block.data.contentHash,
          content: block.data.content,
          validator: block.validator,
          notes: block.data.notes
        });
      }
    }

    return history;
  }

  /**
   * Replay membership list from genesis and member update blocks
   * @returns {Array<object>}
   */
  getMembers() {
    const membersMap = new Map();

    if (this.organization && Array.isArray(this.organization.foundingMembers)) {
      for (const m of this.organization.foundingMembers) {
        membersMap.set(m.id, { ...m, status: "active" });
      }
    }

    for (const block of this.chain) {
      if (block.type === "MEMBER_UPDATE") {
        const { action, member } = block.data;
        if (action === "REMOVE") {
          membersMap.delete(member.id);
        } else {
          membersMap.set(member.id, { ...member, status: "active" });
        }
      }
    }

    return Array.from(membersMap.values());
  }

  /**
   * Serialize entire blockchain to JSON object
   * @returns {object}
   */
  toJSON() {
    return {
      organization: this.organization,
      difficulty: this.difficulty,
      chain: this.chain.map(b => b.toJSON())
    };
  }

  /**
   * Save blockchain state to a JSON file
   * @param {string} filepath
   */
  saveToFile(filepath) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, JSON.stringify(this.toJSON(), null, 2), "utf8");
  }

  /**
   * Load blockchain from JSON object
   * @param {object} json
   * @returns {Blockchain}
   */
  static fromJSON(json) {
    return new Blockchain({
      organization: json.organization || {},
      difficulty: json.difficulty ?? 1,
      chain: (json.chain || []).map(b => Block.fromJSON(b))
    });
  }

  /**
   * Load blockchain from a JSON file
   * @param {string} filepath
   * @returns {Blockchain}
   */
  static loadFromFile(filepath) {
    if (!fs.existsSync(filepath)) {
      throw new Error("Blockchain file not found: " + filepath);
    }
    const raw = fs.readFileSync(filepath, "utf8");
    return Blockchain.fromJSON(JSON.parse(raw));
  }
}
