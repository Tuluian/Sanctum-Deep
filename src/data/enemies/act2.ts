import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 2 Common Enemies - The Sunken Crypts
 *
 * Theme: Corruption and Bargains
 * These enemies are souls who lasted longer, made compromises,
 * bargained with the Hollow God, and lost themselves slowly.
 */
export const ACT2_ENEMIES: Record<string, EnemyDefinition> = {
  // --- Slime (45 HP) - Spawner ---
  // Multiple souls merged into one mass
  slime: {
    id: 'slime',
    name: 'Slime',
    maxHp: 45,
    moves: [
      { id: 'engulf', name: 'Engulf', intent: IntentType.ATTACK, damage: 6, weight: 50 },
      {
        id: 'acidic_touch',
        name: 'Acidic Touch',
        intent: IntentType.ATTACK,
        damage: 4,
        debuffType: StatusType.SUNDERED,
        debuffAmount: 2,
        debuffDuration: 2,
        weight: 30,
      },
      {
        id: 'split',
        name: 'Split',
        intent: IntentType.SPAWN,
        spawnId: 'slimeling',
        hpThreshold: 0.5, // Only when below 50% HP
        weight: 20,
      },
    ],
  },

  // --- Slimeling (15 HP) - Spawned minion ---
  // A single soul fragment, separated from the collective
  slimeling: {
    id: 'slimeling',
    name: 'Slimeling',
    maxHp: 15,
    moves: [
      { id: 'splash', name: 'Splash', intent: IntentType.ATTACK, damage: 3, weight: 70 },
      {
        id: 'merge',
        name: 'Merge',
        intent: IntentType.HEAL,
        heal: 10,
        selfDamage: 15, // Kills itself to heal parent
        weight: 30,
      },
    ],
  },

  // --- Dark Mage (35 HP) - Caster ---
  // Wizards who entered seeking knowledge of the void
  dark_mage: {
    id: 'dark_mage',
    name: 'Dark Mage',
    maxHp: 35,
    moves: [
      { id: 'shadow_bolt', name: 'Shadow Bolt', intent: IntentType.ATTACK, damage: 8, weight: 40 },
      { id: 'dark_shield', name: 'Dark Shield', intent: IntentType.DEFEND, block: 12, weight: 30 },
      {
        id: 'curse_weakness',
        name: 'Curse of Weakness',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.IMPAIRED,
        debuffDuration: 2,
        weight: 30,
      },
    ],
  },

  // --- Gargoyle (55 HP) - Tank ---
  // Constructs created by the Drowned King, now purposeless
  gargoyle: {
    id: 'gargoyle',
    name: 'Gargoyle',
    maxHp: 55,
    moves: [
      { id: 'stone_fist', name: 'Stone Fist', intent: IntentType.ATTACK, damage: 7, weight: 35 },
      { id: 'petrify', name: 'Petrify', intent: IntentType.DEFEND, block: 15, weight: 35 },
      { id: 'awakening', name: 'Awakening', intent: IntentType.ATTACK, damage: 10, weight: 30 },
    ],
  },

  // --- Corrupted Spirit (30 HP) - Debuffer ---
  // A soul that stayed for revenge but forgot why
  corrupted_spirit: {
    id: 'corrupted_spirit',
    name: 'Corrupted Spirit',
    maxHp: 30,
    moves: [
      { id: 'soul_rend', name: 'Soul Rend', intent: IntentType.ATTACK, damage: 5, weight: 35 },
      {
        id: 'corrupt',
        name: 'Corrupt',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.CORRUPT,
        debuffAmount: 2, // 2 damage per card played
        debuffDuration: 2,
        weight: 35,
      },
      {
        id: 'wail',
        name: 'Wail',
        intent: IntentType.BUFF_ALLY,
        block: 5, // All enemies gain 5 block
        weight: 30,
      },
    ],
  },

  // --- Aberration (50 HP) - Bruiser ---
  // Two souls, merged wrong - lovers, siblings, or friends fused together
  aberration: {
    id: 'aberration',
    name: 'Aberration',
    maxHp: 50,
    moves: [
      {
        id: 'flailing_strike',
        name: 'Flailing Strike',
        intent: IntentType.MULTI_ATTACK,
        damage: 4,
        times: 2,
        weight: 40,
      },
      {
        id: 'absorb',
        name: 'Absorb',
        intent: IntentType.ATTACK,
        damage: 6,
        heal: 6,
        weight: 30,
      },
      {
        id: 'tormented_cry',
        name: 'Tormented Cry',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.IMPAIRED,
        debuffDuration: 1,
        selfDamage: 5, // Hurts itself too (Sundered equivalent)
        weight: 30,
      },
    ],
  },

  // --- Drowned Cultist (38 HP) - Support ---
  // True believers who came to serve the Drowned King
  drowned_cultist: {
    id: 'drowned_cultist',
    name: 'Drowned Cultist',
    maxHp: 38,
    moves: [
      { id: 'water_bolt', name: 'Water Bolt', intent: IntentType.ATTACK, damage: 7, weight: 40 },
      {
        id: 'ritual_chant',
        name: 'Ritual Chant',
        intent: IntentType.BUFF,
        buffType: StatusType.MIGHT,
        buffAmount: 2,
        weight: 35,
      },
      {
        id: 'sacrifice',
        name: 'Sacrifice',
        intent: IntentType.BUFF_ALLY,
        block: 8, // All allies gain 8 block
        selfDamage: 10,
        weight: 25,
      },
    ],
  },

  // --- Deep One (48 HP) - Elite-lite ---
  // A fisher transformed by the deep waters
  deep_one: {
    id: 'deep_one',
    name: 'Deep One',
    maxHp: 48,
    moves: [
      { id: 'claw_swipe', name: 'Claw Swipe', intent: IntentType.ATTACK, damage: 9, weight: 45 },
      { id: 'regenerate', name: 'Regenerate', intent: IntentType.HEAL, heal: 8, weight: 30 },
      {
        id: 'drown',
        name: 'Drown',
        intent: IntentType.ATTACK,
        damage: 5,
        debuffType: StatusType.BOUND,
        debuffDuration: 1, // Can't play Skills for 1 turn
        weight: 25,
      },
    ],
  },
};

/**
 * Get an Act 2 enemy by ID
 */
export function getAct2EnemyById(id: string): EnemyDefinition | undefined {
  return ACT2_ENEMIES[id];
}

/**
 * Get all Act 2 common enemy IDs (excludes slimeling which is a spawn)
 */
export function getAct2CommonEnemyIds(): string[] {
  return Object.keys(ACT2_ENEMIES).filter((id) => id !== 'slimeling');
}

/**
 * Get a random Act 2 enemy for encounters
 */
export function getRandomAct2Enemy(): EnemyDefinition {
  const ids = getAct2CommonEnemyIds();
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return ACT2_ENEMIES[randomId];
}
