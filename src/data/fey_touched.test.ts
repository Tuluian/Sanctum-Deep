import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { CLASSES, createStarterDeck } from './classes';
import { FEY_TOUCHED_CARDS } from './cards/fey_touched';
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
function createFeyTouchedPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  const feyTouchedClass = CLASSES[CharacterClassId.FEY_TOUCHED];
  return {
    maxHp: feyTouchedClass.maxHp,
    currentHp: feyTouchedClass.maxHp,
    block: 0,
    resolve: feyTouchedClass.maxResolve,
    maxResolve: feyTouchedClass.maxResolve,
    hand: [],
    drawPile: [],
    discardPile: [],
    fracturePile: [],
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
    guaranteedBest: false,
    radiance: 0,
    maxRadiance: 10,
    minions: [],
    favor: 0,
    activePrices: [],
    baseMaxResolve: feyTouchedClass.maxResolve,
    permanentBlockBonus: 0,
    upgradeDamageBonus: 0,
    upgradeBlockBonus: 0,
    tide: 0,
    shadowEnergy: 0,
    inShadow: 0,
    gobbledCardsCombat: [],
    totalGobbled: 0,
    gobbleDamageBonus: 0,
    gobbleBlockBonus: 0,
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
    maxHp: 50,
    moves: [
      { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 1 },
    ],
    ...overrides,
  };
}

// =====================================================
// STORY 3.3: Fey-Touched Class Tests
// =====================================================

describe('Story 3.3: Fey-Touched Class', () => {
  // AC 1: Fey-Touched starts with 65 max HP
  describe('AC 1: Fey-Touched HP', () => {
    it('should have 65 max HP', () => {
      const feyTouchedClass = CLASSES[CharacterClassId.FEY_TOUCHED];
      expect(feyTouchedClass.maxHp).toBe(65);
    });
  });

  // AC 2: Fey-Touched starts with 3 max Resolve per turn
  describe('AC 2: Fey-Touched Resolve', () => {
    it('should have 3 max Resolve', () => {
      const feyTouchedClass = CLASSES[CharacterClassId.FEY_TOUCHED];
      expect(feyTouchedClass.maxResolve).toBe(3);
    });
  });

  // AC 3: Starter deck composition
  describe('AC 3: Starter Deck', () => {
    it('should have 11 cards in starter deck', () => {
      const deck = createStarterDeck(CharacterClassId.FEY_TOUCHED);
      expect(deck.length).toBe(11);
    });

    it('should have 4x Fey Bolt', () => {
      const deck = createStarterDeck(CharacterClassId.FEY_TOUCHED);
      const cards = deck.filter(c => c.id === 'fey_bolt');
      expect(cards.length).toBe(4);
    });

    it('should have 3x Glamour', () => {
      const deck = createStarterDeck(CharacterClassId.FEY_TOUCHED);
      const cards = deck.filter(c => c.id === 'glamour');
      expect(cards.length).toBe(3);
    });

    it('should have 2x Pixie\'s Gift', () => {
      const deck = createStarterDeck(CharacterClassId.FEY_TOUCHED);
      const cards = deck.filter(c => c.id === 'pixies_gift');
      expect(cards.length).toBe(2);
    });

    it('should have 1x Trickster\'s Trade', () => {
      const deck = createStarterDeck(CharacterClassId.FEY_TOUCHED);
      const cards = deck.filter(c => c.id === 'tricksters_trade');
      expect(cards.length).toBe(1);
    });
  });

  // AC 4: Whimsy mechanic
  describe('AC 4: Whimsy Mechanic', () => {
    it('Fey Bolt should have whimsy property', () => {
      expect(FEY_TOUCHED_CARDS.fey_bolt.whimsy).toBeDefined();
      expect(FEY_TOUCHED_CARDS.fey_bolt.whimsy!.length).toBe(5); // 4,5,6,7,8
    });

    it('Fey Bolt should deal damage in range 4-8', () => {
      const feyBolt = createMockCard({
        ...FEY_TOUCHED_CARDS.fey_bolt,
        instanceId: 'fey_bolt_0',
      });

      const results: number[] = [];

      // Run multiple trials to test randomness
      for (let trial = 0; trial < 20; trial++) {
        const player = createFeyTouchedPlayerState({
          hand: [{ ...feyBolt, instanceId: `fey_bolt_${trial}` }],
        });

        const enemy = createMockEnemyDefinition({ maxHp: 50 });
        const engine = new CombatEngine(player, [enemy]);

        engine.startCombat();
        engine.playCard(0, 0);

        const state = engine.getState();
        const damage = 50 - state.enemies[0].currentHp;
        results.push(damage);
      }

      // All results should be between 4 and 8
      for (const damage of results) {
        expect(damage).toBeGreaterThanOrEqual(4);
        expect(damage).toBeLessThanOrEqual(8);
      }

      // There should be some variance (not all same)
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('Pixie\'s Gift should have 3 possible outcomes', () => {
      expect(FEY_TOUCHED_CARDS.pixies_gift.whimsy).toBeDefined();
      expect(FEY_TOUCHED_CARDS.pixies_gift.whimsy!.length).toBe(3);
    });

    it('should emit WHIMSY_RESOLVED event when whimsy card is played', () => {
      const feyBolt = createMockCard({
        ...FEY_TOUCHED_CARDS.fey_bolt,
        instanceId: 'fey_bolt_0',
      });

      const player = createFeyTouchedPlayerState({
        hand: [feyBolt],
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let whimsyResolved = false;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.WHIMSY_RESOLVED) {
          whimsyResolved = true;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(whimsyResolved).toBe(true);
    });
  });

  // AC 7: Luck resource
  describe('AC 7: Luck Resource', () => {
    it('should start with 0 Luck', () => {
      const player = createFeyTouchedPlayerState();
      expect(player.luck).toBe(0);
    });

    it('should have maxLuck of 10', () => {
      const player = createFeyTouchedPlayerState();
      expect(player.maxLuck).toBe(10);
    });

    it('Trickster\'s Trade should grant 1 Luck', () => {
      const trickstersTrade = createMockCard({
        ...FEY_TOUCHED_CARDS.tricksters_trade,
        instanceId: 'tricksters_trade_0',
      });

      const player = createFeyTouchedPlayerState({
        hand: [trickstersTrade],
        luck: 0,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.luck).toBe(1);
    });

    it('Luck should not exceed maxLuck', () => {
      const trickstersTrade = createMockCard({
        ...FEY_TOUCHED_CARDS.tricksters_trade,
        instanceId: 'tricksters_trade_0',
      });

      const player = createFeyTouchedPlayerState({
        hand: [trickstersTrade],
        luck: 10, // Already at max
        maxLuck: 10,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.luck).toBe(10); // Should stay at max
    });

    it('should emit LUCK_CHANGED event when Luck changes', () => {
      const trickstersTrade = createMockCard({
        ...FEY_TOUCHED_CARDS.tricksters_trade,
        instanceId: 'tricksters_trade_0',
      });

      const player = createFeyTouchedPlayerState({
        hand: [trickstersTrade],
        luck: 0,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let luckChanged = false;
      let newLuck = 0;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.LUCK_CHANGED) {
          luckChanged = true;
          newLuck = (event.data as { luck: number }).luck;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(luckChanged).toBe(true);
      expect(newLuck).toBe(1);
    });
  });

  // Glamour block tests
  describe('Glamour Card', () => {
    it('should have block in range 4-8', () => {
      const glamour = createMockCard({
        ...FEY_TOUCHED_CARDS.glamour,
        instanceId: 'glamour_0',
      });

      const results: number[] = [];

      for (let trial = 0; trial < 20; trial++) {
        const player = createFeyTouchedPlayerState({
          hand: [{ ...glamour, instanceId: `glamour_${trial}` }],
          block: 0,
        });

        const enemy = createMockEnemyDefinition();
        const engine = new CombatEngine(player, [enemy]);

        engine.startCombat();
        engine.playCard(0, 0);

        const state = engine.getState();
        results.push(state.player.block);
      }

      for (const block of results) {
        expect(block).toBeGreaterThanOrEqual(4);
        expect(block).toBeLessThanOrEqual(8);
      }
    });
  });

  // Whimsy weight test
  describe('Whimsy Weight Distribution', () => {
    it('all Fey Bolt outcomes should have equal weight', () => {
      const whimsy = FEY_TOUCHED_CARDS.fey_bolt.whimsy!;
      const weights = whimsy.map(w => w.weight);
      const allEqual = weights.every(w => w === weights[0]);
      expect(allEqual).toBe(true);
    });

    it('all Pixie\'s Gift outcomes should have equal weight', () => {
      const whimsy = FEY_TOUCHED_CARDS.pixies_gift.whimsy!;
      const weights = whimsy.map(w => w.weight);
      const allEqual = weights.every(w => w === weights[0]);
      expect(allEqual).toBe(true);
    });
  });
});
