(()=>{var e={};e.id=254,e.ids=[254],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8622:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>o.a,__next_app__:()=>p,originalPathname:()=>m,pages:()=>d,routeModule:()=>h,tree:()=>c}),s(9128),s(5185),s(8714);var a=s(3653),i=s(4966),r=s(6070),o=s.n(r),l=s(2555),n={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>l[e]);s.d(t,n);let c=["",{children:["core-library",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,9128)),"/home/thoth/legitblock/apps/legitblock-github.io/src/app/core-library/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,5185)),"/home/thoth/legitblock/apps/legitblock-github.io/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,8714,23)),"next/dist/client/components/not-found-error"]}],d=["/home/thoth/legitblock/apps/legitblock-github.io/src/app/core-library/page.tsx"],m="/core-library/page",p={require:s,loadChunk:()=>Promise.resolve()},h=new a.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/core-library/page",pathname:"/core-library",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},8759:(e,t,s)=>{Promise.resolve().then(s.bind(s,8630)),Promise.resolve().then(s.bind(s,1506)),Promise.resolve().then(s.t.bind(s,307,23))},8630:(e,t,s)=>{"use strict";s.d(t,{CodeBlock:()=>c});var a=s(2064),i=s(5032),r=s(5555);let o=(0,r.Z)("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]),l=(0,r.Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),n=(0,r.Z)("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);function c({code:e,language:t="bash",title:s,showLineNumbers:r=!1}){let[c,d]=(0,i.useState)(!1),m=async()=>{try{await navigator.clipboard.writeText(e),d(!0),setTimeout(()=>d(!1),2e3)}catch(e){console.error("Failed to copy code",e)}},p=e.trim().split("\n");return(0,a.jsxs)("div",{className:"rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 my-4 shadow-lg",children:[(s||t)&&(0,a.jsxs)("div",{className:"flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:["bash"===t||"sh"===t?a.jsx(o,{className:"w-3.5 h-3.5 text-emerald-400"}):a.jsx("div",{className:"w-2 h-2 rounded-full bg-emerald-500"}),a.jsx("span",{className:"font-mono font-medium text-slate-300",children:s||t})]}),a.jsx("button",{onClick:m,className:"flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]",title:"Copy to clipboard",children:c?(0,a.jsxs)(a.Fragment,{children:[a.jsx(l,{className:"w-3.5 h-3.5 text-emerald-400"}),a.jsx("span",{className:"text-emerald-400",children:"Copied!"})]}):(0,a.jsxs)(a.Fragment,{children:[a.jsx(n,{className:"w-3.5 h-3.5"}),a.jsx("span",{children:"Copy"})]})})]}),a.jsx("div",{className:"p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed",children:r?a.jsx("table",{className:"w-full border-collapse",children:a.jsx("tbody",{children:p.map((e,t)=>(0,a.jsxs)("tr",{className:"hover:bg-slate-900/40",children:[a.jsx("td",{className:"pr-4 select-none text-slate-600 text-right w-8",children:t+1}),a.jsx("td",{className:"text-slate-200 whitespace-pre",children:e})]},t))})}):a.jsx("pre",{className:"text-slate-200 whitespace-pre",children:a.jsx("code",{children:e.trim()})})})]})}},1506:(e,t,s)=>{"use strict";s.d(t,{Sidebar:()=>d});var a=s(2064);s(5032);var i=s(4002),r=s(303);let o=[{title:"Overview & Philosophy",items:[{title:"Introduction",href:"/",description:"Overview of LegitBlock institutional governance framework."},{title:"Why Blockchain?",href:"/why-blockchain",description:"Why organizations must store founding documents & voting on-chain.",badge:"Essential"},{title:"Architecture",href:"/architecture",description:"Monorepo design, cryptographic flow, and component boundaries."}]},{title:"Core Library",items:[{title:"legitblock-utils",href:"/core-library",description:"Core JS library: Blockchain, Documents, VotingEngine, LDAP, Storage."},{title:"Voting & Quorum Rules",href:"/core-library#voting-rules",description:"Simple majority, supermajority, unanimous, and consensus rules."},{title:"Document Diff Engine",href:"/core-library#diff-engine",description:"Structured line-by-line diffs and automated proposal creation."}]},{title:"Applications",items:[{title:"Next.js Web Application",href:"/web-app",description:"Setup wizard, document manager, voting portal, block explorer."},{title:"Ink Terminal CLI",href:"/cli",description:"Terminal client with $EDITOR integration for command-line governance."},{title:"API Reference",href:"/api-reference",description:"All 17 REST API endpoints with request and response specs."}]},{title:"Templates & Tools",items:[{title:"Template Encyclopedia (32)",href:"/templates",description:"For-Profit, Non-Profit, and Cooperative legal templates.",badge:"32 Templates"},{title:"Interactive Sandbox",href:"/playground",description:"Simulate mining, voting, and tamper detection in your browser.",badge:"Interactive"}]}];var l=s(5555);let n=(0,l.Z)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]),c=(0,l.Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);function d(){let e=(0,r.usePathname)();return a.jsx("aside",{className:"w-64 flex-shrink-0 hidden lg:block pr-6 py-6 border-r border-slate-200 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto",children:(0,a.jsxs)("div",{className:"space-y-8",children:[o.map((t,s)=>(0,a.jsxs)("div",{children:[a.jsx("h3",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2",children:t.title}),a.jsx("ul",{className:"space-y-1",children:t.items.map(t=>{let s=e===t.href||t.href.includes("#")&&e===t.href.split("#")[0];return a.jsx("li",{children:(0,a.jsxs)(i.default,{href:t.href,className:`group flex items-center justify-between px-2.5 py-1.5 text-sm rounded-lg transition-all ${s?"bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600 pl-2":"text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"}`,children:[a.jsx("span",{className:"truncate",children:t.title}),t.badge&&a.jsx("span",{className:`text-[10px] font-bold px-1.5 py-0.5 rounded ${"Essential"===t.badge?"bg-amber-100 text-amber-800 border border-amber-200":"Interactive"===t.badge?"bg-emerald-100 text-emerald-800 border border-emerald-200":"bg-slate-100 text-slate-600"}`,children:t.badge})]})},t.href)})})]},s)),(0,a.jsxs)("div",{className:"p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 text-emerald-950",children:[(0,a.jsxs)("div",{className:"flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1",children:[a.jsx(n,{className:"w-3.5 h-3.5"}),"Live Sandbox"]}),a.jsx("p",{className:"text-xs text-slate-600 mb-3",children:"Mine blocks, simulate quorum votes, and test blockchain tamper detection."}),(0,a.jsxs)(i.default,{href:"/playground",className:"inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline",children:["Launch simulator ",a.jsx(c,{className:"w-3.5 h-3.5"})]})]})]})})}},9128:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>h});var a=s(9222);s(657);var i=s(3023),r=s(2882),o=s(9668),l=s(4675),n=s(6738),c=s(7909);let d=(0,c.Z)("FileDiff",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M9 10h6",key:"9gxzsh"}],["path",{d:"M12 13V7",key:"h0r20n"}],["path",{d:"M9 17h6",key:"r8uit2"}]]);var m=s(1719);let p=(0,c.Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);function h(){return a.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10",children:(0,a.jsxs)("div",{className:"flex gap-10",children:[a.jsx(r.Y,{}),(0,a.jsxs)("article",{className:"flex-1 max-w-4xl min-w-0 space-y-12",children:[(0,a.jsxs)("div",{className:"border-b border-slate-200 pb-8 space-y-4",children:[(0,a.jsxs)("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300",children:[a.jsx(l.Z,{className:"w-4 h-4 text-emerald-600"}),a.jsx("span",{children:"Developer Reference"})]}),a.jsx("h1",{className:"text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight",children:"packages/legitblock-utils Core Library"}),a.jsx("p",{className:"text-base text-slate-600 leading-relaxed",children:"Complete JavaScript API documentation for the headless LegitBlock blockchain, document diffing engine, quorum voting system, and LDAP enterprise authentication."})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[a.jsx("h2",{className:"text-2xl font-bold text-slate-900",children:"Installation"}),a.jsx(o.d,{language:"bash",title:"Terminal",code:`# In a pnpm monorepo workspace:
pnpm add @legitblock/legitblock-utils

# Or via npm/yarn:
npm install @legitblock/legitblock-utils`})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-slate-900 flex items-center gap-2",children:[a.jsx(n.Z,{className:"w-5 h-5 text-emerald-600"}),"1. Blockchain & Block Engine"]}),(0,a.jsxs)("p",{className:"text-slate-700 text-sm leading-relaxed",children:["The ",a.jsx("code",{className:"text-slate-900 font-mono",children:"Blockchain"})," class manages chain integrity, genesis instantiation, proof-of-work mining, and cryptographic verification."]}),a.jsx(o.d,{language:"javascript",title:"blockchain-example.js",code:`import { Blockchain, Block } from "@legitblock/legitblock-utils";

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
console.log("Is blockchain 100% valid?", isValid); // true`})]}),(0,a.jsxs)("section",{id:"diff-engine",className:"space-y-4",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-slate-900 flex items-center gap-2",children:[a.jsx(d,{className:"w-5 h-5 text-emerald-600"}),"2. Document Management & Structured Diff Engine"]}),(0,a.jsxs)("p",{className:"text-slate-700 text-sm leading-relaxed",children:["Every document has an immutable version history. Changes are never applied blindly; the ",a.jsx("code",{className:"text-slate-900 font-mono",children:"DiffEngine"})," computes structured deltas that are attached to voting proposals."]}),a.jsx(o.d,{language:"javascript",title:"diff-example.js",code:`import { 
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
console.log(formatDiffTerminal(unifiedDiff));`})]}),(0,a.jsxs)("section",{id:"voting-rules",className:"space-y-4",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-slate-900 flex items-center gap-2",children:[a.jsx(m.Z,{className:"w-5 h-5 text-emerald-600"}),"3. Voting Engine & Quorum Rules"]}),(0,a.jsxs)("p",{className:"text-slate-700 text-sm leading-relaxed",children:["The ",a.jsx("code",{className:"text-slate-900 font-mono",children:"VotingEngine"})," guarantees that no document is enacted without satisfying its statutory quorum and passing thresholds."]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 my-4",children:[(0,a.jsxs)("div",{className:"p-3.5 rounded-xl border border-slate-200 bg-white",children:[a.jsx("span",{className:"font-bold text-sm text-slate-900 block mb-1",children:"Simple Majority"}),a.jsx("span",{className:"text-xs text-slate-500 font-mono",children:">50% affirmative, 50% quorum. For routine resolutions and officer appointments."})]}),(0,a.jsxs)("div",{className:"p-3.5 rounded-xl border border-slate-200 bg-white",children:[a.jsx("span",{className:"font-bold text-sm text-slate-900 block mb-1",children:"Supermajority (2/3)"}),a.jsx("span",{className:"text-xs text-slate-500 font-mono",children:"≥66.7% affirmative. Required for Bylaw & Charter amendments."})]}),(0,a.jsxs)("div",{className:"p-3.5 rounded-xl border border-slate-200 bg-white",children:[a.jsx("span",{className:"font-bold text-sm text-slate-900 block mb-1",children:"Supermajority (3/4)"}),a.jsx("span",{className:"text-xs text-slate-500 font-mono",children:"≥75% affirmative. For major transactions, mergers, or recapitalizations."})]}),(0,a.jsxs)("div",{className:"p-3.5 rounded-xl border border-slate-200 bg-white",children:[a.jsx("span",{className:"font-bold text-sm text-slate-900 block mb-1",children:"Unanimous / Consensus"}),a.jsx("span",{className:"text-xs text-slate-500 font-mono",children:"100% agreement with 0 dissenting votes. For founder departures or dissolution."})]})]}),a.jsx(o.d,{language:"javascript",title:"voting-example.js",code:`import { VotingEngine, DefaultVotingRules, VoteDecision } from "@legitblock/legitblock-utils";

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
}`})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-slate-900 flex items-center gap-2",children:[a.jsx(p,{className:"w-5 h-5 text-emerald-600"}),"4. LDAP Enterprise Authentication & Mock Directory"]}),a.jsx("p",{className:"text-slate-700 text-sm leading-relaxed",children:"LegitBlock connects directly to institutional LDAP / Active Directory servers so members sign in with existing corporate credentials. A full in-memory mock LDAP directory with 6 demo roles is included out of the box."}),a.jsx(o.d,{language:"javascript",title:"ldap-example.js",code:`import { LDAPAuthProvider, MOCK_LDAP_USERS } from "@legitblock/legitblock-utils";

const auth = new LDAPAuthProvider({
  url: process.env.LDAP_URL || "ldap://localhost:1389",
  bindDN: "cn=admin,dc=legitblock,dc=org",
  bindCredentials: process.env.LDAP_PASSWORD,
  searchBase: "ou=users,dc=legitblock,dc=org"
});

// Authenticate user credentials
const user = await auth.authenticate("alice.chair", "password123");
console.log("Logged in:", user.displayName, "Role:", user.role);`})]}),(0,a.jsxs)("div",{className:"pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-semibold",children:[a.jsx(i.default,{href:"/architecture",className:"text-slate-500 hover:text-slate-800",children:"← System Architecture"}),a.jsx(i.default,{href:"/web-app",className:"text-emerald-600 hover:text-emerald-700 flex items-center gap-1",children:"Next.js Web Application Guide →"})]})]})]})})}},9668:(e,t,s)=>{"use strict";s.d(t,{d:()=>a});let a=(0,s(1924).createProxy)(String.raw`/home/thoth/legitblock/apps/legitblock-github.io/src/components/CodeBlock.tsx#CodeBlock`)},2882:(e,t,s)=>{"use strict";s.d(t,{Y:()=>a});let a=(0,s(1924).createProxy)(String.raw`/home/thoth/legitblock/apps/legitblock-github.io/src/components/Sidebar.tsx#Sidebar`)},4675:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});let a=(0,s(7909).Z)("Cpu",[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]])},6738:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});let a=(0,s(7909).Z)("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]])},1719:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});let a=(0,s(7909).Z)("Vote",[["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}],["path",{d:"M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z",key:"1ezoue"}],["path",{d:"M22 19H2",key:"nuriw5"}]])}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[519,960],()=>s(8622));module.exports=a})();