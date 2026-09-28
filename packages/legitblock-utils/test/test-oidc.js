import assert from "node:assert";
import crypto from "node:crypto";
import {
  verifyOidcToken,
  decodeJwt,
  createMockOidcToken,
  mapOidcClaimsToRoles,
  OIDCAuthProvider
} from "../src/index.js";

console.log("=== Testing Enterprise OIDC & Identity Federation ===");

function testOidc() {
  console.log("1. Generating RSA-256 test key pair...");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  console.log("2. Creating mock OIDC ID token...");
  const token = createMockOidcToken({
    claims: {
      sub: "user-12345",
      email: "jane.doe@enterprise.corp",
      name: "Jane Doe",
      groups: ["CN=BoardOfDirectors", "finance"],
      department: "Governance"
    },
    privateKeyPem: privateKey,
    algorithm: "RS256"
  });

  assert(token.split(".").length === 3, "Token must be valid 3-part JWT");

  console.log("3. Testing token decoding and signature verification...");
  const decoded = decodeJwt(token);
  assert.strictEqual(decoded.payload.sub, "user-12345");
  assert.strictEqual(decoded.payload.email, "jane.doe@enterprise.corp");

  const verifyResult = verifyOidcToken({
    token,
    publicKeyPem: publicKey,
    issuer: "https://identity.legitblock.org",
    audience: "legitblock-portal"
  });

  assert.strictEqual(verifyResult.valid, true, "Valid token must pass verification");
  assert.strictEqual(verifyResult.claims.name, "Jane Doe");

  // Tampered signature test
  const wrongKey = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  const wrongKeyResult = verifyOidcToken({
    token,
    publicKeyPem: wrongKey.publicKey
  });
  assert.strictEqual(wrongKeyResult.valid, false, "Signature with wrong key must fail");

  console.log("4. Testing Directory Claims to Governance Role Mapping...");
  const memberProfile = mapOidcClaimsToRoles(verifyResult.claims);
  assert.strictEqual(memberProfile.id, "user-12345");
  assert.strictEqual(memberProfile.name, "Jane Doe");
  assert.strictEqual(memberProfile.role, "Director", "CN=BoardOfDirectors should map to Director");
  assert.strictEqual(memberProfile.votingWeight, 25, "Director role receives 25 voting weight");
  assert(memberProfile.permissions.includes("vote"), "Director must have voting permission");

  console.log("5. Testing OIDCAuthProvider class...");
  const provider = new OIDCAuthProvider({
    issuer: "https://identity.legitblock.org",
    clientId: "legitblock-portal",
    publicKeyPem: publicKey
  });

  const authRes = provider.authenticate(token);
  assert.strictEqual(authRes.success, true);
  assert.strictEqual(authRes.member.role, "Director");
  assert.strictEqual(authRes.member.email, "jane.doe@enterprise.corp");

  console.log("   ✓ Enterprise OIDC identity federation passed all tests");
}

try {
  testOidc();
  console.log("\n>>> ALL OIDC TESTS PASSED!\n");
} catch (err) {
  console.error("OIDC test failed:", err);
  process.exit(1);
}
