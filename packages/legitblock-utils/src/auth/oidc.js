import crypto from "node:crypto";

/**
 * Enterprise OpenID Connect (OIDC) & Identity Federation for LegitBlock.
 * Standardized claims validation, token signature verification, and group-to-governance role mapping.
 */

/**
 * Decode JWT header, payload, and signature without verification
 * @param {string} token
 * @returns {{ header: object, payload: object, signature: string, signedContent: string }}
 */
export function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format: token must contain 3 segments separated by dots");
  }

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  const signature = parts[2];
  const signedContent = `${parts[0]}.${parts[1]}`;

  return { header, payload, signature, signedContent };
}

/**
 * Verify an OIDC ID token or access token
 * @param {object} params
 * @param {string} params.token - JWT token string
 * @param {string} [params.publicKeyPem] - Public key PEM (RS256 / ES256)
 * @param {string} [params.issuer] - Expected issuer (e.g. "https://accounts.google.com", "https://login.microsoftonline.com/...")
 * @param {string} [params.audience] - Expected client ID / audience
 * @param {number} [params.clockToleranceSeconds=60]
 * @returns {{ valid: boolean, claims?: object, error?: string }}
 */
export function verifyOidcToken({
  token,
  publicKeyPem = null,
  issuer = null,
  audience = null,
  clockToleranceSeconds = 60
}) {
  try {
    const { header, payload, signature, signedContent } = decodeJwt(token);

    const nowSec = Math.floor(Date.now() / 1000);

    // 1. Expiration check
    if (payload.exp && payload.exp + clockToleranceSeconds < nowSec) {
      return { valid: false, error: `Token expired at ${new Date(payload.exp * 1000).toISOString()}` };
    }

    // 2. Not before check
    if (payload.nbf && payload.nbf - clockToleranceSeconds > nowSec) {
      return { valid: false, error: `Token not valid before ${new Date(payload.nbf * 1000).toISOString()}` };
    }

    // 3. Issuer check
    if (issuer && payload.iss !== issuer) {
      return { valid: false, error: `Issuer mismatch: expected ${issuer}, got ${payload.iss}` };
    }

    // 4. Audience check
    if (audience) {
      const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audList.includes(audience)) {
        return { valid: false, error: `Audience mismatch: expected ${audience}, got ${payload.aud}` };
      }
    }

    // 5. Cryptographic signature check (if key provided)
    if (publicKeyPem) {
      const alg = header.alg || "RS256";
      let cryptoAlg = "RSA-SHA256";
      if (alg === "ES256") cryptoAlg = "SHA256";
      else if (alg === "RS256") cryptoAlg = "RSA-SHA256";

      const verifier = crypto.createVerify(cryptoAlg);
      verifier.update(signedContent);
      const signatureBuffer = Buffer.from(signature, "base64url");
      const isValid = verifier.verify(publicKeyPem, signatureBuffer);

      if (!isValid) {
        return { valid: false, error: "Cryptographic signature verification failed" };
      }
    }

    return {
      valid: true,
      claims: payload
    };
  } catch (err) {
    return {
      valid: false,
      error: "OIDC verification error: " + err.message
    };
  }
}

/**
 * Generate a signed mock OIDC token for local development and unit tests
 * @param {object} params
 * @param {object} params.claims
 * @param {string} params.privateKeyPem
 * @param {string} [params.algorithm="RS256"]
 * @returns {string} Signed JWT string
 */
export function createMockOidcToken({ claims, privateKeyPem, algorithm = "RS256" }) {
  const header = {
    alg: algorithm,
    typ: "JWT",
    kid: "mock-key-1"
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://identity.legitblock.org",
    aud: "legitblock-portal",
    iat: nowSec,
    exp: nowSec + 3600,
    ...claims
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signedContent = `${headerB64}.${payloadB64}`;

  const signer = crypto.createSign(algorithm === "ES256" ? "SHA256" : "RSA-SHA256");
  signer.update(signedContent);
  const signatureB64 = signer.sign(privateKeyPem).toString("base64url");

  return `${signedContent}.${signatureB64}`;
}

/**
 * Map enterprise OIDC directory claims (groups, department, email) to LegitBlock roles & weights
 * @param {object} claims - OIDC claims payload
 * @param {object} [roleMapping={}] - Custom group to role mapping
 * @returns {{ id: string, name: string, email: string, role: string, votingWeight: number, permissions: string[] }}
 */
export function mapOidcClaimsToRoles(claims, roleMapping = {}) {
  const email = claims.email || `${claims.sub}@enterprise.corp`;
  const name = claims.name || claims.preferred_username || claims.sub;
  const groups = Array.isArray(claims.groups) ? claims.groups : (claims.roles || []);

  const defaultRoleMap = {
    "CN=BoardOfDirectors": { role: "Director", votingWeight: 25, permissions: ["vote", "propose", "amend"] },
    "CN=AuditCommittee": { role: "Auditor", votingWeight: 10, permissions: ["audit", "inspect"] },
    "CN=ExecutiveOfficers": { role: "Officer", votingWeight: 15, permissions: ["propose", "execute"] },
    "board": { role: "Director", votingWeight: 25, permissions: ["vote", "propose", "amend"] },
    "trustee": { role: "Trustee", votingWeight: 20, permissions: ["vote", "propose"] },
    "member": { role: "Member", votingWeight: 1, permissions: ["vote"] },
    ...roleMapping
  };

  let assignedRole = "Member";
  let assignedWeight = 1;
  let assignedPermissions = ["vote"];

  for (const group of groups) {
    if (defaultRoleMap[group]) {
      assignedRole = defaultRoleMap[group].role;
      assignedWeight = defaultRoleMap[group].votingWeight;
      assignedPermissions = defaultRoleMap[group].permissions;
      break;
    }
  }

  return {
    id: claims.sub || email,
    name,
    email,
    role: assignedRole,
    votingWeight: assignedWeight,
    permissions: assignedPermissions
  };
}

/**
 * Enterprise OIDC Authentication Provider class
 */
export class OIDCAuthProvider {
  constructor(config = {}) {
    this.issuer = config.issuer || "https://identity.legitblock.org";
    this.clientId = config.clientId || "legitblock-portal";
    this.publicKeyPem = config.publicKeyPem || null;
    this.roleMapping = config.roleMapping || {};
  }

  /**
   * Authenticate OIDC token and return normalized governance member profile
   * @param {string} token
   * @returns {{ success: boolean, member?: object, error?: string }}
   */
  authenticate(token) {
    const res = verifyOidcToken({
      token,
      publicKeyPem: this.publicKeyPem,
      issuer: this.issuer,
      audience: this.clientId
    });

    if (!res.valid) {
      return { success: false, error: res.error };
    }

    const member = mapOidcClaimsToRoles(res.claims, this.roleMapping);
    return {
      success: true,
      member
    };
  }
}
