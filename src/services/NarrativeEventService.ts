/**
 * NarrativeEventService
 *
 * Manages narrative event triggers, selection, and outcome resolution.
 * Handles both CYOA-style events and ambient story cards.
 */

import {
  NarrativeEvent,
  NarrativeChoice,
  EventOutcome,
  EventOutcomeResult,
  EventCheckResult,
  StoryCard,
  StoryCardCheckResult,
  NarrativeState,
  EventReward,
  EventPenalty,
  createInitialNarrativeState,
} from '@/types/narrativeEvents';
import { CharacterClassId, PlayerState } from '@/types/index';
import { getEventsByAct } from '@/data/narrativeEvents';
import { getStoryCardsByAct } from '@/data/storyCards';
import { getCardUnlockService } from '@/services/CardUnlockService';
import { CardUnlockResult } from '@/types/unlocks';

/**
 * Seeded random number generator for consistent event outcomes
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
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

export class NarrativeEventService {
  private state: NarrativeState;
  private currentClassId: CharacterClassId;
  private rng: SeededRandom;

  constructor(classId: CharacterClassId, seed: string = Date.now().toString()) {
    this.state = createInitialNarrativeState();
    this.currentClassId = classId;
    this.rng = new SeededRandom(seed);
  }

  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  /**
   * Get current narrative state (for saving)
   */
  getState(): NarrativeState {
    return { ...this.state };
  }

  /**
   * Load narrative state (from save)
   */
  loadState(state: NarrativeState): void {
    this.state = { ...state };
  }

  /**
   * Reset state for new run
   */
  reset(classId: CharacterClassId, seed: string = Date.now().toString()): void {
    this.state = createInitialNarrativeState();
    this.currentClassId = classId;
    this.rng = new SeededRandom(seed);
  }

  /**
   * Set current act
   */
  setAct(act: number): void {
    if (this.state.currentAct !== act) {
      this.state.currentAct = act;
      this.state.roomsCleared = 0;
      this.state.combatCount = 0;
    }
  }

  /**
   * Increment rooms cleared counter
   */
  incrementRoomsCleared(): void {
    this.state.roomsCleared++;
  }

  /**
   * Increment combat counter
   */
  incrementCombatCount(): void {
    this.state.combatCount++;
  }

  // ===========================================================================
  // EVENT CHECKING
  // ===========================================================================

  /**
   * Check if a narrative event should trigger after a room
   */
  checkForEvent(
    player: PlayerState,
    context: {
      nodeType: 'combat' | 'elite' | 'boss' | 'shrine' | 'campfire' | 'merchant';
      bossId?: string;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): EventCheckResult {
    const act = this.state.currentAct as 1 | 2 | 3;
    const eligibleEvents = this.getEligibleEvents(player, act, context);

    if (eligibleEvents.length === 0) {
      return { shouldTrigger: false };
    }

    // Select event based on rarity weights
    const selectedEvent = this.selectEvent(eligibleEvents);

    if (selectedEvent) {
      return { shouldTrigger: true, event: selectedEvent };
    }

    return { shouldTrigger: false };
  }

  /**
   * Get all events that could trigger given current conditions
   */
  private getEligibleEvents(
    player: PlayerState,
    act: 1 | 2 | 3,
    context: {
      nodeType: string;
      bossId?: string;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): NarrativeEvent[] {
    const actEvents = getEventsByAct(act);

    return actEvents.filter((event) => {
      // Check class restriction
      if (event.classRestriction && event.classRestriction !== this.currentClassId) {
        return false;
      }

      // Check if already seen (for oncePerRun events)
      if (event.oncePerRun && this.state.seenEventIds.includes(event.id)) {
        return false;
      }

      // Check trigger type
      if (!this.matchesTriggerType(event, player, context)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if event matches trigger conditions
   */
  private matchesTriggerType(
    event: NarrativeEvent,
    player: PlayerState,
    context: {
      nodeType: string;
      bossId?: string;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): boolean {
    const condition = event.triggerCondition;

    switch (event.triggerType) {
      case 'random':
        // Random events trigger based on chance
        if (condition?.chance) {
          return this.rng.next() < condition.chance;
        }
        return this.rng.next() < 0.15; // Default 15% chance

      case 'progress':
        // Trigger after X rooms cleared
        if (condition?.roomsCleared) {
          return this.state.roomsCleared >= condition.roomsCleared;
        }
        return false;

      case 'health':
        // Trigger based on HP thresholds
        const hpPercent = player.currentHp / player.maxHp;
        if (condition?.healthBelow && hpPercent >= condition.healthBelow) {
          return false;
        }
        if (condition?.healthAbove && hpPercent <= condition.healthAbove) {
          return false;
        }
        return true;

      case 'boss_pre':
        // Trigger before boss fight
        return !!context.isBossPreFight &&
               (!condition?.bossId || condition.bossId === context.bossId);

      case 'boss_post':
        // Trigger after boss fight
        return !!context.isBossPostFight &&
               (!condition?.bossId || condition.bossId === context.bossId);

      default:
        return false;
    }
  }

  /**
   * Select an event based on rarity weights
   */
  private selectEvent(events: NarrativeEvent[]): NarrativeEvent | null {
    if (events.length === 0) return null;

    // Weight by rarity (rarer = lower weight, more impactful)
    const weights: Record<string, number> = {
      common: 60,
      uncommon: 30,
      rare: 10,
    };

    const totalWeight = events.reduce(
      (sum, e) => sum + (weights[e.rarity] || 30),
      0
    );

    let roll = this.rng.next() * totalWeight;

    for (const event of events) {
      roll -= weights[event.rarity] || 30;
      if (roll <= 0) {
        return event;
      }
    }

    return events[0];
  }

  // ===========================================================================
  // OUTCOME RESOLUTION
  // ===========================================================================

  /**
   * Resolve a player's choice in an event
   */
  resolveChoice(
    event: NarrativeEvent,
    choice: NarrativeChoice
  ): EventOutcomeResult & { cardUnlocks: CardUnlockResult[] } {
    // Mark event as seen
    if (!this.state.seenEventIds.includes(event.id)) {
      this.state.seenEventIds.push(event.id);
    }

    // Select outcome based on weights
    const outcome = this.selectOutcome(choice.outcomes);

    // Track the choice for unlock system
    const choiceKey = `${event.id}:${choice.id}:${outcome.id}`;
    if (!this.state.choicesMade.includes(choiceKey)) {
      this.state.choicesMade.push(choiceKey);
    }

    // Process rewards and penalties
    const appliedRewards = outcome.rewards || [];
    const appliedPenalties = outcome.penalties || [];

    // Apply stat bonuses to state
    this.applyRewardsToState(appliedRewards);

    // Record with CardUnlockService for meta-progression
    const cardUnlocks = getCardUnlockService().recordEventChoice(
      event.id,
      choice.id,
      outcome.id
    );

    return {
      outcome,
      appliedRewards,
      appliedPenalties,
      unlockedCardId: outcome.unlocksCard,
      cardUnlocks,
    };
  }

  /**
   * Select an outcome based on weights
   */
  private selectOutcome(outcomes: EventOutcome[]): EventOutcome {
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

  /**
   * Apply rewards that affect narrative state (not player state)
   */
  private applyRewardsToState(rewards: EventReward[]): void {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'damage_bonus':
          this.state.damageBonus += reward.amount || 0;
          break;
        case 'block_bonus':
          this.state.blockBonus += reward.amount || 0;
          break;
        case 'boss_damage_bonus':
          if (reward.bossId) {
            this.state.bossDamageBonuses[reward.bossId] =
              (this.state.bossDamageBonuses[reward.bossId] || 0) +
              (reward.amount || 0);
          }
          break;
        // Other rewards are applied directly to player by the caller
      }
    }
  }

  /**
   * Apply rewards to player state
   * Returns description of what was applied
   */
  applyRewardsToPlayer(
    player: PlayerState,
    rewards: EventReward[]
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
          const healAmount = Math.min(
            reward.amount === 999 ? player.maxHp : (reward.amount || 0),
            player.maxHp - player.currentHp
          );
          player.currentHp += healAmount;
          if (reward.amount === 999) {
            descriptions.push('Healed to full HP');
          } else {
            descriptions.push(`Healed ${healAmount} HP`);
          }
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

        case 'gold':
          // Gold is tracked elsewhere - just note it
          descriptions.push(`+${reward.amount} Gold`);
          break;

        case 'card_random':
          descriptions.push('Gained a random card');
          break;

        case 'card_specific':
          descriptions.push(`Gained card: ${reward.cardId}`);
          break;

        case 'skip_encounter':
          descriptions.push('Skip next encounter');
          break;

        case 'boss_damage_bonus':
          descriptions.push(`+${reward.amount}% damage vs ${reward.bossId}`);
          break;
      }
    }

    return descriptions;
  }

  /**
   * Apply penalties to player state
   * Returns description of what was applied
   */
  applyPenaltiesToPlayer(
    player: PlayerState,
    penalties: EventPenalty[]
  ): string[] {
    const descriptions: string[] = [];

    for (const penalty of penalties) {
      switch (penalty.type) {
        case 'hp_loss':
          player.currentHp = Math.max(1, player.currentHp - (penalty.amount || 0));
          descriptions.push(`Lost ${penalty.amount} HP`);
          break;

        case 'hp_max_loss':
          player.maxHp -= penalty.amount || 0;
          player.currentHp = Math.min(player.currentHp, player.maxHp);
          descriptions.push(`-${penalty.amount} Max HP`);
          break;

        case 'resolve_loss':
          player.maxResolve = Math.max(1, player.maxResolve - (penalty.amount || 0));
          player.baseMaxResolve = Math.max(1, player.baseMaxResolve - (penalty.amount || 0));
          descriptions.push(`-${penalty.amount} Max Resolve`);
          break;

        case 'curse_card':
          descriptions.push(`Added curse: ${penalty.curseId}`);
          break;

        case 'gold_loss':
          descriptions.push(`Lost ${penalty.amount} Gold`);
          break;

        case 'corruption':
          descriptions.push(`Gained ${penalty.amount} Corruption`);
          break;

        case 'start_combat':
          descriptions.push('Combat started!');
          break;
      }
    }

    return descriptions;
  }

  // ===========================================================================
  // STORY CARDS
  // ===========================================================================

  /**
   * Check if a story card should show after current room
   */
  checkForStoryCard(
    player: PlayerState,
    context: {
      nodeType: string;
      bossId?: string;
      isFirstCombat?: boolean;
      isEliteDefeated?: boolean;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): StoryCardCheckResult {
    const act = this.state.currentAct as 1 | 2 | 3;
    const eligibleCards = this.getEligibleStoryCards(player, act, context);

    if (eligibleCards.length === 0) {
      return { shouldShow: false };
    }

    // Select highest priority card
    const selectedCard = this.selectStoryCard(eligibleCards);

    if (selectedCard) {
      // Mark as seen
      if (!this.state.seenStoryCardIds.includes(selectedCard.id)) {
        this.state.seenStoryCardIds.push(selectedCard.id);
      }
      return { shouldShow: true, card: selectedCard };
    }

    return { shouldShow: false };
  }

  /**
   * Get eligible story cards for current context
   */
  private getEligibleStoryCards(
    player: PlayerState,
    act: 1 | 2 | 3,
    context: {
      nodeType: string;
      bossId?: string;
      isFirstCombat?: boolean;
      isEliteDefeated?: boolean;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): StoryCard[] {
    const actCards = getStoryCardsByAct(act);

    return actCards.filter((card) => {
      // Check class restriction
      if (card.classId && card.classId !== this.currentClassId) {
        return false;
      }

      // Check if already seen (for showOnce cards)
      if (card.showOnce && this.state.seenStoryCardIds.includes(card.id)) {
        return false;
      }

      // Check trigger type
      if (!this.matchesStoryCardTrigger(card, player, context)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if story card matches trigger conditions
   */
  private matchesStoryCardTrigger(
    card: StoryCard,
    player: PlayerState,
    context: {
      nodeType: string;
      bossId?: string;
      isFirstCombat?: boolean;
      isEliteDefeated?: boolean;
      isBossPreFight?: boolean;
      isBossPostFight?: boolean;
    }
  ): boolean {
    const trigger = card.trigger;

    switch (trigger.type) {
      case 'progress':
        return trigger.value !== undefined &&
               this.state.roomsCleared >= trigger.value;

      case 'first_blood':
        return !!context.isFirstCombat && this.state.combatCount === 1;

      case 'pre_boss':
        return !!context.isBossPreFight &&
               (!trigger.bossId || trigger.bossId === context.bossId);

      case 'post_boss':
        return !!context.isBossPostFight &&
               (!trigger.bossId || trigger.bossId === context.bossId);

      case 'health_threshold':
        const hpPercent = player.currentHp / player.maxHp;
        return trigger.hpThreshold !== undefined && hpPercent < trigger.hpThreshold;

      case 'elite_defeated':
        return !!context.isEliteDefeated;

      case 'random':
        const chance = trigger.chance ?? 0.15;
        return this.rng.next() < chance;

      default:
        return false;
    }
  }

  /**
   * Select story card based on priority
   */
  private selectStoryCard(cards: StoryCard[]): StoryCard | null {
    if (cards.length === 0) return null;

    // Sort by priority (highest first)
    const sorted = [...cards].sort((a, b) => b.priority - a.priority);

    // Return highest priority card
    return sorted[0];
  }

  // ===========================================================================
  // COMBAT BONUSES
  // ===========================================================================

  /**
   * Get damage bonus from narrative events
   */
  getDamageBonus(): number {
    return this.state.damageBonus;
  }

  /**
   * Get block bonus from narrative events
   */
  getBlockBonus(): number {
    return this.state.blockBonus;
  }

  /**
   * Get boss-specific damage bonus
   */
  getBossDamageBonus(bossId: string): number {
    return this.state.bossDamageBonuses[bossId] || 0;
  }
}

// Export singleton instance factory
let serviceInstance: NarrativeEventService | null = null;

export function getNarrativeEventService(): NarrativeEventService {
  if (!serviceInstance) {
    serviceInstance = new NarrativeEventService(CharacterClassId.DUNGEON_KNIGHT);
  }
  return serviceInstance;
}

export function initNarrativeEventService(
  classId: CharacterClassId,
  seed?: string
): NarrativeEventService {
  serviceInstance = new NarrativeEventService(classId, seed);
  return serviceInstance;
}
