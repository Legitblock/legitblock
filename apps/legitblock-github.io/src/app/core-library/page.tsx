import React from "react";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";
import { CodeBlock } from "../../components/CodeBlock";
import { 
  Cpu, 
  Layers, 
  FileCode, 
  Vote, 
  FileDiff, 
  Users, 
  Database,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function CoreLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Developer Reference</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              packages/legitblock-utils Core Library
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Complete JavaScript API documentation for the headless LegitBlock blockchain, document diffing engine, quorum voting system, and LDAP enterprise authentication.
            </p>
          </div>

          {/* Installation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Installation</h2>
            <CodeBlock
              language="bash"
              title="Terminal"
              code={`# In a pnpm monorepo workspace:
pnpm add @legitblock/legitblock-utils

# Or via npm/yarn:
npm install @legitblock/legitblock-utils`}
            />
          </section>

          {/* Module 1: Blockchain & Block */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              1. Blockchain &amp; Block Engine
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              The <code className="text-slate-900 font-mono">Blockchain</code> class manages chain integrity, genesis instantiation, proof-of-work mining, and cryptographic verification.
            </p>

            <CodeBlock
              language="javascript"
              title="blockchain-example.js"
              code={`import { Blockchain, Block } from "@legitblock/legitblock-utils";

// 1. Initialize a new corporate blockchain
const chain = new Blockchain({
  difficulty: 2, // PoW leading zeros required
  miningReward: 0
});

// 2. Create the Genesis Block with initial founding articles
const genesisBlock = chain.createGenesisBlock({
  organization: "Apex Innovations Cooperative",
  jurisdiction: "Delaware",
  foundingDate: "2026-09-08",
  initialDocumentCount: 3
});
console.log("Genesis Hash:", genesisBlock.hash);

// 3. Mine a new document ratification block
const newBlock = chain.mineBlock({
  type: "DOCUMENT_RATIFICATION",
  documentId: "doc-bylaws-v1",
  documentTitle: "Corporate Bylaws",
  version: "1.0",
  ratifiedBy: "board-quorum",
  votes: { yes: 5, no: 0 }
});

// 4. Verify complete chain integrity
const isValid = chain.isValid();
console.log("Is blockchain 100% valid?", isValid); // true`}
            />
          </section>

          {/* Module 2: Document & Diff Engine */}
          <section id="diff-engine" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileDiff className="w-5 h-5 text-emerald-600" />
              2. Document Management &amp; Structured Diff Engine
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Every document has an immutable version history. Changes are never applied blindly; the <code className="text-slate-900 font-mono">DiffEngine</code> computes structured deltas that are attached to voting proposals.
            </p>

            <CodeBlock
              language="javascript"
              title="diff-example.js"
              code={`import { 
  Document, 
  DocumentCategory, 
  computeUnifiedDiff, 
  computeStructuredDiff,
  formatDiffTerminal 
} from "@legitblock/legitblock-utils";

// Initialize base founding document
const charter = new Document({
  id: "charter-001",
  title: "Articles of Incorporation",
  category: DocumentCategory.FOUNDING,
  version: "1.0",
  content: "# Articles of Incorporation\\nCommon Stock: 10,000,000 shares."
});

// New proposed amendment text
const amendedContent = "# Articles of Incorporation\\nCommon Stock: 20,000,000 shares.";

// 1. Generate unified git-style diff
const unifiedDiff = computeUnifiedDiff(charter.content, amendedContent);
console.log(unifiedDiff);

// 2. Generate structured line-by-line delta
const structured = computeStructuredDiff(charter.content, amendedContent);
console.log(\`Added: \${structured.additions}, Removed: \${structured.deletions}\`);

// 3. Format colored diff for terminal output
console.log(formatDiffTerminal(unifiedDiff));`}
            />
          </section>

          {/* Module 3: Voting Engine & Quorum Rules */}
          <section id="voting-rules" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-600" />
              3. Voting Engine &amp; Quorum Rules
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              The <code className="text-slate-900 font-mono">VotingEngine</code> guarantees that no document is enacted without satisfying its statutory quorum and passing thresholds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Simple Majority</span>
                <span className="text-xs text-slate-500 font-mono">&gt;50% affirmative, 50% quorum. For routine resolutions and officer appointments.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Supermajority (2/3)</span>
                <span className="text-xs text-slate-500 font-mono">&ge;66.7% affirmative. Required for Bylaw &amp; Charter amendments.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Supermajority (3/4)</span>
                <span className="text-xs text-slate-500 font-mono">&ge;75% affirmative. For major transactions, mergers, or recapitalizations.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Unanimous / Consensus</span>
                <span className="text-xs text-slate-500 font-mono">100% agreement with 0 dissenting votes. For founder departures or dissolution.</span>
              </div>
            </div>

            <CodeBlock
              language="javascript"
              title="voting-example.js"
              code={`import { VotingEngine, DefaultVotingRules, VoteDecision } from "@legitblock/legitblock-utils";

const engine = new VotingEngine({
  eligibleMembers: ["alice", "bob", "carol"],
  votingRule: DefaultVotingRules.SUPERMAJORITY_TWO_THIRDS
});

// 1. Create amendment proposal
const proposal = engine.createProposal({
  title: "Increase Option Pool by 10%",
  description: "Board resolution to expand equity incentive reserve.",
  proposer: "alice",
  documentId: "charter-001",
  proposedContent: amendedContent,
  rule: DefaultVotingRules.SUPERMAJORITY_TWO_THIRDS
});

// 2. Cast cryptographic ballots
engine.castVote(proposal.id, "alice", VoteDecision.YES, "Approved as CEO");
engine.castVote(proposal.id, "bob", VoteDecision.YES, "Approved as Investor Director");

// 3. Evaluate quorum
const status = engine.evaluateProposal(proposal.id);
console.log("Proposal Status:", status); // "PASSED" (2 of 3 votes = 66.7% >= threshold)

// 4. Automatically commit to blockchain
if (status === "PASSED") {
  const block = engine.commitPassedProposalToChain(proposal.id, chain);
  console.log("Committed to Block #", block.index);
}`}
            />
          </section>

          {/* Module 4: LDAP Authentication */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              4. LDAP Enterprise Authentication &amp; Mock Directory
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              LegitBlock connects directly to institutional LDAP / Active Directory servers so members sign in with existing corporate credentials. A full in-memory mock LDAP directory with 6 demo roles is included out of the box.
            </p>

            <CodeBlock
              language="javascript"
              title="ldap-example.js"
              code={`import { LDAPAuthProvider, MOCK_LDAP_USERS } from "@legitblock/legitblock-utils";

const auth = new LDAPAuthProvider({
  url: process.env.LDAP_URL || "ldap://localhost:1389",
  bindDN: "cn=admin,dc=legitblock,dc=org",
  bindCredentials: process.env.LDAP_PASSWORD,
  searchBase: "ou=users,dc=legitblock,dc=org"
});

// Authenticate user credentials
const user = await auth.authenticate("alice.chair", "password123");
console.log("Logged in:", user.displayName, "Role:", user.role);`}
            />
          </section>

          {/* Navigation link */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-semibold">
            <Link href="/architecture" className="text-slate-500 hover:text-slate-800">
              ← System Architecture
            </Link>
            <Link href="/web-app" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Next.js Web Application Guide →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
