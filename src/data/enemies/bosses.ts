import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 1 Boss: The Bonelord (Lord Vexal)
 *
 * A tragic boss fight against an ancient knight who sought immortality.
 * 3 phases with increasing desperation as HP drops.
 */
export const BONELORD: EnemyDefinition = {
  id: 'bonelord',
  name: 'The Bonelord',
  maxHp: 150,
  isBoss: true,
  isElite: false,
  phaseThresholds: [0.66, 0.33], // Phase 2 at 66% HP, Phase 3 at 33% HP
  moves: [], // Not used for bosses with phases
  phases: [
    // Phase 1: Dominance (HP > 66%)
    {
      moves: [
        {
          id: 'bone_spike',
          name: 'Bone Spike',
          intent: IntentType.ATTACK,
          damage: 10,
          weight: 35,
        },
        {
          id: 'summon_skeletons',
          name: 'Summon Skeletons',
          intent: IntentType.SUMMON,
          summons: ['skeleton', 'skeleton'],
          weight: 25,
          oncePerCombat: false,
        },
        {
          id: 'dark_command',
          name: 'Dark Command',
          intent: IntentType.COMMAND,
          commandMinions: true,
          weight: 20,
        },
        {
          id: 'necrotic_shield',
          name: 'Necrotic Shield',
          intent: IntentType.DEFEND,
          block: 12,
          weight: 20,
        },
      ],
    },
    // Phase 2: Assault (HP 33-66%)
    {
      moves: [
        {
          id: 'bone_storm',
          name: 'Bone Storm',
          intent: IntentType.MULTI_ATTACK,
          damage: 6,
          times: 3,
          weight: 30,
        },
        {
          id: 'death_grip',
          name: 'Death Grip',
          intent: IntentType.ATTACK,
          damage: 8,
          debuffType: StatusType.BOUND,
          debuffDuration: 1,
          weight: 25,
        },
        {
          id: 'raise_dead',
          name: 'Raise Dead',
          intent: IntentType.SUMMON,
          resurrectMinions: true,
          weight: 25,
        },
        {
          id: 'soul_harvest',
          name: 'Soul Harvest',
          intent: IntentType.ATTACK,
          damage: 12,
          heal: 12, // Heals equal to damage dealt
          weight: 20,
        },
      ],
    },
    // Phase 3: Fury (HP < 33%)
    {
      moves: [
        {
          id: 'bone_cataclysm',
          name: 'Bone Cataclysm',
          intent: IntentType.CHARGING,
          damage: 30,
          chargeTurns: 1, // Charges for 1 turn, then attacks
          weight: 35,
        },
        {
          id: 'final_summon',
          name: 'Final Summon',
          intent: IntentType.SUMMON,
          summons: ['bone_archer', 'skeleton'],
          weight: 25,
          oncePerCombat: true,
        },
        {
          id: 'unholy_vigor',
          name: 'Unholy Vigor',
          intent: IntentType.BUFF,
          block: 20,
          buffType: StatusType.MIGHT,
          buffAmount: 3,
          weight: 20,
        },
        {
          id: 'drain_life',
          name: 'Drain Life',
          intent: IntentType.ATTACK,
          damage: 15,
          heal: 10,
          weight: 20,
        },
      ],
    },
  ],
};

/**
 * Skeleton minion - summoned by Bonelord
 */
export const SKELETON: EnemyDefinition = {
  id: 'skeleton',
  name: 'Skeleton',
  maxHp: 20,
  moves: [
    {
      id: 'bone_slash',
      name: 'Bone Slash',
      intent: IntentType.ATTACK,
      damage: 6,
      weight: 70,
    },
    {
      id: 'rattle',
      name: 'Rattle',
      intent: IntentType.DEFEND,
      block: 4,
      weight: 30,
    },
  ],
};

/**
 * Bone Archer - ranged skeleton summoned in Phase 3
 */
export const BONE_ARCHER: EnemyDefinition = {
  id: 'bone_archer',
  name: 'Bone Archer',
  maxHp: 15,
  moves: [
    {
      id: 'bone_arrow',
      name: 'Bone Arrow',
      intent: IntentType.ATTACK,
      damage: 8,
      weight: 60,
    },
    {
      id: 'aimed_shot',
      name: 'Aimed Shot',
      intent: IntentType.ATTACK,
      damage: 12,
      weight: 25,
    },
    {
      id: 'take_cover',
      name: 'Take Cover',
      intent: IntentType.DEFEND,
      block: 6,
      weight: 15,
    },
  ],
};

// Boss lookup by ID
export const BOSSES: Record<string, EnemyDefinition> = {
  bonelord: BONELORD,
};

// Minion lookup by ID (for summoning)
export const MINIONS: Record<string, EnemyDefinition> = {
  skeleton: SKELETON,
  bone_archer: BONE_ARCHER,
};

// All boss-related enemies
export const ALL_BOSS_ENEMIES: Record<string, EnemyDefinition> = {
  ...BOSSES,
  ...MINIONS,
};
