/**
 * Event Unlock Mappings
 *
 * Maps narrative events and their choices to card unlocks.
 * Used by NarrativeEventService to trigger CardUnlockService appropriately.
 */

/**
 * Maps event IDs to their choices and the cards they unlock.
 * Format: eventId -> { choiceId -> cardId } or { choiceId:outcomeId -> cardId }
 */
export const EVENT_UNLOCK_MAPPINGS: Record<string, Record<string, string>> = {
  // ==========================================================================
  // UNIVERSAL EVENTS (Act 1)
  // ==========================================================================

  whispering_walls: {
    listen_closely_good: 'echo_strike',
  },

  broken_shrine_act1: {
    vandalize_power: 'stolen_divinity',
  },

  merchant_ghost: {
    trade_memory: 'merchants_wisdom',
  },

  // ==========================================================================
  // UNIVERSAL EVENTS (Act 2)
  // ==========================================================================

  coral_throne: {
    sit_on_throne_vision: 'thalassars_blessing',
  },

  // ==========================================================================
  // UNIVERSAL EVENTS (Act 3)
  // ==========================================================================

  mirror_self: {
    refuse: 'self_assurance',
  },

  wardens_gift: {
    accept_gift: 'lyras_blessing',
  },

  // ==========================================================================
  // CLERIC EVENTS
  // ==========================================================================

  cleric_prayer_book: {
    read_new_prayers: 'aldous_final_prayer',
  },

  cleric_silent_chapel: {
    pray_to_aldous_heard: 'true_faith',
  },

  // ==========================================================================
  // KNIGHT EVENTS
  // ==========================================================================

  knight_aldric_camp: {
    finish_sentence: 'mentors_wisdom',
    take_journal: 'mentors_technique',
  },

  knight_crystal_mentor: {
    touch_crystal: 'last_stand',
    forgive_him: 'aldrics_forgiveness',
    promise_victory: 'sworn_victory',
  },

  // ==========================================================================
  // DIABOLIST EVENTS
  // ==========================================================================

  diabolist_other_contract: {
    play_against: 'devils_leverage',
  },

  // ==========================================================================
  // OATHSWORN EVENTS
  // ==========================================================================

  oathsworn_mara_writing: {
    read_forbidden_enlightened: 'maras_truth',
  },

  oathsworn_oath_stone: {
    carve_new_oath: 'reformed_vow',
  },

  // ==========================================================================
  // FEY-TOUCHED EVENTS
  // ==========================================================================

  fey_oberons_gambit: {
    turn_card_blessing: 'oberons_gift',
  },

  fey_fairy_ring: {
    enter_ring: 'fey_bargain',
  },

  // ==========================================================================
  // CELESTIAL EVENTS
  // ==========================================================================

  celestial_auriel_speaks: {
    offer_understanding: 'shared_light',
  },

  celestial_god_fragment: {
    merge_permanently: 'divine_fusion',
  },

  // ==========================================================================
  // SUMMONER EVENTS
  // ==========================================================================

  summoner_wisp_memory: {
    absorb_fragment: 'ancient_wisp',
  },

  summoner_lumina_returns: {
    embrace_her: 'luminas_light',
  },

  // ==========================================================================
  // BARGAINER EVENTS
  // ==========================================================================

  bargainer_lily_prayer: {
    listen_full_prayer: 'worth_fighting_for',
  },

  bargainer_final_deal: {
    open_negotiations: 'void_bargain',
  },
};

/**
 * Get the card ID that should be unlocked for a given event choice.
 *
 * @param eventId - The narrative event ID
 * @param choiceId - The choice ID selected
 * @param outcomeId - Optional outcome ID (for weighted outcomes)
 * @returns The card ID to unlock, or undefined if no unlock
 */
export function getUnlockForEventChoice(
  eventId: string,
  choiceId: string,
  outcomeId?: string
): string | undefined {
  const eventMappings = EVENT_UNLOCK_MAPPINGS[eventId];
  if (!eventMappings) {
    return undefined;
  }

  // Try most specific key first (with outcome)
  if (outcomeId) {
    const specificKey = `${choiceId}_${outcomeId}`;
    if (eventMappings[specificKey]) {
      return eventMappings[specificKey];
    }
  }

  // Fall back to choice-only key
  return eventMappings[choiceId];
}

/**
 * Get all card IDs that can be unlocked through events
 */
export function getAllEventUnlockableCards(): string[] {
  const cards = new Set<string>();

  for (const eventMappings of Object.values(EVENT_UNLOCK_MAPPINGS)) {
    for (const cardId of Object.values(eventMappings)) {
      cards.add(cardId);
    }
  }

  return Array.from(cards);
}
