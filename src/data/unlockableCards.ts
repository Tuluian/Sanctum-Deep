/**
 * Unlockable Cards Data
 *
 * Defines all cards that can be unlocked through narrative progression.
 * Cards are locked behind boss defeats, event choices, achievements, and milestones.
 */

import { CardUnlock } from '@/types/unlocks';
import { CharacterClassId } from '@/types/index';

// =============================================================================
// BOSS DEFEAT UNLOCKS (Any Class)
// =============================================================================

const BOSS_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'shatter_bones',
    triggers: [{ type: 'BOSS_DEFEAT', bossId: 'bonelord' }],
    narrativeText:
      "Lord Vexal's skeleton crumbles. In its fall, you see the weakness of all undead—the joints, the bindings, the hollow core. This knowledge becomes power.",
    hintText: 'Defeat the Bonelord',
  },
  {
    cardId: 'drown_the_darkness',
    triggers: [{ type: 'BOSS_DEFEAT', bossId: 'drowned_king' }],
    narrativeText:
      'Water can purify. You witnessed it firsthand in the flooded depths. The Drowned King fell to his own element.',
    hintText: 'Defeat the Drowned King',
  },
  {
    cardId: 'void_resistance',
    triggers: [{ type: 'BOSS_DEFEAT', bossId: 'hollow_god' }],
    narrativeText:
      'You stared into nothing and nothing blinked first. The void has no power over those who have faced it and survived.',
    hintText: 'Defeat the Hollow God',
  },
];

// =============================================================================
// CLASS-SPECIFIC BOSS DEFEAT UNLOCKS
// =============================================================================

const CLASS_BOSS_UNLOCK_CARDS: CardUnlock[] = [
  // Knight
  {
    cardId: 'lord_vexals_folly',
    triggers: [
      { type: 'BOSS_DEFEAT', bossId: 'bonelord' },
      { type: 'CLASS_BOSS_DEFEAT', bossId: 'bonelord', requiredClass: CharacterClassId.DUNGEON_KNIGHT },
    ],
    narrativeText:
      "He sought immortality through pride. You watched him fall. Let his mistake be your lesson—and your weapon.",
    hintText: 'Defeat the Bonelord as the Dungeon Knight',
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },
  // Cleric
  {
    cardId: 'aldrics_sacrifice',
    triggers: [
      { type: 'BOSS_DEFEAT', bossId: 'drowned_king' },
      { type: 'CLASS_BOSS_DEFEAT', bossId: 'drowned_king', requiredClass: CharacterClassId.CLERIC },
    ],
    narrativeText:
      'He gave everything for love. You understand now what faith truly costs—and what it can give in return.',
    hintText: 'Defeat the Drowned King as the Cleric',
    classRestriction: CharacterClassId.CLERIC,
  },
  // Diabolist
  {
    cardId: 'unmaking_word',
    triggers: [
      { type: 'BOSS_DEFEAT', bossId: 'hollow_god' },
      { type: 'CLASS_BOSS_DEFEAT', bossId: 'hollow_god', requiredClass: CharacterClassId.DIABOLIST },
    ],
    narrativeText:
      "Xan'thrax taught you to destroy. The void taught you what destruction means. Now you know the word that unmakes.",
    hintText: 'Defeat the Hollow God as the Diabolist',
    classRestriction: CharacterClassId.DIABOLIST,
  },
];

// =============================================================================
// EVENT CHOICE UNLOCKS (Universal)
// =============================================================================

const UNIVERSAL_EVENT_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'echo_strike',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'whispering_walls', choiceId: 'listen_closely', outcomeId: 'good' },
    ],
    narrativeText:
      "A dying knight's last thought: the enemy's weakness. The walls whispered their secrets, and you listened.",
    hintText: "Listen to the Whispering Walls and hear wisdom",
  },
  {
    cardId: 'stolen_divinity',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'broken_shrine_act1', choiceId: 'vandalize', outcomeId: 'power' },
    ],
    narrativeText:
      'You smashed the shrine. Power flowed into you—stolen divinity. The dead god had no use for it anyway.',
    hintText: "Vandalize a broken shrine and claim its power",
  },
  {
    cardId: 'merchants_wisdom',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'merchant_ghost', choiceId: 'trade_memory' },
    ],
    narrativeText:
      "The ghost took a happy memory. You can't remember your mother's face. But you gained knowledge worth more than gold.",
    hintText: "Trade a memory with the Ghost Merchant",
  },
  {
    cardId: 'thalassars_blessing',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'coral_throne', choiceId: 'sit_on_throne', outcomeId: 'vision' },
    ],
    narrativeText:
      'You saw the last princess of Thalassar. She told you a secret. The kingdom is gone, but its blessing endures.',
    hintText: "Sit on the Coral Throne and receive a vision",
  },
  {
    cardId: 'self_assurance',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'mirror_self', choiceId: 'refuse' },
    ],
    narrativeText:
      'The reflection nodded. "Maybe that\'s why you\'ll succeed." You are enough as you are.',
    hintText: "Refuse the Mirror Self's offer",
  },
  {
    cardId: 'lyras_blessing',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'wardens_gift', choiceId: 'accept_gift' },
    ],
    narrativeText:
      "Warmth. Light. A healer's blessing, preserved for 347 years. Lyra gave you everything she had left.",
    hintText: "Accept the Warden's gift",
  },
];

// =============================================================================
// CLASS-SPECIFIC EVENT UNLOCKS
// =============================================================================

const CLASS_EVENT_UNLOCK_CARDS: CardUnlock[] = [
  // Cleric
  {
    cardId: 'aldous_final_prayer',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'cleric_prayer_book', choiceId: 'read_new_prayers' },
    ],
    narrativeText:
      'The prayers are different. Deeper. He found faith here, not despite the darkness, but because of it.',
    hintText: "Read Brother Aldous's new prayers",
    classRestriction: CharacterClassId.CLERIC,
  },
  {
    cardId: 'true_faith',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'cleric_silent_chapel', choiceId: 'pray_to_aldous', outcomeId: 'heard' },
    ],
    narrativeText:
      "No words. But warmth. He's proud of you. Even now. Even silent.",
    hintText: "Pray to Brother Aldous in the Silent Chapel and be heard",
    classRestriction: CharacterClassId.CLERIC,
  },

  // Knight
  {
    cardId: 'mentors_wisdom',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'knight_aldric_camp', choiceId: 'finish_sentence' },
    ],
    narrativeText:
      'You write it in your own hand. "Fear is not weakness." His teaching, your truth.',
    hintText: "Finish Ser Aldric's final sentence",
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },
  {
    cardId: 'mentors_technique',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'knight_aldric_camp', choiceId: 'take_journal' },
    ],
    narrativeText:
      'His tactics. His insights. His failures and what he learned from them. The journal is yours now.',
    hintText: "Take Ser Aldric's journal",
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },
  {
    cardId: 'last_stand',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'knight_crystal_mentor', choiceId: 'touch_crystal' },
    ],
    narrativeText:
      "The crystal is warm. He knows you're here. Something transfers. His final technique.",
    hintText: "Touch your mentor's crystal",
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },
  {
    cardId: 'aldrics_forgiveness',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'knight_crystal_mentor', choiceId: 'forgive_him' },
    ],
    narrativeText:
      'The shame on his face softens. Even crystals can cry. Forgiveness is the strongest shield.',
    hintText: "Forgive your mentor for his hesitation",
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },
  {
    cardId: 'sworn_victory',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'knight_crystal_mentor', choiceId: 'promise_victory' },
    ],
    narrativeText:
      "You swear on the Order's seal. On his seal. On everything you are. This oath cannot be broken.",
    hintText: "Promise victory at your mentor's crystal",
    classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  },

  // Diabolist
  {
    cardId: 'devils_leverage',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'diabolist_other_contract', choiceId: 'play_against' },
    ],
    narrativeText:
      "Both devils go silent. The silence of fear. You've bought yourself breathing room.",
    hintText: "Play the devils against each other",
    classRestriction: CharacterClassId.DIABOLIST,
  },

  // Oathsworn
  {
    cardId: 'maras_truth',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'oathsworn_mara_writing', choiceId: 'read_forbidden', outcomeId: 'enlightened' },
    ],
    narrativeText:
      "The truth: the Wardens aren't jailers. They're volunteers. They chose this. Knowledge is power.",
    hintText: "Read Sister Mara's forbidden words",
    classRestriction: CharacterClassId.OATHSWORN,
  },
  {
    cardId: 'reformed_vow',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'oathsworn_oath_stone', choiceId: 'carve_new_oath' },
    ],
    narrativeText:
      '"To guard, but not to cage. To hold, but not to trap. To choose, always." The stone glows with your words.',
    hintText: "Carve a new oath on the Oath Stone",
    classRestriction: CharacterClassId.OATHSWORN,
  },

  // Fey-Touched
  {
    cardId: 'oberons_gift',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'fey_oberons_gambit', choiceId: 'turn_card', outcomeId: 'blessing' },
    ],
    narrativeText:
      'The Ace of Joy. Oberon laughs delightedly. For once, luck was on your side.',
    hintText: "Turn Oberon's card and receive a blessing",
    classRestriction: CharacterClassId.FEY_TOUCHED,
  },
  {
    cardId: 'fey_bargain',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'fey_fairy_ring', choiceId: 'enter_ring' },
    ],
    narrativeText:
      "Oberon is surprised. 'You CAME? Bold little moth.' He offers a second gift—properly this time.",
    hintText: "Enter the Fairy Ring and face Oberon",
    classRestriction: CharacterClassId.FEY_TOUCHED,
  },

  // Celestial
  {
    cardId: 'shared_light',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'celestial_auriel_speaks', choiceId: 'offer_understanding' },
    ],
    narrativeText:
      "Auriel relaxes. For the first time, the light doesn't feel like a leash. Partnership, not possession.",
    hintText: "Offer understanding to Auriel",
    classRestriction: CharacterClassId.CELESTIAL,
  },
  {
    cardId: 'divine_fusion',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'celestial_god_fragment', choiceId: 'merge_permanently' },
    ],
    narrativeText:
      'Auriel settles into you. Not as a parasite—as a partner. You are Seraphina AND something divine.',
    hintText: "Merge permanently with Auriel",
    classRestriction: CharacterClassId.CELESTIAL,
  },

  // Summoner
  {
    cardId: 'ancient_wisp',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'summoner_wisp_memory', choiceId: 'absorb_fragment' },
    ],
    narrativeText:
      "The old wisp joins your family. It's different—older, wiser, sadder. But it's alive again.",
    hintText: "Absorb the ancient wisp fragment",
    classRestriction: CharacterClassId.SUMMONER,
  },
  {
    cardId: 'luminas_light',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'summoner_lumina_returns', choiceId: 'embrace_her' },
    ],
    narrativeText:
      'She flows into you. Part of you again. Where she always belonged. Lumina is home.',
    hintText: "Embrace Lumina when she returns",
    classRestriction: CharacterClassId.SUMMONER,
  },

  // Bargainer
  {
    cardId: 'worth_fighting_for',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'bargainer_lily_prayer', choiceId: 'listen_full_prayer' },
    ],
    narrativeText:
      "She prays for ten minutes. Lists everyone she loves. You're on the list. Third. After her mother and her cat.",
    hintText: "Listen to Lily's full prayer",
    classRestriction: CharacterClassId.BARGAINER,
  },
  {
    cardId: 'void_bargain',
    triggers: [
      { type: 'EVENT_CHOICE', eventId: 'bargainer_final_deal', choiceId: 'open_negotiations' },
    ],
    narrativeText:
      'The void... pauses. It\'s never been addressed this way. "Terms?" it asks. It\'s curious.',
    hintText: "Open negotiations with the Hollow God",
    classRestriction: CharacterClassId.BARGAINER,
  },
];

// =============================================================================
// ACHIEVEMENT UNLOCKS
// =============================================================================

const ACHIEVEMENT_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'one_with_nothing',
    triggers: [{ type: 'ACHIEVEMENT', achievementId: 'empty_hand_victory' }],
    narrativeText:
      'They expected a card. You had none. They expected defeat. You gave them emptiness—and emptiness won.',
    hintText: 'Win a combat with 0 cards in hand',
  },
  {
    cardId: 'endless_resolve',
    triggers: [{ type: 'ACHIEVEMENT', achievementId: 'resolve_spender' }],
    narrativeText:
      'Your will is bottomless. Twenty Resolve spent in a single turn—and you kept going.',
    hintText: 'Spend 20+ Resolve in a single turn',
  },
  {
    cardId: 'untouchable',
    triggers: [{ type: 'ACHIEVEMENT', achievementId: 'flawless_victory' }],
    narrativeText:
      "They couldn't touch you. They never will. Perfect defense is the ultimate offense.",
    hintText: 'Win a combat without taking damage',
  },
  {
    cardId: 'survivors_instinct',
    triggers: [{ type: 'ACHIEVEMENT', achievementId: 'deaths_door_victory' }],
    narrativeText:
      'You came back from the edge. You brought something with you—knowledge of what waits beyond.',
    hintText: "Win a run after triggering Death's Door",
  },
];

// =============================================================================
// MILESTONE UNLOCKS
// =============================================================================

const MILESTONE_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'wardens_whisper',
    triggers: [{ type: 'MILESTONE', milestoneId: 'first_act_3' }],
    narrativeText:
      'The Warden speaks to you now. Listen. Her voice is faint, but her guidance is true.',
    hintText: 'Reach Act 3 for the first time',
  },
  {
    cardId: 'true_ending_glimpse',
    triggers: [{ type: 'MILESTONE', milestoneId: 'first_run_complete' }],
    narrativeText:
      'You know how the story ends. Now learn to change it. Every run is a chance to rewrite fate.',
    hintText: 'Complete a run with any class',
  },
  {
    cardId: 'legacy_of_five',
    triggers: [{ type: 'MILESTONE', milestoneId: 'all_classes_complete' }],
    narrativeText:
      'Every path leads here. Every lesson combines. You have walked in many shoes—now forge your own path.',
    hintText: 'Complete a run with all 5 base classes',
  },
];

// =============================================================================
// DISCOVERY UNLOCKS
// =============================================================================

const DISCOVERY_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'prayer_of_the_lost',
    triggers: [{ type: 'DISCOVERY', eventId: 'find_abandoned_altar' }],
    narrativeText:
      'Someone prayed here once. Their words still echo. You add your voice to theirs.',
    hintText: 'Find the abandoned altar in Act 1',
  },
  {
    cardId: 'thalassars_memory',
    triggers: [{ type: 'DISCOVERY', eventId: 'find_queens_letters' }],
    narrativeText:
      'Love letters from a kingdom that no longer exists. The ink is faded, but the love endures.',
    hintText: "Find the Queen's letters in Act 2",
  },
];

// =============================================================================
// SHRINE CHOICE UNLOCKS
// =============================================================================

const SHRINE_UNLOCK_CARDS: CardUnlock[] = [
  {
    cardId: 'blood_offering',
    triggers: [{ type: 'SHRINE_CHOICE', eventId: 'shrine_sacrifice', choiceId: 'sacrifice_hp' }],
    narrativeText:
      'Your blood drips onto the altar. It doesn\'t disappear—it transforms. Pain becomes something you can give to others.',
    hintText: 'Sacrifice HP at the Shrine of Sacrifice',
  },
  {
    cardId: 'curse_eater',
    triggers: [{ type: 'SHRINE_CHOICE', eventId: 'shrine_shadows', choiceId: 'accept_curse' }],
    narrativeText:
      'You learned to digest darkness. The curse flows through you, but it does not stick.',
    hintText: 'Accept a curse at the Shrine of Shadows',
  },
  {
    cardId: 'fates_gambit',
    triggers: [{ type: 'SHRINE_CHOICE', eventId: 'shrine_fortune', choiceId: 'gamble_win' }],
    narrativeText:
      'Fortune favors the bold—this time. You gambled and won. Luck remembers.',
    hintText: 'Win the gamble at the Shrine of Fortune',
  },
];

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const UNLOCKABLE_CARDS: CardUnlock[] = [
  ...BOSS_UNLOCK_CARDS,
  ...CLASS_BOSS_UNLOCK_CARDS,
  ...UNIVERSAL_EVENT_UNLOCK_CARDS,
  ...CLASS_EVENT_UNLOCK_CARDS,
  ...ACHIEVEMENT_UNLOCK_CARDS,
  ...MILESTONE_UNLOCK_CARDS,
  ...DISCOVERY_UNLOCK_CARDS,
  ...SHRINE_UNLOCK_CARDS,
];

/**
 * Get unlock definition by card ID
 */
export function getUnlockByCardId(cardId: string): CardUnlock | undefined {
  return UNLOCKABLE_CARDS.find((u) => u.cardId === cardId);
}

/**
 * Get all unlocks for a specific class
 */
export function getUnlocksForClass(classId: CharacterClassId): CardUnlock[] {
  return UNLOCKABLE_CARDS.filter(
    (u) => !u.classRestriction || u.classRestriction === classId
  );
}

/**
 * Get all unlocks that require defeating a specific boss
 */
export function getUnlocksForBoss(bossId: string): CardUnlock[] {
  return UNLOCKABLE_CARDS.filter((u) =>
    u.triggers.some((t) =>
      (t.type === 'BOSS_DEFEAT' || t.type === 'CLASS_BOSS_DEFEAT') && t.bossId === bossId
    )
  );
}
