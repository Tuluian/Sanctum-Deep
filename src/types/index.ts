// Card Types
export enum CardType {
  ATTACK = 'ATTACK',
  SKILL = 'SKILL',
  POWER = 'POWER',
  CURSE = 'CURSE',
}

export enum EffectType {
  DAMAGE = 'DAMAGE',
  BLOCK = 'BLOCK',
  HEAL = 'HEAL',
  APPLY_STATUS = 'APPLY_STATUS',
  GAIN_DEVOTION = 'GAIN_DEVOTION',
  GAIN_FORTIFY = 'GAIN_FORTIFY',
}

export interface CardEffect {
  type: EffectType;
  amount: number;
  target?: 'self' | 'enemy' | 'all_enemies';
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  description: string;
  effects: CardEffect[];
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
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DRAWN = 'CARD_DRAWN',
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
