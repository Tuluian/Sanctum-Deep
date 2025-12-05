/**
 * AchievementService Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterClassId } from '@/types';
import {
  AchievementTier,
  SOUL_ECHO_REWARDS,
} from '@/types/achievements';
import { ACHIEVEMENTS, getAchievementById } from '@/data/achievements';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Re-import after mocking localStorage
import { AchievementService } from './AchievementService';

describe('AchievementService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the service state
    AchievementService.resetAllAchievements();
  });

  describe('Achievement Data', () => {
    it('should have 50 achievements defined', () => {
      expect(ACHIEVEMENTS.length).toBe(50);
    });

    it('should have correct category distribution', () => {
      const combat = ACHIEVEMENTS.filter((a) => a.category === 'combat');
      const run = ACHIEVEMENTS.filter((a) => a.category === 'run');
      const classAchievements = ACHIEVEMENTS.filter((a) => a.category === 'class');
      const secret = ACHIEVEMENTS.filter((a) => a.category === 'secret');

      expect(combat.length).toBe(15);
      expect(run.length).toBe(15);
      expect(classAchievements.length).toBe(10);
      expect(secret.length).toBe(10);
    });

    it('should have unique achievement IDs', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid tiers for all achievements', () => {
      const validTiers = Object.values(AchievementTier);
      for (const achievement of ACHIEVEMENTS) {
        expect(validTiers).toContain(achievement.tier);
      }
    });

    it('should have all secret achievements marked as hidden', () => {
      const secrets = ACHIEVEMENTS.filter((a) => a.category === 'secret');
      for (const secret of secrets) {
        expect(secret.hidden).toBe(true);
      }
    });
  });

  describe('Soul Echo Rewards', () => {
    it('should have correct rewards per tier', () => {
      expect(SOUL_ECHO_REWARDS[AchievementTier.BRONZE]).toBe(10);
      expect(SOUL_ECHO_REWARDS[AchievementTier.SILVER]).toBe(25);
      expect(SOUL_ECHO_REWARDS[AchievementTier.GOLD]).toBe(50);
      expect(SOUL_ECHO_REWARDS[AchievementTier.PLATINUM]).toBe(100);
    });
  });

  describe('Achievement Lookup', () => {
    it('should find achievement by ID', () => {
      const achievement = getAchievementById('first_blood');
      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe('First Blood');
      expect(achievement?.tier).toBe(AchievementTier.BRONZE);
    });

    it('should return undefined for invalid ID', () => {
      const achievement = getAchievementById('nonexistent');
      expect(achievement).toBeUndefined();
    });
  });

  describe('Unlock Logic', () => {
    it('should start with no achievements unlocked', () => {
      expect(AchievementService.getUnlockCount()).toBe(0);
    });

    it('should unlock an achievement and track it', () => {
      const result = AchievementService.tryUnlock('first_blood');
      expect(result).toBe(true);
      expect(AchievementService.isUnlocked('first_blood')).toBe(true);
      expect(AchievementService.getUnlockCount()).toBe(1);
    });

    it('should not unlock same achievement twice', () => {
      AchievementService.tryUnlock('first_blood');
      const secondResult = AchievementService.tryUnlock('first_blood');
      expect(secondResult).toBe(false);
      expect(AchievementService.getUnlockCount()).toBe(1);
    });

    it('should return false for invalid achievement ID', () => {
      const result = AchievementService.tryUnlock('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('Query Methods', () => {
    it('should return all achievements', () => {
      const all = AchievementService.getAllAchievements();
      expect(all.length).toBe(50);
    });

    it('should filter achievements by category', () => {
      const combat = AchievementService.getAchievementsByCategory('combat');
      expect(combat.length).toBe(15);
      for (const a of combat) {
        expect(a.category).toBe('combat');
      }
    });

    it('should return unlocked achievements', () => {
      AchievementService.tryUnlock('first_blood');
      AchievementService.tryUnlock('overkill');

      const unlocked = AchievementService.getUnlockedAchievements();
      expect(unlocked.length).toBe(2);
      expect(unlocked.map((a) => a.id)).toContain('first_blood');
      expect(unlocked.map((a) => a.id)).toContain('overkill');
    });

    it('should return locked achievements', () => {
      AchievementService.tryUnlock('first_blood');

      const locked = AchievementService.getLockedAchievements();
      expect(locked.length).toBe(49);
      expect(locked.map((a) => a.id)).not.toContain('first_blood');
    });
  });

  describe('Combat Tracking', () => {
    it('should track combat stats', () => {
      AchievementService.startCombat(0);
      AchievementService.recordDamageTaken(10);
      AchievementService.recordDamageDealt(50, true);
      AchievementService.recordCardPlayed();
      AchievementService.recordEnemyDefeated();
      AchievementService.recordTurnEnd();
      AchievementService.endCombat(true);

      // Should have unlocked overkill for 50+ single attack damage
      expect(AchievementService.isUnlocked('overkill')).toBe(true);
    });

    it('should unlock untouchable for no damage victory', () => {
      AchievementService.startCombat(0);
      // No damage taken
      AchievementService.recordEnemyDefeated();
      AchievementService.endCombat(true);

      expect(AchievementService.isUnlocked('untouchable')).toBe(true);
    });

    it('should track devotion for Cleric achievement', () => {
      AchievementService.startRun(CharacterClassId.CLERIC);
      AchievementService.startCombat(0);
      AchievementService.recordDevotionGained(20);
      AchievementService.endCombat(true);

      expect(AchievementService.isUnlocked('devoted')).toBe(true);
    });
  });

  describe('Run Tracking', () => {
    it('should track run stats', () => {
      AchievementService.startRun(CharacterClassId.CLERIC);
      AchievementService.recordActComplete(1);
      AchievementService.endRun(false);

      // Should unlock survivor (complete act 1)
      expect(AchievementService.isUnlocked('survivor')).toBe(true);
    });

    it('should track class wins', () => {
      AchievementService.startRun(CharacterClassId.CLERIC);
      AchievementService.recordBossDefeated('hollow_god');
      AchievementService.recordActComplete(3);
      AchievementService.endRun(true);

      expect(AchievementService.getClassWins(CharacterClassId.CLERIC)).toBe(1);
      expect(AchievementService.isUnlocked('holy_warrior')).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should notify listeners on achievement unlock', () => {
      const listener = vi.fn();
      const unsubscribe = AchievementService.onAchievementUnlocked(listener);

      AchievementService.tryUnlock('first_blood');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          achievement: expect.objectContaining({ id: 'first_blood' }),
          soulEchoesAwarded: SOUL_ECHO_REWARDS[AchievementTier.BRONZE],
        })
      );

      unsubscribe();
    });

    it('should allow unsubscribing from events', () => {
      const listener = vi.fn();
      const unsubscribe = AchievementService.onAchievementUnlocked(listener);

      unsubscribe();
      AchievementService.tryUnlock('first_blood');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Total Soul Echoes Calculation', () => {
    it('should calculate total earned soul echoes', () => {
      // Unlock a bronze and silver achievement
      AchievementService.tryUnlock('first_blood'); // Bronze: 10
      AchievementService.tryUnlock('untouchable'); // Silver: 25

      const total = AchievementService.getTotalSoulEchoesFromAchievements();
      expect(total).toBe(35);
    });
  });

  describe('Reset', () => {
    it('should reset all achievements', () => {
      AchievementService.tryUnlock('first_blood');
      AchievementService.tryUnlock('overkill');

      AchievementService.resetAllAchievements();

      expect(AchievementService.getUnlockCount()).toBe(0);
      expect(AchievementService.isUnlocked('first_blood')).toBe(false);
    });
  });
});
