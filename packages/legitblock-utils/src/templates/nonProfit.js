export const NON_PROFIT_TEMPLATES = [
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
  }
];
