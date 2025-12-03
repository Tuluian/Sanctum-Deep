# Sanctum Ruins - MVP Story Backlog

## Executive Summary

This document contains all story cards required to complete the Sanctum Ruins MVP. Based on comprehensive analysis of the codebase, documentation, and project requirements.

### Current State Summary

| Category | Status | Completeness |
|----------|--------|--------------|
| Combat Engine | COMPLETE | 95% |
| Type System | COMPLETE | 100% |
| Card System | PARTIAL | 40% (Cleric only) |
| Enemy System | PARTIAL | 9% (3/31 enemies) |
| Character Classes | PARTIAL | 20% (Cleric done) |
| Map/Progression | NOT STARTED | 0% |
| Encounter Variety | NOT STARTED | 0% |
| UI/Rendering | BASIC | 50% |
| Save/Load | NOT STARTED | 0% |
| Relics/Potions | NOT STARTED | 0% |
| Testing | NOT STARTED | 0% |
| **Overall MVP** | IN PROGRESS | ~35% |

---

## Epic Overview

| Epic | Title | Stories | Priority | Status |
|------|-------|---------|----------|--------|
| 1 | Combat Prototype | 5 | P0 | ~90% Complete |
| 2 | Map & Progression System | 5 | P0 | Not Started |
| 3 | Encounter Variety | 5 | P0 | Not Started |
| 4 | Card Rewards & Deck Building | 4 | P0 | Not Started |
| 5 | Dungeon Knight Class | 3 | P0 | Not Started |
| 6 | Enemy Content Expansion | 4 | P1 | Not Started |
| 7 | Relics System | 3 | P1 | Not Started |
| 8 | Potions System | 2 | P1 | Not Started |
| 9 | Save/Load System | 3 | P1 | Not Started |
| 10 | UI Polish & Game Flow | 4 | P2 | Not Started |
| 11 | Testing & Quality | 3 | P2 | Not Started |

---

# Epic 1: Combat Prototype

## Status: 90% Complete

### Epic Goal
Implement a fully functional single-combat prototype for Sanctum Ruins that demonstrates the core turn-based card combat loop with the Cleric class.

### Stories

#### Story 1.1: Combat State Machine ✅ COMPLETE
**Status:** Complete

Implement the core turn-based combat flow with proper state transitions, turn phases, and win/lose conditions.

#### Story 1.2: Card Playing System ✅ COMPLETE
**Status:** Complete

Implement the card effect engine that parses and executes card effects with proper targeting and cost validation.

#### Story 1.3: Cleric Starter Deck & Devotion Mechanic ✅ COMPLETE
**Status:** Complete

Implement the Cleric's 10-card starter deck and the Devotion class mechanic.

#### Story 1.4: Enemy AI System ✅ COMPLETE
**Status:** Complete

Implement enemy behavior with intent telegraphing and pattern-based AI.

#### Story 1.5: Combat UI 🔄 IN PROGRESS
**Status:** Functional but needs polish

**Remaining Work:**
- [ ] Polish card visual feedback
- [ ] Improve targeting UX
- [ ] Add subtle animations
- [ ] Mobile touch optimization

---

# Epic 2: Map & Progression System

## Status: Not Started

### Epic Goal
Implement the procedural map generation and node navigation system that allows players to progress through a 3-act dungeon with branching paths.

---

## Story 2.1: Map Data Model & Generation

**As a** player starting a new run,
**I want** a procedurally generated map with branching paths,
**So that** each run feels unique and I can make strategic path choices.

### Acceptance Criteria

1. Map generates 15 nodes per act (45 total across 3 acts)
2. Map uses seeded RNG for deterministic generation (shareable runs)
3. Each row has 2-4 nodes with connections to 1-3 nodes in the next row
4. First row always starts with a single entry node
5. Last row in each act is always a boss node
6. Node types are distributed according to rules:
   - Combat: 50-60% of non-boss nodes
   - Elite: 2-3 per act, never in first 3 rows
   - Campfire: 2-3 per act, never adjacent to boss
   - Merchant: 1-2 per act
   - Shrine: 1-2 per act
7. Map data structure includes: nodeId, type, row, connections, visited flag

### Tasks

- [ ] Define MapNode, MapRow, and FloorMap interfaces in types
- [ ] Implement SeededRandom utility (mulberry32 algorithm)
- [ ] Create MapGenerator class with generateFloor(act, seed) method
- [ ] Implement node type distribution algorithm
- [ ] Implement connection generation between rows
- [ ] Validate no orphan nodes (all nodes reachable)
- [ ] Write unit tests for map generation

### Technical Notes

```typescript
interface MapNode {
  id: string;           // "act1_row3_node2"
  type: NodeType;       // COMBAT, ELITE, CAMPFIRE, MERCHANT, SHRINE, BOSS
  row: number;          // 0-14 (0 = start, 14 = boss)
  connections: string[]; // IDs of nodes in next row this connects to
  visited: boolean;
}

type NodeType = 'COMBAT' | 'ELITE' | 'CAMPFIRE' | 'MERCHANT' | 'SHRINE' | 'BOSS';
```

---

## Story 2.2: Map Renderer & Navigation

**As a** player viewing the map,
**I want** to see the entire floor layout with my current position,
**So that** I can plan my route and see what encounters await.

### Acceptance Criteria

1. Map displays as a vertical scrollable layout (start at bottom)
2. Nodes are visually distinct by type (icons or colors)
3. Current position is clearly highlighted
4. Available next nodes are selectable/highlighted
5. Visited nodes are marked (checkmark or dimmed)
6. Connections between nodes are visible as lines/paths
7. Clicking an available node initiates travel to that node
8. Map is responsive and works on mobile

### Tasks

- [ ] Create MapView component
- [ ] Create MapNode component with type-specific icons
- [ ] Implement connection line rendering (SVG or canvas)
- [ ] Add current position indicator
- [ ] Implement available node highlighting
- [ ] Add click handlers for node selection
- [ ] Style for different node types
- [ ] Test responsive behavior on mobile viewports

---

## Story 2.3: Run State Management

**As a** player progressing through a run,
**I want** my progress tracked across encounters,
**So that** I can continue my run after completing each node.

### Acceptance Criteria

1. RunState tracks: current act, current node, deck, HP, gold, relics, potions
2. Starting a new run initializes RunState with selected class
3. Completing a node updates RunState (HP changes, deck changes, etc.)
4. RunState persists between encounters
5. Victory/defeat on boss advances to next act or ends run
6. Run ends when player HP reaches 0 or Act 3 boss defeated

### Tasks

- [ ] Define RunState interface
- [ ] Create RunManager class
- [ ] Implement startNewRun(classId, seed)
- [ ] Implement updateAfterNode(nodeResult)
- [ ] Implement act transition logic
- [ ] Integrate with existing CombatEngine
- [ ] Connect RunState to UI for HP/deck/gold display

### Technical Notes

```typescript
interface RunState {
  seed: string;
  character: CharacterClassId;
  currentAct: 1 | 2 | 3;
  currentNodeId: string;
  deck: CardInstance[];
  currentHP: number;
  maxHP: number;
  gold: number;
  potions: Potion[];
  relics: Relic[];
  visitedNodes: string[];
  floorMap: FloorMap;
}
```

---

## Story 2.4: Node Encounter Router

**As a** player selecting a map node,
**I want** to be taken to the appropriate encounter screen,
**So that** I experience different gameplay based on node type.

### Acceptance Criteria

1. Combat nodes trigger combat encounter initialization
2. Elite nodes trigger elite combat encounter
3. Boss nodes trigger boss combat encounter
4. Campfire nodes show campfire screen
5. Merchant nodes show merchant screen
6. Shrine nodes show shrine event screen
7. After encounter completion, return to map with node marked visited
8. Screen transitions are smooth (no jarring changes)

### Tasks

- [ ] Create EncounterRouter/GameController class
- [ ] Implement screen state management (MAP, COMBAT, CAMPFIRE, etc.)
- [ ] Create placeholder screens for non-combat encounters
- [ ] Wire up node selection to encounter routing
- [ ] Implement post-encounter return to map flow
- [ ] Add basic transition animations

---

## Story 2.5: Act Boss Gates & Transitions

**As a** player reaching the end of an act,
**I want** to face a boss encounter that gates progression,
**So that** completing each act feels like a meaningful achievement.

### Acceptance Criteria

1. Boss node is only reachable from final row of regular nodes
2. Defeating boss shows victory screen with act summary
3. After Act 1/2 boss, advance to next act with fresh map
4. After Act 3 boss, show full run victory screen
5. Boss encounters have unique intro/outro screens
6. Player can see upcoming boss from map (boss preview)

### Tasks

- [ ] Create BossVictoryScreen component
- [ ] Create ActTransitionScreen component
- [ ] Create RunVictoryScreen component
- [ ] Implement act progression logic in RunManager
- [ ] Add boss node special styling on map
- [ ] Implement boss encounter initialization

---

# Epic 3: Encounter Variety

## Status: Not Started

### Epic Goal
Implement the non-combat encounter types (Campfire, Merchant, Shrine) that provide strategic variety and resource management opportunities during runs.

---

## Story 3.1: Campfire Encounters

**As a** player at a campfire node,
**I want** to choose between resting (heal) or upgrading a card,
**So that** I can recover from battles or improve my deck.

### Acceptance Criteria

1. Campfire screen shows two options: Rest and Upgrade
2. Rest heals 30% of max HP (rounded up)
3. Upgrade shows all upgradeable cards in deck
4. Selecting a card to upgrade applies the upgrade
5. Upgraded cards show enhanced stats/effects
6. Can only perform one action per campfire
7. After action, return to map

### Tasks

- [ ] Create CampfireScreen component
- [ ] Implement Rest action with HP calculation
- [ ] Create card upgrade selection UI
- [ ] Define upgrade paths for existing cards (Smite+, Shield of Faith+, etc.)
- [ ] Implement card upgrade application
- [ ] Add upgraded card visual indicator

### Technical Notes

Upgraded cards pattern:
- Smite → Smite+: 5 damage → 7 damage
- Shield of Faith → Shield of Faith+: 5 block → 8 block
- Prayer of Mending → Prayer of Mending+: 6 heal → 9 heal
- Consecrate → Consecrate+: 3/3 → 5/5

---

## Story 3.2: Merchant Encounters

**As a** player at a merchant node,
**I want** to spend gold on cards, relics, potions, or card removal,
**So that** I can customize my deck and gain powerful items.

### Acceptance Criteria

1. Merchant screen shows: Cards for sale, Relics, Potions, Card Removal service
2. 3 random cards available (scaling cost by rarity: 50/75/150 gold)
3. 2-3 random relics available (150-300 gold)
4. 2-3 potions available (50-75 gold)
5. Card removal costs 50 gold (first), +25 each subsequent
6. Purchasing adds item and deducts gold
7. Sold-out items are visually distinct
8. Gold display updates in real-time

### Tasks

- [ ] Create MerchantScreen component
- [ ] Implement card shop generation
- [ ] Implement relic shop generation
- [ ] Implement potion shop display
- [ ] Create card removal interface
- [ ] Add purchase confirmation for expensive items
- [ ] Track card removal count for scaling cost

---

## Story 3.3: Shrine Encounters

**As a** player at a shrine node,
**I want** to be presented with a risk/reward choice,
**So that** I can gamble for powerful bonuses or suffer consequences.

### Acceptance Criteria

1. Shrine screen shows shrine name and description
2. Each shrine presents 2-3 options with different risk/reward
3. At least 5 different shrine types for variety
4. Effects can be: stat changes, deck changes, gold, curses, blessings
5. Some shrines can be skipped ("Leave" option)
6. Effect is applied immediately upon choice
7. Result is shown before returning to map

### Tasks

- [ ] Define Shrine data structure
- [ ] Create 5 initial shrine definitions
- [ ] Create ShrineScreen component
- [ ] Implement effect application
- [ ] Add result display feedback

### Shrine Examples

```typescript
const SHRINES = [
  {
    id: 'shrine_of_sacrifice',
    name: 'Shrine of Sacrifice',
    description: 'A dark altar demands tribute...',
    options: [
      { text: 'Sacrifice 10 HP', effect: { hp: -10, gold: 100 } },
      { text: 'Sacrifice a card', effect: { removeCard: true, relic: 'random_common' } },
      { text: 'Leave', effect: null }
    ]
  },
  // ... more shrines
];
```

---

## Story 3.4: Elite Combat Encounters

**As a** player facing an elite enemy,
**I want** a more challenging fight with better rewards,
**So that** risk/reward choices on the map feel meaningful.

### Acceptance Criteria

1. Elite enemies have 50-100% more HP than common enemies
2. Elite enemies have more powerful moves
3. Defeating elite grants: better card selection, more gold, possible relic
4. Elite reward screen shows enhanced rewards
5. At least 2 elite enemies defined for Act 1
6. Elite intent telegraphing works same as common enemies

### Tasks

- [ ] Define 2 Act 1 elite enemies (Tomb Guardian, High Cultist)
- [ ] Create elite reward calculation
- [ ] Implement enhanced card reward (higher rarity chance)
- [ ] Add elite-specific gold drop (50-100)
- [ ] Add relic drop chance for elites (30%)

### Elite Definitions

```typescript
const TOMB_GUARDIAN: EnemyDefinition = {
  id: 'tomb_guardian',
  name: 'Tomb Guardian',
  maxHp: 75,
  isElite: true,
  moves: [
    { id: 'slam', name: 'Crushing Slam', intent: 'ATTACK', damage: 14, weight: 35 },
    { id: 'fortify', name: 'Stone Skin', intent: 'DEFEND', block: 15, weight: 30 },
    { id: 'sweep', name: 'Sweeping Strike', intent: 'ATTACK', damage: 10, weight: 35 }
  ]
};
```

---

## Story 3.5: Boss Combat Encounters

**As a** player facing an act boss,
**I want** an epic multi-phase battle,
**So that** act completion feels like a major achievement.

### Acceptance Criteria

1. Boss has unique visual presentation (larger, centered)
2. Boss has more HP than elites (100-200 for Act 1)
3. Boss has 4+ unique moves with strategic patterns
4. Boss may have phases or thresholds (optional for MVP)
5. Defeating boss grants: large gold reward, relic choice, full heal
6. Act 1 boss: The Bonelord defined and playable

### Tasks

- [ ] Define The Bonelord boss enemy
- [ ] Create BossCombatView variant (larger enemy display)
- [ ] Implement boss reward screen
- [ ] Add boss intro screen (name/title display)
- [ ] Implement full heal after boss victory

### Boss Definition

```typescript
const THE_BONELORD: EnemyDefinition = {
  id: 'bonelord',
  name: 'The Bonelord',
  maxHp: 150,
  isBoss: true,
  moves: [
    { id: 'bone_storm', name: 'Bone Storm', intent: 'ATTACK', damage: 8, times: 3, weight: 25 },
    { id: 'raise_dead', name: 'Raise Dead', intent: 'BUFF', effect: 'summon_skeleton', weight: 20 },
    { id: 'death_grip', name: 'Death Grip', intent: 'ATTACK', damage: 20, weight: 25 },
    { id: 'bone_armor', name: 'Bone Armor', intent: 'DEFEND', block: 20, weight: 30 }
  ]
};
```

---

# Epic 4: Card Rewards & Deck Building

## Status: Not Started

### Epic Goal
Implement the card reward system that allows players to add new cards to their deck after combat encounters, enabling deck-building strategy.

---

## Story 4.1: Card Reward Selection

**As a** player who just won a combat,
**I want** to choose from 3 card options (or skip),
**So that** I can strategically build my deck during the run.

### Acceptance Criteria

1. After combat victory, show card reward screen
2. Display 3 random cards from current class pool
3. Cards are weighted by rarity (60% common, 30% uncommon, 10% rare)
4. Player can select one card to add to deck
5. Player can skip ("Skip Reward" button)
6. Selected card shows confirmation animation
7. Deck is updated and player returns to map

### Tasks

- [ ] Create CardRewardScreen component
- [ ] Implement weighted card selection from class pool
- [ ] Create card reward display layout
- [ ] Add skip option
- [ ] Integrate with post-combat flow
- [ ] Update RunState.deck with selected card

---

## Story 4.2: Cleric Card Pool Expansion

**As a** Cleric player,
**I want** a variety of cards to find during runs,
**So that** I can build different deck strategies.

### Acceptance Criteria

1. Cleric has 15+ cards beyond starter deck
2. Cards are balanced across common/uncommon/rare
3. Cards utilize Devotion mechanic strategically
4. Cards include: attacks, skills, powers
5. Each card has clear effect text

### Tasks

- [ ] Define 5 common Cleric cards
- [ ] Define 5 uncommon Cleric cards
- [ ] Define 3 rare Cleric cards
- [ ] Define 2 power cards (persist across combat)
- [ ] Add all cards to Cleric card pool
- [ ] Test card effects work correctly

### Cleric Card Pool

```typescript
// Common Cards
- Blessed Strike (1): Deal 6 damage. Heal 2.
- Divine Shield (1): Gain 7 block.
- Mending Touch (1): Heal 4. Gain 1 Devotion.
- Righteous Fury (1): Deal 4 damage twice.
- Sanctuary (1): Gain 5 block. Heal 2.

// Uncommon Cards
- Holy Nova (2): Deal 8 damage to ALL enemies. Heal 4.
- Martyr's Gift (1): Lose 5 HP. Gain 12 block and 2 Devotion.
- Radiant Beam (2): Deal 15 damage.
- Absolution (1): Heal 10. Exhaust.
- Blessed Aegis (2): Gain 12 block. Gain 1 Devotion.

// Rare Cards
- Divine Intervention (3): Heal to full HP. Exhaust.
- Zealot's Fervor (2): Deal 5 damage for each Devotion you have.
- Eternal Light (3): Power - Heal 3 at the start of each turn.

// Powers
- Prayer Circle (1): Power - Gain 1 Devotion at the start of each turn.
- Blessed Resilience (2): Power - Gain 3 block at the start of each turn.
```

---

## Story 4.3: Card Instance Management

**As a** developer,
**I want** each card in a player's deck to be a unique instance,
**So that** upgrades and modifications affect individual cards.

### Acceptance Criteria

1. Each card copy has a unique instanceId
2. Card upgrades are tracked per instance
3. Deck, hand, draw pile, discard pile all use instances
4. Cards can be referenced by instanceId for modification
5. Card removal removes specific instance

### Tasks

- [ ] Refactor Card to CardDefinition + CardInstance
- [ ] Implement instanceId generation
- [ ] Add upgraded flag to CardInstance
- [ ] Update all card references to use instances
- [ ] Ensure serialization/deserialization handles instances

### Technical Notes

```typescript
interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  effects: CardEffect[];
  rarity: Rarity;
  upgradedVersion?: CardDefinition;
}

interface CardInstance {
  definitionId: string;
  instanceId: string;  // UUID
  upgraded: boolean;
}
```

---

## Story 4.4: Deck Viewer

**As a** player during a run,
**I want** to view my complete deck at any time,
**So that** I can plan my strategy and track my deck composition.

### Acceptance Criteria

1. Deck viewer accessible from map and combat (pause)
2. Shows all cards with full details
3. Cards sortable by: cost, type, name, added order
4. Upgraded cards clearly marked
5. Card count displayed
6. Modal overlay that can be dismissed

### Tasks

- [ ] Create DeckViewerModal component
- [ ] Add deck viewer button to MapView
- [ ] Add deck viewer to combat pause menu
- [ ] Implement sorting options
- [ ] Style card grid layout

---

# Epic 5: Dungeon Knight Class

## Status: Not Started

### Epic Goal
Implement the second free character class (Dungeon Knight) with the Fortify mechanic, providing an alternative playstyle focused on defensive block-stacking.

---

## Story 5.1: Dungeon Knight Starter Deck & Fortify Mechanic

**As a** player choosing the Dungeon Knight,
**I want** a unique defensive playstyle with the Fortify mechanic,
**So that** I can experience a different strategic approach.

### Acceptance Criteria

1. Dungeon Knight starts with 80 HP, 3 Resolve
2. Starter deck: 4x Strike, 4x Defend, 1x Shield Bash, 1x Fortitude
3. Fortify mechanic: 50% of block carries over to next turn
4. Fortify stacks shown in UI
5. Block retention calculated correctly with Fortify
6. Fortify resets to 0 at start of new combat

### Tasks

- [ ] Define Dungeon Knight class configuration
- [ ] Implement Fortify mechanic in CombatEngine
- [ ] Create 4 starter cards for Knight
- [ ] Add Fortify display to PlayerStats UI
- [ ] Write unit tests for Fortify block retention

### Dungeon Knight Cards

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
    description: 'Deal damage equal to your block.',
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

---

## Story 5.2: Dungeon Knight Card Pool

**As a** Dungeon Knight player,
**I want** a variety of defensive-focused cards to find,
**So that** I can build around the Fortify strategy.

### Acceptance Criteria

1. Knight has 15+ cards beyond starter deck
2. Cards synergize with block and Fortify
3. Cards balanced across rarities
4. Mix of attacks, skills, and powers

### Tasks

- [ ] Define 5 common Knight cards
- [ ] Define 5 uncommon Knight cards
- [ ] Define 3 rare Knight cards
- [ ] Define 2 power cards
- [ ] Add to Knight card pool

### Dungeon Knight Card Pool

```typescript
// Common
- Heavy Slash (2): Deal 12 damage.
- Iron Wall (1): Gain 7 block.
- Counter Strike (1): Gain 4 block. Deal 4 damage.
- Reinforce (1): Gain 5 block. Gain 1 Fortify.
- Stalwart (0): Gain 3 block.

// Uncommon
- Impenetrable (2): Gain 15 block.
- Riposte (1): Gain 6 block. Next turn, deal 8 damage to attacker.
- Battering Ram (2): Deal 10 damage. If you have 15+ block, deal 20 instead.
- Iron Skin (1): Gain 1 Fortify. Gain 5 block.
- Taunt (1): Enemy must attack you. Gain 10 block.

// Rare
- Unbreakable (3): Double your current block.
- Living Fortress (2): Power - At the end of turn, gain block equal to Fortify.
- Final Stand (X): Gain 5 block per X spent. Gain Fortify equal to X.

// Powers
- Iron Will (1): Power - Gain 2 block at start of turn.
- Fortress Stance (2): Power - Fortify retains 75% of block instead of 50%.
```

---

## Story 5.3: Character Selection Screen

**As a** player starting a new run,
**I want** to choose between Cleric and Dungeon Knight,
**So that** I can pick my preferred playstyle.

### Acceptance Criteria

1. Character select screen shows both free classes
2. Each class displays: name, HP, Resolve, mechanic description
3. Preview of starter deck shown
4. Class mechanic explained clearly
5. Selecting class starts run with that class
6. Premium classes shown as locked (greyed out, "Coming Soon")

### Tasks

- [ ] Create CharacterSelectScreen component
- [ ] Create ClassCard component with class preview
- [ ] Add starter deck preview on hover/tap
- [ ] Implement class selection flow
- [ ] Add locked class placeholders for DLC classes
- [ ] Connect to RunManager.startNewRun()

---

# Epic 6: Enemy Content Expansion

## Status: Not Started

### Epic Goal
Expand the enemy roster to provide variety across all 3 acts, with appropriate difficulty scaling.

---

## Story 6.1: Act 1 Common Enemies

**As a** player in Act 1,
**I want** variety in common enemy encounters,
**So that** early fights don't feel repetitive.

### Acceptance Criteria

1. 6 common enemies total for Act 1 (have 3, need 3 more)
2. Each enemy has distinct move patterns
3. Enemies scale appropriately for Act 1 difficulty
4. New enemies: Imp, Ghoul, Dark Acolyte

### Tasks

- [ ] Define Imp enemy (fast, low HP, multi-hit)
- [ ] Define Ghoul enemy (regenerates HP)
- [ ] Define Dark Acolyte enemy (buffs/debuffs)
- [ ] Add to enemy database
- [ ] Create enemy encounter pools

### New Enemy Definitions

```typescript
const IMP: EnemyDefinition = {
  id: 'imp',
  name: 'Imp',
  maxHp: 24,
  moves: [
    { id: 'claw', name: 'Claw', intent: 'ATTACK', damage: 3, times: 2, weight: 50 },
    { id: 'flee', name: 'Flee', intent: 'DEFEND', block: 6, weight: 30 },
    { id: 'frenzy', name: 'Frenzy', intent: 'ATTACK', damage: 2, times: 4, weight: 20 }
  ]
};

const GHOUL: EnemyDefinition = {
  id: 'ghoul',
  name: 'Ghoul',
  maxHp: 48,
  moves: [
    { id: 'bite', name: 'Bite', intent: 'ATTACK', damage: 7, weight: 40 },
    { id: 'regenerate', name: 'Regenerate', intent: 'BUFF', heal: 5, weight: 35 },
    { id: 'rend', name: 'Rend', intent: 'ATTACK', damage: 11, weight: 25 }
  ]
};

const DARK_ACOLYTE: EnemyDefinition = {
  id: 'dark_acolyte',
  name: 'Dark Acolyte',
  maxHp: 35,
  moves: [
    { id: 'dark_bolt', name: 'Dark Bolt', intent: 'ATTACK', damage: 8, weight: 40 },
    { id: 'curse', name: 'Curse', intent: 'DEBUFF', effect: 'weaken', weight: 30 },
    { id: 'shield', name: 'Dark Shield', intent: 'DEFEND', block: 10, weight: 30 }
  ]
};
```

---

## Story 6.2: Act 2 Enemies

**As a** player progressing to Act 2,
**I want** tougher enemies with new mechanics,
**So that** difficulty scales with my improved deck.

### Acceptance Criteria

1. 6 common enemies for Act 2
2. Enemies have 40-60% more HP than Act 1
3. Enemies deal 30-50% more damage
4. New mechanics: status effects, multi-attack
5. 2 elite enemies for Act 2

### Tasks

- [ ] Define 6 Act 2 common enemies
- [ ] Define 2 Act 2 elite enemies
- [ ] Define Act 2 boss
- [ ] Balance HP/damage scaling
- [ ] Create Act 2 encounter pools

---

## Story 6.3: Act 3 Enemies

**As a** player reaching Act 3,
**I want** the most challenging enemies,
**So that** the final act feels like the ultimate test.

### Acceptance Criteria

1. 6 common enemies for Act 3
2. Enemies have 80-100% more HP than Act 1
3. Complex attack patterns
4. 2 elite enemies for Act 3
5. Final boss is the hardest encounter

### Tasks

- [ ] Define 6 Act 3 common enemies
- [ ] Define 2 Act 3 elite enemies
- [ ] Define final boss
- [ ] Balance for end-game deck power

---

## Story 6.4: Multi-Enemy Combat

**As a** player facing multiple enemies,
**I want** to choose which enemy to target,
**So that** I can prioritize threats strategically.

### Acceptance Criteria

1. Combat can have 1-3 enemies
2. Enemies act in order (left to right)
3. Player selects target for attack cards
4. AoE effects hit all enemies
5. Combat ends when all enemies defeated
6. UI handles multiple enemy display

### Tasks

- [ ] Update CombatEngine for multi-enemy support
- [ ] Implement AoE damage effects
- [ ] Update EnemyArea UI for multiple enemies
- [ ] Define encounter compositions (which enemies together)
- [ ] Balance multi-enemy encounter difficulty

---

# Epic 7: Relics System

## Status: Not Started

### Epic Goal
Implement the relic system that provides passive bonuses throughout a run, adding another layer of strategic customization.

---

## Story 7.1: Relic Data Model & Core System

**As a** developer,
**I want** a flexible relic system,
**So that** relics can have diverse passive effects.

### Acceptance Criteria

1. Relic interface supports: triggers, passive effects, conditional effects
2. Relics can trigger on: combat start, turn start, card play, damage dealt, etc.
3. Relics stored in RunState.relics
4. Multiple relics can stack and interact
5. Relic effects execute at appropriate times

### Tasks

- [ ] Define Relic and RelicEffect interfaces
- [ ] Implement RelicManager class
- [ ] Create relic trigger system (event hooks)
- [ ] Integrate with CombatEngine events
- [ ] Add relic application logic

### Technical Notes

```typescript
interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'BOSS';
  triggers: RelicTrigger[];
}

interface RelicTrigger {
  event: 'COMBAT_START' | 'TURN_START' | 'CARD_PLAYED' | 'DAMAGE_DEALT' | 'HEAL' | 'ENEMY_KILL';
  condition?: (state: CombatState) => boolean;
  effect: (state: CombatState) => void;
}
```

---

## Story 7.2: Starter & Common Relics

**As a** player,
**I want** relics to find throughout my run,
**So that** I can gain powerful passive bonuses.

### Acceptance Criteria

1. Each class has a starter relic (always begins with)
2. 10 common relics defined
3. 8 uncommon relics defined
4. 4 rare relics defined
5. 3 boss relics (one per act boss)

### Tasks

- [ ] Define Cleric starter relic (Holy Symbol)
- [ ] Define Knight starter relic (Iron Shield)
- [ ] Define 10 common relics
- [ ] Define 8 uncommon relics
- [ ] Define 4 rare relics
- [ ] Define 3 boss relics

### Relic Examples

```typescript
const RELICS = [
  // Starter
  {
    id: 'holy_symbol',
    name: 'Holy Symbol',
    description: 'At the start of combat, gain 3 Devotion.',
    rarity: 'STARTER',
    classRestriction: 'CLERIC'
  },
  {
    id: 'iron_shield',
    name: 'Iron Shield',
    description: 'At the start of combat, gain 5 block.',
    rarity: 'STARTER',
    classRestriction: 'DUNGEON_KNIGHT'
  },
  // Common
  {
    id: 'health_charm',
    name: 'Health Charm',
    description: '+10 Max HP',
    rarity: 'COMMON'
  },
  {
    id: 'bag_of_gold',
    name: 'Bag of Gold',
    description: 'Gain 25 gold immediately.',
    rarity: 'COMMON'
  },
  // Uncommon
  {
    id: 'vampiric_ring',
    name: 'Vampiric Ring',
    description: 'Whenever you kill an enemy, heal 5 HP.',
    rarity: 'UNCOMMON'
  },
  // Rare
  {
    id: 'philosophers_stone',
    name: "Philosopher's Stone",
    description: 'Gain 1 Resolve at the start of each turn.',
    rarity: 'RARE'
  }
];
```

---

## Story 7.3: Relic UI Display

**As a** player with relics,
**I want** to see my relics and their effects,
**So that** I can remember what bonuses I have.

### Acceptance Criteria

1. Relics displayed in a row on combat/map screen
2. Hovering/tapping shows relic name and description
3. Relic icons are visually distinct
4. New relic acquisition shows animation/popup
5. Relic viewer accessible for detailed list

### Tasks

- [ ] Create RelicBar component
- [ ] Create RelicIcon component with tooltip
- [ ] Add relic display to CombatView and MapView
- [ ] Create relic acquisition popup
- [ ] Create RelicViewerModal

---

# Epic 8: Potions System

## Status: Not Started

### Epic Goal
Implement consumable potions that provide one-time powerful effects during combat.

---

## Story 8.1: Potion System Core

**As a** player,
**I want** to collect and use potions,
**So that** I have emergency options in tough fights.

### Acceptance Criteria

1. Player can hold up to 3 potions
2. Potions are consumed on use
3. Potions can be used during player turn
4. 8 potion types defined
5. Potions obtainable from: rewards, merchant, shrines

### Tasks

- [ ] Define Potion interface
- [ ] Create 8 potion definitions
- [ ] Implement potion use in CombatEngine
- [ ] Add potions to reward/merchant systems
- [ ] Create potion belt UI

### Potion Definitions

```typescript
const POTIONS = [
  { id: 'health_potion', name: 'Health Potion', description: 'Heal 20 HP.', rarity: 'COMMON' },
  { id: 'block_potion', name: 'Block Potion', description: 'Gain 15 block.', rarity: 'COMMON' },
  { id: 'resolve_potion', name: 'Resolve Potion', description: 'Gain 2 Resolve.', rarity: 'UNCOMMON' },
  { id: 'strength_potion', name: 'Strength Potion', description: 'Deal double damage this turn.', rarity: 'UNCOMMON' },
  { id: 'fear_potion', name: 'Fear Potion', description: 'All enemies skip their next attack.', rarity: 'RARE' },
  { id: 'fairy_potion', name: 'Fairy Potion', description: 'When you die, revive with 25% HP. (Auto-use)', rarity: 'RARE' },
  { id: 'draw_potion', name: 'Draw Potion', description: 'Draw 3 cards.', rarity: 'COMMON' },
  { id: 'devotion_potion', name: 'Devotion Potion', description: 'Gain 5 Devotion. (Cleric only)', rarity: 'UNCOMMON' }
];
```

---

## Story 8.2: Potion UI & Interaction

**As a** player in combat,
**I want** to easily use potions,
**So that** I can quickly access them when needed.

### Acceptance Criteria

1. Potion belt shows all held potions
2. Clicking/tapping a potion uses it
3. Confirmation prompt for rare potions
4. Visual feedback when potion used
5. Empty slots shown when less than 3 potions
6. Potions usable only during player turn

### Tasks

- [ ] Create PotionBelt component
- [ ] Create PotionSlot component
- [ ] Implement potion use click handler
- [ ] Add confirmation modal for rare potions
- [ ] Add potion use animation/feedback
- [ ] Disable potions during enemy turn

---

# Epic 9: Save/Load System

## Status: Not Started

### Epic Goal
Implement persistent storage so players can save runs and settings, enabling interrupted runs to be resumed.

---

## Story 9.1: LocalStorage Save System

**As a** player with an interrupted run,
**I want** my progress auto-saved,
**So that** I can resume my run later.

### Acceptance Criteria

1. Run state auto-saves after each node completion
2. Save includes: RunState, current map, deck, HP, gold, relics, potions
3. Load game option on main menu if save exists
4. "Continue Run" resumes at last saved point
5. Save is cleared on run completion (victory or defeat)
6. Save versioning for future migrations

### Tasks

- [ ] Create SaveManager class
- [ ] Implement saveRun(runState) function
- [ ] Implement loadRun() function
- [ ] Add auto-save triggers
- [ ] Create save version schema
- [ ] Add "Continue Run" to main menu

### Technical Notes

```typescript
interface SaveData {
  version: number;
  savedAt: string;
  runState: RunState;
}

const SAVE_KEY = 'sanctum_run_save';

function saveRun(runState: RunState): void {
  const saveData: SaveData = {
    version: 1,
    savedAt: new Date().toISOString(),
    runState
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}
```

---

## Story 9.2: Settings Persistence

**As a** player,
**I want** my settings saved between sessions,
**So that** I don't have to reconfigure each time.

### Acceptance Criteria

1. Settings saved separately from run saves
2. Settings include: volume, animation speed, accessibility options
3. Settings load automatically on game start
4. Settings screen allows modification
5. Settings persist across browser sessions

### Tasks

- [ ] Define SettingsData interface
- [ ] Create SettingsManager class
- [ ] Create SettingsScreen component
- [ ] Implement settings save/load
- [ ] Add volume controls (for future audio)
- [ ] Add animation speed toggle

---

## Story 9.3: Meta Progression Tracking

**As a** player completing runs,
**I want** my overall statistics tracked,
**So that** I can see my progress over time.

### Acceptance Criteria

1. Track: total runs, wins, losses, time played
2. Track per-class statistics
3. Statistics displayed on main menu or dedicated screen
4. Stats persist in LocalStorage
5. Stats not cleared on run completion

### Tasks

- [ ] Define MetaStats interface
- [ ] Create MetaManager class
- [ ] Update stats after each run
- [ ] Create StatsScreen component
- [ ] Add stats summary to main menu

---

# Epic 10: UI Polish & Game Flow

## Status: Not Started

### Epic Goal
Polish the user interface and ensure smooth game flow from title screen to run completion.

---

## Story 10.1: Main Menu & Title Screen

**As a** player opening the game,
**I want** a polished main menu,
**So that** I can easily start playing or access options.

### Acceptance Criteria

1. Title screen shows game logo/name
2. Menu options: New Run, Continue (if save exists), Settings, Stats
3. Continue option grayed out if no save
4. Background visual (static or animated)
5. Menu is responsive on all screen sizes

### Tasks

- [ ] Create TitleScreen component
- [ ] Create MainMenu component
- [ ] Add game logo/title art
- [ ] Implement menu navigation
- [ ] Add background styling

---

## Story 10.2: Loading & Transitions

**As a** player navigating between screens,
**I want** smooth transitions,
**So that** the game feels polished.

### Acceptance Criteria

1. Screen transitions have fade/slide animation
2. Loading indicator for any async operations
3. No jarring screen flashes
4. Transition timing feels responsive (200-400ms)

### Tasks

- [ ] Create ScreenTransition component
- [ ] Implement fade animation
- [ ] Add loading spinner component
- [ ] Apply transitions to all screen changes

---

## Story 10.3: Combat Polish

**As a** player in combat,
**I want** visual feedback for actions,
**So that** combat feels responsive and satisfying.

### Acceptance Criteria

1. Damage numbers float up from targets
2. Block gain shows shield animation
3. Heal shows green health restoration
4. Cards animate from hand to discard
5. Enemy death has fade/collapse animation
6. Turn transition is clearly indicated

### Tasks

- [ ] Create FloatingNumber component
- [ ] Add damage number spawn on hit
- [ ] Add block gain animation
- [ ] Add heal animation
- [ ] Implement card play animation
- [ ] Add enemy death animation

---

## Story 10.4: Accessibility & Mobile

**As a** player on mobile or with accessibility needs,
**I want** the game to be usable,
**So that** I can play regardless of device or ability.

### Acceptance Criteria

1. Touch targets minimum 44px
2. Text readable at 16px minimum
3. High contrast option available
4. Cards readable without hovering
5. Game playable in portrait and landscape
6. No critical info conveyed by color alone

### Tasks

- [ ] Audit touch target sizes
- [ ] Test on mobile devices
- [ ] Add high contrast mode
- [ ] Ensure card text visible
- [ ] Test portrait mode layout
- [ ] Add accessibility icons where needed

---

# Epic 11: Testing & Quality

## Status: Not Started

### Epic Goal
Establish testing practices and ensure game quality before MVP launch.

---

## Story 11.1: Unit Test Suite

**As a** developer,
**I want** unit tests for core game logic,
**So that** changes don't break existing functionality.

### Acceptance Criteria

1. Tests for CombatEngine (state machine, damage, block)
2. Tests for card effect execution
3. Tests for enemy AI intent selection
4. Tests for MapGenerator
5. Tests for SaveManager
6. 80%+ code coverage on game-core

### Tasks

- [ ] Set up Vitest test configuration
- [ ] Write CombatEngine tests
- [ ] Write CardEffects tests
- [ ] Write EnemyAI tests
- [ ] Write MapGenerator tests
- [ ] Write SaveManager tests
- [ ] Configure coverage reporting

---

## Story 11.2: Integration Testing

**As a** developer,
**I want** integration tests for game flows,
**So that** multi-component interactions work correctly.

### Acceptance Criteria

1. Test: full combat encounter flow
2. Test: map navigation flow
3. Test: card reward selection
4. Test: save/load cycle
5. Test: character selection to first combat

### Tasks

- [ ] Write combat flow integration test
- [ ] Write map navigation test
- [ ] Write reward flow test
- [ ] Write save/load integration test
- [ ] Write new run flow test

---

## Story 11.3: Manual QA Checklist

**As a** QA tester,
**I want** a comprehensive test checklist,
**So that** I can verify all features before release.

### Acceptance Criteria

1. Checklist covers all MVP features
2. Checklist includes edge cases
3. Browser compatibility matrix
4. Mobile testing checklist
5. Performance benchmarks

### Tasks

- [ ] Create feature test checklist
- [ ] Create edge case scenarios
- [ ] Document browser requirements
- [ ] Create mobile test procedures
- [ ] Define performance baselines

---

# Appendix: Content Summary

## MVP Content Requirements

| Content Type | Required | Current | Remaining |
|--------------|----------|---------|-----------|
| Character Classes | 2 | 1 | 1 |
| Starter Cards | 20 | 4 | 16 |
| Reward Cards | 30+ | 0 | 30+ |
| Common Enemies | 18 | 3 | 15 |
| Elite Enemies | 6 | 0 | 6 |
| Boss Enemies | 3 | 0 | 3 |
| Relics | 25 | 0 | 25 |
| Potions | 8 | 0 | 8 |
| Shrine Events | 5 | 0 | 5 |

## Story Count Summary

| Epic | Story Count |
|------|-------------|
| Epic 1: Combat Prototype | 5 (4 complete) |
| Epic 2: Map & Progression | 5 |
| Epic 3: Encounter Variety | 5 |
| Epic 4: Card Rewards | 4 |
| Epic 5: Dungeon Knight | 3 |
| Epic 6: Enemy Expansion | 4 |
| Epic 7: Relics | 3 |
| Epic 8: Potions | 2 |
| Epic 9: Save/Load | 3 |
| Epic 10: UI Polish | 4 |
| Epic 11: Testing | 3 |
| **Total** | **41 stories** |

---

*Generated by John (PM) | BMAD Framework*
*Date: 2025-12-03*
