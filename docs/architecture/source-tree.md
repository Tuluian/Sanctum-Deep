# Source Tree

```
src/
├── main.ts                    # Entry point, Game class, DOM event bindings
├── types/
│   └── index.ts               # All TypeScript interfaces and enums
├── engine/
│   └── CombatEngine.ts        # Turn-based combat state machine
├── data/
│   ├── classes.ts             # Character class definitions (Cleric, Dungeon Knight, etc.)
│   ├── cards/
│   │   ├── index.ts           # Card registry, exports all cards
│   │   └── cleric.ts          # Cleric class card definitions
│   └── enemies/
│       └── act1.ts            # Act 1 enemy definitions
├── ui/
│   └── renderer.ts            # DOM rendering functions
└── styles/
    └── main.css               # Game styling
```

## Module Responsibilities

### `main.ts`
- Game class orchestrates combat initialization
- Sets up DOM event handlers (`window.playCard`, `window.selectEnemy`)
- Subscribes to CombatEngine events for UI updates

### `types/index.ts`
Central type definitions:
- Card types: `CardType`, `EffectType`, `CardDefinition`, `Card`
- Combat types: `CombatState`, `CombatPhase`, `CombatEvent`
- Entity types: `Enemy`, `EnemyDefinition`, `PlayerState`
- Class types: `CharacterClass`, `CharacterClassId`

### `engine/CombatEngine.ts`
State machine with phases: `NOT_STARTED` → `DRAW` → `PLAYER_ACTION` → `END_TURN` → `ENEMY_ACTION` → `CLEANUP` → loop or `VICTORY`/`DEFEAT`

Key methods:
- `startCombat()` - Initialize combat, shuffle deck, draw hand
- `playCard(cardIndex, targetIndex)` - Execute card effects
- `endTurn()` - Process enemy actions, start new turn
- `subscribe(listener)` - Register for state change events

### `data/`
Static game content. All definitions are typed arrays exported for use by engine and UI.

### `ui/renderer.ts`
Pure rendering functions. Reads state, outputs DOM. No game logic.
