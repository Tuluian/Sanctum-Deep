import { describe, it, expect } from 'vitest';
import { ACT2_ENEMIES, getAct2EnemyById, getAct2CommonEnemyIds } from './act2';
import { IntentType, StatusType } from '@/types';

// =====================================================
// STORY 4.1: Act 2 Common Enemies Tests
// =====================================================
describe('Story 4.1: Act 2 Common Enemies', () => {
  describe('Enemy Count (AC: 1)', () => {
    it('should have 8 total Act 2 enemies', () => {
      expect(Object.keys(ACT2_ENEMIES).length).toBe(8);
    });

    it('getAct2CommonEnemyIds should return 7 enemies (excludes slimeling)', () => {
      const ids = getAct2CommonEnemyIds();
      expect(ids.length).toBe(7);
      expect(ids).not.toContain('slimeling');
    });
  });

  describe('Slime - Spawner (AC: 2, 3)', () => {
    const slime = ACT2_ENEMIES.slime;

    it('should have 45 HP', () => {
      expect(slime.maxHp).toBe(45);
    });

    it('should have Engulf attack move', () => {
      const engulf = slime.moves.find((m) => m.id === 'engulf');
      expect(engulf).toBeDefined();
      expect(engulf?.intent).toBe(IntentType.ATTACK);
      expect(engulf?.damage).toBe(6);
    });

    it('should have Acidic Touch with Sundered debuff', () => {
      const acidic = slime.moves.find((m) => m.id === 'acidic_touch');
      expect(acidic).toBeDefined();
      expect(acidic?.damage).toBe(4);
      expect(acidic?.debuffType).toBe(StatusType.SUNDERED);
      expect(acidic?.debuffAmount).toBe(2);
    });

    it('should have Split move that spawns Slimeling at low HP', () => {
      const split = slime.moves.find((m) => m.id === 'split');
      expect(split).toBeDefined();
      expect(split?.intent).toBe(IntentType.SPAWN);
      expect(split?.spawnId).toBe('slimeling');
      expect(split?.hpThreshold).toBe(0.5);
    });
  });

  describe('Slimeling - Spawned Minion', () => {
    const slimeling = ACT2_ENEMIES.slimeling;

    it('should have 15 HP', () => {
      expect(slimeling.maxHp).toBe(15);
    });

    it('should have Splash attack move', () => {
      const splash = slimeling.moves.find((m) => m.id === 'splash');
      expect(splash).toBeDefined();
      expect(splash?.damage).toBe(3);
    });

    it('should have Merge that heals parent and kills self', () => {
      const merge = slimeling.moves.find((m) => m.id === 'merge');
      expect(merge).toBeDefined();
      expect(merge?.intent).toBe(IntentType.HEAL);
      expect(merge?.heal).toBe(10);
      expect(merge?.selfDamage).toBe(15); // Kills itself
    });
  });

  describe('Dark Mage - Caster (AC: 2, 3)', () => {
    const darkMage = ACT2_ENEMIES.dark_mage;

    it('should have 35 HP', () => {
      expect(darkMage.maxHp).toBe(35);
    });

    it('should have Shadow Bolt attack', () => {
      const shadowBolt = darkMage.moves.find((m) => m.id === 'shadow_bolt');
      expect(shadowBolt).toBeDefined();
      expect(shadowBolt?.damage).toBe(8);
    });

    it('should have Dark Shield defend move', () => {
      const darkShield = darkMage.moves.find((m) => m.id === 'dark_shield');
      expect(darkShield).toBeDefined();
      expect(darkShield?.intent).toBe(IntentType.DEFEND);
      expect(darkShield?.block).toBe(12);
    });

    it('should have Curse of Weakness debuff', () => {
      const curse = darkMage.moves.find((m) => m.id === 'curse_weakness');
      expect(curse).toBeDefined();
      expect(curse?.intent).toBe(IntentType.DEBUFF);
      expect(curse?.debuffType).toBe(StatusType.IMPAIRED);
      expect(curse?.debuffDuration).toBe(2);
    });
  });

  describe('Gargoyle - Tank (AC: 2, 3)', () => {
    const gargoyle = ACT2_ENEMIES.gargoyle;

    it('should have 55 HP (highest common enemy)', () => {
      expect(gargoyle.maxHp).toBe(55);
    });

    it('should have Stone Fist attack', () => {
      const stoneFist = gargoyle.moves.find((m) => m.id === 'stone_fist');
      expect(stoneFist).toBeDefined();
      expect(stoneFist?.damage).toBe(7);
    });

    it('should have Petrify with high block', () => {
      const petrify = gargoyle.moves.find((m) => m.id === 'petrify');
      expect(petrify).toBeDefined();
      expect(petrify?.block).toBe(15);
    });

    it('should have Awakening high damage attack', () => {
      const awakening = gargoyle.moves.find((m) => m.id === 'awakening');
      expect(awakening).toBeDefined();
      expect(awakening?.damage).toBe(10);
    });
  });

  describe('Corrupted Spirit - Debuffer (AC: 2, 3, 7)', () => {
    const spirit = ACT2_ENEMIES.corrupted_spirit;

    it('should have 30 HP (low HP debuffer)', () => {
      expect(spirit.maxHp).toBe(30);
    });

    it('should have Corrupt debuff that damages on card play', () => {
      const corrupt = spirit.moves.find((m) => m.id === 'corrupt');
      expect(corrupt).toBeDefined();
      expect(corrupt?.intent).toBe(IntentType.DEBUFF);
      expect(corrupt?.debuffType).toBe(StatusType.CORRUPT);
      expect(corrupt?.debuffAmount).toBe(2);
      expect(corrupt?.debuffDuration).toBe(2);
    });

    it('should have Wail that buffs all enemies', () => {
      const wail = spirit.moves.find((m) => m.id === 'wail');
      expect(wail).toBeDefined();
      expect(wail?.intent).toBe(IntentType.BUFF_ALLY);
      expect(wail?.block).toBe(5);
    });
  });

  describe('Aberration - Bruiser (AC: 2, 3)', () => {
    const aberration = ACT2_ENEMIES.aberration;

    it('should have 50 HP', () => {
      expect(aberration.maxHp).toBe(50);
    });

    it('should have Flailing Strike multi-attack', () => {
      const flailing = aberration.moves.find((m) => m.id === 'flailing_strike');
      expect(flailing).toBeDefined();
      expect(flailing?.intent).toBe(IntentType.MULTI_ATTACK);
      expect(flailing?.damage).toBe(4);
      expect(flailing?.times).toBe(2);
    });

    it('should have Absorb lifesteal attack', () => {
      const absorb = aberration.moves.find((m) => m.id === 'absorb');
      expect(absorb).toBeDefined();
      expect(absorb?.damage).toBe(6);
      expect(absorb?.heal).toBe(6);
    });

    it('should have Tormented Cry that hurts self and debuffs player', () => {
      const cry = aberration.moves.find((m) => m.id === 'tormented_cry');
      expect(cry).toBeDefined();
      expect(cry?.debuffType).toBe(StatusType.IMPAIRED);
      expect(cry?.selfDamage).toBe(5);
    });
  });

  describe('Drowned Cultist - Support (AC: 2, 3)', () => {
    const cultist = ACT2_ENEMIES.drowned_cultist;

    it('should have 38 HP', () => {
      expect(cultist.maxHp).toBe(38);
    });

    it('should have Water Bolt attack', () => {
      const waterBolt = cultist.moves.find((m) => m.id === 'water_bolt');
      expect(waterBolt).toBeDefined();
      expect(waterBolt?.damage).toBe(7);
    });

    it('should have Ritual Chant self-buff', () => {
      const ritual = cultist.moves.find((m) => m.id === 'ritual_chant');
      expect(ritual).toBeDefined();
      expect(ritual?.intent).toBe(IntentType.BUFF);
      expect(ritual?.buffType).toBe(StatusType.MIGHT);
      expect(ritual?.buffAmount).toBe(2);
    });

    it('should have Sacrifice that damages self to buff allies', () => {
      const sacrifice = cultist.moves.find((m) => m.id === 'sacrifice');
      expect(sacrifice).toBeDefined();
      expect(sacrifice?.intent).toBe(IntentType.BUFF_ALLY);
      expect(sacrifice?.block).toBe(8);
      expect(sacrifice?.selfDamage).toBe(10);
    });
  });

  describe('Deep One - Elite-lite (AC: 2, 3)', () => {
    const deepOne = ACT2_ENEMIES.deep_one;

    it('should have 48 HP', () => {
      expect(deepOne.maxHp).toBe(48);
    });

    it('should have high damage Claw Swipe', () => {
      const claw = deepOne.moves.find((m) => m.id === 'claw_swipe');
      expect(claw).toBeDefined();
      expect(claw?.damage).toBe(9);
    });

    it('should have Regenerate heal move', () => {
      const regen = deepOne.moves.find((m) => m.id === 'regenerate');
      expect(regen).toBeDefined();
      expect(regen?.intent).toBe(IntentType.HEAL);
      expect(regen?.heal).toBe(8);
    });

    it('should have Drown with Bound debuff', () => {
      const drown = deepOne.moves.find((m) => m.id === 'drown');
      expect(drown).toBeDefined();
      expect(drown?.damage).toBe(5);
      expect(drown?.debuffType).toBe(StatusType.BOUND);
      expect(drown?.debuffDuration).toBe(1);
    });
  });

  describe('Enemy Retrieval Functions', () => {
    it('getAct2EnemyById should return correct enemy', () => {
      const darkMage = getAct2EnemyById('dark_mage');
      expect(darkMage).toBeDefined();
      expect(darkMage?.name).toBe('Dark Mage');
    });

    it('getAct2EnemyById should return undefined for invalid ID', () => {
      const invalid = getAct2EnemyById('not_an_enemy');
      expect(invalid).toBeUndefined();
    });
  });

  describe('Move Weights (AC: 2)', () => {
    it('all enemies should have moves with positive weights', () => {
      for (const enemy of Object.values(ACT2_ENEMIES)) {
        for (const move of enemy.moves) {
          expect(move.weight).toBeGreaterThan(0);
        }
      }
    });

    it('all enemies should have total weights summing to 100', () => {
      for (const enemy of Object.values(ACT2_ENEMIES)) {
        const totalWeight = enemy.moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      }
    });
  });

  describe('Act 2 Theme: Sunken Crypts (AC: 4)', () => {
    it('should have corruption/aberration themed enemies', () => {
      expect(ACT2_ENEMIES.corrupted_spirit).toBeDefined();
      expect(ACT2_ENEMIES.aberration).toBeDefined();
      expect(ACT2_ENEMIES.dark_mage).toBeDefined();
    });

    it('should have water/drowned themed enemies', () => {
      expect(ACT2_ENEMIES.drowned_cultist).toBeDefined();
      expect(ACT2_ENEMIES.deep_one).toBeDefined();
    });
  });

  describe('Difficulty Scaling (AC: 5)', () => {
    it('Act 2 enemies should have higher average HP than Act 1 baseline', () => {
      const act2HpValues = Object.values(ACT2_ENEMIES).map((e) => e.maxHp);
      const avgHp = act2HpValues.reduce((a, b) => a + b, 0) / act2HpValues.length;
      // Act 1 average is around 35 HP, Act 2 should be higher
      expect(avgHp).toBeGreaterThan(35);
    });

    it('Act 2 should have enemies with debuff mechanics', () => {
      const debuffEnemies = Object.values(ACT2_ENEMIES).filter((e) =>
        e.moves.some(
          (m) => m.intent === IntentType.DEBUFF || m.debuffType !== undefined
        )
      );
      expect(debuffEnemies.length).toBeGreaterThanOrEqual(4);
    });
  });
});
