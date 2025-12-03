import { CardDefinition, CardType, EffectType } from '@/types';

export const CLERIC_CARDS: Record<string, CardDefinition> = {
  smite: {
    id: 'smite',
    name: 'Smite',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
  },
  shield_of_faith: {
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: EffectType.BLOCK, amount: 5 }],
  },
  prayer_of_mending: {
    id: 'prayer_of_mending',
    name: 'Prayer of Mending',
    type: CardType.SKILL,
    cost: 1,
    description: 'Heal 6 HP.',
    effects: [{ type: EffectType.HEAL, amount: 6 }],
  },
  consecrate: {
    id: 'consecrate',
    name: 'Consecrate',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 3 damage. Heal 3 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 3 },
      { type: EffectType.HEAL, amount: 3 },
    ],
  },
};
