#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

// Parse CLI args
const args = process.argv.slice(2);
let apiUrl = process.env.LEGITBLOCK_API_URL || "http://localhost:3000";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url" && args[i + 1]) {
    apiUrl = args[i + 1];
    i++;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
LegitBlock Ink CLI — Terminal Client for Organizational Blockchain & Voting

Usage:
  legitblock-cli [options]

Options:
  --url <url>    Next.js API server base URL (default: http://localhost:3000)
  --help, -h     Show this help message

Features:
  - LDAP member authentication and session management
  - Browse documents, edit with local $EDITOR (nano/vim), and submit amendment proposals
  - Propose new organizational documents via $EDITOR
  - Cast democratic votes on active proposals (Approve, Reject, Abstain)
  - Execute passed proposals and seal blocks into the blockchain
  - Inspect cryptographic blocks and verify SHA-256 chain integrity
`);
    process.exit(0);
  }
}

// Render Ink React Application
render(React.createElement(App, { apiUrl }));
