/**
 * AchievementService - Tracks and awards achievements
 * Listens to game events and checks conditions for unlocking achievements
 */

import {
  Achievement,
  AchievementCategory,
  AchievementProgress,
  AchievementUnlockEvent,
  CombatStats,
  RunStats,
  SOUL_ECHO_REWARDS,
} from '@/types/achievements';
import { CharacterClassId } from '@/types';
import { ACHIEVEMENTS, getAchievementById } from '@/data/achievements';
import { SaveManager } from './SaveManager';

// Default combat stats for new combat
export function createDefaultCombatStats(): CombatStats {
  return {
    damageTaken: 0,
    damageDealt: 0,
    maxSingleAttackDamage: 0,
    totalBlockGained: 0,
    cardsPlayed: 0,
    turnsElapsed: 0,
    enemiesDefeated: 0,
    enemiesDefeatedThisTurn: 0,
    maxEnemiesDefeatedInSingleTurn: 0,
    victory: false,
    finalTurnDamageDealt: 0,
    // Class-specific
    maxDevotion: 0,
    fortifyTurnsAtMax: 0,
    currentFortifyStreak: 0,
    cursesInDeck: 0,
    vowBroken: false,
    whimsyTriggered: 0,
    luckDecidedOutcome: false,
  };
}

// Default run stats for new run
export function createDefaultRunStats(classId: CharacterClassId): RunStats {
  return {
    classId,
    currentAct: 1,
    deckSize: 10,
    gold: 0,
    relicsCollected: 0,
    potionsUsed: 0,
    elitesDefeated: 0,
    shrinesVisited: [],
    campfireRests: 0,
    cursesInDeck: 0,
    startTime: Date.now(),
    victory: false,
    usedAnkh: false,
    bossesDefeated: [],
    onlyStarterCards: true,
    memoryFragmentsCollected: [],
    dialogueChoices: new Map(),
    luckWins: 0,
    finalSacrificeKill: false,
    corruptionStacks: 0,
  };
}

class AchievementServiceClass {
  private unlockedAchievements: Set<string>;
  private achievementProgress: Map<string, number>;
  private listeners: ((event: AchievementUnlockEvent) => void)[] = [];

  // Current tracking
  private currentCombatStats: CombatStats | null = null;
  private currentRunStats: RunStats | null = null;

  // Persistent progress (for multi-run achievements like "win 5 times as X")
  private classWins: Map<CharacterClassId, number>;
  private totalCombatWins: number;

  constructor() {
    this.unlockedAchievements = new Set();
    this.achievementProgress = new Map();
    this.classWins = new Map();
    this.totalCombatWins = 0;
    this.loadFromStorage();
  }

  // ============================================
  // Persistence
  // ============================================

  private loadFromStorage(): void {
    try {
      // Load unlocked achievements from SaveManager
      const unlockedIds = this.getUnlockedAchievementIds();
      this.unlockedAchievements = new Set(unlockedIds);

      // Load progress data
      const progressData = localStorage.getItem('achievement_progress');
      if (progressData) {
        const parsed = JSON.parse(progressData);
        this.achievementProgress = new Map(Object.entries(parsed.progress || {}) as [string, number][]);
        this.classWins = new Map(Object.entries(parsed.classWins || {}) as [CharacterClassId, number][]);
        this.totalCombatWins = parsed.totalCombatWins || 0;
      }
    } catch (e) {
      console.error('Failed to load achievement data:', e);
    }
  }

  private saveToStorage(): void {
    try {
      // Save progress data
      const progressData = {
        progress: Object.fromEntries(this.achievementProgress),
        classWins: Object.fromEntries(this.classWins),
        totalCombatWins: this.totalCombatWins,
      };
      localStorage.setItem('achievement_progress', JSON.stringify(progressData));
    } catch (e) {
      console.error('Failed to save achievement data:', e);
    }
  }

  private getUnlockedAchievementIds(): string[] {
    // Access SaveManager's internal data
    const saveData = localStorage.getItem('sanctum_ruins_save');
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData);
        return parsed.meta?.unlockedAchievements || [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private persistUnlockedAchievement(achievementId: string): void {
    // Update SaveManager's achievement list
    const saveData = localStorage.getItem('sanctum_ruins_save');
    try {
      const parsed = saveData ? JSON.parse(saveData) : { meta: {} };
      if (!parsed.meta) {
        parsed.meta = {};
      }
      if (!parsed.meta.unlockedAchievements) {
        parsed.meta.unlockedAchievements = [];
      }
      if (!parsed.meta.unlockedAchievements.includes(achievementId)) {
        parsed.meta.unlockedAchievements.push(achievementId);
        localStorage.setItem('sanctum_ruins_save', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Failed to persist achievement:', e);
    }
  }

  // ============================================
  // Event Listeners
  // ============================================

  onAchievementUnlocked(callback: (event: AchievementUnlockEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(achievement: Achievement): void {
    const event: AchievementUnlockEvent = {
      achievement,
      soulEchoesAwarded: SOUL_ECHO_REWARDS[achievement.tier],
      timestamp: Date.now(),
    };
    this.listeners.forEach((listener) => listener(event));
  }

  // ============================================
  // Combat Tracking
  // ============================================

  startCombat(cursesInDeck: number = 0): void {
    this.currentCombatStats = createDefaultCombatStats();
    this.currentCombatStats.cursesInDeck = cursesInDeck;
  }

  endCombat(victory: boolean): void {
    if (!this.currentCombatStats) return;

    this.currentCombatStats.victory = victory;

    if (victory) {
      this.totalCombatWins++;
      this.checkCombatAchievements(this.currentCombatStats);
    }

    this.saveToStorage();
    this.currentCombatStats = null;
  }

  // Combat stat updates
  recordDamageTaken(amount: number): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.damageTaken += amount;
  }

  recordDamageDealt(amount: number, isSingleAttack: boolean = false): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.damageDealt += amount;
    this.currentCombatStats.finalTurnDamageDealt += amount;
    if (isSingleAttack) {
      this.currentCombatStats.maxSingleAttackDamage = Math.max(
        this.currentCombatStats.maxSingleAttackDamage,
        amount
      );
    }
  }

  recordBlockGained(amount: number): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.totalBlockGained += amount;
  }

  recordCardPlayed(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.cardsPlayed++;
  }

  recordEnemyDefeated(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.enemiesDefeated++;
    this.currentCombatStats.enemiesDefeatedThisTurn++;
    this.currentCombatStats.maxEnemiesDefeatedInSingleTurn = Math.max(
      this.currentCombatStats.maxEnemiesDefeatedInSingleTurn,
      this.currentCombatStats.enemiesDefeatedThisTurn
    );
  }

  recordTurnEnd(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.turnsElapsed++;
    this.currentCombatStats.enemiesDefeatedThisTurn = 0;
    this.currentCombatStats.finalTurnDamageDealt = 0;
  }

  recordDevotionGained(newTotal: number): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.maxDevotion = Math.max(
      this.currentCombatStats.maxDevotion,
      newTotal
    );
  }

  recordFortifyStatus(amount: number): void {
    if (!this.currentCombatStats) return;
    if (amount >= 15) {
      this.currentCombatStats.currentFortifyStreak++;
      this.currentCombatStats.fortifyTurnsAtMax = Math.max(
        this.currentCombatStats.fortifyTurnsAtMax,
        this.currentCombatStats.currentFortifyStreak
      );
    } else {
      this.currentCombatStats.currentFortifyStreak = 0;
    }
  }

  recordVowBroken(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.vowBroken = true;
  }

  recordWhimsyTriggered(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.whimsyTriggered++;
  }

  recordLuckDecidedOutcome(): void {
    if (!this.currentCombatStats) return;
    this.currentCombatStats.luckDecidedOutcome = true;
  }

  // ============================================
  // Run Tracking
  // ============================================

  startRun(classId: CharacterClassId): void {
    this.currentRunStats = createDefaultRunStats(classId);
  }

  endRun(victory: boolean): void {
    if (!this.currentRunStats) return;

    this.currentRunStats.victory = victory;
    this.currentRunStats.endTime = Date.now();

    // Check "complete run" achievement on first run
    this.tryUnlock('dungeon_delver');

    if (victory) {
      const classId = this.currentRunStats.classId;
      const currentWins = this.classWins.get(classId) || 0;
      this.classWins.set(classId, currentWins + 1);

      this.checkRunAchievements(this.currentRunStats);
      this.checkClassAchievements(this.currentRunStats);
    }

    this.saveToStorage();
    this.currentRunStats = null;
  }

  // Run stat updates
  recordActComplete(act: number): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.currentAct = act + 1;

    if (act === 1) this.tryUnlock('survivor');
    if (act === 2) this.tryUnlock('deep_diver');
  }

  recordBossDefeated(bossId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.bossesDefeated.push(bossId);

    if (bossId === 'hollow_god') {
      this.tryUnlock('sanctum_breaker');
    }
  }

  recordEliteDefeated(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.elitesDefeated++;
  }

  recordShrineVisited(shrineId: string): void {
    if (!this.currentRunStats) return;
    if (!this.currentRunStats.shrinesVisited.includes(shrineId)) {
      this.currentRunStats.shrinesVisited.push(shrineId);
    }
  }

  recordCampfireRest(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.campfireRests++;
  }

  recordPotionUsed(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.potionsUsed++;
  }

  recordRelicCollected(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.relicsCollected++;
  }

  recordCardAdded(isStarterCard: boolean): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.deckSize++;
    if (!isStarterCard) {
      this.currentRunStats.onlyStarterCards = false;
    }
  }

  recordGoldChange(newTotal: number): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.gold = newTotal;
  }

  recordAnkhUsed(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.usedAnkh = true;
  }

  recordWardenChoice(choice: 'warden' | 'leave'): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.wardenChoice = choice;
  }

  recordDialogueChoice(choiceId: string): void {
    if (!this.currentRunStats) return;
    const count = this.currentRunStats.dialogueChoices.get(choiceId) || 0;
    this.currentRunStats.dialogueChoices.set(choiceId, count + 1);
  }

  recordMemoryFragment(fragmentId: string): void {
    if (!this.currentRunStats) return;
    if (!this.currentRunStats.memoryFragmentsCollected.includes(fragmentId)) {
      this.currentRunStats.memoryFragmentsCollected.push(fragmentId);
    }
  }

  recordFinalSacrificeKill(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.finalSacrificeKill = true;
    this.tryUnlock('sacrifice');
  }

  recordCorruptionStacks(stacks: number): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.corruptionStacks = stacks;
  }

  recordLuckWin(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.luckWins++;
  }

  // ============================================
  // Achievement Checking
  // ============================================

  private checkCombatAchievements(stats: CombatStats): void {
    // First Blood
    if (this.totalCombatWins === 1) {
      this.tryUnlock('first_blood');
    }

    // Untouchable
    if (stats.damageTaken === 0 && stats.victory) {
      this.tryUnlock('untouchable');
    }

    // Overkill
    if (stats.maxSingleAttackDamage >= 50) {
      this.tryUnlock('overkill');
    }

    // Massacre
    if (stats.maxEnemiesDefeatedInSingleTurn >= 3) {
      this.tryUnlock('massacre');
    }

    // Perfect Defense
    if (stats.totalBlockGained >= 100) {
      this.tryUnlock('perfect_defense');
    }

    // Glass Cannon
    // Note: This needs to be checked at combat end with player HP = 1
    // The actual check happens in the game code that calls a specific method

    // Speedrunner
    if (stats.turnsElapsed <= 3 && stats.victory) {
      this.tryUnlock('speedrunner');
    }

    // No Cards Needed
    if (stats.cardsPlayed <= 5 && stats.victory) {
      this.tryUnlock('no_cards_needed');
    }

    // Pacifist Turn
    if (stats.finalTurnDamageDealt === 0 && stats.victory) {
      this.tryUnlock('pacifist_turn');
    }

    // Class-specific combat achievements
    if (stats.maxDevotion >= 20) {
      this.tryUnlock('devoted');
    }

    if (stats.fortifyTurnsAtMax >= 5) {
      this.tryUnlock('unbreakable_wall');
    }

    if (stats.cursesInDeck >= 10 && stats.victory) {
      this.tryUnlock('contract_fulfilled');
    }

    if (!stats.vowBroken && stats.victory) {
      // Only if Oathsworn class
      if (this.currentRunStats?.classId === CharacterClassId.OATHSWORN) {
        this.tryUnlock('oath_keeper');
      }
    }

    if (stats.whimsyTriggered >= 10) {
      this.tryUnlock('chaos_master');
    }

    if (stats.luckDecidedOutcome && stats.victory) {
      this.recordLuckWin();
    }
  }

  private checkRunAchievements(stats: RunStats): void {
    // Minimalist
    if (stats.deckSize <= 15) {
      this.tryUnlock('minimalist');
    }

    // Hoarder
    if (stats.deckSize >= 40) {
      this.tryUnlock('hoarder');
    }

    // Wealthy
    if (stats.gold >= 500) {
      this.tryUnlock('wealthy');
    }

    // Relic Hunter
    if (stats.relicsCollected >= 10) {
      this.tryUnlock('relic_hunter');
    }

    // Potion Master
    if (stats.potionsUsed >= 10) {
      this.tryUnlock('potion_master');
    }

    // Elite Slayer
    if (stats.elitesDefeated >= 5) {
      this.tryUnlock('elite_slayer');
    }

    // Boss Rush (no campfire rest)
    if (stats.campfireRests === 0 && stats.bossesDefeated.length >= 3) {
      this.tryUnlock('boss_rush');
    }

    // Speedrun (under 20 minutes)
    const runDuration = (stats.endTime! - stats.startTime) / 60000;
    if (runDuration <= 20 && stats.victory) {
      this.tryUnlock('speedrun');
    }

    // Cursed Victor
    if (stats.cursesInDeck >= 5 && stats.victory) {
      this.tryUnlock('cursed_victor');
    }

    // Perfect Run
    if (!stats.usedAnkh && stats.victory) {
      this.tryUnlock('perfect_run');
    }

    // One With Nothing
    if (stats.onlyStarterCards && stats.victory) {
      this.tryUnlock('one_with_nothing');
    }

    // Final Sacrifice
    if (stats.finalSacrificeKill) {
      this.tryUnlock('sacrifice');
    }

    // Hollow Victory (with corruption)
    if (stats.corruptionStacks >= 10 && stats.bossesDefeated.includes('hollow_god')) {
      this.tryUnlock('hollow_victory');
    }

    // Luck achievements
    if (stats.luckWins >= 5) {
      this.tryUnlock('gambler');
    }
  }

  private checkClassAchievements(stats: RunStats): void {
    const classId = stats.classId;
    const wins = this.classWins.get(classId) || 0;

    // First win achievements
    const firstWinMap: Partial<Record<CharacterClassId, string>> = {
      [CharacterClassId.CLERIC]: 'holy_warrior',
      [CharacterClassId.DUNGEON_KNIGHT]: 'shield_bearer',
      [CharacterClassId.DIABOLIST]: 'soul_trader',
      [CharacterClassId.OATHSWORN]: 'vow_fulfilled',
      [CharacterClassId.FEY_TOUCHED]: 'touched_by_chaos',
    };

    const firstWinId = firstWinMap[classId];
    if (firstWinId && wins >= 1) {
      this.tryUnlock(firstWinId);
    }

    // Five wins achievements
    const fiveWinsMap: Partial<Record<CharacterClassId, string>> = {
      [CharacterClassId.CLERIC]: 'divine_ascension',
      [CharacterClassId.DUNGEON_KNIGHT]: 'immovable_object',
      [CharacterClassId.DIABOLIST]: 'lord_of_contracts',
      [CharacterClassId.OATHSWORN]: 'eternal_oath',
      [CharacterClassId.FEY_TOUCHED]: 'chaos_incarnate',
    };

    const fiveWinsId = fiveWinsMap[classId];
    if (fiveWinsId && wins >= 5) {
      this.tryUnlock(fiveWinsId);
    }

    // Check Warden's Chosen (all 5 classes as Warden)
    if (stats.wardenChoice === 'warden') {
      this.checkWardenAllClasses();
    }
  }

  private checkWardenAllClasses(): void {
    // TODO: Track warden choices per class in persistent storage
    // For now, this is a placeholder that checks if all 5 base classes have won
    const requiredClasses: CharacterClassId[] = [
      CharacterClassId.CLERIC,
      CharacterClassId.DUNGEON_KNIGHT,
      CharacterClassId.DIABOLIST,
      CharacterClassId.OATHSWORN,
      CharacterClassId.FEY_TOUCHED,
    ];

    const allClassesWon = requiredClasses.every(
      (classId) => (this.classWins.get(classId) || 0) > 0
    );

    if (allClassesWon) {
      this.tryUnlock('wardens_chosen');
    }
  }

  // ============================================
  // Achievement Unlocking
  // ============================================

  tryUnlock(achievementId: string): boolean {
    if (this.unlockedAchievements.has(achievementId)) {
      return false; // Already unlocked
    }

    const achievement = getAchievementById(achievementId);
    if (!achievement) {
      console.warn(`Achievement not found: ${achievementId}`);
      return false;
    }

    // Unlock the achievement
    this.unlockedAchievements.add(achievementId);
    this.persistUnlockedAchievement(achievementId);

    // Award Soul Echoes
    const reward = SOUL_ECHO_REWARDS[achievement.tier];
    SaveManager.addSoulEchoes(reward);

    // Notify listeners (for UI notification)
    this.notifyListeners(achievement);

    console.log(`Achievement unlocked: ${achievement.name} (+${reward} Soul Echoes)`);
    return true;
  }

  // Special check for win with 1 HP (called from game code)
  checkGlassCannonAtWin(playerHp: number): void {
    if (playerHp === 1) {
      this.tryUnlock('glass_cannon');
    }
  }

  // Special check for win with empty draw pile
  checkEmptyDrawPileWin(drawPileSize: number): void {
    if (drawPileSize === 0) {
      this.tryUnlock('against_all_odds');
    }
  }

  // ============================================
  // Query Methods
  // ============================================

  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter((a) => this.unlockedAchievements.has(a.id));
  }

  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter((a) => !this.unlockedAchievements.has(a.id));
  }

  getAllAchievements(): Achievement[] {
    return [...ACHIEVEMENTS];
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return ACHIEVEMENTS.filter((a) => a.category === category);
  }

  getProgress(achievementId: string): AchievementProgress | null {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return null;

    const current = this.achievementProgress.get(achievementId) || 0;
    let target = 1;

    // Determine target based on condition
    const condition = achievement.condition;
    if ('count' in condition) {
      target = condition.count;
    } else if ('amount' in condition) {
      target = condition.amount;
    }

    return {
      achievementId,
      current,
      target,
      unlocked: this.isUnlocked(achievementId),
      unlockedAt: undefined, // TODO: Track unlock timestamps
    };
  }

  getUnlockCount(): number {
    return this.unlockedAchievements.size;
  }

  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  getTotalSoulEchoesFromAchievements(): number {
    let total = 0;
    for (const achievementId of this.unlockedAchievements) {
      const achievement = getAchievementById(achievementId);
      if (achievement) {
        total += SOUL_ECHO_REWARDS[achievement.tier];
      }
    }
    return total;
  }

  getClassWins(classId: CharacterClassId): number {
    return this.classWins.get(classId) || 0;
  }

  // For debugging
  resetAllAchievements(): void {
    this.unlockedAchievements.clear();
    this.achievementProgress.clear();
    this.classWins.clear();
    this.totalCombatWins = 0;

    // Clear from SaveManager
    const saveData = localStorage.getItem('sanctum_ruins_save');
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData);
        parsed.meta.unlockedAchievements = [];
        localStorage.setItem('sanctum_ruins_save', JSON.stringify(parsed));
      } catch (e) {
        console.error('Failed to reset achievements:', e);
      }
    }

    localStorage.removeItem('achievement_progress');
    this.saveToStorage();
  }
}

// Singleton instance
export const AchievementService = new AchievementServiceClass();
