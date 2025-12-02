# 60-Second Demo Script

Quick walkthrough to showcase Locksmith Jr.'s key features in under 60 seconds.

## Demo Setup

**Prerequisites:**
- App running and accessible
- Browser with Web Crypto support (Chrome, Firefox, Safari, Edge)
- No existing vault (fresh start)

**Recommended Browser:** Chrome or Edge (best PWA support)

## Script (60 seconds)

### 0:00 - 0:10 | Landing & Create Vault (10s)

**Action:**
1. Open application in browser
2. "Welcome to Locksmith Jr." - the educational password manager
3. Click **"Create Vault"** button

**Say:**
> "Locksmith Jr. is a client-side password manager that teaches you about encryption. Let's create a secure vault."

**Show:**
- Clean, professional landing page
- "Works Offline" badge (if PWA activated)
- "Install App" button (if available)

---

### 0:10 - 0:20 | Master Password & Encryption (10s)

**Action:**
1. Enter master password: `DemoPassword123!`
2. Toggle **Explainer Mode** on
3. Click **"Create Vault"**

**Say:**
> "Enter a master password. Watch as it's transformed into a 256-bit encryption key using PBKDF2 with 150,000 iterations."

**Show:**
- Password strength meter (should show "Strong" for demo password)
- Explainer mode toggle
- Step-by-step encryption visualization:
  - Salt generation (16 bytes)
  - Key derivation progress bar
  - Empty vault creation
  - AES-GCM encryption
  - Secure storage in IndexedDB

---

### 0:20 - 0:35 | Add Entry with Generator (15s)

**Action:**
1. Click **"Add Entry"** button
2. Fill in:
   - Site: `github.com`
   - Username: `demo@example.com`
3. Click **"Generate"** (sparkles icon)
4. Customize generator:
   - Length: 16
   - All character types enabled
   - Avoid ambiguous: on
5. Click **"Use Password"**

**Say:**
> "Let's add GitHub credentials. I'll use the secure password generator with 16 characters, mixing all types, and avoiding confusing characters like 'O' and '0'."

**Show:**
- Clean entry modal
- Password generator modal with live preview
- Strength meter showing "Very Strong" (green)
- Entropy calculation (~95 bits)
- One-click "Use Password" insertion

---

### 0:35 - 0:45 | View & Security Features (10s)

**Action:**
1. Click **"Save"**
2. Hover over password field (show masked bullets)
3. Press and hold **eye icon** (500ms)
4. Release to hide
5. Point to **"Panic Lock"** button
6. Point to **"Settings"** (show auto-lock timer)

**Say:**
> "Passwords are masked by default. Press-and-hold to reveal temporarily. The panic lock button clears everything from memory instantly. Auto-lock protects you after 5 minutes of inactivity."

**Show:**
- Saved entry in vault
- Secure password reveal (press-and-hold)
- Copy button (without revealing)
- Panic Lock button (red, with shield icon)
- Settings modal (auto-lock timer: 2-20 minutes)

---

### 0:45 - 0:55 | Learn & PWA (10s)

**Action:**
1. Click **"Learn"** button
2. Scroll through explainer (briefly)
3. Go back to vault
4. Click **"Install App"** (if available)
5. Show offline badge

**Say:**
> "The Learn section explains every cryptographic step in plain English. Install it as a PWA for offline access. Everything works locally—no cloud, no tracking."

**Show:**
- Educational content (PBKDF2, AES-GCM explanations)
- Visual diagrams
- PWA install prompt
- "Works Offline" badge
- Standalone app icon

---

### 0:55 - 1:00 | Security Summary (5s)

**Action:**
- Lock vault (optional)
- Show final screen

**Say:**
> "Zero-knowledge encryption, offline-first, and educational. Perfect for learning modern cryptography hands-on."

**Final Highlights:**
- ✅ AES-256-GCM encryption
- ✅ PBKDF2 key derivation (150k iterations)
- ✅ Secure password generation
- ✅ PWA installable
- ✅ Completely client-side
- ✅ No telemetry or tracking

---

## Extended Demo (2-3 minutes)

For more detailed demonstrations:

### Advanced Features

**Export/Import (30s):**
1. Click **"Export/Import"**
2. Show export process
3. Download encrypted JSON
4. Explain import workflow

**Session Safety (30s):**
1. Show activity monitoring
2. Trigger auto-lock warning (wait or adjust timeout)
3. Demonstrate panic lock
4. Show beforeunload protection

**Password Strength Analysis (30s):**
1. Add entry with weak password
2. Show strength meter (red, "Very Weak")
3. Read improvement hints
4. Replace with strong password
5. Show meter change to green

**Offline Mode (30s):**
1. Open browser DevTools
2. Toggle offline mode
3. Reload page
4. Show full functionality
5. Re-enable network

---

## Talking Points

### Security

**Key Points:**
- "Everything happens in your browser—no servers involved"
- "Your master password never leaves your device"
- "Industry-standard encryption: AES-256-GCM"
- "150,000 PBKDF2 iterations slow down attacks"
- "Each encryption uses a unique random IV"

### Education

**Key Points:**
- "Interactive explainer shows each crypto step"
- "Learn by doing with real encryption"
- "Understand PBKDF2, salts, AES-GCM"
- "Open source—review all the code"

### Privacy

**Key Points:**
- "No analytics, no tracking, no telemetry"
- "No cloud sync, no external API calls"
- "Service worker only caches app shell, never vault data"
- "Complete privacy by design"

### Use Cases

**Key Points:**
- "Educational tool for learning cryptography"
- "Demonstration of Web Crypto API"
- "Reference implementation for password managers"
- "NOT a replacement for production password managers"

---

## Common Questions

### "Is this secure for real passwords?"

**Answer:**
> "Locksmith Jr. uses industry-standard encryption, but it's designed as an educational tool. For production use, we recommend established password managers like Bitwarden, 1Password, or KeePass. Those have been security-audited, have larger teams, and include features like breach monitoring."

### "Can I sync across devices?"

**Answer:**
> "No. Locksmith Jr. is 100% local. You can export your encrypted vault and import it on another device, but there's no automatic sync. This is intentional—no cloud means no attack surface for sync servers."

### "What if I forget my master password?"

**Answer:**
> "Unfortunately, it's unrecoverable. This is zero-knowledge encryption—even we can't help because your password never leaves your device. Always export backups and store them securely."

### "Does it work on mobile?"

**Answer:**
> "Yes! Install it as a PWA and it works great on iOS Safari and Chrome Android. Full offline support on mobile too."

### "Can I self-host it?"

**Answer:**
> "Absolutely. It's just static files. Host on any web server, S3, GitHub Pages, etc. Just serve over HTTPS for Web Crypto API support."

---

## Demo Scenarios

### For Developers

**Focus:**
- Code architecture
- Web Crypto API implementation
- React best practices
- TypeScript usage
- PWA service worker
- IndexedDB integration

**Show:**
- Browser DevTools → Application tab
- IndexedDB structure
- Service Worker status
- Network tab (no external requests after load)

### For Security Enthusiasts

**Focus:**
- Cryptographic primitives
- Key derivation process
- Encryption flow
- Threat model
- Security limitations

**Show:**
- Explainer mode (full crypto flow)
- Documentation (SECURITY.md)
- Source code review
- Memory inspection (while locked vs unlocked)

### For End Users

**Focus:**
- Ease of use
- Password generation
- Offline capability
- Privacy guarantees

**Show:**
- Simple workflow
- Helpful UI elements
- Strength meter guidance
- Install as app
- No network traffic

---

## Presentation Tips

### Do

✅ **Start with "This is educational"** - Set expectations
✅ **Show explainer mode** - The differentiator
✅ **Emphasize local-first** - No cloud, no tracking
✅ **Demonstrate password generator** - Very practical
✅ **Install as PWA** - Shows modern web capabilities

### Don't

❌ **Skip security warnings** - Always mention limitations
❌ **Overclaim security** - "Perfect" or "unbreakable"
❌ **Rush through explainer** - That's the value
❌ **Forget offline demo** - Key PWA feature
❌ **Hide source code** - Transparency is a feature

---

## Technical Demo Setup

### DevTools Configuration

**Application Tab:**
- Show IndexedDB: `locksmith-vault` database
- Show localStorage: `locksmith-settings`
- Show Service Worker: Status and cache contents
- Show Manifest: PWA configuration

**Network Tab:**
- Clear network log
- Reload page
- Show: Only initial HTML/JS/CSS
- Show: No subsequent requests (offline-first)
- Toggle offline: Still works

**Console Tab:**
- Service Worker registration logs
- No errors
- No warnings about mixed content

### Performance Demo

**Lighthouse Audit:**
1. Open DevTools → Lighthouse
2. Run audit (Desktop, Navigation)
3. Expected scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 100
   - SEO: 90+
   - PWA: 100 (if installed)

---

## Handout/Summary

**Key Features:**
- 🔐 AES-256-GCM encryption
- 🔑 PBKDF2-SHA256 (150k iterations)
- 🎲 Secure password generation
- 📱 Installable PWA
- 🔒 Auto-lock & panic lock
- 🎓 Interactive crypto explainer
- 🚫 No tracking or telemetry
- 💾 100% client-side
- 📖 Fully open source

**Links:**
- Live Demo: [URL]
- GitHub: [URL]
- Documentation: [URL]
- Security: docs/SECURITY.md

---

**Demo Duration:** 60 seconds (core) | 2-3 minutes (extended)

**Last Updated:** 2025-10-27
