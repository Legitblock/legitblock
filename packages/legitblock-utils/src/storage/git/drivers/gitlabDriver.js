import { BaseGitDriver } from "./baseGitDriver.js";

/**
 * GitLab REST API v4 driver for LegitBlock.
 * Communicates with GitLab.com or self-hosted GitLab CE/EE instances.
 */
export class GitLabDriver extends BaseGitDriver {
  /**
   * @param {object} options
   * @param {string} options.token - GitLab Personal Access Token or Project Deploy Token
   * @param {string|number} options.projectId - Project ID or URL-encoded path with namespace (e.g. "my-org/governance")
   * @param {string} [options.defaultBranch="main"] - Default branch name
   * @param {string} [options.baseUrl="https://gitlab.com/api/v4"] - GitLab API v4 URL
   */
  constructor({
    token = process.env.GITLAB_TOKEN,
    projectId = process.env.GITLAB_PROJECT_ID,
    defaultBranch = "main",
    baseUrl = "https://gitlab.com/api/v4"
  } = {}) {
    super("gitlab");
    this.token = token;
    this.projectId = typeof projectId === "string" ? encodeURIComponent(projectId) : projectId;
    this.defaultBranch = defaultBranch;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Helper to make authenticated GitLab API requests
   */
  async _request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      "Accept": "application/json",
      "User-Agent": "LegitBlock-Governance/1.0",
      ...(this.token ? { "PRIVATE-TOKEN": this.token } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`GitLab API error (${res.status} ${res.statusText}) on ${url}: ${errorText}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  async isAccessible() {
    if (!this.projectId) return false;
    try {
      const data = await this._request(`/projects/${this.projectId}`);
      return Boolean(data && data.name);
    } catch {
      return false;
    }
  }

  async fileExists(filePath, ref = this.defaultBranch) {
    try {
      const encodedPath = encodeURIComponent(filePath.replace(/^\/+/, ""));
      await this._request(`/projects/${this.projectId}/repository/files/${encodedPath}?ref=${ref}`);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath, ref = this.defaultBranch) {
    try {
      const encodedPath = encodeURIComponent(filePath.replace(/^\/+/, ""));
      const url = `${this.baseUrl}/projects/${this.projectId}/repository/files/${encodedPath}/raw?ref=${ref}`;
      const headers = this.token ? { "PRIVATE-TOKEN": this.token } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      return res.text();
    } catch {
      return null;
    }
  }

  async writeFile(filePath, content, message, branch = this.defaultBranch) {
    return this.writeFiles([{ path: filePath, content }], message, branch);
  }

  /**
   * GitLab supports atomic multi-file commits in a single request!
   */
  async writeFiles(files, message, branch = this.defaultBranch) {
    if (!files || files.length === 0) return { success: true };

    const actions = [];
    for (const f of files) {
      const cleanPath = f.path.replace(/^\/+/, "");
      const exists = await this.fileExists(cleanPath, branch);
      actions.push({
        action: exists ? "update" : "create",
        file_path: cleanPath,
        content: f.content
      });
    }

    const payload = {
      branch,
      commit_message: message,
      actions
    };

    const result = await this._request(`/projects/${this.projectId}/repository/commits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      commitSha: result?.id || null,
      ref: branch
    };
  }

  async listFiles(dirPath = "", ref = this.defaultBranch) {
    try {
      const cleanPath = encodeURIComponent(dirPath.replace(/^\/+/, ""));
      const data = await this._request(`/projects/${this.projectId}/repository/tree?path=${cleanPath}&ref=${ref}`);
      if (Array.isArray(data)) {
        return data.filter(item => item.type === "blob").map(item => item.name);
      }
      return [];
    } catch {
      return [];
    }
  }

  async createBranch(newBranch, fromRef = this.defaultBranch) {
    const result = await this._request(`/projects/${this.projectId}/repository/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch: newBranch,
        ref: fromRef
      })
    });

    return { success: true, branch: result?.name || newBranch };
  }

  async createPullRequest({ title, body, head, base = this.defaultBranch }) {
    const mrData = await this._request(`/projects/${this.projectId}/merge_requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_branch: head,
        target_branch: base,
        title,
        description: body
      })
    });

    return {
      success: true,
      id: String(mrData.iid),
      number: mrData.iid,
      url: mrData.web_url,
      title: mrData.title
    };
  }

  async mergePullRequest(mrId, { commitMessage = "LegitBlock: Ratified resolution merged into main" } = {}) {
    const result = await this._request(`/projects/${this.projectId}/merge_requests/${mrId}/merge`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merge_commit_message: commitMessage
      })
    });

    return {
      success: true,
      merged: result?.state === "merged",
      sha: result?.merge_commit_sha
    };
  }

  async createTag(tagName, message = "LegitBlock Block Sealed", targetRef = this.defaultBranch) {
    await this._request(`/projects/${this.projectId}/repository/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag_name: tagName,
        ref: targetRef,
        message
      })
    });

    return { success: true, tag: tagName };
  }
}
