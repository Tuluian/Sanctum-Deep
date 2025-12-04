import { describe, it, expect, vi } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { CLASSES, createStarterDeck } from './classes';
import { KNIGHT_CARDS } from './cards/knight';
import {
  Card,
  CardType,
  CharacterClassId,
  CombatEventType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
} from '@/types';

// Test fixtures
function createKnightPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  const knightClass = CLASSES[CharacterClassId.DUNGEON_KNIGHT];
  return {
    maxHp: knightClass.maxHp,
    currentHp: knightClass.maxHp,
    block: 0,
    resolve: knightClass.maxResolve,
    maxResolve: knightClass.maxResolve,
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    statusEffects: [],
    devotion: 0,
    fortify: 0,
    maxFortify: 15,
    empoweredAttack: 0,
    soulDebt: 0,
    activeVow: null,
    vowsActivatedThisCombat: 0,
    luck: 0,
    maxLuck: 10,
    ...overrides,
  };
}

function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test_card',
    instanceId: 'test_card_0',
    name: 'Test Card',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Test card',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
    ...overrides,
  };
}

function createMockEnemyDefinition(overrides: Partial<EnemyDefinition> = {}): EnemyDefinition {
  return {
    id: 'test_enemy',
    name: 'Test Enemy',
    maxHp: 30,
    moves: [
      { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 6, weight: 100 },
    ],
    ...overrides,
  };
}

// =====================================================
// STORY 2.1: Dungeon Knight Class Tests
// =====================================================
describe('Story 2.1: Dungeon Knight Class & Fortify Mechanic', () => {
  describe('Dungeon Knight Class Configuration', () => {
    it('should have Knight with 80 max HP (AC: 2)', () => {
      const knight = CLASSES[CharacterClassId.DUNGEON_KNIGHT];
      expect(knight.maxHp).toBe(80);
    });

    it('should have Knight with 3 max Resolve (AC: 3)', () => {
      const knight = CLASSES[CharacterClassId.DUNGEON_KNIGHT];
      expect(knight.maxResolve).toBe(3);
    });

    it('should have correct Knight name', () => {
      const knight = CLASSES[CharacterClassId.DUNGEON_KNIGHT];
      expect(knight.name).toBe('Dungeon Knight');
    });
  });

  describe('Knight Starter Deck (AC: 1)', () => {
    it('should create exactly 10 cards total', () => {
      const deck = createStarterDeck(CharacterClassId.DUNGEON_KNIGHT);
      expect(deck.length).toBe(10);
    });

    it('should have 5 Sword Strike cards', () => {
      const deck = createStarterDeck(CharacterClassId.DUNGEON_KNIGHT);
      const strikes = deck.filter((card) => card.id === 'sword_strike');
      expect(strikes.length).toBe(5);
    });

    it('should have 4 Raise Shield cards', () => {
      const deck = createStarterDeck(CharacterClassId.DUNGEON_KNIGHT);
      const shields = deck.filter((card) => card.id === 'raise_shield');
      expect(shields.length).toBe(4);
    });

    it('should have 1 Bulwark Stance card', () => {
      const deck = createStarterDeck(CharacterClassId.DUNGEON_KNIGHT);
      const bulwarks = deck.filter((card) => card.id === 'bulwark_stance');
      expect(bulwarks.length).toBe(1);
    });

    it('should assign unique instance IDs', () => {
      const deck = createStarterDeck(CharacterClassId.DUNGEON_KNIGHT);
      const instanceIds = deck.map((c) => c.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(deck.length);
    });
  });

  describe('Knight Card Definitions', () => {
    it('Sword Strike should deal 6 damage', () => {
      const strike = KNIGHT_CARDS.sword_strike;
      expect(strike.type).toBe(CardType.ATTACK);
      expect(strike.cost).toBe(1);
      expect(strike.effects[0].type).toBe(EffectType.DAMAGE);
      expect(strike.effects[0].amount).toBe(6);
    });

    it('Raise Shield should grant 6 block', () => {
      const shield = KNIGHT_CARDS.raise_shield;
      expect(shield.type).toBe(CardType.SKILL);
      expect(shield.cost).toBe(1);
      expect(shield.effects[0].type).toBe(EffectType.BLOCK);
      expect(shield.effects[0].amount).toBe(6);
    });

    it('Bulwark Stance should grant 8 block and 1 Fortify', () => {
      const bulwark = KNIGHT_CARDS.bulwark_stance;
      expect(bulwark.type).toBe(CardType.SKILL);
      expect(bulwark.cost).toBe(1);
      expect(bulwark.effects.length).toBe(2);
      expect(bulwark.effects[0].type).toBe(EffectType.BLOCK);
      expect(bulwark.effects[0].amount).toBe(8);
      expect(bulwark.effects[1].type).toBe(EffectType.GAIN_FORTIFY);
      expect(bulwark.effects[1].amount).toBe(1);
    });
  });

  describe('Fortify Mechanic', () => {
    it('should persist Fortify between turns (AC: 4)', () => {
      const player = createKnightPlayerState({ fortify: 5 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}`, type: CardType.SKILL, effects: [{ type: EffectType.BLOCK, amount: 5 }] })
      );
      // Enemy that defends (no damage)
      const enemy = createMockEnemyDefinition({
        moves: [{ id: 'defend', name: 'Defend', intent: IntentType.DEFEND, block: 5, weight: 100 }],
      });
      const engine = new CombatEngine(player, [enemy]);
      engine.startCombat();

      expect(engine.getState().player.fortify).toBe(5);
      engine.endTurn();
      // Fortify should NOT reset (unlike block)
      expect(engine.getState().player.fortify).toBe(5);
    });

    it('should cap Fortify at maxFortify (15) (AC: 5)', () => {
      const player = createKnightPlayerState({ fortify: 10, maxFortify: 15 });
      // Card that grants 10 fortify
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          type: CardType.SKILL,
          effects: [{ type: EffectType.GAIN_FORTIFY, amount: 10 }],
        })
      );
      const engine = new CombatEngine(player, [createMockEnemyDefinition()]);
      engine.startCombat();
      engine.playCard(0, 0);

      // 10 existing + 10 gained = 20, but capped at 15
      expect(engine.getState().player.fortify).toBe(15);
    });

    it('should absorb damage before Block (AC: 6)', () => {
      const player = createKnightPlayerState({ fortify: 5, block: 3, currentHp: 80 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );
      // Enemy deals 10 damage
      const enemy = createMockEnemyDefinition({
        moves: [{ id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 10, weight: 100 }],
      });

      const engine = new CombatEngine(player, [enemy]);
      engine.startCombat();
      engine.endTurn();

      // 10 damage: 5 absorbed by Fortify, 3 absorbed by Block, 2 to HP
      const state = engine.getState();
      expect(state.player.fortify).toBe(0);
      expect(state.player.block).toBe(0); // Block resets after enemy phase
      expect(state.player.currentHp).toBe(78); // 80 - 2
    });

    it('should emit PLAYER_FORTIFY_CHANGED when Fortify changes', () => {
      const listener = vi.fn();
      const player = createKnightPlayerState({ fortify: 5 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );
      const enemy = createMockEnemyDefinition({
        moves: [{ id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 3, weight: 100 }],
      });

      const engine = new CombatEngine(player, [enemy]);
      engine.subscribe(listener);
      engine.startCombat();
      engine.endTurn();

      const fortifyEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.PLAYER_FORTIFY_CHANGED
      );
      expect(fortifyEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Empowered Attack Mechanic', () => {
    it('should increase next attack damage (AC: 1 - Bulwark Stance)', () => {
      const player = createKnightPlayerState();
      // All skill cards that grant empowered
      player.drawPile = Array.from({ length: 5 }, (_, i) =>
        createMockCard({
          instanceId: `bulwark${i}`,
          type: CardType.SKILL,
          effects: [
            { type: EffectType.BLOCK, amount: 8 },
            { type: EffectType.APPLY_STATUS, amount: 3 },
          ],
        })
      );
      // Add attack cards to draw pile
      player.drawPile.push(...Array.from({ length: 5 }, (_, i) =>
        createMockCard({
          instanceId: `attack${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 6 }],
        })
      ));
      const enemy = createMockEnemyDefinition({ maxHp: 100 });

      const engine = new CombatEngine(player, [enemy]);
      engine.startCombat();

      // Find a skill card (Bulwark) and play it
      const state = engine.getState();
      const skillIndex = state.player.hand.findIndex((c) => c.type === CardType.SKILL);
      expect(skillIndex).toBeGreaterThanOrEqual(0);

      engine.playCard(skillIndex, 0);
      expect(engine.getState().player.empoweredAttack).toBe(3);
      expect(engine.getState().player.block).toBe(8);

      // Find an attack card and play it
      const state2 = engine.getState();
      const attackIndex = state2.player.hand.findIndex((c) => c.type === CardType.ATTACK);
      expect(attackIndex).toBeGreaterThanOrEqual(0);

      const hpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(attackIndex, 0);
      // Should deal 6 + 3 = 9 damage
      expect(engine.getState().enemies[0].currentHp).toBe(hpBefore - 9);
      expect(engine.getState().player.empoweredAttack).toBe(0); // Consumed
    });

    it('should consume empowered on first attack only', () => {
      const player = createKnightPlayerState({ empoweredAttack: 5 });
      // All attack cards
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `attack${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 6 }],
        })
      );
      const enemy = createMockEnemyDefinition({ maxHp: 50 });

      const engine = new CombatEngine(player, [enemy]);
      engine.startCombat();

      // First attack: 6 + 5 = 11
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].currentHp).toBe(39); // 50 - 11

      // Second attack: just 6 (empowered consumed)
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].currentHp).toBe(33); // 39 - 6
    });

    it('should emit PLAYER_EMPOWERED_CHANGED events', () => {
      const listener = vi.fn();
      const player = createKnightPlayerState();
      // All cards grant empowered
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `bulwark${i}`,
          type: CardType.SKILL,
          effects: [{ type: EffectType.APPLY_STATUS, amount: 3 }],
        })
      );

      const engine = new CombatEngine(player, [createMockEnemyDefinition()]);
      engine.subscribe(listener);
      engine.startCombat();
      engine.playCard(0, 0);

      const empoweredEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.PLAYER_EMPOWERED_CHANGED
      );
      expect(empoweredEvents.length).toBeGreaterThan(0);
    });
  });
});
