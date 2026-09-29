/**
 * Abstract Storage Adapter interface for LegitBlock persistence.
 * Allows decoupling blockchain & voting state from Node fs.
 */
export class StorageAdapter {
  constructor(name = "base") {
    this.name = name;
  }

  /**
   * Check if storage has an initialized blockchain
   * @returns {Promise<boolean>}
   */
  async isInitialized() {
    throw new Error("StorageAdapter.isInitialized() must be implemented");
  }

  /**
   * Load blockchain data
   * @returns {Promise<object|null>}
   */
  async loadBlockchain() {
    throw new Error("StorageAdapter.loadBlockchain() must be implemented");
  }

  /**
   * Save blockchain data
   * @param {object} chainData
   * @returns {Promise<void>}
   */
  async saveBlockchain(chainData) {
    throw new Error("StorageAdapter.saveBlockchain() must be implemented");
  }

  /**
   * Load voting engine proposals data
   * @returns {Promise<object|null>}
   */
  async loadProposals() {
    throw new Error("StorageAdapter.loadProposals() must be implemented");
  }

  /**
   * Save voting engine proposals data
   * @param {object} proposalsData
   * @returns {Promise<void>}
   */
  async saveProposals(proposalsData) {
    throw new Error("StorageAdapter.saveProposals() must be implemented");
  }

  /**
   * Clear all stored data
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error("StorageAdapter.clear() must be implemented");
  }
}
