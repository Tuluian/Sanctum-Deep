# Epic 6: Additional Character Classes

## Epic Overview

**Epic ID**: 6
**Epic Title**: Additional Character Classes
**Status**: Draft
**Priority**: Post-MVP (Expansion Content)

## Description

This epic covers the implementation of 6 additional playable character classes beyond the MVP classes (Cleric, Dungeon Knight) and initial DLC classes (Diabolist, Oathbound, Fey-Touched). Each class features a unique core mechanic and playstyle that differentiates it from existing options.

### Classes in This Epic

| Story | Class | Core Mechanic | Playstyle |
|-------|-------|---------------|-----------|
| 6.1 | Celestial | Radiance | Divine burst caster with light-based abilities |
| 6.2 | Summoner | Minions | Minion army that absorbs damage and auto-attacks |
| 6.3 | Bargainer | Favor/Price | High-risk/reward demon pacts with ongoing costs |
| 6.4 | Tidecaller | Tide/Drown | Water mage with execute mechanic and gold generation |
| 6.5 | Shadow Stalker | Shadow Energy | Evasion-based assassin with burst damage windows |
| 6.6 | Goblin | Gobble | Chaotic consumer that devours cards/items for power |

## Business Value

- Expands replayability with 6 unique playstyles
- Additional DLC revenue opportunity ($4.99 per class)
- Appeals to players seeking varied mechanical depth
- Extends content lifetime significantly

## Dependencies

- Epic 1: Combat Prototype (complete combat engine)
- Epic 5: Dungeon Knight (class implementation patterns)
- Status effect system fully implemented
- Card reward system functional

## Acceptance Criteria (Epic Level)

1. Each class has a unique core mechanic not present in other classes
2. Each class has a complete starter deck (10 cards)
3. Each class has at least 20 additional cards for card pool
4. Each class has 2-3 class-specific relics
5. Each class can complete a full 3-act run
6. Class mechanics are balanced against existing classes
7. UI properly displays all class-specific resources and states

## Stories

- [Story 6.1: Celestial Class](stories/6.1-celestial-class.md)
- [Story 6.2: Summoner Class](stories/6.2-summoner-class.md)
- [Story 6.3: Bargainer Class](stories/6.3-bargainer-class.md)
- [Story 6.4: Tidecaller Class](stories/6.4-tidecaller-class.md)
- [Story 6.5: Shadow Stalker Class](stories/6.5-shadow-stalker-class.md)
- [Story 6.6: Goblin Class](stories/6.6-goblin-class.md)

## Technical Considerations

### New Systems Required

- **Minion System** (Summoner): Persistent entities with HP, auto-attack behavior
- **Price System** (Bargainer): Ongoing negative effects tied to cards
- **Tide/Drown System** (Tidecaller): HP threshold execution mechanic
- **Shadow Energy System** (Shadow Stalker): Alternative resource that builds and bursts
- **Gobble System** (Goblin): Card/item consumption mechanics

### Type Extensions

```typescript
// New CharacterClassIds to add
enum CharacterClassId {
  // ... existing
  CELESTIAL = 'celestial',
  SUMMONER = 'summoner',
  BARGAINER = 'bargainer',
  TIDECALLER = 'tidecaller',
  SHADOW_STALKER = 'shadow_stalker',
  GOBLIN = 'goblin',
}

// New interfaces
interface Minion {
  id: string;
  instanceId: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  attackDamage: number;
  statusEffects: StatusEffect[];
}

interface Price {
  id: string;
  type: PriceType;
  amount: number;
  duration: number | 'permanent' | 'until_paid';
  source: string; // Card that created this price
}

enum PriceType {
  HP_DRAIN = 'hp_drain',
  RESOLVE_TAX = 'resolve_tax',
  CURSE_CARDS = 'curse_cards',
  DEBT_STACK = 'debt_stack',
}
```

## Risks

- Minion system adds significant UI complexity
- Price/Favor balance is challenging (too punishing vs. too free)
- Drown execute may trivialize certain encounters
- Gobble card consumption may softlock runs if not carefully designed

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-03 | 1.0 | Initial epic creation | Sarah (PO) |

---

*Epic created by Sarah, Product Owner | BMAD Framework*
