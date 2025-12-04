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
  onDraw?: CardEffect[]; // Effects triggered when card is drawn
  onTurnEnd?: CardEffect[]; // Effects triggered at end of turn (while in deck)
  onCombatEnd?: CardEffect[]; // Effects triggered at end of combat (while in deck)
  hpCost?: number; // HP paid to play (in addition to Resolve)
  // Oathsworn properties
  requiresVow?: boolean; // Can only play with active Vow
  activatesVow?: string; // Vow ID to activate when played
  // Fey-Touched properties
  whimsy?: WhimsyEffect[]; // Random outcomes
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
  // Buffs
  BLESSED = 'BLESSED',
  EMPOWERED = 'EMPOWERED',
  WARDED = 'WARDED',
  MIGHT = 'MIGHT',
  RESILIENCE = 'RESILIENCE',
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
}

// Player Types
export interface PlayerState {
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
}

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
