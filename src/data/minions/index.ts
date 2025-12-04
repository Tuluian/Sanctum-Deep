import { MinionDefinition } from '@/types';

// Summoner minion definitions
export const MINION_DEFINITIONS: Record<string, MinionDefinition> = {
  wisp: {
    id: 'wisp',
    name: 'Wisp',
    maxHp: 4,
    attackDamage: 2,
    description: 'A small spirit that protects and attacks.',
  },
};

export function getMinionById(id: string): MinionDefinition | undefined {
  return MINION_DEFINITIONS[id];
}
