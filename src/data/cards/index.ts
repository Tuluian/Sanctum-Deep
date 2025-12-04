import { CardDefinition, CardRarity, CharacterClassId } from '@/types';
import {
  CLERIC_CARDS,
  CLERIC_STARTER_CARDS,
  CLERIC_REWARD_POOL,
} from './cleric';
import {
  KNIGHT_CARDS,
  KNIGHT_STARTER_CARDS,
  KNIGHT_REWARD_POOL,
} from './knight';

// All cards indexed by ID
export const ALL_CARDS: Record<string, CardDefinition> = {
  ...CLERIC_CARDS,
  ...KNIGHT_CARDS,
};

export function getCardById(id: string): CardDefinition | undefined {
  return ALL_CARDS[id];
}

// Get reward pool by class
export function getClassRewardPool(classId: CharacterClassId): CardDefinition[] {
  switch (classId) {
    case CharacterClassId.CLERIC:
      return CLERIC_REWARD_POOL;
    case CharacterClassId.DUNGEON_KNIGHT:
      return KNIGHT_REWARD_POOL;
    default:
      return [];
  }
}

// Get random card reward based on rarity weights
export function getRandomCardReward(
  classId: CharacterClassId,
  count: number = 3
): CardDefinition[] {
  const pool = getClassRewardPool(classId);
  if (pool.length === 0) return [];

  const results: CardDefinition[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Roll for rarity: 70% common, 25% uncommon, 5% rare
    const roll = Math.random();
    let targetRarity: CardRarity;
    if (roll < 0.05) {
      targetRarity = CardRarity.RARE;
    } else if (roll < 0.30) {
      targetRarity = CardRarity.UNCOMMON;
    } else {
      targetRarity = CardRarity.COMMON;
    }

    // Filter by rarity and unused
    let candidates = pool.filter(
      (c) => c.rarity === targetRarity && !usedIds.has(c.id)
    );

    // Fallback to any unused card if no matches
    if (candidates.length === 0) {
      candidates = pool.filter((c) => !usedIds.has(c.id));
    }

    if (candidates.length > 0) {
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      results.push(picked);
      usedIds.add(picked.id);
    }
  }

  return results;
}

export {
  CLERIC_CARDS,
  CLERIC_STARTER_CARDS,
  CLERIC_REWARD_POOL,
  KNIGHT_CARDS,
  KNIGHT_STARTER_CARDS,
  KNIGHT_REWARD_POOL,
};
