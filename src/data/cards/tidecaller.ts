import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId, StatusType } from '@/types';

// Starter Cards (10 cards in starter deck)
export const TIDECALLER_STARTER_CARDS: Record<string, CardDefinition> = {
  crashing_wave: {
    id: 'crashing_wave',
    name: 'Crashing Wave',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage. Apply 1 Soaked.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.APPLY_STATUS, amount: 1, target: 'enemy' },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.TIDECALLER,
  },
  tidal_barrier: {
    id: 'tidal_barrier',
    name: 'Tidal Barrier',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 1 Tide.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.GAIN_TIDE, amount: 1 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.TIDECALLER,
  },
  undertow: {
    id: 'undertow',
    name: 'Undertow',
    type: CardType.ATTACK,
    cost: 1,
    description: 'If enemy is Soaked, deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE_IF_SOAKED, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.TIDECALLER,
  },
  drown: {
    id: 'drown',
    name: 'Drown',
    type: CardType.SKILL,
    cost: 1,
    description: 'If enemy HP ≤5% (+1% per Tide), destroy it and gain 10 gold.',
    effects: [{ type: EffectType.DROWN, amount: 5 }], // base threshold 5%
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.TIDECALLER,
  },
};

// Set the status type for crashing_wave's apply status effect
// We need to manually set this as we can't use StatusType in the object literal
TIDECALLER_STARTER_CARDS.crashing_wave.effects[1] = {
  type: EffectType.APPLY_STATUS,
  amount: 1,
  target: 'enemy',
};
// Hacky but we need to add statusType
(TIDECALLER_STARTER_CARDS.crashing_wave.effects[1] as { type: EffectType; amount: number; target: string; statusType?: StatusType }).statusType = StatusType.SOAKED;

// Additional cards for variety
export const TIDECALLER_COMMON_CARDS: Record<string, CardDefinition> = {
  splash: {
    id: 'splash',
    name: 'Splash',
    type: CardType.ATTACK,
    cost: 0,
    description: 'Deal 3 damage. Apply 1 Soaked.',
    effects: [
      { type: EffectType.DAMAGE, amount: 3 },
      { type: EffectType.APPLY_STATUS, amount: 1, target: 'enemy' },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.TIDECALLER,
  },
  rising_tide: {
    id: 'rising_tide',
    name: 'Rising Tide',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 2 Tide. Draw 1 card.',
    effects: [
      { type: EffectType.GAIN_TIDE, amount: 2 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.TIDECALLER,
  },
};

// Reward pool for Tidecaller
export const TIDECALLER_REWARD_POOL: CardDefinition[] = [
  TIDECALLER_COMMON_CARDS.splash,
  TIDECALLER_COMMON_CARDS.rising_tide,
];

// All Tidecaller cards
export const TIDECALLER_CARDS: Record<string, CardDefinition> = {
  ...TIDECALLER_STARTER_CARDS,
  ...TIDECALLER_COMMON_CARDS,
};
