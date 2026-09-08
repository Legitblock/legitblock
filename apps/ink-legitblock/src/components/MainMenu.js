import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function MainMenu({ onSelect, user }) {
  const menuItems = [
    { label: "📄  1. Browse & Edit Documents (via $EDITOR)", value: "documents" },
    { label: "🗳️  2. Governance Voting & Proposals", value: "voting" },
    { label: "📤  3. Upload / Write New Document (via $EDITOR)", value: "upload" },
    { label: "🔗  4. Cryptographic Blockchain Explorer", value: "explorer" },
    { label: "👥  5. Member Directory", value: "members" },
    { label: user ? `👤  6. Switch User (Currently: ${user.username})` : "🔑  6. Login via LDAP", value: "login" },
    { label: "🚪  7. Exit CLI", value: "exit" }
  ];

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "gray", padding: 1 },
    h(Text, { bold: true, color: "cyan", marginBottom: 1 }, "Main Navigation Menu — Select an action:"),
    h(SelectInput, { items: menuItems, onSelect })
  );
}
