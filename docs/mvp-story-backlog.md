# Sanctum Ruins - MVP Story Backlog

## Executive Summary

This document contains all story cards required to complete the Sanctum Ruins MVP. Updated based on comprehensive analysis of the codebase, archived stories, and test coverage.

### Current State Summary (Updated 2025-12-04)

| Category | Status | Completeness |
|----------|--------|--------------|
| Combat Engine | ✅ COMPLETE | 100% |
| Type System | ✅ COMPLETE | 100% |
| Card System | ✅ COMPLETE | 100% (8 classes, 200+ cards) |
| Enemy System | ✅ COMPLETE | 100% (All 3 acts) |
| Character Classes | ✅ COMPLETE | 100% (8 classes - 6 beyond MVP!) |
| Map/Progression | ✅ COMPLETE | 90% |
| Encounter Variety | 🔄 PARTIAL | 60% |
| UI/Rendering | 🔄 FUNCTIONAL | 70% |
| Save/Load | 🔄 IN PROGRESS | 30% |
| Relics/Potions | 🔴 NOT STARTED | 0% |
| Testing | ✅ EXCELLENT | 808 tests passing |
| **Overall MVP** | **IN PROGRESS** | **~75%** |

---

## Epic Overview (Updated)

| Epic | Title | Stories | Priority | Status |
|------|-------|---------|----------|--------|
| 1 | Combat Prototype | 5 | P0 | ✅ COMPLETE |
| 2 | Map & Progression System | 6 | P0 | ✅ COMPLETE |
| 3 | DLC Classes (Beyond MVP) | 6 | P2 | ✅ COMPLETE |
| 4 | Acts 2 & 3 Content | 7 | P0 | ✅ COMPLETE |
| 5 | Meta & UI Systems | 4 | P1 | 🔄 PARTIAL |
| 6 | Additional Classes (Beyond MVP) | 2 | P3 | ✅ COMPLETE |
| 7 | UI Polish | 11 | P2 | 🔄 IN PROGRESS |
| 8 | Bug Fixes | 4 | P0 | 🔴 NOT STARTED |
| 9 | Balance & Progression | 6 | P1 | 🔴 NOT STARTED |
| 10 | Branding | 1 | P2 | 🔴 NOT STARTED |
| 11 | Expansion Concepts | 2 | P3 | CONCEPT ONLY |
| 12 | Visual Assets | 1 | P2 | 🔴 NOT STARTED |
| **13** | iOS App Deployment | 6 | P2 | 🔴 NOT STARTED |
| **NEW** | Remaining MVP Gaps | 8 | P0 | 🔴 NOT STARTED |

---

# COMPLETED EPICS

## Epic 1: Combat Prototype ✅ COMPLETE

All 5 stories completed and archived:
- ✅ 1.1: Combat State Machine
- ✅ 1.2: Card Playing System
- ✅ 1.3: Cleric Starter Deck & Devotion Mechanic
- ✅ 1.4: Enemy AI System
- ✅ 1.5: Combat UI

---

## Epic 2: Map & Progression ✅ COMPLETE

All stories completed and archived:
- ✅ 2.1: Map Generation (SeededRandom, MapGenerator)
- ✅ 2.2: Map Renderer & Navigation
- ✅ 2.1: Dungeon Knight Class & Fortify Mechanic
- ✅ 2.2: Act 1 Common Enemies (6 enemies)
- ✅ 2.3: Act 1 Elite Enemies (Tomb Guardian, High Cultist)
- ✅ 2.4: Act 1 Boss - The Bonelord
- ✅ 2.5: Cleric Card Pool (15+ reward cards)
- ✅ 2.6: Knight Card Pool (15+ reward cards)

---

## Epic 3: DLC Classes ✅ COMPLETE (Beyond MVP!)

All 6 stories completed and archived:
- ✅ 3.1: Diabolist Class & Contracts Mechanic
- ✅ 3.2: Oathsworn Class & Vows Mechanic
- ✅ 3.3: Fey-Touched Class & Whimsy Mechanic
- ✅ 3.4: Diabolist Card Pool
- ✅ 3.5: Oathsworn Card Pool
- ✅ 3.6: Fey-Touched Card Pool

---

## Epic 4: Acts 2 & 3 Content ✅ COMPLETE

All 7 stories completed and archived:
- ✅ 4.1: Act 2 Common Enemies (8 enemies)
- ✅ 4.2: Act 2 Elite Enemies (Voidcaller, Stone Sentinel, Void Tendril)
- ✅ 4.3: Act 2 Boss - The Drowned King
- ✅ 4.4: Act 3 Common Enemies (6 enemies) - QA PASSED
- ✅ 4.5: Act 3 Elite Enemies (Greater Demon, Sanctum Warden) - QA PASSED
- ✅ 4.6: Act 3 Boss - The Hollow God - QA PASSED
- ✅ 4.7: Act 3 Combat Mechanics

---

## Epic 5: Meta & UI Systems 🔄 PARTIAL

- ✅ 5.2: Meta Progression
- ✅ Victory/Defeat Screens
- 🔴 5.1: Achievement System (story exists, not implemented)
- 🔴 5.3: Main Menu & Navigation
- 🔴 5.4: Save/Load System
- 🔴 5.5: User Accounts (Post-MVP)

---

## Epic 6: Additional Classes ✅ COMPLETE (Beyond MVP!)

- ✅ 6.1: Celestial Class
- ✅ 6.2: Summoner Class
- 📝 6.3: Bargainer Class (story exists)
- 📝 6.4-6.6: Additional class concepts

---

# REMAINING MVP WORK

## Epic: Remaining MVP Gaps 🔴 HIGH PRIORITY

These stories need to be created and completed for MVP:

### Story: Shrine Encounters
**Status:** NOT STARTED
**Priority:** P0

**As a** player at a shrine node,
**I want** risk/reward choices with meaningful effects,
**So that** map exploration has strategic depth.

**Acceptance Criteria:**
1. 5+ shrine types with 2-3 options each
2. Effects: HP, gold, cards, curses, blessings
3. Some shrines can be skipped
4. Shrine events use narrative from `shrine-events.md`

---

### Story: Merchant/Shop System
**Status:** NOT STARTED
**Priority:** P0

**As a** player at a merchant node,
**I want** to spend gold on cards, relics, potions, and card removal,
**So that** I can customize my build during a run.

**Acceptance Criteria:**
1. Gold currency tracked during run
2. Gold earned from combat victories
3. Cards for sale (3 random, scaled by rarity)
4. Relics for sale (2-3 random)
5. Potions for sale (2-3)
6. Card removal service (scaling cost)

---

### Story: Relics System Core
**Status:** NOT STARTED
**Priority:** P0

**As a** player,
**I want** passive relic bonuses throughout my run,
**So that** I can build powerful synergies.

**Acceptance Criteria:**
1. Relic data model with triggers and effects
2. 25 relics (10 common, 8 uncommon, 4 rare, 3 boss)
3. Starter relic per class
4. Relics obtainable from: elites, bosses, merchants, shrines
5. Relic UI bar with tooltips

---

### Story: Potions System
**Status:** NOT STARTED
**Priority:** P0

**As a** player,
**I want** consumable potions for emergency situations,
**So that** I have tactical options in tough fights.

**Acceptance Criteria:**
1. Hold up to 3 potions
2. 8 potion types defined
3. Potions usable during player turn
4. Potions from: rewards, merchants, shrines
5. Potion belt UI

---

### Story: Campfire Encounters
**Status:** NOT STARTED
**Priority:** P1

**As a** player at a campfire,
**I want** to choose between rest (heal) or upgrade a card,
**So that** I can recover or improve my deck.

**Acceptance Criteria:**
1. Rest heals 30% max HP
2. Upgrade shows all upgradeable cards
3. One action per campfire
4. Card upgrade paths defined

---

### Story: Card Reward Selection
**Status:** UNKNOWN (may be partially implemented)
**Priority:** P0

**As a** player after combat victory,
**I want** to choose from 3 cards (or skip),
**So that** I can strategically build my deck.

**Acceptance Criteria:**
1. Show 3 random cards from class pool
2. Weighted by rarity (60/30/10)
3. Skip option available
4. Selected card added to deck

---

### Story: Character Selection Screen
**Status:** NOT STARTED
**Priority:** P0

**As a** player starting a run,
**I want** to choose from available classes,
**So that** I can pick my preferred playstyle.

**Acceptance Criteria:**
1. Show all 8 classes (2 free, 6 premium/locked initially)
2. Class preview: HP, Resolve, mechanic, starter deck
3. Selection starts run with chosen class
4. Premium classes marked but playable for testing

---

### Story: Main Menu & Title Screen
**Status:** NOT STARTED
**Priority:** P1

**As a** player opening the game,
**I want** a polished main menu,
**So that** I can navigate the game easily.

**Acceptance Criteria:**
1. Title/logo display
2. New Run button
3. Continue button (if save exists)
4. Settings button
5. Responsive on all screens

---

# NEW STORIES (Created 2025-12-04)

## Epic 7: UI Polish 🔄 IN PROGRESS

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| 7.1 | Combat Juice & Feedback | 📝 Story exists | P2 |
| 7.2 | Card Interaction Polish | 📝 Story exists | P2 |
| 7.3 | Enemy Personality & Presence | 📝 Story exists | P2 |
| 7.4 | Map & Progression UX | 📝 Story exists | P2 |
| 7.5 | Onboarding & Tutorials | 📝 Story exists | P2 |
| 7.6 | Accessibility & Options | 📝 Story exists | P2 |
| **7.7** | Map Node Connection Rendering | 🔴 NEW | P1 |
| **7.8** | Card Text Centering | 🔴 NEW | P2 |
| **7.9** | Enemy HP Bar Positioning | 🔴 NEW | P1 |
| **7.10** | Boss Phase Narrative Display | 🔴 NEW | P1 |
| **7.11** | Class-Specific Card Colors | 🔴 NEW | P2 |

---

## Epic 8: Bug Fixes 🔴 HIGH PRIORITY

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **8.1** | Summon Mechanics Fix | 🔴 NEW | P0 |
| **8.2** | Greater Demon Self-Heal Fix | 🔴 NEW | P0 |
| **8.3** | Auto-Target Living Units | 🔴 NEW | P1 |
| **8.4** | Combat Debug Log System | 🔴 NEW | P1 |

---

## Epic 9: Balance & Progression 🔴 NOT STARTED

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **9.1** | Debuff Duration Rebalance | 🔴 NEW | P1 |
| **9.2** | Between-Run Card Draw | 🔴 NEW | P1 |
| **9.3** | Potion-Generating Cards | 🔴 NEW | P2 |
| **9.4** | Extended Progression (200 hrs) | 🔴 NEW | P1 |
| **9.5** | Three-Tier Upgrade System | 🔴 NEW | P1 |
| **9.6** | Tier 4 Class Completion Upgrades | 🔴 NEW | P2 |

---

## Epic 10: Branding

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **10.1** | Rename "Exhaust" to "Fracture" | 🔴 NEW | P2 |

---

## Epic 11: Expansion Concepts (Post-MVP)

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **11.1** | Class-Specific Bosses | 📝 CONCEPT | P3 |
| **11.2** | The Warden Class | 📝 CONCEPT | P3 |

---

## Epic 12: Visual Assets

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **12.1** | Visual Asset Acquisition | 🔴 NEW | P2 |

---

## Epic 13: iOS App Deployment 🔴 NOT STARTED

| Story | Title | Status | Priority |
|-------|-------|--------|----------|
| **13.1** | Capacitor Setup & Configuration | 🔴 NEW | P2 |
| **13.2** | iOS UI Adaptations | 🔴 NEW | P2 |
| **13.3** | Apple In-App Purchase Integration | 🔴 NEW | P2 |
| **13.4** | App Store Submission Preparation | 🔴 NEW | P2 |
| **13.5** | Native iOS Features Integration | 🔴 NEW | P3 |
| **13.6** | iOS Performance & Quality Optimization | 🔴 NEW | P2 |

**Epic Summary**: Deploy Sanctum Ruins to the iOS App Store using Capacitor wrapper with native IAP for DLC classes.

**Dependencies**:
- MVP must be complete (web version stable)
- Relics/Potions systems needed before IAP
- Character Selection Screen needed for class purchases

---

# Content Inventory (Current)

## Classes Implemented: 8/8 ✅

| Class | HP | Mechanic | Cards | Status |
|-------|-----|----------|-------|--------|
| Cleric | 75 | Devotion | 15+ | ✅ Complete |
| Dungeon Knight | 80 | Fortify | 15+ | ✅ Complete |
| Diabolist | 70 | Contracts/Curses | 30+ | ✅ Complete |
| Oathsworn | 75 | Vows | 20+ | ✅ Complete |
| Fey-Touched | 65 | Whimsy/Luck | 20+ | ✅ Complete |
| Celestial | 70 | Radiance | 20+ | ✅ Complete |
| Summoner | 65 | Minions | 20+ | ✅ Complete |
| Bargainer | 80 | Favor/Price | 20+ | ✅ Complete |

## Enemies Implemented: 31/31 ✅

| Act | Common | Elites | Boss | Status |
|-----|--------|--------|------|--------|
| Act 1 | 6 | 2 | Bonelord | ✅ Complete |
| Act 2 | 8 | 3 | Drowned King | ✅ Complete |
| Act 3 | 6 | 2 (+memories) | Hollow God | ✅ Complete |

## Test Coverage: EXCELLENT ✅

- **808 tests passing**
- 26 test files
- Coverage across: enemies, cards, classes, map generation, services

---

# Priority Matrix for MVP Completion

## P0 - Must Have (Blocking MVP)

1. 🔴 Merchant/Shop System (with gold currency)
2. 🔴 Relics System Core
3. 🔴 Potions System
4. 🔴 Card Reward Selection (verify/complete)
5. 🔴 Character Selection Screen
6. 🔴 8.1: Summon Mechanics Fix
7. 🔴 8.2: Greater Demon Heal Fix

## P1 - Should Have (Important for Polish)

1. 🔴 Shrine Encounters
2. 🔴 Campfire Encounters
3. 🔴 Main Menu & Title Screen
4. 🔴 Save/Load System (LocalStorage)
5. 🔴 7.7: Map Connection Rendering
6. 🔴 7.9: Enemy HP Bar Fix
7. 🔴 7.10: Boss Phase Narrative
8. 🔴 8.3: Auto-Target Living Units
9. 🔴 8.4: Combat Debug Log

## P2 - Nice to Have (Polish)

1. 7.8: Card Text Centering
2. 7.11: Class Card Colors
3. 9.1-9.6: Balance & Progression
4. 10.1: Exhaust → Fracture rename
5. 12.1: Visual Assets

## P3 - Future (Post-MVP)

1. 11.1: Class-Specific Bosses
2. 11.2: Warden Class
3. Cloud saves
4. Achievements
5. Daily challenges
6. **Epic 13: iOS App Deployment** (all 6 stories)

---

# Story Count Summary

| Category | Stories | Complete | Remaining |
|----------|---------|----------|-----------|
| Archived (Complete) | 30 | 30 | 0 |
| New Stories (Today) | 19 | 0 | 19 |
| Remaining MVP Gaps | 8 | 0 | 8 |
| iOS Deployment (Epic 13) | 6 | 0 | 6 |
| **Total** | **63** | **30** | **33** |

---

# Appendix: Archived Stories Reference

Located in `docs/stories/archived/`:

1.x Series (Combat): 5 stories ✅
2.x Series (Map/Content): 8 stories ✅
3.x Series (DLC Classes): 6 stories ✅
4.x Series (Acts 2&3): 7 stories ✅
5.x Series (Meta): 2 stories ✅
6.x Series (Additional): 2 stories ✅

---

*Updated by Sarah (PO) | BMAD Framework*
*Date: 2025-12-04*
*Previous version: 2025-12-03 by John (PM)*
