import assert from "node:assert";
import {
  createBallotChallenge,
  createWebAuthnCredential,
  signBallotWebAuthn,
  verifyWebAuthnAssertion,
  verifyBallotSignature,
  Proposal,
  ProposalType,
  VoteDecision,
  VotingEngine,
  generateMemberKeyPair,
  signData
} from "../src/index.js";

console.log("=== Testing WebAuthn / Passkey Biometric Ballot Signing ===");

function testChallengeGeneration() {
  console.log("1. Testing createBallotChallenge...");
  const challengeObj = createBallotChallenge({
    proposalId: "prop-42",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE,
    origin: "https://legitblock.org"
  });

  assert(challengeObj.challenge, "Challenge nonce must be generated");
  assert.strictEqual(typeof challengeObj.ballotDigest, "string");
  assert.strictEqual(challengeObj.ballotDigest.length, 64, "Ballot digest must be SHA-256");
  assert.strictEqual(challengeObj.canonicalData.proposalId, "prop-42");
  console.log("   ✓ Challenge generation passed");
  return challengeObj;
}

function testCredentialAndBiometricSigning(challengeObj) {
  console.log("2. Testing WebAuthn passkey credential generation and signing...");
  const cred = createWebAuthnCredential("cred-alice-touchid");
  assert.strictEqual(cred.credentialId, "cred-alice-touchid");
  assert.strictEqual(cred.algorithm, "ES256");
  assert(cred.publicKeyPem.includes("BEGIN PUBLIC KEY"));
  assert(cred.privateKeyPem.includes("BEGIN PRIVATE KEY"));

  const signaturePayload = signBallotWebAuthn({
    proposalId: "prop-42",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE,
    challenge: challengeObj.challenge,
    privateKeyPem: cred.privateKeyPem,
    credentialId: cred.credentialId,
    rpId: "legitblock.org",
    origin: "https://legitblock.org",
    userVerified: true
  });

  assert.strictEqual(signaturePayload.type, "webauthn");
  assert.strictEqual(signaturePayload.algorithm, "ES256");
  assert.strictEqual(signaturePayload.credentialId, "cred-alice-touchid");
  assert(signaturePayload.clientDataJSON, "clientDataJSON must be present");
  assert(signaturePayload.authenticatorData, "authenticatorData must be present");
  assert(signaturePayload.signature, "ECDSA signature must be present");
  assert.strictEqual(signaturePayload.userVerified, true);

  console.log("   ✓ Biometric ballot signing passed");
  return { cred, signaturePayload };
}

function testAssertionVerification(cred, signaturePayload, challengeObj) {
  console.log("3. Testing verifyWebAuthnAssertion...");
  const result = verifyWebAuthnAssertion({
    clientDataJSON: signaturePayload.clientDataJSON,
    authenticatorData: signaturePayload.authenticatorData,
    signature: signaturePayload.signature,
    publicKeyPem: cred.publicKeyPem,
    expectedChallenge: challengeObj.challenge,
    expectedOrigin: "https://legitblock.org"
  });

  assert.strictEqual(result.valid, true, "Signature verification should pass");
  assert.strictEqual(result.userPresent, true, "User present flag must be verified");
  assert.strictEqual(result.userVerified, true, "User verified biometric flag must be true");

  // Test tampered challenge rejection
  const tamperedResult = verifyWebAuthnAssertion({
    clientDataJSON: signaturePayload.clientDataJSON,
    authenticatorData: signaturePayload.authenticatorData,
    signature: signaturePayload.signature,
    publicKeyPem: cred.publicKeyPem,
    expectedChallenge: "tampered-challenge-12345"
  });
  assert.strictEqual(tamperedResult.valid, false, "Tampered challenge must be rejected");

  // Test wrong public key rejection
  const otherCred = createWebAuthnCredential();
  const wrongKeyResult = verifyWebAuthnAssertion({
    clientDataJSON: signaturePayload.clientDataJSON,
    authenticatorData: signaturePayload.authenticatorData,
    signature: signaturePayload.signature,
    publicKeyPem: otherCred.publicKeyPem
  });
  assert.strictEqual(wrongKeyResult.valid, false, "Signature with wrong key must fail");

  console.log("   ✓ Assertion verification passed");
}

function testUniversalBallotSignature(cred, webauthnSig) {
  console.log("4. Testing verifyBallotSignature (WebAuthn vs Ed25519)...");
  
  // WebAuthn signature
  const resWebAuthn = verifyBallotSignature({
    proposalId: "prop-42",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE,
    signature: webauthnSig,
    publicKeyPem: cred.publicKeyPem
  });
  assert.strictEqual(resWebAuthn.valid, true);
  assert.strictEqual(resWebAuthn.type, "webauthn");
  assert.strictEqual(resWebAuthn.biometric, true);

  // Ed25519 signature
  const edKeys = generateMemberKeyPair();
  const edSig = signData({ proposalId: "prop-42", voterId: "member-bob", decision: VoteDecision.APPROVE }, edKeys.privateKey);
  const resEd = verifyBallotSignature({
    proposalId: "prop-42",
    voterId: "member-bob",
    decision: VoteDecision.APPROVE,
    signature: edSig,
    publicKeyPem: edKeys.publicKey
  });
  assert.strictEqual(resEd.valid, true);
  assert.strictEqual(resEd.type, "ed25519");

  // Tampered decision in Ed25519
  const resEdTampered = verifyBallotSignature({
    proposalId: "prop-42",
    voterId: "member-bob",
    decision: VoteDecision.REJECT, // Voter signed APPROVE
    signature: edSig,
    publicKeyPem: edKeys.publicKey
  });
  assert.strictEqual(resEdTampered.valid, false);

  console.log("   ✓ Universal ballot signature verification passed");
}

function testProposalIntegration(cred, signaturePayload) {
  console.log("5. Testing Proposal and VotingEngine with Passkey signatures...");
  const proposal = new Proposal({
    id: "prop-42",
    title: "Ratify Q3 Treasury Allocation",
    type: ProposalType.MEMBER_ACTION
  });

  proposal.castVote({
    voterId: "member-alice",
    voterName: "Alice Director",
    decision: VoteDecision.APPROVE,
    signature: signaturePayload
  });

  const verified = proposal.verifyVoteSignature("member-alice", cred.publicKeyPem);
  assert.strictEqual(verified.valid, true);
  assert.strictEqual(verified.biometric, true);

  // VotingEngine integration with publicKeyPem validation
  const engine = new VotingEngine();
  const p = engine.createProposal({
    id: "prop-100",
    title: "Elect Compliance Officer"
  });

  const challenge = createBallotChallenge({
    proposalId: "prop-100",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE
  });

  const validSig = signBallotWebAuthn({
    proposalId: "prop-100",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE,
    challenge: challenge.challenge,
    privateKeyPem: cred.privateKeyPem,
    credentialId: cred.credentialId
  });

  // Valid vote succeeds
  engine.castVote({
    proposalId: "prop-100",
    voterId: "member-alice",
    decision: VoteDecision.APPROVE,
    signature: validSig,
    publicKeyPem: cred.publicKeyPem
  });

  assert(p.votes["member-alice"], "Vote should be recorded");

  // Invalid key vote fails
  const impostorCred = createWebAuthnCredential();
  assert.throws(() => {
    engine.castVote({
      proposalId: "prop-100",
      voterId: "member-charlie",
      decision: VoteDecision.APPROVE,
      signature: validSig, // Alice's signature used for Charlie!
      publicKeyPem: impostorCred.publicKeyPem
    });
  }, /Vote rejected: invalid cryptographic signature/);

  assert(!p.votes["member-charlie"], "Impostor vote must NOT be recorded");

  console.log("   ✓ Proposal and VotingEngine integration passed");
}

function run() {
  const challenge = testChallengeGeneration();
  const { cred, signaturePayload } = testCredentialAndBiometricSigning(challenge);
  testAssertionVerification(cred, signaturePayload, challenge);
  testUniversalBallotSignature(cred, signaturePayload);
  testProposalIntegration(cred, signaturePayload);
  console.log("\n>>> ALL WEBAUTHN / PASSKEY TESTS PASSED!\n");
}

run();
