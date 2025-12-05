/**
 * Act 2 Shrines: Corruption and Bargains
 *
 * Act 2 shrines offer medium-risk choices with themes of corruption,
 * deals, and the cost of power in the deeper Sanctum.
 */

import { ShrineDefinition } from '@/types/shrines';
import { CharacterClassId } from '@/types';

export const ACT2_SHRINES: ShrineDefinition[] = [
  // ==========================================================================
  // THE DROWNED SHRINE
  // ==========================================================================
  {
    id: 'drowned_shrine',
    name: 'The Drowned Shrine',
    act: 2,
    description:
      'Water fills this room, but you can breathe. The pressure is memory.',
    prompt:
      'The shrine holds something precious—drowned but not destroyed. Will you dive?',
    wardenWhisper: {
      text: 'Aldric built this shrine. For Elara. So she could visit, if she ever entered. She never did.',
    },
    choices: [
      {
        id: 'dive_deep',
        text: 'Dive Deep',
        flavorText: 'Seek what lies at the bottom',
        hpCost: 15,
        outcomes: [
          {
            id: 'dive_deep_result',
            weight: 100,
            resultText:
              "You find a piece of Aldric's crown. It still radiates protection. It still radiates grief.",
            rewards: [
              { type: 'relic', relicId: 'crown_fragment' },
              { type: 'block_bonus', amount: 3 },
            ],
          },
        ],
      },
      {
        id: 'wade_carefully',
        text: 'Wade Carefully',
        flavorText: 'Accept the waters\' healing embrace',
        outcomes: [
          {
            id: 'wade_result',
            weight: 100,
            resultText:
              'The water heals. It also takes. Everything has a price in Thalassar.',
            rewards: [{ type: 'hp_heal', amount: 999 }],
            costs: [{ type: 'card_remove' }], // Loses highest rarity card
          },
        ],
      },
      {
        id: 'drain_shrine',
        text: 'Drain the Shrine',
        flavorText: 'Empty the waters entirely',
        hpCost: 20,
        outcomes: [
          {
            id: 'drain_result',
            weight: 100,
            resultText:
              "The waters recede. Aldric feels it. He's weaker now—and angrier.",
            rewards: [{ type: 'boss_weaken', bossId: 'drowned_king' }],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE MERCHANT'S GHOST
  // ==========================================================================
  {
    id: 'merchants_ghost',
    name: "The Merchant's Ghost",
    act: 2,
    description:
      "A figure that isn't quite there. They sell things that aren't quite real.",
    prompt: 'The merchant offers trades. Their currency is... unusual.',
    choices: [
      {
        id: 'trade_years',
        text: 'Years of Your Life',
        flavorText: 'Trade your vitality for any card',
        outcomes: [
          {
            id: 'trade_years_result',
            weight: 100,
            resultText:
              'The years flow from you like water. The merchant smiles—if that emptiness can smile.',
            rewards: [{ type: 'card_rare' }], // Player's choice of any card
            costs: [{ type: 'hp_max_loss', amount: 10 }],
          },
        ],
      },
      {
        id: 'trade_skill',
        text: 'A Skill You Love',
        flavorText: 'Sacrifice your best card for two random rares',
        outcomes: [
          {
            id: 'trade_skill_result',
            weight: 100,
            resultText:
              'You forget how to do something you loved. Two new abilities fill the void.',
            rewards: [
              { type: 'card_rare' },
              { type: 'card_rare' },
            ],
            costs: [{ type: 'card_remove' }], // Removes best card
          },
        ],
      },
      {
        id: 'trade_secret',
        text: 'A Secret',
        flavorText: 'Reveal your weakness for protection against it',
        outcomes: [
          {
            id: 'trade_secret_result',
            weight: 100,
            resultText:
              'The Hollow God now knows your weakness. But you hold a charm against it.',
            rewards: [{ type: 'relic' }], // Relic that protects against class weakness
          },
        ],
      },
      {
        id: 'refuse_trade',
        text: 'Decline',
        flavorText: 'A wise customer knows when not to buy',
        outcomes: [
          {
            id: 'refuse_trade_result',
            weight: 100,
            resultText:
              "A wise customer knows when not to buy. Or a cowardly one. Either way—I'll be here. Everyone comes back to the merchant.",
            loreFragment:
              'I was a trader once. I came here to trade with the Hollow God. I offered my body, my soul, my identity. It accepted. Now I am... this. A transaction without end.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE CONTRACT TABLE
  // ==========================================================================
  {
    id: 'contract_table',
    name: 'The Contract Table',
    act: 2,
    description:
      'A table with three documents. All are blank until you touch them.',
    prompt:
      'Each contract offers power. Each contract binds you. Choose wisely—or don\'t choose at all.',
    choices: [
      {
        id: 'contract_strength',
        text: 'Contract of Strength',
        flavorText: '+3 damage on all attacks, cannot heal above 75% max HP',
        outcomes: [
          {
            id: 'strength_result',
            weight: 100,
            resultText:
              'Power surges through your veins. But something feels... limited.',
            rewards: [{ type: 'damage_bonus', amount: 3 }],
            // Note: heal cap is a permanent debuff tracked elsewhere
          },
        ],
      },
      {
        id: 'contract_protection',
        text: 'Contract of Protection',
        flavorText: 'Start each combat with 10 block, deal 15% less damage',
        outcomes: [
          {
            id: 'protection_result',
            weight: 100,
            resultText:
              'Your defenses harden. Your strikes soften. Such is the nature of contracts.',
            rewards: [{ type: 'block_bonus', amount: 10 }],
            // Note: damage reduction is a permanent debuff tracked elsewhere
          },
        ],
      },
      {
        id: 'contract_knowledge',
        text: 'Contract of Knowledge',
        flavorText: 'See enemy intents 2 turns ahead, lose 2 max HP after each combat',
        outcomes: [
          {
            id: 'knowledge_result',
            weight: 100,
            resultText:
              'The future unfolds before you. Each revelation costs a piece of yourself.',
            rewards: [{ type: 'boss_insight' }], // Grants foresight ability
            // Note: HP drain is tracked as a permanent effect
          },
        ],
      },
      {
        id: 'refuse_contracts',
        text: 'Leave',
        flavorText: 'Some deals are better left unsigned',
        outcomes: [
          {
            id: 'refuse_contracts_result',
            weight: 100,
            resultText:
              'You step away from the table. The contracts rustle with disappointment.',
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.DIABOLIST,
        additionalText:
          "These contracts were written by Xan'thrax. Signing one counts as progress toward your deal—but he doesn't tell you which clause.",
        additionalChoices: [
          {
            id: 'tear_contracts',
            text: 'Tear Up the Contracts',
            flavorText: "Defy Xan'thrax's machinations",
            outcomes: [
              {
                id: 'tear_contracts_result',
                weight: 100,
                resultText:
                  "You rip the contracts to shreds. Xan'thrax's whispers grow louder—but you feel stronger for the defiance.",
                rewards: [{ type: 'hp_max', amount: 10 }],
                loreFragment:
                  "Xan'thrax is furious. His voice echoes in your skull: 'Defiance is still engagement, contractor. Every choice you make serves me.'",
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE CORRUPTION POOL
  // ==========================================================================
  {
    id: 'corruption_pool',
    name: 'The Corruption Pool',
    act: 2,
    description:
      'A pool of liquid shadow. Things move beneath the surface. They might be reflections.',
    prompt: 'The pool offers transformation. Do you dare look into the abyss?',
    choices: [
      {
        id: 'bathe_in_shadow',
        text: 'Bathe in Shadow',
        flavorText: 'Let the darkness transform you',
        outcomes: [
          {
            id: 'bathe_shadow_result',
            weight: 60,
            resultText:
              'The shadow wraps around you like a second skin. Power courses through—tainted, but strong.',
            rewards: [
              { type: 'damage_bonus', amount: 3 },
              { type: 'card_transform' },
            ],
            costs: [{ type: 'curse_add', amount: 1 }],
          },
          {
            id: 'bathe_shadow_bad',
            weight: 40,
            resultText:
              'The shadow rejects you—violently. You emerge changed, but not in the way you hoped.',
            costs: [
              { type: 'curse_add', amount: 2 },
              { type: 'hp_max_loss', amount: 5 },
            ],
          },
        ],
      },
      {
        id: 'drink_shadow',
        text: 'Drink the Shadow',
        flavorText: 'Internalize the darkness',
        outcomes: [
          {
            id: 'drink_shadow_result',
            weight: 100,
            resultText:
              'The shadow slides down your throat. Cold. Empty. Hungry. Now it hungers with you.',
            rewards: [
              { type: 'hp_max', amount: 15 },
              { type: 'relic' },
            ],
            costs: [
              { type: 'curse_add', amount: 2 },
              { type: 'pain_add', amount: 1 },
            ],
          },
        ],
      },
      {
        id: 'watch_reflections',
        text: 'Watch the Reflections',
        flavorText: 'Observe without touching',
        outcomes: [
          {
            id: 'watch_reflections_result',
            weight: 100,
            resultText:
              'You see yourself in the pool—versions that chose differently. Some are stronger. Some are dead.',
            rewards: [{ type: 'boss_insight' }],
            loreFragment:
              'The pool shows the paths not taken. In one reflection, you never entered the Sanctum. In another, you are the Warden.',
          },
        ],
      },
      {
        id: 'walk_away_pool',
        text: 'Walk Away',
        flavorText: 'Some transformations are best avoided',
        outcomes: [
          {
            id: 'walk_away_pool_result',
            weight: 100,
            resultText:
              'You turn your back on the pool. Something in it sighs—relief or disappointment, you cannot tell.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE BONE ALTAR
  // ==========================================================================
  {
    id: 'bone_altar',
    name: 'The Bone Altar',
    act: 2,
    description:
      'An altar made entirely of bones. They still move sometimes. They still whisper sometimes.',
    prompt: 'The dead have secrets. Will you listen?',
    choices: [
      {
        id: 'offer_blood',
        text: 'Offer Blood',
        flavorText: 'Feed the altar your life',
        hpCost: 20,
        outcomes: [
          {
            id: 'offer_blood_result',
            weight: 100,
            resultText:
              'The bones drink deeply. In gratitude, they share what they remember.',
            rewards: [
              { type: 'card_rare' },
              { type: 'boss_insight' },
            ],
          },
        ],
      },
      {
        id: 'offer_card',
        text: 'Offer a Card',
        flavorText: 'Sacrifice knowledge for knowledge',
        outcomes: [
          {
            id: 'offer_card_result',
            weight: 100,
            resultText:
              'The card burns in spectral fire. The bones arrange themselves into new patterns.',
            rewards: [{ type: 'card_rare' }],
            costs: [{ type: 'card_remove' }],
          },
        ],
      },
      {
        id: 'listen_silently',
        text: 'Listen in Silence',
        flavorText: 'Hear what the bones whisper',
        outcomes: [
          {
            id: 'listen_result',
            weight: 100,
            resultText:
              'The whispers are fragments of the dead. Most are meaningless. One is not.',
            loreFragment:
              'They all entered seeking something. Power. Answers. Loved ones. The Sanctum took them all. It takes everything eventually. That\'s its nature. That\'s its hunger.',
          },
        ],
      },
    ],
  },
];
