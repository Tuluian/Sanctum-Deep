/**
 * Card Unlock Types
 *
 * Defines the data structures for the card unlock system.
 * Cards can be locked behind narrative triggers (boss defeats, discoveries,
 * class-specific moments) and unlocked permanently through meta-progression.
 */

import { CharacterClassId } from './index';

// =============================================================================
// UNLOCK TRIGGER TYPES
// =============================================================================

export type UnlockTriggerType =
  | 'BOSS_DEFEAT' // Defeat a specific boss (any class)
  | 'CLASS_BOSS_DEFEAT' // Defeat a boss as a specific class
  | 'DISCOVERY' // Find something during a run
  | 'EVENT_CHOICE' // Make a specific choice in a narrative event
  | 'SHRINE_CHOICE' // Make a specific choice at a shrine
  | 'ACHIEVEMENT' // Complete a gameplay achievement
  | 'MILESTONE'; // Reach a progression milestone

/**
 * A trigger condition that must be met to unlock a card
 */
export interface UnlockTrigger {
  type: UnlockTriggerType;

  // For BOSS_DEFEAT and CLASS_BOSS_DEFEAT
  bossId?: string;

  // For CLASS_BOSS_DEFEAT - which class must defeat the boss
  requiredClass?: CharacterClassId;

  // For DISCOVERY, EVENT_CHOICE, SHRINE_CHOICE
  eventId?: string;
  choiceId?: string;
  outcomeId?: string; // Optional: specific outcome within choice

  // For ACHIEVEMENT
  achievementId?: string;

  // For MILESTONE
  milestoneId?: string;
}

// =============================================================================
// CARD UNLOCK DEFINITIONS
// =============================================================================

/**
 * Definition for an unlockable card
 */
export interface CardUnlock {
  /** The card ID to unlock */
  cardId: string;

  /** All triggers must be satisfied to unlock (AND logic) */
  triggers: UnlockTrigger[];

  /** Narrative text displayed when card is unlocked */
  narrativeText: string;

  /** Hint text shown when card is locked in collection */
  hintText: string;

  /** If set, only this class can use the unlocked card */
  classRestriction?: CharacterClassId;
}

// =============================================================================
// UNLOCK PROGRESS (PERSISTENCE)
// =============================================================================

/**
 * Tracks the player's unlock progress across all runs.
 * Persisted to localStorage.
 */
export interface UnlockProgress {
  /** Card IDs that have been fully unlocked */
  unlockedCards: string[];

  /** Events seen (format: "eventId" or "eventId:choiceId" or "eventId:choiceId:outcomeId") */
  seenEvents: string[];

  /** Bosses defeated per class (bossId -> array of classIds that defeated it) */
  defeatedBosses: Record<string, CharacterClassId[]>;

  /** Achievement IDs that have been earned */
  achievementsEarned: string[];

  /** Milestone IDs that have been reached */
  milestonesReached: string[];

  /** Discovery IDs that have been found */
  discoveries: string[];
}

/**
 * Create initial unlock progress
 */
export function createInitialUnlockProgress(): UnlockProgress {
  return {
    unlockedCards: [],
    seenEvents: [],
    defeatedBosses: {},
    achievementsEarned: [],
    milestonesReached: [],
    discoveries: [],
  };
}

// =============================================================================
// MILESTONE DEFINITIONS
// =============================================================================

export type MilestoneType =
  | 'FIRST_ACT_COMPLETE'
  | 'FIRST_BOSS_DEFEAT'
  | 'FIRST_RUN_COMPLETE'
  | 'ALL_CLASSES_COMPLETE'
  | 'ACT_3_REACHED';

export interface MilestoneDefinition {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  // For type-specific conditions
  bossId?: string;
  act?: number;
}

// =============================================================================
// SERVICE RESULT TYPES
// =============================================================================

/**
 * Result when a new card is unlocked
 */
export interface CardUnlockResult {
  cardId: string;
  narrativeText: string;
  classRestriction?: CharacterClassId;
}

/**
 * Result when checking unlock status
 */
export interface UnlockStatusResult {
  isUnlocked: boolean;
  progress: Partial<Record<UnlockTriggerType, boolean>>;
  hintText?: string;
}
