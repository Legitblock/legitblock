export interface TemplateGovernance {
  governingBody: string;
  votingMethod: string;
  defaultQuorumPercentage: number;
  defaultPassingThresholdPercentage: number;
  officerRoles: string[];
}

export interface TemplateDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  content: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: "for-profit" | "non-profit" | "cooperative";
  description: string;
  governance: TemplateGovernance;
  initialDocuments: TemplateDocument[];
}

export const TEMPLATES_DATA: TemplateItem[] = [
  {
    "id": "c_corp",
    "name": "C Corporation (General For-Profit)",
    "category": "for-profit",
    "description": "Standard corporate structure with limited liability, board of directors, officers, and flexible stock classes for investment.",
    "governance": {
      "governingBody": "Board of Directors",
      "votingMethod": "share-weighted",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Chief Executive Officer",
        "President",
        "Secretary",
        "Chief Financial Officer",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-c-corp-articles-of-incorporation",
        "title": "Articles of Incorporation",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Incorporation of the Corporation\n\n## Article I: Name\nThe name of the corporation shall be as designated in this blockchain ledger.\n\n## Article II: Purpose\nThe purpose of the corporation is to engage in any lawful act or activity for which corporations may be organized under the General Corporation Law.\n\n## Article III: Authorized Capital Stock\nThe total number of shares of stock which the corporation shall have authority to issue is 10,000,000 shares of Common Stock, par value $0.0001 per share.\n\n## Article IV: Board of Directors\nThe business and affairs of the corporation shall be managed by or under the direction of the Board of Directors. The initial Board shall be ratified upon genesis.\n\n## Article V: LegitBlock Protocol\nAll corporate records, minutes, stock ledgers, and amendments shall be cryptographically maintained and ratified on the LegitBlock blockchain.\n"
      },
      {
        "id": "doc-c-corp-bylaws",
        "title": "Corporate Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Corporate Bylaws\n\n## Section 1: Stockholders Meetings\n1.1 Annual Meeting: Held annually at a time and date fixed by the Board of Directors.\n1.2 Notice: Notice shall be given not less than 10 nor more than 60 days before the meeting date.\n1.3 Quorum: A majority of the voting power of the shares entitled to vote shall constitute a quorum.\n\n## Section 2: Board of Directors\n2.1 Powers: The business and affairs of the Corporation shall be managed by its Board of Directors.\n2.2 Election and Term: Directors shall be elected at each annual meeting of stockholders.\n2.3 Action by Blockchain Vote: Any action required or permitted to be taken at any meeting of the Board may be taken by cryptographic vote on the LegitBlock ledger.\n\n## Section 3: Officers\n3.1 Executive Officers: The officers of the Corporation shall include a Chief Executive Officer, President, Secretary, and Chief Financial Officer.\n"
      },
      {
        "id": "doc-c-corp-initial-resolutions",
        "title": "Initial Board Resolutions",
        "category": "resolution",
        "version": "1.0",
        "content": "# Action by Unanimous Written Consent of the Initial Board of Directors\n\nThe undersigned, constituting all the directors of the Corporation, hereby adopt the following resolutions:\n\n1. Adoption of Bylaws: The Bylaws presented to the Board are hereby adopted as the Bylaws of this Corporation.\n2. Election of Officers: The founding executive officers are hereby elected to their designated roles.\n3. Adoption of LegitBlock: Resolved that the LegitBlock blockchain shall serve as the official, authoritative record of corporate governance and document ratifications.\n"
      }
    ]
  },
  {
    "id": "s_corp",
    "name": "S Corporation (Pass-Through Taxed)",
    "category": "for-profit",
    "description": "Domestic corporation electing pass-through taxation under Subchapter S of the Internal Revenue Code, limited to 100 eligible shareholders.",
    "governance": {
      "governingBody": "Board of Directors",
      "votingMethod": "share-weighted",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-s-corp-articles",
        "title": "Articles of Incorporation (S-Corp)",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Incorporation (S Corporation)\n\n## Article I: Entity Name\nThe name of the corporation is set forth in the organization registration.\n\n## Article II: Corporate Purpose\nTo engage in any lawful commercial enterprise with taxation under Subchapter S of the Internal Revenue Code.\n\n## Article III: Capital Stock & Single Class Limitation\nThe corporation shall have authority to issue a single class of common stock with identical liquidation and distribution rights to strictly comply with IRC Section 1361(b)(1)(D).\n\n## Article IV: S-Corporation Eligibility Restrictions\nNo shares may be transferred to any non-resident alien, corporation, or ineligible trust that would terminate S-Corporation status.\n"
      },
      {
        "id": "doc-s-corp-bylaws",
        "title": "S Corporation Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# S Corporation Bylaws\n\n## Article 1: Shareholder Restrictions\n1.1 Maximum Shareholders: At no time shall the corporation have more than 100 shareholders.\n1.2 Prohibited Transfers: Any transfer that would void the S election is void ab initio.\n\n## Article 2: Governance & Voting\n2.1 Board Authority: The Board of Directors governs operations.\n2.2 LegitBlock Ledger: Shareholder consent and board voting are conducted and archived on the LegitBlock network.\n"
      }
    ]
  },
  {
    "id": "llc_multi",
    "name": "Limited Liability Company (LLC - Multi-Member / Manager-Managed)",
    "category": "for-profit",
    "description": "Flexible entity structure with limited liability, pass-through taxation, and customizable operating agreement managed by appointed managers or members.",
    "governance": {
      "governingBody": "Board of Managers",
      "votingMethod": "percentage-interest",
      "defaultQuorumPercentage": 51,
      "defaultPassingThresholdPercentage": 51,
      "officerRoles": [
        "Managing Member",
        "Manager",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-llc-articles-of-org",
        "title": "Articles of Organization",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Organization of Limited Liability Company\n\n## Article 1: Company Name\nThe name of the limited liability company is recorded on this blockchain ledger.\n\n## Article 2: Registered Agent & Office\nThe registered office and agent shall be maintained in accordance with state statutory requirements.\n\n## Article 3: Management\nThe Company shall be Manager-Managed (or Member-Managed as elected in the Operating Agreement).\n"
      },
      {
        "id": "doc-llc-operating-agreement",
        "title": "Operating Agreement",
        "category": "governance",
        "version": "1.0",
        "content": "# Limited Liability Company Operating Agreement\n\n## Section 1: Formation and Purpose\n1.1 Formation: The Members hereby form a limited liability company pursuant to the applicable LLC Act.\n1.2 Purpose: The Company may conduct any lawful business or activity.\n\n## Section 2: Capital Contributions and Membership Interests\n2.1 Initial Contributions: Each Member has contributed capital in exchange for their percentage Membership Interest.\n2.2 Capital Accounts: Individual capital accounts shall be maintained for each Member.\n\n## Section 3: Management & Blockchain Ratification\n3.1 Manager Powers: The Managers shall have full and complete authority to make decisions on behalf of the Company.\n3.2 Major Decisions: Significant actions (mergers, dissolution, amending this Agreement) require approval of Members holding at least 66.7% Interest via LegitBlock vote.\n"
      }
    ]
  },
  {
    "id": "llc_single",
    "name": "Limited Liability Company (LLC - Single-Member)",
    "category": "for-profit",
    "description": "Simplified LLC owned by a single individual or entity, offering liability protection with disregarded entity tax treatment.",
    "governance": {
      "governingBody": "Sole Member",
      "votingMethod": "unanimous",
      "defaultQuorumPercentage": 100,
      "defaultPassingThresholdPercentage": 100,
      "officerRoles": [
        "Sole Managing Member",
        "President"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-llc-single-operating-agreement",
        "title": "Single-Member Operating Agreement",
        "category": "governance",
        "version": "1.0",
        "content": "# Single-Member LLC Operating Agreement\n\n## 1. Sole Member & Ownership\nThe undersigned is the sole Member owning 100% of the membership interests of the Company.\n\n## 2. Limited Liability\nThe debts, obligations, and liabilities of the Company shall be solely the debts and liabilities of the Company.\n\n## 3. Blockchain Governance\nAll official resolutions, capital contributions, and document updates are permanently timestamped on the LegitBlock network.\n"
      }
    ]
  },
  {
    "id": "general_partnership",
    "name": "General Partnership (GP)",
    "category": "for-profit",
    "description": "Association of two or more co-owners conducting business for profit, sharing management and joint and several liability.",
    "governance": {
      "governingBody": "Partners Assembly",
      "votingMethod": "one-partner-one-vote",
      "defaultQuorumPercentage": 66.67,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Managing Partner",
        "Administrative Partner"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-gp-partnership-agreement",
        "title": "General Partnership Agreement",
        "category": "founding",
        "version": "1.0",
        "content": "# General Partnership Agreement\n\n## 1. Partnership Formation\nThe Partners hereby agree to form a General Partnership to operate the designated business.\n\n## 2. Capital Contributions & Profit Sharing\nProfits and losses shall be shared equally among the Partners unless otherwise specified on the LegitBlock ledger.\n\n## 3. Management & Partner Voting\nEach Partner has equal rights in the management of the partnership. Ordinary matters are decided by majority vote. Fundamental changes require unanimous written consent recorded on the blockchain.\n"
      }
    ]
  },
  {
    "id": "limited_partnership",
    "name": "Limited Partnership (LP)",
    "category": "for-profit",
    "description": "Partnership with one or more general partners with unlimited liability and management control, and limited partners with liability capped to investment.",
    "governance": {
      "governingBody": "General Partner(s)",
      "votingMethod": "capital-weighted",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "General Partner",
        "Managing Director"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-lp-agreement",
        "title": "Limited Partnership Agreement",
        "category": "founding",
        "version": "1.0",
        "content": "# Limited Partnership Agreement\n\n## 1. Roles of Partners\n1.1 General Partner: Holds exclusive operational and management control and full liability.\n1.2 Limited Partners: Passive investors with liability strictly limited to their capital commitment.\n\n## 2. Distributions & Waterfalls\nNet cash flow shall be distributed in accordance with the capital accounts and distribution waterfall recorded on the LegitBlock ledger.\n"
      }
    ]
  },
  {
    "id": "llp",
    "name": "Limited Liability Partnership (LLP)",
    "category": "for-profit",
    "description": "Partnership offering partners personal liability protection against the negligence and malpractice of other partners, ideal for professional practices.",
    "governance": {
      "governingBody": "Managing Partners Committee",
      "votingMethod": "one-partner-one-vote",
      "defaultQuorumPercentage": 60,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Managing Partner",
        "Senior Partner",
        "Ethics Officer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-llp-agreement",
        "title": "Limited Liability Partnership Agreement",
        "category": "founding",
        "version": "1.0",
        "content": "# Limited Liability Partnership Agreement\n\n## 1. Limited Liability Protection\nNo Partner shall be personally liable for any debt or obligation of the Partnership arising from malpractice or negligence of another Partner.\n\n## 2. Governance\nOperational decisions are determined by the Managing Committee. Major decisions require ratification by vote on LegitBlock.\n"
      }
    ]
  },
  {
    "id": "b_corp",
    "name": "Benefit Corporation (B Corp / Public Benefit Corp)",
    "category": "for-profit",
    "description": "For-profit corporation committed to public benefit, social impact, environmental sustainability, and accountability to all stakeholders.",
    "governance": {
      "governingBody": "Board of Directors",
      "votingMethod": "share-weighted",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 66.67,
      "officerRoles": [
        "CEO",
        "Chief Impact Officer",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-b-corp-articles",
        "title": "Public Benefit Articles of Incorporation",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Incorporation of Public Benefit Corporation\n\n## Article I: Public Benefit Purpose\nIn addition to generating profit, the Corporation is dedicated to creating a general public benefit: a material positive impact on society and the environment, taken as a whole.\n\n## Article II: Stakeholder Governance\nDirectors shall consider the effects of any action upon shareholders, employees, suppliers, the community, and local and global environment.\n\n## Article III: LegitBlock Transparency\nAnnual Benefit Reports and stakeholder resolutions shall be published on the immutable LegitBlock blockchain.\n"
      },
      {
        "id": "doc-b-corp-bylaws",
        "title": "Benefit Corporation Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Benefit Corporation Bylaws\n\n## Section 1: Annual Benefit Report\nThe Board shall produce an annual benefit report assessed against a third-party standard and ratified by blockchain vote.\n"
      }
    ]
  },
  {
    "id": "professional_corp",
    "name": "Professional Corporation (PC / PLLC)",
    "category": "for-profit",
    "description": "Corporate entity for licensed professionals (physicians, attorneys, architects, accountants) requiring proof of professional licensure.",
    "governance": {
      "governingBody": "Licensed Board of Directors",
      "votingMethod": "one-licensed-member-one-vote",
      "defaultQuorumPercentage": 60,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President (Licensed)",
        "Secretary",
        "Compliance Officer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-pc-articles",
        "title": "Articles of Incorporation (Professional Corporation)",
        "category": "founding",
        "version": "1.0",
        "content": "# Professional Corporation Articles\n\n## 1. Professional Licensure Requirement\nAll shareholders, directors, and officers practicing the profession shall be duly licensed and in good standing.\n\n## 2. Professional Ethics & Compliance\nThe corporation shall maintain active compliance with state licensing boards, archiving licensure verification on LegitBlock.\n"
      }
    ]
  },
  {
    "id": "close_corp",
    "name": "Close Corporation",
    "category": "for-profit",
    "description": "Corporation with a small number of shareholders that dispenses with corporate formalities and operates via shareholder agreement.",
    "governance": {
      "governingBody": "Shareholders in Direct Management",
      "votingMethod": "share-weighted",
      "defaultQuorumPercentage": 66.67,
      "defaultPassingThresholdPercentage": 66.67,
      "officerRoles": [
        "President",
        "Secretary"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-close-corp-agreement",
        "title": "Statutory Close Corporation Agreement",
        "category": "founding",
        "version": "1.0",
        "content": "# Close Corporation Shareholder Agreement\n\n## 1. Direct Shareholder Management\nThe business shall be managed directly by the shareholders without a formal board of directors.\n\n## 2. Transfer Restrictions\nNo share may be transferred without right of first refusal granted to existing shareholders on LegitBlock.\n"
      }
    ]
  },
  {
    "id": "sole_proprietorship",
    "name": "Sole Proprietorship",
    "category": "for-profit",
    "description": "Unincorporated business owned and run by one individual with complete operational control.",
    "governance": {
      "governingBody": "Sole Proprietor",
      "votingMethod": "unanimous",
      "defaultQuorumPercentage": 100,
      "defaultPassingThresholdPercentage": 100,
      "officerRoles": [
        "Owner / Principal"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-sole-prop-declaration",
        "title": "Sole Proprietorship Declaration & Charter",
        "category": "founding",
        "version": "1.0",
        "content": "# Sole Proprietorship Declaration\n\n## 1. Owner & Entity\nThe business is owned and managed by the designated sole proprietor.\n\n## 2. Ledger Record\nAll contracts, trademarks, and organizational records are timestamped on LegitBlock for verification.\n"
      }
    ]
  },
  {
    "id": "series_llc",
    "name": "Series LLC",
    "category": "for-profit",
    "description": "LLC structure providing separate series (cells) with segregated liability, assets, and operations under a master umbrella.",
    "governance": {
      "governingBody": "Master LLC Managers",
      "votingMethod": "percentage-interest",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Master Manager",
        "Series Manager"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-series-llc-agreement",
        "title": "Master Series LLC Operating Agreement",
        "category": "governance",
        "version": "1.0",
        "content": "# Master Series LLC Operating Agreement\n\n## 1. Segregation of Liabilities\nEach Series established on this LegitBlock ledger shall hold distinct assets, debts, and liabilities segregated from other series.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c3_public",
    "name": "501(c)(3) Public Charity",
    "category": "non-profit",
    "description": "Tax-exempt charitable, educational, or scientific organization supported broadly by the public with strict prohibition on private inurement.",
    "governance": {
      "governingBody": "Board of Trustees / Directors",
      "votingMethod": "one-trustee-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Board Chair / President",
        "Executive Director",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c3-articles",
        "title": "Articles of Incorporation (501(c)(3))",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Incorporation (Non-Profit 501(c)(3))\n\n## Article I: Organization Name\nThe name of the non-profit corporation is established on this ledger.\n\n## Article II: IRC 501(c)(3) Tax-Exempt Purpose\nThis Corporation is organized exclusively for charitable, religious, educational, and scientific purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code.\n\n## Article III: Inurement of Income\nNo part of the net earnings of the Corporation shall inure to the benefit of, or be distributable to, its directors, officers, or other private persons.\n\n## Article IV: Legislative and Political Activity\nNo substantial part of the activities of the Corporation shall be the carrying on of propaganda, or otherwise attempting to influence legislation, and the Corporation shall not participate in any political campaign.\n\n## Article V: Dissolution Clause\nUpon dissolution, assets shall be distributed for one or more exempt purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code or to the federal, state, or local government.\n"
      },
      {
        "id": "doc-501c3-bylaws",
        "title": "Non-Profit Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Bylaws of 501(c)(3) Public Charity\n\n## Article 1: Board of Directors\n1.1 Number and Powers: The Board shall consist of not fewer than 3 independent voting directors.\n1.2 Term: Directors shall serve staggered terms of three years.\n1.3 Meetings and Quorum: A majority of the directors in office shall constitute a quorum.\n\n## Article 2: LegitBlock Ratification\nAll board votes, grants approved, bylaws amended, and public disclosures must be recorded on the LegitBlock blockchain.\n"
      },
      {
        "id": "doc-501c3-conflict-of-interest",
        "title": "Conflict of Interest Policy",
        "category": "governance",
        "version": "1.0",
        "content": "# Conflict of Interest Policy\n\n## Purpose\nThe purpose of this policy is to protect the tax-exempt organization interests when contemplating a transaction that might benefit a director, officer, or key employee.\n\n## Duty to Disclose\nEach interested person must disclose the existence of financial interest and all material facts to the Board before any vote on LegitBlock.\n"
      },
      {
        "id": "doc-501c3-whistleblower",
        "title": "Whistleblower & Document Retention Policy",
        "category": "operational",
        "version": "1.0",
        "content": "# Whistleblower Protection and Record Retention Policy\n\n## Policy\nThe Organization requires directors, officers, and employees to observe high standards of business and personal ethics. Retaliation against any reporter is strictly prohibited.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c3_private",
    "name": "501(c)(3) Private Foundation",
    "category": "non-profit",
    "description": "Tax-exempt foundation typically funded by an individual, family, or corporation focused on grantmaking and philanthropy.",
    "governance": {
      "governingBody": "Board of Trustees",
      "votingMethod": "one-trustee-one-vote",
      "defaultQuorumPercentage": 66.67,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Foundation President",
        "Treasurer / Grants Officer",
        "Secretary"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-foundation-charter",
        "title": "Foundation Charter & Articles",
        "category": "founding",
        "version": "1.0",
        "content": "# Private Foundation Charter\n\n## 1. Exclusively Charitable Purpose\nDedicated to philanthropic grantmaking and public charitable initiatives.\n\n## 2. Prohibition on Self-Dealing\nStrict compliance with IRC Section 4941 prohibitions on self-dealing, excess business holdings, and taxable expenditures.\n"
      },
      {
        "id": "doc-foundation-grantmaking-policy",
        "title": "Grantmaking and Evaluation Policy",
        "category": "operational",
        "version": "1.0",
        "content": "# Grantmaking and Due Diligence Policy\n\n## 1. Eligibility\nGrants are restricted to qualified 501(c)(3) public charities and expenditure responsibility projects.\n\n## 2. LegitBlock Ledger of Philanthropy\nAll grant awards and donor covenants are permanently registered on LegitBlock.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c4",
    "name": "501(c)(4) Social Welfare Organization",
    "category": "non-profit",
    "description": "Civic organization or social welfare league promoting social welfare and civic betterment with greater legislative lobbying flexibility.",
    "governance": {
      "governingBody": "Board of Directors",
      "votingMethod": "one-director-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Civic Action Director",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c4-articles",
        "title": "Articles of Incorporation (Social Welfare)",
        "category": "founding",
        "version": "1.0",
        "content": "# 501(c)(4) Civic League Articles\n\n## Purpose\nExclusively for the promotion of social welfare, civic improvement, and community policy development.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c5",
    "name": "501(c)(5) Labor or Agricultural Organization",
    "category": "non-profit",
    "description": "Labor union or agricultural/horticultural group dedicated to the betterment of working conditions and agricultural efficiency.",
    "governance": {
      "governingBody": "Executive Council & Member Assembly",
      "votingMethod": "one-member-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Union President / Master",
        "Vice President",
        "Secretary-Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c5-constitution",
        "title": "Labor / Agricultural Constitution & Bylaws",
        "category": "founding",
        "version": "1.0",
        "content": "# 501(c)(5) Organization Constitution\n\n## 1. Solidarity and Betterment of Conditions\nDedicated to collective bargaining, workplace safety, economic democracy, and agricultural improvement.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c6",
    "name": "501(c)(6) Business League / Trade Association",
    "category": "non-profit",
    "description": "Chamber of commerce, real estate board, or industry trade association promoting common business interests.",
    "governance": {
      "governingBody": "Board of Governors",
      "votingMethod": "one-business-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Chair of the Board",
        "President / Executive Director",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c6-articles",
        "title": "Business League Articles of Association",
        "category": "founding",
        "version": "1.0",
        "content": "# Business League Articles\n\n## Common Business Interest\nTo improve business conditions of one or more lines of commerce without private inurement.\n"
      },
      {
        "id": "doc-501c6-antitrust-compliance",
        "title": "Antitrust Compliance Policy",
        "category": "operational",
        "version": "1.0",
        "content": "# Antitrust Compliance Policy\n\n## Strict Compliance\nNo discussion or agreement concerning price fixing, market allocation, or boycott is permitted.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c7",
    "name": "501(c)(7) Social Club / Recreational Association",
    "category": "non-profit",
    "description": "Club organized for pleasure, recreation, hobby, sports, and social purposes supported by member dues.",
    "governance": {
      "governingBody": "Club Board of Stewards",
      "votingMethod": "one-member-one-vote",
      "defaultQuorumPercentage": 40,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Club President",
        "Activities Director",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c7-club-rules",
        "title": "Social Club Charter and House Rules",
        "category": "governance",
        "version": "1.0",
        "content": "# Social Club Charter & House Rules\n\n## Recreational Purpose\nOrganized for the pleasure, recreation, and mutual camaraderie of its members.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c8",
    "name": "501(c)(8) Fraternal Beneficiary Society",
    "category": "non-profit",
    "description": "Fraternal organization operating under the lodge system providing payment of life, sick, or accident benefits to members.",
    "governance": {
      "governingBody": "Grand Lodge Council",
      "votingMethod": "lodge-delegate-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Grand Master",
        "Secretary",
        "Almoner"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c8-fraternal-charter",
        "title": "Fraternal Society Charter",
        "category": "founding",
        "version": "1.0",
        "content": "# Fraternal Beneficiary Society Charter\n\n## Lodge System & Mutual Aid\nProviding brotherhood, community service, and mutual sickness and death benefits to members.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c12",
    "name": "501(c)(12) Mutual Utility / Benevolent Co-op",
    "category": "non-profit",
    "description": "Mutual ditch, irrigation, or telephone/electric co-op where 85% or more income consists of amounts collected from members.",
    "governance": {
      "governingBody": "Member Board of Trustees",
      "votingMethod": "one-member-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Operations Director",
        "Secretary-Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c12-articles",
        "title": "Mutual Utility Articles of Incorporation",
        "category": "founding",
        "version": "1.0",
        "content": "# Mutual Utility Co-op Articles\n\n## 85% Member Income Requirement\nAt least 85% of total income is collected from members solely for meeting losses and expenses.\n"
      }
    ]
  },
  {
    "id": "nonprofit_501c13",
    "name": "501(c)(13) Cemetery Company",
    "category": "non-profit",
    "description": "Mutual cemetery company operated exclusively for the benefit of lot owners, maintaining perpetual care trusts.",
    "governance": {
      "governingBody": "Board of Trustees",
      "votingMethod": "one-owner-one-vote",
      "defaultQuorumPercentage": 30,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Superintendent",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-501c13-cemetery-charter",
        "title": "Cemetery Association Charter & Perpetual Care Trust",
        "category": "founding",
        "version": "1.0",
        "content": "# Cemetery Company Charter\n\n## Perpetual Care & Lot Owner Protection\nOperated exclusively for the burial of the dead and administration of perpetual care funds.\n"
      }
    ]
  },
  {
    "id": "religious_org",
    "name": "Religious Organization / Church / Ministry",
    "category": "non-profit",
    "description": "Church, congregation, religious order, or faith-based ministry organized under ecclesiastical governance.",
    "governance": {
      "governingBody": "Council of Elders / Pastoral Board",
      "votingMethod": "consensus-or-elder-vote",
      "defaultQuorumPercentage": 60,
      "defaultPassingThresholdPercentage": 66.67,
      "officerRoles": [
        "Senior Pastor / Minister",
        "Elder Council Chair",
        "Deacon / Trustee",
        "Secretary"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-church-articles",
        "title": "Ecclesiastical Articles of Incorporation",
        "category": "founding",
        "version": "1.0",
        "content": "# Ecclesiastical Articles of Incorporation\n\n## 1. Religious Calling & Mission\nOrganized exclusively for religious worship, theological instruction, and pastoral service.\n\n## 2. Statement of Faith\nThe foundational religious tenets and statement of faith are anchored on the LegitBlock ledger.\n"
      },
      {
        "id": "doc-church-bylaws",
        "title": "Ecclesiastical Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Church Bylaws\n\n## Governance\nSpiritual and administrative leadership is exercised by the Pastoral Board and Council of Elders.\n"
      }
    ]
  },
  {
    "id": "educational_institution",
    "name": "Educational Institution / School / Academy",
    "category": "non-profit",
    "description": "Independent school, university, academy, or research institute committed to academic instruction and scholarship.",
    "governance": {
      "governingBody": "Board of Trustees & Faculty Senate",
      "votingMethod": "one-trustee-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Chancellor / President",
        "Provost",
        "Dean of Faculty",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-school-charter",
        "title": "Academic Charter and Articles",
        "category": "founding",
        "version": "1.0",
        "content": "# Academic Institution Charter\n\n## Mission\nDedicated to instruction, critical inquiry, scientific discovery, and community education.\n"
      }
    ]
  },
  {
    "id": "mutual_benefit_corp",
    "name": "Mutual Benefit Non-Profit Corporation",
    "category": "non-profit",
    "description": "Nonprofit formed primarily to provide benefits to its members rather than the general public (homeowners associations, mutual funds).",
    "governance": {
      "governingBody": "Board of Directors",
      "votingMethod": "one-member-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Vice President",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-mutual-benefit-articles",
        "title": "Articles of Incorporation (Mutual Benefit)",
        "category": "founding",
        "version": "1.0",
        "content": "# Mutual Benefit Non-Profit Articles\n\n## Purpose\nTo administer common properties and serve the collective welfare of member owners.\n"
      }
    ]
  },
  {
    "id": "worker_coop",
    "name": "Worker Cooperative",
    "category": "cooperative",
    "description": "Business enterprise owned and self-managed by its worker-members, applying the principle of one-worker-one-vote and patronage allocation.",
    "governance": {
      "governingBody": "General Assembly of Worker-Owners",
      "votingMethod": "one-worker-one-vote",
      "defaultQuorumPercentage": 66.67,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Assembly Chair / Facilitator",
        "Operations Coordinator",
        "Financial Steward",
        "Records Keeper"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-worker-coop-articles",
        "title": "Articles of Incorporation (Worker Cooperative)",
        "category": "founding",
        "version": "1.0",
        "content": "# Articles of Incorporation of Worker Cooperative\n\n## Article I: Democratic Identity\nThe Cooperative is organized as a worker cooperative under applicable cooperative corporation law.\n\n## Article II: Rochdale Cooperative Principles\nThe Cooperative strictly adheres to the International Cooperative Alliance principles:\n1. Voluntary and Open Membership\n2. Democratic Member Control (One Member, One Vote)\n3. Member Economic Participation\n4. Autonomy and Independence\n5. Education, Training, and Information\n6. Cooperation among Cooperatives\n7. Concern for Community\n\n## Article III: Worker Ownership and Equality\nOnly natural persons actively employed by the Cooperative shall be eligible for worker-membership. Each member holds exactly one voting membership share.\n"
      },
      {
        "id": "doc-worker-coop-bylaws",
        "title": "Worker-Owner Cooperative Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Worker Cooperative Bylaws\n\n## Article 1: Membership Criteria and Candidacy\n1.1 Candidacy Period: New prospective worker-members undergo a 6-month trial and mentorship period.\n1.2 Admission to Membership: Admission requires approval by a 75% affirmative vote of the General Assembly via LegitBlock vote.\n\n## Article 2: Governance & Democratic Assembly\n2.1 Supreme Authority: The General Assembly of all worker-members is the highest governing body.\n2.2 One-Member One-Vote: Voting power is strictly equal, regardless of capital contributions.\n\n## Article 3: Internal Capital Accounts and Patronage Dividends\n3.1 Patronage Basis: Net surplus is allocated to members based on hours worked (labor patronage), not capital invested.\n3.2 Collective Reserve: At least 20% of net surplus is retained in an indivisible collective reserve.\n"
      },
      {
        "id": "doc-worker-coop-patronage-policy",
        "title": "Patronage Allocation and Labor Accounting Policy",
        "category": "financial",
        "version": "1.0",
        "content": "# Patronage Accounting and Distribution Policy\n\n## Labor Value Tracking\nAll member labor hours and patronage credits are audited and verified each fiscal quarter on the LegitBlock blockchain.\n"
      }
    ]
  },
  {
    "id": "consumer_coop",
    "name": "Consumer Cooperative (Retail / Grocery / Service Co-op)",
    "category": "cooperative",
    "description": "Enterprise owned and operated by the consumers of its goods or services, delivering quality, fair prices, and patronage rebates.",
    "governance": {
      "governingBody": "Elected Board of Directors & Annual Member Meeting",
      "votingMethod": "one-consumer-one-vote",
      "defaultQuorumPercentage": 10,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Board President",
        "General Manager",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-consumer-coop-articles",
        "title": "Articles of Incorporation (Consumer Cooperative)",
        "category": "founding",
        "version": "1.0",
        "content": "# Consumer Cooperative Articles of Incorporation\n\n## Purpose\nTo provide high quality goods and services to member-patrons on a cooperative, non-profit-for-capital basis.\n"
      },
      {
        "id": "doc-consumer-coop-bylaws",
        "title": "Consumer Cooperative Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Consumer Cooperative Bylaws\n\n## Member Economic Rights\nPatronage refunds are distributed to members proportionally to their volume of purchases during each operating period.\n"
      }
    ]
  },
  {
    "id": "producer_coop",
    "name": "Producer / Agricultural Cooperative",
    "category": "cooperative",
    "description": "Cooperative formed by independent producers (farmers, artisans, fishers) to collectively process, market, and distribute their products.",
    "governance": {
      "governingBody": "Producer Board of Directors",
      "votingMethod": "one-producer-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "President",
        "Marketing Manager",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-producer-coop-charter",
        "title": "Agricultural Producer Cooperative Charter",
        "category": "founding",
        "version": "1.0",
        "content": "# Agricultural Producer Cooperative Charter\n\n## Collective Marketing & Processing\nProducers unite to pool yields, negotiate fair pricing, and maintain high ecological quality standards.\n"
      },
      {
        "id": "doc-producer-marketing-agreement",
        "title": "Uniform Producer Marketing Agreement",
        "category": "operational",
        "version": "1.0",
        "content": "# Producer Marketing Agreement\n\n## Delivery & Pooling Obligations\nMembers agree to deliver designated percentages of agricultural harvests to the cooperative pool for joint processing.\n"
      }
    ]
  },
  {
    "id": "housing_coop",
    "name": "Housing Cooperative (Limited-Equity & Market-Rate)",
    "category": "cooperative",
    "description": "Multi-unit residential property owned by a cooperative corporation where members purchase shares paired with a proprietary lease for their dwelling.",
    "governance": {
      "governingBody": "Resident Board of Directors",
      "votingMethod": "one-unit-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Board President",
        "Building Superintendent",
        "Secretary",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-housing-coop-articles",
        "title": "Housing Cooperative Articles of Incorporation",
        "category": "founding",
        "version": "1.0",
        "content": "# Housing Cooperative Articles of Incorporation\n\n## Residential Purpose\nTo acquire, maintain, and operate residential premises on a mutual cooperative basis for member-occupants.\n"
      },
      {
        "id": "doc-housing-proprietary-lease",
        "title": "Master Proprietary Lease and House Rules",
        "category": "governance",
        "version": "1.0",
        "content": "# Master Proprietary Lease and House Rules\n\n## Occupancy Terms\nGranting each shareholder exclusive occupancy rights of their residential unit subject to cooperative house rules and assessment payments.\n"
      }
    ]
  },
  {
    "id": "credit_union",
    "name": "Credit Union / Financial Cooperative",
    "category": "cooperative",
    "description": "Member-owned financial cooperative institution providing competitive credit, savings, and banking services to a defined field of membership.",
    "governance": {
      "governingBody": "Board of Directors & Supervisory Committee",
      "votingMethod": "one-depositor-one-vote",
      "defaultQuorumPercentage": 15,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Board Chair",
        "President & CEO",
        "Supervisory Committee Chair",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-credit-union-charter",
        "title": "Credit Union Organization Certificate & Charter",
        "category": "founding",
        "version": "1.0",
        "content": "# Credit Union Organization Certificate\n\n## Not For Profit, But For Service\nDedicated to promoting thrift, ethical lending, and financial inclusion for all qualified members of the community.\n"
      },
      {
        "id": "doc-credit-union-bylaws",
        "title": "Credit Union Governance Bylaws",
        "category": "governance",
        "version": "1.0",
        "content": "# Credit Union Governance Bylaws\n\n## Supervisory Committee Powers\nAn independent Supervisory Committee inspects books, internal controls, and reports directly to the membership via LegitBlock audits.\n"
      }
    ]
  },
  {
    "id": "multi_stakeholder_coop",
    "name": "Multi-Stakeholder / Solidarity Cooperative",
    "category": "cooperative",
    "description": "Innovative cooperative bringing together diverse stakeholder classes (workers, consumers, suppliers, community supporters) with balanced voting rights.",
    "governance": {
      "governingBody": "Multi-Class Solidarity Board",
      "votingMethod": "class-weighted-consensus",
      "defaultQuorumPercentage": 60,
      "defaultPassingThresholdPercentage": 66.67,
      "officerRoles": [
        "Solidarity Facilitator",
        "Worker Steward",
        "Consumer Steward",
        "Treasurer"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-solidarity-coop-articles",
        "title": "Solidarity Cooperative Articles",
        "category": "founding",
        "version": "1.0",
        "content": "# Solidarity Cooperative Articles\n\n## Multi-Class Governance\nRecognizing that workers, service users, and community stakeholders each contribute to social resilience.\n"
      },
      {
        "id": "doc-solidarity-voting-pact",
        "title": "Stakeholder Class Representation & Voting Matrix",
        "category": "governance",
        "version": "1.0",
        "content": "# Stakeholder Class Voting Agreement\n\n## Weighted Voting Balance\nVoting power is distributed: Worker Class (40%), User Class (40%), Community Supporter Class (20%).\n"
      }
    ]
  },
  {
    "id": "platform_coop",
    "name": "Platform Cooperative (Decentralized Tech / Labor Platform)",
    "category": "cooperative",
    "description": "Digital gig-economy or software platform owned and governed collectively by gig workers, software developers, and platform users.",
    "governance": {
      "governingBody": "Platform DAO Assembly",
      "votingMethod": "one-participant-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 60,
      "officerRoles": [
        "Open Source Lead",
        "Worker Delegate",
        "Community Lead",
        "Security Steward"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-platform-coop-charter",
        "title": "Platform Cooperative Charter & Code of Ethics",
        "category": "founding",
        "version": "1.0",
        "content": "# Platform Cooperative Charter\n\n## Democratic Tech Commons\nAll platform algorithms, commission fee schedules, and data policies are transparently governed on the LegitBlock blockchain.\n"
      },
      {
        "id": "doc-platform-coop-data-governance",
        "title": "Decentralized Data Privacy & Algorithmic Ethics Policy",
        "category": "operational",
        "version": "1.0",
        "content": "# Algorithmic Governance Policy\n\n## Member Data Sovereignty\nUser and worker data shall never be monetized without democratic consent recorded through blockchain voting.\n"
      }
    ]
  },
  {
    "id": "purchasing_coop",
    "name": "Purchasing & Shared Services Cooperative",
    "category": "cooperative",
    "description": "Consortium of independent small businesses or non-profits pooling procurement purchasing power to achieve economies of scale.",
    "governance": {
      "governingBody": "Procurement Steering Board",
      "votingMethod": "one-business-one-vote",
      "defaultQuorumPercentage": 50,
      "defaultPassingThresholdPercentage": 50.01,
      "officerRoles": [
        "Procurement Director",
        "Operations Chair",
        "Financial Controller"
      ]
    },
    "initialDocuments": [
      {
        "id": "doc-purchasing-coop-agreement",
        "title": "Master Shared Services Agreement",
        "category": "founding",
        "version": "1.0",
        "content": "# Master Shared Services and Purchasing Agreement\n\n## Joint Sourcing\nCombining volume buying power to obtain wholesale discounts, distributing rebates based on purchase volume.\n"
      }
    ]
  }
];
