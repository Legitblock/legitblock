export const COOPERATIVE_TEMPLATES = [
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
