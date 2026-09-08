import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { openEditor } from "../editor.js";

const h = React.createElement;

export function UploadScreen({ client, onBack }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectAction = async (item) => {
    if (item.value === "back") {
      onBack();
      return;
    }

    if (item.value === "write") {
      const templateStarter = `# Title of New Document\n\n## 1. Purpose\nDescribe the purpose.\n\n## 2. Policy Provisions\nWrite provisions here.`;
      const res = openEditor(templateStarter, "new_document.md");

      if (!res.hasChanged) {
        setMessage("Editor closed without saving new document.");
        return;
      }

      setLoading(true);
      try {
        const titleMatch = res.newContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : `Document ${Date.now()}`;
        const prop = await client.proposeDocument(
          title,
          "governance",
          res.newContent,
          "New document created and proposed via Ink CLI $EDITOR"
        );
        setMessage(`✅ Created Proposal #${prop.proposalId} to adopt "${title}". Member vote required!`);
      } catch (err) {
        setMessage("Failed to propose document: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "yellow", padding: 1 },
    h(Text, { bold: true, color: "yellow" }, "📤 Propose New Organizational Document via $EDITOR"),
    h(Text, { color: "gray", marginBottom: 1 }, "Opens your local $EDITOR (nano/vim/code). Once saved, a new blockchain proposal is created for member ratification."),
    message ? h(Text, { color: "green", bold: true, marginBottom: 1 }, message) : null,
    loading
      ? h(Text, { color: "yellow" }, "Submitting new document proposal to blockchain...")
      : h(SelectInput, {
          items: [
            { label: "✍️   1. Open $EDITOR to Draft & Propose New Document", value: "write" },
            { label: "←  Back to Main Menu", value: "back" }
          ],
          onSelect: handleSelectAction
        })
  );
}
