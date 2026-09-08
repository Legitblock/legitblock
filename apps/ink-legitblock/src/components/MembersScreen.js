import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function MembersScreen({ client, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getMembers()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return h(Text, { color: "yellow" }, "Loading members...");

  const members = data?.chainMembers || [];

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "cyan", padding: 1 },
    h(Text, { bold: true, color: "cyan" }, `👥 Registered Blockchain Members (${members.length})`),
    h(Text, { color: "gray", marginBottom: 1 }, "Members synchronized from LDAP directory with voting authority:"),
    members.map((m, idx) =>
      h(
        Box,
        { key: idx, justifyContent: "space-between", borderStyle: "round", borderColor: "gray", marginY: 0.5, paddingX: 1 },
        h(Text, { bold: true }, m.name, " (", h(Text, { color: "cyan" }, m.id), ")"),
        h(Text, { color: "green" }, `${m.role} (Weight: ${m.votingWeight || 1})`)
      )
    ),
    h(SelectInput, {
      items: [{ label: "← Back to Main Menu", value: "back" }],
      onSelect: onBack
    })
  );
}
