import { Client } from "ldapts";
import { authenticateMockLdap, searchMockLdap, MOCK_LDAP_USERS } from "./mockLdap.js";
import { signUserToken, verifyUserToken } from "./jwt.js";

/**
 * Full LDAP Authentication and Authorization Provider
 * Supports connecting to standard LDAP / Active Directory servers,
 * with fallback to embedded mock directory for self-contained testing.
 */
export class LDAPAuthProvider {
  /**
   * @param {object} [config={}]
   * @param {string} [config.url] - e.g. "ldap://ldap.example.com:389"
   * @param {string} [config.baseDN="dc=legitblock,dc=org"]
   * @param {string} [config.bindDN] - Admin bind DN
   * @param {string} [config.bindPassword] - Admin bind password
   * @param {string} [config.userSearchFilter="(&(objectClass=inetOrgPerson)(uid={{username}}))"]
   * @param {boolean} [config.useMock=true] - Use mock directory when true or if url is not provided
   */
  constructor(config = {}) {
    this.config = {
      url: process.env.LDAP_URL || config.url,
      baseDN: process.env.LDAP_BASE_DN || config.baseDN || "dc=legitblock,dc=org",
      bindDN: process.env.LDAP_BIND_DN || config.bindDN,
      bindPassword: process.env.LDAP_BIND_PASSWORD || config.bindPassword,
      userSearchFilter: config.userSearchFilter || "(&(objectClass=inetOrgPerson)(|(uid={{username}})(mail={{username}})))",
      useMock: config.useMock !== undefined ? config.useMock : !config.url && !process.env.LDAP_URL
    };
  }

  /**
   * Authenticate a user by username/email and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: boolean, user?: object, token?: string, error?: string }>}
   */
  async authenticate(username, password) {
    if (!username || !password) {
      return { success: false, error: "Username and password are required" };
    }

    if (this.config.useMock) {
      const user = authenticateMockLdap(username, password);
      if (!user) {
        return { success: false, error: "Invalid LDAP credentials" };
      }
      const token = signUserToken(user);
      return { success: true, user, token };
    }

    // Real LDAP Server Authentication
    const client = new Client({ url: this.config.url });
    try {
      // Step 1: Bind as search/admin user if configured
      if (this.config.bindDN) {
        await client.bind(this.config.bindDN, this.config.bindPassword);
      }

      // Step 2: Search for user DN
      const filter = this.config.userSearchFilter.replace(/{{username}}/g, username);
      const { searchEntries } = await client.search(this.config.baseDN, {
        filter,
        scope: "sub",
        attributes: ["dn", "cn", "sn", "mail", "title", "memberOf"]
      });

      if (!searchEntries || searchEntries.length === 0) {
        await client.unbind();
        return { success: false, error: "LDAP user not found" };
      }

      const userEntry = searchEntries[0];
      const userDN = userEntry.dn;

      // Step 3: Verify credentials by binding as the user
      const userClient = new Client({ url: this.config.url });
      try {
        await userClient.bind(userDN, password);
        await userClient.unbind();
      } catch (bindErr) {
        await userClient.unbind();
        return { success: false, error: "Invalid LDAP password" };
      }

      await client.unbind();

      // Determine role from groups or title
      const groups = Array.isArray(userEntry.memberOf) ? userEntry.memberOf : userEntry.memberOf ? [userEntry.memberOf] : [];
      let role = "member";
      if (groups.some(g => /admin/i.test(g))) role = "admin";
      else if (groups.some(g => /board|trustee|chair/i.test(g))) role = "chair";
      else if (groups.some(g => /officer/i.test(g))) role = "officer";

      const user = {
        dn: userDN,
        username: String(userEntry.cn || username),
        name: String(userEntry.cn || username),
        email: String(userEntry.mail || `${username}@organization.local`),
        title: String(userEntry.title || "Member"),
        role,
        groups,
        votingWeight: 1
      };

      const token = signUserToken(user);
      return { success: true, user, token };
    } catch (err) {
      try { await client.unbind(); } catch {}
      return { success: false, error: "LDAP connection error: " + err.message };
    }
  }

  /**
   * Search for members in directory
   * @param {string} query
   * @returns {Promise<Array<object>>}
   */
  async searchMembers(query = "") {
    if (this.config.useMock) {
      return searchMockLdap(query);
    }

    const client = new Client({ url: this.config.url });
    try {
      if (this.config.bindDN) {
        await client.bind(this.config.bindDN, this.config.bindPassword);
      }
      const filter = query
        ? `(&(objectClass=inetOrgPerson)(|(cn=*${query}*)(mail=*${query}*)))`
        : "(objectClass=inetOrgPerson)";

      const { searchEntries } = await client.search(this.config.baseDN, {
        filter,
        scope: "sub",
        attributes: ["dn", "cn", "mail", "title", "memberOf"]
      });

      await client.unbind();

      return (searchEntries || []).map(entry => ({
        dn: entry.dn,
        username: String(entry.cn),
        name: String(entry.cn),
        email: String(entry.mail || ""),
        title: String(entry.title || "Member"),
        groups: Array.isArray(entry.memberOf) ? entry.memberOf : []
      }));
    } catch {
      try { await client.unbind(); } catch {}
      return [];
    }
  }

  /**
   * Verify an HTTP session token
   * @param {string} token
   * @returns {object|null}
   */
  verifySession(token) {
    return verifyUserToken(token);
  }
}

export { signUserToken, verifyUserToken, MOCK_LDAP_USERS };
