import { Card, CharacterClass, CharacterClassId } from '@/types';
import { getCardById } from './cards';

export const CLASSES: Record<CharacterClassId, CharacterClass> = {
  [CharacterClassId.CLERIC]: {
    id: CharacterClassId.CLERIC,
    name: 'Cleric',
    maxHp: 75,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'smite', count: 4 },
      { cardId: 'shield_of_faith', count: 4 },
      { cardId: 'prayer_of_mending', count: 1 },
      { cardId: 'consecrate', count: 1 },
    ],
  },
  [CharacterClassId.DUNGEON_KNIGHT]: {
    id: CharacterClassId.DUNGEON_KNIGHT,
    name: 'Dungeon Knight',
    maxHp: 80,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'sword_strike', count: 5 },
      { cardId: 'raise_shield', count: 4 },
      { cardId: 'bulwark_stance', count: 1 },
    ],
  },
  [CharacterClassId.DIABOLIST]: {
    id: CharacterClassId.DIABOLIST,
    name: 'Diabolist',
    maxHp: 70,
    maxResolve: 3,
    starterDeckRecipe: [],
  },
  [CharacterClassId.OATHSWORN]: {
    id: CharacterClassId.OATHSWORN,
    name: 'Oathsworn',
    maxHp: 75,
    maxResolve: 3,
    starterDeckRecipe: [],
  },
  [CharacterClassId.FEY_TOUCHED]: {
    id: CharacterClassId.FEY_TOUCHED,
    name: 'Fey-Touched',
    maxHp: 65,
    maxResolve: 3,
    starterDeckRecipe: [],
  },
};

export function createStarterDeck(classId: CharacterClassId): Card[] {
  const characterClass = CLASSES[classId];
  if (!characterClass) {
    throw new Error(`Unknown class: ${classId}`);
  }

  const deck: Card[] = [];
  let instanceCounter = 0;

  for (const recipe of characterClass.starterDeckRecipe) {
    const cardDef = getCardById(recipe.cardId);
    if (!cardDef) {
      console.warn(`Card not found: ${recipe.cardId}`);
      continue;
    }

    for (let i = 0; i < recipe.count; i++) {
      deck.push({
        ...cardDef,
        instanceId: `${recipe.cardId}_${instanceCounter++}`,
      });
    }
  }

  return deck;
}

export function getClassById(id: CharacterClassId): CharacterClass | undefined {
  return CLASSES[id];
}
