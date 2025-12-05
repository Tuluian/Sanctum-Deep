import { EnemyDefinition, IntentType, StatusType } from '@/types';

export const ELITE_ENEMIES: Record<string, EnemyDefinition> = {
  // Tomb Guardian - Phase-based elite
  tomb_guardian: {
    id: 'tomb_guardian',
    name: 'Tomb Guardian',
    maxHp: 90,
    isElite: true,
    phaseThresholds: [0.5], // Phase 2 at 50% HP
    moves: [], // Not used when phases are defined
    phases: [
      {
        // Phase 1 (HP > 50%): Defensive patterns
        moves: [
          { id: 'stone_gaze', name: 'Stone Gaze', intent: IntentType.DEBUFF, debuffType: StatusType.IMPAIRED, debuffDuration: 2, weight: 30 },
          { id: 'shield_wall', name: 'Shield Wall', intent: IntentType.DEFEND, block: 15, weight: 40 },
          { id: 'crushing_blow', name: 'Crushing Blow', intent: IntentType.ATTACK, damage: 12, weight: 30 },
        ],
      },
      {
        // Phase 2 (HP <= 50%): Aggressive patterns
        moves: [
          { id: 'enraged_strike', name: 'Enraged Strike', intent: IntentType.ATTACK, damage: 18, weight: 50 },
          { id: 'ground_slam', name: 'Ground Slam', intent: IntentType.ATTACK, damage: 10, weight: 30 },
          { id: 'desperate_guard', name: 'Desperate Guard', intent: IntentType.ATTACK, damage: 8, block: 8, weight: 20 },
        ],
      },
    ],
  },

  // High Cultist - Summoner elite
  high_cultist: {
    id: 'high_cultist',
    name: 'High Cultist',
    maxHp: 80,
    isElite: true,
    moves: [
      { id: 'dark_ritual', name: 'Dark Ritual', intent: IntentType.SUMMON, summons: ['summoned_acolyte', 'summoned_acolyte'], oncePerCombat: true, weight: 25 },
      { id: 'void_bolt', name: 'Void Bolt', intent: IntentType.ATTACK, damage: 14, weight: 35 },
      { id: 'mass_hex', name: 'Mass Hex', intent: IntentType.DEBUFF, debuffType: StatusType.SUNDERED, debuffDuration: 2, weight: 20 },
      { id: 'blood_shield', name: 'Blood Shield', intent: IntentType.DEFEND, block: 10, heal: 5, weight: 20 },
    ],
  },

  // Summoned Acolyte - weaker version spawned by High Cultist
  summoned_acolyte: {
    id: 'summoned_acolyte',
    name: 'Summoned Acolyte',
    maxHp: 15,
    moves: [
      { id: 'shadow_bolt', name: 'Shadow Bolt', intent: IntentType.ATTACK, damage: 5, weight: 60 },
      { id: 'dark_prayer', name: 'Dark Prayer', intent: IntentType.BUFF_ALLY, buffAmount: 2, weight: 40 },
    ],
  },
};

// Minions that can be summoned by elites
export const ELITE_MINIONS: Record<string, EnemyDefinition> = {
  summoned_acolyte: ELITE_ENEMIES.summoned_acolyte,
};

export function getEliteById(id: string): EnemyDefinition | undefined {
  return ELITE_ENEMIES[id];
}
