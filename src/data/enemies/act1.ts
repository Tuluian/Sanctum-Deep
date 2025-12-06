import { EnemyDefinition, IntentType, StatusType } from '@/types';

export const ACT1_ENEMIES: Record<string, EnemyDefinition> = {
  // --- Original 3 enemies ---
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

  // --- Story 2.2: New Act 1 Enemies ---

  // Haunted Armor (35 HP) - Defensive enemy
  haunted_armor: {
    id: 'haunted_armor',
    name: 'Haunted Armor',
    maxHp: 35,
    moves: [
      { id: 'shield_bash', name: 'Shield Bash', intent: IntentType.ATTACK, damage: 5, weight: 50 },
      { id: 'fortify', name: 'Fortify', intent: IntentType.DEFEND, block: 10, weight: 30 },
      { id: 'heavy_swing', name: 'Heavy Swing', intent: IntentType.ATTACK, damage: 8, weight: 20 },
    ],
  },

  // Acolyte (25 HP) - Support/buffer enemy
  acolyte: {
    id: 'acolyte',
    name: 'Acolyte',
    maxHp: 25,
    moves: [
      { id: 'dark_prayer', name: 'Dark Prayer', intent: IntentType.BUFF_ALLY, buffType: StatusType.MIGHT, buffAmount: 2, weight: 40 },
      { id: 'shadow_bolt', name: 'Shadow Bolt', intent: IntentType.ATTACK, damage: 4, weight: 40 },
      { id: 'sacrifice', name: 'Sacrifice', intent: IntentType.HEAL, heal: 8, selfDamage: 5, weight: 20 },
    ],
  },

  // Ghoul (38 HP) - Aggressive enemy
  ghoul: {
    id: 'ghoul',
    name: 'Ghoul',
    maxHp: 38,
    moves: [
      { id: 'claw', name: 'Claw', intent: IntentType.ATTACK, damage: 7, weight: 45 },
      { id: 'frenzy', name: 'Frenzy', intent: IntentType.MULTI_ATTACK, damage: 4, times: 2, weight: 35 },
      { id: 'devour', name: 'Devour', intent: IntentType.ATTACK, damage: 5, heal: 5, weight: 20 },
    ],
  },

  // Bone Archer (22 HP) - Glass cannon
  bone_archer: {
    id: 'bone_archer',
    name: 'Bone Archer',
    maxHp: 22,
    moves: [
      { id: 'arrow_shot', name: 'Arrow Shot', intent: IntentType.ATTACK, damage: 9, weight: 60 },
      { id: 'poison_arrow', name: 'Poison Arrow', intent: IntentType.ATTACK, damage: 5, debuffType: StatusType.BLEEDING, debuffDuration: 3, weight: 25 },
      { id: 'retreat', name: 'Retreat', intent: IntentType.DEFEND, block: 4, weight: 15 },
    ],
  },

  // Shade (28 HP) - Debuffer enemy
  shade: {
    id: 'shade',
    name: 'Shade',
    maxHp: 28,
    moves: [
      { id: 'life_drain', name: 'Life Drain', intent: IntentType.ATTACK, damage: 4, heal: 4, weight: 35 },
      { id: 'curse', name: 'Curse', intent: IntentType.DEBUFF, debuffType: StatusType.IMPAIRED, debuffDuration: 2, weight: 35 },
      { id: 'phase', name: 'Phase', intent: IntentType.BUFF, weight: 30 }, // Becomes untargetable
    ],
  },

  // Training Dummy (15 HP) - Tutorial enemy, very weak
  training_dummy: {
    id: 'training_dummy',
    name: 'Training Dummy',
    maxHp: 15,
    moves: [
      { id: 'weak_swing', name: 'Weak Swing', intent: IntentType.ATTACK, damage: 4, weight: 60 },
      { id: 'brace', name: 'Brace', intent: IntentType.DEFEND, block: 3, weight: 40 },
    ],
  },
};

export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ACT1_ENEMIES[id];
}
