/**
 * Tests for CardUnlockService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CardUnlockService,
  getCardUnlockService,
  resetCardUnlockService,
} from './CardUnlockService';
import { CharacterClassId } from '@/types/index';
import { UnlockProgress } from '@/types/unlocks';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('CardUnlockService', () => {
  let service: CardUnlockService;

  beforeEach(() => {
    localStorageMock.clear();
    resetCardUnlockService();
    service = new CardUnlockService();
  });

  describe('initialization', () => {
    it('should create a service with initial state', () => {
      const progress = service.getProgress();
      expect(progress.unlockedCards).toEqual([]);
      expect(progress.seenEvents).toEqual([]);
      expect(progress.defeatedBosses).toEqual({});
      expect(progress.achievementsEarned).toEqual([]);
      expect(progress.milestonesReached).toEqual([]);
      expect(progress.discoveries).toEqual([]);
    });

    it('should load saved progress from localStorage', () => {
      const savedProgress: UnlockProgress = {
        unlockedCards: ['echo_strike'],
        seenEvents: ['whispering_walls:listen_closely:good'],
        defeatedBosses: { bonelord: [CharacterClassId.DUNGEON_KNIGHT] },
        achievementsEarned: ['empty_hand_victory'],
        milestonesReached: ['first_act_3'],
        discoveries: [],
      };

      localStorageMock.setItem(
        'sanctum_unlock_progress',
        JSON.stringify(savedProgress)
      );

      const newService = new CardUnlockService();
      const progress = newService.getProgress();

      expect(progress.unlockedCards).toContain('echo_strike');
      expect(progress.defeatedBosses.bonelord).toContain(
        CharacterClassId.DUNGEON_KNIGHT
      );
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);
      service.recordAchievement('empty_hand_victory');

      service.resetProgress();

      const progress = service.getProgress();
      expect(progress.unlockedCards).toEqual([]);
      expect(progress.defeatedBosses).toEqual({});
      expect(progress.achievementsEarned).toEqual([]);
    });
  });

  describe('recordBossDefeat', () => {
    it('should record a boss defeat for a class', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      const progress = service.getProgress();
      expect(progress.defeatedBosses.bonelord).toContain(
        CharacterClassId.DUNGEON_KNIGHT
      );
    });

    it('should allow multiple classes to defeat the same boss', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);
      service.recordBossDefeat('bonelord', CharacterClassId.CLERIC);

      const progress = service.getProgress();
      expect(progress.defeatedBosses.bonelord).toContain(
        CharacterClassId.DUNGEON_KNIGHT
      );
      expect(progress.defeatedBosses.bonelord).toContain(CharacterClassId.CLERIC);
    });

    it('should not duplicate class entries for same boss', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      const progress = service.getProgress();
      expect(progress.defeatedBosses.bonelord).toHaveLength(1);
    });

    it('should return any newly unlocked cards', () => {
      // This will unlock 'shatter_bones' which requires defeating bonelord
      const unlocks = service.recordBossDefeat(
        'bonelord',
        CharacterClassId.DUNGEON_KNIGHT
      );

      // Should unlock the generic boss defeat card
      const hasShatterBones = unlocks.some((u) => u.cardId === 'shatter_bones');
      expect(hasShatterBones).toBe(true);
    });
  });

  describe('recordEventChoice', () => {
    it('should record an event choice', () => {
      service.recordEventChoice('whispering_walls', 'listen_closely', 'good');

      const progress = service.getProgress();
      expect(progress.seenEvents).toContain('whispering_walls');
      expect(progress.seenEvents).toContain('whispering_walls:listen_closely');
      expect(progress.seenEvents).toContain(
        'whispering_walls:listen_closely:good'
      );
    });

    it('should work with partial keys', () => {
      service.recordEventChoice('merchant_ghost', 'trade_memory');

      const progress = service.getProgress();
      expect(progress.seenEvents).toContain('merchant_ghost');
      expect(progress.seenEvents).toContain('merchant_ghost:trade_memory');
    });
  });

  describe('recordAchievement', () => {
    it('should record an achievement', () => {
      service.recordAchievement('empty_hand_victory');

      const progress = service.getProgress();
      expect(progress.achievementsEarned).toContain('empty_hand_victory');
    });

    it('should not duplicate achievements', () => {
      service.recordAchievement('empty_hand_victory');
      service.recordAchievement('empty_hand_victory');

      const progress = service.getProgress();
      expect(
        progress.achievementsEarned.filter((a) => a === 'empty_hand_victory')
      ).toHaveLength(1);
    });
  });

  describe('recordMilestone', () => {
    it('should record a milestone', () => {
      service.recordMilestone('first_act_3');

      const progress = service.getProgress();
      expect(progress.milestonesReached).toContain('first_act_3');
    });
  });

  describe('recordDiscovery', () => {
    it('should record a discovery', () => {
      service.recordDiscovery('find_abandoned_altar');

      const progress = service.getProgress();
      expect(progress.discoveries).toContain('find_abandoned_altar');
    });
  });

  describe('isCardUnlocked', () => {
    it('should return true for cards not in unlock list (base cards)', () => {
      // A card that doesn't exist in UNLOCKABLE_CARDS is always available
      expect(service.isCardUnlocked('strike')).toBe(true);
      expect(service.isCardUnlocked('defend')).toBe(true);
    });

    it('should return false for locked cards', () => {
      // shatter_bones requires defeating bonelord
      expect(service.isCardUnlocked('shatter_bones')).toBe(false);
    });

    it('should return true after requirements are met', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);
      expect(service.isCardUnlocked('shatter_bones')).toBe(true);
    });
  });

  describe('getUnlockStatus', () => {
    it('should return unlock status for a card', () => {
      const status = service.getUnlockStatus('shatter_bones');

      expect(status.isUnlocked).toBe(false);
      expect(status.hintText).toBe('Defeat the Bonelord');
    });

    it('should show progress for partially completed requirements', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.CLERIC);

      const status = service.getUnlockStatus('shatter_bones');
      expect(status.isUnlocked).toBe(true); // Just needs boss defeat, any class
    });
  });

  describe('getUnlockedCardsForClass', () => {
    it('should return unlocked cards for a specific class', () => {
      // Defeat bonelord as knight - should unlock class-specific card
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      const knightCards = service.getUnlockedCardsForClass(
        CharacterClassId.DUNGEON_KNIGHT
      );
      expect(knightCards).toContain('shatter_bones'); // Universal
      expect(knightCards).toContain('lord_vexals_folly'); // Knight-specific
    });

    it('should not return other class specific cards', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      const clericCards = service.getUnlockedCardsForClass(CharacterClassId.CLERIC);
      // Should have shatter_bones (universal) but not lord_vexals_folly (knight)
      expect(clericCards).toContain('shatter_bones');
      expect(clericCards).not.toContain('lord_vexals_folly');
    });
  });

  describe('event listeners', () => {
    it('should notify listeners when cards are unlocked', () => {
      const listener = vi.fn();
      service.subscribe(listener);

      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      expect(listener).toHaveBeenCalled();
      const unlocks = listener.mock.calls[0][0];
      expect(unlocks.some((u: { cardId: string }) => u.cardId === 'shatter_bones')).toBe(
        true
      );
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);

      unsubscribe();
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not notify listeners if no new unlocks', () => {
      // First unlock the card
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      const listener = vi.fn();
      service.subscribe(listener);

      // Record same defeat again - no new unlocks
      service.recordBossDefeat('bonelord', CharacterClassId.CLERIC);

      // Listener should not be called since shatter_bones is already unlocked
      // and no new cards were unlocked
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getCardUnlockService();
      const instance2 = getCardUnlockService();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getCardUnlockService();
      instance1.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      resetCardUnlockService();
      const instance2 = getCardUnlockService();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('persistence', () => {
    it('should save progress to localStorage', () => {
      service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sanctum_unlock_progress',
        expect.any(String)
      );

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1] as string
      );
      expect(savedData.defeatedBosses.bonelord).toContain(
        CharacterClassId.DUNGEON_KNIGHT
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => {
        service.recordBossDefeat('bonelord', CharacterClassId.DUNGEON_KNIGHT);
      }).not.toThrow();
    });
  });

  describe('loadExternalProgress', () => {
    it('should load progress from external source', () => {
      const externalProgress: UnlockProgress = {
        unlockedCards: ['echo_strike', 'shatter_bones'],
        seenEvents: ['whispering_walls:listen_closely:good'],
        defeatedBosses: {
          bonelord: [CharacterClassId.DUNGEON_KNIGHT, CharacterClassId.CLERIC],
        },
        achievementsEarned: ['empty_hand_victory'],
        milestonesReached: ['first_act_3'],
        discoveries: ['find_abandoned_altar'],
      };

      service.loadExternalProgress(externalProgress);

      const progress = service.getProgress();
      expect(progress.unlockedCards).toContain('echo_strike');
      expect(progress.unlockedCards).toContain('shatter_bones');
      expect(progress.defeatedBosses.bonelord).toHaveLength(2);
    });

    it('should merge with default values for missing fields', () => {
      const partialProgress = {
        unlockedCards: ['echo_strike'],
        seenEvents: [],
        defeatedBosses: {},
        achievementsEarned: [],
        milestonesReached: [],
        discoveries: [],
      };

      service.loadExternalProgress(partialProgress as UnlockProgress);

      const progress = service.getProgress();
      expect(progress.unlockedCards).toContain('echo_strike');
      expect(progress.discoveries).toEqual([]);
    });
  });
});
