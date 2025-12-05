# Epic 1: Combat Prototype

## Status: Cancelled

## Epic Goal

Implement a fully functional single-combat prototype for Sanctum Ruins that demonstrates the core turn-based card combat loop with the Cleric class, establishing the foundation for all future combat-related development.

## Epic Description

### Existing System Context

- **Current functionality**: Mobile-responsive HTML prototype exists (`sanctum-deep-mobile.html`) with basic combat logic embedded in a single file
- **Technology stack**: HTML5, CSS3, vanilla JavaScript (browser-based)
- **Integration points**: This epic establishes the core combat engine that all future features will build upon

### Enhancement Details

- **What's being built**: A modular, testable combat system extracted from the prototype with proper state management, card effect engine, and enemy AI
- **Architecture approach**: TypeScript-based game engine with clear separation of concerns (state, rendering, effects)
- **Success criteria**: Complete a full combat encounter with the Cleric class against test enemies, with all core mechanics (Resolve, Block, Healing, Devotion) functioning correctly

## Stories

### Story 1.1: Combat State Machine
Implement the core turn-based combat flow with proper state transitions, turn phases, and win/lose conditions.

**Acceptance Criteria:**
1. Combat initializes with player and enemy state from provided configuration
2. Turn structure follows: Draw Phase → Player Phase → End Turn → Enemy Phase → Cleanup Phase
3. Player can only act during Player Phase
4. Combat ends when player HP reaches 0 (defeat) or all enemies HP reach 0 (victory)
5. Resolve refills to maximum at start of each player turn
6. Block resets to 0 at start of each player turn (before enemy attacks are resolved)
7. State changes are tracked and can trigger UI updates

### Story 1.2: Card Playing System
Implement the card effect engine that parses and executes card effects with proper targeting and cost validation.

**Acceptance Criteria:**
1. Cards can only be played if player has sufficient Resolve
2. Playing a card deducts its Resolve cost from player's current Resolve
3. Attack cards require a valid enemy target selection
4. Skill cards apply effects to player (no target required)
5. Card effects execute in order: damage → block → heal → status effects
6. Played cards move from hand to discard pile
7. Cards with multiple effects execute all effects in sequence
8. Unplayable cards (insufficient Resolve) are visually indicated

### Story 1.3: Cleric Starter Deck & Devotion Mechanic
Implement the Cleric's 10-card starter deck and the Devotion class mechanic.

**Acceptance Criteria:**
1. Cleric starts with: 4x Smite (1 Resolve, Deal 5 damage), 4x Shield of Faith (1 Resolve, Gain 5 block), 1x Prayer of Mending (1 Resolve, Heal 6 HP), 1x Consecrate (1 Resolve, Deal 3 damage, Heal 3 HP)
2. Cleric starts with 75 max HP
3. Cleric starts with 3 max Resolve per turn
4. Healing the player generates 1 Devotion token per heal effect (not per HP)
5. Devotion persists across turns within combat
6. Devotion counter is visible in the UI
7. Devotion resets to 0 at start of new combat
8. Cards that heal when at full HP still trigger Devotion gain

### Story 1.4: Enemy AI System
Implement enemy behavior with intent telegraphing and pattern-based AI.

**Acceptance Criteria:**
1. Enemies telegraph their next action (Attack X, Defend X) at start of each turn
2. Enemy intents are visible to the player before they end their turn
3. At least 3 test enemy types with different stat distributions
4. Enemies execute their telegraphed intent during Enemy Phase
5. Enemy attack damage is reduced by player's block first, remainder hits HP
6. Enemy defend action adds block to the enemy
7. Enemy block resets at start of their next turn
8. Dead enemies (0 HP) do not act and are visually distinct

### Story 1.5: Combat UI
Implement the visual interface for combat including player stats, enemy display, hand management, and combat log.

**Acceptance Criteria:**
1. Player stats displayed: Current HP/Max HP, Block, Resolve/Max Resolve, Devotion
2. Enemy area shows: Name, HP bar with current/max, Block indicator, Intent display
3. Hand area displays all cards with: Name, Cost, Type, Description
4. Cards visually indicate if playable (sufficient Resolve) or not
5. Clicking/tapping a card plays it (with target selection for attacks)
6. End Turn button is prominently displayed and functional
7. Draw pile and Discard pile card counts are visible
8. Combat log shows recent actions (damage dealt, block gained, healing, etc.)
9. Victory/Defeat screen displays when combat ends

## Technical Notes

### From IDEAS.txt - State Schema Reference
```typescript
GameState {
  combat: {
    turn: number
    player: {
      hp: number
      block: number
      resolve: number
      maxResolve: number
      hand: Card[]
      drawPile: Card[]
      discardPile: Card[]
      exhaustPile: Card[]
      statusEffects: StatusEffect[]
      devotion?: number // Cleric only
    }
    enemies: Enemy[]
  }
}
```

### Card Effect Types
- DAMAGE: Deal damage to target (reduced by block)
- BLOCK: Add block to player
- HEAL: Restore HP (capped at max), triggers Devotion

### Turn Flow Reference
1. Start of Turn: Resolve refills, draw 5 cards
2. Player Phase: Play cards, manage resources
3. End Turn: Discard remaining hand
4. Enemy Phase: Enemies execute intents, player block resets AFTER damage
5. Cleanup: Check win/lose, set next enemy intents

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] Single combat encounter playable from start to victory/defeat
- [ ] Cleric class mechanics (Devotion) functioning correctly
- [ ] Combat feels responsive with clear feedback
- [ ] Code is modular and testable
- [ ] No game-breaking bugs

## Compatibility Requirements

- [ ] Works in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design maintained from prototype
- [ ] Touch-friendly for mobile devices

## Risk Mitigation

- **Primary Risk**: State management complexity as combat grows
- **Mitigation**: Clear separation between game state, combat engine, and UI rendering
- **Rollback Plan**: Prototype HTML file preserved as reference

---

*Epic created by Sarah, Product Owner | BMAD Framework*
