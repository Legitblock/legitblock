import { sha256, stringifyCanonical } from "../blockchain/crypto.js";

/**
 * Hash a leaf node with domain separator 0x00 to prevent second preimage attacks
 * @param {object|string} leafData 
 * @returns {string} Hex-encoded SHA-256
 */
export function hashLeaf(leafData) {
  const content = typeof leafData === "string" ? leafData : stringifyCanonical(leafData);
  return sha256("00" + sha256(content));
}

/**
 * Hash two child nodes with domain separator 0x01
 * @param {string} leftHash 
 * @param {string} rightHash 
 * @returns {string} Hex-encoded SHA-256
 */
export function hashBranch(leftHash, rightHash) {
  return sha256("01" + leftHash + rightHash);
}

/**
 * Hierarchical Merkle Tree for Organizational & Legal Documents
 * Allows cryptographic verification of individual clauses without disclosing the full document.
 */
export class MerkleLegalTree {
  /**
   * @param {Array<{ id: string, title?: string, content: string }>} clauses
   */
  constructor(clauses = []) {
    this.clauses = clauses.map((c, idx) => ({
      id: c.id || `clause-${idx + 1}`,
      title: c.title || "",
      content: (c.content || "").trim()
    }));

    this.leaves = this.clauses.map(c => hashLeaf({ id: c.id, content: c.content }));
    this.layers = [];
    this.rootHash = "";
    this.buildTree();
  }

  /**
   * Build binary Merkle layers up to the root
   */
  buildTree() {
    if (this.leaves.length === 0) {
      this.rootHash = sha256("");
      this.layers = [[]];
      return;
    }

    this.layers = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        // If odd number of nodes, pair the last node with itself
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        nextLayer.push(hashBranch(left, right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    this.rootHash = currentLayer[0];
  }

  /**
   * Get the Merkle root hash
   * @returns {string}
   */
  getRootHash() {
    return this.rootHash;
  }

  /**
   * Get all registered clauses with their leaf hashes
   * @returns {Array<{ id: string, title: string, content: string, hash: string }>}
   */
  getClauses() {
    return this.clauses.map((c, idx) => ({
      ...c,
      hash: this.leaves[idx]
    }));
  }

  /**
   * Find index of a clause by ID or path
   * @param {string} clauseId
   * @returns {number}
   */
  findClauseIndex(clauseId) {
    return this.clauses.findIndex(c => c.id.toLowerCase() === clauseId.toLowerCase());
  }

  /**
   * Generate an audit path (proof) for a clause
   * @param {string|number} clauseIdentifier - Clause ID string or zero-based index
   * @returns {{ clause: object, leafHash: string, proof: Array<{ position: 'left'|'right', hash: string }>, rootHash: string }}
   */
  getProof(clauseIdentifier) {
    const index = typeof clauseIdentifier === "number" 
      ? clauseIdentifier 
      : this.findClauseIndex(clauseIdentifier);

    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Clause not found in Merkle tree: ${clauseIdentifier}`);
    }

    const proof = [];
    let currentIndex = index;

    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const layer = this.layers[layerIndex];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < layer.length) {
        proof.push({
          position: isRightNode ? "left" : "right",
          hash: layer[siblingIndex]
        });
      } else {
        // Paired with self
        proof.push({
          position: "right",
          hash: layer[currentIndex]
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      clause: this.clauses[index],
      leafHash: this.leaves[index],
      proof,
      rootHash: this.rootHash
    };
  }

  /**
   * Pure static verification function: Verify that a clause is included in a Merkle root
   * @param {object|string} clause - Clause object { id, content } or raw string
   * @param {Array<{ position: 'left'|'right', hash: string }>} proof - Audit path
   * @param {string} expectedRootHash - Expected Merkle root hash
   * @returns {boolean} True if inclusion proof matches root
   */
  static verifyProof(clause, proof, expectedRootHash) {
    if (!clause || !Array.isArray(proof) || !expectedRootHash) {
      return false;
    }

    let currentHash = hashLeaf(clause);

    for (const step of proof) {
      if (step.position === "left") {
        currentHash = hashBranch(step.hash, currentHash);
      } else if (step.position === "right") {
        currentHash = hashBranch(currentHash, step.hash);
      } else {
        return false;
      }
    }

    return currentHash.toLowerCase() === expectedRootHash.toLowerCase();
  }

  /**
   * Parse Markdown or legal document text into structured clauses
   * Supports Markdown headings (#, ##, ###), Article / Section roman & decimal numbering
   * @param {string} text - Document content
   * @returns {MerkleLegalTree}
   */
  static fromMarkdown(text) {
    const lines = text.split("\n");
    const clauses = [];
    let currentClause = null;
    let fallbackIndex = 1;

    // Pattern for Markdown headers or legal headers (e.g. "ARTICLE I", "Section 2.1", "1.1")
    const headerRegex = /^(?:#{1,4}\s+|ARTICLE\s+[IVXLCDM\d]+|SECTION\s+[\d\.]+|CLAUSE\s+[\d\.]+)(.*)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (headerRegex.test(trimmed)) {
        if (currentClause) {
          clauses.push(currentClause);
        }
        const cleanTitle = trimmed.replace(/^#{1,4}\s*/, "");
        const id = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `clause-${fallbackIndex++}`;

        currentClause = {
          id,
          title: cleanTitle,
          content: trimmed
        };
      } else {
        if (!currentClause) {
          currentClause = {
            id: `preamble-${fallbackIndex++}`,
            title: "Preamble",
            content: trimmed
          };
        } else {
          currentClause.content += "\n" + trimmed;
        }
      }
    }

    if (currentClause) {
      clauses.push(currentClause);
    }

    // If no sections were detected, split by double newlines (paragraphs)
    if (clauses.length <= 1 && text.includes("\n\n")) {
      const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
      return new MerkleLegalTree(paragraphs.map((p, idx) => ({
        id: `paragraph-${idx + 1}`,
        title: `Paragraph ${idx + 1}`,
        content: p
      })));
    }

    return new MerkleLegalTree(clauses.length > 0 ? clauses : [{ id: "doc-root", title: "Full Document", content: text }]);
  }

  /**
   * Create a MerkleLegalTree from a Document instance
   * @param {import('../documents/document.js').Document} doc
   * @returns {MerkleLegalTree}
   */
  static fromDocument(doc) {
    return MerkleLegalTree.fromMarkdown(doc.content);
  }

  /**
   * Export audit packet for court submission or regulatory inspection
   * @param {string} clauseId
   * @returns {object} Machine-readable JSON compliance packet
   */
  exportAuditPacket(clauseId) {
    const proofData = this.getProof(clauseId);
    return {
      standard: "LEGITBLOCK-MERKLE-INCLUSION-v1",
      timestamp: new Date().toISOString(),
      merkleRoot: this.rootHash,
      clauseId: proofData.clause.id,
      clauseTitle: proofData.clause.title,
      clauseContent: proofData.clause.content,
      leafHash: proofData.leafHash,
      proof: proofData.proof,
      totalClausesInCharter: this.clauses.length
    };
  }
}
