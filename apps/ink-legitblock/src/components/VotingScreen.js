import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";

const h = React.createElement;

export function VotingScreen({ client, onBack }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [message, setMessage] = useState("");

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await client.getProposals();
      setProposals(res.proposals || []);
    } catch (err) {
      setMessage("Failed to load proposals: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleSelectProposal = (item) => {
    if (item.value === "back") {
      onBack();
      return;
    }
    const prop = proposals.find(p => p.id === item.value);
    setSelectedProp(prop);
  };

  const handleVote = async (decision) => {
    setLoading(true);
    try {
      await client.castVote(selectedProp.id, decision);
      setMessage(`✅ Successfully cast ${decision} vote on proposal!`);
      const updated = await client.getProposal(selectedProp.id);
      setSelectedProp(updated.proposal);
      loadProposals();
    } catch (err) {
      setMessage("Failed to cast vote: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await client.executeProposal(selectedProp.id);
      setMessage(`🎉 Successfully ratified and executed into Block #${res.block?.index} on Blockchain!`);
      const updated = await client.getProposal(selectedProp.id);
      setSelectedProp(updated.proposal);
      loadProposals();
    } catch (err) {
      setMessage("Failed to execute proposal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return h(Text, { color: "yellow" }, "Connecting to governance engine...");
  }

  if (selectedProp) {
    const t = selectedProp.tally || {};
    const canExecute = (selectedProp.status === "PASSED" || (selectedProp.status === "ACTIVE" && t.passed)) && selectedProp.status !== "EXECUTED";

    const actions = [];
    if (selectedProp.status === "ACTIVE") {
      actions.push({ label: "👍  1. Cast Vote: APPROVE", value: "APPROVE" });
      actions.push({ label: "👎  2. Cast Vote: REJECT", value: "REJECT" });
      actions.push({ label: "⚪  3. Cast Vote: ABSTAIN", value: "ABSTAIN" });
    }
    if (canExecute) {
      actions.push({ label: "⚡  Execute & Commit Block to Blockchain", value: "EXECUTE" });
    }
    actions.push({ label: "←  Back to Proposals List", value: "back" });

    return h(
      Box,
      { flexDirection: "column", borderStyle: "single", borderColor: "magenta", padding: 1 },
      h(
        Box,
        { justifyContent: "space-between" },
        h(Text, { bold: true, color: "magenta" }, selectedProp.title),
        h(Text, { bold: true, color: selectedProp.status === "EXECUTED" ? "green" : "yellow" }, `[${selectedProp.status}]`)
      ),
      h(Text, { color: "gray" }, selectedProp.description),
      h(Text, { color: "gray" }, `Proposer: ${selectedProp.proposer?.name || selectedProp.proposer?.id} | Rule: ${selectedProp.votingRule?.name}`),

      h(
        Box,
        { flexDirection: "column", marginY: 1, borderStyle: "round", borderColor: "gray", paddingX: 1 },
        h(Text, { bold: true }, "Live Vote Tally:"),
        h(
          Text,
          null,
          "Approvals: ",
          h(Text, { bold: true, color: "green" }, t.approve || 0),
          " | Rejections: ",
          h(Text, { bold: true, color: "red" }, t.reject || 0),
          " | Abstentions: ",
          t.abstain || 0
        ),
        h(
          Text,
          null,
          `Quorum: ${t.total || 0}/${t.totalEligible || 1} (${(((t.total || 0)/(t.totalEligible || 1))*100).toFixed(0)}%) `,
          t.quorumMet ? "✅ Met" : "⏳ Pending",
          " | Threshold: ",
          t.thresholdMet ? "✅ Met" : "⏳ Pending"
        ),
        t.reason ? h(Text, { color: "cyan" }, `Status: ${t.reason}`) : null
      ),

      selectedProp.documentData?.diff
        ? h(
            Box,
            { flexDirection: "column", marginBottom: 1 },
            h(Text, { bold: true, color: "yellow" }, "Proposed Diff:"),
            h(Box, { borderStyle: "single", borderColor: "gray", padding: 1 }, h(Text, { color: "green" }, selectedProp.documentData.diff))
          )
        : null,

      message ? h(Text, { color: "green", bold: true, marginBottom: 1 }, message) : null,

      h(SelectInput, {
        items: actions,
        onSelect: (item) => {
          if (item.value === "back") setSelectedProp(null);
          else if (item.value === "EXECUTE") handleExecute();
          else handleVote(item.value);
        }
      })
    );
  }

  const items = [
    ...proposals.map(p => ({
      label: `[${p.status}] ${p.title} (${Object.keys(p.votes || {}).length} votes)`,
      value: p.id
    })),
    { label: "← Back to Main Menu", value: "back" }
  ];

  return h(
    Box,
    { flexDirection: "column", borderStyle: "single", borderColor: "magenta", padding: 1 },
    h(Text, { bold: true, color: "magenta" }, "🗳️  Governance & Voting Proposals"),
    h(Text, { color: "gray", marginBottom: 1 }, "Select a proposal to inspect tally or cast vote:"),
    message ? h(Text, { color: "yellow", marginBottom: 1 }, message) : null,
    h(SelectInput, { items, onSelect: handleSelectProposal })
  );
}
