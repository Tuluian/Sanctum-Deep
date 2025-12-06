# Epic 2: Map & Progression System

## Status: Done

## Epic Goal

Implement the procedural map generation and node navigation system that allows players to progress through a 3-act dungeon with branching paths, transforming the combat prototype into a complete roguelike loop.

## Epic Description

### Existing System Context

- **Current functionality**: Working combat prototype with Cleric class
- **Technology stack**: TypeScript, Vite, vanilla DOM rendering
- **Integration points**: Must integrate with existing CombatEngine and extend RunState

### Enhancement Details

- **What's being built**: A seeded procedural map generator, run state management, and navigation system
- **Architecture approach**: MapGenerator produces data, MapRenderer displays it, RunManager tracks progress
- **Success criteria**: Player can navigate from Act 1 start to Act 3 boss through connected nodes

## Stories

### Story 2.1: Map Data Model & Generation
Implement the procedural map generator with seeded RNG for deterministic, shareable runs.

**Acceptance Criteria:**
1. Map generates 15 nodes per act (45 total across 3 acts)
2. Map uses seeded RNG for deterministic generation
3. Each row has 2-4 nodes with connections to 1-3 nodes in next row
4. First row always starts with a single entry node
5. Last row in each act is always a boss node
6. Node types distributed according to rules (Combat 50-60%, Elite 2-3/act, Campfire 2-3/act, etc.)
7. No orphan nodes (all nodes reachable from start)

### Story 2.2: Map Renderer & Navigation
Implement the visual map interface with node selection and navigation.

**Acceptance Criteria:**
1. Map displays as vertical scrollable layout
2. Nodes visually distinct by type (icons/colors)
3. Current position highlighted
4. Available next nodes selectable
5. Visited nodes marked
6. Connection lines visible
7. Responsive on mobile

### Story 2.3: Run State Management
Implement persistent run state tracking across encounters.

**Acceptance Criteria:**
1. RunState tracks: act, node, deck, HP, gold, relics, potions
2. Starting new run initializes RunState with class
3. Completing node updates RunState
4. Victory/defeat on boss advances to next act or ends run
5. Run ends when HP reaches 0 or Act 3 boss defeated

### Story 2.4: Node Encounter Router
Implement routing to appropriate encounter screens based on node type.

**Acceptance Criteria:**
1. Combat nodes trigger combat initialization
2. Elite/Boss nodes trigger enhanced combat
3. Non-combat nodes route to appropriate screens
4. Post-encounter returns to map with node marked visited
5. Smooth screen transitions

### Story 2.5: Act Boss Gates & Transitions
Implement boss encounters as act progression gates.

**Acceptance Criteria:**
1. Boss node only reachable from final row
2. Defeating boss shows victory screen with summary
3. After Act 1/2 boss, advance to next act
4. After Act 3 boss, show full run victory
5. Boss has unique intro presentation

## Technical Notes

### Map Data Structure

```typescript
interface MapNode {
  id: string;           // "act1_row3_node2"
  type: NodeType;       // COMBAT, ELITE, CAMPFIRE, MERCHANT, SHRINE, BOSS
  row: number;          // 0-14
  connections: string[];
  visited: boolean;
}

interface FloorMap {
  act: 1 | 2 | 3;
  rows: MapNode[][];
  bossNode: MapNode;
}

type NodeType = 'COMBAT' | 'ELITE' | 'CAMPFIRE' | 'MERCHANT' | 'SHRINE' | 'BOSS';
```

### Node Distribution Rules

| Node Type | Per Act | Rules |
|-----------|---------|-------|
| Combat | 8-10 | Standard encounters |
| Elite | 2-3 | Never in first 3 rows |
| Campfire | 2-3 | Never adjacent to boss |
| Merchant | 1-2 | Mid-act preferred |
| Shrine | 1-2 | Random placement |
| Boss | 1 | Always final row |

### File Structure

```
src/
  map/
    types.ts           - MapNode, FloorMap interfaces
    MapGenerator.ts    - Procedural generation
    MapRenderer.ts     - DOM rendering
  run/
    RunState.ts        - Run data model
    RunManager.ts      - Run lifecycle
  utils/
    SeededRandom.ts    - Deterministic RNG
```

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] Player can navigate full 3-act run on generated maps
- [ ] Maps are deterministic when given same seed
- [ ] No orphan or unreachable nodes
- [ ] Smooth integration with existing combat system
- [ ] Mobile responsive

## Dependencies

- Epic 1 (Combat Prototype) - Required for combat encounters
- Epic 3 (Encounter Variety) - For non-combat node screens (can be placeholder)

---

*Epic created by John (PM) | BMAD Framework*
