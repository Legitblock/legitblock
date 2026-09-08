import { hashObject } from "../blockchain/crypto.js";

/**
 * Document categories in LegitBlock
 */
export const DocumentCategory = {
  FOUNDING: "founding",         // Articles of Inc, Charter, Constitution
  GOVERNANCE: "governance",     // Bylaws, Operating Agreement, Board Policies
  FINANCIAL: "financial",       // Annual Budget, Auditor Report, Capital Allocations
  OPERATIONAL: "operational",   // Code of Ethics, IP Policy, Membership Rules
  RESOLUTION: "resolution"      // Board or Member Resolutions
};

/**
 * Document lifecycle status
 */
export const DocumentStatus = {
  DRAFT: "draft",
  PROPOSED: "proposed",
  ACTIVE: "active",
  SUPERSEDED: "superseded",
  ARCHIVED: "archived"
};

/**
 * Organizational Document representation
 */
export class Document {
  /**
   * @param {object} params
   * @param {string} params.id - Unique ID (e.g. "doc-articles-of-inc")
   * @param {string} params.title - Human readable title
   * @param {string} params.category - Category from DocumentCategory
   * @param {string} params.content - Markdown or plain text content
   * @param {string} [params.version="1.0"] - Version string
   * @param {string} [params.status=DocumentStatus.ACTIVE] - Current status
   * @param {string} [params.effectiveDate] - ISO date string
   * @param {string} [params.author="Founding Board"] - Author / submitter
   * @param {string[]} [params.tags=[]] - Optional tags
   */
  constructor({
    id,
    title,
    category = DocumentCategory.GOVERNANCE,
    content = "",
    version = "1.0",
    status = DocumentStatus.ACTIVE,
    effectiveDate = null,
    author = "Founding Board",
    tags = []
  }) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.content = content;
    this.version = version;
    this.status = status;
    this.effectiveDate = effectiveDate || new Date().toISOString();
    this.author = author;
    this.tags = tags;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return hashObject({
      id: this.id,
      title: this.title,
      category: this.category,
      content: this.content,
      version: this.version
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      content: this.content,
      version: this.version,
      status: this.status,
      effectiveDate: this.effectiveDate,
      author: this.author,
      tags: this.tags,
      hash: this.hash
    };
  }

  static fromJSON(json) {
    return new Document(json);
  }
}
