/**
 * Story 8.2: Greater Demon Self-Heal Fix - Unit Tests
 * Tests for enemy heal mechanics including Consume Minion, Consume Tendril,
 * lifesteal, and HP threshold filtering
 */

import { describe, it, expect, vi } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import {
  Card,
  CardType,
  CombatEventType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
} from '@/types';

// Test fixtures
function createMockPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    maxHp: 70,
    currentHp: 70,
    block: 0,
    resolve: 3,
    maxResolve: 3,
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
    baseMaxResolve: 3,
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

// Enemy definitions for testing
const IMP: EnemyDefinition = {
  id: 'imp_1',
  name: 'Imp',
  maxHp: 15,
  moves: [
    { id: 'scratch', name: 'Scratch', intent: IntentType.ATTACK, damage: 5, weight: 100 },
  ],
};

const GREATER_DEMON_TEST: EnemyDefinition = {
  id: 'greater_demon',
  name: 'Greater Demon',
  maxHp: 120,
  isElite: true,
  moves: [
    {
      id: 'consume_minion',
      name: 'Consume Minion',
      intent: IntentType.HEAL,
      heal: 20,
      weight: 100
    },
  ],
};

const GREATER_DEMON_LIFESTEAL: EnemyDefinition = {
  id: 'greater_demon',
  name: 'Greater Demon',
  maxHp: 120,
  isElite: true,
  moves: [
    {
      id: 'soul_harvest',
      name: 'Soul Harvest',
      intent: IntentType.ATTACK,
      damage: 10,
      heal: 18,
      weight: 100
    },
  ],
};

const VOID_TENDRIL: EnemyDefinition = {
  id: 'void_tendril_1',
  name: 'Void Tendril',
  maxHp: 20,
  moves: [
    { id: 'lash', name: 'Lash', intent: IntentType.ATTACK, damage: 5, weight: 100 },
  ],
};

const VOID_CALLER_TEST: EnemyDefinition = {
  id: 'void_caller',
  name: 'Void Caller',
  maxHp: 85,
  isElite: true,
  moves: [
    {
      id: 'consume_tendril',
      name: 'Consume Tendril',
      intent: IntentType.HEAL,
      heal: 15,
      weight: 100
    },
  ],
};

const HP_THRESHOLD_ENEMY: EnemyDefinition = {
  id: 'warden_test',
  name: 'Test Warden',
  maxHp: 100,
  isBoss: true,
  moves: [
    {
      id: 'basic_attack',
      name: 'Basic Attack',
      intent: IntentType.ATTACK,
      damage: 10,
      weight: 100
    },
    {
      id: 'wardens_duty',
      name: "Warden's Duty",
      intent: IntentType.HEAL,
      heal: 30,
      hpThreshold: 0.3, // Only when HP <= 30%
      oncePerCombat: true,
      weight: 100
    },
  ],
};

describe('Story 8.2: Enemy Heal Mechanics', () => {
  describe('Consume Minion (AC: 1)', () => {
    it('Greater Demon should destroy Imp and heal with Consume Minion', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Start with Greater Demon (damaged) and an Imp
      const engine = new CombatEngine(player, [GREATER_DEMON_TEST, IMP]);
      engine.startCombat();

      // Damage the Greater Demon
      const state = engine.getState();
      state.enemies[0].currentHp = 80; // Damaged by 40

      // Find the imp
      const impBefore = engine.getState().enemies.find(e => e.id.startsWith('imp'));
      expect(impBefore).toBeDefined();
      expect(impBefore?.currentHp).toBe(15);

      // End turn - Consume Minion should trigger
      engine.endTurn();

      // Imp should be dead
      const impAfter = engine.getState().enemies.find(e => e.id.startsWith('imp'));
      expect(impAfter?.currentHp).toBe(0);

      // Greater Demon should have healed 20
      const demon = engine.getState().enemies[0];
      expect(demon.currentHp).toBe(100); // 80 + 20
    });

    it('Consume Minion should not heal above maxHp', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [GREATER_DEMON_TEST, IMP]);
      engine.startCombat();

      // Damage demon by only 10
      const state = engine.getState();
      state.enemies[0].currentHp = 110; // Only 10 damage taken

      engine.endTurn();

      // Should only heal 10 (capped at maxHp)
      const demon = engine.getState().enemies[0];
      expect(demon.currentHp).toBe(120); // maxHp
    });

    it('Consume Minion without available Imp should not heal', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Greater Demon alone - no imps
      const engine = new CombatEngine(player, [GREATER_DEMON_TEST]);
      engine.startCombat();

      // Damage the demon
      const state = engine.getState();
      state.enemies[0].currentHp = 80;

      engine.endTurn();

      // Should not heal (no imps to consume)
      const demon = engine.getState().enemies[0];
      expect(demon.currentHp).toBe(80);
    });
  });

  describe('Soul Harvest Lifesteal (AC: 2)', () => {
    it('Greater Demon should deal damage AND heal with Soul Harvest', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [GREATER_DEMON_LIFESTEAL]);
      engine.startCombat();

      // Damage the demon
      const state = engine.getState();
      state.enemies[0].currentHp = 80;

      // Verify intent is Soul Harvest
      expect(state.enemies[0].intent?.name).toBe('Soul Harvest');

      engine.endTurn();

      // Player should take 10 damage
      expect(engine.getState().player.currentHp).toBe(40); // 50 - 10

      // Demon should heal 18
      expect(engine.getState().enemies[0].currentHp).toBe(98); // 80 + 18
    });

    it('Lifesteal should be capped at maxHp', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [GREATER_DEMON_LIFESTEAL]);
      engine.startCombat();

      // Damage demon by only 5
      const state = engine.getState();
      state.enemies[0].currentHp = 115;

      engine.endTurn();

      // Should only heal 5 (capped at maxHp 120)
      expect(engine.getState().enemies[0].currentHp).toBe(120);
    });
  });

  describe('Consume Tendril (Void Caller)', () => {
    it('Void Caller should destroy tendril and heal with Consume Tendril', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [VOID_CALLER_TEST, VOID_TENDRIL]);
      engine.startCombat();

      // Damage the Void Caller
      const state = engine.getState();
      state.enemies[0].currentHp = 50;

      // Verify tendril exists
      const tendrilBefore = engine.getState().enemies.find(e => e.id.startsWith('void_tendril'));
      expect(tendrilBefore).toBeDefined();
      expect(tendrilBefore?.currentHp).toBe(20);

      engine.endTurn();

      // Tendril should be dead
      const tendrilAfter = engine.getState().enemies.find(e => e.id.startsWith('void_tendril'));
      expect(tendrilAfter?.currentHp).toBe(0);

      // Void Caller should have healed 15
      expect(engine.getState().enemies[0].currentHp).toBe(65); // 50 + 15
    });

    it('Consume Tendril without available tendril should not heal', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Void Caller alone - no tendrils
      const engine = new CombatEngine(player, [VOID_CALLER_TEST]);
      engine.startCombat();

      // Damage the caller
      const state = engine.getState();
      state.enemies[0].currentHp = 50;

      engine.endTurn();

      // Should not heal
      expect(engine.getState().enemies[0].currentHp).toBe(50);
    });
  });

  describe('Healing Cap at maxHp (AC: 3)', () => {
    it('healing should never exceed maxHp', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [GREATER_DEMON_TEST, IMP]);
      engine.startCombat();

      // Set demon to full HP
      const state = engine.getState();
      state.enemies[0].currentHp = 120; // Already at max

      engine.endTurn();

      // Should still be at maxHp
      expect(engine.getState().enemies[0].currentHp).toBe(120);
    });
  });

  describe('HP Threshold Move Selection', () => {
    it('should not select HP threshold move when HP above threshold', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HP_THRESHOLD_ENEMY]);
      engine.startCombat();

      // Enemy at full HP (100%) - should use Basic Attack, not Warden's Duty
      expect(engine.getState().enemies[0].intent?.name).toBe('Basic Attack');
    });

    it('should select HP threshold move when HP at or below threshold', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          effects: [{ type: EffectType.DAMAGE, amount: 75 }],
        })
      );

      // Modified enemy that ONLY has the threshold move at low HP
      const thresholdOnlyEnemy: EnemyDefinition = {
        id: 'warden_test',
        name: 'Test Warden',
        maxHp: 100,
        moves: [
          {
            id: 'wardens_duty',
            name: "Warden's Duty",
            intent: IntentType.HEAL,
            heal: 30,
            hpThreshold: 0.3,
            weight: 100
          },
        ],
      };

      const engine = new CombatEngine(player, [thresholdOnlyEnemy]);
      engine.startCombat();

      // At 100%, should get default attack (no valid moves)
      expect(engine.getState().enemies[0].intent?.name).toBe('Attack');

      // Attack to bring below 30% threshold
      engine.playCard(0, 0);

      // Now at 25 HP (25%)
      expect(engine.getState().enemies[0].currentHp).toBe(25);

      // End the turn to let enemy act and get new intent for next round
      engine.endTurn();

      // After the turn cycle, new intent should be Warden's Duty (now HP <= 30%)
      expect(engine.getState().enemies[0].intent?.name).toBe("Warden's Duty");
    });
  });

  describe('ENEMY_DIED Event on Consume', () => {
    it('should emit ENEMY_DIED when Imp is consumed', () => {
      const listener = vi.fn();
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [GREATER_DEMON_TEST, IMP]);
      engine.subscribe(listener);
      engine.startCombat();

      // Damage demon
      const state = engine.getState();
      state.enemies[0].currentHp = 80;

      engine.endTurn();

      // Should emit ENEMY_DIED for the Imp
      const deathEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.ENEMY_DIED
      );
      expect(deathEvents.length).toBeGreaterThan(0);
    });
  });
});
