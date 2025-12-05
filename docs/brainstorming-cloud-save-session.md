# Brainstorming Session Results: Cloud Save & User Accounts

**Session Date:** 2024-12-05
**Facilitator:** Mary (Business Analyst)
**Topic:** Database storage for player saves with cross-device sync

---

## Executive Summary

**Topic:** Implementing cloud save functionality with user authentication for Sanctum Ruins

**Session Goals:**
- Define technical approach for database storage
- Decide on authentication strategy
- Plan sync behavior and conflict resolution
- Break down into implementable story cards

**Techniques Used:** Decision Matrix Mapping, Data Flow Mapping, Story Breakdown

**Total Ideas Generated:** 16 granular story cards

### Key Themes Identified
- Offline-first architecture (localStorage primary, cloud backup)
- Guest-friendly onboarding (play first, account later)
- Simple conflict resolution (timestamp wins)
- Non-blocking sync (never slow down gameplay)

---

## Key Decisions Made

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| **Database** | Heroku Postgres (Mini/Basic tier) | Cost-effective, scalable, familiar |
| **Auth Providers** | Google OAuth + Email/Password | Google for convenience, email for universal access |
| **Guest Mode** | Required - full play without account | Remove friction, let players try before committing |
| **Conflict Resolution** | Last-write-wins (timestamp) | Simple, predictable, no confusing prompts |
| **Settings Sync** | Device-specific (no cloud sync) | Volume/preferences are personal to each device |
| **Offline Play** | 100% supported | localStorage is primary storage |
| **Sync Triggers** | App load, run end, account creation, manual button | Balance freshness vs. API usage |

---

## Idea Categorization

### Immediate Opportunities (Stories 14.1 - 14.4)
*Ready to implement - foundational infrastructure*

1. **Heroku Postgres Setup** - Create database, configure connection
2. **Database Schema** - Users, OAuth connections, save data tables
3. **API Layer** - Express server with JWT auth middleware

### Core Features (Stories 14.5 - 14.11)
*Main functionality - auth and sync*

4. **Guest Mode** - Document current behavior, add status indicator
5. **Google OAuth** - Sign in with Google button and flow
6. **Email/Password Auth** - Traditional registration/login
7. **Guest-to-Account Conversion** - Preserve progress when signing up
8. **SaveManager Refactor** - Abstract local/cloud storage
9. **Cloud Sync on Load** - Pull latest on app start
10. **Cloud Sync on Run End** - Push after victory/defeat

### Polish Features (Stories 14.12 - 14.16)
*Enhanced UX - resilience and prompts*

11. **Offline Queue & Retry** - Handle network failures gracefully
12. **Manual Cloud Save** - "Save to Cloud" button in settings
13. **Login/Register Screen** - Dedicated auth UI
14. **Account Menu** - Show sync status, logout option
15. **Guest Account Prompt** - Gentle nudge after first win

---

## Action Planning

### Priority Order

1. **Infrastructure First (14.1 - 14.4)**
   - Must have database and API before anything else
   - Foundation for all other stories

2. **Auth Next (14.5 - 14.8)**
   - Enable accounts and login
   - Guest-to-account conversion is critical

3. **Sync System (14.9 - 14.12)**
   - Make saves actually sync
   - Offline resilience important

4. **UI Polish (14.13 - 14.16)**
   - Can ship with minimal UI first
   - Polish as time allows

### Resources Needed

- Heroku account with billing enabled
- Google Cloud Console project (OAuth credentials)
- Node.js/Express backend knowledge
- JWT token implementation

### Technical Debt Addressed

- Story 5.5 (original cloud sync story) is superseded by Epic 14
- Architecture.md mentions Supabase - update to reflect Heroku decision

---

## Story Cards Created

All stories saved to `docs/stories/`:

| # | Story | Status |
|---|-------|--------|
| 14.0 | Epic Overview | ✓ Created |
| 14.1 | Heroku Postgres Setup | ✓ Created |
| 14.2 | Database Schema (Users & Auth) | ✓ Created |
| 14.3 | Save Data Schema | ✓ Created |
| 14.4 | API Layer Setup | ✓ Created |
| 14.5 | Guest Mode | ✓ Created |
| 14.6 | Google OAuth Integration | ✓ Created |
| 14.7 | Email/Password Auth | ✓ Created |
| 14.8 | Guest-to-Account Conversion | ✓ Created |
| 14.9 | SaveManager Refactor | ✓ Created |
| 14.10 | Cloud Sync on App Load | ✓ Created |
| 14.11 | Cloud Sync on Run End | ✓ Created |
| 14.12 | Offline Queue & Retry | ✓ Created |
| 14.13 | Manual Cloud Save Button | ✓ Created |
| 14.14 | Login/Register Screen | ✓ Created |
| 14.15 | Account Menu & Sync Status | ✓ Created |
| 14.16 | Create Account Prompt for Guests | ✓ Created |

---

## Questions for Future Sessions

1. **Password Reset Flow** - Not included in MVP. Add later?
2. **Account Deletion / GDPR** - Required before EU launch?
3. **Discord OAuth** - Worth adding as third option?
4. **Email Verification** - Required or skip for MVP?
5. **Multi-device Active Run** - What if same run is open on two devices?

---

## Next Steps

1. Review story cards with dev team
2. Provision Heroku Postgres addon
3. Set up Express API project structure
4. Begin implementation with Story 14.1

---

*Session facilitated using the BMAD-METHOD brainstorming framework*
