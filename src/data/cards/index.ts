import { CardDefinition } from '@/types';
import { CLERIC_CARDS } from './cleric';
import { KNIGHT_CARDS } from './knight';

// All cards indexed by ID
export const ALL_CARDS: Record<string, CardDefinition> = {
  ...CLERIC_CARDS,
  ...KNIGHT_CARDS,
};

export function getCardById(id: string): CardDefinition | undefined {
  return ALL_CARDS[id];
}

export { CLERIC_CARDS, KNIGHT_CARDS };
