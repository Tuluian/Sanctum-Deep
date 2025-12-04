/**
 * Universal Narrative Events
 *
 * Events that can be encountered by any class.
 * Based on narrative-events-complete.md
 */

import { NarrativeEvent } from '@/types/narrativeEvents';

// =============================================================================
// ACT 1 — THE ENTRANCE HALLS
// =============================================================================

export const ABANDONED_CAMP: NarrativeEvent = {
  id: 'abandoned_camp',
  title: 'The Abandoned Camp',
  act: 1,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  content: {
    text: `You find the remains of a camp. Bedrolls, scattered supplies, the cold ashes of a fire that died days ago.

Someone made it this far. They didn't make it further.

Among the scattered belongings, you find useful items.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'search_packs',
      text: 'Search the Packs',
      flavorText: 'There might be supplies worth taking.',
      outcomes: [
        {
          id: 'good',
          weight: 60,
          resultText: 'You find healing herbs and preserved rations.',
          rewards: [{ type: 'hp_max', amount: 5 }],
        },
        {
          id: 'neutral',
          weight: 30,
          resultText:
            "Mostly personal effects. A letter never sent. A lock of hair.",
        },
        {
          id: 'bad',
          weight: 10,
          resultText: 'Something was hiding in the pack. It bites.',
          penalties: [{ type: 'hp_loss', amount: 3 }],
          rewards: [{ type: 'gold', amount: 15 }],
        },
      ],
    },
    {
      id: 'moment_of_silence',
      text: 'Take a Moment of Silence',
      flavorText: 'Honor the fallen.',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText:
            'You say words for the dead. The Sanctum feels slightly less hostile.',
          rewards: [{ type: 'hp_heal', amount: 8 }],
        },
      ],
    },
    {
      id: 'move_on',
      text: 'Move On',
      flavorText: 'Nothing here but ghosts.',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText: 'You leave the dead to their rest.',
        },
      ],
    },
  ],
};

export const WHISPERING_WALLS: NarrativeEvent = {
  id: 'whispering_walls',
  title: 'The Whispering Walls',
  act: 1,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  content: {
    text: `The stones here whisper. Not words—impressions. Fragments of final thoughts from those who died against this wall.

You could listen. You could learn.

Or you could preserve your sanity.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'listen_closely',
      text: 'Listen Closely',
      flavorText: 'Knowledge is power.',
      outcomes: [
        {
          id: 'good',
          weight: 50,
          resultText:
            "A dying knight's last thought: the enemy's weakness. You understand.",
          rewards: [{ type: 'damage_bonus', amount: 2 }],
          unlocksCard: 'echo_strike',
        },
        {
          id: 'bad',
          weight: 50,
          resultText:
            'Too many voices. Too much pain. You tear yourself away, shaken.',
          penalties: [{ type: 'hp_loss', amount: 5 }],
          rewards: [{ type: 'card_random' }],
        },
      ],
    },
    {
      id: 'touch_wall',
      text: 'Touch the Wall',
      flavorText: 'Feel what they felt.',
      outcomes: [
        {
          id: 'good',
          weight: 40,
          resultText: "A memory of comfort. Someone's last thought of home.",
          rewards: [{ type: 'hp_heal', amount: 10 }],
        },
        {
          id: 'neutral',
          weight: 40,
          resultText: 'Static. The wall has forgotten.',
        },
        {
          id: 'bad',
          weight: 20,
          resultText: 'PAIN. Someone died badly here.',
          penalties: [{ type: 'hp_loss', amount: 8 }],
        },
      ],
    },
    {
      id: 'walk_past',
      text: 'Walk Past',
      flavorText: "Some knowledge isn't worth having.",
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText:
            "The whispers fade as you leave. Was that disappointment?",
        },
      ],
    },
  ],
};

export const BROKEN_SHRINE_ACT1: NarrativeEvent = {
  id: 'broken_shrine_act1',
  title: 'The Broken Shrine',
  act: 1,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  content: {
    text: `A small shrine, half-collapsed. The deity's face has been scratched out—deliberately, violently.

But the offering bowl still glows faintly. Something divine lingers.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'make_offering',
      text: 'Make an Offering',
      flavorText: 'Faith requires sacrifice.',
      hpCost: 5,
      outcomes: [
        {
          id: 'blessed',
          weight: 60,
          resultText: 'Light warms you. The shrine accepts.',
          rewards: [
            { type: 'resolve_max', amount: 1 },
            { type: 'hp_heal', amount: 999 }, // Heal to full
          ],
        },
        {
          id: 'ignored',
          weight: 40,
          resultText: 'Nothing happens. The god is truly gone.',
        },
      ],
    },
    {
      id: 'pray_without_offering',
      text: 'Pray Without Offering',
      flavorText: 'Words should be enough.',
      outcomes: [
        {
          id: 'heard',
          weight: 30,
          resultText: 'Something stirs. A whisper of blessing.',
          rewards: [{ type: 'hp_max', amount: 3 }],
        },
        {
          id: 'silence',
          weight: 70,
          resultText: 'Silence. Faith without sacrifice is just hope.',
        },
      ],
    },
    {
      id: 'vandalize',
      text: 'Vandalize Further',
      flavorText: 'Dead gods deserve no worship.',
      outcomes: [
        {
          id: 'power',
          weight: 50,
          resultText:
            'You smash the shrine. Power flows into you—stolen divinity.',
          rewards: [{ type: 'damage_bonus', amount: 3 }],
          penalties: [{ type: 'curse_card', curseId: 'guilt' }],
          unlocksCard: 'stolen_divinity',
        },
        {
          id: 'nothing',
          weight: 50,
          resultText: 'You smash the shrine. Nothing happens. You feel petty.',
        },
      ],
    },
  ],
};

export const MERCHANT_GHOST: NarrativeEvent = {
  id: 'merchant_ghost',
  title: "The Merchant's Ghost",
  act: 1,
  rarity: 'rare',
  triggerType: 'random',
  triggerCondition: { chance: 0.05 },
  oncePerRun: true,
  content: {
    text: `A translucent figure sits behind spectral wares. His smile is sad but genuine.

"I died here, but my inventory didn't. Care to browse? I accept... years."`,
    speakerName: 'Ghost Merchant',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'browse_wares',
      text: 'Browse the Wares',
      flavorText: 'What do you have?',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText:
            'The ghost shows you three cards. Each costs something precious.',
          // Note: This would open a special shop interface in actual implementation
          rewards: [{ type: 'card_random' }],
          penalties: [{ type: 'hp_max_loss', amount: 5 }],
        },
      ],
    },
    {
      id: 'trade_memory',
      text: 'Trade a Memory',
      flavorText: 'Take something precious.',
      outcomes: [
        {
          id: 'good_deal',
          weight: 100,
          resultText:
            "The ghost takes a happy memory. You can't remember your mother's face. But you gain knowledge.",
          penalties: [{ type: 'hp_max_loss', amount: 5 }],
          rewards: [{ type: 'card_random' }], // Would be rare card
          unlocksCard: 'merchants_wisdom',
        },
      ],
    },
    {
      id: 'refuse',
      text: 'Refuse',
      flavorText: "I'll keep my years.",
      outcomes: [
        {
          id: 'respectful',
          weight: 100,
          resultText: '"Wise. Or foolish. Time will tell." He fades.',
        },
      ],
    },
  ],
};

// =============================================================================
// ACT 2 — THE FLOODED DEPTHS
// =============================================================================

export const DROWNED_MEMORY: NarrativeEvent = {
  id: 'drowned_memory',
  title: 'The Drowned Memory',
  act: 2,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  content: {
    text: `A memory bubble floats in the corridor—a preserved moment from drowned Thalassar.

Inside, you see a child laughing. A parent lifting them high. The moment before the flood.

You could absorb it. Learn from it. Or let it float on.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'absorb_memory',
      text: 'Absorb the Memory',
      flavorText: 'Experience what they experienced.',
      outcomes: [
        {
          id: 'joy',
          weight: 60,
          resultText:
            'You feel the love. The laughter. It fills something empty in you.',
          rewards: [{ type: 'hp_heal', amount: 15 }],
        },
        {
          id: 'grief',
          weight: 40,
          resultText: 'You feel the loss. The water. The end.',
          penalties: [{ type: 'hp_loss', amount: 5 }],
          rewards: [{ type: 'resolve_max', amount: 1 }],
        },
      ],
    },
    {
      id: 'pop_bubble',
      text: 'Pop the Bubble',
      flavorText: 'Set it free.',
      outcomes: [
        {
          id: 'release',
          weight: 100,
          resultText:
            "The memory dissolves. Somewhere, a child's ghost smiles.",
          rewards: [{ type: 'skip_encounter' }],
        },
      ],
    },
    {
      id: 'ignore_it',
      text: 'Ignore It',
      flavorText: 'Not my memory.',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText: 'The bubble floats away. The moment is preserved.',
        },
      ],
    },
  ],
};

export const CORAL_THRONE: NarrativeEvent = {
  id: 'coral_throne',
  title: 'The Coral Throne',
  act: 2,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  oncePerRun: true,
  content: {
    text: `An empty throne of living coral. It wasn't Aldric's—too small, too humble. A child's throne.

The coral pulses with preserved life. If you sat in it...`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'sit_on_throne',
      text: 'Sit on the Throne',
      flavorText: 'See what happens.',
      outcomes: [
        {
          id: 'blessed',
          weight: 40,
          resultText: "For a moment, you're royalty. The coral accepts you.",
          rewards: [
            { type: 'hp_max', amount: 5 },
            { type: 'block_bonus', amount: 5 },
          ],
        },
        {
          id: 'rejected',
          weight: 40,
          resultText: "The coral stings. You're not worthy.",
          penalties: [{ type: 'hp_loss', amount: 10 }],
        },
        {
          id: 'vision',
          weight: 20,
          resultText:
            'You see the last princess of Thalassar. She tells you a secret.',
          rewards: [{ type: 'card_specific', cardId: 'thalassars_blessing' }],
          unlocksCard: 'thalassars_blessing',
        },
      ],
    },
    {
      id: 'touch_coral',
      text: 'Touch the Coral',
      flavorText: 'Just feel it.',
      outcomes: [
        {
          id: 'warm',
          weight: 70,
          resultText: 'Warm. Like being held.',
          rewards: [{ type: 'hp_heal', amount: 10 }],
        },
        {
          id: 'cold',
          weight: 30,
          resultText: 'Cold. Like drowning.',
          penalties: [{ type: 'hp_loss', amount: 5 }],
        },
      ],
    },
    {
      id: 'leave_alone',
      text: 'Leave It Alone',
      flavorText: "Some thrones aren't meant to be sat upon.",
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText: 'The coral dims slightly. Disappointed?',
        },
      ],
    },
  ],
};

export const LOYAL_DEAD: NarrativeEvent = {
  id: 'loyal_dead',
  title: 'The Loyal Dead',
  act: 2,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  content: {
    text: `A drowned soldier stands at attention. Still guarding. Still loyal. After four hundred years.

He doesn't attack. He just... waits. For orders that will never come.`,
    speakerType: 'environment',
  },
  choices: [
    {
      id: 'give_orders',
      text: 'Give Him Orders',
      flavorText: 'Soldier! At ease!',
      outcomes: [
        {
          id: 'obeys',
          weight: 70,
          resultText:
            'He relaxes. Crumbles. Finally at peace. He leaves his sword.',
          rewards: [{ type: 'damage_bonus', amount: 3 }],
        },
        {
          id: 'attacks',
          weight: 30,
          resultText: "You're not his king. He attacks.",
          penalties: [{ type: 'start_combat', enemyId: 'drowned_guard' }],
        },
      ],
    },
    {
      id: 'ask_about_aldric',
      text: 'Ask About Aldric',
      flavorText: 'Do you remember your king?',
      outcomes: [
        {
          id: 'remembers',
          weight: 60,
          resultText:
            '"...best king... loved us... saved the children..." He weeps and fades.',
          rewards: [{ type: 'boss_damage_bonus', bossId: 'drowned_king', amount: 10 }],
        },
        {
          id: 'forgotten',
          weight: 40,
          resultText:
            '"...who? I don\'t... I can\'t..." He wails and attacks.',
          penalties: [{ type: 'start_combat', enemyId: 'drowned_guard' }],
        },
      ],
    },
    {
      id: 'walk_around',
      text: 'Walk Around Him',
      flavorText: "He's not my problem.",
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText: "He doesn't notice you. Or pretends not to.",
        },
      ],
    },
  ],
};

// =============================================================================
// ACT 3 — THE SANCTUM CORE
// =============================================================================

export const MIRROR_SELF: NarrativeEvent = {
  id: 'mirror_self',
  title: 'The Mirror Self',
  act: 3,
  rarity: 'common',
  triggerType: 'random',
  triggerCondition: { chance: 0.15 },
  content: {
    text: `A mirror that shows you—but wrong. The reflection moves independently. It's studying you.

"I could be you," it says. "I almost was. Before the void took me."

It offers a trade.`,
    speakerName: 'Mirror Self',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'trade_strength_wisdom',
      text: 'Trade Strength for Wisdom',
      flavorText: 'Make me smarter, not stronger.',
      outcomes: [
        {
          id: 'trade',
          weight: 100,
          resultText:
            'Your muscles feel weaker. Your mind feels sharper.',
          penalties: [{ type: 'hp_max_loss', amount: 5 }],
          rewards: [
            { type: 'resolve_max', amount: 1 },
            // Note: "Draw 1 extra card per turn" would need special handling
          ],
        },
      ],
    },
    {
      id: 'trade_wisdom_strength',
      text: 'Trade Wisdom for Strength',
      flavorText: 'Make me stronger, not smarter.',
      outcomes: [
        {
          id: 'trade',
          weight: 100,
          resultText:
            'Your thoughts feel slower. Your arms feel powerful.',
          penalties: [{ type: 'resolve_loss', amount: 1 }],
          rewards: [
            { type: 'hp_max', amount: 5 },
            { type: 'damage_bonus', amount: 4 },
          ],
        },
      ],
    },
    {
      id: 'attack_mirror',
      text: 'Attack the Mirror',
      flavorText: "I don't negotiate with shadows.",
      outcomes: [
        {
          id: 'shatter',
          weight: 70,
          resultText:
            "The mirror shatters. Seven years bad luck—or is that just superstition?",
          penalties: [{ type: 'corruption', amount: 2 }],
        },
        {
          id: 'absorb',
          weight: 30,
          resultText:
            'The mirror shatters. Your reflection flows into you.',
          rewards: [
            { type: 'hp_max', amount: 3 },
            { type: 'damage_bonus', amount: 1 },
          ],
        },
      ],
    },
    {
      id: 'refuse',
      text: 'Refuse',
      flavorText: 'I am enough as I am.',
      outcomes: [
        {
          id: 'respect',
          weight: 100,
          resultText:
            'The reflection nods. "Maybe that\'s why you\'ll succeed." It fades.',
          rewards: [{ type: 'hp_heal', amount: 999 }], // Heal to full
          unlocksCard: 'self_assurance',
        },
      ],
    },
  ],
};

export const HOLLOW_WHISPER: NarrativeEvent = {
  id: 'hollow_whisper',
  title: 'The Hollow Whisper',
  act: 3,
  rarity: 'uncommon',
  triggerType: 'random',
  triggerCondition: { chance: 0.1 },
  oncePerRun: true,
  content: {
    text: `A voice that isn't a voice. The Hollow God, speaking directly to you.

"I can give you power. I can give you rest. I can give you nothing at all—and nothing is peaceful."

It's not lying. That's the terrible part.`,
    speakerName: 'The Hollow God',
    speakerType: 'unknown',
  },
  choices: [
    {
      id: 'accept_power',
      text: 'Accept Power',
      flavorText: 'Make me strong enough to win.',
      outcomes: [
        {
          id: 'granted',
          weight: 100,
          resultText:
            'Darkness flows into you. You are stronger. You are... less.',
          rewards: [
            { type: 'damage_bonus', amount: 10 },
            { type: 'hp_max', amount: 10 },
          ],
          penalties: [
            { type: 'curse_card', curseId: 'corruption' },
            { type: 'curse_card', curseId: 'corruption' },
            { type: 'curse_card', curseId: 'corruption' },
          ],
        },
      ],
    },
    {
      id: 'accept_rest',
      text: 'Accept Rest',
      flavorText: 'Let me stop hurting.',
      outcomes: [
        {
          id: 'granted',
          weight: 100,
          resultText:
            "Peace, for a moment. The pain stops. The fighting doesn't.",
          rewards: [{ type: 'hp_heal', amount: 999 }],
          penalties: [{ type: 'resolve_loss', amount: 3 }],
        },
      ],
    },
    {
      id: 'reject_everything',
      text: 'Reject Everything',
      flavorText: 'I want nothing from you.',
      outcomes: [
        {
          id: 'defiance',
          weight: 100,
          resultText:
            '"...interesting. They usually accept something." The voice sounds almost impressed.',
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 }],
        },
      ],
    },
  ],
};

export const WARDENS_GIFT: NarrativeEvent = {
  id: 'wardens_gift',
  title: "The Warden's Gift",
  act: 3,
  rarity: 'rare',
  triggerType: 'progress',
  triggerCondition: { roomsCleared: 6 },
  oncePerRun: true,
  content: {
    text: `Lyra's voice, clearer than it's been in hours.

"I can't help you fight. But I can give you something I've been saving. A piece of what I was, before."

"Take it. Please. Let me be useful one last time."`,
    speakerName: 'Lyra',
    speakerType: 'warden',
  },
  choices: [
    {
      id: 'accept_gift',
      text: 'Accept Her Gift',
      flavorText: 'Thank you, Lyra.',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText:
            "Warmth. Light. A healer's blessing, preserved for 347 years.",
          rewards: [
            { type: 'hp_max', amount: 10 },
            { type: 'hp_heal', amount: 999 },
            { type: 'resolve_max', amount: 1 },
          ],
          unlocksCard: 'lyras_blessing',
          // Note: "Lyra's voice fades completely after this" would need special handling
        },
      ],
    },
    {
      id: 'refuse_gift',
      text: 'Refuse',
      flavorText: 'Save your strength. You need it.',
      outcomes: [
        {
          id: 'always',
          weight: 100,
          resultText:
            '"...you\'re kind. Foolish, but kind. Thank you."',
          rewards: [{ type: 'boss_damage_bonus', bossId: 'hollow_god', amount: 5 }],
          // Note: "Lyra's voice remains slightly stronger" would need special handling
        },
      ],
    },
  ],
};

// =============================================================================
// EXPORT ALL UNIVERSAL EVENTS
// =============================================================================

export const UNIVERSAL_EVENTS: NarrativeEvent[] = [
  // Act 1
  ABANDONED_CAMP,
  WHISPERING_WALLS,
  BROKEN_SHRINE_ACT1,
  MERCHANT_GHOST,
  // Act 2
  DROWNED_MEMORY,
  CORAL_THRONE,
  LOYAL_DEAD,
  // Act 3
  MIRROR_SELF,
  HOLLOW_WHISPER,
  WARDENS_GIFT,
];
