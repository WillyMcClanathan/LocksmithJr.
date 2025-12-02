# Cryptography Documentation

## Overview

Locksmith Jr. implements industry-standard cryptographic primitives using the Web Crypto API. This document explains the cryptographic design decisions, implementation details, and security properties.

## Cryptographic Primitives

### PBKDF2-SHA256 (Key Derivation)

**Purpose:** Derive encryption key from master password

**Algorithm:** PBKDF2 (Password-Based Key Derivation Function 2)
**Hash Function:** SHA-256
**Iterations:** 150,000
**Salt Size:** 16 bytes (128 bits)
**Output:** 32 bytes (256 bits)

**Why PBKDF2?**
- Native Web Crypto API support (no dependencies)
- NIST approved (SP 800-132)
- Well-understood security properties
- Resistant to GPU/ASIC attacks at high iteration counts

**Why 150,000 iterations?**
- OWASP recommendation (2023): 150,000+ for SHA-256
- Provides ~0.3 seconds on modern hardware
- Balance between security and user experience
- Slows down brute force attacks significantly

**Salt Generation:**
```typescript
const salt = new Uint8Array(16);
crypto.getRandomValues(salt);
```

### AES-GCM (Encryption)

**Purpose:** Encrypt vault data

**Algorithm:** AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)
**Key Size:** 256 bits
**IV Size:** 12 bytes (96 bits)
**Tag Size:** 16 bytes (128 bits)

**Why AES-GCM?**
- Authenticated encryption (confidentiality + integrity)
- Single-pass algorithm (efficient)
- Parallel processing capable
- NIST approved (SP 800-38D)
- Hardware acceleration in modern CPUs

**Why 256-bit keys?**
- Maximum security available in AES
- Future-proof against quantum computers (Grover's algorithm)
- No performance penalty with hardware acceleration

**IV Generation:**
```typescript
const iv = new Uint8Array(12);
crypto.getRandomValues(iv);
```

## Cryptographic Flow

### Vault Creation

```
Step 1: Generate Salt
┌─────────────────────────────────────┐
│  crypto.getRandomValues(salt)       │
│  → 16 random bytes                  │
└─────────────────────────────────────┘

Step 2: Derive Key from Password
┌─────────────────────────────────────┐
│  PBKDF2(                            │
│    password,                        │
│    salt,                            │
│    150000 iterations,               │
│    SHA-256                          │
│  ) → 256-bit encryption key         │
└─────────────────────────────────────┘

Step 3: Create Initial Vault
┌─────────────────────────────────────┐
│  vault = {                          │
│    entries: [],                     │
│    version: 1,                      │
│    createdAt: timestamp             │
│  }                                  │
└─────────────────────────────────────┘

Step 4: Serialize Vault
┌─────────────────────────────────────┐
│  plaintext = JSON.stringify(vault)  │
│  → UTF-8 encoded string             │
└─────────────────────────────────────┘

Step 5: Generate IV
┌─────────────────────────────────────┐
│  crypto.getRandomValues(iv)         │
│  → 12 random bytes                  │
└─────────────────────────────────────┘

Step 6: Encrypt
┌─────────────────────────────────────┐
│  AES-256-GCM.encrypt(               │
│    key,                             │
│    iv,                              │
│    plaintext                        │
│  ) → ciphertext + auth_tag          │
└─────────────────────────────────────┘

Step 7: Store
┌─────────────────────────────────────┐
│  IndexedDB.put({                    │
│    salt: Uint8Array(16),            │
│    encryptedData: Uint8Array,       │
│    iv: Uint8Array(12)               │
│  })                                 │
└─────────────────────────────────────┘
```

### Vault Unlock

```
Step 1: Retrieve Stored Data
┌─────────────────────────────────────┐
│  { salt, encryptedData, iv }        │
│  ← IndexedDB.get('main-vault')      │
└─────────────────────────────────────┘

Step 2: Re-derive Key
┌─────────────────────────────────────┐
│  PBKDF2(                            │
│    entered_password,                │
│    stored_salt,                     │
│    150000 iterations,               │
│    SHA-256                          │
│  ) → 256-bit key                    │
└─────────────────────────────────────┘

Step 3: Decrypt
┌─────────────────────────────────────┐
│  AES-256-GCM.decrypt(               │
│    key,                             │
│    iv,                              │
│    encryptedData                    │
│  ) → plaintext | FAIL               │
└─────────────────────────────────────┘

Step 4: Verify & Parse
┌─────────────────────────────────────┐
│  If auth_tag valid:                 │
│    vault = JSON.parse(plaintext)    │
│  Else:                              │
│    throw "Invalid password"         │
└─────────────────────────────────────┘
```

### Entry Update

```
Step 1: Modify Vault in Memory
┌─────────────────────────────────────┐
│  vault.entries.push(newEntry)       │
│  vault.updatedAt = timestamp        │
└─────────────────────────────────────┘

Step 2: Generate New IV
┌─────────────────────────────────────┐
│  crypto.getRandomValues(iv)         │
│  → Fresh 12 random bytes            │
│  (CRITICAL: Never reuse IV)         │
└─────────────────────────────────────┘

Step 3: Re-encrypt Entire Vault
┌─────────────────────────────────────┐
│  plaintext = JSON.stringify(vault)  │
│  AES-256-GCM.encrypt(               │
│    same_key,                        │
│    new_iv,                          │
│    plaintext                        │
│  ) → new_ciphertext                 │
└─────────────────────────────────────┘

Step 4: Update Storage
┌─────────────────────────────────────┐
│  IndexedDB.put({                    │
│    salt: unchanged,                 │
│    encryptedData: new_ciphertext,   │
│    iv: new_iv                       │
│  })                                 │
└─────────────────────────────────────┘
```

## Security Properties

### Confidentiality

**Property:** Encrypted data is computationally infeasible to decrypt without the key

**Provided By:**
- AES-256-GCM with properly sized keys
- Cryptographically secure IV generation
- Key derived from strong password via PBKDF2

**Threat Model:**
- ✅ Protects against: Offline brute force (with strong password)
- ✅ Protects against: Ciphertext-only attacks
- ❌ Does not protect: Weak passwords (< 12 chars, dictionary words)
- ❌ Does not protect: Keyloggers capturing password

### Integrity

**Property:** Any modification to ciphertext is detectable

**Provided By:**
- AES-GCM authentication tag (128 bits)
- Tag verified during decryption

**Guarantees:**
- ✅ Tampering detected immediately
- ✅ Truncation attacks prevented
- ✅ Bit-flipping attacks prevented
- ✅ Replay attacks (partially, via IV check)

### Authenticity

**Property:** Only holder of key can create valid ciphertext

**Provided By:**
- AES-GCM authenticated encryption
- Auth tag cryptographically bound to key

**Guarantees:**
- ✅ Forgery computationally infeasible
- ✅ Third-party cannot inject entries
- ❌ No forward secrecy (compromise of key reveals all past data)

## Randomness

### Sources

**Web Crypto API:**
```typescript
crypto.getRandomValues(array)
```

**Entropy Sources:**
- OS-level CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
- Hardware RNG (if available)
- Multiple entropy pools

**Quality:**
- Cryptographically secure
- Unpredictable
- Uniform distribution
- Suitable for cryptographic use

### Usage

**Salts (16 bytes):**
- Generated once per vault
- Stored alongside encrypted data
- Prevents rainbow table attacks

**IVs (12 bytes):**
- Generated per encryption operation
- Never reused with same key
- Critical for AES-GCM security

**Password Generation:**
- Used for random password generation
- Ensures unpredictability

## Key Management

### Key Lifecycle

```
1. Creation
   Master Password
        ↓
   PBKDF2 (150k iterations)
        ↓
   256-bit Key (in memory)

2. Usage
   Key ← Used for encryption/decryption
   Key ← Never leaves memory
   Key ← Never written to disk

3. Destruction
   Lock Action
        ↓
   Clear reference
        ↓
   Rely on garbage collection
```

### Key Storage

**In Memory:**
- Stored as `CryptoKey` object
- Non-extractable by default
- Used via Web Crypto API only

**Never Stored:**
- ❌ Never written to disk
- ❌ Never sent over network
- ❌ Never logged or serialized
- ❌ Never in localStorage/sessionStorage

### Key Derivation Parameters

```typescript
const keyDerivationParams = {
  name: 'PBKDF2',
  salt: Uint8Array(16),      // Random, stored with vault
  iterations: 150000,         // Fixed, hardcoded
  hash: 'SHA-256'            // Fixed, hardcoded
};

const keyParams = {
  name: 'AES-GCM',
  length: 256                 // Fixed, hardcoded
};
```

## Password Requirements

### Minimum Requirements

**Length:** 8 characters (enforced)
**Recommended:** 12+ characters

**Character Types:** No requirements (passphrase-friendly)

### Strength Guidelines

**Very Weak (Red):**
- < 8 characters
- Single character type
- Common patterns

**Weak (Orange):**
- 8-11 characters
- 1-2 character types

**Fair (Yellow):**
- 12-15 characters
- 3 character types

**Strong (Green):**
- 16+ characters
- 3+ character types

**Very Strong (Green):**
- 20+ characters
- All character types
- High entropy

### Entropy Calculation

```typescript
entropy = length × log₂(poolSize)

where poolSize =
  (lowercase ? 26 : 0) +
  (uppercase ? 26 : 0) +
  (numbers ? 10 : 0) +
  (symbols ? 32 : 0)
```

**Examples:**
- `password123` → ~40 bits (weak)
- `MyP@ssw0rd!` → ~60 bits (fair)
- `correct-horse-battery-staple` → ~90 bits (strong)
- Generated 16-char → ~95 bits (very strong)

## Attack Resistance

### Brute Force

**Time to crack** (with 150k iterations):

| Password Strength | Entropy | Time @ 1B/sec | Time @ 1T/sec |
|-------------------|---------|---------------|---------------|
| 8 chars, lowercase | 38 bits | 5 minutes | 0.3 seconds |
| 10 chars, mixed | 60 bits | 36 years | 13 days |
| 12 chars, mixed | 72 bits | 149k years | 149 years |
| 16 chars, all | 95 bits | 1.2B years | 1.2M years |

**Note:** These assume offline attack with access to encrypted vault.

### Dictionary Attacks

**Protection:**
- High iteration count (150k) slows down attempts
- Salt prevents rainbow tables
- No rate limiting (offline attacks possible)

**Recommendation:** Use non-dictionary words or phrases

### Rainbow Tables

**Protection:**
- Unique salt per vault
- Salt size: 16 bytes (2^128 possible salts)
- Rainbow table per-salt infeasible

### Side-Channel Attacks

**Timing Attacks:**
- PBKDF2 is intentionally slow (constant time)
- AES-GCM hardware accelerated (mostly constant time)
- IV comparison constant time in Web Crypto

**Power Analysis:**
- Not protected (assumes trusted device)

**Memory Dumps:**
- Protected while locked (no key in memory)
- Vulnerable while unlocked (key in memory)
- Relies on OS memory protection

## Implementation Details

### Code Example: Key Derivation

```typescript
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 150000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,  // non-extractable
    ['encrypt', 'decrypt']
  );
}
```

### Code Example: Encryption

```typescript
async function encrypt(
  key: CryptoKey,
  data: string
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const enc = new TextEncoder();
  const plaintext = enc.encode(data);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    plaintext
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    iv: iv
  };
}
```

### Code Example: Decryption

```typescript
async function decrypt(
  key: CryptoKey,
  ciphertext: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(plaintext);
  } catch (e) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}
```

## Comparison with Alternatives

### vs. Argon2

**Argon2 Advantages:**
- Better memory-hard properties
- Winner of Password Hashing Competition
- More resistant to GPU/ASIC attacks

**PBKDF2 Advantages:**
- Native Web Crypto API support
- No external dependencies
- Wide browser support
- Simpler implementation

**Conclusion:** Argon2 is superior but requires WebAssembly. PBKDF2 is acceptable with high iteration count.

### vs. Scrypt

**Scrypt Advantages:**
- Memory-hard (ASIC resistant)
- Better than PBKDF2 for passwords

**PBKDF2 Advantages:**
- Native browser support
- Simpler implementation
- No dependencies

**Conclusion:** Similar tradeoffs to Argon2.

### vs. AES-CBC

**AES-GCM Advantages:**
- Authenticated encryption
- Parallel processing
- Single-pass algorithm

**AES-CBC Disadvantages:**
- No authentication (needs HMAC)
- Sequential processing
- Two-pass algorithm (encrypt + MAC)

**Conclusion:** AES-GCM is clearly superior.

## Future Considerations

### Potential Improvements

1. **Argon2 via WebAssembly**
   - Better password hashing
   - Requires ~100 KB WASM module

2. **Separate Entry Encryption**
   - Granular updates
   - Entry-level IVs
   - More complex key management

3. **Key Rotation**
   - Support changing master password
   - Re-encrypt with new key

4. **Hardware Security**
   - WebAuthn for unlock
   - Secure Enclave integration (iOS)

---

**References:**
- NIST SP 800-132 (PBKDF2)
- NIST SP 800-38D (AES-GCM)
- OWASP Password Storage Cheat Sheet
- Web Crypto API Specification
