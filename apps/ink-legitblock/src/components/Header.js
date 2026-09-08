import React from "react";
import { Box, Text } from "ink";

const h = React.createElement;

export function Header({ status, user, apiBaseUrl }) {
  return h(
    Box,
    { flexDirection: "column", marginBottom: 1, borderStyle: "round", borderColor: "green", paddingX: 1 },
    h(
      Box,
      { justifyContent: "space-between" },
      h(Text, { bold: true, color: "green" }, "🛡️  LEGITBLOCK — Cryptographic Organizational Governance CLI"),
      h(Text, { color: "gray" }, `API: ${apiBaseUrl}`)
    ),
    h(
      Box,
      { justifyContent: "space-between", marginTop: 1 },
      h(
        Box,
        null,
        status?.isInitialized
          ? h(
              Text,
              null,
              "Org: ",
              h(Text, { bold: true, color: "cyan" }, status.organization?.name),
              " | Height: ",
              h(Text, { bold: true, color: "green" }, `#${status.blockHeight - 1}`),
              " | Docs: ",
              h(Text, { bold: true }, status.totalDocuments),
              " | Active Votes: ",
              h(Text, { bold: true, color: "yellow" }, status.activeProposals || 0)
            )
          : h(Text, { color: "yellow" }, `⚠️ Blockchain uninitialized. Use Web App at ${apiBaseUrl}/setup to initialize.`)
      ),
      h(
        Box,
        null,
        user
          ? h(
              Text,
              null,
              "Member: ",
              h(Text, { bold: true, color: "green" }, user.name),
              " (",
              h(Text, { color: "cyan" }, user.username),
              ") [",
              h(Text, { color: "magenta" }, user.role),
              "]"
            )
          : h(Text, { color: "red" }, "Not Logged In")
      )
    )
  );
}
