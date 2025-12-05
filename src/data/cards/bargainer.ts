import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId, PriceType } from '@/types';

// Starter Cards (10 cards in starter deck)
export const BARGAINER_STARTER_CARDS: Record<string, CardDefinition> = {
  dark_pact: {
    id: 'dark_pact',
    name: 'Dark Pact',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 8 damage. PRICE: Lose 1 HP per turn.',
    effects: [{ type: EffectType.DAMAGE, amount: 8 }],
    price: { type: PriceType.HP_DRAIN, amount: 1 },
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
  },
  infernal_shield: {
    id: 'infernal_shield',
    name: 'Infernal Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 10 block. PRICE: -1 max Resolve until combat ends.',
    effects: [{ type: EffectType.BLOCK, amount: 10 }],
    price: { type: PriceType.RESOLVE_TAX, amount: 1 },
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
  },
  collect_favor: {
    id: 'collect_favor',
    name: 'Collect Favor',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 2 Favor.',
    effects: [{ type: EffectType.GAIN_FAVOR, amount: 2 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
  },
  debt_collector: {
    id: 'debt_collector',
    name: 'Debt Collector',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal damage equal to 3x your active Prices.',
    effects: [{ type: EffectType.DAMAGE_PER_PRICE, amount: 0, multiplier: 3 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
  },
  blood_payment: {
    id: 'blood_payment',
    name: 'Blood Payment',
    type: CardType.SKILL,
    cost: 0,
    description: 'Lose 5 HP. Remove all Prices.',
    effects: [
      { type: EffectType.LOSE_HP, amount: 5 },
      { type: EffectType.REMOVE_ALL_PRICES, amount: 0 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
  },
};

// Bargainer curse card
export const DEMONIC_DEBT: CardDefinition = {
  id: 'demonic_debt',
  name: 'Demonic Debt',
  type: CardType.CURSE,
  cost: -1, // Unplayable
  description: 'Unplayable. At end of turn, if in hand, lose 2 HP.',
  effects: [],
  unplayable: true,
  onTurnEnd: [{ type: EffectType.LOSE_HP, amount: 2 }],
  rarity: CardRarity.COMMON,
  classId: CharacterClassId.BARGAINER,
};

// Bargainer curses
export const BARGAINER_CURSES: Record<string, CardDefinition> = {
  demonic_debt: DEMONIC_DEBT,
};

// Starter Block Bonus Card
export const BARGAINER_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  infernal_bulwark: {
    id: 'infernal_bulwark',
    name: 'Infernal Bulwark',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Fracture.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.BARGAINER,
    fracture: true,
  },
};

// Combined card pool (excludes starters for rewards - to be expanded later)
export const BARGAINER_REWARD_POOL: CardDefinition[] = [];

// All Bargainer cards including starters
export const BARGAINER_CARDS: Record<string, CardDefinition> = {
  ...BARGAINER_STARTER_CARDS,
  ...BARGAINER_CURSES,
  ...BARGAINER_BLOCK_BONUS_CARD,
};
