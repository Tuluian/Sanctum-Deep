import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId, StatusType } from '@/types';

// Starter Cards (10 cards in starter deck)
export const SHADOW_STALKER_STARTER_CARDS: Record<string, CardDefinition> = {
  shadow_strike: {
    id: 'shadow_strike',
    name: 'Shadow Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. If in Shadow: deal 8 instead.',
    effects: [{ type: EffectType.DAMAGE_IN_SHADOW, amount: 5 }], // amount is base, shadowDamage added via effect handler
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SHADOW_STALKER,
  },
  fade: {
    id: 'fade',
    name: 'Fade',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 4 block. Gain 1 Shadow Energy.',
    effects: [
      { type: EffectType.BLOCK, amount: 4 },
      { type: EffectType.GAIN_SHADOW_ENERGY, amount: 1 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SHADOW_STALKER,
  },
  evade: {
    id: 'evade',
    name: 'Evade',
    type: CardType.SKILL,
    cost: 0,
    description: 'Negate the next attack against you.',
    effects: [{ type: EffectType.APPLY_STATUS, amount: 1, target: 'self' }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SHADOW_STALKER,
  },
  shadowstep: {
    id: 'shadowstep',
    name: 'Shadowstep',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Enter Shadow for 1 turn. Consume all Shadow Energy to deal 5 damage per stack.',
    effects: [
      { type: EffectType.ENTER_SHADOW, amount: 1 },
      { type: EffectType.CONSUME_SHADOW_ENERGY_DAMAGE, amount: 5, perStack: 5 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.SHADOW_STALKER,
  },
};

// Set status type for evade
(SHADOW_STALKER_STARTER_CARDS.evade.effects[0] as { type: EffectType; amount: number; target: string; statusType?: StatusType }).statusType = StatusType.EVADE;

// Add shadow damage amount to shadow strike
(SHADOW_STALKER_STARTER_CARDS.shadow_strike.effects[0] as { type: EffectType; amount: number; shadowDamage?: number }).shadowDamage = 8;

// Additional common cards
export const SHADOW_STALKER_COMMON_CARDS: Record<string, CardDefinition> = {
  quick_slash: {
    id: 'quick_slash',
    name: 'Quick Slash',
    type: CardType.ATTACK,
    cost: 0,
    description: 'Deal 4 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 4 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.SHADOW_STALKER,
  },
  gather_shadows: {
    id: 'gather_shadows',
    name: 'Gather Shadows',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 2 Shadow Energy. Gain 2 block.',
    effects: [
      { type: EffectType.GAIN_SHADOW_ENERGY, amount: 2 },
      { type: EffectType.BLOCK, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.SHADOW_STALKER,
  },
};

// Reward pool
export const SHADOW_STALKER_REWARD_POOL: CardDefinition[] = [
  SHADOW_STALKER_COMMON_CARDS.quick_slash,
  SHADOW_STALKER_COMMON_CARDS.gather_shadows,
];

// All Shadow Stalker cards
export const SHADOW_STALKER_CARDS: Record<string, CardDefinition> = {
  ...SHADOW_STALKER_STARTER_CARDS,
  ...SHADOW_STALKER_COMMON_CARDS,
};
