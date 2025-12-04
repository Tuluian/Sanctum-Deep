/**
 * Narrative Event Types
 *
 * Defines the data structures for narrative events (CYOA-style choices)
 * and story cards (ambient narrative moments between rooms).
 */

import { CharacterClassId } from './index';

// =============================================================================
// NARRATIVE EVENTS (CYOA-style with choices)
// =============================================================================

export type EventRarity = 'common' | 'uncommon' | 'rare';
export type EventTriggerType = 'random' | 'progress' | 'health' | 'boss_pre' | 'boss_post';
export type SpeakerType = 'warden' | 'character' | 'unknown' | 'environment';

/**
 * Conditions that must be met for an event to trigger
 */
export interface EventTriggerCondition {
  /** Minimum rooms cleared this act */
  roomsCleared?: number;
  /** Trigger if HP below this percentage (0-1) */
  healthBelow?: number;
  /** Trigger if HP above this percentage (0-1) */
  healthAbove?: number;
  /** Boss ID for boss_pre/boss_post triggers */
  bossId?: string;
  /** Random chance (0-1) for random triggers */
  chance?: number;
}

/**
 * Content displayed in the event
 */
export interface EventContent {
  /** Main narrative text */
  text: string;
  /** Speaker name (e.g., "Lyra", "Wren") */
  speakerName?: string;
  /** Type of speaker for styling */
  speakerType?: SpeakerType;
}

/**
 * Reward types that can be granted by event outcomes
 */
export type EventRewardType =
  | 'hp_max' // Increase max HP
  | 'hp_heal' // Heal current HP
  | 'resolve_max' // Increase max Resolve
  | 'damage_bonus' // +X damage for rest of run
  | 'block_bonus' // +X block at start of combat
  | 'card_random' // Add random card to deck
  | 'card_specific' // Add specific card to deck
  | 'gold' // Gain gold
  | 'relic' // Gain a relic
  | 'skip_encounter' // Skip next combat
  | 'boss_damage_bonus'; // +X% damage vs specific boss

export interface EventReward {
  type: EventRewardType;
  amount?: number;
  cardId?: string;
  relicId?: string;
  bossId?: string; // For boss_damage_bonus
}

/**
 * Penalty types that can be applied by event outcomes
 */
export type EventPenaltyType =
  | 'hp_loss' // Lose current HP
  | 'hp_max_loss' // Lose max HP
  | 'resolve_loss' // Lose max Resolve
  | 'curse_card' // Add curse card to deck
  | 'gold_loss' // Lose gold
  | 'corruption' // Gain corruption stacks
  | 'start_combat'; // Start combat immediately

export interface EventPenalty {
  type: EventPenaltyType;
  amount?: number;
  curseId?: string;
  enemyId?: string; // For start_combat
}

/**
 * A possible outcome of a choice (weighted random selection)
 */
export interface EventOutcome {
  /** Unique ID for this outcome */
  id: string;
  /** Weight for random selection (higher = more likely) */
  weight: number;
  /** Text describing what happens */
  resultText: string;
  /** Rewards granted */
  rewards?: EventReward[];
  /** Penalties applied */
  penalties?: EventPenalty[];
  /** Card unlock trigger (event_choice unlock type) */
  unlocksCard?: string;
}

/**
 * A choice the player can make in an event
 */
export interface NarrativeChoice {
  /** Unique ID for this choice */
  id: string;
  /** Button text */
  text: string;
  /** Flavor text shown on hover */
  flavorText?: string;
  /** Possible outcomes (random selection based on weight) */
  outcomes: EventOutcome[];
  /** Cost to make this choice (shown in button) */
  hpCost?: number;
  goldCost?: number;
}

/**
 * A narrative event definition
 */
export interface NarrativeEvent {
  /** Unique event ID */
  id: string;
  /** Display title */
  title: string;
  /** Which act this event can appear in (1, 2, 3, or 'any') */
  act: 1 | 2 | 3 | 'any';
  /** Class restriction (undefined = all classes) */
  classRestriction?: CharacterClassId;
  /** How rare this event is */
  rarity: EventRarity;
  /** What triggers this event */
  triggerType: EventTriggerType;
  /** Conditions for triggering */
  triggerCondition?: EventTriggerCondition;
  /** Event content */
  content: EventContent;
  /** Choices available (undefined = auto-reward only) */
  choices?: NarrativeChoice[];
  /** Automatic reward if no choices */
  autoReward?: EventReward;
  /** Whether this event can only occur once per run */
  oncePerRun?: boolean;
}

// =============================================================================
// STORY CARDS (Ambient narrative, no choices)
// =============================================================================

export type StoryCardTriggerType =
  | 'progress' // After X rooms cleared
  | 'first_blood' // After first combat in act
  | 'pre_boss' // Before boss room
  | 'post_boss' // After boss defeated
  | 'health_threshold' // When HP drops below X%
  | 'elite_defeated' // After killing elite enemy
  | 'random'; // Random chance after any room

export type StoryCardSpeaker = 'warden' | 'character' | 'environment' | 'lore';

/**
 * Trigger conditions for story cards
 */
export interface StoryCardTrigger {
  type: StoryCardTriggerType;
  /** Room number for progress trigger */
  value?: number;
  /** HP percentage threshold */
  hpThreshold?: number;
  /** Boss ID for boss triggers */
  bossId?: string;
  /** Random chance (0-1) */
  chance?: number;
}

/**
 * A story card definition (short narrative moment)
 */
export interface StoryCard {
  /** Unique ID */
  id: string;
  /** Trigger conditions */
  trigger: StoryCardTrigger;
  /** Which act this appears in (1, 2, 3, or 'all') */
  act: 1 | 2 | 3 | 'all';
  /** Class restriction (undefined = universal) */
  classId?: CharacterClassId;
  /** Who is speaking */
  speaker: StoryCardSpeaker;
  /** The narrative text (2-4 sentences) */
  text: string;
  /** Higher priority = more likely to show */
  priority: number;
  /** Only show once per run */
  showOnce?: boolean;
}

// =============================================================================
// RUNTIME STATE
// =============================================================================

/**
 * Tracks narrative state during a run
 */
export interface NarrativeState {
  /** Event IDs that have been seen this run */
  seenEventIds: string[];
  /** Story card IDs that have been shown this run */
  seenStoryCardIds: string[];
  /** Choices made (for unlock tracking) - format: "eventId:choiceId:outcomeId" */
  choicesMade: string[];
  /** Run-wide stat bonuses from events */
  damageBonus: number;
  blockBonus: number;
  bossDamageBonuses: Record<string, number>; // bossId -> % bonus
  /** Rooms cleared this act */
  roomsCleared: number;
  /** Combat count this act */
  combatCount: number;
  /** Current act */
  currentAct: number;
}

/**
 * Create initial narrative state
 */
export function createInitialNarrativeState(): NarrativeState {
  return {
    seenEventIds: [],
    seenStoryCardIds: [],
    choicesMade: [],
    damageBonus: 0,
    blockBonus: 0,
    bossDamageBonuses: {},
    roomsCleared: 0,
    combatCount: 0,
    currentAct: 1,
  };
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Result of resolving an event outcome
 */
export interface EventOutcomeResult {
  outcome: EventOutcome;
  appliedRewards: EventReward[];
  appliedPenalties: EventPenalty[];
  unlockedCardId?: string;
}

/**
 * Result of checking for triggerable events
 */
export interface EventCheckResult {
  shouldTrigger: boolean;
  event?: NarrativeEvent;
}

/**
 * Result of checking for story cards
 */
export interface StoryCardCheckResult {
  shouldShow: boolean;
  card?: StoryCard;
}
