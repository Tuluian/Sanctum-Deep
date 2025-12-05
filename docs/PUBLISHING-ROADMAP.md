# Sanctum Ruins Publishing Roadmap

## Overview

This document provides a prioritized roadmap for publishing Sanctum Ruins across three platforms:
1. **Web** (already hosted, needs polish)
2. **iOS** (via Capacitor wrapper)
3. **Steam** (via Electron wrapper)

---

## Offline-Friendly Tasks Summary

Tasks you can do without internet access, organized by priority.

### HIGH PRIORITY: Web Polish (Do First)

| Story | Task | Time Est. | Files to Create/Modify |
|-------|------|-----------|------------------------|
| 15.1 | Create `manifest.json` for PWA | 30-45 min | `public/manifest.json` |
| 15.1 | Design/generate app icons (8 sizes) | 1-2 hr | `public/icons/` |
| 15.1 | Write service worker for offline | 45-60 min | `public/sw.js` |
| 15.1 | Update index.html with PWA tags | 15 min | `index.html` |
| 15.5 | Write Privacy Policy | 1-2 hr | `public/privacy.html` |
| 15.5 | Write Terms of Service | 1-2 hr | `public/terms.html` |
| 15.6 | Add SEO meta tags to index.html | 30 min | `index.html` |
| 15.6 | Create Open Graph social image | 1-2 hr | `public/images/og-image.png` |
| 15.6 | Create robots.txt and sitemap.xml | 25 min | `public/robots.txt`, `public/sitemap.xml` |

**Total: ~8-12 hours of offline work**

---

### MEDIUM PRIORITY: iOS Preparation

| Story | Task | Time Est. | Notes |
|-------|------|-----------|-------|
| 13.4 | Design 1024x1024 App Store icon | 1 hr | Master icon for all sizes |
| 13.4 | Create launch screen design | 30 min | Sketch/mockup |
| 13.4 | Write App Store description | 1 hr | 4000 char max |
| 13.4 | Define keywords (100 chars) | 15 min | SEO for App Store |
| 13.4 | Plan screenshot compositions | 30 min | Which screens to capture |
| 13.2 | Document iOS UI adaptations needed | 1 hr | Notch, safe areas, touch |

**Total: ~4-5 hours of offline work**

---

### LOWER PRIORITY: Steam Preparation

| Story | Task | Time Est. | Notes |
|-------|------|-----------|-------|
| 16.1 | Set up Electron main.js | 1 hr | Can test locally |
| 16.1 | Configure electron-builder | 30 min | package.json updates |
| 16.5 | Create capsule images (5 sizes) | 2-3 hr | Design work |
| 16.5 | Capture 5-10 screenshots | 1 hr | From local game |
| 16.5 | Write Steam store description | 1-2 hr | Marketing copy |
| 16.5 | Design library hero/logo | 1-2 hr | Large promotional art |

**Total: ~7-10 hours of offline work**

---

## Recommended Order of Work

### Phase 1: Web Production Ready
1. PWA Configuration (15.1)
2. Privacy Policy & Terms (15.5)
3. SEO & Meta Tags (15.6)
4. Performance Optimization (15.4)
5. CI/CD Pipeline (15.2) - requires internet for GitHub

### Phase 2: iOS App
1. Capacitor Setup (13.1) - requires npm install
2. iOS UI Adaptations (13.2)
3. App Store Assets (13.4)
4. Apple IAP Integration (13.3) - requires Apple Dev account
5. Native Features (13.5)
6. Submission (13.4)

### Phase 3: Steam Release
1. Desktop Wrapper - Electron (16.1)
2. Steamworks Integration (16.2) - requires Steam Dev account
3. Steam Achievements (16.3)
4. Store Assets (16.5)
5. Submission (16.6)

---

## Quick Reference: Story Locations

### Epic 13: iOS Publishing (Existing)
- `docs/stories/13.1-capacitor-setup.md`
- `docs/stories/13.2-ios-ui-adaptations.md`
- `docs/stories/13.3-apple-iap-integration.md`
- `docs/stories/13.4-app-store-submission.md`
- `docs/stories/13.5-native-features-integration.md`
- `docs/stories/13.6-ios-performance-optimization.md`

### Epic 14: Cloud Save (Existing)
- `docs/stories/14.0-cloud-save-epic-overview.md`
- Stories 14.1-14.16 (backend infrastructure)

### Epic 15: Web Publishing (New)
- `docs/stories/15.0-web-publishing-epic-overview.md`
- `docs/stories/15.1-pwa-configuration.md`
- `docs/stories/15.5-privacy-policy-terms.md`
- `docs/stories/15.6-seo-meta-tags.md`

### Epic 16: Steam Publishing (New)
- `docs/stories/16.0-steam-publishing-epic-overview.md`
- `docs/stories/16.1-desktop-wrapper-electron.md`
- `docs/stories/16.5-steam-store-assets.md`

---

## Accounts & Costs Needed

| Platform | Account | Cost | When Needed |
|----------|---------|------|-------------|
| Web | Heroku | Free-$7/mo | Now (already have) |
| iOS | Apple Developer | $99/year | Before submission |
| Steam | Steamworks | $100 one-time | Before submission |
| Google OAuth | Google Cloud | Free | For cloud save |

---

## Quick Wins (Do Today)

If you have limited time, these provide the most value:

1. **Write Privacy Policy** (required for iOS) - 1-2 hours
2. **Create manifest.json** (PWA installability) - 30 min
3. **Add SEO meta tags** (better discoverability) - 30 min
4. **Design app icon** (used everywhere) - 1-2 hours

---

## Dependencies Between Epics

```
Epic 15 (Web Polish)
    ↓
Epic 13 (iOS) ←→ Epic 14 (Cloud Save)
    ↓              ↓
Epic 16 (Steam) ←──┘
```

- Cloud Save (Epic 14) enhances iOS and Steam but isn't required
- iOS and Steam can be developed in parallel
- Web polish should be done first as it benefits all platforms

---

## Next Steps

1. Pick a story from Phase 1 (Web Production Ready)
2. Open the story file for detailed tasks
3. Work through tasks offline
4. Test locally when possible
5. Deploy and verify when online

Good luck with your offline work!
