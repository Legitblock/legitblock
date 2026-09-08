export const FOR_PROFIT_TEMPLATES = [
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
  }
];
