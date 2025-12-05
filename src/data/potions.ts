/**
 * Potion Definitions
 */

import { PotionDefinition, PotionRarity, StatusType } from '@/types';

export const POTIONS: Record<string, PotionDefinition> = {
  minor_health_potion: {
    id: 'minor_health_potion',
    name: 'Minor Health Potion',
    description: 'Restore 10 HP',
    rarity: PotionRarity.COMMON,
    icon: '🧴',
    effect: { type: 'heal', amount: 10 },
  },
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restore 25 HP',
    rarity: PotionRarity.COMMON,
    icon: '🧪',
    effect: { type: 'heal', amount: 25 },
  },
  block_potion: {
    id: 'block_potion',
    name: 'Block Potion',
    description: 'Gain 15 Block',
    rarity: PotionRarity.COMMON,
    icon: '🛡️',
    effect: { type: 'block', amount: 15 },
  },
  fire_potion: {
    id: 'fire_potion',
    name: 'Fire Potion',
    description: 'Deal 20 damage to all enemies',
    rarity: PotionRarity.UNCOMMON,
    icon: '🔥',
    effect: { type: 'damage_all', amount: 20 },
  },
  swift_potion: {
    id: 'swift_potion',
    name: 'Swift Potion',
    description: 'Draw 3 cards',
    rarity: PotionRarity.UNCOMMON,
    icon: '💨',
    effect: { type: 'draw', amount: 3 },
  },
  energy_potion: {
    id: 'energy_potion',
    name: 'Energy Potion',
    description: 'Gain 2 Resolve',
    rarity: PotionRarity.UNCOMMON,
    icon: '⚡',
    effect: { type: 'resolve', amount: 2 },
  },
  might_potion: {
    id: 'might_potion',
    name: 'Might Potion',
    description: 'Gain 3 Might',
    rarity: PotionRarity.COMMON,
    icon: '💪',
    effect: { type: 'apply_status', status: StatusType.MIGHT, amount: 3, target: 'self' },
  },
  elixir_of_life: {
    id: 'elixir_of_life',
    name: 'Elixir of Life',
    description: 'Restore 50 HP',
    rarity: PotionRarity.RARE,
    icon: '✨',
    effect: { type: 'heal', amount: 50 },
  },
};

export function getPotion(id: string): PotionDefinition | undefined {
  return POTIONS[id];
}

export function getPotionsByRarity(rarity: PotionRarity): PotionDefinition[] {
  return Object.values(POTIONS).filter(p => p.rarity === rarity);
}
