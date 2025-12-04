// Card Types
export enum CardType {
  ATTACK = 'ATTACK',
  SKILL = 'SKILL',
  POWER = 'POWER',
  CURSE = 'CURSE',
}

export enum EffectType {
  DAMAGE = 'DAMAGE',
  DAMAGE_ALL = 'DAMAGE_ALL',
  BLOCK = 'BLOCK',
  HEAL = 'HEAL',
  APPLY_STATUS = 'APPLY_STATUS',
  GAIN_DEVOTION = 'GAIN_DEVOTION',
  GAIN_FORTIFY = 'GAIN_FORTIFY',
  DRAW_CARDS = 'DRAW_CARDS',
  // Conditional effects
  HEAL_OR_BLOCK = 'HEAL_OR_BLOCK', // Heal X, if full HP gain X block instead
  // Devotion spending
  SPEND_DEVOTION_DAMAGE = 'SPEND_DEVOTION_DAMAGE', // Spend X devotion for bonus damage
  // Knight effects
  DAMAGE_EQUAL_BLOCK = 'DAMAGE_EQUAL_BLOCK',
  DAMAGE_EQUAL_FORTIFY = 'DAMAGE_EQUAL_FORTIFY',
  BLOCK_EQUAL_FORTIFY = 'BLOCK_EQUAL_FORTIFY',
  DOUBLE_FORTIFY = 'DOUBLE_FORTIFY',
  // Diabolist effects
  LOSE_HP = 'LOSE_HP', // Self-damage (costs HP)
  ADD_CARD_TO_DECK = 'ADD_CARD_TO_DECK', // Add card to draw pile (shuffled)
  ADD_CARD_TO_DISCARD = 'ADD_CARD_TO_DISCARD', // Add card to discard pile
  ADD_CARD_TO_HAND = 'ADD_CARD_TO_HAND', // Add card directly to hand
  // Fey-Touched effects
  GAIN_LUCK = 'GAIN_LUCK', // Gain Luck resource
  // Extended Diabolist effects (Card Pool)
  GAIN_RESOLVE = 'GAIN_RESOLVE', // Gain Resolve this turn
  DAMAGE_PER_CURSE = 'DAMAGE_PER_CURSE', // Deal damage equal to curses in deck × amount
  BLOCK_PER_CURSE = 'BLOCK_PER_CURSE', // Gain block per curse in deck
  EXHAUST_CURSE_FROM_HAND = 'EXHAUST_CURSE_FROM_HAND', // Exhaust a curse from hand for bonus
  DAMAGE_IF_LOW_HP = 'DAMAGE_IF_LOW_HP', // Deal bonus damage if HP below threshold
  LOSE_MAX_HP = 'LOSE_MAX_HP', // Permanently reduce max HP
  HEAL_EQUAL_DAMAGE = 'HEAL_EQUAL_DAMAGE', // Heal for damage dealt (requires tracking)
  CONDITIONAL_HEAL = 'CONDITIONAL_HEAL', // Heal if enemy dies this turn
  // Oathsworn Card Pool effects
  DAMAGE_IF_VOW = 'DAMAGE_IF_VOW', // Bonus damage if Vow active
  BLOCK_PER_VOW_TURN = 'BLOCK_PER_VOW_TURN', // Block based on Vow duration
  EXTEND_VOW = 'EXTEND_VOW', // Add charges to active Vow
  END_VOW_SAFE = 'END_VOW_SAFE', // End Vow without penalty
  CONSUME_VOW_CHARGE = 'CONSUME_VOW_CHARGE', // Use a Vow charge for effect
  DAMAGE_PER_VOW_ACTIVATED = 'DAMAGE_PER_VOW_ACTIVATED', // Damage × vows activated this combat
  HEAL_PER_VOW_CHARGE = 'HEAL_PER_VOW_CHARGE', // Heal for remaining Vow charges
  BLOCK_IF_NO_VOW = 'BLOCK_IF_NO_VOW', // Bonus block if no Vow active
  APPLY_BOUND = 'APPLY_BOUND', // Apply Bound status to enemy
  RESET_VOW_CHARGES = 'RESET_VOW_CHARGES', // If kills, reset Vow charges
  // Fey-Touched Card Pool effects
  DAMAGE_RANDOM_ENEMY = 'DAMAGE_RANDOM_ENEMY', // Deal damage to a random enemy
  DAMAGE_RANDOM_TIMES = 'DAMAGE_RANDOM_TIMES', // Deal damage X times randomly (3-5)
  HEAL_RANGE = 'HEAL_RANGE', // Heal a random amount in range
  BLOCK_IF_LUCK = 'BLOCK_IF_LUCK', // Bonus block if Luck > threshold
  SPEND_ALL_LUCK = 'SPEND_ALL_LUCK', // Spend all Luck for effect per Luck spent
  SET_GUARANTEED_BEST = 'SET_GUARANTEED_BEST', // Next Whimsy is guaranteed best outcome
  // Celestial effects
  GAIN_RADIANCE = 'GAIN_RADIANCE', // Gain Radiance resource
  CONSUME_RADIANCE_DAMAGE = 'CONSUME_RADIANCE_DAMAGE', // Consume all Radiance for bonus damage
  // Summoner effects
  SUMMON_MINION = 'SUMMON_MINION', // Summon a minion by ID
  BLOCK_ALL_MINIONS = 'BLOCK_ALL_MINIONS', // Give all minions block
  MINIONS_ATTACK = 'MINIONS_ATTACK', // All minions attack immediately
  GAIN_BLOCK_FROM_MINION_HP = 'GAIN_BLOCK_FROM_MINION_HP', // Gain block equal to total minion HP
  // Bargainer effects
  GAIN_FAVOR = 'GAIN_FAVOR', // Gain Favor resource
  DAMAGE_PER_PRICE = 'DAMAGE_PER_PRICE', // Deal damage per active Price × multiplier
  REMOVE_ALL_PRICES = 'REMOVE_ALL_PRICES', // Remove all active Prices
  // Permanent upgrade effects
  PERMANENT_BLOCK_BONUS = 'PERMANENT_BLOCK_BONUS', // Permanently increase all block from cards by X
}

export enum CardRarity {
  STARTER = 'starter',
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
}

export interface CardEffect {
  type: EffectType;
  amount: number;
  target?: 'self' | 'enemy' | 'all_enemies';
  cardId?: string; // For ADD_CARD effects - which card to add
  perStack?: number; // For consume effects - damage per stack consumed (Celestial)
  minionId?: string; // For SUMMON_MINION effects - which minion to summon
  multiplier?: number; // For DAMAGE_PER_PRICE - damage per price × multiplier
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  description: string;
  effects: CardEffect[];
  rarity?: CardRarity;
  classId?: CharacterClassId;
  exhaust?: boolean;
  // For spend devotion effects
  devotionCost?: number;
  devotionBonus?: CardEffect[];
  // Diabolist properties
  unplayable?: boolean; // Cannot be played (Curses)
  exhaustOnDiscard?: boolean; // Card is exhausted when discarded (Curses)
  onDraw?: CardEffect[]; // Effects triggered when card is drawn
  onTurnEnd?: CardEffect[]; // Effects triggered at end of turn (while in deck)
  onCombatEnd?: CardEffect[]; // Effects triggered at end of combat (while in deck)
  hpCost?: number; // HP paid to play (in addition to Resolve)
  // Oathsworn properties
  requiresVow?: boolean; // Can only play with active Vow
  activatesVow?: string; // Vow ID to activate when played
  // Fey-Touched properties
  whimsy?: WhimsyEffect[]; // Random outcomes
  // Bargainer properties
  price?: PriceDefinition; // Price paid when card is played
}

// Fey-Touched Whimsy Types
export interface WhimsyEffect {
  weight: number; // Selection probability weight
  effects: CardEffect[]; // Effects if chosen
  description: string; // Display text
}

export interface Card extends CardDefinition {
  instanceId: string;
}

// Status Effects
export enum StatusType {
  // Debuffs
  SUNDERED = 'SUNDERED',
  IMPAIRED = 'IMPAIRED',
  BLEEDING = 'BLEEDING',
  CURSED = 'CURSED',
  BOUND = 'BOUND',
  CORRUPT = 'CORRUPT', // Take X damage when playing a card
  // Buffs
  BLESSED = 'BLESSED',
  EMPOWERED = 'EMPOWERED',
  WARDED = 'WARDED',
  MIGHT = 'MIGHT',
  RESILIENCE = 'RESILIENCE',
  REGENERATION = 'REGENERATION', // Heal X at start of turn
  // Celestial buffs
  DIVINE_FORM = 'DIVINE_FORM', // +1 damage to all attacks while at max Radiance
  // Act 3 enemy buffs
  INTANGIBLE = 'INTANGIBLE', // All incoming damage reduced by 50%
}

export interface StatusEffect {
  type: StatusType;
  amount: number;
  duration?: number;
}

// Enemy Types
export enum IntentType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  BUFF = 'buff',
  BUFF_ALLY = 'buff_ally',
  DEBUFF = 'debuff',
  HEAL = 'heal',
  MULTI_ATTACK = 'multi_attack',
  SUMMON = 'summon',
  SPAWN = 'spawn', // Create a new enemy (e.g., Slime splitting)
  CHARGING = 'charging',
  COMMAND = 'command',
  UNKNOWN = 'unknown',
}

export interface EnemyMove {
  id: string;
  name: string;
  intent: IntentType;
  damage?: number;
  block?: number;
  weight: number;
  // New properties for advanced moves
  times?: number; // For multi-attack
  heal?: number; // For heal/lifesteal
  selfDamage?: number; // For sacrifice abilities
  buffType?: StatusType; // For buff moves
  buffAmount?: number;
  debuffType?: StatusType; // For debuff moves
  debuffDuration?: number;
  debuffAmount?: number; // Amount for status effects like CORRUPT
  // Spawn mechanic (for Slime splitting etc.)
  spawnId?: string; // Enemy definition ID to spawn
  hpThreshold?: number; // Only use this move if HP below threshold (0.0-1.0)
  // Elite abilities
  summons?: string[]; // Enemy IDs to summon
  oncePerCombat?: boolean; // Can only be used once
  // Boss abilities
  chargeTurns?: number; // Number of turns to charge before executing
  commandMinions?: boolean; // Makes all minions attack
  resurrectMinions?: boolean; // Resurrects dead minions
}

export interface EnemyPhase {
  moves: EnemyMove[];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  moves: EnemyMove[];
  // Elite properties
  isElite?: boolean;
  phaseThresholds?: number[]; // HP percentages that trigger phase changes (e.g., [0.5] = phase 2 at 50%)
  phases?: EnemyPhase[]; // Different move sets per phase
  // Boss properties
  isBoss?: boolean;
}

export interface EnemyIntent {
  intent: IntentType;
  damage?: number;
  block?: number;
  name: string;
  moveId: string; // For tracking once-per-combat abilities
  // New properties for advanced moves
  times?: number;
  heal?: number;
  selfDamage?: number;
  buffType?: StatusType;
  buffAmount?: number;
  debuffType?: StatusType;
  debuffDuration?: number;
  // Elite abilities
  summons?: string[];
  oncePerCombat?: boolean;
  // Boss abilities
  chargeTurns?: number;
  commandMinions?: boolean;
  resurrectMinions?: boolean;
}

export interface ChargingState {
  turnsRemaining: number;
  chargedMove: EnemyMove;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  intent: EnemyIntent | null;
  statusEffects: StatusEffect[];
  might: number; // Bonus damage from buffs
  untargetable: boolean; // Cannot be targeted by attacks
  // Elite properties
  isElite: boolean;
  phase: number; // Current phase (0-indexed)
  usedAbilities: string[]; // Track once-per-combat abilities used
  // Boss properties
  isBoss: boolean;
  charging?: ChargingState; // For charge-up attacks
  summonCooldown: number; // Turns until summon is available again
  justSummoned: boolean; // Skip first turn after being summoned
  // Act 3 mechanics
  intangible: number; // Turns remaining of intangible (50% damage reduction)
  // Elite passive effects
  infernalPresence: number; // Damage reduction applied to player attacks (Greater Demon)
  realityAnchor: number; // Draw limit (Sanctum Warden)
  turnsSinceProjection: number; // Turns since last Memory Projection (Sanctum Warden)
}

// Player Types
export interface PlayerState {
  classId?: CharacterClassId;
  maxHp: number;
  currentHp: number;
  block: number;
  resolve: number;
  maxResolve: number;
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  statusEffects: StatusEffect[];
  // Class-specific
  devotion: number;
  fortify: number;
  maxFortify: number;
  empoweredAttack: number;
  // Diabolist-specific
  soulDebt: number; // Tracks total Curses added this run
  // Oathsworn-specific
  activeVow: Vow | null; // Currently active Vow
  vowsActivatedThisCombat: number; // Track for Righteous Fury
  // Fey-Touched specific
  luck: number; // 0-10, spend for Whimsy control
  maxLuck: number;
  guaranteedBest: boolean; // Next Whimsy is guaranteed best outcome
  // Celestial specific
  radiance: number; // 0-10, empowers divine spells
  maxRadiance: number;
  // Summoner specific
  minions: Minion[]; // Active minions on battlefield
  // Bargainer specific
  favor: number; // 0-10, spent to remove Prices
  activePrices: Price[]; // Currently active Prices
  baseMaxResolve: number; // Original max Resolve (before RESOLVE_TAX)
  // Permanent bonuses
  permanentBlockBonus: number; // Bonus block added to all block-granting cards (from cards like Iron Mastery)
  // Upgrade bonuses (from Soul Echo purchases)
  upgradeDamageBonus: number; // +damage on all attacks (from Sharp Blades upgrade)
  upgradeBlockBonus: number; // +block on all block cards (from Thick Skin upgrade)
}

// Oathsworn Vow Types
export enum VowBonusType {
  DAMAGE_BOOST = 'damage_boost',
  BLOCK_PER_TURN = 'block_per_turn',
  DRAW_CARDS = 'draw_cards',
  RESOLVE_BOOST = 'resolve_boost',
  THORNS = 'thorns', // Deal damage when attacked
  DOUBLE_BLOCK = 'double_block', // Block effects doubled
  HEAL_ON_DAMAGE = 'heal_on_damage', // Heal when taking damage
}

export enum VowRestrictionType {
  NO_BLOCK = 'no_block',
  NO_ATTACK = 'no_attack',
  NO_SKILL = 'no_skill',
  MUST_ATTACK = 'must_attack',
  NO_POWER = 'no_power', // Cannot play Power cards
  MIN_CARDS = 'min_cards', // Must play X cards per turn
  NO_HEAL = 'no_heal', // Cannot heal (except from Vow)
}

export interface VowBonus {
  type: VowBonusType;
  amount: number;
}

export interface VowRestriction {
  type: VowRestrictionType;
  description: string;
}

export interface Vow {
  id: string;
  name: string;
  bonus: VowBonus;
  restriction: VowRestriction;
  charges?: number; // Optional: Vow expires after X uses
  currentCharges?: number; // Runtime tracking
  breakPenalty?: CardEffect[]; // Effects when broken
}

// Character Classes
export enum CharacterClassId {
  CLERIC = 'cleric',
  DUNGEON_KNIGHT = 'dungeon_knight',
  DIABOLIST = 'diabolist',
  OATHSWORN = 'oathsworn',
  FEY_TOUCHED = 'fey_touched',
  CELESTIAL = 'celestial',
  SUMMONER = 'summoner',
  BARGAINER = 'bargainer',
}

// Bargainer Price Types
export enum PriceType {
  HP_DRAIN = 'hp_drain', // Lose X HP at start of player turn
  RESOLVE_TAX = 'resolve_tax', // -X max Resolve until combat ends
  CURSE_CARDS = 'curse_cards', // Add X Curse cards to deck immediately
  DEBT_STACK = 'debt_stack', // Accumulates; at 10 stacks, take 20 damage and clear
}

export interface Price {
  id: string; // Unique ID
  type: PriceType;
  amount: number; // Intensity (HP per turn, Resolve reduction, etc.)
  stacks: number; // For DEBT_STACK type
  sourceCardId: string; // Card that created this Price
}

export interface PriceDefinition {
  type: PriceType;
  amount: number;
}

export const MAX_FAVOR = 10;
export const DEBT_STACK_THRESHOLD = 10;
export const DEBT_STACK_DAMAGE = 20;

// Summoner Minion Types
export interface MinionDefinition {
  id: string;
  name: string;
  maxHp: number;
  attackDamage: number;
  description?: string;
}

export interface Minion {
  id: string; // Definition ID (e.g., 'wisp')
  instanceId: string; // Unique instance ID
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  attackDamage: number;
  statusEffects: StatusEffect[];
}

export const MAX_MINIONS = 4;

export interface StarterDeckRecipe {
  cardId: string;
  count: number;
}

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  maxHp: number;
  maxResolve: number;
  starterDeckRecipe: StarterDeckRecipe[];
}

// Combat State
export enum CombatPhase {
  NOT_STARTED = 'NOT_STARTED',
  DRAW = 'DRAW',
  PLAYER_ACTION = 'PLAYER_ACTION',
  END_TURN = 'END_TURN',
  ENEMY_ACTION = 'ENEMY_ACTION',
  CLEANUP = 'CLEANUP',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
}

export interface CombatState {
  turn: number;
  phase: CombatPhase;
  player: PlayerState;
  enemies: Enemy[];
  gameOver: boolean;
  victory: boolean;
  // Hollow God boss state
  corruptedCardIds: Set<string>; // instanceIds of corrupted cards
  lastPlayerCardPlayed: Card | null; // For Hollow Echo
  permanentlyExhaustedCards: Card[]; // Cards removed from the run
}

// Events for UI updates
export enum CombatEventType {
  PHASE_CHANGED = 'PHASE_CHANGED',
  PLAYER_HP_CHANGED = 'PLAYER_HP_CHANGED',
  PLAYER_BLOCK_CHANGED = 'PLAYER_BLOCK_CHANGED',
  PLAYER_RESOLVE_CHANGED = 'PLAYER_RESOLVE_CHANGED',
  PLAYER_DEVOTION_CHANGED = 'PLAYER_DEVOTION_CHANGED',
  PLAYER_FORTIFY_CHANGED = 'PLAYER_FORTIFY_CHANGED',
  PLAYER_EMPOWERED_CHANGED = 'PLAYER_EMPOWERED_CHANGED',
  PLAYER_SOUL_DEBT_CHANGED = 'PLAYER_SOUL_DEBT_CHANGED',
  VOW_ACTIVATED = 'VOW_ACTIVATED',
  VOW_BROKEN = 'VOW_BROKEN',
  VOW_EXPIRED = 'VOW_EXPIRED',
  VOW_CHARGE_USED = 'VOW_CHARGE_USED',
  WHIMSY_RESOLVED = 'WHIMSY_RESOLVED',
  LUCK_CHANGED = 'LUCK_CHANGED',
  RADIANCE_CHANGED = 'RADIANCE_CHANGED',
  DIVINE_FORM_ACTIVATED = 'DIVINE_FORM_ACTIVATED',
  DIVINE_FORM_DEACTIVATED = 'DIVINE_FORM_DEACTIVATED',
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DRAWN = 'CARD_DRAWN',
  CARD_ADDED = 'CARD_ADDED', // For ADD_CARD effects
  ENEMY_DAMAGED = 'ENEMY_DAMAGED',
  ENEMY_BLOCK_CHANGED = 'ENEMY_BLOCK_CHANGED',
  ENEMY_DIED = 'ENEMY_DIED',
  ENEMY_INTENT_SET = 'ENEMY_INTENT_SET',
  ENEMY_PHASE_CHANGED = 'ENEMY_PHASE_CHANGED',
  ENEMY_SUMMONED = 'ENEMY_SUMMONED',
  PLAYER_DAMAGED = 'PLAYER_DAMAGED',
  COMBAT_LOG = 'COMBAT_LOG',
  GAME_OVER = 'GAME_OVER',
  // Minion events
  MINION_SUMMONED = 'MINION_SUMMONED',
  MINION_DAMAGED = 'MINION_DAMAGED',
  MINION_DIED = 'MINION_DIED',
  MINION_ATTACKED = 'MINION_ATTACKED',
  MINION_BLOCK_CHANGED = 'MINION_BLOCK_CHANGED',
  // Bargainer events
  FAVOR_CHANGED = 'FAVOR_CHANGED',
  PRICE_ADDED = 'PRICE_ADDED',
  PRICE_TRIGGERED = 'PRICE_TRIGGERED',
  PRICE_REMOVED = 'PRICE_REMOVED',
  DEBT_THRESHOLD_TRIGGERED = 'DEBT_THRESHOLD_TRIGGERED',
  // Act 3 enemy mechanic events
  CARD_CONSUMED = 'CARD_CONSUMED', // Void Spawn's Consume Light
  BUFFS_PURGED = 'BUFFS_PURGED', // Sanctum Guardian's Purge
  // Hollow God boss events
  CARD_CORRUPTED = 'CARD_CORRUPTED', // Card becomes corrupted
  CARD_PERMANENTLY_EXHAUSTED = 'CARD_PERMANENTLY_EXHAUSTED', // Forget attack
  HOLLOW_ECHO = 'HOLLOW_ECHO', // Boss copies player's card
  CHOMP_TIMER_TICK = 'CHOMP_TIMER_TICK', // Chomp timer update
  CHOMP_TRIGGERED = 'CHOMP_TRIGGERED', // Chomp discards a card
  SHADOW_SELF_SUMMONED = 'SHADOW_SELF_SUMMONED', // Shadow Self appears
  SHADOW_SELF_DIED = 'SHADOW_SELF_DIED', // Shadow Self defeated (heals player)
  BOSS_DIALOGUE = 'BOSS_DIALOGUE', // Boss speaks
}

export interface CombatEvent {
  type: CombatEventType;
  data?: unknown;
}

export type CombatEventListener = (event: CombatEvent) => void;

// Action results
export interface PlayCardResult {
  success: boolean;
  message?: string;
  log: string[];
}

export interface EndTurnResult {
  log: string[];
}

// Map Types
export enum NodeType {
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  CAMPFIRE = 'CAMPFIRE',
  MERCHANT = 'MERCHANT',
  SHRINE = 'SHRINE',
  BOSS = 'BOSS',
}

export interface MapNode {
  id: string;
  type: NodeType;
  row: number;
  column: number;
  act: number;
  connections: string[]; // IDs of nodes in next row this connects to
  visited: boolean;
}

export interface FloorMap {
  act: number;
  rows: MapNode[][];
  bossNode: MapNode;
  seed: string;
}

// Meta-Progression Upgrade Types
export enum UpgradePath {
  VITALITY = 'vitality',
  RESOLVE = 'resolve',
  COMBAT = 'combat',
  FORTUNE = 'fortune',
  CLASS = 'class',
}

export type UpgradeEffectType =
  | { type: 'max_hp'; amount: number }
  | { type: 'starting_hp_heal'; amount: number }
  | { type: 'starting_resolve'; amount: number }
  | { type: 'starting_gold'; amount: number }
  | { type: 'starting_block'; amount: number }
  | { type: 'damage_bonus'; amount: number }
  | { type: 'block_bonus'; amount: number }
  | { type: 'card_reward_count'; amount: number }
  | { type: 'gold_multiplier'; percent: number }
  | { type: 'starting_potion'; potionId: string }
  | { type: 'merchant_discount'; percent: number }
  | { type: 'crit_chance'; percent: number }
  | { type: 'potion_drop_chance'; percent: number }
  | { type: 'rare_card_chance'; percent: number }
  | { type: 'elite_drops_potion' }
  | { type: 'deaths_door' }
  | { type: 'draw_turn_1'; amount: number }
  | { type: 'first_card_discount'; amount: number }
  | { type: 'momentum'; cardsPlayed: number; mightGained: number }
  | { type: 'perseverance'; hpThreshold: number; blockGained: number }
  // Class-specific effects
  | { type: 'starting_devotion'; amount: number }
  | { type: 'devotion_on_heal'; amount: number }
  | { type: 'devotion_cost_reduction'; amount: number }
  | { type: 'starting_fortify'; amount: number }
  | { type: 'fortify_cap_bonus'; amount: number }
  | { type: 'fortify_reflect'; damage: number }
  | { type: 'curse_start_exhausted' }
  | { type: 'curse_damage_reduction'; amount: number }
  | { type: 'contract_penalty_reduction'; percent: number }
  | { type: 'starting_vow'; vowId: string; charges: number }
  | { type: 'vow_charge_bonus'; amount: number }
  | { type: 'first_vow_break_free' }
  | { type: 'starting_luck'; amount: number }
  | { type: 'whimsy_bonus'; percent: number }
  | { type: 'whimsy_reroll'; uses: number }
  // Celestial upgrades
  | { type: 'starting_radiance'; amount: number }
  | { type: 'radiance_on_block'; amount: number }
  | { type: 'divine_form_threshold_reduction'; amount: number }
  // Summoner upgrades
  | { type: 'starting_minion'; minionId: string }
  | { type: 'minion_hp_bonus'; amount: number }
  | { type: 'minion_damage_bonus'; amount: number }
  // Bargainer upgrades
  | { type: 'starting_favor'; amount: number }
  | { type: 'price_duration_reduction'; amount: number }
  | { type: 'favor_on_price_trigger'; amount: number };

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  path: UpgradePath;
  classId?: CharacterClassId;
  prerequisites: string[];
  effect: UpgradeEffectType;
  tier: 1 | 2 | 3 | 4;
}

// Soul Echoes persistence
export interface MetaProgressionState {
  soulEchoes: number;
  purchasedUpgrades: string[];
  totalSoulEchoesSpent: number;
  totalSoulEchoesEarned: number;
}

// Potion Types
export enum PotionRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
}

export interface PotionDefinition {
  id: string;
  name: string;
  description: string;
  rarity: PotionRarity;
  icon: string;
  effect: PotionEffect;
}

export type PotionEffect =
  | { type: 'heal'; amount: number }
  | { type: 'block'; amount: number }
  | { type: 'damage_all'; amount: number }
  | { type: 'draw'; amount: number }
  | { type: 'resolve'; amount: number }
  | { type: 'apply_status'; status: StatusType; amount: number; target: 'self' | 'enemy' | 'all_enemies' };

export interface PotionSlot {
  potionId: string;
  count: number;
}
