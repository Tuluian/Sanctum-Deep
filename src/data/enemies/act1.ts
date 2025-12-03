import { EnemyDefinition, IntentType } from '@/types';

export const ACT1_ENEMIES: Record<string, EnemyDefinition> = {
  cultist: {
    id: 'cultist',
    name: 'Cultist',
    maxHp: 42,
    moves: [
      { id: 'dark_bolt', name: 'Dark Bolt', intent: IntentType.ATTACK, damage: 6, weight: 40 },
      { id: 'defend', name: 'Defend', intent: IntentType.DEFEND, block: 8, weight: 30 },
      { id: 'shadow_strike', name: 'Shadow Strike', intent: IntentType.ATTACK, damage: 9, weight: 30 },
    ],
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    maxHp: 30,
    moves: [
      { id: 'bone_strike', name: 'Bone Strike', intent: IntentType.ATTACK, damage: 8, weight: 50 },
      { id: 'rattle', name: 'Rattle', intent: IntentType.ATTACK, damage: 5, weight: 30 },
      { id: 'guard', name: 'Guard', intent: IntentType.DEFEND, block: 5, weight: 20 },
    ],
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    maxHp: 55,
    moves: [
      { id: 'slam', name: 'Slam', intent: IntentType.ATTACK, damage: 10, weight: 40 },
      { id: 'shamble', name: 'Shamble', intent: IntentType.DEFEND, block: 12, weight: 40 },
      { id: 'bite', name: 'Bite', intent: IntentType.ATTACK, damage: 6, weight: 20 },
    ],
  },
};

export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ACT1_ENEMIES[id];
}
