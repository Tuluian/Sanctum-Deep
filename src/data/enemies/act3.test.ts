import { describe, it, expect } from 'vitest';
import {
  ACT3_ENEMIES,
  getAct3EnemyById,
  getAct3CommonEnemyIds,
  isDemonEnemy,
  DEMON_ENEMY_IDS,
} from './act3';
import { IntentType, StatusType } from '@/types';

// =====================================================
// STORY 4.4: Act 3 Common Enemies Tests
// =====================================================
describe('Story 4.4: Act 3 Common Enemies', () => {
  describe('Enemy Count (AC: 1)', () => {
    it('should have 6 Act 3 enemies', () => {
      expect(Object.keys(ACT3_ENEMIES).length).toBe(6);
    });

    it('getAct3CommonEnemyIds should return all 6 enemies', () => {
      const ids = getAct3CommonEnemyIds();
      expect(ids.length).toBe(6);
      expect(ids).toContain('imp');
      expect(ids).toContain('corrupted_angel');
      expect(ids).toContain('void_spawn');
      expect(ids).toContain('sanctum_guardian');
      expect(ids).toContain('soul_fragment');
      expect(ids).toContain('infernal_hound');
    });
  });

  describe('Imp - Swarm/Pack (AC: 2, 3)', () => {
    const imp = ACT3_ENEMIES.imp;

    it('should have 30 HP', () => {
      expect(imp.maxHp).toBe(30);
    });

    it('should have Claw attack move', () => {
      const claw = imp.moves.find((m) => m.id === 'claw');
      expect(claw).toBeDefined();
      expect(claw?.intent).toBe(IntentType.ATTACK);
      expect(claw?.damage).toBe(5);
    });

    it('should have Infernal Dash with Bleeding debuff', () => {
      const dash = imp.moves.find((m) => m.id === 'infernal_dash');
      expect(dash).toBeDefined();
      expect(dash?.damage).toBe(7);
      expect(dash?.debuffType).toBe(StatusType.BLEEDING);
      expect(dash?.debuffAmount).toBe(2);
    });

    it('should have Giggle pack buff move', () => {
      const giggle = imp.moves.find((m) => m.id === 'giggle');
      expect(giggle).toBeDefined();
      expect(giggle?.intent).toBe(IntentType.BUFF_ALLY);
      expect(giggle?.buffType).toBe(StatusType.MIGHT);
      expect(giggle?.buffAmount).toBe(3);
    });
  });

  describe('Corrupted Angel - Corruption Applier (AC: 2, 3)', () => {
    const angel = ACT3_ENEMIES.corrupted_angel;

    it('should have 60 HP', () => {
      expect(angel.maxHp).toBe(60);
    });

    it('should have Fallen Blade high damage attack', () => {
      const blade = angel.moves.find((m) => m.id === 'fallen_blade');
      expect(blade).toBeDefined();
      expect(blade?.intent).toBe(IntentType.ATTACK);
      expect(blade?.damage).toBe(14);
    });

    it('should have Tarnished Wings defend move', () => {
      const wings = angel.moves.find((m) => m.id === 'tarnished_wings');
      expect(wings).toBeDefined();
      expect(wings?.intent).toBe(IntentType.DEFEND);
      expect(wings?.block).toBe(12);
    });

    it('should have Corruption Spread debuff', () => {
      const corruption = angel.moves.find((m) => m.id === 'corruption_spread');
      expect(corruption).toBeDefined();
      expect(corruption?.intent).toBe(IntentType.DEBUFF);
      expect(corruption?.debuffType).toBe(StatusType.CORRUPT);
      expect(corruption?.debuffAmount).toBe(3);
    });
  });

  describe('Void Spawn - Card Disruptor (AC: 2, 3)', () => {
    const voidSpawn = ACT3_ENEMIES.void_spawn;

    it('should have 45 HP', () => {
      expect(voidSpawn.maxHp).toBe(45);
    });

    it('should have Void Touch attack', () => {
      const touch = voidSpawn.moves.find((m) => m.id === 'void_touch');
      expect(touch).toBeDefined();
      expect(touch?.intent).toBe(IntentType.ATTACK);
      expect(touch?.damage).toBe(10);
    });

    it('should have Consume Light card removal move', () => {
      const consume = voidSpawn.moves.find((m) => m.id === 'consume_light');
      expect(consume).toBeDefined();
      expect(consume?.intent).toBe(IntentType.DEBUFF);
    });

    it('should have Phase Shift intangible buff', () => {
      const phase = voidSpawn.moves.find((m) => m.id === 'phase_shift');
      expect(phase).toBeDefined();
      expect(phase?.intent).toBe(IntentType.BUFF);
    });
  });

  describe('Sanctum Guardian - Anti-Player Punisher (AC: 2, 3)', () => {
    const guardian = ACT3_ENEMIES.sanctum_guardian;

    it('should have 70 HP (highest common enemy)', () => {
      expect(guardian.maxHp).toBe(70);
    });

    it('should have Holy Smite attack', () => {
      const smite = guardian.moves.find((m) => m.id === 'holy_smite');
      expect(smite).toBeDefined();
      expect(smite?.intent).toBe(IntentType.ATTACK);
      expect(smite?.damage).toBe(12);
    });

    it('should have Divine Shield with block and heal', () => {
      const shield = guardian.moves.find((m) => m.id === 'divine_shield');
      expect(shield).toBeDefined();
      expect(shield?.intent).toBe(IntentType.DEFEND);
      expect(shield?.block).toBe(15);
      expect(shield?.heal).toBe(5);
    });

    it('should have Judgment HP-scaling attack', () => {
      const judgment = guardian.moves.find((m) => m.id === 'judgment');
      expect(judgment).toBeDefined();
      expect(judgment?.intent).toBe(IntentType.ATTACK);
      // Base damage as fallback
      expect(judgment?.damage).toBe(10);
    });

    it('should have Purge buff removal move', () => {
      const purge = guardian.moves.find((m) => m.id === 'purge');
      expect(purge).toBeDefined();
      expect(purge?.intent).toBe(IntentType.DEBUFF);
    });

    it('should have 4 moves total', () => {
      expect(guardian.moves.length).toBe(4);
    });
  });

  describe('Soul Fragment - Identity Thief (AC: 2, 3)', () => {
    const fragment = ACT3_ENEMIES.soul_fragment;

    it('should have 35 HP', () => {
      expect(fragment.maxHp).toBe(35);
    });

    it('should have Memory Slash attack', () => {
      const slash = fragment.moves.find((m) => m.id === 'memory_slash');
      expect(slash).toBeDefined();
      expect(slash?.intent).toBe(IntentType.ATTACK);
      expect(slash?.damage).toBe(8);
    });

    it('should have Identity Crisis card copy move', () => {
      const crisis = fragment.moves.find((m) => m.id === 'identity_crisis');
      expect(crisis).toBeDefined();
      expect(crisis?.intent).toBe(IntentType.UNKNOWN);
    });

    it('should have Fade once-per-combat heal', () => {
      const fade = fragment.moves.find((m) => m.id === 'fade');
      expect(fade).toBeDefined();
      expect(fade?.intent).toBe(IntentType.HEAL);
      expect(fade?.heal).toBe(35);
      expect(fade?.oncePerCombat).toBe(true);
      expect(fade?.hpThreshold).toBeCloseTo(0.43, 1);
    });
  });

  describe('Infernal Hound - Pack Buffer (AC: 2, 3)', () => {
    const hound = ACT3_ENEMIES.infernal_hound;

    it('should have 50 HP', () => {
      expect(hound.maxHp).toBe(50);
    });

    it('should have high damage Bite attack', () => {
      const bite = hound.moves.find((m) => m.id === 'bite');
      expect(bite).toBeDefined();
      expect(bite?.intent).toBe(IntentType.ATTACK);
      expect(bite?.damage).toBe(11);
    });

    it('should have Pounce with Sundered debuff', () => {
      const pounce = hound.moves.find((m) => m.id === 'pounce');
      expect(pounce).toBeDefined();
      expect(pounce?.damage).toBe(8);
      expect(pounce?.debuffType).toBe(StatusType.SUNDERED);
      expect(pounce?.debuffAmount).toBe(2);
    });

    it('should have Howl pack buff move', () => {
      const howl = hound.moves.find((m) => m.id === 'howl');
      expect(howl).toBeDefined();
      expect(howl?.intent).toBe(IntentType.BUFF_ALLY);
      expect(howl?.buffType).toBe(StatusType.MIGHT);
      expect(howl?.buffAmount).toBe(2);
    });
  });

  describe('Enemy Retrieval Functions', () => {
    it('getAct3EnemyById should return correct enemy', () => {
      const angel = getAct3EnemyById('corrupted_angel');
      expect(angel).toBeDefined();
      expect(angel?.name).toBe('Corrupted Angel');
    });

    it('getAct3EnemyById should return undefined for invalid ID', () => {
      const invalid = getAct3EnemyById('not_an_enemy');
      expect(invalid).toBeUndefined();
    });
  });

  describe('Demon Detection', () => {
    it('should identify imp as demon', () => {
      expect(isDemonEnemy('imp')).toBe(true);
    });

    it('should identify infernal_hound as demon', () => {
      expect(isDemonEnemy('infernal_hound')).toBe(true);
    });

    it('should not identify corrupted_angel as demon', () => {
      expect(isDemonEnemy('corrupted_angel')).toBe(false);
    });

    it('should have correct demon IDs list', () => {
      expect(DEMON_ENEMY_IDS).toContain('imp');
      expect(DEMON_ENEMY_IDS).toContain('infernal_hound');
      expect(DEMON_ENEMY_IDS.length).toBe(2);
    });
  });

  describe('Move Weights (AC: 2)', () => {
    it('all enemies should have moves with positive weights', () => {
      for (const enemy of Object.values(ACT3_ENEMIES)) {
        for (const move of enemy.moves) {
          expect(move.weight).toBeGreaterThan(0);
        }
      }
    });

    it('all enemies should have total weights summing to 100', () => {
      for (const enemy of Object.values(ACT3_ENEMIES)) {
        const totalWeight = enemy.moves.reduce((sum, m) => sum + m.weight, 0);
        expect(totalWeight).toBe(100);
      }
    });
  });

  describe('Act 3 Theme: Sanctum Core (AC: 3)', () => {
    it('should have demon themed enemies', () => {
      expect(ACT3_ENEMIES.imp).toBeDefined();
      expect(ACT3_ENEMIES.infernal_hound).toBeDefined();
    });

    it('should have corrupted guardian enemies', () => {
      expect(ACT3_ENEMIES.corrupted_angel).toBeDefined();
      expect(ACT3_ENEMIES.sanctum_guardian).toBeDefined();
    });

    it('should have void/identity themed enemies', () => {
      expect(ACT3_ENEMIES.void_spawn).toBeDefined();
      expect(ACT3_ENEMIES.soul_fragment).toBeDefined();
    });
  });

  describe('Difficulty Scaling (AC: 4)', () => {
    it('Act 3 enemies should have higher average HP than Act 2', () => {
      const act3HpValues = Object.values(ACT3_ENEMIES).map((e) => e.maxHp);
      const avgHp = act3HpValues.reduce((a, b) => a + b, 0) / act3HpValues.length;
      // Act 2 average is around 40 HP, Act 3 should be higher
      expect(avgHp).toBeGreaterThan(40);
    });

    it('Act 3 should have high damage moves', () => {
      const highDamageMoves = Object.values(ACT3_ENEMIES).flatMap((e) =>
        e.moves.filter((m) => m.damage && m.damage >= 10)
      );
      // Should have several high damage moves
      expect(highDamageMoves.length).toBeGreaterThanOrEqual(4);
    });

    it('Act 3 should have complex mechanics', () => {
      // Check for special moves
      const voidSpawn = ACT3_ENEMIES.void_spawn;
      const guardian = ACT3_ENEMIES.sanctum_guardian;
      const fragment = ACT3_ENEMIES.soul_fragment;

      // Void Spawn has card removal
      expect(voidSpawn.moves.some((m) => m.id === 'consume_light')).toBe(true);
      // Guardian has buff removal
      expect(guardian.moves.some((m) => m.id === 'purge')).toBe(true);
      // Fragment has card copying
      expect(fragment.moves.some((m) => m.id === 'identity_crisis')).toBe(true);
    });
  });

  describe('Pack Synergies', () => {
    it('Imp should buff other Imps via Giggle', () => {
      const imp = ACT3_ENEMIES.imp;
      const giggle = imp.moves.find((m) => m.id === 'giggle');
      expect(giggle?.intent).toBe(IntentType.BUFF_ALLY);
      expect(giggle?.buffAmount).toBe(3);
    });

    it('Infernal Hound should buff demons via Howl', () => {
      const hound = ACT3_ENEMIES.infernal_hound;
      const howl = hound.moves.find((m) => m.id === 'howl');
      expect(howl?.intent).toBe(IntentType.BUFF_ALLY);
      expect(howl?.buffAmount).toBe(2);
    });
  });
});
