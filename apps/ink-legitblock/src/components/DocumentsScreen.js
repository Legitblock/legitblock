import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { openEditor } from "../editor.js";
import { computeUnifiedDiff } from "@legitblock/legitblock-utils";

const h = React.createElement;

export function DocumentsScreen({ client, onBack }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [mode, setMode] = useState("list");
  const [editResult, setEditResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await client.getDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      setMessage("Failed to load documents: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSelectDoc = async (item) => {
    if (item.value === "back") {
      onBack();
      return;
    }
    const doc = documents.find(d => d.id === item.value);
    setSelectedDoc(doc);
    setMode("options");
  };

  const handleDocAction = async (action) => {
    if (action.value === "back") {
      setSelectedDoc(null);
      setMode("list");
      return;
    }

    if (action.value === "view") {
      setMode("view");
      return;
    }

    if (action.value === "history") {
      setLoading(true);
      try {
        const res = await client.request(`/api/documents/${selectedDoc.id}/history`);
        setHistory(res.history || []);
        setMode("history");
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (action.value === "edit") {
      setMessage("Opening document in local $EDITOR (" + (process.env.EDITOR || "nano") + ")...");
      try {
        const res = openEditor(selectedDoc.content, selectedDoc.title);
        if (res.hasChanged) {
          const diff = computeUnifiedDiff(selectedDoc.content, res.newContent, selectedDoc.title);
          setEditResult({ newContent: res.newContent, diff });
          setMode("edited");
        } else {
          setMessage("No changes detected in $EDITOR. Document remains unchanged.");
          setMode("options");
        }
      } catch (err) {
        setMessage("Editor error: " + err.message);
      }
    }
  };

  const handleConfirmAmendment = async () => {
    setLoading(true);
    try {
      const res = await client.proposeAmendment(
        selectedDoc.id,
        editResult.newContent,
        `Amend ${selectedDoc.title} via CLI`,
        `Proposed updates made via terminal $EDITOR by member.`
      );
      setMessage(`✅ Success! Created Amendment Proposal #${res.proposalId}. Requires blockchain member vote!`);
      setEditResult(null);
      setSelectedDoc(null);
      setMode("list");
      loadDocuments();
    } catch (err) {
      setMessage("Failed to propose amendment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return h(Text, { color: "yellow" }, "Loading documents from blockchain...");
  }

  // Sub-view: Document Options
  if (mode === "options" && selectedDoc) {
    const actions = [
      { label: "✏️   1. Edit Document in local $EDITOR (Opens nano/vim)", value: "edit" },
      { label: "👁️   2. View Document Text in Terminal", value: "view" },
      { label: "📜  3. View Version History & Blockchain Diffs", value: "history" },
      { label: "←  Back to Documents List", value: "back" }
    ];

    return h(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "cyan", padding: 1 },
      h(Text, { bold: true, color: "cyan" }, `${selectedDoc.title} (v${selectedDoc.version})`),
      h(Text, { color: "gray", marginBottom: 1 }, `Category: ${selectedDoc.category} | Hash: ${selectedDoc.contentHash}`),
      message ? h(Text, { color: "yellow", marginBottom: 1 }, message) : null,
      h(SelectInput, { items: actions, onSelect: handleDocAction })
    );
  }

  // Sub-view: View Content
  if (mode === "view" && selectedDoc) {
    return h(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "blue", padding: 1 },
      h(Text, { bold: true, color: "blue" }, `${selectedDoc.title} — Current Effective Text (v${selectedDoc.version})`),
      h(
        Box,
        { borderStyle: "single", borderColor: "gray", marginY: 1, padding: 1 },
        h(Text, null, selectedDoc.content)
      ),
      h(SelectInput, {
        items: [{ label: "← Back to Document Options", value: "back" }],
        onSelect: () => setMode("options")
      })
    );
  }

  // Sub-view: Post-Editor Confirmation
  if (mode === "edited" && editResult) {
    return h(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "yellow", padding: 1 },
      h(Text, { bold: true, color: "yellow" }, "⚠️ Changes Detected in $EDITOR — Ready to Propose on Blockchain"),
      h(Text, { color: "gray", marginBottom: 1 }, "All document modifications require a ratified vote on the blockchain ledger."),
      h(
        Box,
        { borderStyle: "single", borderColor: "gray", marginY: 1, padding: 1 },
        h(Text, { color: "green" }, editResult.diff)
      ),
      h(SelectInput, {
        items: [
          { label: "✅ Submit Amendment Proposal for Blockchain Vote", value: "submit" },
          { label: "❌ Discard Changes", value: "discard" }
        ],
        onSelect: (item) => {
          if (item.value === "submit") handleConfirmAmendment();
          else {
            setEditResult(null);
            setMode("options");
          }
        }
      })
    );
  }

  // Sub-view: History
  if (mode === "history") {
    return h(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "purple", padding: 1 },
      h(Text, { bold: true, color: "purple" }, `Blockchain Version History — ${selectedDoc?.title}`),
      history.map((hist, idx) =>
        h(
          Box,
          { key: idx, flexDirection: "column", marginY: 0.5, borderStyle: "round", borderColor: "gray", paddingX: 1 },
          h(Text, { bold: true }, `Block #${hist.blockIndex} — Action: ${hist.action} (v${hist.version})`),
          h(Text, { color: "gray" }, `Date: ${new Date(hist.timestamp).toLocaleString()} | Validator: ${hist.validator}`),
          hist.diff ? h(Text, { color: "green" }, `Diff:\n${hist.diff}`) : null
        )
      ),
      h(SelectInput, {
        items: [{ label: "← Back to Document Options", value: "back" }],
        onSelect: () => setMode("options")
      })
    );
  }

  // Default: List
  const items = [
    ...documents.map(d => ({
      label: `[v${d.version}] ${d.title} (${d.category})`,
      value: d.id
    })),
    { label: "← Back to Main Menu", value: "back" }
  ];

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "green", padding: 1 },
    h(Text, { bold: true, color: "green" }, "📄 Ratified Organizational Documents on Blockchain"),
    h(Text, { color: "gray", marginBottom: 1 }, "Select a document to inspect or edit using your local $EDITOR:"),
    message ? h(Text, { color: "yellow", marginBottom: 1 }, message) : null,
    h(SelectInput, { items, onSelect: handleSelectDoc })
  );
}
