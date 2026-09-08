import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function ExplorerScreen({ client, onBack }) {
  const [blocks, setBlocks] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.getBlocks().catch(() => ({ chain: [] })),
      client.validateChain().catch(() => ({ valid: false }))
    ]).then(([blocksData, valData]) => {
      setBlocks(blocksData.chain || []);
      setValidation(valData);
      setLoading(false);
    });
  }, []);

  if (loading) return h(Text, { color: "yellow" }, "Querying cryptographic chain...");

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "green", padding: 1 },
    h(
      Box,
      { justifyContent: "space-between", marginBottom: 1 },
      h(Text, { bold: true, color: "green" }, `🔗 Cryptographic Blockchain Explorer (${blocks.length} Blocks)`),
      h(Text, { bold: true, color: validation?.valid ? "green" : "red" }, validation?.valid ? "✓ SHA-256 Validated" : "❌ Validation Issue")
    ),
    blocks.map((b) =>
      h(
        Box,
        { key: b.index, flexDirection: "column", borderStyle: "round", borderColor: "gray", marginY: 0.5, paddingX: 1 },
        h(
          Box,
          { justifyContent: "space-between" },
          h(Text, { bold: true, color: "cyan" }, `Block #${b.index} [${b.type}]`),
          h(Text, { color: "gray" }, new Date(b.timestamp).toLocaleTimeString())
        ),
        h(Text, { color: "gray" }, "Hash: ", h(Text, { color: "green" }, `${b.hash.substring(0, 24)}...${b.hash.substring(56)}`)),
        h(Text, { color: "gray" }, `Prev: ${b.previousHash.substring(0, 16)}... | Validator: ${b.validator} | Nonce: ${b.nonce}`)
      )
    ),
    h(SelectInput, {
      items: [{ label: "← Back to Main Menu", value: "back" }],
      onSelect: onBack
    })
  );
}
