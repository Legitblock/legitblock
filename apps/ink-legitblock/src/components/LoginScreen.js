import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function LoginScreen({ client, onLoginSuccess, onCancel }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: "Alice Walker (Board President / Founder)", value: "alice" },
    { label: "Bob Chen (Corporate Secretary)", value: "bob" },
    { label: "Carol Martinez (Treasurer / CFO)", value: "carol" },
    { label: "David Kim (Voting Member / Shareholder)", value: "david" },
    { label: "Elena Rostova (Worker Member / Ops)", value: "elena" },
    { label: "System Administrator (admin)", value: "admin" },
    { label: "← Back to Main Menu", value: "cancel" }
  ];

  const handleSelect = async (item) => {
    if (item.value === "cancel") {
      onCancel();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await client.login(item.value, "password123");
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "blue", padding: 1 },
    h(Text, { bold: true, color: "blue" }, "🔑 LDAP Authentication — Select Member Account"),
    h(Text, { color: "gray", marginBottom: 1 }, "Choose an account to authenticate against the LDAP directory (default password: password123):"),
    error ? h(Box, { marginBottom: 1 }, h(Text, { color: "red" }, `❌ ${error}`)) : null,
    loading
      ? h(Text, { color: "yellow" }, "Authenticating with LDAP directory...")
      : h(SelectInput, { items: demoAccounts, onSelect: handleSelect })
  );
}
