import fs from "node:fs";
import path from "node:path";
import { sha256, signData, verifySignature, generateMemberKeyPair } from "../blockchain/crypto.js";
import { MerkleLegalTree } from "../crypto/merkle.js";
import { OpenTimestampsAdapter } from "../crypto/anchoring.js";

/**
 * Git Pre-Commit Notarization & Legal Charter Audit Hook
 */
export class GitNotarizer {
  /**
   * Scan files and compute a signed Merkle legal charter notarization
   * @param {object} options
   * @param {string} options.rootDir - Base repository directory
   * @param {string[]} [options.filePaths] - Explicit list of files to notarize (relative to rootDir)
   * @param {string} [options.author="LegitBlock Officer"] - Signer identity
   * @param {object} [options.keyPair] - { privateKey, publicKey }
   * @param {boolean} [options.writeLedger=true] - Write receipt to .legitblock/notarizations.json
   * @returns {object} Notarization manifest
   */
  static notarizeWorkspace({
    rootDir,
    filePaths = [],
    author = "LegitBlock Governance Custodian",
    keyPair = null,
    writeLedger = true
  }) {
    if (!rootDir) {
      throw new Error("rootDir is required for notarizeWorkspace()");
    }

    const signingKeys = keyPair || generateMemberKeyPair();

    // If filePaths not provided, discover markdown and json legal documents
    let targetFiles = filePaths;
    if (targetFiles.length === 0) {
      targetFiles = this._discoverLegalDocuments(rootDir);
    }

    if (targetFiles.length === 0) {
      throw new Error("No files discovered or provided for notarization");
    }

    // Hash each file
    const fileEntries = [];
    const contentsForMerkle = [];

    for (const relPath of targetFiles) {
      const fullPath = path.isAbsolute(relPath) ? relPath : path.join(rootDir, relPath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, "utf8");
        const hash = sha256(content);
        const normRelPath = path.relative(rootDir, fullPath);
        fileEntries.push({
          path: normRelPath,
          hash,
          size: Buffer.byteLength(content)
        });
        contentsForMerkle.push({
          id: normRelPath,
          title: normRelPath,
          content
        });
      }
    }

    if (fileEntries.length === 0) {
      throw new Error("None of the targeted files exist on disk");
    }

    // Build Merkle tree over file contents
    const tree = new MerkleLegalTree(contentsForMerkle);
    const merkleRoot = tree.getRootHash();

    // Generate Merkle inclusion proof for each file
    const filesWithProofs = fileEntries.map((file, idx) => ({
      ...file,
      leafHash: tree.leaves[idx],
      proof: tree.getProof(idx).proof
    }));

    // Create timestamp anchor
    const otsReceipt = OpenTimestampsAdapter.createAnchorReceipt(0, merkleRoot);

    // Build manifest payload to sign
    const manifestPayload = {
      standard: "LEGITBLOCK-GIT-NOTARIZATION-v1",
      timestamp: new Date().toISOString(),
      merkleRoot,
      fileCount: filesWithProofs.length,
      author,
      files: filesWithProofs.map((f) => ({ path: f.path, hash: f.hash, leafHash: f.leafHash }))
    };

    const signature = signData(JSON.stringify(manifestPayload), signingKeys.privateKey);

    const fullManifest = {
      ...manifestPayload,
      filesWithProofs,
      signature: {
        signer: author,
        publicKey: signingKeys.publicKey,
        sig: signature
      },
      otsReceipt: otsReceipt.toJSON()
    };

    // Optionally write to .legitblock/notarizations.json
    if (writeLedger) {
      const ledgerDir = path.join(rootDir, ".legitblock");
      if (!fs.existsSync(ledgerDir)) {
        fs.mkdirSync(ledgerDir, { recursive: true });
      }
      const ledgerFile = path.join(ledgerDir, "notarizations.json");
      let existing = [];
      if (fs.existsSync(ledgerFile)) {
        try {
          existing = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
          if (!Array.isArray(existing)) existing = [];
        } catch {}
      }
      existing.push(fullManifest);
      fs.writeFileSync(ledgerFile, JSON.stringify(existing, null, 2), "utf8");
    }

    return fullManifest;
  }

  /**
   * Verify an existing notarization manifest against repository files on disk
   * @param {object} manifest 
   * @param {string} rootDir 
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  static verifyNotarization(manifest, rootDir) {
    const errors = [];

    if (!manifest || !manifest.merkleRoot) {
      return { isValid: false, errors: ["Invalid manifest structure: missing merkleRoot"] };
    }

    // Verify digital signature
    if (manifest.signature && manifest.signature.publicKey && manifest.signature.sig) {
      const payloadToVerify = {
        standard: manifest.standard,
        timestamp: manifest.timestamp,
        merkleRoot: manifest.merkleRoot,
        fileCount: manifest.fileCount,
        author: manifest.author,
        files: manifest.files
      };
      const isSigValid = verifySignature(
        JSON.stringify(payloadToVerify),
        manifest.signature.sig,
        manifest.signature.publicKey
      );
      if (!isSigValid) {
        errors.push("Cryptographic author signature is invalid or tampered");
      }
    } else {
      errors.push("Missing required signature metadata in manifest");
    }

    // Re-verify file hashes on disk
    const contents = [];
    for (const f of manifest.files) {
      const fullPath = path.join(rootDir, f.path);
      if (!fs.existsSync(fullPath)) {
        errors.push(`File missing on disk: ${f.path}`);
        continue;
      }
      const diskContent = fs.readFileSync(fullPath, "utf8");
      const diskHash = sha256(diskContent);
      if (diskHash !== f.hash) {
        errors.push(`File hash mismatch for ${f.path}: expected ${f.hash}, got ${diskHash}`);
      }
      contents.push({ id: f.path, content: diskContent });
    }

    // Check Merkle root if all files were present
    if (contents.length === manifest.files.length) {
      const tree = new MerkleLegalTree(contents);
      if (tree.getRootHash().toLowerCase() !== manifest.merkleRoot.toLowerCase()) {
        errors.push(`Merkle root mismatch: expected ${manifest.merkleRoot}, recalculated ${tree.getRootHash()}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Install a git pre-commit hook into .git/hooks/pre-commit
   * @param {string} repoDir 
   * @returns {string} Path of installed hook
   */
  static installPreCommitHook(repoDir) {
    const gitDir = path.join(repoDir, ".git");
    if (!fs.existsSync(gitDir)) {
      throw new Error(`Directory ${repoDir} is not a valid git repository (.git folder not found)`);
    }

    const hooksDir = path.join(gitDir, "hooks");
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookScript = `#!/usr/bin/env bash
# LegitBlock Statutory Pre-Commit Notarization Hook (DGCL § 224)
set -e

echo "[LegitBlock] Auditing staged files for legal charters & cryptographic integrity..."

# Check if node is available
if ! command -v node >/dev/null 2>&1; then
  echo "[LegitBlock] Warning: Node.js not detected in PATH. Skipping pre-commit notarization."
  exit 0
fi

# Run pre-commit notarization audit
node -e '
import("./packages/legitblock-utils/src/cli/gitHook.js")
  .then(({ GitNotarizer }) => {
    try {
      const manifest = GitNotarizer.notarizeWorkspace({ rootDir: process.cwd() });
      console.log("[LegitBlock] ✓ Pre-commit notarization sealed at Merkle root: " + manifest.merkleRoot.slice(0, 16) + "...");
    } catch (e) {
      console.log("[LegitBlock] Notice: " + e.message);
    }
  })
  .catch(() => {
    // Graceful fallback if utils package not at root
    process.exit(0);
  });
'

exit 0
`;

    const hookPath = path.join(hooksDir, "pre-commit");
    fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
    return hookPath;
  }

  /**
   * Helper to discover legal document files
   */
  static _discoverLegalDocuments(dir, baseDir = dir) {
    const results = [];
    const legalFilePatterns = [
      /bylaws/i,
      /charter/i,
      /constitution/i,
      /governance/i,
      /resolution/i,
      /contract/i,
      /agreement/i,
      /\.legitblock\.json$/i,
      /README\.md$/i
    ];

    function walk(current) {
      if (!fs.existsSync(current)) return;
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const ent of entries) {
        if (ent.name.startsWith(".") || ent.name === "node_modules" || ent.name === "dist") {
          continue;
        }
        const full = path.join(current, ent.name);
        if (ent.isDirectory()) {
          walk(full);
        } else if (ent.isFile()) {
          const rel = path.relative(baseDir, full);
          if (legalFilePatterns.some((pattern) => pattern.test(ent.name) || pattern.test(rel))) {
            results.push(rel);
          }
        }
      }
    }

    walk(dir);
    return results;
  }
}
