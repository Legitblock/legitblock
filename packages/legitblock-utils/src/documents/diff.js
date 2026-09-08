import * as Diff from "diff";

/**
 * Compute line-by-line structured diff between two document contents
 * @param {string} oldText
 * @param {string} newText
 * @returns {Array<{ type: "added"|"removed"|"unchanged", value: string, count?: number }>}
 */
export function computeStructuredDiff(oldText = "", newText = "") {
  const parts = Diff.diffLines(oldText, newText);
  return parts.map(part => {
    let type = "unchanged";
    if (part.added) type = "added";
    else if (part.removed) type = "removed";
    return {
      type,
      value: part.value,
      count: part.count
    };
  });
}

/**
 * Compute unified diff patch string
 * @param {string} oldText
 * @param {string} newText
 * @param {string} [filename="document.md"]
 * @returns {string}
 */
export function computeUnifiedDiff(oldText = "", newText = "", filename = "document.md") {
  return Diff.createPatch(filename, oldText, newText, "previous", "proposed");
}

/**
 * Format structured diff for terminal output with ANSI colors
 * @param {string} oldText
 * @param {string} newText
 * @returns {string}
 */
export function formatDiffTerminal(oldText = "", newText = "") {
  const parts = Diff.diffLines(oldText, newText);
  let output = "";

  for (const part of parts) {
    const lines = part.value.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();

    for (const line of lines) {
      if (part.added) {
        output += "\x1b[32m+ " + line + "\x1b[0m\n"; // green
      } else if (part.removed) {
        output += "\x1b[31m- " + line + "\x1b[0m\n"; // red
      } else {
        output += "  " + line + "\n";
      }
    }
  }

  return output;
}

/**
 * Format structured diff for web / HTML rendering
 * @param {string} oldText
 * @param {string} newText
 * @returns {Array<{ type: string, line: string }>}
 */
export function getDiffLines(oldText = "", newText = "") {
  const parts = Diff.diffLines(oldText, newText);
  const result = [];

  for (const part of parts) {
    const lines = part.value.split("\n");
    if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

    const type = part.added ? "added" : part.removed ? "removed" : "unchanged";
    for (const line of lines) {
      result.push({ type, line });
    }
  }

  return result;
}
