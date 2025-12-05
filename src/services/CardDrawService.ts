/**
 * CardDrawService
 *
 * Manages the between-run card draw system.
 * After each run (win or lose), players can draw from a pool of cards
 * to add to their permanent collection for meta-progression.
 */

import { CharacterClassId, CardDefinition, CardRarity } from '@/types';
import { SaveManager } from './SaveManager';
import { getCardUnlockService } from './CardUnlockService';
import { CLERIC_REWARD_POOL } from '@/data/cards/cleric';
import { KNIGHT_REWARD_POOL } from '@/data/cards/knight';
import { DIABOLIST_REWARD_POOL } from '@/data/cards/diabolist';
import { OATHSWORN_REWARD_POOL } from '@/data/cards/oathsworn';
import { FEY_TOUCHED_REWARD_POOL } from '@/data/cards/fey_touched';
import { CELESTIAL_REWARD_POOL } from '@/data/cards/celestial';
import { SUMMONER_REWARD_POOL } from '@/data/cards/summoner';
import { BARGAINER_REWARD_POOL } from '@/data/cards/bargainer';
import { TIDECALLER_REWARD_POOL } from '@/data/cards/tidecaller';
import { SHADOW_STALKER_REWARD_POOL } from '@/data/cards/shadowstalker';
import { GOBLIN_REWARD_POOL } from '@/data/cards/goblin';

// Configuration
const CARDS_TO_DRAW = 3; // Show 3 cards, pick 1
const RARITY_WEIGHTS = {
  [CardRarity.COMMON]: 60,
  [CardRarity.UNCOMMON]: 30,
  [CardRarity.RARE]: 10,
};

// Win bonus: better odds for rarer cards
const WIN_RARITY_WEIGHTS = {
  [CardRarity.COMMON]: 45,
  [CardRarity.UNCOMMON]: 40,
  [CardRarity.RARE]: 15,
};

export interface DrawnCard {
  card: CardDefinition;
  isNew: boolean; // First time getting this card
  duplicateBonus?: number; // Soul Echoes bonus if duplicate
}

export interface CardDrawResult {
  drawnCards: DrawnCard[];
  selectedCard: DrawnCard | null;
  bonusSoulEchoes: number;
}

/**
 * Get the reward pool for a specific class
 */
function getClassRewardPool(classId: CharacterClassId): CardDefinition[] {
  const pools: Record<CharacterClassId, CardDefinition[]> = {
    [CharacterClassId.CLERIC]: CLERIC_REWARD_POOL,
    [CharacterClassId.DUNGEON_KNIGHT]: KNIGHT_REWARD_POOL,
    [CharacterClassId.DIABOLIST]: DIABOLIST_REWARD_POOL,
    [CharacterClassId.OATHSWORN]: OATHSWORN_REWARD_POOL,
    [CharacterClassId.FEY_TOUCHED]: FEY_TOUCHED_REWARD_POOL,
    [CharacterClassId.CELESTIAL]: CELESTIAL_REWARD_POOL,
    [CharacterClassId.SUMMONER]: SUMMONER_REWARD_POOL,
    [CharacterClassId.BARGAINER]: BARGAINER_REWARD_POOL,
    [CharacterClassId.TIDECALLER]: TIDECALLER_REWARD_POOL,
    [CharacterClassId.SHADOW_STALKER]: SHADOW_STALKER_REWARD_POOL,
    [CharacterClassId.GOBLIN]: GOBLIN_REWARD_POOL,
  };
  return pools[classId] || [];
}

/**
 * Select a rarity based on weighted odds
 */
function selectRarity(isVictory: boolean): CardRarity {
  const weights = isVictory ? WIN_RARITY_WEIGHTS : RARITY_WEIGHTS;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) {
      return rarity as CardRarity;
    }
  }

  return CardRarity.COMMON;
}

/**
 * Draw random cards from the class pool
 */
export function drawCardsForRun(
  classId: CharacterClassId,
  isVictory: boolean
): DrawnCard[] {
  const pool = getClassRewardPool(classId);
  const unlockService = getCardUnlockService();
  const collection = SaveManager.getCardCollection(classId);

  // Filter to only unlocked cards
  const availablePool = pool.filter((card) =>
    unlockService.isCardUnlocked(card.id)
  );

  if (availablePool.length === 0) {
    return [];
  }

  // Group cards by rarity
  const cardsByRarity: Partial<Record<CardRarity, CardDefinition[]>> = {
    [CardRarity.STARTER]: [],
    [CardRarity.COMMON]: [],
    [CardRarity.UNCOMMON]: [],
    [CardRarity.RARE]: [],
  };

  for (const card of availablePool) {
    const rarity = card.rarity || CardRarity.COMMON;
    const rarityGroup = cardsByRarity[rarity];
    if (rarityGroup) {
      rarityGroup.push(card);
    }
  }

  const drawnCards: DrawnCard[] = [];
  const selectedIds = new Set<string>();

  // Draw CARDS_TO_DRAW cards
  for (let i = 0; i < CARDS_TO_DRAW; i++) {
    // Select rarity
    let rarity = selectRarity(isVictory);
    let attempts = 0;

    // Fallback to other rarities if selected rarity is empty
    let pool = cardsByRarity[rarity] || [];
    while (
      pool.length === 0 ||
      pool.every((c) => selectedIds.has(c.id))
    ) {
      // Try next lower rarity
      if (rarity === CardRarity.RARE) rarity = CardRarity.UNCOMMON;
      else if (rarity === CardRarity.UNCOMMON) rarity = CardRarity.COMMON;
      else break;

      pool = cardsByRarity[rarity] || [];
      attempts++;
      if (attempts > 3) break;
    }

    const rarityPool = (cardsByRarity[rarity] || []).filter(
      (c) => !selectedIds.has(c.id)
    );
    if (rarityPool.length === 0) continue;

    // Select random card from rarity pool
    const card = rarityPool[Math.floor(Math.random() * rarityPool.length)];
    selectedIds.add(card.id);

    // Check if this is a new card or duplicate
    const isOwned = collection.some((c) => c.cardId === card.id);

    drawnCards.push({
      card,
      isNew: !isOwned,
    });
  }

  return drawnCards;
}

/**
 * Add a selected card to the player's collection
 */
export function selectDrawnCard(
  classId: CharacterClassId,
  cardId: string
): { isNew: boolean; duplicateSoulEchoes: number } {
  return SaveManager.addCardToCollection(classId, cardId);
}

/**
 * Skip the card draw (player chooses not to add any card)
 */
export function skipCardDraw(): void {
  // No-op for now, but could track statistics or award consolation prize
}

/**
 * Get collection progress for a class
 */
export function getCollectionProgress(classId: CharacterClassId): {
  collected: number;
  total: number;
  percentage: number;
} {
  const pool = getClassRewardPool(classId);
  const unlockService = getCardUnlockService();
  const collection = SaveManager.getCardCollection(classId);

  // Only count unlocked cards toward total
  const unlockedCards = pool.filter((card) =>
    unlockService.isCardUnlocked(card.id)
  );

  const collected = collection.length;
  const total = unlockedCards.length;
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

  return { collected, total, percentage };
}

/**
 * Check if player has a card in their collection
 */
export function hasCardInCollection(
  classId: CharacterClassId,
  cardId: string
): boolean {
  return SaveManager.hasCard(classId, cardId);
}

/**
 * Get all collected cards for a class (for deck building)
 */
export function getCollectedCards(classId: CharacterClassId): CardDefinition[] {
  const pool = getClassRewardPool(classId);
  const collection = SaveManager.getCardCollection(classId);
  const collectedIds = new Set(collection.map((c) => c.cardId));

  return pool.filter((card) => collectedIds.has(card.id));
}
