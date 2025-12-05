import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 2 Elite Enemies - The Unforgotten
 *
 * Theme: Survivors who almost made it
 * These are named individuals with tragic histories -
 * warnings of what the player might become.
 */
export const ACT2_ELITE_ENEMIES: Record<string, EnemyDefinition> = {
  // --- Void Caller (85 HP) - Summoner/Caster ---
  // Magister Vorn - bargained with the Hollow God for forbidden knowledge
  void_caller: {
    id: 'void_caller',
    name: 'Void Caller',
    maxHp: 85,
    isElite: true,
    phaseThresholds: [0.5], // Phase 2 at 50% HP
    moves: [], // Not used when phases are defined
    phases: [
      {
        // Phase 1 (HP > 50%): Summoner - spawns and empowers tendrils
        moves: [
          {
            id: 'summon_tendril',
            name: 'Summon Void Tendril',
            intent: IntentType.SPAWN,
            spawnId: 'void_tendril',
            weight: 35,
          },
          {
            id: 'void_bolt',
            name: 'Void Bolt',
            intent: IntentType.ATTACK,
            damage: 10,
            weight: 35,
          },
          {
            id: 'empower_void',
            name: 'Empower Void',
            intent: IntentType.BUFF_ALLY,
            buffType: StatusType.MIGHT,
            buffAmount: 3,
            weight: 30,
          },
        ],
      },
      {
        // Phase 2 (HP <= 50%): Desperate - AoE attacks and self-healing
        moves: [
          {
            id: 'void_storm',
            name: 'Void Storm',
            intent: IntentType.ATTACK,
            damage: 6,
            // Note: This hits ALL - player AND enemies (friendly fire)
            // Combat engine will need to handle this special case
            weight: 40,
          },
          {
            id: 'consume_tendril',
            name: 'Consume Tendril',
            intent: IntentType.HEAL,
            heal: 15,
            // Destroys a void tendril to heal
            selfDamage: 0, // Marker for consume mechanic
            weight: 30,
          },
          {
            id: 'final_bargain',
            name: 'Final Bargain',
            intent: IntentType.ATTACK,
            damage: 15,
            // Adds a curse to player's deck
            debuffType: StatusType.CURSED,
            debuffDuration: 99, // Permanent curse
            weight: 30,
          },
        ],
      },
    ],
  },

  // --- Void Tendril (20 HP) - Summoned Minion ---
  // Fragment of Vorn's grief given form
  void_tendril: {
    id: 'void_tendril',
    name: 'Void Tendril',
    maxHp: 20,
    moves: [
      {
        id: 'lash',
        name: 'Lash',
        intent: IntentType.ATTACK,
        damage: 5,
        weight: 60,
      },
      {
        id: 'entangle',
        name: 'Entangle',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.BOUND,
        debuffDuration: 1, // Can't play Skills for 1 turn
        weight: 40,
      },
    ],
  },

  // --- Stone Sentinel (100 HP) - Tank/Punisher ---
  // Guardian Unit VII - created to protect the royal children
  stone_sentinel: {
    id: 'stone_sentinel',
    name: 'Stone Sentinel',
    maxHp: 100,
    isElite: true,
    phaseThresholds: [0.3], // Enrages at 30% HP
    moves: [], // Not used when phases are defined
    phases: [
      {
        // Normal Phase (HP > 30%): Defensive with regenerating armor
        moves: [
          {
            id: 'crushing_blow',
            name: 'Crushing Blow',
            intent: IntentType.ATTACK,
            damage: 12,
            weight: 30,
          },
          {
            id: 'stone_reformation',
            name: 'Stone Reformation',
            intent: IntentType.DEFEND,
            block: 15, // Special: This represents Stone Armor restoration
            weight: 25,
          },
          {
            id: 'tremor',
            name: 'Tremor',
            intent: IntentType.ATTACK,
            damage: 7,
            // Note: Hits ALL - friendly fire on other enemies
            weight: 25,
          },
          {
            id: 'petrifying_gaze',
            name: 'Petrifying Gaze',
            intent: IntentType.DEBUFF,
            debuffType: StatusType.BOUND,
            debuffDuration: 1, // Can't play Attacks for 1 turn
            weight: 20,
          },
        ],
      },
      {
        // Enraged Phase (HP <= 30%): All-out offense, +5 damage to all attacks
        moves: [
          {
            id: 'crushing_blow_enraged',
            name: 'Crushing Blow',
            intent: IntentType.ATTACK,
            damage: 17, // 12 + 5 enrage bonus
            weight: 40,
          },
          {
            id: 'tremor_enraged',
            name: 'Tremor',
            intent: IntentType.ATTACK,
            damage: 12, // 7 + 5 enrage bonus
            weight: 35,
          },
          {
            id: 'final_guard',
            name: 'Final Guard',
            intent: IntentType.ATTACK,
            damage: 10, // 5 + 5 enrage bonus, also blocks
            block: 8,
            weight: 25,
          },
        ],
      },
    ],
  },
};

// Minions that can be spawned by Act 2 elites
export const ACT2_ELITE_MINIONS: Record<string, EnemyDefinition> = {
  void_tendril: ACT2_ELITE_ENEMIES.void_tendril,
};

/**
 * Get an Act 2 elite enemy by ID
 */
export function getAct2EliteById(id: string): EnemyDefinition | undefined {
  return ACT2_ELITE_ENEMIES[id];
}

/**
 * Get all Act 2 elite enemy IDs (excludes void_tendril which is a spawn)
 */
export function getAct2EliteIds(): string[] {
  return Object.keys(ACT2_ELITE_ENEMIES).filter((id) => ACT2_ELITE_ENEMIES[id].isElite);
}
