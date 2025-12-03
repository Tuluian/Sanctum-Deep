import { CardDefinition, CardType, EffectType } from '@/types';

export const KNIGHT_CARDS: Record<string, CardDefinition> = {
  sword_strike: {
    id: 'sword_strike',
    name: 'Sword Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
  },
  raise_shield: {
    id: 'raise_shield',
    name: 'Raise Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block.',
    effects: [{ type: EffectType.BLOCK, amount: 6 }],
  },
  bulwark_stance: {
    id: 'bulwark_stance',
    name: 'Bulwark Stance',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 8 block. Your next attack deals +3 damage.',
    effects: [
      { type: EffectType.BLOCK, amount: 8 },
      { type: EffectType.APPLY_STATUS, amount: 3 },
    ],
  },
};
