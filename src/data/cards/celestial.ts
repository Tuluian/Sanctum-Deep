import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// Starter Cards (10 cards in starter deck)
export const CELESTIAL_STARTER_CARDS: Record<string, CardDefinition> = {
  holy_bolt: {
    id: 'holy_bolt',
    name: 'Holy Bolt',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CELESTIAL,
  },
  celestial_shield: {
    id: 'celestial_shield',
    name: 'Celestial Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: EffectType.BLOCK, amount: 5 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CELESTIAL,
  },
  blessing: {
    id: 'blessing',
    name: 'Blessing',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 1 Radiance.',
    effects: [{ type: EffectType.GAIN_RADIANCE, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CELESTIAL,
  },
  smite_the_wicked_celestial: {
    id: 'smite_the_wicked_celestial',
    name: 'Smite the Wicked',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage. Consume all Radiance to deal +4 damage per stack.',
    effects: [
      { type: EffectType.DAMAGE, amount: 8 },
      { type: EffectType.CONSUME_RADIANCE_DAMAGE, amount: 0, perStack: 4 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CELESTIAL,
  },
};

// Starter Block Bonus Card
export const CELESTIAL_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  heavenly_barrier: {
    id: 'heavenly_barrier',
    name: 'Heavenly Barrier',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Exhaust.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CELESTIAL,
    exhaust: true,
  },
};

// Combined card pool (excludes starters for rewards - to be expanded later)
export const CELESTIAL_REWARD_POOL: CardDefinition[] = [];

// All Celestial cards including starters
export const CELESTIAL_CARDS: Record<string, CardDefinition> = {
  ...CELESTIAL_STARTER_CARDS,
  ...CELESTIAL_BLOCK_BONUS_CARD,
};
