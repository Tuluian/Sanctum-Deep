import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// Starter Cards (10 cards in starter deck)
export const GOBLIN_STARTER_CARDS: Record<string, CardDefinition> = {
  bite: {
    id: 'bite',
    name: 'Bite',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.GOBLIN,
  },
  scrounge: {
    id: 'scrounge',
    name: 'Scrounge',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 3 block. Draw 1 card.',
    effects: [
      { type: EffectType.BLOCK, amount: 3 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.GOBLIN,
  },
  gobble: {
    id: 'gobble',
    name: 'Gobble',
    type: CardType.SKILL,
    cost: 1,
    description: 'Destroy a card in hand. Gain effects based on card type.',
    effects: [{ type: EffectType.GOBBLE_CARD, amount: 0 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.GOBLIN,
  },
  hoard: {
    id: 'hoard',
    name: 'Hoard',
    type: CardType.SKILL,
    cost: 0,
    description: 'Draw 2 cards. If hand >7 cards, enter Goblin Mode.',
    effects: [
      { type: EffectType.DRAW_CARDS, amount: 2 },
      { type: EffectType.CHECK_GOBLIN_MODE, amount: 7 }, // threshold
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.GOBLIN,
  },
  regurgitate: {
    id: 'regurgitate',
    name: 'Regurgitate',
    type: CardType.SKILL,
    cost: 2,
    description: 'Return a random Gobbled card to hand this combat.',
    effects: [{ type: EffectType.REGURGITATE_CARD, amount: 0 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.GOBLIN,
  },
};

// Additional common cards
export const GOBLIN_COMMON_CARDS: Record<string, CardDefinition> = {
  chomp: {
    id: 'chomp',
    name: 'Chomp',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 7 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 7 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.GOBLIN,
  },
  hoarders_delight: {
    id: 'hoarders_delight',
    name: "Hoarder's Delight",
    type: CardType.SKILL,
    cost: 0,
    description: 'Draw 3 cards. If hand >7 cards, enter Goblin Mode.',
    effects: [
      { type: EffectType.DRAW_CARDS, amount: 3 },
      { type: EffectType.CHECK_GOBLIN_MODE, amount: 7 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.GOBLIN,
  },
  snack_time: {
    id: 'snack_time',
    name: 'Snack Time',
    type: CardType.SKILL,
    cost: 0,
    description: 'Gobble a card. Gain 5 block.',
    effects: [
      { type: EffectType.GOBBLE_CARD, amount: 0 },
      { type: EffectType.BLOCK, amount: 5 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.GOBLIN,
  },
};

// Reward pool
export const GOBLIN_REWARD_POOL: CardDefinition[] = [
  GOBLIN_COMMON_CARDS.chomp,
  GOBLIN_COMMON_CARDS.hoarders_delight,
  GOBLIN_COMMON_CARDS.snack_time,
];

// All Goblin cards
export const GOBLIN_CARDS: Record<string, CardDefinition> = {
  ...GOBLIN_STARTER_CARDS,
  ...GOBLIN_COMMON_CARDS,
};
