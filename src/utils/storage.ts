import { openDB, IDBPDatabase } from 'idb';
import { EncryptedVault } from './crypto';

const DB_NAME = 'locksmithjr';
const STORE_NAME = 'kv';
const VAULT_KEY = 'vault';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const vaultStore = {
  async get(k: string): Promise<any> {
    const db = await getDB();
    return db.get(STORE_NAME, k);
  },
  async set(k: string, v: any): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, v, k);
  },
  async del(k: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, k);
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  },
};

export async function saveVault(vault: EncryptedVault): Promise<void> {
  console.debug('[Storage] Saving vault to IndexedDB...');
  console.debug('[Storage] Vault object to save:', {
    version: vault.version,
    kdfType: vault.kdf.type,
    iterations: vault.kdf.iterations,
    saltLength: vault.kdf.salt?.length,
    ivLength: vault.cipher.iv?.length,
    vaultLength: vault.vault?.length,
  });

  console.debug('[Storage] Performing sanity check write...');
  await vaultStore.set('ping', { ok: true, t: Date.now() });
  console.debug('[Storage] Sanity check passed');

  console.debug('[Storage] Writing actual vault data...');
  await vaultStore.set(VAULT_KEY, vault);
  console.debug('[Storage] Vault saved successfully to key:', VAULT_KEY);

  console.debug('[Storage] Verifying write by reading back...');
  const verify = await vaultStore.get(VAULT_KEY);
  console.debug('[Storage] Verification read result:', verify ? 'found' : 'NOT FOUND');
  if (verify) {
    console.debug('[Storage] Verified vault has kdf:', !!verify.kdf, 'cipher:', !!verify.cipher, 'vault:', !!verify.vault);
  }
}

export async function loadVault(): Promise<EncryptedVault | null> {
  console.debug('[Storage] Loading vault from IndexedDB...');
  const vault = await vaultStore.get(VAULT_KEY);
  console.debug('[Storage] Vault loaded:', vault ? 'found' : 'not found');
  return vault || null;
}

export async function vaultExists(): Promise<boolean> {
  const vault = await loadVault();
  return vault !== null;
}

export async function deleteVault(): Promise<void> {
  await vaultStore.del(VAULT_KEY);
}

export async function getVaultMeta(): Promise<{
  kdf: { type: string; iterations: number; salt: string };
  cipher: { name: string; iv: string };
  createdAt: number;
} | null> {
  const vault = await loadVault();
  if (!vault) return null;

  return {
    kdf: vault.kdf,
    cipher: vault.cipher,
    createdAt: vault.createdAt,
  };
}

export async function resetVault(): Promise<void> {
  console.debug('[Storage] Resetting vault...');
  await vaultStore.clear();

  dbPromise = null;

  localStorage.clear();
  console.debug('[Storage] Vault reset complete');
}
