/**
 * SaveManager - Handles game save/load to localStorage
 */

import { CharacterClassId, PotionSlot } from '@/types';

export const SAVE_VERSION = 1;
const STORAGE_KEY = 'sanctum_ruins_save';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  animationSpeed: number;
  screenShake: boolean;
}

export interface PlayerStatistics {
  totalRuns: number;
  totalWins: number;
  totalDeaths: number;
  enemiesDefeated: number;
  cardsPlayed: number;
}

export interface MetaSaveData {
  soulEchoes: number;
  unlockedAchievements: string[];
  purchasedUpgrades: string[];
  purchasedClasses: CharacterClassId[];
  statistics: PlayerStatistics;
}

export interface RunSaveData {
  classId: CharacterClassId;
  currentAct: number;
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  startTime: number;
  // Map progression
  mapSeed: string;
  currentNodeId: string;
  visitedNodeIds: string[];
  inCombat: boolean; // True if player is mid-combat (reload should return to map)
  // Potions
  potions: PotionSlot[];
}

export interface SaveData {
  version: number;
  lastSaved: number;
  meta: MetaSaveData;
  run: RunSaveData | null;
  settings: GameSettings;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 100,
  animationSpeed: 1,
  screenShake: true,
};

const DEFAULT_STATISTICS: PlayerStatistics = {
  totalRuns: 0,
  totalWins: 0,
  totalDeaths: 0,
  enemiesDefeated: 0,
  cardsPlayed: 0,
};

function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    lastSaved: Date.now(),
    meta: {
      soulEchoes: 0,
      unlockedAchievements: [],
      purchasedUpgrades: [],
      purchasedClasses: [],
      statistics: { ...DEFAULT_STATISTICS },
    },
    run: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

class SaveManagerClass {
  private saveData: SaveData;

  constructor() {
    this.saveData = this.loadFromStorage() || createDefaultSave();
  }

  // Meta-progress
  getSoulEchoes(): number {
    return this.saveData.meta.soulEchoes;
  }

  addSoulEchoes(amount: number): void {
    this.saveData.meta.soulEchoes += amount;
    this.saveNow();
  }

  spendSoulEchoes(amount: number): boolean {
    if (this.saveData.meta.soulEchoes < amount) {
      return false;
    }
    this.saveData.meta.soulEchoes -= amount;
    this.saveNow();
    return true;
  }

  // Upgrade management
  getPurchasedUpgrades(): string[] {
    return [...this.saveData.meta.purchasedUpgrades];
  }

  hasUpgrade(upgradeId: string): boolean {
    return this.saveData.meta.purchasedUpgrades.includes(upgradeId);
  }

  purchaseUpgrade(upgradeId: string, cost: number): boolean {
    if (this.hasUpgrade(upgradeId)) {
      return false;
    }
    if (!this.spendSoulEchoes(cost)) {
      return false;
    }
    this.saveData.meta.purchasedUpgrades.push(upgradeId);
    this.saveNow();
    return true;
  }

  respecUpgrades(refundAmount: number): void {
    this.saveData.meta.purchasedUpgrades = [];
    this.saveData.meta.soulEchoes += refundAmount;
    this.saveNow();
  }

  getTotalUpgradesSpent(): number {
    // This would need to be calculated from upgrade costs
    // For now, we'll track it separately if needed
    return 0;
  }

  getStatistics(): PlayerStatistics {
    return { ...this.saveData.meta.statistics };
  }

  updateStatistics(updates: Partial<PlayerStatistics>): void {
    Object.assign(this.saveData.meta.statistics, updates);
    this.saveNow();
  }

  // Settings
  getSettings(): GameSettings {
    return { ...this.saveData.settings };
  }

  updateSettings(updates: Partial<GameSettings>): void {
    Object.assign(this.saveData.settings, updates);
    this.saveNow();
    this.applySettings();
  }

  private settingsChangeCallbacks: Array<() => void> = [];

  onSettingsChange(callback: () => void): void {
    this.settingsChangeCallbacks.push(callback);
  }

  private applySettings(): void {
    // Apply animation speed as CSS variable
    document.documentElement.style.setProperty(
      '--animation-speed',
      String(1 / this.saveData.settings.animationSpeed)
    );

    // Notify listeners
    this.settingsChangeCallbacks.forEach((cb) => cb());
  }

  // Run management
  hasActiveRun(): boolean {
    return this.saveData.run !== null;
  }

  getActiveRun(): RunSaveData | null {
    return this.saveData.run ? { ...this.saveData.run } : null;
  }

  startNewRun(classId: CharacterClassId, maxHp: number, mapSeed: string, startNodeId: string, startingPotions: PotionSlot[] = []): void {
    this.saveData.run = {
      classId,
      currentAct: 1,
      playerHp: maxHp,
      playerMaxHp: maxHp,
      gold: 0,
      startTime: Date.now(),
      mapSeed,
      currentNodeId: startNodeId,
      visitedNodeIds: [],
      inCombat: false,
      potions: startingPotions,
    };
    this.saveData.meta.statistics.totalRuns++;
    this.saveNow();
  }

  // Potion management
  addPotion(potionId: string): void {
    if (!this.saveData.run) return;
    const existing = this.saveData.run.potions.find(p => p.potionId === potionId);
    if (existing) {
      existing.count++;
    } else {
      this.saveData.run.potions.push({ potionId, count: 1 });
    }
    this.saveNow();
  }

  usePotion(potionId: string): boolean {
    if (!this.saveData.run) return false;
    const existing = this.saveData.run.potions.find(p => p.potionId === potionId);
    if (!existing || existing.count <= 0) return false;
    existing.count--;
    if (existing.count <= 0) {
      this.saveData.run.potions = this.saveData.run.potions.filter(p => p.potionId !== potionId);
    }
    this.saveNow();
    return true;
  }

  getPotions(): PotionSlot[] {
    return this.saveData.run?.potions ?? [];
  }

  setInCombat(inCombat: boolean): void {
    if (this.saveData.run) {
      this.saveData.run.inCombat = inCombat;
      this.saveNow();
    }
  }

  markNodeVisited(nodeId: string): void {
    if (this.saveData.run && !this.saveData.run.visitedNodeIds.includes(nodeId)) {
      this.saveData.run.visitedNodeIds.push(nodeId);
      this.saveNow();
    }
  }

  setCurrentNode(nodeId: string): void {
    if (this.saveData.run) {
      this.saveData.run.currentNodeId = nodeId;
      this.saveNow();
    }
  }

  updateRun(updates: Partial<RunSaveData>): void {
    if (this.saveData.run) {
      Object.assign(this.saveData.run, updates);
      this.saveNow();
    }
  }

  endRun(victory: boolean): void {
    if (this.saveData.run) {
      if (victory) {
        this.saveData.meta.statistics.totalWins++;
        // Soul Echoes already awarded per-combat via addSoulEchoes()
      } else {
        this.saveData.meta.statistics.totalDeaths++;
        // No Soul Echoes on defeat to prevent grinding
      }
      this.saveData.run = null;
      this.saveNow();
    }
  }

  abandonRun(): void {
    if (this.saveData.run) {
      this.saveData.run = null;
      this.saveNow();
    }
  }

  // Persistence
  private saveNow(): void {
    this.saveData.lastSaved = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.saveData));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }

  private loadFromStorage(): SaveData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as SaveData;

      // Version migration if needed
      if (data.version < SAVE_VERSION) {
        return this.migrate(data);
      }

      return data;
    } catch (e) {
      console.error('Failed to load save:', e);
      return null;
    }
  }

  private migrate(data: SaveData): SaveData {
    // Future migrations would go here
    // For now, just update version
    data.version = SAVE_VERSION;
    return data;
  }

  // For debugging/reset
  resetAllData(): void {
    this.saveData = createDefaultSave();
    this.saveNow();
  }

  getLastSaved(): Date {
    return new Date(this.saveData.lastSaved);
  }
}

// Singleton instance
export const SaveManager = new SaveManagerClass();
