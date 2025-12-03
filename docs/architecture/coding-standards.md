# Coding Standards

## TypeScript

### Naming Conventions

- **Files**: kebab-case (`combat-engine.ts`, except current `CombatEngine.ts`)
- **Classes**: PascalCase (`CombatEngine`, `PlayerState`)
- **Interfaces**: PascalCase (`CardDefinition`, `EnemyMove`)
- **Enums**: PascalCase with SCREAMING_SNAKE values (`CardType.ATTACK`, `CombatPhase.PLAYER_ACTION`)
- **Functions/Methods**: camelCase (`playCard`, `drawCards`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase for config objects

### Type Definitions

All types live in `src/types/index.ts`. Pattern:

```typescript
// Enums for finite sets
export enum CardType {
  ATTACK = 'ATTACK',
  SKILL = 'SKILL',
}

// Interfaces for data shapes
export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
}

// Extended interfaces for runtime instances
export interface Card extends CardDefinition {
  instanceId: string;
}
```

### Imports

Use path alias for all src imports:

```typescript
import { Card, CombatState } from '@/types';
import { CombatEngine } from '@/engine/CombatEngine';
```

## Architecture Patterns

### Event-Driven State

CombatEngine uses observer pattern:

```typescript
// Subscribe to events
const unsubscribe = engine.subscribe((event) => {
  if (event.type === CombatEventType.CARD_PLAYED) {
    // Update UI
  }
});

// Emit events on state changes
this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
```

### Immutable State Access

Return copies from getters, mutate only via methods:

```typescript
getState(): CombatState {
  return { ...this.state };  // Shallow copy
}
```

### Data vs Runtime Types

- `*Definition` types: Static data (cards, enemies, classes)
- Runtime types: Include instance state (`Card` has `instanceId`, `Enemy` has `currentHp`)

## Game Data

Card definitions in `src/data/cards/`:

```typescript
export const clericCards: CardDefinition[] = [
  {
    id: 'cleric_smite',
    name: 'Smite',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
  },
];
```

Enemy definitions in `src/data/enemies/`:

```typescript
export const act1Enemies: EnemyDefinition[] = [
  {
    id: 'shadow_wisp',
    name: 'Shadow Wisp',
    maxHp: 12,
    moves: [...],
  },
];
```

## Testing

Use Vitest with `.test.ts` suffix. Place tests adjacent to source or in `__tests__/` directory.
