/**
 * Achievement System Types
 * Tracks player accomplishments across runs and awards Soul Echoes
 */

import { CharacterClassId } from './index';

// Achievement tier determines Soul Echo reward
export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

// Soul Echo rewards per tier
export const SOUL_ECHO_REWARDS: Record<AchievementTier, number> = {
  [AchievementTier.BRONZE]: 10,
  [AchievementTier.SILVER]: 25,
  [AchievementTier.GOLD]: 50,
  [AchievementTier.PLATINUM]: 100,
};

// Achievement categories for gallery filtering
export type AchievementCategory = 'combat' | 'run' | 'class' | 'secret';

// Condition types for achievement checking
export type AchievementCondition =
  // Combat conditions
  | { type: 'combat_wins'; count: number }
  | { type: 'combat_win_no_damage' }
  | { type: 'damage_single_attack'; amount: number }
  | { type: 'enemies_defeated_single_turn'; count: number }
  | { type: 'block_in_combat'; amount: number }
  | { type: 'win_with_hp'; hp: number }
  | { type: 'win_in_turns'; turns: number }
  | { type: 'win_with_cards_played'; count: number }
  | { type: 'win_no_damage_final_turn' }
  // Class-specific combat
  | { type: 'reach_devotion'; amount: number }
  | { type: 'maintain_fortify'; amount: number; turns: number }
  | { type: 'win_with_curses'; count: number }
  | { type: 'combat_without_breaking_vow' }
  | { type: 'whimsy_triggers_in_combat'; count: number }
  // Run conditions
  | { type: 'complete_run' }
  | { type: 'complete_act'; act: number }
  | { type: 'defeat_boss'; bossId: string }
  | { type: 'deck_size_at_win'; comparison: 'lte' | 'gte'; size: number }
  | { type: 'gold_at_run_end'; amount: number }
  | { type: 'relics_in_run'; count: number }
  | { type: 'potions_used_in_run'; count: number }
  | { type: 'elites_defeated_in_run'; count: number }
  | { type: 'win_without_ankh' }
  | { type: 'run_time'; minutes: number }
  | { type: 'curses_in_deck_at_win'; count: number }
  | { type: 'all_shrines_visited' }
  | { type: 'no_campfire_rest' }
  // Class conditions
  | { type: 'win_as_class'; classId: CharacterClassId }
  | { type: 'wins_with_class'; classId: CharacterClassId; count: number }
  // Secret conditions
  | { type: 'become_warden_all_classes' }
  | { type: 'true_ending' }
  | { type: 'spare_enemy' }
  | { type: 'luck_decided_wins'; count: number }
  | { type: 'final_sacrifice_kill' }
  | { type: 'all_memory_fragments' }
  | { type: 'same_dialogue_choice'; count: number }
  | { type: 'win_with_empty_draw_pile' }
  | { type: 'win_with_starter_cards_only' }
  | { type: 'hollow_god_with_corruption'; stacks: number }
  // Custom check function (for complex conditions)
  | { type: 'custom'; checkFn: string };

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string; // Shown before unlock
  flavorText?: string; // Warden quote shown on unlock
  loreUnlock?: string; // Extended lore revealed on unlock
  tier: AchievementTier;
  category: AchievementCategory;
  hidden: boolean; // Secret achievements show "???" until unlocked
  condition: AchievementCondition;
  icon?: string; // Emoji or icon reference
}

// Runtime achievement state (for progress tracking)
export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: number; // Timestamp
}

// Stats tracked during combat for achievement checking
export interface CombatStats {
  damageTaken: number;
  damageDealt: number;
  maxSingleAttackDamage: number;
  totalBlockGained: number;
  cardsPlayed: number;
  turnsElapsed: number;
  enemiesDefeated: number;
  enemiesDefeatedThisTurn: number;
  maxEnemiesDefeatedInSingleTurn: number;
  victory: boolean;
  finalTurnDamageDealt: number;
  // Class-specific tracking
  maxDevotion: number;
  fortifyTurnsAtMax: number;
  currentFortifyStreak: number;
  cursesInDeck: number;
  vowBroken: boolean;
  whimsyTriggered: number;
  luckDecidedOutcome: boolean;
}

// Stats tracked during a run for achievement checking
export interface RunStats {
  classId: CharacterClassId;
  currentAct: number;
  deckSize: number;
  gold: number;
  relicsCollected: number;
  potionsUsed: number;
  elitesDefeated: number;
  shrinesVisited: string[];
  campfireRests: number;
  cursesInDeck: number;
  startTime: number;
  endTime?: number;
  victory: boolean;
  usedAnkh: boolean;
  bossesDefeated: string[];
  wardenChoice?: 'warden' | 'leave';
  onlyStarterCards: boolean;
  memoryFragmentsCollected: string[];
  dialogueChoices: Map<string, number>;
  luckWins: number;
  finalSacrificeKill: boolean;
  corruptionStacks: number;
}

// Achievement unlock event for notification system
export interface AchievementUnlockEvent {
  achievement: Achievement;
  soulEchoesAwarded: number;
  timestamp: number;
}
