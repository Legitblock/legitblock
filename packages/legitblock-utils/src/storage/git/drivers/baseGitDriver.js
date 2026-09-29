/**
 * Abstract Base Driver for Git-based storage providers.
 * Defines the contract implemented by LocalGit, GitHub, GitLab, and Forgejo/Codeberg drivers.
 */
export class BaseGitDriver {
  /**
   * @param {string} name - Driver identifier ("local", "github", "gitlab", "forgejo")
   */
  constructor(name = "base") {
    this.name = name;
  }

  /**
   * Check if the target repository or directory is accessible
   * @returns {Promise<boolean>}
   */
  async isAccessible() {
    throw new Error(`${this.name} driver: isAccessible() must be implemented`);
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Relative file path in repository
   * @param {string} [ref] - Branch name, tag, or commit SHA
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath, ref) {
    throw new Error(`${this.name} driver: fileExists() must be implemented`);
  }

  /**
   * Read raw text file from repository
   * @param {string} filePath - Relative file path in repository
   * @param {string} [ref] - Branch name, tag, or commit SHA
   * @returns {Promise<string|null>}
   */
  async readFile(filePath, ref) {
    throw new Error(`${this.name} driver: readFile() must be implemented`);
  }

  /**
   * Write/commit a file to repository
   * @param {string} filePath - Relative file path in repository
   * @param {string} content - File content to write
   * @param {string} message - Commit message
   * @param {string} [branch] - Target branch
   * @returns {Promise<{ success: boolean, commitSha?: string, ref?: string }>}
   */
  async writeFile(filePath, content, message, branch) {
    throw new Error(`${this.name} driver: writeFile() must be implemented`);
  }

  /**
   * Write multiple files in a single atomic commit if supported
   * @param {Array<{ path: string, content: string }>} files - Array of files to write
   * @param {string} message - Commit message
   * @param {string} [branch] - Target branch
   * @returns {Promise<{ success: boolean, commitSha?: string }>}
   */
  async writeFiles(files, message, branch) {
    // Default fallback: sequential write
    for (const f of files) {
      await this.writeFile(f.path, f.content, message, branch);
    }
    return { success: true };
  }

  /**
   * List files within a directory in the repository
   * @param {string} dirPath - Relative directory path
   * @param {string} [ref] - Branch or commit SHA
   * @returns {Promise<string[]>}
   */
  async listFiles(dirPath, ref) {
    throw new Error(`${this.name} driver: listFiles() must be implemented`);
  }

  /**
   * Create a new branch in the repository
   * @param {string} newBranch - New branch name
   * @param {string} [fromRef="main"] - Source branch or commit SHA
   * @returns {Promise<{ success: boolean, branch: string }>}
   */
  async createBranch(newBranch, fromRef) {
    throw new Error(`${this.name} driver: createBranch() must be implemented`);
  }

  /**
   * Open a Pull Request or Merge Request for governance review
   * @param {object} params
   * @param {string} params.title - PR/MR Title
   * @param {string} params.body - PR/MR Description
   * @param {string} params.head - Source branch (proposal branch)
   * @param {string} params.base - Target branch (e.g. main/master)
   * @returns {Promise<{ success: boolean, id: string|number, url?: string, number?: number }>}
   */
  async createPullRequest(params) {
    throw new Error(`${this.name} driver: createPullRequest() must be implemented`);
  }

  /**
   * Merge an approved Pull Request / Merge Request
   * @param {string|number} prId - PR number or MR IID
   * @param {object} [options]
   * @param {string} [options.commitMessage]
   * @returns {Promise<{ success: boolean, merged: boolean }>}
   */
  async mergePullRequest(prId, options) {
    throw new Error(`${this.name} driver: mergePullRequest() must be implemented`);
  }

  /**
   * Create a Git tag (e.g. for sealing blocks)
   * @param {string} tagName - Tag name (e.g. block-000042)
   * @param {string} [message] - Tag annotation message
   * @param {string} [targetRef] - Target commit ref
   * @returns {Promise<{ success: boolean, tag: string }>}
   */
  async createTag(tagName, message, targetRef) {
    throw new Error(`${this.name} driver: createTag() must be implemented`);
  }
}
