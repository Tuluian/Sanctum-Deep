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
import {
  DIABOLIST_CARDS,
  DIABOLIST_STARTER_CARDS,
  DIABOLIST_REWARD_POOL,
  DIABOLIST_CURSES,
  PAIN_CURSE,
  WEAKNESS_CURSE,
  DOOM_CURSE,
  TORMENT_CURSE,
} from './diabolist';
import {
  OATHSWORN_CARDS,
  OATHSWORN_STARTER_CARDS,
  OATHSWORN_REWARD_POOL,
  OATHSWORN_VOWS,
} from './oathsworn';
import {
  FEY_TOUCHED_CARDS,
  FEY_TOUCHED_STARTER_CARDS,
  FEY_TOUCHED_REWARD_POOL,
} from './fey_touched';
import {
  CELESTIAL_CARDS,
  CELESTIAL_STARTER_CARDS,
  CELESTIAL_REWARD_POOL,
} from './celestial';
import {
  SUMMONER_CARDS,
  SUMMONER_STARTER_CARDS,
  SUMMONER_REWARD_POOL,
} from './summoner';
import {
  BARGAINER_CARDS,
  BARGAINER_STARTER_CARDS,
  BARGAINER_REWARD_POOL,
  BARGAINER_CURSES,
  DEMONIC_DEBT,
} from './bargainer';
import {
  TIDECALLER_CARDS,
  TIDECALLER_STARTER_CARDS,
  TIDECALLER_REWARD_POOL,
} from './tidecaller';
import {
  SHADOW_STALKER_CARDS,
  SHADOW_STALKER_STARTER_CARDS,
  SHADOW_STALKER_REWARD_POOL,
} from './shadowstalker';
import {
  GOBLIN_CARDS,
  GOBLIN_STARTER_CARDS,
  GOBLIN_REWARD_POOL,
} from './goblin';

// All cards indexed by ID
export const ALL_CARDS: Record<string, CardDefinition> = {
  ...CLERIC_CARDS,
  ...KNIGHT_CARDS,
  ...DIABOLIST_CARDS,
  ...OATHSWORN_CARDS,
  ...FEY_TOUCHED_CARDS,
  ...CELESTIAL_CARDS,
  ...SUMMONER_CARDS,
  ...BARGAINER_CARDS,
  ...TIDECALLER_CARDS,
  ...SHADOW_STALKER_CARDS,
  ...GOBLIN_CARDS,
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
    case CharacterClassId.DIABOLIST:
      return DIABOLIST_REWARD_POOL;
    case CharacterClassId.OATHSWORN:
      return OATHSWORN_REWARD_POOL;
    case CharacterClassId.FEY_TOUCHED:
      return FEY_TOUCHED_REWARD_POOL;
    case CharacterClassId.CELESTIAL:
      return CELESTIAL_REWARD_POOL;
    case CharacterClassId.SUMMONER:
      return SUMMONER_REWARD_POOL;
    case CharacterClassId.BARGAINER:
      return BARGAINER_REWARD_POOL;
    case CharacterClassId.TIDECALLER:
      return TIDECALLER_REWARD_POOL;
    case CharacterClassId.SHADOW_STALKER:
      return SHADOW_STALKER_REWARD_POOL;
    case CharacterClassId.GOBLIN:
      return GOBLIN_REWARD_POOL;
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
  DIABOLIST_CARDS,
  DIABOLIST_STARTER_CARDS,
  DIABOLIST_REWARD_POOL,
  DIABOLIST_CURSES,
  PAIN_CURSE,
  WEAKNESS_CURSE,
  DOOM_CURSE,
  TORMENT_CURSE,
  OATHSWORN_CARDS,
  OATHSWORN_STARTER_CARDS,
  OATHSWORN_REWARD_POOL,
  OATHSWORN_VOWS,
  FEY_TOUCHED_CARDS,
  FEY_TOUCHED_STARTER_CARDS,
  FEY_TOUCHED_REWARD_POOL,
  CELESTIAL_CARDS,
  CELESTIAL_STARTER_CARDS,
  CELESTIAL_REWARD_POOL,
  SUMMONER_CARDS,
  SUMMONER_STARTER_CARDS,
  SUMMONER_REWARD_POOL,
  BARGAINER_CARDS,
  BARGAINER_STARTER_CARDS,
  BARGAINER_REWARD_POOL,
  BARGAINER_CURSES,
  DEMONIC_DEBT,
  TIDECALLER_CARDS,
  TIDECALLER_STARTER_CARDS,
  TIDECALLER_REWARD_POOL,
  SHADOW_STALKER_CARDS,
  SHADOW_STALKER_STARTER_CARDS,
  SHADOW_STALKER_REWARD_POOL,
  GOBLIN_CARDS,
  GOBLIN_STARTER_CARDS,
  GOBLIN_REWARD_POOL,
};
