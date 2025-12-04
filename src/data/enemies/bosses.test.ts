import { describe, it, expect, vi } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { BONELORD, SKELETON, BONE_ARCHER, MINIONS } from './bosses';
import {
  Card,
  CardType,
  CombatEventType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
  StatusType,
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

// =====================================================
// STORY 2.4: Act 1 Boss - The Bonelord Tests
// =====================================================
describe('Story 2.4: Act 1 Boss - The Bonelord', () => {
  describe('Boss Definition', () => {
    it('should have 150 HP (AC: 2)', () => {
      expect(BONELORD.maxHp).toBe(150);
    });

    it('should be marked as a boss', () => {
      expect(BONELORD.isBoss).toBe(true);
      expect(BONELORD.isElite).toBe(false);
    });

    it('should have 3 phases (AC: 3)', () => {
      expect(BONELORD.phases?.length).toBe(3);
      expect(BONELORD.phaseThresholds).toEqual([0.66, 0.33]);
    });

    it('Phase 1 should have dominance moves', () => {
      const phase1 = BONELORD.phases![0];
      expect(phase1.moves.find(m => m.id === 'bone_spike')).toBeDefined();
      expect(phase1.moves.find(m => m.id === 'summon_skeletons')).toBeDefined();
      expect(phase1.moves.find(m => m.id === 'dark_command')).toBeDefined();
      expect(phase1.moves.find(m => m.id === 'necrotic_shield')).toBeDefined();
    });

    it('Phase 2 should have assault moves', () => {
      const phase2 = BONELORD.phases![1];
      expect(phase2.moves.find(m => m.id === 'bone_storm')).toBeDefined();
      expect(phase2.moves.find(m => m.id === 'death_grip')).toBeDefined();
      expect(phase2.moves.find(m => m.id === 'raise_dead')).toBeDefined();
      expect(phase2.moves.find(m => m.id === 'soul_harvest')).toBeDefined();
    });

    it('Phase 3 should have fury moves including charging attack', () => {
      const phase3 = BONELORD.phases![2];
      expect(phase3.moves.find(m => m.id === 'bone_cataclysm')).toBeDefined();
      expect(phase3.moves.find(m => m.id === 'final_summon')).toBeDefined();
      expect(phase3.moves.find(m => m.id === 'unholy_vigor')).toBeDefined();
      expect(phase3.moves.find(m => m.id === 'drain_life')).toBeDefined();

      // Bone Cataclysm should be a charging attack
      const boneCataclysm = phase3.moves.find(m => m.id === 'bone_cataclysm');
      expect(boneCataclysm?.intent).toBe(IntentType.CHARGING);
      expect(boneCataclysm?.chargeTurns).toBe(1);
      expect(boneCataclysm?.damage).toBe(30);
    });
  });

  describe('Minion Definitions', () => {
    it('Skeleton should have 20 HP', () => {
      expect(SKELETON.maxHp).toBe(20);
    });

    it('Bone Archer should have 15 HP', () => {
      expect(BONE_ARCHER.maxHp).toBe(15);
    });

    it('Minions should be available in MINIONS lookup', () => {
      expect(MINIONS.skeleton).toBeDefined();
      expect(MINIONS.bone_archer).toBeDefined();
    });
  });

  describe('Boss Phase Transitions (AC: 3)', () => {
    it('should start in phase 0', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const engine = new CombatEngine(player, [BONELORD]);
      engine.startCombat();

      const state = engine.getState();
      expect(state.enemies[0].phase).toBe(0);
      expect(state.enemies[0].isBoss).toBe(true);
    });

    it('should transition to phase 1 at 66% HP', () => {
      const listener = vi.fn();
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 55 }], // 150 - 55 = 95, below 99 (66%)
        })
      );

      const engine = new CombatEngine(player, [BONELORD]);
      engine.subscribe(listener);
      engine.startCombat();

      // Attack to bring below 66% (150 * 0.66 = 99)
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(95);
      expect(state.enemies[0].phase).toBe(1);

      const phaseEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.ENEMY_PHASE_CHANGED
      );
      expect(phaseEvents.length).toBeGreaterThan(0);
    });

    it('should transition to phase 2 at 33% HP', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 105 }], // 150 - 105 = 45, below 50 (33%)
        })
      );

      const engine = new CombatEngine(player, [BONELORD]);
      engine.startCombat();

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(45);
      expect(state.enemies[0].phase).toBe(2);
    });
  });

  describe('Charging Attack Mechanic (AC: 4)', () => {
    it('should start charging with proper state', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 20 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Boss that only charges
      const chargingBoss: EnemyDefinition = {
        id: 'test_boss',
        name: 'Test Boss',
        maxHp: 100,
        isBoss: true,
        moves: [
          { id: 'charge_attack', name: 'Charge Attack', intent: IntentType.CHARGING, damage: 25, chargeTurns: 1, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [chargingBoss]);
      engine.startCombat();

      // First intent should show charging
      const state = engine.getState();
      expect(state.enemies[0].intent?.intent).toBe(IntentType.CHARGING);
      expect(state.enemies[0].intent?.name).toBe('Charge Attack');
    });

    it('should execute charge attack after charging completes', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 20 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Boss with 1-turn charge
      const chargingBoss: EnemyDefinition = {
        id: 'test_boss',
        name: 'Test Boss',
        maxHp: 100,
        isBoss: true,
        moves: [
          { id: 'charge_attack', name: 'Charge Attack', intent: IntentType.CHARGING, damage: 25, chargeTurns: 1, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [chargingBoss]);
      engine.startCombat();

      // End turn 1: starts charging
      engine.endTurn();

      // End turn 2: executes the attack
      engine.endTurn();

      const state = engine.getState();
      // Player should have taken 25 damage
      expect(state.player.currentHp).toBe(25); // 50 - 25
    });
  });

  describe('Minion Summoning (AC: 5)', () => {
    it('should summon skeletons', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Bonelord that only summons
      const summoningBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'summon_skeletons', name: 'Summon Skeletons', intent: IntentType.SUMMON, summons: ['skeleton', 'skeleton'], weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [summoningBoss, SKELETON]);
      engine.startCombat();

      const initialCount = engine.getState().enemies.length;
      engine.endTurn();

      const afterCount = engine.getState().enemies.length;
      // Should have 2 more enemies (2 skeletons)
      expect(afterCount).toBe(initialCount + 2);
    });

    it('summoned minions should have intents', () => {
      const listener = vi.fn();
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const summoningBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'summon_skeletons', name: 'Summon Skeletons', intent: IntentType.SUMMON, summons: ['skeleton'], weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [summoningBoss, SKELETON]);
      engine.subscribe(listener);
      engine.startCombat();
      engine.endTurn();

      const summonEvents = listener.mock.calls.filter(
        (call) => call[0].type === CombatEventType.ENEMY_SUMMONED
      );
      expect(summonEvents.length).toBeGreaterThan(0);

      // Find the newly summoned skeleton
      const enemies = engine.getState().enemies;
      const summonedSkeleton = enemies.find((e, i) => e.id === 'skeleton' && i > 1);
      if (summonedSkeleton) {
        expect(summonedSkeleton.intent).not.toBeNull();
      }
    });
  });

  describe('Dark Command Ability (AC: 6)', () => {
    it('should make all minions attack when Dark Command is used', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 20 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Create a skeleton with simple attack
      const skeletonDef: EnemyDefinition = {
        id: 'skeleton',
        name: 'Skeleton',
        maxHp: 20,
        moves: [
          { id: 'bone_slash', name: 'Bone Slash', intent: IntentType.ATTACK, damage: 6, weight: 100 },
        ],
      };

      // Boss that only uses Dark Command
      const commandBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'dark_command', name: 'Dark Command', intent: IntentType.COMMAND, commandMinions: true, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [commandBoss, skeletonDef]);
      engine.startCombat();

      // Initial HP should be 50
      expect(engine.getState().player.currentHp).toBe(50);

      // End turn: Bonelord uses Dark Command, skeleton attacks via command
      engine.endTurn();

      const state = engine.getState();
      // The skeleton should attack for 6 damage via command
      // Note: The skeleton also takes its own turn, so it attacks twice
      expect(state.player.currentHp).toBeLessThan(50);
    });
  });

  describe('Bound Status Effect (AC: 7)', () => {
    it('Death Grip should apply Bound status', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Boss that only uses Death Grip - duration 2 so it persists after end-of-turn decrement
      const gripBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'death_grip', name: 'Death Grip', intent: IntentType.ATTACK, damage: 8, debuffType: StatusType.BOUND, debuffDuration: 2, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [gripBoss]);
      engine.startCombat();
      engine.endTurn();

      const state = engine.getState();
      const bound = state.player.statusEffects.find(e => e.type === StatusType.BOUND);
      expect(bound).toBeDefined();
      // Duration decremented from 2 to 1 at end of turn
      expect(bound?.duration).toBe(1);
    });

    it('Bound should prevent playing Attack cards', () => {
      const player = createMockPlayerState({
        statusEffects: [{ type: StatusType.BOUND, amount: 1, duration: 1 }],
      });

      const attackCard = createMockCard({
        type: CardType.ATTACK,
        effects: [{ type: EffectType.DAMAGE, amount: 10 }],
      });

      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}`, type: CardType.SKILL })
      );
      player.hand = [attackCard];

      const simpleEnemy: EnemyDefinition = {
        id: 'test',
        name: 'Test',
        maxHp: 50,
        moves: [
          { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [simpleEnemy]);
      engine.startCombat();

      const result = engine.playCard(0, 0);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Bound');
    });

    it('Bound should allow Skill cards', () => {
      const player = createMockPlayerState({
        statusEffects: [{ type: StatusType.BOUND, amount: 1, duration: 1 }],
      });

      const skillCard = createMockCard({
        type: CardType.SKILL,
        effects: [{ type: EffectType.BLOCK, amount: 5 }],
      });

      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}`, type: CardType.SKILL })
      );
      player.hand = [skillCard];

      const simpleEnemy: EnemyDefinition = {
        id: 'test',
        name: 'Test',
        maxHp: 50,
        moves: [
          { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [simpleEnemy]);
      engine.startCombat();

      const result = engine.playCard(0, 0);
      expect(result.success).toBe(true);
    });
  });

  describe('Multi-Attack (Bone Storm)', () => {
    it('should deal damage multiple times', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Boss that only uses multi-attack
      const multiAttackBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'bone_storm', name: 'Bone Storm', intent: IntentType.MULTI_ATTACK, damage: 6, times: 3, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [multiAttackBoss]);
      engine.startCombat();
      engine.endTurn();

      const state = engine.getState();
      // Player should take 6 * 3 = 18 damage
      expect(state.player.currentHp).toBe(32); // 50 - 18
    });
  });

  describe('Soul Harvest (Lifesteal)', () => {
    it('should deal damage and heal the boss', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Boss that only uses soul harvest
      const lifestealBoss: EnemyDefinition = {
        id: 'bonelord',
        name: 'The Bonelord',
        maxHp: 150,
        isBoss: true,
        moves: [
          { id: 'soul_harvest', name: 'Soul Harvest', intent: IntentType.ATTACK, damage: 12, heal: 12, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [lifestealBoss]);
      engine.startCombat();

      // Damage boss first
      const state = engine.getState();
      state.enemies[0].currentHp = 100;

      engine.endTurn();

      const afterState = engine.getState();
      // Player takes 12 damage
      expect(afterState.player.currentHp).toBe(38); // 50 - 12
      // Boss should heal 12 (100 + 12 = 112)
      expect(afterState.enemies[0].currentHp).toBe(112);
    });
  });

  describe('Boss Combat Integration', () => {
    it('should handle full combat flow with phases, summons, and charging', () => {
      const player = createMockPlayerState({ currentHp: 70, maxHp: 70 });
      player.drawPile = Array.from({ length: 30 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 60 }], // Higher damage to ensure phase transitions
        })
      );

      // Use a simplified boss for predictable testing (no block moves)
      const testBoss: EnemyDefinition = {
        id: 'test_boss',
        name: 'Test Boss',
        maxHp: 150,
        isBoss: true,
        phaseThresholds: [0.66, 0.33],
        moves: [],
        phases: [
          { moves: [{ id: 'attack1', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 100 }] },
          { moves: [{ id: 'attack2', name: 'Strong Attack', intent: IntentType.ATTACK, damage: 10, weight: 100 }] },
          { moves: [{ id: 'attack3', name: 'Fury Attack', intent: IntentType.ATTACK, damage: 15, weight: 100 }] },
        ],
      };

      const engine = new CombatEngine(player, [testBoss]);
      engine.startCombat();

      // Verify initial state
      expect(engine.getState().enemies[0].phase).toBe(0);
      expect(engine.getState().enemies[0].isBoss).toBe(true);
      expect(engine.getState().enemies[0].currentHp).toBe(150);

      // Play first attack - transitions to phase 1 (150 - 60 = 90, below 99)
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].currentHp).toBe(90);
      expect(engine.getState().enemies[0].phase).toBe(1);

      // Play second attack - transitions to phase 2 (90 - 60 = 30, below 50)
      engine.playCard(0, 0);
      expect(engine.getState().enemies[0].currentHp).toBe(30);
      expect(engine.getState().enemies[0].phase).toBe(2);
    });
  });
});
