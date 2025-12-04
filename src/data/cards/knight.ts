import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// Starter Cards (4 cards in starter deck)
export const KNIGHT_STARTER_CARDS: Record<string, CardDefinition> = {
  sword_strike: {
    id: 'sword_strike',
    name: 'Sword Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  raise_shield: {
    id: 'raise_shield',
    name: 'Raise Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block.',
    effects: [{ type: EffectType.BLOCK, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  bulwark_stance: {
    id: 'bulwark_stance',
    name: 'Bulwark Stance',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 8 block. Gain 1 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 8 },
      { type: EffectType.GAIN_FORTIFY, amount: 1 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal damage equal to your Block.',
    effects: [{ type: EffectType.DAMAGE_EQUAL_BLOCK, amount: 0 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
};

// Common Cards (15 cards)
export const KNIGHT_COMMON_CARDS: Record<string, CardDefinition> = {
  quick_strike: {
    id: 'quick_strike',
    name: 'Quick Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  iron_skin: {
    id: 'iron_skin',
    name: 'Iron Skin',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 3 Fortify.',
    effects: [{ type: EffectType.GAIN_FORTIFY, amount: 3 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  heavy_blow: {
    id: 'heavy_blow',
    name: 'Heavy Blow',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 10 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 10 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  defensive_stance: {
    id: 'defensive_stance',
    name: 'Defensive Stance',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 8 block.',
    effects: [{ type: EffectType.BLOCK, amount: 8 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  armor_up: {
    id: 'armor_up',
    name: 'Armor Up',
    type: CardType.SKILL,
    cost: 0,
    description: 'Gain 3 block.',
    effects: [{ type: EffectType.BLOCK, amount: 3 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  battering_ram: {
    id: 'battering_ram',
    name: 'Battering Ram',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage. If enemy has Block, deal 4 more.',
    effects: [{ type: EffectType.DAMAGE, amount: 8 }], // Bonus handled in engine
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  stalwart: {
    id: 'stalwart',
    name: 'Stalwart',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 2 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.GAIN_FORTIFY, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage to ALL enemies.',
    effects: [{ type: EffectType.DAMAGE_ALL, amount: 5 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain Block equal to your Fortify.',
    effects: [{ type: EffectType.BLOCK_EQUAL_FORTIFY, amount: 0 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  press_the_attack: {
    id: 'press_the_attack',
    name: 'Press the Attack',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage. If enemy HP < 50%, deal 3 more.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }], // Bonus handled in engine
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  hold_the_line: {
    id: 'hold_the_line',
    name: 'Hold the Line',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block. Gain 1 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 6 },
      { type: EffectType.GAIN_FORTIFY, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  riposte: {
    id: 'riposte',
    name: 'Riposte',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 4 block. Deal 6 damage.',
    effects: [
      { type: EffectType.BLOCK, amount: 4 },
      { type: EffectType.DAMAGE, amount: 6 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  counter_strike: {
    id: 'counter_strike',
    name: 'Counter Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Gain 4 block. Deal 4 damage.',
    effects: [
      { type: EffectType.BLOCK, amount: 4 },
      { type: EffectType.DAMAGE, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  reinforce: {
    id: 'reinforce',
    name: 'Reinforce',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 1 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.GAIN_FORTIFY, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  impale: {
    id: 'impale',
    name: 'Impale',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 7 damage twice.',
    effects: [
      { type: EffectType.DAMAGE, amount: 7 },
      { type: EffectType.DAMAGE, amount: 7 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
};

// Uncommon Cards (8 cards)
export const KNIGHT_UNCOMMON_CARDS: Record<string, CardDefinition> = {
  shieldbash: {
    id: 'shieldbash',
    name: 'Shieldbash',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal damage equal to your Fortify twice.',
    effects: [
      { type: EffectType.DAMAGE_EQUAL_FORTIFY, amount: 0 },
      { type: EffectType.DAMAGE_EQUAL_FORTIFY, amount: 0 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  iron_resolve: {
    id: 'iron_resolve',
    name: 'Iron Resolve',
    type: CardType.POWER,
    cost: 1,
    description: 'Fortify cap increased by 10.',
    effects: [], // Handled by power system
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  defensive_formation: {
    id: 'defensive_formation',
    name: 'Defensive Formation',
    type: CardType.SKILL,
    cost: 2,
    description: 'Gain 12 block. Gain 2 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 12 },
      { type: EffectType.GAIN_FORTIFY, amount: 2 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  sentinels_watch: {
    id: 'sentinels_watch',
    name: "Sentinel's Watch",
    type: CardType.POWER,
    cost: 2,
    description: 'Gain 3 block at the start of each turn.',
    effects: [], // Handled by power system
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  crushing_counter: {
    id: 'crushing_counter',
    name: 'Crushing Counter',
    type: CardType.SKILL,
    cost: 2,
    description: 'Gain 8 block. Deal 12 damage.',
    effects: [
      { type: EffectType.BLOCK, amount: 8 },
      { type: EffectType.DAMAGE, amount: 12 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  wall_of_steel: {
    id: 'wall_of_steel',
    name: 'Wall of Steel',
    type: CardType.SKILL,
    cost: 2,
    description: 'Gain 15 block. Gain 3 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 15 },
      { type: EffectType.GAIN_FORTIFY, amount: 3 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  fortify_mastery: {
    id: 'fortify_mastery',
    name: 'Fortify Mastery',
    type: CardType.SKILL,
    cost: 1,
    description: 'Double your current Fortify.',
    effects: [{ type: EffectType.DOUBLE_FORTIFY, amount: 0 }],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  executioner: {
    id: 'executioner',
    name: 'Executioner',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 15 damage. If this kills, gain 5 Fortify.',
    effects: [{ type: EffectType.DAMAGE, amount: 15 }], // Kill bonus handled in engine
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
};

// Rare Cards (3 cards)
export const KNIGHT_RARE_CARDS: Record<string, CardDefinition> = {
  unbreakable: {
    id: 'unbreakable',
    name: 'Unbreakable',
    type: CardType.POWER,
    cost: 2,
    description: 'Block no longer resets at end of turn.',
    effects: [], // Handled by power system
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  last_stand: {
    id: 'last_stand',
    name: 'Last Stand',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 10 block. Deal damage equal to your Block.',
    effects: [
      { type: EffectType.BLOCK, amount: 10 },
      { type: EffectType.DAMAGE_EQUAL_BLOCK, amount: 0 },
    ],
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DUNGEON_KNIGHT,
  },
  fortress: {
    id: 'fortress',
    name: 'Fortress',
    type: CardType.SKILL,
    cost: 3,
    description: 'Gain 20 block. Gain Fortify equal to your max HP / 5. Exhaust.',
    effects: [
      { type: EffectType.BLOCK, amount: 20 },
      { type: EffectType.GAIN_FORTIFY, amount: 16 }, // Assuming ~80 HP max
    ],
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    exhaust: true,
  },
};

// Starter Block Bonus Card
export const KNIGHT_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  iron_mastery: {
    id: 'iron_mastery',
    name: 'Iron Mastery',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Exhaust.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    exhaust: true,
  },
};

// Combined card pool (excludes starters for rewards)
export const KNIGHT_REWARD_POOL: CardDefinition[] = [
  ...Object.values(KNIGHT_COMMON_CARDS),
  ...Object.values(KNIGHT_UNCOMMON_CARDS),
  ...Object.values(KNIGHT_RARE_CARDS),
];

// All Knight cards including starters
export const KNIGHT_CARDS: Record<string, CardDefinition> = {
  ...KNIGHT_STARTER_CARDS,
  ...KNIGHT_BLOCK_BONUS_CARD,
  ...KNIGHT_COMMON_CARDS,
  ...KNIGHT_UNCOMMON_CARDS,
  ...KNIGHT_RARE_CARDS,
};
