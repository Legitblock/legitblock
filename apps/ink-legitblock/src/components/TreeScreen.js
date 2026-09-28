import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function TreeScreen({ client, onBack }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBlocks() {
      try {
        const res = await client.getBlocks();
        setBlocks(res || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch blockchain: " + err.message);
        setLoading(false);
      }
    }
    loadBlocks();
  }, [client]);

  if (loading) {
    return h(Box, { padding: 1 }, h(Text, { color: "yellow" }, "⏳ Traversing blockchain ledger nodes..."));
  }

  if (error) {
    return h(
      Box,
      { flexDirection: "column", padding: 1 },
      h(Text, { color: "red", bold: true }, error),
      h(SelectInput, { items: [{ label: "⬅️  Back to Menu", value: "back" }], onSelect: onBack })
    );
  }

  if (selectedBlock) {
    return h(
      Box,
      { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "cyan" },
      h(Text, { bold: true, color: "cyan", marginBottom: 1 }, `📦 Block #${selectedBlock.index} Detailed Metadata:`),
      h(Text, null, `Type:       ${selectedBlock.type}`),
      h(Text, null, `Timestamp:  ${selectedBlock.timestamp}`),
      h(Text, null, `Hash:       ${selectedBlock.hash}`),
      h(Text, null, `Prev Hash:  ${selectedBlock.previousHash}`),
      h(Text, null, `Validator:  ${selectedBlock.validator || "system"}`),
      h(Text, null, `Nonce:      ${selectedBlock.nonce}`),
      h(Text, { bold: true, color: "yellow", marginTop: 1 }, "Payload Preview:"),
      h(
        Box,
        { borderStyle: "single", borderColor: "gray", padding: 1, marginY: 1 },
        h(Text, { color: "gray" }, JSON.stringify(selectedBlock.data, null, 2))
      ),
      h(SelectInput, {
        items: [{ label: "⬅️  Back to Block Tree", value: "back" }],
        onSelect: () => setSelectedBlock(null)
      })
    );
  }

  const menuItems = [
    ...blocks.map((b, idx) => {
      const isGenesis = b.index === 0;
      const icon = isGenesis ? "🌟" : b.type === "DOCUMENT_INSERT" ? "📄" : b.type === "VOTE_TALLY" ? "🗳️" : "📦";
      return {
        label: `${icon} [Block #${b.index}] ${b.type} — ${b.hash.slice(0, 16)}...`,
        value: idx
      };
    }),
    { label: "⬅️  Back to Main Menu", value: "back" }
  ];

  const handleSelect = (item) => {
    if (item.value === "back") {
      onBack();
    } else {
      setSelectedBlock(blocks[item.value]);
    }
  };

  return h(
    Box,
    { flexDirection: "column", padding: 1 },
    h(Box, { marginBottom: 1 },
      h(Text, { bold: true, color: "green" }, "🌳 Cryptographic Block Tree Visualizer (DAG & Merkle Roots)")
    ),
    h(Box, { flexDirection: "column", marginBottom: 1 },
      blocks.map((b, idx) => {
        const isLatest = idx === blocks.length - 1;
        return h(
          Box,
          { key: b.index, flexDirection: "column" },
          h(
            Box,
            { borderStyle: "single", borderColor: b.index === 0 ? "yellow" : "green", paddingX: 1 },
            h(Text, { bold: true, color: b.index === 0 ? "yellow" : "green" }, `Height #${b.index} `),
            h(Text, { color: "cyan" }, `[${b.type}] `),
            h(Text, { color: "gray" }, `Hash: ${b.hash.slice(0, 12)}... `),
            h(Text, { color: "magenta" }, `Prev: ${b.previousHash.slice(0, 10)}...`)
          ),
          !isLatest ? h(Box, { paddingLeft: 3 }, h(Text, { color: "cyan" }, "│\n▼ (SHA-256 Hash Pointer Link)")) : null
        );
      })
    ),
    h(Text, { bold: true, color: "yellow", marginBottom: 1 }, "Select a block to inspect full cryptographic payload:"),
    h(SelectInput, { items: menuItems, onSelect: handleSelect })
  );
}
