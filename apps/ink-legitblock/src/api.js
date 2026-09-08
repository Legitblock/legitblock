import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SESSION_FILE = path.join(os.homedir(), ".legitblock-session.json");

export class LegitBlockApiClient {
  constructor(baseUrl = process.env.LEGITBLOCK_API_URL || "http://localhost:3000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = this.loadToken();
  }

  loadToken() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const raw = fs.readFileSync(SESSION_FILE, "utf8");
        const data = JSON.parse(raw);
        return data.token || null;
      }
    } catch {}
    return null;
  }

  saveToken(token, user = null) {
    this.token = token;
    try {
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ token, user, savedAt: new Date().toISOString() }, null, 2), "utf8");
    } catch {}
  }

  clearToken() {
    this.token = null;
    try {
      if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
    } catch {}
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      headers["Cookie"] = `legitblock_token=${this.token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data;
    } catch (err) {
      throw new Error(`API Request to ${endpoint} failed: ${err.message}`);
    }
  }

  async login(username, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.saveToken(data.token, data.user);
    }
    return data;
  }

  async getMe() {
    if (!this.token) return null;
    try {
      const data = await this.request("/api/auth/me");
      return data.user || null;
    } catch {
      return null;
    }
  }

  async getStatus() {
    return this.request("/api/blockchain/status");
  }

  async getBlocks() {
    return this.request("/api/blockchain/blocks");
  }

  async validateChain() {
    return this.request("/api/blockchain/validate");
  }

  async getDocuments() {
    return this.request("/api/documents");
  }

  async getDocument(id) {
    return this.request(`/api/documents/${id}`);
  }

  async proposeDocument(title, category, content, description) {
    return this.request("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title, category, content, description })
    });
  }

  async proposeAmendment(id, newContent, proposalTitle, proposalDescription) {
    return this.request(`/api/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ newContent, proposalTitle, proposalDescription })
    });
  }

  async getProposals(status) {
    const query = status ? `?status=${status}` : "";
    return this.request(`/api/proposals${query}`);
  }

  async getProposal(id) {
    return this.request(`/api/proposals/${id}`);
  }

  async castVote(id, decision) {
    return this.request(`/api/proposals/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ decision })
    });
  }

  async executeProposal(id) {
    return this.request(`/api/proposals/${id}/execute`, {
      method: "POST"
    });
  }

  async getMembers() {
    return this.request("/api/members");
  }
}
