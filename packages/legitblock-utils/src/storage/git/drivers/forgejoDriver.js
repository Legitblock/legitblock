import { BaseGitDriver } from "./baseGitDriver.js";

/**
 * Forgejo & Codeberg REST API v1 driver for LegitBlock.
 * Communicates with Codeberg.org, self-hosted Forgejo, and Gitea servers.
 */
export class ForgejoDriver extends BaseGitDriver {
  /**
   * @param {object} options
   * @param {string} options.token - Forgejo/Codeberg API token
   * @param {string} options.owner - Repository owner (organization or user)
   * @param {string} options.repo - Repository name
   * @param {string} [options.defaultBranch="main"] - Default branch name
   * @param {string} [options.baseUrl="https://codeberg.org/api/v1"] - Forgejo API v1 URL
   */
  constructor({
    token = process.env.FORGEJO_TOKEN || process.env.CODEBERG_TOKEN,
    owner = process.env.FORGEJO_OWNER || process.env.CODEBERG_OWNER,
    repo = process.env.FORGEJO_REPO || process.env.CODEBERG_REPO,
    defaultBranch = "main",
    baseUrl = process.env.FORGEJO_URL || process.env.CODEBERG_URL || "https://codeberg.org/api/v1"
  } = {}) {
    super("forgejo");
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.defaultBranch = defaultBranch;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    if (!this.baseUrl.endsWith("/api/v1")) {
      this.baseUrl = `${this.baseUrl}/api/v1`;
    }
  }

  /**
   * Helper to make authenticated Forgejo/Codeberg API requests
   */
  async _request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      "Accept": "application/json",
      "User-Agent": "LegitBlock-Governance/1.0",
      ...(this.token ? { "Authorization": `token ${this.token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Forgejo API error (${res.status} ${res.statusText}) on ${url}: ${errorText}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  async isAccessible() {
    if (!this.owner || !this.repo) return false;
    try {
      const data = await this._request(`/repos/${this.owner}/${this.repo}`);
      return Boolean(data && data.name);
    } catch {
      return false;
    }
  }

  async fileExists(filePath, ref = this.defaultBranch) {
    try {
      const cleanPath = filePath.replace(/^\/+/, "");
      await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}?ref=${ref}`);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath, ref = this.defaultBranch) {
    try {
      const cleanPath = filePath.replace(/^\/+/, "");
      const data = await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}?ref=${ref}`);
      if (!data || !data.content) return null;
      return Buffer.from(data.content, "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  async writeFile(filePath, content, message, branch = this.defaultBranch) {
    const cleanPath = filePath.replace(/^\/+/, "");
    let existingSha = null;

    try {
      const existing = await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}?ref=${branch}`);
      if (existing && existing.sha) {
        existingSha = existing.sha;
      }
    } catch {
      // New file
    }

    const payload = {
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(existingSha ? { sha: existingSha } : {})
    };

    // Forgejo uses PUT to update existing files and POST to create new files
    const method = existingSha ? "PUT" : "POST";
    const result = await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      commitSha: result?.commit?.sha || null,
      ref: branch
    };
  }

  async listFiles(dirPath = "", ref = this.defaultBranch) {
    try {
      const cleanPath = dirPath.replace(/^\/+/, "");
      const data = await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}?ref=${ref}`);
      if (Array.isArray(data)) {
        return data.filter(item => item.type === "file").map(item => item.name);
      }
      return [];
    } catch {
      return [];
    }
  }

  async createBranch(newBranch, fromRef = this.defaultBranch) {
    const result = await this._request(`/repos/${this.owner}/${this.repo}/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_branch_name: newBranch,
        old_ref_name: fromRef
      })
    });

    return { success: true, branch: result?.name || newBranch };
  }

  async createPullRequest({ title, body, head, base = this.defaultBranch }) {
    const prData = await this._request(`/repos/${this.owner}/${this.repo}/pulls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        head,
        base
      })
    });

    return {
      success: true,
      id: String(prData.number || prData.id),
      number: prData.number,
      url: prData.html_url,
      title: prData.title
    };
  }

  async mergePullRequest(prId, { commitMessage = "LegitBlock: Ratified resolution merged into main" } = {}) {
    const result = await this._request(`/repos/${this.owner}/${this.repo}/pulls/${prId}/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Do: "merge",
        MergeMessageField: commitMessage,
        MergeTitleField: commitMessage
      })
    });

    return {
      success: true,
      merged: true,
      sha: result?.sha
    };
  }

  async createTag(tagName, message = "LegitBlock Block Sealed", targetRef = this.defaultBranch) {
    await this._request(`/repos/${this.owner}/${this.repo}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag_name: tagName,
        target: targetRef,
        message
      })
    });

    return { success: true, tag: tagName };
  }
}
