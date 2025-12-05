import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// Starter Cards (10 cards in starter deck)
export const SUMMONER_STARTER_CARDS: Record<string, CardDefinition> = {
  spirit_bolt: {
    id: 'spirit_bolt',
    name: 'Spirit Bolt',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 4 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
  },
  summon_wisp: {
    id: 'summon_wisp',
    name: 'Summon Wisp',
    type: CardType.SKILL,
    cost: 1,
    description: 'Summon a Wisp (4 HP, 2 attack).',
    effects: [{ type: EffectType.SUMMON_MINION, amount: 0, minionId: 'wisp' }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
  },
  shield_minions: {
    id: 'shield_minions',
    name: 'Shield Minions',
    type: CardType.SKILL,
    cost: 1,
    description: 'All minions gain 4 block.',
    effects: [{ type: EffectType.BLOCK_ALL_MINIONS, amount: 4 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
  },
  rally: {
    id: 'rally',
    name: 'Rally',
    type: CardType.SKILL,
    cost: 1,
    description: 'All minions attack immediately.',
    effects: [{ type: EffectType.MINIONS_ATTACK, amount: 0 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
  },
  soul_link: {
    id: 'soul_link',
    name: 'Soul Link',
    type: CardType.SKILL,
    cost: 0,
    description: 'Gain block equal to total minion HP.',
    effects: [{ type: EffectType.GAIN_BLOCK_FROM_MINION_HP, amount: 0 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
  },
};

// Starter Block Bonus Card
export const SUMMONER_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  spirit_fortress: {
    id: 'spirit_fortress',
    name: 'Spirit Fortress',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Fracture.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SUMMONER,
    fracture: true,
  },
};

// Combined card pool (excludes starters for rewards - to be expanded later)
export const SUMMONER_REWARD_POOL: CardDefinition[] = [];

// All Summoner cards including starters
export const SUMMONER_CARDS: Record<string, CardDefinition> = {
  ...SUMMONER_STARTER_CARDS,
  ...SUMMONER_BLOCK_BONUS_CARD,
};
