import { describe, it, expect } from 'vitest';
import { ACT2_ELITE_ENEMIES, getAct2EliteById, getAct2EliteIds } from './act2-elites';
import { IntentType, StatusType } from '@/types';

// =====================================================
// STORY 4.2: Act 2 Elite Enemies Tests
// =====================================================
describe('Story 4.2: Act 2 Elite Enemies', () => {
  describe('Elite Count (AC: 1)', () => {
    it('should have 3 total Act 2 elite-related enemies', () => {
      expect(Object.keys(ACT2_ELITE_ENEMIES).length).toBe(3);
    });

    it('getAct2EliteIds should return 2 elites (excludes void_tendril)', () => {
      const ids = getAct2EliteIds();
      expect(ids.length).toBe(2);
      expect(ids).toContain('void_caller');
      expect(ids).toContain('stone_sentinel');
      expect(ids).not.toContain('void_tendril');
    });
  });

  describe('Void Caller - Summoner Elite (AC: 2, 3)', () => {
    const voidCaller = ACT2_ELITE_ENEMIES.void_caller;

    it('should have 85 HP', () => {
      expect(voidCaller.maxHp).toBe(85);
    });

    it('should be marked as elite', () => {
      expect(voidCaller.isElite).toBe(true);
    });

    it('should have phase threshold at 50% HP', () => {
      expect(voidCaller.phaseThresholds).toEqual([0.5]);
    });

    it('should have 2 phases', () => {
      expect(voidCaller.phases).toBeDefined();
      expect(voidCaller.phases?.length).toBe(2);
    });

    describe('Phase 1 - Summoner', () => {
      const phase1Moves = voidCaller.phases![0].moves;

      it('should have Summon Void Tendril spawn move', () => {
        const summon = phase1Moves.find((m) => m.id === 'summon_tendril');
        expect(summon).toBeDefined();
        expect(summon?.intent).toBe(IntentType.SPAWN);
        expect(summon?.spawnId).toBe('void_tendril');
      });

      it('should have Void Bolt attack for 10 damage', () => {
        const voidBolt = phase1Moves.find((m) => m.id === 'void_bolt');
        expect(voidBolt).toBeDefined();
        expect(voidBolt?.intent).toBe(IntentType.ATTACK);
        expect(voidBolt?.damage).toBe(10);
      });

      it('should have Empower Void buff ally move', () => {
        const empower = phase1Moves.find((m) => m.id === 'empower_void');
        expect(empower).toBeDefined();
        expect(empower?.intent).toBe(IntentType.BUFF_ALLY);
        expect(empower?.buffType).toBe(StatusType.MIGHT);
        expect(empower?.buffAmount).toBe(3);
      });

      it('should have phase 1 move weights summing to 100', () => {
        const totalWeight = phase1Moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });

    describe('Phase 2 - Desperate', () => {
      const phase2Moves = voidCaller.phases![1].moves;

      it('should have Void Storm AoE attack', () => {
        const storm = phase2Moves.find((m) => m.id === 'void_storm');
        expect(storm).toBeDefined();
        expect(storm?.intent).toBe(IntentType.ATTACK);
        expect(storm?.damage).toBe(6);
      });

      it('should have Consume Tendril heal move', () => {
        const consume = phase2Moves.find((m) => m.id === 'consume_tendril');
        expect(consume).toBeDefined();
        expect(consume?.intent).toBe(IntentType.HEAL);
        expect(consume?.heal).toBe(15);
      });

      it('should have Final Bargain high damage attack with curse', () => {
        const bargain = phase2Moves.find((m) => m.id === 'final_bargain');
        expect(bargain).toBeDefined();
        expect(bargain?.intent).toBe(IntentType.ATTACK);
        expect(bargain?.damage).toBe(15);
        expect(bargain?.debuffType).toBe(StatusType.CURSED);
      });

      it('should have phase 2 move weights summing to 100', () => {
        const totalWeight = phase2Moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });
  });

  describe('Void Tendril - Summoned Minion', () => {
    const tendril = ACT2_ELITE_ENEMIES.void_tendril;

    it('should have 20 HP', () => {
      expect(tendril.maxHp).toBe(20);
    });

    it('should NOT be marked as elite', () => {
      expect(tendril.isElite).toBeFalsy();
    });

    it('should have Lash attack for 5 damage', () => {
      const lash = tendril.moves.find((m) => m.id === 'lash');
      expect(lash).toBeDefined();
      expect(lash?.intent).toBe(IntentType.ATTACK);
      expect(lash?.damage).toBe(5);
    });

    it('should have Entangle debuff with Bound status', () => {
      const entangle = tendril.moves.find((m) => m.id === 'entangle');
      expect(entangle).toBeDefined();
      expect(entangle?.intent).toBe(IntentType.DEBUFF);
      expect(entangle?.debuffType).toBe(StatusType.BOUND);
      expect(entangle?.debuffDuration).toBe(1);
    });

    it('should have move weights summing to 100', () => {
      const totalWeight = tendril.moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Stone Sentinel - Tank Elite (AC: 2, 3)', () => {
    const sentinel = ACT2_ELITE_ENEMIES.stone_sentinel;

    it('should have 100 HP (highest elite)', () => {
      expect(sentinel.maxHp).toBe(100);
    });

    it('should be marked as elite', () => {
      expect(sentinel.isElite).toBe(true);
    });

    it('should have phase threshold at 30% HP (enrage)', () => {
      expect(sentinel.phaseThresholds).toEqual([0.3]);
    });

    it('should have 2 phases', () => {
      expect(sentinel.phases).toBeDefined();
      expect(sentinel.phases?.length).toBe(2);
    });

    describe('Normal Phase', () => {
      const normalMoves = sentinel.phases![0].moves;

      it('should have Crushing Blow attack for 12 damage', () => {
        const crushing = normalMoves.find((m) => m.id === 'crushing_blow');
        expect(crushing).toBeDefined();
        expect(crushing?.intent).toBe(IntentType.ATTACK);
        expect(crushing?.damage).toBe(12);
      });

      it('should have Stone Reformation defend for 15 block', () => {
        const reform = normalMoves.find((m) => m.id === 'stone_reformation');
        expect(reform).toBeDefined();
        expect(reform?.intent).toBe(IntentType.DEFEND);
        expect(reform?.block).toBe(15);
      });

      it('should have Tremor attack for 7 damage', () => {
        const tremor = normalMoves.find((m) => m.id === 'tremor');
        expect(tremor).toBeDefined();
        expect(tremor?.intent).toBe(IntentType.ATTACK);
        expect(tremor?.damage).toBe(7);
      });

      it('should have Petrifying Gaze debuff with Bound', () => {
        const gaze = normalMoves.find((m) => m.id === 'petrifying_gaze');
        expect(gaze).toBeDefined();
        expect(gaze?.intent).toBe(IntentType.DEBUFF);
        expect(gaze?.debuffType).toBe(StatusType.BOUND);
        expect(gaze?.debuffDuration).toBe(1);
      });

      it('should have normal phase move weights summing to 100', () => {
        const totalWeight = normalMoves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });

    describe('Enraged Phase', () => {
      const enragedMoves = sentinel.phases![1].moves;

      it('should have Crushing Blow with +5 enrage damage (17 total)', () => {
        const crushing = enragedMoves.find((m) => m.id === 'crushing_blow_enraged');
        expect(crushing).toBeDefined();
        expect(crushing?.intent).toBe(IntentType.ATTACK);
        expect(crushing?.damage).toBe(17);
      });

      it('should have Tremor with +5 enrage damage (12 total)', () => {
        const tremor = enragedMoves.find((m) => m.id === 'tremor_enraged');
        expect(tremor).toBeDefined();
        expect(tremor?.intent).toBe(IntentType.ATTACK);
        expect(tremor?.damage).toBe(12);
      });

      it('should have Final Guard attack+block combo', () => {
        const guard = enragedMoves.find((m) => m.id === 'final_guard');
        expect(guard).toBeDefined();
        expect(guard?.intent).toBe(IntentType.ATTACK);
        expect(guard?.damage).toBe(10);
        expect(guard?.block).toBe(8);
      });

      it('should have enraged phase move weights summing to 100', () => {
        const totalWeight = enragedMoves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });
  });

  describe('Enemy Retrieval Functions', () => {
    it('getAct2EliteById should return correct elite', () => {
      const voidCaller = getAct2EliteById('void_caller');
      expect(voidCaller).toBeDefined();
      expect(voidCaller?.name).toBe('Void Caller');
    });

    it('getAct2EliteById should return undefined for invalid ID', () => {
      const invalid = getAct2EliteById('not_an_elite');
      expect(invalid).toBeUndefined();
    });

    it('getAct2EliteById should return minion by ID', () => {
      const tendril = getAct2EliteById('void_tendril');
      expect(tendril).toBeDefined();
      expect(tendril?.name).toBe('Void Tendril');
    });
  });

  describe('Elite HP Scaling (AC: 5)', () => {
    it('Act 2 elites should have 80-100 HP', () => {
      for (const elite of getAct2EliteIds()) {
        const enemy = ACT2_ELITE_ENEMIES[elite];
        expect(enemy.maxHp).toBeGreaterThanOrEqual(80);
        expect(enemy.maxHp).toBeLessThanOrEqual(100);
      }
    });

    it('Act 2 elites should have higher HP than Act 2 common enemies', () => {
      // Act 2 commons have max HP around 55 (Gargoyle)
      for (const elite of getAct2EliteIds()) {
        const enemy = ACT2_ELITE_ENEMIES[elite];
        expect(enemy.maxHp).toBeGreaterThan(55);
      }
    });
  });

  describe('Elite Mechanics (AC: 3)', () => {
    it('all elites should have phase-based behavior', () => {
      for (const id of getAct2EliteIds()) {
        const elite = ACT2_ELITE_ENEMIES[id];
        expect(elite.phases).toBeDefined();
        expect(elite.phases!.length).toBeGreaterThanOrEqual(2);
        expect(elite.phaseThresholds).toBeDefined();
        expect(elite.phaseThresholds!.length).toBeGreaterThan(0);
      }
    });

    it('Void Caller should be able to spawn minions', () => {
      const voidCaller = ACT2_ELITE_ENEMIES.void_caller;
      const spawnMove = voidCaller.phases![0].moves.find((m) => m.intent === IntentType.SPAWN);
      expect(spawnMove).toBeDefined();
      expect(spawnMove?.spawnId).toBe('void_tendril');
    });

    it('Stone Sentinel enrage threshold should be lower than Void Caller phase threshold', () => {
      const sentinelThreshold = ACT2_ELITE_ENEMIES.stone_sentinel.phaseThresholds![0];
      const voidCallerThreshold = ACT2_ELITE_ENEMIES.void_caller.phaseThresholds![0];
      expect(sentinelThreshold).toBeLessThan(voidCallerThreshold);
    });
  });

  describe('Elite Damage Scaling', () => {
    it('Void Caller Phase 2 should have higher average damage than Phase 1', () => {
      const voidCaller = ACT2_ELITE_ENEMIES.void_caller;

      // Phase 1 weighted average damage
      const phase1Moves = voidCaller.phases![0].moves;
      const phase1AvgDamage = phase1Moves
        .filter((m) => m.damage)
        .reduce((sum, m) => sum + m.damage! * (m.weight / 100), 0);

      // Phase 2 weighted average damage (excluding heal)
      const phase2Moves = voidCaller.phases![1].moves;
      const phase2AvgDamage = phase2Moves
        .filter((m) => m.damage)
        .reduce((sum, m) => sum + m.damage! * (m.weight / 100), 0);

      expect(phase2AvgDamage).toBeGreaterThan(phase1AvgDamage);
    });

    it('Stone Sentinel enraged attacks should deal +5 more than normal', () => {
      const sentinel = ACT2_ELITE_ENEMIES.stone_sentinel;

      const normalCrushing = sentinel.phases![0].moves.find((m) => m.id === 'crushing_blow');
      const enragedCrushing = sentinel.phases![1].moves.find((m) => m.id === 'crushing_blow_enraged');

      expect(enragedCrushing!.damage! - normalCrushing!.damage!).toBe(5);

      const normalTremor = sentinel.phases![0].moves.find((m) => m.id === 'tremor');
      const enragedTremor = sentinel.phases![1].moves.find((m) => m.id === 'tremor_enraged');

      expect(enragedTremor!.damage! - normalTremor!.damage!).toBe(5);
    });
  });
});
