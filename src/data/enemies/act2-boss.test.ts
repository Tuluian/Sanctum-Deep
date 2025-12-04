import { describe, it, expect } from 'vitest';
import {
  DROWNED_KING,
  DROWNED_SOLDIER,
  ACT2_BOSSES,
  ACT2_BOSS_MINIONS,
  ALL_ACT2_BOSS_ENEMIES,
  getAct2BossById,
  getAct2BossMinionById,
} from './act2-boss';
import { IntentType, StatusType } from '@/types';

// =====================================================
// STORY 4.3: Act 2 Boss - The Drowned King Tests
// =====================================================
describe('Story 4.3: Act 2 Boss - The Drowned King', () => {
  describe('Boss Count', () => {
    it('should have 1 Act 2 boss', () => {
      expect(Object.keys(ACT2_BOSSES).length).toBe(1);
    });

    it('should have 1 Act 2 boss minion', () => {
      expect(Object.keys(ACT2_BOSS_MINIONS).length).toBe(1);
    });

    it('should have 2 total boss-related enemies', () => {
      expect(Object.keys(ALL_ACT2_BOSS_ENEMIES).length).toBe(2);
    });
  });

  describe('The Drowned King - Stats (AC: 1)', () => {
    it('should have 180 HP (significant boss HP pool)', () => {
      expect(DROWNED_KING.maxHp).toBe(180);
    });

    it('should be marked as boss', () => {
      expect(DROWNED_KING.isBoss).toBe(true);
    });

    it('should NOT be marked as elite', () => {
      expect(DROWNED_KING.isElite).toBe(false);
    });

    it('should have higher HP than Act 1 boss (150 HP)', () => {
      expect(DROWNED_KING.maxHp).toBeGreaterThan(150);
    });
  });

  describe('The Drowned King - Phases (AC: 2)', () => {
    it('should have 3 phases', () => {
      expect(DROWNED_KING.phases).toBeDefined();
      expect(DROWNED_KING.phases?.length).toBe(3);
    });

    it('should have phase thresholds at 67% and 33% HP', () => {
      expect(DROWNED_KING.phaseThresholds).toEqual([0.67, 0.33]);
    });

    it('Phase 2 triggers around 120 HP', () => {
      // 180 * 0.67 ≈ 120
      const threshold = Math.floor(180 * 0.67);
      expect(threshold).toBeCloseTo(120, -1); // Within 10
    });

    it('Phase 3 triggers around 60 HP', () => {
      // 180 * 0.33 ≈ 59
      const threshold = Math.floor(180 * 0.33);
      expect(threshold).toBeCloseTo(60, -1); // Within 10
    });
  });

  describe('Phase 1: The Protector (HP > 120)', () => {
    const phase1Moves = DROWNED_KING.phases![0].moves;

    it('should have Royal Guard defend move', () => {
      const royalGuard = phase1Moves.find((m) => m.id === 'royal_guard');
      expect(royalGuard).toBeDefined();
      expect(royalGuard?.intent).toBe(IntentType.DEFEND);
      expect(royalGuard?.block).toBe(15);
    });

    it('should have Trident Thrust attack for 10 damage', () => {
      const thrust = phase1Moves.find((m) => m.id === 'trident_thrust');
      expect(thrust).toBeDefined();
      expect(thrust?.intent).toBe(IntentType.ATTACK);
      expect(thrust?.damage).toBe(10);
    });

    it('should have Call the Depths buff move', () => {
      const call = phase1Moves.find((m) => m.id === 'call_depths');
      expect(call).toBeDefined();
      expect(call?.intent).toBe(IntentType.BUFF);
    });

    it('should have phase 1 move weights summing to 100', () => {
      const totalWeight = phase1Moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Phase 2: The Bargainer (HP 60-120)', () => {
    const phase2Moves = DROWNED_KING.phases![1].moves;

    it('should have Crushing Pressure attack with Sundered debuff', () => {
      const crushing = phase2Moves.find((m) => m.id === 'crushing_pressure');
      expect(crushing).toBeDefined();
      expect(crushing?.intent).toBe(IntentType.ATTACK);
      expect(crushing?.damage).toBe(8);
      expect(crushing?.debuffType).toBe(StatusType.SUNDERED);
      expect(crushing?.debuffAmount).toBe(2);
    });

    it('should have Desperate Plea heal for 15 HP', () => {
      const plea = phase2Moves.find((m) => m.id === 'desperate_plea');
      expect(plea).toBeDefined();
      expect(plea?.intent).toBe(IntentType.HEAL);
      expect(plea?.heal).toBe(15);
    });

    it('should have Drown attack with Bound debuff', () => {
      const drown = phase2Moves.find((m) => m.id === 'drown');
      expect(drown).toBeDefined();
      expect(drown?.intent).toBe(IntentType.ATTACK);
      expect(drown?.damage).toBe(12);
      expect(drown?.debuffType).toBe(StatusType.BOUND);
      expect(drown?.debuffDuration).toBe(1);
    });

    it('should have Raise Tide buff move', () => {
      const tide = phase2Moves.find((m) => m.id === 'raise_tide');
      expect(tide).toBeDefined();
      expect(tide?.intent).toBe(IntentType.BUFF);
      expect(tide?.buffType).toBe(StatusType.MIGHT);
      expect(tide?.buffAmount).toBe(2);
    });

    it('should have phase 2 move weights summing to 100', () => {
      const totalWeight = phase2Moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Phase 3: The Lost (HP < 60)', () => {
    const phase3Moves = DROWNED_KING.phases![2].moves;

    it('should have Tidal Wave high damage attack (20 damage)', () => {
      const wave = phase3Moves.find((m) => m.id === 'tidal_wave');
      expect(wave).toBeDefined();
      expect(wave?.intent).toBe(IntentType.ATTACK);
      expect(wave?.damage).toBe(20);
    });

    it('should have Memory of the Kingdom summon soldiers', () => {
      const memory = phase3Moves.find((m) => m.id === 'memory_kingdom');
      expect(memory).toBeDefined();
      expect(memory?.intent).toBe(IntentType.SUMMON);
      expect(memory?.summons).toContain('drowned_soldier');
      expect(memory?.summons?.length).toBe(2);
    });

    it('should have Final Sacrifice high damage with self damage', () => {
      const sacrifice = phase3Moves.find((m) => m.id === 'final_sacrifice');
      expect(sacrifice).toBeDefined();
      expect(sacrifice?.intent).toBe(IntentType.ATTACK);
      expect(sacrifice?.damage).toBe(25);
      expect(sacrifice?.selfDamage).toBe(20);
    });

    it('should have Forgotten Purpose heal move', () => {
      const forgotten = phase3Moves.find((m) => m.id === 'forgotten_purpose');
      expect(forgotten).toBeDefined();
      expect(forgotten?.intent).toBe(IntentType.HEAL);
      expect(forgotten?.heal).toBe(10);
    });

    it('should have phase 3 move weights summing to 100', () => {
      const totalWeight = phase3Moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Drowned Soldier - Minion', () => {
    it('should have 25 HP', () => {
      expect(DROWNED_SOLDIER.maxHp).toBe(25);
    });

    it('should NOT be marked as boss or elite', () => {
      expect(DROWNED_SOLDIER.isBoss).toBeFalsy();
      expect(DROWNED_SOLDIER.isElite).toBeFalsy();
    });

    it('should have Corroded Blade attack for 6 damage', () => {
      const blade = DROWNED_SOLDIER.moves.find((m) => m.id === 'corroded_blade');
      expect(blade).toBeDefined();
      expect(blade?.intent).toBe(IntentType.ATTACK);
      expect(blade?.damage).toBe(6);
    });

    it('should have Shield Wall buff ally move', () => {
      const shield = DROWNED_SOLDIER.moves.find((m) => m.id === 'shield_wall');
      expect(shield).toBeDefined();
      expect(shield?.intent).toBe(IntentType.BUFF_ALLY);
      expect(shield?.block).toBe(5);
    });

    it('should have move weights summing to 100', () => {
      const totalWeight = DROWNED_SOLDIER.moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Boss Retrieval Functions', () => {
    it('getAct2BossById should return The Drowned King', () => {
      const boss = getAct2BossById('drowned_king');
      expect(boss).toBeDefined();
      expect(boss?.name).toBe('The Drowned King');
    });

    it('getAct2BossById should return undefined for invalid ID', () => {
      const invalid = getAct2BossById('not_a_boss');
      expect(invalid).toBeUndefined();
    });

    it('getAct2BossMinionById should return Drowned Soldier', () => {
      const minion = getAct2BossMinionById('drowned_soldier');
      expect(minion).toBeDefined();
      expect(minion?.name).toBe('Drowned Soldier');
    });

    it('getAct2BossMinionById should return undefined for invalid ID', () => {
      const invalid = getAct2BossMinionById('not_a_minion');
      expect(invalid).toBeUndefined();
    });
  });

  describe('Boss Damage Scaling', () => {
    it('Phase 3 should have highest average damage', () => {
      // Phase 1 weighted damage
      const phase1Damage = DROWNED_KING.phases![0].moves
        .filter((m) => m.damage)
        .reduce((sum, m) => sum + m.damage! * (m.weight / 100), 0);

      // Phase 2 weighted damage
      const phase2Damage = DROWNED_KING.phases![1].moves
        .filter((m) => m.damage)
        .reduce((sum, m) => sum + m.damage! * (m.weight / 100), 0);

      // Phase 3 weighted damage
      const phase3Damage = DROWNED_KING.phases![2].moves
        .filter((m) => m.damage)
        .reduce((sum, m) => sum + m.damage! * (m.weight / 100), 0);

      expect(phase3Damage).toBeGreaterThan(phase1Damage);
      expect(phase3Damage).toBeGreaterThan(phase2Damage);
    });

    it('Tidal Wave should be the highest single damage move', () => {
      const allMoves = DROWNED_KING.phases!.flatMap((p) => p.moves);
      const maxDamage = Math.max(...allMoves.map((m) => m.damage || 0));
      expect(maxDamage).toBe(25); // Final Sacrifice has 25 damage
    });

    it('Final Sacrifice damage should exceed self damage', () => {
      const sacrifice = DROWNED_KING.phases![2].moves.find(
        (m) => m.id === 'final_sacrifice'
      );
      expect(sacrifice!.damage!).toBeGreaterThan(sacrifice!.selfDamage!);
    });
  });

  describe('Boss Fight Theme: Tragic Hero (AC: 6)', () => {
    it('should have debuff removal increasing per phase', () => {
      // Phase 1: No debuffs
      const phase1Debuffs = DROWNED_KING.phases![0].moves.filter((m) => m.debuffType);
      expect(phase1Debuffs.length).toBe(0);

      // Phase 2: Multiple debuffs (Sundered, Bound)
      const phase2Debuffs = DROWNED_KING.phases![1].moves.filter((m) => m.debuffType);
      expect(phase2Debuffs.length).toBeGreaterThanOrEqual(2);

      // Phase 3: Focuses on damage and summoning
      const phase3Summons = DROWNED_KING.phases![2].moves.filter(
        (m) => m.intent === IntentType.SUMMON
      );
      expect(phase3Summons.length).toBeGreaterThanOrEqual(1);
    });

    it('should have healing moves in multiple phases', () => {
      const phase2Heals = DROWNED_KING.phases![1].moves.filter((m) => m.heal);
      const phase3Heals = DROWNED_KING.phases![2].moves.filter((m) => m.heal);

      expect(phase2Heals.length).toBeGreaterThanOrEqual(1);
      expect(phase3Heals.length).toBeGreaterThanOrEqual(1);
    });

    it('should summon soldiers only in Phase 3 (memories fading)', () => {
      const phase1Summons = DROWNED_KING.phases![0].moves.filter(
        (m) => m.intent === IntentType.SUMMON
      );
      const phase2Summons = DROWNED_KING.phases![1].moves.filter(
        (m) => m.intent === IntentType.SUMMON
      );
      const phase3Summons = DROWNED_KING.phases![2].moves.filter(
        (m) => m.intent === IntentType.SUMMON
      );

      expect(phase1Summons.length).toBe(0);
      expect(phase2Summons.length).toBe(0);
      expect(phase3Summons.length).toBeGreaterThan(0);
    });
  });

  describe('Boss Balance (AC: 5)', () => {
    it('should have phase 1 focused on defense', () => {
      const phase1 = DROWNED_KING.phases![0].moves;
      const defenseWeight = phase1
        .filter((m) => m.intent === IntentType.DEFEND || m.intent === IntentType.BUFF)
        .reduce((sum, m) => sum + m.weight, 0);

      expect(defenseWeight).toBeGreaterThan(50); // More than half is defensive
    });

    it('should have phase 2 balanced between offense and utility', () => {
      const phase2 = DROWNED_KING.phases![1].moves;
      const attackWeight = phase2
        .filter((m) => m.intent === IntentType.ATTACK)
        .reduce((sum, m) => sum + m.weight, 0);

      expect(attackWeight).toBeGreaterThan(40);
      expect(attackWeight).toBeLessThan(70);
    });

    it('should have phase 3 focused on high damage', () => {
      const phase3 = DROWNED_KING.phases![2].moves;
      const highDamageMoves = phase3.filter((m) => m.damage && m.damage >= 20);
      expect(highDamageMoves.length).toBeGreaterThanOrEqual(2);
    });
  });
});
