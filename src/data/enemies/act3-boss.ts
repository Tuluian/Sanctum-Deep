import { EnemyDefinition, IntentType, StatusType } from '@/types';

/**
 * Act 3 Final Boss - The Hollow God
 *
 * Theme: An absence that hungers for identity
 * The Hollow God is not a creature - it's a void in the shape of consciousness.
 * It consumes identity, memory, and purpose. Fighting it means pieces of yourself
 * are stripped away. Victory isn't about killing it - it's about refusing to be consumed.
 *
 * Unique Mechanics:
 * - Chomp Timer: Every 3 seconds during player turn, discards a random card
 * - Card Corruption: Cards become corrupted and add Corruption Stacks when played
 * - Hollow Echo: Copies player's last played card against them
 * - Forget: Permanently fractures cards from player's deck
 * - Shadow Self: Summons a dark reflection that mirrors player actions
 */

export const HOLLOW_GOD: EnemyDefinition = {
  id: 'hollow_god',
  name: 'The Hollow God',
  maxHp: 250,
  isBoss: true,
  phaseThresholds: [0.7, 0.32], // Phase 2 at 70% (175 HP), Phase 3 at 32% (80 HP)
  moves: [], // Not used when phases are defined
  phases: [
    // Phase 1: Whispers (HP > 175) - Psychological warfare
    {
      moves: [
        {
          id: 'doubt',
          name: 'Doubt',
          intent: IntentType.ATTACK,
          damage: 8,
          // Special: Apply 3 Corruption Stacks
          debuffType: StatusType.CORRUPT,
          debuffAmount: 3,
          weight: 30,
        },
        {
          id: 'hollow_echo',
          name: 'Hollow Echo',
          intent: IntentType.UNKNOWN, // Special - copies last player card
          // Handled specially in CombatEngine
          weight: 25,
        },
        {
          id: 'glimpse_oblivion',
          name: 'Glimpse of Oblivion',
          intent: IntentType.DEBUFF,
          // Special: Player discards 2 random cards
          weight: 25,
        },
        {
          id: 'void_watches',
          name: 'The Void Watches',
          intent: IntentType.DEFEND,
          damage: 10,
          block: 15,
          // Special: Gain Intangible for 1 turn
          weight: 20,
        },
      ],
    },
    // Phase 2: Consumption (HP 80-175) - Active assault
    {
      moves: [
        {
          id: 'identity_fracture',
          name: 'Identity Fracture',
          intent: IntentType.ATTACK,
          damage: 14,
          // Special: Corrupt 2 cards in hand
          weight: 30,
        },
        {
          id: 'absorb',
          name: 'Absorb',
          intent: IntentType.ATTACK,
          damage: 10,
          heal: 10, // Lifesteal
          weight: 25,
        },
        {
          id: 'manifest_fear',
          name: 'Manifest Fear',
          intent: IntentType.SUMMON,
          // Special: Summon Shadow Self
          summons: ['shadow_self'],
          weight: 20,
        },
        {
          id: 'crushing_emptiness',
          name: 'Crushing Emptiness',
          intent: IntentType.ATTACK,
          damage: 18,
          weight: 25,
        },
      ],
    },
    // Phase 3: Annihilation (HP < 80) - Desperate final assault
    {
      moves: [
        {
          id: 'forget',
          name: 'Forget',
          intent: IntentType.ATTACK,
          damage: 15,
          block: 15, // Self-block
          // Special: Permanently fracture 1 random card from player's deck
          weight: 30,
        },
        {
          id: 'total_void',
          name: 'Total Void',
          intent: IntentType.ATTACK,
          damage: 10,
          // Special: Corrupt ALL cards in hand
          weight: 25,
        },
        {
          id: 'final_consumption',
          name: 'Final Consumption',
          intent: IntentType.ATTACK,
          damage: 30,
          // Special: If this kills, special death sequence
          weight: 25,
        },
        {
          id: 'desperate_grasp',
          name: 'Desperate Grasp',
          intent: IntentType.MULTI_ATTACK,
          damage: 12,
          times: 3,
          weight: 20,
        },
      ],
    },
  ],
};

/**
 * Shadow Self - Dark reflection of the player
 * Summoned by the Hollow God during Phase 2
 * Mirrors player's last action (attack/block)
 * On death, player heals 10 HP (reclaiming a piece of themselves)
 */
export const SHADOW_SELF: EnemyDefinition = {
  id: 'shadow_self',
  name: 'Shadow Self',
  maxHp: 50,
  moves: [
    {
      id: 'mirror_strike',
      name: 'Mirror Strike',
      intent: IntentType.ATTACK,
      damage: 8,
      weight: 50,
    },
    {
      id: 'mirror_guard',
      name: 'Mirror Guard',
      intent: IntentType.DEFEND,
      block: 12,
      weight: 50,
    },
  ],
};

/**
 * Get the Hollow God boss definition
 */
export function getHollowGod(): EnemyDefinition {
  return HOLLOW_GOD;
}

/**
 * Get the Shadow Self minion definition
 */
export function getShadowSelf(): EnemyDefinition {
  return SHADOW_SELF;
}

/**
 * Boss phase dialogue - displayed during phase transitions
 */
export const HOLLOW_GOD_DIALOGUE = {
  phase1Entry: 'You carry such... weight. Let me lighten it.',
  phase2Entry: "Your name... I'm forgetting it already. So will you.",
  phase3Entry: 'BECOME. NOTHING. BECOME. ME.',
  playerLowHp: "You're so close to peace. Just... let go.",
  onDamage: [
    "You're hurting yourself. I'm just... here.",
    "Interesting. You still believe you can win. That's cute.",
    'Pain. You cling to it. To anything that makes you feel real.',
    "Impressive. Most fade by now.",
    "You're still holding on. To what? A name you'll forget?",
    'IMPOSSIBLE! I am NOTHING! You can\'t hurt NOTHING!',
    'STOP! STOP REMEMBERING! STOP BEING!',
  ],
  onVictory: 'No... not... another... Warden...',
  onShadowSelfSummoned: "Look. It's you. The you that gave up. The you that stopped fighting.",
  onShadowSelfDeath: 'You reclaimed a piece. How noble. How futile.',
  chompTaunt: [
    'So slow...',
    'Time slips away...',
    'Forget...',
    'Let go...',
    'You\'re fading...',
  ],
  forgetTaunt: [
    'You forget how to fight...',
    'What was that skill called?',
    'Memory fading...',
    'Who taught you that?',
  ],
};

/**
 * Chomp Timer configuration
 */
export const CHOMP_TIMER_CONFIG = {
  intervalMs: 10000, // 10 seconds between chomps
  enabled: true,
};
