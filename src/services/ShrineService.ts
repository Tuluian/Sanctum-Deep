/**
 * ShrineService
 *
 * Manages shrine event selection, outcome resolution, and state tracking.
 */

import {
  ShrineDefinition,
  ShrineChoice,
  ShrineOutcome,
  ShrineOutcomeResult,
  ShrineState,
  ShrineReward,
  PreparedShrine,
  createInitialShrineState,
} from '@/types/shrines';
import { CharacterClassId, PlayerState } from '@/types/index';
import { getShrinesByAct, getShrineById } from '@/data/shrines';

/**
 * Seeded random number generator for consistent shrine outcomes
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export class ShrineService {
  private state: ShrineState;
  private currentClassId: CharacterClassId;
  private rng: SeededRandom;

  constructor(classId: CharacterClassId, seed: string = Date.now().toString()) {
    this.state = createInitialShrineState();
    this.currentClassId = classId;
    this.rng = new SeededRandom(seed);
  }

  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  /**
   * Get current shrine state (for saving)
   */
  getState(): ShrineState {
    return { ...this.state };
  }

  /**
   * Load shrine state (from save)
   */
  loadState(state: ShrineState): void {
    this.state = { ...state };
  }

  /**
   * Reset state for new run
   */
  reset(classId: CharacterClassId, seed: string = Date.now().toString()): void {
    this.state = createInitialShrineState();
    this.currentClassId = classId;
    this.rng = new SeededRandom(seed);
  }

  // ===========================================================================
  // SHRINE SELECTION
  // ===========================================================================

  /**
   * Get a random shrine for the current act
   */
  getRandomShrine(act: 1 | 2 | 3): ShrineDefinition | null {
    const actShrines = getShrinesByAct(act);

    // Filter out shrines that can only occur once and have already been visited
    const availableShrines = actShrines.filter((shrine) => {
      if (shrine.oncePerRun && this.state.visitedShrineIds.includes(shrine.id)) {
        return false;
      }
      return true;
    });

    if (availableShrines.length === 0) {
      return null;
    }

    // Random selection
    const index = this.rng.nextInt(0, availableShrines.length - 1);
    return availableShrines[index];
  }

  /**
   * Get a specific shrine by ID
   */
  getShrine(shrineId: string): ShrineDefinition | undefined {
    return getShrineById(shrineId);
  }

  /**
   * Prepare a shrine for display, applying class-specific modifications
   */
  prepareShrine(shrine: ShrineDefinition): PreparedShrine {
    let additionalText: string | undefined;
    let warningText: string | undefined;
    const availableChoices: ShrineChoice[] = [...shrine.choices];

    // Find class-specific variations
    const classVariation = shrine.classVariations?.find(
      (v) => v.classId === this.currentClassId
    );

    if (classVariation) {
      additionalText = classVariation.additionalText;
      warningText = classVariation.warningText;

      // Add class-specific choices
      if (classVariation.additionalChoices) {
        availableChoices.push(...classVariation.additionalChoices);
      }
    }

    return {
      shrine,
      additionalText,
      warningText,
      availableChoices,
    };
  }

  // ===========================================================================
  // OUTCOME RESOLUTION
  // ===========================================================================

  /**
   * Resolve a player's choice at a shrine
   */
  resolveChoice(
    shrine: ShrineDefinition,
    choice: ShrineChoice
  ): ShrineOutcomeResult {
    // Mark shrine as visited
    if (!this.state.visitedShrineIds.includes(shrine.id)) {
      this.state.visitedShrineIds.push(shrine.id);
    }

    // Check for class-specific modified outcome
    let outcomes = choice.outcomes;
    const classVariation = shrine.classVariations?.find(
      (v) => v.classId === this.currentClassId
    );
    if (classVariation?.modifiedOutcome?.choiceId === choice.id) {
      // Use the modified outcome instead
      outcomes = [classVariation.modifiedOutcome.outcome];
    }

    // Select outcome based on weights
    const outcome = this.selectOutcome(outcomes);

    // Track the choice for unlock system / analytics
    const choiceKey = `${shrine.id}:${choice.id}:${outcome.id}`;
    if (!this.state.shrineChoicesMade.includes(choiceKey)) {
      this.state.shrineChoicesMade.push(choiceKey);
    }

    // Collect rewards and costs
    const appliedRewards = outcome.rewards || [];
    const appliedCosts = outcome.costs || [];

    return {
      outcome,
      appliedRewards,
      appliedCosts,
      loreFragment: outcome.loreFragment,
    };
  }

  /**
   * Select an outcome based on weights
   */
  private selectOutcome(outcomes: ShrineOutcome[]): ShrineOutcome {
    if (outcomes.length === 1) {
      return outcomes[0];
    }

    const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
    let roll = this.rng.next() * totalWeight;

    for (const outcome of outcomes) {
      roll -= outcome.weight;
      if (roll <= 0) {
        return outcome;
      }
    }

    return outcomes[0];
  }

  // ===========================================================================
  // PLAYER STATE MODIFICATIONS
  // ===========================================================================

  /**
   * Apply rewards to player state
   * Returns description of what was applied
   */
  applyRewardsToPlayer(
    player: PlayerState,
    rewards: ShrineReward[]
  ): string[] {
    const descriptions: string[] = [];

    for (const reward of rewards) {
      switch (reward.type) {
        case 'hp_max':
          player.maxHp += reward.amount || 0;
          player.currentHp += reward.amount || 0;
          descriptions.push(`+${reward.amount} Max HP`);
          break;

        case 'hp_heal':
          const healAmount =
            reward.amount === 999
              ? player.maxHp - player.currentHp
              : Math.min(reward.amount || 0, player.maxHp - player.currentHp);
          player.currentHp += healAmount;
          if (reward.amount === 999) {
            descriptions.push('Healed to full HP');
          } else {
            descriptions.push(`Healed ${healAmount} HP`);
          }
          break;

        case 'hp_max_loss':
          player.maxHp -= reward.amount || 0;
          player.currentHp = Math.min(player.currentHp, player.maxHp);
          descriptions.push(`-${reward.amount} Max HP`);
          break;

        case 'resolve_max':
          player.maxResolve += reward.amount || 0;
          player.baseMaxResolve += reward.amount || 0;
          descriptions.push(`+${reward.amount} Max Resolve`);
          break;

        case 'damage_bonus':
          descriptions.push(`+${reward.amount} Damage (this run)`);
          break;

        case 'block_bonus':
          descriptions.push(`+${reward.amount} Block at start of combat`);
          break;

        case 'card_random':
          descriptions.push('Gained a random card');
          break;

        case 'card_rare':
          descriptions.push('Gained a rare card');
          break;

        case 'card_upgrade':
          descriptions.push('Upgrade a card');
          break;

        case 'card_transform':
          descriptions.push('Transform a card (random upgrade)');
          break;

        case 'card_remove':
          descriptions.push('Remove a card from deck');
          break;

        case 'gold':
          descriptions.push(`+${reward.amount} Gold`);
          break;

        case 'gold_loss':
          descriptions.push(`-${reward.amount} Gold`);
          break;

        case 'relic':
          if (reward.relicId) {
            descriptions.push(`Gained relic: ${reward.relicId}`);
          } else {
            descriptions.push('Gained a relic');
          }
          break;

        case 'curse_add':
          descriptions.push(
            `Added ${reward.amount} Curse${(reward.amount || 1) > 1 ? 's' : ''} to deck`
          );
          break;

        case 'curse_remove':
          descriptions.push('Removed a curse from deck');
          break;

        case 'pain_add':
          descriptions.push(
            `Added ${reward.amount} Pain card${(reward.amount || 1) > 1 ? 's' : ''} to deck`
          );
          break;

        case 'potion':
          descriptions.push('Gained a potion');
          break;

        case 'boss_insight':
          descriptions.push('Gained insight about the upcoming boss');
          break;

        case 'boss_weaken':
          descriptions.push(`Weakened ${reward.bossId || 'the boss'}`);
          break;

        case 'devotion':
          player.devotion += reward.amount || 0;
          descriptions.push(`+${reward.amount} Devotion`);
          break;

        case 'luck':
          player.luck = Math.min(
            player.maxLuck,
            player.luck + (reward.amount || 0)
          );
          descriptions.push(`+${reward.amount} Luck`);
          break;

        case 'radiance':
          player.radiance = Math.min(
            player.maxRadiance,
            player.radiance + (reward.amount || 0)
          );
          descriptions.push(`+${reward.amount} Radiance`);
          break;

        case 'immunity_debuff':
          descriptions.push('Immune to fear and debuff effects');
          break;
      }
    }

    return descriptions;
  }

  /**
   * Apply costs to player state
   * Returns description of what was applied
   */
  applyCostsToPlayer(player: PlayerState, costs: ShrineReward[]): string[] {
    // Costs use the same structure as rewards but represent negative effects
    return this.applyRewardsToPlayer(player, costs);
  }

  /**
   * Check if player can afford a choice's costs
   */
  canAffordChoice(
    player: PlayerState,
    choice: ShrineChoice,
    gold: number
  ): { canAfford: boolean; reason?: string } {
    if (choice.hpCost && player.currentHp <= choice.hpCost) {
      return {
        canAfford: false,
        reason: `Requires ${choice.hpCost} HP (you have ${player.currentHp})`,
      };
    }

    if (choice.hpPercentCost) {
      const cost = Math.floor(player.maxHp * choice.hpPercentCost);
      if (player.currentHp <= cost) {
        return {
          canAfford: false,
          reason: `Requires ${cost} HP (${Math.round(choice.hpPercentCost * 100)}% of max HP)`,
        };
      }
    }

    if (choice.goldCost && gold < choice.goldCost) {
      return {
        canAfford: false,
        reason: `Requires ${choice.goldCost} Gold (you have ${gold})`,
      };
    }

    return { canAfford: true };
  }

  /**
   * Apply upfront choice costs (HP and gold)
   */
  applyChoiceCosts(
    player: PlayerState,
    choice: ShrineChoice,
    gold: number
  ): { newHp: number; newGold: number } {
    let newHp = player.currentHp;
    let newGold = gold;

    if (choice.hpCost) {
      newHp -= choice.hpCost;
    }

    if (choice.hpPercentCost) {
      const cost = Math.floor(player.maxHp * choice.hpPercentCost);
      newHp -= cost;
    }

    if (choice.goldCost) {
      newGold -= choice.goldCost;
    }

    return { newHp, newGold };
  }
}

// Export singleton instance factory
let serviceInstance: ShrineService | null = null;

export function getShrineService(): ShrineService {
  if (!serviceInstance) {
    serviceInstance = new ShrineService(CharacterClassId.DUNGEON_KNIGHT);
  }
  return serviceInstance;
}

export function initShrineService(
  classId: CharacterClassId,
  seed?: string
): ShrineService {
  serviceInstance = new ShrineService(classId, seed);
  return serviceInstance;
}
