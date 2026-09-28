import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  StorageAdapter,
  MemoryStorageAdapter,
  FileStorageAdapter,
  IndexedDBStorageAdapter,
  LegitBlockStore,
  Blockchain,
  VotingEngine,
  Proposal
} from "../src/index.js";

console.log("=== Testing Storage Adapters & Persistence ===");

async function testMemoryStorageAdapter() {
  console.log("1. Testing MemoryStorageAdapter...");
  const mem = new MemoryStorageAdapter();
  assert.strictEqual(await mem.isInitialized(), false, "Memory adapter should start uninitialized");

  const dummyChain = { organization: { name: "Test Org" }, difficulty: 1, chain: [{ index: 0, hash: "abc" }] };
  await mem.saveBlockchain(dummyChain);
  assert.strictEqual(await mem.isInitialized(), true, "Memory adapter should be initialized after save");

  const loadedChain = await mem.loadBlockchain();
  assert.deepStrictEqual(loadedChain, dummyChain, "Loaded chain should match saved chain");

  const dummyProposals = [{ id: "prop-1", title: "Test Prop" }];
  await mem.saveProposals(dummyProposals);
  const loadedProps = await mem.loadProposals();
  assert.deepStrictEqual(loadedProps, dummyProposals, "Loaded proposals should match saved proposals");

  // Sync methods
  assert.strictEqual(mem.isInitializedSync(), true);
  assert.deepStrictEqual(mem.loadBlockchainSync(), dummyChain);
  assert.deepStrictEqual(mem.loadProposalsSync(), dummyProposals);

  await mem.clear();
  assert.strictEqual(await mem.isInitialized(), false, "Memory adapter should be uninitialized after clear");
  console.log("   ✓ MemoryStorageAdapter passed");
}

async function testFileStorageAdapter() {
  console.log("2. Testing FileStorageAdapter...");
  const tempDir = path.join(os.tmpdir(), "legitblock-test-storage-" + Date.now());
  try {
    const fileAdapter = new FileStorageAdapter(tempDir);
    assert.strictEqual(await fileAdapter.isInitialized(), false);

    const dummyChain = { organization: { name: "File Org" }, difficulty: 1, chain: [{ index: 0, hash: "file-hash" }] };
    await fileAdapter.saveBlockchain(dummyChain);
    assert.strictEqual(await fileAdapter.isInitialized(), true);

    const loaded = await fileAdapter.loadBlockchain();
    assert.deepStrictEqual(loaded, dummyChain);

    await fileAdapter.clear();
    assert.strictEqual(await fileAdapter.isInitialized(), false);
    console.log("   ✓ FileStorageAdapter passed");
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

async function testIndexedDBStorageAdapterFallback() {
  console.log("3. Testing IndexedDBStorageAdapter (Node memory fallback)...");
  const idb = new IndexedDBStorageAdapter("test-legitblock-idb");
  assert.strictEqual(await idb.isInitialized(), false);

  const dummyChain = { organization: { name: "Browser Org" }, difficulty: 1, chain: [{ index: 0, hash: "browser-hash" }] };
  await idb.saveBlockchain(dummyChain);
  assert.strictEqual(await idb.isInitialized(), true);

  const loaded = await idb.loadBlockchain();
  assert.deepStrictEqual(loaded, dummyChain);

  await idb.clear();
  assert.strictEqual(await idb.isInitialized(), false);
  console.log("   ✓ IndexedDBStorageAdapter passed");
}

async function testLegitBlockStoreWithMemoryAdapter() {
  console.log("4. Testing LegitBlockStore with MemoryStorageAdapter...");
  const memAdapter = new MemoryStorageAdapter();
  const store = new LegitBlockStore(memAdapter);

  assert.strictEqual(store.isInitialized(), false);

  // Initialize blockchain
  store.blockchain.initializeGenesis({
    orgName: "Memory Store Corp",
    orgType: "c_corp"
  });

  store.saveBlockchain();
  assert.strictEqual(await memAdapter.isInitialized(), true);
  assert.strictEqual(store.isInitialized(), true);

  // Create and save proposal
  store.votingEngine.createProposal({
    title: "Test Memory Proposal",
    proposer: { id: "alice", name: "Alice" }
  });
  store.saveVotingEngine();

  // Load in another store instance using same memory adapter
  const store2 = new LegitBlockStore(memAdapter);
  assert.strictEqual(store2.blockchain.organization.name, "Memory Store Corp");
  assert.strictEqual(store2.votingEngine.listProposals().length, 1);
  assert.strictEqual(store2.votingEngine.listProposals()[0].title, "Test Memory Proposal");

  store.reset();
  assert.strictEqual(store.isInitialized(), false);
  console.log("   ✓ LegitBlockStore with MemoryStorageAdapter passed");
}

async function run() {
  await testMemoryStorageAdapter();
  await testFileStorageAdapter();
  await testIndexedDBStorageAdapterFallback();
  await testLegitBlockStoreWithMemoryAdapter();
  console.log("\n>>> ALL STORAGE ADAPTER TESTS PASSED!\n");
}

run().catch(err => {
  console.error("Storage adapter test failed:", err);
  process.exit(1);
});
