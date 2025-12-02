# Security Documentation

## Threat Model

### Assets to Protect

1. **Master Password** - Unlocks entire vault
2. **Encryption Key** - Derived from master password
3. **Plaintext Vault Data** - Passwords, usernames, notes
4. **Encrypted Vault Data** - At rest in IndexedDB

### Adversary Capabilities

**Assumed Threats:**

1. **Local Disk Access**
   - Adversary gains read access to device storage
   - Can read IndexedDB, localStorage
   - Cannot read memory of running processes

2. **Network Eavesdropping**
   - Adversary intercepts network traffic
   - Cannot break TLS/HTTPS

3. **Stolen/Lost Device**
   - Device powered off
   - Vault locked
   - Full disk not encrypted

4. **Weak Password Attacks**
   - Dictionary attacks
   - Brute force attacks
   - Credential stuffing

**Out of Scope:**

1. **Malware on Device**
   - Keyloggers
   - Screen capture
   - Memory scraping

2. **Compromised Browser**
   - Malicious extensions
   - Browser exploits

3. **Physical Access While Unlocked**
   - Shoulder surfing
   - Direct access to unlocked device

4. **Advanced Persistent Threats**
   - Nation-state actors
   - Supply chain attacks

## Security Controls

### Cryptographic Controls

| Control | Implementation | Strength |
|---------|---------------|----------|
| Key Derivation | PBKDF2-SHA256, 150k iterations | High |
| Encryption | AES-256-GCM | Very High |
| Salt | 16 bytes, cryptographically random | High |
| IV | 12 bytes, unique per operation | High |
| Authentication | GCM auth tag (128 bits) | Very High |
| RNG | crypto.getRandomValues() | Very High |

### Application Controls

| Control | Implementation | Purpose |
|---------|---------------|---------|
| Auto-lock | 2-20 min configurable | Limit exposure time |
| Panic Lock | Immediate clear | Emergency protection |
| Session Monitoring | Activity tracking | Detect inactivity |
| beforeunload | Clear on close | Memory cleanup |
| Password Generator | Secure random | Strong passwords |
| Strength Meter | Real-time analysis | User guidance |
| Press-and-hold Reveal | 500ms delay | Prevent accidents |

### Storage Controls

| Control | Implementation | Purpose |
|---------|---------------|---------|
| IndexedDB Encryption | AES-GCM encrypted vault | At-rest protection |
| No localStorage vault | Only settings stored | Minimize exposure |
| Service Worker exclusion | Vault not cached | Prevent leakage |
| Memory clearing | Lock removes plaintext | Limit memory exposure |

## Attack Scenarios

### ✅ Protected Scenarios

#### 1. Stolen Device (Locked Vault)

**Attack:** Adversary steals powered-off device with locked vault

**Protection:**
- Vault encrypted with AES-256-GCM
- Key derived via PBKDF2 (150k iterations)
- Requires master password to decrypt

**Result:** ✅ Vault data protected (assuming strong password)

#### 2. IndexedDB Access

**Attack:** Malicious app reads IndexedDB contents

**Protection:**
- All vault data encrypted
- Only ciphertext available
- No key material in storage

**Result:** ✅ Vault data protected

#### 3. Network Interception

**Attack:** MITM attack on network traffic

**Protection:**
- No vault data transmitted
- All processing client-side
- HTTPS for app delivery (enforced)

**Result:** ✅ No vault data exposed

#### 4. Weak Password

**Attack:** Dictionary attack on captured encrypted vault

**Protection:**
- 150k PBKDF2 iterations slow down attacks
- Salt prevents rainbow tables
- Password strength meter guides users

**Result:** ✅ Partially protected (depends on password strength)

**Time to crack:**
- Weak password (8 chars, lowercase): Hours to days
- Strong password (12+ chars, mixed): Years to centuries

#### 5. Vault Tampering

**Attack:** Adversary modifies encrypted vault file

**Protection:**
- AES-GCM authentication tag
- Any modification detected on decrypt
- Fails with "Invalid password" error

**Result:** ✅ Tampering detected

#### 6. Memory Dump (Locked)

**Attack:** Memory dump taken while vault is locked

**Protection:**
- No plaintext vault in memory
- No encryption key in memory
- Only encrypted data present

**Result:** ✅ Vault protected

### ❌ Unprotected Scenarios

#### 1. Keylogger

**Attack:** Malware logs keystrokes, captures master password

**Protection:** None

**Mitigation:**
- Keep device malware-free
- Use trusted devices only
- Consider hardware security keys (future)

**Result:** ❌ Master password compromised → Full vault access

#### 2. Screen Capture

**Attack:** Malware screenshots passwords during viewing

**Protection:** None (press-and-hold reduces casual exposure)

**Mitigation:**
- Trust your device
- Use on clean systems only

**Result:** ❌ Viewed passwords compromised

#### 3. Memory Dump (Unlocked)

**Attack:** Memory dump while vault is unlocked

**Protection:** OS-level memory protection only

**Mitigation:**
- Lock vault when not in use
- Enable auto-lock
- Use panic lock

**Result:** ❌ Plaintext vault may be recovered

#### 4. Compromised Browser

**Attack:** Malicious extension or browser exploit

**Protection:** None (trusts browser)

**Mitigation:**
- Keep browser updated
- Review installed extensions
- Use reputable browser

**Result:** ❌ Full compromise possible

#### 5. Shoulder Surfing

**Attack:** Physical observation while unlocking or viewing

**Protection:** None (physical security required)

**Mitigation:**
- Privacy screens
- Awareness of surroundings
- Press-and-hold reveal (minimal help)

**Result:** ❌ Observed credentials compromised

#### 6. Phishing for Master Password

**Attack:** Fake login page steals master password

**Protection:** None (user awareness required)

**Mitigation:**
- Verify URL before entering password
- No legitimate site asks for master password
- Locksmith Jr. is client-side only

**Result:** ❌ Master password compromised if user falls for phishing

## Limitations

### By Design

1. **No Forward Secrecy**
   - Key compromise reveals all past data
   - No perfect forward secrecy

2. **No Key Rotation**
   - Cannot change master password
   - Must create new vault

3. **All-or-Nothing Decryption**
   - Entire vault decrypted on unlock
   - No granular access control

4. **Single Vault**
   - No separation between types of credentials
   - One master password protects everything

5. **No Secure Sharing**
   - No built-in sharing mechanism
   - Export required for sharing

### Environmental

1. **Browser Dependence**
   - Trusts browser implementation
   - Vulnerable to browser bugs

2. **OS Dependence**
   - Trusts OS memory protection
   - Vulnerable to OS exploits

3. **No Hardware Security**
   - No TPM/Secure Enclave integration
   - Keys in software memory only

4. **No Biometrics**
   - Password-only authentication
   - No WebAuthn support

### Cryptographic

1. **PBKDF2 vs. Argon2**
   - PBKDF2 less resistant to specialized hardware
   - Argon2 would be better but not natively supported

2. **No Memory-Hard KDF**
   - Vulnerable to GPU/ASIC attacks
   - 150k iterations partially mitigates

3. **No Plausible Deniability**
   - Encrypted vault is obviously encrypted
   - No hidden volumes

## Best Practices

### For Users

**Master Password:**
- [ ] Use 12+ characters
- [ ] Mix uppercase, lowercase, numbers, symbols
- [ ] Avoid dictionary words
- [ ] Don't reuse from other sites
- [ ] Don't write it down insecurely
- [ ] Consider using a passphrase

**Usage:**
- [ ] Use on trusted devices only
- [ ] Keep device malware-free
- [ ] Lock vault when not in use
- [ ] Enable auto-lock (5 min recommended)
- [ ] Use panic lock if needed
- [ ] Export vault regularly
- [ ] Test decryption of exports

**Environment:**
- [ ] Use HTTPS only (enforced)
- [ ] Keep browser updated
- [ ] Review browser extensions
- [ ] Use private/incognito mode (optional)

### For Developers

**Code Security:**
- [ ] Review all crypto code
- [ ] Never log sensitive data
- [ ] Clear passwords from memory
- [ ] Use constant-time comparisons
- [ ] Validate all inputs
- [ ] Handle errors securely

**Build Security:**
- [ ] Audit dependencies
- [ ] Use lock files
- [ ] Verify bundle contents
- [ ] Enable CSP headers
- [ ] Use subresource integrity

## Privacy Guarantees

### Data Collection

**Collected:** None

**Not Collected:**
- ❌ No analytics
- ❌ No telemetry
- ❌ No error reporting
- ❌ No usage statistics
- ❌ No personally identifiable information

### Data Transmission

**Transmitted:** None (after initial app load)

**Not Transmitted:**
- ❌ No vault data
- ❌ No passwords
- ❌ No master password
- ❌ No user behavior
- ❌ No device information

### Third Parties

**Third-party Services:** None

**No:**
- ❌ No cloud sync
- ❌ No backup service
- ❌ No analytics service
- ❌ No CDN for runtime assets
- ❌ No API calls

### Local Storage

**Stored Locally:**
- ✅ Encrypted vault (IndexedDB)
- ✅ Salt and IV (IndexedDB)
- ✅ User settings (localStorage)
- ✅ Service Worker cache (app shell only)

**Never Stored:**
- ❌ Master password
- ❌ Encryption key
- ❌ Plaintext passwords (except in memory while unlocked)

## Incident Response

### If Master Password Compromised

1. **Immediate Actions:**
   - Export vault
   - Create new vault with new master password
   - Import entries (re-encrypted automatically)
   - Delete old vault
   - Change compromised passwords

2. **Investigation:**
   - Determine how password was compromised
   - Check for malware
   - Review access logs (if available)

3. **Prevention:**
   - Use stronger master password
   - Enable additional device security
   - Review security practices

### If Device Stolen

**Vault Locked:**
- Minimal risk if strong master password
- Consider passwords compromised if weak master password

**Vault Unlocked:**
- Assume all passwords compromised
- Change all stored passwords immediately
- Enable 2FA where possible

**Recommended:**
1. Remote wipe device (if capable)
2. Change all critical passwords
3. Monitor accounts for suspicious activity
4. Report theft to authorities

### If Vault File Leaked

**Impact Assessment:**
- Encrypted vault alone: Low risk (assuming strong master password)
- Vault + master password hints: Medium risk
- Vault + weak master password: High risk

**Actions:**
1. Assess master password strength
2. If weak: Assume compromise, change all passwords
3. If strong: Monitor for suspicious activity
4. Create new vault with new master password

## Security Checklist

### Pre-Deployment

**Cryptography:**
- [x] PBKDF2 with 150k iterations
- [x] AES-256-GCM for encryption
- [x] Cryptographically secure random (salt, IV)
- [x] Unique IV per encryption
- [x] Authentication tags verified

**Code Security:**
- [x] No sensitive data in logs
- [x] Memory cleared on lock
- [x] Error messages don't leak info
- [x] Input validation
- [x] XSS prevention (React escaping)

**Storage Security:**
- [x] Vault always encrypted at rest
- [x] No plaintext in persistent storage
- [x] Service Worker doesn't cache vault
- [x] Settings separated from vault

**Session Security:**
- [x] Auto-lock implemented
- [x] Activity monitoring
- [x] beforeunload cleanup
- [x] Panic lock available

### Post-Deployment

**Infrastructure:**
- [ ] Serve over HTTPS only
- [ ] HSTS headers enabled
- [ ] CSP headers configured
- [ ] SRI for external resources

**Monitoring:**
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Browser compatibility testing
- [ ] Performance monitoring

**Documentation:**
- [x] Threat model documented
- [x] Limitations disclosed
- [x] Best practices provided
- [x] Incident response plan

## Compliance

### NIST Guidelines

**Aligned With:**
- ✅ SP 800-132 (PBKDF2 recommendations)
- ✅ SP 800-38D (AES-GCM usage)
- ✅ SP 800-90A (Random number generation)

### OWASP

**Aligned With:**
- ✅ Password Storage Cheat Sheet
- ✅ Cryptographic Storage Cheat Sheet
- ✅ Session Management Cheat Sheet

**Not Aligned With:**
- ❌ Rate limiting (not applicable, no backend)
- ❌ Account lockout (not applicable)

## Known Issues

### Current

1. **No Web Worker Crypto**
   - Encryption blocks UI thread
   - Noticeable delay for large vaults

2. **No Biometric Unlock**
   - Password-only authentication
   - Could integrate WebAuthn

3. **No Secure Sharing**
   - Manual export/import required
   - Could implement encrypted sharing

### Historical

None (new project)

## Security Contacts

For security issues:
- **Do not** open public GitHub issues
- Email: security@example.com
- PGP key: [Link to key]

Expected response time: 48 hours

---

**Last Updated:** 2025-10-27

**Next Review:** 2026-04-27 (6 months)
