# Locksmith Jr.

A client-side password manager demonstrating modern web cryptography, built for educational purposes. Features zero-knowledge encryption, offline-first PWA capabilities, and comprehensive security features.

![Security](https://img.shields.io/badge/security-zero--knowledge-green)
![Encryption](https://img.shields.io/badge/encryption-AES--GCM-blue)
![PWA](https://img.shields.io/badge/PWA-enabled-purple)
![License](https://img.shields.io/badge/license-MIT-blue)

## ⚠️ Important Notice

**This is an educational project designed to demonstrate cryptographic concepts.** While it implements industry-standard encryption (AES-GCM, PBKDF2), it should **not replace production password managers** like Bitwarden, 1Password, or KeePass for storing sensitive credentials.

## ✨ Features

### 🔐 Security
- **Zero-knowledge encryption** - Master password never leaves your device
- **AES-GCM encryption** - 256-bit keys with authenticated encryption
- **PBKDF2-SHA256** - 150,000 iterations for key derivation
- **Cryptographic salt and IV** - Unique per vault/entry
- **Auto-lock** - Configurable timeout (2-20 minutes)
- **Panic lock** - Instant memory clearing
- **Session safety** - Activity monitoring and beforeunload protection

### 🛠️ Password Tools
- **Smart generator** - Length 8-32, customizable character sets
- **Strength analyzer** - Entropy calculation with improvement hints
- **Avoid ambiguous** - Optional exclusion of confusing characters
- **One-click replace** - Generate and insert directly into fields

### 📱 PWA Features
- **Installable** - Works as standalone app on desktop and mobile
- **Offline-first** - Full functionality without internet
- **Service worker** - Caches app shell (not vault data)
- **Works offline badge** - Visual indicator after SW activation

### 🎓 Educational
- **Interactive explainer** - Step-by-step cryptography walkthrough
- **Learn mode** - Understand encryption while using it
- **Open source** - All code available for review

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Locksmith Jr.                         │
│                  (React + TypeScript)                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼───────┐ ┌──────▼──────┐
│   Web Crypto   │ │  IndexedDB   │ │     PWA     │
│   API (AES)    │ │  (Storage)   │ │  (Offline)  │
└────────────────┘ └──────────────┘ └─────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                ┌─────────▼──────────┐
                │   Browser Only     │
                │  No Backend/Cloud  │
                └────────────────────┘
```

**Components:**
- **React Router** - Client-side routing
- **Web Crypto API** - Native browser encryption
- **IndexedDB** - Local encrypted storage
- **Service Worker** - Offline caching
- **TypeScript** - Type safety

## 🔒 Cryptography Details

### Key Derivation (PBKDF2)
```
Master Password → PBKDF2-SHA256 (150k iterations, 16-byte salt) → 256-bit Key
```

### Encryption (AES-GCM)
```
Plaintext + AES-256-GCM + 12-byte IV → Ciphertext + Auth Tag
```

### Data Flow
1. User enters master password
2. PBKDF2 derives encryption key (150,000 iterations)
3. Vault data encrypted with AES-GCM
4. Encrypted blob stored in IndexedDB
5. On unlock, password re-derives key to decrypt

**Security Properties:**
- Authenticated encryption (integrity + confidentiality)
- Unique IV per encryption operation
- Salt prevents rainbow table attacks
- High iteration count slows brute force

See [docs/CRYPTOGRAPHY.md](docs/CRYPTOGRAPHY.md) for detailed explanation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/locksmith-jr.git
cd locksmith-jr

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

### Deployment

Deploy the `dist/` folder to any static hosting:

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod --dir=dist
```

**GitHub Pages, Cloudflare Pages, etc.** - Upload `dist/` contents

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📖 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and component overview
- **[Cryptography](docs/CRYPTOGRAPHY.md)** - Encryption implementation details
- **[Security](docs/SECURITY.md)** - Threat model, limitations, best practices
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide
- **[Demo Script](docs/DEMO.md)** - 60-second walkthrough

## 🎯 Threat Model

### What Locksmith Jr. Protects Against
✅ Local disk access (encrypted at rest)
✅ Memory dumps while locked
✅ Unauthorized vault access
✅ Weak password generation

### What It Does NOT Protect Against
❌ Keyloggers or screen capture malware
❌ Compromised browser or OS
❌ Physical device theft with weak master password
❌ Side-channel attacks (timing, power analysis)
❌ Phishing for master password

**Assumption:** Your device and browser are trusted and free from malware.

See [docs/SECURITY.md](docs/SECURITY.md) for complete threat model.

## 🔐 Security Checklist

Before using Locksmith Jr.:

- [ ] **Use HTTPS** - Required for Web Crypto API
- [ ] **Strong master password** - 12+ characters, mixed types
- [ ] **Export regularly** - Backup your encrypted vault
- [ ] **Trusted device** - Use on malware-free devices only
- [ ] **Update browser** - Keep browser/OS patched
- [ ] **Enable auto-lock** - Don't leave vault unlocked
- [ ] **Test recovery** - Verify you can decrypt exports

## 🕒 60-Second Demo

```
1. Visit app → Click "Create Vault"
2. Enter strong master password → View encryption steps
3. Click "Add Entry" → Enter site/username
4. Click "Generate" → Customize password → Use Password
5. View strength meter → Save entry
6. Lock vault → Unlock with password
7. Click "Learn" → Explore cryptography explainer
8. Click "Install App" → Use offline
```

See [docs/DEMO.md](docs/DEMO.md) for detailed walkthrough.

## 🛡️ Privacy

**No telemetry. No tracking. No cloud storage.**

- All data stays on your device
- No analytics or third-party scripts
- No server communication (except for static assets)
- Vault data never transmitted anywhere
- Service worker only caches app shell

## 🏛️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **IndexedDB (idb)** - Local storage
- **Web Crypto API** - Encryption

## 📦 Project Structure

```
locksmith-jr/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Route pages
│   ├── utils/           # Crypto, storage, session
│   ├── styles/          # CSS and animations
│   └── main.tsx         # Entry point
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── sw.js           # Service worker
│   └── icons/          # App icons
├── docs/               # Documentation
└── README.md          # This file
```

## 🧪 Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## 🤝 Contributing

This is an educational project. Contributions welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Inspired by modern password managers (Bitwarden, 1Password)
- Built with Web Crypto API standards
- Educational content adapted from cryptography best practices

## ⚡ Performance

- **Bundle size:** ~282 KB (gzipped: ~81 KB)
- **First load:** < 1s on fast 3G
- **Encryption:** < 100ms for typical vault
- **Decryption:** < 50ms with cached key
- **PWA cache:** < 500ms cold start offline

## 🔗 Links

- **Live Demo:** [locksmith-jr.example.com](https://locksmith-jr.example.com)
- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/locksmith-jr/issues)

---

**Built with 🔐 for learning web cryptography**

**Remember:** This is an educational tool. Use production password managers for sensitive data.
