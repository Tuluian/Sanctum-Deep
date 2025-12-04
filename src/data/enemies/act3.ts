import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 3 Common Enemies - The Sanctum Core
 *
 * Theme: Purpose Perverted
 * These beings aren't tragic like Act 1 or corrupted like Act 2.
 * They've been here so long the Hollow God has reshaped them into
 * something deliberate. They have twisted purpose.
 *
 * The horror here isn't "what they lost." It's "what they became."
 */
export const ACT3_ENEMIES: Record<string, EnemyDefinition> = {
  // --- Imp (30 HP) - Swarm/Pack ---
  // Small gleeful demons with too-wide smiles
  // They giggle as they claw, laugh as they die
  imp: {
    id: 'imp',
    name: 'Imp',
    maxHp: 30,
    moves: [
      { id: 'claw', name: 'Claw', intent: IntentType.ATTACK, damage: 5, weight: 35 },
      {
        id: 'infernal_dash',
        name: 'Infernal Dash',
        intent: IntentType.ATTACK,
        damage: 7,
        debuffType: StatusType.BLEEDING,
        debuffAmount: 2,
        debuffDuration: 2,
        weight: 30,
      },
      {
        id: 'giggle',
        name: 'Giggle',
        intent: IntentType.BUFF_ALLY,
        buffType: StatusType.MIGHT,
        buffAmount: 3, // All Imps gain +3 damage permanently
        weight: 35,
      },
    ],
  },

  // --- Corrupted Angel (60 HP) - Corruption Applier ---
  // Angels who understood the void and can no longer serve the light
  // Their light became dark, their purpose inverted
  corrupted_angel: {
    id: 'corrupted_angel',
    name: 'Corrupted Angel',
    maxHp: 60,
    moves: [
      { id: 'fallen_blade', name: 'Fallen Blade', intent: IntentType.ATTACK, damage: 14, weight: 35 },
      { id: 'tarnished_wings', name: 'Tarnished Wings', intent: IntentType.DEFEND, block: 12, weight: 30 },
      {
        id: 'corruption_spread',
        name: 'Corruption Spread',
        intent: IntentType.DEBUFF,
        debuffType: StatusType.CORRUPT,
        debuffAmount: 3, // Apply 3 Corruption stacks
        debuffDuration: 3,
        weight: 35,
      },
    ],
  },

  // --- Void Spawn (45 HP) - Card Disruptor ---
  // Pure fragments of the Hollow God itself
  // They exist to consume moments, memories, cards
  void_spawn: {
    id: 'void_spawn',
    name: 'Void Spawn',
    maxHp: 45,
    moves: [
      { id: 'void_touch', name: 'Void Touch', intent: IntentType.ATTACK, damage: 10, weight: 40 },
      {
        id: 'consume_light',
        name: 'Consume Light',
        intent: IntentType.DEBUFF,
        // Special: Player loses 1 card from hand randomly
        // Handled in CombatEngine as special move
        weight: 30,
      },
      {
        id: 'phase_shift',
        name: 'Phase Shift',
        intent: IntentType.BUFF,
        // Special: Become Intangible for 1 turn (50% damage reduction)
        // Handled in CombatEngine as special move
        weight: 30,
      },
    ],
  },

  // --- Sanctum Guardian (70 HP) - Anti-Player Punisher ---
  // Ancient protectors with inverted purpose
  // They still think they're helping
  sanctum_guardian: {
    id: 'sanctum_guardian',
    name: 'Sanctum Guardian',
    maxHp: 70,
    moves: [
      { id: 'holy_smite', name: 'Holy Smite', intent: IntentType.ATTACK, damage: 12, weight: 30 },
      {
        id: 'divine_shield',
        name: 'Divine Shield',
        intent: IntentType.DEFEND,
        block: 15,
        heal: 5,
        weight: 30,
      },
      {
        id: 'judgment',
        name: 'Judgment',
        intent: IntentType.ATTACK,
        // Special: Damage = player's current HP / 5
        // Base damage used as fallback, actual calculated in CombatEngine
        damage: 10,
        weight: 25,
      },
      {
        id: 'purge',
        name: 'Purge',
        intent: IntentType.DEBUFF,
        // Special: Remove all player buffs
        // Handled in CombatEngine as special move
        weight: 15,
      },
    ],
  },

  // --- Soul Fragment (35 HP) - Identity Thief ---
  // Pieces of consumed delvers, almost people
  // They cling to existence by stealing powers
  soul_fragment: {
    id: 'soul_fragment',
    name: 'Soul Fragment',
    maxHp: 35,
    moves: [
      { id: 'memory_slash', name: 'Memory Slash', intent: IntentType.ATTACK, damage: 8, weight: 40 },
      {
        id: 'identity_crisis',
        name: 'Identity Crisis',
        intent: IntentType.UNKNOWN,
        // Special: Copy a random card from player's discard, play it against them
        // Handled in CombatEngine as special move
        weight: 30,
      },
      {
        id: 'fade',
        name: 'Fade',
        intent: IntentType.HEAL,
        heal: 35, // Heal to full
        // Special: Only triggers if HP < 15 and only once per combat
        // Tracked via usedAbilities in Enemy state
        oncePerCombat: true,
        hpThreshold: 0.43, // ~15/35 HP
        weight: 30,
      },
    ],
  },

  // --- Infernal Hound (50 HP) - Pack Buffer ---
  // Hunting dogs transformed, still loyal but to the hunt itself
  // They're still loyal, just don't remember to whom
  infernal_hound: {
    id: 'infernal_hound',
    name: 'Infernal Hound',
    maxHp: 50,
    moves: [
      { id: 'bite', name: 'Bite', intent: IntentType.ATTACK, damage: 11, weight: 45 },
      {
        id: 'pounce',
        name: 'Pounce',
        intent: IntentType.ATTACK,
        damage: 8,
        debuffType: StatusType.SUNDERED,
        debuffAmount: 2,
        debuffDuration: 2,
        weight: 30,
      },
      {
        id: 'howl',
        name: 'Howl',
        intent: IntentType.BUFF_ALLY,
        buffType: StatusType.MIGHT,
        buffAmount: 2, // All demons gain 2 Might
        weight: 25,
      },
    ],
  },
};

/**
 * Get an Act 3 enemy by ID
 */
export function getAct3EnemyById(id: string): EnemyDefinition | undefined {
  return ACT3_ENEMIES[id];
}

/**
 * Get all Act 3 common enemy IDs
 */
export function getAct3CommonEnemyIds(): string[] {
  return Object.keys(ACT3_ENEMIES);
}

/**
 * Get a random Act 3 enemy for encounters
 */
export function getRandomAct3Enemy(): EnemyDefinition {
  const ids = getAct3CommonEnemyIds();
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return ACT3_ENEMIES[randomId];
}

/**
 * Demon enemy IDs (for Howl buff targeting)
 */
export const DEMON_ENEMY_IDS = ['imp', 'infernal_hound'];

/**
 * Check if an enemy is a demon (for pack synergies)
 */
export function isDemonEnemy(enemyId: string): boolean {
  return DEMON_ENEMY_IDS.includes(enemyId);
}
