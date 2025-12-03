# Project Brief: Sanctum Ruins

## Executive Summary

**Sanctum Ruins** is a browser-based roguelike deck-builder designed for 15-30 minute play sessions. Players delve into a sentient, ever-shifting dungeon that tests worthy souls, granting power to survivors. The game targets desktop web browsers initially, with mobile-responsive design planned for later phases.

**Primary Problem:** The roguelike deck-builder genre (popularized by Slay the Spire) has a dedicated audience seeking fresh experiences, but most entries require significant time investment, are pay-to-win, or lack distinct class identities.

**Target Market:** Slay the Spire fans and casual roguelike enthusiasts looking for accessible, session-based gameplay with fair monetization.

**Key Value Proposition:** A free, browser-based deck-builder with meaningful class diversity, no gacha mechanics, and premium content priced transparently at $4.99 per class.

---

## Problem Statement

### Current State & Pain Points

The roguelike deck-builder market is dominated by premium titles requiring upfront purchase or mobile games with aggressive monetization:

- **Time Investment**: Most deck-builders require 45-90+ minute runs, alienating casual players
- **Pay-to-Win Mobile Games**: Card games on mobile often use gacha mechanics that frustrate players
- **Lack of Browser Options**: Few high-quality deck-builders are accessible directly in-browser without downloads
- **Class Homogeneity**: Many competitors offer classes that feel mechanically similar, reducing replayability

### Impact of the Problem

- Players abandon runs due to time constraints
- Mobile gamers distrust card game monetization
- Casual players are excluded from the genre due to accessibility barriers
- Experienced players exhaust content quickly without meaningful class variety

### Why Existing Solutions Fall Short

| Competitor | Limitation |
|------------|-----------|
| Slay the Spire | Requires purchase, longer sessions, desktop/mobile app required |
| Monster Train | Steeper learning curve, less accessible |
| Inscryption | Narrative-heavy, not session-focused |
| Mobile CCGs | Gacha/P2W mechanics erode trust |

### Urgency

The browser gaming market is growing, and players are actively seeking quality experiences that respect their time and money. Early entry with a polished, fair-monetization model creates a sustainable competitive advantage.

---

## Proposed Solution

### Core Concept

A streamlined roguelike deck-builder playable directly in the browser with:

- **15-30 minute runs** through a 3-act dungeon (45 encounters total)
- **5 distinct character classes**, each with unique mechanics
- **Freemium model**: 2 free classes, 3 premium DLC classes at $4.99 each
- **No gacha, no pay-to-win**: All gameplay content unlockable through play or one-time purchase

### Key Differentiators

1. **Browser-Native**: No download required, instant play
2. **Session-Friendly**: Designed for 15-30 minute runs, complete or save-and-quit
3. **Transparent Monetization**: "Pay once, own forever" for each class
4. **Deep Class Identity**: Each class has a completely unique resource mechanic (Devotion, Fortify, Contracts, Vows, Whimsy)

### Why This Solution Will Succeed

- Low barrier to entry (free, browser-based)
- Respects player time with shorter sessions
- Builds trust through fair monetization
- Targets an underserved niche (browser deck-builders)

---

## Target Users

### Primary User Segment: Core Deck-Builder Fans

| Attribute | Description |
|-----------|-------------|
| **Demographics** | 18-35 years old, gaming enthusiasts, primarily NA/EU |
| **Current Behaviors** | Play Slay the Spire, Monster Train, Balatro; watch Twitch/YouTube gaming |
| **Specific Needs** | Fresh mechanics, meaningful class variety, challenging runs |
| **Pain Points** | Limited new quality content in the genre, time required for full runs |
| **Goals** | Master new mechanics, complete challenging runs, unlock content |

### Secondary User Segment: Casual Browser Gamers

| Attribute | Description |
|-----------|-------------|
| **Demographics** | 25-45 years old, plays games during breaks/commutes |
| **Current Behaviors** | Plays browser games, casual mobile titles, work-break gaming |
| **Specific Needs** | Quick sessions, no commitment, free access |
| **Pain Points** | Most quality games require downloads or purchases |
| **Goals** | Enjoyable distraction, sense of progress, no financial commitment |

---

## Goals & Success Metrics

### Business Objectives

- **Player Acquisition**: Reach 10,000 monthly active users within 3 months of launch
- **Conversion Rate**: Achieve 5-10% conversion from free to DLC purchase
- **Revenue**: Generate $10,000/month from DLC sales within 6 months
- **Retention**: 30-day retention rate of 25%+

### User Success Metrics

- Average session length of 20-30 minutes
- 60%+ of players complete Act 1 on first play session
- 25%+ of players try both free classes
- DLC purchasers complete 10+ runs with purchased class

### Key Performance Indicators (KPIs)

| KPI | Definition & Target |
|-----|---------------------|
| DAU/MAU | Daily/Monthly Active Users - Target 20% ratio |
| ARPU | Average Revenue Per User - Target $0.50/user |
| Session Length | Average play time per session - Target 22 minutes |
| Win Rate | % of runs resulting in victory - Target 15-25% for experienced players |
| Class Usage | Distribution across classes - Target balanced play |

---

## MVP Scope

### Core Features (Must Have)

- **Character Selection**: Choose between Cleric and Dungeon Knight (free classes)
- **Combat System**: Turn-based card combat with Resolve resource, block, damage, healing
- **Class Mechanics**: Devotion (Cleric), Fortify (Dungeon Knight) fully implemented
- **Progression Map**: 3 acts with 15 nodes each, branching paths
- **Node Types**: Combat, Elite Combat, Campfire, Merchant, Shrine, Boss
- **Card Rewards**: Post-combat card selection (pick 1 of 3 or skip)
- **Deck Management**: Add, upgrade, remove cards at appropriate nodes
- **Relics**: 25 passive items (universal + class-specific)
- **Potions**: 8 consumable items
- **Enemies**: 22 enemy types + 3 bosses across 3 acts
- **Save System**: LocalStorage saves, resume interrupted runs
- **Basic UI**: Functional menus, combat view, map view, deck viewer

### Out of Scope for MVP

- Premium DLC classes (Diabolist, Oathbound, Fey-Touched)
- User accounts / cloud saves
- Leaderboards
- Daily challenges
- Achievements system
- Custom run modifiers
- Multiplayer / co-op
- Card crafting
- Mobile native app
- Ascension difficulty system
- Sound effects / music (polish phase)
- Advanced animations

### MVP Success Criteria

- Complete 3-act run with both free classes is possible
- Combat feels responsive and strategic
- 15-30 minute average run time
- No game-breaking bugs
- LocalStorage save/load works reliably

---

## Post-MVP Vision

### Phase 2 Features (Immediate Post-Launch)

- **Premium DLC Classes**: Diabolist, Oathbound, Fey-Touched with unique mechanics
- **Polish & Juice**: Card animations, damage numbers, screen shake, particles
- **Sound & Music**: 60+ sound effects, 3-4 music tracks
- **Payment Integration**: Stripe for DLC purchases

### Long-term Vision (6-12 Months)

- **User Accounts**: Email/Google/Discord authentication
- **Cloud Saves**: Cross-device progression sync
- **Leaderboards**: Fastest times, highest scores, streaks
- **Daily Challenges**: Curated runs with leaderboard competition
- **Unlock Progression**: Cards/relics unlock over time to extend engagement

### Expansion Opportunities

- Additional character classes ($4.99 each)
- Cosmetic card backs and character skins
- Seasonal events with exclusive rewards
- Challenge mode subscription ($2.99/mo)
- Community-designed content integration
- iOS App Store release via Capacitor (Phase 4-6)
- Android App Store release via Capacitor (Future)

---

## Technical Considerations

### Platform Requirements

- **Target Platforms (MVP)**: Desktop web browsers (Chrome, Firefox, Safari, Edge)
- **Target Platforms (Post-MVP)**: iOS App Store via Capacitor wrapper
- **Browser Support**: Modern browsers with ES6+ support
- **Performance Requirements**: 60fps gameplay, <3s initial load, responsive at 1920x1080 down to 1280x720

### Technology Preferences

- **Frontend**: TypeScript, HTML5 Canvas or DOM-based rendering
- **Backend**: Node.js (for future cloud features), serverless functions
- **Database**: LocalStorage (MVP), PostgreSQL/Firebase (cloud saves)
- **Hosting/Infrastructure**: Vercel, Netlify, or similar static hosting; CDN for assets

### Architecture Considerations

- **Repository Structure**: Monorepo with clear separation (game engine, UI, assets)
- **Service Architecture**: Client-side first, API for auth/saves/payments later
- **Integration Requirements**: Stripe (web payments), Apple In-App Purchase (iOS), OAuth providers (auth)
- **Security/Compliance**: No PII stored client-side, secure payment flow
- **Mobile Strategy**: Capacitor wrapper for iOS with native API access (haptics, IAP, push)

---

## Constraints & Assumptions

### Constraints

- **Budget**: Self-funded/indie project, minimize ongoing costs
- **Resources**: Solo developer or small team
- **Technical**: Browser limitations (no native features, storage limits)
- **Timeline**: MVP launch within 10-12 development phases

### Key Assumptions

- Players will accept freemium model with DLC classes
- Browser-based gaming is acceptable for target audience
- 15-30 minute sessions are appropriate for the format
- $4.99 per class is fair value proposition
- Slay the Spire fans are actively seeking new content
- LocalStorage is sufficient for MVP persistence

---

## Risks & Open Questions

### Key Risks

| Risk | Description & Impact |
|------|---------------------|
| **Market Saturation** | Deck-builder genre may be crowded; differentiation is critical |
| **Monetization Rejection** | Players may not convert from free to paid at expected rates |
| **Technical Complexity** | Card effect engine and enemy AI may be more complex than estimated |
| **Content Drought** | Players may exhaust content faster than new content can be produced |
| **Browser Limitations** | Performance or storage issues on certain browsers/devices |

### Open Questions

- What seeded RNG system works best for shareable runs?
- Should DLC classes be previewed/demo-able before purchase?
- How to handle balance patches that affect existing save files?
- What analytics are essential vs. nice-to-have?
- Should there be a tutorial or learn-by-playing approach?

### Areas Needing Further Research

- Competitive pricing analysis for browser games
- Player expectations for roguelike run length
- Browser storage limits and save file size optimization
- Stripe integration for web-based game purchases
- Community building strategies for indie games

---

## Appendices

### A. Research Summary

**Input Documents Reviewed:**
- IDEAS.txt (comprehensive initial PRD)
- BUGFIX-NOTES.md (combat prototype with fixes applied)

**Key Findings:**
- Combat prototype exists and has been debugged (block mechanics, card layout)
- Detailed class designs with unique mechanics already specified
- Technical schema (TypeScript GameState) already drafted
- 6-phase development roadmap defined

### B. Content Inventory

| Category | MVP Count | Notes |
|----------|-----------|-------|
| Classes | 2 | Cleric, Dungeon Knight (free) |
| Cards | 60+ | ~30 per class |
| Relics | 25 | Universal + class-specific |
| Potions | 8 | Consumable items |
| Enemies | 22 | Across 3 acts |
| Bosses | 3 | One per act |
| Shrines | 5 | Risk/reward events |

### C. References

- Slay the Spire (primary inspiration, mechanical reference)
- Monster Train (multi-lane combat reference)
- Balatro (session length, browser viability)
- Hades (roguelike progression model)

---

## Next Steps

### Immediate Actions

1. Review and refine this Project Brief
2. Conduct market research on browser deck-builders and pricing
3. Validate technical architecture approach
4. Create detailed PRD with user stories and acceptance criteria
5. Define Epic structure for development phases

### PM Handoff

This Project Brief provides the full context for **Sanctum Ruins**. The next step is to create a detailed PRD that breaks down the MVP into implementable user stories, defines acceptance criteria, and establishes the technical architecture document.

---

*Generated by Mary, Business Analyst | BMAD Framework*
