/**
 * CardUnlockService
 *
 * Manages card unlock progression across runs.
 * Tracks boss defeats, event choices, achievements, and milestones
 * to unlock new cards that get added to class reward pools.
 */

import {
  UnlockProgress,
  CardUnlock,
  CardUnlockResult,
  UnlockStatusResult,
  UnlockTrigger,
  createInitialUnlockProgress,
} from '@/types/unlocks';
import { CharacterClassId } from '@/types/index';
import { UNLOCKABLE_CARDS } from '@/data/unlockableCards';

const STORAGE_KEY = 'sanctum_unlock_progress';

export class CardUnlockService {
  private progress: UnlockProgress;
  private listeners: Array<(unlocks: CardUnlockResult[]) => void> = [];

  constructor() {
    this.progress = this.loadProgress();
  }

  // ===========================================================================
  // PERSISTENCE
  // ===========================================================================

  /**
   * Load progress from localStorage
   */
  private loadProgress(): UnlockProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        return {
          ...createInitialUnlockProgress(),
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Failed to load unlock progress:', e);
    }
    return createInitialUnlockProgress();
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Failed to save unlock progress:', e);
    }
  }

  /**
   * Get current progress (for saving/display)
   */
  getProgress(): UnlockProgress {
    return { ...this.progress };
  }

  /**
   * Load progress from external source (e.g., cloud save)
   */
  loadExternalProgress(progress: UnlockProgress): void {
    this.progress = {
      ...createInitialUnlockProgress(),
      ...progress,
    };
    this.saveProgress();
  }

  /**
   * Reset all unlock progress (for testing/debug)
   */
  resetProgress(): void {
    this.progress = createInitialUnlockProgress();
    this.saveProgress();
  }

  // ===========================================================================
  // TRIGGER CHECKING
  // ===========================================================================

  /**
   * Check if a specific trigger is satisfied
   */
  private isTriggerSatisfied(trigger: UnlockTrigger): boolean {
    switch (trigger.type) {
      case 'BOSS_DEFEAT':
        // Any class has defeated this boss
        return !!this.progress.defeatedBosses[trigger.bossId!];

      case 'CLASS_BOSS_DEFEAT':
        // Specific class has defeated this boss
        const classes = this.progress.defeatedBosses[trigger.bossId!] || [];
        return classes.includes(trigger.requiredClass!);

      case 'DISCOVERY':
        return this.progress.discoveries.includes(trigger.eventId!);

      case 'EVENT_CHOICE':
      case 'SHRINE_CHOICE': {
        // Build the event key to check
        let key = trigger.eventId!;
        if (trigger.choiceId) {
          key = `${trigger.eventId}:${trigger.choiceId}`;
          if (trigger.outcomeId) {
            key = `${trigger.eventId}:${trigger.choiceId}:${trigger.outcomeId}`;
          }
        }
        return this.progress.seenEvents.includes(key);
      }

      case 'ACHIEVEMENT':
        return this.progress.achievementsEarned.includes(trigger.achievementId!);

      case 'MILESTONE':
        return this.progress.milestonesReached.includes(trigger.milestoneId!);

      default:
        return false;
    }
  }

  /**
   * Check if a card is unlocked
   */
  isCardUnlocked(cardId: string): boolean {
    // Already explicitly unlocked
    if (this.progress.unlockedCards.includes(cardId)) {
      return true;
    }

    // Check if card is in unlock list
    const unlock = UNLOCKABLE_CARDS.find((u) => u.cardId === cardId);
    if (!unlock) {
      // Not in unlock list = always available (base card)
      return true;
    }

    // All triggers must be satisfied
    return unlock.triggers.every((t) => this.isTriggerSatisfied(t));
  }

  /**
   * Get detailed unlock status for a card
   */
  getUnlockStatus(cardId: string): UnlockStatusResult {
    const unlock = UNLOCKABLE_CARDS.find((u) => u.cardId === cardId);

    if (!unlock) {
      return { isUnlocked: true, progress: {} };
    }

    const progress: Partial<Record<string, boolean>> = {};
    for (const trigger of unlock.triggers) {
      const key = `${trigger.type}:${trigger.bossId || trigger.eventId || trigger.achievementId || trigger.milestoneId}`;
      progress[key] = this.isTriggerSatisfied(trigger);
    }

    const isUnlocked = unlock.triggers.every((t) => this.isTriggerSatisfied(t));

    return {
      isUnlocked,
      progress,
      hintText: isUnlocked ? undefined : unlock.hintText,
    };
  }

  /**
   * Get unlock hint for a locked card
   */
  getUnlockHint(cardId: string): string | null {
    const unlock = UNLOCKABLE_CARDS.find((u) => u.cardId === cardId);
    return unlock?.hintText ?? null;
  }

  // ===========================================================================
  // EVENT RECORDING
  // ===========================================================================

  /**
   * Record a boss defeat
   */
  recordBossDefeat(bossId: string, classId: CharacterClassId): CardUnlockResult[] {
    if (!this.progress.defeatedBosses[bossId]) {
      this.progress.defeatedBosses[bossId] = [];
    }

    if (!this.progress.defeatedBosses[bossId].includes(classId)) {
      this.progress.defeatedBosses[bossId].push(classId);
    }

    const newUnlocks = this.checkNewUnlocks();
    this.saveProgress();
    this.notifyListeners(newUnlocks);

    return newUnlocks;
  }

  /**
   * Record a narrative event choice
   */
  recordEventChoice(
    eventId: string,
    choiceId?: string,
    outcomeId?: string
  ): CardUnlockResult[] {
    // Build the key based on what's provided
    let key = eventId;
    if (choiceId) {
      key = `${eventId}:${choiceId}`;
      if (outcomeId) {
        key = `${eventId}:${choiceId}:${outcomeId}`;
      }
    }

    if (!this.progress.seenEvents.includes(key)) {
      this.progress.seenEvents.push(key);
      // Also track partial keys for flexibility
      if (choiceId && !this.progress.seenEvents.includes(`${eventId}:${choiceId}`)) {
        this.progress.seenEvents.push(`${eventId}:${choiceId}`);
      }
      if (!this.progress.seenEvents.includes(eventId)) {
        this.progress.seenEvents.push(eventId);
      }
    }

    const newUnlocks = this.checkNewUnlocks();
    this.saveProgress();
    this.notifyListeners(newUnlocks);

    return newUnlocks;
  }

  /**
   * Record a discovery
   */
  recordDiscovery(discoveryId: string): CardUnlockResult[] {
    if (!this.progress.discoveries.includes(discoveryId)) {
      this.progress.discoveries.push(discoveryId);
    }

    const newUnlocks = this.checkNewUnlocks();
    this.saveProgress();
    this.notifyListeners(newUnlocks);

    return newUnlocks;
  }

  /**
   * Record an achievement
   */
  recordAchievement(achievementId: string): CardUnlockResult[] {
    if (!this.progress.achievementsEarned.includes(achievementId)) {
      this.progress.achievementsEarned.push(achievementId);
    }

    const newUnlocks = this.checkNewUnlocks();
    this.saveProgress();
    this.notifyListeners(newUnlocks);

    return newUnlocks;
  }

  /**
   * Record a milestone
   */
  recordMilestone(milestoneId: string): CardUnlockResult[] {
    if (!this.progress.milestonesReached.includes(milestoneId)) {
      this.progress.milestonesReached.push(milestoneId);
    }

    const newUnlocks = this.checkNewUnlocks();
    this.saveProgress();
    this.notifyListeners(newUnlocks);

    return newUnlocks;
  }

  // ===========================================================================
  // UNLOCK CHECKING
  // ===========================================================================

  /**
   * Check for newly unlocked cards and add them to the unlocked list
   */
  private checkNewUnlocks(): CardUnlockResult[] {
    const newUnlocks: CardUnlockResult[] = [];

    for (const unlock of UNLOCKABLE_CARDS) {
      // Skip if already unlocked
      if (this.progress.unlockedCards.includes(unlock.cardId)) {
        continue;
      }

      // Check if all triggers are now satisfied
      if (unlock.triggers.every((t) => this.isTriggerSatisfied(t))) {
        this.progress.unlockedCards.push(unlock.cardId);
        newUnlocks.push({
          cardId: unlock.cardId,
          narrativeText: unlock.narrativeText,
          classRestriction: unlock.classRestriction,
        });
      }
    }

    return newUnlocks;
  }

  // ===========================================================================
  // CARD POOL ACCESS
  // ===========================================================================

  /**
   * Get all unlocked cards for a class
   */
  getUnlockedCardsForClass(classId: CharacterClassId): string[] {
    const unlocked: string[] = [];

    for (const unlock of UNLOCKABLE_CARDS) {
      // Check class restriction
      if (unlock.classRestriction && unlock.classRestriction !== classId) {
        continue;
      }

      // Check if unlocked
      if (this.isCardUnlocked(unlock.cardId)) {
        unlocked.push(unlock.cardId);
      }
    }

    return unlocked;
  }

  /**
   * Get all locked cards (for collection view)
   */
  getLockedCards(): CardUnlock[] {
    return UNLOCKABLE_CARDS.filter(
      (unlock) => !this.isCardUnlocked(unlock.cardId)
    );
  }

  /**
   * Get all unlockable cards (for collection view)
   */
  getAllUnlockableCards(): CardUnlock[] {
    return [...UNLOCKABLE_CARDS];
  }

  // ===========================================================================
  // EVENT LISTENERS
  // ===========================================================================

  /**
   * Subscribe to unlock events
   */
  subscribe(listener: (unlocks: CardUnlockResult[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of new unlocks
   */
  private notifyListeners(unlocks: CardUnlockResult[]): void {
    if (unlocks.length > 0) {
      for (const listener of this.listeners) {
        listener(unlocks);
      }
    }
  }
}

// ===========================================================================
// SINGLETON INSTANCE
// ===========================================================================

let serviceInstance: CardUnlockService | null = null;

export function getCardUnlockService(): CardUnlockService {
  if (!serviceInstance) {
    serviceInstance = new CardUnlockService();
  }
  return serviceInstance;
}

export function resetCardUnlockService(): void {
  serviceInstance = null;
}
