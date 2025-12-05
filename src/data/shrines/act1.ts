/**
 * Act 1 Shrines: Memory and Loss
 *
 * Act 1 shrines are low-risk introductions to the shrine mechanic,
 * focusing on memory and what has been lost in the Sanctum.
 */

import { ShrineDefinition } from '@/types/shrines';
import { CharacterClassId } from '@/types';

export const ACT1_SHRINES: ShrineDefinition[] = [
  // ==========================================================================
  // ANCIENT ALTAR
  // ==========================================================================
  {
    id: 'ancient_altar',
    name: 'Ancient Altar',
    act: 1,
    description:
      'A stone altar, worn smooth by centuries of offerings. Candles burn despite no one to light them.',
    prompt: 'The altar asks for sacrifice. What will you give?',
    wardenWhisper: {
      text: "I built this altar. I don't remember why. I must have needed something. We all need something.",
    },
    choices: [
      {
        id: 'sacrifice_hp',
        text: 'Sacrifice HP',
        flavorText: 'Offer your vitality to the stone',
        hpPercentCost: 0.1,
        outcomes: [
          {
            id: 'sacrifice_hp_success',
            weight: 100,
            resultText:
              'Your vitality feeds the stone. The stone gives back—something precious.',
            rewards: [{ type: 'card_rare' }],
          },
        ],
      },
      {
        id: 'sacrifice_gold',
        text: 'Sacrifice Gold',
        flavorText: 'Gold means nothing here',
        goldCost: 50,
        outcomes: [
          {
            id: 'sacrifice_gold_success',
            weight: 100,
            resultText:
              'Gold is nothing here. But the gesture means something.',
            rewards: [{ type: 'hp_heal', amount: 15 }],
          },
        ],
      },
      {
        id: 'refuse',
        text: 'Refuse',
        flavorText: 'Keep what you have',
        outcomes: [
          {
            id: 'refuse_result',
            weight: 100,
            resultText: 'You keep what you have. The altar... waits.',
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.CLERIC,
        additionalText: "You sense your god's presence in the stone.",
        additionalChoices: [
          {
            id: 'pray',
            text: 'Pray',
            flavorText: 'Commune with the divine presence',
            outcomes: [
              {
                id: 'pray_result',
                weight: 100,
                resultText:
                  "You bow your head and pray. A fragment of your god's last words echoes in your mind...",
                rewards: [{ type: 'devotion', amount: 2 }],
                loreFragment:
                  '"...the void consumes not from malice, but from hunger. Forgive it, child. And then resist."',
              },
            ],
          },
        ],
      },
      {
        classId: CharacterClassId.DIABOLIST,
        warningText: 'Xan\'thrax is watching. He wants you to sacrifice.',
      },
    ],
  },

  // ==========================================================================
  // FORGOTTEN GRIMOIRE
  // ==========================================================================
  {
    id: 'forgotten_grimoire',
    name: 'Forgotten Grimoire',
    act: 1,
    description:
      'A book rests on a pedestal, pages turning by themselves. The ink still moves.',
    prompt: 'The grimoire offers knowledge—at a price. What will you learn?',
    choices: [
      {
        id: 'read_deeply',
        text: 'Read Deeply',
        flavorText: 'Absorb the forbidden knowledge within',
        outcomes: [
          {
            id: 'read_deeply_result',
            weight: 100,
            resultText:
              "The knowledge burns. The mage who wrote this... she's still in the ink.",
            rewards: [{ type: 'card_transform' }],
            costs: [{ type: 'pain_add', amount: 1 }],
            loreFragment:
              'The grimoire was written by a mage named Thessa. She entered seeking understanding of the Hollow God. She understood too much. Now she IS the grimoire—consciousness dissolved into text.',
          },
        ],
      },
      {
        id: 'skim_carefully',
        text: 'Skim Carefully',
        flavorText: 'Take only surface knowledge',
        outcomes: [
          {
            id: 'skim_result',
            weight: 100,
            resultText: 'Careful knowledge. Safe knowledge. Limited knowledge.',
            rewards: [{ type: 'card_upgrade' }],
          },
        ],
      },
      {
        id: 'close_it',
        text: 'Close It',
        flavorText: 'Some doors are better left unopened',
        outcomes: [
          {
            id: 'close_result',
            weight: 100,
            resultText:
              'Some things are better unread. Some doors better unopened.',
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.DIABOLIST,
        additionalText:
          'The grimoire speaks: "I know your contractor. Xan\'thrax wrote three pages of this book. Would you like to read them?"',
        additionalChoices: [
          {
            id: 'read_xanthrax_pages',
            text: "Read Xan'thrax's Pages",
            flavorText: 'Your contractor left notes here',
            outcomes: [
              {
                id: 'xanthrax_pages_result',
                weight: 100,
                resultText:
                  'The pages reveal secrets about your contract. Power flows—but at what cost?',
                rewards: [
                  { type: 'card_rare' },
                  { type: 'damage_bonus', amount: 2 },
                ],
                costs: [{ type: 'curse_add', amount: 1 }],
              },
            ],
          },
        ],
      },
      {
        classId: CharacterClassId.FEY_TOUCHED,
        additionalText:
          "These pages keep rearranging. Oberon, is that you?",
        modifiedOutcome: {
          choiceId: 'read_deeply',
          outcome: {
            id: 'read_deeply_fey',
            weight: 100,
            resultText:
              'The pages dance and shift. Oberon\'s laughter echoes. The outcome is... unpredictable.',
            rewards: [{ type: 'luck', amount: 2 }],
          },
        },
      },
    ],
  },

  // ==========================================================================
  // CURSED IDOL
  // ==========================================================================
  {
    id: 'cursed_idol',
    name: 'Cursed Idol',
    act: 1,
    description:
      "A small statue, carved from something that isn't quite stone. It looks like it's trying to remember a face.",
    prompt: 'The idol offers power. The idol offers corruption. The idol offers... truth?',
    choices: [
      {
        id: 'accept_gift',
        text: 'Accept the Gift',
        flavorText: 'Take what the idol offers',
        outcomes: [
          {
            id: 'accept_gift_result',
            weight: 100,
            resultText:
              "Power flows. So does poison. The idol remembers its maker—and its maker's mistakes.",
            rewards: [{ type: 'relic' }],
            costs: [{ type: 'curse_add', amount: 2 }],
          },
        ],
      },
      {
        id: 'ask_question',
        text: 'Ask a Question',
        flavorText: 'Seek knowledge about what lies ahead',
        outcomes: [
          {
            id: 'ask_question_result',
            weight: 100,
            resultText:
              "The idol shows you visions. The Drowned King's crown. His queen's tears. His choice.",
            rewards: [{ type: 'boss_insight' }],
            loreFragment:
              "This idol was carved by the Hollow God's first victim—a sculptor who tried to remember their own face as the void consumed them. The face they carved was wrong. But they kept trying.",
          },
        ],
      },
      {
        id: 'destroy_idol',
        text: 'Destroy It',
        flavorText: 'Shatter this corrupted thing',
        outcomes: [
          {
            id: 'destroy_result',
            weight: 100,
            resultText:
              'The idol shatters. Something sighs with relief. Something else screams.',
            rewards: [
              { type: 'hp_max', amount: 15 },
              { type: 'card_remove' },
            ],
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.OATHSWORN,
        additionalText:
          "The Order would want you to destroy it. The Order doesn't know everything.",
        modifiedOutcome: {
          choiceId: 'destroy_idol',
          outcome: {
            id: 'destroy_oathsworn',
            weight: 100,
            resultText:
              'Your oath compels you. The destruction feels righteous—and the Sanctum rewards righteousness.',
            rewards: [
              { type: 'hp_max', amount: 20 },
              { type: 'card_remove' },
              { type: 'damage_bonus', amount: 1 },
            ],
          },
        },
      },
      {
        classId: CharacterClassId.DUNGEON_KNIGHT,
        additionalText:
          "The crest on its base... House Korrath. Varric's family made this.",
        modifiedOutcome: {
          choiceId: 'ask_question',
          outcome: {
            id: 'ask_question_knight',
            weight: 100,
            resultText:
              'You recognize the crest. Varric\'s family crafted this before they fell. The visions show you more—the Knight who came before.',
            rewards: [{ type: 'boss_insight' }],
            loreFragment:
              'House Korrath were master artificers who served the old kingdom. When the Sanctum claimed the kingdom, the Korraths were among the first to enter seeking their missing lord. None returned. Until Varric.',
          },
        },
      },
    ],
  },

  // ==========================================================================
  // MYSTERIOUS FOUNTAIN
  // ==========================================================================
  {
    id: 'mysterious_fountain',
    name: 'Mysterious Fountain',
    act: 1,
    description:
      'Water that flows upward, into nothing. It tastes like memory.',
    prompt: 'The fountain offers... something. Drink?',
    choices: [
      {
        id: 'drink_deep',
        text: 'Drink Deep',
        flavorText: 'Accept whatever the waters give',
        outcomes: [
          {
            id: 'drink_deep_heal',
            weight: 40,
            resultText:
              'The water is memories. Not yours. You taste a wedding. Joy fills you.',
            rewards: [{ type: 'hp_heal', amount: 999 }],
          },
          {
            id: 'drink_deep_relic',
            weight: 30,
            resultText:
              'The water shows you something lost. When you open your eyes, it rests in your palm.',
            rewards: [{ type: 'relic' }],
          },
          {
            id: 'drink_deep_loss',
            weight: 30,
            resultText:
              'The water is memories. You taste a betrayal. A death. The grief is not yours, but it wounds you.',
            costs: [{ type: 'hp_max_loss', amount: 10 }],
            loreFragment:
              'For one moment, you ARE the Warden. Then you\'re yourself again. Barely.',
          },
        ],
      },
      {
        id: 'sip_carefully',
        text: 'Sip Carefully',
        flavorText: 'Take only a small taste',
        outcomes: [
          {
            id: 'sip_result',
            weight: 100,
            resultText:
              "Just a sip. Just a taste. Just someone else's childhood, fading on your tongue.",
            rewards: [{ type: 'hp_heal', amount: 20 }],
          },
        ],
      },
      {
        id: 'bottle_it',
        text: 'Bottle It',
        flavorText: 'Capture the water for later',
        outcomes: [
          {
            id: 'bottle_result',
            weight: 100,
            resultText:
              "The water fights the bottle. It doesn't want to be contained. It never did.",
            rewards: [{ type: 'potion' }],
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.CLERIC,
        additionalText:
          'This water was blessed by your god... no. YOUR god blessed this water. Before they were YOUR god.',
        modifiedOutcome: {
          choiceId: 'drink_deep',
          outcome: {
            id: 'drink_deep_cleric',
            weight: 100,
            resultText:
              'The blessing recognizes you. The water heals completely, and you feel your god\'s distant approval.',
            rewards: [
              { type: 'hp_heal', amount: 999 },
              { type: 'devotion', amount: 3 },
            ],
          },
        },
      },
      {
        classId: CharacterClassId.FEY_TOUCHED,
        additionalText: "The water tastes like fairy wine. Oberon's been here.",
        modifiedOutcome: {
          choiceId: 'drink_deep',
          outcome: {
            id: 'drink_deep_fey',
            weight: 100,
            resultText:
              'Oberon\'s laughter bubbles up from the depths. Your Luck determines your fate...',
            rewards: [
              { type: 'hp_heal', amount: 999 },
              { type: 'luck', amount: 3 },
            ],
          },
        },
      },
    ],
  },

  // ==========================================================================
  // MEMORY WELL
  // ==========================================================================
  {
    id: 'memory_well',
    name: 'Memory Well',
    act: 1,
    description:
      'A well that leads nowhere. Or everywhere. Drop something in and see what rises.',
    prompt: 'The well asks for a memory. What will you forget?',
    choices: [
      {
        id: 'happy_memory',
        text: 'A Happy Memory',
        flavorText: 'Sacrifice joy for power',
        hpCost: 5,
        outcomes: [
          {
            id: 'happy_memory_result',
            weight: 100,
            resultText:
              "You forget a smile. Someone's face. Were they important? You'll never know now.",
            rewards: [{ type: 'relic' }],
            costs: [{ type: 'hp_max_loss', amount: 5 }],
          },
        ],
      },
      {
        id: 'painful_memory',
        text: 'A Painful Memory',
        flavorText: 'Let go of suffering',
        outcomes: [
          {
            id: 'painful_memory_result',
            weight: 100,
            resultText:
              'The pain goes. The lesson remains—scarred into you.',
            rewards: [{ type: 'curse_remove' }],
            costs: [{ type: 'pain_add', amount: 1 }],
          },
        ],
      },
      {
        id: 'look_without_giving',
        text: 'Look Without Giving',
        flavorText: 'Observe the depths without sacrifice',
        outcomes: [
          {
            id: 'look_cleric',
            weight: 100,
            resultText:
              'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              'You see your god, walking toward the Sanctum. Willing. Resolved. Alone.',
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.CLERIC,
        modifiedOutcome: {
          choiceId: 'look_without_giving',
          outcome: {
            id: 'look_cleric_vision',
            weight: 100,
            resultText: 'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              'You see your god, walking toward the Sanctum. Willing. Resolved. Alone.',
          },
        },
      },
      {
        classId: CharacterClassId.DUNGEON_KNIGHT,
        modifiedOutcome: {
          choiceId: 'look_without_giving',
          outcome: {
            id: 'look_knight_vision',
            weight: 100,
            resultText: 'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              'You see Ser Aldric at the gate. Hesitating. Then stepping through.',
          },
        },
      },
      {
        classId: CharacterClassId.DIABOLIST,
        modifiedOutcome: {
          choiceId: 'look_without_giving',
          outcome: {
            id: 'look_diabolist_vision',
            weight: 100,
            resultText: 'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              "You see yourself, signing the contract. Xan'thrax's smile. Your own hands, shaking.",
          },
        },
      },
      {
        classId: CharacterClassId.OATHSWORN,
        modifiedOutcome: {
          choiceId: 'look_without_giving',
          outcome: {
            id: 'look_oathsworn_vision',
            weight: 100,
            resultText: 'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              "You see the Order's founder, weeping at the Sanctum's entrance. They saw what you'll see.",
          },
        },
      },
      {
        classId: CharacterClassId.FEY_TOUCHED,
        modifiedOutcome: {
          choiceId: 'look_without_giving',
          outcome: {
            id: 'look_fey_vision',
            weight: 100,
            resultText: 'You see your past. Your reasons. Your first mistake.',
            loreFragment:
              'You see the fairy ring. Yourself, falling asleep. Oberon, watching. Choosing.',
          },
        },
      },
    ],
  },
];
