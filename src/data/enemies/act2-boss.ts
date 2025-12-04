import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 2 Boss: The Drowned King (King Aldric of Thalassar)
 *
 * A tragic boss fight against a monarch who sacrificed everything.
 * His soul for the children of his kingdom - 3000 children lived.
 * 3 phases reflecting his descent from protector to lost soul.
 *
 * Theme: Was the sacrifice worth it? The children lived. The kingdom fell anyway.
 * Aldric forgot everything except the love. Is that enough?
 */
export const DROWNED_KING: EnemyDefinition = {
  id: 'drowned_king',
  name: 'The Drowned King',
  maxHp: 180,
  isBoss: true,
  isElite: false,
  phaseThresholds: [0.67, 0.33], // Phase 2 at 67% HP (~120), Phase 3 at 33% HP (~60)
  moves: [], // Not used for bosses with phases
  phases: [
    // Phase 1: The Protector (HP > 120)
    // "He still believes he's a king. He still believes there's a kingdom to protect."
    {
      moves: [
        {
          id: 'royal_guard',
          name: 'Royal Guard',
          intent: IntentType.DEFEND,
          block: 15,
          weight: 35,
        },
        {
          id: 'trident_thrust',
          name: 'Trident Thrust',
          intent: IntentType.ATTACK,
          damage: 10,
          weight: 30,
        },
        {
          id: 'call_depths',
          name: 'Call the Depths',
          intent: IntentType.BUFF,
          // Note: In full implementation, this increases Flood level by 2
          // For now, gain 5 block as placeholder
          block: 5,
          buffType: StatusType.RESILIENCE,
          buffAmount: 1,
          weight: 35,
        },
      ],
    },
    // Phase 2: The Bargainer (HP 60-120)
    // "I gave EVERYTHING! My crown! My kingdom! My wife's face!"
    {
      moves: [
        {
          id: 'crushing_pressure',
          name: 'Crushing Pressure',
          intent: IntentType.ATTACK,
          damage: 8,
          debuffType: StatusType.SUNDERED,
          debuffAmount: 2,
          debuffDuration: 2,
          weight: 30,
        },
        {
          id: 'desperate_plea',
          name: 'Desperate Plea',
          intent: IntentType.HEAL,
          heal: 15,
          weight: 25,
        },
        {
          id: 'drown',
          name: 'Drown',
          intent: IntentType.ATTACK,
          damage: 12,
          debuffType: StatusType.BOUND,
          debuffDuration: 1, // Can't play Skills for 1 turn
          weight: 25,
        },
        {
          id: 'raise_tide',
          name: 'Raise Tide',
          intent: IntentType.BUFF,
          // Note: In full implementation, this increases Flood level by 3
          // For now, gain block and might
          block: 8,
          buffType: StatusType.MIGHT,
          buffAmount: 2,
          weight: 20,
        },
      ],
    },
    // Phase 3: The Lost (HP < 60)
    // "I can't... remember their faces anymore."
    {
      moves: [
        {
          id: 'tidal_wave',
          name: 'Tidal Wave',
          intent: IntentType.ATTACK,
          damage: 20,
          weight: 30,
        },
        {
          id: 'memory_kingdom',
          name: 'Memory of the Kingdom',
          intent: IntentType.SUMMON,
          summons: ['drowned_soldier', 'drowned_soldier'],
          weight: 25,
        },
        {
          id: 'final_sacrifice',
          name: 'Final Sacrifice',
          intent: IntentType.ATTACK,
          damage: 25,
          selfDamage: 20, // Hurts himself to deal massive damage
          weight: 25,
        },
        {
          id: 'forgotten_purpose',
          name: 'Forgotten Purpose',
          intent: IntentType.HEAL,
          heal: 10,
          // Note: In full implementation, this skips action and reduces Flood
          // For now, heal only
          weight: 20,
        },
      ],
    },
  ],
};

/**
 * Drowned Soldier - Memories of his royal guard given form
 *
 * These aren't real ghosts - they're Aldric's memories.
 * They flicker in and out. They wear the livery of Thalassar,
 * but the crest keeps changing - he can't remember it exactly.
 *
 * Death Quote: "My king... we are proud... to have served..."
 */
export const DROWNED_SOLDIER: EnemyDefinition = {
  id: 'drowned_soldier',
  name: 'Drowned Soldier',
  maxHp: 25,
  moves: [
    {
      id: 'corroded_blade',
      name: 'Corroded Blade',
      intent: IntentType.ATTACK,
      damage: 6,
      weight: 60,
    },
    {
      id: 'shield_wall',
      name: 'Shield Wall',
      intent: IntentType.BUFF_ALLY,
      block: 5, // All enemies gain 5 block
      weight: 40,
    },
  ],
};

// Boss lookup by ID
export const ACT2_BOSSES: Record<string, EnemyDefinition> = {
  drowned_king: DROWNED_KING,
};

// Minion lookup by ID (for summoning)
export const ACT2_BOSS_MINIONS: Record<string, EnemyDefinition> = {
  drowned_soldier: DROWNED_SOLDIER,
};

// All Act 2 boss-related enemies
export const ALL_ACT2_BOSS_ENEMIES: Record<string, EnemyDefinition> = {
  ...ACT2_BOSSES,
  ...ACT2_BOSS_MINIONS,
};

/**
 * Get an Act 2 boss by ID
 */
export function getAct2BossById(id: string): EnemyDefinition | undefined {
  return ACT2_BOSSES[id];
}

/**
 * Get an Act 2 boss minion by ID
 */
export function getAct2BossMinionById(id: string): EnemyDefinition | undefined {
  return ACT2_BOSS_MINIONS[id];
}
