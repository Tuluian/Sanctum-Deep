import { describe, it, expect } from 'vitest';
import {
  ACT3_ELITE_ENEMIES,
  getAct3EliteById,
  getAct3EliteIds,
  MEMORY_ENEMY_IDS,
  getRandomMemoryEnemy,
} from './act3-elites';
import { IntentType, StatusType } from '@/types';

// =====================================================
// STORY 4.5: Act 3 Elite Enemies Tests
// =====================================================
describe('Story 4.5: Act 3 Elite Enemies', () => {
  describe('Elite Count (AC: 1)', () => {
    it('should have 2 Act 3 elites', () => {
      const eliteIds = getAct3EliteIds();
      expect(eliteIds.length).toBe(2);
      expect(eliteIds).toContain('greater_demon');
      expect(eliteIds).toContain('sanctum_warden');
    });

    it('should have 2 memory minions', () => {
      expect(MEMORY_ENEMY_IDS.length).toBe(2);
      expect(MEMORY_ENEMY_IDS).toContain('memory_bonelord');
      expect(MEMORY_ENEMY_IDS).toContain('memory_drowned_king');
    });
  });

  describe('Greater Demon - Summoner/Executioner (AC: 2, 3)', () => {
    const demon = ACT3_ELITE_ENEMIES.greater_demon;

    it('should have 130 HP (highest elite HP)', () => {
      expect(demon.maxHp).toBe(130);
    });

    it('should be marked as elite', () => {
      expect(demon.isElite).toBe(true);
    });

    it('should have phase threshold at 50%', () => {
      expect(demon.phaseThresholds).toEqual([0.5]);
    });

    it('should have 2 phases', () => {
      expect(demon.phases?.length).toBe(2);
    });

    describe('Phase 1: Commander', () => {
      const phase1 = demon.phases![0];

      it('should have Hellfire Blast attack', () => {
        const move = phase1.moves.find((m) => m.id === 'hellfire_blast');
        expect(move).toBeDefined();
        expect(move?.damage).toBe(15);
        expect(move?.intent).toBe(IntentType.ATTACK);
      });

      it('should have Summon Imps', () => {
        const move = phase1.moves.find((m) => m.id === 'summon_imps');
        expect(move).toBeDefined();
        expect(move?.intent).toBe(IntentType.SUMMON);
        expect(move?.summons).toEqual(['imp', 'imp']);
      });

      it('should have Demonic Roar buff', () => {
        const move = phase1.moves.find((m) => m.id === 'demonic_roar');
        expect(move).toBeDefined();
        expect(move?.intent).toBe(IntentType.BUFF_ALLY);
        expect(move?.buffType).toBe(StatusType.MIGHT);
        expect(move?.buffAmount).toBe(3);
      });

      it('should have Consume Minion heal', () => {
        const move = phase1.moves.find((m) => m.id === 'consume_minion');
        expect(move).toBeDefined();
        expect(move?.intent).toBe(IntentType.HEAL);
        expect(move?.heal).toBe(20);
      });

      it('should have weights summing to 100', () => {
        const totalWeight = phase1.moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });

    describe('Phase 2: Unleashed', () => {
      const phase2 = demon.phases![1];

      it('should have Cataclysm AoE attack', () => {
        const move = phase2.moves.find((m) => m.id === 'cataclysm');
        expect(move).toBeDefined();
        expect(move?.damage).toBe(12);
        expect(move?.intent).toBe(IntentType.ATTACK);
      });

      it('should have Soul Harvest with lifesteal', () => {
        const move = phase2.moves.find((m) => m.id === 'soul_harvest');
        expect(move).toBeDefined();
        expect(move?.damage).toBe(18);
        expect(move?.heal).toBe(18);
      });

      it('should have Demonic Ascension with block and damage buff', () => {
        const move = phase2.moves.find((m) => m.id === 'demonic_ascension');
        expect(move).toBeDefined();
        expect(move?.block).toBe(20);
        expect(move?.buffAmount).toBe(5);
      });

      it('should have weights summing to 100', () => {
        const totalWeight = phase2.moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      });
    });
  });

  describe('Sanctum Warden - Reality Anchor (AC: 2, 3)', () => {
    const warden = ACT3_ELITE_ENEMIES.sanctum_warden;

    it('should have 150 HP (highest in game)', () => {
      expect(warden.maxHp).toBe(150);
    });

    it('should be marked as elite', () => {
      expect(warden.isElite).toBe(true);
    });

    it('should have Judgment Strike attack', () => {
      const move = warden.moves.find((m) => m.id === 'judgment_strike');
      expect(move).toBeDefined();
      expect(move?.damage).toBe(16);
      expect(move?.intent).toBe(IntentType.ATTACK);
    });

    it('should have Divine Barrier defense', () => {
      const move = warden.moves.find((m) => m.id === 'divine_barrier');
      expect(move).toBeDefined();
      expect(move?.block).toBe(20);
      expect(move?.intent).toBe(IntentType.DEFEND);
    });

    it('should have Seal of Binding debuff', () => {
      const move = warden.moves.find((m) => m.id === 'seal_of_binding');
      expect(move).toBeDefined();
      expect(move?.debuffType).toBe(StatusType.BOUND);
      expect(move?.debuffDuration).toBe(2);
    });

    it('should have Time Fracture special move', () => {
      const move = warden.moves.find((m) => m.id === 'time_fracture');
      expect(move).toBeDefined();
      expect(move?.intent).toBe(IntentType.DEBUFF);
    });

    it("should have Warden's Duty once-per-combat heal", () => {
      const move = warden.moves.find((m) => m.id === 'wardens_duty');
      expect(move).toBeDefined();
      expect(move?.heal).toBe(75);
      expect(move?.oncePerCombat).toBe(true);
      expect(move?.hpThreshold).toBe(0.3);
    });

    it('should have weights summing to 100', () => {
      const totalWeight = warden.moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Memory of Bonelord - Summoned Minion (AC: 2)', () => {
    const memory = ACT3_ELITE_ENEMIES.memory_bonelord;

    it('should have 40 HP', () => {
      expect(memory.maxHp).toBe(40);
    });

    it('should not be marked as elite', () => {
      expect(memory.isElite).toBeUndefined();
    });

    it('should have Bone Strike attack', () => {
      const move = memory.moves.find((m) => m.id === 'bone_strike');
      expect(move).toBeDefined();
      expect(move?.damage).toBe(8);
    });

    it('should have Hollow Echo defense', () => {
      const move = memory.moves.find((m) => m.id === 'hollow_echo');
      expect(move).toBeDefined();
      expect(move?.block).toBe(6);
    });

    it('should have weights summing to 100', () => {
      const totalWeight = memory.moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Memory of Drowned King - Summoned Minion (AC: 2)', () => {
    const memory = ACT3_ELITE_ENEMIES.memory_drowned_king;

    it('should have 40 HP', () => {
      expect(memory.maxHp).toBe(40);
    });

    it('should not be marked as elite', () => {
      expect(memory.isElite).toBeUndefined();
    });

    it('should have Tidal Memory attack', () => {
      const move = memory.moves.find((m) => m.id === 'tidal_memory');
      expect(move).toBeDefined();
      expect(move?.damage).toBe(7);
    });

    it('should have Fading Guard defense', () => {
      const move = memory.moves.find((m) => m.id === 'fading_guard');
      expect(move).toBeDefined();
      expect(move?.block).toBe(8);
    });

    it('should have weights summing to 100', () => {
      const totalWeight = memory.moves.reduce((sum, m) => sum + m.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Elite Retrieval Functions', () => {
    it('getAct3EliteById should return correct elite', () => {
      const demon = getAct3EliteById('greater_demon');
      expect(demon).toBeDefined();
      expect(demon?.name).toBe('Greater Demon');
    });

    it('getAct3EliteById should return correct memory', () => {
      const memory = getAct3EliteById('memory_bonelord');
      expect(memory).toBeDefined();
      expect(memory?.name).toBe('Memory of Bonelord');
    });

    it('getAct3EliteById should return undefined for invalid ID', () => {
      const invalid = getAct3EliteById('not_an_elite');
      expect(invalid).toBeUndefined();
    });

    it('getRandomMemoryEnemy should return a valid memory', () => {
      const memory = getRandomMemoryEnemy();
      expect(memory).toBeDefined();
      expect(MEMORY_ENEMY_IDS).toContain(memory.id);
    });
  });

  describe('Difficulty Scaling (AC: 4)', () => {
    it('Act 3 elites should have highest HP in game', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      const warden = ACT3_ELITE_ENEMIES.sanctum_warden;

      // Act 2 elites have 85-100 HP, Act 3 should be higher
      expect(demon.maxHp).toBeGreaterThan(100);
      expect(warden.maxHp).toBeGreaterThan(100);
    });

    it('Act 3 elites should have high damage moves', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      const warden = ACT3_ELITE_ENEMIES.sanctum_warden;

      // Check for high damage moves
      const demonPhase2 = demon.phases![1];
      const soulHarvest = demonPhase2.moves.find((m) => m.id === 'soul_harvest');
      expect(soulHarvest?.damage).toBeGreaterThanOrEqual(18);

      const judgmentStrike = warden.moves.find((m) => m.id === 'judgment_strike');
      expect(judgmentStrike?.damage).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Special Mechanics', () => {
    it('Greater Demon should have phase-based abilities', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      expect(demon.phases).toBeDefined();
      expect(demon.phases!.length).toBe(2);
    });

    it("Sanctum Warden should have Warden's Duty once-per-combat heal", () => {
      const warden = ACT3_ELITE_ENEMIES.sanctum_warden;
      const duty = warden.moves.find((m) => m.id === 'wardens_duty');
      expect(duty?.oncePerCombat).toBe(true);
      expect(duty?.hpThreshold).toBe(0.3);
    });

    it('Greater Demon should be able to summon Imps', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      const summon = demon.phases![0].moves.find((m) => m.id === 'summon_imps');
      expect(summon?.intent).toBe(IntentType.SUMMON);
      expect(summon?.summons).toContain('imp');
    });

    it('Soul Harvest should have lifesteal', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      const soulHarvest = demon.phases![1].moves.find((m) => m.id === 'soul_harvest');
      expect(soulHarvest?.damage).toBe(18);
      expect(soulHarvest?.heal).toBe(18);
    });
  });

  describe('Narrative Theme (AC: 5)', () => {
    it('Greater Demon represents fallen saint', () => {
      const demon = ACT3_ELITE_ENEMIES.greater_demon;
      expect(demon.name).toBe('Greater Demon');
      // Has phase transition representing struggle with former self
      expect(demon.phaseThresholds).toBeDefined();
    });

    it("Sanctum Warden represents Warden's shadow", () => {
      const warden = ACT3_ELITE_ENEMIES.sanctum_warden;
      expect(warden.name).toBe('Sanctum Warden');
      // Has protective abilities reflecting its purpose
      const barrier = warden.moves.find((m) => m.id === 'divine_barrier');
      const duty = warden.moves.find((m) => m.id === 'wardens_duty');
      expect(barrier).toBeDefined();
      expect(duty).toBeDefined();
    });

    it('Memory minions echo past bosses', () => {
      const bonelord = ACT3_ELITE_ENEMIES.memory_bonelord;
      const drownedKing = ACT3_ELITE_ENEMIES.memory_drowned_king;

      expect(bonelord.name).toContain('Bonelord');
      expect(drownedKing.name).toContain('Drowned King');
    });
  });
});
