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
    starterDeckRecipe: [
      { cardId: 'soul_rend', count: 4 },
      { cardId: 'dark_bargain', count: 3 },
      { cardId: 'blood_pact', count: 2 },
      { cardId: 'hellfire', count: 1 },
    ],
  },
  [CharacterClassId.OATHSWORN]: {
    id: CharacterClassId.OATHSWORN,
    name: 'Oathsworn',
    maxHp: 75,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'righteous_strike', count: 4 },
      { cardId: 'sacred_shield', count: 3 },
      { cardId: 'oath_of_valor', count: 2 },
      { cardId: 'judgment', count: 1 },
    ],
  },
  [CharacterClassId.FEY_TOUCHED]: {
    id: CharacterClassId.FEY_TOUCHED,
    name: 'Fey-Touched',
    maxHp: 65,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'fey_bolt', count: 4 },
      { cardId: 'glamour', count: 3 },
      { cardId: 'pixies_gift', count: 2 },
      { cardId: 'tricksters_trade', count: 1 },
    ],
  },
  [CharacterClassId.CELESTIAL]: {
    id: CharacterClassId.CELESTIAL,
    name: 'Celestial',
    maxHp: 70,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'holy_bolt', count: 4 },
      { cardId: 'celestial_shield', count: 3 },
      { cardId: 'blessing', count: 2 },
      { cardId: 'smite_the_wicked_celestial', count: 1 },
    ],
  },
  [CharacterClassId.SUMMONER]: {
    id: CharacterClassId.SUMMONER,
    name: 'Summoner',
    maxHp: 65,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'spirit_bolt', count: 3 },
      { cardId: 'summon_wisp', count: 3 },
      { cardId: 'shield_minions', count: 2 },
      { cardId: 'rally', count: 1 },
      { cardId: 'soul_link', count: 1 },
    ],
  },
  [CharacterClassId.BARGAINER]: {
    id: CharacterClassId.BARGAINER,
    name: 'Bargainer',
    maxHp: 80,
    maxResolve: 3,
    starterDeckRecipe: [
      { cardId: 'dark_pact', count: 3 },
      { cardId: 'infernal_shield', count: 3 },
      { cardId: 'collect_favor', count: 2 },
      { cardId: 'debt_collector', count: 1 },
      { cardId: 'blood_payment', count: 1 },
    ],
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
