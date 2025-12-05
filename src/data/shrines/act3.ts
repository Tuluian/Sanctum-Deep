/**
 * Act 3 Shrines: Sacrifice and Purpose
 *
 * Act 3 shrines offer high-impact choices focused on sacrifice,
 * purpose, and final preparation for the Hollow God.
 */

import { ShrineDefinition } from '@/types/shrines';
import { CharacterClassId } from '@/types';

export const ACT3_SHRINES: ShrineDefinition[] = [
  // ==========================================================================
  // THE WARDEN'S MEMORIAL
  // ==========================================================================
  {
    id: 'wardens_memorial',
    name: "The Warden's Memorial",
    act: 3,
    description:
      'Crystals line the walls. Each one holds a face. A name. A regret.',
    prompt: 'The previous Wardens watch. What would you learn from them?',
    choices: [
      {
        id: 'listen_wisdom',
        text: 'Listen to Their Wisdom',
        flavorText: 'Learn from those who came before',
        outcomes: [
          {
            id: 'listen_wisdom_result',
            weight: 100,
            resultText:
              'They whisper strategies. Weaknesses. They want you to succeed where they faded.',
            rewards: [{ type: 'boss_insight' }],
            loreFragment:
              'Theron the Builder, 1,247 years: "Don\'t let it take your name first. Protect your name."\n\nMara of the Dawn, 892 years: "Love doesn\'t weaken you. Love is the anchor."\n\nThe Nameless One, 2,103 years: "I held longer than anyone. I also lost more. Balance, champion. Balance."',
          },
        ],
      },
      {
        id: 'absorb_power',
        text: 'Absorb Their Power',
        flavorText: 'Take their strength for this battle',
        outcomes: [
          {
            id: 'absorb_power_result',
            weight: 100,
            resultText:
              'Their strength flows into you. Borrowed time. Borrowed power. Borrowed regret.',
            rewards: [
              { type: 'damage_bonus', amount: 5 },
              { type: 'block_bonus', amount: 5 },
              { type: 'hp_max', amount: 20 },
            ],
          },
        ],
      },
      {
        id: 'promise_remember',
        text: 'Promise to Remember Them',
        flavorText: 'Add your name to the memorial',
        outcomes: [
          {
            id: 'promise_remember_result',
            weight: 100,
            resultText:
              'Your name is added to the wall. In advance. A promise—or a prophecy.',
            loreFragment:
              'The crystals glow brighter as your name appears among them. The previous Wardens seem to nod in approval. You are part of something now—a legacy of resistance.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE HOLLOW ALTAR
  // ==========================================================================
  {
    id: 'hollow_altar',
    name: 'The Hollow Altar',
    act: 3,
    description:
      'An altar that absorbs light. Standing here, you feel less.',
    prompt: 'The Hollow God offers peace. Real peace. Do you want it?',
    choices: [
      {
        id: 'accept_emptiness',
        text: 'Accept a Piece of Emptiness',
        flavorText: 'Let the void numb your fears',
        outcomes: [
          {
            id: 'accept_emptiness_result',
            weight: 100,
            resultText:
              "A piece of you becomes void. It doesn't hurt. Nothing hurts anymore.",
            rewards: [{ type: 'immunity_debuff' }],
            costs: [{ type: 'hp_max_loss', amount: 10 }],
          },
        ],
      },
      {
        id: 'offer_doubt',
        text: 'Offer Your Doubt',
        flavorText: 'Surrender your uncertainty to the void',
        outcomes: [
          {
            id: 'offer_doubt_result',
            weight: 100,
            resultText:
              'Your uncertainty dissolves. You feel... sure. Too sure. Is this peace or erasure?',
            rewards: [{ type: 'curse_remove' }],
            // Note: Cannot heal for 3 combats is tracked as a status
          },
        ],
      },
      {
        id: 'reject_offer',
        text: 'Reject the Offer',
        flavorText: 'Choose struggle over false peace',
        hpCost: 20,
        outcomes: [
          {
            id: 'reject_offer_result',
            weight: 100,
            resultText:
              'You say no. It hurts. The Hollow God is confused. No one says no. Not here.',
            rewards: [
              { type: 'relic', relicId: 'defiant_spirit' },
              { type: 'damage_bonus', amount: 5 },
            ],
            loreFragment:
              'The Hollow God\'s voice echoes: "Interesting. You refuse peace. You choose struggle. Why?"\n\n*[No answer required. Your refusal IS the answer.]*',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE FINAL SHRINE (PRE-BOSS)
  // ==========================================================================
  {
    id: 'final_shrine',
    name: 'The Final Shrine',
    act: 3,
    description: 'No altar. No water. Just a mirror. And the Warden.',
    prompt: '"I have nothing left to give you. Except... this."',
    oncePerRun: true,
    choices: [
      {
        id: 'accept_blessing',
        text: "Accept the Warden's Blessing",
        flavorText: 'Receive their final gift',
        outcomes: [
          {
            id: 'accept_blessing_result',
            weight: 100,
            resultText:
              'The Warden touches your forehead. For one moment, you see what they saw. Then they smile, and the vision fades.',
            rewards: [
              { type: 'hp_heal', amount: 999 },
              { type: 'hp_max', amount: 10 },
            ],
          },
        ],
      },
      {
        id: 'give_peace',
        text: 'Refuse, Give the Warden Peace',
        flavorText: 'Grant them permission to rest',
        outcomes: [
          {
            id: 'give_peace_result',
            weight: 100,
            resultText:
              "You give them what they need: permission to rest. 'Thank you,' they whisper. 'I was so tired.'",
            loreFragment:
              'The Warden fades, but their gratitude lingers. In the final battle, you will feel their presence—not their power, but their hope.',
          },
        ],
      },
      {
        id: 'ask_name',
        text: "Ask the Warden's Name",
        flavorText: 'Learn who they were before',
        outcomes: [
          {
            id: 'ask_name_result',
            weight: 100,
            resultText:
              "They pause. 'I... was...' The name comes slowly. 'I was Lyra. I think. Yes. Lyra.'",
            rewards: [{ type: 'card_rare', cardId: 'lyras_prayer' }],
            loreFragment:
              "Lyra of the Silver Dawn—a Cleric who entered 347 years ago, seeking to heal the Sanctum itself. She failed. But she held.",
          },
        ],
      },
    ],
    classVariations: [
      {
        classId: CharacterClassId.CLERIC,
        additionalText:
          'Lyra was a member of your order. Her prayer book is your prayer book.',
        modifiedOutcome: {
          choiceId: 'ask_name',
          outcome: {
            id: 'ask_name_cleric',
            weight: 100,
            resultText:
              "'You... you carry my prayer book.' Tears stream down the Warden's—Lyra's—face. 'Did they remember me?'",
            rewards: [
              { type: 'card_rare', cardId: 'lyras_prayer' },
              { type: 'devotion', amount: 5 },
            ],
            loreFragment:
              'Lyra was your order\'s founder\'s student. Her prayers became the foundation of your faith. To her, you are proof that something survived.',
          },
        },
      },
      {
        classId: CharacterClassId.DUNGEON_KNIGHT,
        additionalText:
          'Lyra trained with the Sealed Gate. She was Ser Aldric\'s student.',
        modifiedOutcome: {
          choiceId: 'ask_name',
          outcome: {
            id: 'ask_name_knight',
            weight: 100,
            resultText:
              "'Aldric...' she whispers. 'Is he still...?' You tell her. Her expression is complicated.",
            rewards: [
              { type: 'card_rare', cardId: 'lyras_prayer' },
              { type: 'block_bonus', amount: 5 },
            ],
            loreFragment:
              'Lyra and Aldric were close—perhaps more than student and teacher. When she entered the Sanctum, he followed. Neither expected to become what they are now.',
          },
        },
      },
      {
        classId: CharacterClassId.DIABOLIST,
        additionalText:
          "Lyra's sister made a deal with Xan'thrax. This is why Lyra entered—to find her.",
        modifiedOutcome: {
          choiceId: 'ask_name',
          outcome: {
            id: 'ask_name_diabolist',
            weight: 100,
            resultText:
              "'You smell of him.' Lyra's voice hardens. 'Like my sister did. Did he send you? Is this his final joke?'",
            rewards: [
              { type: 'card_rare', cardId: 'lyras_prayer' },
              { type: 'damage_bonus', amount: 3 },
            ],
            loreFragment:
              "Lyra's sister Vera signed a contract with Xan'thrax, seeking power to save their dying village. Vera got power. The village got fire. Lyra entered the Sanctum to find Vera. She found the Hollow God instead.",
          },
        },
      },
      {
        classId: CharacterClassId.OATHSWORN,
        additionalText:
          "Lyra's writings founded the Order of the Burning Truth. She would be horrified.",
        modifiedOutcome: {
          choiceId: 'ask_name',
          outcome: {
            id: 'ask_name_oathsworn',
            weight: 100,
            resultText:
              "'The Order of... what?' Lyra looks disturbed. 'I never wanted an order. I wanted to heal, not bind.'",
            rewards: [
              { type: 'card_rare', cardId: 'lyras_prayer' },
              { type: 'hp_max', amount: 10 },
            ],
            loreFragment:
              'Your oaths are based on writings Lyra left behind—warnings misinterpreted as commandments. She never intended to create zealots. Only survivors.',
          },
        },
      },
      {
        classId: CharacterClassId.FEY_TOUCHED,
        additionalText:
          "Lyra once defeated Oberon in a game of riddles. He's held the grudge for centuries.",
        modifiedOutcome: {
          choiceId: 'ask_name',
          outcome: {
            id: 'ask_name_fey',
            weight: 100,
            resultText:
              "'Oberon.' Lyra smiles—the first smile you've seen from her. 'Tell him I still have his riddle. He never got it back.'",
            rewards: [
              { type: 'card_rare', cardId: 'lyras_prayer' },
              { type: 'luck', amount: 5 },
            ],
            loreFragment:
              "Lyra won Oberon's favor by outsmarting him—and his eternal annoyance by refusing to return his prize. Perhaps that's why he marks the fey-touched who enter here. He's still searching.",
          },
        },
      },
    ],
  },

  // ==========================================================================
  // THE VOID WINDOW
  // ==========================================================================
  {
    id: 'void_window',
    name: 'The Void Window',
    act: 3,
    description:
      'A window that opens onto nothing. Not darkness—nothing. The difference is profound.',
    prompt: 'The void whispers. Do you listen?',
    choices: [
      {
        id: 'look_through',
        text: 'Look Through',
        flavorText: 'Gaze into the nothing',
        outcomes: [
          {
            id: 'look_through_result',
            weight: 70,
            resultText:
              'You see the truth: reality is thin here. Thinner than it should be. Something presses from the other side.',
            rewards: [{ type: 'boss_insight' }],
            loreFragment:
              'The Hollow God is not from here. It pressed through when reality grew thin. The Sanctum is its wound—and its anchor. Destroy it, and what happens to the anchor?',
          },
          {
            id: 'look_through_bad',
            weight: 30,
            resultText:
              'You look too long. The nothing looks back. It sees you now. It will always see you.',
            costs: [
              { type: 'curse_add', amount: 1 },
              { type: 'hp_max_loss', amount: 5 },
            ],
          },
        ],
      },
      {
        id: 'reach_through',
        text: 'Reach Through',
        flavorText: 'Touch the nothing',
        outcomes: [
          {
            id: 'reach_through_good',
            weight: 50,
            resultText:
              'Your hand passes through reality. When it returns, it holds something that should not exist.',
            rewards: [{ type: 'relic' }],
          },
          {
            id: 'reach_through_bad',
            weight: 50,
            resultText:
              'Your hand passes through reality. When it returns, part of you is missing. You feel hollow.',
            costs: [
              { type: 'hp_max_loss', amount: 15 },
              { type: 'pain_add', amount: 1 },
            ],
          },
        ],
      },
      {
        id: 'close_window',
        text: 'Close the Window',
        flavorText: 'Seal this gateway',
        hpCost: 10,
        outcomes: [
          {
            id: 'close_window_result',
            weight: 100,
            resultText:
              'The window closes. The Hollow God shrieks in frustration. You have cut off one of its eyes.',
            rewards: [
              { type: 'damage_bonus', amount: 3 },
              { type: 'boss_weaken', bossId: 'hollow_god' },
            ],
          },
        ],
      },
      {
        id: 'ignore_window',
        text: 'Walk Away',
        flavorText: 'Some things are better left unobserved',
        outcomes: [
          {
            id: 'ignore_window_result',
            weight: 100,
            resultText:
              'You turn away. The window remains. Sometimes wisdom is knowing when not to look.',
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // THE SACRIFICE STONE
  // ==========================================================================
  {
    id: 'sacrifice_stone',
    name: 'The Sacrifice Stone',
    act: 3,
    description:
      'A flat stone stained with centuries of offerings. It pulses with contained power.',
    prompt: 'The stone demands. What will you give?',
    choices: [
      {
        id: 'sacrifice_blood',
        text: 'Your Blood',
        flavorText: 'Spill your life upon the stone',
        hpCost: 25,
        outcomes: [
          {
            id: 'sacrifice_blood_result',
            weight: 100,
            resultText:
              'Your blood soaks into the stone. Ancient power recognizes the gift and answers in kind.',
            rewards: [
              { type: 'card_rare' },
              { type: 'card_rare' },
              { type: 'damage_bonus', amount: 3 },
            ],
          },
        ],
      },
      {
        id: 'sacrifice_memory',
        text: 'Your Purpose',
        flavorText: 'Offer the reason you came here',
        outcomes: [
          {
            id: 'sacrifice_memory_result',
            weight: 100,
            resultText:
              'Why did you enter? The memory fades. But you remain. Purposeless, perhaps. But powerful.',
            rewards: [
              { type: 'hp_max', amount: 25 },
              { type: 'relic' },
            ],
            costs: [{ type: 'curse_add', amount: 1 }],
            loreFragment:
              'You forget why you came. It doesn\'t matter now. All that matters is what you\'ll do before you leave—or before you become like Lyra.',
          },
        ],
      },
      {
        id: 'break_stone',
        text: 'Break the Stone',
        flavorText: 'End this cycle of sacrifice',
        hpCost: 15,
        outcomes: [
          {
            id: 'break_stone_result',
            weight: 100,
            resultText:
              'You shatter the stone with a blow that should not be possible. The accumulated power erupts outward—into you.',
            rewards: [
              { type: 'hp_max', amount: 30 },
              { type: 'damage_bonus', amount: 5 },
            ],
            costs: [
              { type: 'curse_add', amount: 2 },
              { type: 'pain_add', amount: 1 },
            ],
          },
        ],
      },
      {
        id: 'refuse_stone',
        text: 'Give Nothing',
        flavorText: 'The stone has taken enough',
        outcomes: [
          {
            id: 'refuse_stone_result',
            weight: 100,
            resultText:
              'You offer nothing. The stone continues to pulse. It has waited centuries. It can wait longer.',
          },
        ],
      },
    ],
  },
];
