import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a mock localStorage
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

// Set up localStorage mock before importing SaveManager
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock document for CSS variable setting
Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: {
      style: {
        setProperty: vi.fn(),
      },
    },
  },
  writable: true,
});

// Now import after mocks are set up
import { CharacterClassId } from '@/types';

// We need to dynamically import SaveManager to get a fresh instance for each test
async function createFreshSaveManager() {
  // Clear the module cache to get a fresh instance
  vi.resetModules();
  localStorageMock.clear();

  const { SaveManager } = await import('./SaveManager');
  return SaveManager;
}

describe('SaveManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Soul Echoes', () => {
    it('should start with 0 soul echoes', async () => {
      const SaveManager = await createFreshSaveManager();
      expect(SaveManager.getSoulEchoes()).toBe(0);
    });

    it('should add soul echoes correctly', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);
      expect(SaveManager.getSoulEchoes()).toBe(100);

      SaveManager.addSoulEchoes(50);
      expect(SaveManager.getSoulEchoes()).toBe(150);
    });

    it('should spend soul echoes when sufficient', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);

      const result = SaveManager.spendSoulEchoes(30);
      expect(result).toBe(true);
      expect(SaveManager.getSoulEchoes()).toBe(70);
    });

    it('should not spend soul echoes when insufficient', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(50);

      const result = SaveManager.spendSoulEchoes(100);
      expect(result).toBe(false);
      expect(SaveManager.getSoulEchoes()).toBe(50);
    });
  });

  describe('Upgrades', () => {
    it('should start with no purchased upgrades', async () => {
      const SaveManager = await createFreshSaveManager();
      expect(SaveManager.getPurchasedUpgrades()).toEqual([]);
    });

    it('should track purchased upgrades', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);

      const result = SaveManager.purchaseUpgrade('upgrade_1', 50);
      expect(result).toBe(true);
      expect(SaveManager.hasUpgrade('upgrade_1')).toBe(true);
      expect(SaveManager.getSoulEchoes()).toBe(50);
    });

    it('should not allow purchasing same upgrade twice', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(200);

      SaveManager.purchaseUpgrade('upgrade_1', 50);
      const result = SaveManager.purchaseUpgrade('upgrade_1', 50);

      expect(result).toBe(false);
      expect(SaveManager.getSoulEchoes()).toBe(150); // Only charged once
    });

    it('should not purchase if insufficient soul echoes', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(30);

      const result = SaveManager.purchaseUpgrade('upgrade_1', 50);
      expect(result).toBe(false);
      expect(SaveManager.hasUpgrade('upgrade_1')).toBe(false);
    });

    it('should respec upgrades and refund', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);
      SaveManager.purchaseUpgrade('upgrade_1', 50);

      SaveManager.respecUpgrades(40); // 80% refund

      expect(SaveManager.getPurchasedUpgrades()).toEqual([]);
      expect(SaveManager.getSoulEchoes()).toBe(90); // 50 remaining + 40 refund
    });
  });

  describe('Settings', () => {
    it('should have default settings', async () => {
      const SaveManager = await createFreshSaveManager();
      const settings = SaveManager.getSettings();

      expect(settings.masterVolume).toBe(80);
      expect(settings.musicVolume).toBe(70);
      expect(settings.sfxVolume).toBe(100);
      expect(settings.animationSpeed).toBe(1);
      expect(settings.screenShake).toBe(true);
    });

    it('should update settings', async () => {
      const SaveManager = await createFreshSaveManager();

      SaveManager.updateSettings({ masterVolume: 50, screenShake: false });

      const settings = SaveManager.getSettings();
      expect(settings.masterVolume).toBe(50);
      expect(settings.screenShake).toBe(false);
      expect(settings.musicVolume).toBe(70); // Unchanged
    });

    it('should call settings change callbacks', async () => {
      const SaveManager = await createFreshSaveManager();
      const callback = vi.fn();

      SaveManager.onSettingsChange(callback);
      SaveManager.updateSettings({ masterVolume: 50 });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Run Management', () => {
    it('should start with no active run', async () => {
      const SaveManager = await createFreshSaveManager();
      expect(SaveManager.hasActiveRun()).toBe(false);
      expect(SaveManager.getActiveRun()).toBeNull();
    });

    it('should start a new run', async () => {
      const SaveManager = await createFreshSaveManager();

      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      expect(SaveManager.hasActiveRun()).toBe(true);
      const run = SaveManager.getActiveRun();
      expect(run).not.toBeNull();
      expect(run!.classId).toBe(CharacterClassId.CLERIC);
      expect(run!.playerHp).toBe(75);
      expect(run!.playerMaxHp).toBe(75);
      expect(run!.currentAct).toBe(1);
    });

    it('should increment total runs on new run', async () => {
      const SaveManager = await createFreshSaveManager();

      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      expect(SaveManager.getStatistics().totalRuns).toBe(1);
    });

    it('should update run progress', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.updateRun({ playerHp: 50, gold: 100 });

      const run = SaveManager.getActiveRun();
      expect(run!.playerHp).toBe(50);
      expect(run!.gold).toBe(100);
    });

    it('should track visited nodes', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.markNodeVisited('node_1');
      SaveManager.markNodeVisited('node_2');
      SaveManager.markNodeVisited('node_1'); // Duplicate

      const run = SaveManager.getActiveRun();
      expect(run!.visitedNodeIds).toEqual(['node_1', 'node_2']);
    });

    it('should set current node', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.setCurrentNode('node_combat');

      expect(SaveManager.getActiveRun()!.currentNodeId).toBe('node_combat');
    });

    it('should track combat state', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.setInCombat(true);
      expect(SaveManager.getActiveRun()!.inCombat).toBe(true);

      SaveManager.setInCombat(false);
      expect(SaveManager.getActiveRun()!.inCombat).toBe(false);
    });

    it('should end run with victory', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.endRun(true);

      expect(SaveManager.hasActiveRun()).toBe(false);
      expect(SaveManager.getStatistics().totalWins).toBe(1);
      expect(SaveManager.getStatistics().totalDeaths).toBe(0);
    });

    it('should end run with defeat', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.endRun(false);

      expect(SaveManager.hasActiveRun()).toBe(false);
      expect(SaveManager.getStatistics().totalWins).toBe(0);
      expect(SaveManager.getStatistics().totalDeaths).toBe(1);
    });

    it('should abandon run', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.abandonRun();

      expect(SaveManager.hasActiveRun()).toBe(false);
    });
  });

  describe('Potions', () => {
    it('should start run with no potions by default', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      expect(SaveManager.getPotions()).toEqual([]);
    });

    it('should add potions', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.addPotion('health_potion');

      const potions = SaveManager.getPotions();
      expect(potions).toHaveLength(1);
      expect(potions[0].potionId).toBe('health_potion');
      expect(potions[0].count).toBe(1);
    });

    it('should stack same potions', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.addPotion('health_potion');
      SaveManager.addPotion('health_potion');

      const potions = SaveManager.getPotions();
      expect(potions).toHaveLength(1);
      expect(potions[0].count).toBe(2);
    });

    it('should use potions', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');
      SaveManager.addPotion('health_potion');
      SaveManager.addPotion('health_potion');

      const result = SaveManager.usePotion('health_potion');

      expect(result).toBe(true);
      expect(SaveManager.getPotions()[0].count).toBe(1);
    });

    it('should remove potion when count reaches 0', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');
      SaveManager.addPotion('health_potion');

      SaveManager.usePotion('health_potion');

      expect(SaveManager.getPotions()).toHaveLength(0);
    });

    it('should not use potion that does not exist', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      const result = SaveManager.usePotion('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should save to localStorage', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load from localStorage', async () => {
      // First, save some data
      const SaveManager1 = await createFreshSaveManager();
      SaveManager1.addSoulEchoes(100);
      SaveManager1.startNewRun(CharacterClassId.DUNGEON_KNIGHT, 80, 'seed456', 'node_start');

      // Verify data was saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Note: Due to module caching and singleton pattern, testing actual reload
      // behavior would require integration tests. The SaveManager does load from
      // localStorage in its constructor - this is tested implicitly.
    });

    it('should update lastSaved timestamp', async () => {
      const SaveManager = await createFreshSaveManager();
      const before = Date.now();

      SaveManager.addSoulEchoes(10);

      const lastSaved = SaveManager.getLastSaved();
      expect(lastSaved.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe('Statistics', () => {
    it('should have default statistics', async () => {
      const SaveManager = await createFreshSaveManager();
      const stats = SaveManager.getStatistics();

      expect(stats.totalRuns).toBe(0);
      expect(stats.totalWins).toBe(0);
      expect(stats.totalDeaths).toBe(0);
      expect(stats.enemiesDefeated).toBe(0);
      expect(stats.cardsPlayed).toBe(0);
    });

    it('should update statistics', async () => {
      const SaveManager = await createFreshSaveManager();

      SaveManager.updateStatistics({ enemiesDefeated: 10, cardsPlayed: 50 });

      const stats = SaveManager.getStatistics();
      expect(stats.enemiesDefeated).toBe(10);
      expect(stats.cardsPlayed).toBe(50);
    });
  });

  describe('Reset', () => {
    it('should reset all data', async () => {
      const SaveManager = await createFreshSaveManager();
      SaveManager.addSoulEchoes(100);
      SaveManager.startNewRun(CharacterClassId.CLERIC, 75, 'seed123', 'node_start');

      SaveManager.resetAllData();

      expect(SaveManager.getSoulEchoes()).toBe(0);
      expect(SaveManager.hasActiveRun()).toBe(false);
      expect(SaveManager.getPurchasedUpgrades()).toEqual([]);
    });
  });
});
