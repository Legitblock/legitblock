/**
 * Mock LDAP directory for out-of-the-box development, testing,
 * and demonstration without needing an external LDAP daemon.
 */
export const MOCK_LDAP_USERS = [
  {
    dn: "cn=admin,ou=admins,dc=legitblock,dc=org",
    username: "admin",
    password: "password123",
    name: "System Administrator",
    email: "admin@legitblock.org",
    title: "Chief System Administrator",
    role: "admin",
    groups: ["cn=administrators,ou=groups,dc=legitblock,dc=org", "cn=board,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  },
  {
    dn: "cn=alice,ou=board,dc=legitblock,dc=org",
    username: "alice",
    password: "password123",
    name: "Alice Walker",
    email: "alice@legitblock.org",
    title: "Board President / Worker-Owner",
    role: "chair",
    groups: ["cn=board,ou=groups,dc=legitblock,dc=org", "cn=members,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  },
  {
    dn: "cn=bob,ou=officers,dc=legitblock,dc=org",
    username: "bob",
    password: "password123",
    name: "Bob Chen",
    email: "bob@legitblock.org",
    title: "Corporate Secretary",
    role: "officer",
    groups: ["cn=officers,ou=groups,dc=legitblock,dc=org", "cn=members,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  },
  {
    dn: "cn=carol,ou=officers,dc=legitblock,dc=org",
    username: "carol",
    password: "password123",
    name: "Carol Martinez",
    email: "carol@legitblock.org",
    title: "Chief Financial Officer / Treasurer",
    role: "officer",
    groups: ["cn=officers,ou=groups,dc=legitblock,dc=org", "cn=members,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  },
  {
    dn: "cn=david,ou=members,dc=legitblock,dc=org",
    username: "david",
    password: "password123",
    name: "David Kim",
    email: "david@legitblock.org",
    title: "Voting Member / Shareholder",
    role: "member",
    groups: ["cn=members,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  },
  {
    dn: "cn=elena,ou=members,dc=legitblock,dc=org",
    username: "elena",
    password: "password123",
    name: "Elena Rostova",
    email: "elena@legitblock.org",
    title: "Worker Member / Operations Lead",
    role: "member",
    groups: ["cn=members,ou=groups,dc=legitblock,dc=org"],
    votingWeight: 1
  }
];

/**
 * Authenticate credentials against mock directory
 * @param {string} username
 * @param {string} password
 * @returns {object|null}
 */
export function authenticateMockLdap(username, password) {
  const user = MOCK_LDAP_USERS.find(
    u => (u.username === username || u.email === username || u.dn === username) && u.password === password
  );
  if (!user) return null;

  // Return user without password
  const { password: _, ...userSafe } = user;
  return userSafe;
}

/**
 * Search users in mock directory
 * @param {string} query
 * @returns {Array<object>}
 */
export function searchMockLdap(query = "") {
  const q = query.toLowerCase().trim();
  return MOCK_LDAP_USERS.map(({ password: _, ...u }) => u).filter(
    u => !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
}
