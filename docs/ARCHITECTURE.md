# Architecture Documentation

## Overview

Locksmith Jr. is a client-side password manager built with modern web technologies. The architecture follows a layered approach with clear separation of concerns between UI, business logic, and cryptographic operations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    User Interface Layer                    │  │
│  │         (React Components + React Router)                  │  │
│  │                                                             │  │
│  │  Home → Create → Unlock → Vault → Learn                   │  │
│  │    │      │        │        │        │                     │  │
│  │    └──────┴────────┴────────┴────────┘                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Application Layer                        │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Session    │  │   Password   │  │     PWA      │    │  │
│  │  │   Manager    │  │   Generator  │  │   Manager    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Crypto Layer                             │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   PBKDF2     │  │   AES-GCM    │  │   Random     │    │  │
│  │  │   Key KDF    │  │  Encryption  │  │   Generate   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Storage Layer                            │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  IndexedDB   │  │ localStorage │  │ Service      │    │  │
│  │  │  (Vault)     │  │  (Settings)  │  │ Worker Cache │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### User Interface Layer

**Pages:**
- `Home.tsx` - Landing page with vault status and install button
- `CreateVault.tsx` - Vault creation with explainer mode
- `UnlockVault.tsx` - Master password authentication
- `VaultPage.tsx` - Main vault container with session management
- `LearnPage.tsx` - Educational cryptography content
- `ExplainerPage.tsx` - Step-by-step encryption demonstration

**Components:**
- `VaultDashboard.tsx` - Main vault interface
- `VaultEntry.tsx` - Individual password entry
- `AddEntryModal.tsx` - Entry creation/editing
- `PasswordGenerator.tsx` - Password generation modal
- `PasswordStrengthMeter.tsx` - Strength visualization
- `SecurePasswordField.tsx` - Press-and-hold reveal
- `SettingsModal.tsx` - Security settings
- `InstallButton.tsx` - PWA installation prompt
- `OfflineBadge.tsx` - Offline status indicator

### Application Layer

**Session Management:**
```typescript
SessionManager
├── Activity Monitoring (mouse, keyboard, touch, scroll)
├── Visibility Change Detection
├── Auto-lock Timer (configurable 2-20 min)
├── Warning Toast (20 sec before lock)
└── Panic Lock (immediate clear)
```

**Password Tools:**
```typescript
Password Utilities
├── Generator (8-32 chars, character sets, ambiguous filter)
├── Strength Analyzer (entropy, pattern detection, hints)
└── Options (uppercase, lowercase, numbers, symbols)
```

**PWA Manager:**
```typescript
PWA Service
├── Service Worker Registration
├── Install Prompt Handling
├── Offline Detection
└── Cache Management
```

### Crypto Layer

**Key Derivation (PBKDF2):**
```typescript
interface KeyDerivation {
  algorithm: 'PBKDF2';
  hash: 'SHA-256';
  iterations: 150000;
  salt: Uint8Array(16);  // Random per vault
  keyLength: 256;         // bits
}
```

**Encryption (AES-GCM):**
```typescript
interface Encryption {
  algorithm: 'AES-GCM';
  keyLength: 256;           // bits
  iv: Uint8Array(12);       // Random per operation
  tagLength: 128;           // bits
  additionalData: null;
}
```

**Random Generation:**
```typescript
// Cryptographically secure random
crypto.getRandomValues(array);
```

### Storage Layer

**IndexedDB Schema:**
```typescript
Database: 'locksmith-vault'
Version: 1

ObjectStore: 'vault'
{
  id: 'main-vault',
  salt: Uint8Array(16),          // PBKDF2 salt
  encryptedData: Uint8Array,     // AES-GCM ciphertext
  iv: Uint8Array(12),            // AES-GCM IV
  version: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**localStorage:**
```typescript
'locksmith-settings': {
  autoLockMinutes: number  // 2-20
}
```

**Service Worker Cache:**
```
Cache: 'locksmith-jr-v1'
- /index.html
- /assets/*.js
- /assets/*.css
(NO vault data cached)
```

## Data Flow

### Vault Creation

```
User Input
    │
    ▼
Master Password
    │
    ├─→ Generate Random Salt (16 bytes)
    │
    ├─→ PBKDF2-SHA256 (150k iterations)
    │       │
    │       ▼
    │   256-bit Key
    │
    ├─→ Create Empty Vault { entries: [] }
    │
    ├─→ Generate Random IV (12 bytes)
    │
    ├─→ AES-GCM Encrypt
    │       │
    │       ▼
    │   Ciphertext + Auth Tag
    │
    └─→ Store in IndexedDB
            { salt, encryptedData, iv }
```

### Vault Unlock

```
User Input
    │
    ▼
Master Password
    │
    ├─→ Retrieve Salt from IndexedDB
    │
    ├─→ PBKDF2-SHA256 (150k iterations)
    │       │
    │       ▼
    │   256-bit Key
    │
    ├─→ Retrieve IV and Ciphertext
    │
    ├─→ AES-GCM Decrypt
    │       │
    │       ├─→ Success: Plaintext Vault
    │       │
    │       └─→ Fail: Invalid Password
    │
    └─→ Load Vault into Memory
            Start Session Timer
```

### Adding Entry

```
User Input
    │
    ▼
Entry Data (site, username, password)
    │
    ├─→ Add to Vault Object in Memory
    │
    ├─→ Generate New Random IV (12 bytes)
    │
    ├─→ AES-GCM Encrypt Entire Vault
    │       │
    │       ▼
    │   New Ciphertext + Auth Tag
    │
    └─→ Update IndexedDB
            { encryptedData, iv, updatedAt }
```

## Security Boundaries

### Trust Boundary

```
┌─────────────────────────────────────┐
│      Trusted (Client-Side)          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Master Password (in memory)   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Decryption Key (in memory)    │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Plaintext Vault (in memory)   │ │
│  └────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
             │
             │ Encryption Boundary
             │
┌─────────────▼───────────────────────┐
│     Untrusted (Persistent)          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Encrypted Vault (IndexedDB)   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Salt (IndexedDB)              │ │
│  └────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
```

### Memory Management

**In-Memory (While Unlocked):**
- Master password (cleared after key derivation)
- Derived encryption key (CryptoKey object)
- Plaintext vault entries
- Session state

**Cleared on Lock:**
- All plaintext vault data
- CryptoKey reference
- Session timers
- Any temporary password fields

**Persistent (Always):**
- Encrypted vault blob
- Salt for key derivation
- IV for decryption
- User settings (non-sensitive)

## PWA Architecture

### Service Worker Lifecycle

```
Install Event
    │
    ├─→ Cache App Shell
    │   - /index.html
    │   - /assets/*.js
    │   - /assets/*.css
    │
    └─→ skipWaiting()

Activate Event
    │
    ├─→ Delete Old Caches
    │
    ├─→ clients.claim()
    │
    └─→ Notify Clients (SW_ACTIVATED)

Fetch Event
    │
    ├─→ Check Cache
    │   │
    │   ├─→ Cache Hit: Return Cached
    │   │
    │   └─→ Cache Miss: Network Fetch
    │           │
    │           ├─→ Success: Cache & Return
    │           │
    │           └─→ Fail: Fallback to index.html
    │
    └─→ Exclude: /api/, IndexedDB requests
```

### Offline-First Strategy

```
Request Type          Strategy
─────────────────────────────────────
HTML                  Network First, Cache Fallback
JavaScript            Cache First, Network Update
CSS                   Cache First, Network Update
Images/Icons          Cache First
API Calls             Network Only (none exist)
IndexedDB Ops         Always Available (local)
```

## Performance Considerations

### Lazy Loading
- Components loaded on-demand via React Router
- Service worker caches after first load

### Crypto Performance
- PBKDF2 intentionally slow (security feature)
- AES-GCM very fast (hardware accelerated)
- Key caching in memory (avoid re-derivation)

### Storage Efficiency
- Vault stored as binary (Uint8Array)
- Base64 encoding only for export
- Minimal metadata overhead

## Scalability

**Current Limits:**
- Vault entries: ~10,000 (practical limit)
- Entry size: No hard limit (reasonable: < 1 KB each)
- Total vault size: < 10 MB (IndexedDB quota dependent)
- Encryption time: Linear with vault size

**Optimization Opportunities:**
- Individual entry encryption (granular updates)
- Incremental encryption (large vaults)
- Web Worker for crypto operations (UI responsiveness)

## Browser Compatibility

**Required APIs:**
- Web Crypto API (AES-GCM, PBKDF2)
- IndexedDB
- Service Workers (optional, for PWA)
- localStorage

**Supported Browsers:**
- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Static Hosting              │
│  (Vercel/Netlify/GitHub Pages)     │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Serve Static Files            │ │
│  │  - index.html                  │ │
│  │  - JavaScript bundles          │ │
│  │  - CSS                         │ │
│  │  - PWA assets                  │ │
│  └────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
             │
             │ HTTPS Only
             │
┌─────────────▼───────────────────────┐
│          User Browser               │
│                                      │
│  All processing happens here        │
│  No backend communication           │
│                                      │
└─────────────────────────────────────┘
```

**No Backend Required:**
- Pure static site
- All crypto in browser
- All storage in browser
- No API calls
- No database server

## Development Architecture

```
Development                  Production
─────────────                ──────────────
Vite Dev Server      →      Static HTML/JS/CSS
├── Hot Module Reload        ├── Minified bundles
├── TypeScript Check         ├── Tree shaken
├── Fast Refresh            ├── Optimized
└── Source Maps             └── Hashed filenames
```

## Future Enhancements

Potential improvements (not implemented):

1. **Web Worker Crypto** - Move encryption off main thread
2. **Indexed Encryption** - Encrypt individual entries
3. **Backup Automation** - Scheduled export reminders
4. **Multi-Vault** - Support multiple vaults
5. **Biometric Unlock** - WebAuthn integration
6. **Browser Extension** - Auto-fill capabilities

---

**Note:** This architecture prioritizes security, simplicity, and educational value over feature completeness.
