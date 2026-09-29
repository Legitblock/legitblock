import crypto from "node:crypto";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { sha256, stringifyCanonical } from "./crypto.js";

/**
 * EVM & Gnosis Safe Treasury Bridge for LegitBlock.
 * Compiles ratified organizational resolutions into executable EVM Calldata,
 * Gnosis Safe multi-sig execution payloads, and EIP-712 typed data manifests.
 */

/**
 * Standard EVM Keccak-256 function selector (first 4 bytes / 8 hex characters of Keccak256)
 * Uses genuine Ethereum Keccak-256 padding for exact compatibility with EVM contracts.
 */
export function getFunctionSelector(signature) {
  try {
    const input = Buffer.isBuffer(signature) ? signature : Buffer.from(String(signature), "utf8");
    const hash = Buffer.from(keccak_256(input)).toString("hex");
    return hash.substring(0, 8);
  } catch {
    const fallback = crypto.createHash("sha256").update(String(signature)).digest("hex");
    return fallback.substring(0, 8);
  }
}

/**
 * ABI encode a 256-bit unsigned integer / address into 32-byte hex word
 */
function encodeWord(val) {
  let clean = val;
  if (typeof val === "string" && val.startsWith("0x")) {
    clean = val.slice(2);
  } else if (typeof val === "number" || typeof val === "bigint") {
    clean = BigInt(val).toString(16);
  }
  return clean.padStart(64, "0");
}

export class EvmBridge {
  /**
   * Encode an ERC-20 token transfer calldata: transfer(address,uint256)
   * @param {string} recipientAddress
   * @param {number|bigint|string} amount
   * @returns {string} 0x-prefixed hex calldata
   */
  static encodeErc20Transfer(recipientAddress, amount) {
    // Selector for transfer(address,uint256) is a9059cbb
    const selector = "a9059cbb";
    const recipientWord = encodeWord(recipientAddress);
    const amountWord = encodeWord(amount);
    return "0x" + selector + recipientWord + amountWord;
  }

  /**
   * Encode an arbitrary contract function call
   * @param {string} functionSignature - e.g. "mint(address,uint256)"
   * @param {Array<any>} args - Arguments
   * @returns {string} 0x-prefixed hex calldata
   */
  static encodeFunctionCall(functionSignature, args = []) {
    const selector = getFunctionSelector(functionSignature);
    const encodedArgs = args.map(arg => encodeWord(arg)).join("");
    return "0x" + selector + encodedArgs;
  }

  /**
   * Build a Gnosis Safe multi-sig execution payload (execTransaction)
   * @param {object} params
   * @param {string} params.safeAddress
   * @param {string} params.to
   * @param {number|bigint} [params.value=0]
   * @param {string} [params.data="0x"]
   * @param {number} [params.operation=0] - 0: Call, 1: DelegateCall
   * @param {Array<string>} [params.signatures=[]]
   * @returns {object} Execution transaction payload
   */
  static buildSafeTransaction({
    safeAddress,
    to,
    value = 0,
    data = "0x",
    operation = 0,
    signatures = []
  }) {
    const cleanData = data.startsWith("0x") ? data.slice(2) : data;
    const sortedSignatures = [...signatures].sort().join("");

    return {
      safeAddress,
      to,
      value: BigInt(value).toString(),
      data: "0x" + cleanData,
      operation,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      signatures: sortedSignatures ? "0x" + sortedSignatures : "0x"
    };
  }

  /**
   * Generate an EIP-712 Typed Data resolution manifest for on-chain verification
   * @param {object} params
   * @param {string} params.proposalId
   * @param {string} params.documentId
   * @param {string} params.targetContract
   * @param {number|bigint} params.value
   * @param {string} params.calldata
   * @param {number} params.blockIndex
   * @param {number} [params.chainId=1]
   * @param {string} [params.verifyingContract="0xLegitBlockBridge"]
   * @returns {object} EIP-712 payload
   */
  static createEip712ResolutionManifest({
    proposalId,
    documentId,
    targetContract,
    value,
    calldata,
    blockIndex,
    chainId = 1,
    verifyingContract = "0x0000000000000000000000000000000000000001"
  }) {
    const calldataHash = sha256(calldata);

    return {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        RatifiedResolution: [
          { name: "proposalId", type: "string" },
          { name: "documentId", type: "string" },
          { name: "targetContract", type: "address" },
          { name: "value", type: "uint256" },
          { name: "calldataHash", type: "string" },
          { name: "blockIndex", type: "uint256" }
        ]
      },
      primaryType: "RatifiedResolution",
      domain: {
        name: "LegitBlock Governance Bridge",
        version: "1.0",
        chainId,
        verifyingContract
      },
      message: {
        proposalId,
        documentId: documentId || "doc-general",
        targetContract,
        value: BigInt(value).toString(),
        calldataHash: "0x" + calldataHash,
        blockIndex
      }
    };
  }
}
