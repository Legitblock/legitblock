import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

/**
 * Open local $EDITOR to view/edit document text
 * @param {string} initialContent
 * @param {string} filenameHint
 * @returns {{ hasChanged: boolean, newContent: string }}
 */
export function openEditor(initialContent = "", filenameHint = "document.md") {
  const editor = process.env.EDITOR || process.env.VISUAL || (process.platform === "win32" ? "notepad" : "nano");
  const tempDir = os.tmpdir();
  const safeName = filenameHint.replace(/[^a-zA-Z0-9_-]/g, "_");
  const tempFile = path.join(tempDir, `legitblock-${Date.now()}-${safeName}.md`);

  // Write current content to temporary file
  fs.writeFileSync(tempFile, initialContent, "utf8");

  try {
    // Parse editor command and arguments safely without invoking a shell
    const [editorBin, ...editorArgs] = editor.trim().split(/\s+/);
    const result = spawnSync(editorBin, [...editorArgs, tempFile], {
      stdio: "inherit",
      shell: false
    });

    if (result.error) {
      throw result.error;
    }

    // Read edited content
    const editedContent = fs.readFileSync(tempFile, "utf8");
    const hasChanged = editedContent.trim() !== initialContent.trim();

    return {
      hasChanged,
      newContent: editedContent
    };
  } finally {
    // Cleanup temporary file
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {}
  }
}
