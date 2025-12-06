# Epic 3: Encounter Variety

## Status: Done

## Epic Goal

Implement the non-combat encounter types (Campfire, Merchant, Shrine) and enhanced combat encounters (Elite, Boss) that provide strategic variety and resource management opportunities during runs.

## Epic Description

### Existing System Context

- **Current functionality**: Working combat system with basic enemies
- **Technology stack**: TypeScript, Vite, vanilla DOM rendering
- **Integration points**: Must integrate with RunState, MapGenerator, and CombatEngine

### Enhancement Details

- **What's being built**: Campfire healing/upgrade, Merchant shops, Shrine risk/reward events, Elite/Boss encounters
- **Architecture approach**: Screen components for each encounter type, reward systems
- **Success criteria**: All node types functional, providing meaningful strategic choices

## Stories

### Story 3.1: Campfire Encounters
Implement rest and upgrade options at campfire nodes.

**Acceptance Criteria:**
1. Campfire screen shows two options: Rest and Upgrade
2. Rest heals 30% of max HP (rounded up)
3. Upgrade shows all upgradeable cards in deck
4. Selecting a card to upgrade applies the upgrade
5. Upgraded cards show enhanced stats/effects
6. Can only perform one action per campfire
7. After action, return to map

### Story 3.2: Merchant Encounters
Implement shop functionality with cards, relics, potions, and card removal.

**Acceptance Criteria:**
1. Merchant screen shows: Cards, Relics, Potions, Card Removal
2. 3 random cards available (50/75/150 gold by rarity)
3. 2-3 relics available (150-300 gold)
4. 2-3 potions available (50-75 gold)
5. Card removal costs 50 gold (+25 each subsequent)
6. Purchasing updates inventory and gold
7. Sold-out items visually distinct

### Story 3.3: Shrine Encounters
Implement risk/reward choice events at shrine nodes.

**Acceptance Criteria:**
1. Shrine screen shows name, description, options
2. Each shrine presents 2-3 risk/reward choices
3. At least 5 different shrine types
4. Effects can be: stat changes, deck changes, gold, curses
5. Some shrines can be skipped
6. Result shown before returning to map

### Story 3.4: Elite Combat Encounters
Implement harder fights with better rewards.

**Acceptance Criteria:**
1. Elites have 50-100% more HP than common enemies
2. Elites have more powerful moves
3. Defeating elite grants: better cards, more gold, possible relic
4. Enhanced reward screen
5. At least 2 elite enemies for Act 1

### Story 3.5: Boss Combat Encounters
Implement act-ending boss battles.

**Acceptance Criteria:**
1. Boss has unique visual presentation
2. Boss has 100-200 HP (Act 1)
3. Boss has 4+ unique moves
4. Defeating boss grants: large gold, relic choice, full heal
5. Act 1 boss: The Bonelord defined and playable

## Technical Notes

### Screen Component Pattern

```typescript
interface EncounterScreen {
  render(container: HTMLElement): void;
  onComplete(result: EncounterResult): void;
  cleanup(): void;
}

interface EncounterResult {
  type: 'COMPLETED' | 'SKIPPED' | 'FLED';
  rewards?: Reward[];
  stateChanges?: StateChange[];
}
```

### Campfire Logic

```typescript
function handleRest(runState: RunState): RunState {
  const healAmount = Math.ceil(runState.maxHP * 0.30);
  return {
    ...runState,
    currentHP: Math.min(runState.maxHP, runState.currentHP + healAmount)
  };
}

function handleUpgrade(runState: RunState, cardInstanceId: string): RunState {
  const deck = runState.deck.map(card =>
    card.instanceId === cardInstanceId
      ? { ...card, upgraded: true }
      : card
  );
  return { ...runState, deck };
}
```

### Shrine Data Structure

```typescript
interface Shrine {
  id: string;
  name: string;
  description: string;
  options: ShrineOption[];
}

interface ShrineOption {
  text: string;
  effect: ShrineEffect | null;
}

interface ShrineEffect {
  hp?: number;        // Positive or negative
  gold?: number;
  maxHP?: number;
  addCard?: string;
  removeCard?: boolean;
  addRelic?: string;
  addCurse?: boolean;
}
```

### File Structure

```
src/
  encounters/
    CampfireScreen.ts
    MerchantScreen.ts
    ShrineScreen.ts
    EliteRewardScreen.ts
    BossRewardScreen.ts
  data/
    shrines.ts        - Shrine definitions
```

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] All node types have functional screens
- [ ] Rewards integrate with RunState
- [ ] Smooth transitions between encounters and map
- [ ] Mobile responsive

## Dependencies

- Epic 2 (Map & Progression) - For node routing
- Epic 1 (Combat Prototype) - For combat encounters
- Epic 6 (Enemy Expansion) - For elite/boss enemies

---

*Epic created by John (PM) | BMAD Framework*
