# Epic 5: Dungeon Knight Class

## Status: Not Started

## Epic Goal

Implement the second free character class (Dungeon Knight) with the Fortify mechanic, providing an alternative playstyle focused on defensive block-stacking.

## Epic Description

### Existing System Context

- **Current functionality**: Working Cleric class with Devotion mechanic
- **Technology stack**: TypeScript with class/card definitions in src/data/
- **Integration points**: Extends CharacterClass system, adds cards to pool

### Enhancement Details

- **What's being built**: Dungeon Knight class with Fortify mechanic (50% block retention)
- **Architecture approach**: Mirror Cleric implementation pattern
- **Success criteria**: Playable Knight runs with distinct defensive feel

## Stories

### Story 5.1: Dungeon Knight Starter Deck & Fortify Mechanic
Implement the Knight's base kit and block retention mechanic.

**Acceptance Criteria:**
1. Dungeon Knight starts with 80 HP, 3 Resolve
2. Starter deck: 4x Strike, 4x Defend, 1x Shield Bash, 1x Fortitude
3. Fortify mechanic: 50% of block carries over to next turn
4. Fortify stacks shown in UI
5. Block retention calculated correctly with Fortify
6. Fortify resets to 0 at start of new combat

### Story 5.2: Dungeon Knight Card Pool
Define the full card pool for Knight class.

**Acceptance Criteria:**
1. 15+ cards beyond starter deck
2. Cards synergize with block and Fortify
3. Balanced across rarities
4. Mix of attacks, skills, powers

### Story 5.3: Character Selection Screen
Implement class selection at run start.

**Acceptance Criteria:**
1. Screen shows both free classes
2. Each displays: name, HP, Resolve, mechanic
3. Preview of starter deck
4. Selecting class starts run
5. Premium classes shown as locked

## Technical Notes

### Fortify Mechanic

```typescript
// In CombatEngine.ts - end of player turn
function processBlockRetention(player: PlayerCombatState): void {
  if (player.classMechanic === 'fortify' && player.fortify > 0) {
    // Retain 50% of block, scaled by Fortify stacks
    const retentionRate = 0.5;
    const retainedBlock = Math.floor(player.block * retentionRate);
    player.block = retainedBlock;
  } else {
    player.block = 0;
  }
}
```

### Knight Starter Cards

```typescript
const KNIGHT_CARDS = {
  strike: {
    id: 'dk_strike',
    name: 'Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }]
  },
  defend: {
    id: 'dk_defend',
    name: 'Defend',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: EffectType.BLOCK, amount: 5 }]
  },
  shieldBash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal damage equal to your current block.',
    effects: [{ type: EffectType.DAMAGE_EQUAL_BLOCK }]
  },
  fortitude: {
    id: 'fortitude',
    name: 'Fortitude',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 8 block. Gain 1 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 8 },
      { type: EffectType.GAIN_FORTIFY, amount: 1 }
    ]
  }
};
```

### Class Configuration

```typescript
const DUNGEON_KNIGHT: CharacterClass = {
  id: 'dungeon_knight',
  name: 'Dungeon Knight',
  maxHp: 80,
  maxResolve: 3,
  classMechanic: 'fortify',
  isPremium: false,
  starterDeckRecipe: [
    { cardId: 'dk_strike', count: 4 },
    { cardId: 'dk_defend', count: 4 },
    { cardId: 'shield_bash', count: 1 },
    { cardId: 'fortitude', count: 1 }
  ],
  starterRelic: 'iron_shield'
};
```

### Knight Card Pool (15 cards)

```
COMMON (5):
- Heavy Slash (2): Deal 12 damage.
- Iron Wall (1): Gain 7 block.
- Counter Strike (1): Gain 4 block. Deal 4 damage.
- Reinforce (1): Gain 5 block. Gain 1 Fortify.
- Stalwart (0): Gain 3 block.

UNCOMMON (5):
- Impenetrable (2): Gain 15 block.
- Riposte (1): Gain 6 block. Next enemy that attacks deals 8 less damage.
- Battering Ram (2): Deal 10 damage. If you have 15+ block, deal 20 instead.
- Iron Skin (1): Gain 1 Fortify. Gain 5 block.
- Taunt (1): All enemies target you. Gain 10 block.

RARE (3):
- Unbreakable (3): Double your current block.
- Living Fortress (2): Power - At end of turn, gain block equal to Fortify.
- Final Stand (X): Gain 5 block per X spent. Gain Fortify equal to X.

POWERS (2):
- Iron Will (1): Power - Gain 2 block at start of turn.
- Fortress Stance (2): Power - Fortify retains 75% of block instead of 50%.
```

### File Structure

```
src/
  data/
    classes.ts         - Add DUNGEON_KNIGHT
    cards/
      knight.ts        - Knight card definitions
      index.ts         - Export KNIGHT_CARDS
  engine/
    CombatEngine.ts    - Add Fortify processing
  ui/
    CharacterSelect.ts - Character selection screen
```

## Definition of Done

- [ ] All 3 stories completed with acceptance criteria met
- [ ] Knight plays distinctly from Cleric
- [ ] Fortify mechanic works correctly
- [ ] Character selection functional
- [ ] All Knight cards implemented and balanced

## Dependencies

- Epic 1 (Combat Prototype) - CombatEngine extension
- Epic 4 (Card Rewards) - For Knight card pool usage

---

*Epic created by John (PM) | BMAD Framework*
