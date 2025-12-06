/**
 * Story 8.1: Summon Mechanics Fix - Unit Tests
 * Tests for round 1 summons, SPAWN intent, and max minion limits
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
const SUMMONED_ACOLYTE: EnemyDefinition = {
  id: 'summoned_acolyte',
  name: 'Summoned Acolyte',
  maxHp: 15,
  moves: [
    { id: 'shadow_bolt', name: 'Shadow Bolt', intent: IntentType.ATTACK, damage: 5, weight: 100 },
  ],
};

const HIGH_CULTIST_TEST: EnemyDefinition = {
  id: 'high_cultist',
  name: 'High Cultist',
  maxHp: 80,
  isElite: true,
  moves: [
    {
      id: 'dark_ritual',
      name: 'Dark Ritual',
      intent: IntentType.SUMMON,
      summons: ['summoned_acolyte'],
      weight: 100
    },
  ],
};

const VOID_TENDRIL: EnemyDefinition = {
  id: 'void_tendril',
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
      id: 'summon_tendril',
      name: 'Summon Void Tendril',
      intent: IntentType.SPAWN,
      spawnId: 'void_tendril',
      weight: 100,
    },
  ],
};

// Phase-based summoner for phase 3 regression test
const PHASE_SUMMONER: EnemyDefinition = {
  id: 'phase_summoner',
  name: 'Phase Summoner',
  maxHp: 100,
  isBoss: true,
  phaseThresholds: [0.7, 0.3], // Phase 2 at 70%, Phase 3 at 30%
  moves: [],
  phases: [
    {
      // Phase 1 (HP > 70%): Basic attacks
      moves: [
        { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 8, weight: 100 },
      ],
    },
    {
      // Phase 2 (70% > HP > 30%): Mixed
      moves: [
        { id: 'strong_attack', name: 'Strong Attack', intent: IntentType.ATTACK, damage: 12, weight: 100 },
      ],
    },
    {
      // Phase 3 (HP <= 30%): Summon minions
      moves: [
        {
          id: 'desperate_summon',
          name: 'Desperate Summon',
          intent: IntentType.SUMMON,
          summons: ['summoned_acolyte'],
          weight: 100
        },
      ],
    },
  ],
};

describe('Story 8.1: Summon Mechanics Fix', () => {
  describe('Round 1 SUMMON Intent (AC: 1, 5)', () => {
    it('High Cultist should summon on round 1 when intent is SUMMON', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      // Register the minion definition
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();

      // Verify intent is set to Dark Ritual (SUMMON)
      const initialState = engine.getState();
      expect(initialState.enemies[0].intent?.intent).toBe(IntentType.SUMMON);
      expect(initialState.enemies[0].intent?.name).toBe('Dark Ritual');

      // Start with 1 enemy (cultist)
      expect(initialState.enemies.length).toBe(1);

      // End turn to execute round 1 enemy actions
      engine.endTurn();

      // After round 1, should have summoned acolyte
      const afterState = engine.getState();
      expect(afterState.enemies.length).toBe(2);

      const summoned = afterState.enemies.find(e => e.id === 'summoned_acolyte');
      expect(summoned).toBeDefined();
      expect(summoned?.currentHp).toBe(15);
    });

    it('should emit ENEMY_SUMMONED event on round 1 summon', () => {
      const listener = vi.fn();
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.subscribe(listener);
      engine.startCombat();
      engine.endTurn();

      const summonEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.ENEMY_SUMMONED
      );
      expect(summonEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Round 1 SPAWN Intent (AC: 5)', () => {
    it('Void Caller should spawn tendril on round 1 with SPAWN intent', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [VOID_CALLER_TEST]);
      // Register the spawnable minion
      engine.registerMinionDefinition(VOID_TENDRIL);
      engine.startCombat();

      // Verify intent is SPAWN
      const initialState = engine.getState();
      expect(initialState.enemies[0].intent?.intent).toBe(IntentType.SPAWN);
      expect(initialState.enemies[0].intent?.spawnId).toBe('void_tendril');

      // Start with 1 enemy
      expect(initialState.enemies.length).toBe(1);

      // End turn to execute spawn
      engine.endTurn();

      // Should have spawned tendril
      const afterState = engine.getState();
      expect(afterState.enemies.length).toBe(2);

      const spawned = afterState.enemies.find(e => e.id === 'void_tendril');
      expect(spawned).toBeDefined();
      expect(spawned?.currentHp).toBe(20);
    });

    it('SPAWN intent should set summon cooldown', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 20 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [VOID_CALLER_TEST]);
      engine.registerMinionDefinition(VOID_TENDRIL);
      engine.startCombat();
      engine.endTurn();

      // After spawning, summon cooldown should be set
      const state = engine.getState();
      expect(state.enemies[0].summonCooldown).toBeGreaterThan(0);
    });
  });

  describe('Phase 3 Summons Regression (AC: 3)', () => {
    it('should summon correctly in phase 3', () => {
      const player = createMockPlayerState();
      // High damage cards to reach phase 3 quickly
      player.drawPile = Array.from({ length: 20 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          effects: [{ type: EffectType.DAMAGE, amount: 40 }],
        })
      );

      const engine = new CombatEngine(player, [PHASE_SUMMONER]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();

      // Phase 1: HP > 70 (100 * 0.7 = 70)
      expect(engine.getState().enemies[0].phase).toBe(0);
      expect(engine.getState().enemies[0].intent?.name).toBe('Attack');

      // Attack to bring to phase 2 (100 - 40 = 60 HP, below 70%)
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].phase).toBe(1);
      expect(engine.getState().enemies[0].currentHp).toBe(60);

      // Attack again to bring to phase 3 (60 - 40 = 20 HP, below 30%)
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].phase).toBe(2);
      expect(engine.getState().enemies[0].currentHp).toBe(20);

      // Now in phase 3, intent should be Desperate Summon
      expect(engine.getState().enemies[0].intent?.name).toBe('Desperate Summon');
      expect(engine.getState().enemies[0].intent?.intent).toBe(IntentType.SUMMON);

      // Count enemies before summon
      const beforeCount = engine.getState().enemies.length;

      // End turn to execute phase 3 summon
      engine.endTurn();

      // Should have summoned
      const afterState = engine.getState();
      expect(afterState.enemies.length).toBe(beforeCount + 1);
      expect(afterState.enemies.find(e => e.id === 'summoned_acolyte')).toBeDefined();
    });
  });

  describe('Summoned Minion Properties (AC: 4)', () => {
    it('summoned minions should have correct HP', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();
      engine.endTurn();

      const summoned = engine.getState().enemies.find(e => e.id === 'summoned_acolyte');
      expect(summoned?.maxHp).toBe(15);
      expect(summoned?.currentHp).toBe(15);
    });

    it('summoned minions should have intents set immediately', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();
      engine.endTurn();

      const summoned = engine.getState().enemies.find(e => e.id === 'summoned_acolyte');
      expect(summoned?.intent).not.toBeNull();
      expect(summoned?.intent?.intent).toBe(IntentType.ATTACK);
    });
  });

  describe('Max Minion Limit Enforcement', () => {
    it('should not summon beyond max minion limit (3)', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 30 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Enemy that always tries to summon (no cooldown for testing)
      const infiniteSummoner: EnemyDefinition = {
        id: 'infinite_summoner',
        name: 'Infinite Summoner',
        maxHp: 200,
        isElite: true,
        moves: [
          {
            id: 'summon',
            name: 'Summon',
            intent: IntentType.SUMMON,
            summons: ['summoned_acolyte'],
            weight: 100
          },
        ],
      };

      const engine = new CombatEngine(player, [infiniteSummoner]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();

      // Run multiple turns
      for (let i = 0; i < 10; i++) {
        engine.endTurn();
        // Reset cooldown for testing (normally 5 turns)
        const state = engine.getState();
        state.enemies[0].summonCooldown = 0;
      }

      // Count minions (excluding the summoner)
      const state = engine.getState();
      const minions = state.enemies.filter(e => e.id === 'summoned_acolyte');

      // Max should be 3 (the limit)
      expect(minions.length).toBeLessThanOrEqual(3);
    });

    it('should respect summon cooldown', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 30 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      engine.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine.startCombat();

      // First summon
      engine.endTurn();
      const afterFirst = engine.getState().enemies.filter(e => e.id === 'summoned_acolyte').length;

      // Second turn - should be on cooldown
      engine.endTurn();
      const afterSecond = engine.getState().enemies.filter(e => e.id === 'summoned_acolyte').length;

      // Third turn - still on cooldown
      engine.endTurn();
      const afterThird = engine.getState().enemies.filter(e => e.id === 'summoned_acolyte').length;

      // Cooldown is 5 turns, so count should not increase
      expect(afterSecond).toBe(afterFirst);
      expect(afterThird).toBe(afterFirst);
    });
  });

  describe('Minion Registration', () => {
    it('should fail gracefully if minion not registered', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      // Deliberately NOT registering SUMMONED_ACOLYTE
      engine.startCombat();

      const initialCount = engine.getState().enemies.length;

      // End turn - summon should fail but not crash
      engine.endTurn();

      // Enemy count should remain unchanged (summon failed)
      const afterCount = engine.getState().enemies.length;
      expect(afterCount).toBe(initialCount);
    });

    it('registerMinionDefinition should make minion available', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [HIGH_CULTIST_TEST]);

      // First, don't register - summon fails
      engine.startCombat();
      engine.endTurn();
      expect(engine.getState().enemies.length).toBe(1); // Only cultist

      // Now register and try again (new combat)
      const engine2 = new CombatEngine(player, [HIGH_CULTIST_TEST]);
      engine2.registerMinionDefinition(SUMMONED_ACOLYTE);
      engine2.startCombat();
      engine2.endTurn();
      expect(engine2.getState().enemies.length).toBe(2); // Cultist + acolyte
    });
  });
});
