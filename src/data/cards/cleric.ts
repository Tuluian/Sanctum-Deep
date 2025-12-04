import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// Starter Cards (4 cards in starter deck)
export const CLERIC_STARTER_CARDS: Record<string, CardDefinition> = {
  smite: {
    id: 'smite',
    name: 'Smite',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CLERIC,
  },
  shield_of_faith: {
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: EffectType.BLOCK, amount: 5 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CLERIC,
  },
  prayer_of_mending: {
    id: 'prayer_of_mending',
    name: 'Prayer of Mending',
    type: CardType.SKILL,
    cost: 1,
    description: 'Heal 6 HP.',
    effects: [{ type: EffectType.HEAL, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CLERIC,
  },
  consecrate: {
    id: 'consecrate',
    name: 'Consecrate',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 3 damage. Heal 3 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 3 },
      { type: EffectType.HEAL, amount: 3 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CLERIC,
  },
};

// Common Cards (15 cards)
export const CLERIC_COMMON_CARDS: Record<string, CardDefinition> = {
  prayer: {
    id: 'prayer',
    name: 'Prayer',
    type: CardType.SKILL,
    cost: 0,
    description: 'Heal 4 HP.',
    effects: [{ type: EffectType.HEAL, amount: 4 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  holy_light: {
    id: 'holy_light',
    name: 'Holy Light',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage. Heal 2 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.HEAL, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  blessed_strike: {
    id: 'blessed_strike',
    name: 'Blessed Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. Gain 1 Devotion.',
    effects: [
      { type: EffectType.DAMAGE, amount: 5 },
      { type: EffectType.GAIN_DEVOTION, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  divine_shield: {
    id: 'divine_shield',
    name: 'Divine Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 7 block.',
    effects: [{ type: EffectType.BLOCK, amount: 7 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  guiding_light: {
    id: 'guiding_light',
    name: 'Guiding Light',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  sanctuary: {
    id: 'sanctuary',
    name: 'Sanctuary',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Heal 2 HP.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.HEAL, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  smite_plus: {
    id: 'smite_plus',
    name: 'Smite+',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 8 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 8 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  holy_fire: {
    id: 'holy_fire',
    name: 'Holy Fire',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage to ALL enemies.',
    effects: [{ type: EffectType.DAMAGE_ALL, amount: 8 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  mend_wounds: {
    id: 'mend_wounds',
    name: 'Mend Wounds',
    type: CardType.SKILL,
    cost: 1,
    description: 'Heal 8 HP.',
    effects: [{ type: EffectType.HEAL, amount: 8 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  radiant_armor: {
    id: 'radiant_armor',
    name: 'Radiant Armor',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 4 block. Gain 2 Devotion.',
    effects: [
      { type: EffectType.BLOCK, amount: 4 },
      { type: EffectType.GAIN_DEVOTION, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  fervent_prayer: {
    id: 'fervent_prayer',
    name: 'Fervent Prayer',
    type: CardType.SKILL,
    cost: 0,
    description: 'Gain 2 Devotion.',
    effects: [{ type: EffectType.GAIN_DEVOTION, amount: 2 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  lights_blessing: {
    id: 'lights_blessing',
    name: "Light's Blessing",
    type: CardType.SKILL,
    cost: 1,
    description: 'Heal 5 HP. If at full HP, gain 5 block instead.',
    effects: [{ type: EffectType.HEAL_OR_BLOCK, amount: 5 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  holy_smash: {
    id: 'holy_smash',
    name: 'Holy Smash',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 12 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 12 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  divine_favor: {
    id: 'divine_favor',
    name: 'Divine Favor',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 3 block. Draw 1 card.',
    effects: [
      { type: EffectType.BLOCK, amount: 3 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
  righteous_fury: {
    id: 'righteous_fury',
    name: 'Righteous Fury',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage twice.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DAMAGE, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.CLERIC,
  },
};

// Uncommon Cards (8 cards)
export const CLERIC_UNCOMMON_CARDS: Record<string, CardDefinition> = {
  martyrs_stance: {
    id: 'martyrs_stance',
    name: "Martyr's Stance",
    type: CardType.POWER,
    cost: 1,
    description: 'Whenever you heal, gain 1 block.',
    effects: [], // Handled by power system
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  divine_judgement: {
    id: 'divine_judgement',
    name: 'Divine Judgement',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 12 damage. Gain 2 Devotion.',
    effects: [
      { type: EffectType.DAMAGE, amount: 12 },
      { type: EffectType.GAIN_DEVOTION, amount: 2 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  healing_circle: {
    id: 'healing_circle',
    name: 'Healing Circle',
    type: CardType.SKILL,
    cost: 2,
    description: 'Heal 10 HP. Gain 2 Devotion.',
    effects: [
      { type: EffectType.HEAL, amount: 10 },
      { type: EffectType.GAIN_DEVOTION, amount: 2 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  zealots_fury: {
    id: 'zealots_fury',
    name: "Zealot's Fury",
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 6 damage twice. Lose 4 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 6 },
      { type: EffectType.DAMAGE, amount: 6 },
      { type: EffectType.HEAL, amount: -4 }, // Negative heal = damage to self
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  blessed_aura: {
    id: 'blessed_aura',
    name: 'Blessed Aura',
    type: CardType.POWER,
    cost: 2,
    description: 'Gain 2 HP at the start of each turn.',
    effects: [], // Handled by power system
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  purifying_flame: {
    id: 'purifying_flame',
    name: 'Purifying Flame',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 10 damage. Gain 3 Devotion.',
    effects: [
      { type: EffectType.DAMAGE, amount: 10 },
      { type: EffectType.GAIN_DEVOTION, amount: 3 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
  absolution: {
    id: 'absolution',
    name: 'Absolution',
    type: CardType.SKILL,
    cost: 1,
    description: 'Spend all Devotion. Heal 2 HP per Devotion spent.',
    effects: [], // Handled specially - consumes all devotion
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
    exhaust: true,
  },
  holy_nova: {
    id: 'holy_nova',
    name: 'Holy Nova',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage to ALL enemies. Heal 4 HP.',
    effects: [
      { type: EffectType.DAMAGE_ALL, amount: 8 },
      { type: EffectType.HEAL, amount: 4 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.CLERIC,
  },
};

// Rare Cards (3 cards)
export const CLERIC_RARE_CARDS: Record<string, CardDefinition> = {
  resurrection: {
    id: 'resurrection',
    name: 'Resurrection',
    type: CardType.SKILL,
    cost: 3,
    description: 'Heal to full HP. Exhaust.',
    effects: [{ type: EffectType.HEAL, amount: 999 }], // Capped by max HP
    rarity: CardRarity.RARE,
    classId: CharacterClassId.CLERIC,
    exhaust: true,
  },
  smite_the_wicked: {
    id: 'smite_the_wicked',
    name: 'Smite the Wicked',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage. Spend 5 Devotion: Deal 20 instead.',
    effects: [{ type: EffectType.DAMAGE, amount: 8 }],
    devotionCost: 5,
    devotionBonus: [{ type: EffectType.DAMAGE, amount: 12 }], // +12 = 20 total
    rarity: CardRarity.RARE,
    classId: CharacterClassId.CLERIC,
  },
  avatar_of_light: {
    id: 'avatar_of_light',
    name: 'Avatar of Light',
    type: CardType.POWER,
    cost: 3,
    description: 'Double all healing for the rest of combat.',
    effects: [], // Handled by power system
    rarity: CardRarity.RARE,
    classId: CharacterClassId.CLERIC,
  },
};

// Starter Block Bonus Card
export const CLERIC_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  divine_aegis: {
    id: 'divine_aegis',
    name: 'Divine Aegis',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Exhaust.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.CLERIC,
    exhaust: true,
  },
};

// Combined card pool (excludes starters for rewards)
export const CLERIC_REWARD_POOL: CardDefinition[] = [
  ...Object.values(CLERIC_COMMON_CARDS),
  ...Object.values(CLERIC_UNCOMMON_CARDS),
  ...Object.values(CLERIC_RARE_CARDS),
];

// All Cleric cards including starters
export const CLERIC_CARDS: Record<string, CardDefinition> = {
  ...CLERIC_STARTER_CARDS,
  ...CLERIC_BLOCK_BONUS_CARD,
  ...CLERIC_COMMON_CARDS,
  ...CLERIC_UNCOMMON_CARDS,
  ...CLERIC_RARE_CARDS,
};
