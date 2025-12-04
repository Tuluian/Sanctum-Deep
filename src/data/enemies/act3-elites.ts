import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 3 Elite Enemies - The Fallen Champions
 *
 * Theme: What the player could become if they fail
 * These are champions who nearly defeated the Hollow God,
 * then became what they fought. The hardest non-boss fights.
 */
export const ACT3_ELITE_ENEMIES: Record<string, EnemyDefinition> = {
  // --- Greater Demon (130 HP) - Summoner/Executioner ---
  // Archdemon Mal'goroth - Once Saint Mal'gorath, Champion of the Silver Flame
  // His faith broke when he saw the futility of hope
  greater_demon: {
    id: 'greater_demon',
    name: 'Greater Demon',
    maxHp: 130,
    isElite: true,
    phaseThresholds: [0.5], // Phase 2 at 50% HP (65 HP)
    moves: [], // Not used when phases are defined
    phases: [
      {
        // Phase 1: Commander (HP > 65) - Summons and buffs demons
        moves: [
          {
            id: 'hellfire_blast',
            name: 'Hellfire Blast',
            intent: IntentType.ATTACK,
            damage: 15,
            weight: 30,
          },
          {
            id: 'summon_imps',
            name: 'Summon Imps',
            intent: IntentType.SUMMON,
            summons: ['imp', 'imp'],
            weight: 30,
          },
          {
            id: 'demonic_roar',
            name: 'Demonic Roar',
            intent: IntentType.BUFF_ALLY,
            buffType: StatusType.MIGHT,
            buffAmount: 3,
            // Targets all demons
            weight: 25,
          },
          {
            id: 'consume_minion',
            name: 'Consume Minion',
            intent: IntentType.HEAL,
            heal: 20,
            // Special: Destroys an Imp to heal
            weight: 15,
          },
        ],
      },
      {
        // Phase 2: Unleashed (HP <= 65) - All-out destruction
        // Infernal Presence increases to -4 damage reduction
        moves: [
          {
            id: 'cataclysm',
            name: 'Cataclysm',
            intent: IntentType.ATTACK,
            damage: 12,
            // Special: Hits ALL targets including allies
            weight: 35,
          },
          {
            id: 'soul_harvest',
            name: 'Soul Harvest',
            intent: IntentType.ATTACK,
            damage: 18,
            heal: 18, // Lifesteal
            weight: 30,
          },
          {
            id: 'demonic_ascension',
            name: 'Demonic Ascension',
            intent: IntentType.DEFEND,
            block: 20,
            buffType: StatusType.MIGHT,
            buffAmount: 5, // +5 damage next attack
            weight: 35,
          },
        ],
      },
    ],
  },

  // --- Sanctum Warden (150 HP) - Reality Anchor/Summoner ---
  // The Last Warden's Shadow - a fragment of will given form
  // It doesn't want to fight you, but must be sure you're ready
  sanctum_warden: {
    id: 'sanctum_warden',
    name: 'Sanctum Warden',
    maxHp: 150,
    isElite: true,
    moves: [
      {
        id: 'judgment_strike',
        name: 'Judgment Strike',
        intent: IntentType.ATTACK,
        damage: 16,
        weight: 25,
      },
      {
        id: 'divine_barrier',
        name: 'Divine Barrier',
        intent: IntentType.DEFEND,
        block: 20,
        weight: 20,
      },
      {
        id: 'seal_of_binding',
        name: 'Seal of Binding',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.BOUND,
        debuffDuration: 2,
        weight: 20,
      },
      {
        id: 'time_fracture',
        name: 'Time Fracture',
        intent: IntentType.DEBUFF,
        // Special: Shuffle player's hand into deck, draw 3 new cards
        // Handled in CombatEngine
        weight: 15,
      },
      {
        id: 'wardens_duty',
        name: "Warden's Duty",
        intent: IntentType.HEAL,
        heal: 75, // Heals to 50% HP
        oncePerCombat: true,
        hpThreshold: 0.3, // Only when below 30% HP
        weight: 20,
      },
    ],
  },

  // --- Memory of Bonelord (40 HP) - Summoned by Sanctum Warden ---
  // Echo of Lord Vexal's pride
  memory_bonelord: {
    id: 'memory_bonelord',
    name: 'Memory of Bonelord',
    maxHp: 40,
    moves: [
      {
        id: 'bone_strike',
        name: 'Bone Strike',
        intent: IntentType.ATTACK,
        damage: 8,
        weight: 60,
      },
      {
        id: 'hollow_echo',
        name: 'Hollow Echo',
        intent: IntentType.DEFEND,
        block: 6,
        weight: 40,
      },
    ],
  },

  // --- Memory of Drowned King (40 HP) - Summoned by Sanctum Warden ---
  // Echo of King Aldric's love
  memory_drowned_king: {
    id: 'memory_drowned_king',
    name: 'Memory of Drowned King',
    maxHp: 40,
    moves: [
      {
        id: 'tidal_memory',
        name: 'Tidal Memory',
        intent: IntentType.ATTACK,
        damage: 7,
        // Note: Could apply Flood status in future
        weight: 60,
      },
      {
        id: 'fading_guard',
        name: 'Fading Guard',
        intent: IntentType.DEFEND,
        block: 8,
        weight: 40,
      },
    ],
  },
};

/**
 * Get an Act 3 elite enemy by ID
 */
export function getAct3EliteById(id: string): EnemyDefinition | undefined {
  return ACT3_ELITE_ENEMIES[id];
}

/**
 * Get all Act 3 elite enemy IDs (excludes memories which are spawns)
 */
export function getAct3EliteIds(): string[] {
  return Object.keys(ACT3_ELITE_ENEMIES).filter((id) => ACT3_ELITE_ENEMIES[id].isElite);
}

/**
 * Memory enemy IDs (for Sanctum Warden's Memory Projection)
 */
export const MEMORY_ENEMY_IDS = ['memory_bonelord', 'memory_drowned_king'];

/**
 * Get a random memory enemy for Memory Projection
 */
export function getRandomMemoryEnemy(): EnemyDefinition {
  const randomId = MEMORY_ENEMY_IDS[Math.floor(Math.random() * MEMORY_ENEMY_IDS.length)];
  return ACT3_ELITE_ENEMIES[randomId];
}
