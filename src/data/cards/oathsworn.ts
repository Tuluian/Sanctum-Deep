import {
  CardDefinition,
  CardType,
  CardRarity,
  EffectType,
  CharacterClassId,
  Vow,
  VowBonusType,
  VowRestrictionType,
} from '@/types';

// ============================================
// VOW DEFINITIONS
// ============================================

export const OATH_OF_VALOR: Vow = {
  id: 'oath_of_valor',
  name: 'Oath of Valor',
  bonus: { type: VowBonusType.DAMAGE_BOOST, amount: 4 },
  restriction: { type: VowRestrictionType.NO_BLOCK, description: 'Cannot gain block' },
  charges: 3,
  breakPenalty: [{ type: EffectType.LOSE_HP, amount: 5 }],
};

export const OATH_OF_PROTECTION: Vow = {
  id: 'oath_of_protection',
  name: 'Oath of Protection',
  bonus: { type: VowBonusType.BLOCK_PER_TURN, amount: 3 },
  restriction: { type: VowRestrictionType.NO_ATTACK, description: 'Cannot play Attack cards' },
  charges: 5,
  breakPenalty: [{ type: EffectType.BLOCK, amount: -999 }], // Lose all block
};

export const OATH_OF_RETRIBUTION: Vow = {
  id: 'oath_of_retribution',
  name: 'Oath of Retribution',
  bonus: { type: VowBonusType.THORNS, amount: 5 },
  restriction: { type: VowRestrictionType.MUST_ATTACK, description: 'Must play an Attack each turn' },
  charges: 4,
  breakPenalty: [{ type: EffectType.LOSE_HP, amount: 8 }],
};

export const SACRED_VOW: Vow = {
  id: 'sacred_vow',
  name: 'Sacred Vow',
  bonus: { type: VowBonusType.RESOLVE_BOOST, amount: 1 },
  restriction: { type: VowRestrictionType.MIN_CARDS, description: 'Must play 3+ cards per turn' },
  charges: 3,
  breakPenalty: [], // Discard hand - handled specially
};

export const VOW_OF_SILENCE: Vow = {
  id: 'vow_of_silence',
  name: 'Vow of Silence',
  bonus: { type: VowBonusType.DOUBLE_BLOCK, amount: 2 },
  restriction: { type: VowRestrictionType.NO_POWER, description: 'Cannot play Power cards' },
  charges: 4,
  breakPenalty: [], // Fracture random - handled specially
};

export const MARTYRS_OATH: Vow = {
  id: 'martyrs_oath',
  name: "Martyr's Oath",
  bonus: { type: VowBonusType.HEAL_ON_DAMAGE, amount: 3 },
  restriction: { type: VowRestrictionType.NO_HEAL, description: 'Cannot heal (except from Vow)' },
  charges: 5,
  breakPenalty: [{ type: EffectType.LOSE_HP, amount: 10 }],
};

// Vows registry for lookup
export const OATHSWORN_VOWS: Record<string, Vow> = {
  oath_of_valor: OATH_OF_VALOR,
  oath_of_protection: OATH_OF_PROTECTION,
  oath_of_retribution: OATH_OF_RETRIBUTION,
  sacred_vow: SACRED_VOW,
  vow_of_silence: VOW_OF_SILENCE,
  martyrs_oath: MARTYRS_OATH,
};

// Starter Cards (10 cards in starter deck)
export const OATHSWORN_STARTER_CARDS: Record<string, CardDefinition> = {
  righteous_strike: {
    id: 'righteous_strike',
    name: 'Righteous Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.OATHSWORN,
  },
  sacred_shield: {
    id: 'sacred_shield',
    name: 'Sacred Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block.',
    effects: [{ type: EffectType.BLOCK, amount: 6 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.OATHSWORN,
  },
  oath_of_valor: {
    id: 'oath_of_valor',
    name: 'Oath of Valor',
    type: CardType.POWER,
    cost: 1,
    description: 'Activate Oath of Valor: Next 3 attacks deal +4 damage. Cannot gain block.',
    effects: [], // Handled by activatesVow
    activatesVow: 'oath_of_valor',
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.OATHSWORN,
  },
  judgment: {
    id: 'judgment',
    name: 'Judgment',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Requires Vow. Deal 12 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 12 }],
    requiresVow: true,
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.OATHSWORN,
  },
};

// ============================================
// COMMON CARDS (15)
// ============================================

export const OATHSWORN_COMMON_CARDS: Record<string, CardDefinition> = {
  smite: {
    id: 'smite',
    name: 'Smite',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  divine_protection: {
    id: 'divine_protection',
    name: 'Divine Protection',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block.',
    effects: [{ type: EffectType.BLOCK, amount: 6 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  zealous_strike: {
    id: 'zealous_strike',
    name: 'Zealous Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. If Vow active, deal 3 more.',
    effects: [
      { type: EffectType.DAMAGE, amount: 5 },
      { type: EffectType.DAMAGE_IF_VOW, amount: 3 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  oath_of_protection_card: {
    id: 'oath_of_protection_card',
    name: 'Oath of Protection',
    type: CardType.POWER,
    cost: 1,
    description: 'Activate Oath of Protection: Gain 3 block/turn. Cannot play Attacks.',
    effects: [],
    activatesVow: 'oath_of_protection',
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  minor_judgment: {
    id: 'minor_judgment',
    name: 'Minor Judgment',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Requires Vow. Deal 8 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 8 }],
    requiresVow: true,
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  holy_fervor: {
    id: 'holy_fervor',
    name: 'Holy Fervor',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage twice.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DAMAGE, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  consecrated_ground: {
    id: 'consecrated_ground',
    name: 'Consecrated Ground',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 2 more per turn of active Vow.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.BLOCK_PER_VOW_TURN, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  vow_keeper: {
    id: 'vow_keeper',
    name: 'Vow Keeper',
    type: CardType.SKILL,
    cost: 0,
    description: 'Extend active Vow by 1 charge.',
    effects: [{ type: EffectType.EXTEND_VOW, amount: 1 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  radiant_smite: {
    id: 'radiant_smite',
    name: 'Radiant Smite',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 10 damage.',
    effects: [{ type: EffectType.DAMAGE, amount: 10 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  faithful_guard: {
    id: 'faithful_guard',
    name: 'Faithful Guard',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 8 block. If no Vow active, gain 4 more.',
    effects: [
      { type: EffectType.BLOCK, amount: 8 },
      { type: EffectType.BLOCK_IF_NO_VOW, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  swift_justice: {
    id: 'swift_justice',
    name: 'Swift Justice',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  binding_light: {
    id: 'binding_light',
    name: 'Binding Light',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. Apply Bound for 3 turns.',
    effects: [
      { type: EffectType.DAMAGE, amount: 5 },
      { type: EffectType.APPLY_BOUND, amount: 3 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  penitent_strike: {
    id: 'penitent_strike',
    name: 'Penitent Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 7 damage. Lose 1 Vow charge.',
    effects: [
      { type: EffectType.DAMAGE, amount: 7 },
      { type: EffectType.CONSUME_VOW_CHARGE, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  sanctified_armor: {
    id: 'sanctified_armor',
    name: 'Sanctified Armor',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 5 Fortify.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.GAIN_FORTIFY, amount: 5 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  oaths_end: {
    id: 'oaths_end',
    name: "Oath's End",
    type: CardType.SKILL,
    cost: 1,
    description: 'End active Vow without penalty. Gain 10 block.',
    effects: [
      { type: EffectType.END_VOW_SAFE, amount: 1 },
      { type: EffectType.BLOCK, amount: 10 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.OATHSWORN,
  },
};

// ============================================
// UNCOMMON CARDS (8)
// ============================================

export const OATHSWORN_UNCOMMON_CARDS: Record<string, CardDefinition> = {
  oath_of_retribution_card: {
    id: 'oath_of_retribution_card',
    name: 'Oath of Retribution',
    type: CardType.POWER,
    cost: 2,
    description: 'Activate Oath of Retribution: Deal 5 damage when attacked. Must attack each turn.',
    effects: [],
    activatesVow: 'oath_of_retribution',
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  sacred_vow_card: {
    id: 'sacred_vow_card',
    name: 'Sacred Vow',
    type: CardType.POWER,
    cost: 2,
    description: 'Activate Sacred Vow: +1 Resolve per turn. Must play 3+ cards per turn.',
    effects: [],
    activatesVow: 'sacred_vow',
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  vow_of_silence_card: {
    id: 'vow_of_silence_card',
    name: 'Vow of Silence',
    type: CardType.POWER,
    cost: 1,
    description: 'Activate Vow of Silence: Double block gained. Cannot play Powers.',
    effects: [],
    activatesVow: 'vow_of_silence',
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  divine_judgment: {
    id: 'divine_judgment',
    name: 'Divine Judgment',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Requires Vow. Deal 15 damage. Fracture.',
    effects: [{ type: EffectType.DAMAGE, amount: 15 }],
    requiresVow: true,
    fracture: true,
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  absolution: {
    id: 'absolution',
    name: 'Absolution',
    type: CardType.SKILL,
    cost: 2,
    description: 'End Vow. Heal 5 HP per remaining charge.',
    effects: [{ type: EffectType.HEAL_PER_VOW_CHARGE, amount: 5 }],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  martyrs_oath_card: {
    id: 'martyrs_oath_card',
    name: "Martyr's Oath",
    type: CardType.POWER,
    cost: 1,
    description: "Activate Martyr's Oath: Heal 3 when damaged. Cannot heal otherwise.",
    effects: [],
    activatesVow: 'martyrs_oath',
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  righteous_fury: {
    id: 'righteous_fury',
    name: 'Righteous Fury',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 6 damage for each Vow activated this combat.',
    effects: [{ type: EffectType.DAMAGE_PER_VOW_ACTIVATED, amount: 6 }],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
  celestial_chain: {
    id: 'celestial_chain',
    name: 'Celestial Chain',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 8 damage. If this kills, reset Vow charges.',
    effects: [
      { type: EffectType.DAMAGE, amount: 8 },
      { type: EffectType.RESET_VOW_CHARGES, amount: 1 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.OATHSWORN,
  },
};

// ============================================
// RARE CARDS (3)
// ============================================

export const OATHSWORN_RARE_CARDS: Record<string, CardDefinition> = {
  avatar_of_justice: {
    id: 'avatar_of_justice',
    name: 'Avatar of Justice',
    type: CardType.POWER,
    cost: 3,
    description: 'All attacks deal double damage. All defense is halved. Cannot be broken.',
    effects: [], // Handled specially
    rarity: CardRarity.RARE,
    classId: CharacterClassId.OATHSWORN,
  },
  eternal_vow: {
    id: 'eternal_vow',
    name: 'Eternal Vow',
    type: CardType.POWER,
    cost: 3,
    description: 'Vows no longer have charges (last forever).',
    effects: [], // Handled specially
    rarity: CardRarity.RARE,
    classId: CharacterClassId.OATHSWORN,
  },
  final_judgment: {
    id: 'final_judgment',
    name: 'Final Judgment',
    type: CardType.ATTACK,
    cost: 4,
    description: 'Requires Vow. Deal 50 damage. Ends Vow with penalty. Fracture.',
    effects: [{ type: EffectType.DAMAGE, amount: 50 }],
    requiresVow: true,
    fracture: true,
    rarity: CardRarity.RARE,
    classId: CharacterClassId.OATHSWORN,
  },
};

// Starter Block Bonus Card
export const OATHSWORN_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  sanctified_bulwark: {
    id: 'sanctified_bulwark',
    name: 'Sanctified Bulwark',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Fracture.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.OATHSWORN,
    fracture: true,
  },
};

// All Oathsworn cards including starters
export const OATHSWORN_CARDS: Record<string, CardDefinition> = {
  ...OATHSWORN_STARTER_CARDS,
  ...OATHSWORN_BLOCK_BONUS_CARD,
  ...OATHSWORN_COMMON_CARDS,
  ...OATHSWORN_UNCOMMON_CARDS,
  ...OATHSWORN_RARE_CARDS,
};

// Reward pool (excludes starters)
export const OATHSWORN_REWARD_POOL: CardDefinition[] = [
  ...Object.values(OATHSWORN_COMMON_CARDS),
  ...Object.values(OATHSWORN_UNCOMMON_CARDS),
  ...Object.values(OATHSWORN_RARE_CARDS),
];
