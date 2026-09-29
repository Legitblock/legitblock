import { StorageAdapter } from "./adapter.js";

/**
 * IndexedDB storage adapter for client-side browser persistence.
 * Falls back to an in-memory key-value map when running outside a browser environment.
 */
export class IndexedDBStorageAdapter extends StorageAdapter {
  constructor(dbName = "legitblock-db") {
    super("indexeddb");
    this.dbName = dbName;
    this.fallbackStore = new Map();
  }

  _hasIndexedDB() {
    return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
  }

  async _openDB() {
    if (!this._hasIndexedDB()) return null;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("state")) {
          db.createObjectStore("state");
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async _getItem(key) {
    if (!this._hasIndexedDB()) {
      return this.fallbackStore.get(key) || null;
    }
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("state", "readonly");
      const store = tx.objectStore("state");
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async _setItem(key, value) {
    if (!this._hasIndexedDB()) {
      this.fallbackStore.set(key, value);
      return;
    }
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      const store = tx.objectStore("state");
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async isInitialized() {
    const data = await this._getItem("blockchain");
    return data !== null && Array.isArray(data.chain) && data.chain.length > 0;
  }

  async loadBlockchain() {
    return this._getItem("blockchain");
  }

  async saveBlockchain(chainData) {
    await this._setItem("blockchain", chainData);
  }

  async loadProposals() {
    return this._getItem("proposals");
  }

  async saveProposals(proposalsData) {
    await this._setItem("proposals", proposalsData);
  }

  async clear() {
    if (!this._hasIndexedDB()) {
      this.fallbackStore.clear();
      return;
    }
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("state", "readwrite");
      const store = tx.objectStore("state");
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
