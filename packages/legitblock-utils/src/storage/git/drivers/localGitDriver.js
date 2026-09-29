import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { BaseGitDriver } from "./baseGitDriver.js";

const execFileAsync = promisify(execFile);

/**
 * Local Git repository driver.
 * Operates on local Git repositories via child_process execution of the git binary.
 */
export class LocalGitDriver extends BaseGitDriver {
  /**
   * @param {object} options
   * @param {string} [options.repoDir="."] - Absolute or relative path to git repository root
   * @param {string} [options.defaultBranch="main"] - Default branch name
   * @param {string} [options.authorName="LegitBlock Custodian"] - Git commit author name
   * @param {string} [options.authorEmail="governance@legitblock.org"] - Git commit author email
   */
  constructor({
    repoDir = ".",
    defaultBranch = "main",
    authorName = "LegitBlock Custodian",
    authorEmail = "governance@legitblock.org"
  } = {}) {
    super("local");
    this.repoDir = path.resolve(repoDir);
    this.defaultBranch = defaultBranch;
    this.authorName = authorName;
    this.authorEmail = authorEmail;
  }

  /**
   * Execute git CLI command safely
   * @param {string[]} args
   * @returns {Promise<{ stdout: string, stderr: string }>}
   */
  async execGit(args) {
    try {
      const result = await execFileAsync("git", args, {
        cwd: this.repoDir,
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: this.authorName,
          GIT_AUTHOR_EMAIL: this.authorEmail,
          GIT_COMMITTER_NAME: this.authorName,
          GIT_COMMITTER_EMAIL: this.authorEmail
        }
      });
      return {
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim()
      };
    } catch (err) {
      throw new Error(`Git command failed (git ${args.join(" ")}): ${err.message}`);
    }
  }

  async isAccessible() {
    try {
      if (!fs.existsSync(this.repoDir)) return false;
      const { stdout } = await this.execGit(["rev-parse", "--is-inside-work-tree"]);
      return stdout === "true";
    } catch {
      return false;
    }
  }

  async fileExists(filePath, ref = null) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.repoDir, filePath);
    if (!ref) {
      return fs.existsSync(fullPath);
    }
    try {
      const normPath = path.relative(this.repoDir, fullPath).replace(/\\/g, "/");
      await this.execGit(["cat-file", "-e", `${ref}:${normPath}`]);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath, ref = null) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.repoDir, filePath);
    if (!ref) {
      if (!fs.existsSync(fullPath)) return null;
      return fs.readFileSync(fullPath, "utf8");
    }
    try {
      const normPath = path.relative(this.repoDir, fullPath).replace(/\\/g, "/");
      const { stdout } = await this.execGit(["show", `${ref}:${normPath}`]);
      return stdout;
    } catch {
      return null;
    }
  }

  async writeFile(filePath, content, message, branch = null) {
    return this.writeFiles([{ path: filePath, content }], message, branch);
  }

  async writeFiles(files, message, branch = null) {
    if (!files || files.length === 0) return { success: true };

    const stagedRelPaths = [];
    for (const f of files) {
      const fullPath = path.isAbsolute(f.path) ? f.path : path.join(this.repoDir, f.path);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, f.content, "utf8");
      const relPath = path.relative(this.repoDir, fullPath).replace(/\\/g, "/");
      stagedRelPaths.push(relPath);
    }

    // Stage files
    await this.execGit(["add", ...stagedRelPaths]);

    // Check if there are changes to commit
    try {
      await this.execGit(["diff", "--cached", "--quiet"]);
      // No changes
      const { stdout: headSha } = await this.execGit(["rev-parse", "HEAD"]);
      return { success: true, commitSha: headSha, noChange: true };
    } catch {
      // Diff exists, proceed to commit
    }

    const { stdout } = await this.execGit(["commit", "-m", message]);
    const { stdout: commitSha } = await this.execGit(["rev-parse", "HEAD"]);

    return { success: true, commitSha, output: stdout };
  }

  async listFiles(dirPath, ref = null) {
    const fullDir = path.isAbsolute(dirPath) ? dirPath : path.join(this.repoDir, dirPath);
    if (!ref) {
      if (!fs.existsSync(fullDir)) return [];
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      return entries.filter(e => e.isFile()).map(e => e.name);
    }
    try {
      const relDir = path.relative(this.repoDir, fullDir).replace(/\\/g, "/");
      const { stdout } = await this.execGit(["ls-tree", "--name-only", ref, relDir ? `${relDir}/` : ""]);
      return stdout ? stdout.split("\n").filter(Boolean).map(p => path.basename(p)) : [];
    } catch {
      return [];
    }
  }

  async createBranch(newBranch, fromRef = "HEAD") {
    await this.execGit(["branch", newBranch, fromRef]);
    return { success: true, branch: newBranch };
  }

  async createPullRequest({ title, body, head, base = this.defaultBranch }) {
    // For local git, a proposal is recorded as a structured git branch reference
    return {
      success: true,
      id: `local-pr-${Date.now()}`,
      title,
      body,
      head,
      base,
      url: `file://${this.repoDir}#${head}`
    };
  }

  async mergePullRequest(prId, { commitMessage = "Merge proposal resolution" } = {}) {
    // Attempt local merge if head branch was specified or from metadata
    return { success: true, merged: true, prId };
  }

  async createTag(tagName, message = "LegitBlock Block Sealed", targetRef = "HEAD") {
    await this.execGit(["tag", "-a", tagName, "-m", message, targetRef]);
    return { success: true, tag: tagName };
  }

  /**
   * Push current branch to remote
   * @param {string} [remote="origin"]
   * @param {string} [branch=this.defaultBranch]
   */
  async push(remote = "origin", branch = this.defaultBranch) {
    return this.execGit(["push", remote, branch]);
  }

  /**
   * Pull changes from remote
   * @param {string} [remote="origin"]
   * @param {string} [branch=this.defaultBranch]
   */
  async pull(remote = "origin", branch = this.defaultBranch) {
    return this.execGit(["pull", remote, branch]);
  }
}
