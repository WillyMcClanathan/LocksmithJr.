# Deployment Guide

## Overview

Locksmith Jr. is a static single-page application that can be deployed to any hosting service that serves static files. This guide covers deployment to popular platforms and production best practices.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for some deployment methods)
- Project built locally: `npm run build`

## Build Process

### Production Build

```bash
# Install dependencies (if not already installed)
npm install

# Build optimized production bundle
npm run build

# Output directory: dist/
# Contents:
# - index.html
# - assets/*.js (hashed)
# - assets/*.css (hashed)
# - manifest.json
# - sw.js
# - icon-192.svg
# - icon-512.svg
```

### Build Verification

```bash
# Preview production build locally
npm run preview

# Visit http://localhost:4173

# Test:
# - App loads
# - Vault creation works
# - PWA install prompt appears
# - Offline mode works
```

### Build Optimization

The build process automatically:
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Hashes filenames for cache busting
- Generates source maps (optional)
- Optimizes assets

**Bundle sizes (approximate):**
- JavaScript: ~282 KB (~81 KB gzipped)
- CSS: ~22 KB (~5 KB gzipped)
- Total first load: ~304 KB (~86 KB gzipped)

## Deployment Platforms

### Vercel

**Recommended:** Best for automatic deployments from Git

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to project (or create new)
# - Confirm settings
```

#### Option 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Deploy

**vercel.json** (optional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Netlify

**Recommended:** Excellent CI/CD and edge functions support

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy to production
netlify deploy --prod --dir=dist

# Follow prompts
```

#### Option 2: Git Integration

1. Push code to Git repository
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import project"
4. Select repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Pages

**Good for:** Open source projects hosted on GitHub

#### Setup

1. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/locksmith-jr"
}
```

3. Configure repository settings:
   - Go to Settings → Pages
   - Source: gh-pages branch

4. Deploy:
```bash
npm run deploy
```

**Note:** GitHub Pages doesn't support custom headers. Consider using Cloudflare in front.

### Cloudflare Pages

**Recommended:** Fast global CDN with excellent DDoS protection

#### Git Integration

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect Git repository
4. Configure:
   - Build command: `npm run build`
   - Build output: `dist`
   - Environment: Node.js 18
5. Deploy

**_headers** (in public/ folder):
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/sw.js
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### AWS S3 + CloudFront

**Good for:** Enterprise deployments, AWS infrastructure

#### S3 Setup

```bash
# Install AWS CLI
# Configure credentials: aws configure

# Create S3 bucket
aws s3 mb s3://locksmith-jr-app

# Enable static website hosting
aws s3 website s3://locksmith-jr-app \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://locksmith-jr-app \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "sw.js"

# Upload HTML and SW without cache
aws s3 sync dist/ s3://locksmith-jr-app \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "sw.js"

# Set bucket policy (public read)
aws s3api put-bucket-policy \
  --bucket locksmith-jr-app \
  --policy file://bucket-policy.json
```

**bucket-policy.json**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::locksmith-jr-app/*"
    }
  ]
}
```

#### CloudFront Setup

1. Create CloudFront distribution
2. Origin: S3 bucket
3. Viewer Protocol: Redirect HTTP to HTTPS
4. Compress: Yes
5. Custom error pages: 404 → /index.html (200)

### Docker

**Good for:** Self-hosting, custom infrastructure

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Service worker (no cache)
    location /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # Static assets (long cache)
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and run**:
```bash
docker build -t locksmith-jr .
docker run -p 8080:80 locksmith-jr
```

## Security Configuration

### HTTPS

**Required:** Web Crypto API requires secure context

All platforms above provide automatic HTTPS. For custom hosting:

```bash
# Let's Encrypt with Certbot
certbot --nginx -d locksmith-jr.example.com
```

### Security Headers

**Required headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

**Optional (recommended):**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Cache Configuration

```
# HTML, Service Worker (no cache)
Cache-Control: public, max-age=0, must-revalidate

# Hashed assets (immutable)
Cache-Control: public, max-age=31536000, immutable

# Manifest, icons
Cache-Control: public, max-age=86400
```

## Custom Domain

### DNS Configuration

**Vercel/Netlify:**
```
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

**Cloudflare Pages:**
```
CNAME @      locksmith-jr.pages.dev
CNAME www    locksmith-jr.pages.dev
```

**Apex domain redirect:**
```
www.locksmith-jr.com → locksmith-jr.com
```

### SSL Certificate

All platforms provide automatic SSL certificates:
- Vercel: Automatic Let's Encrypt
- Netlify: Automatic Let's Encrypt
- Cloudflare: Automatic Cloudflare SSL
- AWS: ACM certificate (manual setup)

## Environment Variables

Locksmith Jr. has no backend, so no environment variables are required for the application itself.

**Build-time variables** (optional):
```bash
# .env.production
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

Access in code:
```typescript
console.log(import.meta.env.VITE_APP_VERSION);
```

## Monitoring

### Performance

**Recommended tools:**
- Lighthouse (built into Chrome DevTools)
- WebPageTest
- GTmetrix

**Target metrics:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1
- Largest Contentful Paint: < 2.5s

### Availability

**Uptime monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Check endpoint:** `https://locksmith-jr.example.com/`

### Error Tracking

**Not recommended:** Locksmith Jr. doesn't use error tracking services to protect privacy.

**Alternative:** Local logging (console only)

## Rollback

### Vercel/Netlify

1. Visit deployments page
2. Select previous deployment
3. Click "Publish" or "Promote to production"

### Manual

```bash
# Git-based rollback
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest (major versions)
npm install <package>@latest

# Test thoroughly
npm run build
npm run preview
```

### Security Patches

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (when possible)
npm audit fix

# Review and fix manually
npm audit fix --force
```

### Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Backup

**Important:** No server-side backups needed (client-side only)

**User backups:**
- Users should export vaults regularly
- Encrypted exports stored locally or in their chosen backup solution

**Code backups:**
- Git repository (GitHub/GitLab)
- Multiple deployment platforms as redundancy

## Disaster Recovery

### Code Loss

1. Restore from Git repository
2. Rebuild: `npm install && npm run build`
3. Redeploy to platform

### Deployment Platform Down

1. Deploy to alternative platform (5-10 minutes)
2. Update DNS to point to new platform (1-48 hours propagation)
3. Communicate with users

**Preparation:** Keep deployment configurations for multiple platforms

## Performance Optimization

### Bundle Size

**Current:** ~282 KB JS, ~22 KB CSS (gzipped: ~86 KB total)

**Optimization techniques:**
- Code splitting (React.lazy for routes)
- Tree shaking (automatic with Vite)
- Minification (automatic)
- Compression (gzip/brotli at edge)

### Loading Speed

**Techniques:**
- Preload critical resources
- Lazy load non-critical components
- Service Worker caching
- CDN distribution

**Vite optimization:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'crypto': ['./src/utils/crypto.ts'],
        }
      }
    }
  }
});
```

## Checklist

### Pre-Deployment

- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Run `npm audit` and fix issues
- [ ] Test on major browsers
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Review security headers configuration
- [ ] Verify HTTPS configuration
- [ ] Update version number
- [ ] Update documentation

### Post-Deployment

- [ ] Verify site loads over HTTPS
- [ ] Test vault creation
- [ ] Test vault unlock
- [ ] Test entry management
- [ ] Test password generator
- [ ] Test export/import
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Check browser console for errors
- [ ] Run Lighthouse audit (90+ score)
- [ ] Verify security headers
- [ ] Test on mobile devices

### Ongoing

- [ ] Monitor uptime (weekly)
- [ ] Review dependencies (monthly)
- [ ] Run security audit (monthly)
- [ ] Update dependencies (quarterly)
- [ ] Review analytics/errors (if any)
- [ ] Backup code repository
- [ ] Test disaster recovery plan (annually)

---

**Support:** For deployment issues, open a GitHub issue or email support@example.com
