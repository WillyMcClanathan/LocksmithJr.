export interface KDFParams {
  type: 'PBKDF2';
  iterations: number;
  salt: string;
}

export interface CipherParams {
  name: 'AES-GCM';
  iv: string;
}

export interface EncryptedVault {
  version: number;
  kdf: KDFParams;
  cipher: CipherParams;
  vault: string;
  createdAt: number;
}

export interface VaultEntry {
  id: string;
  site: string;
  username: string;
  password: string;
  notes: string;
}

export interface DecryptedVault {
  entries: VaultEntry[];
}

import { abToB64, b64ToAb, u8ToB64 } from './base64';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

export async function deriveKeyPBKDF2(
  password: string,
  salt: Uint8Array,
  iterations = 150000
): Promise<CryptoKey> {
  console.assert(salt instanceof Uint8Array, 'Salt must be Uint8Array');
  console.assert(salt.length === 16, `Salt must be 16 bytes, got ${salt.length}`);
  console.assert(iterations === 150000, `Iterations must be 150000, got ${iterations}`);

  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSON(
  key: CryptoKey,
  iv: Uint8Array,
  obj: unknown
): Promise<ArrayBuffer> {
  console.assert(iv instanceof Uint8Array, 'IV must be Uint8Array');
  console.assert(iv.length === 12, `IV must be 12 bytes for AES-GCM, got ${iv.length}`);

  const data = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return ct;
}

export async function decryptJSON(
  key: CryptoKey,
  iv: Uint8Array,
  cipher: ArrayBuffer
): Promise<unknown> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
}

export async function kdfProof8(
  password: string,
  salt: Uint8Array,
  iterations = 150000
): Promise<string> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    256
  );
  const dig = await crypto.subtle.digest('SHA-256', bits);
  return [...new Uint8Array(dig)].slice(0, 4).map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function encryptVault(
  vault: DecryptedVault,
  masterPassword: string
): Promise<EncryptedVault> {
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  console.debug('[CREATE] Generated salt:', salt.length, 'bytes, IV:', iv.length, 'bytes');

  const key = await deriveKeyPBKDF2(masterPassword, salt, 150000);

  const proof8 = await kdfProof8(masterPassword, salt, 150000);
  console.debug('[CREATE] saltLen=', salt.length, 'ivLen=', iv.length, 'iter=150000', 'proof8=', proof8);

  const plaintext = JSON.stringify(vault);
  const plaintextBytes = new TextEncoder().encode(plaintext);
  console.debug('[CREATE] Plaintext size:', plaintextBytes.length, 'bytes');

  const ciphertext = await encryptJSON(key, iv, vault);
  console.debug('[CREATE] Ciphertext size:', ciphertext.byteLength, 'bytes');

  const record = {
    version: 1,
    kdf: {
      type: 'PBKDF2' as const,
      iterations: 150000,
      salt: u8ToB64(salt),
    },
    cipher: {
      name: 'AES-GCM' as const,
      iv: u8ToB64(iv),
    },
    vault: abToB64(ciphertext),
    createdAt: Math.floor(Date.now() / 1000),
  };

  console.debug('[CREATE] Record created, ready to store');
  return record;
}

export async function decryptVault(
  encryptedVault: EncryptedVault,
  masterPassword: string
): Promise<DecryptedVault> {
  const salt = new Uint8Array(b64ToAb(encryptedVault.kdf.salt));
  const iv = new Uint8Array(b64ToAb(encryptedVault.cipher.iv));
  const ciphertext = b64ToAb(encryptedVault.vault);

  console.debug('[UNLOCK] Salt:', salt.length, 'bytes, IV:', iv.length, 'bytes');
  console.debug('[UNLOCK] Ciphertext size:', ciphertext.byteLength, 'bytes');
  console.debug('[UNLOCK] Iterations:', encryptedVault.kdf.iterations);

  const key = await deriveKeyPBKDF2(masterPassword, salt, encryptedVault.kdf.iterations);

  const proof8 = await kdfProof8(masterPassword, salt, encryptedVault.kdf.iterations);
  console.debug('[UNLOCK] proof8=', proof8);

  const decrypted = await decryptJSON(key, iv, ciphertext);

  return decrypted as DecryptedVault;
}

export function generatePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  let password = '';
  password += uppercase[array[0] % uppercase.length];
  password += lowercase[array[1] % lowercase.length];
  password += numbers[array[2] % numbers.length];
  password += symbols[array[3] % symbols.length];

  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  return password
    .split('')
    .sort(() => array[0] % 2 === 0 ? -1 : 1)
    .join('');
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (score <= 4) {
    return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  } else if (score <= 5) {
    return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  } else {
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  }
}
