import { BaseGitDriver } from "./baseGitDriver.js";

/**
 * GitHub REST API driver for LegitBlock.
 * Communicates with GitHub.com or GitHub Enterprise Server via standard REST endpoints.
 */
export class GitHubDriver extends BaseGitDriver {
  /**
   * @param {object} options
   * @param {string} options.token - GitHub Personal Access Token or App Installation Token
   * @param {string} options.owner - Repository owner (organization or user)
   * @param {string} options.repo - Repository name
   * @param {string} [options.defaultBranch="main"] - Default branch name
   * @param {string} [options.baseUrl="https://api.github.com"] - Base API URL
   */
  constructor({
    token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    owner = process.env.GITHUB_OWNER,
    repo = process.env.GITHUB_REPO,
    defaultBranch = "main",
    baseUrl = "https://api.github.com"
  } = {}) {
    super("github");
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.defaultBranch = defaultBranch;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Helper to make authenticated GitHub API HTTP requests
   */
  async _request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "LegitBlock-Governance/1.0",
      ...(this.token ? { "Authorization": `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`GitHub API error (${res.status} ${res.statusText}) on ${url}: ${errorText}`);
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

    // Check if file already exists to obtain current blob SHA
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

    const result = await this._request(`/repos/${this.owner}/${this.repo}/contents/${cleanPath}`, {
      method: "PUT",
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
    // 1. Get SHA of source ref
    const refData = await this._request(`/repos/${this.owner}/${this.repo}/git/ref/heads/${fromRef}`);
    const sha = refData?.object?.sha;
    if (!sha) {
      throw new Error(`Unable to resolve base ref sha for branch ${fromRef}`);
    }

    // 2. Create new reference
    await this._request(`/repos/${this.owner}/${this.repo}/git/refs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref: `refs/heads/${newBranch}`,
        sha
      })
    });

    return { success: true, branch: newBranch };
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
      id: String(prData.number),
      number: prData.number,
      url: prData.html_url,
      title: prData.title
    };
  }

  async mergePullRequest(prId, { commitMessage = "LegitBlock: Ratified resolution merged into main" } = {}) {
    const result = await this._request(`/repos/${this.owner}/${this.repo}/pulls/${prId}/merge`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commit_message: commitMessage,
        merge_method: "merge"
      })
    });

    return {
      success: true,
      merged: Boolean(result?.merged),
      sha: result?.sha
    };
  }

  async createTag(tagName, message = "LegitBlock Block Sealed", targetRef = this.defaultBranch) {
    // Get target SHA
    const refData = await this._request(`/repos/${this.owner}/${this.repo}/git/ref/heads/${targetRef}`);
    const sha = refData?.object?.sha;

    await this._request(`/repos/${this.owner}/${this.repo}/git/refs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref: `refs/tags/${tagName}`,
        sha
      })
    });

    return { success: true, tag: tagName };
  }
}
