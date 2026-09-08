import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { LegitBlockApiClient } from "./api.js";
import { Header } from "./components/Header.js";
import { MainMenu } from "./components/MainMenu.js";
import { LoginScreen } from "./components/LoginScreen.js";
import { DocumentsScreen } from "./components/DocumentsScreen.js";
import { VotingScreen } from "./components/VotingScreen.js";
import { UploadScreen } from "./components/UploadScreen.js";
import { ExplorerScreen } from "./components/ExplorerScreen.js";
import { MembersScreen } from "./components/MembersScreen.js";

const h = React.createElement;

export function App({ apiUrl = "http://localhost:3000" }) {
  const { exit } = useApp();
  const [client] = useState(() => new LegitBlockApiClient(apiUrl));
  const [screen, setScreen] = useState("menu");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const refreshStatus = async () => {
    try {
      const s = await client.getStatus();
      setStatus(s);
      setError("");
    } catch (err) {
      setError(`Cannot connect to LegitBlock Next.js API server at ${apiUrl}. Make sure Next.js is running.`);
    }
  };

  const refreshUser = async () => {
    const u = await client.getMe();
    setUser(u);
  };

  useEffect(() => {
    refreshStatus();
    refreshUser();
  }, []);

  const handleMenuSelect = (item) => {
    if (item.value === "exit") {
      exit();
    } else {
      setScreen(item.value);
    }
  };

  return h(
    Box,
    { flexDirection: "column", padding: 1 },
    h(Header, { status, user, apiBaseUrl: client.baseUrl }),
    error
      ? h(
          Box,
          { marginBottom: 1, borderStyle: "single", borderColor: "red", padding: 1 },
          h(Text, { color: "red", bold: true }, "⚠️ Connection Notice: "),
          h(Text, { color: "red" }, error)
        )
      : null,
    screen === "menu" ? h(MainMenu, { onSelect: handleMenuSelect, user }) : null,
    screen === "login"
      ? h(LoginScreen, {
          client,
          onLoginSuccess: (loggedUser) => {
            setUser(loggedUser);
            setScreen("menu");
            refreshStatus();
          },
          onCancel: () => setScreen("menu")
        })
      : null,
    screen === "documents"
      ? h(DocumentsScreen, {
          client,
          onBack: () => {
            setScreen("menu");
            refreshStatus();
          }
        })
      : null,
    screen === "voting"
      ? h(VotingScreen, {
          client,
          onBack: () => {
            setScreen("menu");
            refreshStatus();
          }
        })
      : null,
    screen === "upload"
      ? h(UploadScreen, {
          client,
          onBack: () => {
            setScreen("menu");
            refreshStatus();
          }
        })
      : null,
    screen === "explorer"
      ? h(ExplorerScreen, {
          client,
          onBack: () => setScreen("menu")
        })
      : null,
    screen === "members"
      ? h(MembersScreen, {
          client,
          onBack: () => setScreen("menu")
        })
      : null
  );
}
