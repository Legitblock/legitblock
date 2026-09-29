import { LocalGitDriver } from "./drivers/localGitDriver.js";
import { GitHubDriver } from "./drivers/githubDriver.js";
import { GitLabDriver } from "./drivers/gitlabDriver.js";
import { ForgejoDriver } from "./drivers/forgejoDriver.js";
import { GitStorageAdapter } from "./gitAdapter.js";

/**
 * Factory to create appropriate Git driver based on forge name or environment
 * @param {object} [options={}]
 * @param {string} [options.forge] - "local" | "github" | "gitlab" | "forgejo" | "codeberg"
 * @returns {import("./drivers/baseGitDriver.js").BaseGitDriver}
 */
export function createGitDriver(options = {}) {
  const forge = (
    options.forge ||
    process.env.LEGITBLOCK_GIT_FORGE ||
    (options.github || process.env.GITHUB_TOKEN ? "github" : null) ||
    (options.gitlab || process.env.GITLAB_TOKEN ? "gitlab" : null) ||
    (options.forgejo || options.codeberg || process.env.FORGEJO_TOKEN || process.env.CODEBERG_TOKEN ? "forgejo" : null) ||
    "local"
  ).toLowerCase();

  switch (forge) {
    case "github":
      return new GitHubDriver({
        token: options.token || process.env.GITHUB_TOKEN,
        owner: options.owner || process.env.GITHUB_OWNER,
        repo: options.repo || process.env.GITHUB_REPO,
        defaultBranch: options.branch || process.env.GIT_BRANCH || "main",
        baseUrl: options.baseUrl || process.env.GITHUB_API_URL || "https://api.github.com"
      });

    case "gitlab":
      return new GitLabDriver({
        token: options.token || process.env.GITLAB_TOKEN,
        projectId: options.projectId || process.env.GITLAB_PROJECT_ID,
        defaultBranch: options.branch || process.env.GIT_BRANCH || "main",
        baseUrl: options.baseUrl || process.env.GITLAB_API_URL || "https://gitlab.com/api/v4"
      });

    case "forgejo":
    case "codeberg":
    case "gitea":
      return new ForgejoDriver({
        token: options.token || process.env.FORGEJO_TOKEN || process.env.CODEBERG_TOKEN,
        owner: options.owner || process.env.FORGEJO_OWNER || process.env.CODEBERG_OWNER,
        repo: options.repo || process.env.FORGEJO_REPO || process.env.CODEBERG_REPO,
        defaultBranch: options.branch || process.env.GIT_BRANCH || "main",
        baseUrl: options.baseUrl || process.env.FORGEJO_URL || process.env.CODEBERG_URL || "https://codeberg.org/api/v1"
      });

    case "local":
    default:
      return new LocalGitDriver({
        repoDir: options.repoDir || process.env.GIT_REPO_DIR || ".",
        defaultBranch: options.branch || process.env.GIT_BRANCH || "main",
        authorName: options.authorName || "LegitBlock Custodian",
        authorEmail: options.authorEmail || "governance@legitblock.org"
      });
  }
}

/**
 * Factory to create a fully configured GitStorageAdapter
 * @param {object} [options={}]
 * @returns {GitStorageAdapter}
 */
export function createGitStorageAdapter(options = {}) {
  const driver = options.driver || createGitDriver(options);
  return new GitStorageAdapter({
    driver,
    ledgerDir: options.ledgerDir || ".legitblock",
    branch: options.branch || driver.defaultBranch || "main",
    syncGovernanceDocs: options.syncGovernanceDocs !== undefined ? options.syncGovernanceDocs : true,
    autoTagBlocks: options.autoTagBlocks !== undefined ? options.autoTagBlocks : true
  });
}
