/**
 * Shrine Event Types
 *
 * Defines the data structures for shrine events - meaningful choices
 * at shrine map nodes that offer risk/reward tradeoffs and reveal lore.
 */

import { CharacterClassId } from './index';

// =============================================================================
// SHRINE CHOICE TYPES
// =============================================================================

/**
 * Reward types that can be granted by shrine choices
 */
export type ShrineRewardType =
  | 'hp_max' // Increase max HP
  | 'hp_heal' // Heal current HP (999 = full heal)
  | 'hp_max_loss' // Reduce max HP (used as cost)
  | 'resolve_max' // Increase max Resolve
  | 'damage_bonus' // +X damage for rest of run
  | 'block_bonus' // +X block at start of combat
  | 'card_random' // Add random card to deck
  | 'card_rare' // Add random rare card to deck
  | 'card_upgrade' // Upgrade a card (random or choice)
  | 'card_transform' // Transform a card (random upgrade)
  | 'card_remove' // Remove a card from deck
  | 'gold' // Gain gold
  | 'gold_loss' // Lose gold (used as cost)
  | 'relic' // Gain a relic
  | 'curse_add' // Add curse(s) to deck
  | 'curse_remove' // Remove a curse from deck
  | 'pain_add' // Add Pain card to deck
  | 'potion' // Gain a potion
  | 'boss_insight' // Learn info about upcoming boss
  | 'boss_weaken' // Make boss fight easier
  | 'devotion' // Gain Devotion (Cleric)
  | 'luck' // Gain Luck (Fey-Touched)
  | 'radiance' // Gain Radiance (Celestial)
  | 'immunity_debuff'; // Immune to fear/debuff effects

export interface ShrineReward {
  type: ShrineRewardType;
  amount?: number;
  cardId?: string;
  relicId?: string;
  curseId?: string;
  bossId?: string;
}

// =============================================================================
// SHRINE CHOICE STRUCTURE
// =============================================================================

/**
 * Possible outcome for a shrine choice (can have random outcomes)
 */
export interface ShrineOutcome {
  /** Unique ID for this outcome */
  id: string;
  /** Weight for random selection (higher = more likely). If only one outcome, use weight 100. */
  weight: number;
  /** Text describing what happens */
  resultText: string;
  /** Rewards/effects granted (positive effects) */
  rewards?: ShrineReward[];
  /** Costs applied (negative effects, same type as rewards) */
  costs?: ShrineReward[];
  /** Lore fragment revealed (optional) */
  loreFragment?: string;
}

/**
 * A choice the player can make at a shrine
 */
export interface ShrineChoice {
  /** Unique ID for this choice */
  id: string;
  /** Button text */
  text: string;
  /** Flavor text shown in the choice description */
  flavorText?: string;
  /** Possible outcomes (random selection based on weight) */
  outcomes: ShrineOutcome[];
  /** Visible HP cost to make this choice */
  hpCost?: number;
  /** Visible gold cost to make this choice */
  goldCost?: number;
  /** Visible HP percentage cost (e.g., 0.1 = 10% max HP) */
  hpPercentCost?: number;
}

/**
 * Class-specific variation for a shrine
 */
export interface ShrineClassVariation {
  /** Which class this applies to */
  classId: CharacterClassId;
  /** Additional text to show in the shrine description */
  additionalText?: string;
  /** Warning text (e.g., "Xan'thrax is watching") */
  warningText?: string;
  /** Additional choice(s) available to this class */
  additionalChoices?: ShrineChoice[];
  /** Modified outcome for a specific choice ID */
  modifiedOutcome?: {
    choiceId: string;
    outcome: ShrineOutcome;
  };
}

/**
 * Warden's whisper - additional lore from the Warden
 */
export interface WardenWhisper {
  text: string;
}

// =============================================================================
// SHRINE DEFINITION
// =============================================================================

/**
 * A shrine event definition
 */
export interface ShrineDefinition {
  /** Unique shrine ID */
  id: string;
  /** Display name */
  name: string;
  /** Which act this shrine appears in (1, 2, 3) */
  act: 1 | 2 | 3;
  /** Shrine description (the scene-setting text) */
  description: string;
  /** The prompt/question posed to the player */
  prompt: string;
  /** Available choices */
  choices: ShrineChoice[];
  /** Warden's whisper (optional additional lore) */
  wardenWhisper?: WardenWhisper;
  /** Class-specific variations */
  classVariations?: ShrineClassVariation[];
  /** Whether this shrine can only be encountered once per run */
  oncePerRun?: boolean;
}

// =============================================================================
// RUNTIME STATE
// =============================================================================

/**
 * Tracks shrine state during a run
 */
export interface ShrineState {
  /** Shrine IDs that have been visited this run */
  visitedShrineIds: string[];
  /** Choices made at shrines - format: "shrineId:choiceId:outcomeId" */
  shrineChoicesMade: string[];
}

/**
 * Create initial shrine state
 */
export function createInitialShrineState(): ShrineState {
  return {
    visitedShrineIds: [],
    shrineChoicesMade: [],
  };
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Result of resolving a shrine outcome
 */
export interface ShrineOutcomeResult {
  outcome: ShrineOutcome;
  appliedRewards: ShrineReward[];
  appliedCosts: ShrineReward[];
  loreFragment?: string;
}

/**
 * Prepared shrine event with class-specific modifications applied
 */
export interface PreparedShrine {
  shrine: ShrineDefinition;
  additionalText?: string;
  warningText?: string;
  availableChoices: ShrineChoice[];
}
