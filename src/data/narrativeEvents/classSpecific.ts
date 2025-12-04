/**
 * Class-Specific Narrative Events
 *
 * Events that are restricted to specific character classes.
 * Based on narrative-events-complete.md
 */

import { NarrativeEvent } from '@/types/narrativeEvents';
import { CharacterClassId } from '@/types/index';

// =============================================================================
// CLERIC (ELARA) EVENTS
// =============================================================================

export const CLERIC_PRAYER_BOOK: NarrativeEvent = {
  id: 'cleric_prayer_book',
  title: "Brother Aldous's Prayer Book",
  act: 2,
  classRestriction: CharacterClassId.CLERIC,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  oncePerRun: true,
  content: {
    text: `Among the drowned relics, you find a prayer book. The handwriting is familiar—it's the same hand that wrote the scriptures you memorized as a novice.

Brother Aldous was here. He wrote prayers in this book. New prayers. Prayers you've never seen.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'read_new_prayers',
      text: 'Read the New Prayers',
      flavorText: 'Learn what he learned.',
      outcomes: [
        {
          id: 'enlightened',
          weight: 100,
          resultText:
            'The prayers are different. Deeper. He found faith here, not despite the darkness, but because of it.',
          rewards: [{ type: 'card_specific', cardId: 'aldous_final_prayer' }],
          unlocksCard: 'aldous_final_prayer',
          // +2 Devotion at start of each combat would need special handling
        },
      ],
    },
    {
      id: 'pray_familiar',
      text: 'Pray the Familiar Prayers',
      flavorText: 'The old ways are enough.',
      outcomes: [
        {
          id: 'comforted',
          weight: 100,
          resultText:
            "The words you know. The faith you trust. It's enough. It always was.",
          rewards: [{ type: 'hp_max', amount: 5 }],
          // +1 Devotion generation per turn would need special handling
        },
      ],
    },
  ],
};

export const CLERIC_SILENT_CHAPEL: NarrativeEvent = {
  id: 'cleric_silent_chapel',
  title: 'The Silent Chapel',
  act: 3,
  classRestriction: CharacterClassId.CLERIC,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 4 },
  oncePerRun: true,
  content: {
    text: `A chapel to Brother Aldous. Built by the Wardens who came after him. A place to remember the god who served.

His crystal is visible through a window. He's preserved. Peaceful. Silent.

You could pray to him. He can't answer. But you could try.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'pray_to_aldous',
      text: 'Pray to Brother Aldous',
      flavorText: 'Hear me, please. One last time.',
      outcomes: [
        {
          id: 'heard',
          weight: 50,
          resultText:
            "No words. But warmth. He's proud of you. Even now. Even silent.",
          rewards: [
            { type: 'hp_heal', amount: 999 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 },
          ],
          unlocksCard: 'true_faith',
        },
        {
          id: 'silence',
          weight: 50,
          resultText:
            "Nothing. Of course nothing. He's gone. But you feel stronger for trying.",
          rewards: [
            { type: 'hp_max', amount: 3 },
            { type: 'gold', amount: 10 },
          ],
        },
      ],
    },
    {
      id: 'say_goodbye',
      text: 'Say Goodbye',
      flavorText: 'Thank you for everything. Rest now.',
      outcomes: [
        {
          id: 'farewell',
          weight: 100,
          resultText:
            'The crystal glows, briefly. A farewell. A blessing. A promise that faith was never wasted.',
          rewards: [
            { type: 'resolve_max', amount: 2 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 10 },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// KNIGHT (VARREN) EVENTS
// =============================================================================

export const KNIGHT_ALDRIC_CAMP: NarrativeEvent = {
  id: 'knight_aldric_camp',
  title: "Ser Aldric's Last Camp",
  act: 1,
  classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  oncePerRun: true,
  content: {
    text: `You recognize the Order's symbols. This was Ser Aldric's camp. Your mentor slept here, fifteen years ago.

His journal lies open on a rock. The last entry is unfinished.

"Tomorrow I face the Bonelord. I am afraid. But fear is not—"

He never finished the sentence.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'finish_sentence',
      text: 'Finish His Sentence',
      flavorText: 'Fear is not weakness.',
      outcomes: [
        {
          id: 'completed',
          weight: 100,
          resultText:
            'You write it in your own hand. His teaching, your truth.',
          rewards: [{ type: 'block_bonus', amount: 3 }],
          unlocksCard: 'mentors_wisdom',
          // Immune to Fear status effects would need special handling
        },
      ],
    },
    {
      id: 'take_journal',
      text: 'Take His Journal',
      flavorText: 'His words should live on.',
      outcomes: [
        {
          id: 'inherited',
          weight: 100,
          resultText:
            'His tactics. His insights. His failures and what he learned from them.',
          rewards: [{ type: 'card_specific', cardId: 'mentors_technique' }],
          unlocksCard: 'mentors_technique',
        },
      ],
    },
    {
      id: 'leave_it',
      text: 'Leave It',
      flavorText: 'Let his words rest where he left them.',
      outcomes: [
        {
          id: 'respectful',
          weight: 100,
          resultText:
            'Some things are private. Even from those who loved him.',
          rewards: [{ type: 'hp_max', amount: 5 }],
        },
      ],
    },
  ],
};

export const KNIGHT_CRYSTAL_MENTOR: NarrativeEvent = {
  id: 'knight_crystal_mentor',
  title: 'The Crystallized Knight',
  act: 3,
  classRestriction: CharacterClassId.DUNGEON_KNIGHT,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 2 },
  oncePerRun: true,
  content: {
    text: `Ser Aldric's crystal. He's here. Preserved. The expression on his face is shame.

The Warden said he hesitated. For one moment, he wanted the peace.

You can see it. The moment captured forever. Your mentor, wanting to give up.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'touch_crystal',
      text: 'Touch the Crystal',
      flavorText: "I'm here, mentor. I came for you.",
      outcomes: [
        {
          id: 'connection',
          weight: 100,
          resultText:
            "The crystal is warm. He knows you're here. He can't speak, but... something transfers. His final technique.",
          rewards: [{ type: 'card_specific', cardId: 'last_stand' }],
          unlocksCard: 'last_stand',
        },
      ],
    },
    {
      id: 'forgive_him',
      text: 'Forgive Him',
      flavorText: "It's okay. Hesitation isn't failure.",
      outcomes: [
        {
          id: 'forgiveness',
          weight: 100,
          resultText:
            'The shame on his face softens. Even crystals can cry.',
          rewards: [
            { type: 'hp_max', amount: 10 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 },
          ],
          unlocksCard: 'aldrics_forgiveness',
        },
      ],
    },
    {
      id: 'promise_victory',
      text: 'Promise Victory',
      flavorText: "I'll finish what you started.",
      outcomes: [
        {
          id: 'oath',
          weight: 100,
          resultText:
            "You swear on the Order's seal. On his seal. On everything you are.",
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 15 }],
          unlocksCard: 'sworn_victory',
          // Defeat screen would show Aldric's disappointment - special handling needed
        },
      ],
    },
  ],
};

// =============================================================================
// DIABOLIST (MORDECAI) EVENTS
// =============================================================================

export const DIABOLIST_XANTHRAX_VOICE: NarrativeEvent = {
  id: 'diabolist_xanthrax_voice',
  title: "Xan'thrax's Voice",
  act: 1,
  classRestriction: CharacterClassId.DIABOLIST,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.2 },
  content: {
    text: `The devil's voice, distant but clear.

"Having fun, little mageling? Remember: every soul you take, I get a percentage. Keep killing. Keep feeding me."

He laughs. You can feel the contract pulse.`,
    speakerName: "Xan'thrax",
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'spit_defiance',
      text: 'Spit Defiance',
      flavorText: 'Go to hell. Oh wait—',
      outcomes: [
        {
          id: 'amused',
          weight: 100,
          resultText:
            "He laughs harder. 'I like you. That's why I chose you.' The contract burns, but you feel stronger.",
          penalties: [{ type: 'hp_loss', amount: 3 }],
          rewards: [{ type: 'damage_bonus', amount: 2 }],
        },
      ],
    },
    {
      id: 'negotiate',
      text: 'Negotiate',
      flavorText: 'What if I brought you something better than a fragment?',
      outcomes: [
        {
          id: 'intrigued',
          weight: 100,
          resultText:
            "\"'Better?' He pauses. 'I'm listening.' The contract relaxes slightly.\"",
          // Soul Debt maximum increased would need special handling
        },
      ],
    },
    {
      id: 'ignore_him',
      text: 'Ignore Him',
      flavorText: 'Not worth my time.',
      outcomes: [
        {
          id: 'annoyed',
          weight: 100,
          resultText:
            "\"'Rude.' A small punishment—your next Pain card deals 2 damage instead of 1.\"",
          // Pain card modification would need special handling
        },
      ],
    },
  ],
};

export const DIABOLIST_OTHER_CONTRACT: NarrativeEvent = {
  id: 'diabolist_other_contract',
  title: 'The Other Contractor',
  act: 2,
  classRestriction: CharacterClassId.DIABOLIST,
  rarity: 'rare',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  oncePerRun: true,
  content: {
    text: `Another devil's mark. Not Xan'thrax—something older. Something he fears.

"Child of Xan'thrax," a new voice purrs. "Your contractor has enemies. I could... intervene."

This is dangerous. This is opportunity.`,
    speakerName: 'Unknown Devil',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'hear_offer',
      text: 'Hear the Offer',
      flavorText: 'What do you want?',
      outcomes: [
        {
          id: 'deal',
          weight: 100,
          resultText:
            '"Kill Xan\'thrax\'s hold. Sign with me instead." A new contract appears. Better terms. Different trap.',
          // Remove Pain cards, add Debt cards would need special handling
        },
      ],
    },
    {
      id: 'play_against',
      text: 'Play Them Against Each Other',
      flavorText: "Xan'thrax would pay well to know you're here.",
      outcomes: [
        {
          id: 'leverage',
          weight: 100,
          resultText:
            "Both devils go silent. The silence of fear. You've bought yourself breathing room.",
          rewards: [{ type: 'hp_max', amount: 5 }],
          unlocksCard: 'devils_leverage',
          // Soul Debt cap removed would need special handling
        },
      ],
    },
    {
      id: 'refuse_both',
      text: 'Refuse Both',
      flavorText: "I'm done making deals with devils.",
      outcomes: [
        {
          id: 'respect',
          weight: 100,
          resultText:
            'Both voices laugh—but nervously. A mortal refusing power? Unheard of.',
          rewards: [
            { type: 'damage_bonus', amount: 3 },
            { type: 'block_bonus', amount: 3 },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// OATHSWORN (CALLISTA) EVENTS
// =============================================================================

export const OATHSWORN_MARA_WRITING: NarrativeEvent = {
  id: 'oathsworn_mara_writing',
  title: "Sister Mara's Writing",
  act: 1,
  classRestriction: CharacterClassId.OATHSWORN,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  oncePerRun: true,
  content: {
    text: `Words carved into the wall. You recognize the hand—Sister Mara's scripture.

But these words aren't in the Order's texts. These are her private thoughts.

"The truth burns. But some things should burn. Some truths are too dangerous to speak. I'm writing them here instead."`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'read_forbidden',
      text: 'Read the Forbidden Words',
      flavorText: 'The Order deserves to know everything.',
      outcomes: [
        {
          id: 'enlightened',
          weight: 70,
          resultText:
            "The truth: the Wardens aren't jailers. They're *volunteers*. They chose this. Mara couldn't accept that.",
          rewards: [
            { type: 'resolve_max', amount: 1 },
            { type: 'boss_damage_bonus', bossId: 'bonelord', amount: 5 },
            { type: 'boss_damage_bonus', bossId: 'drowned_king', amount: 5 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 },
          ],
          unlocksCard: 'maras_truth',
        },
        {
          id: 'shattered',
          weight: 30,
          resultText:
            'The truth: Mara founded the Order as revenge. She wanted the Sanctum destroyed because it rejected her.',
          penalties: [{ type: 'hp_max_loss', amount: 5 }],
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 10 }],
        },
      ],
    },
    {
      id: 'destroy_writing',
      text: 'Destroy the Writing',
      flavorText: 'Some truths should stay buried.',
      outcomes: [
        {
          id: 'protected',
          weight: 100,
          resultText:
            "You scrape the words away. The Order's faith is safe. Your certainty returns.",
          rewards: [
            { type: 'hp_max', amount: 5 },
            { type: 'block_bonus', amount: 3 },
          ],
        },
      ],
    },
  ],
};

export const OATHSWORN_OATH_STONE: NarrativeEvent = {
  id: 'oathsworn_oath_stone',
  title: 'The Oath Stone',
  act: 3,
  classRestriction: CharacterClassId.OATHSWORN,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  oncePerRun: true,
  content: {
    text: `A stone where Wardens swore their vows. Names carved into it, dating back millennia.

There's space for one more name.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'carve_name',
      text: 'Carve Your Name',
      flavorText: "I'll take the oath. Whatever it costs.",
      outcomes: [
        {
          id: 'sworn',
          weight: 100,
          resultText:
            'Your name joins theirs. The stone accepts you. Power flows—and obligation.',
          rewards: [
            { type: 'resolve_max', amount: 2 },
            { type: 'hp_max', amount: 10 },
          ],
          // Must become Warden ending - special handling needed
        },
      ],
    },
    {
      id: 'carve_new_oath',
      text: 'Carve a New Oath',
      flavorText: 'The old vows need updating.',
      outcomes: [
        {
          id: 'reformed',
          weight: 100,
          resultText:
            'You write: "To guard, but not to cage. To hold, but not to trap. To choose, always." The stone glows.',
          rewards: [{ type: 'damage_bonus', amount: 3 }],
          unlocksCard: 'reformed_vow',
        },
      ],
    },
    {
      id: 'leave_blank',
      text: 'Leave It Blank',
      flavorText: "I'm not ready for vows.",
      outcomes: [
        {
          id: 'free',
          weight: 100,
          resultText:
            'No binding. No obligation. Just you, choosing moment by moment.',
          rewards: [{ type: 'hp_heal', amount: 999 }],
        },
      ],
    },
  ],
};

// =============================================================================
// FEY-TOUCHED (WREN) EVENTS
// =============================================================================

export const FEY_OBERONS_GAMBIT: NarrativeEvent = {
  id: 'fey_oberons_gambit',
  title: "Oberon's Gambit",
  act: 1,
  classRestriction: CharacterClassId.FEY_TOUCHED,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.2 },
  content: {
    text: `A card appears in midair. A game piece. Oberon's voice, dripping with amusement.

"A little gift, Wren. A gamble. Turn it over, and something happens. Maybe good. Maybe bad. Won't that be fun?"

You hate him. But curiosity is a curse.`,
    speakerName: 'Oberon',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'turn_card',
      text: 'Turn the Card',
      flavorText: "Fine. Let's play.",
      outcomes: [
        {
          id: 'blessing',
          weight: 25,
          resultText:
            'The Ace of Joy. Oberon laughs delightedly.',
          rewards: [
            { type: 'hp_max', amount: 10 },
            { type: 'hp_heal', amount: 999 },
          ],
          unlocksCard: 'oberons_gift',
          // Draw 2 cards at start of each combat would need special handling
        },
        {
          id: 'curse',
          weight: 25,
          resultText:
            'The Ace of Tears. Oberon laughs cruelly.',
          penalties: [
            { type: 'hp_max_loss', amount: 10 },
            { type: 'curse_card', curseId: 'bad_luck' },
            { type: 'curse_card', curseId: 'bad_luck' },
          ],
        },
        {
          id: 'nothing',
          weight: 50,
          resultText:
            'A blank card. "Maybe next time," Oberon giggles.',
        },
      ],
    },
    {
      id: 'burn_card',
      text: 'Burn the Card',
      flavorText: "I don't play your games.",
      outcomes: [
        {
          id: 'spite',
          weight: 100,
          resultText:
            "Oberon gasps in mock offense. 'So RUDE!' But you feel freer.",
          rewards: [{ type: 'damage_bonus', amount: 3 }],
        },
      ],
    },
  ],
};

export const FEY_FAIRY_RING: NarrativeEvent = {
  id: 'fey_fairy_ring',
  title: 'The Fairy Ring',
  act: 2,
  classRestriction: CharacterClassId.FEY_TOUCHED,
  rarity: 'rare',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  oncePerRun: true,
  content: {
    text: `A fairy ring. Mushrooms in a perfect circle. Stepping inside would take you... somewhere else.

Oberon's domain. His court. Where you were marked.

You could go back. Demand answers. Or burn the whole thing down.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'enter_ring',
      text: 'Enter the Ring',
      flavorText: 'I have questions.',
      outcomes: [
        {
          id: 'audience',
          weight: 100,
          resultText:
            "Oberon is surprised. 'You CAME? Bold little moth.' He offers a second gift—properly this time.",
          rewards: [{ type: 'resolve_max', amount: 3 }],
          unlocksCard: 'fey_bargain',
          // Choice of rewards would need special UI handling
        },
      ],
    },
    {
      id: 'burn_ring',
      text: 'Burn the Ring',
      flavorText: "I'm done with fey games.",
      outcomes: [
        {
          id: 'destruction',
          weight: 100,
          resultText:
            "The mushrooms burn. Oberon SCREAMS. 'You'll PAY for that!' Worth it.",
          rewards: [{ type: 'damage_bonus', amount: 5 }],
          // Extra elite encounter would need special handling
        },
      ],
    },
    {
      id: 'step_over',
      text: 'Step Over It',
      flavorText: 'Nice try.',
      outcomes: [
        {
          id: 'caution',
          weight: 100,
          resultText:
            "The ring fades, unused. Oberon sighs. 'Boring.'",
          rewards: [{ type: 'hp_max', amount: 3 }],
        },
      ],
    },
  ],
};

// =============================================================================
// CELESTIAL (SERAPHINA) EVENTS
// =============================================================================

export const CELESTIAL_AURIEL_SPEAKS: NarrativeEvent = {
  id: 'celestial_auriel_speaks',
  title: 'Auriel Speaks',
  act: 1,
  classRestriction: CharacterClassId.CELESTIAL,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.2 },
  content: {
    text: `The fragment stirs. Auriel, for the first time, speaks *with* you instead of *at* you.

"You're afraid of me. I understand. But... I'm afraid too. The void took my god. I don't want to go back to the nothing."

It's not asking forgiveness. It's asking for understanding.`,
    speakerName: 'Auriel',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'offer_understanding',
      text: 'Offer Understanding',
      flavorText: 'I know what it\'s like to be afraid.',
      outcomes: [
        {
          id: 'partnership',
          weight: 100,
          resultText:
            "Auriel relaxes. For the first time, the light doesn't feel like a leash.",
          unlocksCard: 'shared_light',
          // +2 Radiance at start of combat, Radiance cap increased would need special handling
        },
      ],
    },
    {
      id: 'demand_answers',
      text: 'Demand Answers',
      flavorText: 'Why did you choose me?',
      outcomes: [
        {
          id: 'truth',
          weight: 100,
          resultText:
            '"Because you were empty. Lost. Like me. I thought we could fill each other." Honest, at least.',
          rewards: [{ type: 'hp_max', amount: 5 }],
          // +1 Radiance generation per turn would need special handling
        },
      ],
    },
    {
      id: 'remain_cold',
      text: 'Remain Cold',
      flavorText: "I don't care about your fear.",
      outcomes: [
        {
          id: 'distance',
          weight: 100,
          resultText:
            'Auriel goes silent. The light is yours to command, but colder.',
          rewards: [{ type: 'damage_bonus', amount: 3 }],
          penalties: [{ type: 'hp_max_loss', amount: 3 }],
          // Divine Form requires 12 Radiance would need special handling
        },
      ],
    },
  ],
};

export const CELESTIAL_GOD_FRAGMENT: NarrativeEvent = {
  id: 'celestial_god_fragment',
  title: "The God of Dawn's Fragment",
  act: 3,
  classRestriction: CharacterClassId.CELESTIAL,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 3 },
  oncePerRun: true,
  content: {
    text: `You find it. The crystallized remains of the God of Dawn. Auriel's source.

Auriel is weeping. Not with sound—with light. Golden tears streaming through you.

"My god. My home. We were so beautiful once."

You have a choice to make.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'release_auriel',
      text: 'Release Auriel to the Crystal',
      flavorText: 'Go home. Be whole again.',
      outcomes: [
        {
          id: 'mercy',
          weight: 100,
          resultText:
            'Auriel flows out of you. The crystal glows brighter. You feel... empty. But free.',
          rewards: [
            { type: 'hp_max', amount: 10 },
            { type: 'damage_bonus', amount: 5 },
            { type: 'resolve_max', amount: 2 },
          ],
          // Lose all Radiance mechanics would need special handling
        },
      ],
    },
    {
      id: 'merge_permanently',
      text: 'Merge with Auriel Permanently',
      flavorText: "We're stronger together.",
      outcomes: [
        {
          id: 'fusion',
          weight: 100,
          resultText:
            'Auriel settles into you. Not as a parasite—as a partner. You are Seraphina AND something divine.',
          unlocksCard: 'divine_fusion',
          // Radiance cap removed, +5 Radiance at start, Divine Form +3 damage would need special handling
        },
      ],
    },
    {
      id: 'keep_status_quo',
      text: 'Keep Things as They Are',
      flavorText: "I'm not ready to decide.",
      outcomes: [
        {
          id: 'status_quo',
          weight: 100,
          resultText:
            "Auriel accepts. 'When you're ready. If you're ever ready.' The choice remains open.",
          rewards: [
            { type: 'hp_max', amount: 5 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// SUMMONER (CAELUM) EVENTS
// =============================================================================

export const SUMMONER_WISP_MEMORY: NarrativeEvent = {
  id: 'summoner_wisp_memory',
  title: "The Wisp's Memory",
  act: 1,
  classRestriction: CharacterClassId.SUMMONER,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.2 },
  content: {
    text: `Your wisps find something—a fragment of consciousness, old and faded. A wisp that died here long ago.

Your children gather around it. They're... singing? Mourning?

They want you to absorb it. To give it form again through you.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'absorb_fragment',
      text: 'Absorb the Fragment',
      flavorText: 'Every consciousness deserves another chance.',
      outcomes: [
        {
          id: 'rebirth',
          weight: 100,
          resultText:
            "The old wisp joins your family. It's different—older, wiser, sadder. But it's alive again.",
          unlocksCard: 'ancient_wisp',
          // Gain 'Ancient Wisp' minion option would need special handling
        },
      ],
    },
    {
      id: 'let_rest',
      text: 'Let It Rest',
      flavorText: 'Some things should stay at peace.',
      outcomes: [
        {
          id: 'peace',
          weight: 100,
          resultText:
            'The fragment fades. Your wisps sing it to sleep. They seem... proud of you.',
          // +1 to all minion HP/damage permanently would need special handling
        },
      ],
    },
  ],
};

export const SUMMONER_LUMINA_RETURNS: NarrativeEvent = {
  id: 'summoner_lumina_returns',
  title: 'Lumina Returns',
  act: 3,
  classRestriction: CharacterClassId.SUMMONER,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 4 },
  oncePerRun: true,
  content: {
    text: `A spark of light in the darkness. A familiar warmth.

"Father? Father, is that you?"

Lumina. Your first wisp. The one who died protecting you. She's here. Preserved by love. Waiting.`,
    speakerName: 'Lumina',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'embrace_her',
      text: 'Embrace Her',
      flavorText: 'Lumina. My light. I found you.',
      outcomes: [
        {
          id: 'reunion',
          weight: 100,
          resultText:
            'She flows into you. Part of you again. Where she always belonged.',
          unlocksCard: 'luminas_light',
          // Lumina becomes permanent companion would need special handling
        },
      ],
    },
    {
      id: 'set_free',
      text: 'Set Her Free',
      flavorText: "You don't have to stay. You've earned rest.",
      outcomes: [
        {
          id: 'freedom',
          weight: 100,
          resultText:
            '"But... father... I want to stay." She looks at you with pure love. "Let me stay. Please."',
          rewards: [
            { type: 'hp_max', amount: 10 },
            { type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 },
          ],
          // Player can insist on freedom or let her stay - special handling needed
        },
      ],
    },
  ],
};

// =============================================================================
// BARGAINER (VESPER) EVENTS
// =============================================================================

export const BARGAINER_MALACHAR_RAGE: NarrativeEvent = {
  id: 'bargainer_malachar_rage',
  title: "Malachar's Rage",
  act: 1,
  classRestriction: CharacterClassId.BARGAINER,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.2 },
  content: {
    text: `The devil's screams at the barrier intensify.

"YOU THINK WALLS CAN SAVE YOU? I HAVE ETERNITY! I HAVE PATIENCE! THE MOMENT YOU STEP OUTSIDE—"

He's terrified. Desperate. A devil, scared of losing.

You could torment him. Or you could focus.`,
    speakerName: 'Malachar',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'taunt_him',
      text: 'Taunt Him',
      flavorText: "How's it feel to lose, Malachar?",
      outcomes: [
        {
          id: 'rage',
          weight: 100,
          resultText:
            "His screams become incoherent. It's... satisfying.",
          rewards: [
            { type: 'damage_bonus', amount: 3 },
            { type: 'hp_heal', amount: 10 },
          ],
        },
      ],
    },
    {
      id: 'negotiate',
      text: 'Negotiate',
      flavorText: 'We could make a new deal.',
      outcomes: [
        {
          id: 'intrigued',
          weight: 100,
          resultText:
            '"...I\'m listening." He stops screaming. "What do you want?" The barriers don\'t let deals through, but he doesn\'t know that.',
          rewards: [{ type: 'damage_bonus', amount: 3 }],
        },
      ],
    },
    {
      id: 'ignore_him',
      text: 'Ignore Him',
      flavorText: 'Not worth my time.',
      outcomes: [
        {
          id: 'focus',
          weight: 100,
          resultText:
            'You focus inward. His screams fade to background noise.',
          rewards: [{ type: 'hp_max', amount: 5 }],
        },
      ],
    },
  ],
};

export const BARGAINER_LILY_PRAYER: NarrativeEvent = {
  id: 'bargainer_lily_prayer',
  title: "The Child's Prayer",
  act: 2,
  classRestriction: CharacterClassId.BARGAINER,
  rarity: 'rare',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  oncePerRun: true,
  content: {
    text: `A whisper reaches you. Not Malachar. Something pure.

"Dear kind lady who saved me, please be okay. I pray for you every night. Please come home."

Lily. The child you saved. She's praying for you.

Malachar was telling the truth—she's sick. But she's still praying. For you.`,
    speakerName: 'Lily',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'listen_full_prayer',
      text: 'Listen to the Full Prayer',
      flavorText: 'Let me hear it.',
      outcomes: [
        {
          id: 'love',
          weight: 100,
          resultText:
            "She prays for ten minutes. Lists everyone she loves. You're on the list. Third. After her mother and her cat.",
          rewards: [
            { type: 'hp_heal', amount: 999 },
            { type: 'hp_max', amount: 5 },
          ],
          unlocksCard: 'worth_fighting_for',
        },
      ],
    },
    {
      id: 'send_response',
      text: 'Send a Response',
      flavorText: "I'm okay. I'm coming home.",
      outcomes: [
        {
          id: 'message',
          weight: 100,
          resultText:
            "Something in the Sanctum carries your words. You don't know if she'll hear them. But you had to try.",
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 10 }],
          // Must choose 'Leave' ending - special handling needed
        },
      ],
    },
    {
      id: 'close_connection',
      text: 'Close the Connection',
      flavorText: "I can't be distracted. Not now.",
      outcomes: [
        {
          id: 'focus',
          weight: 100,
          resultText:
            'The prayer fades. You feel cold. But focused.',
          rewards: [
            { type: 'damage_bonus', amount: 3 },
            { type: 'resolve_max', amount: 1 },
          ],
        },
      ],
    },
  ],
};

export const BARGAINER_FINAL_DEAL: NarrativeEvent = {
  id: 'bargainer_final_deal',
  title: 'The Final Negotiation',
  act: 3,
  classRestriction: CharacterClassId.BARGAINER,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 6 },
  oncePerRun: true,
  content: {
    text: `The Hollow God's presence, before the final battle.

You've been thinking about this. Devils. Contracts. Fair exchange.

What if you could make a deal with the void?

Not fighting. *Negotiating*.`,
    speakerType: 'character',
  },
  choices: [
    {
      id: 'open_negotiations',
      text: 'Open Negotiations',
      flavorText: 'I want to propose terms.',
      outcomes: [
        {
          id: 'listening',
          weight: 100,
          resultText:
            'The void... pauses. It\'s never been addressed this way. "Terms?" it asks. It\'s curious.',
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 20 }],
          unlocksCard: 'void_bargain',
          // Special dialogue options in boss fight would need handling
        },
      ],
    },
    {
      id: 'prepare_combat',
      text: 'Prepare for Combat',
      flavorText: "Some things can't be negotiated.",
      outcomes: [
        {
          id: 'ready',
          weight: 100,
          resultText:
            "You're a bargainer. But some deals aren't worth making.",
          rewards: [
            { type: 'damage_bonus', amount: 5 },
            { type: 'hp_max', amount: 5 },
          ],
        },
      ],
    },
    {
      id: 'offer_self',
      text: 'Offer Yourself',
      flavorText: "What if I traded myself for everyone it's consumed?",
      outcomes: [
        {
          id: 'consideration',
          weight: 100,
          resultText:
            '"...interesting. You would unmake yourself to remake others?" The void is genuinely confused.',
          // Special defeat screen would need handling
        },
      ],
    },
  ],
};

// =============================================================================
// EXPORT ALL CLASS-SPECIFIC EVENTS
// =============================================================================

export const CLASS_SPECIFIC_EVENTS: NarrativeEvent[] = [
  // Cleric
  CLERIC_PRAYER_BOOK,
  CLERIC_SILENT_CHAPEL,
  // Knight
  KNIGHT_ALDRIC_CAMP,
  KNIGHT_CRYSTAL_MENTOR,
  // Diabolist
  DIABOLIST_XANTHRAX_VOICE,
  DIABOLIST_OTHER_CONTRACT,
  // Oathsworn
  OATHSWORN_MARA_WRITING,
  OATHSWORN_OATH_STONE,
  // Fey-Touched
  FEY_OBERONS_GAMBIT,
  FEY_FAIRY_RING,
  // Celestial
  CELESTIAL_AURIEL_SPEAKS,
  CELESTIAL_GOD_FRAGMENT,
  // Summoner
  SUMMONER_WISP_MEMORY,
  SUMMONER_LUMINA_RETURNS,
  // Bargainer
  BARGAINER_MALACHAR_RAGE,
  BARGAINER_LILY_PRAYER,
  BARGAINER_FINAL_DEAL,
];
